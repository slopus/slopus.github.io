/**
 * The take the homepage hero plays: the recorded Mac window, and the phone beside it. To swap in
 * a new recording, change this file only. The window is the movie's own frame (bake the traffic
 * lights in), drawn at its aspect ratio. The phone screen fills the iPhone frame's 1206×2622
 * aperture and is cropped to it, so any iPhone screen recording fits.
 */

/** One encoding; the browser plays the first it can whose `media` matches the viewport. */
export type DemoSource = { src: string, type: string, media?: string }
export type DemoMovie = { kind: 'movie', width: number, height: number, poster: string, sources: readonly DemoSource[] }
export type DemoStill = { kind: 'still', width: number, height: number, src: string }

export type DemoTake = {
  desktop: DemoMovie
  /**
   * The phone's screen: a still, or a movie. A movie on the desktop's clock (`follows: true`,
   * the two recorded together) plays, pauses, seeks, and loops with the window; otherwise it
   * loops on its own.
   */
  phone: (DemoMovie & { follows: boolean }) | DemoStill
  /** Seconds on the desktop's clock while the phone comes forward. */
  phoneFocus?: readonly [number, number]
  /** What the take shows, for screen readers. */
  label: string
}

const TAKE = '/video/happy-one/team-take11'
// Wider screens get 60fps: AV1, or H.264 for browsers without it (Macs before M3). The H.264 is
// level 5.1 with 5 reference frames, which hardware decoders take at 60fps. Phones get the 30fps
// cut, already sharper than their window.
const WIDE = '(min-width: 701px)'
const H264 = 'video/mp4; codecs="avc1.640033, mp4a.40.2"'

/**
 * Team take 11: Kirill's desktop and Steve's phone, frame for frame on one 60fps clock. Its last
 * 0.6s dissolves into frame 0, so the loop has no seam.
 */
export const DEMO_TAKE: DemoTake = {
  desktop: {
    kind: 'movie', width: 2266, height: 1400, poster: `${TAKE}/desktop-poster.webp`,
    sources: [
      { src: `${TAKE}/desktop.webm`, type: 'video/webm; codecs="av01.0.12M.08, opus"', media: WIDE },
      { src: `${TAKE}/desktop.mp4`, type: H264, media: WIDE },
      { src: `${TAKE}/desktop-30.webm`, type: 'video/webm; codecs="av01.0.08M.08, opus"' },
      { src: `${TAKE}/desktop-30.mp4`, type: H264 },
    ],
  },
  phone: {
    kind: 'movie', follows: true, width: 1206, height: 2622, poster: `${TAKE}/phone-poster.webp`,
    sources: [
      { src: `${TAKE}/phone.webm`, type: 'video/webm; codecs="av01.0.12M.08"', media: WIDE },
      { src: `${TAKE}/phone.mp4`, type: 'video/mp4; codecs="avc1.640033"', media: WIDE },
      { src: `${TAKE}/phone-30.webm`, type: 'video/webm; codecs="av01.0.08M.08"' },
      { src: `${TAKE}/phone-30.mp4`, type: 'video/mp4; codecs="avc1.640033"' },
    ],
  },
  // Steve's part, phone-forward to the second phone-tuck: he opens the task, answers, and is back
  // on his sidebar. The composed movie also brings the phone forward as the task arrives
  // (9.45–12.95s); here it stays beside the window then.
  phoneFocus: [2023 / 60, 2833 / 60],
  label: 'Kirill opens a new task with the model menu open, picks Opus 5.5 and asks for an animated waveform in the voice agent. On Send the task appears in Steve’s sidebar on his phone. Opus hands the code to a subtask, then shows a live preview of the waveform. Steve opens the task on his phone and answers: narrower, five bars max. Opus narrows it to five bars.',
}
