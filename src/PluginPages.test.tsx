import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { act, cleanup, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import { prerenderedPaths, renderPath } from './prerender'
import { getLegalSource } from './documents'
import {
  memesPluginMetadata,
  pluginPrivacyMetadata,
  pluginsMetadata,
  pluginTermsMetadata,
} from './siteMetadata'

const projectRoot = path.resolve(__dirname, '..')
const pluginMetadata = [pluginsMetadata, memesPluginMetadata, pluginPrivacyMetadata, pluginTermsMetadata]

// jsdom has no ResizeObserver; the painted page scrollbar only observes with it.
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  // The homepage's demo reads these once it hydrates; its download lookup falls back without a request.
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} }))
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {})
})

afterAll(() => {
  vi.unstubAllGlobals()
})

// jsdom's userAgent names the host OS, so the homepage's download block would follow the machine
// running the tests. Pin the browser instead: a Mac keeps the prerendered layout as served.
const MAC = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
const LINUX = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36'
function useUserAgent(userAgent: string) {
  Object.defineProperty(window.navigator, 'userAgent', { configurable: true, get: () => userAgent })
  Object.defineProperty(window.navigator, 'platform', { configurable: true, get: () => (userAgent === MAC ? 'MacIntel' : 'Linux x86_64') })
}
function restoreUserAgent() {
  Reflect.deleteProperty(window.navigator, 'userAgent')
  Reflect.deleteProperty(window.navigator, 'platform')
}

