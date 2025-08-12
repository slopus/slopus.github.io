'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppStoreButton from '@/components/AppStoreButton'
import GooglePlayButton from '@/components/GooglePlayButton'
import NpmButton from '@/components/NpmButton'
import Terminal from '@/components/Terminal'

// Download links constants
const NPM_LINK = 'https://www.npmjs.com/package/happy-coder'
const GOOGLE_PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.ex3ndr.happy'
const APP_STORE_LINK = 'https://apps.apple.com/us/app/happy-claude-code-client/id6748571505'

export default function HeroSection() {
  // Background video source (using existing video)
  const videoSrc = '/water1-small.mp4'
  
  // Device detection state
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    // Client-side device detection
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios')
    } else if (/android/.test(userAgent)) {
      setDeviceType('android')
    } else {
      setDeviceType('desktop')
    }
  }, [])

  // Render store buttons based on device type
  const renderStoreButtons = () => {
    switch (deviceType) {
      case 'ios':
        return (
          <>
            <NpmButton href={NPM_LINK} />
            <AppStoreButton href={APP_STORE_LINK} />
          </>
        )
      case 'android':
        return (
          <>
            <NpmButton href={NPM_LINK} />
            <GooglePlayButton href={GOOGLE_PLAY_LINK} />
          </>
        )
      case 'desktop':
      default:
        return (
          <>
            <NpmButton href={NPM_LINK} />
            <GooglePlayButton href={GOOGLE_PLAY_LINK} />
            <AppStoreButton href={APP_STORE_LINK} />
          </>
        )
    }
  }

  return (
    <>
    <section className="min-h-screen bg-background relative"
    style={{
      marginTop: "calc(-1 * var(--nextra-navbar-height))",
      paddingTop: "calc(var(--spacing) * 8 + var(--nextra-navbar-height))",
    }}
    >
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black">
        <video 
          src={videoSrc} 
          preload="metadata" 
          autoPlay 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover scale-110" 
          style={{
            minWidth: '110%', 
            minHeight: '110%', 
            width: 'auto', 
            height: 'auto', 
            left: '50%', 
            top: '50%', 
            transform: 'translate(-50%, -50%) scale(1.1)'
          }}
        >
          Your browser does not support the video tag.
        </video>
        
        {/* Gradient overlays for better text readability */}
        <div 
          className="absolute inset-0" 
          style={{
            background: 'linear-gradient(rgba(20, 15, 10, 0.75) 0%, rgba(20, 15, 10, 0.45) 50%, rgba(20, 15, 10, 0.25) 100%)'
          }}
        />
        <div 
          className="absolute inset-0" 
          style={{
            background: 'radial-gradient(transparent 0%, transparent 40%, rgba(20, 15, 10, 0.5) 100%)'
          }}
        />
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'linear-gradient(transparent 0%, transparent 75%, rgba(0, 0, 0, 0.2) 85%, rgba(0, 0, 0, 0.5) 92%, rgba(0, 0, 0, 0.8) 98%)'
          }}
        />
        
        <div className="absolute inset-0 flex items-start justify-center pt-8 md:pt-12">
          <div className="relative p-6 sm:p-10 md:p-14 pt-12 sm:pt-16 md:pt-20 animate-fadeIn">
            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(-20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              .animate-fadeIn {
                animation: fadeIn 0.6s ease-out;
              }
            `}</style>
            
            <div className="text-center">
              <div className="space-y-4 mb-8">
                <h2 
                  className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#f5e6d3] mb-3" 
                  style={{ textShadow: 'rgba(0, 0, 0, 0.9) 0px 2px 12px' }}
                >
                  Your Claude Code CLI, Now Seamlessly Mobile
                </h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="px-8 sm:px-14 py-4 sm:py-5 bg-amber-500/90 hover:bg-amber-500 text-black font-semibold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50 border-2 border-amber-400/50 font-mono text-lg sm:text-xl w-full sm:w-auto">
                  Go to App
                </button>
                <div className="flex flex-col sm:flex-row gap-2">
                  {renderStoreButtons()}
                </div>
              </div>
              
              <div className="mt-6 flex flex-col items-center space-y-2">
                <span 
                  className="text-[#f5e6d3]/60 text-sm" 
                  style={{ textShadow: 'rgba(0, 0, 0, 0.8) 0px 2px 8px' }}
                >
                  Then get started with:
                </span>
                <Terminal command="npm install happy-coder && happy" />

              </div>
            </div>
          </div>
        </div>
        
      </div>
    </section>
    <section>
        <span 
          className="text-[#f5e6d3]/60 text-sm" 
          style={{ textShadow: 'rgba(0, 0, 0, 0.8) 0px 2px 8px' }}
        >
          Then get started with:
        </span>
        <Terminal command="npm install happy-coder && happy" variant="light" />
      

    </section>
    </>
  )
}
