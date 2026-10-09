import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { AppStoreButton, GooglePlayButton } from './StoreButtons'
import { MOBILE_STORE_RATINGS } from './storeRatings'
import { CopyIcon } from './CopyIcon'
import { GithubMark } from './SiteChrome'
import { latestDesktopDownloads, type DesktopDownloads, type MacArchitecture } from './desktopDownloads'

const BREW = 'brew install --cask slopus/tap/happy'
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

function desktopDownloadUrl(downloads: DesktopDownloads, platform: Exclude<DesktopPlatform, 'desktop'>, architecture: MacArchitecture) {
  return platform === 'macos' ? downloads.macos[architecture] : downloads[platform]
}

function DesktopDownloadLink({ platform, macArchitecture, downloads, className, children }: {
  platform: Exclude<DesktopPlatform, 'desktop'>; macArchitecture: MacArchitecture; downloads: DesktopDownloads | null; className?: string; children: ReactNode
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
    void latestDesktopDownloads().then(value => {
      const url = desktopDownloadUrl(value, platform, requestedArchitecture)
      if (destination) {
        if (!destination.closed) destination.location.replace(url)
      } else if (link.isConnected) window.location.assign(url)
      setChecking(false)
      setMessage('')
    })
  }
  return <a className={className} href={downloads ? desktopDownloadUrl(downloads, platform, macArchitecture) : undefined} role="link" tabIndex={0}
    aria-label={`Download Happy for ${LABELS[platform]}`} aria-busy={checking || undefined}
    onClick={start} onAuxClick={start}
    onKeyDown={event => {
      if (!downloads && event.key === 'Enter') { event.preventDefault(); event.currentTarget.click() }
    }}>
    {children}
    {message && <span className="one-download-sr" role="status">{message}</span>}
  </a>
}

function PlatformLinks({ current, downloads, macArchitecture }: { current: Exclude<DesktopPlatform, 'desktop'>; downloads: DesktopDownloads | null; macArchitecture: MacArchitecture }) {
  return (
    <div className="one-platform-links" aria-label="Desktop platforms">
      {DESKTOP_PLATFORMS.filter(platform => platform !== current).map(platform => <DesktopDownloadLink key={platform} platform={platform} downloads={downloads} macArchitecture={macArchitecture}>
        {platform !== 'macos' && <span className="one-platform-icon" data-platform={platform} aria-hidden="true"
          style={{ '--platform-icon': `url('/img/happy-one/icons/${platform}.svg')` } as CSSProperties} />}
        {LABELS[platform]}
      </DesktopDownloadLink>)}
      <a href="https://github.com/slopus/happy-desktop/releases/latest"><GithubMark />All Releases</a>
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

export function DownloadOptions({ macArchitecture, onMacArchitectureChange, id }: DownloadOptionsProps) {
  const [downloads, setDownloads] = useState<DesktopDownloads | null>(null)
  useEffect(() => {
    let active = true
    void latestDesktopDownloads().then(value => { if (active) setDownloads(value) })
    return () => { active = false }
  }, [])
  const platform = desktopPlatform()
  // Phones and unknown platforms default to macOS, with the other installers
  // linked below its Homebrew command.
  const primaryPlatform = platform === 'desktop' ? 'macos' : platform
  const showBrew = primaryPlatform === 'macos'
  // Prerendered markup has no store preference; hydration settles on this device's.
  const store = useSyncExternalStore(NO_SUBSCRIPTION, mobileStore, () => null)

  return (
    <div
      id={id}
      className="one-download-actions"
      data-platform={platform}
      data-primary-platform={primaryPlatform}
      data-mobile-store={store ?? undefined}
      role="group"
      aria-label="Desktop and mobile downloads"
    >
      <div className="one-desktop-downloads">
        <div className="one-primary-download">
          <DesktopDownloadLink className="store-button one-desktop-button" platform={primaryPlatform} downloads={downloads} macArchitecture={macArchitecture}>
            <DownloadBadge platform={primaryPlatform} />
          </DesktopDownloadLink>
          {primaryPlatform === 'macos' && <select className="one-mac-architecture" aria-label="Mac architecture" value={macArchitecture}
            onChange={event => { if (event.target.value === 'arm64' || event.target.value === 'x64') onMacArchitectureChange(event.target.value) }}>
            <option value="arm64">Apple Silicon</option>
            <option value="x64">Intel</option>
          </select>}
        </div>
        {primaryPlatform === 'windows' && <SmartScreenWarning />}
        {showBrew && <HomebrewCommand />}
        <PlatformLinks current={primaryPlatform} downloads={downloads} macArchitecture={macArchitecture} />
      </div>
      <div className="one-mobile-downloads">
        <div className="one-store-download" data-store="appStore"><AppStoreButton /><StoreRating store="appStore" /></div>
        <div className="one-store-download" data-store="googlePlay"><GooglePlayButton /><StoreRating store="googlePlay" /></div>
      </div>
    </div>
  )
}