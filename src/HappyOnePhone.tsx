import type { RefObject } from 'react'

type Props = {
  video: RefObject<HTMLVideoElement | null>
  poster: string
  hint: boolean
}

/** Steve's phone, named while it is focused, with the composed cut's one phone hint. */
export function HappyOnePhone({ video, poster, hint }: Props) {
  return (
    <div className="one-demo-phone">
      <span className="one-phone-label" aria-hidden="true"><em>Steve’s</em> phone</span>
      <span className="one-phone-flat">
        <video ref={video} poster={poster} width="1206" height="2622"
          playsInline preload="none" aria-label="The same session on Steve’s iPhone" />
        <img src="/video/happy-one/device/iphone-16-pro-black.png" width="1406" height="2822"
          alt="iPhone 16 Pro in Black Titanium" />
      </span>
      <span className="one-phone-hint" data-shown={hint ? '' : undefined} aria-hidden="true">
        <span className="one-phone-ring" />
        <span className="one-phone-pill">New on Steve’s phone</span>
      </span>
    </div>
  )
}
