import { grainGradientFragmentShader } from './grainGradientShader'

const vertexSource = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0., 1.); }
`

const PALETTE = ['back', '0', '1', '2', '3'] as const

/** Where the colour goes, in CSS px unless noted. */
export type SurfaceShape = {
  /** Left reach, left wave, right reach, right wave: fractions of the margin beside the calm column. */
  sides: readonly [number, number, number, number]
  /** Top reach and wave, bottom reach and wave, deepest at the sides. */
  ends: readonly [number, number, number, number]
  /** Blob radii: top left, top right, and at the page's end bottom left, bottom right. */
  corners: readonly [number, number, number, number]
  /** Half the width of the column down the middle that the sides leave plain. */
  calm: number
  /** How long the sides' waves are, down the page. */
  wavelength: number
}
/** One shape for wide screens and one for phones (narrower than 700 CSS px). */
export type Surface = { wide: SurfaceShape; narrow: SurfaceShape }

/** The field moves at this fraction of the apps' rate (1: one shader second per second). */
export const GRAIN_SPEED = .4
/** Milliseconds between frames; the apps draw every 33. */
export const GRAIN_CADENCE = 66
/**
 * The canvas moves in whole steps of this many CSS px, a whole number of device pixels at the
 * usual ratios, so the grain lands on the same pixels wherever the canvas is.
 */
const STEP = 120

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (shader === null) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader
  gl.deleteShader(shader)
  return null
}

/**
 * Draws the Grain Gradient as the page's surface, shaped by `surface`. The canvas sits in a layer
 * as tall as the page and covers the viewport plus a buffer above and below; the shader works in
 * page space, so moving the canvas a step changes nothing on screen, and scrolling is the
 * browser's own.
 * The clock pauses while the tab is hidden, and stays on its first frame when `moving` is
 * false. The palette is the canvas's `--grain-*` custom properties (six-digit hex), read again
 * when the color scheme changes. Returns the one teardown that releases the program,
 * observers, and listeners.
 */
export function grainGradientRenderer(canvas: HTMLCanvasElement, moving: boolean, clock: { seconds: number }, surface: Surface) {
  const document = canvas.ownerDocument
  const view = document.defaultView
  const layer = canvas.parentElement
  // Without WebGL the CSS edges stay.
  if (view === null || layer === null || typeof view.WebGLRenderingContext === 'undefined') return
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  })
  if (gl === null) return

  let releaseProgram: (() => void) | undefined
  let render: (() => void) | undefined
  let paletteUpdate: (() => boolean) | undefined
  let frame: number | undefined
  let last: number | undefined
  // The canvas's place in the layer and its height, in CSS px, and device pixels per CSS px.
  let top = 0
  let height = 0
  let ratio = 1
  // The page's size, in CSS px.
  let pageWidth = 0
  let pageHeight = 0
  // Phones resize the viewport as their toolbars come and go; the canvas only grows.
  let tallest = 0
  if (!moving) clock.seconds = 0

  const initialize = () => {
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, grainGradientFragmentShader)
    const program = gl.createProgram()
    const buffer = gl.createBuffer()
    const release = () => {
      if (vertex !== null) gl.deleteShader(vertex)
      if (fragment !== null) gl.deleteShader(fragment)
      if (program !== null) gl.deleteProgram(program)
      if (buffer !== null) gl.deleteBuffer(buffer)
    }
    if (vertex === null || fragment === null || program === null || buffer === null) {
      release()
      return
    }
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      release()
      return
    }
    const position = gl.getAttribLocation(program, 'a_position')
    if (position < 0) {
      release()
      return
    }
    const resolution = gl.getUniformLocation(program, 'u_resolution')
    const offset = gl.getUniformLocation(program, 'u_top')
    const scale = gl.getUniformLocation(program, 'u_ratio')
    const time = gl.getUniformLocation(program, 'u_time')
    const page = gl.getUniformLocation(program, 'u_height')
    const sides = gl.getUniformLocation(program, 'u_sides')
    const ends = gl.getUniformLocation(program, 'u_ends')
    const corners = gl.getUniformLocation(program, 'u_corners')
    const shape = gl.getUniformLocation(program, 'u_shape')
    const colors = PALETTE.map(name => ({
      location: gl.getUniformLocation(program, `u_color${name === 'back' ? 'Back' : name}`),
      token: `--grain-${name}`,
    }))
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    releaseProgram = release
    paletteUpdate = () => {
      const style = view.getComputedStyle(canvas)
      for (const { location, token } of colors) {
        const color = style.getPropertyValue(token).trim()
        if (!/^#[0-9a-f]{6}$/iu.test(color)) return false
        const rgb = Number.parseInt(color.slice(1), 16)
        gl.uniform3f(location, ((rgb >> 16) & 255) / 255, ((rgb >> 8) & 255) / 255, (rgb & 255) / 255)
      }
      return true
    }
    if (!paletteUpdate()) {
      releaseProgram()
      releaseProgram = paletteUpdate = undefined
      return
    }
    render = () => {
      if (gl.isContextLost()) return
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(offset, top * ratio)
      gl.uniform1f(scale, ratio)
      gl.uniform1f(time, clock.seconds)
      gl.uniform1f(page, pageHeight)
      const current = pageWidth < 700 ? surface.narrow : surface.wide
      gl.uniform4f(sides, ...current.sides)
      gl.uniform4f(ends, ...current.ends)
      gl.uniform4f(corners, ...current.corners)
      gl.uniform2f(shape, current.calm, current.wavelength)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    // Painted: the CSS edges underneath can stop showing through.
    canvas.dataset.painted = ''
  }

  const stop = () => {
    if (frame !== undefined) view.cancelAnimationFrame(frame)
    frame = undefined
    last = undefined
  }
  const loop = (now: number) => {
    frame = undefined
    if (last === undefined) last = now
    if (now - last >= GRAIN_CADENCE) {
      clock.seconds += (now - last) / 1000 * GRAIN_SPEED
      last = now
      render?.()
    }
    frame = view.requestAnimationFrame(loop)
  }
  const settle = () => {
    if (!moving || document.hidden || render === undefined) stop()
    else if (frame === undefined) frame = view.requestAnimationFrame(loop)
  }
  /**
   * Keeps the canvas around the viewport, with a buffer of at least 40% of its height above
   * and below. Once the viewport comes within half a buffer of either end, the canvas moves
   * and repaints in the same frame. Past the end of the page the layer clips it.
   */
  const place = (sized: boolean) => {
    const bounds = layer.getBoundingClientRect()
    pageWidth = bounds.width
    pageHeight = bounds.height
    tallest = Math.max(tallest, view.innerHeight)
    const buffer = Math.ceil(Math.max(240, .4 * tallest) / STEP) * STEP
    const wanted = Math.ceil((tallest + 2 * buffer) / STEP) * STEP
    const scrolled = -bounds.top
    const near = top > 0 && scrolled - top < buffer / 2
    const far = top + height - (scrolled + view.innerHeight) < buffer / 2
    if (!sized && wanted === height && !near && !far) return
    ratio = Math.min(2, Math.max(1, view.devicePixelRatio))
    const width = Math.max(1, Math.round(bounds.width * ratio))
    const pixels = Math.max(1, Math.round(wanted * ratio))
    if (canvas.width !== width || canvas.height !== pixels) {
      canvas.width = width
      canvas.height = pixels
      gl.viewport(0, 0, width, pixels)
    }
    if (height !== wanted) canvas.style.height = `${wanted}px`
    height = wanted
    top = Math.max(0, Math.floor((scrolled - buffer) / STEP) * STEP)
    canvas.style.transform = `translateY(${top}px)`
    render?.()
  }
  const resize = () => place(true)
  const scroll = () => place(false)
  const lost = (event: Event) => {
    event.preventDefault()
    stop()
    delete canvas.dataset.painted
    render = releaseProgram = paletteUpdate = undefined
  }
  const restored = () => {
    initialize()
    resize()
    settle()
  }
  const scheme = view.matchMedia('(prefers-color-scheme: dark)')
  const recolor = () => {
    if (paletteUpdate?.()) render?.()
  }
  initialize()
  resize()
  settle()
  const sizing = new view.ResizeObserver(resize)
  sizing.observe(layer)
  view.addEventListener('scroll', scroll, { passive: true })
  view.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', settle)
  scheme.addEventListener('change', recolor)
  canvas.addEventListener('webglcontextlost', lost)
  canvas.addEventListener('webglcontextrestored', restored)
  return () => {
    stop()
    sizing.disconnect()
    view.removeEventListener('scroll', scroll)
    view.removeEventListener('resize', resize)
    document.removeEventListener('visibilitychange', settle)
    scheme.removeEventListener('change', recolor)
    canvas.removeEventListener('webglcontextlost', lost)
    canvas.removeEventListener('webglcontextrestored', restored)
    releaseProgram?.()
    delete canvas.dataset.painted
  }
}
