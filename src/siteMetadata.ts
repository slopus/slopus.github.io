export interface PageMetadata {
  title: string
  description: string
  canonicalPath: string
  socialTitle?: string
  socialDescription?: string
  twitterDescription?: string
  robots?: string
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

export const docsMetadata: PageMetadata = {
  title: 'Happy Docs — Remote Control for Coding Agents',
  description:
    'Install, configure, self-host, and use Happy with Claude Code, Codex, and other coding agents across desktop, mobile, and web.',
  canonicalPath: '/docs/',
}

function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', content)
}

export function applyPageMetadata(metadata: PageMetadata) {
  const canonicalUrl = new URL(metadata.canonicalPath, 'https://happy.engineering').toString()
  const socialTitle = metadata.socialTitle ?? metadata.title
  const socialDescription = metadata.socialDescription ?? metadata.description

  document.title = metadata.title
  setMetaContent('meta[name="description"]', metadata.description)
  setMetaContent('meta[name="robots"]', metadata.robots ?? 'index, follow')
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonicalUrl)
  setMetaContent('meta[property="og:url"]', canonicalUrl)
  setMetaContent('meta[property="og:title"]', socialTitle)
  setMetaContent('meta[property="og:description"]', socialDescription)
  setMetaContent('meta[name="twitter:title"]', socialTitle)
  setMetaContent(
    'meta[name="twitter:description"]',
    metadata.twitterDescription ?? socialDescription,
  )
}