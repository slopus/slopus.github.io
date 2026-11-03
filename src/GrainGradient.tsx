import { useEffect, useRef, useSyncExternalStore } from 'react'
import { grainGradientRenderer } from './grainGradientRenderer'

const reducedMotionSubscribe = (listener: () => void) => {
  const query = matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
const reducedMotionGet = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The page's surface: the Grain Gradient from the phone apps' first screen and desktop
 * onboarding, one field from the top of the page to the bottom that scrolls with it, its colour
 * at the side edges. Its palette is `--grain-*` in happy-home.css, light or dark with the
 * system; a new `palette` repaints it. Without WebGL, CSS edges stand in for it.
 */
export function GrainGradient({ palette }: { palette: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  // The prerendered page and reduced motion both start still.
  const reducedMotion = useSyncExternalStore(reducedMotionSubscribe, reducedMotionGet, () => true)
  // Turning reduced motion off, or another palette, resumes the motion where it was.
  const clock = useRef({ seconds: 0 })
  useEffect(() => grainGradientRenderer(canvas.current!, !reducedMotion, clock.current), [reducedMotion, palette])
  return (
    <div className="home-grain" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  )
}
