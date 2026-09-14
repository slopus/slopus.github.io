import type { RefObject } from 'react'

type Props = {
  video: RefObject<HTMLVideoElement | null>
  inspecting: boolean
  inspect: () => void
}

export function HappyOnePhone({ video, inspecting, inspect }: Props) {
  return (
    <button type="button" className="one-demo-phone" aria-label="Take a closer look at the iPhone"
      aria-pressed={inspecting} onClick={inspect}>
      <span className="one-phone-flat">
        <video ref={video} poster="/video/happy-one/v15/phone-poster.webp" width="1206" height="2622"
          muted playsInline preload="none" aria-label="The same live session on iPhone" />
        <img src="/video/happy-one/device/iphone-16-pro-black.png" width="1406" height="2822"
          alt="iPhone 16 Pro in Black Titanium" />
      </span>
    </button>
  )
}