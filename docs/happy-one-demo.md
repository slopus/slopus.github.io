# Happy One synchronized demo

Only `/tmp/happy-one/` uses `HappyOneDemo`. Other page routes and their copy are
unchanged. Versioned assets live in `public/video/happy-one/v13/`.

The desktop and iPhone are one continuous 77.900-second take. The native masters
are 60 fps (1920×1080 desktop, 1206×2622 phone). The website uses matching 30 fps
H.264 copies, with the phone reduced to 804×1748. This keeps both timelines intact
while halving frame decoding work; two 60 fps streams dropped frames in WebKit.
The native masters and transparent bezel WebM remain in the desktop demo workspace.

## Playback and phone treatment

- CSS perspective, front/back surfaces, and a shallow metallic side form the phone.
  The front is Apple's installed Simulator bezel with the real phone video over
  its native screen mask. No WebGL, rendering library, or animation-frame loop.
- Desktop is the clock. Play/pause, seeks, buffering, and replay coordinate both
  elements; ordinary `timeupdate` events correct drift greater than 120 ms.
- Videos load when the figure first intersects the viewport. Playback pauses when
  less than a quarter is visible or the document is hidden. Returning resumes only
  when playback was wanted; an explicit Pause stays paused.
- Reduced-motion and save-data visitors start paused. Keyboard-accessible controls
  provide play/pause, sound, scrubbing, and persistent phone inspection. Hover gives
  a small enlargement and pointer-driven tilt; reduced motion removes transforms.
- Subtitles are burned into desktop only. Audio is interaction sounds, not generated
  speech. `subtitles.srt` is the script for later human voiceover.

## Recorded focus cues

`phone-timing.json` retains original 60 fps frame numbers. CSS focus uses the same
seconds even though the website copies are 30 fps.

| Time | Event |
| --- | --- |
| 30.716667 | Phone moves forward on the working session list |
| 34.300000 | Active chat is open |
| 36.5–37.0 | Inline diff arrives, visually verified interval |
| 43.316667 | Horizontal swipe settled; changed logic readable |
| 48.200000 | Phone moves back; desktop regains focus |
| 60.550000 | Desktop file review starts |

The phone starts with six actual durable sessions and real project artwork:
three Happy sessions, travel-vibes, bra1nDump, and the only bot, Chief of Staff.
It opens the chat shortly before the real edit arrives. There is no session-info
screen or separate Changes navigation. The model controls read Fable 5.1 / Extra High.

Native tools, the file edit, and encrypted cross-device synchronization are real.
Inference text/timing and Steve's desktop author identity are explicit screenplay
fixtures, not live vendor inference or real multiplayer authentication. The research
result links to a real OpenAI Developers post verified outside the recording.
Requested Antigravity/Fable external reviews were policy-blocked and did not run.