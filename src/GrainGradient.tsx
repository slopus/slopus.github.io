import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'
import { sparing } from './connection'
import { grainGradientRenderer, PHONE, type Surface } from './grainGradientRenderer'
import './grain-gradient.css'

/**
 * Where the colour goes. Wide: a few big, slow swells down both sides near the page's ends, a
 * large patch in the top right, and one in the bottom left at the page's end, under the footer.
 * Phones keep it out of the content: the top right, and the bottom left at the footer.
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

/**
 * The link-preview card (`?preview=og`, 1200×630): the store screenshots' full field, colour down
 * both sides and in every corner, so the window stands on the gradient rather than a plain page.
 */
export const CARD_SURFACE: Surface = {
  wide: { sides: [1, .2, 1, .2], ends: [160, 80, 180, 80], corners: [300, 460, 460, 360], calm: 0, wavelength: 700 },
  phone: { topRight: 0 },
}

type Corner = 'top-right' | 'bottom-left'
const CORNERS = '/video/grain'
const DARK = '(prefers-color-scheme: dark)'
// Wider than a phone no source matches, and the image fetches nothing.
const NOTHING = 'data:image/gif;base64,R0lGODlhAQABAAAAACw='

/** The side of the square a wide corner's still was recorded in, in blob radii. */
const WIDE_SQUARE = 1.8

/**
 * A corner as the shader recorded it (notes/grain/render-corners.mjs). On a phone, a square of
 * `size`: a still of its frame 0 in the page's own markup, and the loop playing over it on the
 * same pixels once the page has loaded and the corner is near the screen; reduced motion,
 * Save-Data and 2G keep the still. Wider, a square of `wide`, its blob's radius, × WIDE_SQUARE:
 * the still of frame 0 alone, a CSS background, only where the shader is not drawn
 * (grain-gradient.css).
 */
function GrainCorner({ corner, size, wide }: { corner: Corner; size: number; wide: number }) {
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
    <div className="grain-corner" data-corner={corner} style={{ '--phone': `${size}px`, '--wide': `${WIDE_SQUARE * wide}px` } as CSSProperties}>
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
 * a phone it is one of two, chosen before the first paint (index.html): on a GPU a worker draws
 * the shader into canvases near the page's ends, moving slowly while in view
 * (grainGradientRenderer.ts); otherwise the recorded corners stand still (GrainCorner), as they
 * do if the shader ever fails. Phones show recorded corners, moving. Its palette is `--grain-*`
 * in happy-home.css, light or dark with the system; a new `palette` repaints it. A page that
 * scrolls an element instead of the window (wide docs scroll their article) names it as
 * `scroller`, and the field goes up with it.
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
      <GrainCorner corner="top-right" size={surface.phone.topRight} wide={surface.wide.corners[1]} />
      {surface.phone.bottomLeft && <GrainCorner corner="bottom-left" size={surface.phone.bottomLeft} wide={surface.wide.corners[2]} />}
    </div>
  )
}
