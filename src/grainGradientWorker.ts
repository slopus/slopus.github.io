import { grainProgram, type GrainFrame, type GrainPalette, type Rect } from './grainGradientGL'

/**
 * Draws the Grain Gradient off the main thread, in the visit's one WebGL context: Chromium keeps
 * four to a worker and loses the oldest, and Safari's memory grows with each. The page
 * (grainGradientRenderer.ts) sends the scene; this draws each piece that is near the screen, ten
 * times a second while the scene moves and once when it does not, and hands each back as a
 * bitmap. Only on a GPU: where WebGL would fall back to software, the shader does not compile,
 * the context is lost or a draw throws, it says `lost`, and the page falls back to its still.
 */

export type Scene = Omit<GrainFrame, 'piece' | 'time'> & {
  id: number
  palette: GrainPalette
  moving: boolean
  /** In device px of the page, all one size, so the canvas is never resized between them. */
  pieces: { rect: Rect; near: boolean }[]
}
export type FromWorker = { type: 'frame'; id: number; index: number; bitmap: ImageBitmap } | { type: 'lost' }

/** Seconds of the apps' motion per second: five times slower than theirs. */
const GRAIN_SPEED = .2
/** Ten frames a second. */
const INTERVAL = 100

// The worker's own globals, typed here: the webworker lib would retype the page's for the whole program.
type WorkerScope = {
  postMessage(message: FromWorker, transfer?: Transferable[]): void
  addEventListener(type: 'message', listener: (event: MessageEvent<Scene>) => void): void
}
const scope = self as unknown as WorkerScope
const canvas = new OffscreenCanvas(1, 1)
const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: true }) as WebGLRenderingContext | null
const grain = gl && grainProgram(gl, canvas)
let scene: Scene | undefined
/** Seconds of motion so far: it advances only while something is drawn. */
let time = 0
let timer: ReturnType<typeof setTimeout> | undefined

function lost() {
  scene = undefined
  scope.postMessage({ type: 'lost' })
}
canvas.addEventListener('webglcontextlost', lost)

function tick() {
  timer = undefined
  if (!scene) return
  if (!gl || !grain) return lost()
  const { id, palette, moving, pieces, ...page } = scene
  if (!pieces.some(piece => piece.near)) return
  if (moving) timer = setTimeout(tick, INTERVAL)
  try {
    if (!grain.palette(palette)) return lost()
    for (const [index, { rect, near }] of pieces.entries()) {
      if (!near) continue
      grain.draw({ ...page, piece: rect, time })
      // A lost context draws nothing, and says so only when asked.
      if (gl.isContextLost()) return lost()
      const bitmap = canvas.transferToImageBitmap()
      scope.postMessage({ type: 'frame', id, index, bitmap }, [bitmap])
    }
  } catch {
    return lost()
  }
  time += GRAIN_SPEED * INTERVAL / 1000
}

scope.addEventListener('message', ({ data }) => {
  scene = data
  if (timer === undefined) tick()
})
