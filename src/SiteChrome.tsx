import { useEffect, useState, type ReactNode } from 'react'
import { HAPPY, HAPPY_DESKTOP, type Product } from './products'
import { HAPPY_ONE_GITHUB_STARS } from './happyOneGithubStars'
import { PageScrollbar } from './PageScrollbar'
import { KIRILL, STEVE } from './Team'

export const GITHUB_HAPPY = HAPPY.repository
export const GITHUB_HAPPY_DESKTOP = HAPPY_DESKTOP.repository

export function GithubMark() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function Wordmark() {
  return (
    <a className="wordmark" href="/" aria-label="Happy Engineering home">
      Happy<span>Engineering</span>
    </a>
  )
}

function GithubLink() {
  return (
    <a
      className="nav-github"
      href={GITHUB_HAPPY}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Happy on GitHub, ${HAPPY_ONE_GITHUB_STARS.count.toLocaleString('en-US')} stars`}
    >
      <GithubMark />
      <span className="nav-github-count">{HAPPY_ONE_GITHUB_STARS.compact}</span>
    </a>
  )
}

/**
 * Whether the page has scrolled under the header. Wide docs pages scroll their
 * article instead of the window; element scrolls do not bubble, so listen in
 * the capture phase.
 */
function usePageScrolled() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => {
      const article = document.querySelector('.docs-shell .document-article')
      setScrolled(window.scrollY > 0 || (article?.scrollTop ?? 0) > 0)
    }
    update()
    document.addEventListener('scroll', update, { capture: true, passive: true })
    return () => document.removeEventListener('scroll', update, { capture: true })
  }, [])
  return scrolled
}

/**
 * One plain header on every page, with the page's painted scrollbar. Docs means
 * the Happy (desktop) docs.
 */
export function SiteHeader({
  product = HAPPY,
  docsActive = false,
  blogActive = false,
}: {
  product?: Product
  docsActive?: boolean
  blogActive?: boolean
}) {
  const scrolled = usePageScrolled()
  return (
    <>
      <PageScrollbar />
      <div className="site-header-wrap" data-scrolled={scrolled ? '' : undefined}>
        <header className="site-header page-width" id="top">
          <div className="site-header-brand">
            <Wordmark />
          </div>
          <nav aria-label="Primary navigation">
            <a href={`${HAPPY_DESKTOP.docsBase}/`} aria-current={docsActive && product.key === 'desktop' ? 'page' : undefined}>Docs</a>
            <a href="/blog/" aria-current={blogActive ? 'page' : undefined}>Blog</a>
            <GithubLink />
          </nav>
        </header>
      </div>
    </>
  )
}

export function SiteFooter({ product = HAPPY, additionalLinks }: { product?: Product; additionalLinks?: ReactNode }) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="page-width footer-inner">
        <p className="footer-statement">
          We build interfaces around agents: how you control them, how they run,
          and how teams share context with them.
          <span className="footer-people">
            <a href={STEVE.href} target="_blank" rel="noopener noreferrer">{STEVE.label}</a>
            {' and '}
            <a href={KIRILL.href} target="_blank" rel="noopener noreferrer">{KIRILL.label}</a>
          </span>
        </p>
        <div className="footer-meta">
          <div className="footer-links" aria-label="Footer navigation">
            <a href={`${product.docsBase}/`}>Docs</a>
            <a href="/privacy/">Privacy</a>
            <a href="/terms/">Terms</a>
            {additionalLinks}
            <a className="footer-link-quiet" href={`${HAPPY.docsBase}/`}>Original Happy CLI</a>
          </div>
          <Wordmark />
          <p>© {currentYear} Happy Engineering</p>
        </div>
      </div>
    </footer>
  )
}
