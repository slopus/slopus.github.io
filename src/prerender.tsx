import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { Router } from './Router'

/**
 * Pages whose full text must be in the served HTML, not only after the app
 * loads. The plugin directory reads the plugin's website, terms, and privacy
 * URLs without running JavaScript. The thesis ships its text so shared links
 * and crawlers see the essay. The client hydrates this markup in place.
 */
export const prerenderedPaths = ['/plugins/', '/plugins/memes/', '/plugins/privacy/', '/plugins/terms/', '/blog/', '/thesis/']

export function renderPath(pathname: string) {
  return renderToString(
    <StrictMode>
      <Router pathname={pathname} />
    </StrictMode>,
  )
}
