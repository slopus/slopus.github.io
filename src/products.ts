export type ProductKey = 'happy' | 'desktop'

export interface Product {
  key: ProductKey
  label: string
  /** Shown in the product switch, where the two products are named side by side. */
  switchLabel?: string
  home: string
  docsBase: string
  docsLabel: string
  repository: string
}

export const HAPPY: Product = {
  key: 'happy',
  label: 'Happy',
  switchLabel: 'Terminal + Mobile',
  home: '/',
  docsBase: '/docs',
  docsLabel: 'Documentation',
  repository: 'https://github.com/slopus/happy',
}

export const HAPPY_DESKTOP: Product = {
  key: 'desktop',
  label: 'Happy Desktop',
  switchLabel: 'Desktop + Mobile',
  home: '/desktop/',
  docsBase: '/desktop/docs',
  docsLabel: 'Happy Desktop Docs',
  repository: 'https://github.com/slopus/happy-desktop',
}

export const products: Product[] = [HAPPY, HAPPY_DESKTOP]

export function productForPath(pathname: string): Product {
  return pathname === '/desktop' || pathname.startsWith('/desktop/') ? HAPPY_DESKTOP : HAPPY
}

export function documentHref(product: Product, path: string) {
  return `${product.docsBase}/${path ? `${path}/` : ''}`
}
