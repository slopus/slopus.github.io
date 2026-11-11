import { useEffect, useRef, useState } from 'react'

/**
 * A section's picture: a still frame from the page's video, taken where the camera has settled on
 * that section's part of the app, backdrop and all, so it needs no framing of its own. A docs image
 * whose src is a folder and whose title is "frame" is one: `![alt](/video/<name>/ "frame")` shows
 * wide.webp (16:9), and square.webp, the same moment from the video's square cut, on a phone.
 *
 * Titled "frame loop", the video's own frames for that section play over each still, wide.mp4 and
 * square.mp4. Nothing here costs the first load: the stills are lazy, a recording has
 * `preload="none"` and no poster, and the one not shown at this width is never fetched. It plays
 * while 30% of it is in view and stops when less than 10% is. With reduced motion or Save-Data it
 * stays the still until the reader presses play.
 */
export function StopFrame({ folder, label, loop }: { folder: string; label: string; loop: boolean }) {
  const root = useRef<HTMLSpanElement>(null)
  const [paused, setPaused] = useState(false)
  const wanted = useRef(false)
  const apply = useRef<() => void>(() => {})

  useEffect(() => {
    const element = root.current
    if (!loop || !element || typeof IntersectionObserver === 'undefined') return
    const movies = [...element.querySelectorAll('video')]
    // Muted here too: the prerendered markup can't carry it, and an unmuted movie can't start itself.
    for (const movie of movies) movie.muted = true
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || connection?.saveData === true) {
      wanted.current = true
      setPaused(true)
    }
    let ratio = 0
    apply.current = () => {
      const run = !wanted.current && !document.hidden && ratio >= 0.3
      for (const movie of movies) {
        // Only the one that is drawn at this width.
        const shown = movie.getClientRects().length > 0
        if (run && shown) { if (movie.paused) void movie.play().catch(() => {}) }
        else if (!movie.paused && (!shown || wanted.current || document.hidden || ratio < 0.1)) movie.pause()
      }
    }
    const onChange = () => apply.current()
    document.addEventListener('visibilitychange', onChange)
    window.addEventListener('resize', onChange)
    const observer = new IntersectionObserver(([entry]) => {
      ratio = entry.isIntersecting ? entry.intersectionRatio : 0
      apply.current()
    }, { threshold: [0, 0.1, 0.3] })
    observer.observe(element)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [folder, loop])

  const toggle = () => {
    wanted.current = !wanted.current
    setPaused(wanted.current)
    apply.current()
  }
  // The still shows through its recording until the recording has a frame.
  const part = (name: 'wide' | 'square') => (
    <span className={`stop-frame-${name}`}>
      <img src={`${folder}${name}.webp`} alt={label} loading="lazy" decoding="async" />
      {loop && <video src={`${folder}${name}.mp4`} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} suppressHydrationWarning />}
    </span>
  )
  return (
    <span ref={root} className="stop-frame" data-loop={loop || undefined} data-paused={paused || undefined} onClick={loop ? toggle : undefined}>
      {part('wide')}
      {part('square')}
      {loop && (
        <button type="button" className="stop-frame-toggle" aria-label={paused ? 'Play the recording' : 'Pause the recording'} onClick={(event) => { event.stopPropagation(); toggle() }}>
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">{paused ? <path d="M4 2.5v11l9-5.5z" fill="currentColor" /> : <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" fill="currentColor" />}</svg>
        </button>
      )}
    </span>
  )
}
