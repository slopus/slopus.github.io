import { useEffect, useLayoutEffect, useRef } from 'react'
import clips from './docClips.json'
import { cutCss, desktopCutQuery, NOTHING, TrafficLights, type DocCut } from './DocStill'

/**
 * A docs still that plays: a 60 fps clip from the capture script's clip manifest (`src/docClips.json`,
 * DESIGN.md, Screenshots), in place of the still with the same name. Each cut comes with two stills,
 * the clip's own first frame and its last, the rest.
 *
 * The page arrives with the first frame. Once the page has loaded and the picture is within a screen,
 * the clip is fetched and laid over the still on that same frame; it plays once when 60% of it is on
 * screen and stays on its last frame. Off the screen it is emptied and made ready again, so a return
 * plays from the first picture without the finished state showing first. A click on a finished clip
 * plays it again.
 *
 * A reader for whom nothing will play gets the rest and never the first frame, which is the state
 * before the feature happens: reduced motion and no script by the picture's media queries, Save-Data
 * and 2G by the script right after the picture, before it has drawn. Their clip is never fetched. The
 * first frame of a page's first picture, which loads eagerly, is still downloaded there: the browser's
 * preload scanner asks for it before any script runs.
 */
type DocClipFiles = { clip: string; first: string; rest: string }

export type DocClipCut = DocCut & {
  files: { light: DocClipFiles; dark: DocClipFiles }
  seconds: number
  frames: number
  fps: number
}

/** Like a still, a clip without a phone cut is shown only where its desktop cut fits. */
export type DocClipEntry = { page: string; section: string; replaces: string; desktop: DocClipCut; phone?: DocClipCut | null }

export const DOC_CLIPS = clips as unknown as Record<string, DocClipEntry>

const QUIET = '((prefers-reduced-motion: reduce) or (scripting: none))'
const DARK = '(prefers-color-scheme: dark)'
/** Where the docs article scrolls on its own (src/style.css). */
const ARTICLE_SCROLLS = '(min-width: 761px)'

/** Save-Data or a 2G connection: what only script can tell. */
export function slowConnection() {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return Boolean(connection?.saveData || /2g$/.test(connection?.effectiveType ?? ''))
}

/** Points every source of the picture that names a first frame at the rest instead. */
function restInstead(picture: Element) {
  for (const element of picture.children) for (const name of ['srcset', 'src']) {
    const value = element.getAttribute(name)
    if (value?.includes('.first.')) element.setAttribute(name, value.replace('.first.', '.rest.'))
  }
}

// restInstead, run as the served page is parsed, so a reader on Save-Data or 2G never sees the first frame.
export const REST_ON_SLOW_CONNECTION = `(function(){var c=navigator.connection,p=document.currentScript.previousElementSibling;if(!c||!(c.saveData||/2g$/.test(c.effectiveType||'')))return;for(var e of p.children)for(var a of['srcset','src']){var v=e.getAttribute(a);if(v&&v.indexOf('.first.')>-1)e.setAttribute(a,v.replace('.first.','.rest.'))}})()`

const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function DocClip({ name, loading = 'lazy' }: { name: string; loading?: 'eager' | 'lazy' }) {
  const clip = DOC_CLIPS[name]
  const { desktop, phone } = clip
  const frame = useRef<HTMLSpanElement>(null)
  // A page reached in the app, not served: the script in the markup never ran.
  useBeforePaint(() => {
    const picture = frame.current?.querySelector('picture')
    if (picture && slowConnection()) restInstead(picture)
  }, [])
  useEffect(() => frame.current ? playWhenSeen(frame.current, clip) : undefined, [clip])
  const wide = desktopCutQuery(clip)
  const file = (cut: DocClipCut, scheme: 'light' | 'dark', still: 'first' | 'rest') => `/img/docs/${cut.files[scheme][still]}`
  const size = (cut: DocClipCut) => ({ width: cut.displayWidth, height: cut.displayHeight })
  const self = `.site-theme .document-content .doc-still[data-still="${name}"]`
  const lights = Boolean(desktop.chrome || phone?.chrome)
  const narrow = phone ? cutCss(name, phone, lights) : `${self} { display: none }`
  const shown = phone ? cutCss(name, desktop, lights) : `${self} { display: block }${cutCss(name, desktop, lights)}`
  const fallback = phone ?? desktop
  return (
    <span className="doc-still doc-clip" data-still={name}>
      <style>{`${narrow}@media ${wide} { ${shown} }`}</style>
      <span className="doc-still-frame" ref={frame}>
        <picture>
          <source media={`${QUIET} and ${DARK} and ${wide}`} srcSet={file(desktop, 'dark', 'rest')} {...size(desktop)} />
          <source media={`${QUIET} and ${wide}`} srcSet={file(desktop, 'light', 'rest')} {...size(desktop)} />
          {phone && <source media={`${QUIET} and ${DARK}`} srcSet={file(phone, 'dark', 'rest')} />}
          {phone && <source media={QUIET} srcSet={file(phone, 'light', 'rest')} />}
          <source media={`${DARK} and ${wide}`} srcSet={file(desktop, 'dark', 'first')} {...size(desktop)} />
          <source media={wide} srcSet={file(desktop, 'light', 'first')} {...size(desktop)} />
          {phone && <source media={DARK} srcSet={file(phone, 'dark', 'first')} />}
          {/* The desktop cut's alt: the phone cut shows a part of the same clip. */}
          <img src={phone ? file(phone, 'light', 'first') : NOTHING} alt={desktop.alt} {...size(fallback)}
            loading={loading} fetchPriority={loading === 'eager' ? 'high' : undefined} decoding={loading === 'eager' ? undefined : 'async'} />
        </picture>
        <script dangerouslySetInnerHTML={{ __html: REST_ON_SLOW_CONNECTION }} />
        {/* No src until it is near: the served page never fetches the clip. The picture's alt describes it. */}
        <video muted playsInline preload="none" aria-hidden="true" tabIndex={-1} disablePictureInPicture suppressHydrationWarning />
        {lights && <TrafficLights />}
      </span>
    </span>
  )
}

