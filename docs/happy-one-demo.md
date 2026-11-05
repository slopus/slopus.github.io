# Happy One homepage demo

## Current layout: the window and the phone on the page

The hero shows the take as two devices standing straight on the page's gradient
surface, with no stage, panel, or wallpaper around them: the recorded Mac window
on the page's axis, and the phone parked beside its right edge, hanging 12px
below it. This is the v22 layout (homepage from 2026-09-17 until the composed
movie, `08a5188^`), with the split player from the archived draft (`4c9dafb` on
`archive/homepage-video-sizing`), without that draft's caption line, phone label,
and hint.

The hero plays team take 11, in `public/video/happy-one/team-take11/`: the split
exports of happy-desktop's `scripts/demo/demos/team` (`ed8c1a87` on
`worktree/demo-take-10`, which keeps the take's records under
`selected/take11/`), copied byte for byte. Kirill picks Opus 5.5 from the open
model list and sends; the task is in Steve's sidebar on his phone at once; Opus
hands the code to a subtask and puts up a live preview; Steve opens the task on
his phone and answers "narrower, five bars max", and Opus narrows it to five
bars. The window, a golden-ratio 2266×1400, and the phone screen are separate
tracks on the cut's 60fps clock, 3,120 frames (52.0s), so frame i of each is
frame i of the composed movie; the window tracks carry its soundtrack and its
traffic lights. The cut drops 17 freezes (175 frames) and plays Steve's typing at
double speed (`edits` in `take.json`).
The last 0.6s dissolves into frame 0, so the loop has no seam. `take.json` holds the cues;
`captions.vtt` holds the composed movie's captions, which the hero does not show.

| Asset | Encoding | Size |
| --- | --- | --- |
| `desktop.webm` / `.mp4` | AV1 + Opus / H.264 High 5.1 + AAC, 2266×1400, 60fps | 4,919,048 / 5,866,070 bytes |
| `desktop-30.webm` / `.mp4` | AV1 + Opus / H.264 High 5.1 + AAC, 1812×1120, 30fps | 2,044,892 / 3,342,521 bytes |
| `phone.webm` / `.mp4` | AV1 / H.264 High 5.1, 1206×2622, 60fps | 4,986,139 / 7,342,738 bytes |
| `phone-30.webm` / `.mp4` | AV1 / H.264 High 5.1, 964×2098, 30fps | 2,372,987 / 4,174,951 bytes |
| `desktop-poster.webp`, `phone-poster.webp` | frame 0 | 112,996 / 107,798 bytes |
| `poster/desktop-{1133,2266}.avif`, `poster/desktop-30-{906,1812}.avif` | frame 0, AVIF | 20,494 / 57,623, 19,067 / 44,570 bytes |
| `poster/phone-{603,1206}.avif`, `poster/phone-30-{482,964}.avif` | frame 0, AVIF | 17,420 / 43,773, 16,788 / 40,753 bytes |

**The first screen is the stills.** Each movie has its frame 0 drawn under it
(`Still` in `src/HappyOneDemo.tsx`): the AVIFs above, from which the browser
takes the smallest sharp enough for the width the page draws it at, with the
WebP poster for browsers without AVIF; the same still is the movie's `poster`, so
native controls (reduced motion, Save-Data) never show a dark box. The window's
is the page's LCP image and loads at high priority. Both movies are
`preload="none"` until the page has loaded and is idle, and load only if they
will play; they then play over the stills from the same frame. Each still is
encoded from its own cut's YUV frame 0, natively and at exactly half size,
carrying the movie's BT.709 tags, so the browser converts both the same way, and
is offered under the same `media` as that cut: the 60fps and 30fps cuts differ
in aspect ratio by up to 0.1%, enough to put a still from the other cut a device
pixel off. Decoded by Chromium at their own size, each still and its frame 0
agree to 46-48 dB, with no colour shift. Drawn on the page they sit on the same
pixels, but Chromium scales a playing movie with a plainer filter than an image,
so text in the movie is a touch crisper than in the still; no format of the
still changes that, and the WebP poster before this had the same. With a new take, regenerate
them from `public/video/happy-one/<take>/`:

