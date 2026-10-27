import { useEffect, useRef, useState } from 'react'
import type { Components } from 'react-markdown'
import { DownloadOptions } from './DownloadOptions'
import type { MacArchitecture } from './desktopDownloads'
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
import { recipeHref, recipeSource } from './recipeSources'
import { changelogAnchor, changelogEntryForPath, changelogMarkdown, productionChangelogEntries } from './changelog'

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

        const links = (
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
        )

        return group === 'Recipes' || group === 'Changelog' ? (
          <section className="docs-nav-group" key={group}>
            <details className="docs-nav-fold">
              <summary>{group === 'Recipes' ? 'Recipes (for agents)' : 'Changelog'}</summary>
              {links}
            </details>
          </section>
        ) : (
          <section className="docs-nav-group" key={group}>
            <h2>{group}</h2>
            {links}
          </section>
        )
      })}
    </nav>
  )
}

/**
 * The docs navigation on a phone: the current group and page as a breadcrumb that
 * opens every group and page below it. Picking a page closes it; so does a new page.
 */
function DocsMobileNavigation({
  product,
  activeDocument,
}: {
  product: Product
  activeDocument: DocumentEntry
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="docs-mobile-navigation page-width">
      <button
        type="button"
        className="docs-mobile-trail"
        aria-expanded={isOpen}
        aria-controls="docs-mobile-menu"
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="docs-mobile-trail-group">{activeDocument.group === 'Recipes' ? 'Recipes (for agents)' : activeDocument.group}</span>
        <span aria-hidden="true">/</span>
        <span className="docs-mobile-trail-page">{activeDocument.title}</span>
      </button>
      <div
        id="docs-mobile-menu"
        className="docs-mobile-menu"
        hidden={!isOpen}
        onClick={(event) => {
          if (event.target instanceof Element && event.target.closest('a')) setIsOpen(false)
        }}
      >
        <DocsNavigation product={product} activeDocument={activeDocument} />
      </div>
    </div>
  )
}

/** Brief section 6, verbatim: every original Happy CLI docs page opens with it. */
/** Where a recipe page's text comes from; shown by the renderer, so the copy stays byte for byte. */
function RecipeSourceLine({ route }: { route: string }) {
  const source = recipeSource(route)
  if (!source) return null
  return (
    <p className="recipe-source">
      Synced from happy-agent <a href={source.href}><code>{source.path}</code> @ <code>{source.revision}</code></a>
    </p>
  )
}

function LegacyNotice() {
  return (
    <aside className="legacy-notice" aria-label="The original Happy CLI is in maintenance mode">
      <p>
        <strong>Happy is now a desktop app.</strong> The original Happy CLI (<code>happy</code> on npm,
        formerly <code>happy-coder</code>) is in maintenance mode: it keeps working and still gets critical
        fixes, but new features ship in the <a href="/">Happy desktop app</a>. The Happy mobile app works
        with both. These docs describe the CLI; for Happy today, an open-source harness for orchestrating
        Claude, Codex, and Grok, start at <a href="/welcome/">Welcome</a>.
      </p>
    </aside>
  )
}

