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

function selectChannel(name: 'Stable' | 'Preview') {
  fireEvent.click(screen.getByRole('radio', { name }))
  return screen.getByRole('region', { name })
}

// The version line, without its Release notes link.
const version = (column: HTMLElement) => column.querySelector('.releases-version')?.textContent?.replace(/Release notes$/, '')

beforeEach(() => {
  // jsdom has no ResizeObserver; the painted page scrollbar only observes with it.
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  // The corner's gradient reads reduced motion; without WebGL it never draws.
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} }))
  vi.stubGlobal('navigator', { userAgent: 'Macintosh', platform: 'MacIntel', maxTouchPoints: 0 })
  github([PREVIEW, STABLE])
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('releases page', () => {
  it('defaults to Stable, switches the visible panel, and shares the phone apps and GitHub link', async () => {
    const { container } = await page()
    expect(container.firstElementChild!.classList.contains('site-theme')).toBe(true)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Download Happy')
    expect(screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent)).toEqual(['Phone app'])
    expect(screen.getByRole('radiogroup', { name: 'Release channel' })).toBeTruthy()
    expect((screen.getByRole('radio', { name: 'Stable' }) as HTMLInputElement).checked).toBe(true)
    expect(screen.queryByRole('region', { name: 'Preview' })).toBeNull()
    expect(container.querySelector('#releases-panel-preview')?.hasAttribute('inert')).toBe(true)
    const stable = screen.getByRole('region', { name: 'Stable' })

    await waitFor(() => expect(version(stable)).toBe('Happy 0.0.102 · Oct 25, 2026'))
    expect(within(stable).getByRole('link', { name: 'Release notes' }).getAttribute('href')).toBe('https://github.com/slopus/happy-desktop/releases/tag/v0.0.102')
    expect(within(stable).getByRole('link', { name: 'Download Happy for macOS' }).getAttribute('href')).toBe(`${DOWNLOAD}/v0.0.102/Happy-0.0.102-arm64.dmg`)
    expect(within(stable).getByText('brew install --cask slopus/tap/happy')).toBeTruthy()
    for (const os of ['Windows', 'Linux']) expect(within(stable).getByRole('link', { name: `Download Happy for ${os}` })).toBeTruthy()

    const preview = selectChannel('Preview')
    expect(screen.queryByRole('region', { name: 'Stable' })).toBeNull()
    expect(stable.hasAttribute('inert')).toBe(true)
    expect(preview.hasAttribute('inert')).toBe(false)
    await waitFor(() => expect(version(preview)).toBe('Happy Nightly 0.0.103-preview.17 · Nov 2, 2026'))
    expect(within(preview).getByRole('link', { name: 'Release notes' }).getAttribute('href')).toBe('https://github.com/slopus/happy-desktop/releases/tag/v0.0.103-preview.17')
    expect(within(preview).getByText('Help us test Happy by installing a preview build. Happy Nightly installs beside Happy.')).toBeTruthy()
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
    const preview = selectChannel('Preview')
    await waitFor(() => expect(version(preview)).toBe('Happy Nightly 0.0.103-preview.17 · Nov 2, 2026'))
    fireEvent.change(within(preview).getByRole('combobox', { name: 'Preview Mac architecture' }), { target: { value: 'x64' } })
    expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/v0.0.103-preview.17/Happy-Nightly-0.0.103-preview.17-x64.dmg`)
    const stable = selectChannel('Stable')
    await waitFor(() => expect(within(stable).getByRole('link', { name: 'Download Happy for macOS' }).getAttribute('href')).toBe(`${DOWNLOAD}/v0.0.102/Happy-0.0.102-x64.dmg`))
  })

  it('offers a stable release newer than every preview as the Preview download', async () => {
    github([STABLE, githubRelease('v0.0.102-preview.9', '2026-10-24T04:24:02Z', nightlyAssets('0.0.102-preview.9'))])
    await page()
    const preview = selectChannel('Preview')
    await waitFor(() => expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/v0.0.102/Happy-Nightly-0.0.102-arm64.dmg`))
    expect(version(preview)).toBe('Happy Nightly 0.0.102 · Oct 25, 2026')
  })

  it('adds Windows to Preview, for Happy Nightly and the preview\'s own Happy, once the preview ships installers', async () => {
    const tag = 'v0.0.103-preview.18'
    // preview.18 as GitHub lists it: both apps for macOS and Windows, with their update manifests.
    const assets = ['Happy', 'Happy-Nightly'].flatMap(app => ['arm64.dmg', 'arm64.dmg.blockmap', 'arm64.zip', 'x64.dmg', 'x64.zip', 'x64.exe', 'x64.exe.blockmap']
      .map(suffix => `${app}-0.0.103-preview.18-${suffix}`))
    github([githubRelease(tag, '2026-11-04T04:49:39Z', [...assets, 'latest-mac.yml', 'latest.yml', 'nightly-mac.yml', 'nightly.yml']), PREVIEW, STABLE])
    await page()
    const preview = selectChannel('Preview')
    await waitFor(() => expect(version(preview)).toBe('Happy Nightly 0.0.103-preview.18 · Nov 4, 2026'))
    const href = (name: string) => within(preview).getByRole('link', { name }).getAttribute('href')
    expect(href('Download Happy Nightly for macOS')).toBe(`${DOWNLOAD}/${tag}/Happy-Nightly-0.0.103-preview.18-arm64.dmg`)
    expect(href('Download Happy Nightly for Windows')).toBe(`${DOWNLOAD}/${tag}/Happy-Nightly-0.0.103-preview.18-x64.exe`)
    expect(href('Download the Happy preview for macOS')).toBe(`${DOWNLOAD}/${tag}/Happy-0.0.103-preview.18-arm64.dmg`)
    expect(href('Download the Happy preview for Windows')).toBe(`${DOWNLOAD}/${tag}/Happy-0.0.103-preview.18-x64.exe`)
    // Previews build no Linux yet; Stable keeps its own.
    expect(within(preview).queryByRole('link', { name: /Linux/ })).toBeNull()
    expect(within(selectChannel('Stable')).getByRole('link', { name: 'Download Happy for Linux' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/v0.0.102/Happy-0.0.102-x64.AppImage`)
  })

  it('adds Linux to Preview once a preview ships an AppImage', async () => {
    const tag = 'v0.0.104-preview.1'
    const assets = ['Happy', 'Happy-Nightly'].flatMap(app => ['arm64.dmg', 'x64.dmg', 'x64.exe'].map(suffix => `${app}-0.0.104-preview.1-${suffix}`))
    github([githubRelease(tag, '2026-11-05T00:00:00Z', [...assets, 'Happy-0.0.104-preview.1-x64.AppImage', 'Happy-0.0.104-preview.1-arm64.AppImage']), PREVIEW, STABLE])
    await page()
    const preview = selectChannel('Preview')
    await waitFor(() => expect(within(preview).getByRole('link', { name: 'Download the Happy preview for Linux' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/${tag}/Happy-0.0.104-preview.1-x64.AppImage`))
    // Happy Nightly gets Linux only with an AppImage of its own.
    expect(within(preview).queryByRole('link', { name: 'Download Happy Nightly for Linux' })).toBeNull()
  })

  it('offers no second Happy beside a stable release offered as the Preview download', async () => {
    github([STABLE])
    await page()
    const preview = selectChannel('Preview')
    await waitFor(() => expect(version(preview)).toBe('Happy Nightly 0.0.102 · Oct 25, 2026'))
    expect(within(preview).queryByRole('link', { name: /the Happy preview/ })).toBeNull()
  })

  it('offers preview.20 independently for each asset, falling back only for Intel Nightly', async () => {
    const newest = 'v0.0.103-preview.20'
    const older = 'v0.0.103-preview.19'
    const assets = [...stableAssets(newest.slice(1)), 'Happy-0.0.103-preview.20-arm64.AppImage',
      'Happy-Nightly-0.0.103-preview.20-arm64.dmg', 'Happy-Nightly-0.0.103-preview.20-x64.exe',
      'latest-mac.yml', 'latest.yml', 'nightly.yml']
    github([
      githubRelease(older, '2026-11-04T12:00:00Z', [...stableAssets(older.slice(1)), ...nightlyAssets(older.slice(1))]),
      githubRelease(newest, '2026-11-04T22:29:14Z', assets),
      STABLE,
    ])
    await page()
    const preview = selectChannel('Preview')
    const href = (name: string) => within(preview).getByRole('link', { name }).getAttribute('href')
    await waitFor(() => expect(version(preview)).toBe('Happy Nightly 0.0.103-preview.20 · Nov 4, 2026'))
    expect(href('Download Happy Nightly for macOS')).toBe(`${DOWNLOAD}/${newest}/Happy-Nightly-${newest.slice(1)}-arm64.dmg`)
    expect(href('Download Happy Nightly for Windows')).toBe(`${DOWNLOAD}/${newest}/Happy-Nightly-${newest.slice(1)}-x64.exe`)
    for (const [platform, suffix] of [['macOS', 'arm64.dmg'], ['Windows', 'x64.exe'], ['Linux', 'x64.AppImage']]) {
      expect(href(`Download the Happy preview for ${platform}`)).toBe(`${DOWNLOAD}/${newest}/Happy-${newest.slice(1)}-${suffix}`)
    }
    expect(within(preview).queryByRole('link', { name: 'Download Happy Nightly for Linux' })).toBeNull()
    fireEvent.change(within(preview).getByRole('combobox', { name: 'Preview Mac architecture' }), { target: { value: 'x64' } })
    expect(href('Download Happy Nightly for macOS')).toBe(`${DOWNLOAD}/${older}/Happy-Nightly-${older.slice(1)}-x64.dmg`)
    expect(href('Download the Happy preview for macOS')).toBe(`${DOWNLOAD}/${newest}/Happy-${newest.slice(1)}-x64.dmg`)
  })

  it('hides an unavailable Mac architecture and restores available links when switching back', async () => {
    const tag = 'v0.0.103-preview.20'
    github([githubRelease(tag, '2026-11-04T22:29:14Z', [
      'Happy-Nightly-0.0.103-preview.20-arm64.dmg', 'Happy-Nightly-0.0.103-preview.20-x64.exe',
      'Happy-0.0.103-preview.20-x64.AppImage',
    ])])
    await page()
    const preview = selectChannel('Preview')
    await waitFor(() => expect(version(preview)).toContain('0.0.103-preview.20'))
    fireEvent.change(within(preview).getByRole('combobox', { name: 'Preview Mac architecture' }), { target: { value: 'x64' } })
    expect(within(preview).queryByRole('link', { name: /for macOS/ })).toBeNull()
    expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for Windows' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/${tag}/Happy-Nightly-0.0.103-preview.20-x64.exe`)
    expect(within(preview).getByRole('link', { name: 'Download the Happy preview for Linux' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/${tag}/Happy-0.0.103-preview.20-x64.AppImage`)
    fireEvent.change(within(preview).getByRole('combobox', { name: 'Preview Mac architecture' }), { target: { value: 'arm64' } })
    expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/${tag}/Happy-Nightly-0.0.103-preview.20-arm64.dmg`)
  })

  it('offers a Windows-only preview without requiring any Nightly Mac build', async () => {
    const tag = 'v0.0.103-preview.20'
    github([githubRelease(tag, '2026-11-04T22:29:14Z', ['Happy-0.0.103-preview.20-x64.exe'])])
    await page()
    const preview = selectChannel('Preview')
    await waitFor(() => expect(within(preview).getByRole('link', { name: 'Download the Happy preview for Windows' }).getAttribute('href'))
      .toBe(`${DOWNLOAD}/${tag}/Happy-0.0.103-preview.20-x64.exe`))
    expect(within(preview).queryByRole('link', { name: /Happy Nightly/ })).toBeNull()
    expect(within(preview).queryByRole('link', { name: /macOS|Linux/ })).toBeNull()
  })

  it.each([
    ['Macintosh', 'MacIntel', 0, 'macos', 'Happy Nightly', 'arm64.dmg'],
    ['Windows NT 10.0', 'Win32', 0, 'windows', 'Happy Nightly', 'x64.exe'],
    ['X11; Linux x86_64', 'Linux x86_64', 0, 'linux', 'the Happy preview', 'x64.AppImage'],
    ['Android; Linux', 'Linux armv8l', 5, 'macos', 'Happy Nightly', 'arm64.dmg'],
    ['Macintosh', 'MacIntel', 5, 'macos', 'Happy Nightly', 'arm64.dmg'],
  ])('uses the same platform prediction for both channels on %s (%s, %s touch points)', async (userAgent, platform, maxTouchPoints, primary, app, suffix) => {
    vi.stubGlobal('navigator', { userAgent, platform, maxTouchPoints })
    const tag = 'v0.0.103-preview.20'
    github([githubRelease(tag, '2026-11-04T22:29:14Z', [
      ...stableAssets(tag.slice(1)), ...nightlyAssets(tag.slice(1)), `Happy-Nightly-${tag.slice(1)}-x64.exe`,
    ]), STABLE])
    await page()
    const stable = screen.getByRole('region', { name: 'Stable' })
    await waitFor(() => expect(stable.querySelector('.one-download-actions')?.getAttribute('data-primary-platform')).toBe(primary))
    const preview = selectChannel('Preview')
    const prefix = app === 'the Happy preview' ? 'Happy' : 'Happy-Nightly'
    await waitFor(() => expect(preview.querySelector('.one-desktop-button')?.getAttribute('href')).toBe(`${DOWNLOAD}/${tag}/${prefix}-${tag.slice(1)}-${suffix}`))
    expect(preview.querySelector('.one-download-actions')?.getAttribute('data-primary-platform')).toBe(primary)
    expect(preview.querySelector('.one-desktop-button')?.getAttribute('aria-label')).toBe(`Download ${app} for ${{ macos: 'macOS', windows: 'Windows', linux: 'Linux' }[primary]}`)
    if (primary === 'linux') {
      expect(within(preview).getByText("Happy's own preview build, which replaces Happy:")).toBeTruthy()
      expect(within(preview).getByText('Or Happy Nightly, which installs beside Happy:')).toBeTruthy()
      expect(preview.querySelector('.one-preview-standard .one-desktop-button')).toBeNull()
    }
  })

  it('uses the own preview as the main Windows download when only Nightly for Mac exists', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Windows NT 10.0', platform: 'Win32', maxTouchPoints: 0 })
    const tag = 'v0.0.103-preview.20'
    github([githubRelease(tag, '2026-11-04T22:29:14Z', [...nightlyAssets(tag.slice(1)), `Happy-${tag.slice(1)}-x64.exe`])])
    await page()
    const preview = selectChannel('Preview')
    await waitFor(() => expect(preview.querySelector('.one-desktop-button')?.getAttribute('href')).toBe(`${DOWNLOAD}/${tag}/Happy-${tag.slice(1)}-x64.exe`))
    expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for macOS' })).toBeTruthy()
  })

  it('points Preview at GitHub when GitHub does not answer, and Stable at its verified release', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    await page()
    const preview = selectChannel('Preview')
    await waitFor(() => expect(version(preview)).toBe('The newest preview is listed on GitHub, below.'))
    expect(within(preview).getByRole('link', { name: 'Download Happy Nightly for macOS' }).getAttribute('href')).toBe('https://github.com/slopus/happy-desktop/releases')
    await waitFor(() => expect(version(selectChannel('Stable'))).toBe('Happy 0.0.90'))
  })

  it('prerenders both reserved panels with Stable selected and one h1, under its own title', async () => {
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
