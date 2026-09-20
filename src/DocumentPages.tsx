import { useEffect, useRef, useState } from 'react'
import { MarkdownDocument } from './MarkdownDocument'
import {
  documentGroupsForProduct,
  listedDocumentsForProduct,
  getDocument,
  getDocumentSource,
  getLegalSource,
  normalizeDocumentPath,
  prepareMarkdown,
  type DocumentEntry,
} from './documents'
import { documentHref, HAPPY, type Product } from './products'
import { SiteFooter, SiteHeader } from './SiteChrome'

function DocsNavigation({
  product,
  activeDocument,
}: {
  product: Product
  activeDocument: DocumentEntry
}) {
  const productDocuments = listedDocumentsForProduct(product.key)

  return (
    <nav className="docs-navigation" aria-label="Documentation navigation">
      {documentGroupsForProduct(product.key).map((group) => {
        const groupDocuments = productDocuments.filter((document) => document.group === group)

        // A group whose only pages are unlisted has no heading to show.
        if (groupDocuments.length === 0) {
          return null
        }

        return (
          <section className="docs-nav-group" key={group}>
            <h2>{group}</h2>
            <ul>
              {groupDocuments.map((document) => (
                <li key={document.path}>
                  <a
                    href={documentHref(product, document.path)}
                    aria-current={document.path === activeDocument.path ? 'page' : undefined}
                  >
                    {document.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </nav>
  )
}

export function DocsPage({ product = HAPPY, path }: { product?: Product; path: string }) {
  const [isSidebarScrollbarVisible, setIsSidebarScrollbarVisible] = useState(false)
  const sidebarScrollbarTimer = useRef<number | null>(null)
  const normalizedPath = normalizeDocumentPath(path)
  const activeDocument = getDocument(product.key, normalizedPath)

  const revealSidebarScrollbar = () => {
    setIsSidebarScrollbarVisible(true)
    if (sidebarScrollbarTimer.current !== null) window.clearTimeout(sidebarScrollbarTimer.current)
    sidebarScrollbarTimer.current = window.setTimeout(() => {
      setIsSidebarScrollbarVisible(false)
      sidebarScrollbarTimer.current = null
    }, 1200)
  }

  useEffect(() => () => {
    if (sidebarScrollbarTimer.current !== null) window.clearTimeout(sidebarScrollbarTimer.current)
  }, [])

  if (!activeDocument) {
    return <NotFoundPage />
  }

  const productDocuments = listedDocumentsForProduct(product.key)
  const markdown = prepareMarkdown(getDocumentSource(activeDocument))
  // An unlisted page sits outside the reading order, so it gets no previous or next.
  const activeIndex = productDocuments.indexOf(activeDocument)
  const previousDocument = activeIndex === -1 ? undefined : productDocuments[activeIndex - 1]
  const nextDocument = activeIndex === -1 ? undefined : productDocuments[activeIndex + 1]

  return (
    <div className="site-shell document-site-shell docs-shell">
      <SiteHeader product={product} docsActive />
      <details className="docs-mobile-navigation page-width">
        <summary>Browse documentation</summary>
        <DocsNavigation product={product} activeDocument={activeDocument} />
      </details>
      <main className="docs-layout page-width">
        <aside
          className={`docs-sidebar${isSidebarScrollbarVisible ? ' is-scrollbar-active' : ''}`}
          onMouseMove={revealSidebarScrollbar}
          onScroll={revealSidebarScrollbar}
        >
          <p className="docs-sidebar-label">{product.docsLabel}</p>
          <DocsNavigation product={product} activeDocument={activeDocument} />
        </aside>

        <article className="document-article">
          <p className="document-breadcrumb">
            <a href={documentHref(product, '')}>{product.label} docs</a>
            <span aria-hidden="true">/</span>
            {activeDocument.group}
          </p>
          <MarkdownDocument markdown={markdown} />

          <nav className="document-pagination" aria-label="Previous and next documentation pages">
            {previousDocument ? (
              <a href={documentHref(product, previousDocument.path)}>
                <span>Previous</span>
                {previousDocument.title}
              </a>
            ) : <span />}
            {nextDocument ? (
              <a className="document-pagination-next" href={documentHref(product, nextDocument.path)}>
                <span>Next</span>
                {nextDocument.title}
              </a>
            ) : <span />}
          </nav>

          <SiteFooter product={product} />
        </article>

      </main>
    </div>
  )
}

export function LegalPage({ name }: { name: 'privacy' | 'terms' }) {
  const markdown = prepareMarkdown(getLegalSource(name))

  return (
    <div className="site-shell document-site-shell">
      <SiteHeader />
      <main className="legal-layout page-width">
        <a className="document-back-link" href="/">
          <span aria-hidden="true">←</span> Back to home
        </a>
        <article className="document-article legal-article">
          <MarkdownDocument markdown={markdown} />
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="site-shell document-site-shell">
      <SiteHeader />
      <main className="not-found page-width">
        <p className="eyebrow">404</p>
        <h1>That page wandered off.</h1>
        <p>Try the documentation index or head back to the Happy homepage.</p>
        <div className="not-found-actions">
          <a className="button button-primary" href="/docs/">Browse docs</a>
          <a className="button button-ghost" href="/">Back home</a>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