describe('plugin pages', () => {
  afterEach(() => {
    cleanup()
    document.head.querySelector('link[rel="canonical"]')?.remove()
  })

  it('renders the Happy Memes listing page', () => {
    render(<Router pathname="/plugins/memes/" />)

    expect(screen.getByRole('heading', { level: 1, name: 'Happy Memes' })).toBeTruthy()
    expect(screen.getByText('Turn any moment into a meme.')).toBeTruthy()
    expect(screen.getByRole('heading', { level: 2, name: 'What it does' })).toBeTruthy()
    expect(screen.getByText(/coming to the ChatGPT plugin directory/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /source on github/i }).getAttribute('href')).toBe('https://github.com/slopus/happy-meme-plugin')
    expect(screen.getByText(/standup ran an hour/)).toBeTruthy()
    // The listing page stays ChatGPT-first and leaves OpenAI out; the policies carry the disclaimer.
    expect(screen.queryByText(/codex plugin/)).toBeNull()
    expect(document.body.textContent).not.toMatch(/OpenAI/)
    // The plugin directory rejected the bare name "Memes" as too generic; it is always "Happy Memes".
    expect(document.body.textContent).not.toMatch(/(?<!Happy )Memes/)
    for (const name of ['plugins/privacy', 'plugins/terms'] as const) {
      expect(getLegalSource(name)).not.toMatch(/(?<!Happy )Memes/)
    }
    expect(screen.getByRole('link', { name: 'Lisa Wischofsky' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'CC BY 4.0' }).getAttribute('href')).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(screen.getByRole('link', { name: 'Plugin Terms of Use' }).getAttribute('href')).toBe('/plugins/terms/')
    expect(screen.getByRole('link', { name: 'Plugin Privacy Policy' }).getAttribute('href')).toBe('/plugins/privacy/')
  })

  it('shows six example memes with alt text, each shipped in public/', () => {
    render(<Router pathname="/plugins/memes/" />)

    const examples = within(screen.getByRole('region', { name: 'Examples' })).getAllByRole('img')
    expect(examples).toHaveLength(6)

    for (const image of examples) {
      expect(image.getAttribute('alt')?.length).toBeGreaterThan(40)
      expect(existsSync(path.join(projectRoot, 'public', image.getAttribute('src')!))).toBe(true)
    }
    expect(existsSync(path.join(projectRoot, 'public/img/plugins/memes/logo.png'))).toBe(true)
    expect(examples.map((image) => image.getAttribute('src')).join()).not.toMatch(/cereal|group-chat/)
  })

  it('lists Happy Memes on the plugins index', () => {
    render(<Router pathname="/plugins" />)

    expect(screen.getByRole('heading', { level: 1, name: 'Happy plugins' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^happy memes/i }).getAttribute('href')).toBe('/plugins/memes/')
  })

  it('renders the plugin privacy policy and terms apart from the app policies', () => {
    const { rerender } = render(<Router pathname="/plugins/privacy/" />)
    expect(screen.getByRole('heading', { level: 1, name: /^plugin privacy policy/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /back to plugins/i }).getAttribute('href')).toBe('/plugins/')
    expect(screen.getByRole('link', { name: 'OpenAI Privacy Policy' })).toBeTruthy()

    rerender(<Router pathname="/plugins/terms/" />)
    expect(screen.getByRole('heading', { level: 1, name: /^plugin terms of use/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'MIT License' }).getAttribute('href')).toBe('https://github.com/slopus/happy-meme-plugin/blob/main/LICENSE')

    rerender(<Router pathname="/privacy/" />)
    expect(screen.getByRole('heading', { level: 1, name: /^privacy policy/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /back to home/i })).toBeTruthy()
  })

  it('states what the plugin privacy policy must cover', () => {
    const privacy = getLegalSource('plugins/privacy')

    for (const topic of ['Personal data collected', 'Purposes of use', 'Recipients', 'Retention', 'Your Controls']) {
      expect(privacy).toContain(topic)
    }
    for (const policy of [getLegalSource('plugins/privacy'), getLegalSource('plugins/terms')]) {
      expect(policy).toMatch(/^# /)
      expect(policy).toContain('not made, sponsored, or endorsed by OpenAI')
      expect(policy).toContain('https://openai.com/policies/terms-of-use/')
    }
  })

  it('sets each plugin page’s title and canonical URL', () => {
    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)

    for (const metadata of pluginMetadata) {
      window.history.replaceState({}, '', metadata.canonicalPath.replace(/\/$/, ''))
      const { unmount } = render(<Router />)
      expect(document.title).toBe(metadata.title)
      expect(canonical.getAttribute('href')).toBe(`https://happy.engineering${metadata.canonicalPath}`)
      unmount()
    }
    window.history.replaceState({}, '', '/')
  })

  it('keeps the static plugin routes in step with the page metadata', () => {
    const script = readFileSync(path.join(projectRoot, 'scripts/generate-static-routes.mjs'), 'utf8')

    for (const metadata of pluginMetadata) {
      expect(script).toContain(`route: '${metadata.canonicalPath.replace(/^\/|\/$/g, '')}'`)
      expect(script).toContain(`title: '${metadata.title}'`)
      expect(script).toContain(`description: '${metadata.description}'`)
    }
  })

  it('serves each policy in full before JavaScript runs', () => {
    for (const [pathname, name] of [['/plugins/privacy/', 'plugins/privacy'], ['/plugins/terms/', 'plugins/terms']] as const) {
      const container = document.createElement('div')
      container.innerHTML = renderPath(pathname)
      const text = container.textContent!.replace(/\s+/g, ' ')

      for (const heading of getLegalSource(name).matchAll(/^#+ (.+)$/gm)) {
        expect(text).toContain(heading[1])
      }
      expect(container.querySelectorAll('h1')).toHaveLength(1)
      expect(text).toContain('not made, sponsored, or endorsed by OpenAI')
    }
    expect(renderPath('/plugins/privacy/')).toContain('collects no personal data')
  })

  // One hydration per prerendered page: it grows with every docs page and outran the 5s default on CI.
  it('hydrates every prerendered page (homepage, plugins, docs, thesis) without replacing or duplicating it', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    useUserAgent(MAC)

    // The old desktop docs prefixes serve the top-level page's markup at their own URL.
    const servedAt = [...prerenderedPaths.map((pathname) => [pathname, pathname]), ['/desktop/docs/models/', '/models/'], ['/happy2/docs/', '/welcome/']]
    for (const [pathname, markupPath] of servedAt) {
      const container = document.createElement('div')
      container.innerHTML = renderPath(markupPath)
      document.body.append(container)
      const servedHeading = container.querySelector('h1')
      const servedText = container.textContent
      window.history.replaceState({}, '', pathname)
      const recoverableErrors: unknown[] = []

      const root = hydrateRoot(container, <StrictMode><Router /></StrictMode>, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      })
      await act(async () => {})

      expect(recoverableErrors).toEqual([])
      expect(container.querySelector('h1')).toBe(servedHeading)
      expect(container.querySelectorAll('h1')).toHaveLength(1)
      expect(container.textContent).toBe(servedText)
      act(() => root.unmount())
      container.remove()
    }

    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
    restoreUserAgent()
    window.history.replaceState({}, '', '/')
  }, 30_000)

  it('hydrates the homepage on Linux, then swaps the Mac download for the Linux one', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    useUserAgent(LINUX)
    const container = document.createElement('div')
    container.innerHTML = renderPath('/')
    document.body.append(container)
    const servedHeading = container.querySelector('h1')
    expect(container.querySelector('.one-download-actions')?.getAttribute('data-platform')).toBe('desktop')
    window.history.replaceState({}, '', '/')
    const recoverableErrors: unknown[] = []

    const root = hydrateRoot(container, <StrictMode><Router /></StrictMode>, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    })
    await act(async () => {})

    expect(recoverableErrors).toEqual([])
    expect(consoleError).not.toHaveBeenCalled()
    expect(container.querySelector('h1')).toBe(servedHeading)
    expect([...container.querySelectorAll('.one-download-actions')].map((block) => block.getAttribute('data-platform'))).toEqual(['linux', 'linux'])
    expect(container.querySelector('.one-brew-command')).toBeNull()
    act(() => root.unmount())
    container.remove()
    consoleError.mockRestore()
    restoreUserAgent()
  })
})
