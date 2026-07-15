import {
  AppStoreButton,
  GooglePlayButton,
  APP_STORE_LINK,
  GOOGLE_PLAY_LINK,
} from './StoreButtons'
import { SiteFooter, SiteHeader, WEB_APP } from './SiteChrome'

// Per-market rating data — update as the stores change.
const APP_STORE_RATING = { score: '4.9', count: '970+' }
const GOOGLE_PLAY_RATING = { score: '4.8', count: '2.9k+' }

function IconComputer() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="4" width="19" height="12.5" rx="1.5" />
      <path d="M8.5 20.5h7M12 16.5v4" />
    </svg>
  )
}

function IconRelay() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6.5 10.5a5.5 5.5 0 0 1 10.8-1.4 4 4 0 0 1-.8 7.9H7a4 4 0 0 1-.5-6.5Z" />
      <rect x="9.4" y="11.2" width="5.2" height="4.3" rx="1" fill="currentColor" stroke="none" />
      <path d="M10.6 11.2v-1a1.4 1.4 0 0 1 2.8 0v1" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M10.5 18.5h3" />
    </svg>
  )
}

function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="eyebrow">
      <span />
      {children}
    </p>
  )
}

export default function App() {
  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        {/* HERO */}
        <section className="hero page-width" id="happy" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <Eyebrow>Happy · Open source</Eyebrow>
            <h1 id="hero-heading">
              Leave your desk.<br />
              <em>Keep your agents moving.</em>
            </h1>
            <p className="hero-summary">
              Happy is the open-source remote control for coding agents running on your own
              computers. Start, steer, approve, and review Claude Code, Codex, and more from iOS,
              Android, or the web—then continue the same session in your terminal. Every session is{' '}
              <mark className="hl">end-to-end encrypted</mark>, so only your devices can read it.
            </p>
            <div className="terminal">
              <div className="terminal-bar">
                <span />
                <span />
                <span />
                <em>happy — install</em>
              </div>
              <pre className="terminal-body">
                <code>
                  <span className="terminal-prompt">$</span> npm install -g happy
                </code>
              </pre>
            </div>
            <div className="store-actions">
              <div className="store-option">
                <AppStoreButton href={APP_STORE_LINK} />
                <p className="store-rating" aria-label={`${APP_STORE_RATING.score} stars from ${APP_STORE_RATING.count} App Store ratings`}>
                  <span className="store-stars" aria-hidden="true">★★★★★</span>
                  <strong>{APP_STORE_RATING.score}</strong>
                  <span className="store-count">{APP_STORE_RATING.count} ratings</span>
                </p>
              </div>
              <div className="store-option">
                <GooglePlayButton href={GOOGLE_PLAY_LINK} />
                <p className="store-rating" aria-label={`${GOOGLE_PLAY_RATING.score} stars from ${GOOGLE_PLAY_RATING.count} Google Play reviews`}>
                  <span className="store-stars" aria-hidden="true">★★★★★</span>
                  <strong>{GOOGLE_PLAY_RATING.score}</strong>
                  <span className="store-count">{GOOGLE_PLAY_RATING.count} reviews</span>
                </p>
              </div>
            </div>
          </div>
          <div className="hero-aside">
            <img
              className="hero-shot"
              src="/happy-app.png"
              width={736}
              height={1490}
              alt="The Happy app showing a live Claude Code session on iPhone—reviewing an inline diff in voiceHooks.ts."
            />
          </div>
        </section>

        {/* PROBLEM */}
        <section className="problem" aria-labelledby="problem-heading">
          <div className="page-width">
            <Eyebrow>The problem</Eyebrow>
            <h2 id="problem-heading">
              The agent didn’t need you—<br />
              <em>until it did.</em>
            </h2>
            <p>
              A task can run for an hour and stop five minutes in for permission, a question, or an
              error. Happy tells you when input is needed, lets you answer from your phone, and sends
              the same agent back to the same repository with the same tools and context.
            </p>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="social-proof" aria-label="Social proof">
          <div className="page-width">
            <blockquote>
              <p>“I’ve tried it. It’s not close to this.”</p>
              <cite>— App Store reviewer, comparing Happy with Claude’s remote control</cite>
            </blockquote>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-it-works" aria-labelledby="how-heading">
          <div className="page-width">
            <div className="how-heading">
              <div>
                <Eyebrow>How it works</Eyebrow>
                <h2 id="how-heading">
                  Readable on your devices.<br />
                  <em>Encrypted everywhere between.</em>
                </h2>
              </div>
              <p className="how-intro">
                Happy connects your devices without taking possession of your work. Your code,
                agent, and encryption keys stay on your devices; only encrypted session data
                passes through our backend.
              </p>
            </div>

            <div className="encryption-flow" aria-label="How Happy encrypts and syncs session data">
              <article className="flow-node flow-device">
                <div className="flow-node-topline">
                  <span>On your device</span>
                  <span>01</span>
                </div>
                <div className="flow-icon" aria-hidden="true">
                  <IconComputer />
                </div>
                <h3>Your computer</h3>
                <p>
                  Your code and coding agent keep running here. Happy encrypts session updates
                  before they leave your machine.
                </p>
                <div className="key-badge">
                  <IconLock />
                  <span>Holds the secret key</span>
                </div>
              </article>

              <div className="flow-link" aria-hidden="true">
                <span className="cipher-label">
                  <IconLock />
                  ciphertext
                </span>
                <span className="flow-link-line" />
              </div>

              <article className="flow-node flow-relay">
                <div className="flow-node-topline">
                  <span>Happy backend</span>
                  <span>02</span>
                </div>
                <div className="flow-icon" aria-hidden="true">
                  <IconRelay />
                </div>
                <h3>Encrypted blobs only</h3>
                <div className="blob-stack" aria-hidden="true">
                  <span>7F 3A C8 91 ··· 2E</span>
                  <span>B2 09 6D F4 ··· A1</span>
                  <span>4C E7 11 8B ··· 5D</span>
                </div>
                <p>
                  We store and relay opaque ciphertext. We never receive the key, so we can’t
                  decrypt your prompts, responses, code, or session context.
                </p>
                <div className="no-key-badge">No key · No plaintext</div>
              </article>

              <div className="flow-link" aria-hidden="true">
                <span className="cipher-label">
                  <IconLock />
                  ciphertext
                </span>
                <span className="flow-link-line" />
              </div>

              <article className="flow-node flow-device">
                <div className="flow-node-topline">
                  <span>On your device</span>
                  <span>03</span>
                </div>
                <div className="flow-icon" aria-hidden="true">
                  <IconPhone />
                </div>
                <h3>Your phone</h3>
                <p>
                  Your paired phone receives the encrypted blob and decrypts it locally, giving
                  you the readable session and controls.
                </p>
                <div className="key-badge">
                  <IconLock />
                  <span>Holds the secret key</span>
                </div>
              </article>
            </div>

            <div className="encryption-summary">
              <div className="summary-lock" aria-hidden="true">
                <IconLock />
              </div>
              <p>
                <strong>That’s end-to-end encryption.</strong> Readable data is turned into
                authenticated ciphertext on one device and turned back only on another paired
                device. The relay sees the sealed result—not what’s inside.
              </p>
              <span className="summary-pill">Keys stay with you</span>
            </div>
          </div>
        </section>

        {/* FINAL HAPPY CTA */}
        <section className="closing page-width" aria-labelledby="closing-heading">
          <h2 id="closing-heading">
            Give your agents a<br />
            <em>longer leash.</em>
          </h2>
          <p className="closing-sub">Start at your desk. Continue from anywhere.</p>
          <div className="store-actions closing-store-actions">
            <AppStoreButton href={APP_STORE_LINK} />
            <GooglePlayButton href={GOOGLE_PLAY_LINK} />
          </div>
          <div className="hero-actions closing-actions">
            <a className="button button-ghost" href={WEB_APP} target="_blank" rel="noopener noreferrer">
              Open Web App
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
