import { useState, type CSSProperties } from 'react'
import { GITHUB_HAPPY, GithubMark, SiteFooter, SiteHeader } from './SiteChrome'
import { FeatureSurprise, useFeatureSurprise } from './FeatureSurprise'
import { HAPPY_DESKTOP } from './products'
import { HappyOneDemo } from './HappyOneDemo'
import { DownloadOptions, type DownloadOptionsProps } from './DownloadOptions'
import type { MacArchitecture } from './desktopDownloads'
import { HAPPY_ONE_GITHUB_STARS } from './happyOneGithubStars'
import './happy-one.css'
import './happy-one-preview.css'

const features = [
  {
    title: 'Multi-provider within one session',
    body: 'Astra, Fable, and Grok in the same session. Switch models in the middle of a task or delegate to subagents.',
    effect: 'providers',
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
  {
    title: 'Natively multiplayer',
    body: 'Invite a colleague or a friend into the session. You both watch the same agent work, and either of you can steer it.',
    effect: 'multiplayer',
  },
] as const

function Features() {
  const surprise = useFeatureSurprise()
  return (
    <section className="one-benefits-section" id="product" aria-label="What you get">
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

function Terminal() {
  return (
    <section className="one-terminal-section page-width" aria-labelledby="terminal-heading">
      <div>
        <h2 id="terminal-heading">Love your terminal?<br /><em>Keep it.</em></h2>
        <p>The OG Happy experience (if you know you know)</p>
        <p>Start Claude Code or Codex in your terminal. Resume that session or start a new one
          from your phone. No Desktop app required.</p>
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

function Downloads(props: DownloadOptionsProps) {
  return (
    <section className="one-download page-width" id="download-again" aria-labelledby="download-heading">
      <h2 id="download-heading">Download Happy.</h2>
      <p>Free and open source</p>
      <DownloadOptions {...props} />
    </section>
  )
}

/** The homepage: the recorded harness demo, the pitch, and every download. */
export default function DesktopApp() {
  const ogPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('preview') === 'og'
  // The hero and footer downloads share one architecture choice.
  const [macArchitecture, setMacArchitecture] = useState<MacArchitecture>('arm64')
  return (
    <div className="site-shell happy-one" data-social-preview={ogPreview ? '' : undefined}>
      <SiteHeader product={HAPPY_DESKTOP} />
      <main>
        <section className="one-hero page-width" aria-labelledby="one-heading">
          <div className="one-hero-copy">
            <h1 id="one-heading"><span>Any Model.</span>{' '}<span>Your Subscription.</span><br /><em>Happy Harness{ogPreview ? '' : '.'}</em></h1>
            <p className="one-hero-note">Free and open source</p>
            {ogPreview && <a className="one-social-stars" href={GITHUB_HAPPY}>
              <GithubMark /><span>GitHub · {HAPPY_ONE_GITHUB_STARS.compact} stars</span>
            </a>}
          </div>
          <HappyOneDemo />
          <DownloadOptions id="download" macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
        </section>
        <Features />
        <Terminal />
        <Downloads macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
      </main>
      <SiteFooter product={HAPPY_DESKTOP} additionalLinks={
        <a href="/video/happy-one/device/CREDITS.txt" target="_blank" rel="noopener noreferrer">Credits</a>
      } />
    </div>
  )
}
