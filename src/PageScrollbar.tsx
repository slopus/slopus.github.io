import { useEffect, useRef } from 'react'

/*
 * A custom-painted scrollbar for the page itself, following the same rule as
 * Happy Desktop: the browser keeps ownership of scrolling, only its chrome is
 * hidden. A native page scrollbar reserves a gutter, so full-bleed bands stop
 * short of the window edge; this one floats over them instead.
 */

const IDLE_MS = 1200
const MIN_THUMB = 28

export function PageScrollbar() {
  const trackRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return
    const root = document.documentElement
    const scroller = document.scrollingElement ?? root

    let idleTimer: number | undefined
    let dragging = false
    let grabOffset = 0

    const metrics = () => {
      const viewport = root.clientHeight
      const extent = scroller.scrollHeight
      const trackLength = track.clientHeight
      const thumbLength = Math.min(
        trackLength,
        Math.max(MIN_THUMB, extent > 0 ? (trackLength * viewport) / extent : trackLength),
      )
      return { maximum: extent - viewport, thumbLength, travel: trackLength - thumbLength }
    }

    const update = () => {
      const { maximum, thumbLength, travel } = metrics()
      track.toggleAttribute('data-overflow', maximum > 0.5)
      if (maximum <= 0.5) return
      thumb.style.height = `${thumbLength}px`
      thumb.style.transform = `translateY(${travel * (scroller.scrollTop / maximum)}px)`
    }

    const rest = () => {
      if (dragging) return
      track.removeAttribute('data-active')
    }

    const wake = () => {
      track.setAttribute('data-active', '')
      if (idleTimer !== undefined) window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(rest, IDLE_MS)
    }

    const scrollToPointer = (clientY: number) => {
      const { maximum, travel } = metrics()
      if (travel <= 0 || maximum <= 0) return
      const ratio = (clientY - track.getBoundingClientRect().top - grabOffset) / travel
      scroller.scrollTop = Math.max(0, Math.min(1, ratio)) * maximum
    }

    const onScroll = () => {
      update()
      wake()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      const { maximum, travel } = metrics()
      if (maximum <= 0.5 || travel <= 0) return
      const bounds = thumb.getBoundingClientRect()
      grabOffset =
        event.clientY >= bounds.top && event.clientY <= bounds.bottom
          ? event.clientY - bounds.top
          : bounds.height / 2
      dragging = true
      // Smooth scrolling turns a drag into a lagging animation.
      root.setAttribute('data-scrollbar-dragging', '')
      track.setPointerCapture(event.pointerId)
      wake()
      scrollToPointer(event.clientY)
      event.preventDefault()
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      wake()
      scrollToPointer(event.clientY)
    }

    const onPointerEnd = (event: PointerEvent) => {
      if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId)
      if (!dragging) return
      dragging = false
      root.removeAttribute('data-scrollbar-dragging')
      wake()
    }

    const resize = new ResizeObserver(update)
    resize.observe(document.body)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', update)
    track.addEventListener('pointerenter', wake)
    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointermove', onPointerMove)
    track.addEventListener('pointerup', onPointerEnd)
    track.addEventListener('pointercancel', onPointerEnd)
    update()

    return () => {
      resize.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', update)
      track.removeEventListener('pointerenter', wake)
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup', onPointerEnd)
      track.removeEventListener('pointercancel', onPointerEnd)
      if (idleTimer !== undefined) window.clearTimeout(idleTimer)
      root.removeAttribute('data-scrollbar-dragging')
    }
  }, [])

  return (
    <div className="one-scrollbar" aria-hidden="true" ref={trackRef}>
      <div className="one-scrollbar-thumb" ref={thumbRef} />
    </div>
  )
}
