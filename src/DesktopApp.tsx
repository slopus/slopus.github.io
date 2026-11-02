import { useRef, useState, useSyncExternalStore } from 'react'
import { GITHUB_HAPPY, GithubMark, SiteFooter, SiteHeader } from './SiteChrome'
import { HAPPY_DESCRIPTOR, HAPPY_DESKTOP } from './products'
import { HappyOneDemo } from './HappyOneDemo'
import { GrainGradient } from './GrainGradient'
import { AnimatedEmoji, type AnimatedEmojiName } from './AnimatedEmoji'
import { DownloadOptions } from './DownloadOptions'
import type { MacArchitecture } from './desktopDownloads'
import { HAPPY_ONE_GITHUB_STARS } from './happyOneGithubStars'
import './happy-one.css'
import './happy-one-preview.css'
import './happy-home.css'

/** Each line is about as long as the others, so the four read as one even grid. */
const values: readonly { title: string; body: string; emoji: AnimatedEmojiName }[] = [
  {
    title: 'Use all your subscriptions',
    body: 'Claude, Codex, Grok, Gemini and more in one app. Reuse the subscriptions you already pay for, give every task the model that fits, and run subagents on any of them.',
    emoji: 'counterclockwise-arrows',
  },
  {
    title: 'Build it together',
    body: 'Bring your team into the same projects and sessions, each person as themselves. Split big work into tasks, divide and conquer, then edit and share stories of what you built.',
    emoji: 'alien-monster',
  },
  {
    title: 'Open source, MIT',
    body: 'Happy runs on your own hardware, and your projects stay ordinary folders. Every line is MIT licensed: read the code, fork it, change what you need, ship your own build.',
    emoji: 'open-source',
  },
  {
    title: 'End-to-end encrypted',
    body: 'Left your desk? Your sessions are already on your phone. Everything that moves between your devices is encrypted end to end, so our relay only ever sees ciphertext.',
    emoji: 'closed-lock',
  },
]

function ValueProposition({ title, body, emoji }: (typeof values)[number]) {
  const section = useRef<HTMLElement>(null)
  return (
    <section ref={section} className="one-value" aria-label={title}>
      <div className="one-value-art"><AnimatedEmoji name={emoji} section={section} /></div>
      <h2>{title}</h2>
      <p>{body}</p>
    </section>
  )
}

const NO_SUBSCRIPTION = () => () => {}
const socialPreviewRequested = () => new URLSearchParams(window.location.search).get('preview') === 'og'

/** The homepage, on the phone apps' Grain Gradient: the recorded demo, the downloads, and what Happy gives you. */
export default function DesktopApp() {
  // Read after hydration: the prerendered homepage is the ordinary page.
  const ogPreview = useSyncExternalStore(NO_SUBSCRIPTION, socialPreviewRequested, () => false)
  const [macArchitecture, setMacArchitecture] = useState<MacArchitecture>('arm64')
  return (
    <div className="site-shell happy-one happy-home" data-social-preview={ogPreview ? '' : undefined}>
      <GrainGradient />
      <SiteHeader product={HAPPY_DESKTOP} />
      <main>
        <section className="one-hero page-width" aria-labelledby="one-heading">
          {/* On a phone this fills the first screen above the store badges. */}
          <div className="one-hero-fold">
            <div className="one-hero-copy">
              <h1 id="one-heading"><span>Any Model.</span>{' '}<span>Your Subscription.</span>{' '}<em>Happy Harness{ogPreview ? '' : '.'}</em></h1>
              <p className="one-hero-tagline">{HAPPY_DESCRIPTOR}</p>
              <p className="one-hero-note">Free and open source</p>
              {ogPreview && <a className="one-social-stars" href={GITHUB_HAPPY}>
                <GithubMark /><span>GitHub · {HAPPY_ONE_GITHUB_STARS.compact} stars</span>
              </a>}
            </div>
            <HappyOneDemo />
          </div>
          <DownloadOptions id="download" macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
        </section>
        <div className="one-values page-width" id="product">
          {values.map(value => <ValueProposition key={value.title} {...value} />)}
        </div>
      </main>
      <SiteFooter product={HAPPY_DESKTOP} cliLink={false} additionalLinks={
        <a href="/video/happy-one/device/CREDITS.txt" target="_blank" rel="noopener noreferrer">Credits</a>
      } />
    </div>
  )
}
