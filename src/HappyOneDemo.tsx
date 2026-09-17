import { useEffect, useRef, useState } from 'react'
import { HappyOnePhone } from './HappyOnePhone'
import { happyOneDemoMediaSelect } from './happyOneDemoMedia'
import './happy-one-demo.css'

const MEDIA = '/video/happy-one/v21'
// v21-r2 recording cues on the common 60fps desktop/phone master clock.
const PHONE_ENTER = 2087 / 60
const PHONE_EXIT = 2974 / 60

type DataConnection = EventTarget & { saveData?: boolean }
function dataConnection() {
  return (navigator as Navigator & { connection?: DataConnection }).connection
}

/**
 * macOS traffic lights where the recorded header shows the browser-mode logo,
 * on a patch of the header's own colour, in the app's CSS pixels. Decorative,
 * not controls, and transparent to the pointer so the video's own controls work.
 */
function MacWindowLights() {
  return <div className="one-demo-lights" aria-hidden="true"><span /><span /><span /></div>
}

/**
 * The recorded Mac window with the browser's own video controls, and the phone
 * that follows it. The desktop movie is the clock: its play, pause, seek, and
 * rate drive the phone movie, so scrubbing keeps the pair on one clock. The
 * player itself only starts the movie once it is in view and pauses it while
 * it is not; every other decision is the visitor's, through the controls.
 */
export function HappyOneDemo() {
  const stage = useRef<HTMLElement>(null)
  const desktop = useRef<HTMLVideoElement>(null)
  const phone = useRef<HTMLVideoElement>(null)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const main = desktop.current!
    const companion = phone.current!
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    const connection = dataConnection()
    let autoplay = !reducedMotion.matches && !connection?.saveData
    let visible = false
    let loaded = false
    let disposed = false
    let resumeWhenVisible = false
    let focused = false

    const focus = () => {
      const now = main.currentTime >= PHONE_ENTER && main.currentTime < PHONE_EXIT
      if (now !== focused) { focused = now; setPhoneFocused(now) }
    }
    const align = (force = false) => {
      if (companion.readyState < 1) return
      if (force || Math.abs(companion.currentTime - main.currentTime) > 0.12) companion.currentTime = main.currentTime
    }
    const follow = () => {
      if (main.paused || main.seeking || main.ended || main.readyState < 3) companion.pause()
      else if (companion.paused && companion.readyState >= 2) void companion.play().catch(() => undefined)
    }
    const load = async () => {
      if (loaded) return
      loaded = true
      const media = await happyOneDemoMediaSelect()
      if (disposed) return
      main.preload = 'auto'
      companion.preload = 'auto'
      main.width = media.desktop.width
      main.height = media.desktop.height
      companion.width = media.phone.width
      companion.height = media.phone.height
      main.src = media.desktop.src
      companion.src = media.phone.src
      main.load()
      companion.load()
    }
    // Once, when the pair can play in view: the muted movie starts by itself.
    const start = () => {
      if (!autoplay || !visible || document.hidden || main.readyState < 3 || companion.readyState < 3) return
      autoplay = false
      void main.play().catch(() => undefined)
    }
    const onPlay = () => { align(true); companion.playbackRate = main.playbackRate; follow() }
    const onPause = () => companion.pause()
    const onSeeking = () => { companion.pause(); align(true); focus() }
    const onRate = () => { companion.playbackRate = main.playbackRate }
    const onTime = () => { focus(); align() }
    const onError = () => { setError(true) }
    const onVisibility = () => {
      if (document.hidden) {
        if (!main.paused) { resumeWhenVisible = true; main.pause() }
      } else if (resumeWhenVisible) {
        resumeWhenVisible = false
        if (visible) void main.play().catch(() => undefined)
      } else start()
    }
    const onMotion = () => { if (reducedMotion.matches || connection?.saveData) { autoplay = false; main.pause() } }
    main.addEventListener('play', onPlay)
    main.addEventListener('playing', follow)
    main.addEventListener('pause', onPause)
    main.addEventListener('waiting', onPause)
    main.addEventListener('seeking', onSeeking)
    main.addEventListener('seeked', follow)
    main.addEventListener('ratechange', onRate)
    main.addEventListener('ended', onPause)
    main.addEventListener('timeupdate', onTime)
    main.addEventListener('canplay', start)
    companion.addEventListener('canplay', start)
    companion.addEventListener('canplay', follow)
    main.addEventListener('error', onError)
    companion.addEventListener('error', onError)
    document.addEventListener('visibilitychange', onVisibility)
    reducedMotion.addEventListener('change', onMotion)
    connection?.addEventListener('change', onMotion)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25
      if (entry.isIntersecting) void load()
      if (visible) {
        if (resumeWhenVisible) { resumeWhenVisible = false; void main.play().catch(() => undefined) }
        else start()
      } else if (!main.paused) {
        resumeWhenVisible = true
        main.pause()
      }
    }, { threshold: [0, 0.25] })
    observer.observe(stage.current!)
    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      reducedMotion.removeEventListener('change', onMotion)
      connection?.removeEventListener('change', onMotion)
      main.removeEventListener('play', onPlay)
      main.removeEventListener('playing', follow)
      main.removeEventListener('pause', onPause)
      main.removeEventListener('waiting', onPause)
      main.removeEventListener('seeking', onSeeking)
      main.removeEventListener('seeked', follow)
      main.removeEventListener('ratechange', onRate)
      main.removeEventListener('ended', onPause)
      main.removeEventListener('timeupdate', onTime)
      main.removeEventListener('canplay', start)
      companion.removeEventListener('canplay', start)
      companion.removeEventListener('canplay', follow)
      main.removeEventListener('error', onError)
      companion.removeEventListener('error', onError)
      main.pause()
      companion.pause()
      main.removeAttribute('src')
      companion.removeAttribute('src')
      main.load()
      companion.load()
    }
  }, [])

  return (
    <figure ref={stage} className="one-demo" aria-label="Happy Desktop and iPhone, one synchronized session">
      <div className="one-demo-stage" data-phone-focus={phoneFocused ? '' : undefined}>
        <div className="one-demo-desktop">
          <div className="one-demo-window">
            <video ref={desktop} poster={`${MEDIA}/desktop-poster.webp`} width="1950" height="1660"
              controls muted playsInline preload="none" disablePictureInPicture
              controlsList="nodownload noremoteplayback"
              aria-label="Switch from Astra to Fable, edit the waveform, spawn Astra, then Steve ships it from iPhone" />
            <MacWindowLights />
          </div>
        </div>
        <HappyOnePhone video={phone} />
      </div>
      {error && <p className="one-demo-error" role="status">The demo couldn’t load. <a href={`${MEDIA}/desktop.mp4`}>Open the video</a>.</p>}
    </figure>
  )
}
