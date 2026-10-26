# GPT-6.1 Terra promo

The 11-second announcement for `/changelog/gpt-6-1-terra/`: a 1280 × 720 link-preview MP4 and a
1920 × 1080 MP4 for attaching to X. Both are silent H.264 High, yuv420p, 30 fps,
with `moov` before `mdat`. The poster is the first frame, 1200 × 675.

- `stage.html`: a 960 × 540 stage, rendered at 2×. `renderAt(t)` sets every
  opacity and scroll position from the supplied time; no wall-clock animation.
- `record.mjs`: serves the local assets, drives headless Chromium frame by frame,
  and encodes both MP4s and the poster with ffmpeg.
- `picker/dom.html`: the real `ComposerModelControl` DOM with Terra selected at
  Medium effort, exported from happy-desktop `b61dd52145be0088d1faae99148f5648e7f99925`
  on October 26, 2026. The fixture used `happyAgentMenusDerive` →
  `happyAgentComposerModelControlProps` → `Composer` / `ComposerModelControl`.
- `picker/catalog.json`: that fixture's exact 18-model catalog (5 Codex, 8 Claude,
  5 Grok), supplied from Happy Agent's cleaned model catalog. No GPT-5.6 models.
- `picker/metadata.json`: the original export's theme, selection and geometry.
- `picker/theme.css` and `picker/styles/`: the shipped theme and picker, scrollbar
  and icon CSS at the same revision. Only the theme's two font URLs were changed
  to local files. The glyph fonts and Figtree are the app's actual assets.
- `picker/frame.html`: mounts that snapshot without React. It shortens the native
  list viewport, keeps panel widths, insets, row heights and bottom alignment,
  crops the trigger below the shot, and exposes deterministic scroll/fade control.
  The stage enlarges both panels together by 1.25×; it never rearranges providers.
- `assets/dm-sans.ttf`: the site's DM Sans, from the Google Fonts revision pinned
  in `notes/og/cards.py`, for captions and the end wordmark. The wordmark copies
  `src/style.css`: Happy `#183f38`, Engineering `#e6522c`, `.28em` gap, 700 weight,
  `-.04em` tracking. The end card changes only its size.

## Render

Needs Node 22+, ffmpeg with libx264, and `playwright-core` with its Chromium.
Set `PLAYWRIGHT_CORE` to its `index.mjs` if it is not installed locally. On a
sandboxed host the browser and local asset server may need reviewed full access.

From the repository root:

```sh
PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs \
  node notes/terra-video/record.mjs video ../../.context/terra-video/out

PLAYWRIGHT_CORE=/path/to/playwright-core/index.mjs \
  node notes/terra-video/record.mjs stills 0,1.5,3.2,4.8,5.5,6.6,8.5,10.9667

cp .context/terra-video/out/terra-720p.mp4 public/video/terra.mp4
cp .context/terra-video/out/terra-1080p.mp4 public/video/terra-1080p.mp4
cp .context/terra-video/out/poster.png public/og/terra.png
ffmpeg -y -i public/og/terra.png -quality 90 public/video/terra-poster.webp
pnpm build
```

Output arguments resolve relative to this directory. Rendered frames and review
stills stay in ignored `.context/`, not in the source directory. The changelog
embeds `terra.mp4`; its `video` entry in `src/changelog.ts` adds the permalink's preview tags.
Follow `docs/og-video.md` when replacing a previously shared cut: give it a new
file name so preview caches fetch it again.

## Beats

| Time | Caption | Picker / end card |
| --- | --- | --- |
| 0–2.3 | GPT-6.1 Terra is in Happy. | Terra selected; all five Codex models visible, Claude faded |
| 2.3–4.1 | Alongside Claude and Grok. | Scroll through Claude while it brightens from 18% to full opacity |
| 4.1–5.8 | Same caption | Scroll through Grok while it brightens from 18% to full opacity |
| 5.8–6.9 | Same caption | Ease back to Terra; the settings panel always names Terra and Medium |
| 6.9–7.5 | Caption fades | Crossfade to the wordmark |
| 7.5–9.9 | — | Happy Engineering held at full opacity |
| 9.9–10.9 | Opening returns | Ease back to the hook, providers faded again |
| 10.9–11 | Opening | Identical to the first frame |

The opening alone announces the model; no blank or fade-in opening. The first
and final rendered frames match pixel for pixel. Review the encoded output at
0, 1.5, 3.2, 4.8, 5.5, 6.6, 8.5 and 10.9667 seconds: first-frame hook, highlight,
both visible fades, full Grok, Terra return, held wordmark and final hook.

## Updating the picker snapshot

Use happy-desktop's real light-theme `ComposerModelControl` with the committed
catalog passed through the real menus derivation and UI adapter. Select Terra,
keep Medium effort, open Model, then export the control's `outerHTML` after fonts
load. Update the revision and metadata here along with its CSS and font assets.
Preserve the actual provider/model labels, order and selected-row checkmark.
The snapshot is a static promo fixture; it never calls a model or mutates a daemon.