import { useEffect, useRef, useState } from 'react'
import { HappyOnePhone } from './HappyOnePhone'
import { happyOneDemoCaptions } from './happyOneDemoCaptions'
import './happy-one-demo.css'

const MEDIA = '/video/happy-one/v13'
// Recording cues, measured against the common desktop/phone timeline.
const PHONE_ENTER = 1843 / 60
const PHONE_EXIT = 2892 / 60

function timestamp(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

export function HappyOneDemo() {
  const stage = useRef<HTMLElement>(null)
  const desktop = useRef<HTMLVideoElement>(null)
  const phone = useRef<HTMLVideoElement>(null)
  const controls = useRef({ toggle: () => {}, seek: (_time: number) => {} })
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [inspecting, setInspecting] = useState(false)
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
    const load = () => {
      if (loaded) return
      loaded = true
      main.src = '/video/happy-one/v14/desktop.mp4'
      companion.src = `${MEDIA}/phone.mp4`
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
      if (entry.isIntersecting) load()
      if (visible) void resume()
      else pause()
    }, { threshold: [0, 0.25] })
    observer.observe(stage.current!)
    controls.current = {
      toggle: () => {
        wanted = main.paused
        if (!wanted) { pause(); return }
        load()
        if (main.ended) { main.currentTime = 0; align(true) }
        void resume()
      },
      seek: value => { load(); if (main.readyState >= 1) main.currentTime = value },
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

  const phoneFocused = (time >= PHONE_ENTER && time < PHONE_EXIT) || inspecting
  const caption = happyOneDemoCaptions.find(cue => time >= cue.start && time < cue.end)?.text

  return (
    <figure ref={stage} className="one-demo" aria-label="Happy Desktop and iPhone, one synchronized session">
      <div className="one-demo-stage" data-phone-focus={phoneFocused ? '' : undefined}>
        <div className="one-demo-desktop">
          <video ref={desktop} poster="/video/happy-one/v14/desktop-poster.webp" width="1920" height="1080"
            muted={muted} playsInline preload="none" aria-label="Happy Desktop demo with subtitles" />
        </div>
        <HappyOnePhone video={phone} focused={phoneFocused} inspecting={inspecting} inspect={() => setInspecting(value => !value)} />
        <p className="one-demo-caption" aria-label="Demo subtitle">{caption && <span>{caption}</span>}</p>
      </div>
      <figcaption className="one-demo-controls">
        <button type="button" onClick={() => controls.current.toggle()}>{playing ? 'Pause' : time >= duration && duration > 0 ? 'Replay' : 'Play'}</button>
        <input type="range" min="0" max={duration || 1} step="0.05" value={time} disabled={!duration}
          aria-label="Demo playback position" aria-valuetext={`${timestamp(time)} of ${timestamp(duration)}`}
          onChange={event => controls.current.seek(Number(event.currentTarget.value))} />
        <span className="one-demo-time">{timestamp(time)} / {timestamp(duration)}</span>
        <button type="button" aria-label={muted ? 'Unmute demo' : 'Mute demo'} onClick={() => setMuted(value => !value)}>{muted ? 'Sound off' : 'Sound on'}</button>
      </figcaption>
      <p className="one-demo-credits"><a href="/video/happy-one/device/CREDITS.txt" target="_blank" rel="noopener noreferrer">Device artwork credits</a></p>
      {error && <p className="one-demo-error" role="status">The demo couldn’t load. <a href={`${MEDIA}/desktop.mp4`}>Open the video</a>.</p>}
    </figure>
  )
}