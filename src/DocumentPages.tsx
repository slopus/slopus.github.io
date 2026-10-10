import { useEffect, useRef, useState } from 'react'
import type { Components } from 'react-markdown'
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
  type LegalName,
} from './documents'
import { documentHref, HAPPY, HAPPY_DESKTOP, type Product } from './products'
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

/** Brief section 6, verbatim: every original Happy CLI docs page opens with it. */
function LegacyNotice() {
  return (
    <aside className="legacy-notice" aria-label="The original Happy CLI is in maintenance mode">
      <p>
        <strong>Happy is now a desktop app.</strong> The original Happy CLI (<code>happy</code> on npm,
        formerly <code>happy-coder</code>) is in maintenance mode: it keeps working and still gets critical
        fixes, but new features ship in the <a href="/">Happy desktop app</a>. The Happy mobile app works
        with both.
      </p>
    </aside>
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

        <article
          className={activeDocument.essay ? 'document-article essay-article' : 'document-article'}
          data-document={activeDocument.path || undefined}
        >
          {product.key === 'happy' && <LegacyNotice />}
          <p className="document-breadcrumb">
            <a href={product.docsHome}>{product.label} docs</a>
            <span aria-hidden="true">/</span>
            {activeDocument.group}
          </p>
          <MarkdownDocument markdown={markdown} originalDocsLinks={product.key === HAPPY.key} components={activeDocument.essay ? essayComponents : undefined} />

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

export function LegalPage({
  name,
  back = { href: '/', label: 'Back to home' },
}: {
  name: LegalName
  back?: { href: string; label: string }
}) {
  const markdown = prepareMarkdown(getLegalSource(name))

  return (
    <div className="site-shell document-site-shell">
      <SiteHeader />
      <main className="legal-layout page-width">
        <a className="document-back-link" href={back.href}>
          <span aria-hidden="true">←</span> {back.label}
        </a>
        <article className="document-article legal-article">
          <MarkdownDocument markdown={markdown} />
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}

/**
 * The Vision essay's images at their display size, so the text around them doesn't
 * reflow while they load. A screenshot narrower than the column floats beside the
 * text past phone width; a diagram spans the column.
 */
const essayFigures: Record<string, { width: number; height: number; side?: 'left' | 'right' }> = {
  '/thesis/layout.svg': { width: 720, height: 400 },
  '/thesis/model-picker.png': { width: 270, height: 263, side: 'right' },
  '/thesis/sidebar.png': { width: 220, height: 306, side: 'left' },
}

/** What an essay (`essay: true` in src/documents.ts) renders differently from a plain docs page. */
const essayComponents: Components = {
  // The pig beside the last bullet. Any other inline image renders as usual.
  img: ({ node: _node, alt, src, ...props }) =>
    src === '/thesis/pig.png'
      ? <img {...props} src={src} alt={alt ?? ''} className="essay-pig" width="120" height="117" loading="lazy" />
      : <img {...props} src={src} alt={alt ?? ''} loading="lazy" />,
  // An image alone on its line is a figure. Screenshots float beside the paragraph that follows.
  p: ({ node, children, ...props }) => {
    const [only, ...rest] = node?.children ?? []
    if (rest.length === 0 && only?.type === 'element' && only.tagName === 'img') {
      const src = String(only.properties.src)
      const figure = essayFigures[src]
      // The markdown image title, `![alt](src "title")`, is the caption under the image.
      const caption = only.properties.title ? String(only.properties.title) : undefined
      return (
        <figure className={figure?.side ? `essay-figure essay-figure-${figure.side}` : 'essay-figure'}>
          <img src={src} alt={String(only.properties.alt ?? '')} width={figure?.width} height={figure?.height} loading="lazy" />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      )
    }
    return <p {...props}>{children}</p>
  },
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
          <a className="button button-primary" href={HAPPY_DESKTOP.docsHome}>Browse docs</a>
          <a className="button button-ghost" href="/">Back home</a>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
