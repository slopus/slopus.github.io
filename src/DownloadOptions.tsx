import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { AppStoreButton, GooglePlayButton } from './StoreButtons'
import { MOBILE_STORE_RATINGS } from './storeRatings'
import { CopyIcon } from './CopyIcon'
import { GithubMark } from './SiteChrome'
import { channelDesktopDownloads, GITHUB_RELEASES, LATEST_RELEASE, type DesktopDownloads, type MacArchitecture, type ReleaseChannel } from './desktopDownloads'

const BREW = 'brew install --cask slopus/tap/happy'
/** Stable and Preview, side by side, with every release on GitHub at the end. */
export const RELEASES_PAGE = '/releases/'
const DESKTOP_PLATFORMS = ['macos', 'windows', 'linux'] as const
const LABELS = { macos: 'macOS', windows: 'Windows', linux: 'Linux', desktop: 'Desktop' }
/** The exact signer on the Windows installer's Authenticode certificate (CN and O). */
export const WINDOWS_SIGNING_PUBLISHER = 'Kirill Dubovitskiy'
/** Optional profile linked from the publisher's name. Leave undefined to show the name alone. */
export const WINDOWS_SIGNING_PUBLISHER_URL: string | undefined = 'https://www.linkedin.com/in/kirill-dubovitskiy/'

export type DownloadOptionsProps = {
  macArchitecture: MacArchitecture
  onMacArchitectureChange: (architecture: MacArchitecture) => void
  id?: string
  /** Preview offers the Nightly app for each desktop the preview ships it on, then the preview's own build of Happy. */
  channel?: ReleaseChannel
  /** Off on the releases page itself. */
  releasesLink?: boolean
  /** Off where the page shows the phone apps once for both channels. */
  mobile?: boolean
}
type DesktopPlatform = 'desktop' | 'macos' | 'windows' | 'linux'

function desktopPlatform(): DesktopPlatform {
  if (typeof navigator === 'undefined') return 'desktop'
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (mobile) return 'desktop'
  if (/Windows/i.test(navigator.userAgent)) return 'windows'
  if (/Macintosh|Mac OS X/i.test(navigator.userAgent)) return 'macos'
  if (/Linux/i.test(navigator.userAgent)) return 'linux'
  return 'desktop'
}

type MobileStore = 'appStore' | 'googlePlay'

/** The store this phone or tablet installs from; null elsewhere and on the server. */
function mobileStore(): MobileStore | null {
  if (typeof navigator === 'undefined') return null
  if (/Android/i.test(navigator.userAgent)) return 'googlePlay'
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'appStore'
  return null
}

const NO_SUBSCRIPTION = () => () => {}

function DownloadBadge({ platform }: { platform: Exclude<DesktopPlatform, 'desktop'> }) {
  return (
    <img src={`/img/happy-one/badges/${platform}.svg`} alt="" width="242" height="76" />
  )
}

/** Preview's links are Happy Nightly's, or with `standard` the preview's own build of Happy. */
function desktopDownloadUrl(downloads: DesktopDownloads | null, platform: Exclude<DesktopPlatform, 'desktop'>, architecture: MacArchitecture, channel: ReleaseChannel, standard = false) {
  // Without the release, the release page: GitHub's latest is never a preview, so previews get the list.
  const fallback = channel === 'preview' ? GITHUB_RELEASES : LATEST_RELEASE
  const installers = standard ? downloads?.standard : downloads
  if (!installers) return fallback
  return (platform === 'macos' ? installers.macos[architecture] : installers[platform]) ?? fallback
}

function DesktopDownloadLink({ platform, macArchitecture, downloads, channel = 'stable', standard = false, className, children }: {
  platform: Exclude<DesktopPlatform, 'desktop'>; macArchitecture: MacArchitecture; downloads: DesktopDownloads | null; channel?: ReleaseChannel; standard?: boolean; className?: string; children: ReactNode
}) {
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')
  const start = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || downloads || event.button > 1) return
    event.preventDefault()
    if (checking) return
    const link = event.currentTarget
    const separateWindow = event.button === 1 || event.metaKey || event.ctrlKey || event.shiftKey
    // Reserve the tab during the user gesture; opening it after await can be blocked.
    const destination = separateWindow ? window.open('about:blank', '_blank') : null
    if (separateWindow && !destination) {
      setMessage('Allow pop-ups, or use a normal click to download.')
      return
    }
    if (destination) destination.opener = null
    setChecking(true)
    setMessage('Checking the latest download…')
    // Capture this click's choice even if the shared selector changes while waiting.
    const requestedArchitecture = macArchitecture
    void channelDesktopDownloads(channel).then(value => {
      const url = desktopDownloadUrl(value, platform, requestedArchitecture, channel, standard)
      if (destination) {
        if (!destination.closed) destination.location.replace(url)
      } else if (link.isConnected) window.location.assign(url)
      setChecking(false)
      setMessage('')
    })
  }
  // Until the lookup resolves, the click handler fetches the file; without JavaScript the link opens the release page.
  const app = channel === 'stable' ? 'Happy' : standard ? 'the Happy preview' : 'Happy Nightly'
  return <a className={className} href={desktopDownloadUrl(downloads, platform, macArchitecture, channel, standard)}
    aria-label={`Download ${app} for ${LABELS[platform]}`} aria-busy={checking || undefined}
    data-download-platform={platform} data-download-arch={platform === 'macos' ? macArchitecture : 'x64'}
    onClick={start} onAuxClick={start}>
    {children}
    {message && <span className="one-download-sr" role="status">{message}</span>}
  </a>
}

