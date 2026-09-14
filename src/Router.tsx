import { useEffect, useState } from 'react'
import App from './App'
import Happy2App from './Happy2App'
import HappyOneApp from './HappyOneApp'
import { DocsPage, LegalPage, NotFoundPage } from './DocumentPages'
import { getDocument, normalizeDocumentPath } from './documents'
import { HAPPY2, productForPath } from './products'
import {
  applyPageMetadata,
  docsMetadataForProduct,
  happy2Metadata,
  happyOneMetadata,
  homepageMetadata,
  type PageMetadata,
} from './siteMetadata'

/** Pages that moved when Happy Desktop got its own section. Keep the old URLs working. */
const movedPaths: Record<string, string> = {
  '/docs/comparisons/happy-2-vs-buzz': '/desktop/docs/comparisons/buzz',
}

/** Sections that moved wholesale. The old prefix keeps resolving, path and all. */
const movedPrefixes: Array<[string, string]> = [['/happy2', '/desktop']]

function normalizedPathname(pathname: string) {
  const trimmed = pathname.replace(/\/+$/, '') || '/'
  const moved = movedPaths[trimmed]

  if (moved) {
    return moved
  }

  for (const [from, to] of movedPrefixes) {
    if (trimmed === from) {
      return to
    }

    if (trimmed.startsWith(`${from}/`)) {
      return `${to}${trimmed.slice(from.length)}`
    }
  }

  return trimmed
}

function metadataForPath(pathname: string): PageMetadata {
  const normalizedPath = normalizedPathname(pathname)

  if (normalizedPath === '/') {
    return homepageMetadata
  }

  if (normalizedPath === '/tmp/happy-one') {
    return happyOneMetadata
  }

  if (normalizedPath === HAPPY2.home.replace(/\/$/, '')) {
    return happy2Metadata
  }

  const product = productForPath(normalizedPath)
  const { docsBase } = product

  if (normalizedPath === docsBase || normalizedPath.startsWith(`${docsBase}/`)) {
    const documentPath = normalizeDocumentPath(normalizedPath.slice(docsBase.length))
    const document = getDocument(product.key, documentPath)

    if (document?.path === '') {
      return docsMetadataForProduct(product.key)
    }

    if (document) {
      return {
        title: `${document.title} — ${product.label} Docs`,
        description: document.description,
        canonicalPath: `${docsBase}/${document.path}/`,
      }
    }
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
    if (normalizedPath === '/tmp/happy-one') {
      applyPageMetadata(happyOneMetadata)
    }
  }, [normalizedPath])

  useEffect(() => {
    if (controlled) {
      return
    }

    // A moved URL should not linger in the address bar once we know where it went.
    const landed = window.location.pathname
    const target = normalizedPathname(landed)

    if (target !== landed.replace(/\/+$/, '')) {
      const canonical = target === '/' ? '/' : `${target}/`
      window.history.replaceState({}, '', `${canonical}${window.location.search}${window.location.hash}`)
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
    return <App />
  }

  if (normalizedPath === '/tmp/happy-one') {
    return <HappyOneApp />
  }

  if (normalizedPath === '/desktop') {
    return <Happy2App />
  }

  const product = productForPath(normalizedPath)
  const { docsBase } = product

  if (normalizedPath === docsBase || normalizedPath.startsWith(`${docsBase}/`)) {
    return <DocsPage product={product} path={normalizedPath.slice(docsBase.length)} />
  }

  if (normalizedPath === '/privacy') {
    return <LegalPage name="privacy" />
  }

  if (normalizedPath === '/terms' || normalizedPath === '/tos') {
    return <LegalPage name="terms" />
  }

  return <NotFoundPage />
}
