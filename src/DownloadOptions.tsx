import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { AppStoreButton, GooglePlayButton } from './StoreButtons'
import { MOBILE_STORE_RATINGS } from './storeRatings'
import { CopyIcon } from './CopyIcon'
import { latestDesktopDownloads, type DesktopDownloads } from './desktopDownloads'

const BREW = 'brew install --cask slopus/tap/happy'
const DESKTOP_PLATFORMS = ['macos', 'windows', 'linux'] as const
const LABELS = { macos: 'macOS', windows: 'Windows', linux: 'Linux', desktop: 'Desktop' }

export type DownloadOptionsProps = { variant: number; onCycle: (direction: number) => void }
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

function DownloadBadge({ platform, variant }: { platform: Exclude<DesktopPlatform, 'desktop'>; variant: number }) {
  const artwork = platform === 'macos' && variant === 0 ? 'macos-rainbow' : platform
  return (
    <img src={`/img/happy-one/badges/${artwork}.svg`} alt="" width="242" height="76" />
  )
}

function DesktopDownloadLink({ platform, downloads, className, children }: {
  platform: Exclude<DesktopPlatform, 'desktop'>; downloads: DesktopDownloads | null; className?: string; children: ReactNode
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
    void latestDesktopDownloads().then(value => {
      if (destination) {
        if (!destination.closed) destination.location.replace(value[platform])
      } else if (link.isConnected) window.location.assign(value[platform])
      setChecking(false)
      setMessage('')
    })
  }
  return <a className={className} href={downloads?.[platform]} role="link" tabIndex={0}
    aria-label={`Download Happy for ${LABELS[platform]}`} aria-busy={checking || undefined}
    onClick={start} onAuxClick={start}
    onKeyDown={event => {
      if (!downloads && event.key === 'Enter') { event.preventDefault(); event.currentTarget.click() }
    }}>
    {children}
    {message && <span className="one-download-sr" role="status">{message}</span>}
  </a>
}

function PlatformLinks({ current, downloads }: { current: Exclude<DesktopPlatform, 'desktop'>; downloads: DesktopDownloads | null }) {
  return (
    <div className="one-platform-links" aria-label="Desktop platforms">
      {DESKTOP_PLATFORMS.filter(platform => platform !== current).map(platform => <DesktopDownloadLink key={platform} platform={platform} downloads={downloads}>
        {platform !== 'macos' && <span className="one-platform-icon" data-platform={platform} aria-hidden="true"
          style={{ '--platform-icon': `url('/img/happy-one/icons/${platform}.svg')` } as CSSProperties} />}
        {LABELS[platform]}
      </DesktopDownloadLink>)}
    </div>
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

export function DownloadOptions({ variant, onCycle }: DownloadOptionsProps) {
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

  return (
    <div
      className="one-download-actions"
      data-variant={variant}
      data-platform={platform}
      data-primary-platform={primaryPlatform}
      role="group"
      aria-label={`Desktop and mobile downloads. Apple badge ${variant === 0 ? 'rainbow' : 'white'}, ${variant + 1} of 2. Use left or right arrow keys to compare.`}
      tabIndex={0}
      onClick={event => {
        if (event.target instanceof Element && event.target.closest('a, button, .one-brew-command')) return
        if (window.getSelection()?.toString()) return
        onCycle(1)
      }}
      onKeyDown={event => {
        if (event.target !== event.currentTarget) return
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault()
          onCycle(event.key === 'ArrowRight' ? 1 : -1)
        }
      }}
    >
      <div className="one-desktop-downloads">
        <DesktopDownloadLink className="store-button one-desktop-button" platform={primaryPlatform} downloads={downloads}>
          <DownloadBadge platform={primaryPlatform} variant={variant} />
        </DesktopDownloadLink>
        {showBrew && <HomebrewCommand />}
        <PlatformLinks current={primaryPlatform} downloads={downloads} />
      </div>
      <div className="one-mobile-downloads">
        <div className="one-store-download"><AppStoreButton /><StoreRating store="appStore" /></div>
        <div className="one-store-download"><GooglePlayButton /><StoreRating store="googlePlay" /></div>
      </div>
    </div>
  )
}