```sh
T="-color_range tv -colorspace bt709 -color_primaries bt709 -color_trc iec61966-2-1"
still() { # source width|native out
  scale=$([ "$2" = native ] || echo "-vf scale=$2:-1:flags=lanczos")
  ffmpeg -y -i "$1" -frames:v 1 $scale -c:v libaom-av1 -still-picture 1 -crf 20 -cpu-used 2 $T "poster/$3"
}
still desktop.webm 1133 desktop-1133.avif; still desktop.webm native desktop-2266.avif
still desktop-30.webm 906 desktop-30-906.avif; still desktop-30.webm native desktop-30-1812.avif
still phone.webm 603 phone-603.avif; still phone.webm native phone-1206.avif
still phone-30.webm 482 phone-30-482.avif; still phone-30.webm native phone-30-964.avif
```

The iPhone frame is `device/iphone-16-pro-black-{480,720,1406}.webp` (6,850 /
11,286 / 25,960 bytes; the 501,159-byte PNG it came from stays for the 3D
phone), WebP at quality 90 with lossless alpha, and the screen's mask is
`device/phone-mask-603.webp`, the v13 mask at half size, lossless:

```sh
for w in 480 720 1406; do convert iphone-16-pro-black.png -resize ${w}x -quality 90 -define webp:alpha-quality=100 -define webp:method=6 iphone-16-pro-black-$w.webp; done
convert ../v13/phone-mask.png -resize 603x -define webp:lossless=true phone-mask-603.webp
```

Screens wider than 700px get 60fps: the AV1, or the H.264 in browsers without
AV1 (Macs before M3). The H.264 is level 5.1 with 5 reference frames, which
hardware decoders take at 60fps. Phones get the 30fps cut.

The phone comes forward once, for Steve's part: from `phone-forward`, just
before he opens the task, to the second `phone-tuck`, when he is back on his
sidebar, frames 2023–2833 (33.72–47.22s). The composed movie also brings it
forward as the task arrives (`phoneStates` in `take.json`, 9.45–12.95s); Kirill
wants the page's phone beside the window then, so `phoneFocus` leaves that out.

The loop was checked in headless Chromium by drawing both movies every animation
frame from 1.2s before the end to 1.5s after the wrap, on the 60fps AV1 and the
60fps H.264 at 1440px and the 30fps AV1 at 390px: at the wrap the window changes
by at most 0.1 of 255 per channel and the phone by at most 0.07, no more than
between two frames of the dissolve (up to 0.57), and no `emptied`, `loadstart`,
or `abort` event brings a poster back. Frame for frame, each of the eight tracks'
last frame is within 0.54 of its first. Under software decoding the 30fps phone
track sometimes falls more than 120ms behind; the page then re-aligns it and it
shows its last decoded frame until it catches up, at the wrap as anywhere else.

That draft's own tracks, the v36 split of `v36-team-r13` (2200×1500 window), stay
on `archive/homepage-video-sizing` and never landed on main. Their 60fps H.264
pair needed level 6.0: x264 used 16 reference frames at that size.

**Swapping the take.** `src/happyOneDemoMedia.ts` is the only file to change.
`DEMO_TAKE.desktop` is the window movie: its frame is the window edge, so bake
the traffic lights in; the page sizes the window from its `width`/`height`.
`DEMO_TAKE.phone` is a movie or a still (`kind: 'still'`). The screen fills the
iPhone 16 Pro frame's 1206×2622 aperture and is cropped to it, so any iPhone
screen recording fits. `follows: true` puts a phone movie on the window's clock
(play, pause, seek, rate, drift over 120ms, the loop); `follows: false` loops it
on its own and only pauses with the window. `phoneFocus` is the one interval, in
seconds of the window movie, while the phone comes forward; leave it out and the
phone stays parked. A take's `phoneStates` may bring it forward more than once;
pick the interval with Kirill. Sources are tried in order, each with an optional `media`
query; screens wider than 700px try the 60fps AV1, then the 60fps H.264, and
everything else the 30fps AV1, then the 30fps H.264. Encode H.264 at `-level
5.1` and check the reference frames fit it.

