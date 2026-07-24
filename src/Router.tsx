import { useEffect, useState } from 'react'
import App from './App'
import { DocsPage, LegalPage, NotFoundPage } from './DocumentPages'
import { getDocument, normalizeDocumentPath } from './documents'
import {
  applyPageMetadata,
  docsMetadata,
  homepageMetadata,
  type PageMetadata,
} from './siteMetadata'

function normalizedPathname(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/'
}

function metadataForPath(pathname: string): PageMetadata {
  const normalizedPath = normalizedPathname(pathname)

  if (normalizedPath === '/') {
    return homepageMetadata
  }

  if (normalizedPath === '/docs' || normalizedPath.startsWith('/docs/')) {
    const documentPath = normalizeDocumentPath(normalizedPath.slice('/docs'.length))
    const document = getDocument(documentPath)

    if (document?.path === '') {
      return docsMetadata
    }

    if (document) {
      return {
        title: `${document.title} — Happy Docs`,
        description: document.description,
        canonicalPath: `/docs/${document.path}/`,
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
    if (controlled) {
      return
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

  if (normalizedPath === '/docs' || normalizedPath.startsWith('/docs/')) {
    return <DocsPage path={normalizedPath.slice('/docs'.length)} />
  }

  if (normalizedPath === '/privacy') {
    return <LegalPage name="privacy" />
  }

  if (normalizedPath === '/terms' || normalizedPath === '/tos') {
    return <LegalPage name="terms" />
  }

  return <NotFoundPage />
}