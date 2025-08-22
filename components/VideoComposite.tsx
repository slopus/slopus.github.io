'use client'

import { useEffect, useRef } from 'react'

export default function VideoComposite() {
  const terminalVideoRef = useRef<HTMLVideoElement>(null)
  const simVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const terminalVideo = terminalVideoRef.current
    const simVideo = simVideoRef.current

    if (terminalVideo && simVideo) {
      // Sync play/pause state
      const syncPlayback = () => {
        if (terminalVideo.paused) {
          simVideo.pause()
        } else {
          simVideo.play()
        }
      }

      // Sync timeline position when user seeks
      const syncTimePosition = () => {
        const currentTime = terminalVideo.currentTime
        // Only sync if there's a significant difference (avoid infinite loops)
        if (Math.abs(simVideo.currentTime - currentTime) > 0.1) {
          simVideo.currentTime = currentTime
        }
      }

      // Add event listeners for play/pause sync
      terminalVideo.addEventListener('play', syncPlayback)
      terminalVideo.addEventListener('pause', syncPlayback)
      
      // Add event listeners for timeline sync
      terminalVideo.addEventListener('seeked', syncTimePosition)
      terminalVideo.addEventListener('timeupdate', syncTimePosition)

      return () => {
        // Clean up all event listeners
        terminalVideo.removeEventListener('play', syncPlayback)
        terminalVideo.removeEventListener('pause', syncPlayback)
        terminalVideo.removeEventListener('seeked', syncTimePosition)
        terminalVideo.removeEventListener('timeupdate', syncTimePosition)
      }
    }
  }, [])

  return (
    <section className="max-w-[75ch] mx-auto px-2.5 py-4 sm:pl-[1ch] sm:pr-0">
      {/* Scalable container - 70% scale on desktop */}
      <div className="relative mx-auto aspect-[600/670] sm:scale-[0.7] sm:origin-top sm:-mb-[30%]">
        {/* Terminal video - positioned top-left */}
        <div className="absolute top-0 left-0 h-[74.6%] aspect-[500/512] bg-gray-900 text-gray-300 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
          <video
            ref={terminalVideoRef}
            src="/take-4-short-term.mp4"
            poster="/take-4-short-term-poster.png"
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
          src="/take-4-short-sim.webm"
          // Need a PNG because we have an alpha channel
          poster="/take-4-short-sim-poster.png"
          className="absolute bottom-0 right-0 w-[50%] h-auto"
          loop
          muted
          playsInline
        />
      </div>
    </section>
  )
}
