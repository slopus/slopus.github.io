# Happy One synchronized demo

Only `/tmp/happy-one/` uses `HappyOneDemo`. The final recording is `v17-r6`
from the desktop workspace's `scripts/demo/demos/core/artifacts/v17-r6/`.
Its `cues.json`, `core.evidence.json`, `phone-capture.json`, `framing.json`, and
`native-key-taps.json` retain the recording clock, interactions, and fixture
disclosures. Current website assets live in `public/video/happy-one/v17/`;
older takes and shared `device/` artwork remain separate.

## Recording and verified exports

The final take contains 4,078 frames on a 60fps master clock: 67.966667 seconds.
The desktop crop and output are both 2340×1440: captured detail, not an upscale
of a smaller movie. The concurrent native phone screen is 1206×2622. HQ files
retain the master clock, without speed changes or rewritten cues.

| Website asset | Dimensions | Frame rate | Frames | Video duration |
| --- | --- | --- | --- | --- |
| `desktop.mp4` | 2340×1440 | 60fps | 4,078 | 67.966667s |
| `phone.mp4` | 1206×2622 | 60fps | 4,078 | 67.966667s |
| `desktop-30.mp4` | 1560×960 | 30fps | 2,039 | 67.966667s |
| `phone-30.mp4` | 804×1748 | 30fps | 2,039 | 67.966667s |

These values are measured by ffprobe; all ten copied assets match their export
SHA-256 checksums. The even master frame count divides exactly into 2,039 frames at
30fps, so both quality pairs retain the same endpoint without quantization
padding, retiming, or cue shifts. Audio/container durations are reported
separately in the export report.

HQ files are copied from the native exports. Smaller H.264 derivatives use
CRF 18 for desktop, CRF 17 for phone, and MP4 fast-start metadata. Posters come
from the corresponding HQ frame at time zero. WebP stills use quality 94.

For desktop playback, before either movie loads, Media Capabilities checks the actual HQ dimensions
at 60fps for supported, smooth, power-efficient decoding of both streams.
Otherwise, or with save-data enabled, the player selects the matched 30fps pair.
Selection happens once per player lifetime; there is no mid-playback source swap.
Explicit mobile playback always uses the matched 30fps pair.

The website owns one decorative window frame and traffic-light title bar.
The movie contains raw application content, without baked-in wallpaper, rounded
outer chrome, or a second title bar. Its resting 3060×1660 view fits inside the
2340×1440 output on the application background; the center crop is pixel-exact.

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
| 164/60–2642/60 (2.733333–44.033333s) | 1/ Multi-provider within one session |
| 2729/60–4078/60 (45.483333–67.966667s) | 5/ End-to-end encrypted mobile app |

The first follows `center-locked` through `center-exit`; the second follows
`phone-enter` through the native master end. Both quality pairs share these cues.

## Mobile still and device treatment

At widths of 700 CSS pixels or less, a separate static component mounts instead
of playback: zero video elements or movie requests before an explicit Play. It shows
the actual 2100×1660 desktop still with the sidebar, real Edit row and +3/−1
counts, and Fable-above-Opus model picker, with part of the actual phone home
screen alongside it. The desktop image offers 420px, 840px, and full 2100px
responsive sources. Its keyboard-focusable link opens the full image in a new
tab; visible text explains the workflow and closer-look action. Half the phone
peeks beyond the window's right edge, with its bottom below the window. Only the
static composition clips decorative overflow; it does not obscure the Fable
picker label or widen the page. The actual device frame geometry is unchanged.

