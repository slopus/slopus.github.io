'use client'

import AppStoreButton from '@/components/AppStoreButton'
import GooglePlayButton from '@/components/GooglePlayButton'
import NpmButton from '@/components/NpmButton'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Bricolage_Grotesque } from 'next/font/google'
import Link from 'next/link'
import SetupSteps from '@/components/marketing/SetupSteps'
import { BentoBoxes } from '@/components/marketing'
import GithubLink from '@/components/marketing/GithubLink'
import MobileSetup from '@/components/marketing/MobileSetup'
import { PhoneBundle } from '@/components/phones'

const bricolageGrotesque = Bricolage_Grotesque({
  weight: '700',
  subsets: ['latin'],
})


// Download links constants
const NPM_LINK = 'https://www.npmjs.com/package/happy-coder'
const GOOGLE_PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.ex3ndr.happy'
const APP_STORE_LINK = 'https://apps.apple.com/us/app/happy-claude-code-client/id6748571505'

export default function Home() {
  // Background video source
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
      <main className="min-h-screen relative text-white flex flex-col items-center justify-center p-8 font-mono max-w-screen overflow-x-hidden" style={{
          marginTop: "calc(-1 * var(--nextra-navbar-height))",
          paddingTop: "calc(var(--spacing) * 8 + var(--nextra-navbar-height))",
      }}>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      
      {/* Overlay for better text readability */}
      {/* <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div> */}
      
      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center">

        {/* Logo and Subtitle */}
        <div className="mb-6 mt-6 bg-[#6999ac]/50 backdrop-blur-[32px] border-2 border-white/20 rounded-[32px] p-8 text-shadow-lg">
          <h1 className={`${bricolageGrotesque.className} text-4xl md:text-5xl font-bold text-white font-mono mb-4`}>
            Happy Coder
          </h1>
          
          <div className="text-3xl md:text-4xl leading-[100%] text-white">
            <p className="font-bold">Claude Code in your pocket</p>
          </div>
        </div>
        
        {/* App Store Badges */}
        <div className="flex flex-col sm:flex-row justify-center items-center max-w-lg mx-auto mb-8">
          {renderStoreButtons()}
        </div>
        
        {/* App Screenshot with load animation */}
        <PhoneBundle 
          size="medium" 
          className="mb-16" 
          animationDelay={500}
        />
        
        {/* Features List */}
        <div className="text-2xl leading-normal mb-12 bg-[#6999ac]/50 backdrop-blur-[32px] border-2 border-white/20 rounded-[32px] p-8 font-bold text-shadow-lg">
          <ul className="space-y-3 max-w-md mx-auto text-left text-white list-disc pl-6">
            <li>
              Open Source: MIT License
            </li>
            <li>
              Native mobile UX
            </li>
            <li>
              Seamless Workflow
            </li>
            <li>
              End-to-End Encrypted
            </li>
          </ul>
        </div>
        
        {/* Installation Guide */}
        <div className="text-base leading-normal mb-12 bg-[#6999ac]/50 backdrop-blur-[32px] border-2 border-white/20 rounded-[32px] p-8 text-shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-white">How to get started:</h3>
          <ol className="space-y-2 max-w-md mx-auto text-left text-white list-decimal font-bold pl-6">
            <li>
              Download the mobile app
            </li>
            <li>
              Install the NPM package on your computer and run 'happy'
            </li>
            <li>
              Scan the QR code
            </li>
          </ol>
        </div>
        
        {/* Footer */}
        <div className="bg-[#6999ac]/50 backdrop-blur-[32px] border-2 border-white/20 rounded-[32px] p-6 text-shadow-md">
          <div className="text-sm leading-normal text-white mb-4">
            Made in San Francisco 🌉
          </div>
          
          {/* Legal Links */}
          <div className="text-sm leading-normal text-white flex justify-center space-x-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </main>
    </>
  )
} 