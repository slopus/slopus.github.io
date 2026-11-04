export type MacArchitecture = 'arm64' | 'x64'
export type ReleaseChannel = 'stable' | 'preview'
/** One app's installers in a release. Previews ship no Linux AppImage yet, and older previews no Windows installer. */
export type DesktopInstallers = Readonly<{
  macos: Readonly<{ arm64: string; x64: string }>
  windows: string | null
  linux: string | null
}>
/** One release's installers: Happy on Stable, Happy Nightly on Preview. */
export type DesktopDownloads = DesktopInstallers & Readonly<{
  tag: string
  publishedAt?: string
  /** A preview's own build of Happy, which replaces Happy; absent on Stable and on Nightly-only previews. */
  standard?: DesktopInstallers
}>

export const GITHUB_RELEASES = 'https://github.com/slopus/happy-desktop/releases'
export const LATEST_RELEASE = `${GITHUB_RELEASES}/latest`

/** The release's own GitHub page, with its notes. */
export function releaseNotesUrl(tag: string) {
  return `${GITHUB_RELEASES}/tag/${tag}`
}

// Verified production assets remain usable if GitHub is unavailable/rate-limited.
const VERIFIED_RELEASE = 'https://github.com/slopus/happy-desktop/releases/download/v0.0.90'
export const verifiedDesktopDownloads: DesktopDownloads = {
  tag: 'v0.0.90',
  macos: {
    arm64: `${VERIFIED_RELEASE}/Happy-0.0.90-arm64.dmg`,
    x64: `${VERIFIED_RELEASE}/Happy-0.0.90-x64.dmg`,
  },
  windows: `${VERIFIED_RELEASE}/Happy-0.0.90-x64.exe`,
  linux: `${VERIFIED_RELEASE}/Happy-0.0.90-x64.AppImage`,
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

type GithubRelease = { tag_name?: unknown; draft?: unknown; prerelease?: unknown; published_at?: unknown; assets?: unknown }

function publishedAt(release: GithubRelease) {
  return typeof release.published_at === 'string' ? release.published_at : undefined
}

function productionDownloads(value: unknown): DesktopDownloads | null {
  if (!value || typeof value !== 'object') return null
  const release = value as GithubRelease
  if (release.draft !== false || release.prerelease !== false
    || typeof release.tag_name !== 'string' || !/^v\d+\.\d+\.\d+$/.test(release.tag_name)
    || !Array.isArray(release.assets)) return null
  const version = release.tag_name.slice(1)
  const arm64 = assetUrl(release.assets, release.tag_name, `Happy-${version}-arm64.dmg`)
  const x64 = assetUrl(release.assets, release.tag_name, `Happy-${version}-x64.dmg`)
  const windows = assetUrl(release.assets, release.tag_name, `Happy-${version}-x64.exe`)
  const linux = assetUrl(release.assets, release.tag_name, `Happy-${version}-x64.AppImage`)
  return arm64 && x64 && windows && linux
    ? { tag: release.tag_name, publishedAt: publishedAt(release), macos: { arm64, x64 }, windows, linux }
    : null
}

/**
 * A preview's own builds: its macOS disk images, and its Windows installer and Linux
 * AppImage when it has them (the first previews were macOS only; previews build no
 * Linux yet). Null without both disk images.
 */
function previewInstallers(assets: readonly unknown[], tag: string, prefix: string): DesktopInstallers | null {
  const version = tag.slice(1)
  const arm64 = assetUrl(assets, tag, `${prefix}-${version}-arm64.dmg`)
  const x64 = assetUrl(assets, tag, `${prefix}-${version}-x64.dmg`)
  if (!arm64 || !x64) return null
  return {
    macos: { arm64, x64 },
    windows: assetUrl(assets, tag, `${prefix}-${version}-x64.exe`),
    linux: assetUrl(assets, tag, `${prefix}-${version}-x64.AppImage`),
  }
}

/**
 * The preview download is Happy Nightly (installed beside Happy), which updates to every
 * preview and stable release. Every release carries its disk images, so it is the newest
 * published release's, whichever kind it is. A preview also ships its own build of Happy,
 * offered beside it; a stable release's is the Stable column's.
 * GitHub lists releases by creation, not publication, so sort them first.
 */
function previewDownloads(value: unknown): DesktopDownloads | null {
  if (!Array.isArray(value)) return null
  const releases = value
    .filter((release): release is GithubRelease & { tag_name: string; published_at: string; assets: unknown[] } =>
      !!release && typeof release === 'object' && release.draft === false
      && typeof release.tag_name === 'string' && /^v\d+\.\d+\.\d+(-preview\.\d+)?$/.test(release.tag_name)
      && typeof release.published_at === 'string' && Array.isArray(release.assets))
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
  for (const release of releases) {
    const nightly = previewInstallers(release.assets, release.tag_name, 'Happy-Nightly')
    if (!nightly) continue
    const standard = release.tag_name.includes('-preview.') ? previewInstallers(release.assets, release.tag_name, 'Happy') : null
    return { tag: release.tag_name, publishedAt: release.published_at, ...nightly, ...(standard ? { standard } : {}) }
  }
  return null
}

async function githubReleases(path: string): Promise<unknown> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(`https://api.github.com/repos/slopus/happy-desktop/releases${path}`, {
      credentials: 'omit', headers: { Accept: 'application/vnd.github+json' }, signal: controller.signal,
    })
    return response.ok ? await response.json() : null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

let stableRequest: Promise<DesktopDownloads> | undefined
let previewRequest: Promise<DesktopDownloads | null> | undefined

// The hero and footer share one public, unauthenticated lookup per page lifetime.
export function latestDesktopDownloads(): Promise<DesktopDownloads> {
  stableRequest ??= githubReleases('/latest').then(value => productionDownloads(value) ?? verifiedDesktopDownloads)
  return stableRequest
}

/** The newest preview's downloads, or null when GitHub has none or does not answer. */
export function previewDesktopDownloads(): Promise<DesktopDownloads | null> {
  previewRequest ??= githubReleases('?per_page=30').then(previewDownloads)
  return previewRequest
}

export function channelDesktopDownloads(channel: ReleaseChannel): Promise<DesktopDownloads | null> {
  return channel === 'preview' ? previewDesktopDownloads() : latestDesktopDownloads()
}
