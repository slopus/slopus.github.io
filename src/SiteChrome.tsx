import { APP_STORE_LINK, GOOGLE_PLAY_LINK } from './StoreButtons'

export const GITHUB_HAPPY = 'https://github.com/slopus/happy'
export const WEB_APP = 'https://app.happy.engineering'

export function Wordmark() {
  return (
    <a className="wordmark" href="/" aria-label="Happy Engineering home">
      Happy<span>Engineering</span>
    </a>
  )
}

export function SiteHeader() {
  return (
    <div className="site-header-wrap">
    <header className="site-header page-width" id="top">
      <Wordmark />
      <nav aria-label="Primary navigation">
        <a className="nav-store-link" href={APP_STORE_LINK} target="_blank" rel="noopener noreferrer">iOS App</a>
        <a className="nav-store-link" href={GOOGLE_PLAY_LINK} target="_blank" rel="noopener noreferrer">Android App</a>
        <a href="/docs/">Docs</a>
        <a className="nav-github" href={GITHUB_HAPPY} target="_blank" rel="noopener noreferrer" aria-label="Happy on GitHub — 22,000+ stars">
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="nav-github-count">22k</span>
        </a>
        <a className="nav-cta" href={WEB_APP} target="_blank" rel="noopener noreferrer">
          <span className="nav-cta-prefix">Happy </span>Web
        </a>
      </nav>
    </header>
    </div>
  )
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="page-width footer-inner">
        <p className="footer-statement">
          Happy Engineering builds the interfaces around agents—how you control them, how they run,
          and how teams share context with them.
        </p>
        <div className="footer-meta">
          <div className="footer-links" aria-label="Footer navigation">
            <a href="/docs/">Docs</a>
            <a href="/privacy/">Privacy</a>
            <a href="/terms/">Terms</a>
          </div>
          <Wordmark />
          <p>© {currentYear} Happy Engineering</p>
        </div>
      </div>
    </footer>
  )
}