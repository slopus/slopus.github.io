const standard = {
  framerate: 30,
  desktop: { src: '/video/happy-one/v21/desktop-30.mp4', width: 1560, height: 1328 },
  phone: { src: '/video/happy-one/v21/phone-30.mp4', width: 804, height: 1748 },
} as const

const highQuality = {
  framerate: 60,
  desktop: { src: '/video/happy-one/v21/desktop.mp4', width: 1950, height: 1660 },
  phone: { src: '/video/happy-one/v21/phone.mp4', width: 1206, height: 2622 },
} as const

export async function happyOneDemoMediaSelect() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData || !navigator.mediaCapabilities?.decodingInfo) return standard
  try {
    // Select the pair once, before loading either video. Browser-reported smooth
    // hardware decoding avoids guessing capability from CPU count or screen size.
    const results = await Promise.all([
      { width: highQuality.desktop.width, height: highQuality.desktop.height, bitrate: 5_000_000 },
      { width: highQuality.phone.width, height: highQuality.phone.height, bitrate: 3_000_000 },
    ].map(video => navigator.mediaCapabilities.decodingInfo({
      type: 'file',
      video: { ...video, contentType: 'video/mp4; codecs="avc1.640033"', framerate: highQuality.framerate },
    })))
    return results.every(result => result.supported && result.smooth && result.powerEfficient) ? highQuality : standard
  } catch {
    return standard
  }
}