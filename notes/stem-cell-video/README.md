# Stem cell promo video

The link-preview video for `/stem-cell/` and the meme clip in the post, with everything needed to
render them again frame for frame.

- `stage.html`: the promo (960 × 540, rendered at 2× for 1080p). `renderAt(t)` draws any moment
  deterministically; nothing depends on wall-clock time.
- `meme.html`: the Two Buttons meme with a live otter in the bottom panel, for the post (600 × 874).
- `record.mjs`: drives either page in headless Chromium, one screenshot per frame at 30 fps, then
  ffmpeg encodes the MP4s and a poster.
- `engine.js`: happy-desktop's stem cell engine, bundled unchanged from `engine/` (copies of
  `packages/happy-desktop-ui/src/stemCellEngine.ts` and `stemCellGeometry.ts`, identical to
  happy-desktop `origin/main` 8601bdfa on Oct 23 2026).
- `face.mjs`: writes `assets/bot-face*.svg` from the DiceBear pack happy-desktop gives new bots.
- `otter-grade.py`: the real otter take's water grade (see Otter below).

## Render

Needs Node 22+, ffmpeg, and `playwright-core` with its Chromium. Use a machine with a real GPU: the
stem cell is the shipped WebGL2 shader, and Chromium runs it on ANGLE Metal on a Mac.

```sh
# The promo: out/stem-cell-1080p.mp4, out/stem-cell-720p.mp4 (the og:video), out/poster.png (1.4 s)
PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs node record.mjs video out

# Review stills at chosen moments, in seconds
node record.mjs stills 0,4.5,13,21 stills

# The meme clip: unpack the otter's frames first (the page plays them forward, then back)
mkdir -p assets/otter-sea-slate
ffmpeg -i assets/otter-sea-slate.mp4 -start_number 0 -q:v 2 assets/otter-sea-slate/%04d.jpg
STAGE_PAGE=meme.html STAGE_W=600 STAGE_H=874 STAGE_DPR=1 OUT_NAME=meme POSTER_T=0 \
  STAGE_QUERY="otter=assets/otter-sea-slate&ext=jpg&frames=118&fps=25&speed=1" node record.mjs video out-meme
# The drawn otter instead: otter-gen-comic-c, frames=158

# Rebuild engine.js after updating engine/ from happy-desktop
esbuild engine/engine-entry.ts --bundle --format=iife --global-name=Stem --outfile=engine.js

# Rebuild the bot face (needs a happy-desktop checkout with its node_modules)
HAPPY_DESKTOP=~/Developer/happy-desktop node face.mjs assets
```

`PLAYWRIGHT_CORE` can be left out where `playwright-core` resolves from here. On macOS the
agent sandbox crashes Chromium; run the render unsandboxed. The first and last frames of the
promo are identical (checked pixel for pixel), so it loops without a cut.

## What the video says

25.2 s, one line of narration at a time, always in the same place:

| Time | Line | On screen |
|---|---|---|
| 0.0 | Too many ways to start. | New task, +, New tab / New window, New chat, New bot / New todo list, New document |
| 2.5 | What if there was *one*? | Each button contracts into a cell; the cells flow into one stem cell, labelled "New" |
| 5.4 | Enter *Stem Cell Mode*. | The stem cell and "New", waiting |
| 7.8 | Just say what it is. | The composer; `ping me on serious posthog alerts` is typed and sent |
| 11.5 | It names itself. | The cell divides into the `alerting` clay icon; "New" becomes "PostHog alerts" |
| 15.2 | And becomes a bot. | The bot face settles on the icon's corner |
| 18.1 | Your interface needs *one* button to start work and *one* input box. That's it. | The page is otherwise empty; held 4 s |

The name and icon are what the product really produces: the shipped naming prompts (happy-agent
`ad28ee9f4`) gave "PostHog alerts" on Opus 5.5 and Sonnet 5.5, and the icon `alerting` on every
model tried. The cell growth is the shipped engine at the shipped 2.5 s.

## Findings

- **Story beats out-rank speed.** A 10 s cut with the meme read as busy and rushed. One caption per
  step, a held result, and a quiet quote card at the end read better, at the cost of length.
- **Stable geometry.** Every element has one fixed place and only fades or scales in it; the
  buttons contract where they stand and the cells travel to one anchor. Nothing reflows.
- **A smooth gather.** The goo filter (blur + alpha threshold) merges the travelling cells into the
  waiting cell, which grows by area as it takes each one in, so the mass is conserved. The merge
  only runs while cells are arriving; then the unmerged cell takes over over 0.3 s, which hides the
  filter's slightly softer edge. Merging all the way, then swapping in the cell, popped.
- **The bot face** is DiceBear's Adventurer Neutral, the pack happy-desktop draws new bots from
  (`BotFace.tsx`), by Lisa Wischofsky, CC BY 4.0, so credit it wherever the video is shown. Here it
  is ink only: sunglasses (glasses variant01), mouth variant01, on an outlined rounded square like
  the Lucide icons beside it. The same face is the New bot button's icon.
- **og:video** plays inline in iMessage (muted, looping, from a direct MP4) and Discord (needs
  `og:type` `video.*`); Telegram reportedly too. Slack, WhatsApp, LinkedIn and Facebook show
  `og:image`; X never plays it, so on X attach the MP4 to the post and put the link in the text.
  The card is the 1.4 s frame, where the first line and every button are on screen.
- **The meme** (Two Buttons, Jake Clark) moved to the post: in the promo it competed with the
  story. It is cropped above the artist's signature, and the post credits him under the clip.
- **Otter.** Real footage: Pexels 2554576, "An Otter Swimming" by Magda Ehlers (Pexels License),
  4.20–8.92 s, cropped 1420 × 1080 at x = 80. A fal BiRefNet video matte (`fal-ai/birefnet/v2/video`,
  Matting) separates the otter, and `otter-grade.py` regrades only the water to the panel's slate
  blue, so the otter is untouched and stands out. The drawn alternative (`otter-gen-comic-c`) is the
  panel redrawn with an otter in the sweating man's pose by `fal-ai/nano-banana-pro/edit`, then
  animated by `minimax/h3/image-to-video` with the same first and last frame; about $4 of fal in
  all. Both loop forward and back.
- **Review.** Two model reviewers (GPT-6 Astra, Gemini 4 Argon) watched earlier cuts against
  successful promos (pfista's og:video post, Linear, Notion, Cursor). Their fixes that still apply:
  a hook on the first frame, larger UI text for small previews, no shortcut keys, and easing every
  state change instead of switching it.
