import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { GITHUB_HAPPY, GithubMark, SiteFooter, SiteHeader } from './SiteChrome'
import { HAPPY_DESCRIPTOR, HAPPY_DESKTOP, HAPPY_DISCORD } from './products'
import { HappyOneDemo } from './HappyOneDemo'
import { GrainGradient } from './GrainGradient'
import { AnimatedEmoji, type AnimatedEmojiName } from './AnimatedEmoji'
import { DownloadOptions, type DownloadOptionsProps } from './DownloadOptions'
import { copyText } from './ChiefOfStaffPrompt'
import { CopyIcon } from './CopyIcon'
import { KIRILL, STEVE } from './Team'
import type { MacArchitecture } from './desktopDownloads'
import { HAPPY_ONE_GITHUB_STARS } from './happyOneGithubStars'
import './happy-one.css'
import './happy-one-preview.css'
import './happy-home.css'

/** One or two short sentences each, about the same length, so the four sections read alike. */
const values: readonly { title: string; body: string; emoji: AnimatedEmojiName }[] = [
  {
    title: 'Use all your subscriptions',
    body: 'Claude, Codex, Grok, and Gemini, on the subscriptions you already pay for. Mix them in a single task.',
    emoji: 'counterclockwise-arrows',
  },
  {
    title: 'Build it together',
    body: 'Work with your team in shared sessions. Divide and conquer, then share stories of what you built.',
    emoji: 'alien-monster',
  },
  {
    title: 'Open source, MIT',
    body: 'Happy is MIT licensed and runs on your own hardware. Read the code, fork it, and ship your own build.',
    emoji: 'open-source',
  },
  {
    title: 'End-to-end encrypted',
    body: 'Pair your phone with a QR code. Everything that travels between your devices is end-to-end encrypted.',
    emoji: 'closed-lock',
  },
]

/** A section of its own: the emoji on a Grain Gradient panel, the words beside it on the page. */
function ValueProposition({ title, body, emoji, index }: (typeof values)[number] & { index: number }) {
  const section = useRef<HTMLElement>(null)
  const heading = `value-${emoji}`
  return (
    <section ref={section} className="one-value" data-side={index % 2 ? 'end' : 'start'} aria-labelledby={heading}>
      <GrainGradient className="one-value-panel" offset={11 * (index + 1)}>
        <AnimatedEmoji name={emoji} section={section} />
      </GrainGradient>
      <div className="one-value-copy">
        <h2 id={heading}>{title}</h2>
        <p>{body}</p>
      </div>
    </section>
  )
}

/** The prompt we suggest: any coding agent can check our claims against the source. */
export const TRUST_PROMPT = 'Read the code at github.com/slopus/happy-desktop and github.com/slopus/happy-agent. What is Happy, and would you trust it on my machine?'

function TrustTheCode() {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = async () => {
    clearTimeout(timer.current)
    try {
      await copyText(TRUST_PROMPT)
      setState('copied')
      timer.current = setTimeout(() => setState('idle'), 1500)
    } catch {
      setState('failed')
    }
  }
  return (
    <section className="one-trust page-width" aria-labelledby="trust-heading">
      <h2 id="trust-heading">Don’t trust our words. <em>Trust the code.</em></h2>
      <p>Ask your agent of choice about Happy, and watch that agent become happy.</p>
      <figure className="one-trust-prompt">
        <figcaption>Paste into any agent</figcaption>
        <p>{TRUST_PROMPT}</p>
        <button type="button" onClick={copy} data-state={state} aria-label={state === 'copied' ? 'Prompt copied' : 'Copy prompt'}>
          {state === 'copied'
            ? <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>
            : <CopyIcon />}
          <span aria-hidden="true">{state === 'copied' ? 'Copied' : 'Copy'}</span>
        </button>
        <span className="one-download-sr" role="status">{state === 'copied' ? 'Copied.' : state === 'failed' ? 'Clipboard unavailable. Select the prompt to copy it.' : ''}</span>
      </figure>
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

// Simple Icons (CC0 1.0); the marks belong to their owners. See /img/happy-one/icons/CREDITS.txt.
const X_MARK = 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z'
const DISCORD_MARK = 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z'

function Mark({ path }: { path: string }) {
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d={path} /></svg>
}

/** The last word before the footer: where to find us. */
function TalkToUs() {
  return (
    <section className="one-talk page-width" aria-labelledby="talk-heading">
      <h2 id="talk-heading">Talk to us on Twitter or Discord.</h2>
      <ul className="one-talk-links" role="list">
        {[STEVE, KIRILL].map(person => (
          <li key={person.href}>
            <a href={person.href} target="_blank" rel="noopener noreferrer" aria-label={`${person.name}, ${person.label} on Twitter`}>
              <img src={person.avatar} alt="" width="28" height="28" />
              <span>{person.label}</span>
              <Mark path={X_MARK} />
            </a>
          </li>
        ))}
        <li>
          <a href={HAPPY_DISCORD} target="_blank" rel="noopener noreferrer">
            <Mark path={DISCORD_MARK} />
            <span>Join our Discord</span>
          </a>
        </li>
      </ul>
    </section>
  )
}

const NO_SUBSCRIPTION = () => () => {}
const socialPreviewRequested = () => new URLSearchParams(window.location.search).get('preview') === 'og'

/**
 * The homepage, in the phone apps' first-screen look: the demo on a Grain Gradient band, the
 * downloads, four value sections in a zig-zag, a prompt to check us against the code, the
 * downloads again, and where to talk to us.
 */
export default function DesktopApp() {
  // Read after hydration: the prerendered homepage is the ordinary page.
  const ogPreview = useSyncExternalStore(NO_SUBSCRIPTION, socialPreviewRequested, () => false)
  // The two download blocks share one architecture choice.
  const [macArchitecture, setMacArchitecture] = useState<MacArchitecture>('arm64')
  return (
    <div className="site-shell happy-one happy-home" data-social-preview={ogPreview ? '' : undefined}>
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
            {/* The recording stands on a Grain Gradient stage; the words stay on the page. */}
            <HappyOneDemo backdrop={<GrainGradient className="one-stage-grain" />} />
          </div>
          <DownloadOptions id="download" macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
        </section>
        <div className="one-values" id="product">
          {values.map((value, index) => <ValueProposition key={value.title} {...value} index={index} />)}
        </div>
        <TrustTheCode />
        <Downloads macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
        <TalkToUs />
      </main>
      <SiteFooter product={HAPPY_DESKTOP} cliLink={false} additionalLinks={
        <a href="/video/happy-one/device/CREDITS.txt" target="_blank" rel="noopener noreferrer">Credits</a>
      } />
    </div>
  )
}
