import type { Rect, SurfaceShape } from './grainGradientGL'
import type { FromWorker, Scene } from './grainGradientWorker'

const PALETTE = ['back', '0', '1', '2', '3'] as const

/**
 * The shader's shape, whose corners are also the stills' wider than a phone, and the sizes in CSS
 * px of the squares a phone's recorded corners take (GrainCorner).
 */
export type Surface = { wide: SurfaceShape; phone: { topRight: number; bottomLeft?: number } }
/** Where the recorded corners move and the shader is never drawn. */
export const PHONE = '(max-width: 699.98px)'
/** The largest piece drawn at once, in device px, well inside every GPU's limits. */
const PIECE = 4096

/**
 * The visit's one worker, started as soon as this module loads, so it is ready by the time the
 * page mounts: only where the page's head chose the shader before the first paint (`data-grain`,
 * index.html). Otherwise the still is the gradient until a reload.
 */
let worker = typeof document !== 'undefined' && document.documentElement.dataset.grain === 'shader'
  ? new Worker(new URL('./grainGradientWorker.ts', import.meta.url), { type: 'module' })
  : undefined
/** The scene the worker draws now; frames of an earlier one are dropped. */
let pass = 0
/** Removes the canvases of the page that is mounted. */
let clear = () => {}

/**
 * One way: the worker stops, the canvases go, and without `data-grain` the page shows its still
 * (grain-gradient.css). Nothing starts the shader again before a reload.
 */
function stop() {
  worker?.terminate()
  worker = undefined
  delete document.documentElement.dataset.grain
  clear()
}
worker?.addEventListener('error', stop)

/**
 * Where across the page the shader can put colour, in CSS px: all of it when the sides or ends
 * have any, otherwise from each edge as far as its corners reach. The bounds are the shader's: a
 * blob wanders up to 1.3 × its radius, rim() dissolves it by 1.3 × that + 40px, and 8px to spare.
 */
function span(shape: SurfaceShape, width: number) {
  const reach = (radius: number) => (radius < 1 ? 0 : 1.69 * radius + 48)
  const all = [...shape.sides, ...shape.ends].some(Boolean)
  const left = reach(Math.max(shape.corners[0], shape.corners[2]))
  const right = reach(Math.max(shape.corners[1], shape.corners[3]))
  return [all || left ? 0 : Math.max(0, width - right), all || right ? width : Math.min(width, left)]
}

/**
 * Draws the Grain Gradient as the page's surface, shaped by `surface`, into `layer`, an element
 * as large as the page. Each end of the page is one strip, a screen and a half tall, across where
 * the shader can put colour: the colour fades out before its inner edge, and the middle of the
 * page has no canvas. On a page shorter than three screens the two are half the page each and
 * meet; a layer no taller than one strip is one. A strip is cut into equal pieces no larger than
 * PIECE, each a plain canvas in page space, so scrolling draws and moves nothing.
 * The worker draws the pieces near the screen while the tab is in view, moving unless the reader
 * prefers reduced motion, and each fades in over the plain base colour with its first frame. They
 * are placed again when the page resizes or the colour scheme changes. The palette is the layer's
 * `--grain-*` custom properties (six-digit hex). Returns the one teardown.
 */
