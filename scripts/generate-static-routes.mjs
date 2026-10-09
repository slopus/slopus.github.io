import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const projectRoot = process.cwd()
const distRoot = path.join(projectRoot, 'dist')
const baseHtml = await readFile(path.join(distRoot, 'index.html'), 'utf8')
// Link previews read these tags straight from the served HTML, so every page must carry them.
for (const tag of ['name="description"', 'property="og:description"', 'property="og:image"', 'name="twitter:description"', 'name="twitter:image"']) {
  if (!new RegExp(`<meta ${tag} content="[^"]+"`).test(baseHtml)) {
    throw new Error(`dist/index.html is missing a one-line <meta ${tag} content="..."> tag.`)
  }
}
// The homepage's head, reused by the redirect pages so shared old URLs still preview.
const socialTags = baseHtml.match(/<meta (?:property="og:|name="twitter:)[^>]*\/>/g).join('\n    ')
const siteUrl = 'https://happy.engineering'

const docsSections = [
  {
    contentRoot: path.join(projectRoot, 'content', 'docs'),
    routeRoot: 'docs',
    canonicalRoot: '/docs',
    indexTitle: 'Happy Coder Docs — Claude Code & Codex Mobile App (Original CLI)',
    titleSuffix: 'Happy Coder Docs',
    description:
      'Docs for the original Happy CLI (Happy Coder): use Claude Code and Codex from your iPhone, Android, or the web. Maintenance mode; new features ship in the Happy desktop app.',
  },
  {
    // Top-level pages: /welcome/, /quick-start/, /guides/terminal/. The old
    // prefixes keep serving every page, each canonical to its top-level URL.
    contentRoot: path.join(projectRoot, 'content', 'desktop'),
    routeRoot: '',
    indexRoute: 'welcome',
    legacyRouteRoots: [path.posix.join('desktop', 'docs'), path.posix.join('happy2', 'docs')],
    canonicalRoot: '',
    indexTitle: 'Happy Docs — The Open Source Desktop App for Coding Agents',
    titleSuffix: 'Happy Desktop Docs',
    description:
      'Install Happy on macOS, Windows, or Linux, run Claude, Codex, and Grok in one harness, pair your phone, and understand permissions, workspaces, teams, and plugins.',
  },
]

async function findMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? findMarkdownFiles(entryPath) : [entryPath]
  }))

  return files.flat().filter((file) => file.endsWith('.mdx'))
}

