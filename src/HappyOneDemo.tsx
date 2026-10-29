import { useEffect, useRef, useState } from 'react'
import { useRevealedControls } from './revealedControls'
import './happy-one-demo.css'

const MEDIA = '/video/happy-one/v40'

type DataConnection = EventTarget & { saveData?: boolean }
function dataConnection() {
  return (navigator as Navigator & { connection?: DataConnection }).connection
}

/**
 * The recorded take: the Mac window and Steve's phone, composed into one movie.
 * It loops muted while in view, without browser chrome covering it. Deliberate
 * pointer/keyboard interaction reveals the ordinary native controls; reduced
 * motion, save-data, and blocked autoplay leave it paused on its poster with them.
 */
export function HappyOneDemo() {
  const stage = useRef<HTMLElement>(null)
  const movie = useRef<HTMLVideoElement>(null)
  // A failed load reports on the last <source> the browser tried, not on the video.
  const fallback = useRef<HTMLSourceElement>(null)
  const [error, setError] = useState(false)
  const { revealControls, videoProps } = useRevealedControls()

  useEffect(() => {
    const video = movie.current!
    const lastSource = fallback.current!
    // Muted here, not as a prop: the prerendered markup cannot carry it, and hydration would
    // leave the movie unmuted, which blocks autoplay.
    video.muted = true
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')
    const connection = dataConnection()
    let autoplay = !reducedMotion.matches && !connection?.saveData
    if (!autoplay) revealControls()
    let visible = false
    let disposed = false
    // Pausing for the viewport or a hidden tab resumes; a visitor's own pause stays paused.
    let holding = false
    let resume = false

    const play = () => {
      if (!(autoplay || resume) || !visible || document.hidden) return
      resume = false
      void video.play().catch(() => {
        if (disposed) return
        autoplay = false
        revealControls()
      })
    }
    const hold = () => {
      if (video.paused) return
      holding = true
      video.pause()
    }
    const onPause = () => {
      if (holding) resume = true
      else autoplay = resume = false
      holding = false
    }
    const onError = () => setError(true)
    const onVisibility = () => { if (document.hidden) hold(); else play() }
    const onMotion = () => {
      if (reducedMotion.matches || connection?.saveData) { autoplay = false; video.pause(); revealControls() }
    }
    video.addEventListener('pause', onPause)
    lastSource.addEventListener('error', onError)
    document.addEventListener('visibilitychange', onVisibility)
    reducedMotion.addEventListener('change', onMotion)
    connection?.addEventListener('change', onMotion)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25
      if (visible) play()
      else hold()
    }, { threshold: [0, 0.25] })
    observer.observe(stage.current!)
    return () => {
      disposed = true
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      reducedMotion.removeEventListener('change', onMotion)
      connection?.removeEventListener('change', onMotion)
      video.removeEventListener('pause', onPause)
      lastSource.removeEventListener('error', onError)
      video.pause()
    }
  }, [])

  return (
    <figure ref={stage} className="one-demo">
      <div className="one-demo-stage">
        <div className="one-demo-frame">
          <video ref={movie} poster={`${MEDIA}/poster.webp`} width="1618" height="1000"
            {...videoProps} loop playsInline preload="metadata"
            aria-label="Happy Desktop opens on the model list and picks Opus. A new chat starts as a stem cell, names itself and grows its icon, and the sidebar self-organizes. The agent loops in @Steve, who asks from his phone to make it narrower and ship it, and the agent fixes it and ships. The finished task archives itself and stays readable. Create divides Happy into a new stem cell, then “Stem cells for you and your team. Go divide and conquer :D”">
            <source src={`${MEDIA}/demo.webm`} type="video/webm; codecs=av01.0.08M.08, opus" />
            <source ref={fallback} src={`${MEDIA}/demo.mp4`} type="video/mp4" />
          </video>
        </div>
      </div>
      {error && <p className="one-demo-error" role="status">The demo couldn’t load. <a href={`${MEDIA}/demo.mp4`}>Open the video</a>.</p>}
    </figure>
  )
}
