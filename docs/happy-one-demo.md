# Happy One synchronized demo

Only `/tmp/happy-one/` uses `HappyOneDemo`. The final recording is `v18-r3`
from the desktop workspace's `scripts/demo/demos/core/artifacts/v18-r3/`.
Its `cues.json`, `core.evidence.json`, `shipping-verified.json`,
`phone-capture.json`, `framing.json`, and `native-key-taps.json` retain the
recording clock, interactions, and fixture disclosures. Current website assets
live in `public/video/happy-one/v18/`; older takes and the shared `device/`
artwork remain separate.

## Recording and verified exports

The take contains 4,194 frames on a 60fps master clock: 69.9 seconds. The
desktop movie is the recorded application window itself, 1950×1660 movie
pixels for a 780×664 CSS-pixel window at 2.5×: no camera moves, no letterbox,
no zoom. The sidebar sits at the product's own minimum width (220 CSS pixels)
and the main pane is 560 CSS pixels wide. The concurrent native phone screen is
1206×2622. HQ files retain the master clock, without speed changes or rewritten
cues.

| Website asset | Dimensions | Frame rate | Frames | Video duration |
| --- | --- | --- | --- | --- |
| `desktop.mp4` | 1950×1660 | 60fps | 4,194 | 69.9s |
| `phone.mp4` | 1206×2622 | 60fps | 4,194 | 69.9s |
| `desktop-30.mp4` | 1560×1328 | 30fps | 2,097 | 69.9s |
| `phone-30.mp4` | 804×1748 | 30fps | 2,097 | 69.9s |

These values are measured by ffprobe. The even master frame count divides
exactly into 2,097 frames at 30fps, so both quality pairs share the same
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

## Playback

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

## Layout

One layout at every width. The recorded window is the Mac window: the corner
radius, hairline, and shadow sit on the recorded content's edge, and macOS
traffic lights (12 app px at x = 20/40/60, centred on the header) are drawn on
a header-coloured patch over the browser-mode logo in the app's own CSS pixels
(`--apx`), transparent to the pointer so the video controls stay reachable.
The window takes 70% of the stage width.

The phone stands upright to the right of the window at full drawing size (28%
of the stage width) with its right edge 8% of the stage width past the stage,
so its left bezel clears the window and the composer. On a wide viewport it
hangs into the page margin; on a narrow one it peeks past the viewport edge,
which the site shell clips without a horizontal scrollbar. During the recorded
phone interval (`phone-enter` 2097/60s to `phone-exit` 3307/60s) it comes into
the column and grows to 1.18×, then returns. Reduced motion disables the move.
The download options sit directly below the figure in the hero.

Playback uses Apple's flat iPhone 16 Pro Black Titanium artwork, sourced from
James Jingyi's Device Mockups collection. Its screen opening is x=102, y=100,
1206×2622 within the 1406×2822 image. The recorded device is an iPhone 17 Pro
Simulator with matching screen dimensions; the presentation does not claim that
an iPhone 17 Pro has a black finish. Author, source, license, and modification
credits remain linked beside Docs, Privacy, and Terms in the page footer.
`HappyOnePhone3D.tsx`, `happyOnePhoneScene.ts`, the model, and their
dependencies remain an unused alternative; the active landing page imports none
of them.

## Final recorded cues

Frame numbers refer to the 60fps master and apply unchanged to both web pairs.

| Frame | Time | Event |
| --- | --- | --- |
| 244 | 4.067s | Model picker opens |
| 524 | 8.733s | Fable selected |
| 932 | 15.533s | Work starts; Thinking visible |
| 1218 | 20.300s | First file read visible |
| 1412 | 23.533s | Real waveform predicate edited; sidebar shows +3 −1 |
| 1584 | 26.400s | Astra sub-agent spawned |
| 1893 | 31.550s | First turn settled |
| 2097 | 34.950s | Phone moves forward; session unread |
| 2322 | 38.700s | Phone session open |
| 2352 | 39.200s | Native inline diff visible |
| 2716 | 45.267s | Permission menu opened on the phone |
| 2896 | 48.267s | Full access chosen |
| 3043 | 50.717s | Native keyboard typing begins |
| 3196 | 53.267s | Phone message sent |
| 3307 | 55.117s | Phone moves back; Steve's message on the desktop |
| 3355 | 55.917s | Greeting and wave |
| 3432 | 57.200s | Bash ship command running |
| 3580 | 59.667s | Real Git counters reconcile to zero |
| 3898 | 64.967s | Deployed; confetti |
| 4194 | 69.900s | Master ends |

## What is real and what is staged

The recording uses an isolated local Happy Agent build, not a published release
or an installed host update. Native tool execution, the file edit, the actual
`create_agent` delegation, durable messages, and encrypted desktop/phone
synchronization are real. The phone's software keyboard receives actual native
taps to type `ship it`; the Full access setting is chosen on camera through the
phone's own permission menu, and Send delivers that exact message to the linked
session with that setting.

The ship command is real and runs with that Full access setting: one Bash call
commits, pushes `HEAD:main`, and watches the deploy run. The push lands in a
bare repository owned by the private demo gym, and `gh` is an offline fixture on
the gym's PATH that reports one deploy run. `shipping-verified.json` records
the pushed commit, the origin's `main`, and the daemon's own Git read model
reconciling to zero changes. No real remote, deployment, or permission-review
verdict is involved; the screenplay never answers a review, and it only claims a
deploy when the daemon reports the command succeeded.

Inference prose and timing are a screenplay. Steve is one explicitly fictional
protocol-fixture identity, not proof of real multiplayer authentication. The
small waveform predicate and pre-wired call site are curated to produce a
narrow, readable phone diff; the edit itself is real. Astra's review runs as a
real sub-agent and is released after the take so no collaborator row is filmed.
The fixture does not claim live vendor inference.

## Verification status

Typecheck and the production build pass with the v18 references and cues.
Chromium, Firefox, and WebKit were checked against the copied assets at
1440/1024/700/390px: paused seeks to 1, 18, 28, 44, 60, and 66 seconds put both
movies at the same time in every engine, the phone focus state follows the cue
interval, and there is no horizontal overflow at any width. Live playback in
all three engines: the pair autoplays in view, holds within one frame of drift,
a visitor pause stays paused across scrolling, scrolling away pauses and
returning resumes both, both end together, and replay restarts both.
