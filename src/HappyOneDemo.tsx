import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { HappyOnePhone } from './HappyOnePhone'
import { happyOneDemoCaptions } from './happyOneDemoCaptions'
import { happyOneDemoMediaSelect } from './happyOneDemoMedia'
import './happy-one-demo.css'

const MEDIA = '/video/happy-one/v13'
// Recording cues, measured against the common desktop/phone timeline.
const PHONE_ENTER = 1843 / 60
const PHONE_EXIT = 2892 / 60

function timestamp(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

const mobileQuery = '(max-width: 700px)'
function subscribeLayout(notify: () => void) {
  const query = matchMedia(mobileQuery)
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}

export function HappyOneDemo() {
  const mobile = useSyncExternalStore(subscribeLayout, () => matchMedia(mobileQuery).matches, () => true)
  // A separate lifetime, not hidden videos: mobile never requests movie sources.
  return mobile ? <HappyOneStill /> : <HappyOnePlayback />
}

function HappyOneStill() {
  return <figure className="one-demo one-demo-still">
    <a className="one-still-composition" href="/video/happy-one/v16/mobile-desktop.webp"
      target="_blank" rel="noopener noreferrer" aria-label="Open the Happy interface screenshot at full size in a new tab"
      aria-describedby="one-still-description">
      <img className="one-still-desktop" src="/video/happy-one/v16/mobile-desktop.webp"
        width="2100" height="1660" alt="Happy’s project sidebar, a completed code edit, and model picker with Fable 5.1 above Opus." />
      <span className="one-still-phone" aria-hidden="true">
        <img className="one-still-phone-screen" src="/video/happy-one/v16/phone-home.webp" width="1206" height="2622" alt="" />
        <img src="/video/happy-one/device/iphone-16-pro-black.png" width="1406" height="2822" alt="" />
      </span>
    </a>
    <figcaption id="one-still-description" className="one-still-description">
      Fable builds the waveform. Astra reviews. Grok researches X.<br />
      Pick up the same session on your end-to-end encrypted mobile app.
      <span className="one-still-hint">Tap the screenshot for a closer look.</span>
    </figcaption>
  </figure>
}

function HappyOnePlayback() {
  const stage = useRef<HTMLElement>(null)
  const desktop = useRef<HTMLVideoElement>(null)
  const phone = useRef<HTMLVideoElement>(null)
  const controls = useRef({ toggle: () => {}, seek: (_time: number) => {} })
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)

  useEffect(() => {
    const main = desktop.current!
    const companion = phone.current!
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    let wanted = !reducedMotion.matches && !connection?.saveData
    let visible = false
    let loaded = false
    let disposed = false
    let starting = false

    const pause = () => { main.pause(); companion.pause() }
    const load = async () => {
      if (loaded) return
      loaded = true
      const media = await happyOneDemoMediaSelect()
      if (disposed) return
      // Fetch only at this lazy boundary, but allow canplay to arrive before
      // resume waits for both members of the synchronized pair.
      main.preload = 'auto'
      companion.preload = 'auto'
      main.src = media.desktop
      companion.src = media.phone
      main.load()
      companion.load()
    }
    const align = (force = false) => {
      if (companion.readyState < 1) return
      if (force || Math.abs(companion.currentTime - main.currentTime) > 0.12) companion.currentTime = main.currentTime
    }
    const resume = async () => {
      if (disposed || starting || !wanted || !visible || document.hidden || main.ended) return
      if (main.seeking || companion.seeking || main.readyState < 3 || companion.readyState < 3) return
      align()
      if (companion.seeking) return
      starting = true
      try {
        await Promise.all([companion.play(), main.play()])
      } catch {
        // Autoplay policy may require a click. Keep the pair together.
        pause()
      } finally {
        starting = false
        if (disposed || !wanted || !visible || document.hidden) pause()
      }
    }
    const update = () => { setTime(main.currentTime); align() }
    const metadata = () => setDuration(Number.isFinite(main.duration) ? main.duration : 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onSeeking = () => { pause(); align(true); update() }
    const onEnded = () => { wanted = false; pause(); update() }
    const onError = () => { wanted = false; pause(); setError(true) }
    const onVisibility = () => { if (document.hidden) pause(); else void resume() }
    const onMotion = () => { if (reducedMotion.matches) { wanted = false; pause() } }
    main.addEventListener('timeupdate', update)
    main.addEventListener('loadedmetadata', metadata)
    main.addEventListener('play', onPlay)
    main.addEventListener('pause', onPause)
    main.addEventListener('seeking', onSeeking)
    main.addEventListener('ended', onEnded)
    for (const video of [main, companion]) {
      video.addEventListener('waiting', pause)
      video.addEventListener('canplay', resume)
      video.addEventListener('seeked', resume)
      video.addEventListener('error', onError)
    }
    document.addEventListener('visibilitychange', onVisibility)
    reducedMotion.addEventListener('change', onMotion)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25
      if (entry.isIntersecting) void load()
      if (visible) void resume()
      else pause()
    }, { threshold: [0, 0.25] })
    observer.observe(stage.current!)
    controls.current = {
      toggle: () => {
        wanted = main.paused
        if (!wanted) { pause(); return }
        void load()
        // Seeking to the end while paused need not set the browser's ended flag.
        if (main.ended || main.currentTime >= main.duration) { main.currentTime = 0; align(true) }
        void resume()
      },
      seek: value => {
        void load()
        if (main.readyState < 1) return
        // A controlled range must accept its value in the input event itself.
        // Waiting for timeupdate restores the old value between native input
        // and change events, which can undo keyboard End/Home seeking.
        setTime(value)
        main.currentTime = value
      },
    }
    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      reducedMotion.removeEventListener('change', onMotion)
      main.removeEventListener('timeupdate', update)
      main.removeEventListener('loadedmetadata', metadata)
      main.removeEventListener('play', onPlay)
      main.removeEventListener('pause', onPause)
      main.removeEventListener('seeking', onSeeking)
      main.removeEventListener('ended', onEnded)
      for (const video of [main, companion]) {
        video.removeEventListener('waiting', pause)
        video.removeEventListener('canplay', resume)
        video.removeEventListener('seeked', resume)
        video.removeEventListener('error', onError)
      }
      pause()
      main.removeAttribute('src')
      companion.removeAttribute('src')
      main.load()
      companion.load()
    }
  }, [])

  const phoneFocused = time >= PHONE_ENTER && time < PHONE_EXIT
  const caption = happyOneDemoCaptions.find(cue => time >= cue.start && time < cue.end)?.text

  return (
    <figure ref={stage} className="one-demo" aria-label="Happy Desktop and iPhone, one synchronized session">
      <div className="one-demo-stage" data-phone-focus={phoneFocused ? '' : undefined}>
        <div className="one-demo-desktop">
          <video ref={desktop} poster="/video/happy-one/v15/desktop-poster.webp" width="2560" height="1440"
            muted={muted} playsInline preload="none" aria-label="Switch from Astra to Fable, collaborate with Steve, delegate to Grok, then continue on iPhone" />
        </div>
        <HappyOnePhone video={phone} />
      </div>
      <p className="one-demo-caption">{caption && <span>{caption}</span>}</p>
      <figcaption className="one-demo-controls">
        <button type="button" onClick={() => controls.current.toggle()}>{playing ? 'Pause' : time >= duration && duration > 0 ? 'Replay' : 'Play'}</button>
        <input type="range" min="0" max={duration || 1} step="0.05" value={time} disabled={!duration}
          aria-label="Demo playback position" aria-valuetext={`${timestamp(time)} of ${timestamp(duration)}`}
          onChange={event => controls.current.seek(Number(event.currentTarget.value))} />
        <span className="one-demo-time">{timestamp(time)} / {timestamp(duration)}</span>
        <button type="button" aria-label={muted ? 'Unmute demo' : 'Mute demo'} onClick={() => setMuted(value => !value)}>{muted ? 'Sound off' : 'Sound on'}</button>
      </figcaption>
      {error && <p className="one-demo-error" role="status">The demo couldn’t load. <a href={`${MEDIA}/desktop.mp4`}>Open the video</a>.</p>}
    </figure>
  )
}