The visible Play demo button explicitly replaces the still with an uncropped
30fps movie. Cropping the wide movie to portrait cut off real messages, so the
default stays readable and static. Keyboard activation moves focus to the
visible player control, including under reduced motion and save-data. Text
below playback retains a full-size screenshot link. No mobile 3D renderer loads.

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
| 320 | 5.333333s | Model picker opens |
| 600 | 10.000000s | Fable selected |
| 1007 | 16.783333s | Work starts |
| 1007 | 16.783333s | Thinking becomes visible |
| 1264 | 21.066667s | First answer becomes visible |
| 1407 | 23.450000s | First tool work becomes visible |
| 1470 | 24.500000s | Steve's steering message arrives |
| 1759 | 29.316667s | Grok subagent spawned |
| 1967 | 32.783333s | Real waveform predicate edited |
| 2461 | 41.016667s | Desktop response settled |
| 2642 | 44.033333s | Center framing exits; first caption ends |
| 2729 | 45.483333s | Phone moves forward; second caption begins |
| 2953 | 49.216667s | Phone session open |
| 2981 | 49.683333s | Native inline diff visible |
| 3333 | 55.550000s | Native keyboard typing sequence begins |
| 3482 | 58.033333s | Phone message sent |
| 3658 | 60.966667s | Staged shipping response; real counters reconcile to zero |
| 3927 | 65.450000s | Phone moves back |
| 4078 | 67.966667s | Master ends; second caption ends |

## What is real and what is staged

The recording uses isolated local Happy Agent build
`0.4.69-local.core.c88cebdf` (protocol 25), including the archive relay-echo
and Git dirty-to-clean synchronization fixes. This identifies the local recording build, not a published
release or an installed host update.

Native tool execution, the file edit, actual `create_agent` delegation, steering,
durable messages, and encrypted desktop/phone synchronization are real. The
phone's software keyboard receives actual native taps to type `ship it`; Send
delivers that exact message to the linked session and the recorded evidence
contains its acknowledgement. The subsequent push/deploy response is screenplay:
the owned fixture edit is restored to baseline, and the real Git watcher and
encrypted native counters reconcile to zero. No actual push, deployment, or
fabricated permission approval occurs.

Inference prose and timing are a screenplay. Steve is one explicitly fictional
protocol-fixture identity, not proof of real multiplayer authentication or
shared draft synchronization. The small waveform predicate and pre-wired call
site are curated to produce a narrow, readable phone diff; the edit itself is
real. The research result links to a real OpenAI Developers post, but the fixture
does not claim live vendor inference or live model-driven web research. The
subagent presentation follows real creation, not a fabricated tool row.

## Verification status

Typecheck and the production build pass with the v17 references and cues.
Chromium, Firefox, and WebKit were checked against the final copied assets at
320/390/430/1440px. Paired seeking and pause, keyboard End → Replay, desktop-only
audio, and explicit mobile Play work. Reduced-motion and save-data visitors
start with no movies and retain visible keyboard focus after opting in.

The final static partial-phone composition was checked at 320/390/430px in all
three engines: no movie requests, no horizontal overflow or clipped text,
visible keyboard focus, and full-size screenshot navigation. At 200% text size,
header/footer content and player controls reflow without page overflow or
unreachable text. Terminal code keeps intentional internal horizontal scroll.
The 720px desktop reflow check also passes. Actual rendered key-frame images
show one website-owned title bar, readable Fable selection, Thinking before
the first answer, the native inline diff, and cleared workspace counters.

Normal-speed continuous inspection covered the entire HQ take in Chromium and
the 43s-to-end 30fps phone handoff in Firefox and WebKit. All reached Replay
without buffering or media-error events. Maximum sampled pair drift was 10ms,
5.1ms, and 0.3ms respectively. Captured transition sequences show one upright
phone move forward and back. Off-screen pause/resume, explicit Pause across
visibility changes, and enabling reduced motion during playback all pass.
These are local functional observations, not a universal frame-delivery claim.

The range uses `step="any"` so a fixed increment cannot make the fractional
final frame unreachable. No claim of universally flawless 60fps playback is
made; the lower-power pair remains available through Media Capabilities.

Publication is a separate step. In particular, the local archive fix identified
above is not represented as a published Agent preview. Requested external
Antigravity/Fable review remains unperformed because its scoped sharing was not
authorized; local inspection is not their sign-off.