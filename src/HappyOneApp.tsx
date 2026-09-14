import { AppStoreButton, GooglePlayButton } from './StoreButtons'
import { GITHUB_HAPPY, GITHUB_HAPPY2, SiteFooter, WEB_APP, Wordmark } from './SiteChrome'
import { HAPPY } from './products'
import './happy-one.css'

const PAGE = '/tmp/happy-one/'
const PREVIEW = 'https://github.com/slopus/happy-desktop/releases/tag/v0.0.84-preview.2'
const DOWNLOAD = 'https://github.com/slopus/happy-desktop/releases/download/v0.0.84-preview.2'
const product = { ...HAPPY, home: PAGE }

function desktopPlatform() {
  if (typeof navigator === 'undefined') return 'other'
  const agent = navigator.userAgent
  if (/Android|iPhone|iPad|iPod/i.test(agent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'mobile'
  if (/Windows/i.test(agent)) return 'windows'
  if (/Macintosh|Mac OS X/i.test(agent)) return 'mac'
  if (/Linux/i.test(agent)) return 'linux'
  return 'other'
}

const features = [
  {
    title: 'Combine models natively.',
    body: 'Use Astra, Fable, and Grok together. Each keeps its native prompts and tools, with shared context across the work.',
  },
  {
    title: 'Use your current subscriptions.',
    body: 'Connect your existing Claude, Codex, and Grok accounts. Use the subscriptions you already pay for.',
  },
  {
    title: 'Work with your team.',
    body: 'Invite a colleague or friend into the same sessions. Share context, steer the work, and review changes together.',
  },
  {
    title: 'Open source. MIT.',
    body: 'Run Happy on your own hardware. Read the code, change it, and make it part of how you work.',
  },
  {
    title: 'Create bots, too.',
    body: 'Give recurring work a persistent bot. Keep the same models, subscriptions, and team, in the same open-source harness.',
  },
] as const

function Features() {
  return (
    <ul className="one-benefits" id="product" aria-label="What you get with Happy">
      {features.map(feature => (
        <li key={feature.title}>
          <details>
            <summary>{feature.title}</summary>
            <p>{feature.body}</p>
          </details>
        </li>
      ))}
    </ul>
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
  const platform = desktopPlatform()
  return (
    <section className="one-download page-width" id="download" aria-labelledby="download-heading">
      <h2 id="download-heading">Download Happy.</h2>
      <p>Free and open source. macOS nightly preview.</p>
      {(platform === 'windows' || platform === 'linux') && (
        <p className="one-platform-note">The {platform === 'windows' ? 'Windows' : 'Linux'} build isn’t available in this preview yet.</p>
      )}
      <div className="one-platform-actions">
        <a className="button button-primary" href={`${DOWNLOAD}/Happy-Nightly-0.0.84-preview.2-arm64.dmg`}>Mac · Apple Silicon</a>
        <a className="button button-ghost" href={`${DOWNLOAD}/Happy-Nightly-0.0.84-preview.2-x64.dmg`}>Mac · Intel</a>
      </div>
      <div className="store-actions one-download-stores"><AppStoreButton /><GooglePlayButton /></div>
      <div className="one-download-links">
        <a className="one-link" href={PREVIEW} target="_blank" rel="noopener noreferrer">Release notes</a>
        <a className="one-link" href="/desktop/docs/quick-start/">Documentation</a>
        <a className="one-link" href="/docs/security/">Security</a>
        <a className="one-link" href={WEB_APP} target="_blank" rel="noopener noreferrer">Web app</a>
        <a className="one-link" href={GITHUB_HAPPY} target="_blank" rel="noopener noreferrer">Mobile &amp; CLI source</a>
      </div>
    </section>
  )
}

export default function HappyOneApp() {
  const platform = desktopPlatform()
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
          <Features />
          <figure className="one-product-shot">
            <div className="one-desktop-frame">
              <img src="/img/happy-one/desktop-demo.webp" width="1836" height="996"
                alt="Happy Desktop with projects, parallel agent sessions, and an agent’s completed rocket-dinosaur design."
                fetchPriority="high" />
            </div>
            <img className="one-hero-phone" src="/happy-app.png" width="736" height="1490"
              alt="Happy Coder on iPhone, reviewing a Claude Code session and code changes." />
          </figure>
          <div className="one-download-actions">
            <a className="button button-primary one-desktop-button" href={`${PAGE}#download`}>
              {platform === 'mac' ? 'Download for macOS' : 'Desktop · macOS preview'}
            </a>
            <AppStoreButton /><GooglePlayButton />
          </div>
          <p className="one-mobile-note">Left your desk? Use the end-to-end encrypted mobile client.</p>
        </section>
        <Terminal />
        <ExistingUsers />
        <Downloads />
      </main>
      <SiteFooter product={product} />
    </div>
  )
}