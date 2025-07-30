'use client'

import AppStoreButton from '@/components/AppStoreButton'
import GooglePlayButton from '@/components/GooglePlayButton'
import NpmButton from '@/components/NpmButton'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Bricolage_Grotesque } from 'next/font/google'
import Link from 'next/link'

const bricolageGrotesque = Bricolage_Grotesque({
  weight: '700',
  subsets: ['latin'],
})

export default function Home() {
  // Background video source
  const videoSrc = '/water1-small.mp4'
  
  // Device detection state
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('desktop')
  
  // Scroll position for animation
  const [scrollProgress, setScrollProgress] = useState(0)

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

    // Scroll event listener for animation
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      
      // Calculate scroll progress (0 to 1) - faster animation
      const progress = Math.min(scrollTop / (documentHeight * 0.45), 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Render store buttons based on device type
  const renderStoreButtons = () => {
    switch (deviceType) {
      case 'ios':
        return (
          <>
            <NpmButton href="https://www.npmjs.com/package/happy-coder" />
            <AppStoreButton href="https://google.com" />
          </>
        )
      case 'android':
        return (
          <>
            <NpmButton href="https://www.npmjs.com/package/happy-coder" />
            <GooglePlayButton href="https://google.com" />
          </>
        )
      case 'desktop':
      default:
        return (
          <>
            <NpmButton href="https://www.npmjs.com/package/happy-coder" />
            <GooglePlayButton href="https://google.com" />
            <AppStoreButton href="https://google.com" />
          </>
        )
    }
  }
  
  return (
    <main className="min-h-screen relative text-white flex flex-col items-center justify-center p-8 font-mono">
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
        {/* Logo */}
        <div className="mb-6 mt-6">
          <h1 className={`${bricolageGrotesque.className} text-4xl md:text-5xl font-bold text-black font-mono`}>
            Happy Coder
          </h1>
        </div>
        
        {/* Subtitle */}
        <div className="text-3xl md:text-4xl leading-[100%] mb-8 text-black">
          <p className="mb-2 leading-[80%]">Claude Code</p>
          <p className="leading-[80%]">in your pocket.</p>
        </div>
        
        {/* App Store Badges */}
        <div className="flex flex-col sm:flex-row justify-center items-center max-w-lg mx-auto mb-8">
          {renderStoreButtons()}
        </div>
        
        {/* App Screenshot with sliding animation */}
        <div className="mb-16 relative">
          <div 
            className="relative w-[300px] max-w-[80%] h-auto mx-auto"
            style={{ perspective: '1000px' }}
          >
            {/* App 2 - slides to the left */}
            <div 
              className="absolute inset-0 transition-transform duration-75 ease-out"
              style={{
                transform: `translateX(${-scrollProgress * 120}px) translateY(${scrollProgress * 20}px) translateZ(${-scrollProgress * 50}px) rotate(${-scrollProgress * 15}deg) rotateY(${scrollProgress * 25}deg) rotateX(${scrollProgress * 10}deg)`,
                transformOrigin: 'bottom center',
                transformStyle: 'preserve-3d',
                filter: `drop-shadow(${scrollProgress * 20}px ${scrollProgress * 10}px ${scrollProgress * 30}px rgba(0,0,0,0.3))`,
                zIndex: 1
              }}
            >
              <Image
                src="/app-2.png"
                alt="Rafty App Screenshot 2"
                width={400}
                height={866}
                className="w-full h-auto"
              />
            </div>

            {/* App 1 - slides to the right */}
            <div 
              className="absolute inset-0 transition-transform duration-75 ease-out"
              style={{
                transform: `translateX(${scrollProgress * 120}px) translateY(${scrollProgress * 20}px) translateZ(${-scrollProgress * 50}px) rotate(${scrollProgress * 15}deg) rotateY(${-scrollProgress * 25}deg) rotateX(${scrollProgress * 10}deg)`,
                transformOrigin: 'bottom center',
                transformStyle: 'preserve-3d',
                filter: `drop-shadow(${-scrollProgress * 20}px ${scrollProgress * 10}px ${scrollProgress * 30}px rgba(0,0,0,0.3))`,
                zIndex: 1
              }}
            >
              <Image
                src="/app-1.png"
                alt="Rafty App Screenshot"
                width={400}
                height={866}
                className="w-full h-auto"
              />
            </div>

            {/* App 3 - main image on top */}
            <div 
              className="relative z-10"
              style={{
                filter: `drop-shadow(0px ${scrollProgress * 5}px ${scrollProgress * 15}px rgba(0,0,0,0.2))`,
                transform: `translateZ(${scrollProgress * 10}px)`,
                transformStyle: 'preserve-3d'
              }}
            >
              <Image
                src="/app-3.png"
                alt="Rafty App Screenshot 3"
                width={400}
                height={866}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Features List */}
        <div className="text-xl leading-normal mb-20 text-white">
          <ul className="space-y-2 max-w-md mx-auto text-center">
            <li className="flex items-center justify-center">
              <span className="text-white mr-3">•</span>
              End-to-End Encrypted
            </li>
            <li className="flex items-center justify-center">
              <span className="text-white text-shadow-sm/50 mr-3">•</span>
              Open Source
            </li>
            <li className="flex items-center justify-center">
              <span className="text-white text-shadow-lg mr-3">•</span>
              Native mobile UX
            </li>
            <li className="flex items-center justify-center">
              <span className="text-white mr-3">•</span>
              Seamless Workflow
            </li>
          </ul>
        </div>
        
        {/* Installation Guide */}
        <div className="text-base leading-normal mb-20 text-white">
          <h3 className="text-xl font-semibold mb-4">How to get started:</h3>
          <ol className="space-y-2 max-w-md mx-auto text-left">
            <li className="flex items-start">
              <span className="text-white mr-3 mt-1">1.</span>
              Download the mobile app
            </li>
            <li className="flex items-start">
              <span className="text-white mr-3 mt-1">2.</span>
              Install the NPM package on your computer and run 'happy'
            </li>
            <li className="flex items-start">
              <span className="text-white mr-3 mt-1">3.</span>
              Scan the QR code
            </li>
          </ol>
        </div>
        
        {/* Footer */}
        <div className="text-sm leading-normal text-white">
          Made in San Francisco 🌉
        </div>
        
        {/* Legal Links */}
        <div className="text-sm leading-normal text-white mt-4 flex justify-center space-x-6">
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">
            Terms of Use
          </Link>
        </div>
      </div>
    </main>
  )
} 