**Geometry** (`src/happy-one-demo.css`). The window is as large as the first
screen allows, from 36% to 84% of the page column and at most 968px. Above 700px
the hidden header takes no room, "Happy" starts 32px from the top, and the download
badge sits 20px under the window (`--one-hero-reserved` in `src/happy-home.css`
counts the rest); with take 11 the window is 594px wide at 1015×637 and reaches
968px at 1440×900. The phone is
84% of the window's height. Where the screen ends before the phone does, it keeps
55% in view and peeks in from the edge, which the site shell clips. At 700px and
below the window's left edge is 8px from the screen's and its right edge 8% in, and
the phone, 92% of the window's height, shows 45% of itself over the window's right
bezel. For `phoneFocus` it grows 1.18×; on phones it is fully in view, 8px from the
edge, and grows from its bottom edge until its top is 8px under the hero's "Free and
open source" line, taller than the window (`--phone-reach`, which `HappyOneDemo`
measures whenever the layout changes: 1.257× at 390). As the page scrolls the
stage from where it rests to the top of the viewport, the phone rises by 16% of
its width and slides in by half of whatever the edge hides. Reduced motion turns
off the scrolling motion and the easing.

At 320–1920px there is no horizontal overflow, the window and download badge
share an axis, and the badge stays on the first screen. Checked in headless
Chromium against the dev server, not in Safari.

## Previous export: v36 composed movie, from take v36-team-r13

Until the layout above, the homepage `/` played one composed movie: the recorded
Mac window with Steve's phone laid over it and the captions baked in. It replaced the synchronized
desktop/phone pair below. Assets are in `public/video/happy-one/v36/`, copied
unchanged from the desktop workspace's
`scripts/demo/demos/stem/artifacts/v36-team-r13/final/web/`:

| Website asset | Source | Encoding | Size |
| --- | --- | --- | --- |
| `demo.webm` | `team.webm` | AV1 + Opus, 1618×1000, 60fps, 79.57s | 2,784,088 bytes |
| `demo.mp4` | `team.mp4` | H.264 High + AAC, 1618×1000, 60fps, 79.57s, fast-start | 6,001,545 bytes |
| `poster.webp` | `team-poster.webp` | first frame, model list open | 74,312 bytes |

The take opens on the model list and picks Opus; a new chat starts as a stem
cell, names itself and grows its icon, and the sidebar self-organizes; the agent
loops in @Steve, Steve asks from his phone to make it narrower and ship it, and
the agent fixes it and ships; the finished task archives itself and stays
readable; it ends on a new stem cell: “Stem cells for you and your team. Go
divide and conquer :D”.

