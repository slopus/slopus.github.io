import { useEffect, useRef, useState } from 'react'
import { AppStoreButton, GooglePlayButton } from './StoreButtons'
import { MOBILE_STORE_RATINGS } from './storeRatings'

const DOWNLOAD = 'https://github.com/slopus/happy-desktop/releases/latest'
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

function PlatformLinks({ current }: { current: DesktopPlatform }) {
  return (
    <div className="one-platform-links" aria-label="Desktop platforms">
      {DESKTOP_PLATFORMS.filter(platform => platform !== current).map(platform => <a key={platform} href={DOWNLOAD} aria-label={`Happy ${LABELS[platform]} releases`}>{LABELS[platform]}</a>)}
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

function HomebrewCommand() {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const code = useRef<HTMLElement>(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(BREW)
      setCopied(true)
      setFailed(false)
      timer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
      setFailed(true)
      // Leave a native text selection ready for the platform's Copy command.
      if (code.current) {
        const range = document.createRange()
        range.selectNodeContents(code.current)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }

  return (
    <div className="one-brew-command">
      <div className="one-brew-line">
        <span className="one-brew-prompt" aria-hidden="true">$</span>
        <code ref={code}>{BREW}</code>
      </div>
      <button type="button" onClick={copy} aria-label={copied ? 'Homebrew command copied' : 'Copy Homebrew command'} title={copied ? 'Copied' : 'Copy command'}>
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {copied ? <path d="m5 12 4 4L19 6" /> : <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4" /></>}
        </svg>
      </button>
      <span className="one-download-sr" role="status">{copied ? 'Copied.' : failed ? 'Select and copy the command manually.' : ''}</span>
    </div>
  )
}

export function DownloadOptions({ variant, onCycle }: DownloadOptionsProps) {
  const platform = desktopPlatform()
  // Phones have no desktop OS to detect. Keep all three platforms explicit
  // below the macOS badge, including while comparing the two Apple treatments.
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
        <a className="store-button one-desktop-button" href={DOWNLOAD} aria-label={`Download Happy for ${LABELS[primaryPlatform]}`}>
          <DownloadBadge platform={primaryPlatform} variant={variant} />
        </a>
        <PlatformLinks current={platform} />
        {showBrew && <HomebrewCommand />}
      </div>
      <div className="one-mobile-downloads">
        <div className="one-store-download"><AppStoreButton /><StoreRating store="appStore" /></div>
        <div className="one-store-download"><GooglePlayButton /><StoreRating store="googlePlay" /></div>
      </div>
    </div>
  )
}