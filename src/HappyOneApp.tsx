import { useEffect, useRef, useState } from 'react'
import { AppStoreButton, GooglePlayButton } from './StoreButtons'
import { GITHUB_HAPPY, GITHUB_HAPPY2, SiteFooter, WEB_APP, Wordmark } from './SiteChrome'
import { HAPPY } from './products'
import './happy-one.css'

const PAGE = '/tmp/happy-one/'
const PREVIEW = 'https://github.com/slopus/happy-desktop/releases/tag/v0.0.84-preview.2'
const DOWNLOAD = 'https://github.com/slopus/happy-desktop/releases/download/v0.0.84-preview.2'
const product = { ...HAPPY, home: PAGE }

function Sticker({ name }: { name: 'llama' | 'alien-monster' | 'robot' | 'closed-lock' }) {
  const element = useRef<HTMLPictureElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!element.current || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.5 })
    observer.observe(element.current)
    return () => observer.disconnect()
  }, [])

  return (
    <picture ref={element} className="one-sticker" aria-hidden="true">
      <source media="(prefers-reduced-motion: reduce)" srcSet={`/img/happy-one/stickers/${name}-still.webp`} />
      <img src={`/img/happy-one/stickers/${name}${visible ? '' : '-still'}.webp`} width="112" height="112" alt="" loading="lazy" />
    </picture>
  )
}

const features = [
  {
    sticker: 'llama',
    title: 'Switch models. Keep the session.',
    body: 'Use Claude for one pass, Codex for the next, or ask Grok for a second opinion. Your conversation stays saved, and each model gets its native prompts and tools. Happy uses the sign-ins you already have.',
  },
  {
    sticker: 'alien-monster',
    title: 'Work in the same conversation.',
    body: 'Bring a teammate into a live agent session. Share context, steer the work, approve decisions, and take over together. Everyone works with the same conversation and history.',
  },
  {
    sticker: 'robot',
    title: 'Run several tasks at once.',
    body: 'Give agents separate workspaces, then review their files, diffs, terminals, and previews in one app. Your sessions are saved, so closing a window doesn’t erase the work.',
  },
  {
    sticker: 'closed-lock',
    title: 'Run it on your own hardware.',
    body: 'Work locally or on a shared server. Your projects stay ordinary folders, and the harness is open source. Remote access is end-to-end encrypted; your chosen AI provider processes the requests you send it.',
  },
] as const

function Features() {
  return (
    <section className="one-features page-width" id="product" aria-label="Happy features">
      {features.map(feature => (
        <article className="one-feature" key={feature.sticker}>
          <div className="one-feature-title">
            <Sticker name={feature.sticker} />
            <h2>{feature.title}</h2>
          </div>
          <p>{feature.body}</p>
        </article>
      ))}
    </section>
  )
}

