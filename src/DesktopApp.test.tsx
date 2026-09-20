import { cleanup, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import App from './App'
import DesktopApp from './DesktopApp'
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

function productSwitch() {
  return screen.getByRole('group', { name: 'Choose a product' })
}

describe('Happy Desktop landing page', () => {
  afterEach(() => {
    cleanup()
  })

  it('leads with the harness pitch', () => {
    render(<DesktopApp />)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading.textContent).toMatch(/any model\.\s*your team\.\s*happy harness\./i)
  })

  it('offers every desktop platform and both app stores', () => {
    render(<DesktopApp />)

    expect(screen.getAllByRole('link', { name: /download happy for macos/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /download happy for windows/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /download happy for linux/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /app store/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /google play/i }).length).toBeGreaterThan(0)
  })

  it('keeps the terminal path for people who do not want the app', () => {
    const { container } = render(<DesktopApp />)

    expect(container.textContent).toMatch(/npm install -g happy/)
    expect(container.textContent).toMatch(/happy claude/)
  })

  it('uses the shared header with docs and the repository', () => {
    render(<DesktopApp />)

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' })

    expect(within(navigation).getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe('/desktop/docs/')
    expect(within(navigation).getByRole('link', { name: /on github/i })).toBeTruthy()
    expect(within(navigation).queryByRole('link', { name: /ios app/i })).toBeNull()
    expect(within(navigation).queryByRole('link', { name: /android app/i })).toBeNull()
  })

  it('does not mount the social-preview stars line by default', () => {
    const { container } = render(<DesktopApp />)

    expect(container.querySelector('.one-social-stars')).toBeNull()
    expect(container.querySelector('[data-social-preview]')).toBeNull()
  })

  it('is served at /desktop', () => {
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
})

describe('site footer', () => {
  afterEach(() => {
    cleanup()
  })

  it('names the people behind Happy on every page', () => {
    for (const pathname of ['/', '/desktop/', '/docs/', '/desktop/docs/', '/privacy/']) {
      const { unmount } = render(<Router pathname={pathname} />)
      const footer = screen.getByRole('contentinfo')

      expect(footer.textContent).toMatch(/we build interfaces around agents/i)
      expect(within(footer).getByRole('link', { name: '@Ex3NDR' })).toBeTruthy()
      expect(within(footer).getByRole('link', { name: '@bra1n_dump' })).toBeTruthy()
      unmount()
    }
  })

  it('credits the device artwork only where it appears', () => {
    const { unmount } = render(<Router pathname="/desktop/" />)
    expect(within(screen.getByRole('contentinfo')).getByRole('link', { name: 'Credits' })).toBeTruthy()
    unmount()

    render(<Router pathname="/" />)
    expect(within(screen.getByRole('contentinfo')).queryByRole('link', { name: 'Credits' })).toBeNull()
  })
})

describe('product switch', () => {
  afterEach(() => {
    cleanup()
  })

  it('offers both products from either page', () => {
    const { unmount } = render(<App />)
    expect(within(productSwitch()).getAllByRole('link')).toHaveLength(2)
    unmount()

    render(<DesktopApp />)
    expect(within(productSwitch()).getAllByRole('link')).toHaveLength(2)
  })

  it('names the products by their surfaces and marks Desktop as new', () => {
    render(<App />)

    const options = within(productSwitch()).getAllByRole('link')

    expect(options[0].textContent).toBe('Terminal + Mobile')
    expect(options[1].textContent).toBe('Desktop + MobileNew')
    expect(options[0].getAttribute('href')).toBe('/')
    expect(options[1].getAttribute('href')).toBe('/desktop/')
  })

  it('marks Terminal + Mobile as current on the homepage', () => {
    render(<App />)

    const current = within(productSwitch()).getByRole('link', { name: 'Terminal + Mobile' })

    expect(current.getAttribute('aria-current')).toBe('page')
    expect(within(productSwitch()).getByRole('link', { name: /^Desktop \+ Mobile/ }).getAttribute('aria-current')).toBeNull()
  })

  it('follows the URL into the Happy Desktop documentation', () => {
    render(<Router pathname="/desktop/docs/quick-start/" />)

    const current = within(productSwitch()).getByRole('link', { name: /^Desktop \+ Mobile/ })

    expect(current.getAttribute('aria-current')).toBe('page')
  })

  it('stays on Terminal + Mobile for the Happy documentation', () => {
    render(<Router pathname="/docs/quick-start/" />)

    const current = within(productSwitch()).getByRole('link', { name: 'Terminal + Mobile' })

    expect(current.getAttribute('aria-current')).toBe('page')
  })
})
