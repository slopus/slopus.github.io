import type { ReactNode } from 'react'
import { SiteFooter, SiteHeader } from './SiteChrome'
import './plugins.css'

const MEMES_ICON = '/img/plugins/memes/logo.png'
const MEMES_SOURCE = 'https://github.com/slopus/happy-meme-plugin'

// Copy follows plugins/happy-memes/.codex-plugin/plugin.json in slopus/happy-meme-plugin.
// Describe only what skills/meme/SKILL.md actually does.
const memesPoints = [
  {
    title: 'Checks what happened',
    body: 'When browsing is available, it looks up the facts and the jokes already going around before writing anything.',
  },
  {
    title: 'Writes the joke first',
    body: 'It drafts several angles, keeps the best, and picks a meme format whose logic fits the joke.',
  },
  {
    title: 'Hands you a postable meme',
    body: 'Short captions spelled exactly, plus post copy, alt text, and a note on the moment it references.',
  },
]

const memesPrompts = [
  'Make a meme about this week’s biggest tech news',
  'Turn this into a meme: my 15-minute standup ran an hour',
  'Give me 3 meme options about something trending today',
]

// Made with the plugin during testing; alt text is the run's own. Leave out
// memes that riff on OpenAI or its rivals: this page is the directory listing.
const memesExamples = [
  {
    src: '12-name-your-agent-cups.jpg', width: 900, height: 900,
    alt: 'Five identical coffee cups on a café counter, labeled in marker Dottie, Dotty, Dotti, Dottie, Dotty. Caption: "Name your AI agent anything."',
  },
  {
    src: '21-agent-receipt.jpg', width: 720, height: 900,
    alt: 'A thermal store receipt next to a laptop: AI AGENT. ORDER: fix 1 typo. Files changed 47. Tests added 0. Tip? 15% 20% 25%.',
  },
  {
    src: '14-sept30-oct1-lawn.jpg', width: 720, height: 900,
    alt: 'Three photos of the same front lawn. On Sept 30 it is empty. On Oct 1 a 12-foot skeleton stands there. On Nov 1 the same skeleton wears a Santa hat and holds Christmas lights.',
  },
  {
    src: '22-agent-at-work-sign.jpg', width: 900, height: 900,
    alt: 'An orange road-work sign standing in an empty open-plan office: AI AGENT AT WORK, with a plate below: DO NOT ASK WHAT IT CHANGED.',
  },
  {
    src: '08-argon-marquee.jpg', width: 900, height: 900,
    alt: 'A lit movie-theater marquee at dusk reads "GEMINI 4 ARGON / ROLLING OUT SOON". A paper sign on the closed box office says "PRIVATE SCREENING."',
  },
  {
    src: '19-playoffs-best-of-3.jpg', width: 900, height: 900,
    alt: 'Two panels. "Regular season: 162 games" over an exhausted ballplayer face-down in the outfield. "Playoffs: best of 3" over a thumb flipping a coin under stadium lights.',
  },
]

function PluginShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell document-site-shell plugin-shell">
      <SiteHeader />
      <main className="plugin-main page-width">{children}</main>
      <SiteFooter />
    </div>
  )
}

/** A plugin is made by Happy; the directory rules forbid implying OpenAI made or endorses it. */
function Independence() {
  return (
    <p className="plugin-independence">
      Happy plugins are made by Happy. They are not made, sponsored, or endorsed by OpenAI.
      ChatGPT and Codex are trademarks of OpenAI.
    </p>
  )
}

function PolicyLinks() {
  return (
    <p className="plugin-policy-links">
      <a href="/plugins/terms/">Plugin Terms of Use</a>
      <a href="/plugins/privacy/">Plugin Privacy Policy</a>
    </p>
  )
}

export function PluginsPage() {
  return (
    <PluginShell>
      <header className="plugin-index-heading">
        <p className="eyebrow">For ChatGPT and Codex</p>
        <h1>Happy plugins</h1>
      </header>

      <ul className="plugin-index-list">
        <li>
          <a className="plugin-index-card" href="/plugins/memes/">
            <img src={MEMES_ICON} alt="" width="72" height="72" />
            <span>
              <strong>Happy Memes</strong>
              Turn any moment into a meme.
            </span>
            <span className="plugin-index-arrow" aria-hidden="true">→</span>
          </a>
        </li>
      </ul>

      <footer className="plugin-credits">
        <Independence />
        <PolicyLinks />
      </footer>
    </PluginShell>
  )
}

export function MemesPluginPage() {
  return (
    <PluginShell>
      <header className="plugin-hero">
        <img className="plugin-icon" src={MEMES_ICON} alt="Happy Memes icon: a grinning cartoon face" width="128" height="128" />
        <div>
          <p className="eyebrow"><a href="/plugins/">Plugins</a><span aria-hidden="true">/</span>For ChatGPT and Codex</p>
          <h1>Happy Memes</h1>
          <p className="plugin-tagline">Turn any moment into a meme.</p>
          <p className="plugin-summary">
            Happy Memes turns a news story, product launch, trend, or everyday situation into an
            image meme you can post.
          </p>
        </div>
      </header>

      <section className="plugin-section" aria-labelledby="memes-what">
        <h2 id="memes-what">What it does</h2>
        <ol className="plugin-points">
          {memesPoints.map((point) => (
            <li key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </li>
          ))}
        </ol>
        <p className="plugin-note">
          It avoids real people’s likenesses, fabricated quotes, and jokes at the expense of victims,
          and keeps results suitable for a general audience. It uses the built-in image generation
          in ChatGPT or Codex and connects to no outside services.
        </p>
      </section>

      <section className="plugin-section" aria-labelledby="memes-examples">
        <h2 id="memes-examples">Made with Happy Memes</h2>
        <p className="plugin-section-intro">
          Made while testing the plugin in October 2026, so some of the jokes are about that week’s news.
        </p>
        <ul className="plugin-examples">
          {memesExamples.map((example) => (
            <li key={example.src}>
              <img
                src={`/img/plugins/memes/examples/${example.src}`}
                alt={example.alt}
                width={example.width}
                height={example.height}
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="plugin-section plugin-install" aria-labelledby="memes-install">
        <div>
          <h2 id="memes-install">Get it in ChatGPT</h2>
          <p className="plugin-install-copy">
            Happy Memes is coming to the ChatGPT plugin directory. Once it’s listed, find it under
            Plugins in ChatGPT and ask for a meme.
          </p>
          <a className="text-link" href={MEMES_SOURCE} target="_blank" rel="noopener noreferrer">
            Source on GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div>
          <h3>Try asking</h3>
          <ul className="plugin-prompts">
            {memesPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}
          </ul>
        </div>
      </section>

      <footer className="plugin-credits">
        <p>
          Icon: a Happy bot face from{' '}
          <a href="https://www.figma.com/community/file/1184595184137881796" target="_blank" rel="noopener noreferrer">Adventurer Neutral</a>{' '}
          by{' '}
          <a href="https://www.instagram.com/lischi_art/" target="_blank" rel="noopener noreferrer">Lisa Wischofsky</a>,
          remixed by{' '}
          <a href="https://www.dicebear.com" target="_blank" rel="noopener noreferrer">DiceBear</a>,
          licensed under{' '}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.
        </p>
        <PolicyLinks />
      </footer>
    </PluginShell>
  )
}
