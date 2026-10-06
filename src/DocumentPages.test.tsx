import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
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

    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.id)).toEqual(['happy-muse-for-agentmaxxers'])
    expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.firstChild?.textContent)).toEqual([
      'TL;DR',
      "Who it's for",
      'One agent to talk to your other agents',
      'Why not just use Muse',
      'Always on',
      'Fewer buttons, not zero',
      "What we haven't solved",
      'How it spreads',
    ])
    expect(container.querySelector('h3')).toBeNull()
  })

  it('quotes each X post in the thesis as an official embed with its own text', () => {
    const { container } = render(<Router pathname="/thesis/" />)
    const quotes = [...container.querySelectorAll<HTMLElement>('blockquote.twitter-tweet')]

    expect(quotes.map((quote) => quote.querySelector('a')?.getAttribute('href'))).toEqual(Object.keys(thesisPosts))
    for (const quote of quotes) {
      expect(quote.dataset).toMatchObject({ dnt: 'true', conversation: 'none', theme: 'light' })
      expect(quote.querySelectorAll('a')).toHaveLength(1)
    }
    expect(quotes[0].textContent).toContain('a non-SOTA model is good enough for Muse the agent')
    const leadIns = quotes.map((quote) => quote.closest('figure')?.previousElementSibling?.textContent)
    expect(leadIns[0]).toMatch(/enough for most people.*Jay Air put it well:$/)
    expect(leadIns[1]).toBe("Everything is moving to one agent. Muse, OpenAI's dots and Grok Bot all went this way.")
    expect(leadIns[2]).toMatch(/^Permissions and security\..*we'll get some of it wrong\.$/)
    expect(container.querySelector('.document-content')?.textContent).not.toContain('https://x.com/')
  })

  it('describes the thesis with its frontmatter title and first TL;DR line', () => {
    const markdown = getThesisMarkdown()

    expect(markdown.startsWith(`# ${thesisMetadata.title}\n`)).toBe(true)
    expect(markdown).toContain(`## TL;DR\n\n- ${thesisMetadata.description}\n`)
  })

  it('keeps the thesis out of navigation', () => {
    // Server markup: the landing pages' effects need browser APIs jsdom lacks.
    for (const pathname of ['/', '/docs/', '/desktop/', '/desktop/docs/', '/model-benchmarks', '/plugins/', '/thesis/', '/privacy/']) {
      expect(renderPath(pathname)).not.toMatch(/href="[^"]*thesis/)
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
