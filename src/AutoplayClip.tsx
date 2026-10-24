import { useEffect, useRef } from 'react'

/**
 * A silent recording that loops while it is on screen. A docs image whose src is a folder and
 * whose title is "autoplay" is one: `![alt](/video/<name>/ "autoplay")` plays clip.mp4 over
 * poster.webp, its first frame.
 */
export function AutoplayClip({ folder, label }: { folder: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const clip = video.current
    if (!clip || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) void clip.play().catch(() => undefined)
      else clip.pause()
    }, { threshold: 0.25 })
    observer.observe(clip)
    return () => observer.disconnect()
  }, [])
  // The served markup carries `muted`; a DOM that doesn't turn that attribute into the `muted`
  // property (jsdom) would otherwise report a mismatch.
  return (
    <video ref={video} className="autoplay-clip" src={`${folder}clip.mp4`} poster={`${folder}poster.webp`} autoPlay muted loop playsInline preload="metadata" aria-label={label} suppressHydrationWarning />
  )
}
