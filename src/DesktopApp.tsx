import { Suspense, lazy, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { GITHUB_HAPPY, GithubMark, SiteFooter, SiteHeader } from './SiteChrome'
import { HAPPY_DESCRIPTOR, HAPPY_DESKTOP, HAPPY_DISCORD } from './products'
import { HappyOneDemo } from './HappyOneDemo'
import { GrainGradient } from './GrainGradient'
import { HOME_HEADLINE, PALETTE_DEFAULT, SOCIAL_HEADLINE, homePreview, homeVariantsSearch, homeVariantsSubscribe } from './homeVariants'
import { homeVariantsDev } from './homeVariantsDev'
import { AnimatedEmoji, type AnimatedEmojiName } from './AnimatedEmoji'
import { DownloadOptions, type DownloadOptionsProps } from './DownloadOptions'
import { KIRILL, STEVE } from './Team'
import type { MacArchitecture } from './desktopDownloads'
import { HAPPY_ONE_GITHUB_STARS } from './happyOneGithubStars'
import './happy-one.css'
import './happy-one-preview.css'
import './happy-home.css'

/** A title and two short sentences each, about the same length; F1 Fast Mobile is Kirill's line as written. */
const values: readonly { title: string; body: string; emoji: AnimatedEmojiName }[] = [
  {
    title: 'Use all your subscriptions',
    body: 'Claude Code, Codex, Grok, and Gemini, on the subscriptions you already pay for. Mix them in a single task.',
    emoji: 'rainbow',
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
  {
    title: 'F1 Fast Mobile',
    body: 'Ever heard about a mobile app getting a speeding ticket? We just got one!',
    emoji: 'f1-car',
  },
]

/**
 * A row of its own: the emoji and the words, trading sides down the page. Each side's edge is
 * shared by every row, the emoji's on one row and the words' on the next.
 */
function ValueProposition({ title, body, emoji, index }: (typeof values)[number] & { index: number }) {
  const section = useRef<HTMLElement>(null)
  const heading = `value-${emoji}`
  return (
    <section ref={section} className="one-value" data-side={index % 2 ? 'end' : 'start'} aria-labelledby={heading}>
      <AnimatedEmoji name={emoji} section={section} />
      <div className="one-value-copy">
        <h2 id={heading}>{title}</h2>
        <p>{body}</p>
      </div>
    </section>
  )
}

/** The downloads again, just the buttons. */
function Downloads(props: DownloadOptionsProps) {
  return (
    <section className="one-download page-width" id="download-again" aria-label="Download Happy">
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

/** Text with its *starred* runs in the accent colour and its `\n` as line breaks. */
function Accented({ text }: { text: string }) {
  return text.split(/\*([^*]+)\*/u).map((run, index) => index % 2
    ? <em key={index}>{run}</em>
    : run.split('\n').flatMap((part, line) => line ? [<br key={`${index}-${line}`} />, part] : [part]))
}

/** A headline line; a whole starred line is the accent block. */
function HeadlineLine({ line }: { line: string }) {
  const whole = /^\*([^*]+)\*$/u.exec(line)
  if (whole) return <em>{whole[1]}</em>
  return <span><Accented text={line} /></span>
}


/**
 * Whether the hero's name has scrolled up past the header: until then the homepage keeps its
 * header out of sight. Observed rather than read on every scroll, so scrolling stays on the
 * compositor; the observer is remade when the header's height changes (60px, 52px on phones).
 */
function usePastHeading() {
  const [past, setPast] = useState(false)
  useEffect(() => {
    const heading = document.getElementById('one-heading')
    const header = document.querySelector<HTMLElement>('.site-header-wrap')
    if (!heading || !header || typeof IntersectionObserver === 'undefined') return setPast(true)
    let observer: IntersectionObserver | undefined
    const observe = () => {
      observer?.disconnect()
      observer = new IntersectionObserver(([entry]) => {
        setPast(!entry.isIntersecting && entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0))
      }, { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` })
      observer.observe(heading)
    }
    observe()
    const resize = new ResizeObserver(observe)
    resize.observe(header)
    return () => {
      resize.disconnect()
      observer?.disconnect()
    }
  }, [])
  return past
}

/** The dev server's switcher for the variants under review; the build leaves it out. */
const HomeVariantSwitcher = import.meta.env.DEV ? lazy(() => import('./HomeVariantSwitcher')) : undefined
// After hydration, and outside the page: the prerendered page has no switcher to match.
const noSubscription = () => () => {}

/**
 * The homepage, in the phone apps' first-screen look, on one Grain Gradient surface from top to
 * bottom: the headline and demo, the downloads, five value rows in a zig-zag, a prompt to check
 * us against the code, the downloads again, and where to talk to us.
 */
export default function DesktopApp() {
  // Read after hydration: the prerendered homepage is the ordinary page.
  const search = useSyncExternalStore(homeVariantsSubscribe, homeVariantsSearch, () => '')
  const ogPreview = homePreview(search)
  const variants = import.meta.env.DEV ? homeVariantsDev(search) : undefined
  const palette = variants?.palette ?? PALETTE_DEFAULT
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false)
  // The link-preview card keeps the headline and descriptor it was made with.
  const headline = ogPreview ? { ...SOCIAL_HEADLINE, sub: HAPPY_DESCRIPTOR } : variants?.headline ?? HOME_HEADLINE
  // The two download blocks share one architecture choice.
  const [macArchitecture, setMacArchitecture] = useState<MacArchitecture>('arm64')
  const headerShown = usePastHeading()
  const note = useRef<HTMLParagraphElement>(null)
  return (
    <div className="site-shell happy-one happy-home" data-palette={palette} data-social-preview={ogPreview ? '' : undefined}
      data-header-shown={headerShown ? '' : undefined}>
      {!ogPreview && <GrainGradient palette={palette} />}
      <SiteHeader product={HAPPY_DESKTOP} />
      <main>
        <section className="one-hero page-width" aria-labelledby="one-heading" data-name={headline.name ? '' : undefined}
          data-kicker={headline.kicker ? '' : undefined} style={{
            '--hero-lines': headline.lines.length, '--hero-sub-lines': headline.sub ? headline.sub.split('\n').length : 0,
          } as CSSProperties}>
          {/* On a phone this fills the first screen above the store badges. */}
          <div className="one-hero-fold">
            <div className="one-hero-copy">
              {headline.kicker && <p className="one-hero-kicker">{headline.kicker}</p>}
              <h1 id="one-heading">
                {headline.lines.flatMap((line, index) => [index ? ' ' : '', <HeadlineLine key={line} line={line} />])}
              </h1>
              {headline.sub && <p className="one-hero-tagline"><Accented text={headline.sub} /></p>}
              {/* The note carries the GitHub stars; the link-preview card has a line of its own for them. */}
              <p ref={note} className="one-hero-note">
                Free and open source
                {!ogPreview && <a className="one-hero-stars" href={GITHUB_HAPPY} target="_blank" rel="noopener noreferrer"
                  aria-label={`Happy on GitHub, ${HAPPY_ONE_GITHUB_STARS.count.toLocaleString('en-US')} stars`}>
                  <GithubMark /><span>{HAPPY_ONE_GITHUB_STARS.compact}</span>
                </a>}
              </p>
              {ogPreview && <a className="one-social-stars" href={GITHUB_HAPPY}>
                <GithubMark /><span>GitHub · {HAPPY_ONE_GITHUB_STARS.compact} stars</span>
              </a>}
            </div>
            <HappyOneDemo reach={note} />
          </div>
          <DownloadOptions id="download" macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
        </section>
        <div className="one-values" id="product">
          {values.map((value, index) => <ValueProposition key={value.title} {...value} index={index} />)}
        </div>
        <Downloads macArchitecture={macArchitecture} onMacArchitectureChange={setMacArchitecture} />
        <TalkToUs />
      </main>
      <SiteFooter product={HAPPY_DESKTOP} cliLink={false} people={false} additionalLinks={
        <a href="/video/happy-one/device/CREDITS.txt" target="_blank" rel="noopener noreferrer">Credits</a>
      } />
      {HomeVariantSwitcher && variants && hydrated && !ogPreview
        && createPortal(<Suspense fallback={null}><HomeVariantSwitcher {...variants} /></Suspense>, document.body)}
    </div>
  )
}
