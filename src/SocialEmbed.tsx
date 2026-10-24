import { memo, useEffect, useRef } from 'react'
import { loadWidgets } from './XPostEmbed'

/**
 * What a post said, keyed by its URL. The served page carries it inside the embed's blockquote,
 * so it reads before X's or Reddit's script swaps in the real post (or if that script never runs).
 */
const POSTS: Record<string, { author: string; handle: string; date: string; text: string }> = {
  'https://x.com/0xrwu/status/2105329822125707394': {
    author: 'Richard Wu',
    handle: '@0xrwu',
    date: 'September 30, 2026',
    text: `The ChatGPT app is now such a clusterf**k.

There's now 4 ways to do similar things!!!
- ChatGPT Chat: you can do web search and some tool calls, but you can't write code on the fly (well)
- ChatGPT Work: it's like Codex (filesystem access + can write code), but in the other tab
- Codex: your projects here don't talk to your projects in ChatGPT
- Dot: how is this different than Work? Besides having a dedicated cloud VM, but it can still work on my computer?

IMO, the ideal hierarchy should be:
1. Workspaces. Everyone starts off with a default one. I can separate out my workspace for "personal stuff" vs "coding projects" vs "work stuff". I can also have my @conductor_build threads in its own workspace so it doesn't pollute my non-Conductor threads.
2. There is no "Chat vs Work vs Codex" - all threads have superset capabilities.
3. Dot is just the master "orchestrator" thread. It can spin up and interact with threads in my workspace, or just do work directly.

Pls fix @thsottiaux.`,
  },
  'https://x.com/emollick/status/2105184972537528538': {
    author: 'Ethan Mollick',
    handle: '@emollick',
    date: 'September 30, 2026',
    text: 'After a brief period where OpenAI seemed to be unifying work around the ChatGPT app, between Dot and Spaces and Pages and local/cloud ChatGPT Work and Scheduled Tasks in the Cloud and Scheduled Tasks on your computer, everything is getting quite confusing and overlapping again.',
  },
  'https://www.reddit.com/r/ClaudeAI/comments/1u7j7au/the_most_annoying_part_of_claude_is_losing_a/os114du/': {
    author: 'u/mesamaryk',
    handle: 'r/ClaudeAI',
    date: 'June 16, 2026',
    text: 'I kinda gave up and am waiting until a new model gets enough capability to just go sort through old chats and organise them for me',
  },
}

const REDDIT_SCRIPT = 'https://embed.reddit.com/widgets.js'

/** X's script loads once and upgrades each embed; Reddit's scans the page only as it runs, so each Reddit embed runs it again. */
function load(kind: 'tweet' | 'reddit', element: HTMLElement) {
  if (kind === 'tweet') {
    loadWidgets().then((twttr) => twttr.widgets.load?.(element)).catch(() => undefined)
    return
  }
  const script = document.createElement('script')
  script.src = REDDIT_SCRIPT
  script.async = true
  script.charset = 'utf-8'
  document.body.append(script)
}

/** An official X or Reddit embed, centred in the column; its script loads as it nears the viewport. */
const SocialEmbed = memo(function SocialEmbed({ kind, url }: { kind: 'tweet' | 'reddit'; url: string }) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = box.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      load(kind, element)
    }, { rootMargin: '600px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [kind])

  const post = POSTS[url]
  const byline = post && <p className="social-embed-byline">— {post.author} ({post.handle}) <a href={url}>{post.date}</a></p>
  // X's and Reddit's scripts replace the blockquote with an iframe, so React must not touch it again.
  return (
    <div ref={box} className={`social-embed social-embed-${kind}`}>
      {kind === 'tweet' ? (
        <blockquote className="twitter-tweet" data-dnt="true" data-align="center" data-cards="hidden" data-conversation="none" data-width="340">
          {post && <p lang="en" dir="ltr">{post.text}</p>}
          {byline ?? <a href={url}>{url}</a>}
        </blockquote>
      ) : (
        <blockquote className="reddit-embed-bq" data-embed-height="180" data-embed-showtitle="false">
          {post && <p>{post.text}</p>}
          {byline ?? <a href={url}>{url}</a>}
        </blockquote>
      )}
    </div>
  )
})

export function Tweet({ url }: { url: string }) {
  return <SocialEmbed kind="tweet" url={url} />
}

export function RedditEmbed({ url }: { url: string }) {
  return <SocialEmbed kind="reddit" url={url} />
}
