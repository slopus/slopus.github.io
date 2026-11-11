import { useEffect, useRef, useState, type CSSProperties } from 'react'

const FRAME = '/video/happy-one/device/iphone-16-pro-black'
/** The Mac window is 1133 by 700; a whole one is drawn at most this wide, 0.85 of its size. */
const WINDOW = { width: 960, ratio: '1133 / 700' }

type Size = { width: number; height: number }
/**
 * What a scene shows. A window is the whole Mac window, where the page has 920px for it, and one
 * region of it anywhere narrower. A region is one part of the window, with a smaller part for a
 * phone's width. Sizes are the app's own CSS pixels: a part is never drawn larger than that.
 */
export type Scene =
  | { kind: 'window'; narrow: Size; loop: boolean }
  | { kind: 'region'; wide: Size; narrow: Size; loop: boolean }
  | { kind: 'phone' }

/** A docs image title that makes a scene: "window loop 344x700", "region 560x356 344x356", "phone". */
export function sceneFromTitle(title: string | null | undefined): Scene | undefined {
  if (title === 'phone') return { kind: 'phone' }
  const match = /^(window|region)( loop)?((?: \d+x\d+)+)$/.exec(title ?? '')
  if (!match) return undefined
  const sizes = match[3].trim().split(' ').map((size) => { const [width, height] = size.split('x').map(Number); return { width, height } })
  const loop = match[2] !== undefined
  if (match[1] === 'window' && sizes.length === 1) return { kind: 'window', narrow: sizes[0], loop }
  if (match[1] === 'region' && sizes.length === 2) return { kind: 'region', wide: sizes[0], narrow: sizes[1], loop }
  return undefined
}

/**
 * A section's picture of the app, never drawn larger than the app draws itself, in a box whose
 * size is set before anything loads, so the text around it never moves (`.section-scene` in
 * style.css). A docs image whose src is a folder and whose title is one of these is a scene:
 *
 * - `![alt](/video/<name>/ "window 344x700")`: the whole Mac window, wide.webp, running past the
 *   text column into the margin. Where the page has less than 920px for it the window would be
 *   too small to read, so it shows one whole part of it instead: narrow.webp, 344 by 700 here,
 *   the rail and sidebar up to their divider. A part always ends on an edge the app has.
 * - `![alt](/video/<name>/ "region 560x356 344x356")`: one part of the window, wide.webp, and a
 *   smaller part on a phone, narrow.webp.
 * - `![alt](/video/<name>/ "phone")`: the phone in its frame, phone.webp, standing beside the
 *   paragraph after it.
 *
 * "loop" after the first word adds a recording over each still, wide.mp4 and narrow.mp4, the
 * still being its first frame. Nothing here costs the first load: the stills are lazy images, a
 * recording has `preload="none"` and no poster, and the one that isn't shown at this width is
 * never fetched. It plays while 30% of the scene is in view and stops when less than 10% is.
 * With reduced motion or Save-Data it stays the still until the reader presses play.
 */
export function SectionScene({ folder, label, scene }: { folder: string; label: string; scene: Scene }) {
  const root = useRef<HTMLSpanElement>(null)
  const loop = scene.kind !== 'phone' && scene.loop
  const [paused, setPaused] = useState(false)
  const wanted = useRef(false)
  const apply = useRef<() => void>(() => {})

  useEffect(() => {
    const element = root.current
    if (!loop || !element || typeof IntersectionObserver === 'undefined') return
    const movies = [...element.querySelectorAll('video')]
    // Muted here too: the prerendered markup can't carry it, and an unmuted movie can't start itself.
    for (const movie of movies) movie.muted = true
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || connection?.saveData === true) {
      wanted.current = true
      setPaused(true)
    }
    let ratio = 0
    apply.current = () => {
      const run = !wanted.current && !document.hidden && ratio >= 0.3
      for (const movie of movies) {
        // Only the one that is drawn at this width.
        const shown = movie.getClientRects().length > 0
        if (run && shown) { if (movie.paused) void movie.play().catch(() => {}) }
        else if (!movie.paused && (!shown || wanted.current || document.hidden || ratio < 0.1)) movie.pause()
      }
    }
    const onChange = () => apply.current()
    document.addEventListener('visibilitychange', onChange)
    window.addEventListener('resize', onChange)
    const observer = new IntersectionObserver(([entry]) => {
      ratio = entry.isIntersecting ? entry.intersectionRatio : 0
      apply.current()
    }, { threshold: [0, 0.1, 0.3] })
    observer.observe(element)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onChange)
      window.removeEventListener('resize', onChange)
    }
  }, [folder, loop])

  if (scene.kind === 'phone') {
    return (
      <span className="section-scene" data-kind="phone">
        <span className="section-scene-screen"><img src={`${folder}phone.webp`} alt={label} loading="lazy" decoding="async" /></span>
        <img className="section-scene-frame" src={`${FRAME}-480.webp`} srcSet={`${FRAME}-480.webp 480w, ${FRAME}-720.webp 720w`} sizes="200px" width="1406" height="2822" alt="" loading="lazy" decoding="async" />
      </span>
    )
  }

  const toggle = () => {
    wanted.current = !wanted.current
    setPaused(wanted.current)
    apply.current()
  }
  // The still shows through its recording until the recording has a frame.
  const part = (name: 'wide' | 'narrow') => (
    <span className={`section-scene-part section-scene-${name}`}>
      <img src={`${folder}${name}.webp`} alt={label} loading="lazy" decoding="async" />
      {loop && <video src={`${folder}${name}.mp4`} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} suppressHydrationWarning />}
    </span>
  )
  const wide = scene.kind === 'window' ? WINDOW : { width: scene.wide.width, ratio: `${scene.wide.width} / ${scene.wide.height}` }
  const sizes = {
    '--scene-wide': `${wide.width}px`,
    '--scene-wide-ratio': wide.ratio,
    '--scene-narrow': `${scene.narrow.width}px`,
    '--scene-narrow-ratio': `${scene.narrow.width} / ${scene.narrow.height}`,
  } as CSSProperties
  return (
    <span ref={root} className="section-scene" data-kind={scene.kind} data-loop={loop || undefined} data-paused={paused || undefined} style={sizes} onClick={loop ? toggle : undefined}>
      {part('wide')}
      {part('narrow')}
      {loop && (
        <button type="button" className="section-scene-toggle" aria-label={paused ? 'Play the recording' : 'Pause the recording'} onClick={(event) => { event.stopPropagation(); toggle() }}>
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">{paused ? <path d="M4 2.5v11l9-5.5z" fill="currentColor" /> : <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" fill="currentColor" />}</svg>
        </button>
      )}
    </span>
  )
}
