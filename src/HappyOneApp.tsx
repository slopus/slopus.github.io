import { AppStoreButton, GooglePlayButton } from './StoreButtons'
import { GITHUB_HAPPY2, SiteFooter, Wordmark } from './SiteChrome'
import { HAPPY } from './products'
import './happy-one.css'

const PAGE = '/tmp/happy-one/'
const DOWNLOAD = 'https://github.com/slopus/happy-desktop/releases/latest'
const product = { ...HAPPY, home: PAGE }

function DownloadButtons() {
  const windows = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent)
  return (
    <div className="one-download-actions">
      <a className="button button-primary one-desktop-button" href={DOWNLOAD}>
        Download for {windows ? 'Windows' : 'macOS'}
      </a>
      <AppStoreButton /><GooglePlayButton />
    </div>
  )
}

const features = [
  {
    title: 'Multi-provider',
    body: 'Mix and match models from different providers. Use Astra, Fable, and Grok together, each with its native prompts and tools and shared context across the work.',
  },
  {
    title: 'Natively multiplayer',
    body: 'Invite a colleague or friend into the same sessions. Share context, steer the work, and review changes together.',
  },
  {
    title: 'Use your current subscriptions',
    body: 'Connect your existing Claude, Codex, and Grok accounts. Use the subscriptions you already pay for.',
  },
  {
    title: 'Open source MIT',
    body: 'Run Happy on your own hardware. Read the code, change it, and make it part of how you work.',
  },
  {
    title: 'End-to-end encrypted mobile app',
    body: 'Control Happy Desktop and your terminal sessions from your phone. Messages between your devices are end-to-end encrypted.',
  },
] as const

function Features() {
  return (
    <ol className="one-benefits" id="product" aria-label="What you get with Happy" role="list">
      {features.map((feature, index) => (
        <li key={feature.title}>
          <details>
            <summary>
              <span className="one-benefit-number" aria-hidden="true">{index + 1}/</span>
              <span>{feature.title}</span>
              <span className="one-benefit-chevron" aria-hidden="true" />
            </summary>
            <p>{feature.body}</p>
          </details>
        </li>
      ))}
    </ol>
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
        <p>The original Happy experience: Claude Code and Codex in your terminal,
          with remote control from your phone.</p>
        <p>Start, steer, approve, and review. Then continue the same session at your keyboard.
          Your tools, your setup. No Desktop app required.</p>
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
          <h1 id="one-heading">Any model. Your team.<br /><em>Happy Harness.</em></h1>
          <figure className="one-product-shot">
            <div className="one-desktop-frame">
              <img src="/img/happy-one/desktop-demo.webp" width="1836" height="996"
                alt="Happy Desktop with projects, parallel agent sessions, and an agent’s completed rocket-dinosaur design."
                fetchPriority="high" />
            </div>
            <img className="one-hero-phone" src="/happy-app.png" width="736" height="1490"
              alt="Happy Coder on iPhone, reviewing a Claude Code session and code changes." />
          </figure>
          <DownloadButtons />
          <Features />
        </section>
        <Terminal />
        <ExistingUsers />
        <Downloads />
      </main>
      <SiteFooter product={product} />
    </div>
  )
}