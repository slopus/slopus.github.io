import { useCallback, useState, type PointerEvent } from 'react'

/**
 * The browser's own video controls, hidden while a muted movie autoplays so no chrome covers it,
 * and shown once the reader reaches for them: a mouse moving over it, a tap or click, or keyboard
 * focus. Then the ordinary scrubber seeks, by mouse or by touch. Spread `videoProps` on the video;
 * `revealControls` shows them for other reasons (autoplay blocked, the movie ended).
 */
export function useRevealedControls() {
  const [controls, setControls] = useState(false)
  const revealControls = useCallback(() => setControls(true), [])
  return {
    revealControls,
    videoProps: {
      controls,
      controlsList: 'nodownload noremoteplayback',
      disablePictureInPicture: true,
      tabIndex: 0,
      onPointerMove: (event: PointerEvent<HTMLVideoElement>) => { if (event.pointerType === 'mouse') revealControls() },
      onPointerDown: revealControls,
      onFocus: revealControls,
    },
  }
}
