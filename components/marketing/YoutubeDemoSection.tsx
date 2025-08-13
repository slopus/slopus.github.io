'use client'

import { useState } from 'react'
import Image from 'next/image'

interface YoutubeDemoSectionProps {
  youtubeId: string
  posterImage?: string
  title?: string
}

export default function YoutubeDemoSection({ 
  youtubeId, 
  posterImage = "/app-1.png", // Default to existing app screenshot
  title = "See Claude Code in Action"
}: YoutubeDemoSectionProps) {
  const [showVideo, setShowVideo] = useState(false)

  const handlePlayClick = () => {
    setShowVideo(true)
  }

  const handleCloseClick = () => {
    setShowVideo(false)
  }

  return (
    <>
      <section 
        className="container mx-auto px-4 py-8 max-w-[800px]" 
        aria-label="Product demo video"
      >
        <div className="relative w-full rounded-lg bg-white border overflow-hidden shadow-lg">
          {/* Poster Image with Play Button */}
          <div className="relative aspect-video">
            <Image
              src={posterImage}
              alt="Demo video thumbnail"
              fill
              className="object-cover"
              sizes="(max-width: 800px) 100vw, 800px"
            />
            
            {/* Play Button Overlay */}
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all duration-300 group"
              aria-label="Play demo video"
            >
              <div className="relative flex items-center justify-center h-16 w-16 rounded-full bg-black/70 backdrop-blur-sm transition-all duration-300 transform scale-100 hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-1 transition-transform duration-300 scale-100"></div>
              </div>
            </button>
          </div>
        </div>
        
        {/* Optional title */}
        {title && (
          <h2 className="text-center text-2xl font-bold mt-6 text-gray-900">
            {title}
          </h2>
        )}
      </section>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={handleCloseClick}
          />
          
          {/* Video Container */}
          <div className="relative z-50 w-full max-w-5xl mx-4">
            <div className="aspect-video relative rounded-lg overflow-hidden">
              <iframe
                className="absolute inset-0 w-full h-full rounded-lg"
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
                title="Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                frameBorder="0"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleCloseClick}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors z-50"
            aria-label="Close video"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
      )}
    </>
  )
}