function titleFromFilename(filename) {
  return filename
    .replace(/\.mdx$/, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function replaceMeta(html, attribute, name, content) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const expression = new RegExp(
    `(<meta\\s+${attribute}="${escapedName}"\\s+content=")[^"]*("\\s*\\/?>)`,
  )
  return html.replace(expression, `$1${escapeHtml(content)}$2`)
}

function htmlForPage({
  title,
  description,
  canonicalPath,
  socialTitle = title,
  socialDescription = description,
  twitterDescription = socialDescription,
  robots = 'index, follow',
  socialImage,
}) {
  const canonicalUrl = new URL(canonicalPath, siteUrl).toString()
  let html = baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*("\s*\/?>)/,
      `$1${escapeHtml(canonicalUrl)}$2`,
    )
    .replace(/\s*<script id="software-application-schema"[\s\S]*?<\/script>/, '')

  html = replaceMeta(html, 'name', 'description', description)
  html = replaceMeta(html, 'name', 'robots', robots)
  html = replaceMeta(html, 'property', 'og:url', canonicalUrl)
  html = replaceMeta(html, 'property', 'og:title', socialTitle)
  html = replaceMeta(html, 'property', 'og:description', socialDescription)
  html = replaceMeta(html, 'name', 'twitter:title', socialTitle)
  html = replaceMeta(html, 'name', 'twitter:description', twitterDescription)
  if (socialImage) {
    const imageUrl = new URL(socialImage.path, siteUrl).toString()
    html = replaceMeta(html, 'property', 'og:image', imageUrl)
    html = replaceMeta(html, 'property', 'og:image:width', String(socialImage.width))
    html = replaceMeta(html, 'property', 'og:image:height', String(socialImage.height))
    html = replaceMeta(html, 'property', 'og:image:alt', socialImage.alt)
    html = replaceMeta(html, 'name', 'twitter:image', imageUrl)
    html = replaceMeta(html, 'name', 'twitter:image:alt', socialImage.alt)
  }
  return html
}

async function writeRoute(route, html) {
  if (!route || route === '.' || route === '/') {
    throw new Error('A route needs a path; dist/index.html is the homepage, built from index.html.')
  }
  const routeDirectory = path.join(distRoot, route)
  await mkdir(routeDirectory, { recursive: true })
  await writeFile(path.join(routeDirectory, 'index.html'), html)
}

let documentRoutes = 0
// Indexable canonical URLs, written to sitemap.xml at the end.
const sitemapPaths = ['/']

for (const section of docsSections) {
  const files = await findMarkdownFiles(section.contentRoot)

  for (const filename of files) {
    const relativePath = path.relative(section.contentRoot, filename).replace(/\\/g, '/')
    const documentPath = relativePath
      .replace(/\.mdx$/, '')
      .replace(/(^|\/)index$/, '')
      .replace(/\/$/, '')
    const markdown = await readFile(filename, 'utf8')
    const markdownTitle = markdown.match(/^#\s+(.+)$/m)?.[1].trim()
    const contentTitle = markdownTitle ?? titleFromFilename(path.basename(relativePath))
    const isIndex = documentPath === ''
    // A section without a prefix needs a slug for its index page.
    const route = documentPath || section.indexRoute || ''
    const canonicalPath = `${section.canonicalRoot}/${route ? `${route}/` : ''}`

    const html = htmlForPage({
      title: isIndex ? section.indexTitle : `${contentTitle} — ${section.titleSuffix}`,
      description: section.description,
      canonicalPath,
    })

    await writeRoute(path.posix.join(section.routeRoot, route), html)
    documentRoutes += 1
    // The Buzz comparison is unlisted (hidden: true in src/documents.ts).
    if (documentPath !== 'comparisons/buzz') {
      sitemapPaths.push(canonicalPath)
    }

    // The old URLs keep serving; each one canonicals to its new home and the app rewrites the path.
    for (const legacyRouteRoot of section.legacyRouteRoots ?? []) {
      await writeRoute(path.posix.join(legacyRouteRoot, documentPath), html)
      documentRoutes += 1
    }
  }
}

// The desktop page is the homepage now (dist/index.html, built from index.html).
// Its old URLs redirect there without JavaScript, so GitHub Pages serves a real
// redirect: a refresh, a canonical to /, and a script that keeps ?query and #hash.
const homepageTitle = baseHtml.match(/<title>(.*?)<\/title>/)[1]
const homepageDescription = baseHtml.match(/<meta name="description" content="([^"]*)"/)[1]
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"')

function redirectHtml(target) {
  const url = new URL(target, siteUrl).toString()
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${homepageTitle}</title>
    <meta name="description" content="${escapeHtml(homepageDescription)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
    ${socialTags}
    <meta http-equiv="refresh" content="0; url=${escapeHtml(target)}" />
    <script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
  </head>
  <body>
    <p>Happy moved to <a href="${escapeHtml(target)}">${escapeHtml(url)}</a>.</p>
  </body>
</html>
`
}

await writeRoute('desktop', redirectHtml('/'))
await writeRoute('happy2', redirectHtml('/'))
// The page was reviewed unlisted at this URL before it became the homepage.
await writeRoute('tmp/happy-one', redirectHtml('/'))

// Mirrors modelBenchmarksMetadata. No trailing slash in the picker’s public URL.
await writeRoute('model-benchmarks', htmlForPage({
  title: 'The Trust Me Bro Model Tier List — Happy',
  description: 'A curated AI model tier list, with exact-version evidence from X, strengths, caveats, and head-to-head comparisons. Subjective synthesis, not a lab benchmark.',
  canonicalPath: '/model-benchmarks',
}))

// The Buzz comparison moved into the Happy Desktop section; keep the announced URL resolving.
await writeRoute('docs/comparisons/happy-2-vs-buzz', htmlForPage({
  title: 'Happy Desktop vs Buzz — Happy Desktop Docs',
  description: "Where Happy Desktop and Block's Buzz agree, and where the designs split.",
  canonicalPath: '/comparisons/buzz/',
}))

sitemapPaths.push('/model-benchmarks', '/privacy/', '/terms/')
await writeRoute('privacy', htmlForPage({
  title: 'Privacy Policy — Happy',
  description: 'Privacy policy for Happy.',
  canonicalPath: '/privacy/',
}))
await writeRoute('terms', htmlForPage({
  title: 'Terms of Use — Happy',
  description: 'Terms of use for Happy.',
  canonicalPath: '/terms/',
}))
await writeRoute('tos', htmlForPage({
  title: 'Terms of Use — Happy',
  description: 'Terms of use for Happy.',
  canonicalPath: '/terms/',
}))

// Mirrors the plugin metadata in src/siteMetadata.ts. These are the plugin
// directory's listing URLs (website, terms, privacy); keep them resolving.
const pluginPages = [
  {
    route: 'plugins',
    title: 'Plugins — Happy',
    description: 'Plugins by Happy for ChatGPT and Codex.',
  },
  {
    route: 'plugins/memes',
    title: 'Happy Memes — Turn any moment into a meme',
    description: 'Make funny, postable image memes about news, launches, trends, and everyday moments. A skills-only plugin for ChatGPT and Codex.',
  },
  {
    route: 'plugins/privacy',
    title: 'Plugin Privacy Policy — Happy',
    description: 'Privacy policy for Happy plugins for ChatGPT and Codex, including Happy Memes.',
  },
  {
    route: 'plugins/terms',
    title: 'Plugin Terms of Use — Happy',
    description: 'Terms of use for Happy plugins for ChatGPT and Codex, including Happy Memes.',
  },
]

// The plugin directory reads these pages without running JavaScript, so they
// ship their rendered markup and the app hydrates it. Built by `vite build --ssr`.
const { prerenderedPaths, renderPath } = await import(
  pathToFileURL(path.join(projectRoot, 'dist-ssr', 'prerender.js')).href
)

function withAppMarkup(html, markup) {
  const emptyRoot = '<div id="app"></div>'
  if (!html.includes(emptyRoot)) {
    throw new Error('dist/index.html no longer has an empty #app root to prerender into.')
  }
  return html.replace(emptyRoot, () => `<div id="app">${markup}</div>`)
}

function textOfHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
}

// Fail the build unless every line of the policy reaches the served HTML.
async function assertPolicyServed(route, html, sourceFile) {
  const markdown = await readFile(path.join(projectRoot, sourceFile), 'utf8')
  const app = html.slice(html.indexOf('<div id="app">'))
  const text = textOfHtml(app)

  for (const line of markdown.split('\n')) {
    const expected = line
      .replace(/^#+\s+|^-\s+/, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (expected && expected !== '---' && !text.includes(expected)) {
      throw new Error(`/${route}/ is missing policy text from ${sourceFile}: "${expected}"`)
    }
  }
  for (const [, href] of markdown.matchAll(/\]\(([^)]+)\)/g)) {
    if (!app.includes(`href="${href}`)) {
      throw new Error(`/${route}/ is missing the link to ${href} from ${sourceFile}`)
    }
  }
  if (app.match(/<h1[\s>]/g)?.length !== 1) {
    throw new Error(`/${route}/ should render exactly one h1`)
  }
}

