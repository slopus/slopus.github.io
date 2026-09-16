/*
 * The v17-r6 recording's own camera, replayed on the website.
 *
 * The movie is raw application content. At rest the recorded 3060×1660 window
 * sits letterboxed inside the 2340×1440 frame; the director then eases a fixed
 * crop onto the conversation (`frameTo`) and back out (`zoomOut`), both over
 * 1100ms with easeInOutQuint on every crop edge. Replaying that exact path here
 * lets the page draw the macOS window edge and traffic lights on the recorded
 * window itself, and lets them leave the frame the way a window edge does when
 * a camera zooms into it, rather than framing the movie in a second window.
 */
const FPS = 60
/** 1100ms of 60fps frames. */
const MOVE_FRAMES = 66
/** Measured sub-frame offset between the director's motion clock and its frame clock. */
const MOVE_PHASE = 0.7
/** `center-enter` cue: the first frame of the zoom in. */
const ENTER_FRAME = 97
/** `center-exit` cue: the first frame of the zoom out. */
const EXIT_FRAME = 2642
const OUTPUT = { width: 2340, height: 1440 }
const REST = { left: 70, top: 70, width: 3060, height: 1660 }
const LOCK = { left: 790, top: 290, width: 2340, height: 1440 }
/** Letterbox above the resting window: floor((1440 − round(1660 × 2340 / 3060)) / 2). */
export const REST_BAR_TOP = 85

type Crop = typeof REST

export type HappyOneDemoCamera = {
  readonly frame: number
  /** Letterbox rows above and below the recorded content, in movie pixels. */
  readonly barTop: number
  readonly barBottom: number
  /** Scale of the resting window as it appears in this frame (1 at rest). */
  readonly scale: number
  /** Where the resting window's top-left corner sits, relative to the content's top-left, in movie pixels. */
  readonly x: number
  readonly y: number
}

function easeInOutQuint(t: number) {
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2
}

function move(from: Crop, to: Crop, frames: number): Crop {
  const eased = easeInOutQuint(Math.min(1, (frames + MOVE_PHASE) / MOVE_FRAMES))
  return {
    left: Math.round(from.left + (to.left - from.left) * eased),
    top: Math.round(from.top + (to.top - from.top) * eased),
    width: Math.round(from.width + (to.width - from.width) * eased),
    height: Math.round(from.height + (to.height - from.height) * eased),
  }
}

function cropAt(frame: number): Crop {
  if (frame < ENTER_FRAME) return REST
  if (frame < ENTER_FRAME + MOVE_FRAMES) return move(REST, LOCK, frame - ENTER_FRAME)
  if (frame < EXIT_FRAME) return LOCK
  if (frame < EXIT_FRAME + MOVE_FRAMES) return move(LOCK, REST, frame - EXIT_FRAME)
  return REST
}

export function happyOneDemoCameraAt(seconds: number): HappyOneDemoCamera {
  const frame = Math.max(0, Math.round(seconds * FPS))
  const crop = cropAt(frame)
  const toOutput = OUTPUT.width / crop.width
  const contentHeight = Math.round(crop.height * toOutput)
  const barTop = Math.floor((OUTPUT.height - contentHeight) / 2)
  return {
    frame,
    barTop,
    barBottom: OUTPUT.height - contentHeight - barTop,
    scale: REST.width / crop.width,
    x: (REST.left - crop.left) * toOutput,
    y: (REST.top - crop.top) * toOutput,
  }
}

/** Writes one frame's camera onto the window element; the stylesheet does the rest. */
export function happyOneDemoCameraApply(element: HTMLElement, camera: HappyOneDemoCamera) {
  const { style } = element
  style.setProperty('--bar-top', String(camera.barTop))
  style.setProperty('--bar-bottom', String(camera.barBottom))
  style.setProperty('--window', Math.min(1, camera.barTop / REST_BAR_TOP).toFixed(3))
  style.setProperty('--cam-s', camera.scale.toFixed(4))
  style.setProperty('--cam-tx', camera.x.toFixed(1))
  style.setProperty('--cam-ty', camera.y.toFixed(1))
}
