// Every docs sidebar row, inactive and active, at 1440, 1180, 1024 and in the phone menu, in headless
// Chrome over the built dist/: fails if any row changes height or its label's line count when it
// becomes the active page (src/style.css, .docs-nav-label). Lists labels that wrap even when inactive.
// usage: pnpm build && node scripts/check-sidebar-rows.mjs   (CHROME=/path/to/chrome to pick the browser)
import { spawn } from 'node:child_process'
import { readFile, stat } from 'node:fs/promises'
import { extname } from 'node:path'
import { tmpdir } from 'node:os'
const SITE = 'http://happy.test'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.wasm': 'application/wasm', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain', '.xml': 'application/xml' }
async function launch({ root = 'dist', serve = true, profile = 'sidebar-rows', intercept = true } = {}) {
  async function file(pathname) {
    let p = root + decodeURIComponent(pathname)
    try { if ((await stat(p)).isDirectory()) p += (p.endsWith('/') ? '' : '/') + 'index.html' } catch { return [root + '/404.html', 404] }
    try { await stat(p); return [p, 200] } catch { return [root + '/404.html', 404] }
  }
  const shell = process.env.CHROME ?? (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'chromium')
  const chrome = spawn(shell, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--hide-scrollbars', '--remote-debugging-pipe',
    `--user-data-dir=${tmpdir()}/happy-${profile}-${process.pid}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'], env: process.env })
  const [to, from] = [chrome.stdio[3], chrome.stdio[4]]
  let id = 0, buf = ''; const pending = new Map(), handlers = []
  from.on('data', (c) => { buf += c; let i; while ((i = buf.indexOf('\0')) >= 0) { const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) } else for (const h of handlers) h(m) } })
  from.on('error', () => {})
  let session
  const send = (method, params = {}, sid = session) => new Promise((r) => { const n = ++id; pending.set(n, r); to.write(JSON.stringify({ id: n, method, params, ...(sid ? { sessionId: sid } : {}) }) + '\0') })
  const { result: { targetInfos } } = await send('Target.getTargets', {}, null)
  session = (await send('Target.attachToTarget', { targetId: targetInfos.find((t) => t.type === 'page').targetId, flatten: true }, null)).result.sessionId
  const evaluate = async (expression) => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? JSON.stringify(r.result.exceptionDetails)); return r.result?.result?.value }
  const page = { send, evaluate, handlers, chrome, delay: 0,
    close: () => chrome.kill(),
    async goto(path, wait = 1500) { await send('Page.navigate', { url: SITE + path }); await sleep(wait) },
    async metrics(width, height, mobile = width < 700) { await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile }) },
  }
  if (intercept) {
    handlers.push(async (m) => {
      if (m.method !== 'Fetch.requestPaused') return
      const { requestId, request } = m.params
      if (!request.url.startsWith(SITE)) return send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' })
      const [path, status] = await file(new URL(request.url).pathname)
      const body = await readFile(path)
      if (page.delay) await sleep(page.delay)
      send('Fetch.fulfillRequest', { requestId, responseCode: status, responseHeaders: [{ name: 'Content-Type', value: types[extname(path)] ?? 'application/octet-stream' }, { name: 'Content-Length', value: String(body.length) }], body: body.toString('base64') })
    })
    await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] })
  }
  await send('Page.enable')
  return page
}

const page = await launch()
const measure = `(() => {
  for (const d of document.querySelectorAll('details.docs-nav-fold')) d.open = true
  const nav = [...document.querySelectorAll('nav.docs-navigation')].find((n) => n.getClientRects().length)
  const links = [...nav.querySelectorAll('a')]
  const lines = (a) => { const r = document.createRange(); r.selectNodeContents(a.querySelector('.docs-nav-label > span') ?? a); return new Set([...r.getClientRects()].map((c) => Math.round(c.top))).size }
  const box = (a) => ({ h: Math.round(a.getBoundingClientRect().height * 10) / 10, lines: lines(a) })
  const out = []
  for (const a of links) {
    const was = a.getAttribute('aria-current')
    a.removeAttribute('aria-current'); const off = box(a)
    a.setAttribute('aria-current', 'page'); const on = box(a)
    if (was) a.setAttribute('aria-current', was); else a.removeAttribute('aria-current')
    out.push({ label: a.textContent, off, on })
  }
  return out
})()`
let failures = 0
const twoLine = new Map()
for (const [name, width, menu] of [['1440', 1440], ['1180', 1180], ['1024', 1024], ['phone', 390, true]]) {
  await page.metrics(width, 900)
  await page.goto('/welcome/')
  if (menu) { await page.evaluate("document.querySelector('.docs-mobile-trail').click()"); await new Promise((r) => setTimeout(r, 300)) }
  const rows = await page.evaluate(measure)
  const moved = rows.filter((r) => r.off.h !== r.on.h || r.off.lines !== r.on.lines)
  failures += moved.length
  for (const r of rows) if (r.off.lines > 1) twoLine.set(r.label, [...(twoLine.get(r.label) ?? []), name])
  console.log(`${name}: ${rows.length} rows, ${moved.length} move${moved.length ? ': ' + moved.map((r) => `${r.label} ${JSON.stringify(r.off)}→${JSON.stringify(r.on)}`).join('; ') : ''}`)
}
console.log('two lines while inactive:', [...twoLine].map(([l, w]) => `${l} (${w.join(', ')})`).join('; ') || 'none')
page.close()
process.exit(failures ? 1 : 0)
