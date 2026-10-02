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

export const homepageMetadata: PageMetadata = {
  title: 'Happy — Remote Control for Claude Code & Codex',
  description:
    'Happy is the open-source remote control for Claude Code, Codex, and other coding agents running on your computers. Use them from iOS, Android, or the web.',
  canonicalPath: '/',
  socialTitle: 'Happy — Leave your desk. Keep your agents moving.',
  socialDescription:
    'Start, steer, approve, and review coding agents running on your own computers from iOS, Android, or the web.',
  twitterDescription:
    'Control Claude Code, Codex, and other coding agents running on your computers from anywhere.',
}

/** Shared with scripts/generate-static-routes.mjs, which writes the same values into dist/desktop/index.html. */
export const desktopMetadata: PageMetadata = {
  title: 'Any Model. Your Team. Happy Harness.',
  description: 'Multi-provider and natively multiplayer. Use your current subscriptions. Open source under MIT, with an end-to-end encrypted mobile app.',
  canonicalPath: '/desktop/',
  socialImage: {
    path: '/og/happy-harness-v23.png', width: 1200, height: 630,
    alt: 'Happy Harness model picker and paired phone, with Free and open source and 23.8k GitHub stars.',
  },
}

export const docsMetadata: PageMetadata = {
  title: 'Happy Docs — Remote Control for Coding Agents',
  description:
    'Install, configure, self-host, and use Happy with Claude Code, Codex, and other coding agents across desktop, mobile, and web.',
  canonicalPath: '/docs/',
}

export const desktopDocsMetadata: PageMetadata = {
  title: 'Happy Desktop Docs — The Open Source Harness for Coding Agents',
  description:
    'Install Happy Desktop, run Claude, Codex, and Grok in one harness, pair your phone, and understand permissions, workspaces, teams, and plugins.',
  canonicalPath: '/desktop/docs/',
}

/** Keep the static Pages route in scripts/generate-static-routes.mjs in sync. */
export const modelBenchmarksMetadata: PageMetadata = {
  title: 'The Trust Me Bro Model Tier List — Happy',
  description: 'A curated AI model tier list, with exact-version evidence from X, strengths, caveats, and head-to-head comparisons. Subjective synthesis, not a lab benchmark.',
  canonicalPath: '/model-benchmarks',
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
  title: 'Memes — Turn any moment into a meme',
  description: 'Make funny, postable image memes about news, launches, trends, and everyday moments. A skills-only plugin for ChatGPT and Codex.',
  canonicalPath: '/plugins/memes/',
}

export const pluginPrivacyMetadata: PageMetadata = {
  title: 'Plugin Privacy Policy — Happy',
  description: 'Privacy policy for Happy plugins for ChatGPT and Codex, including Memes.',
  canonicalPath: '/plugins/privacy/',
}

export const pluginTermsMetadata: PageMetadata = {
  title: 'Plugin Terms of Use — Happy',
  description: 'Terms of use for Happy plugins for ChatGPT and Codex, including Memes.',
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
  const socialImage = metadata.socialImage ?? {
    path: '/og/happy.png', width: 1200, height: 630,
    alt: 'Happy controlling coding-agent sessions across desktop and mobile',
  }
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
