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
  it.each([0, 1, 2])('never shows Homebrew on Windows in variant %i', variant => {
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
  ])('keeps Homebrew and generic desktop availability on %s', (_name, ua, platform, touch) => {
    device(ua as string, platform as string, touch as number)
    const { container } = render(<DownloadOptions variant={0} onCycle={vi.fn()} />)
    expect(container.querySelector('[data-platform="desktop"]')).toBeTruthy()
    expect(screen.getByText(BREW)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Download Happy for Desktop' })).toBeTruthy()
    for (const os of ['macOS', 'Windows', 'Linux']) expect(screen.getByText(os)).toBeTruthy()
  })

  it.each([['Macintosh', 'macOS'], ['X11; Linux x86_64', 'Linux']])('uses the right desktop badge for %s', (ua, label) => {
    device(ua)
    render(<DownloadOptions variant={0} onCycle={vi.fn()} />)
    expect(screen.getByRole('link', { name: `Download Happy for ${label}` }).getAttribute('href')).toBe(RELEASES)
    expect(screen.getByText(BREW)).toBeTruthy()
  })

  it('cycles only on background or group arrow keys, not links or selected command text', () => {
    const cycle = vi.fn()
    render(<DownloadOptions variant={0} onCycle={cycle} />)
    const group = screen.getByRole('group', { name: /Preview layout/ })
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

  it('opens the phone desktop chooser, then closes on Escape and restores focus', () => {
    device('iPhone')
    const cycle = vi.fn()
    render(<DownloadOptions variant={1} onCycle={cycle} />)
    const trigger = screen.getByRole('button', { name: 'Choose a desktop platform' })
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'Download for macOS' })).toBe(document.activeElement)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('group', { name: 'Choose a desktop download' })).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(cycle).not.toHaveBeenCalled()
  })

  it('keeps the direct detected-platform link beside its chooser on desktop', () => {
    device('Windows NT 10.0')
    render(<DownloadOptions variant={1} onCycle={vi.fn()} />)
    expect(screen.getByRole('link', { name: 'Download Happy for Windows' }).getAttribute('href')).toBe(RELEASES)
    fireEvent.click(screen.getByRole('button', { name: 'More desktop downloads' }))
    expect(screen.getByRole('group', { name: 'Choose a desktop download' })).toBeTruthy()
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('group', { name: 'Choose a desktop download' })).toBeNull()
  })

  it('offers all three desktop platforms directly in the explicit variant', () => {
    render(<DownloadOptions variant={2} onCycle={vi.fn()} />)
    for (const os of ['macOS', 'Windows', 'Linux']) {
      expect(screen.getByRole('link', { name: `Download Happy for ${os}` }).getAttribute('href')).toBe(RELEASES)
    }
    expect(screen.queryByRole('button', { name: 'More desktop downloads' })).toBeNull()
  })
})