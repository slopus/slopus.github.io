import type { ProductKey } from './products'

export interface PageMetadata {
  title: string
  description: string
  canonicalPath: string
  socialTitle?: string
  socialDescription?: string
  twitterDescription?: string
  robots?: string
  socialImage?: Readonly<{ path: string; width: number; height: number; alt: string }>
}

/** The desktop app's social card, the screenshot described in docs/happy-one-demo.md. Every page shares it. */
export const defaultSocialImage = {
  path: '/og/happy-harness-v24.png', width: 1200, height: 630,
  alt: 'Happy Harness model picker and paired phone, with Free and open source and 23.8k GitHub stars.',
} as const

/**
 * The homepage is the Happy desktop app's page. Keep index.html, which crawlers
 * read for /, and scripts/generate-static-routes.mjs in sync.
 */
export const homepageMetadata: PageMetadata = {
  title: 'Happy — Desktop & Mobile App for Claude Code, Codex & Grok',
  description:
    'Happy is the open-source desktop app for Claude Code, Codex, and Grok, with an iOS and Android app to control your coding agents from anywhere.',
  canonicalPath: '/',
  socialTitle: 'Any Model. Your Subscription. Happy Harness.',
}

/** The original Happy CLI docs. Kept at their URLs, in maintenance mode. */
export const docsMetadata: PageMetadata = {
  title: 'Happy Coder Docs — Claude Code & Codex Mobile App (Original CLI)',
  description:
    'Docs for the original Happy CLI (Happy Coder): use Claude Code and Codex from your iPhone, Android, or the web. Maintenance mode; new features ship in the Happy desktop app.',
  canonicalPath: '/docs/',
}

export const desktopDocsMetadata: PageMetadata = {
  title: 'Happy Docs — The Open Source Desktop App for Coding Agents',
  description:
    'Install Happy on macOS, Windows, or Linux, run Claude, Codex, and Grok in one harness, pair your phone, and understand permissions, workspaces, teams, and plugins.',
  canonicalPath: '/desktop/docs/',
}

/** Keep the static Pages route in scripts/generate-static-routes.mjs in sync. */
export const modelBenchmarksMetadata: PageMetadata = {
  title: 'The Trust Me Bro Model Tier List — Happy',
  description: 'A curated AI model tier list, with exact-version evidence from X, strengths, caveats, and head-to-head comparisons. Subjective synthesis, not a lab benchmark.',
  canonicalPath: '/model-benchmarks',
}

/**
 * Titled after content/thesis.md's frontmatter and described by its first bullet.
 * Keep scripts/generate-static-routes.mjs in sync.
 */
export const thesisMetadata: PageMetadata = {
  title: 'Our Thesis — Happy',
  description: 'One core agent, chat that left the chat, phone first, one harness, and open source with no lock-in. What Happy is betting on.',
  canonicalPath: '/thesis/',
}

/** The blog index. Its posts are listed in src/DocumentPages.tsx's blogPosts. */
export const blogMetadata: PageMetadata = {
  title: 'Blog — Happy',
  description: 'Writing from Happy Engineering on agents, the interfaces around them, and what we are betting on.',
  canonicalPath: '/blog/',
}

/**
 * The plugin pages are the public listing URLs in OpenAI's plugin directory, so
 * keep these paths stable. Keep scripts/generate-static-routes.mjs in sync.
 */
export const pluginsMetadata: PageMetadata = {
  title: 'Plugins — Happy',
  description: 'Plugins by Happy for ChatGPT and Codex.',
  canonicalPath: '/plugins/',
}

export const memesPluginMetadata: PageMetadata = {
  title: 'Happy Memes — Turn any moment into a meme',
  description: 'Make funny, postable image memes about news, launches, trends, and everyday moments. A skills-only plugin for ChatGPT and Codex.',
  canonicalPath: '/plugins/memes/',
}

export const pluginPrivacyMetadata: PageMetadata = {
  title: 'Plugin Privacy Policy — Happy',
  description: 'Privacy policy for Happy plugins for ChatGPT and Codex, including Happy Memes.',
  canonicalPath: '/plugins/privacy/',
}

export const pluginTermsMetadata: PageMetadata = {
  title: 'Plugin Terms of Use — Happy',
  description: 'Terms of use for Happy plugins for ChatGPT and Codex, including Happy Memes.',
  canonicalPath: '/plugins/terms/',
}

export function docsMetadataForProduct(product: ProductKey): PageMetadata {
  return product === 'desktop' ? desktopDocsMetadata : docsMetadata
}

function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
}

export function applyPageMetadata(metadata: PageMetadata) {
  const canonicalUrl = new URL(metadata.canonicalPath, 'https://happy.engineering').toString()
  const socialTitle = metadata.socialTitle ?? metadata.title
  const socialDescription = metadata.socialDescription ?? metadata.description
  const socialImage = metadata.socialImage ?? defaultSocialImage
  const socialImageUrl = new URL(socialImage.path, 'https://happy.engineering').toString()

  document.title = metadata.title
  setMetaContent('meta[name="description"]', metadata.description)
  setMetaContent('meta[name="robots"]', metadata.robots ?? 'index, follow')
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonicalUrl)
  setMetaContent('meta[property="og:url"]', canonicalUrl)
  setMetaContent('meta[property="og:title"]', socialTitle)
  setMetaContent('meta[property="og:description"]', socialDescription)
  setMetaContent('meta[property="og:image"]', socialImageUrl)
  setMetaContent('meta[property="og:image:width"]', String(socialImage.width))
  setMetaContent('meta[property="og:image:height"]', String(socialImage.height))
  setMetaContent('meta[property="og:image:alt"]', socialImage.alt)
  setMetaContent('meta[name="twitter:image"]', socialImageUrl)
  setMetaContent('meta[name="twitter:image:alt"]', socialImage.alt)
  setMetaContent('meta[name="twitter:title"]', socialTitle)
  setMetaContent(
    'meta[name="twitter:description"]',
    metadata.twitterDescription ?? socialDescription,
  )
}