const policySources = {
  'plugins/privacy': 'content/legal/plugins/privacy.md',
  'plugins/terms': 'content/legal/plugins/terms.md',
}

for (const { route, title, description } of pluginPages) {
  const canonicalPath = `/${route}/`
  if (!prerenderedPaths.includes(canonicalPath)) {
    throw new Error(`${canonicalPath} is a plugin directory URL; add it to prerenderedPaths.`)
  }
  const html = withAppMarkup(htmlForPage({ title, description, canonicalPath }), renderPath(canonicalPath))
  if (policySources[route]) {
    await assertPolicyServed(route, html, policySources[route])
  }
  await writeRoute(route, html)
  sitemapPaths.push(canonicalPath)
}

// Mirrors blogMetadata in src/siteMetadata.ts. The index lists posts that live at their own top-level routes.
const blogHtml = withAppMarkup(htmlForPage({
  title: 'Blog — Happy',
  description: 'Writing from Happy Engineering on agents, the interfaces around them, and what we are betting on.',
  canonicalPath: '/blog/',
}), renderPath('/blog/'))
if (!blogHtml.includes('href="/thesis/"')) {
  throw new Error('/blog/ should list /thesis/')
}
await writeRoute('blog', blogHtml)
sitemapPaths.push('/blog/')

// Mirrors thesisMetadata in src/siteMetadata.ts.
const thesisHtml = withAppMarkup(htmlForPage({
  title: 'Our Thesis — Happy',
  description: 'One core agent, chat that left the chat, phone first, one harness, and open source with no lock-in. What Happy is betting on.',
  canonicalPath: '/thesis/',
}), renderPath('/thesis/'))
const thesisApp = thesisHtml.slice(thesisHtml.indexOf('<div id="app">'))
const thesisSource = await readFile(path.join(projectRoot, 'content', 'thesis.md'), 'utf8')
const thesisPostUrls = thesisSource.match(/^https:\/\/x\.com\/\S+$/gm) ?? []
if (thesisApp.match(/<h1[\s>]/g)?.length !== 1) {
  throw new Error('/thesis/ should render exactly one h1')
}
if ((thesisApp.match(/<blockquote class="twitter-tweet"/g) ?? []).length !== thesisPostUrls.length) {
  throw new Error('/thesis/ should render every X post in content/thesis.md as an embed')
}
// The essay's images ship from public/; the build fails if one is missing or not rendered.
// An image line may carry a quoted title after the path; that title is its caption.
for (const [, imagePath] of thesisSource.matchAll(/^!\[[^\]]*\]\((\/[^)\s]+)(?: "[^"]*")?\)$/gm)) {
  await readFile(path.join(distRoot, imagePath))
  if (!thesisApp.includes(`src="${imagePath}"`)) {
    throw new Error(`/thesis/ should render the image ${imagePath}`)
  }
}
await writeRoute('thesis', thesisHtml)
sitemapPaths.push('/thesis/')