The previous take, v29 from `v29-team-r11` (76.52s; it ended on Steve's reply),
stays in `public/video/happy-one/v29/`. Its first frame matches v36's apart from
the sidebar's section chevrons, so the social card below, captured from v29, was
kept.

`src/HappyOneDemo.tsx` lists the AV1 WebM first and the MP4 as the fallback, with
`preload="metadata"`, `loop`, and `playsInline`. It plays muted while at least a
quarter of it is in view, pauses when it leaves the viewport or the tab is
hidden, and resumes only if it was playing then; a visitor's own pause stays
paused. Native controls stay hidden until the reader reaches for them
(`src/revealedControls.ts`); reduced motion, save-data, and blocked autoplay leave
it paused on the poster with controls shown. The frame is centered on the
download badge's axis: up to 84% of the stage above 1024px (92% at 701–1024px),
shrinking to fit the first screen, and the full screen width less 16px at 700px
and below.

Checked offline in Chrome from the built `dist/`: at 390px and 1440px the WebM
autoplays muted without controls, loops, and there is no horizontal overflow;
with the WebM blocked the MP4 plays; with reduced motion it stays paused on the
poster with controls. This was not checked in Safari.

## Previous export: v22, from take v21-r2

This synchronized player is retired; its files remain in
`public/video/happy-one/v22/`, from the desktop workspace's
`scripts/demo/demos/core/artifacts/v21-r2/`. The master contains 3,867 frames at
60fps, lasting 64.450000 seconds. All six copied exports have verified checksums.
The 30fps pair contains 1,934 frames (64.466667s): the
odd master frame count adds only a final 1/60-second quantization interval,
with no cue shift or retiming. The previous v21 and v20 assets remain available.
Dimensions, encoding, source selection, device artwork, screen
bleed, and the unchanged brew command retain the v19 treatment documented below.

The macOS traffic lights are now pixels in both desktop movies and the poster,
not a webpage overlay. The retained 1950×1660 composed JPEG frames were encoded
directly (no extra compressed-video generation), replacing only the logo area
of the sidebar header: a 300×140px #1e1e1e patch at (0,0), with 30px circles
centered at (50,70), (100,70), and (150,70). Their fills are #ff5f57, #febc2e,
and #28c840 with a subtle inset dark edge. Encoding retains CRF18, limited-range
BT.709, sRGB transfer, fast-start, the original audio, and all 3,867 frames.
The phone master is unchanged. No Electron host or production app code changed.

The desktop and macOS download remain centered independently of the phone.
The desktop width changes in deliberate steps: 80% of the viewport at 700px
and below, 80% of the stage at 701–1024px, and the original 70% of the stage
above 1024px. At 390px, the recorded app is now 312px wide instead of 245px.
The phone retains its 28%-of-stage size. On small screens its parked position
keeps at least 40% visible, enough for the full avatars and roughly the first
title word. This can overlap the desktop bezel by a few pixels. Above 700px,
it parks beyond the desktop's right edge by a 6–12px gap.
Focus still enlarges it to 1.18×, but now translates
left only by the amount needed to keep its right viewport margin at least that
same gap. On wide screens where it already fits, translation is zero. Focused
overlap with the desktop is intentional; the desktop itself never moves.
App Store and Google Play form one centered row below macOS installation
controls, remaining a vertical stack at widths of 480px or less.

Autoplay begins with native controls disabled so Safari's opening playback
panel cannot obscure the recording. Mouse movement, touch/pointer-down, or
keyboard focus enables the ordinary browser controls without remounting the
video. Reduced motion, save-data, rejected autoplay, and the ending also expose
controls. No browser sniffing, custom transport bar, or shadow-DOM styling is
used. The v21 recording content and focus cues are unchanged apart from the
baked desktop window buttons.

This player follow-up was inspected offline in Chromium, Firefox, and WebKit:
actual autoplay at 390px and 1440px had both videos playing with controls absent;
touch/hover and keyboard focus revealed native controls. Reduced-motion loads
stayed paused with controls available. Geometry at 320, 390, 700, 701, 1024,
1025, 1440, and 1920px retained the desktop/download center and no horizontal
overflow. Mobile parked-phone visibility was 40%; the focused phone remained
fully visible with its minimum right margin. Existing 47 tests and the
production build pass. These are WebKit-engine checks, not a physical iPhone
Safari run. Earlier v21/v19 observations below describe their recorded revisions.

The authoritative focus interval is 2087/60–2974/60 seconds
(34.783333–49.566667). Astra's real child completes at 3126/60 (52.100000s),
during the shipping Bash call and before Deployed at 3557/60 (59.283333s).
The recording asserts the child is idle and “Working in subagents” is absent;
the website does not hide that status. The concise child report arrives through
the normal message flow. Auto remains selected; offline Git/gh shipping and
the real baseline restore/counter reconciliation retain the disclosed fixture
boundary, with no real commit, push, deployment, or fabricated approval.

The desktop sidebar and actual phone home include both Chief of Staff and
Release Coordinator; the latter uses the user's exact Celia avatar through
the upstream encrypted bot-avatar sync. Both messages use Auto permission
mode. The final native UI has no “Working in subagents” status.

The v21 production build passed (41 static routes). Clean actual-playback
screenshots at 390px and 1440px show the focused phone's native bot list at
36.5–37 seconds, including Release Coordinator's chosen avatar on both devices.
Both streams were playing and decode-ready, with approximately 34ms clock
separation; the phone remained entirely inside the viewport, without overflow.
Personal visual inspection found no transient loading spinner. Native controls
were untouched and faded normally during playback. The unchanged layout was
also verified on v20: offline Chromium at 390px, 1440px, and 1920px
verified the focused phone's full visibility, minimum right margin, exact 1.18×
scale, minimum required translation, and unchanged desktop/download center.
The 1920px playback check crossed both actual focus cues; wide-screen focus
requires no translation. Mobile badges remain a row above 480px and a stack
below. These checks used public build files only, without a local HTTP server.

“Free and open source” now sits 8px below the hero heading, sharing the footer
subtitle's typography and color. It consumes the existing heading/movie gap:
the movie's top is unchanged at both 390px and 1440px. Windows and Linux links
sit below the exact Homebrew command and use unchanged badge glyph paths at
one font cap height, with provenance in `public/img/happy-one/icons/CREDITS.txt`.

Both download groups share one cached public GitHub latest-release lookup per
page. The boundary accepts only non-draft, non-prerelease stable version tags
and exact production asset names/URLs; macOS offers ARM64 or x64 DMG, Windows x64 EXE,
and Linux x64 AppImage. Verified v0.0.85 direct installers remain the fallback
when lookup fails. Detected Windows/Linux use their primary badge without
Homebrew; macOS, mobile, and unknown clients default to macOS plus Homebrew.
Offline Chromium verified all platform choices, a mocked future production
release, one request shared by hero/footer, API failure, preview rejection,
and untrusted asset URL rejection. All links remain direct installers.

A compact native Apple Silicon / Intel text selector sits 4px below the macOS
badge, matching the secondary download font. It defaults to Apple Silicon;
browser architecture inference is not used. Hero and footer share the choice,
and an early click retains its selected architecture while awaiting lookup.
The badge keeps its size and center. The secondary row ends with the existing
GitHub mark and “All Releases”, linking to the desktop repository's releases.

An early click waits for that shared lookup and starts the download once it
settles; repeated clicks on that link while waiting do not queue duplicate downloads.
Pending links have no stale installer href. Keyboard activation and middle/
modifier clicks wait as well; a separate tab is reserved during the user
gesture. A five-second timeout resolves to the verified fallback.
Offline Chromium inspection confirmed no installer request before resolution,
one download after repeated early clicks, primary and secondary links, keyboard
activation, middle/modifier new-tab activation, API failure, and timeout. The
existing 47 tests and production build pass.

## Regenerating the social preview

This is an agent-run screenshot recipe, not a production script. The ordinary
page's headline is `HOME_HEADLINE` in `src/homeVariants.ts`; `?preview=og` renders the card's own
headline, “Any Model. Your Subscription. Happy Harness” (`SOCIAL_HEADLINE`), with
“Orchestrate Claude, Codex, Grok, Gemini and more in one app” under it and without the
gradient surface. Every route without its own card (all but
the desktop docs, whose cards come from `notes/og/cards.py`) uses
`/og/happy-harness-v26.png` as its social image, served with `?v=` and
`SOCIAL_IMAGE_VERSION` from `src/siteMetadata.ts` so link previews refetch;
v22–v25 stay for old shares.

The v26 card is a horizontal composition: the three-line headline at 52px, the
descriptor on two lines, “Free and open source”, and GitHub stars on the left;
the v29 movie, 664px wide, on the right, frozen at 2.8 seconds with the model
list open and Opus hovered.

1. Read the current public `https://api.github.com/repos/slopus/happy` response.
   Update the dated snapshot in `src/happyOneGithubStars.ts` using
   `stargazers_count` (24,384 / 24k on 2026-10-28). The header and screenshot
   both link to the **original** `https://github.com/slopus/happy` repository.
   Download “All Releases” deliberately still links to `happy-desktop`.
2. Build the website. Open `/?preview=og` in Chromium at
   **1200×630 CSS pixels**, device scale factor **2**, with reduced motion
   enabled. Use the registered workspace preview service; if that environment
   cannot start one, fulfill browser requests directly from the built `dist/`
   files without opening a listener. Do not change or restart the product app.
3. The explicit `preview=og` flag mounts the GitHub/stars line and selects the
   fixed social-card composition in `src/happy-one-preview.css`. Without the
   flag, the extra hero line is not mounted and the normal layout is unchanged.
   Keep the headline on three lines: “Any Model.” / “Your Subscription.” / “Happy Harness”.
   The copy starts at x=48px in a 440px column; a 24px gap separates it from
   the 596px window, with the parked phone 12px right of it, cut by the card's
   edge. (The v26 card predates this and shows the 664px composed movie.) Do
   not stack the demo below the headline in this mode.
   Wait for **Space Grotesk** and **DM Sans** to load from the existing Google
   Fonts stylesheet, plus the video. Do not capture
   fallback fonts, posters, loading indicators, or browser playback controls.
4. Freeze the `.one-demo video` (the window; the phone seeks with it) at
   **2.8 seconds** of the v29 asset: pause
   it, set `controls = false`, and set `currentTime = 2.8`. The model list is
   open with Opus hovered. Team take 11 has the model menu open from 0 to 4.22s
   (the pointer scans the list from 1.8s; Opus picked at 4.22s), so choose its
   frame again. Wait until it is paused, not seeking, decode-ready,
   and at the target; then wait two animation frames. Keep the pointer away
   from the video.
5. Capture the full 1200×630 viewport at 2× (2400×1260 bitmap), then downsample
   once to **1200×630 PNG**. Save a new versioned filename under `public/og/`
   rather than overwriting a cached social image. Inspect it personally: full
   headline, “Free and open source”, GitHub count, caption, and model list
   must be visible, with no playback chrome.
6. Point both `src/siteMetadata.ts` and `scripts/generate-static-routes.mjs` at
   the new image, keeping the title capitalization above and the existing
   description. `/` is the public page and stays indexable; the `/desktop/`,
   `/happy2/`, and `/tmp/happy-one/` redirect pages are `noindex`.
   Set matching width/height and descriptive alt text. Rebuild and inspect the
   generated `dist/index.html`: crawlers must get correct Open
   Graph and Twitter image tags without running JavaScript. Check that normal
   navigation restores other routes' image metadata.
7. Verify the ordinary page still has no `.one-social-stars`, and the header
   repository/count, centered downloads, and playback still work.
   Publish only when requested. After deployment, verify the live HTML and the
   image URL; messaging apps may keep a previously cached preview until they
   re-fetch the page.

## Previous verified take: v19-r3

The following is the preserved v19 record, not the current focused-phone
overlap or Astra-completion contract. The previous recording was `v19-r3`
from the desktop workspace's `scripts/demo/demos/core/artifacts/v19-r3/`.
Its `cues.json`, `core.evidence.json`, `shipping-verified.json`,
`phone-capture.json`, `framing.json`, and `native-key-taps.json` retain the
recording clock, interactions, and fixture disclosures. Current website assets
live in `public/video/happy-one/v19/`; older takes and the shared `device/`
artwork remain separate.

### Recording and verified exports

The take contains 3,830 frames on a 60fps master clock: 63.833333 seconds. The
desktop movie is the recorded application window itself, 1950×1660 movie
pixels for a 780×664 CSS-pixel window at 2.5×: no camera moves, no letterbox,
no zoom. The sidebar sits at the product's own minimum width (220 CSS pixels)
and the main pane is 560 CSS pixels wide. The concurrent native phone screen is
1206×2622. HQ files retain the master clock, without speed changes or rewritten
cues.

| Website asset | Dimensions | Frame rate | Frames | Video duration |
| --- | --- | --- | --- | --- |
| `desktop.mp4` | 1950×1660 | 60fps | 3,830 | 63.833333s |
| `phone.mp4` | 1206×2622 | 60fps | 3,830 | 63.833333s |
| `desktop-30.mp4` | 1560×1328 | 30fps | 1,915 | 63.833333s |
| `phone-30.mp4` | 804×1748 | 30fps | 1,915 | 63.833333s |

All six exports are verified by ffprobe and their copied SHA-256 checksums.
The even master frame count divides
exactly into 1,915 frames at 30fps, so both quality pairs share the same
endpoint without padding, retiming, or cue shifts.

The desktop and phone HQ files are the recorder's own exports, byte for byte.
The recorder now encodes limited-range BT.709 with sRGB transfer tags directly
(CRF 18, fast-start), so no re-encode is needed for browser colour: Chromium,
Firefox, and WebKit decode the recorded sidebar as the poster's #1e1e1e. The
30fps derivatives are scaled with Lanczos at CRF 18 (desktop) and CRF 17
(phone) and keep the same range and matrix tags. Posters are the HQ frame at
time zero, WebP quality 94.

Before either movie loads, Media Capabilities checks the HQ dimensions at 60fps
for supported, smooth, power-efficient decoding of both streams; otherwise, or
with save-data enabled, the player selects the matched 30fps pair. Selection
happens once per player lifetime; there is no mid-playback source swap.

### Playback

The desktop video carries the browser's own controls (`controls`, muted by
default, no download or remote-playback items). There are no custom controls,
no captions, and no camera replay. The phone movie follows the desktop clock:
play, pause, seeking, rate changes, buffering, and the end all drive the phone,
and ordinary `timeupdate` events correct drift greater than 120ms. Scrubbing the
desktop scrubs the phone.

