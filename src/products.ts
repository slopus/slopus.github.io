export type ProductKey = 'happy' | 'desktop'

/** What Happy is, in one line: under the homepage heading, in the footer, and first in the homepage descriptions. */
export const HAPPY_DESCRIPTOR = 'Orchestrate Claude, Codex, Grok, Gemini and more in one app'

export interface Product {
  key: ProductKey
  label: string
  home: string
  /** The URL prefix shared by this product's docs pages. Empty for top-level pages. */
  docsBase: string
  /** The docs landing page: the first page the Docs links open. */
  docsHome: string
  repository: string
}

export const HAPPY: Product = {
  key: 'happy',
  label: 'Original Happy CLI',
  // The original Happy CLI is in maintenance mode; its home is its docs.
  home: '/docs/',
  docsBase: '/docs',
  docsHome: '/docs/',
  repository: 'https://github.com/slopus/happy',
}

export const HAPPY_DESKTOP: Product = {
  key: 'desktop',
  label: 'Happy Desktop',
  // The desktop app owns the homepage; /desktop/ redirects here.
  home: '/',
  // Its docs are top-level pages: /welcome/, /quick-start/, /guides/terminal/.
  // The old /desktop/docs/* and /happy2/docs/* URLs keep serving them.
  docsBase: '',
  docsHome: '/welcome/',
  repository: 'https://github.com/slopus/happy-desktop',
}

export function documentHref(product: Product, path: string) {
  return `${product.docsBase}/${path ? `${path}/` : ''}`
}
