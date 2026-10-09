import { useEffect, useState } from 'react'
import DesktopApp from './DesktopApp'
import ModelBenchmarksPage from './ModelBenchmarksPage'
import { DocsPage, LegalPage, NotFoundPage } from './DocumentPages'
import { MemesPluginPage, PluginsPage } from './PluginPages'
import { documentHeading, getDocument, normalizeDocumentPath } from './documents'
import { documentHref, HAPPY, HAPPY_DESKTOP, type Product } from './products'
import {
  applyPageMetadata,
  docsMetadataForProduct,
  homepageMetadata,
  memesPluginMetadata,
  modelBenchmarksMetadata,
  pluginPrivacyMetadata,
  pluginsMetadata,
  pluginTermsMetadata,
  thesisMetadata,
  type PageMetadata,
} from './siteMetadata'

/** Plugin directory listing URLs. They must keep resolving once submitted. */
const pluginPageMetadata: Record<string, PageMetadata> = {
  '/plugins': pluginsMetadata,
  '/plugins/memes': memesPluginMetadata,
  '/plugins/privacy': pluginPrivacyMetadata,
  '/plugins/terms': pluginTermsMetadata,
}

const pluginsBack = { href: '/plugins/', label: 'Back to plugins' }

/** Pages that moved. Keep the old URLs working. */
const movedPaths: Record<string, string> = {
  '/docs/comparisons/happy-2-vs-buzz': '/comparisons/buzz',
  // The desktop docs lived under /desktop/docs/ (and /happy2/docs/) before they
  // became top-level pages; their index is /welcome/.
  '/desktop/docs': '/welcome',
  '/happy2/docs': '/welcome',
  // The desktop landing lived at /desktop/ (and /happy2/, and unlisted at
  // /tmp/happy-one/) before it became the homepage.
  '/desktop': '/',
  '/happy2': '/',
  '/tmp/happy-one': '/',
  // The Vision essay was published at /thesis/; the blog index lived at /blog/ briefly, with it as its only post.
  '/blog': '/vision',
  '/thesis': '/vision',
}

/** Sections that moved wholesale. The old prefix keeps resolving, path and all. */
const movedPrefixes: Array<[string, string]> = [
  ['/happy2/docs', ''],
  ['/desktop/docs', ''],
]

function normalizedPathname(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, '') || '/'
  const moved = movedPaths[trimmed]

  if (moved) {
    return moved
  }

  for (const [from, to] of movedPrefixes) {
    if (trimmed.startsWith(`${from}/`)) {
      return `${to}${trimmed.slice(from.length)}`
    }
  }

  return trimmed
}

/**
 * The docs page a path names, if any. The original CLI docs keep their /docs
 * prefix; the desktop docs are top-level pages, matched by slug after every
 * fixed route so a docs slug can never shadow one.
 */
function documentForPath(normalizedPath: string): { product: Product; path: string } | undefined {
  const { docsBase } = HAPPY
  if (normalizedPath === docsBase || normalizedPath.startsWith(`${docsBase}/`)) {
    return { product: HAPPY, path: normalizedPath.slice(docsBase.length) }
  }

  const path = normalizeDocumentPath(normalizedPath)
  if (getDocument(HAPPY_DESKTOP.key, path)) {
    return { product: HAPPY_DESKTOP, path }
  }

  return undefined
}

/**
 * The head for a URL. scripts/generate-static-routes.mjs writes the docs pages'
 * served HTML from this too, so the served head and the client agree.
 */
export function metadataForPath(pathname: string): PageMetadata {
  const normalizedPath = normalizedPathname(pathname)

  if (normalizedPath === '/') {
    return homepageMetadata
  }

  if (normalizedPath === '/model-benchmarks') {
    return modelBenchmarksMetadata
  }

  // The Vision essay is a docs page (src/documents.ts) that keeps its own title.
  if (normalizedPath === '/vision') {
    return thesisMetadata
  }

  if (pluginPageMetadata[normalizedPath]) {
    return pluginPageMetadata[normalizedPath]
  }

  if (normalizedPath === '/privacy') {
    return {
      title: 'Privacy Policy — Happy',
      description: 'Privacy policy for Happy.',
      canonicalPath: '/privacy/',
    }
  }

  if (normalizedPath === '/terms' || normalizedPath === '/tos') {
    return {
      title: 'Terms of Use — Happy',
      description: 'Terms of use for Happy.',
      canonicalPath: '/terms/',
    }
  }

  const located = documentForPath(normalizedPath)
  const document = located && getDocument(located.product.key, located.path)

  if (located && document) {
    const canonicalPath = documentHref(located.product, document.path)
    if (canonicalPath === located.product.docsHome) {
      return docsMetadataForProduct(located.product.key)
    }

    return {
      title: document.pageTitle ?? `${documentHeading(document)} — ${located.product.label} Docs`,
      description: document.description || docsMetadataForProduct(located.product.key).description,
      canonicalPath,
      // An unlisted page stays reachable, but out of search results.
      robots: document.hidden ? 'noindex, follow' : undefined,
    }
  }

  return {
    title: 'Page not found — Happy',
    description: 'The requested Happy page could not be found.',
    canonicalPath: pathname,
    robots: 'noindex, follow',
  }
}