function Mobile() {
  return (
    <section className="one-mobile" aria-labelledby="mobile-heading">
      <div className="page-width one-mobile-inner">
        <div className="one-mobile-copy">
          <h2 id="mobile-heading">Continue from<br /><em>your phone.</em></h2>
          <p>Follow progress, review changes, and respond when an agent needs you.
            Happy Coder connects to Desktop and your terminal sessions on iOS and Android.</p>
          <p>Your phone connection is end-to-end encrypted.</p>
          <div className="store-actions"><AppStoreButton /><GooglePlayButton /></div>
          <a className="one-link" href={WEB_APP} target="_blank" rel="noopener noreferrer">Open the web app</a>
        </div>
        <img className="one-mobile-shot" src="/happy-app.png" width="736" height="1490"
          alt="Happy Coder on iPhone, reviewing a Claude Code session and its code changes." loading="lazy" />
      </div>
      <div className="page-width">
        <aside className="one-existing" id="already-happy" aria-labelledby="existing-heading">
          <div>
            <h3 id="existing-heading">Already a Happy person?</h3>
            <p>Your existing account and sessions still work. Connect Desktop from <strong>Settings → Mobile Access</strong>.</p>
          </div>
          <a className="one-link" href={`${PAGE}#download`}>Download Desktop</a>
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
        <p>Claude Code and Codex still work the way you know. Start them with
          <code> happy claude</code> or <code>happy codex</code> to control them remotely,
          or start and resume sessions from your phone while your computer is online.</p>
      </div>
      <div className="one-terminal-example">
        <div className="terminal">
          <div className="terminal-bar"><span /><span /><span /><em>Terminal</em></div>
          <pre className="terminal-body"><code><span className="code-comment"># Start Claude Code</span>{'\n'}<span className="terminal-prompt">$</span> happy claude{'\n\n'}<span className="code-comment"># Or start Codex</span>{'\n'}<span className="terminal-prompt">$</span> happy codex</code></pre>
        </div>
        <details className="one-terminal-details">
          <summary>Install the CLI on its own</summary>
          <p>Run <code>npm install -g happy</code>, then <code>happy claude</code> or <code>happy codex</code>.
            Follow the terminal’s phone-pairing instructions. You can add Desktop whenever you’re ready.</p>
        </details>
      </div>
    </section>
  )
}

function Downloads() {
  return (
    <section className="one-download page-width" id="download" aria-labelledby="download-heading">
      <h2 id="download-heading">Download Happy.</h2>
      <p>Free and open source. macOS nightly preview.</p>
      <div className="one-platform-actions">
        <a className="button button-primary" href={`${DOWNLOAD}/Happy-Nightly-0.0.84-preview.2-arm64.dmg`}>Mac · Apple Silicon</a>
        <a className="button button-ghost" href={`${DOWNLOAD}/Happy-Nightly-0.0.84-preview.2-x64.dmg`}>Mac · Intel</a>
      </div>
      <div className="one-download-links">
        <a className="one-link" href={PREVIEW} target="_blank" rel="noopener noreferrer">Release notes</a>
        <a className="one-link" href="/desktop/docs/quick-start/">Documentation</a>
        <a className="one-link" href="/docs/security/">Security</a>
        <a className="one-link" href={GITHUB_HAPPY} target="_blank" rel="noopener noreferrer">Mobile &amp; CLI source</a>
      </div>
    </section>
  )
}

export default function HappyOneApp() {
  return (
    <div className="site-shell happy-one">
      <div className="site-header-wrap">
        <header className="site-header page-width">
          <Wordmark product={product} />
          <nav aria-label="Primary navigation">
            <a href={`${PAGE}#product`}>Product</a>
            <a className="one-returning-link" href={`${PAGE}#already-happy`}>Already using Happy?</a>
            <a href={GITHUB_HAPPY2} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="nav-cta" href={`${PAGE}#download`}>Download</a>
          </nav>
        </header>
      </div>
      <main>
        <section className="one-hero page-width" aria-labelledby="one-heading">
          <h1 id="one-heading">Any agent. Any team.<br /><em>One harness.</em></h1>
          <p className="one-summary">
            Work with Claude, Codex, and Grok in one open-source workspace.
            Switch models, run tasks in parallel, and bring your team into the same session.
          </p>
          <div className="one-download-actions">
            <a className="button button-primary one-desktop-button" href={`${PAGE}#download`}>
              Download for macOS
            </a>
            <a className="button button-ghost" href={GITHUB_HAPPY2} target="_blank" rel="noopener noreferrer">View source</a>
          </div>
          <figure className="one-product-shot">
            <div className="one-desktop-frame">
              <img src="/img/happy-one/desktop-demo.webp" width="1836" height="996"
                alt="Happy Desktop with projects, parallel agent sessions, Chief of Staff, and an agent’s completed rocket-dinosaur design."
                fetchPriority="high" />
            </div>
          </figure>
        </section>
        <Features />
        <Terminal />
        <Mobile />
        <Downloads />
      </main>
      <SiteFooter product={product} />
    </div>
  )
}