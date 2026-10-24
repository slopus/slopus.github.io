import { useEffect, useRef } from 'react'

/**
 * A short captionless clip that rests on its last frame and plays once, to the end, when the
 * reader hovers it or anywhere in its section; hovering again replays it. Where nothing hovers
 * (a phone), it plays each time it scrolls into view. A docs image whose src is a folder is one:
 * `![alt](/video/<name>/)` plays clip.mov (HEVC with alpha) in Safari or clip.webm (VP9 with
 * alpha) elsewhere, over poster.png, its last frame, on the page itself.
 */
export function HoverClip({ folder, label }: { folder: string; label: string }) {
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const clip = video.current
    if (!clip) return
    const replay = () => {
      if (!clip.paused && !clip.ended) return
      clip.currentTime = 0
      void clip.play().catch(() => undefined)
    }

    if (window.matchMedia?.('(hover: none)').matches) {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) replay()
      }, { threshold: 0.6 })
      observer.observe(clip)
      return () => observer.disconnect()
    }

    // The clip's section: from the h2 above it to the next one. Hovering any of it counts.
    const root = clip.closest('.document-content')
    const blockOf = (node: Element | null) => {
      while (node && node.parentElement !== root) node = node.parentElement
      return node
    }
    const headingOf = (block: Element | null) => {
      while (block && block.tagName !== 'H2') block = block.previousElementSibling
      return block
    }
    const heading = headingOf(blockOf(clip))
    if (!root) return
    let inside = false
    const over = (event: Event) => {
      const here = event.target === clip || headingOf(blockOf(event.target as Element)) === heading
      if (here && !inside) replay()
      inside = here
    }
    const leave = () => { inside = false }
    root.addEventListener('mouseover', over)
    root.addEventListener('mouseleave', leave)
    return () => {
      root.removeEventListener('mouseover', over)
      root.removeEventListener('mouseleave', leave)
    }
  }, [])

  // The served markup carries `muted`; a DOM that doesn't turn it into the property (jsdom)
  // would otherwise report a mismatch.
  return (
    <video ref={video} className="hover-clip" poster={`${folder}poster.png`} muted playsInline preload="metadata" aria-label={label} suppressHydrationWarning>
      {/* Safari first: it also plays the WebM, but drops its alpha and draws a black box.
          Chrome and Firefox play no QuickTime, so they skip to the WebM. */}
      <source src={`${folder}clip.mov`} type='video/quicktime; codecs="hvc1"' />
      <source src={`${folder}clip.webm`} type="video/webm" />
    </video>
  )
}
