import { useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react'
import { grainGradientRenderer } from './grainGradientRenderer'

const reducedMotionSubscribe = (listener: () => void) => {
  const query = matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', listener)
  return () => query.removeEventListener('change', listener)
}
const reducedMotionGet = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * One panel of the Grain Gradient from the phone apps' first screen and desktop onboarding,
 * in their palette (`--grain-*` in happy-home.css), light or dark with the system. It scrolls
 * with the page; `offset` (seconds) keeps neighbouring panels from showing the same frame.
 * Without WebGL, the CSS corner glows stand in for it. `children` sit above the gradient.
 */
export function GrainGradient({ className, offset = 0, children }: { className: string; offset?: number; children?: ReactNode }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  // The prerendered page and reduced motion both start still.
  const reducedMotion = useSyncExternalStore(reducedMotionSubscribe, reducedMotionGet, () => true)
  // Turning reduced motion off resumes the motion where it was.
  const clock = useRef({ seconds: 0 })
  useEffect(() => grainGradientRenderer(canvas.current!, !reducedMotion, clock.current, offset), [reducedMotion, offset])
  return (
    <div className={`one-grain ${className}`}>
      <canvas ref={canvas} className="one-grain-canvas" aria-hidden="true" />
      {children}
    </div>
  )
}
