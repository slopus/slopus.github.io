const standard = {
  desktop: '/video/happy-one/v14/desktop.mp4',
  phone: '/video/happy-one/v13/phone.mp4',
} as const

const highQuality = {
  desktop: '/video/happy-one/v15/desktop.mp4',
  phone: '/video/happy-one/v15/phone.mp4',
} as const

export async function happyOneDemoMediaSelect() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData || !navigator.mediaCapabilities?.decodingInfo) return standard
  try {
    // Select the pair once, before loading either video. Browser-reported smooth
    // hardware decoding avoids guessing capability from CPU count or screen size.
    const results = await Promise.all([
      { width: 2560, height: 1440, bitrate: 5_000_000 },
      { width: 1206, height: 2622, bitrate: 3_000_000 },
    ].map(video => navigator.mediaCapabilities.decodingInfo({
      type: 'file',
      video: { ...video, contentType: 'video/mp4; codecs="avc1.640033"', framerate: 60 },
    })))
    return results.every(result => result.supported && result.smooth && result.powerEfficient) ? highQuality : standard
  } catch {
    return standard
  }
}