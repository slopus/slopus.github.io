const MEDIA = '/video/happy-one/v36-split'

type Track = { width: number, height: number, bitrate: number }
type Tier = { framerate: number, suffix: string, av1: string, desktop: Track, phone: Track }

const highQuality: Tier = {
  framerate: 60, suffix: '', av1: 'av01.0.12M.08',
  desktop: { width: 2200, height: 1500, bitrate: 5_000_000 },
  phone: { width: 1206, height: 2622, bitrate: 3_000_000 },
}

const standard: Tier = {
  framerate: 30, suffix: '-30', av1: 'av01.0.08M.08',
  desktop: { width: 1760, height: 1200, bitrate: 3_000_000 },
  phone: { width: 804, height: 1748, bitrate: 1_500_000 },
}

const formats = {
  av1: { extension: 'webm', contentType: (tier: Tier) => `video/webm; codecs="${tier.av1}"` },
  h264: { extension: 'mp4', contentType: () => 'video/mp4; codecs="avc1.640033"' },
} as const
type Format = keyof typeof formats

function pair(tier: Tier, format: Format) {
  const { extension } = formats[format]
  return {
    desktop: { src: `${MEDIA}/desktop${tier.suffix}.${extension}`, width: tier.desktop.width, height: tier.desktop.height },
    phone: { src: `${MEDIA}/phone${tier.suffix}.${extension}`, width: tier.phone.width, height: tier.phone.height },
  }
}

async function decodesWell(tier: Tier, format: Format) {
  const contentType = formats[format].contentType(tier)
  const results = await Promise.all([tier.desktop, tier.phone].map(({ width, height, bitrate }) =>
    navigator.mediaCapabilities.decodingInfo({
      type: 'file',
      video: { contentType, width, height, bitrate, framerate: tier.framerate },
    })))
  return results.every(result => result.supported && result.smooth && result.powerEfficient)
}

export async function happyOneDemoMediaSelect() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  if (connection?.saveData || !navigator.mediaCapabilities?.decodingInfo) return pair(standard, 'h264')
  try {
    // Select the pair once, before loading either video. Browser-reported smooth, power-efficient
    // decoding avoids guessing capability from CPU count or screen size. AV1 is smaller, but only
    // where it decodes in hardware; otherwise H.264, which every browser decodes.
    for (const tier of [highQuality, standard])
      for (const format of ['av1', 'h264'] as const)
        if (await decodesWell(tier, format)) return pair(tier, format)
  } catch {
    // Fall through to the pair every browser plays.
  }
  return pair(standard, 'h264')
}