/** Show a preview platform only when the selected architecture has an installer. */
function releasePlatforms(channel: ReleaseChannel, downloads: DesktopDownloads | null, architecture: MacArchitecture) {
  return channel === 'stable' ? DESKTOP_PLATFORMS : DESKTOP_PLATFORMS.filter(platform =>
    platform === 'macos' ? downloads ? downloads.macos[architecture] : true : downloads?.[platform])
}

function PlatformLinks({ platforms, downloads, channel, macArchitecture, releasesLink, standard = false }: { platforms: readonly Exclude<DesktopPlatform, 'desktop'>[]; downloads: DesktopDownloads | null; channel: ReleaseChannel; macArchitecture: MacArchitecture; releasesLink: boolean; standard?: boolean }) {
  return (
    <div className="one-platform-links" aria-label={standard ? 'Happy preview platforms' : 'Desktop platforms'}>
      {platforms.map(platform => <DesktopDownloadLink key={platform} platform={platform} downloads={downloads} channel={channel} standard={standard} macArchitecture={macArchitecture}>
        {platform !== 'macos' && <span className="one-platform-icon" data-platform={platform} aria-hidden="true"
          style={{ '--platform-icon': `url('/img/happy-one/icons/${platform}.svg')` } as CSSProperties} />}
        {LABELS[platform]}
      </DesktopDownloadLink>)}
      {releasesLink && <a href={RELEASES_PAGE}><GithubMark />All Releases</a>}
    </div>
  )
}

/** A preview's own build of Happy, for every desktop it ships on, under Happy Nightly's. */
function StandardPreview({ downloads, macArchitecture }: { downloads: DesktopDownloads; macArchitecture: MacArchitecture }) {
  const standard = downloads.standard
  if (!standard) return null
  const platforms = DESKTOP_PLATFORMS.filter(platform => platform === 'macos' ? standard.macos[macArchitecture] : standard[platform])
  if (!platforms.length) return null
  return (
    <div className="one-preview-standard">
      <p>Or Happy's own preview build, which replaces Happy:</p>
      <PlatformLinks platforms={platforms} downloads={downloads} channel="preview" standard macArchitecture={macArchitecture} releasesLink={false} />
    </div>
  )
}

/** Only for visitors offered the Windows installer first; new signed releases trip SmartScreen. */
function SmartScreenWarning() {
  const publisher = WINDOWS_SIGNING_PUBLISHER_URL
    ? <a href={WINDOWS_SIGNING_PUBLISHER_URL} target="_blank" rel="noopener noreferrer">{WINDOWS_SIGNING_PUBLISHER}</a>
    : WINDOWS_SIGNING_PUBLISHER
  return (
    <p className="one-smartscreen" role="note">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10.3 3.9 1.8 18.5A2 2 0 0 0 3.5 21.5h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9.5v4.5M12 17.5h.01" />
      </svg>
      <span>Windows SmartScreen may flag Happy while the app builds reputation. The installer is signed:
        choose <strong>More info → Run anyway</strong>, and inspect the certificate (signed by {publisher}).</span>
    </p>
  )
}

function StoreRating({ store }: { store: keyof typeof MOBILE_STORE_RATINGS }) {
  const rating = MOBILE_STORE_RATINGS[store]
  return (
    <p className="store-rating" aria-label={`${rating.score} stars from ${rating.count.toLocaleString('en-US')} ${rating.store} ${rating.noun} in the US`}>
      <span className="store-stars" aria-hidden="true">★★★★★</span>
      <strong>{rating.score}</strong>
      <span className="store-count">{rating.countLabel} {rating.noun}</span>
    </p>
  )
}

async function copyHomebrewCommand() {
  try {
    await navigator.clipboard.writeText(BREW)
    return
  } catch {
    // Some browsers/previews deny the async API. Use their native copy action
    // without highlighting the visible command or leaving focus elsewhere.
    const focused = document.activeElement
    const selection = window.getSelection()
    const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index).cloneRange()) : []
    const input = document.createElement('textarea')
    input.value = BREW
    input.readOnly = true
    input.tabIndex = -1
    input.setAttribute('aria-hidden', 'true')
    input.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;font-size:16px'
    document.body.append(input)
    try {
      input.focus({ preventScroll: true })
      input.select()
      if (!document.execCommand('copy')) throw new Error('Clipboard unavailable')
    } finally {
      input.remove()
      if (focused instanceof HTMLElement) focused.focus({ preventScroll: true })
      selection?.removeAllRanges()
      for (const range of ranges) selection?.addRange(range)
    }
  }
}

