export type MacArchitecture = 'arm64' | 'x64'
export type ReleaseChannel = 'stable' | 'preview'
/** Each installer is optional: preview builds can publish independently. */
export type DesktopInstallers = Readonly<{
  macos: Readonly<{ arm64: string | null; x64: string | null }>
  windows: string | null
  linux: string | null
}>
/** Happy on Stable; newest available installers per platform and flavor on Preview. */
export type DesktopDownloads = DesktopInstallers & Readonly<{
  tag: string
  publishedAt?: string
  /** A preview's own build of Happy, which replaces Happy; absent on Stable and on Nightly-only previews. */
  standard?: DesktopInstallers
  /** On Preview, the newest stable Happy, only where neither app has a preview build. */
  latest?: DesktopInstallers & Readonly<{ tag: string; publishedAt?: string }>
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

/** Read only published assets; a missing build never blocks another platform. */
function previewInstallers(assets: readonly unknown[], tag: string, prefix: string): DesktopInstallers {
  const version = tag.slice(1)
  const arm64 = assetUrl(assets, tag, `${prefix}-${version}-arm64.dmg`)
  const x64 = assetUrl(assets, tag, `${prefix}-${version}-x64.dmg`)
  return {
    macos: { arm64, x64 },
    windows: assetUrl(assets, tag, `${prefix}-${version}-x64.exe`),
    linux: assetUrl(assets, tag, `${prefix}-${version}-x64.AppImage`),
  }
}

function hasInstallers(installers: DesktopInstallers) {
  return !!(installers.macos.arm64 || installers.macos.x64 || installers.windows || installers.linux)
}

/** Fill missing slots from an older release, keeping each newer asset. */
function mergeInstallers(newer: DesktopInstallers, older: DesktopInstallers): DesktopInstallers {
  return {
    macos: { arm64: newer.macos.arm64 ?? older.macos.arm64, x64: newer.macos.x64 ?? older.macos.x64 },
    windows: newer.windows ?? older.windows,
    linux: newer.linux ?? older.linux,
  }
}

/** The fallback's installers for the slots no offered build fills. */
function unfilledInstallers(fallback: DesktopInstallers, ...offered: DesktopInstallers[]): DesktopInstallers {
  const unfilled = (pick: (installers: DesktopInstallers) => string | null) => offered.some(pick) ? null : pick(fallback)
  return {
    macos: { arm64: unfilled(installers => installers.macos.arm64), x64: unfilled(installers => installers.macos.x64) },
    windows: unfilled(installers => installers.windows),
    linux: unfilled(installers => installers.linux),
  }
}

/**
 * The preview download is Happy Nightly (installed beside Happy), which updates to every
 * preview and stable release. Pick each installer independently by publication date.
 * Happy's own preview builds are offered until a newer stable release replaces them.
 * Where neither app has a build, the newest stable Happy is offered instead.
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
  const empty: DesktopInstallers = { macos: { arm64: null, x64: null }, windows: null, linux: null }
  let downloads: DesktopDownloads | null = null
  let standard = empty
  let stable: NonNullable<DesktopDownloads['latest']> | null = null
  let beforeStable = true
  for (const release of releases) {
    const nightly = previewInstallers(release.assets, release.tag_name, 'Happy-Nightly')
    const isPreview = release.tag_name.includes('-preview.')
    if (!isPreview) beforeStable = false
    if (!isPreview && !stable) {
      stable = { tag: release.tag_name, publishedAt: release.published_at, ...previewInstallers(release.assets, release.tag_name, 'Happy') }
    }
    const own = isPreview && beforeStable ? previewInstallers(release.assets, release.tag_name, 'Happy') : empty
    standard = mergeInstallers(standard, own)
    if (!downloads && (hasInstallers(nightly) || hasInstallers(own))) {
      downloads = { tag: release.tag_name, publishedAt: release.published_at, ...empty }
    }
    if (downloads) downloads = { ...downloads, ...mergeInstallers(downloads, nightly) }
  }
  if (!downloads && stable && hasInstallers(stable)) downloads = { tag: stable.tag, publishedAt: stable.publishedAt, ...empty }
  if (!downloads) return null
  const latest = stable && { tag: stable.tag, publishedAt: stable.publishedAt, ...unfilledInstallers(stable, downloads, standard) }
  return {
    ...downloads,
    ...(hasInstallers(standard) ? { standard } : {}),
    ...(latest && hasInstallers(latest) ? { latest } : {}),
  }
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
