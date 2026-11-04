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

/**
 * The moment of the apps' animated field the page shows, in shader seconds: a still, the frame
 * the page always opened on.
 */
export const GRAIN_STILL = 0
/** The largest piece drawn at once, in device px, well inside every GPU's limits. */
const PIECE = 4096

/** A rectangle of the page: x and y from its top left. */
type Rect = { x: number; y: number; width: number; height: number }

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
 * into pieces no larger than PIECE.
 */
function pieces(rects: Rect[], ratio: number, width: number, height: number): Rect[] {
  const device = rects.map(rect => {
    const x0 = Math.max(0, Math.floor(rect.x * ratio))
    const y0 = Math.max(0, Math.floor(rect.y * ratio))
    const x1 = Math.min(width, Math.ceil((rect.x + rect.width) * ratio))
    const y1 = Math.min(height, Math.ceil((rect.y + rect.height) * ratio))
    return { x0, y0, x1, y1 }
  }).filter(({ x0, y0, x1, y1 }) => x1 > x0 && y1 > y0)
  // Bands across the page between every top and bottom edge, each the union of what covers it.
  const edges = [...new Set(device.flatMap(({ y0, y1 }) => [y0, y1]))].sort((a, b) => a - b)
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
    if (previous && previous.y1 === y0 && JSON.stringify(previous.spans) === JSON.stringify(spans)) previous.y1 = y1
    else if (spans.length) bands.push({ y0, y1, spans })
  }
  const result: Rect[] = []
  for (const { y0, y1, spans } of bands)
    for (const [x0, x1] of spans)
      for (let y = y0; y < y1; y += PIECE)
        for (let x = x0; x < x1; x += PIECE)
          result.push({ x, y, width: Math.min(PIECE, x1 - x), height: Math.min(PIECE, y1 - y) })
  return result
}

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
 * Draws the Grain Gradient as the page's surface, shaped by `surface`, as a still (GRAIN_STILL),
 * into `layer`, an element as large as the page. Only where the shader can put colour gets
 * canvases, each drawn once, in page space, by one WebGL context kept off the page, then handed
 * over as a bitmap; the layer's background is the plain base colour between them. They are drawn
 * again only when the page resizes or the colour scheme changes, all at once, so scrolling never
 * draws and moves nothing. The palette is the layer's `--grain-*` custom properties (six-digit
 * hex). Returns the one teardown that removes the canvases and releases the context and
 * listeners.
 */
