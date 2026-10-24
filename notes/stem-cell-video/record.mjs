// node record.mjs stills 0,3.5,5.5 [out-dir]   -> PNG stills at those times
// node record.mjs video [out-dir]              -> every frame at 30 fps, then MP4s and a poster
//
// The page is stage.html at 960 × 540, twice over for 1080p, unless the environment says otherwise:
//   STAGE_PAGE=meme.html STAGE_W=600 STAGE_H=874 STAGE_DPR=1 OUT_NAME=meme   (one MP4 at the page's size)
//   STAGE_QUERY="otter=assets/otter-x&ext=jpg&frames=118"                   (appended to the page's URL)
//   POSTER_T=1.4                                                             (the poster's moment, in seconds)
//   PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs                      (any playwright-core 1.4x+)
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const { chromium } = await import(
    process.env.PLAYWRIGHT_CORE ??
        "playwright-core"
);
const here = dirname(fileURLToPath(import.meta.url));
const [mode = "stills", arg = "0", outArg] = process.argv.slice(2);
const out = join(here, mode === "video" ? (arg !== "0" ? arg : "out") : (outArg ?? "stills"));
const FPS = 30;
const PAGE = process.env.STAGE_PAGE ?? "stage.html";
const W = Number(process.env.STAGE_W ?? 960), H = Number(process.env.STAGE_H ?? 540);
const DPR = Number(process.env.STAGE_DPR ?? 2);

// The real GPU, so the stem cell draws on WebGL2 exactly as the app's does.
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist", "--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
page.on("console", (m) => console.log("[page]", m.text()));
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(pathToFileURL(join(here, PAGE)).href + (process.env.STAGE_QUERY ? `?${process.env.STAGE_QUERY}` : ""));
const info = await page.evaluate(() => window.ready);
console.log("renderer:", info.renderer, "duration:", info.duration.toFixed(2), "s");
console.log("timeline:", JSON.stringify(info.T, (k, v) => (typeof v === "number" ? +v.toFixed(2) : v)));

mkdirSync(out, { recursive: true });
if (mode === "stills") {
    for (const t of arg.split(",").map(Number)) {
        await page.evaluate((time) => window.renderAt(time), t);
        await page.screenshot({ path: join(out, `t${t.toFixed(2).padStart(5, "0")}.png`) });
    }
} else {
    const frames = join(out, "frames");
    rmSync(frames, { recursive: true, force: true });
    mkdirSync(frames, { recursive: true });
    const count = Math.round(info.duration * FPS);
    for (let i = 0; i < count; i++) {
        await page.evaluate((time) => window.renderAt(time), i / FPS);
        await page.screenshot({ path: join(frames, `${String(i).padStart(5, "0")}.png`) });
        if (i % 60 === 0) console.log(`frame ${i}/${count}`);
    }
    const enc = (args) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...args], { stdio: "inherit" });
    const input = ["-framerate", String(FPS), "-i", join(frames, "%05d.png")];
    const h264 = ["-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart"];
    if (process.env.OUT_NAME) {
        enc([...input, ...h264, "-crf", "20", join(out, `${process.env.OUT_NAME}.mp4`)]);
    } else {
        enc([...input, ...h264, "-crf", "16", join(out, "stem-cell-1080p.mp4")]);
        enc([...input, "-vf", "scale=1280:720:flags=lanczos", ...h264, "-crf", "22", join(out, "stem-cell-720p.mp4")]);
    }
    // The poster is the hook: every button and the first line (POSTER_T, default 1.4 s).
    const posterFrame = String(Math.min(count - 1, Math.round(Number(process.env.POSTER_T ?? 1.4) * FPS))).padStart(5, "0");
    enc(["-i", join(frames, `${posterFrame}.png`), "-vf", "scale=1200:-2:flags=lanczos", join(out, "poster.png")]);
    console.log("wrote", out);
}
await browser.close();