The player itself makes two decisions only. It starts the muted pair once when
the figure is at least a quarter visible and both streams can play, unless the
visitor prefers reduced motion or save-data. It pauses the pair when the figure
leaves the viewport or the tab is hidden and resumes when it returns, but only
if the pair was playing at that moment: a visitor's pause on the native controls
stays paused. Movies load when the figure first intersects the viewport.

### Layout

One layout at every width. The recorded window is the Mac window: the corner
radius, hairline, and shadow sit on the recorded content's edge, and macOS
traffic lights (12 app px at x = 20/40/60, centred on the header) are drawn on
a header-coloured patch over the browser-mode logo in the app's own CSS pixels
(`--apx`), transparent to the pointer so the video controls stay reachable.
The window takes 70% of the stage width and is centered on the page independently
of the phone. The desktop download badge shares that exact center axis.

The phone stands upright to the right of the window at full drawing size (28%
of the stage width), with a 6–12 CSS-pixel gap. Its bottom-left transform origin
keeps the left bezel beyond the composer throughout its animation. On a wide
viewport it hangs into the page margin; on a narrow one it peeks past the viewport
edge, which the site shell clips without a horizontal scrollbar. During the
recorded phone interval (`phone-enter` 2089/60s to `phone-exit` 2946/60s) it
grows outward to 1.18×, then returns. Reduced motion disables the move. The
download options sit directly below the figure; App Store and Google Play
badges form one centered row below the desktop installation controls, stacking
vertically only at widths of 480 CSS pixels or less.

