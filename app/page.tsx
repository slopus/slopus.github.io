'use client'

import AppStoreButton from '@/components/AppStoreButton'
import GooglePlayButton from '@/components/GooglePlayButton'
import NpmButton from '@/components/NpmButton'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Bricolage_Grotesque } from 'next/font/google'
import Link from 'next/link'
import SetupSteps from '@/components/marketing/SetupSteps'
import { BentoBoxes, TextBasedHowItWorks, YoutubeDemoSection } from '@/components/marketing'
import GithubLink from '@/components/marketing/GithubLink'
import MobileSetup from '@/components/marketing/MobileSetup'
import { PhoneBundle } from '@/components/phones'
import MobileHeroSection from '@/app/concepts/light-video-bg/MobileHeroSection'
import TextBasedFeatures from '@/components/marketing/TextBasedFeatures'
import AdaptiveTerminal from '@/components/AdaptiveTerminal'
import LaunchWebAppButton from '@/components/WebAppButton'
import StarOnGithubButton from '@/components/GithubButton'
import VideoComposite from '@/components/VideoComposite'

const GOOGLE_PLAY_LINK = 'https://play.google.com/store/apps/details?id=com.ex3ndr.happy'
const APP_STORE_LINK = 'https://apps.apple.com/us/app/happy-claude-code-client/id6748571505'


function DesktopHeroSection() {
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
    <section className="py-8 pb-24 md:py-24 xl:py-32 hidden sm:block font-mono">
      <div className="max-w-[72ch] mx-auto px-5">
        <div className="">
          <div>
            <h1 className="text-3xl sm:text-3xl font-bold mb-5 leading-tight">
             Happy: Use Claude Code Anywhere 
            </h1>
      
            <YoutubeDemoSection 
              youtubeId="GCS0OG9QMSE"
              posterImage="https://img.youtube.com/vi/GCS0OG9QMSE/maxresdefault.jpg"
            />
            
            <div className="mb-6 text-base text-gray-700 dark:text-gray-300">
              <div className="flex items-start mb-4 ">
                <span>No workflow disruption - Claude Code runs on your machine</span>
              </div>
              <div className="flex items-start mb-4">
                <span>Open Source (MIT Licensed)</span>
              </div>
              <div className="flex items-start mb-4">
                <span>Secure - End to End Encryption</span>
              </div>
              <div className="flex items-start mb-4">
                <span>Multiple active sessions across multiple machines</span>
              </div>
              <div className="flex items-start mb-4">
                <span></span>
              </div>
                <AdaptiveTerminal command="npm i -g happy-coder && happy"  />
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="flex gap-4 flex-wrap">
                <GooglePlayButton href={GOOGLE_PLAY_LINK} />
                <AppStoreButton href={APP_STORE_LINK} />
                <LaunchWebAppButton href="https://app.happy.engineering" />
                <StarOnGithubButton href="https://github.com/slopus/happy" />
              </div>
              <div className="flex gap-4 items-center">
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {


  return (
    <>
      <div className="max-w-[74ch] mx-auto px-2.5 sm:px-[2ch] pt-8">
        <h1 className="text-3xl sm:text-3xl font-bold leading-tight">
          Happy: Use Claude Code Anywhere 
        </h1>
      </div>
      
      <VideoComposite />
      
      <section className="max-w-[72ch] mx-auto px-2.5 md:px-0">
            <div className="mb-6 text-base text-gray-700 dark:text-gray-300 font-mono">
              <div className="flex items-start mb-4 ">
                <span>No workflow disruption. Claude Code runs on your machine</span>
              </div>
              <div className="flex items-start mb-4">
                <span>Open Source (MIT Licensed)</span>
              </div>
              <div className="flex items-start mb-4">
                <span>Secure. End to End Encryption</span>
              </div>
              <div className="flex items-start mb-4">
                <span>Multiple active sessions across multiple machines</span>
              </div>
              <div className="flex items-start mb-10">
                <span>Hands free control with voice agent. Not just dictation.</span>
              </div>
              <AdaptiveTerminal command="npm i -g happy-coder && happy"  />
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="flex gap-4 flex-wrap">
                <GooglePlayButton href={GOOGLE_PLAY_LINK} />
                <AppStoreButton href={APP_STORE_LINK} />
                <LaunchWebAppButton href="https://app.happy.engineering" />
                <StarOnGithubButton href="https://github.com/slopus/happy" />
              </div>
              <div className="flex gap-4 items-center">
              </div>
            </div>
      </section>
      
      
      <section className="max-w-[72ch] mx-auto py-12 px-2.5 md:px-0">
      <TextBasedFeatures />
      <div className="h-12"></div>
      <TextBasedHowItWorks />
      </section>
      <YoutubeDemoSection 
        youtubeId="GCS0OG9QMSE"
        posterImage="https://img.youtube.com/vi/GCS0OG9QMSE/maxresdefault.jpg"
      />
    </>
  )
} 