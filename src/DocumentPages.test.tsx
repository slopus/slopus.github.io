import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { metadataForPath, Router } from './Router'
import {
  documentHeading,
  documents,
  documentsForProduct,
  getDocument,
  listedDocumentsForProduct,
  getDocumentSource,
  getThesisMarkdown,
  prepareMarkdown,
} from './documents'
import { prerenderedPaths, renderPath } from './prerender'
import { desktopDocsMetadata, docsMetadata, thesisMetadata } from './siteMetadata'
import { documentHref, HAPPY, HAPPY_DESKTOP } from './products'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { recipeHref, recipeSources } from './recipeSources'

// jsdom has no ResizeObserver; the painted page scrollbar only observes with it.
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  // The corner's gradient reads reduced motion; without WebGL it never draws.
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} }))
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
    expect(documentsForProduct('desktop')).toHaveLength(56)

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
    const trail = screen.getByRole('button', { name: 'Your team Chief of Staff' })
    const menu = container.querySelector<HTMLElement>(`#${trail.getAttribute('aria-controls')}`)!

    expect(screen.queryByText('Browse documentation')).toBeNull()
    expect(trail.getAttribute('aria-expanded')).toBe('false')
    expect(menu.hidden).toBe(true)

    fireEvent.click(trail)
    expect(trail.getAttribute('aria-expanded')).toBe('true')
    expect(menu.hidden).toBe(false)
    expect(within(menu).getByRole('link', { name: 'Chief of Staff' }).getAttribute('aria-current')).toBe('page')
    expect([...menu.querySelectorAll('.docs-nav-group > h2, .docs-nav-fold > summary')].map((heading) => heading.textContent)).toEqual(['Start here', 'Your team', 'The app', 'Where this goes', 'Under the hood', 'Guides', 'Compare', 'Blog', 'Changelog', 'For agents'])

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
    expect(screen.getAllByRole('link', { name: 'Exactly enough access' }).length).toBeGreaterThan(0)
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
    expect(within(notice).getByRole('link', { name: 'Quick Start' }).getAttribute('href')).toBe('/quick-start/')
    unmount()

    render(<Router pathname="/quick-start/" />)
    expect(screen.queryByRole('complementary', { name: /maintenance mode/i })).toBeNull()
  })

  // These pages show up under the homepage for "happy coder" searches; each says what it is and where Happy is now.
  it('titles the most-searched original Happy CLI pages by the old name and links each to its Happy Desktop page', () => {
    const paths = ['/docs/', '/docs/faq/', '/docs/features/', '/docs/how-it-works/', '/docs/quick-start/', '/docs/distribution/']
    const titles = paths.map((path) => metadataForPath(path).title)
    expect(new Set(titles).size).toBe(paths.length)
    for (const path of paths) {
      const metadata = metadataForPath(path)
      expect(metadata.title).toContain('Happy (formerly Happy Coder)')
      expect(metadata.title.length).toBeLessThanOrEqual(65)
      expect(metadata.description).toContain('Happy (formerly Happy Coder)')
      expect(metadata.description.length).toBeLessThanOrEqual(160)
      const document = documents.find((entry) => entry.product === 'happy' && documentHref(HAPPY, entry.path) === path)
      expect(document?.current?.path).toMatch(/^\/(welcome|quick-start|how-it-works)\//)
    }
    const allTitles = documents.map((entry) => metadataForPath(documentHref(entry.product === 'desktop' ? HAPPY_DESKTOP : HAPPY, entry.path)).title)
    for (const title of titles) expect(allTitles.filter((other) => other === title)).toHaveLength(1)
  })

  it('does not claim automatic account routing is missing', () => {
    for (const document of documentsForProduct('desktop')) {
      expect(getDocumentSource(document)).not.toMatch(/routing[^.]*not (yet )?implemented|automatic routing across/i)
    }
  })

  it('serves the desktop docs as top-level pages whose slugs no other route owns', () => {
    const fixedRoutes = ['', 'docs', 'sitemap.xml', 'thesis', 'plugins', 'privacy', 'terms', 'tos', 'model-benchmarks', 'releases', 'desktop', 'happy2', 'tmp', 'assets', 'img', 'og', 'notes']
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

  it('names the phone searches on /mobile-app/ and links it as the Claude Code mobile app', () => {
    const page = new DOMParser().parseFromString(renderPath('/mobile-app/'), 'text/html')
    expect(page.querySelector('article h1')?.textContent?.replace(/#$/, '')).toBe('Claude Code Mobile App for iPhone and Android')
    const headings = [...page.querySelectorAll('article h2')].map((heading) => heading.textContent?.replace(/#$/, ''))
    expect(headings).toEqual(expect.arrayContaining([
      'Can I control Claude Code from my phone?',
      'Set up Claude Code on your phone',
      'What you can do with Claude Code from your phone',
      'Does the Claude Code phone app work with Codex, Grok, and Gemini?',
    ]))
    for (const pathname of ['/mobile/', '/recepies/mobile-access/', '/claude-code-remote-control/', '/guides/remote-server/']) {
      const links = [...new DOMParser().parseFromString(renderPath(pathname), 'text/html').querySelectorAll('article a[href="/mobile-app/"]')]
      expect(links.map((link) => link.textContent), pathname).toContain('Claude Code mobile app')
    }
  }, 30_000)

  it('keeps the unlisted Buzz comparison out of search results', () => {
    expect(metadataForPath('/comparisons/buzz/').robots).toBe('noindex, follow')
    expect(metadataForPath('/models/').robots).toBeUndefined()
  })

  it('lists the comparison pages in the desktop docs, each linking to its sources', () => {
    const welcome = renderPath('/welcome/')
    for (const pathname of ['/desktop-app/', '/mobile-app/', '/claude-code-remote-control/', '/t3-code/', '/pi-durable/']) {
      expect(welcome).toContain(`href="${pathname}"`)
    }
    expect(renderPath('/claude-code-remote-control/')).toContain('href="https://code.claude.com/docs/en/remote-control"')
    expect(renderPath('/mobile-app/')).toContain('href="https://code.claude.com/docs/en/remote-control"')
    expect(renderPath('/t3-code/')).toContain('href="https://github.com/pingdotgg/t3code/tree/main/docs/user"')
    expect(renderPath('/pi-durable/')).toContain('href="https://earendil.com/posts/pi-durable/"')
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
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/happy vs t3 code/i)
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/claude code on your phone/i)
  })

  it('lists Blog posts at short URLs, each with its diagram and its sources', () => {
    const { container, unmount } = render(<Router pathname="/tailcat/" />)

    expect(screen.getByRole('heading', { level: 1, name: /no open ports: how happy reaches your server/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/workos/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/updates mid-turn/i)
    expect(container.querySelector('.document-content img[src="/img/tailcat.svg"]')).not.toBeNull()
    expect(container.querySelector('.document-content a[href="https://github.com/tailscale/tailcat"]')).not.toBeNull()
    // The version main ships, and the one older identities came from.
    expect(container.querySelector('.document-content')?.textContent).toMatch(/embeds Tailcat v0\.7\.0/)
    expect(container.querySelector('.document-content')?.textContent).toMatch(/bundled Tailcat v0\.4\.0, has no pre-shared key/)
    unmount()

    // Voice moved up into the reading path, after the phone; its URL and title stay.
    const { unmount: unmount2 } = render(<Router pathname="/voice/" />)
    expect(screen.getByRole('heading', { level: 1, name: /talk to your agents: voice with elevenlabs/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/happy on your phone/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/vision/i)
    expect(getDocument('desktop', 'voice')?.group).toBe('The app')
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
    expect(screen.getByRole('link', { name: /^next/i }).getAttribute('href')).toBe('/changelog/')
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
      expect(['workos', 'tailcat', 'updates', 'stem-cell']).toContain(document.path)
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
      'One app for the whole company',
      'One primary agent',
      'Chat left the chat',
      'Fiddle less, understand more',
      'Phone first',
      'One harness',
      'Permissions belong to the agent',
    ])
    // The bullets up top are the sections, one for one, in the same order.
    const bullets = [...container.querySelectorAll('.document-content > ul:first-of-type > li > strong')].map((bold) => bold.textContent?.replace(/\.$/, ''))
    expect(bullets).toEqual(sections)
    expect(container.querySelector('.document-content h3')).toBeNull()
    // Five bold runs in the whole body: the one app's line and its not-shipped label, the primary agent's, and the two claims about chat.
    const boldLines = [...container.querySelectorAll('.document-content > p > strong')].map((bold) => bold.textContent)
    expect(boldLines).toEqual([
      'Chat tools were built for people talking to people. Most of your coworkers are agents now.',
      'These are not shipped:',
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
    expect(markdown.startsWith('# Vision\n\nEveryone is going to need a way to talk to AI, and every team is going to need a place where its people and its agents work together.')).toBe(true)
    // What is not shipped is said so, here and nowhere else.
    expect(markdown).toContain('**These are not shipped:**')
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

  it('keeps the browser\'s own scrollbar, its gutter kept on every page so the header sits in the same place', () => {
    for (const pathname of ['/', '/docs/', '/welcome/', '/model-benchmarks', '/plugins/', '/vision/', '/privacy/']) {
      expect(renderPath(pathname)).not.toMatch(/class="one-scrollbar"/)
    }
    expect(readFileSync('src/style.css', 'utf8')).toMatch(/html \{[^}]*scrollbar-gutter: stable/)
  })

  it('sizes every sidebar row by its bold, active form, so no row moves when it becomes active', () => {
    // The layout check needs a browser: `node scripts/check-sidebar-rows.mjs` after a build.
    const sidebar = new DOMParser().parseFromString(renderPath('/welcome/'), 'text/html').querySelector('nav.docs-navigation')!
    const links = [...sidebar.querySelectorAll('a')]
    expect(links.length).toBeGreaterThan(30)
    for (const link of links) {
      const label = link.querySelector(':scope > .docs-nav-label')
      expect(label?.getAttribute('data-label'), link.getAttribute('href')!).toBe(link.textContent)
    }
    expect(readFileSync('src/style.css', 'utf8')).toMatch(/\.docs-nav-label::after \{ content: attr\(data-label\)[^}]*font-weight: 600[^}]*visibility: hidden/)
  })

  it('lists Vision under Where this goes, after the app, and renders it in the docs layout', () => {
    render(<Router pathname="/vision/" />)

    const [sidebar] = screen.getAllByRole('navigation', { name: 'Documentation navigation' })
    const group = (name: string) => [...[...sidebar.querySelectorAll('.docs-nav-group')].find((section) => section.querySelector('h2')?.textContent === name)!.querySelectorAll('a')].map((link) => link.textContent)
    expect(group('Start here')).toEqual(['Welcome', 'Quick Start'])
    expect(group('Your team')).toEqual(['One place for the team', 'Bots that own a job', 'Chief of Staff', 'Tasks in the open', 'The feed', 'Exactly enough access', "Your computers, the team's"])
    expect(group('The app')).toEqual(['Models on your subscriptions', 'Agents That Never Die', 'Happy on your phone', 'Talk to it'])
    expect(group('Where this goes')).toEqual(['Vision', 'Who builds it'])
    const visionLink = within(sidebar).getByRole('link', { name: 'Vision' })
    expect(visionLink.getAttribute('href')).toBe('/vision/')
    expect(visionLink.getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/talk to it/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/who builds it/i)
    // The thesis is the pull quote under the h1, never a second line in the sidebar.
    expect(sidebar.textContent).not.toContain('run on one app')
    expect(document.querySelector('.document-content > h1 + .document-thesis')?.textContent).toBe("A company should be able to run on one app. We're building it in the open.")
    expect(within(screen.getByRole('navigation', { name: 'Primary navigation' })).getByRole('link', { name: 'Docs' }).getAttribute('aria-current')).toBe('page')
    expect(documents.filter((document) => document.path === 'vision')).toHaveLength(1)
  })

  it('lists Team right after Vision, Steve first, each bio in its own first person, with site and X handle, and nothing about anyone\'s hours', () => {
    const { container } = render(<Router pathname="/team/" />)

    expect(screen.getByRole('heading', { level: 1, name: /^team/i })).toBeTruthy()
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/vision/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/how it works/i)
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

  it('keeps its videos playing across a re-render, so a tab or window coming back never restarts one', () => {
    // Every component react-markdown draws has to keep its identity between renders: a new one
    // remounts its subtree, and a remounted <video> flashes its poster and starts again from 0.
    const { container, rerender } = render(<Router pathname="/multiplayer/" />)
    const before = [...container.querySelectorAll('video')]
    expect(before.length).toBeGreaterThan(0)
    rerender(<Router pathname="/multiplayer/" />)
    const after = [...container.querySelectorAll('video')]
    expect(after.every((video, index) => video === before[index])).toBe(true)
  })

  it('opens Your team with Multiplayer, the overview that links down to bots, tasks, and the feed; the table is on its Compare page', () => {
    const team = listedDocumentsForProduct('desktop').filter((document) => document.group === 'Your team')
    expect(team[0].path).toBe('multiplayer')
    const { container, unmount } = render(<Router pathname="/multiplayer/" />)
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/quick start/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/bots that own a job/i)
    const content = container.querySelector('.document-content')!
    // h1, the thesis as its pull quote, the film, which opens the story, then the prose and the four things a team shares.
    const top = [...content.children].slice(0, 4)
    expect(top[0].tagName).toBe('H1')
    expect(top[1].className).toBe('document-thesis')
    expect(top[1].textContent).toBe('Your team already works through agents. Give that work one address.')
    expect(top[2].querySelector('video.autoplay-clip')).not.toBeNull()
    expect(top[3].textContent).toMatch(/^A lot of a team's work now starts as a conversation with an agent\./)
    expect([...content.querySelector('ul')!.querySelectorAll(':scope > li > a:first-child')].map((link) => link.textContent)).toEqual(['Tasks', 'Bots', 'The feed', 'Shared lists, documents, and calendars'])
    const film = content.querySelector('video.autoplay-clip')!
    expect(film.getAttribute('src')).toBe('/video/multiplayer/clip.mp4')
    expect(film.getAttribute('poster')).toBe('/video/multiplayer/poster.webp')
    expect(film.hasAttribute('loop')).toBe(true)
    expect(content.querySelectorAll('video')).toHaveLength(1)
    for (const href of ['/tasks/', '/bots/', '/feed/', '/permissions/', '/computers/']) {
      expect(content.querySelector(`a[href="${href}"]`), href).not.toBeNull()
    }
    const sections = [...content.querySelectorAll('h2')].map((heading) => heading.textContent?.replace(/#$/, ''))
    expect(sections).toEqual(['It asks the right person', 'Who can do what, and where it runs', 'The details', 'Shared todo lists, documents, and calendars', 'Use it from your phone', 'Run your own team server'])
    // No competitor on a reading-path page, not even a link line: Compare is in the sidebar.
    expect(content.querySelector('table')).toBeNull()
    expect(content.querySelector('a[href="/cursor-projects-claude-team-capy/"]')).toBeNull()
    const text = content.textContent!
    expect(text).not.toMatch(/Capy AI|ChatGPT shared projects|Claude Projects/)
    expect(text).not.toMatch(/Anyone can steer|on Desktop and on your phone|no invite button/)
    // People-chat Surfaces are not advertised yet.
    expect(text).not.toMatch(/calendars, and chats|chats among people/)
    // It sells what a teammate sees and does; the engineering lives in the guide, linked once.
    expect(text).not.toMatch(/WorkOS|Tailcat|AppArmor|WireGuard|401|happy\.toml/)
    expect([...content.querySelectorAll('a[href="/guides/team-server/"]')]).toHaveLength(1)
    // Setup and invite prompts sit with the server section at the bottom.
    const prompts = [...content.querySelectorAll('.cos-prompt')]
    expect(prompts).toHaveLength(2)
    expect(prompts[0].textContent).toMatch(/To start a team, simply ask the Chief of Staff:/)
    expect(prompts[0].querySelector('.cos-prompt-text')?.textContent).toBe('Create a team called Acme on my server ubuntu@203.0.113.10')
    expect(prompts[1].textContent).toMatch(/To add teammates, simply ask the Chief of Staff:/)
    expect([...prompts[1].querySelectorAll('.cos-prompt-text')].map((prompt) => prompt.textContent)).toEqual(['Invite bob@example.com to the Acme team', 'Connect me to the Acme team'])
    for (const prompt of prompts) expect(content.querySelector('#run-your-own-team-server')!.compareDocumentPosition(prompt) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    unmount()

    // The comparison quotes each vendor in a few words; its sources and dates are one line under it.
    const compare = render(<Router pathname="/cursor-projects-claude-team-capy/" />)
    const table = compare.container.querySelector('.document-content table')!
    expect([...table.querySelectorAll('thead th')].map((cell) => cell.textContent)).toEqual(['', 'Cursor Projects', 'Claude Projects, Team plan', 'ChatGPT shared projects', 'Capy AI', 'Happy'])
    expect(table.querySelector('tbody th, tbody td')?.textContent).toBe('Working together')
    expect(table.querySelectorAll('a')).toHaveLength(0)
    for (const cell of table.querySelectorAll('tbody td')) expect(cell.textContent!.split(/\s+/).length, cell.textContent!).toBeLessThanOrEqual(20)
    const sources = table.closest('.document-table-wrap')!.nextElementSibling!
    expect(sources.textContent).toMatch(/^Quoted from Cursor.*Nov 10, 2026.*Sep 10, 2026.*updated Nov 6, 2026.*read Nov 10, 2026\. Capy's.*updated Oct 24, 2026.*read Nov 13, 2026\.$/)
    expect(sources.querySelectorAll('a')).toHaveLength(12)
    expect(compare.container.querySelector('#where-they-are-better')).not.toBeNull()
    expect(getDocument('desktop', 'cursor-projects-claude-team-capy')!.group).toBe('Compare')
    compare.unmount()

    const guide = getDocument('desktop', 'guides/team-server')!
    expect(guide.group).toBe('Guides')
    expect(guide.description.length).toBeLessThanOrEqual(160)
    expect(getDocument('desktop', 'multiplayer')!.description.length).toBeLessThanOrEqual(160)
    const markup = renderPath('/guides/team-server/')
    // The architecture diagram moved here, drawn inline in the card style, with everything the old page explained.
    expect(markup).toContain('class="inline-diagram"')
    for (const id of ['how-members-sign-in', 'how-desktop-and-phones-reach-the-server', 'whose-claude-codex-and-grok-accounts-pay', 'sandbox-and-review-on-a-shared-server', 'what-the-team-owner-can-do', 'set-up-a-team-server', 'join-or-leave-a-team', 'share-your-own-computer-with-someone', 'what-we-haven-t-built-yet']) {
      expect(markup, id).toContain(`<h2 id="${id}">`)
    }
    // The guide is about the self-hosted server only: no self-versus-cloud framing.
    expect(markup).not.toMatch(/cloud|hosted option|Happy-hosted/i)
  })

  it('lists Secrets under the hood after Workspaces, with a search title and description that fit', () => {
    render(<Router pathname="/secrets/" />)

    expect(screen.getAllByRole('heading', { level: 1 }).map((heading) => heading.id)).toEqual(['secrets'])
    expect(screen.getByRole('link', { name: /^previous/i }).textContent).toMatch(/projects & workspaces/i)
    expect(screen.getByRole('link', { name: /^next/i }).textContent).toMatch(/skills & mcp/i)
    const secrets = getDocument('desktop', 'secrets')!
    expect(secrets.group).toBe('Under the hood')
    expect(secrets.pageTitle?.length).toBeLessThanOrEqual(65)
    expect(secrets.description.length).toBeLessThanOrEqual(155)
    expect(metadataForPath('/secrets/').title).toBe(secrets.pageTitle)
    const markup = renderPath('/secrets/')
    // Every section the page promises, and no source list closes the page.
    for (const heading of ['One secret catalog per installation', 'Create and update a secret', 'What the model sees, and never sees', 'Attach a secret to an agent, workspace, or project', 'How a command receives a secret', 'Secrets, the sandbox, and Auto review', 'Where secrets are stored on disk', 'Secrets in Happy Desktop', 'What team members can do with secrets']) {
      expect(markup).toContain(`>${heading}<`)
    }
    // The comparison moved whole to its Compare page, linked in one line; it links each other project's own docs.
    expect(markup).toContain('href="/hermes-agent-openclaw-secrets/"')
    const comparison = renderPath('/hermes-agent-openclaw-secrets/')
    expect(comparison).toContain('>How Happy compares with Hermes Agent and OpenClaw<')
    for (const href of [
      'https://hermes-agent.nousresearch.com/docs/user-guide/secrets/',
      'https://docs.openclaw.ai/gateway/secrets/secret-store-and-egress',
      'https://docs.openclaw.ai/tools/secrets',
    ]) {
      expect(comparison).toContain(`href="${href}"`)
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

  it('lists Blog after Compare, collapsed Changelog next and the one Recipes link last; keeps the old Blog URLs', () => {
    render(<Router pathname="/workos/" />)

    const [sidebar] = screen.getAllByRole('navigation', { name: 'Documentation navigation' })
    const groups = [...sidebar.querySelectorAll('.docs-nav-group > h2, .docs-nav-fold > summary')]
    expect(groups.map((heading) => heading.textContent)).toEqual(['Start here', 'Your team', 'The app', 'Where this goes', 'Under the hood', 'Guides', 'Compare', 'Blog', 'Changelog', 'For agents'])
    const posts = within(groups.find((heading) => heading.textContent === 'Blog')!.closest('section')!).getAllByRole('link').map((link) => link.getAttribute('href'))
    expect(posts).toEqual(['/workos/', '/tailcat/', '/updates/', '/stem-cell/'])
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

  it('folds the changelog by default and shows the recipes as one link, every recipe page still served', () => {
    const markup = renderPath('/recepies/')
    const parsed = new DOMParser().parseFromString(markup, 'text/html')
    // Two copies of the navigation: the sidebar and the phone menu.
    const folds = parsed.querySelectorAll('details.docs-nav-fold')
    expect(folds).toHaveLength(2)
    for (const fold of folds) {
      expect(fold.hasAttribute('open')).toBe(false)
      expect(fold.querySelector('summary')?.textContent).toBe('Changelog')
      expect(fold.querySelectorAll('a')).toHaveLength(1)
    }
    const [sidebar] = parsed.querySelectorAll('nav.docs-navigation')
    const forAgents = [...sidebar.querySelectorAll('.docs-nav-group')].find((section) => section.querySelector('h2')?.textContent === 'For agents')!
    expect([...forAgents.querySelectorAll('a')].map((link) => [link.textContent, link.getAttribute('href')])).toEqual([['Recipes', '/recepies/']])
    // An open recipe shows under the one link, which marks where you are; the index lists them all.
    const recipe = new DOMParser().parseFromString(renderPath('/recepies/runner/'), 'text/html').querySelector('nav.docs-navigation')!
    const recipeGroup = [...recipe.querySelectorAll('.docs-nav-group')].find((section) => section.querySelector('h2')?.textContent === 'For agents')!
    expect([...recipeGroup.querySelectorAll('a')].map((link) => [link.textContent, link.getAttribute('aria-current')])).toEqual([['Recipes', 'true'], ['Add a dedicated runner', 'page']])
    for (const file of recipeSources.files) expect(prerenderedPaths).toContain(`/${file.route}/`)
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
    expect(page.querySelectorAll('details.docs-nav-fold')).toHaveLength(2)
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

  it('labels experimental releases in the page and share title and keeps the release index newest first', () => {
    const index = new DOMParser().parseFromString(renderPath('/changelog/'), 'text/html')
    expect([...index.querySelectorAll('article h2')].map((heading) => heading.id)).toEqual([
      'gpt-6-1-terra', 'stem-cells', 'updates-without-interruption', 'initial-core-release',
    ])
    expect(index.querySelector('#stem-cells .changelog-beta')?.textContent).toBe('Beta')
    expect(index.querySelector('#gpt-6-1-terra .changelog-beta')).toBeNull()
    const path = '/changelog/stem-cells/'
    const page = new DOMParser().parseFromString(renderPath(path), 'text/html')
    expect(page.querySelector('article h1 .changelog-beta')?.textContent).toBe('Beta')
    expect(page.querySelector('article')?.textContent).toContain('Settings → Experimental → Stem cells')
    expect(metadataForPath(path)).toMatchObject({ canonicalPath: path, socialTitle: 'Stem cells (Beta)' })
    for (const slug of ['stem-cells', 'updates-without-interruption', 'initial-core-release']) {
      expect(prerenderedPaths).toContain(`/changelog/${slug}/`)
    }
  })

  it('opens Quick Start on the downloads, then teaches repositories, tasks, and bots, with prompts the Chief of Staff page documents', () => {
    const markup = renderPath('/quick-start/')
    const download = markup.indexOf('class="happy-one document-download"')
    expect(download).toBeGreaterThan(markup.indexOf('class="document-thesis"'))
    expect(download).toBeLessThan(markup.indexOf('<p>You need macOS'))
    const headings = [...markup.matchAll(/<h2 id="([^"]+)"/g)].map(([, id]) => id)
    expect(headings).toEqual(['repositories', 'tasks', 'bots', 'then-bring-your-team', 'install-notes'])
    // The app's word "project" appears once, where the reader meets it in the UI (DESIGN.md, Copy);
    // the old anchor #first-project is kept for links to it, not read.
    expect(markup.replace(/<[^>]*>/g, ' ').match(/\bproject\b/gi)).toHaveLength(1)
    const prompts = (path: string) => [...renderPath(path).matchAll(/<p class="cos-prompt-text">([^<]+)<\/p>/g)].map(([, prompt]) => prompt)
    const documented = [...prompts('/chief-of-staff/'), ...prompts('/guides/team-server/')]
    expect(prompts('/quick-start/').filter((prompt) => !documented.includes(prompt))).toEqual([])
    // Stills in Tasks and Bots, none in Repositories: one picture each, so the browser fetches one file,
    // the desktop cut on a wide screen and the phone cut elsewhere, each in the system's scheme.
    const stills = [...markup.matchAll(/<span class="doc-still" data-still="([^"]+)">[\s\S]*?<picture>([\s\S]*?)<\/picture>/g)]
    expect(stills.map(([, name]) => name)).toEqual(['quick-start-task-tree', 'quick-start-chief-of-staff'])
    for (const [, name, picture] of stills) {
      const files = [...picture.matchAll(/(?:srcSet|src)="\/img\/docs\/([^"]+)"/g)].map(([, file]) => file)
      expect(files).toEqual([`${name}.desktop.dark.avif`, `${name}.desktop.light.avif`, `${name}.phone.dark.avif`, `${name}.phone.light.avif`])
      expect(picture).toMatch(/<source media="\(prefers-color-scheme: dark\) and \(min-width: \d+px\)"/)
    }
    // Its first picture is in Tasks, below the fold: lazy, sized before it loads. Welcome's window, in its opening, loads with the page.
    expect(markup).toMatch(/<img src="\/img\/docs\/quick-start-task-tree.phone.light.avif" alt="[^"]+" width="345" height="352" loading="lazy"/)
    expect(renderPath('/welcome/')).toMatch(/<img src="\/img\/docs\/welcome-window.webp" alt="[^"]+" width="2266" height="1600" loading="eager"/)
  })

  it('puts a copyable Chief of Staff prompt right after the intro of every page it can help with', () => {
    const withPrompt = ['quick-start', 'chief-of-staff', 'models', 'permissions', 'secrets', 'workspaces', 'agents', 'mobile', 'multiplayer', 'extending', 'guides/configuration', 'guides/remote-server', 'guides/team-server', 'migrate']
    for (const document of documentsForProduct('desktop')) {
      const markup = renderPath(`/${document.path}/`)
      const block = markup.indexOf('<aside class="cos-prompt"')
      if (!withPrompt.includes(document.path)) {
        expect(block, document.path).toBe(-1)
        continue
      }
      // The prompt is plain text in the served page, before the reference sections; Quick Start's sit in its Repositories, Bots, and team sections.
      expect(block, document.path).toBeGreaterThan(markup.indexOf('<h1'))
      // Multiplayer keeps setup in its server section; Quick Start has its own sequence of steps.
      // A reading-path page whose story runs to several sections carries it at the top of The details.
      const details = markup.indexOf('<h2 id="the-details"')
      if (document.path === 'permissions') {
        expect(block, document.path).toBeGreaterThan(details)
        expect(block, document.path).toBeLessThan(markup.indexOf('<h2', details + 1))
      } else if (document.path !== 'quick-start' && document.path !== 'multiplayer') {
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

  it('dresses every page but the homepage and the benchmarks in the homepage palette, with only a corner of gradient', () => {
    for (const path of ['/welcome/', '/workos/', '/docs/', '/privacy/', '/plugins/', '/plugins/memes/', '/plugins/terms/', '/no-such-page/']) {
      const { container, unmount } = render(<Router pathname={path} />)
      const shell = container.firstElementChild!
      expect(shell.classList.contains('site-theme'), path).toBe(true)
      expect(shell.firstElementChild?.className, path).toBe('site-grain')
      unmount()
    }
    // The browser's toolbar takes the pages' base colour, light or dark.
    const themeColors = [...readFileSync('index.html', 'utf8').matchAll(/<meta name="theme-color" content="([^"]+)" media="([^"]+)" \/>/g)]
    expect(themeColors.map(([, color, media]) => [color, media])).toEqual([
      ['#f4f2ff', '(prefers-color-scheme: light)'],
      ['#06050f', '(prefers-color-scheme: dark)'],
    ])
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
