import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { Router } from './Router'
import { getLegalSource } from './documents'
import {
  memesPluginMetadata,
  pluginPrivacyMetadata,
  pluginsMetadata,
  pluginTermsMetadata,
} from './siteMetadata'

const projectRoot = path.resolve(__dirname, '..')
const pluginMetadata = [pluginsMetadata, memesPluginMetadata, pluginPrivacyMetadata, pluginTermsMetadata]

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
    expect(screen.getByText(/codex plugin marketplace add slopus\/happy-meme-plugin/)).toBeTruthy()
    expect(screen.getByText(/ChatGPT plugin directory soon/)).toBeTruthy()
    expect(screen.getAllByText(/not made, sponsored, or endorsed by OpenAI/)).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Lisa Wischofsky' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'CC BY 4.0' }).getAttribute('href')).toBe('https://creativecommons.org/licenses/by/4.0/')
    expect(screen.getByRole('link', { name: 'Plugin Terms of Use' }).getAttribute('href')).toBe('/plugins/terms/')
    expect(screen.getByRole('link', { name: 'Plugin Privacy Policy' }).getAttribute('href')).toBe('/plugins/privacy/')
  })

  it('shows six example memes with alt text, each shipped in public/', () => {
    render(<Router pathname="/plugins/memes/" />)

    const examples = within(screen.getByRole('region', { name: 'Made with Happy Memes' })).getAllByRole('img')
    expect(examples).toHaveLength(6)

    for (const image of examples) {
      expect(image.getAttribute('alt')?.length).toBeGreaterThan(40)
      expect(existsSync(path.join(projectRoot, 'public', image.getAttribute('src')!))).toBe(true)
    }
    expect(existsSync(path.join(projectRoot, 'public/img/plugins/memes/logo.png'))).toBe(true)
  })

  it('lists Happy Memes on the plugins index', () => {
    render(<Router pathname="/plugins" />)

    expect(screen.getByRole('heading', { level: 1, name: 'Happy plugins' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /happy memes/i }).getAttribute('href')).toBe('/plugins/memes/')
  })

  it('renders the plugin privacy policy and terms apart from the app policies', () => {
    const { rerender } = render(<Router pathname="/plugins/privacy/" />)
    expect(screen.getByRole('heading', { level: 1, name: /^plugin privacy policy/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /back to plugins/i }).getAttribute('href')).toBe('/plugins/')
    expect(screen.getByRole('link', { name: 'OpenAI Privacy Policy' })).toBeTruthy()

    rerender(<Router pathname="/plugins/terms/" />)
    expect(screen.getByRole('heading', { level: 1, name: /^plugin terms of use/i })).toBeTruthy()

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
})