await writeFile(
  path.join(distRoot, '404.html'),
  htmlForPage({
    title: 'Page not found — Happy',
    description: 'The requested Happy page could not be found.',
    canonicalPath: '/404.html',
    robots: 'noindex, follow',
  }),
)

await writeFile(
  path.join(distRoot, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths.map((route) => `  <url><loc>${escapeHtml(new URL(route, siteUrl).toString())}</loc></url>`).join('\n')}
</urlset>
`,
)

// Every URL the site serves, as a directory with an index.html, plus the homepage.
async function servedRoutes() {
  const routes = new Set()
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        await walk(entryPath)
      } else if (entry.name === 'index.html') {
        const relative = path.relative(distRoot, directory).split(path.sep).join('/')
        routes.add(relative ? `/${relative}/` : '/')
      }
    }
  }
  await walk(distRoot)
  return routes
}

// routes.txt is the committed record of every URL this site has ever served.
// The build may only add to it. A URL that stops being served fails the build:
// keep serving it, redirect it, or remove the line on purpose in the same commit.
const routesFile = path.join(projectRoot, 'routes.txt')
const routesHeader = [
  '# Every URL happy.engineering serves, one per line, kept by scripts/generate-static-routes.mjs.',
  '# The build adds new URLs here and fails if a listed URL is no longer served.',
  '# Dropping a URL is a decision: redirect it or delete its line in the same commit.',
]
const routesSource = await readFile(routesFile, 'utf8').catch(() => '')
const declaredRoutes = routesSource.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#'))
const served = await servedRoutes()
const droppedRoutes = declaredRoutes.filter((route) => !served.has(route))
if (droppedRoutes.length > 0) {
  throw new Error(
    `routes.txt lists URLs this build no longer serves:\n  ${droppedRoutes.join('\n  ')}\n`
    + 'Keep them serving (a page or a redirect page), or remove them from routes.txt on purpose.',
  )
}
const newRoutes = [...served].filter((route) => !declaredRoutes.includes(route))
if (newRoutes.length > 0) {
  const allRoutes = [...new Set([...declaredRoutes, ...newRoutes])].sort()
  await writeFile(routesFile, `${routesHeader.join('\n')}\n${allRoutes.join('\n')}\n`)
  console.log(`Added ${newRoutes.length} new URL(s) to routes.txt: ${newRoutes.join(', ')}`)
}
for (const route of sitemapPaths) {
  const asDirectory = route.endsWith('/') ? route : `${route}/`
  if (!served.has(asDirectory)) {
    throw new Error(`sitemap.xml lists ${route}, which this build does not serve.`)
  }
}

// Every internal link and asset reference in the built HTML must resolve within dist.
async function htmlFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await htmlFiles(entryPath))
    } else if (entry.name.endsWith('.html')) {
      files.push(entryPath)
    }
  }
  return files
}

async function existsInDist(pathname) {
  const target = path.join(distRoot, decodeURIComponent(pathname))
  const candidates = pathname.endsWith('/') ? [path.join(target, 'index.html')] : [target, path.join(target, 'index.html')]
  for (const candidate of candidates) {
    const found = await readFile(candidate).then(() => true, () => false)
    if (found) return true
  }
  return false
}

const brokenLinks = []
for (const file of await htmlFiles(distRoot)) {
  const html = await readFile(file, 'utf8')
  const pageRoute = `/${path.relative(distRoot, path.dirname(file)).split(path.sep).join('/')}/`.replace('//', '/')
  for (const [, value] of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
    const reference = value.replace(/&amp;/g, '&')
    if (/^(?:#|mailto:|tel:|data:|javascript:)/.test(reference) || reference === '') continue
    const url = new URL(reference, new URL(pageRoute, siteUrl))
    if (url.origin !== siteUrl) continue
    if (!await existsInDist(url.pathname)) {
      brokenLinks.push(`${pageRoute} -> ${reference}`)
    }
  }
}
if (brokenLinks.length > 0) {
  throw new Error(`Broken internal links in the built site:\n  ${[...new Set(brokenLinks)].join('\n  ')}`)
}

console.log(`Generated ${documentRoutes + 9 + pluginPages.length} static routes and a ${sitemapPaths.length}-URL sitemap.`)
