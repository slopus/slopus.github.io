import { useEffect, useRef, useState } from 'react'
import type { Components } from 'react-markdown'
import { MarkdownDocument } from './MarkdownDocument'
import {
  documentGroupsForProduct,
  listedDocumentsForProduct,
  getDocument,
  getDocumentSource,
  getLegalSource,
  getThesisMarkdown,
  normalizeDocumentPath,
  prepareMarkdown,
  type DocumentEntry,
  type LegalName,
} from './documents'
import { documentHref, HAPPY, type Product } from './products'
import { SiteFooter, SiteHeader } from './SiteChrome'
import { thesisPosts, type QuotedPost } from './thesisPosts'
import { loadWidgets } from './XPostEmbed'

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

        <article className="document-article">
          {product.key === 'happy' && <LegacyNotice />}
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
 * X's official embed markup. widgets.js swaps it for the live post; until then,
 * or if the script never loads, it reads as a quote with the post's own text.
 * The posts are side notes, so they ask X for a narrow card (it accepts
 * 250–550); `.x-post` in style.css is the same width.
 */
function QuotedXPost({ url, post }: { url: string; post: QuotedPost }) {
  return (
    <figure className="x-post">
      <blockquote
        className="twitter-tweet"
        data-dnt="true"
        data-conversation="none"
        data-theme="light"
        data-width="270"
      >
        <p lang="en" dir="ltr">{post.text}</p>
        <p className="x-post-attribution">
          <span aria-hidden="true">&mdash; </span>
          <strong>{post.name}</strong> <span className="x-post-handle">@{post.handle}</span>
          {' · '}
          <a href={url}>{post.date}</a>
        </p>
      </blockquote>
    </figure>
  )
}

const thesisComponents: Components = {
  // A post URL alone on its line in the essay stands for that post.
  p: ({ node, children, ...props }) => {
    const [only, ...rest] = node?.children ?? []
    const href = only?.type === 'element' && only.tagName === 'a' ? String(only.properties.href) : ''
    const post = rest.length === 0 ? thesisPosts[href] : undefined
    return post ? <QuotedXPost url={href} post={post} /> : <p {...props}>{children}</p>
  },
}

export function ThesisPage() {
  const article = useRef<HTMLElement>(null)

  useEffect(() => {
    let cancelled = false
    loadWidgets()
      .then((twttr) => {
        if (!cancelled && article.current) twttr.widgets.load?.(article.current)
      })
      .catch(() => {
        // Blocked or offline: the quotes stay as they are.
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="site-shell document-site-shell">
      <SiteHeader />
      <main className="legal-layout page-width">
        <article className="document-article essay-article" ref={article}>
          <MarkdownDocument markdown={getThesisMarkdown()} components={thesisComponents} />
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
          <a className="button button-primary" href="/desktop/docs/">Browse docs</a>
          <a className="button button-ghost" href="/">Back home</a>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
