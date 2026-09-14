# Happy One synchronized demo

Only `/tmp/happy-one/` uses `HappyOneDemo`. Other page routes and their copy are
unchanged. The original web phone derivative lives in `public/video/happy-one/v13/`;
the 1080p30 caption-free desktop derivative is in `v14/`, the full-detail 60 fps
pair is in `v15/`, and sourced device artwork is in `device/` alongside attribution.

The desktop and iPhone are one continuous 77.900-second take. The preferred web
pair is 2560×1440 desktop and 1206×2622 phone, both H.264 High Level 5.1 with
4,674 frames at 60 fps. Before either video loads, Media Capabilities must report
supported, smooth, power-efficient decoding for both streams. Otherwise, or in
save-data mode, the player uses the existing 1920×1080 / 804×1748 30 fps pair.
Selection happens once per player lifetime; there is no mid-playback source swap.

The 1440p export is recomposed from the original 3060×1660 desktop capture in
its 3200×1800 scene, not enlarged from the 1080p video. The closest 347 frames
have slightly wider crops (minimum 2560×1440) to avoid inventing detail. All
interactions, cues, narration, duration, and soundtrack retain the same clock.
The native full-resolution phone export is used unchanged. No re-record was needed.

The new desktop encode reads the numbered source images directly at 60 Hz.
The older concat-based encoder read JPEGs on its default 25 Hz time base before
output conversion, rounding timestamps and duplicating/dropping intermediate
frames. The direct image-sequence export removes that cadence loss. Native
masters and the transparent bezel WebM remain intact in the desktop workspace.

## Playback and phone treatment

- The player uses Apple's flat iPhone 16 Pro Black Titanium artwork, sourced from
  James Jingyi's Device Mockups collection. No invented CSS chassis remains. Its
  exact screen opening is x=102, y=100, 1206×2622 in the 1406×2822 image. The phone
  stays upright, including its initial parked pose, and scales forward at the
  existing cue. There is no active 3D renderer or model download on any device.
- `HappyOnePhone3D.tsx`, `happyOnePhoneScene.ts`, the model, and its dependencies
  are retained as an unused alternative. Its original capability gates and
  stable-canvas zoom fix remain intact, but the landing page does not import it.
- Zoom animates the phone's CSS transform, keeping its desktop layout at expanded
  size. Mobile retains its separate portrait reveal. Author, license, source,
  and modification credits are linked beside Docs, Privacy, and Terms in this
  page's footer, not beneath the player.
- Desktop is the clock. Play/pause, seeks, buffering, and replay coordinate both
  elements; ordinary `timeupdate` events correct drift greater than 120 ms.
- Videos load when the figure first intersects the viewport. Playback pauses when
  less than a quarter is visible or the document is hidden. Returning resumes only
  when playback was wanted; an explicit Pause stays paused.
- Reduced-motion and save-data visitors start paused. Keyboard-accessible controls
  provide play/pause, sound, scrubbing, and persistent phone inspection. Hover gives
  a small upright enlargement. Reduced motion suppresses animation.
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
seconds for the 60 fps pair and the 30 fps fallback.

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