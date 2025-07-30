import type { Metadata } from 'next'
import { IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://slopus.github.io'),
  title: 'Happy - Claude Code Mobile Client',
  description: 'Free, open-source mobile app for Claude Code. Control Claude AI from your phone with end-to-end encryption and seamless workflow. Get started with npm install -g happy-coder.',
  keywords: ['Claude', 'AI', 'mobile', 'coding', 'voice-to-code', 'open source', 'npm', 'development', 'programming'],
  authors: [{ name: 'Slopus' }],
  creator: 'Slopus',
  publisher: 'Slopus',
  robots: 'index, follow',
  openGraph: {
    title: 'Happy - Claude Code Mobile Client',
    description: 'Free, open-source mobile app for Claude Code. Control Claude AI from your phone with end-to-end encryption and seamless workflow.',
    url: 'https://slopus.github.io',
    siteName: 'Happy',
    images: [
      {
        url: '/og-image.png',
        width: 1280,
        height: 959,
        alt: 'Happy - Claude Code Mobile Client',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  /* twitter: {
    card: 'summary_large_image',
    title: 'Happy - Claude Code Mobile Client',
    description: 'Free, open-source mobile app for Claude Code. Control Claude AI from your phone with end-to-end encryption, and seamless workflow.',
    images: ['/happy-og-image.jpg'],
    creator: '@happyteam',
    site: '@happyteam',
  }, */
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${ibmPlexMono.variable}`}>
        {children}
      </body>
    </html>
  )
} 