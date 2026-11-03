import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import DesktopApp, { TRUST_PROMPT } from './DesktopApp'
import { Router } from './Router'

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

  it('leads with the harness pitch', () => {
    render(<DesktopApp />)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading.textContent).toMatch(/any model\.\s*your subscription\.\s*happy harness\./i)
  })

  it('offers every desktop platform and both app stores', () => {
    render(<DesktopApp />)

    expect(screen.getAllByRole('link', { name: /download happy for macos/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /download happy for windows/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /download happy for linux/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /app store/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /google play/i }).length).toBeGreaterThan(0)
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

  it('offers the downloads twice: under the demo, and again after Trust the code', () => {
    const { container } = render(<DesktopApp />)

    expect(container.querySelectorAll('.one-download-actions')).toHaveLength(2)
    expect(container.querySelector('#download-again .one-download-actions')).toBeTruthy()
  })

  it('runs demo, downloads, the four values, Trust the code, downloads again, then Talk to us', () => {
    const { container } = render(<DesktopApp />)
    const main = container.querySelector('main')!

    expect([...main.children].map((child) => child.className.split(' ')[0])).toEqual([
      'one-hero', 'one-values', 'one-trust', 'one-download', 'one-talk',
    ])
    const sections = [...main.querySelectorAll('.one-value')]
    expect(sections.map((section) => section.querySelector('h2')?.textContent)).toEqual([
      'Use all your subscriptions',
      'Build it together',
      'Open source, MIT',
      'End-to-end encrypted',
    ])
    // A zig-zag: the emoji starts on the left, then trades sides.
    expect(sections.map((section) => section.getAttribute('data-side'))).toEqual(['start', 'end', 'start', 'end'])
    for (const section of sections) expect(section.querySelector(':scope > canvas.one-emoji')).toBeTruthy()
  })

  it('stands on one gradient surface, with no panels', () => {
    const { container } = render(<DesktopApp />)
    const shell = container.querySelector('.happy-home')!

    expect(shell.firstElementChild?.className).toBe('home-grain')
    expect(container.querySelectorAll('.home-grain canvas')).toHaveLength(1)
    expect(container.querySelector('.one-grain, .one-value-panel, .one-stage-grain')).toBeNull()
  })

  it('puts where and with whom under the headline', () => {
    const { container } = render(<DesktopApp />)

    expect(container.querySelector('.one-hero-tagline')?.textContent).toBe(
      'Orchestrate Claude, Codex, Grok, Gemini and more in one app\u00a0— locally or on a remote server, by yourself or with your team.',
    )
  })

  it('keeps the four value lines short and about the same length', () => {
    const { container } = render(<DesktopApp />)
    const lengths = [...container.querySelectorAll('.one-value p')].map((body) => body.textContent!.length)

    expect(Math.max(...lengths)).toBeLessThanOrEqual(110)
    expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(8)
  })

  it('does not claim a relay that only sees ciphertext or sessions already on the phone', () => {
    const { container } = render(<DesktopApp />)

    expect(container.textContent).not.toMatch(/ciphertext|already on your phone/i)
  })

  it('offers a prompt to check Happy against its code', () => {
    const { container } = render(<DesktopApp />)
    const trust = container.querySelector('.one-trust')!

    expect(trust.querySelector('h2')?.textContent).toMatch(/trust the code/i)
    expect(trust.textContent).toContain(TRUST_PROMPT)
    expect(within(trust as HTMLElement).getByRole('button', { name: 'Copy prompt' })).toBeTruthy()
  })

  it('switches headline and palette from the URL, falling back to the first of each', () => {
    try {
      window.history.replaceState(null, '', '/?hero=4&palette=ocean')
      const { container, unmount } = render(<DesktopApp />)
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Stop working with AI alone.')
      expect(container.querySelector('.happy-home')?.getAttribute('data-palette')).toBe('ocean')
      unmount()

      window.history.replaceState(null, '', '/?hero=9&palette=neon')
      const second = render(<DesktopApp />)
      expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Any Model. Your Subscription. Happy Harness.')
      expect(second.container.querySelector('.happy-home')?.getAttribute('data-palette')).toBe('lavender')
    } finally {
      window.history.replaceState(null, '', '/')
    }
  })

  it('flips the variants live from the dev switcher', () => {
    render(<DesktopApp />)
    const switcher = screen.getByRole('form', { name: 'Homepage variants' })

    fireEvent.change(within(switcher).getByRole('combobox', { name: 'Hero' }), { target: { value: '5' } })
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Where your team and its agents work together.')
    expect(window.location.search).toBe('?hero=5')
    fireEvent.change(within(switcher).getByRole('combobox', { name: 'Hero' }), { target: { value: '1' } })
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
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/happy harness/i)
    unmount()

    render(<Router pathname="/desktop/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/happy harness/i)
  })

  it('still answers on the old /happy2 and /tmp/happy-one URLs', () => {
    const { unmount } = render(<Router pathname="/happy2/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/happy harness/i)
    unmount()

    const second = render(<Router pathname="/tmp/happy-one/" />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/happy harness/i)
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

  it('names the people behind Happy on every page', () => {
    for (const pathname of ['/', '/docs/', '/welcome/', '/privacy/']) {
      const { unmount } = render(<Router pathname={pathname} />)
      const footer = screen.getByRole('contentinfo')

      expect(footer.textContent).toMatch(/we build interfaces around agents/i)
      expect(within(footer).getByRole('link', { name: '@Ex3NDR' })).toBeTruthy()
      expect(within(footer).getByRole('link', { name: '@bra1n_dump' })).toBeTruthy()
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
