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
async function page() {
  window.history.replaceState({}, '', '/releases/')
  vi.resetModules()
  const { Router } = await import('./Router')
  return render(<Router pathname="/releases/" />)
}

const version = (column: HTMLElement) => column.querySelector('.releases-version')?.textContent

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
  it('shows Stable and Preview side by side, the phone apps once below them, and GitHub last', async () => {
    const { container } = await page()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Download Happy.')
    expect(screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent)).toEqual(['Stable', 'Preview', 'Phone app'])
    const stable = screen.getByRole('region', { name: 'Stable' })
    const preview = screen.getByRole('region', { name: 'Preview' })

    await waitFor(() => expect(version(stable)).toBe('Happy 0.0.102 · Oct 25, 2026'))
    expect(within(stable).getByRole('link', { name: 'Download Happy for macOS' }).getAttribute('href')).toBe(`${DOWNLOAD}/v0.0.102/Happy-0.0.102-arm64.dmg`)
    expect(within(stable).getByText('brew install --cask slopus/tap/happy')).toBeTruthy()
    for (const os of ['Windows', 'Linux']) expect(within(stable).getByRole('link', { name: `Download Happy for ${os}` })).toBeTruthy()

    await waitFor(() => expect(version(preview)).toBe('Happy Nightly 0.0.103-preview.17 · Nov 2, 2026'))
    expect(within(preview).getByText('Help us test Happy on macOS by installing the preview build.')).toBeTruthy()
    expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/v0.0.103-preview.17/Happy-Nightly-0.0.103-preview.17-arm64.dmg`)
    expect(within(preview).queryByText('brew install --cask slopus/tap/happy')).toBeNull()
    expect(within(preview).queryByRole('link', { name: /Windows|Linux/ })).toBeNull()

    // The stores are shared: one App Store and one Google Play badge, in their own section.
    expect(container.querySelectorAll('.one-mobile-downloads')).toHaveLength(1)
    expect(within(screen.getByRole('region', { name: 'Phone app' })).getByRole('link', { name: 'Download Happy on the App Store' })).toBeTruthy()
    // This page is All Releases, so it does not link to itself.
    expect(screen.queryByRole('link', { name: 'All Releases' })).toBeNull()
    const links = container.querySelectorAll('main a')
    expect(links[links.length - 1].getAttribute('href')).toBe('https://github.com/slopus/happy-desktop/releases')
    expect(links[links.length - 1].textContent).toBe('All releases on GitHub')
  })

  it('offers the newest preview by publication date and one architecture choice for both Macs', async () => {
    // GitHub lists by creation: preview.16 can follow preview.17, and drafts are never offered.
    github([
      { ...githubRelease('v0.0.104-preview.1', '2026-11-03T00:00:00Z', nightlyAssets('0.0.104-preview.1')), draft: true },
      githubRelease('v0.0.103-preview.16', '2026-11-02T00:26:50Z', nightlyAssets('0.0.103-preview.16')),
      PREVIEW,
      STABLE,
    ])
    await page()
    const stable = screen.getByRole('region', { name: 'Stable' })
    const preview = screen.getByRole('region', { name: 'Preview' })
    await waitFor(() => expect(version(preview)).toBe('Happy Nightly 0.0.103-preview.17 · Nov 2, 2026'))
    fireEvent.change(within(preview).getByRole('combobox', { name: 'Preview Mac architecture' }), { target: { value: 'x64' } })
    expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/v0.0.103-preview.17/Happy-Nightly-0.0.103-preview.17-x64.dmg`)
    await waitFor(() => expect(within(stable).getByRole('link', { name: 'Download Happy for macOS' }).getAttribute('href')).toBe(`${DOWNLOAD}/v0.0.102/Happy-0.0.102-x64.dmg`))
  })

  it('offers a stable release newer than every preview as the Preview download', async () => {
    github([STABLE, githubRelease('v0.0.102-preview.9', '2026-10-24T04:24:02Z', nightlyAssets('0.0.102-preview.9'))])
    await page()
    const preview = screen.getByRole('region', { name: 'Preview' })
    await waitFor(() => expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/v0.0.102/Happy-Nightly-0.0.102-arm64.dmg`))
    expect(version(preview)).toBe('Happy Nightly 0.0.102 · Oct 25, 2026')
  })

  it('points Preview at GitHub when GitHub does not answer, and Stable at its verified release', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await page()
    const preview = screen.getByRole('region', { name: 'Preview' })
    await waitFor(() => expect(version(preview)).toBe('The newest preview is listed on GitHub, below.'))
    expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href')).toBe('https://github.com/slopus/happy-desktop/releases')
    await waitFor(() => expect(version(screen.getByRole('region', { name: 'Stable' }))).toBe('Happy 0.0.90'))
  })

  it('prerenders both columns with one h1, under its own title', async () => {
    vi.resetModules()
    const { renderPath, metadataForPath } = await import('./prerender')
    const html = renderPath('/releases/')
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
    expect(html).toContain('aria-label="Download Happy for macOS"')
    expect(html).toContain('aria-label="Download Happy Nightly for macOS"')
    expect(html).toContain('href="https://github.com/slopus/happy-desktop/releases"')
    const metadata = metadataForPath('/releases')
    expect(metadata.canonicalPath).toBe('/releases/')
    expect(metadata.title).toBe('Download Happy: Stable and Preview Releases')
    expect(metadata.description.length).toBeLessThanOrEqual(160)
    await act(async () => {})
  })
})
