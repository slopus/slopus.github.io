import { grainGradientFragmentShader } from './grainGradientShader'

const vertexSource = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0., 1.); }
`

const PALETTE = ['back', '0', '1', '2', '3'] as const

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
 * Draws the Grain Gradient into one canvas, as happy-desktop's onboardingGrainRenderer does:
 * the native 33ms cadence, the clock paused while the canvas is out of view or the tab is
 * hidden, and a still first frame when `moving` is false. `offset` shifts the shader's time,
 * so panels on one page don't show the same frame. The palette is the canvas's `--grain-*`
 * custom properties (six-digit hex), read again when the color scheme changes.
 * Returns the one teardown that releases the program, observers, and listeners.
 */
export function grainGradientRenderer(canvas: HTMLCanvasElement, moving: boolean, clock: { seconds: number }, offset = 0) {
  const document = canvas.ownerDocument
  const view = document.defaultView
  // Without WebGL the CSS corner glows stay.
  if (view === null || typeof view.WebGLRenderingContext === 'undefined') return
  const gl = canvas.getContext('webgl', {
    alpha: true,
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
  let visible = false
  let last: number | undefined
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
    const time = gl.getUniformLocation(program, 'u_time')
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
      gl.uniform1f(time, offset + clock.seconds)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    // Painted: the CSS corner glows underneath can stop showing through.
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
    // Match the native 33ms cadence.
    if (now - last >= 33) {
      clock.seconds += (now - last) / 1000
      last = now
      render?.()
    }
    frame = view.requestAnimationFrame(loop)
  }
  const settle = () => {
    if (!moving || !visible || document.hidden || render === undefined) stop()
    else if (frame === undefined) frame = view.requestAnimationFrame(loop)
  }
  const resize = () => {
    const bounds = canvas.getBoundingClientRect()
    const ratio = Math.min(2, Math.max(1, view.devicePixelRatio))
    const width = Math.max(1, Math.round(bounds.width * ratio))
    const height = Math.max(1, Math.round(bounds.height * ratio))
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      gl.viewport(0, 0, width, height)
    }
    render?.()
  }
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
  const sizing = new view.ResizeObserver(resize)
  sizing.observe(canvas)
  const intersection = new view.IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting)
    settle()
  })
  intersection.observe(canvas)
  document.addEventListener('visibilitychange', settle)
  scheme.addEventListener('change', recolor)
  canvas.addEventListener('webglcontextlost', lost)
  canvas.addEventListener('webglcontextrestored', restored)
  return () => {
    stop()
    sizing.disconnect()
    intersection.disconnect()
    document.removeEventListener('visibilitychange', settle)
    scheme.removeEventListener('change', recolor)
    canvas.removeEventListener('webglcontextlost', lost)
    canvas.removeEventListener('webglcontextrestored', restored)
    releaseProgram?.()
    delete canvas.dataset.painted
  }
}
