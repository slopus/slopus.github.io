import type { RefObject } from 'react'

type Props = {
  video: RefObject<HTMLVideoElement | null>
}

export function HappyOnePhone({ video }: Props) {
  return (
    <div className="one-demo-phone">
      <span className="one-phone-flat">
        <video ref={video} poster="/video/happy-one/v16/phone-poster.webp" width="1206" height="2622"
          muted playsInline preload="none" aria-label="The same live session on iPhone" />
        <img src="/video/happy-one/device/iphone-16-pro-black.png" width="1406" height="2822"
          alt="iPhone 16 Pro in Black Titanium" />
      </span>
    </div>
  )
}