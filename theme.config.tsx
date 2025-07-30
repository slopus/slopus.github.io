import React from 'react'

export default {
  logo: <span>Happy</span>,
  project: {
    link: 'https://github.com/your-username/happy-coder',
  },
  docsRepositoryBase: 'https://github.com/your-username/happy-coder',
  footer: {
    text: 'Happy - Claude Code Mobile Client',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Happy'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Happy - Claude Code Mobile Client" />
      <meta property="og:description" content="Free, open-source mobile app for Claude Code" />
    </>
  ),
  // Navigation configuration
  navigation: {
    prev: true,
    next: true,
  },
  // Sidebar configuration
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  // Theme configuration
  primaryHue: 210,
  primarySaturation: 100,
} 