export type MacArchitecture = 'arm64' | 'x64'
export type DesktopDownloads = Readonly<{
  macos: Readonly<{ arm64: string; x64: string }>
  windows: string
  linux: string
}>

// Verified production assets remain usable if GitHub is unavailable/rate-limited.
const VERIFIED_RELEASE = 'https://github.com/slopus/happy-desktop/releases/download/v0.0.85'
export const verifiedDesktopDownloads: DesktopDownloads = {
  macos: {
    arm64: `${VERIFIED_RELEASE}/Happy-0.0.85-arm64.dmg`,
    x64: `${VERIFIED_RELEASE}/Happy-0.0.85-x64.dmg`,
  },
  windows: `${VERIFIED_RELEASE}/Happy-0.0.85-x64.exe`,
  linux: `${VERIFIED_RELEASE}/Happy-0.0.85-x64.AppImage`,
}

function assetUrl(assets: readonly unknown[], tag: string, name: string): string | null {
  const expected = `https://github.com/slopus/happy-desktop/releases/download/${tag}/${name}`
  for (const value of assets) {
    if (!value || typeof value !== 'object') continue
    const asset = value as { name?: unknown; browser_download_url?: unknown }
    if (asset.name === name && asset.browser_download_url === expected) return asset.browser_download_url
  }
  return null
}

function productionDownloads(value: unknown): DesktopDownloads | null {
  if (!value || typeof value !== 'object') return null
  const release = value as { tag_name?: unknown; draft?: unknown; prerelease?: unknown; assets?: unknown }
  if (release.draft !== false || release.prerelease !== false
    || typeof release.tag_name !== 'string' || !/^v\d+\.\d+\.\d+$/.test(release.tag_name)
    || !Array.isArray(release.assets)) return null
  const version = release.tag_name.slice(1)
  const arm64 = assetUrl(release.assets, release.tag_name, `Happy-${version}-arm64.dmg`)
  const x64 = assetUrl(release.assets, release.tag_name, `Happy-${version}-x64.dmg`)
  const windows = assetUrl(release.assets, release.tag_name, `Happy-${version}-x64.exe`)
  const linux = assetUrl(release.assets, release.tag_name, `Happy-${version}-x64.AppImage`)
  return arm64 && x64 && windows && linux ? { macos: { arm64, x64 }, windows, linux } : null
}

let request: Promise<DesktopDownloads> | undefined

async function resolveDesktopDownloads(): Promise<DesktopDownloads> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch('https://api.github.com/repos/slopus/happy-desktop/releases/latest', {
      credentials: 'omit', headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal,
    })
    return (response.ok ? productionDownloads(await response.json()) : null) ?? verifiedDesktopDownloads
  } catch {
    return verifiedDesktopDownloads
  } finally {
    clearTimeout(timeout)
  }
}

// The hero and footer share one public, unauthenticated lookup per page lifetime.
export function latestDesktopDownloads(): Promise<DesktopDownloads> {
  request ??= resolveDesktopDownloads()
  return request
}