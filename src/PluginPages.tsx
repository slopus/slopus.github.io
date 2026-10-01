import type { ReactNode } from 'react'
import { SiteFooter, SiteHeader } from './SiteChrome'
import './plugins.css'

const MEMES_ICON = '/img/plugins/memes/logo.png'

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

// Picked from examples/ in the plugin repository; alt text is the run's own.
const memesExamples = [
  {
    src: '12-name-your-agent-cups.jpg', width: 900, height: 900,
    alt: 'Five identical coffee cups on a café counter, labeled in marker Dottie, Dotty, Dotti, Dottie, Dotty. Caption: "Name your AI agent anything."',
  },
  {
    src: '10-always-on-group-chat.jpg', width: 720, height: 900,
    alt: 'A group chat titled "always-on agents." Muse, Dot and Grok Bot each say "I\'m always on." Below: "Seen by Claude."',
  },
  {
    src: '14-sept30-oct1-lawn.jpg', width: 720, height: 900,
    alt: 'Three photos of the same front lawn. On Sept 30 it is empty. On Oct 1 a 12-foot skeleton stands there. On Nov 1 the same skeleton wears a Santa hat and holds Christmas lights.',
  },
  {
    src: '02-increasingly-efficient-cereal.jpg', width: 900, height: 900,
    alt: 'A big yellow $200 cereal box reading "NEW! increasingly efficient models" stands next to a tiny plastic bag holding three pieces of cereal.',
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
          From the first test run on October 1, 2026, so the jokes are about that week.
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
          <h2 id="memes-install">Install</h2>
          <p className="plugin-section-intro">
            Add it to Codex from GitHub. Available in the ChatGPT plugin directory soon.
          </p>
          <div className="terminal">
            <div className="terminal-bar"><span /><span /><span /><em>Codex</em></div>
            <pre className="terminal-body">
              <code>
                <span className="terminal-prompt">$</span>codex plugin marketplace add slopus/happy-meme-plugin{'\n'}
                <span className="terminal-prompt">$</span>codex plugin add happy-memes@happy-meme-plugin
              </code>
            </pre>
          </div>
        </div>
        <div>
          <h3>Then ask</h3>
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
        <Independence />
        <PolicyLinks />
      </footer>
    </PluginShell>
  )
}
