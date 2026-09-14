# Happy One synchronized demo

Only `/tmp/happy-one/` uses `HappyOneDemo`. Other page routes and their copy are
unchanged. The original phone footage lives in `public/video/happy-one/v13/`;
the caption-free desktop derivative is in `v14/`, and sourced device artwork
is in `device/` alongside public attribution.

The desktop and iPhone are one continuous 77.900-second take. The native masters
are 60 fps (1920×1080 desktop, 1206×2622 phone). The website uses matching 30 fps
H.264 copies, with the phone reduced to 804×1748. This keeps both timelines intact
while halving frame decoding work. WebKit also reported comparable frame drops
with a single plain video, so its counters did not isolate a compositing problem.
The native masters and transparent bezel WebM remain in the desktop demo workspace.

## Playback and phone treatment

- The default frame is Apple's iPhone 16 Pro Black Titanium artwork, sourced from
  James Jingyi's Device Mockups collection. No invented CSS chassis remains. Its
  exact screen opening is x=102, y=100, 1206×2622 in the 1406×2822 image.
- Capable desktops lazily enhance to tranminhluan's CC-BY iPhone 16 Pro model,
  also used by Niranjan Kumar's public Three.js site. Original hardware geometry
  is unchanged; the atlas is adapted to neutral black and the sample wallpaper
  removed. Screen placement matches the measured flat frame. Full author,
  license, source, and modification credits are linked below the player.
- The 3D bundle/model are not requested below 1000px, without a fine hovering
  pointer, with fewer than eight logical processors, with under 8 GB of reported
  device memory, or with reduced motion/save-data. Missing memory reporting alone
  does not disqualify an otherwise capable Mac. WebGL2 must accept
  `failIfMajorPerformanceCaveat`; context loss or repeatedly expensive draws falls
  back to the real frame without replacing either video element.
- Video-frame callbacks drive the texture. Animation frames run only while a
  rotation is settling or a new video frame needs drawing. Pixel ratio is capped
  at 1.5; off-screen/hidden rendering is suspended and all GPU resources cleaned up.
- Zoom animates only the phone's CSS transform. Its layout box and canvas stay
  at expanded size, so zoom never reallocates or clears the drawing buffer. Real
  viewport resizes use the untransformed content box and update canvas dimensions
  in the same animation frame as rendering. The first 3D frame waits for its
  initial size. Mobile retains its separate portrait reveal without WebGL.
- Desktop is the clock. Play/pause, seeks, buffering, and replay coordinate both
  elements; ordinary `timeupdate` events correct drift greater than 120 ms.
- Videos load when the figure first intersects the viewport. Playback pauses when
  less than a quarter is visible or the document is hidden. Returning resumes only
  when playback was wanted; an explicit Pause stays paused.
- Reduced-motion and save-data visitors start paused. Keyboard-accessible controls
  provide play/pause, sound, scrubbing, and persistent phone inspection. Hover gives
  a small enlargement or real-model tilt. Reduced motion suppresses animation.
- Website captions use the exact original narration cues in a responsive text
  layer: a capsule over desktop, 16px text beneath the visual on small screens.
  The video derivative removes only its burned-in caption layer; timing, camera,
  interactions, and audio are unchanged. The downloadable native master still
  has burned-in subtitles. Audio is interaction sounds, not generated speech.
- Below 700px the phone slides into a centered portrait moment, with the desktop
  dimmed behind it. At the exit cue it disappears completely, leaving the desktop
  review unobstructed. Controls retain 44px touch targets; no mobile WebGL loads.

iPhone 17 Pro has no black finish. The presentation is explicitly iPhone 16 Pro
Black Titanium, whose 1206×2622 display matches the recorded 17 Pro Simulator.

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