import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOC_CLIPS, DocClip, REST_ON_SLOW_CONNECTION } from './DocClip'
import { renderPath } from './prerender'

// A reader for whom nothing will play gets the clip's rest and never its first frame, which is the
// state before the feature happens, and never fetches the clip (DESIGN.md, Screenshots).
const NAME = 'tasks-teammate'

let reduced = false
let watching: { callback: IntersectionObserverCallback; target?: Element }[] = []

function connection(value: { saveData?: boolean; effectiveType?: string } | undefined) {
  Object.defineProperty(navigator, 'connection', { value, configurable: true })
}

beforeEach(() => {
  reduced = false
  watching = []
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' ? reduced : false,
    addEventListener() {}, removeEventListener() {},
  })))
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private callback: IntersectionObserverCallback) { watching.push({ callback }) }
    observe(target: Element) { watching.find((entry) => entry.callback === this.callback)!.target = target }
    unobserve() {}
    disconnect() {}
  })
  vi.stubGlobal('requestIdleCallback', (run: () => void) => setTimeout(run, 0))
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  connection(undefined)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// Every observer reports the picture fully on screen, then the page settles.
async function scrollToIt() {
  await act(async () => {
    for (const { callback, target } of watching) callback([{ isIntersecting: true, intersectionRatio: 1, target } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
    await new Promise((resolve) => setTimeout(resolve, 10))
  })
}

const files = (container: ParentNode) => [...container.querySelectorAll('picture source, picture img')]
  .map((element) => (element.getAttribute('srcset') ?? element.getAttribute('src'))!.replace('/img/docs/', ''))

describe('docs stills that play (src/DocClip.tsx)', () => {
  it('serve the first frame, the rest for reduced motion and no script, and a video with nothing to fetch', () => {
    const markup = renderPath('/tasks/')
    const [, picture] = /data-still="tasks-teammate">[\s\S]*?<picture>([\s\S]*?)<\/picture>/.exec(markup)!
    const sources = [...picture.matchAll(/<(?:source media="([^"]*)" srcSet|img src)="\/img\/docs\/([^"]+)"/g)].map(([, media, file]) => [media ?? null, file])
    const quiet = '((prefers-reduced-motion: reduce) or (scripting: none))'
    const wide = /\(min-width: (\d+)px\)/.exec(picture)![0]
    expect(sources).toEqual([
      [`${quiet} and (prefers-color-scheme: dark) and ${wide}`, `${NAME}.desktop.dark.rest.avif`],
      [`${quiet} and ${wide}`, `${NAME}.desktop.light.rest.avif`],
      [`${quiet} and (prefers-color-scheme: dark)`, `${NAME}.phone.dark.rest.avif`],
      [quiet, `${NAME}.phone.light.rest.avif`],
      [`(prefers-color-scheme: dark) and ${wide}`, `${NAME}.desktop.dark.first.avif`],
      [wide, `${NAME}.desktop.light.first.avif`],
      ['(prefers-color-scheme: dark)', `${NAME}.phone.dark.first.avif`],
      [null, `${NAME}.phone.light.first.avif`],
    ])
    // Its first picture, at its manifest size; no src on the video, so a page without script never fetches the clip.
    const { displayWidth, displayHeight } = DOC_CLIPS[NAME].phone!
    expect(markup).toMatch(new RegExp(`<img src="/img/docs/${NAME}.phone.light.first.avif" alt="[^"]+" width="${displayWidth}" height="${displayHeight}"`))
    const [video] = /<video[^>]*>/.exec(markup.slice(markup.indexOf('data-still="tasks-teammate"')))!
    expect(video).not.toMatch(/\ssrc=|autoplay|loop|poster/i)
    expect(video).toMatch(/muted/)
    expect(video).toMatch(/preload="none"/)
  })

  it('play once seen: the clip for the cut and scheme on screen is fetched once the page has settled', async () => {
    const { container } = render(<DocClip name={NAME} />)
    expect(container.querySelector('video')!.getAttribute('src')).toBeNull()
    await scrollToIt()
    expect(container.querySelector('video')!.getAttribute('src')).toBe(`/video/docs/${DOC_CLIPS[NAME].phone!.files.light.clip}`)
    expect(files(container)[7]).toBe(`${NAME}.phone.light.first.avif`)
  })

  it('show the rest with reduced motion and never fetch the clip', async () => {
    reduced = true
    const { container } = render(<DocClip name={NAME} />)
    await scrollToIt()
    expect(container.querySelector('video')!.getAttribute('src')).toBeNull()
    expect(container.querySelector('.doc-still-frame')!.hasAttribute('data-on')).toBe(false)
  })

  for (const [name, value] of [['Save-Data', { saveData: true, effectiveType: '4g' }], ['2G', { effectiveType: '2g' }], ['slow 2G', { effectiveType: 'slow-2g' }]] as const) {
    it(`show the rest on ${name}, before it is drawn, and never fetch the clip`, async () => {
      connection(value)
      const { container } = render(<DocClip name={NAME} />)
      expect(files(container).every((file) => file.endsWith('.rest.avif'))).toBe(true)
      await scrollToIt()
      expect(container.querySelector('video')!.getAttribute('src')).toBeNull()
    })

    it(`show the rest on ${name} in the served page, by the script after the picture`, () => {
      connection(value)
      const page = document.createElement('div')
      page.innerHTML = /<span class="doc-still doc-clip" data-still="tasks-teammate">[\s\S]*?<\/video><\/span><\/span>/.exec(renderPath('/tasks/'))![0]
      const script = page.querySelector('script')!
      Object.defineProperty(document, 'currentScript', { value: script, configurable: true })
      new Function(REST_ON_SLOW_CONNECTION)()
      expect(script.textContent).toBe(REST_ON_SLOW_CONNECTION)
      expect(files(page).every((file) => file.endsWith('.rest.avif'))).toBe(true)
      Object.defineProperty(document, 'currentScript', { value: null, configurable: true })
    })
  }

  it('leave the first frame alone on a fast connection', () => {
    connection({ saveData: false, effectiveType: '4g' })
    const page = document.createElement('div')
    page.innerHTML = /<span class="doc-still doc-clip" data-still="tasks-teammate">[\s\S]*?<\/video><\/span><\/span>/.exec(renderPath('/tasks/'))![0]
    Object.defineProperty(document, 'currentScript', { value: page.querySelector('script'), configurable: true })
    new Function(REST_ON_SLOW_CONNECTION)()
    expect(files(page).slice(4).every((file) => file.endsWith('.first.avif'))).toBe(true)
    Object.defineProperty(document, 'currentScript', { value: null, configurable: true })
  })
})
