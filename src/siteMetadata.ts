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
  /** An MP4 that iMessage, Discord and Telegram play in the link preview, over socialImage as its poster. */
  socialVideo?: Readonly<{ path: string; width: number; height: number }>
}

/**
 * The desktop app's social card, the screenshot described in docs/happy-one-demo.md.
 * Every page without its own card shares it, the original CLI docs included.
 */
export const defaultSocialImage = {
  path: '/og/happy-harness-v25.png', width: 1200, height: 630,
  alt: 'Happy Harness model picker and paired phone, with Orchestrate Claude, Codex and Grok in one app, Free and open source, and 24k GitHub stars.',
} as const

/**
 * X, Slack and iMessage cache a preview by its image URL. Bump this after redrawing the
 * cards, so links shared before show the new ones.
 */
export const SOCIAL_IMAGE_VERSION = 3

/** The absolute og:image and twitter:image URL of a card, with its cache-busting version. */
export function socialImageUrl(image: Readonly<{ path: string }>) {
  return `https://happy.engineering${image.path}?v=${SOCIAL_IMAGE_VERSION}`
}

/**
 * A desktop doc's own card: its title beside its figure, at /og/<path with dashes>.png.
 * notes/og/cards.py draws them; the build fails if one is missing. A post with a video
 * has a frame of the video there instead, 1200 wide at the video's aspect ratio.
 */
export function documentSocialImage(
  path: string,
  heading: string,
  video?: PageMetadata['socialVideo'],
): NonNullable<PageMetadata['socialImage']> {
  return {
    path: `/og/${path.replace(/\//g, '-')}.png`, width: 1200,
    height: video ? Math.round((1200 * video.height) / video.width) : 630,
    alt: `${heading} — Happy Engineering`,
  }
}

/** A video's absolute URL. Previews fetch it by its path, so a new cut gets a new file name. */
export function socialVideoUrl(video: Readonly<{ path: string }>) {
  return `https://happy.engineering${video.path}`
}

/**
 * The og:video tags, after og:image: iMessage downloads and loops the file, and Discord plays it
 * because og:type is video.other. Served as MP4 over HTTPS; see docs/og-video.md.
 */
export function socialVideoTags(video: NonNullable<PageMetadata['socialVideo']>): [string, string][] {
  const url = socialVideoUrl(video)
  return [
    ['og:video', url],
    ['og:video:secure_url', url],
    ['og:video:type', 'video/mp4'],
    ['og:video:width', String(video.width)],
    ['og:video:height', String(video.height)],
  ]
}

/**
 * The homepage is the Happy desktop app's page. Keep index.html, which crawlers
 * read for /, and scripts/generate-static-routes.mjs in sync.
 */
export const homepageMetadata: PageMetadata = {
  title: 'Happy — Open-Source Harness to Orchestrate Claude Code, Codex & Grok',
  description:
    'Orchestrate Claude, Codex and Grok in one app. Happy is an open-source harness that reuses the subscriptions you already pay for.',
  canonicalPath: '/',
  socialTitle: 'Any Model. Your Subscription. Happy Harness.',
}

/** The original Happy CLI docs. Kept at their URLs, in maintenance mode. */
export const docsMetadata: PageMetadata = {
  title: 'Original Happy CLI Docs (Happy Coder) — Maintenance Mode',
  description:
    'Docs for the original Happy CLI (Happy Coder), a phone remote for Claude Code and Codex in your terminal. In maintenance mode; Happy today is a desktop harness.',
  canonicalPath: '/docs/',
}

export const desktopDocsMetadata: PageMetadata = {
  title: 'Happy Docs: Orchestrate Claude, Codex and Grok in One App',
  description:
    'Happy is an open-source harness for orchestrating Claude, Codex, and Grok agents in one desktop app, reusing your subscriptions: what you get, where to start.',
  canonicalPath: '/welcome/',
}

/**
 * Keep the static Pages route in scripts/generate-static-routes.mjs in sync.
 * GitHub Pages redirects /model-benchmarks to /model-benchmarks/, so the
 * canonical is the URL that answers 200.
 */
export const modelBenchmarksMetadata: PageMetadata = {
  title: 'The Trust Me Bro Model Tier List — Happy',
  description: 'A curated AI model tier list, with exact-version evidence from X, strengths, caveats, and head-to-head comparisons. Subjective synthesis, not a lab benchmark.',
  canonicalPath: '/model-benchmarks/',
}

/**
 * The Vision essay, a docs page that keeps its own title. Titled after
 * content/thesis.md's frontmatter and described by its bullets. Keep the
 * description in src/documents.ts and scripts/generate-static-routes.mjs in sync.
 */
export const thesisMetadata: PageMetadata = {
  title: 'Vision — Happy',
  description: 'What Happy is betting on: one primary agent, chat that left the chat, phone first, one harness, and open source with no lock-in.',
  canonicalPath: '/vision/',
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
  const imageUrl = socialImageUrl(socialImage)

  document.title = metadata.title
  setMetaContent('meta[name="description"]', metadata.description)
  setMetaContent('meta[name="robots"]', metadata.robots ?? 'index, follow')
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonicalUrl)
  setMetaContent('meta[property="og:url"]', canonicalUrl)
  setMetaContent('meta[property="og:title"]', socialTitle)
  setMetaContent('meta[property="og:description"]', socialDescription)
  setMetaContent('meta[property="og:image"]', imageUrl)
  setMetaContent('meta[property="og:image:width"]', String(socialImage.width))
  setMetaContent('meta[property="og:image:height"]', String(socialImage.height))
  setMetaContent('meta[property="og:image:alt"]', socialImage.alt)
  setMetaContent('meta[name="twitter:image"]', imageUrl)
  setMetaContent('meta[name="twitter:image:alt"]', socialImage.alt)
  setMetaContent('meta[name="twitter:title"]', socialTitle)
  setMetaContent(
    'meta[name="twitter:description"]',
    metadata.twitterDescription ?? socialDescription,
  )
  // The served HTML has the video tags only on a page with a video; keep the head matching it.
  setMetaContent('meta[property="og:type"]', metadata.socialVideo ? 'video.other' : 'website')
  document.querySelectorAll('meta[property^="og:video"]').forEach((tag) => tag.remove())
  let previous = document.querySelector('meta[property="og:image:alt"]')
  for (const [property, content] of metadata.socialVideo ? socialVideoTags(metadata.socialVideo) : []) {
    const tag = document.createElement('meta')
    tag.setAttribute('property', property)
    tag.setAttribute('content', content)
    if (previous) previous.after(tag)
    else document.head.append(tag)
    previous = tag
  }
}
