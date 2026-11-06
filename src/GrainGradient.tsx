import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { sparing } from './connection'
import { grainGradientRenderer, PHONE, type Surface } from './grainGradientRenderer'
import './grain-gradient.css'

/**
 * Where the colour goes. Wide: a few big, slow swells down both sides, a large patch in the top
 * right, and one in the bottom left at the page's end, under the footer. Phones keep it out of
 * the content: the top right, and the bottom left at the footer.
 */
export const HOME_SURFACE: Surface = {
  wide: { sides: [.34, .58, .34, .58], ends: [0, 0, 0, 0], corners: [0, 580, 500, 0], calm: 400, wavelength: 1100 },
  phone: { topRight: 512, bottomLeft: 512 },
}

/**
 * Every other page: only a patch in the top right corner, beside the title rather than under
 * the text. Its layer (.site-grain in site-theme.css) is just big enough to hold it; on phones the
 * homepage's corner, smaller.
 */
export const SITE_SURFACE: Surface = {
  wide: { sides: [0, 0, 0, 0], ends: [0, 0, 0, 0], corners: [0, 320, 0, 0], calm: 0, wavelength: 1100 },
  phone: { topRight: 340 },
}

type Corner = 'top-right' | 'bottom-left'
const CORNERS = '/video/grain'
const DARK = '(prefers-color-scheme: dark)'
// Wider than a phone no source matches, and the image fetches nothing.
const NOTHING = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='

/**
 * A phone's corner: the shader recorded (notes/grain/render-corners.mjs), a still of its frame 0
 * in the page's own markup, and the loop playing over it on the same pixels once the page has
 * loaded and the corner is near the screen. Reduced motion, Save-Data and 2G keep the still.
 */
function GrainCorner({ corner, size }: { corner: Corner; size: number }) {
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const movie = video.current!
    movie.muted = true
    if (typeof IntersectionObserver === 'undefined') return
    const phone = matchMedia(PHONE)
    const dark = matchMedia(DARK)
    const still = matchMedia('(prefers-reduced-motion: reduce)')
    let loaded = false
    let near = false
    const update = () => {
      const src = loaded && near && phone.matches && !still.matches && !sparing() ? `${CORNERS}/${corner}-${dark.matches ? 'dark' : 'light'}.mp4` : ''
      if (src === (movie.getAttribute('src') ?? '')) return
      delete movie.dataset.playing
      if (src) {
        movie.src = src
        void movie.play().catch(() => undefined)
      } else {
        movie.removeAttribute('src')
        movie.load()
      }
    }
    const playing = () => { movie.dataset.playing = '' }
    const sight = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; update() }, { rootMargin: '50% 0px' })
    sight.observe(movie)
    let idle = 0
    const rest = () => { idle = window.setTimeout(() => { loaded = true; update() }, 300) }
    if (document.readyState === 'complete') rest()
    else addEventListener('load', rest, { once: true })
    movie.addEventListener('playing', playing)
    for (const query of [phone, dark, still]) query.addEventListener('change', update)
    return () => {
      sight.disconnect()
      window.clearTimeout(idle)
      removeEventListener('load', rest)
      movie.removeEventListener('playing', playing)
      for (const query of [phone, dark, still]) query.removeEventListener('change', update)
    }
  }, [corner])
  return (
    <div className="grain-corner" data-corner={corner} style={{ '--corner': `${size}px` } as CSSProperties}>
      <picture>
        <source media={`${PHONE} and ${DARK}`} type="image/avif" srcSet={`${CORNERS}/${corner}-dark.avif`} />
        <source media={PHONE} type="image/avif" srcSet={`${CORNERS}/${corner}-light.avif`} />
        {/* The top right is on the first screen, and its largest image: the page's LCP on a phone. */}
        <img src={NOTHING} alt="" {...corner === 'top-right' ? { fetchPriority: 'high' } as const : { loading: 'lazy', decoding: 'async' } as const} />
      </picture>
      <video ref={video} playsInline loop preload="none" disableRemotePlayback />
    </div>
  )
}

/**
 * The page's surface: the Grain Gradient from the phone apps' first screen and desktop
 * onboarding, a field that scrolls with the page, its colour where `surface` puts it. Wider than
 * a phone a worker draws it into canvases where the colour can be: still, except near the page's
 * ends, where it moves on slowly while in view (grainGradientRenderer.ts). Its palette is
 * `--grain-*` in happy-home.css, light or dark with the system; a new `palette` repaints it.
 * Without WebGL on a GPU it stays the plain base colour. Phones show recorded corners
 * (GrainCorner). A page that scrolls an element instead of the window (wide docs scroll their
 * article) names it as `scroller`, and the field goes up with it.
 */
export function GrainGradient({
  palette,
  surface = HOME_SURFACE,
  className = 'home-grain',
  scroller,
}: {
  palette?: string
  surface?: Surface
  className?: string
  scroller?: RefObject<HTMLElement | null>
}) {
  const layer = useRef<HTMLDivElement>(null)
  useEffect(() => grainGradientRenderer(layer.current!, surface), [palette, surface])
  useEffect(() => {
    const scrolling = scroller?.current
    if (!scrolling) return
    const view = scrolling.ownerDocument.defaultView!
    const follow = () => {
      layer.current!.style.transform = scrolling.scrollTop > 0 ? `translateY(${-scrolling.scrollTop}px)` : ''
    }
    follow()
    scrolling.addEventListener('scroll', follow, { passive: true })
    // Narrowed to a phone, the article stops scrolling and the window takes over.
    view.addEventListener('resize', follow)
    return () => {
      scrolling.removeEventListener('scroll', follow)
      view.removeEventListener('resize', follow)
    }
  }, [scroller])
  return (
    <div ref={layer} className={className} aria-hidden="true">
      <GrainCorner corner="top-right" size={surface.phone.topRight} />
      {surface.phone.bottomLeft && <GrainCorner corner="bottom-left" size={surface.phone.bottomLeft} />}
    </div>
  )
}
