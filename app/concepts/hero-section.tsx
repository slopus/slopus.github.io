'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppStoreButton from '@/components/AppStoreButton'
import GooglePlayButton from '@/components/GooglePlayButton'
import NpmButton from '@/components/NpmButton'

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText('npm install happy-coder && happy')
  }

  return (
    <div className="min-h-screen bg-background relative">
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
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-[#f5e6d3] mb-8 uppercase tracking-wider" style={{ textShadow: 'rgba(0, 0, 0, 0.9) 0px 2px 12px' }}>
                Happy Coder
              </h1>
              
              <div className="space-y-4 mb-8">
                <h2 
                  className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#f5e6d3] mb-3" 
                  style={{ textShadow: 'rgba(0, 0, 0, 0.9) 0px 2px 12px' }}
                >
                  Claude Code in your pocket
                </h2>
                <p 
                  className="text-base sm:text-lg md:text-xl text-[#f5e6d3]/70 font-light max-w-2xl mx-auto leading-relaxed px-4 sm:px-0" 
                  style={{ textShadow: 'rgba(0, 0, 0, 0.8) 0px 2px 10px' }}
                >
                  Stop being chained to your desk. The real-time command center to monitor, debug, and guide your agent—right from your phone.
                </p>
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
                  Or get started with:
                </span>
                <button 
                  onClick={copyToClipboard}
                  className="group flex items-center space-x-3 px-6 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-200"
                >
                  <code 
                    className="text-base md:text-lg font-mono text-[#f5e6d3]" 
                    style={{ textShadow: 'rgba(0, 0, 0, 0.8) 0px 1px 4px' }}
                  >
                    npm install happy-coder && happy
                  </code>
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
                    className="lucide lucide-copy w-4 h-4 text-[#f5e6d3]/50 group-hover:text-amber-400 transition-colors"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom left attribution */}
        <div className="absolute bottom-6 left-6 flex items-center gap-2 opacity-70 hover:opacity-90 transition-opacity">
          <span 
            className="text-sm text-[#f5e6d3]/60" 
            style={{ textShadow: 'rgba(0, 0, 0, 0.8) 0px 2px 8px' }}
          >
            Built by ex-AI engineers from
          </span>
          <div className="relative w-6 h-6">
            <svg viewBox="0 0 287.56 191" className="w-full h-full" style={{ filter: 'drop-shadow(rgba(0, 0, 0, 0.5) 0px 1px 2px)' }}>
              <path fill="#FFFFFF" d="M31.06,126c0,11,2.41,19.41,5.56,24.51A19,19,0,0,0,53.19,160c8.1,0,15.51-2,29.79-21.76,11.44-15.83,24.92-38,34-52l15.36-23.6c10.67-16.39,23-34.61,37.18-47C181.07,5.6,193.54,0,206.09,0c21.07,0,41.14,12.21,56.5,35.11,16.81,25.08,25,56.67,25,89.27,0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191V160c17.63,0,22-16.2,22-34.74,0-26.42-6.16-55.74-19.73-76.69-9.63-14.86-22.11-23.94-35.84-23.94-14.85,0-26.8,11.2-40.23,31.17-7.14,10.61-14.47,23.54-22.7,38.13l-9.06,16c-18.2,32.27-22.81,39.62-31.91,51.75C84.74,183,71.12,191,53.19,191c-21.27,0-34.72-9.21-43-23.09C3.34,156.6,0,141.76,0,124.85Z"></path>
              <path fill="#FFFFFF" d="M24.49,37.3C38.73,15.35,59.28,0,82.85,0c13.65,0,27.22,4,41.39,15.61,15.5,12.65,32,33.48,52.63,67.81l7.39,12.32c17.84,29.72,28,45,33.93,52.22,7.64,9.26,13,12,19.94,12,17.63,0,22-16.2,22-34.74l27.4-.86c0,19.38-3.82,33.62-10.32,44.87C271,180.13,258.72,191,238.13,191c-12.8,0-24.14-2.78-36.68-14.61-9.64-9.08-20.91-25.21-29.58-39.71L146.08,93.6c-12.94-21.62-24.81-37.74-31.68-45C107,40.71,97.51,31.23,82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78Z"></path>
              <path fill="#FFFFFF" d="M82.35,31.23c-12.27,0-22.69,8.61-31.41,21.78C38.61,71.62,31.06,99.34,31.06,126c0,11,2.41,19.41,5.56,24.51L10.14,167.91C3.34,156.6,0,141.76,0,124.85,0,94.1,8.44,62.05,24.49,37.3,38.73,15.35,59.28,0,82.85,0Z"></path>
            </svg>
          </div>
          <div className="relative w-5 h-5">
            <svg viewBox="0 0 129 129" className="w-full h-full">
              <path fill="#F25022" d="M0,0h61.3v61.3H0V0z"></path>
              <path fill="#7FBA00" d="M67.7,0H129v61.3H67.7V0z"></path>
              <path fill="#00A4EF" d="M0,67.7h61.3V129H0V67.7z"></path>
              <path fill="#FFB900" d="M67.7,67.7H129V129H67.7V67.7z"></path>
            </svg>
          </div>
          <div className="relative w-6 h-6">
            <svg viewBox="0 0 122.879 111.709" className="w-full h-full">
              <g>
                <path fill="#FFFFFF" d="M33.848,54.85c0-5.139,1.266-9.533,3.798-13.182c2.532-3.649,5.995-6.404,10.389-8.266 c4.021-1.713,8.974-2.941,14.858-3.687c2.01-0.223,5.287-0.521,9.83-0.894v-1.899c0-4.766-0.521-7.968-1.564-9.607 c-1.564-2.235-4.021-3.351-7.373-3.351h-0.893c-2.458,0.223-4.581,1.005-6.368,2.345c-1.787,1.341-2.942,3.202-3.463,5.586 c-0.298,1.489-1.042,2.345-2.234,2.569l-12.847-1.564c-1.266-0.298-1.899-0.968-1.899-2.011c0-0.223,0.037-0.484,0.111-0.781 c1.266-6.628,4.375-11.543,9.328-14.746C50.473,2.161,56.264,0.373,62.893,0h2.793c8.488,0,15.117,2.197,19.885,6.591 c0.746,0.748,1.438,1.55,2.066,2.401c0.631,0.856,1.135,1.62,1.506,2.29c0.373,0.67,0.709,1.639,1.006,2.904 c0.299,1.267,0.521,2.142,0.672,2.625c0.148,0.484,0.26,1.527,0.334,3.129c0.074,1.601,0.111,2.55,0.111,2.848v27.034 c0,1.936,0.279,3.705,0.838,5.306c0.559,1.602,1.1,2.756,1.619,3.463c0.521,0.707,1.379,1.844,2.57,3.406 c0.447,0.672,0.67,1.268,0.67,1.789c0,0.596-0.297,1.115-0.895,1.563c-6.18,5.363-9.531,8.268-10.053,8.715 c-0.893,0.67-1.973,0.744-3.24,0.223c-1.041-0.895-1.953-1.75-2.736-2.57c-0.781-0.818-1.34-1.414-1.676-1.787 c-0.334-0.371-0.875-1.098-1.619-2.178s-1.268-1.807-1.564-2.178c-4.17,4.543-8.266,7.373-12.287,8.49 c-2.533,0.744-5.661,1.117-9.384,1.117c-5.735,0-10.445-1.77-14.131-5.307C35.691,66.336,33.848,61.328,33.848,54.85L33.848,54.85z M53.062,52.615c0,2.905,0.727,5.232,2.178,6.982c1.453,1.75,3.407,2.625,5.865,2.625c0.224,0,0.54-0.037,0.95-0.111 c0.408-0.076,0.688-0.113,0.838-0.113c3.127-0.818,5.547-2.828,7.26-6.031c0.82-1.415,1.434-2.96,1.844-4.636 c0.41-1.675,0.633-3.035,0.67-4.078c0.037-1.042,0.057-2.755,0.057-5.138v-2.793c-4.32,0-7.596,0.298-9.83,0.894 C56.338,42.077,53.062,46.21,53.062,52.615L53.062,52.615z"></path>
                <path fill="#FF9900" d="M99.979,88.586c0.15-0.299,0.373-0.596,0.672-0.895c1.861-1.266,3.648-2.121,5.361-2.568 c2.83-0.744,5.586-1.154,8.266-1.229c0.746-0.076,1.453-0.037,2.123,0.111c3.352,0.297,5.361,0.857,6.033,1.676 c0.297,0.447,0.445,1.117,0.445,2.01v0.783c0,2.605-0.707,5.678-2.121,9.215c-1.416,3.537-3.389,6.387-5.922,8.547 c-0.371,0.297-0.707,0.445-1.004,0.445c-0.15,0-0.299-0.037-0.447-0.111c-0.447-0.223-0.559-0.633-0.336-1.229 c2.756-6.479,4.133-10.984,4.133-13.518c0-0.818-0.148-1.414-0.445-1.787c-0.746-0.893-2.83-1.34-6.256-1.34 c-1.268,0-2.756,0.074-4.469,0.223c-1.861,0.225-3.574,0.447-5.139,0.672c-0.447,0-0.744-0.076-0.895-0.225 c-0.148-0.148-0.186-0.297-0.111-0.447C99.867,88.846,99.904,88.734,99.979,88.586L99.979,88.586z M0.223,86.688 c0.373-0.596,0.968-0.633,1.788-0.113c18.618,10.799,38.875,16.199,60.769,16.199c14.598,0,29.008-2.719,43.232-8.156 c0.371-0.148,0.912-0.371,1.619-0.67c0.709-0.297,1.211-0.521,1.508-0.67c1.117-0.447,1.992-0.223,2.625,0.67 c0.635,0.895,0.43,1.713-0.613,2.457c-1.342,0.969-3.055,2.086-5.139,3.352c-6.404,3.799-13.555,6.74-21.449,8.826 c-7.893,2.086-15.602,3.127-23.123,3.127c-11.618,0-22.603-2.029-32.954-6.088C18.134,101.563,8.862,95.846,0.67,88.475 C0.223,88.102,0,87.729,0,87.357C0,87.133,0.074,86.91,0.223,86.688L0.223,86.688z"></path>
              </g>
            </svg>
          </div>
        </div>
        
        {/* Bottom right attribution */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-70 hover:opacity-90 transition-opacity">
          <span 
            className="text-sm text-[#f5e6d3]/60" 
            style={{ textShadow: 'rgba(0, 0, 0, 0.8) 0px 2px 8px' }}
          >
            Backed by
          </span>
          <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontSize: '12px' }}>Y</span>
          </div>
          <span 
            className="text-sm font-medium text-orange-400" 
            style={{ textShadow: 'rgba(0, 0, 0, 0.8) 0px 2px 8px' }}
          >
            Combinator
          </span>
        </div>
      </div>
    </div>
  )
}
