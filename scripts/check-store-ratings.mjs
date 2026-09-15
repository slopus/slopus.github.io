// Read-only first-party snapshot. This never edits website data automatically.
const APP_STORE = 'https://itunes.apple.com/lookup?id=6748571505&country=us'
const GOOGLE_PLAY = 'https://play.google.com/store/apps/details?id=com.ex3ndr.happy&hl=en_US&gl=US'

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!response.ok) throw new Error(`${response.status}: ${url}`)
  return response
}

const [appleResponse, googleResponse] = await Promise.all([get(APP_STORE), get(GOOGLE_PLAY)])
const apple = (await appleResponse.json()).results?.[0]
if (apple?.trackId !== 6748571505 || !Number.isFinite(apple.averageUserRating) || !Number.isFinite(apple.userRatingCount)) {
  throw new Error('App Store response did not contain the expected app and ratings')
}
const html = await googleResponse.text()
const structured = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  .map(match => JSON.parse(match[1]))
  .find(entry => entry['@type'] === 'SoftwareApplication' && entry.aggregateRating)
const google = structured?.aggregateRating
if (!Number.isFinite(Number(google?.ratingValue)) || !Number.isFinite(Number(google?.ratingCount))) {
  throw new Error('Google Play structured rating is unavailable; check the visible listing')
}
console.log(JSON.stringify({
  checkedAt: new Date().toISOString(), country: 'US',
  appStore: { name: apple.trackName, score: apple.averageUserRating, count: apple.userRatingCount, source: APP_STORE },
  googlePlay: { name: structured.name, score: Number(google.ratingValue), count: Number(google.ratingCount), source: GOOGLE_PLAY },
  note: 'Verify the visible store listing before publishing. Scores/counts can vary by country and device category.',
}, null, 2))