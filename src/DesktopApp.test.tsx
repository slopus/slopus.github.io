import { readFileSync } from 'node:fs'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import DesktopApp from './DesktopApp'
import { HOME_HEADLINE } from './homeVariants'
import { HERO_DEFAULT } from './homeVariantsDev'
import { Router } from './Router'

/** The headline as it reads: its lines joined, without the accent marks. */
const DEFAULT_HEADLINE = HOME_HEADLINE.lines.join(' ').replaceAll('*', '')

// The recorded demo needs real media APIs; the page around it is what these tests cover.
vi.mock('./HappyOneDemo', () => ({ HappyOneDemo: () => <figure data-testid="demo" /> }))

beforeAll(() => {
  // The download lookup falls back to verified installers without a live request.
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
  // jsdom has neither; the scroll reveals and the painted scrollbar only observe them.
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
    matches: false, addEventListener() {}, removeEventListener() {},
  }))
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('Happy Desktop landing page', () => {
  afterEach(() => {
    cleanup()
  })

  it('leads with the default headline, at most one short line, and Free and open source', () => {
    const { container } = render(<DesktopApp />)

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Happy')
    // Kirill's line, plain: nothing in it takes the accent colour.
    const tagline = container.querySelector('.one-hero-tagline')!
    expect(tagline.textContent).toBe('One place for you, your team, and your agents.')
    expect(tagline.querySelector('em')).toBeNull()
    const note = container.querySelector('.one-hero-note')!
    const stars = note.querySelector('a')!
    expect(note.firstChild!.textContent!.trim()).toBe('Free and open source')
    // Then the GitHub mark and the star count, as in the header.
    expect(stars.getAttribute('href')).toBe('https://github.com/slopus/happy')
    expect(stars.querySelector('svg')).toBeTruthy()
    expect(stars.textContent).toBe('24k')
    expect(stars.getAttribute('aria-label')).toBe('Happy on GitHub, 24,384 stars')
    const lines = [...container.querySelectorAll('.one-hero-copy p')].map((line) => line.textContent!)
    expect(lines.at(-1)).toBe('Free and open source24k')
    expect(lines.length).toBeLessThanOrEqual(2)
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(60)
    expect(container.textContent).not.toMatch(/remote server/i)
  })

  it('keeps the copy short: headings and lines under 160 words in all', () => {
    const { container } = render(<DesktopApp />)
    const words = [...container.querySelectorAll('main :is(h1, h2, p)')]
      .filter((element) => !element.closest('.one-download-actions'))
      .flatMap((element) => element.textContent!.split(/\s+/).filter(Boolean))

    expect(words.length).toBeLessThanOrEqual(160)
  })

  it('offers every desktop platform and both app stores', () => {
    render(<DesktopApp />)

    // jsdom reports Linux, so the primary download is Linux's.
    expect(screen.getAllByRole('link', { name: 'Download Happy for Linux' }).length).toBeGreaterThan(0)
    for (const os of ['macOS', 'Windows', 'Linux']) {
      for (const link of screen.getAllByRole('link', { name: `${os}: all downloads on GitHub` })) {
        expect(link.getAttribute('href')).toBe('https://github.com/slopus/happy-desktop/releases/latest')
      }
    }
    expect(screen.getAllByRole('link', { name: /app store/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /google play/i }).length).toBeGreaterThan(0)
  })

  it('names where each download sits, for the click events', () => {
    const { container } = render(<DesktopApp />)

    expect(container.querySelector('#download')?.getAttribute('data-analytics-location')).toBe('hero')
    expect(container.querySelector('#download-again .one-download-actions')?.getAttribute('data-analytics-location')).toBe('download-again')
  })

  it('links the App Store listing by its current slug', () => {
    render(<DesktopApp />)

    for (const link of screen.getAllByRole('link', { name: /app store/i })) {
      expect(link.getAttribute('href')).toBe('https://apps.apple.com/us/app/happy-codex-claude-code-app/id6748571505')
    }
  })

  it('keeps the full download options in the hero, after the copy and recording it fits around on phones', () => {
    const { container } = render(<DesktopApp />)
    const fold = container.querySelector('.one-hero > .one-hero-fold')
    const downloads = container.querySelector('#download')

    expect(fold?.querySelector('h1')).toBeTruthy()
    expect(fold?.querySelector('[data-testid="demo"]')).toBeTruthy()
    expect(fold?.nextElementSibling).toBe(downloads)
    expect(downloads?.querySelector('.one-desktop-downloads')).toBeTruthy()
    expect(downloads?.querySelector('.one-mobile-downloads')).toBeTruthy()
    // The stores come right after the desktop download, and every platform after them.
    expect(downloads?.querySelector('.one-desktop-downloads')?.nextElementSibling?.className).toBe('one-mobile-downloads')
    expect(downloads?.lastElementChild?.className).toBe('one-other-platforms')
  })

  it('never mentions the CLI', () => {
    const { container } = render(<DesktopApp />)

    expect(container.textContent).not.toMatch(/npm install -g happy|happy claude|happy codex|\bCLI\b|terminal/i)
  })

  it('uses the shared header with docs and the repository', () => {
    render(<DesktopApp />)

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })

    expect(within(navigation).getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/welcome/')
    expect(within(navigation).getByRole('link', { name: /on github/i })).toBeTruthy()
    expect(within(navigation).queryByRole('link', { name: /ios app/i })).toBeNull()
    expect(within(navigation).queryByRole('link', { name: /android app/i })).toBeNull()
  })

  it('no longer has an Already using Happy section, and points #download at the downloads under the demo', () => {
    const { container } = render(<DesktopApp />)

    expect(screen.queryByText(/already using happy/i)).toBeNull()
    const target = container.querySelector('#download')
    expect(target?.closest('.one-hero')).toBeTruthy()
    expect(target?.getAttribute('aria-label')).toBe('Desktop and mobile downloads')
    expect(container.querySelectorAll('#download')).toHaveLength(1)
  })

  it('offers the downloads twice: under the demo, and again after the values', () => {
    const { container } = render(<DesktopApp />)

    expect(container.querySelectorAll('.one-download-actions')).toHaveLength(2)
    expect(container.querySelector('#download-again .one-download-actions')).toBeTruthy()
  })

  it('runs demo, downloads, the five values, downloads again, then Talk to us', () => {
    const { container } = render(<DesktopApp />)
    const main = container.querySelector('main')!

    expect([...main.children].map((child) => child.className.split(' ')[0])).toEqual([
      'one-hero', 'one-values', 'one-download', 'one-talk',
    ])
    const sections = [...main.querySelectorAll('.one-value')]
    expect(sections.map((section) => section.querySelector('h2')?.textContent)).toEqual([
      'Use all your subscriptions',
      'Build it together',
      'Open source, MIT',
      'End-to-end encrypted',
      'F1 Fast Mobile',
    ])
    // A zig-zag: the emoji starts on the left, then trades sides.
    expect(sections.map((section) => section.getAttribute('data-side'))).toEqual(['start', 'end', 'start', 'end', 'start'])
    for (const section of sections) expect(section.querySelector(':scope > canvas.one-emoji')).toBeTruthy()
  })

  it('stands on one gradient surface, with no panels', () => {
    const { container } = render(<DesktopApp />)
    const shell = container.querySelector('.happy-home')!

    expect(shell.firstElementChild?.className).toBe('home-grain')
    expect(container.querySelector('.one-grain, .one-value-panel, .one-stage-grain')).toBeNull()
  })

  it('explains each value in about 100 characters, about the same length, F1 Fast Mobile in Kirill\'s words', () => {
    const { container } = render(<DesktopApp />)
    const bodies = [...container.querySelectorAll('.one-value p')].map((body) => body.textContent!)
    const f1 = 'Ever heard about a mobile app getting a speeding ticket? We just got one!'
    expect(bodies).toContain(f1)
    const lengths = bodies.filter((body) => body !== f1).map((body) => body.length)

    expect(Math.min(...lengths)).toBeGreaterThanOrEqual(90)
    expect(Math.max(...lengths)).toBeLessThanOrEqual(110)
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(10)
  })

  it('does not claim a relay that only sees ciphertext or sessions already on the phone', () => {
    const { container } = render(<DesktopApp />)

    expect(container.textContent).not.toMatch(/ciphertext|already on your phone/i)
  })

  it('switches headline and palette from the URL, falling back to the first of each', () => {
    try {
      window.history.replaceState(null, '', '/?hero=4&palette=ocean')
      const { container, unmount } = render(<DesktopApp />)
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('AI work, out of private chats.')
      expect(container.querySelector('.happy-home')?.getAttribute('data-palette')).toBe('ocean')
      unmount()

      window.history.replaceState(null, '', '/?hero=9&palette=neon')
      const second = render(<DesktopApp />)
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(DEFAULT_HEADLINE)
      expect(second.container.querySelector('.happy-home')?.getAttribute('data-palette')).toBe('lavender')
    } finally {
      window.history.replaceState(null, '', '/')
    }
  })

  it('puts the colour in big swells at the sides, the top right, and the bottom left', async () => {
    const { HOME_SURFACE } = await import('./GrainGradient')
    const { wide, narrow } = HOME_SURFACE

    // No band along the top, and none along the bottom: the bottom left corner instead.
    expect(wide.ends).toEqual([0, 0, 0, 0])
    expect(wide.corners).toEqual([0, expect.any(Number), expect.any(Number), 0])
    expect(Math.min(wide.corners[1], wide.corners[2])).toBeGreaterThanOrEqual(400)
    expect(wide.sides[1]).toBeGreaterThan(0)
    // Phones: the two corners, out of the content.
    expect(narrow.sides).toEqual([0, 0, 0, 0])
    expect(narrow.ends).toEqual([0, 0, 0, 0])
    expect(narrow.corners).toEqual([0, expect.any(Number), expect.any(Number), 0])
  })

  it('holds the gradient still, its two halves blended across the middle', async () => {
    const { grainGradientFragmentShader } = await import('./grainGradientShader')
    // Drawn on a resize or new scheme, never on a clock.
    const renderer = readFileSync('src/grainGradientRenderer.ts', 'utf8')
    expect(renderer).not.toMatch(/requestAnimationFrame|setInterval/)
    // Drawn once into canvases that scroll with the page: nothing listens to the scroll.
    expect(renderer).not.toMatch(/'scroll'/)
    // A hard switch between the halves' noise drew a vertical line wherever colour crossed the middle.
    expect(grainGradientFragmentShader).toMatch(/float right = smoothstep\(/)
    expect(grainGradientFragmentShader).not.toMatch(/step\(\.5 \* width, css\.x\)/)
  })

  it('ignores the variants in the URL outside the dev server, and never loads the switcher', () => {
    vi.stubEnv('DEV', false)
    try {
      window.history.replaceState(null, '', '/?hero=4&palette=ocean')
      const { container } = render(<DesktopApp />)
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(DEFAULT_HEADLINE)
      expect(container.querySelector('.happy-home')?.getAttribute('data-palette')).toBe('lavender')
      expect(screen.queryByRole('form', { name: 'Homepage variants' })).toBeNull()
    } finally {
      vi.unstubAllEnvs()
      window.history.replaceState(null, '', '/')
    }
  })

  it('flips the variants live from the dev switcher', async () => {
    render(<DesktopApp />)
    const switcher = await screen.findByRole('form', { name: 'Homepage variants' })

    expect(within(switcher).queryByRole('combobox', { name: 'Surface' })).toBeNull()
    fireEvent.change(within(switcher).getByRole('combobox', { name: 'Hero' }), { target: { value: '5' } })
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Happy')
    expect(screen.getByText('One place for your team and its agents.')).toBeTruthy()
    expect(window.location.search).toBe('?hero=5')
    fireEvent.change(within(switcher).getByRole('combobox', { name: 'Hero' }), { target: { value: HERO_DEFAULT } })
    expect(window.location.search).toBe('')
  })

  it('ends on the founders on Twitter and the Discord invite', () => {
    const { container } = render(<DesktopApp />)
    const talk = container.querySelector('.one-talk')!

    expect(talk.querySelector('h2')?.textContent).toBe('Talk to us on Twitter or Discord.')
    expect([...talk.querySelectorAll('a')].map((link) => link.getAttribute('href'))).toEqual([
      'https://x.com/Ex3NDR', 'https://x.com/bra1n_dump', 'https://discord.gg/fX9WBAhyfD',
    ])
  })

  it('does not mount the social-preview stars line by default', () => {
    const { container } = render(<DesktopApp />)

    expect(container.querySelector('.one-social-stars')).toBeNull()
    expect(container.querySelector('[data-social-preview]')).toBeNull()
  })

  it('is the homepage, and the old /desktop URL still lands on it', () => {
    const { unmount } = render(<Router pathname="/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(DEFAULT_HEADLINE)
    unmount()

    render(<Router pathname="/desktop/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(DEFAULT_HEADLINE)
  })

  it('still answers on the old /happy2 and /tmp/happy-one URLs', () => {
    const { unmount } = render(<Router pathname="/happy2/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(DEFAULT_HEADLINE)
    unmount()

    const second = render(<Router pathname="/tmp/happy-one/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(DEFAULT_HEADLINE)
    second.unmount()

    render(<Router pathname="/happy2/docs/quick-start/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/quick start/i)
  })

  it('still serves the desktop docs at their old /desktop/docs URLs', () => {
    const { unmount } = render(<Router pathname="/desktop/docs/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/welcome/i)
    unmount()

    render(<Router pathname="/desktop/docs/guides/terminal/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/original happy cli/i)
  })
})

describe('site footer', () => {
  afterEach(() => {
    cleanup()
  })

  it('says what we build on every page, and names us on all but the homepage, whose Talk to us does', () => {
    for (const pathname of ['/', '/docs/', '/welcome/', '/privacy/']) {
      const { unmount } = render(<Router pathname={pathname} />)
      const footer = screen.getByRole('contentinfo')

      expect(footer.textContent).toMatch(/we build interfaces around agents/i)
      if (pathname === '/') {
        expect(within(footer).queryByRole('link', { name: '@Ex3NDR' })).toBeNull()
        expect(within(footer).queryByRole('link', { name: '@bra1n_dump' })).toBeNull()
        expect(screen.getAllByRole('heading', { name: 'Talk to us on Twitter or Discord.' })).toHaveLength(1)
      } else {
        expect(within(footer).getByRole('link', { name: '@Ex3NDR' })).toBeTruthy()
        expect(within(footer).getByRole('link', { name: '@bra1n_dump' })).toBeTruthy()
      }
      unmount()
    }
  })

  it('keeps a quiet link to the original Happy CLI docs on every page but the homepage', () => {
    for (const pathname of ['/docs/', '/welcome/', '/privacy/']) {
      const { unmount } = render(<Router pathname={pathname} />)
      expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Original Happy CLI' }).getAttribute('href')).toBe('/docs/')
      unmount()
    }

    render(<Router pathname="/" />)
    expect(within(screen.getByRole('contentinfo')).queryByRole('link', { name: 'Original Happy CLI' })).toBeNull()
  })

  it('credits the device artwork only where it appears', () => {
    const { unmount } = render(<Router pathname="/" />)
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Credits' })).toBeTruthy()
    unmount()

    render(<Router pathname="/docs/" />)
    expect(within(screen.getByRole('contentinfo')).queryByRole('link', { name: 'Credits' })).toBeNull()
  })
})

describe('site header', () => {
  afterEach(() => {
    cleanup()
    window.scrollY = 0
  })

  it('draws its hairline only once the page has scrolled', () => {
    window.scrollY = 0
    const { container } = render(<Router pathname="/" />)
    const header = container.querySelector('.site-header-wrap')!

    expect(header.hasAttribute('data-scrolled')).toBe(false)
    act(() => {
      window.scrollY = 240
      document.dispatchEvent(new Event('scroll'))
    })
    expect(header.hasAttribute('data-scrolled')).toBe(true)
    act(() => {
      window.scrollY = 0
      document.dispatchEvent(new Event('scroll'))
    })
    expect(header.hasAttribute('data-scrolled')).toBe(false)
  })

  it('keeps its header out of sight until the name has scrolled up past it', () => {
    const watching = new Map<Element, IntersectionObserverCallback>()
    vi.stubGlobal('IntersectionObserver', class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe(target: Element) { watching.set(target, this.callback) }
      disconnect() {}
    })
    const { container } = render(<DesktopApp />)
    const shell = container.querySelector('.happy-home')!
    const heading = watching.get(container.querySelector('#one-heading')!)!
    const report = (isIntersecting: boolean, bottom: number) => act(() => heading(
      [{ isIntersecting, boundingClientRect: { bottom }, rootBounds: { top: 60 } } as unknown as IntersectionObserverEntry], {} as IntersectionObserver))

    expect(shell.hasAttribute('data-header-shown')).toBe(false)
    report(true, 164)
    expect(shell.hasAttribute('data-header-shown')).toBe(false)
    report(false, 40)
    expect(shell.hasAttribute('data-header-shown')).toBe(true)
    report(true, 90)
    expect(shell.hasAttribute('data-header-shown')).toBe(false)
    // As jsdom has it, for the tests after this one.
    vi.stubGlobal('IntersectionObserver', undefined)
  })

  it('is the same plain header on every page, without a product switch', () => {
    for (const pathname of ['/', '/docs/', '/quick-start/']) {
      const { unmount } = render(<Router pathname={pathname} />)
      const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })

      expect(screen.queryByRole('group', { name: 'Choose a product' })).toBeNull()
      expect(within(navigation).getAllByRole('link').map((link) => link.textContent)).toEqual(['Docs', '24k'])
      expect(within(navigation).getByRole('link', { name: 'Happy on GitHub, 24,384 stars' })).toBeTruthy()
      expect(within(navigation).getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/welcome/')
      unmount()
    }
  })
})
