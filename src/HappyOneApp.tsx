import { AppStoreButton, GooglePlayButton } from './StoreButtons'
import { GITHUB_HAPPY, GITHUB_HAPPY2, SiteFooter, WEB_APP, Wordmark } from './SiteChrome'
import { HAPPY } from './products'
import './happy-one.css'

const PAGE = '/tmp/happy-one/'
const PREVIEW = 'https://github.com/slopus/happy-desktop/releases/tag/v0.0.84-preview.2'
const DOWNLOAD = 'https://github.com/slopus/happy-desktop/releases/download/v0.0.84-preview.2'
const product = { ...HAPPY, home: PAGE }

function Setup() {
  return (
    <section className="one-setup page-width" id="setup" aria-labelledby="setup-heading">
      <div className="one-section-heading">
        <p className="eyebrow">One Happy. One setup.</p>
        <h2 id="setup-heading">At your desk.<br /><em>Then, wherever.</em></h2>
        <p>Start on your computer or your phone. You’ll end up in the same place.</p>
      </div>
      <ol className="one-steps">
        <li>
          <div className="one-step-top"><span>01 / DESKTOP</span><span aria-hidden="true">💻</span></div>
          <h3>Give your agents a home.</h3>
          <p>Download and open Happy Desktop. It sets up Happy Agent and helps you connect the AI tools you already use.</p>
          <a className="text-link" href={`${PAGE}#download`}>Get the desktop app <span aria-hidden="true">↗</span></a>
        </li>
        <li>
          <div className="one-step-top"><span>02 / PHONE</span><span aria-hidden="true">📱</span></div>
          <h3>Take Happy with you.</h3>
          <p>Find <strong>Happy Coder</strong> in the App Store or Google Play. Open the app and create an account—or keep the one you have.</p>
          <p className="one-step-footnote">Desktop prepares the terminal CLI while you get the app.</p>
        </li>
        <li>
          <div className="one-step-top"><span>03 / CONNECT</span><span aria-hidden="true">🔗</span></div>
          <h3>One scan. You’re together.</h3>
          <p>Choose Mobile Access in Desktop, then scan its pairing QR with Happy Coder. Control Desktop and your terminal sessions from your phone.</p>
          <p className="one-step-footnote">Phone setup is optional. Add it later in Settings → Mobile Access.</p>
        </li>
      </ol>
      <aside className="one-existing" id="already-happy" aria-labelledby="existing-heading">
        <span className="one-existing-icon" aria-hidden="true">👋</span>
        <div>
          <h3 id="existing-heading">Already a Happy person?</h3>
          <p>Keep your phone account and your sessions. Install or update Desktop, then open
            <strong> Settings → Mobile Access</strong>. An existing matching link is recognized—no new account needed.</p>
        </div>
        <a className="text-link" href={`${PAGE}#download`}>Get the update <span aria-hidden="true">↗</span></a>
      </aside>
    </section>
  )
}

function Chief() {
  return (
    <section className="one-chief" aria-labelledby="chief-heading">
      <div className="page-width one-chief-inner">
        <div>
          <p className="eyebrow">Meet your Chief of Staff</p>
          <h2 id="chief-heading">Big plans.<br /><em>One small first step.</em></h2>
          <p>You don’t need to set up everything at once. Ask your Chief of Staff to find
            a project you’ve been working on—or start something new. Pick one small change and go.</p>
          <p className="one-chief-note">Prefer picking a folder yourself? Manual setup is always there.</p>
        </div>
        <div className="one-draft">
          <div className="one-draft-label"><span aria-hidden="true">💬</span> A first message to try</div>
          <p>Help me bring one project into Happy. Let’s look at what I’ve been working on,
            pick something together, and make one small change.</p>
          <div className="one-draft-footer"><span>You choose the project. You send the message.</span><span aria-hidden="true">↗</span></div>
        </div>
      </div>
    </section>
  )
}

function Terminal() {
  return (
    <section className="one-terminal-section page-width" aria-labelledby="terminal-heading">
      <div>
        <p className="eyebrow">Same tools. More freedom.</p>
        <h2 id="terminal-heading">Love your terminal?<br /><em>Keep it.</em></h2>
        <p>Start Claude Code or Codex with Happy in your terminal, then control that session
          from your phone. You can also start and resume sessions directly from mobile
          while your computer and Happy daemon are online.</p>
        <p>Claude Code and Codex are right up front. Happy Harness, our open-source
          multimodal agent, is there when you want to try something new.</p>
      </div>
      <div className="one-terminal-example">
        <div className="terminal">
          <div className="terminal-bar"><span /><span /><span /><em>your project · your terminal</em></div>
          <pre className="terminal-body"><code><span className="code-comment"># Start Claude Code</span>{'\n'}<span className="terminal-prompt">$</span> happy claude{'\n\n'}<span className="code-comment"># Or start Codex</span>{'\n'}<span className="terminal-prompt">$</span> happy codex</code></pre>
        </div>
        <details className="one-terminal-details">
          <summary>Just want the original terminal experience?</summary>
          <p>Run <code>npm install -g happy</code>, then <code>happy claude</code> or <code>happy codex</code>.
            Follow the terminal’s phone-pairing instructions. You can add Desktop whenever you’re ready.</p>
        </details>
      </div>
    </section>
  )
}

