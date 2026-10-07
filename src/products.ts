export type ProductKey = 'happy' | 'desktop'

export interface Product {
  key: ProductKey
  label: string
  home: string
  docsBase: string
  docsLabel: string
  repository: string
}

export const HAPPY: Product = {
  key: 'happy',
  label: 'Happy Coder',
  // The original Happy CLI is in maintenance mode; its home is its docs.
  home: '/docs/',
  docsBase: '/docs',
  docsLabel: 'Documentation',
  repository: 'https://github.com/slopus/happy',
}

export const HAPPY_DESKTOP: Product = {
  key: 'desktop',
  label: 'Happy Desktop',
  // The desktop app owns the homepage; /desktop/ redirects here.
  home: '/',
  docsBase: '/desktop/docs',
  docsLabel: 'Happy Desktop Docs',
  repository: 'https://github.com/slopus/happy-desktop',
}

export function productForPath(pathname: string): Product {
  return pathname === '/desktop' || pathname.startsWith('/desktop/') ? HAPPY_DESKTOP : HAPPY
}

export function documentHref(product: Product, path: string) {
  return `${product.docsBase}/${path ? `${path}/` : ''}`
}