const painted = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

// The clip waits for the page: its own load, then a quiet moment.
const pageSettled = () => new Promise<void>((resolve) => {
  const idle = () => 'requestIdleCallback' in window ? requestIdleCallback(() => resolve(), { timeout: 2000 }) : setTimeout(resolve, 200)
  if (document.readyState === 'complete') idle()
  else addEventListener('load', idle, { once: true })
})

/** The player; returns its cleanup. Starts over when the cut, the scheme or the scrolling element changes. */
export function playWhenSeen(frame: HTMLElement, clip: DocClipEntry) {
  const video = frame.querySelector('video')
  const picture = frame.querySelector('picture')
  if (!video || !picture || slowConnection() || typeof IntersectionObserver === 'undefined') return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  video.muted = true
  const queries = [matchMedia(desktopCutQuery(clip)), matchMedia(DARK), matchMedia(ARTICLE_SCROLLS)]
  const [wide, dark, scrolls] = queries
  let blocked = false
  const watch = () => {
    const cut = wide.matches ? clip.desktop : clip.phone
    // Hidden here: nothing to play.
    if (!cut) return () => {}
    const src = `/video/docs/${cut.files[dark.matches ? 'dark' : 'light'].clip}`
    let ready: Promise<boolean> | undefined
    let loads = 0
    let visit = 0
    let seen = false
    let gone = false
    // Fetch the clip and lay it over the still once its first frame has painted.
    const prepare = () => ready ??= (async () => {
      const mine = ++loads
      await pageSettled()
      if (gone || mine !== loads) return false
      const loaded = new Promise<boolean>((resolve) => {
        video.addEventListener('loadeddata', () => resolve(true), { once: true })
        video.addEventListener('error', () => resolve(false), { once: true })
      })
      video.preload = 'auto'
      if (video.getAttribute('src') !== src) video.src = src
      else video.load()
      if (!(await loaded)) return false
      await painted()
      if (gone || mine !== loads) return false
      frame.dataset.on = ''
      return true
    })()
    const start = async () => {
      const mine = ++visit
      delete frame.dataset.rest
      if (!(await prepare()) || mine !== visit) return
      if (video.currentTime > 0) video.currentTime = 0
      await video.play().catch((error: unknown) => {
        // Not allowed to play (Low Power Mode, a browser setting): the finished state, as a still.
        if (error instanceof DOMException && error.name === 'NotAllowedError') { blocked = true; stop(); restInstead(picture) }
      })
      if (mine !== visit) video.pause()
    }
    // Emptied, not rewound: a rewound clip came back showing its last frame for a frame.
    const leave = () => {
      ++visit
      delete frame.dataset.rest
      delete frame.dataset.on
      video.pause()
      ready = undefined
      void prepare()
    }
    const onEnded = () => { frame.dataset.rest = '' }
    const onClick = () => { if ('rest' in frame.dataset) void start() }
    video.addEventListener('ended', onEnded)
    frame.addEventListener('click', onClick)
    // On wider screens the article scrolls, not the page: the observers watch it, so "a screen away" is its own.
    const root = scrolls.matches ? frame.closest('.document-article') : null
    const near = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) void prepare() }, { root, rootMargin: '100% 0px' })
    // 60% of it, or of the screen for a picture taller than that.
    const need = Math.min(0.6, 0.6 * (root?.clientHeight ?? innerHeight) / frame.getBoundingClientRect().height)
    const view = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!seen && entry.intersectionRatio >= need) { seen = true; void start() }
      } else if (seen) { seen = false; leave() }
    }, { root, threshold: [0, need] })
    near.observe(frame)
    view.observe(frame)
    return () => {
      gone = true
      ++visit
      near.disconnect()
      view.disconnect()
      video.removeEventListener('ended', onEnded)
      frame.removeEventListener('click', onClick)
      delete frame.dataset.rest
      delete frame.dataset.on
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }
  let stop = watch()
  const restart = () => { stop(); if (!blocked) stop = watch() }
  for (const query of queries) query.addEventListener('change', restart)
  return () => {
    stop()
    for (const query of queries) query.removeEventListener('change', restart)
  }
}
