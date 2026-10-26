// PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs node record.mjs video ../../.context/terra-video/out
// node record.mjs stills 0,1.5,3.2,4.8,6.6,8.5,10.9667 ../../.context/terra-video/stills
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const { chromium } = await import(process.env.PLAYWRIGHT_CORE ?? 'playwright-core');
const here = dirname(fileURLToPath(import.meta.url));
const [mode = 'stills', arg = '0', output] = process.argv.slice(2);
if (!['video', 'stills'].includes(mode)) throw new Error('Use video or stills');
const out = resolve(here, mode === 'video' ? (arg === '0' ? '../../.context/terra-video/out' : arg) : (output ?? '../../.context/terra-video/stills'));
const types = { '.html': 'text/html', '.css': 'text/css', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const server = createServer((request, response) => {
    const path = resolve(here, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    if (!path.startsWith(here + sep)) { response.writeHead(403).end(); return; }
    try { response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' }); response.end(readFileSync(path)); }
    catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ args: ['--no-sandbox'] });
try {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 2 });
    page.on('pageerror', error => { throw error; });
    await page.goto(`http://127.0.0.1:${server.address().port}/stage.html`);
    const info = await page.evaluate(() => window.ready);
    console.log(JSON.stringify(info));
    mkdirSync(out, { recursive: true });
    if (mode === 'stills') {
        for (const t of arg.split(',').map(Number)) {
            await page.evaluate(t => window.renderAt(t), t);
            await page.screenshot({ path: join(out, `t${t.toFixed(3)}.png`) });
        }
    } else {
        const frames = join(out, 'frames');
        rmSync(frames, { recursive: true, force: true });
        mkdirSync(frames, { recursive: true });
        for (let i = 0; i < info.duration * 30; i++) {
            await page.evaluate(t => window.renderAt(t), i / 30);
            await page.screenshot({ path: join(frames, `${String(i).padStart(5, '0')}.png`) });
            if (i % 60 === 0) console.log(`frame ${i}/${info.duration * 30}`);
        }
        const enc = args => execFileSync('ffmpeg', ['-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
        const input = ['-framerate', '30', '-i', join(frames, '%05d.png')];
        const h264 = ['-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-an', '-movflags', '+faststart'];
        enc([...input, ...h264, '-crf', '18', join(out, 'terra-1080p.mp4')]);
        enc([...input, '-vf', 'scale=1280:720:flags=lanczos', ...h264, '-crf', '22', join(out, 'terra-720p.mp4')]);
        enc(['-i', join(frames, '00000.png'), '-vf', 'scale=1200:675:flags=lanczos', '-frames:v', '1', join(out, 'poster.png')]);
    }
} finally {
    await browser.close();
    server.close();
}