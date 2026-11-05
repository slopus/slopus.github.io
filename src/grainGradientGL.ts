import { grainGradientFragmentShader } from './grainGradientShader'

const vertexSource = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0., 1.); }
`

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

/** A rectangle of the page: x and y from its top left. */
export type Rect = { x: number; y: number; width: number; height: number }

/** Rows that move, in CSS px: fully in the first `top` and last `bottom`, fading out over the `fade`s after them. */
export type Zone = readonly [top: number, topFade: number, bottom: number, bottomFade: number]
/** No row moves. */
export const STILL_ZONE: Zone = [-1, 1, -1, 1]

/** Everything one piece of the page needs, besides the palette. */
export type GrainFrame = {
  /** The piece, in device px of the page. */
  piece: Rect
  shape: SurfaceShape
  /** Device px per CSS px. */
  ratio: number
  /** The page's width in device px and height in CSS px. */
  width: number
  height: number
  /** The still's moment, and how many seconds the moving rows are past it. */
  still: number
  elapsed: number
  zone: Zone
}

/** The palette's five colours, base first, as six-digit hex. */
export type GrainPalette = readonly string[]

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
 * The Grain Gradient's program in `gl`, whose canvas each draw sizes to its piece. Undefined if
 * it does not compile. The worker (grainGradientWorker.ts) and the main thread's fallback
 * (grainGradientRenderer.ts) both draw with it, so their pixels are the same.
 */
export function grainProgram(gl: WebGLRenderingContext, canvas: { width: number; height: number }) {
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
    return undefined
  }
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  const position = gl.getProgramParameter(program, gl.LINK_STATUS) ? gl.getAttribLocation(program, 'a_position') : -1
  if (position < 0) {
    release()
    return undefined
  }
  const at = (name: string) => gl.getUniformLocation(program, name)
  const resolution = at('u_resolution')
  const origin = at('u_origin')
  const scale = at('u_ratio')
  const time = at('u_time')
  const elapsed = at('u_elapsed')
  const zone = at('u_zone')
  const pageWidth = at('u_width')
  const pageHeight = at('u_height')
  const sides = at('u_sides')
  const ends = at('u_ends')
  const corners = at('u_corners')
  const shape = at('u_shape')
  const colors = ['u_colorBack', 'u_color0', 'u_color1', 'u_color2', 'u_color3'].map(at)
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  return {
    /** False, and nothing set, unless all five are six-digit hex. */
    palette(palette: GrainPalette) {
      if (palette.length !== colors.length || !palette.every(color => /^#[0-9a-f]{6}$/iu.test(color))) return false
      palette.forEach((color, index) => {
        const rgb = Number.parseInt(color.slice(1), 16)
        gl.uniform3f(colors[index], ((rgb >> 16) & 255) / 255, ((rgb >> 8) & 255) / 255, (rgb & 255) / 255)
      })
      return true
    },
    draw({ piece, shape: current, ratio, width, height, still, elapsed: seconds, zone: rows }: GrainFrame) {
      if (canvas.width !== piece.width || canvas.height !== piece.height) {
        canvas.width = piece.width
        canvas.height = piece.height
      }
      gl.viewport(0, 0, piece.width, piece.height)
      gl.uniform2f(resolution, piece.width, piece.height)
      gl.uniform2f(origin, piece.x, piece.y)
      gl.uniform1f(scale, ratio)
      gl.uniform1f(time, still)
      gl.uniform1f(elapsed, seconds)
      gl.uniform4f(zone, ...rows)
      gl.uniform1f(pageWidth, width / ratio)
      gl.uniform1f(pageHeight, height)
      gl.uniform4f(sides, ...current.sides)
      gl.uniform4f(ends, ...current.ends)
      gl.uniform4f(corners, ...current.corners)
      gl.uniform2f(shape, current.calm, current.wavelength)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    release,
  }
}

export type GrainProgram = NonNullable<ReturnType<typeof grainProgram>>