export function grainGradientRenderer(layer: HTMLElement, surface: Surface) {
  const document = layer.ownerDocument
  const view = document.defaultView
  if (!worker || view === null) return () => {}
  const motion = view.matchMedia('(prefers-reduced-motion: reduce)')
  const scheme = view.matchMedia('(prefers-color-scheme: dark)')
  const canvases: HTMLCanvasElement[] = []
  const near = new Set<Element>()
  let rects: Rect[] = []
  let scene: Omit<Scene, 'moving' | 'pieces'> | undefined
  // What the pieces were placed for; they are placed again only when this changes.
  let placed = ''

  const send = () => {
    if (scene) worker?.postMessage({ ...scene, moving: !motion.matches, pieces: rects.map((rect, index) => ({ rect, near: !document.hidden && near.has(canvases[index]) })) } satisfies Scene)
  }
  // Near is within a quarter of a screen. At half a screen, on a page shorter than three screens,
  // where the strips are half the page each, the far one counted as near from the other end, and
  // both were drawn every frame: 38.6 MP at 2560×1440 on a 2x screen. At a quarter, only the end on
  // screen is, on any page at least two and a half screens tall.
  const sight = new view.IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) near.add(target)
      else near.delete(target)
    }
    send()
  }, { rootMargin: '25% 0px' })

  const place = () => {
    const { width, height } = layer.getBoundingClientRect()
    const ratio = Math.min(2, Math.max(1, view.devicePixelRatio))
    const screen = view.innerHeight
    const style = view.getComputedStyle(layer)
    const palette = PALETTE.map(name => style.getPropertyValue(`--grain-${name}`).trim())
    const wanted = [width, height, screen, ratio, palette].join()
    if (wanted === placed) return
    placed = wanted
    const [left, right] = span(surface.wide, width).map(x => Math.round(x * ratio))
    const bottom = Math.ceil(height * ratio)
    const tall = Math.ceil(1.5 * screen * ratio)
    const high = bottom > tall ? Math.min(tall, Math.ceil(bottom / 2)) : bottom
    const tops = bottom > tall ? [0, Math.max(high, bottom - high)] : [0]
    const columns = Math.ceil((right - left) / PIECE)
    const rows = Math.ceil(high / PIECE)
    const size = { width: Math.ceil((right - left) / columns), height: Math.ceil(high / rows) }
    rects = tops.flatMap(top => Array.from({ length: rows * columns }, (_, index) =>
      ({ x: left + index % columns * size.width, y: top + Math.floor(index / columns) * size.height, ...size })))
    for (const canvas of canvases.splice(rects.length)) {
      sight.unobserve(canvas)
      near.delete(canvas)
      canvas.remove()
    }
    rects.forEach((rect, index) => {
      const canvas = canvases[index] ??= document.createElement('canvas')
      Object.assign(canvas.style, { left: `${rect.x / ratio}px`, top: `${rect.y / ratio}px`, width: `${rect.width / ratio}px`, height: `${rect.height / ratio}px` })
      if (canvas.isConnected) return
      layer.append(canvas)
      sight.observe(canvas)
    })
    // The colour is whole for the first and last screen, and fades out over half a screen more.
    scene = { id: ++pass, palette, shape: surface.wide, ratio, width, height, zone: [screen, screen / 2, screen, screen / 2] }
    send()
  }
  const onMessage = ({ data }: MessageEvent<FromWorker>) => {
    if (data.type === 'lost') return stop()
    const { bitmap } = data
    const canvas = data.id === pass ? canvases[data.index] : undefined
    if (!canvas) return bitmap.close()
    if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) Object.assign(canvas, { width: bitmap.width, height: bitmap.height })
    canvas.getContext('bitmaprenderer')!.transferFromImageBitmap(bitmap)
    canvas.dataset.painted ??= ''
  }

  // Placed at once, and again when the page has stopped changing size, as it does while it loads.
  let wait: number | undefined
  const schedule = () => {
    view.clearTimeout(wait)
    wait = view.setTimeout(place, 150)
  }
  const sizing = new view.ResizeObserver(schedule)
  const dispose = () => {
    clear = () => {}
    sizing.disconnect()
    sight.disconnect()
    view.removeEventListener('resize', schedule)
    scheme.removeEventListener('change', schedule)
    motion.removeEventListener('change', send)
    document.removeEventListener('visibilitychange', send)
    view.clearTimeout(wait)
    worker?.removeEventListener('message', onMessage)
    // The worker rests until the next page's scene.
    rects = []
    send()
    for (const canvas of canvases) canvas.remove()
  }
  clear = dispose
  worker.addEventListener('message', onMessage)
  sizing.observe(layer)
  view.addEventListener('resize', schedule)
  scheme.addEventListener('change', schedule)
  motion.addEventListener('change', send)
  document.addEventListener('visibilitychange', send)
  place()
  return dispose
}
