'use client'

import { useEffect, useRef, useState } from 'react'

export default function VideoComposite() {
  const terminalVideoRef = useRef<HTMLVideoElement>(null)
  const simVideoRef = useRef<HTMLVideoElement>(null)
  const [terminalVideoLoaded, setTerminalVideoLoaded] = useState(false)
  const [simVideoLoaded, setSimVideoLoaded] = useState(false)
  const [videosReady, setVideosReady] = useState(false)

  useEffect(() => {
    // Preload videos asynchronously
    const preloadVideos = async () => {
      const terminalVideo = document.createElement('video')
      const simVideo = document.createElement('video')
      
      terminalVideo.src = '/take-4-short-term.mp4'
      terminalVideo.muted = true
      terminalVideo.playsInline = true
      
      simVideo.src = '/take-4-short-sim.webm'
      simVideo.muted = true
      simVideo.playsInline = true
      
      // Wait for both videos to be ready
      await Promise.all([
        new Promise(resolve => {
          terminalVideo.addEventListener('canplaythrough', () => {
            setTerminalVideoLoaded(true)
            resolve(true)
          })
          terminalVideo.load()
        }),
        new Promise(resolve => {
          simVideo.addEventListener('canplaythrough', () => {
            setSimVideoLoaded(true)
            resolve(true)
          })
          simVideo.load()
        })
      ])
      
      setVideosReady(true)
    }
    
    preloadVideos()
  }, [])

  useEffect(() => {
    if (!videosReady) return
    
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
  }, [videosReady])

  return (
    <section className="max-w-[75ch] mx-auto px-2.5 py-4 sm:pl-[1ch] sm:pr-0">
      {/* Scalable container - 70% scale on desktop */}
      <div className="relative mx-auto aspect-[600/670] sm:scale-[0.7] sm:origin-top sm:-mb-[30%]">
        {/* Terminal video - positioned top-left */}
        <div className="absolute top-0 left-0 h-[74.6%] aspect-[500/512] bg-gray-900 text-gray-300 rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
          {!videosReady ? (
            <>
              {/* Poster image with fixed dimensions to prevent layout shift */}
              <img
                src="/take-4-short-term-poster.png"
                alt="Terminal demo"
                className="w-full h-full object-cover"
                width={500}
                height={512}
              />
              {/* Loading indicator */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
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
          )}
        </div>
        
        {/* Phone video - positioned bottom-right */}
        <div className="absolute bottom-0 right-0 w-[50%] aspect-[1110/2232]">
          {!videosReady ? (
            <>
              {/* Poster image with fixed dimensions to prevent layout shift */}
              <img
                src="/take-4-short-sim-poster.png"
                alt="Mobile app demo"
                className="w-full h-full object-cover"
                width={1110}
                height={2232}
              />
              {/* Loading indicator */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          ) : (
            <video
              ref={simVideoRef}
              src="/take-4-short-sim.webm"
              poster="/take-4-short-sim-poster.png"
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
            />
          )}
        </div>
      </div>
    </section>
  )
}
