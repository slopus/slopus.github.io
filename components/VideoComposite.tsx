'use client'

import { useEffect, useRef } from 'react'

export default function VideoComposite() {
  const terminalVideoRef = useRef<HTMLVideoElement>(null)
  const simVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // Sync video playback when terminal video starts playing
    const terminalVideo = terminalVideoRef.current
    const simVideo = simVideoRef.current

    if (terminalVideo && simVideo) {
      const syncPlayback = () => {
        if (terminalVideo.paused) {
          simVideo.pause()
        } else {
          simVideo.play()
        }
      }

      terminalVideo.addEventListener('play', syncPlayback)
      terminalVideo.addEventListener('pause', syncPlayback)

      return () => {
        terminalVideo.removeEventListener('play', syncPlayback)
        terminalVideo.removeEventListener('pause', syncPlayback)
      }
    }
  }, [])

  return (
    <section className="max-w-[75ch] mx-auto px-2.5 py-8 sm:pl-[1ch] sm:pr-0">
      {/* Scalable container - change w-[600px] to scale everything */}
      <div className="relative mx-auto aspect-[600/670]">
        {/* Terminal video - positioned top-left */}
        <div className="absolute top-0 left-0 h-[74.6%] aspect-[500/512] bg-gray-900 text-gray-300 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
          <video
            ref={terminalVideoRef}
            src="/take-3-short-term.mp4"
            className="w-full h-full object-cover"
            controls
            loop
            muted
            playsInline
          />
        </div>
        
        {/* Phone video - positioned bottom-right */}
        <video
          ref={simVideoRef}
          src="/take-3-short-sim.mp4"
          className="absolute bottom-0 right-0 w-[50%] h-auto"
          loop
          muted
          playsInline
        />
      </div>
    </section>
  )
}
