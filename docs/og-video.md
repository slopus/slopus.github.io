# Link previews that play a video (og:video)

A desktop doc with `video` in `src/documents.ts` (today only `/stem-cell/`) previews as that
video. Checked October 23, 2026.

## What the served HTML carries

`scripts/generate-static-routes.mjs` writes these into the page's static HTML (crawlers run no
JavaScript), after `og:image:alt`:

```html
<meta property="og:type" content="video.other" />
<meta property="og:image" content="https://happy.engineering/og/stem-cell.png?v=3" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="675" />
<meta property="og:video" content="https://happy.engineering/video/stem-cell.mp4" />
<meta property="og:video:secure_url" content="https://happy.engineering/video/stem-cell.mp4" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="1280" />
<meta property="og:video:height" content="720" />
<meta name="twitter:card" content="summary_large_image" />
```

The build fails unless the MP4 is H.264 with `moov` before `mdat`, its size matches
`src/documents.ts`, the card is 1200 wide at the video's aspect ratio, and the two together stay
under iMessage's 10 MB.

## Per platform

| Where | Plays the video? | What it reads |
| --- | --- | --- |
| iMessage (iOS, macOS) | Yes, muted, looping, without a tap | `og:video` or `twitter:player:stream` pointing at a downloadable file (MP4). An HLS stream needs a tap; an embed page never plays. HTML at most 1 MB; icon, image and video at most 10 MB together. No meta refreshes, no JavaScript. [Apple TN3156](https://developer.apple.com/documentation/technotes/tn3156-create-rich-previews-for-messages) |
| Discord | Yes, inline player | `og:video` direct to an `.mp4`, `.webm` or `.mov` over HTTPS, **and** `og:type` `video`/`video.*` **or** `twitter:card` `player`. `og:image` is required and is the poster. One GET, 10 s for the whole fetch including measuring the video. [Discord docs](https://docs.discord.com/developers/link-previews/overview) |
| Telegram | Reportedly yes, for a direct MP4 | No official docs. Absolute HTTPS URLs, `og:image` as fallback. Previews are cached; add a query string to refetch. |
| Slack | No, the image | Inline video unfurls only for allow-listed providers (YouTube, Vimeo, Loom) or a Slack app's video block. |
| WhatsApp | No, the image | Reads title, description and `og:image` only. |
| LinkedIn | No, the image | Ignores `og:video` for links. |
| Facebook | Rarely | Meta lists `og:video` and `og:video:secure_url` but says playback is "not guaranteed". Expect the image. |
| X | No, the image | `summary_large_image` shows the card. A `player` card needs an HTTPS iframe page X will frame, plus `twitter:site`, and developers have reported player cards not rendering since 2023. The reliable way to play it on X is to attach the MP4 to the post itself and put the link in the text or a reply. |

## Notes

- check.supply, the site in @pfista's post (Oct 22, 2026), uses `og:type website` and
  `summary_large_image`, so it plays in iMessage only. Its file is a 2 s, 1200×630, 250 KB H.264
  MP4 with no audio track and the moov box first, the same size as its `og:image`.
- Same origin is not required by any of these; HTTPS and a direct file are. GitHub Pages serves
  `.mp4` as `video/mp4` with range requests.
- The card is a frame of the video at the video's aspect ratio. Slack, X, LinkedIn and WhatsApp
  show only the card, so take the frame that carries the hook: for the stem cell video, 1.4 s,
  once "What if… there was one?" is in. X crops a 16:9 card to 1.91:1, about 22 px off the top and bottom at 1200.
- Smaller is better: iMessage downloads the whole file before it plays. Short seamless loops do
  well; keep it silent.
- Previews are cached by URL: a new cut of a video that was already shared gets a new file name
  (and `src/documents.ts`), not an overwrite.

## Replacing the video

The page doesn't show this video; it is only the preview. Keep the names; the preview and the
build read them:

```sh
cp final.mp4 public/video/stem-cell.mp4      # H.264, yuv420p, faststart, no audio
ffmpeg -y -ss 1.4 -i public/video/stem-cell.mp4 -frames:v 1 -vf scale=1200:-1 public/og/stem-cell.png
```

If the new file isn't 1280×720, change `video` in `src/documents.ts`; the card must then be 1200 × round(1200 × height / width). To make an existing
MP4 fast-start without re-encoding: `ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4`.

## Clips on the page

A post can play captionless clips in its sections instead (`src/HoverClip.tsx`). An image whose
src is a folder, `![alt](/video/<name>/)`, is one: `clip.mov` (HEVC with
alpha, listed first for Safari, which plays WebM but drops its alpha into a black box), `clip.webm`
(VP9 with alpha, for the rest) and `poster.png`, its last frame. Copy a .mov with `cp`: even an
`ffmpeg -c copy` remux makes WebKit draw it blank. It rests on the
poster, plays once when the reader hovers the clip or its section, holds its last frame, and plays
again on the next hover; on a touch screen it plays when it scrolls into view.

```sh
ffmpeg -i frames/%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 34 -an clip.webm
ffmpeg -i frames/%04d.png -c:v hevc_videotoolbox -alpha_quality 0.8 -tag:v hvc1 -an clip.mov
ffmpeg -sseof -0.1 -i clip.webm -frames:v 1 -update 1 poster.png
```
