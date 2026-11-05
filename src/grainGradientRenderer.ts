import type { GrainFrame, GrainPalette, GrainProgram, Rect, SurfaceShape, Zone } from './grainGradientGL'
import type { FromWorker, PaintRequest, ToWorker } from './grainGradientWorker'

export type { SurfaceShape } from './grainGradientGL'
const STILL_ZONE: Zone = [-1, 1, -1, 1]

const PALETTE = ['back', '0', '1', '2', '3'] as const

/** One shape for wide screens and one for phones (narrower than 700 CSS px). */
export type Surface = { wide: SurfaceShape; narrow: SurfaceShape }

/**
 * The moment of the apps' animated field the page shows first, in shader seconds: the frame the
 * page always opened on. Near the page's ends it moves on from there at the apps' own speed
 * (GRAIN_SPEED), unless the reader prefers reduced motion.
 */
export const GRAIN_STILL = 0
export const GRAIN_SPEED = 1
/** The largest piece drawn at once, in device px, well inside every GPU's limits. */
const PIECE = 4096
/** On the main thread, without the worker: small enough to draw one between frames. */
const MAIN_PIECE = 1024

/**
 * Where the shader can put colour, in CSS px; everywhere else it draws the plain base colour,
 * which the layer's own background shows. The bounds are the shader's: rim() reaches 1.3 × its
 * reach + 40px, a side's reach is at most .92 of its margin, a blob's wanders up to 1.3 × its
 * radius, and each gets 8px to spare.
 */
function colouredRects(shape: SurfaceShape, width: number, height: number): Rect[] {
  const rects: Rect[] = []
  const extent = (reach: number) => (reach < 1 ? 0 : 1.3 * reach + 48)
  const [leftReach, leftWave, rightReach, rightWave] = shape.sides
  const margin = Math.max(.5 * width - shape.calm, 0)
  const side = Math.min(.5 * width, extent(margin * Math.min(.92, Math.max(leftReach + Math.abs(leftWave), rightReach + Math.abs(rightWave)))))
  if (side > 0) rects.push({ x: 0, y: 0, width: side, height }, { x: width - side, y: 0, width: side, height })
  const [topReach, topWave, bottomReach, bottomWave] = shape.ends
  const top = extent(topReach + Math.abs(topWave))
  const bottom = extent(bottomReach + Math.abs(bottomWave))
  if (top > 0) rects.push({ x: 0, y: 0, width, height: top })
  if (bottom > 0) rects.push({ x: 0, y: height - bottom, width, height: bottom })
  const corners = [[0, 0], [1, 0], [0, 1], [1, 1]] as const
  shape.corners.forEach((radius, index) => {
    const size = extent(1.3 * radius)
    if (size <= 0) return
    const [right, low] = corners[index]
    rects.push({ x: right ? width - size : 0, y: low ? height - size : 0, width: size, height: size })
  })
  return rects
}

/**
 * The same area as `rects`, clamped to the page, in whole device px and without overlaps, cut
 * into pieces no larger than `limit`. Rows above `moving[0]` and below `moving[1]` (device px) are
 * the ones that move: their pieces are each end's colour gathered into as few boxes as do not
 * overlap, since each gets a context of its own.
 */
