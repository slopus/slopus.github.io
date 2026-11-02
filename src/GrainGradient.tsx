import { useEffect, useRef, useSyncExternalStore } from 'react'
import { grainGradientRenderer } from './grainGradientRenderer'

const reducedMotionSubscribe = (listener: () => void) => {
  const query = matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
const reducedMotionGet = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The Grain Gradient from the phone apps' first screen and desktop onboarding, fixed behind
 * the whole page. Its palette is theirs (`--grain-*` in happy-one.css), light or dark with
 * the system. Without WebGL, the CSS corner glows underneath stand in for it.
 */
export function GrainGradient() {
  const canvas = useRef<HTMLCanvasElement>(null)
  // The prerendered page and reduced motion both start still.
  const reducedMotion = useSyncExternalStore(reducedMotionSubscribe, reducedMotionGet, () => true)
  // Turning reduced motion off resumes the motion where it was.
  const clock = useRef({ seconds: 0 })
  useEffect(() => grainGradientRenderer(canvas.current!, !reducedMotion, clock.current), [reducedMotion])
  return (
    <div className="one-grain" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  )
}
