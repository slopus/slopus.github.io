import type { Metadata } from 'next'
import HomePage from '@/components/marketing/HomePage'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  openGraph: {
    url: '/',
  },
}

export default function Home() {
  return <HomePage />
}