function pieces(rects: Rect[], ratio: number, width: number, height: number, limit: number, moving?: readonly [number, number]) {
  const device = rects.map(rect => {
    const x0 = Math.max(0, Math.floor(rect.x * ratio))
    const y0 = Math.max(0, Math.floor(rect.y * ratio))
    const x1 = Math.min(width, Math.ceil((rect.x + rect.width) * ratio))
    const y1 = Math.min(height, Math.ceil((rect.y + rect.height) * ratio))
    return { x0, y0, x1, y1 }
  }).filter(({ x0, y0, x1, y1 }) => x1 > x0 && y1 > y0)
  const cuts = moving ? moving.filter(y => y > 0 && y < height) : []
  const zoneOf = (y0: number, y1: number) => !moving ? 0 : y1 <= moving[0] ? 1 : y0 >= moving[1] ? 2 : 0
  // Bands across the page between every top and bottom edge, each the union of what covers it.
  const edges = [...new Set([...device.flatMap(({ y0, y1 }) => [y0, y1]), ...cuts])].sort((a, b) => a - b)
  const bands: { y0: number; y1: number; spans: [number, number][] }[] = []
  for (let i = 0; i + 1 < edges.length; i++) {
    const [y0, y1] = [edges[i], edges[i + 1]]
    const spans: [number, number][] = []
    for (const { x0, x1 } of device.filter(rect => rect.y0 <= y0 && rect.y1 >= y1).sort((a, b) => a.x0 - b.x0)) {
      const last = spans.at(-1)
      if (last && x0 <= last[1]) last[1] = Math.max(last[1], x1)
      else spans.push([x0, x1])
    }
    const previous = bands.at(-1)
    if (previous && previous.y1 === y0 && zoneOf(previous.y0, previous.y1) === zoneOf(y0, y1) && JSON.stringify(previous.spans) === JSON.stringify(spans)) previous.y1 = y1
    else if (spans.length) bands.push({ y0, y1, spans })
  }
  const boxes: { x0: number; y0: number; x1: number; y1: number; moving: boolean }[] = []
  for (const zone of [1, 2]) {
    const group = bands.filter(band => zoneOf(band.y0, band.y1) === zone)
      .flatMap(({ y0, y1, spans }) => spans.map(([x0, x1]) => ({ x0, y0, x1, y1, moving: true })))
    // Gather what overlaps across into one box, until nothing does.
    for (let merged = true; merged;) {
      merged = false
      for (let i = 0; i < group.length && !merged; i++)
        for (let j = i + 1; j < group.length && !merged; j++) {
          const [a, b] = [group[i], group[j]]
          if (a.x0 < b.x1 && b.x0 < a.x1) {
            group[i] = { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1), moving: true }
            group.splice(j, 1)
            merged = true
          }
        }
    }
    boxes.push(...group)
  }
  for (const { y0, y1, spans } of bands)
    if (zoneOf(y0, y1) === 0) boxes.push(...spans.map(([x0, x1]) => ({ x0, y0, x1, y1, moving: false })))
  const result: { rect: Rect; moving: boolean }[] = []
  for (const { x0, y0, x1, y1, moving: moves } of boxes)
    for (let y = y0; y < y1; y += limit)
      for (let x = x0; x < x1; x += limit)
        result.push({ rect: { x, y, width: Math.min(limit, x1 - x), height: Math.min(limit, y1 - y) }, moving: moves })
  return result
}

type Painted = { rect: Rect; canvas: HTMLCanvasElement; moving: boolean }

function canvasFor(document: Document, rect: Rect, ratio: number) {
  const canvas = document.createElement('canvas')
  Object.assign(canvas.style, {
    left: `${rect.x / ratio}px`, top: `${rect.y / ratio}px`,
    width: `${rect.width / ratio}px`, height: `${rect.height / ratio}px`,
  })
  return canvas
}

function show(canvas: HTMLCanvasElement, rect: Rect, bitmap: ImageBitmap) {
  canvas.width = rect.width
  canvas.height = rect.height
  const context = canvas.getContext('bitmaprenderer')
  if (context) context.transferFromImageBitmap(bitmap)
  else { canvas.getContext('2d')?.drawImage(bitmap, 0, 0); bitmap.close() }
}

