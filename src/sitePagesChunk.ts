import type * as SitePages from './sitePages'

/**
 * Every page but the homepage, with the docs text: a chunk of its own (src/sitePages.ts), so the
 * homepage's bundle is the homepage. A page loads it before it renders (src/main.tsx), and a link
 * to such a page starts loading it as the pointer or focus reaches the link (src/Router.tsx). The
 * prerender and the tests import it themselves and register it.
 */
let sitePages: typeof SitePages | undefined
let loading: Promise<void> | undefined

export function loadSitePages() {
  loading ??= import('./sitePages').then(registerSitePages)
  return loading
}

export function registerSitePages(module: typeof SitePages) {
  sitePages = module
}

export function loadedSitePages() {
  return sitePages
}
