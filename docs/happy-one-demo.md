# Happy One synchronized demo

Only `/tmp/happy-one/` uses `HappyOneDemo`. The final recording is `v16-r14`
from the desktop workspace's `scripts/demo/demos/core/artifacts/v16-r14/`.
Its `cues.json`, `core.evidence.json`, `phone-capture.json`, `framing.json`, and
`native-key-taps.json` retain the recording clock, interactions, and fixture
disclosures. Current website assets live in `public/video/happy-one/v16/`;
older takes and shared `device/` artwork remain separate.

## Recording and verified exports

The final take contains 3,801 frames on a 60fps master clock: 63.350000 seconds.
The desktop crop and output are both 2340×1440: captured detail, not an upscale
of a smaller movie. The concurrent native phone screen is 1206×2622. HQ files
retain the master clock, without speed changes or rewritten cues.

| Website asset | Dimensions | Frame rate | Frames | Video duration |
| --- | --- | --- | --- | --- |
| `desktop.mp4` | 2340×1440 | 60fps | 3,801 | 63.350000s |
| `phone.mp4` | 1206×2622 | 60fps | 3,801 | 63.350000s |
| `desktop-30.mp4` | 1560×960 | 30fps | 1,901 | 63.366667s |
| `phone-30.mp4` | 804×1748 | 30fps | 1,901 | 63.366667s |

These are measured ffprobe values from the completed export. Both pairs start
at zero; each pair has matching decoded frame counts and video durations. The
export report preserves raw probes, audio/container durations, and SHA-256
checksums, and copied website assets passed checksum verification.

The odd native frame count cannot have exactly the same duration at constant
30fps. The fallback pair rounds up to 1,901 frames: only its final frame interval
extends the endpoint by 1/60 second. There is no retiming, cue shift, or change
to the native masters. Audio/container durations are reported separately.

HQ files are copied from the native exports. Smaller H.264 derivatives use
CRF 18 for desktop, CRF 17 for phone, and MP4 fast-start metadata. Posters come
from the corresponding HQ frame at time zero. WebP stills use quality 94.

Before either movie loads, Media Capabilities checks the actual HQ dimensions
at 60fps for supported, smooth, power-efficient decoding of both streams.
Otherwise, or with save-data enabled, the player selects the matched 30fps pair.
Selection happens once per player lifetime; there is no mid-playback source swap.

## Playback and supporting captions

Desktop is the clock. Play/pause, seeks, buffering, and replay coordinate both
videos; ordinary `timeupdate` events correct drift greater than 120ms. Movies
load when the figure first intersects the viewport. Playback pauses when less
than a quarter is visible or the document is hidden, and resumes only when
playback was wanted. An explicit Pause stays paused. Reduced-motion and save-data
visitors start paused. Controls support keyboard play/pause, sound, and seeking.

Exactly two supporting feature points appear below the footage in a reserved
two-line caption area, never covering the recorded interface:

| Master interval | Caption |
| --- | --- |
| 164/60–2412/60 (2.733333–40.200000s) | 1/ Multi-provider within one session |
| 2498/60–3801/60 (41.633333–63.350000s) | 5/ End-to-end encrypted mobile app |

The first follows `center-locked` through `center-exit`; the second follows
`phone-enter` through the native master end. The extra 1/60 second in the 30fps
fallback does not extend a caption or move a focus cue.

## Mobile still and device treatment

At widths of 700 CSS pixels or less, a separate static component mounts instead
of playback: zero video elements, movie requests, or playback controls. It shows
the actual 2100×1660 desktop still with the sidebar, real Edit row and +3/−1
counts, and Fable-above-Opus model picker, with part of the actual phone home
screen alongside it. The desktop image offers 420px, 840px, and full 2100px
responsive sources. Its keyboard-focusable link opens the full image in a new
tab; visible text explains the workflow and closer-look action. There is no
miniature playing movie or mobile 3D renderer.