function HomebrewCommand() {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    clearTimeout(timer.current)
    try {
      await copyHomebrewCommand()
      setCopied(true)
      setFailed(false)
      timer.current = setTimeout(() => setCopied(false), 1400)
    } catch {
      setCopied(false)
      setFailed(true)
    }
  }

  return (
    <div className="one-brew-command">
      <div className="one-brew-line">
        <span className="one-brew-prompt" aria-hidden="true">$</span>
        <code tabIndex={0} aria-label="Homebrew installation command">{BREW}</code>
      </div>
      <button type="button" onClick={copy} aria-label={copied ? 'Homebrew command copied' : 'Copy Homebrew command'}>
        {copied ? <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12 4 4L19 6" />
        </svg> : <CopyIcon />}
      </button>
      <span className="one-download-sr" role="status">{copied ? 'Copied.' : failed ? 'Clipboard unavailable. You can copy the command manually.' : ''}</span>
    </div>
  )
}

/** Both store badges with their ratings. */
export function MobileDownloads() {
  return (
    <div className="one-mobile-downloads">
      <div className="one-store-download" data-store="appStore"><AppStoreButton /><StoreRating store="appStore" /></div>
      <div className="one-store-download" data-store="googlePlay"><GooglePlayButton /><StoreRating store="googlePlay" /></div>
    </div>
  )
}

export function DownloadOptions({ macArchitecture, onMacArchitectureChange, id, channel = 'stable', releasesLink = true, mobile = true }: DownloadOptionsProps) {
  const [resolved, setResolved] = useState<{ channel: ReleaseChannel; downloads: DesktopDownloads | null } | null>(null)
  useEffect(() => {
    let active = true
    void channelDesktopDownloads(channel).then(value => { if (active) setResolved({ channel, downloads: value }) })
    return () => { active = false }
  }, [channel])
  // Never one channel's files under the other's switch while the new lookup runs.
  const downloads = resolved?.channel === channel ? resolved.downloads : null
  const preview = channel === 'preview'
  // Phones install from the stores; Preview is the desktop app's, shown on the releases page itself.
  const withMobile = mobile && !preview
  const withReleasesLink = releasesLink && !preview
  // The prerendered homepage has no platform; hydration settles on this device's.
  const platform = useSyncExternalStore(NO_SUBSCRIPTION, desktopPlatform, () => 'desktop' as const)
  const platforms = releasePlatforms(channel, downloads, macArchitecture)
  // Phones, unknown platforms, and desktops this preview has no installer for default
  // to macOS, with the other installers linked below its Homebrew command.
  const primaryPlatform = platform !== 'desktop' && platforms.includes(platform) ? platform : platforms[0]
  const otherPlatforms = platforms.filter(other => other !== primaryPlatform)
  // The tap's only cask is the stable app.
  const showBrew = primaryPlatform === 'macos' && !preview
  // Prerendered markup has no store preference; hydration settles on this device's.
  const store = useSyncExternalStore(NO_SUBSCRIPTION, mobileStore, () => null)

  return (
    <div
      id={id}
      className="one-download-actions"
      data-platform={platform}
      data-primary-platform={primaryPlatform}
      data-mobile-store={withMobile ? store ?? undefined : undefined}
      data-channel={preview ? 'preview' : undefined}
      role="group"
      aria-label={preview ? 'Preview downloads' : withMobile ? 'Desktop and mobile downloads' : 'Desktop downloads'}
    >
      <div className="one-desktop-downloads">
        {primaryPlatform && <div className="one-primary-download">
          <DesktopDownloadLink className="store-button one-desktop-button" platform={primaryPlatform} downloads={downloads} channel={channel} macArchitecture={macArchitecture}>
            <DownloadBadge platform={primaryPlatform} />
          </DesktopDownloadLink>
          {primaryPlatform === 'macos' && <select className="one-mac-architecture" aria-label={preview ? 'Preview Mac architecture' : 'Mac architecture'} value={macArchitecture}
            onChange={event => { if (event.target.value === 'arm64' || event.target.value === 'x64') onMacArchitectureChange(event.target.value) }}>
            <option value="arm64">Apple Silicon</option>
            <option value="x64">Intel</option>
          </select>}
        </div>}
        {preview && primaryPlatform !== 'macos' && downloads && (downloads.macos.arm64 || downloads.macos.x64 || downloads.standard?.macos.arm64 || downloads.standard?.macos.x64) &&
          <select className="one-mac-architecture" aria-label="Preview Mac architecture" value={macArchitecture}
            onChange={event => { if (event.target.value === 'arm64' || event.target.value === 'x64') onMacArchitectureChange(event.target.value) }}>
            <option value="arm64">Apple Silicon</option>
            <option value="x64">Intel</option>
          </select>}
        {primaryPlatform === 'windows' && <SmartScreenWarning />}
        {showBrew && <HomebrewCommand />}
        {(otherPlatforms.length > 0 || withReleasesLink) && <PlatformLinks platforms={otherPlatforms} downloads={downloads} channel={channel} macArchitecture={macArchitecture} releasesLink={withReleasesLink} />}
        {preview && downloads && <StandardPreview downloads={downloads} macArchitecture={macArchitecture} />}
      </div>
      {withMobile && <MobileDownloads />}
    </div>
  )
}