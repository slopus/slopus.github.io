import { cleanup, render, screen, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import {
  documents,
  documentsForProduct,
  getDocument,
  getDocumentSource,
  getThesisMarkdown,
  prepareMarkdown,
} from './documents'
import { prerenderedPaths, renderPath } from './prerender'
import { thesisMetadata } from './siteMetadata'

// jsdom has no ResizeObserver; the painted page scrollbar only observes with it.
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
})

afterAll(() => {
  vi.unstubAllGlobals()
})

describe('static document pages', () => {
  afterEach(() => {
    cleanup()
  })

  it('makes every copied documentation source renderable', () => {
    expect(documentsForProduct('happy')).toHaveLength(18)
    expect(documentsForProduct('desktop')).toHaveLength(16)

    for (const document of documents) {
      const markdown = prepareMarkdown(getDocumentSource(document))
      expect(markdown).toMatch(/^# /)
      expect(markdown).not.toMatch(/<(?:Card|Steps|Image)\b/)
      expect(markdown).not.toMatch(/Documentation for this feature is coming soon/)
    }
  })

  it('renders a documentation route with navigation', () => {
    render(<Router pathname="/docs/quick-start/" />)

    expect(screen.getByRole('heading', { level: 1, name: /quick start guide/i })).toBeTruthy()
    expect(screen.getAllByRole('navigation', { name: 'Documentation navigation' })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: /self-hosting/i }).length).toBeGreaterThan(0)
  })

  it('renders Happy Desktop documentation under its own path', () => {
    render(<Router pathname="/how-it-works/" />)

    expect(screen.getByRole('heading', { level: 1, name: /how it works/i })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Permissions & Sandbox' }).length).toBeGreaterThan(0)
  })

  it('keeps Happy and Happy Desktop documentation separate', () => {
    const { unmount } = render(<Router pathname="/welcome/" />)

    expect(screen.queryByRole('link', { name: 'Voice Coding' })).toBeNull()
    unmount()

    render(<Router pathname="/docs/" />)
    expect(screen.queryByRole('link', { name: 'Happy Desktop vs Buzz' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Vision' })).toBeNull()
  })

  it('opens every original Happy CLI docs page with the maintenance notice, and no desktop page', () => {
    const { unmount } = render(<Router pathname="/docs/quick-start/" />)
    const notice = screen.getByRole('complementary', { name: /maintenance mode/i })

    expect(notice.textContent).toMatch(/^Happy is now a desktop app\. The original Happy CLI \(happy on npm, formerly happy-coder\) is in maintenance mode/)
    expect(screen.getByRole('link', { name: 'Happy desktop app' }).getAttribute('href')).toBe('/')
    unmount()

    render(<Router pathname="/quick-start/" />)
    expect(screen.queryByRole('complementary', { name: /maintenance mode/i })).toBeNull()
  })

  it('does not claim automatic account routing is missing', () => {
    for (const document of documentsForProduct('desktop')) {
      expect(getDocumentSource(document)).not.toMatch(/routing[^.]*not (yet )?implemented|automatic routing across/i)
    }
  })

  it('serves the desktop docs as top-level pages whose slugs no other route owns', () => {
    const fixedRoutes = ['', 'docs', 'blog', 'plugins', 'privacy', 'terms', 'tos', 'model-benchmarks', 'desktop', 'happy2', 'tmp', 'assets', 'img', 'og', 'notes']
    for (const document of documentsForProduct('desktop')) {
      expect(document.path).not.toBe('')
      expect(fixedRoutes).not.toContain(document.path.split('/')[0])
    }
    expect(renderPath('/welcome/')).toMatch(/<h1[^>]*>Welcome/)
    expect(renderPath('/welcome/')).toMatch(/<a href="\/welcome\/" aria-current="page">Docs<\/a>/)
    expect(renderPath('/chief-of-staff/')).toMatch(/<h1[^>]*>Chief of Staff/)
    expect(renderPath('/welcome/')).toContain('href="/quick-start/"')
  })

  it('keeps the announced Buzz comparison URL working', () => {
    render(<Router pathname="/docs/comparisons/happy-2-vs-buzz" />)

    expect(screen.getByRole('heading', { level: 1, name: /happy desktop vs buzz/i })).toBeTruthy()
  })

  it('leaves the Buzz comparison out of navigation and the reading order', () => {
    const { unmount } = render(<Router pathname="/comparisons/buzz/" />)

    expect(screen.getByRole('heading', { level: 1, name: /happy desktop vs buzz/i })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Happy Desktop vs Buzz' })).toBeNull()
    expect(screen.queryByText('Comparisons', { selector: 'h2' })).toBeNull()
    expect(screen.queryByRole('link', { name: /^previous/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /^next/i })).toBeNull()
    unmount()

    render(<Router pathname="/guides/remote-agents/" />)
    expect(screen.queryByRole('link', { name: /^next/i })).toBeNull()
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/configuration/i)
  })

  it('renders the Vision essay with its title as the only h1 and every section as an h2', () => {
    const { container } = render(<Router pathname="/thesis/" />)

    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.id)).toEqual(['vision'])
    const sections = [...container.querySelectorAll('.document-content h2')].map((heading) => heading.firstChild?.textContent)
    expect(sections).toEqual([
      'One core agent',
      'Chat left the chat',
      'Fiddle less, understand more',
      'Phone first',
      'One harness',
      'Multiplayer is very hard',
      'Make people happy',
    ])
    // The bullets up top are the sections, one for one, in the same order.
    const bullets = [...container.querySelectorAll('.document-content > ul > li > strong')].map((bold) => bold.textContent?.replace(/\.$/, ''))
    expect(bullets).toEqual(sections)
    expect(container.querySelector('.document-content h3')).toBeNull()
    // One bold line in the whole body: the first section's.
    const boldLines = [...container.querySelectorAll('.document-content > p > strong')].map((bold) => bold.textContent)
    expect(boldLines).toEqual(["You'll run lots of agents. Only one of them should talk back to you."])
  })

  it('spans the layout diagram across the column and sets the screenshots beside their paragraphs', () => {
    const { container } = render(<Router pathname="/thesis/" />)
    const [screenshot, diagram, picker, ...rest] = [...container.querySelectorAll('figure.essay-figure')]

    expect(rest).toHaveLength(0)
    expect(picker.className).toBe('essay-figure essay-figure-right')
    expect(picker.querySelector('img')?.getAttribute('src')).toBe('/thesis/model-picker.png')
    expect(picker.querySelector('figcaption')?.textContent).toBe('Codex, Claude and Grok in one picker')
    expect(picker.nextElementSibling?.textContent).toMatch(/^That's what lets you run Claude, GPT and Grok/)
    // The pig sits inside the last bullet, so no other bullet moves.
    const pig = container.querySelector('img.essay-pig')
    expect(pig?.closest('li')?.textContent).toMatch(/^Make people happy\./)
    expect(pig?.closest('figure')).toBeNull()
    expect(screenshot.className).toBe('essay-figure essay-figure-left')
    expect(screenshot.querySelector('img')?.getAttribute('src')).toBe('/thesis/sidebar.png')
    expect(screenshot.querySelector('img')?.getAttribute('alt')).toBe('A fragment of our sidebar today')
    expect(screenshot.parentElement?.tagName).not.toBe('P')
    expect(screenshot.querySelector('figcaption')?.textContent).toBe('A fragment of our sidebar today')
    // Right after the section's bold line, so the whole first paragraph wraps around it.
    expect(screenshot.previousElementSibling?.querySelector('strong')).not.toBeNull()
    expect(screenshot.nextElementSibling?.textContent).toMatch(/^Ten sessions means ten sources of pings/)

    expect(diagram.className).toBe('essay-figure')
    expect(diagram.querySelector('img')?.getAttribute('src')).toBe('/thesis/layout.svg')
    expect(diagram.previousElementSibling?.textContent).toMatch(/Reminds you of Arc a bit, right\?$/)
    for (const figure of [diagram, screenshot]) {
      expect(figure.querySelector('img')?.getAttribute('width')).toBeTruthy()
      expect(figure.querySelector('img')?.getAttribute('height')).toBeTruthy()
    }
  })

  it('titles the Vision essay after its frontmatter and opens with why, then the bets', () => {
    const markdown = getThesisMarkdown()

    expect(thesisMetadata.title).toBe('Vision — Happy')
    expect(getDocument('desktop', 'thesis')?.title).toBe('Vision')
    expect(markdown.startsWith('# Vision\n\nEveryone is going to need a way to talk to AI.')).toBe(true)
    expect(markdown).toContain('\n\n- **One core agent.**')
    // No X posts or embeds: a bare post URL alone on a line would be one.
    expect(markdown).not.toMatch(/^https:\/\/x\.com\//m)
  })

  it('paints the same page scrollbar on every page, so the header sits in the same place', () => {
    for (const pathname of ['/', '/docs/', '/welcome/', '/model-benchmarks', '/plugins/', '/thesis/', '/privacy/']) {
      expect(renderPath(pathname).match(/class="one-scrollbar"/g)).toHaveLength(1)
    }
  })

  it('lists Vision in the docs sidebar right after How It Works and renders it in the docs layout', () => {
    render(<Router pathname="/thesis/" />)

    const [sidebar] = screen.getAllByRole('navigation', { name: 'Documentation navigation' })
    const startHere = within(sidebar).getAllByRole('link').map((link) => link.textContent).slice(0, 5)
    expect(startHere).toEqual(['Welcome', 'Quick Start', 'Chief of Staff', 'How It Works', 'Vision'])
    const visionLink = within(sidebar).getByRole('link', { name: 'Vision' })
    expect(visionLink.getAttribute('href')).toBe('/thesis/')
    expect(visionLink.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/how it works/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/models & subscriptions/i)
    expect(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBe('page')
    expect(documents.filter((document) => document.path === 'thesis')).toHaveLength(1)
  })

  it('has no blog: the header has no Blog link, and /blog/ opens the Vision essay', () => {
    // Server markup: the landing pages' effects need browser APIs jsdom lacks.
    expect(renderPath('/welcome/')).not.toMatch(/>Blog</)
    expect(renderPath('/blog/')).toMatch(/<h1 id="vision"/)
    expect(prerenderedPaths).toContain('/thesis/')
    expect(prerenderedPaths).not.toContain('/blog/')
    expect(thesisMetadata.robots).toBeUndefined()
  })

  it('renders privacy and terms as site pages', () => {
    const { rerender } = render(<Router pathname="/privacy/" />)
    expect(screen.getByRole('heading', { level: 1, name: /privacy policy/i })).toBeTruthy()

    rerender(<Router pathname="/terms/" />)
    expect(screen.getByRole('heading', { level: 1, name: /terms of use/i })).toBeTruthy()
  })

  it('handles same-page links without reloading the document', () => {
    window.history.replaceState({}, '', '/docs/')
    render(<Router />)

    const activeLink = screen.getAllByRole('link', { name: 'Welcome' })[0]
    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    activeLink.dispatchEvent(click)

    expect(click.defaultPrevented).toBe(true)
    expect(window.location.pathname).toBe('/docs/')
  })
})