export function DocsPage({ product = HAPPY, path, changelogPath }: { product?: Product; path: string; changelogPath?: string }) {
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
  const changelogEntry = changelogPath ? changelogEntryForPath(changelogPath) : undefined
  const markdown = changelogEntry ? changelogMarkdown(changelogEntry) : activeDocument.group === 'Recipes'
    ? getDocumentSource(activeDocument)
    : prepareMarkdown(getDocumentSource(activeDocument))
  // An unlisted page sits outside the reading order, so it gets no previous or next.
  const activeIndex = productDocuments.indexOf(activeDocument)
  const previousDocument = activeIndex === -1 ? undefined : productDocuments[activeIndex - 1]
  const nextDocument = activeIndex === -1 ? undefined : productDocuments[activeIndex + 1]

  return (
    <div className="site-shell document-site-shell docs-shell">
      <SiteHeader product={product} docsActive />
      <DocsMobileNavigation key={changelogPath ?? activeDocument.path} product={product} activeDocument={changelogEntry ? { ...activeDocument, title: changelogEntry.title } : activeDocument} />
      <main className="docs-layout page-width">
        <aside
          className={`docs-sidebar${isSidebarScrollbarVisible ? ' is-scrollbar-active' : ''}`}
          onMouseMove={revealSidebarScrollbar}
          onScroll={revealSidebarScrollbar}
        >
          <DocsNavigation product={product} activeDocument={activeDocument} />
        </aside>

        <article
          className={activeDocument.essay ? 'document-article essay-article' : 'document-article'}
          data-document={activeDocument.path || undefined}
          data-changelog-entry={changelogEntry?.slug}
        >
          {product.key === 'happy' && <LegacyNotice />}
          {activeDocument.group === 'Recipes' && <RecipeSourceLine route={activeDocument.path} />}
          <MarkdownDocument markdown={markdown} originalDocsLinks={product.key === HAPPY.key} components={activeDocument.essay ? essayComponents : undefined} resolveHref={activeDocument.group === 'Recipes' ? (href) => recipeHref(activeDocument.path, href) : undefined} headingId={activeDocument.group === 'Changelog' ? (text, depth) => {
            const entry = depth < 3 ? productionChangelogEntries.find((entry) => entry.title === text) : undefined
            return entry ? changelogAnchor(entry) : undefined
          } : undefined} headingSuffix={activeDocument.group === 'Changelog' ? (text, depth) => {
            const entry = depth < 3 ? productionChangelogEntries.find((entry) => entry.title === text) : undefined
            return entry?.beta ? <> <span className="changelog-beta">Beta</span></> : undefined
          } : undefined} />
          {activeDocument.group === 'Blog' && <BlogDownload />}

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

/** Every Blog post ends on the homepage's download section, inside the homepage's scope so it looks the same. */
function BlogDownload() {
  const [macArchitecture, setMacArchitecture] = useState<MacArchitecture>('arm64')
  return (
    <div className="happy-one blog-download">
      <section className="one-download" aria-labelledby="blog-download-heading">
        <h2 id="blog-download-heading">Download Happy.</h2>
        <p>Free and open source</p>
        <DownloadOptions macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
      </section>
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
 * text past phone width; a diagram spans the column; the chart sits centered at its
 * drawn size, so its labels stay legible on a phone.
 */
const essayFigures: Record<string, { width: number; height: number; place?: 'left' | 'right' | 'center' }> = {
  '/thesis/buttons.svg': { width: 520, height: 320, place: 'center' },
  '/thesis/layout.svg': { width: 720, height: 400 },
  '/thesis/model-picker.png': { width: 270, height: 263, place: 'right' },
  '/thesis/sidebar.png': { width: 220, height: 306, place: 'left' },
}

/** The pig: beside the first bullet, and alone on the essay's last line as its sign-off. */
const ESSAY_PIG = '/thesis/pig.png'

/** What an essay (`essay: true` in src/documents.ts) renders differently from a plain docs page. */
const essayComponents: Components = {
  // The pig beside the first bullet. Any other inline image renders as usual.
  img: ({ node: _node, alt, src, ...props }) =>
    src === ESSAY_PIG
      ? <img {...props} src={src} alt={alt ?? ''} className="essay-pig" width="120" height="117" loading="lazy" />
      : <img {...props} src={src} alt={alt ?? ''} loading="lazy" />,
  // An image alone on its line is a figure. Screenshots float beside the paragraph that follows.
  p: ({ node, children, ...props }) => {
    const [only, ...rest] = node?.children ?? []
    if (rest.length === 0 && only?.type === 'element' && only.tagName === 'img') {
      const src = String(only.properties.src)
      const alt = String(only.properties.alt ?? '')
      // The pig alone on a line signs the essay off: centered, not floated, no caption.
      if (src === ESSAY_PIG) {
        return (
          <p className="essay-signoff">
            <img src={src} alt={alt} className="essay-pig essay-pig-signoff" width="120" height="117" loading="lazy" />
          </p>
        )
      }
      const figure = essayFigures[src]
      // The markdown image title, `![alt](src "title")`, is the caption under the image.
      const caption = only.properties.title ? String(only.properties.title) : undefined
      return (
        <figure className={figure?.place ? `essay-figure essay-figure-${figure.place}` : 'essay-figure'}>
          <img src={src} alt={alt} width={figure?.width} height={figure?.height} loading="lazy" />
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
