import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { documents } from './documents'
import { documentHref, HAPPY, HAPPY_DESKTOP } from './products'
import { Router } from './Router'

// scripts/generate-static-routes.mjs reads the docs registry, the page metadata,
// and the store links from this bundle instead of keeping its own copies.
export { documentHeading, documents } from './documents'
export { documentHref, HAPPY, HAPPY_DESKTOP } from './products'
export { metadataForPath } from './Router'
export { APP_STORE_LINK, GOOGLE_PLAY_LINK } from './StoreButtons'

/**
 * Pages whose full text must be in the served HTML, not only after the app
 * loads. The plugin directory reads the plugin's website, terms, and privacy
 * URLs without running JavaScript. The thesis and every docs page ship their
 * text so shared links and crawlers that do not run JavaScript see it. The
 * client hydrates this markup in place.
 */
export const prerenderedPaths = [
  '/plugins/', '/plugins/memes/', '/plugins/privacy/', '/plugins/terms/', '/blog/', '/thesis/',
  ...documents.map((document) => documentHref(document.product === 'desktop' ? HAPPY_DESKTOP : HAPPY, document.path)),
]

export function renderPath(pathname: string) {
  return renderToString(
    <StrictMode>
      <Router pathname={pathname} />
    </StrictMode>,
  )
}
