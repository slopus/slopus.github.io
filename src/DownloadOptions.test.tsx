import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { DownloadOptions } from './DownloadOptions'

const BREW = 'brew install --cask slopus/tap/happy'
const RELEASES = 'https://github.com/slopus/happy-desktop/releases/latest'

function device(userAgent: string, platform = '', maxTouchPoints = 0) {
  vi.stubGlobal('navigator', { userAgent, platform, maxTouchPoints })
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('hidden preview downloads', () => {
  it.each([0, 1])('never shows Homebrew on Windows in variant %i', variant => {
    device('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')
    const { container } = render(<DownloadOptions variant={variant} onCycle={vi.fn()} />)
    expect(container.querySelector('[data-platform="windows"]')).toBeTruthy()
    expect(screen.queryByText(BREW)).toBeNull()
    expect(screen.queryByRole('button', { name: /Homebrew/ })).toBeNull()
  })

  it.each([
    ['iPhone', 'iPhone', '', 5],
    ['Android', 'Linux; Android 15', '', 5],
    ['iPad desktop mode', 'Macintosh; Intel Mac OS X 10_15_7', 'MacIntel', 5],
  ])('keeps Homebrew and all desktop platforms visible on %s', (_name, ua, platform, touch) => {
    device(ua as string, platform as string, touch as number)
    const { container } = render(<DownloadOptions variant={0} onCycle={vi.fn()} />)
    expect(container.querySelector('[data-platform="desktop"]')).toBeTruthy()
    expect(screen.getByText(BREW)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Download Happy for macOS' })).toBeTruthy()
    for (const os of ['macOS', 'Windows', 'Linux']) expect(screen.getByText(os)).toBeTruthy()
  })

  it.each([['Macintosh', 'macOS'], ['X11; Linux x86_64', 'Linux']])('uses the right desktop badge for %s', (ua, label) => {
    device(ua)
    render(<DownloadOptions variant={0} onCycle={vi.fn()} />)
    expect(screen.getByRole('link', { name: `Download Happy for ${label}` }).getAttribute('href')).toBe(RELEASES)
    expect(Boolean(screen.queryByText(BREW))).toBe(label === 'macOS')
  })

  it('cycles only on background or group arrow keys, not links or selected command text', () => {
    device('Macintosh')
    const cycle = vi.fn()
    render(<DownloadOptions variant={0} onCycle={cycle} />)
    const group = screen.getByRole('group', { name: /Apple badge/ })
    fireEvent.click(group)
    fireEvent.keyDown(group, { key: 'ArrowLeft' })
    expect(cycle.mock.calls).toEqual([[1], [-1]])
    const link = screen.getByRole('link', { name: /Download Happy for/ })
    link.addEventListener('click', event => event.preventDefault(), { once: true })
    fireEvent.click(link)
    fireEvent.click(screen.getByText(BREW))
    expect(cycle).toHaveBeenCalledTimes(2)
  })

  it('copies the exact cask command without cycling', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { userAgent: 'iPhone', platform: '', maxTouchPoints: 5, clipboard: { writeText } })
    const cycle = vi.fn()
    render(<DownloadOptions variant={0} onCycle={cycle} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copy Homebrew command' }))
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Copied.'))
    expect(writeText).toHaveBeenCalledWith(BREW)
    expect(cycle).not.toHaveBeenCalled()
  })

  it('uses the homepage rating treatment with verified US store snapshots', () => {
    const { container } = render(<DownloadOptions variant={0} onCycle={vi.fn()} />)
    expect(container.querySelectorAll('.one-store-download .store-rating')).toHaveLength(2)
    expect(container.querySelectorAll('.store-stars[aria-hidden="true"]')).toHaveLength(2)
    expect(screen.getByLabelText('4.9 stars from 1,006 App Store ratings in the US')).toBeTruthy()
    expect(screen.getByLabelText('5.0 stars from 3,128 Google Play reviews in the US')).toBeTruthy()
    expect(screen.getByText('1,000+ ratings')).toBeTruthy()
    expect(screen.getByText('3.1k+ reviews')).toBeTruthy()
  })

  it('compares rainbow and white Apple artwork without adding a dropdown', () => {
    device('iPhone')
    const cycle = vi.fn()
    const { container, rerender } = render(<DownloadOptions variant={0} onCycle={cycle} />)
    expect(container.querySelector('.one-desktop-button img')?.getAttribute('src')).toBe('/img/happy-one/badges/macos-rainbow.svg')
    fireEvent.click(screen.getByRole('group', { name: /Apple badge/ }))
    expect(cycle).toHaveBeenCalledWith(1)
    rerender(<DownloadOptions variant={1} onCycle={cycle} />)
    expect(container.querySelector('.one-desktop-button img')?.getAttribute('src')).toBe('/img/happy-one/badges/macos.svg')
    expect(container.querySelector('[aria-expanded], .one-platform-popover')).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('keeps the Windows mark and direct download in both Apple variants', () => {
    device('Windows NT 10.0')
    const { container, rerender } = render(<DownloadOptions variant={0} onCycle={vi.fn()} />)
    expect(screen.getByRole('link', { name: 'Download Happy for Windows' }).getAttribute('href')).toBe(RELEASES)
    expect(container.querySelector('.one-desktop-button img')?.getAttribute('src')).toBe('/img/happy-one/badges/windows.svg')
    rerender(<DownloadOptions variant={1} onCycle={vi.fn()} />)
    expect(container.querySelector('.one-desktop-button img')?.getAttribute('src')).toBe('/img/happy-one/badges/windows.svg')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('uses the exact App Store Apple silhouette and Download lettering in both macOS badges', () => {
    const read = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8')
    const reference = read('src/StoreButtons.tsx').split('export function GooglePlayButton')[0]
    const paths = [...reference.matchAll(/d="([^"]+)"/g)].map(match => match[1]).filter(value => value.startsWith('M'))
    const foreground = paths[2]
    const apple = foreground.slice(0, foreground.indexOf('M84.135'))
    const download = foreground.slice(foreground.indexOf('M75.233'), foreground.indexOf('M157.581'))
    for (const file of ['macos', 'macos-rainbow']) {
      const svg = new DOMParser().parseFromString(read(`public/img/happy-one/badges/${file}.svg`), 'image/svg+xml')
      expect(svg.documentElement.getAttribute('viewBox')).toBe('-2 2 242 76')
      expect(svg.querySelector('[data-part="platform-icon"]')?.getAttribute('d')).toBe(apple)
      expect(svg.querySelector('[data-part="platform-icon"]')?.hasAttribute('transform')).toBe(false)
      expect(svg.querySelector('[data-part="download"]')?.getAttribute('d')).toBe(download)
    }
  })
})