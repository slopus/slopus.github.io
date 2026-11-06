import { grainProgram, type GrainFrame, type GrainPalette, type GrainProgram, type Rect, type SurfaceShape, type Zone } from './grainGradientGL'

/**
 * Draws the Grain Gradient off the main thread (grainGradientRenderer.ts sends the work). Still
 * pieces are drawn once in this worker's own context and sent back as bitmaps. Moving pieces are
 * drawn into canvases the page handed over once, in slots it keeps: each gets a context of its
 * own, kept for every later paint that uses its slot, and this worker redraws the ones in view at
 * up to 30 fps. Only on a GPU:
 * where WebGL would fall back to software, the worker reports it is not ready, and the page shows
 * CSS edges instead of drawing seconds of shader on the CPU.
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
  /** A moving piece names its slot, and hands over its canvas the first time. */
  pieces: { rect: Rect; slot?: number; canvas?: OffscreenCanvas }[]
}
export type ToWorker =
  | PaintRequest
  | { type: 'visible'; id: number; index: number; visible: boolean }
  | { type: 'run'; running: boolean }
export type FromWorker =
  | { type: 'ready'; ok: boolean }
  | { type: 'piece'; id: number; index: number; bitmap?: ImageBitmap }
  | { type: 'painted'; id: number }

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
post({ type: 'ready', ok: still !== undefined })

type Moving = { index: number; gl: WebGLRenderingContext; program: GrainProgram; frame: GrainFrame; visible: boolean }
let paintId = 0
/** Every slot's canvas and context, kept; and the ones this paint moves. */
const slots: (Moving | null)[] = []
let moving: Moving[] = []
let speed = 1
let running = true
/** Seconds of motion so far: it advances only while something moving is drawn. */
let clock = 0
const INTERVAL = 1000 / 30
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
  if (now - last >= INTERVAL - 2) {
    clock += Math.min(now - last, 100) / 1000 * speed
    last = now
    for (const piece of shown) {
      piece.frame.elapsed = clock
      piece.program.draw(piece.frame)
    }
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
  request.pieces.forEach(({ rect, slot, canvas }, index) => {
    const frame: GrainFrame = { ...base, piece: rect, elapsed: 0 }
    if (slot !== undefined) {
      if (canvas) {
        const gl = canvas.getContext('webgl', ATTRIBUTES) as WebGLRenderingContext | null
        const program = gl ? grainProgram(gl, canvas) : undefined
        slots[slot] = gl && program ? { index, gl, program, frame, visible: true } : null
      }
      const piece = slots[slot]
      if (piece && piece.program.palette(request.palette)) {
        Object.assign(piece, { index, frame, visible: true })
        frame.elapsed = clock
        piece.program.draw(frame)
        moving.push(piece)
      }
      post({ type: 'piece', id: request.id, index })
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
