'use client'

import { useState, useEffect } from 'react'
import AppStoreButton from '@/components/AppStoreButton'
import GooglePlayButton from '@/components/GooglePlayButton'
import StarOnGithubButton from '@/components/GithubButton'
import LaunchWebAppButton from '@/components/WebAppButton'
import PhoneBundle from '@/components/phones/PhoneBundle'
import Terminal from '@/components/Terminal'

// Download links constants
const GOOGLE_PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.ex3ndr.happy'
const APP_STORE_LINK = 'https://apps.apple.com/us/app/happy-claude-code-client/id6748571505'

export default function DesktopHeroSection() {
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
    <section className="py-8 pb-24 md:py-24 xl:py-32 hidden sm:block">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-5 leading-tight">
              Native Mobile App for Claude Code CLI
            </h1>
            
            <div className="mb-6 text-lg sm:text-xl">
              <div className="flex items-start mb-4 text-gray-700">
                <span className="text-green-500 mr-2.5 font-bold">✓</span>
                <span>Real-time sync between CLI and mobile - same session, everywhere</span>
              </div>
              <div className="flex items-start mb-4 text-gray-700">
                <span className="text-green-500 mr-2.5 font-bold">✓</span>
                <span>100% Free & Open Source (MIT Licensed)</span>
              </div>
              <div className="flex items-start mb-4 text-gray-700">
                <span className="text-green-500 mr-2.5 font-bold">✓</span>
                <span>Works with your existing Claude Code workflow</span>
              </div>
              <div className="flex items-start mb-4 text-gray-700">
                <span className="text-green-500 mr-2.5 font-bold">✓</span>
                <span>Multiple concurrent sessions support</span>
              </div>
                <Terminal command="npm i -g happy-coder && happy" variant="light" />
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="flex gap-4 flex-wrap">
                {renderStoreButtons()}
                <LaunchWebAppButton href="https://app.happy.engineering" />
                <StarOnGithubButton href="https://github.com/slopus/happy" />
              </div>
              <div className="flex gap-4 items-center">
              </div>
            </div>
            
          </div>
          
          <div className="relative">
            <PhoneBundle size="medium" />
          </div>
        </div>
      </div>
    </section>
  )
}
