import type { CSSProperties } from 'react'
import { AppStoreButton, GooglePlayButton } from './StoreButtons'
import { GITHUB_HAPPY2, GithubMark, SiteFooter, Wordmark } from './SiteChrome'
import { PageScrollbar } from './PageScrollbar'
import { FeatureSurprise, useFeatureSurprise } from './FeatureSurprise'
import { HAPPY } from './products'
import { KIRILL, STEVE } from './Team'
import { HappyOneDemo } from './HappyOneDemo'
import './happy-one.css'

const PAGE = '/tmp/happy-one/'
const DOWNLOAD = 'https://github.com/slopus/happy-desktop/releases/latest'
const product = { ...HAPPY, home: PAGE }

function DownloadButtons() {
  const windows = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent)
  return (
    <div className="one-download-actions">
      <a className="store-button one-desktop-button" href={DOWNLOAD} aria-label={`Download Happy for ${windows ? 'Windows' : 'macOS'}`}>
        <img src={`/img/happy-one/badges/${windows ? 'windows' : 'macos'}.svg`} alt="" width="242" height="76" />
      </a>
      <AppStoreButton /><GooglePlayButton />
    </div>
  )
}

const features = [
  {
    title: 'Multi-provider within one session',
    body: 'Astra, Fable, and Grok in the same session. Switch models in the middle of a task or delegate to subagents.',
    effect: 'providers',
  },
  {
    title: 'Natively multiplayer',
    body: 'Invite a colleague or a friend into the session. You both watch the same agent work, and either of you can steer it.',
    effect: 'multiplayer',
  },
  {
    title: 'Reuse current subscriptions',
    body: 'Sign in with the Claude, Codex, and Grok plans you already pay for. Happy adds a harness, not another bill.',
    effect: null,
  },
  {
    title: 'Open source MIT',
    body: 'It runs on your own hardware and your projects stay ordinary folders. Read the code, fork it, ship your own build.',
    effect: null,
  },
  {
    title: 'End-to-end encrypted mobile app',
    body: 'Left your desk? The same sessions are already on your phone, and what moves between your devices is encrypted.',
    effect: 'security',
  },
] as const

function Features() {
  const surprise = useFeatureSurprise()
  return (
    <section className="one-benefits-section" id="product" aria-label="What you get with Happy">
      <div className="page-width">
        <ol ref={surprise.listRef} className="one-benefits" role="list">
          {features.map((feature, index) => (
            <li
              key={feature.title}
              data-effect={feature.effect ?? undefined}
              data-active={surprise.isActive(feature.effect) ? '' : undefined}
              style={{ '--feature-progress': surprise.progress(feature.effect) ** 2 * (3 - 2 * surprise.progress(feature.effect)) } as CSSProperties}
            >
              <span className="one-benefit-number" aria-hidden="true">{index + 1}/</span>
              <div className="one-benefit-heading">
                <span className="one-benefit-title">
                  {feature.title === 'Open source MIT' ? <>
                    Open source <span className="one-mit">MIT</span>
                  </> : feature.title}
                </span>
                <FeatureSurprise effect={feature.effect} surprise={surprise} />
              </div>
              <p className="one-benefit-body">{feature.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function ExistingUsers() {
  return (
    <section className="one-existing-section" aria-labelledby="existing-heading">
      <div className="page-width">
        <aside className="one-existing" id="already-happy" aria-labelledby="existing-heading">
          <div>
            <h3 id="existing-heading">Already using Happy?</h3>
            <p>Your existing account and sessions still work. Connect Desktop from <strong>Settings → Mobile Access</strong>.</p>
          </div>
        </aside>
      </div>
    </section>
  )
}

function Terminal() {
  return (
    <section className="one-terminal-section page-width" aria-labelledby="terminal-heading">
      <div>
        <h2 id="terminal-heading">Love your terminal?<br /><em>Keep it.</em></h2>
        <p>The OG Happy experience (for those who have been around <span className="one-og-smile">:D</span>)</p>
        <p>Start Claude Code or Codex in your terminal. Resume that session or start a new one
          from your phone. No Desktop app required.</p>
        <p className="one-terminal-note">Using Desktop? Onboarding handles this setup for you.</p>
      </div>
      <div className="one-terminal-example">
        <div className="terminal">
          <div className="terminal-bar"><span /><span /><span /><em>Terminal</em></div>
          <pre className="terminal-body"><code><span className="code-comment"># Not using Happy Desktop?{'\n'}# Install the CLI here:</span>{'\n'}<span className="terminal-prompt">$</span> npm install -g happy{'\n\n'}<span className="code-comment"># Start Claude Code</span>{'\n'}<span className="terminal-prompt">$</span> happy claude{'\n\n'}<span className="code-comment"># Or start Codex</span>{'\n'}<span className="terminal-prompt">$</span> happy codex</code></pre>
        </div>
      </div>
    </section>
  )
}

function Downloads() {
  return (
    <section className="one-download page-width" id="download" aria-labelledby="download-heading">
      <h2 id="download-heading">Download Happy.</h2>
      <p>Free and open source</p>
      <DownloadButtons />
    </section>
  )
}

export default function HappyOneApp() {
  return (
    <div className="site-shell happy-one">
      <PageScrollbar />
      <div className="site-header-wrap">
        <header className="site-header page-width">
          <Wordmark product={product} />
          <nav aria-label="Primary navigation">
            <a
              className="nav-github"
              href={GITHUB_HAPPY2}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Happy on GitHub"
            >
              <GithubMark />
              <span>GitHub</span>
            </a>
          </nav>
        </header>
      </div>
      <main>
        <section className="one-hero page-width" aria-labelledby="one-heading">
          <h1 id="one-heading">Any model. Your team.<br /><em>Happy Harness.</em></h1>
          <HappyOneDemo />
          <DownloadButtons />
        </section>
        <Features />
        <Terminal />
        <ExistingUsers />
        <Downloads />
      </main>
      <SiteFooter product={product} additionalLinks={
        <a href="/video/happy-one/device/CREDITS.txt" target="_blank" rel="noopener noreferrer">Credits</a>
      } statement={
        <>
          We build interfaces around agents: how you control them, how they run,
          and how teams share context with them.
          <span className="one-footer-people">
            <a href={STEVE.href} target="_blank" rel="noopener noreferrer">{STEVE.label}</a>
            {' and '}
            <a href={KIRILL.href} target="_blank" rel="noopener noreferrer">{KIRILL.label}</a>
          </span>
        </>
      } />
    </div>
  )
}