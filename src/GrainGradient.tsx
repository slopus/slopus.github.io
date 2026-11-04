import { useEffect, useRef } from 'react'
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
 * The page's surface: the Grain Gradient from the phone apps' first screen and desktop
 * onboarding, held still, one field from the top of the page to the bottom that scrolls with
 * it, its colour where HOME_SURFACE puts it, drawn once into canvases where the colour can be.
 * Its palette is `--grain-*` in happy-home.css, light or dark with the system; a new `palette`
 * repaints it. Without WebGL, CSS edges stand in for it.
 */
export function GrainGradient({ palette }: { palette: string }) {
  const layer = useRef<HTMLDivElement>(null)
  useEffect(() => grainGradientRenderer(layer.current!, HOME_SURFACE), [palette])
  return <div ref={layer} className="home-grain" aria-hidden="true" />
}
