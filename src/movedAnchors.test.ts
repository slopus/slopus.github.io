import { describe, expect, it } from 'vitest'
import mainHeadingIds from './mainHeadingIds.json'
import { metadataForPath } from './Router'
import { MOVED_ANCHORS } from './movedAnchors'
import { renderPath } from './prerender'

// Every heading id each URL served on `main` at 0ecbbb8, before the November 2026 rewrite of the
// reading path, read once from that build's HTML. A link to one must still land somewhere: on its
// own page (the heading, or an <Anchor id="…" /> line where its content now is), or on the page it
// moved to (MOVED_ANCHORS).
const COMPONENT_IDS = new Set([
  // The blog's download block, which posts no longer repeat.
  'blog-download-heading',
])

function idsOn(pathname: string) {
  return new Set([...renderPath(pathname).matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]))
}

describe('heading ids main served', () => {
  it('still land on their page or on the page they moved to', () => {
    const lost: string[] = []
    for (const [pathname, ids] of Object.entries(mainHeadingIds as Record<string, string[]>)) {
      const present = idsOn(pathname)
      const moved = MOVED_ANCHORS[metadataForPath(pathname).canonicalPath] ?? {}
      for (const id of ids) {
        if (!present.has(id) && !moved[id] && !COMPONENT_IDS.has(id)) lost.push(`${pathname}#${id}`)
      }
    }
    expect(lost).toEqual([])
  })

  it('moves each one to an id the new page has', () => {
    for (const [from, ids] of Object.entries(MOVED_ANCHORS)) {
      for (const [id, to] of Object.entries(ids)) {
        expect(idsOn(from).has(id), `${from}#${id} is on its page again`).toBe(false)
        const [pathname, hash] = to.split('#')
        if (hash) expect(idsOn(pathname).has(hash), to).toBe(true)
        else expect(renderPath(pathname)).toMatch(/<h1/)
      }
    }
  })
})
