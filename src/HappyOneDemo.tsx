import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { DEMO_TAKE, type DemoMovie } from './happyOneDemoMedia'
import { useRevealedControls } from './revealedControls'
import './happy-one-demo.css'

type DataConnection = EventTarget & { saveData?: boolean }
function dataConnection() {
  return (navigator as Navigator & { connection?: DataConnection }).connection
}

function Sources({ movie }: { movie: DemoMovie }) {
  return movie.sources.map(({ src, type, media }) => <source key={src} src={src} type={type} media={media} />)
}

/**
 * The recorded take (happyOneDemoMedia.ts) straight on the page: the Mac window on the page's
 * axis and the phone standing beside it, peeking in from the screen's edge where there is no
 * room. The window's movie is the clock. It loops muted while in view, without browser chrome
 * covering it; deliberate pointer/keyboard interaction reveals the ordinary native controls, and
 * reduced motion, save-data, and blocked autoplay leave it paused on its poster with them. A
 * phone movie on the same clock follows its play, pause, seek, and rate. The phone comes forward
 * for its part of the story, and drifts in as the page scrolls. `reach` is the line above the
 * demo the phone may grow up to when it comes forward on a phone.
 */
export function HappyOneDemo({ reach }: { reach?: RefObject<HTMLElement | null> } = {}) {
  const take = DEMO_TAKE
  const figure = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const desktop = useRef<HTMLVideoElement>(null)
  const phone = useRef<HTMLVideoElement>(null)
  const device = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const { revealControls, videoProps } = useRevealedControls()

  useEffect(() => {
    const main = desktop.current!
    const companion = phone.current
    const follows = take.phone.kind === 'movie' && take.phone.follows
    // A failed load reports on the last <source> the browser tried, not on the video.
    const lastSource = main.querySelector<HTMLSourceElement>('source:last-of-type')!
    // Muted here, not as a prop: the prerendered markup cannot carry it, and hydration would
    // leave the movies unmuted, which blocks autoplay.
    main.muted = true
    if (companion) companion.muted = true
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    const connection = dataConnection()
    let autoplay = !reducedMotion.matches && !connection?.saveData
    if (!autoplay) revealControls()
    let visible = false
    let disposed = false
    // Pausing for the viewport or a hidden tab resumes; a visitor's own pause stays paused.
    let holding = false
    let resume = false
    let focused = false

    const focus = () => {
      const [from, to] = take.phoneFocus ?? [Infinity, Infinity]
      const now = main.currentTime >= from && main.currentTime < to
      if (now !== focused) { focused = now; setPhoneFocused(now) }
    }
    const align = (force = false) => {
      if (!companion || !follows || companion.readyState < 1) return
      if (force || Math.abs(companion.currentTime - main.currentTime) > 0.12) companion.currentTime = main.currentTime
    }
    const follow = () => {
      if (!companion) return
      if (main.paused || main.seeking || main.ended || main.readyState < 3) companion.pause()
      else if (companion.paused && companion.readyState >= 2) void companion.play().catch(() => undefined)
    }
    const play = () => {
      if (!(autoplay || resume) || !visible || document.hidden) return
      resume = false
      void main.play().catch(() => {
        if (disposed) return
        autoplay = false
        revealControls()
      })
    }
    const hold = () => {
      if (main.paused) return
      holding = true
      main.pause()
    }
    // Once, while the page rests with the window playing: the header's frost swept down the
    // demo, invisibly (.one-demo-warm), so a cold browser builds its pipelines now.
    let warmed = false
    let warming: HTMLSpanElement | undefined
    const warm = () => {
      if (warmed || disposed) return
      warmed = true
      if (scrollY > 0 || typeof requestIdleCallback === 'undefined') return
      requestIdleCallback(() => {
        if (disposed || scrollY > 0) return
        warming = document.createElement('span')
        warming.className = 'one-demo-warm'
        warming.setAttribute('aria-hidden', 'true')
        warming.addEventListener('animationend', () => warming?.remove(), { once: true })
        stage.current!.append(warming)
        setTimeout(() => warming?.remove(), 1000)
      }, { timeout: 2000 })
    }
    const onPlaying = () => { follow(); warm() }
    const onPlay = () => {
      align(true)
      if (companion && follows) companion.playbackRate = main.playbackRate
      follow()
    }
    const onPause = () => {
      companion?.pause()
      if (holding) resume = true
      else autoplay = resume = false
      holding = false
    }
    // Looping seeks the window back to the start, which brings the phone along.
    const onSeeking = () => { companion?.pause(); align(true); focus() }
    const onRate = () => { if (companion && follows) companion.playbackRate = main.playbackRate }
    // Also picks the phone back up if it stalled behind the window.
    const onTime = () => { focus(); align(); follow() }
    const onError = () => setError(true)
    const onVisibility = () => { if (document.hidden) hold(); else play() }
    const onMotion = () => {
      if (reducedMotion.matches || connection?.saveData) { autoplay = false; main.pause(); revealControls() }
    }
    main.addEventListener('play', onPlay)
    main.addEventListener('playing', onPlaying)
    main.addEventListener('pause', onPause)
    main.addEventListener('waiting', follow)
    main.addEventListener('seeking', onSeeking)
    main.addEventListener('seeked', follow)
    main.addEventListener('ratechange', onRate)
    main.addEventListener('timeupdate', onTime)
    companion?.addEventListener('canplay', follow)
    companion?.addEventListener('seeked', follow)
    lastSource.addEventListener('error', onError)
    document.addEventListener('visibilitychange', onVisibility)
    reducedMotion.addEventListener('change', onMotion)
    connection?.addEventListener('change', onMotion)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25
      if (visible) play()
      else hold()
    }, { threshold: [0, 0.25] })
    observer.observe(figure.current!)
    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      reducedMotion.removeEventListener('change', onMotion)
      connection?.removeEventListener('change', onMotion)
      main.removeEventListener('play', onPlay)
      main.removeEventListener('playing', onPlaying)
      warming?.remove()
      main.removeEventListener('pause', onPause)
      main.removeEventListener('waiting', follow)
      main.removeEventListener('seeking', onSeeking)
      main.removeEventListener('seeked', follow)
      main.removeEventListener('ratechange', onRate)
      main.removeEventListener('timeupdate', onTime)
      companion?.removeEventListener('canplay', follow)
      companion?.removeEventListener('seeked', follow)
      lastSource.removeEventListener('error', onError)
      main.pause()
      companion?.pause()
    }
  }, [])

  // How far the page has carried the stage from where it rests toward the top: 0 to 1.
  useEffect(() => {
    const node = stage.current!
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let last = ''
    const update = () => {
      frame = 0
      const rest = node.getBoundingClientRect().top + scrollY
      const progress = reducedMotion.matches ? 0 : Math.min(1, Math.max(0, scrollY / Math.max(rest, 1)))
      const value = progress.toFixed(3)
      if (value !== last) node.style.setProperty('--demo-scroll', last = value)
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    reducedMotion.addEventListener('change', schedule)
    update()
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
      reducedMotion.removeEventListener('change', schedule)
    }
  }, [])

  // How far the phone may grow from its bottom edge, forward, for its top to stay 8px under
  // `reach`: taller than the window. Phones use it (happy-one-demo.css); wider screens keep
  // 1.18×. Measured when the layout changes, never while scrolling.
  useEffect(() => {
    const line = reach?.current
    if (!line) return
    const node = stage.current!
    const parked = device.current!
    const update = () => {
      const top = line.getBoundingClientRect().bottom - node.getBoundingClientRect().top + 8
      const scale = (parked.offsetTop + parked.offsetHeight - top) / parked.offsetHeight
      node.style.setProperty('--phone-reach', Math.min(1.6, Math.max(1, scale)).toFixed(3))
    }
    update()
    const resize = new ResizeObserver(update)
    resize.observe(node)
    resize.observe(line)
    return () => {
      resize.disconnect()
      node.style.removeProperty('--phone-reach')
    }
  }, [reach])

  const { desktop: mac, phone: screen } = take
  const size = { '--desktop-w': mac.width, '--desktop-h': mac.height } as CSSProperties
  return (
    <figure ref={figure} className="one-demo">
      <div ref={stage} className="one-demo-stage" style={size} data-phone-focus={phoneFocused ? '' : undefined}>
        <div className="one-demo-window">
          <video ref={desktop} poster={mac.poster} width={mac.width} height={mac.height}
            {...videoProps} loop playsInline preload="metadata" aria-label={take.label}>
            <Sources movie={mac} />
          </video>
        </div>
        {/* The take's label describes both screens. */}
        <div ref={device} className="one-demo-phone" aria-hidden="true">
          <span className="one-phone-screen">
            {screen.kind === 'movie'
              ? <video ref={phone} poster={screen.poster} width={screen.width} height={screen.height}
                  loop={!screen.follows} playsInline preload="metadata" tabIndex={-1}>
                  <Sources movie={screen} />
                </video>
              : <img src={screen.src} width={screen.width} height={screen.height} alt="" />}
          </span>
          <img className="one-phone-frame" src="/video/happy-one/device/iphone-16-pro-black.png" width="1406" height="2822" alt="" />
        </div>
      </div>
      {error && <p className="one-demo-error" role="status">The demo couldn’t load. <a href={mac.sources.at(-1)!.src} target="_blank" rel="noopener">Open the video</a>.</p>}
    </figure>
  )
}