export function Router({ pathname }: { pathname?: string }) {
  const controlled = pathname !== undefined
  const [currentPathname, setCurrentPathname] = useState(pathname ?? window.location.pathname)
  const normalizedPath = normalizedPathname(pathname ?? currentPathname)

  useEffect(() => {
    if (controlled) {
      return
    }

    // The served HTML carries the route's metadata in production; the dev server
    // always serves the homepage document, so bring the head in line on mount.
    applyPageMetadata(metadataForPath(window.location.pathname))

    // A moved URL should not linger in the address bar once we know where it went.
    const landed = window.location.pathname
    const target = normalizedPathname(landed)

    if (target !== landed.replace(/\/+$/, '')) {
      const canonical = target === '/' ? '/' : `${target}/`
      window.history.replaceState({}, '', `${canonical}${window.location.search}${window.location.hash}`)
    }

    // The page renders after the browser looked for the #fragment, so find it now
    // (README "Download" buttons link to /#download). Web fonts can reflow the page
    // once they load; follow the target then, unless the visitor scrolled meanwhile.
    const fragmentTarget = window.location.hash
      ? document.getElementById(decodeURIComponent(window.location.hash.slice(1)))
      : null
    if (fragmentTarget) {
      fragmentTarget.scrollIntoView()
      const scrolledTo = window.scrollY
      void document.fonts?.ready.then(() => {
        if (window.scrollY === scrolledTo) fragmentTarget.scrollIntoView()
      })
    }

    function navigateTo(url: URL, replace = false) {
      const nextPath = normalizedPathname(url.pathname)
      const currentPath = normalizedPathname(window.location.pathname)
      const nextLocation = `${url.pathname}${url.search}${url.hash}`

      if (nextPath === currentPath && url.search === window.location.search && !url.hash) {
        return
      }

      window.history[replace ? 'replaceState' : 'pushState']({}, '', nextLocation)

      if (nextPath !== currentPath) {
        applyPageMetadata(metadataForPath(url.pathname))
        setCurrentPathname(url.pathname)
        window.scrollTo({ top: 0 })
        document.querySelector('.document-article')?.scrollTo({ top: 0 })
      } else if (url.hash) {
        document.querySelector(url.hash)?.scrollIntoView()
      }
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return
      }

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) {
        return
      }

      event.preventDefault()
      navigateTo(url)
    }

    function handlePopState() {
      applyPageMetadata(metadataForPath(window.location.pathname))
      setCurrentPathname(window.location.pathname)
    }

    document.addEventListener('click', handleClick)
    window.addEventListener('popstate', handlePopState)

    return () => {
      document.removeEventListener('click', handleClick)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [controlled])

  if (normalizedPath === '/') {
    return <DesktopApp />
  }

  if (normalizedPath === '/model-benchmarks') {
    return <ModelBenchmarksPage />
  }

  if (normalizedPath === '/plugins') {
    return <PluginsPage />
  }

  if (normalizedPath === '/plugins/memes') {
    return <MemesPluginPage />
  }

  if (normalizedPath === '/plugins/privacy') {
    return <LegalPage name="plugins/privacy" back={pluginsBack} />
  }

  if (normalizedPath === '/plugins/terms') {
    return <LegalPage name="plugins/terms" back={pluginsBack} />
  }

  if (normalizedPath === '/privacy') {
    return <LegalPage name="privacy" />
  }

  if (normalizedPath === '/terms' || normalizedPath === '/tos') {
    return <LegalPage name="terms" />
  }

  const located = documentForPath(normalizedPath)
  if (located) {
    return <DocsPage product={located.product} path={located.path} />
  }

  return <NotFoundPage />
}
