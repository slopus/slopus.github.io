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
import MobileHeroSection from '@/app/concepts/light-video-bg/MobileHeroSection'
import DesktopHeroSection from '@/app/concepts/light-video-bg/DesktopHeroSection'

function AppScreenshot({ title, description, href }: { title: string, description: string, href?: string }) {
  return (
          <div className="flex flex-col items-center">
            <div className="relative transform hover:scale-105 transition-transform duration-300 max-w-[375px]">
              <Image
                src={href || "/app-3.png"}
                alt="Claude Code in Happy Coder App Screenshot"
                width={323}
                height={700}
                className="w-full h-auto border-4 rounded-[40px]"
              />
            </div>
            <div className="mt-6 text-left max-w-[250px]">
              <h3 className="font-semibold text-lg sm:text-xl mb-1">{title}</h3>
              <p className="text-gray-400 text-sm sm:text-base" style={{textShadow: "rgba(0, 0, 0, 0.7) 0px 2px 4px;"}}>
                {description}
              </p>
            </div>
          </div>
  );
}

export default function Home() {


  return (
    <>
      <MobileHeroSection />
      <DesktopHeroSection />
      <section className="relative">
        <div className="absolute" style={{
          backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMiAyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgaWQ9IkRvdCIgY3g9IjAuMSIgY3k9IjAuMSIgcj0iMC4wNSIgZmlsbD0iIzk1OTM5MyIgLz4KPC9zdmc+")`,
          backgroundRepeat: 'repeat',
          backgroundColor: '#faf9f5',
          backgroundPosition: '8px 8px',
          backgroundSize: '16px 16px',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: -1,
        }}></div>
        <div className="max-w-6xl mx-auto px-5 pb-24">
        <h2 className="text-left text-5xl font-bold pt-12 md:pt-24 pb-12 bg-grey-100">
          Features
        </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-16 lg:gap-20 max-w-7xl mx-auto flex-wrap">
            <AppScreenshot title="Plan Mode" description="TODO describe this feature" />
            <AppScreenshot title="Custom Slash Commands" description="TODO describe this feature" />
            <AppScreenshot title="Parallel Sessions" description="TODO describe this feature" />
            <AppScreenshot title="Push Notifications" description="TODO describe this feature" />
            <AppScreenshot title="Permission Prompts" description="TODO describe this feature" />
            <AppScreenshot title="Voice Control" description="TODO describe this feature" />
            <AppScreenshot title="Launch new sessions" description="TODO describe this feature" />
            <AppScreenshot title="Web App" description="TODO describe this feature" />
            <AppScreenshot title="Seamless handoff" description="TODO describe this feature" />
            <AppScreenshot title="File Browser" description="TODO describe this feature" href="/feature-file-browser.jpg"/>
          </div>
        </div>
      </section>
    </>
  )
} 