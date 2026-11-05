import { useEffect, useRef, type RefObject } from 'react'
import { grainGradientRenderer, type Surface } from './grainGradientRenderer'

/**
 * Where the colour goes. Wide: a few big, slow swells down both sides, a large patch in the top
 * right, and one in the bottom left at the page's end, under the footer. Phones keep it out of
 * the content: the top right, and the bottom left at the footer.
 */
export const HOME_SURFACE: Surface = {
  wide: { sides: [.34, .58, .34, .58], ends: [0, 0, 0, 0], corners: [0, 580, 500, 0], calm: 400, wavelength: 1100 },
  narrow: { sides: [0, 0, 0, 0], ends: [0, 0, 0, 0], corners: [0, 270, 300, 0], calm: 175, wavelength: 700 },
}

/**
 * Every other page: only a patch in the top right corner, beside the title rather than under
 * the text. Its layer (.site-grain in site-theme.css) is just big enough to hold it.
 */
export const SITE_SURFACE: Surface = {
  wide: { sides: [0, 0, 0, 0], ends: [0, 0, 0, 0], corners: [0, 320, 0, 0], calm: 0, wavelength: 1100 },
  narrow: { sides: [0, 0, 0, 0], ends: [0, 0, 0, 0], corners: [0, 180, 0, 0], calm: 0, wavelength: 700 },
}

/**
 * The page's surface: the Grain Gradient from the phone apps' first screen and desktop
 * onboarding, a field that scrolls with the page, its colour where `surface` puts it, drawn by a
 * worker into canvases where the colour can be: still, except near the page's ends, where it
 * moves on slowly while in view (grainGradientRenderer.ts). Its palette is `--grain-*` in
 * happy-home.css, light or dark with the system; a new `palette` repaints it. Without WebGL on a
 * GPU, CSS edges stand in for it. A page that scrolls an element instead of the window (wide docs scroll
 * their article) names it as `scroller`, and the field goes up with it.
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
  return <div ref={layer} className={className} aria-hidden="true" />
}