Playback uses Apple's flat iPhone 16 Pro Black Titanium artwork, sourced from
James Jingyi's Device Mockups collection. Its screen opening is x=102, y=100,
1206×2622 within the 1406×2822 image. The recorded device is an iPhone 17 Pro
Simulator with matching screen dimensions; the presentation does not claim that
an iPhone 17 Pro has a black finish. Author, source, license, and modification
credits remain linked beside Docs, Privacy, and Terms in the page footer.

The phone stays upright, moves forward only during the recorded focus interval,
then returns to its parked position. Reduced motion disables those transitions.
`HappyOnePhone3D.tsx`, `happyOnePhoneScene.ts`, the model, and their dependencies
remain an unused alternative; the active landing page imports none of them.

## Final recorded cues

Frame numbers refer to the 60fps master and apply unchanged to both web pairs.

| Frame | Time | Event |
| --- | --- | --- |
| 164 | 2.733333s | Desktop center framing locked; first caption begins |
| 319 | 5.316667s | Model picker opens |
| 600 | 10.000000s | Fable selected |
| 1007 | 16.783333s | Work starts |
| 1172 | 19.533333s | Steve's steering message arrives |
| 1432 | 23.866667s | Grok subagent spawned |
| 1671 | 27.850000s | Real waveform predicate edited |
| 2222 | 37.033333s | Desktop response settled |
| 2412 | 40.200000s | Center framing exits; first caption ends |
| 2498 | 41.633333s | Phone moves forward; second caption begins |
| 2690 | 44.833333s | Phone session open |
| 2821 | 47.016667s | Native inline diff visible |
| 3173 | 52.883333s | Native keyboard typing sequence begins |
| 3526 | 58.766667s | Phone message sent |
| 3650 | 60.833333s | Phone moves back |
| 3801 | 63.350000s | Master ends; second caption ends |

## What is real and what is staged

The recording uses isolated local Happy Agent build
`0.4.69-local.archive.6b16118e` (protocol 25), including the archive relay-echo
convergence fix. This identifies the local recording build, not a published
release or an installed host update.

Native tool execution, the file edit, actual `create_agent` delegation, steering,
durable messages, and encrypted desktop/phone synchronization are real. The
phone's software keyboard receives actual native taps to type `ship it`; Send
delivers that exact message to the linked session and the recorded evidence
contains its acknowledgement. This demo message does not perform a Git push or
release.

Inference prose and timing are a screenplay. Steve is one explicitly fictional
protocol-fixture identity, not proof of real multiplayer authentication or
shared draft synchronization. The small waveform predicate and pre-wired call
site are curated to produce a narrow, readable phone diff; the edit itself is
real. The research result links to a real OpenAI Developers post, but the fixture
does not claim live vendor inference or live model-driven web research. The
subagent presentation follows real creation, not a fabricated tool row.

## Verification status

Typecheck and the production build pass. Chromium, Firefox, and WebKit were
inspected against the final assets: pointer seeking, paired pause, reduced
motion, and keyboard End → Replay work. Both quality pairs reach their exact
browser-reported duration; the range uses `step="any"` so a fixed increment
cannot make the fractional final frame unreachable.

All three engines at 320/390/430px request no movies on mobile, load the stills,
and open the full-size image through the keyboard-accessible link. At 200%
text size, header/footer content reflows without document overflow or clipped
text. Terminal code keeps its intentional internal horizontal scroll.

Encoded key frames and actual browser screenshots were visually inspected.
Chromium's sampled playback added no dropped frames. WebKit's reported drops
were also present with a single plain video (81 in five seconds versus 85 on
the page); plain paired 60fps playback reported similar counts. These counters
do not establish added page overhead. Plain 30fps playback delivered 149 frame
callbacks in five seconds. No claim of universally flawless 60fps playback is
made; the lower-power pair remains available through Media Capabilities.

Publication is a separate step. In particular, the local archive fix identified
above is not represented as a published Agent preview. Requested external
Antigravity/Fable review remains unperformed because its scoped sharing was not
authorized; local inspection is not their sign-off.