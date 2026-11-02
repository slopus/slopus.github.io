import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const DOWNLOAD = 'https://github.com/slopus/happy-desktop/releases/download'

function githubRelease(tag: string, publishedAt: string, names: string[]) {
  return {
    tag_name: tag, draft: false, prerelease: tag.includes('-preview.'), published_at: publishedAt,
    assets: names.map(name => ({ name, browser_download_url: `${DOWNLOAD}/${tag}/${name}` })),
  }
}

const stableAssets = (version: string) => ['arm64.dmg', 'x64.dmg', 'x64.exe', 'x64.AppImage'].map(suffix => `Happy-${version}-${suffix}`)
const nightlyAssets = (version: string) => [`Happy-Nightly-${version}-arm64.dmg`, `Happy-Nightly-${version}-x64.dmg`]
const STABLE = githubRelease('v0.0.102', '2026-10-25T04:26:59Z', [...stableAssets('0.0.102'), ...nightlyAssets('0.0.102')])
const PREVIEW = githubRelease('v0.0.103-preview.17', '2026-11-02T02:17:26Z', nightlyAssets('0.0.103-preview.17'))

function github(list: unknown[]) {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => ({
    ok: true,
    json: async () => url.endsWith('/releases/latest') ? STABLE : list,
  })))
}

// Each test gets its own page lifetime, so its own GitHub lookups.
async function page(search = '') {
  window.history.replaceState({}, '', `/releases/${search}`)
  vi.resetModules()
  const { Router } = await import('./Router')
  return render(<Router pathname="/releases/" />)
}

beforeEach(() => {
  // jsdom has no ResizeObserver; the painted page scrollbar only observes with it.
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.stubGlobal('navigator', { userAgent: 'Macintosh', platform: 'MacIntel', maxTouchPoints: 0 })
  github([PREVIEW, STABLE])
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('releases page', () => {
  it('opens on Stable: the homepage downloads, the release, and GitHub last', async () => {
    const { container } = await page()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Download Happy.')
    const channels = screen.getByRole('group', { name: 'Release channel' })
    expect(within(channels).getAllByRole('radio').map(radio => radio.getAttribute('value'))).toEqual(['stable', 'preview'])
    expect(screen.getByRole('radio', { name: 'Stable' })).toHaveProperty('checked', true)
    await waitFor(() => expect(screen.getByText((_, element) => element?.className === 'releases-version' && element.textContent === 'Happy 0.0.102 · Oct 25, 2026')).toBeTruthy())
    expect(screen.getByRole('link', { name: 'Download Happy for macOS' }).getAttribute('href')).toBe(`${DOWNLOAD}/v0.0.102/Happy-0.0.102-arm64.dmg`)
    expect(screen.getByText('brew install --cask slopus/tap/happy')).toBeTruthy()
    for (const os of ['Windows', 'Linux']) expect(screen.getByRole('link', { name: `Download Happy for ${os}` })).toBeTruthy()
    expect(container.querySelector('.one-mobile-downloads')).toBeTruthy()
    // This page is All Releases, so it does not link to itself.
    expect(screen.queryByRole('link', { name: 'All Releases' })).toBeNull()
    const links = container.querySelectorAll('main a')
    expect(links[links.length - 1].getAttribute('href')).toBe('https://github.com/slopus/happy-desktop/releases')
    expect(links[links.length - 1].textContent).toBe('All releases on GitHub')
  })

  it('switches to the newest preview by publication date, and puts the choice in the address', async () => {
    // GitHub lists by creation: preview.16 can follow preview.17, and drafts are never offered.
    github([
      { ...githubRelease('v0.0.104-preview.1', '2026-11-03T00:00:00Z', nightlyAssets('0.0.104-preview.1')), draft: true },
      githubRelease('v0.0.103-preview.16', '2026-11-02T00:26:50Z', nightlyAssets('0.0.103-preview.16')),
      PREVIEW,
      STABLE,
    ])
    await page()
    fireEvent.click(screen.getByRole('radio', { name: 'Preview' }))
    expect(screen.getByRole('radio', { name: 'Preview' })).toHaveProperty('checked', true)
    expect(window.location.search).toBe('?channel=preview')
    await waitFor(() => expect(screen.getByText((_, element) => element?.className === 'releases-version' && element.textContent === 'Happy Nightly 0.0.103-preview.17 · Nov 2, 2026')).toBeTruthy())
    expect(screen.getByText(/Installs as Happy Nightly, beside Happy/)).toBeTruthy()
    fireEvent.change(screen.getByRole('combobox', { name: 'Mac architecture' }), { target: { value: 'x64' } })
    expect(screen.getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/v0.0.103-preview.17/Happy-Nightly-0.0.103-preview.17-x64.dmg`)
    expect(screen.queryByText('brew install --cask slopus/tap/happy')).toBeNull()

    fireEvent.click(screen.getByRole('radio', { name: 'Stable' }))
    expect(window.location.search).toBe('')
    await waitFor(() => expect(screen.getByRole('link', { name: 'Download Happy for macOS' }).getAttribute('href')).toBe(`${DOWNLOAD}/v0.0.102/Happy-0.0.102-x64.dmg`))
  })

  it('opens on Preview from ?channel=preview, and offers a stable release newer than every preview', async () => {
    github([STABLE, githubRelease('v0.0.102-preview.9', '2026-10-24T04:24:02Z', nightlyAssets('0.0.102-preview.9'))])
    await page('?channel=preview')
    expect(screen.getByRole('radio', { name: 'Preview' })).toHaveProperty('checked', true)
    await waitFor(() => expect(screen.getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/v0.0.102/Happy-Nightly-0.0.102-arm64.dmg`))
    expect(document.querySelector('.releases-version')?.textContent).toBe('Happy Nightly 0.0.102 · Oct 25, 2026')
  })

  it('points Preview at GitHub when GitHub does not answer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await page('?channel=preview')
    await waitFor(() => expect(screen.getByText('The newest preview is listed on GitHub, below.')).toBeTruthy())
    expect(screen.getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href')).toBe('https://github.com/slopus/happy-desktop/releases')
  })

  it('prerenders the Stable page with one h1, under its own title', async () => {
    vi.resetModules()
    const { renderPath, metadataForPath } = await import('./prerender')
    const html = renderPath('/releases/')
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html).toMatch(/<input type="radio" name="release-channel" checked="" value="stable"\/>/)
    expect(html).toContain('href="https://github.com/slopus/happy-desktop/releases"')
    const metadata = metadataForPath('/releases')
    expect(metadata.canonicalPath).toBe('/releases/')
    expect(metadata.title).toBe('Download Happy: Stable and Preview Releases')
    expect(metadata.description.length).toBeLessThanOrEqual(160)
    await act(async () => {})
  })
})
