import { useEffect, useRef, useState } from 'react'
import { MarkdownDocument } from './MarkdownDocument'
import {
  documentGroups,
  documents,
  getDocument,
  getDocumentSource,
  getLegalSource,
  normalizeDocumentPath,
  prepareMarkdown,
  type DocumentEntry,
} from './documents'
import { SiteFooter, SiteHeader } from './SiteChrome'

function DocsNavigation({ activeDocument }: { activeDocument: DocumentEntry }) {
  return (
    <nav className="docs-navigation" aria-label="Documentation navigation">
      {documentGroups.map((group) => {
        const groupDocuments = documents.filter((document) => document.group === group)

        return (
          <section className="docs-nav-group" key={group}>
            <h2>{group}</h2>
            <ul>
              {groupDocuments.map((document) => (
                <li key={document.path}>
                  <a
                    href={`/docs/${document.path ? `${document.path}/` : ''}`}
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

export function DocsPage({ path }: { path: string }) {
  const [isSidebarScrollbarVisible, setIsSidebarScrollbarVisible] = useState(false)
  const sidebarScrollbarTimer = useRef<number | null>(null)
  const normalizedPath = normalizeDocumentPath(path)
  const activeDocument = getDocument(normalizedPath)

  if (!activeDocument) {
    return <NotFoundPage />
  }

  const markdown = prepareMarkdown(getDocumentSource(activeDocument))
  const activeIndex = documents.indexOf(activeDocument)
  const previousDocument = documents[activeIndex - 1]
  const nextDocument = documents[activeIndex + 1]

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

  return (
    <div className="site-shell document-site-shell">
      <SiteHeader />
      <details className="docs-mobile-navigation page-width">
        <summary>Browse documentation</summary>
        <DocsNavigation activeDocument={activeDocument} />
      </details>
      <main className="docs-layout page-width">
        <aside
          className={`docs-sidebar${isSidebarScrollbarVisible ? ' is-scrollbar-active' : ''}`}
          onMouseMove={revealSidebarScrollbar}
          onScroll={revealSidebarScrollbar}
        >
          <p className="docs-sidebar-label">Documentation</p>
          <DocsNavigation activeDocument={activeDocument} />
        </aside>

        <article className="document-article">
          <p className="document-breadcrumb">
            <a href="/docs/">Docs</a>
            <span aria-hidden="true">/</span>
            {activeDocument.group}
          </p>
          <MarkdownDocument markdown={markdown} />

          <nav className="document-pagination" aria-label="Previous and next documentation pages">
            {previousDocument ? (
              <a href={`/docs/${previousDocument.path ? `${previousDocument.path}/` : ''}`}>
                <span>Previous</span>
                {previousDocument.title}
              </a>
            ) : <span />}
            {nextDocument ? (
              <a className="document-pagination-next" href={`/docs/${nextDocument.path}/`}>
                <span>Next</span>
                {nextDocument.title}
              </a>
            ) : <span />}
          </nav>
        </article>

      </main>
      <SiteFooter />
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
        <p className="eyebrow"><span />404</p>
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
