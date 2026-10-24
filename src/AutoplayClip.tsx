import { useEffect, useRef } from 'react'
import { useRevealedControls } from './revealedControls'

/**
 * A silent recording that loops while it is on screen, scrubbable like the homepage demo: the
 * browser's controls appear once the reader reaches for it (src/revealedControls.ts). It plays
 * once 30% of it is in view and pauses only when less than 10% is, resuming where it was, unless
 * the reader paused it themselves. A docs image whose src is a folder and whose title is "autoplay" is one:
 * `![alt](/video/<name>/ "autoplay")` plays clip.mp4 over poster.webp, its first frame.
 *
 * It has no autoplay attribute: Chrome pauses such a video by itself when it scrolls away or the
 * tab hides, and those pauses read as the reader's. Window focus changes nothing.
 */
export function AutoplayClip({ folder, label }: { folder: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const { revealControls, videoProps } = useRevealedControls()
  useEffect(() => {
    const clip = video.current
    if (!clip || typeof IntersectionObserver === 'undefined') return
    // Muted here too: the prerendered markup can't carry it, and an unmuted movie can't start itself.
    clip.muted = true
    let ratio = 0
    let ownPause = false
    let readerPaused = false
    // The reader's last click, tap or key on the clip or its controls.
    let touched = -Infinity
    const play = () => { if (!readerPaused && !document.hidden && ratio >= 0.3 && clip.paused) void clip.play().catch(revealControls) }
    // A pause is the reader's only right after they reached for the clip; any other pause in view
    // (the browser's, a focus change) is undone. The pause event comes a task after pause(), so it
    // clears ownPause itself.
    const onPause = () => {
      if (ownPause) ownPause = false
      else if (performance.now() - touched < 1000) readerPaused = true
      else play()
    }
    const onPlay = () => { readerPaused = false }
    const onTouch = () => { touched = performance.now() }
    const onVisibility = () => { if (!document.hidden) play() }
    clip.addEventListener('pause', onPause)
    clip.addEventListener('play', onPlay)
    clip.addEventListener('pointerdown', onTouch)
    clip.addEventListener('keydown', onTouch)
    document.addEventListener('visibilitychange', onVisibility)
    const observer = new IntersectionObserver(([entry]) => {
      ratio = entry.isIntersecting ? entry.intersectionRatio : 0
      if (ratio >= 0.3) play()
      else if (ratio < 0.1 && !clip.paused) { ownPause = true; clip.pause() }
    }, { threshold: [0, 0.1, 0.3] })
    observer.observe(clip)
    return () => {
      observer.disconnect()
      clip.removeEventListener('pause', onPause)
      clip.removeEventListener('play', onPlay)
      clip.removeEventListener('pointerdown', onTouch)
      clip.removeEventListener('keydown', onTouch)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [revealControls])
  // The served markup carries `muted`; a DOM that doesn't turn that attribute into the `muted`
  // property (jsdom) would otherwise report a mismatch.
  return (
    <video ref={video} className="autoplay-clip" src={`${folder}clip.mp4`} poster={`${folder}poster.webp`} muted loop playsInline preload="metadata" aria-label={label} suppressHydrationWarning {...videoProps} />
  )
}
