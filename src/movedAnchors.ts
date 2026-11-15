/**
 * Sections that moved to another page, by the canonical path and heading id they had. A link to
 * the old place (`/how-it-works/#is-happy-a-phone-remote-for-claude-code`) goes on to the new one;
 * the Router follows it once the page finds no element with that id. Ids kept on their own page
 * are `<Anchor id="…" />` lines in the content instead. src/movedAnchors.test.ts checks that every
 * heading id `main` served before the November 2026 rewrite still lands somewhere.
 */
export const MOVED_ANCHORS: Record<string, Record<string, string>> = {
  '/how-it-works/': {
    'is-happy-a-phone-remote-for-claude-code': '/guides/terminal/#is-happy-a-phone-remote-for-claude-code',
  },
  '/multiplayer/': {
    'happy-vs-cursor-projects-claude-projects-chatgpt-projects-and-capy-ai': '/cursor-projects-claude-team-capy/',
  },
  '/secrets/': {
    'how-happy-compares-with-hermes-agent-and-openclaw': '/hermes-agent-openclaw-secrets/#how-happy-compares-with-hermes-agent-and-openclaw',
  },
  '/guides/remote-server/': {
    'a-harness-not-a-remote-control': '/remote-server-alternatives/#a-harness-not-a-remote-control',
    'where-happy-came-from': '/remote-server-alternatives/#where-happy-came-from',
    'alternatives-to-a-happy-agent-server': '/remote-server-alternatives/#alternatives-to-a-happy-agent-server',
  },
}

/** Where a fragment that is no longer on `canonicalPath` went, if it moved to another page. */
export function movedAnchor(canonicalPath: string, hash: string): string | undefined {
  if (!hash.startsWith('#')) return undefined
  let id: string
  try {
    id = decodeURIComponent(hash.slice(1))
  } catch {
    return undefined
  }
  return MOVED_ANCHORS[canonicalPath]?.[id]
}
