import { cleanup, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { Router } from './Router'
import {
  documents,
  documentsForProduct,
  getDocumentSource,
  getThesisMarkdown,
  prepareMarkdown,
} from './documents'
import { renderPath } from './prerender'
import { thesisMetadata } from './siteMetadata'
import { thesisPosts } from './thesisPosts'

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
    expect(documentsForProduct('desktop')).toHaveLength(15)

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
    render(<Router pathname="/desktop/docs/how-it-works/" />)

    expect(screen.getByRole('heading', { level: 1, name: /how it works/i })).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Permissions & Sandbox' }).length).toBeGreaterThan(0)
  })

  it('keeps Happy and Happy Desktop documentation separate', () => {
    const { unmount } = render(<Router pathname="/desktop/docs/" />)

    expect(screen.queryByRole('link', { name: 'Voice Coding' })).toBeNull()
    unmount()

    render(<Router pathname="/docs/" />)
    expect(screen.queryByRole('link', { name: 'Happy Desktop vs Buzz' })).toBeNull()
  })

  it('opens every original Happy CLI docs page with the maintenance notice, and no desktop page', () => {
    const { unmount } = render(<Router pathname="/docs/quick-start/" />)
    const notice = screen.getByRole('complementary', { name: /maintenance mode/i })

    expect(notice.textContent).toMatch(/^Happy is now a desktop app\. The original Happy CLI \(happy on npm, formerly happy-coder\) is in maintenance mode/)
    expect(screen.getByRole('link', { name: 'Happy desktop app' }).getAttribute('href')).toBe('/')
    unmount()

    render(<Router pathname="/desktop/docs/quick-start/" />)
    expect(screen.queryByRole('complementary', { name: /maintenance mode/i })).toBeNull()
  })

  it('does not claim automatic account routing is missing', () => {
    for (const document of documentsForProduct('desktop')) {
      expect(getDocumentSource(document)).not.toMatch(/routing[^.]*not (yet )?implemented|automatic routing across/i)
    }
  })

  it('keeps the announced Buzz comparison URL working', () => {
    render(<Router pathname="/docs/comparisons/happy-2-vs-buzz" />)

    expect(screen.getByRole('heading', { level: 1, name: /happy desktop vs buzz/i })).toBeTruthy()
  })

  it('leaves the Buzz comparison out of navigation and the reading order', () => {
    const { unmount } = render(<Router pathname="/desktop/docs/comparisons/buzz/" />)

    expect(screen.getByRole('heading', { level: 1, name: /happy desktop vs buzz/i })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Happy Desktop vs Buzz' })).toBeNull()
    expect(screen.queryByText('Comparisons', { selector: 'h2' })).toBeNull()
    expect(screen.queryByRole('link', { name: /^previous/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /^next/i })).toBeNull()
    unmount()

    render(<Router pathname="/desktop/docs/guides/remote-agents/" />)
    expect(screen.queryByRole('link', { name: /^next/i })).toBeNull()
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/configuration/i)
  })

  it('renders the thesis with its title as the only h1 and every section as an h2', () => {
    const { container } = render(<Router pathname="/thesis/" />)

    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.id)).toEqual(['our-thesis'])
    const sections = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.firstChild?.textContent)
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
    expect(container.querySelector('h3')).toBeNull()
  })

  it('quotes each X post in the thesis as an official embed with its own text', () => {
    const { container } = render(<Router pathname="/thesis/" />)
    const quotes = [...container.querySelectorAll<HTMLElement>('blockquote.twitter-tweet')]

    // The thesis currently embeds no posts; a bare post URL on its own line would add one here.
    expect(quotes.map((quote) => quote.querySelector('a')?.getAttribute('href'))).toEqual(Object.keys(thesisPosts))
    for (const quote of quotes) {
      expect(quote.dataset).toMatchObject({ dnt: 'true', conversation: 'none', theme: 'light', width: '270' })
      expect(quote.querySelectorAll('a')).toHaveLength(1)
    }
    expect(container.querySelector('.document-content')?.textContent).not.toContain('https://x.com/')
  })

  it('spans the layout diagram across the column and sets the sidebar screenshot beside its paragraph', () => {
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
    expect(screenshot.nextElementSibling?.textContent).toMatch(/^This agent is a lifesaver/)

    expect(diagram.className).toBe('essay-figure')
    expect(diagram.querySelector('img')?.getAttribute('src')).toBe('/thesis/layout.svg')
    expect(diagram.previousElementSibling?.textContent).toMatch(/^The agent's job is to help you keep that map/)
    for (const figure of [diagram, screenshot]) {
      expect(figure.querySelector('img')?.getAttribute('width')).toBeTruthy()
      expect(figure.querySelector('img')?.getAttribute('height')).toBeTruthy()
    }
  })

  it('titles the thesis after its frontmatter and opens with why, then the bets', () => {
    const markdown = getThesisMarkdown()

    expect(thesisMetadata.title).toBe('Our Thesis — Happy')
    expect(markdown.startsWith('# Our Thesis\n\nEveryone is going to need a way to talk to AI.')).toBe(true)
    expect(markdown).toContain('\n\n- **One core agent.**')
  })

  it('paints the same page scrollbar on every page, so the header sits in the same place', () => {
    for (const pathname of ['/', '/docs/', '/desktop/docs/', '/model-benchmarks', '/plugins/', '/thesis/', '/privacy/']) {
      expect(renderPath(pathname).match(/class="one-scrollbar"/g)).toHaveLength(1)
    }
  })

  it('keeps the thesis out of navigation', () => {
    // Server markup: the landing pages' effects need browser APIs jsdom lacks.
    for (const pathname of ['/', '/docs/', '/desktop/', '/desktop/docs/', '/model-benchmarks', '/plugins/', '/thesis/', '/privacy/']) {
      // No page links to /thesis/. The page's own heading anchors (#our-thesis) don't count.
      expect(renderPath(pathname)).not.toMatch(/href="[^"]*\/thesis/)
    }
    expect(documents.some((document) => document.path.includes('thesis'))).toBe(false)
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