Playback uses Apple's flat iPhone 16 Pro Black Titanium artwork, sourced from
James Jingyi's Device Mockups collection. Its screen opening is x=102, y=100,
1206×2622 within the 1406×2822 image. The recorded device is an iPhone 17 Pro
Simulator with matching screen dimensions; the presentation does not claim that
an iPhone 17 Pro has a black finish. Author, source, license, and modification
credits remain linked beside Docs, Privacy, and Terms in the page footer.
`HappyOnePhone3D.tsx`, `happyOnePhoneScene.ts`, the model, and their
dependencies remain an unused alternative; the active landing page imports none
of them.

The video and its mask bleed 0.4% underneath each bezel edge (`scale(1.008)`),
preventing independent anti-aliased frame and mask edges from exposing a seam
during fractional scaling. The actual device frame and its aspect ratio are
unchanged.

The Homebrew copy glyph is the unchanged Copy path from OpenAI's published
[Apps SDK UI](https://github.com/openai/apps-sdk-ui/blob/main/src/components/Icon/svg/Copy.tsx),
with its MIT attribution shipped in `/img/happy-one/icons/CREDITS.txt`. This is
a verified OpenAI web design-system source, not a claim that ChatGPT's native
mobile apps use this exact asset. The command remains
`brew install --cask slopus/tap/happy`.

### Final recorded cues

Frame numbers refer to the 60fps master and apply unchanged to both web pairs.

| Frame | Time | Event |
| --- | --- | --- |
| 244 | 4.067s | Model picker opens |
| 524 | 8.733s | Fable selected |
| 932 | 15.533s | Work starts; Thinking visible; workspace named voice-waveform |
| 1217 | 20.283s | First file read visible |
| 1411 | 23.517s | Real waveform predicate edited; sidebar shows +3 −1 |
| 1580 | 26.333s | Astra sub-agent spawned |
| 1888 | 31.467s | First turn settled |
| 2089 | 34.817s | Phone grows; session unread |
| 2311 | 38.517s | Phone session open |
| 2340 | 39.000s | Native inline diff visible |
| 2686 | 44.767s | Native keyboard typing begins; Auto remains selected |
| 2837 | 47.283s | Phone message sent |
| 2946 | 49.100s | Phone returns; Steve's message on the desktop |
| 2994 | 49.900s | Static inline “Hi, Steve 👋” greeting |
| 3072 | 51.200s | Bash screenplay ship command running |
| 3215 | 53.583s | Real Git counters reconcile to zero |
| 3534 | 58.900s | Staged deploy response; confetti |
| 3830 | 63.833s | Master ends |

### What is real and what is staged

The recording uses an isolated local Happy Agent build, not a published release
or an installed host update. Native tool execution, the file edit, the actual
`create_agent` delegation, durable messages, and encrypted desktop/phone
synchronization are real. The phone's software keyboard receives actual native
taps to type `ship it`; Auto stays selected throughout, and Send delivers that
exact message to the linked session. The workspace is automatically named
`voice-waveform`. The greeting uses static inline text and emoji, not a hand sticker.

The Bash process runs under Auto with an explicit private fixture PATH. Its
`git` and `gh` commands are offline screenplay fixtures: no real commit, push,
or deployment occurs. The simulated push restores only the prepared waveform
file to baseline. `shipping-verified.json` records the staging disclosure and
the daemon's actual Git read model reconciling to zero changes. No permission
approval or review verdict is fabricated. The returned deploy response is
staged; the native edit, message delivery, and counter reconciliation are real.

Inference prose and timing are a screenplay. Steve is one explicitly fictional
protocol-fixture identity, not proof of real multiplayer authentication. The
small waveform predicate and pre-wired call site are curated to produce a
narrow, readable phone diff; the edit itself is real. Astra's review runs as a
real sub-agent and is released after the take so no collaborator row is filmed.
The fixture does not claim live vendor inference.

### Verification status

The final v19 public build typechecks and builds. Chromium, Firefox, and WebKit
were inspected at device-pixel-ratio 2 and eleven viewport widths from 320 to
1920 CSS pixels. Both parked and focused geometry pass: maximum center rounding
error is 0.007813 CSS pixels for the desktop and 0.015625 for its download badge.
The phone clears the window by at least 6 CSS pixels throughout the transition;
at most 48.46% of it is viewport-clipped, below the permitted 70%. No page
overflow or JavaScript errors were observed. Narrow store badges stay vertical.
Copy actions at 390px and 1440px in all three engines pass the unchanged brew
command to the clipboard API and display the existing copied feedback.

Actual 1× playback crosses both recorded phone cues in all three engines,
including the HQ pair in Chromium and the 30fps pair in Firefox and WebKit.
Maximum sampled pair drift is 41.3ms, below the existing 120ms correction
threshold; pausing the desktop pauses the phone. Rendered transition sequences
and full-resolution phone crops were visually inspected: no exposed light seam
or phone/composer overlap was visible, and the device frame remains unchanged.
Immediate paused-seek screenshots can show native loading overlays. Follow-up
screenshots after 3.5 seconds of normal playback show no loading spinner; native
controls were not removed or masked. Firefox's HQ companion reported waiting
at seek/startup (within the first 0.255 seconds), with no later waiting events
in that sample; the other clean-playback samples reported none. These local
observations do not claim universally flawless decoding.

Dedicated preview services are unavailable on this macOS compute; no replacement
HTTP listener is started. Browser inspection uses offline request interception
limited to the public build, with no external requests or public preview
endpoint. External Google Fonts are consequently unavailable in these captures;
layout checks use the page's fallback fonts.