export function grainGradientRenderer(layer: HTMLElement, surface: Surface) {
  const document = layer.ownerDocument
  const view = document.defaultView
  // Without WebGL the CSS edges stay.
  if (view === null || typeof view.WebGLRenderingContext === 'undefined' || typeof view.createImageBitmap !== 'function') return
  const source = document.createElement('canvas')
  const gl = source.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
    powerPreference: 'low-power',
  })
  if (gl === null) return

  let releaseProgram: (() => void) | undefined
  let render: ((piece: Rect, shape: SurfaceShape, ratio: number, width: number, height: number) => void) | undefined
  let paletteUpdate: (() => boolean) | undefined
  let shown: HTMLCanvasElement[] = []
  let settle: number | undefined

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
    const origin = gl.getUniformLocation(program, 'u_origin')
    const scale = gl.getUniformLocation(program, 'u_ratio')
    const time = gl.getUniformLocation(program, 'u_time')
    const pageWidth = gl.getUniformLocation(program, 'u_width')
    const pageHeight = gl.getUniformLocation(program, 'u_height')
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
      const style = view.getComputedStyle(layer)
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
    render = (piece, current, ratio, width, height) => {
      if (source.width !== piece.width || source.height !== piece.height) {
        source.width = piece.width
        source.height = piece.height
      }
      gl.viewport(0, 0, piece.width, piece.height)
      gl.uniform2f(resolution, piece.width, piece.height)
      gl.uniform2f(origin, piece.x, piece.y)
      gl.uniform1f(scale, ratio)
      gl.uniform1f(time, GRAIN_STILL)
      gl.uniform1f(pageWidth, width / ratio)
      gl.uniform1f(pageHeight, height)
      gl.uniform4f(sides, ...current.sides)
      gl.uniform4f(ends, ...current.ends)
      gl.uniform4f(corners, ...current.corners)
      gl.uniform2f(shape, current.calm, current.wavelength)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
  }

  // What the canvases show; they are drawn again only when this changes.
  let drawn = ''
  let pass = 0
  const paint = async () => {
    if (render === undefined) return
    const bounds = layer.getBoundingClientRect()
    const ratio = Math.min(2, Math.max(1, view.devicePixelRatio))
    const width = Math.max(1, Math.round(bounds.width * ratio))
    const height = bounds.height
    const palette = view.getComputedStyle(layer).getPropertyValue('--grain-back')
    const wanted = `${width} ${height} ${ratio} ${palette}`
    if (wanted === drawn) return
    drawn = wanted
    const current = ++pass
    if (!paletteUpdate?.()) return
    const shape = bounds.width < 700 ? surface.narrow : surface.wide
    const made: HTMLCanvasElement[] = []
    for (const piece of pieces(colouredRects(shape, width / ratio, height), ratio, width, Math.ceil(height * ratio))) {
      if (render === undefined || current !== pass) return
      render(piece, shape, ratio, width, height)
      const bitmap = await view.createImageBitmap(source)
      if (current !== pass) { bitmap.close(); return }
      const canvas = document.createElement('canvas')
      canvas.width = piece.width
      canvas.height = piece.height
      Object.assign(canvas.style, {
        left: `${piece.x / ratio}px`, top: `${piece.y / ratio}px`,
        width: `${piece.width / ratio}px`, height: `${piece.height / ratio}px`,
      })
      const bitmapContext = canvas.getContext('bitmaprenderer')
      if (bitmapContext) bitmapContext.transferFromImageBitmap(bitmap)
      else { canvas.getContext('2d')?.drawImage(bitmap, 0, 0); bitmap.close() }
      made.push(canvas)
    }
    // All at once: the old canvases go as the new ones arrive.
    for (const canvas of shown) canvas.remove()
    layer.append(...made)
    shown = made
    if (!('painted' in layer.dataset)) {
      // Painted: the canvases fade in over the CSS edges, which then give way to the plain base.
      void view.getComputedStyle(made[0] ?? layer).opacity
      layer.dataset.painted = ''
      settle = view.setTimeout(() => { layer.dataset.settled = '' }, 700)
    }
  }
  // The first paint goes at once; later ones wait for the page to stop changing size, as it does
  // while it loads, so it is painted again once rather than at every step.
  let wait: number | undefined
  const schedule = () => {
    view.clearTimeout(wait)
    if (drawn === '') void Promise.resolve().then(paint)
    else wait = view.setTimeout(paint, 150)
  }
  const lost = (event: Event) => {
    event.preventDefault()
    render = releaseProgram = paletteUpdate = undefined
    drawn = ''
    pass++
  }
  const restored = () => {
    initialize()
    schedule()
  }
  const scheme = view.matchMedia('(prefers-color-scheme: dark)')
  initialize()
  schedule()
  const sizing = new view.ResizeObserver(schedule)
  sizing.observe(layer)
  view.addEventListener('resize', schedule)
  scheme.addEventListener('change', schedule)
  source.addEventListener('webglcontextlost', lost)
  source.addEventListener('webglcontextrestored', restored)
  return () => {
    pass++
    sizing.disconnect()
    view.removeEventListener('resize', schedule)
    scheme.removeEventListener('change', schedule)
    source.removeEventListener('webglcontextlost', lost)
    source.removeEventListener('webglcontextrestored', restored)
    view.clearTimeout(settle)
    view.clearTimeout(wait)
    releaseProgram?.()
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    for (const canvas of shown) canvas.remove()
    delete layer.dataset.painted
    delete layer.dataset.settled
  }
}
