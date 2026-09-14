import { useEffect, useId, useRef, useState } from 'react'
import { AppStoreButton, GooglePlayButton } from './StoreButtons'

const DOWNLOAD = 'https://github.com/slopus/happy-desktop/releases/latest'
const BREW = 'brew install --cask slopus/tap/happy'
const PLATFORMS = 'macOS · Windows · Linux'
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

function DownloadBadge({ platform }: { platform: DesktopPlatform }) {
  return (
    <img src={`/img/happy-one/badges/${platform}.svg`} alt="" width="242" height="76" />
  )
}

function DesktopLink({ platform }: { platform: DesktopPlatform }) {
  return <a className="store-button one-desktop-button" href={DOWNLOAD} aria-label={`Download Happy for ${LABELS[platform]}`}><DownloadBadge platform={platform} /></a>
}

function PlatformLinks({ current }: { current: DesktopPlatform }) {
  return (
    <div className="one-platform-links" aria-label="Desktop platforms">
      {DESKTOP_PLATFORMS.filter(platform => platform !== current).map(platform => <a key={platform} href={DOWNLOAD} aria-label={`Happy ${LABELS[platform]} releases`}>{LABELS[platform]}</a>)}
    </div>
  )
}

function PlatformPicker({ platform }: { platform: DesktopPlatform }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const firstLink = useRef<HTMLAnchorElement>(null)
  const generic = platform === 'desktop'
  const chevron = <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={open ? 'm6 15 6-6 6 6' : 'm6 9 6 6 6-6'} /></svg>

  useEffect(() => {
    if (!open) return
    firstLink.current?.focus({ preventScroll: true })
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
      trigger.current?.focus({ preventScroll: true })
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  return (
    <div ref={root} className="one-platform-picker" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <div className="one-platform-primary">
        {generic ? (
          <button ref={trigger} className="one-generic-platform" type="button" aria-label="Choose a desktop platform" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
            <span className="store-button one-desktop-button"><DownloadBadge platform="desktop" /></span>
            <span className="one-platform-toggle" aria-hidden="true">{chevron}</span>
          </button>
        ) : <>
          <DesktopLink platform={platform} />
          <button ref={trigger} className="one-platform-toggle" type="button" aria-label="More desktop downloads" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{chevron}</button>
        </>}
      </div>
      {open && (
        <div className="one-platform-popover" id={id} role="group" aria-label="Choose a desktop download" data-download-popover>
          {DESKTOP_PLATFORMS.map((os, index) => <a key={os} ref={index === 0 ? firstLink : undefined} href={DOWNLOAD}>Download for {LABELS[os]}</a>)}
        </div>
      )}
    </div>
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
      <code ref={code}>{BREW}</code>
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
  const showBrew = platform !== 'windows'

  return (
    <div
      className="one-download-actions"
      data-variant={variant}
      data-platform={platform}
      role="group"
      aria-label={`Desktop and mobile downloads. Preview layout ${variant + 1} of 3. Use left or right arrow keys to change layout.`}
      tabIndex={0}
      onClick={event => {
        if (event.target instanceof Element && event.target.closest('a, button, code, [data-download-popover]')) return
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
        {variant === 0 ? (
          <><DesktopLink platform={platform} /><PlatformLinks current={platform} /></>
        ) : variant === 1 ? (
          <><PlatformPicker key={variant} platform={platform} /><span className="one-desktop-platforms">{PLATFORMS}</span></>
        ) : (
          <div className="one-os-downloads">
            {DESKTOP_PLATFORMS.map(os => <DesktopLink key={os} platform={os} />)}
          </div>
        )}
        {showBrew && <HomebrewCommand />}
      </div>
      <div className="one-mobile-downloads">
        <AppStoreButton /><GooglePlayButton />
      </div>
    </div>
  )
}