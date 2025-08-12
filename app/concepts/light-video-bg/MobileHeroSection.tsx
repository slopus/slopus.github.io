'use client'

import { useState, useEffect } from 'react'
import AppStoreButton from '@/components/AppStoreButton'
import GooglePlayButton from '@/components/GooglePlayButton'
import Terminal from '@/components/Terminal'
import PhoneBundle from '@/components/phones/PhoneBundle'

// Download links constants
const GOOGLE_PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.ex3ndr.happy'
const APP_STORE_LINK = 'https://apps.apple.com/us/app/happy-claude-code-client/id6748571505'

export default function MobileHeroSection() {
  // Background video source (using existing video)
  const videoSrc = '/riding-bg-2.mp4'
  
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
            <AppStoreButton href={APP_STORE_LINK} />
          </>
        )
      case 'android':
        return (
          <>
            <GooglePlayButton href={GOOGLE_PLAY_LINK} />
          </>
        )
      case 'desktop':
      default:
        return (
          <>
            <GooglePlayButton href={GOOGLE_PLAY_LINK} />
            <AppStoreButton href={APP_STORE_LINK} />
          </>
        )
    }
  }

  return (
    <section className="min-h-screen bg-background relative sm:hidden"
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
        <div className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/25 to-white/15" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-white/25" />
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'linear-gradient(transparent 0%, transparent 75%, rgba(255, 255, 255, 0.2) 85%, rgba(255, 255, 255, 0.5) 92%, rgba(255, 255, 255, 0.8) 98%)'
          }}
        />
        
        <div className="absolute inset-0 flex items-start justify-center pt-8 md:pt-12">
          <div className="relative p-6 sm:p-10 md:p-14 pt-12 sm:pt-16 md:pt-20 animate-in fade-in slide-in-from-top-4 duration-600">
            
            <div className="text-center">
              <div className="space-y-4 mb-8">
                <h2 
                  className="text-2xl sm:text-2xl md:text-3xl font-semibold text-[#1a1a1a] mb-3 drop-shadow-[0_2px_12px_rgba(255,255,255,0.9)]"
                >
                  Native Mobile App for Claude Code
                </h2>
              </div>
              <PhoneBundle size="small" /> 
              
              <div className="flex gap-2 justify-center items-center flex-wrap w-screen mt-12">
                {renderStoreButtons()}
              </div>
              
              <div className="mt-6 flex flex-col items-center space-y-2">
                <span 
                  className="text-md font-semibold drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]"
                >
                  Then get started with:
                </span>
                <Terminal command="npm install happy-coder && happy" variant="light" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