function Security() {
  return (
    <section className="one-security" aria-labelledby="security-heading">
      <div className="page-width one-security-inner">
        <span className="one-security-icon" aria-hidden="true">🔒</span>
        <div>
          <p className="eyebrow">Private between your devices</p>
          <h2 id="security-heading">Your work. Your keys.</h2>
          <p>Phone access is end-to-end encrypted. Your phone holds your account’s primary key;
            paired devices encrypt and decrypt your sessions. Happy’s relay can’t read your prompts,
            responses, or code. Your chosen AI provider still processes the requests you send it.</p>
        </div>
        <a className="text-link" href="/docs/security/">How encryption works <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  )
}

function Downloads() {
  return (
    <section className="one-download page-width" id="download" aria-labelledby="download-heading">
      <p className="eyebrow">Make yourself at home</p>
      <h2 id="download-heading">Your next project.<br /><em>A happier place to work.</em></h2>
      <p className="one-summary">Get Happy Desktop, bring your phone if you like, and start with one small thing.</p>
      <div className="one-download-panel">
        <div className="one-desktop-downloads">
          <div className="one-download-label"><h3>Happy Desktop</h3><span>Nightly preview</span></div>
          <p>The new setup is available in the macOS preview.</p>
          <div className="one-platform-actions">
            <a className="button button-primary" href={`${DOWNLOAD}/Happy-Nightly-0.0.84-preview.2-arm64.dmg`}>Mac · Apple Silicon <span aria-hidden="true">↓</span></a>
            <a className="button button-ghost" href={`${DOWNLOAD}/Happy-Nightly-0.0.84-preview.2-x64.dmg`}>Mac · Intel <span aria-hidden="true">↓</span></a>
          </div>
          <p className="one-download-fineprint">Node.js with npm is currently needed for terminal setup.
            Windows and Linux unified-setup downloads are still being prepared.</p>
          <a className="text-link" href={PREVIEW} target="_blank" rel="noopener noreferrer">Preview release notes ↗</a>
        </div>
        <div className="one-phone-downloads">
          <h3>Happy Coder</h3>
          <p>Your phone, now a remote control.</p>
          <div className="store-actions"><AppStoreButton /><GooglePlayButton /></div>
          <a className="text-link" href={WEB_APP} target="_blank" rel="noopener noreferrer">Already connected? Open the web app ↗</a>
        </div>
      </div>
      <p className="one-open-source">Open source, all the way down. <a href={GITHUB_HAPPY2} target="_blank" rel="noopener noreferrer">Desktop ↗</a><a href={GITHUB_HAPPY} target="_blank" rel="noopener noreferrer">Mobile &amp; CLI ↗</a></p>
    </section>
  )
}

export default function HappyOneApp() {
  return (
    <div className="site-shell happy-one">
      <div className="one-preview-note">A little preview of what’s next. The live homepage hasn’t changed.</div>
      <div className="site-header-wrap">
        <header className="site-header page-width">
          <Wordmark product={product} />
          <nav aria-label="Primary navigation">
            <a href={`${PAGE}#setup`}>How it works</a>
            <a className="one-returning-link" href={`${PAGE}#already-happy`}>Already using Happy?</a>
            <a href={GITHUB_HAPPY} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a className="nav-cta" href={`${PAGE}#download`}>Get Happy</a>
          </nav>
        </header>
      </div>
      <main>
        <section className="one-hero page-width" aria-labelledby="one-heading">
          <p className="eyebrow">Your computer does the work. You don’t have to stay there.</p>
          <h1 id="one-heading">Start at your desk.<br /><em>Pick up anywhere.</em></h1>
          <p className="one-summary">
            A home for your coding agents, on desktop and in your pocket.
            Work with Claude Code, Codex, or Happy Harness. Step away, answer a question,
            review a change, and keep the work moving from your phone.
          </p>
          <div className="one-download-actions">
            <a className="button button-primary one-desktop-button" href={`${PAGE}#download`}>
              Download Desktop <span aria-hidden="true">↓</span>
            </a>
            <span className="one-action-divider" aria-hidden="true" />
            <AppStoreButton /><GooglePlayButton />
          </div>
          <p className="one-assurance">Free &amp; open source <span>·</span> <span aria-hidden="true">🔒</span> End-to-end encrypted phone access</p>
          <figure className="one-product-shot">
            <div className="one-desktop-frame">
              <img src="/img/happy-one/desktop-demo.webp" width="1836" height="996"
                alt="Happy Desktop with projects, parallel agent sessions, Chief of Staff, and an agent’s completed rocket-dinosaur design."
                fetchPriority="high" />
            </div>
            <div className="one-phone-frame">
              <img src="/happy-app.png" width="736" height="1490"
                alt="Happy on iPhone, reviewing a Claude Code session and its code changes." />
            </div>
            <figcaption>
              <span>Your projects on desktop. Your agents in your pocket.</span>
              <span>Desktop frame from our latest demo</span>
            </figcaption>
          </figure>
        </section>
        <Setup />
        <Chief />
        <Terminal />
        <Security />
        <Downloads />
      </main>
      <SiteFooter product={product} />
    </div>
  )
}