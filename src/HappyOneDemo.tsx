import { useEffect, useRef, useState } from 'react'
import { HappyOnePhone } from './HappyOnePhone'
import { happyOneDemoMediaSelect } from './happyOneDemoMedia'
import { useRevealedControls } from './revealedControls'
import './happy-one-demo.css'

const MEDIA = '/video/happy-one/v36-split'
// v36-team-r13 cues on the composed cut's 60fps clock, which both movies share.
const FPS = 60
const PHONE_ENTER = 2343
const PHONE_EXIT = 3644
const HINT_FROM = 2398
const HINT_TO = 2518
// The composed cut's captions; *word* is the accent.
const CAPTIONS: readonly (readonly [number, string])[] = [
  [0, 'Any model: Claude, Codex, Grok, Gemini, and more'],
  [196, 'All new work starts with a *stem cell*'],
  [370, 'Just say what you want done'],
  [634, 'It *names itself*'],
  [795, 'grows *its own icon*'],
  [1058, '*Sidebar self-organizes*'],
  [1183, 'Then it gets to work'],
  [1591, 'and *shows you* a live preview'],
  [1863, 'It loops in *Steve*, our design expert'],
  [2343, 'Happy supports *teams*: people join only the work they care about'],
  [2744, 'Steve answers *from his phone*'],
  [3236, 'The agent *fixes it*'],
  [3644, 'and *ships it*'],
  [3976, 'Finished work *archives itself*. It no longer needs your attention.'],
  [4325, '*Stem cells* for you and your team.'],
  [4557, '*Go divide and conquer* :D'],
]

type Beat = { caption: number, focused: boolean, hint: boolean }
function beatAt(seconds: number): Beat {
  const frame = seconds * FPS
  let caption = 0
  while (caption + 1 < CAPTIONS.length && CAPTIONS[caption + 1][0] <= frame) caption += 1
  return { caption, focused: frame >= PHONE_ENTER && frame < PHONE_EXIT, hint: frame >= HINT_FROM && frame < HINT_TO }
}

function markup(text: string) {
  return text.split(/\*([^*]+)\*/).map((part, index) => index % 2 ? <em key={index}>{part}</em> : part)
}

type DataConnection = EventTarget & { saveData?: boolean }
function dataConnection() {
  return (navigator as Navigator & { connection?: DataConnection }).connection
}

/**
 * The recorded Mac window with the browser's own video controls, the cut's captions above it,
 * and the phone that follows it. The desktop movie is the clock: its play, pause, seek, and
 * rate drive the phone movie, so scrubbing keeps the pair on one clock, and the captions and
 * the phone's focus follow it too. The pair loops. Autoplay starts without browser chrome
 * covering the opening. Deliberate pointer/keyboard interaction reveals the ordinary native
 * controls; reduced motion, save-data, and blocked autoplay also make them available.
 */
export function HappyOneDemo() {
  const stage = useRef<HTMLElement>(null)
  const desktop = useRef<HTMLVideoElement>(null)
  const phone = useRef<HTMLVideoElement>(null)
  const [beat, setBeat] = useState<Beat>(() => beatAt(0))
  const [error, setError] = useState(false)
  const { revealControls, videoProps } = useRevealedControls()

  useEffect(() => {
    const main = desktop.current!
    const companion = phone.current!
    // Muted here, not as a prop: the prerendered markup cannot carry it, and hydration would
    // leave both movies unmuted, which blocks autoplay.
    main.muted = true
    companion.muted = true
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    const connection = dataConnection()
    let autoplay = !reducedMotion.matches && !connection?.saveData
    if (!autoplay) revealControls()
    let visible = false
    let loaded = false
    let disposed = false
    let resumeWhenVisible = false
    let frameRequest = 0

    const sync = () => {
      const next = beatAt(main.currentTime)
      setBeat(beat => beat.caption === next.caption && beat.focused === next.focused && beat.hint === next.hint ? beat : next)
    }
    // Captions change on the frame, not on the coarse timeupdate.
    const tick = () => {
      sync()
      frameRequest = main.paused ? 0 : requestAnimationFrame(tick)
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
      void main.play().catch(() => { if (!disposed) revealControls() })
    }
    const onPlay = () => {
      align(true)
      companion.playbackRate = main.playbackRate
      follow()
      if (!frameRequest) frameRequest = requestAnimationFrame(tick)
    }
    const onPause = () => companion.pause()
    // Looping seeks the desktop back to the start, which brings the phone along.
    const onSeeking = () => { companion.pause(); align(true); sync() }
    const onRate = () => { companion.playbackRate = main.playbackRate }
    const onTime = () => { sync(); align() }
    const onError = () => { setError(true) }
    const onVisibility = () => {
      if (document.hidden) {
        if (!main.paused) { resumeWhenVisible = true; main.pause() }
      } else if (resumeWhenVisible) {
        resumeWhenVisible = false
        if (visible) void main.play().catch(() => undefined)
      } else start()
    }
    const onMotion = () => { if (reducedMotion.matches || connection?.saveData) { autoplay = false; main.pause(); revealControls() } }
    main.addEventListener('play', onPlay)
    main.addEventListener('playing', follow)
    main.addEventListener('pause', onPause)
    main.addEventListener('waiting', onPause)
    main.addEventListener('seeking', onSeeking)
    main.addEventListener('seeked', follow)
    main.addEventListener('ratechange', onRate)
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
      cancelAnimationFrame(frameRequest)
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
    <figure ref={stage} className="one-demo" aria-label="Desktop and iPhone, one synchronized session">
      <div className="one-demo-stage" data-phone-focus={beat.focused ? '' : undefined}>
        <p className="one-demo-caption" aria-hidden="true">
          {CAPTIONS.map(([, text], index) => (
            <span key={index} data-shown={index === beat.caption ? '' : undefined}>{markup(text)}</span>
          ))}
        </p>
        <div className="one-demo-desktop">
          <div className="one-demo-window">
            <video ref={desktop} poster={`${MEDIA}/desktop-poster.webp`} width="2200" height="1500"
              {...videoProps} loop playsInline preload="none"
              aria-label="Happy Desktop opens on the model list and picks Opus. A new chat starts as a stem cell, names itself and grows its icon, and the sidebar self-organizes. The agent loops in @Steve, who asks from his phone to make it narrower and ship it, and the agent fixes it and ships. The finished task archives itself on both screens. It ends on a new stem cell: “Stem cells for you and your team. Go divide and conquer :D”" />
          </div>
        </div>
        <HappyOnePhone video={phone} poster={`${MEDIA}/phone-poster.webp`} hint={beat.hint} />
      </div>
      {error && <p className="one-demo-error" role="status">The demo couldn’t load. <a href={`${MEDIA}/desktop.mp4`}>Open the video</a>.</p>}
    </figure>
  )
}
