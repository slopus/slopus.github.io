// Renders the phone corners of the Grain Gradient (GrainCorners in src/GrainGradient.tsx) with the
// page's own shader, frame by frame, to public/video/grain/: a looping H.264 movie per corner and
// colour scheme, and its frame 0 as AVIF. Needs ffmpeg with libx264 and libaom, and Playwright:
//   PLAYWRIGHT=/path/to/playwright node notes/grain/render-corners.mjs [top-right-light ...]
// With no names it renders all four. Without a GPU (SwiftShader) each frame takes seconds.
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const { chromium } = (await import(process.env.PLAYWRIGHT ?? 'playwright')).default ?? await import(process.env.PLAYWRIGHT ?? 'playwright')
const root = path.resolve(import.meta.dirname, '../..')
const out = path.join(root, 'public/video/grain')
const source = fs.readFileSync(path.join(root, 'src/grainGradientShader.ts'), 'utf8')
const shader = source.slice(source.indexOf('`', source.indexOf('grainGradientFragmentShader =')) + 1, source.lastIndexOf('`'))

// The box each corner is drawn in, in CSS px, at 1.5 device px each: at 2, Chromium compositing
// the movie in software stalled the page's main thread for most of a second at a time. The blobs'
// radii are the ones the phone surface had, and the page is wide and tall enough that each corner
// is alone in its half.
const SIZE = 512, RATIO = 1.5, PAGE = { width: 1400, height: 2048 }
const CORNERS = { 'top-right': [0, 270, 0, 0], 'bottom-left': [0, 0, 300, 0] }
const PALETTES = {
  light: ['#f4f2ff', '#818cf8', '#c4b5fd', '#93c5fd', '#a78bfa'],
  dark: ['#06050f', '#4338ca', '#7c3aed', '#1d4ed8', '#2a00ff'],
}
// 12s at 15 fps. The field moves on from the page's still (GRAIN_STILL, 0) and back, easing at
// both ends, up to 4.5 shader seconds: at most about the apps' own speed, and a loop with no seam.
const FPS = 15
const FRAMES = 12 * FPS
const REACH = 4.5
const only = process.argv.slice(2)
const elapsed = frame => REACH * (1 - Math.cos(2 * Math.PI * frame / FRAMES)) / 2
const N = SIZE * RATIO
const TAGS = ['-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1']

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] })
const page = await browser.newPage()
await page.evaluate(({ shader, N }) => {
  const canvas = Object.assign(document.createElement('canvas'), { width: N, height: N })
  const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: true })
  const compile = (type, text) => { const s = gl.createShader(type); gl.shaderSource(s, text); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s }
  const program = gl.createProgram()
  gl.attachShader(program, compile(gl.VERTEX_SHADER, 'attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0., 1.); }'))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, shader))
  gl.linkProgram(program)
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'a_position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  gl.viewport(0, 0, N, N)
  const pixels = new Uint8Array(N * N * 4)
  window.draw = (uniforms) => {
    for (const [name, value] of Object.entries(uniforms)) gl[`uniform${value.length}fv`](gl.getUniformLocation(program, name), value)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.readPixels(0, 0, N, N, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    let text = ''
    for (let i = 0; i < pixels.length; i += 0x8000) text += String.fromCharCode(...pixels.subarray(i, i + 0x8000))
    return btoa(text)
  }
}, { shader, N })

const rgb = hex => [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16) / 255)
const run = (args, input) => new Promise((resolve, reject) => {
  const child = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] })
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`)))
  if (input) input(child.stdin)
})
fs.mkdirSync(out, { recursive: true })
for (const [corner, corners] of Object.entries(CORNERS)) {
  const origin = corner === 'top-right' ? [(PAGE.width - SIZE) * RATIO, 0] : [0, (PAGE.height - SIZE) * RATIO]
  for (const [scheme, palette] of Object.entries(PALETTES)) {
    const name = `${corner}-${scheme}`
    if (only.length && !only.includes(name)) continue
    const raw = ['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${N}x${N}`, '-r', `${FPS}`, '-i', '-', '-vf', 'vflip']
    await run([...raw, '-c:v', 'libx264', '-preset', 'veryslow', '-crf', '30', '-tune', 'grain', '-pix_fmt', 'yuv420p', '-g', `${FRAMES}`,
      ...TAGS, '-movflags', '+faststart', '-an', path.join(out, `${name}.mp4`)], async stdin => {
      for (let frame = 0; frame < FRAMES; frame++) {
        const pixels = await page.evaluate(uniforms => window.draw(uniforms), {
          u_resolution: [N, N], u_origin: origin, u_ratio: [RATIO], u_time: [0], u_elapsed: [elapsed(frame)],
          u_zone: [1e6, 1, 1e6, 1], u_width: [PAGE.width], u_height: [PAGE.height], u_sides: [0, 0, 0, 0], u_ends: [0, 0, 0, 0],
          u_corners: corners, u_shape: [175, 700], u_colorBack: rgb(palette[0]), u_color0: rgb(palette[1]), u_color1: rgb(palette[2]),
          u_color2: rgb(palette[3]), u_color3: rgb(palette[4]),
        })
        if (!stdin.write(Buffer.from(pixels, 'base64'))) await new Promise(resolve => stdin.once('drain', resolve))
      }
      stdin.end()
    })
    // Frame 0 from the movie's own YUV, with its tags, so the browser converts the two the same way.
    await run(['-i', path.join(out, `${name}.mp4`), '-frames:v', '1', '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '34', '-cpu-used', '2', ...TAGS, path.join(out, `${name}.avif`)])
    console.log(name, fs.statSync(path.join(out, `${name}.mp4`)).size, fs.statSync(path.join(out, `${name}.avif`)).size)
  }
}
await browser.close()