/** A worker started as soon as this module loads, so it is ready by the time the page mounts. */
function startWorker() {
  if (typeof window === 'undefined' || typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined') return undefined
  try {
    const worker = new Worker(new URL('./grainGradientWorker.ts', import.meta.url), { type: 'module' })
    const ready = new Promise<boolean>(resolve => {
      worker.addEventListener('message', ({ data }: MessageEvent<FromWorker>) => { if (data.type === 'ready') resolve(data.ok) })
      worker.addEventListener('error', () => resolve(false))
    })
    return { worker, ready }
  } catch {
    return undefined
  }
}
let spare = startWorker()

/**
 * Draws the Grain Gradient as the page's surface, shaped by `surface`, into `layer`, an element as
 * large as the page. Only where the shader can put colour gets canvases, in page space, so
 * scrolling never draws and moves nothing. A worker draws them: the still (GRAIN_STILL) once,
 * and near the page's ends, unless the reader prefers reduced motion, the field moving on at
 * GRAIN_SPEED in canvases the worker redraws while they are in view (the rows between fade to the
 * still, so the two meet without a seam). Without the worker it is the still, drawn here a small
 * piece at a time. All of it is drawn again when the page resizes or the colour scheme changes,
 * and swapped in at once. Until the first draw the layer shows the plain base colour; without
 * WebGL on a GPU, CSS edges fade in instead (data-unavailable). The palette is the layer's `--grain-*` custom
 * properties (six-digit hex). Returns the one teardown.
 */
export function grainGradientRenderer(layer: HTMLElement, surface: Surface) {
  const document = layer.ownerDocument
  const view = document.defaultView
  if (view === null || typeof view.WebGLRenderingContext === 'undefined' || typeof view.createImageBitmap !== 'function') {
    layer.dataset.unavailable = ''
    return () => { delete layer.dataset.unavailable }
  }
  const started = spare
  spare = undefined
  const motion = view.matchMedia('(prefers-reduced-motion: reduce)')
  const scheme = view.matchMedia('(prefers-color-scheme: dark)')
  const canMove = typeof HTMLCanvasElement.prototype.transferControlToOffscreen === 'function'
  let disposed = false
  let shown: Painted[] = []
  let pending: Painted[] = []
  let pendingRatio = 1
  let pass = 0
  // What the canvases show; they are drawn again only when this changes.
  let drawn = ''
  // The first screen's height, for the moving rows; a phone's toolbars coming and going don't change it.
  let screenWidth = 0
  let screenHeight = 0
  let worker: Worker | undefined
  let fallback: { program: GrainProgram; source: HTMLCanvasElement } | undefined | null

  const settle = (painted: Painted[]) => {
    for (const { canvas } of shown) canvas.remove()
    layer.append(...painted.map(({ canvas }) => canvas))
    shown = painted
    sight.disconnect()
    painted.forEach(({ canvas, moving }) => { if (moving) sight.observe(canvas) })
    if (!('painted' in layer.dataset)) {
      // The canvases fade in over the plain base.
      void view.getComputedStyle(painted[0]?.canvas ?? layer).opacity
      layer.dataset.painted = ''
    }
  }
  const send = (message: ToWorker, transfer: Transferable[] = []) => worker?.postMessage(message, transfer)
  // The moving canvases the worker redraws only while they are in view, or nearly.
  const sight = new view.IntersectionObserver(entries => {
    for (const entry of entries) {
      const index = shown.findIndex(({ canvas }) => canvas === entry.target)
      if (index >= 0) send({ type: 'visible', id: pass, index, visible: entry.isIntersecting })
    }
  }, { rootMargin: '50% 0px' })
  const run = () => send({ type: 'run', running: !document.hidden && !motion.matches })

  const palette = (): GrainPalette => {
    const style = view.getComputedStyle(layer)
    return PALETTE.map(name => style.getPropertyValue(`--grain-${name}`).trim())
  }

  const onMessage = ({ data }: MessageEvent<FromWorker>) => {
    if (data.type === 'lost') {
      // Start over with a fresh worker.
      worker?.terminate()
      worker = undefined
      drawn = ''
      begun = false
      void begin(startWorker())
      return
    }
    if (data.type === 'piece') {
      const piece = data.id === pass ? pending[data.index] : undefined
      if (!piece) { data.bitmap?.close(); return }
      if (data.bitmap) {
        if (data.replace) piece.canvas = canvasFor(document, piece.rect, pendingRatio)
        show(piece.canvas, piece.rect, data.bitmap)
      }
    } else if (data.type === 'painted' && data.id === pass) settle(pending)
  }

  const paintMain = async (current: number, list: { rect: Rect }[], frame: Omit<GrainFrame, 'piece'>, colours: GrainPalette) => {
    if (fallback === undefined) {
      const { grainProgram } = await import('./grainGradientGL')
      const source = document.createElement('canvas')
      const gl = source.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: true, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true })
      const program = gl ? grainProgram(gl, source) : undefined
      fallback = program ? { program, source } : null
    }
    if (!fallback) { layer.dataset.unavailable = ''; return }
    if (!fallback.program.palette(colours)) return
    const made: Painted[] = []
    for (const { rect } of list) {
      if (disposed || current !== pass) return
      fallback.program.draw({ ...frame, piece: rect })
      const bitmap = await view.createImageBitmap(fallback.source)
      if (disposed || current !== pass) { bitmap.close(); return }
      const canvas = canvasFor(document, rect, frame.ratio)
      show(canvas, rect, bitmap)
      made.push({ rect, canvas, moving: false })
      // Between pieces, the page gets the main thread back.
      await new Promise(resolve => view.setTimeout(resolve))
    }
    settle(made)
  }

  const paint = () => {
    if (disposed) return
    const bounds = layer.getBoundingClientRect()
    const ratio = Math.min(2, Math.max(1, view.devicePixelRatio))
    const width = Math.max(1, Math.round(bounds.width * ratio))
    const height = bounds.height
    const colours = palette()
    if (view.innerWidth !== screenWidth || !screenHeight) { screenWidth = view.innerWidth; screenHeight = view.innerHeight }
    const moves = worker !== undefined && canMove && !motion.matches
    const wanted = `${width} ${height} ${ratio} ${colours.join()} ${moves ? screenHeight : ''}`
    if (wanted === drawn) return
    drawn = wanted
    const current = ++pass
    const shape = bounds.width < 700 ? surface.narrow : surface.wide
    // Fully moving for the first and last screen, fading to the still over half a screen more.
    const zone: Zone = moves ? [screenHeight, screenHeight / 2, screenHeight, screenHeight / 2] : STILL_ZONE
    const deviceHeight = Math.ceil(height * ratio)
    const ends = moves ? [Math.ceil((zone[0] + zone[1]) * ratio), Math.floor((height - zone[2] - zone[3]) * ratio)] as const : undefined
    const rects = colouredRects(shape, width / ratio, height)
    const frame = { shape, ratio, width, height, still: GRAIN_STILL, elapsed: 0, zone }
    if (!worker) {
      void paintMain(current, pieces(rects, ratio, width, deviceHeight, MAIN_PIECE), frame, colours)
      return
    }
    pendingRatio = ratio
    pending = pieces(rects, ratio, width, deviceHeight, PIECE, ends).map(({ rect, moving }) => ({ rect, moving, canvas: canvasFor(document, rect, ratio) }))
    const transfer: Transferable[] = []
    const request: PaintRequest = {
      type: 'paint', id: current, palette: colours, shape, ratio, width, height, still: GRAIN_STILL, zone, speed: GRAIN_SPEED,
      pieces: pending.map(({ rect, moving, canvas }) => {
        if (!moving) return { rect }
        const offscreen = canvas.transferControlToOffscreen()
        transfer.push(offscreen)
        return { rect, canvas: offscreen }
      }),
    }
    send(request, transfer)
    run()
  }

  // The first paint goes at once; later ones wait for the page to stop changing size, as it does
  // while it loads, so it is painted again once rather than at every step.
  let wait: number | undefined
  // Nothing is drawn until the worker has said whether it can.
  let begun = false
  const schedule = () => {
    if (!begun) return
    view.clearTimeout(wait)
    if (drawn === '') void Promise.resolve().then(paint)
    else wait = view.setTimeout(paint, 150)
  }
  const begin = async (from: ReturnType<typeof startWorker>) => {
    const ok = from ? await from.ready : false
    if (disposed) { from?.worker.terminate(); return }
    if (ok && from) {
      worker = from.worker
      worker.addEventListener('message', onMessage)
    } else from?.worker.terminate()
    begun = true
    schedule()
  }
  void begin(started ?? startWorker())
  const sizing = new view.ResizeObserver(schedule)
  sizing.observe(layer)
  view.addEventListener('resize', schedule)
  scheme.addEventListener('change', schedule)
  motion.addEventListener('change', run)
  document.addEventListener('visibilitychange', run)
  return () => {
    disposed = true
    pass++
    sizing.disconnect()
    sight.disconnect()
    view.removeEventListener('resize', schedule)
    scheme.removeEventListener('change', schedule)
    motion.removeEventListener('change', run)
    document.removeEventListener('visibilitychange', run)
    view.clearTimeout(wait)
    worker?.terminate()
    if (fallback) {
      fallback.program.release()
      ;(fallback.source.getContext('webgl') as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext()
    }
    for (const { canvas } of shown) canvas.remove()
    delete layer.dataset.painted
    delete layer.dataset.unavailable
  }
}
