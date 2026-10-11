import { describe, expect, it } from 'vitest'
import { clickEvent } from './analytics'
import { APP_STORE_LINK, GOOGLE_PLAY_LINK } from './StoreButtons'

function link(href: string | null, data: Record<string, string> = {}) {
  const element = document.createElement('a')
  if (href) element.href = href
  Object.assign(element.dataset, data)
  return element
}

describe('analytics click events', () => {
  it('names downloads by platform and Mac chip, before and after the release lookup', () => {
    expect(clickEvent(link(null, { downloadPlatform: 'macos', downloadArch: 'arm64' })))
      .toEqual(['download_click', { platform: 'macos', arch: 'arm64' }])
    expect(clickEvent(link('https://github.com/slopus/happy-desktop/releases/download/v0.0.90/Happy-0.0.90-x64.exe', { downloadPlatform: 'windows', downloadArch: 'x64' })))
      .toEqual(['download_click', { platform: 'windows', arch: 'x64' }])
    expect(clickEvent(link('https://github.com/slopus/happy-desktop/releases/latest')))
      .toEqual(['download_click', { platform: 'all' }])
  })

  it('names the store and GitHub links', () => {
    expect(clickEvent(link(APP_STORE_LINK))).toEqual(['store_click', { store: 'ios' }])
    expect(clickEvent(link(GOOGLE_PLAY_LINK))).toEqual(['store_click', { store: 'android' }])
    expect(clickEvent(link('https://github.com/slopus/happy'))).toEqual(['github_click', { repository: 'slopus/happy' }])
    expect(clickEvent(link('/welcome/'))).toBeNull()
  })
})
