export type ProductKey = 'happy' | 'desktop'

export interface Product {
  key: ProductKey
  label: string
  home: string
  /** The URL prefix shared by this product's docs pages. Empty for top-level pages. */
  docsBase: string
  /** The docs landing page: the first page the Docs links open. */
  docsHome: string
  docsLabel: string
  repository: string
}

export const HAPPY: Product = {
  key: 'happy',
  label: 'Happy Coder',
  // The original Happy CLI is in maintenance mode; its home is its docs.
  home: '/docs/',
  docsBase: '/docs',
  docsHome: '/docs/',
  docsLabel: 'Documentation',
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
  docsLabel: 'Happy Desktop Docs',
  repository: 'https://github.com/slopus/happy-desktop',
}

export function documentHref(product: Product, path: string) {
  return `${product.docsBase}/${path ? `${path}/` : ''}`
}
