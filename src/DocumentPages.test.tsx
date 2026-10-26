import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { metadataForPath, Router } from './Router'
import {
  documentHeading,
  documents,
  documentsForProduct,
  getDocument,
  getDocumentSource,
  getThesisMarkdown,
  prepareMarkdown,
} from './documents'
import { prerenderedPaths, renderPath } from './prerender'
import { desktopDocsMetadata, docsMetadata, thesisMetadata } from './siteMetadata'
import { documentHref, HAPPY, HAPPY_DESKTOP } from './products'
import { createHash } from 'node:crypto'
import { recipeHref, recipeSources } from './recipeSources'

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
    expect(documentsForProduct('desktop')).toHaveLength(45)

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
    // The sidebar, and the phone's copy, closed until its breadcrumb opens it.
    expect(screen.getAllByRole('navigation', { name: 'Documentation navigation' })).toHaveLength(1)
    expect(screen.getAllByRole('navigation', { name: 'Documentation navigation', hidden: true })).toHaveLength(2)
    expect(screen.getAllByRole('link', { name: /self-hosting/i }).length).toBeGreaterThan(0)
  })

  it('shows the group and page as a breadcrumb on a phone that opens the docs navigation', () => {
    const { container } = render(<Router pathname="/chief-of-staff/" />)
    const trail = screen.getByRole('button', { name: 'Start here Chief of Staff' })
    const menu = container.querySelector<HTMLElement>(`#${trail.getAttribute('aria-controls')}`)!

    expect(screen.queryByText('Browse documentation')).toBeNull()
    expect(trail.getAttribute('aria-expanded')).toBe('false')
    expect(menu.hidden).toBe(true)

    fireEvent.click(trail)
    expect(trail.getAttribute('aria-expanded')).toBe('true')
    expect(menu.hidden).toBe(false)
    expect(within(menu).getByRole('link', { name: 'Chief of Staff' }).getAttribute('aria-current')).toBe('page')
    expect([...menu.querySelectorAll('.docs-nav-group > h2, .docs-nav-fold > summary')].map((heading) => heading.textContent)).toEqual(['Start here', 'Features', 'Guides', 'Blog', 'Comparisons', 'Changelog', 'Recipes (for agents)'])

    fireEvent.click(trail)
    expect(menu.hidden).toBe(true)
    fireEvent.click(trail)
    // The router follows links in the browser; jsdom cannot.
    container.addEventListener('click', (event) => event.preventDefault())
    fireEvent.click(within(menu).getByRole('link', { name: 'Chief of Staff' }))
    expect(menu.hidden).toBe(true)
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
    const fixedRoutes = ['', 'docs', 'sitemap.xml', 'thesis', 'plugins', 'privacy', 'terms', 'tos', 'model-benchmarks', 'desktop', 'happy2', 'tmp', 'assets', 'img', 'og', 'notes']
    for (const document of documentsForProduct('desktop')) {
      expect(document.path).not.toBe('')
      expect(fixedRoutes).not.toContain(document.path.split('/')[0])
    }
    expect(renderPath('/welcome/')).toMatch(/<h1[^>]*>Welcome/)
    expect(renderPath('/welcome/')).toMatch(/<a href="\/welcome\/" aria-current="page">Docs<\/a>/)
    expect(renderPath('/chief-of-staff/')).toMatch(/<h1[^>]*>Chief of Staff/)
    expect(renderPath('/welcome/')).toContain('href="/quick-start/"')
  })

  // One server render per docs page, so it grows with the docs; CI runs several times slower than a laptop.
  it('prerenders every docs page with one h1, its own title and description', () => {
    for (const document of documents) {
      const pathname = documentHref(document.product === 'desktop' ? HAPPY_DESKTOP : HAPPY, document.path)
      expect(prerenderedPaths).toContain(pathname)
      const markup = renderPath(pathname)
      expect(markup.match(/<h1[\s>]/g)).toHaveLength(1)
      const heading = new DOMParser().parseFromString(markup, 'text/html').querySelector('h1')
      expect(heading?.firstChild?.textContent).toBe(documentHeading(document))

      // Index pages keep their section titles and descriptions; checked below.
      if (pathname === HAPPY.docsHome || pathname === HAPPY_DESKTOP.docsHome) continue
      const metadata = metadataForPath(pathname)
      expect(metadata.canonicalPath).toBe(pathname)
      expect(metadata.description).toBe(document.description)
      expect(metadata.title).toContain(document.pageTitle ?? documentHeading(document))
    }
    expect(metadataForPath('/welcome/')).toMatchObject(desktopDocsMetadata)
    expect(metadataForPath('/docs/')).toBe(docsMetadata)
    // The old prefixes serve the same page, canonical to its top-level URL.
    expect(metadataForPath('/desktop/docs/models/')).toEqual(metadataForPath('/models/'))
  }, 30_000)

  it('keeps the unlisted Buzz comparison out of search results', () => {
    expect(metadataForPath('/comparisons/buzz/').robots).toBe('noindex, follow')
    expect(metadataForPath('/models/').robots).toBeUndefined()
  })

  it('lists the comparison pages in the desktop docs, each linking to its sources', () => {
    const welcome = renderPath('/welcome/')
    for (const pathname of ['/desktop-app/', '/mobile-app/', '/claude-code-remote-control/']) {
      expect(welcome).toContain(`href="${pathname}"`)
    }
    expect(renderPath('/claude-code-remote-control/')).toContain('href="https://code.claude.com/docs/en/remote-control"')
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

    render(<Router pathname="/claude-code-remote-control/" />)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/changelog/i)
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/claude code on your phone/i)
  })

  it('lists Blog posts at short URLs, each with its diagram and its sources', () => {
    const { container, unmount } = render(<Router pathname="/tailcat/" />)

    expect(screen.getByRole('heading', { level: 1, name: /no open ports: how happy reaches your server/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/workos/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/voice/i)
    expect(container.querySelector('.document-content img[src="/img/tailcat.svg"]')).not.toBeNull()
    expect(container.querySelector('.document-content a[href="https://github.com/tailscale/tailcat"]')).not.toBeNull()
    // The version main ships, and the one older identities came from.
    expect(container.querySelector('.document-content')?.textContent).toMatch(/embeds Tailcat v0\.7\.0/)
    expect(container.querySelector('.document-content')?.textContent).toMatch(/bundled Tailcat v0\.4\.0, has no pre-shared key/)
    unmount()

    const { unmount: unmount2 } = render(<Router pathname="/voice/" />)
    expect(screen.getByRole('heading', { level: 1, name: /talk to your agents: voice with elevenlabs/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/tailcat/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/updates/i)
    unmount2()

    const updates = render(<Router pathname="/updates/" />)
    expect(screen.getByRole('heading', { level: 1, name: /updates that pick up where they left off/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^next/i }).getAttribute('href')).toBe('/stem-cell/')
    const video = updates.container.querySelector('.document-content video')
    expect(video?.getAttribute('src')).toBe('/video/updates/update.mp4')
    expect(video?.getAttribute('poster')).toBe('/video/updates/update-poster.webp')
    expect(updates.container.querySelector('.document-content img[src="/img/updates.svg"]')).not.toBeNull()
    expect(updates.container.querySelector('.document-content img[src="/img/updates-drain.svg"]')).not.toBeNull()
    updates.unmount()

    // The whole promo is only its link preview (src/siteMetadata.test.ts); the page embeds the
    // posts it quotes, their text served inside, and ends, like every post, on the downloads.
    const stemCell = render(<Router pathname="/stem-cell/" />)
    expect(screen.getByRole('heading', { level: 1, name: /sure, gpt, i need another 10 different buttons/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^next/i }).getAttribute('href')).toBe('/desktop-app/')
    const videos = [...stemCell.container.querySelectorAll('.document-content video')]
    expect(videos.map((video) => [video.className, video.getAttribute('src'), video.getAttribute('poster')])).toEqual([['autoplay-clip', '/video/stem-cell/app/clip.mp4', '/video/stem-cell/app/poster.webp']])
    expect(stemCell.container.querySelector('.side-figure > img')?.getAttribute('src')).toBe('/img/stem-cell-create-menu.webp')
    expect(stemCell.container.querySelector('.side-figure figcaption')?.textContent).toBe('The Create menu in Codex.')
    expect(stemCell.container.querySelector('.side-figure p')?.textContent).toMatch(/^Ten ways to start/)
    const tweets = [...stemCell.container.querySelectorAll('.social-embed-row > .social-embed-tweet blockquote.twitter-tweet')]
    expect(tweets.map((tweet) => tweet.querySelector('a')?.getAttribute('href'))).toEqual(['https://x.com/0xrwu/status/2105329822125707394', 'https://x.com/emollick/status/2105184972537528538'])
    expect(tweets[1].textContent).toContain('everything is getting quite confusing and overlapping again')
    const reddit = stemCell.container.querySelector('.social-embed-reddit blockquote.reddit-embed-bq')
    expect(reddit?.textContent).toContain('managing my conversations has become an absolute nightmare')
    expect(reddit?.closest('.document-content > *')?.previousElementSibling?.textContent).toBe('If this sounds like you:')
    expect(stemCell.container.querySelector('.document-content img.row-image')?.getAttribute('src')).toBe('/img/stem-cell-new-row.png')
    expect(stemCell.container.querySelector('.blog-download .one-download-actions')).not.toBeNull()
    for (const document of documents.filter((entry) => entry.group === 'Blog')) {
      expect(document.product).toBe('desktop')
      expect(['workos', 'tailcat', 'voice', 'updates', 'stem-cell']).toContain(document.path)
      // The stem cell post's title is its whole h1, the line it opens on, chosen over the length limit.
      expect(document.pageTitle?.length).toBeLessThanOrEqual(document.path === 'stem-cell' ? 75 : 65)
      expect(document.description.length).toBeLessThanOrEqual(155)
      // No narration: nothing on the page points at the diagram's files or announces what follows.
      expect(getDocumentSource(document)).not.toMatch(/The diagram as|below is|this page explains/i)
    }
  })

  it('renders the Vision essay with its title as the only h1 and every section as an h2', () => {
    const { container } = render(<Router pathname="/vision/" />)

    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.id)).toEqual(['vision'])
    const sections = [...container.querySelectorAll('.document-content h2')].map((heading) => heading.firstChild?.textContent)
    expect(sections).toEqual([
      'Make people happy',
      'One primary agent',
      'Chat left the chat',
      'Fiddle less, understand more',
      'Phone first',
      'One harness',
      'Permissions belong to the agent',
    ])
    // The bullets up top are the sections, one for one, in the same order.
    const bullets = [...container.querySelectorAll('.document-content > ul > li > strong')].map((bold) => bold.textContent?.replace(/\.$/, ''))
    expect(bullets).toEqual(sections)
    expect(container.querySelector('.document-content h3')).toBeNull()
    // Three bold lines in the whole body: the primary agent's, and the two claims about chat.
    const boldLines = [...container.querySelectorAll('.document-content > p > strong')].map((bold) => bold.textContent)
    expect(boldLines).toEqual([
      "You'll run lots of agents. Only one of them should talk back to you.",
      'Nobody rereads old messages.',
      'The sidebar and the chat are both prime to become generated artifacts.',
    ])
  })

  it('leads each section with its figure: the diagram and chart span the column, the screenshots float', () => {
    const { container } = render(<Router pathname="/vision/" />)
    const [screenshot, diagram, chart, picker, ...rest] = [...container.querySelectorAll('figure.essay-figure')]

    expect(rest).toHaveLength(0)
    expect(picker.className).toBe('essay-figure essay-figure-right')
    expect(picker.querySelector('img')?.getAttribute('src')).toBe('/thesis/model-picker.png')
    expect(picker.querySelector('figcaption')?.textContent).toBe('Codex, Claude and Grok in one picker')
    expect(picker.previousElementSibling?.textContent).toMatch(/^One harness/)
    expect(picker.nextElementSibling?.textContent).toMatch(/^We're betting on one harness/)
    // The pig sits inside the first bullet, so no other bullet moves, and alone at the very end signs off.
    const pigs = [...container.querySelectorAll('img.essay-pig')]
    expect(pigs).toHaveLength(2)
    const bullet = pigs[0].closest('li')
    expect(bullet?.textContent).toMatch(/^Make people happy\./)
    expect(bullet?.parentElement?.firstElementChild).toBe(bullet)
    expect(pigs[0].closest('figure')).toBeNull()
    const content = container.querySelector('.document-content')
    expect(content?.lastElementChild).toBe(pigs[1].parentElement)
    expect(pigs[1].parentElement?.className).toBe('essay-signoff')
    expect(pigs[1].className).toBe('essay-pig essay-pig-signoff')
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
    expect(diagram.previousElementSibling?.textContent).toMatch(/^Chat left the chat/)
    expect(diagram.nextElementSibling?.querySelector('strong')?.textContent).toBe('Nobody rereads old messages.')

    // The chart: illustrative, so no numbers or years on it, and its labels read at a phone's 350px column.
    expect(chart.className).toBe('essay-figure essay-figure-center')
    expect(chart.querySelector('img')?.getAttribute('src')).toBe('/thesis/buttons.svg')
    expect(chart.querySelector('figcaption')?.textContent).toBe('Static buttons in apps are on their way to zero')
    expect(chart.previousElementSibling?.textContent).toMatch(/^Fiddle less, understand more/)
    expect(chart.nextElementSibling?.textContent).toMatch(/^Configuring, naming things/)
    for (const figure of [diagram, screenshot, chart]) {
      expect(figure.querySelector('img')?.getAttribute('width')).toBeTruthy()
      expect(figure.querySelector('img')?.getAttribute('height')).toBeTruthy()
    }
  })

  it('titles the Vision essay after its frontmatter and opens with why, then the bets', () => {
    const markdown = getThesisMarkdown()

    expect(thesisMetadata.title).toBe('Vision — Happy')
    expect(getDocument('desktop', 'vision')?.title).toBe('Vision')
    expect(markdown.startsWith('# Vision\n\nEveryone is going to need a way to talk to AI.')).toBe(true)
    expect(markdown).toContain('\n\n- **Make people happy.**')
    // One primary agent, never a core one; and multiplayer is not called hard.
    expect(markdown).not.toMatch(/core agent|is (?:very )?hard|last .*piece of software/i)
    expect(thesisMetadata.description).toContain('one primary agent')
    expect(getDocument('desktop', 'vision')?.description).toBe(thesisMetadata.description)
    // The intelligent UI link points at OpenAI's own post, not a writeup of it.
    expect(markdown).toContain('(https://openai.com/index/gpt-6-for-everyone/)')
    // Money, plainly: what is paid today (voice), what might be later, and that it is not the focus.
    expect(markdown).toMatch(/How will we make money\? We're not focusing on it right now\. Today the only paid thing is voice: 20 free minutes every 30 days through ElevenLabs, then up to 5 hours per 30 days/)
    expect(markdown).toMatch(/referral code/)
    // No X posts or embeds: a bare post URL alone on a line would be one.
    expect(markdown).not.toMatch(/^https:\/\/x\.com\//m)
  })

  it('paints the same page scrollbar on every page, so the header sits in the same place', () => {
    for (const pathname of ['/', '/docs/', '/welcome/', '/model-benchmarks', '/plugins/', '/vision/', '/privacy/']) {
      expect(renderPath(pathname).match(/class="one-scrollbar"/g)).toHaveLength(1)
    }
  })

  it('lists Vision in the docs sidebar right after How It Works and renders it in the docs layout', () => {
    render(<Router pathname="/vision/" />)

    const [sidebar] = screen.getAllByRole('navigation', { name: 'Documentation navigation' })
    const startHere = within(sidebar).getAllByRole('link').map((link) => link.textContent).slice(0, 6)
    expect(startHere).toEqual(['Welcome', 'Quick Start', 'Chief of Staff', 'How It Works', 'Vision', 'Team'])
    const visionLink = within(sidebar).getByRole('link', { name: 'Vision' })
    expect(visionLink.getAttribute('href')).toBe('/vision/')
    expect(visionLink.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/how it works/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/team/i)
    expect(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBe('page')
    expect(documents.filter((document) => document.path === 'vision')).toHaveLength(1)
  })

  it('lists Team right after Vision, Steve first, each bio in its own first person, with site and X handle, and nothing about anyone\'s hours', () => {
    const { container } = render(<Router pathname="/team/" />)

    expect(screen.getByRole('heading', { level: 1, name: /^team/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/vision/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/models & subscriptions/i)
    const content = container.querySelector('.document-content')!
    expect(content.querySelector('h1 + p')?.textContent).toBe('Happy is currently built by the two of us, with help from contributors on GitHub.')
    const people = [...content.querySelectorAll('h2')]
    expect(people.map((heading) => heading.firstChild?.textContent)).toEqual(['Steve Korshakov', 'Kirill Dubovitskiy'])
    for (const heading of people) {
      // Photo, then the bio: written by its subject, never about them.
      const photo = heading.nextElementSibling!
      expect(photo.querySelector('img')).not.toBeNull()
      const bio = photo.nextElementSibling!.textContent!
      expect(bio).toMatch(/\bI\b/)
      expect(bio).not.toContain(heading.firstChild!.textContent!.split(' ')[0])
    }
    expect(content.textContent).toContain('I build the desktop app')
    expect(content.textContent).toMatch(/Before Happy I built/)
    expect(content.textContent).not.toMatch(/YC interview|continue\.dev|Fizz|architected|bootstrapped/i)
    for (const href of [
      'https://korshakov.com', 'https://x.com/ex3ndr', 'https://github.com/ex3ndr',
      'https://bra1ndump.com', 'https://x.com/bra1n_dump', 'https://github.com/bra1nDump',
      // The Amazon security work, from Steve's own talk, and the Show Me plugin's source.
      'https://www.youtube.com/watch?v=IvE8n-ylFYY',
      'https://github.com/bra1nDump/show-me-chatgpt-plugin',
    ]) {
      expect(content.querySelector(`a[href="${href}"]`)).not.toBeNull()
    }
    expect([...content.querySelectorAll('img')].map((image) => image.getAttribute('src'))).toEqual([
      '/img/team/steve-korshakov.jpg',
      '/img/team/kirill-dubovitskiy.jpg',
    ])
    // Nobody's level of involvement, in either direction.
    expect(content.textContent).not.toMatch(/full[- ]time|part[- ]time|day job|day to day|side project|spare time/i)
    expect(documents.filter((document) => document.path === 'team')).toHaveLength(1)
  })

  it('lists Secrets under Features after Permissions, with a search title and description that fit', () => {
    render(<Router pathname="/secrets/" />)

    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.id)).toEqual(['secrets'])
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/permissions & sandbox/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/projects & workspaces/i)
    const secrets = getDocument('desktop', 'secrets')!
    expect(secrets.group).toBe('Features')
    expect(secrets.pageTitle?.length).toBeLessThanOrEqual(65)
    expect(secrets.description.length).toBeLessThanOrEqual(155)
    expect(metadataForPath('/secrets/').title).toBe(secrets.pageTitle)
    const markup = renderPath('/secrets/')
    // Every section the page promises; the comparison links each other project's own docs, and no source list closes the page.
    for (const heading of ['One secret catalog per installation', 'Create and update a secret', 'What the model sees, and never sees', 'Attach a secret to an agent, workspace, or project', 'How a command receives a secret', 'Secrets, the sandbox, and Auto review', 'Where secrets are stored on disk', 'Secrets in Happy Desktop', 'What team members can do with secrets', 'How Happy compares with Hermes Agent and OpenClaw']) {
      expect(markup).toContain(`>${heading}<`)
    }
    for (const href of [
      'https://hermes-agent.nousresearch.com/docs/user-guide/secrets/',
      'https://docs.openclaw.ai/gateway/secrets/secret-store-and-egress',
      'https://docs.openclaw.ai/tools/secrets',
    ]) {
      expect(markup).toContain(`href="${href}"`)
    }
    // The diagram, with no narration about it; and the sandbox page points here.
    expect(markup).toContain('src="/img/secrets.svg"')
    expect(markup).not.toMatch(/The diagram as|below is|this page explains/i)
    expect(renderPath('/permissions/')).toContain('href="/secrets/"')
    // Written for people: no paragraph of sources at the end of any desktop docs page.
    for (const document of documentsForProduct('desktop')) {
      expect(getDocumentSource(document)).not.toMatch(/^Sources?\b[^\n]*:/m)
    }
    expect(documents.filter((document) => document.path === 'secrets')).toHaveLength(1)
  })

  it('lists Blog before Comparisons, collapsed Changelog next and collapsed Recipes last; keeps the old Blog URLs', () => {
    render(<Router pathname="/workos/" />)

    const [sidebar] = screen.getAllByRole('navigation', { name: 'Documentation navigation' })
    const groups = [...sidebar.querySelectorAll('.docs-nav-group > h2, .docs-nav-fold > summary')]
    expect(groups.map((heading) => heading.textContent)).toEqual(['Start here', 'Features', 'Guides', 'Blog', 'Comparisons', 'Changelog', 'Recipes (for agents)'])
    const posts = within(groups.find((heading) => heading.textContent === 'Blog')!.closest('section')!).getAllByRole('link').map((link) => link.getAttribute('href'))
    expect(posts).toEqual(['/workos/', '/tailcat/', '/voice/', '/updates/', '/stem-cell/'])
    expect(screen.getByRole('heading', { level: 1, name: /team sign-in with workos/i })).toBeTruthy()
    // Server markup: the landing pages' effects need browser APIs jsdom lacks.
    const header = renderPath('/welcome/').match(/<nav[^>]*aria-label="Primary navigation"[\s\S]*?<\/nav>/)?.[0]
    expect(header).not.toMatch(/>Blog</)
    // The WorkOS post was first published at /team-sign-in-workos/.
    expect(renderPath('/team-sign-in-workos/')).toMatch(/<h1 id="team-sign-in-with-workos"/)
    expect(metadataForPath('/team-sign-in-workos/').canonicalPath).toBe('/workos/')
    expect(renderPath('/blog/')).toMatch(/<h1 id="vision"/)
    expect(renderPath('/thesis/')).toMatch(/<h1 id="vision"/)
    expect(prerenderedPaths).toContain('/vision/')
    expect(prerenderedPaths).toContain('/workos/')
    for (const moved of ['/thesis/', '/blog/', '/team-sign-in-workos/']) expect(prerenderedPaths).not.toContain(moved)
    expect(thesisMetadata.robots).toBeUndefined()
  })

  it('keeps changelog and recipe links in served HTML but folds both by default', () => {
    const markup = renderPath('/recepies/')
    const parsed = new DOMParser().parseFromString(markup, 'text/html')
    const folds = parsed.querySelectorAll('details.docs-nav-fold')
    expect(folds).toHaveLength(4)
    for (const fold of folds) {
      expect(fold.hasAttribute('open')).toBe(false)
      const summary = fold.querySelector('summary')?.textContent
      expect(['Changelog', 'Recipes (for agents)']).toContain(summary)
      expect(fold.querySelectorAll('a')).toHaveLength(summary === 'Changelog' ? 1 : 18)
    }
  })

  it('publishes complete, unmodified recipe sources with source-relative links', () => {
    expect(recipeSources.files).toHaveLength(18)
    for (const file of recipeSources.files) {
      const document = getDocument('desktop', file.route)!
      const source = getDocumentSource(document)
      expect(createHash('sha256').update(source).digest('hex')).toBe(file.sha256)
      const markup = renderPath(`/${file.route}/`)
      expect(markup).not.toContain('class="cos-prompt"')
      expect(markup).not.toMatch(/href="(?:\.\.?\/|[^"/#:]+\.md)/)
      expect(markup).toContain(`<p class="recipe-source">Synced from happy-agent <a href="${recipeSources.repository}/blob/${recipeSources.revision}/${file.source}"><code>${file.source}</code> @ <code>${recipeSources.revision.slice(0, 9)}</code></a></p>`)
    }
    expect(recipeHref('recepies/runner', 'README.md#testing-a-deployed-node')).toBe('/recepies/#testing-a-deployed-node')
    expect(recipeHref('recepies', 'exported-bot-telegram.md')).toBe('/recepies/telegram/')
    expect(recipeHref('recepies/runner', '../configuration.md#runners')).toBe(`${recipeSources.repository}/blob/${recipeSources.revision}/docs/configuration.md#runners`)
    expect(recipeHref('recepies/runner', '#local')).toBe('#local')
    expect(recipeHref('recepies/runner', 'https://example.com/')).toBe('https://example.com/')
  }, 30_000)

  it('prerenders a feature-titled changelog permalink with its own video preview and normal navigation', () => {
    const path = '/changelog/gpt-6-1-terra/'
    const page = new DOMParser().parseFromString(renderPath(path), 'text/html')
    expect(page.querySelector('article h1')?.textContent).toContain('GPT-6.1 Terra')
    expect(page.querySelector('article h1')?.textContent).not.toContain('v0.4.108')
    expect(page.querySelector('article h1 + p')?.textContent).toContain('Happy Agent v0.4.108')
    expect(page.querySelector('article video')?.getAttribute('src')).toBe('/video/terra.mp4')
    expect(page.querySelector('article a[href="/changelog/"]')?.textContent).toBe('All releases')
    expect(page.querySelectorAll('details.docs-nav-fold[open]')).toHaveLength(0)
    expect(page.querySelectorAll('details.docs-nav-fold')).toHaveLength(4)
    expect(metadataForPath(path)).toMatchObject({
      canonicalPath: path,
      socialImage: { path: '/og/terra.png', width: 1200, height: 675 },
      socialVideo: { path: '/video/terra.mp4', width: 1280, height: 720 },
    })
    expect(prerenderedPaths).toContain(path)
    expect(renderPath('/changelog/')).toContain('id="gpt-6-1-terra"')
    expect(metadataForPath('/changelog/').socialVideo).toBeUndefined()
    expect(metadataForPath('/changelog/').title).toMatch(/^Changelog/)
    expect(prerenderedPaths).not.toContain('/terra/')
  })

  it('puts a copyable Chief of Staff prompt right after the intro of every page it can help with', () => {
    const withPrompt = ['quick-start', 'chief-of-staff', 'models', 'permissions', 'secrets', 'workspaces', 'agents', 'mobile', 'multiplayer', 'extending', 'guides/configuration', 'guides/remote-server']
    for (const document of documentsForProduct('desktop')) {
      const markup = renderPath(`/${document.path}/`)
      const block = markup.indexOf('<aside class="cos-prompt"')
      if (!withPrompt.includes(document.path)) {
        expect(block, document.path).toBe(-1)
        continue
      }
      // The prompt is plain text in the served page, before the reference sections; quick-start's sits in its First project step.
      expect(block, document.path).toBeGreaterThan(markup.indexOf('<h1'))
      if (document.path !== 'quick-start') {
        expect(block, document.path).toBeLessThan(markup.indexOf('<h2', markup.indexOf('<h1')))
      }
      // A line naming the page's task, then each prompt under a header row: "Example" left, Copy right.
      expect(markup).toMatch(/<p class="cos-prompt-label">To [^<]+, simply ask the <a href="\/chief-of-staff\/">Chief of Staff<\/a>:<\/p>/)
      expect(markup).toMatch(/<div class="cos-prompt-head"><span class="cos-prompt-example">Example<\/span><button type="button" class="cos-prompt-copy" data-state="idle" aria-label="Copy prompt: [^"]+">[\s\S]*?<\/button><\/div><p class="cos-prompt-text">[^<]+<\/p>/)
      // The block replaces the old prose section.
      expect(markup).not.toMatch(/<h2[^>]*>Ask the Chief of Staff</)
    }
    expect(withPrompt.filter((path) => !getDocument('desktop', path))).toEqual([])
    // Blog posts explain how something works; they never carry the block.
    expect(withPrompt.filter((path) => getDocument('desktop', path)?.group === 'Blog')).toEqual([])
    expect(renderPath('/extending/')).toContain('To add skills, simply ask the <a href="/chief-of-staff/">Chief of Staff</a>:')
    // The remote-server guide leads with what you get: the harness diagram, then the prompt; the problem waits in the reference layer.
    const remote = renderPath('/guides/remote-server/')
    expect(remote.indexOf('src="/img/remote-server-harness.svg"')).toBeLessThan(remote.indexOf('<aside class="cos-prompt"'))
    expect(remote.slice(0, remote.indexOf('<h2', remote.indexOf('<h1')))).not.toMatch(/lid closes|laptop sleeps<\/h2>|workarounds/i)
    // The Chief of Staff page shows the real sidebar, where it is the first bot.
    expect(renderPath('/chief-of-staff/')).toContain('src="/img/chief-of-staff-sidebar.png"')
  }, 30_000)

  it('copies a Chief of Staff prompt and says so', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    render(<Router pathname="/mobile/" />)

    const block = screen.getByRole('complementary', { name: 'Ask the Chief of Staff' })
    fireEvent.click(within(block).getByRole('button', { name: 'Copy prompt: Pair my phone' }))

    await waitFor(() => expect(within(block).getByRole('button', { name: 'Copied: Pair my phone' })).toBeTruthy())
    // Only the prompt: not the "Example" label or the button's text.
    expect(writeText).toHaveBeenCalledWith('Pair my phone')
    expect(within(block).getByRole('status').textContent).toBe('Copied.')
    Reflect.deleteProperty(navigator, 'clipboard')
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
