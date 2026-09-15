// US listings, checked 2026-09-15. Static snapshots: no visitor-side API calls.
// Refresh with `node scripts/check-store-ratings.mjs`, then verify the listings.
export const MOBILE_STORE_RATINGS = {
  appStore: {
    store: 'App Store', score: '4.9', count: 1006, countLabel: '1,000+', noun: 'ratings',
    source: 'https://itunes.apple.com/lookup?id=6748571505&country=us',
  },
  googlePlay: {
    store: 'Google Play', score: '5.0', count: 3128, countLabel: '3.1k+', noun: 'reviews',
    source: 'https://play.google.com/store/apps/details?id=com.ex3ndr.happy&hl=en_US&gl=US',
  },
} as const