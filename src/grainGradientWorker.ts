import { grainProgram, type GrainFrame, type GrainPalette, type GrainProgram, type Rect, type SurfaceShape, type Zone } from './grainGradientGL'

/**
 * Draws the Grain Gradient off the main thread (grainGradientRenderer.ts sends the work). Still
 * pieces are drawn once in this worker's own context and sent back as bitmaps. Moving pieces
 * arrive as canvases the page handed over: each gets a context of its own, and this worker
 * redraws the ones in view at up to 30 fps, at half that if a frame takes too long, and stops if
 * it still does. Only on a GPU: where WebGL would fall back to software, the worker reports it is
 * not ready, and the page shows CSS edges instead of drawing seconds of shader on the CPU.
 */

export type PaintRequest = {
  type: 'paint'
  id: number
  palette: GrainPalette
  shape: SurfaceShape
  ratio: number
  width: number
  height: number
  still: number
  zone: Zone
  /** Seconds of motion per second. */
  speed: number
  pieces: { rect: Rect; canvas?: OffscreenCanvas }[]
}
export type ToWorker =
  | PaintRequest
  | { type: 'visible'; id: number; index: number; visible: boolean }
  | { type: 'run'; running: boolean }
export type FromWorker =
  | { type: 'ready'; ok: boolean }
  | { type: 'piece'; id: number; index: number; bitmap?: ImageBitmap; replace?: boolean }
  | { type: 'painted'; id: number }
  | { type: 'lost' }

// The worker's own globals, typed here: the webworker lib would retype the page's for the whole program.
type WorkerScope = {
  postMessage(message: FromWorker, transfer: Transferable[]): void
  addEventListener(type: 'message', listener: (event: MessageEvent<ToWorker>) => void): void
  requestAnimationFrame?: (callback: (now: number) => void) => number
}
const scope = self as unknown as WorkerScope
const post = (message: FromWorker, transfer: Transferable[] = []) => scope.postMessage(message, transfer)
const ATTRIBUTES = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true } as const

const scratch = new OffscreenCanvas(1, 1)
const scratchGl = scratch.getContext('webgl', ATTRIBUTES) as WebGLRenderingContext | null
const still = scratchGl ? grainProgram(scratchGl, scratch) : undefined
scratch.addEventListener('webglcontextlost', () => post({ type: 'lost' }))
post({ type: 'ready', ok: still !== undefined })

type Moving = { index: number; gl: WebGLRenderingContext; program: GrainProgram; frame: GrainFrame; visible: boolean }
let paintId = 0
let moving: Moving[] = []
let speed = 1
let running = true
/** Seconds of motion so far: it advances only while something moving is drawn. */
let clock = 0
let interval = 1000 / 30
let cost = 0
let last = 0
let scheduled = false

const frame = scope.requestAnimationFrame?.bind(scope)
const nextFrame: (callback: (now: number) => void) => void = frame
  ? callback => { frame(callback) }
  : callback => { setTimeout(() => callback(performance.now()), 16) }

function schedule() {
  if (scheduled || !running || !moving.some(piece => piece.visible)) return
  scheduled = true
  nextFrame(tick)
}

function tick(now: number) {
  scheduled = false
  if (!running) return
  const shown = moving.filter(piece => piece.visible)
  if (!shown.length) return
  if (last === 0) last = now
  if (now - last >= interval - 2) {
    clock += Math.min(now - last, 100) / 1000 * speed
    last = now
    const start = performance.now()
    for (const piece of shown) {
      piece.frame.elapsed = clock
      piece.program.draw(piece.frame)
      piece.gl.finish()
    }
    cost = cost * .9 + (performance.now() - start) * .1
    // Too slow for 30 fps: 15. Too slow for that: stop where it is.
    if (cost > 12 && interval < 60) interval = 1000 / 15
    else if (cost > 28) { moving = []; return }
  }
  schedule()
}

function stillBitmap(frame: GrainFrame) {
  still!.draw(frame)
  return scratch.transferToImageBitmap()
}

function paint(request: PaintRequest) {
  if (!still || !still.palette(request.palette)) return
  paintId = request.id
  speed = request.speed
  moving = []
  last = 0
  const base = { shape: request.shape, ratio: request.ratio, width: request.width, height: request.height, still: request.still, zone: request.zone }
  request.pieces.forEach(({ rect, canvas }, index) => {
    const frame: GrainFrame = { ...base, piece: rect, elapsed: 0 }
    if (canvas) {
      const gl = canvas.getContext('webgl', ATTRIBUTES) as WebGLRenderingContext | null
      const program = gl ? grainProgram(gl, canvas) : undefined
      if (gl && program && program.palette(request.palette)) {
        frame.elapsed = clock
        program.draw(frame)
        moving.push({ index, gl, program, frame, visible: true })
        post({ type: 'piece', id: request.id, index })
        return
      }
      // No GPU for it: it stays the still, in a canvas the page makes for it (drawn into the
      // handed-over canvas, the bitmap is resampled).
      const bitmap = stillBitmap(frame)
      post({ type: 'piece', id: request.id, index, bitmap, replace: true }, [bitmap])
      return
    }
    const bitmap = stillBitmap(frame)
    post({ type: 'piece', id: request.id, index, bitmap }, [bitmap])
  })
  post({ type: 'painted', id: request.id })
  schedule()
}

scope.addEventListener('message', ({ data }) => {
  if (data.type === 'paint') paint(data)
  else if (data.type === 'visible') {
    if (data.id !== paintId) return
    const piece = moving.find(entry => entry.index === data.index)
    if (piece) piece.visible = data.visible
    schedule()
  } else if (data.type === 'run') {
    running = data.running
    last = 0
    schedule()
  }
})
