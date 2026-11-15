import { DOC_CLIPS } from './DocClip'
import { DOC_STILLS, desktopCutQuery } from './DocStill'
import { getDocument, getDocumentSource } from './documents'

/**
 * The file a docs page's first picture will load on this screen, when the page opens on it (before
 * its second h2, as rehypeFirstImage in src/MarkdownDocument.tsx decides): a still's cut for this
 * width and scheme, a capture, or a clip's poster. Never the clip itself: for a still that plays
 * (src/DocClip.tsx), the still it opens on, or its rest with reduced motion.
 */
export function firstPictureUrl(pathname: string): string | undefined {
  const path = pathname.replace(/^\/+|\/+$/g, '')
  const document = getDocument('desktop', path)
  if (!document || document.group === 'Recipes') return undefined
  const source = getDocumentSource(document)
  const opening = source.split(/^## /m).slice(0, 2).join('## ')
  const image = /!\[[^\]]*\]\(([^\s)]+)(?: "([^"]*)")?\)/.exec(opening)
  if (!image) return undefined
  const [, src, title] = image
  if (src.endsWith('/')) return title === 'autoplay' ? `${src}poster.webp` : undefined
  const name = src.replace(/^\/img\/docs\//, '')
  const still = title === 'still' ? DOC_STILLS[name] : undefined
  if (!still) return /\.(webp|png|jpe?g|avif|svg)$/.test(src) ? src : undefined
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const clip = DOC_CLIPS[name]
  if (clip) {
    const cut = window.matchMedia(desktopCutQuery(clip)).matches ? clip.desktop : clip.phone
    const quiet = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return cut ? `/img/docs/${cut.files[dark ? 'dark' : 'light'][quiet ? 'rest' : 'first']}` : undefined
  }
  const cut = window.matchMedia(desktopCutQuery(still)).matches ? still.desktop : still.phone
  return cut ? `/img/docs/${cut.files[dark ? 'dark' : 'light']}` : undefined
}

const fetched = new Set<string>()

/** Starts loading a page's first picture into the cache, once; nothing on Save-Data or 2G. */
export function prefetchFirstPicture(pathname: string) {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  if (connection?.saveData || /2g/.test(connection?.effectiveType ?? '')) return
  const url = firstPictureUrl(pathname)
  if (!url || fetched.has(url)) return
  fetched.add(url)
  const image = new Image()
  image.decoding = 'async'
  image.src = url
}
