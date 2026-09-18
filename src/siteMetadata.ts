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

export const happyOneMetadata: PageMetadata = {
  title: 'Any Model. Your Team. Happy Harness.',
  description: 'Multi-provider and natively multiplayer. Use your current subscriptions. Open source under MIT, with an end-to-end encrypted mobile app.',
  canonicalPath: '/tmp/happy-one/',
  robots: 'noindex, nofollow',
  socialImage: {
    path: '/og/happy-harness-v23.png', width: 1200, height: 630,
    alt: 'Happy Harness model picker and paired phone, with Free and open source and 23.8k GitHub stars.',
  },
}

export const happy2Metadata: PageMetadata = {
  title: 'Happy Desktop — Any Team. Any Model. One Harness.',
  description:
    'Happy Desktop is the open source harness for coding agents. Run Claude, Codex, and Grok in one place, keep every session durable and shareable with your team, and keep your work on your own machine. Free for macOS.',
  canonicalPath: '/desktop/',
  socialTitle: 'Happy Desktop — any team, any model, one harness',
  socialDescription:
    'One open source harness for every coding agent you already pay for. Multiplayer, durable sessions beside the files, diffs, terminals, and previews the work touches.',
  twitterDescription:
    'Run every coding agent in one open source harness. Multiplayer sessions, end-to-end encrypted, yours to run. Download for macOS.',
}

export const docsMetadata: PageMetadata = {
  title: 'Happy Docs — Remote Control for Coding Agents',
  description:
    'Install, configure, self-host, and use Happy with Claude Code, Codex, and other coding agents across desktop, mobile, and web.',
  canonicalPath: '/docs/',
}

export const happy2DocsMetadata: PageMetadata = {
  title: 'Happy Desktop Docs — Self-Hosted Workspace for People and Agents',
  description:
    'Install, self-host, and understand Happy Desktop: channels, sandboxed agents, collaborative documents, and plugins in one app you run yourself.',
  canonicalPath: '/desktop/docs/',
}

export function docsMetadataForProduct(product: ProductKey): PageMetadata {
  return product === 'happy2' ? happy2DocsMetadata : docsMetadata
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