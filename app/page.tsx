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

export default function Home() {


  return (
    <>
      <MobileHeroSection />
      <DesktopHeroSection />
    </>
  )
} 