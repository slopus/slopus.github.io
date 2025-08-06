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
  verification: {
    google: 'YBRFhTOzLKIGqYceYX-zfdC5esIATrKfbmPtkCuuHm0',
  },
}

import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css' // Required!

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
   const pageMap = await getPageMap()

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${ibmPlexMono.variable}`}>
        <Layout
          //banner={<Banner storageKey="docs-banner">Your banner content</Banner>}
          navbar={
            <Navbar 
              logo={<b>Happy</b>}
              projectLink="https://github.com/slopus/happy"
            />
          }
          pageMap={pageMap}
          docsRepositoryBase="https://github.com/slopus/slopus.github.io/tree/main"
          sidebar={{
            defaultMenuCollapseLevel: 3,
          }}
        >
          {children}
        </Layout>
      </body>
    </html>
  )
} 