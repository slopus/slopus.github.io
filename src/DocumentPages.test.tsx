import { cleanup, render, screen } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { metadataForPath, Router } from './Router'
import {
  documentHeading,
  documents,
  documentsForProduct,
  getDocumentSource,
  getThesisMarkdown,
  prepareMarkdown,
} from './documents'
import { prerenderedPaths, renderPath } from './prerender'
import { desktopDocsMetadata, docsMetadata, thesisMetadata } from './siteMetadata'
import { documentHref, HAPPY, HAPPY_DESKTOP } from './products'
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
    expect(documentsForProduct('desktop')).toHaveLength(18)

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
    const fixedRoutes = ['', 'docs', 'llms.txt', 'sitemap.xml', 'thesis', 'blog', 'plugins', 'privacy', 'terms', 'tos', 'model-benchmarks', 'desktop', 'happy2', 'tmp', 'assets', 'img', 'og', 'notes']
    for (const document of documentsForProduct('desktop')) {
      expect(document.path).not.toBe('')
      expect(fixedRoutes).not.toContain(document.path.split('/')[0])
    }
    expect(renderPath('/welcome/')).toMatch(/<h1[^>]*>Welcome/)
    expect(renderPath('/welcome/')).toMatch(/<a href="\/welcome\/" aria-current="page">Docs<\/a>/)
    expect(renderPath('/chief-of-staff/')).toMatch(/<h1[^>]*>Chief of Staff/)
    expect(renderPath('/welcome/')).toContain('href="/quick-start/"')
  })

  it('prerenders every docs page with one h1, its own title and description', () => {
    for (const document of documents) {
      const pathname = documentHref(document.product === 'desktop' ? HAPPY_DESKTOP : HAPPY, document.path)
      expect(prerenderedPaths).toContain(pathname)
      const markup = renderPath(pathname)
      expect(markup.match(/<h1[\s>]/g)).toHaveLength(1)
      expect(markup).toContain(documentHeading(document).replace(/&/g, '&amp;'))

      // Index pages keep their section titles and descriptions; checked below.
      if (pathname === HAPPY.docsHome || pathname === HAPPY_DESKTOP.docsHome) continue
      const metadata = metadataForPath(pathname)
      expect(metadata.canonicalPath).toBe(pathname)
      expect(metadata.description).toBe(document.description)
      expect(metadata.title).toContain(document.pageTitle ?? documentHeading(document))
    }
    expect(metadataForPath('/welcome/')).toBe(desktopDocsMetadata)
    expect(metadataForPath('/docs/')).toBe(docsMetadata)
    // The old prefixes serve the same page, canonical to its top-level URL.
    expect(metadataForPath('/desktop/docs/models/')).toEqual(metadataForPath('/models/'))
  })

  it('keeps the unlisted Buzz comparison out of search results', () => {
    expect(metadataForPath('/comparisons/buzz/').robots).toBe('noindex, follow')
    expect(metadataForPath('/models/').robots).toBeUndefined()
  })

  it('lists the comparison pages in the desktop docs, each linking to its sources', () => {
    const welcome = renderPath('/welcome/')
    for (const pathname of ['/desktop-app/', '/mobile-app/', '/vs/claude-code-remote-control/']) {
      expect(welcome).toContain(`href="${pathname}"`)
    }
    expect(renderPath('/vs/claude-code-remote-control/')).toContain('href="https://code.claude.com/docs/en/remote-control"')
    expect(renderPath('/mobile-app/')).toContain('href="https://code.claude.com/docs/en/remote-control"')
    // Desktop docs links stay top-level; only the original CLI docs resolve under /docs.
    expect(renderPath('/models/')).toContain('href="/guides/configuration/"')
  })

  it('keeps the announced Buzz comparison URL working', () => {
    render(<Router pathname="/docs/comparisons/happy-2-vs-buzz" />)

    expect(screen.getByRole('heading', { level: 1, name: /happy desktop vs buzz/i })).toBeTruthy()
  })

  it('leaves the Buzz comparison out of navigation and the reading order', () => {
    const { unmount } = render(<Router pathname="/comparisons/buzz/" />)

    expect(screen.getByRole('heading', { level: 1, name: /happy desktop vs buzz/i })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Happy Desktop vs Buzz' })).toBeNull()
    // The Comparisons group lists the other comparisons, not this one.
    expect(screen.getAllByRole('link', { name: 'Happy vs Remote Control' }).length).toBeGreaterThan(0)
    expect(screen.queryByRole('link', { name: /^previous/i })).toBeNull()
    expect(screen.queryByRole('link', { name: /^next/i })).toBeNull()
    unmount()

    render(<Router pathname="/vs/claude-code-remote-control/" />)
    expect(screen.queryByRole('link', { name: /^next/i })).toBeNull()
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/claude code on your phone/i)
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
    for (const pathname of ['/', '/docs/', '/welcome/', '/model-benchmarks', '/plugins/', '/thesis/', '/privacy/']) {
      expect(renderPath(pathname).match(/class="one-scrollbar"/g)).toHaveLength(1)
    }
  })

  it('lists the thesis on the blog index, not in the docs sidebar', () => {
    // Server markup: the landing pages' effects need browser APIs jsdom lacks.
    const blog = renderPath('/blog/')
    expect(blog).toMatch(/<h1[^>]*>Blog<\/h1>/)
    expect(blog).toContain('href="/thesis/"')
    expect(blog).toContain('Our Thesis')
    expect(documents.some((document) => document.path.includes('thesis'))).toBe(false)
    expect(renderPath('/welcome/')).not.toMatch(/href="[^"]*\/thesis/)
  })

  it('marks Blog as the current section on the blog index and on posts', () => {
    for (const pathname of ['/blog/', '/thesis/']) {
      expect(renderPath(pathname)).toMatch(/<a href="\/blog\/" aria-current="page">Blog<\/a>/)
    }
    expect(renderPath('/welcome/')).not.toContain('aria-current="page">Blog')
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
