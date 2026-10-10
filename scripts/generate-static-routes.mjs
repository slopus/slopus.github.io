import { execFileSync } from 'node:child_process'
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

// Pages that ship their rendered markup, and the app's own docs registry and page
// metadata, so the served head matches what the client sets. Built by `vite build --ssr`.
const {
  APP_STORE_LINK,
  documentHeading,
  documentHref,
  documents,
  GOOGLE_PLAY_LINK,
  HAPPY,
  HAPPY_DESKTOP,
  metadataForPath,
  prerenderedPaths,
  renderPath,
} = await import(pathToFileURL(path.join(projectRoot, 'dist-ssr', 'prerender.js')).href)

// routes.txt is the committed record of every URL this site has ever served; see the check at the end.
const routesFile = path.join(projectRoot, 'routes.txt')
const routesSource = await readFile(routesFile, 'utf8').catch(() => '')
const declaredRoutes = routesSource.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#'))

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

function prerendered(pathname) {
  if (!prerenderedPaths.includes(pathname)) {
    throw new Error(`${pathname} ships its markup; add it to prerenderedPaths in src/prerender.tsx.`)
  }
  return renderPath(pathname)
}

// <lastmod> is the date of the last commit that touched a page's sources. A
// shallow checkout cannot tell, and an uncommitted file has no commit, so
// those fall back to the build date.
function git(...args) {
  try {
    return execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return ''
  }
}
const buildDate = new Date().toISOString().slice(0, 10)
const historyAvailable = git('rev-parse', '--is-shallow-repository') === 'false'
function lastModified(sources) {
  return (historyAvailable && git('log', '-1', '--format=%cs', '--', ...sources)) || buildDate
}

let documentRoutes = 0
// Indexable canonical URLs and the files each is built from, written to sitemap.xml at the end.
const sitemapPages = [{ route: '/', sources: ['index.html', 'src/DesktopApp.tsx'] }]

// Every docs page ships its rendered markup, so crawlers that do not run
// JavaScript read it, under its own title and description from src/documents.ts.
// The desktop docs moved to the top level from /desktop/docs/ and /happy2/docs/.
// Those prefixes keep serving the pages they had, as routes.txt records, each
// canonical to its new URL; pages added since live only at the top level.
const legacyDocsRoots = ['/desktop/docs', '/happy2/docs']

function assertDocumentServed(route, html, heading) {
  const app = html.slice(html.indexOf('<div id="app">'))
  const headings = app.match(/<h1[\s>][\s\S]*?<\/h1>/g) ?? []
  if (headings.length !== 1) {
    throw new Error(`${route} should render exactly one h1, not ${headings.length}`)
  }
  if (!textOfHtml(headings[0]).includes(heading)) {
    throw new Error(`${route} should render its title "${heading}" as its h1`)
  }
}

for (const document of documents) {
  const product = document.product === HAPPY_DESKTOP.key ? HAPPY_DESKTOP : HAPPY
  const canonicalPath = documentHref(product, document.path)
  const html = withAppMarkup(htmlForPage(metadataForPath(canonicalPath)), prerendered(canonicalPath))
  assertDocumentServed(canonicalPath, html, documentHeading(document))

  await writeRoute(canonicalPath, html)
  documentRoutes += 1
  // Unlisted pages (hidden: true) are noindex and stay out of the sitemap.
  if (!document.hidden) {
    sitemapPages.push({ route: canonicalPath, sources: [document.sourcePath.slice(1)] })
  }

  if (product === HAPPY_DESKTOP) {
    for (const root of legacyDocsRoots) {
      const legacyPath = canonicalPath === HAPPY_DESKTOP.docsHome ? `${root}/` : `${root}${canonicalPath}`
      if (declaredRoutes.includes(legacyPath)) {
        await writeRoute(legacyPath, html)
        documentRoutes += 1
      }
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

// GitHub Pages answers /model-benchmarks with a redirect to /model-benchmarks/, so that is the canonical.
await writeRoute('model-benchmarks', htmlForPage(metadataForPath('/model-benchmarks/')))

// The Buzz comparison moved into the Happy Desktop section; keep the announced URL resolving.
await writeRoute(
  'docs/comparisons/happy-2-vs-buzz',
  withAppMarkup(htmlForPage(metadataForPath('/docs/comparisons/happy-2-vs-buzz/')), prerendered('/comparisons/buzz/')),
)

sitemapPages.push(
  { route: '/model-benchmarks/', sources: ['src/model-benchmarks.json', 'src/ModelBenchmarksPage.tsx'] },
  { route: '/privacy/', sources: ['content/legal/privacy.md'] },
  { route: '/terms/', sources: ['content/legal/terms.md'] },
)
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

// The plugin directory reads these pages without running JavaScript, so they
// ship their rendered markup and the app hydrates it.
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
  sitemapPages.push({ route: canonicalPath, sources: [policySources[route] ?? 'src/PluginPages.tsx'] })
}

// The Vision essay was published at /thesis/, and the blog index lived at /blog/
// briefly with it as its only post. Both are in routes.txt, so both redirect to /vision/.
await writeRoute('thesis', redirectHtml('/vision/'))
await writeRoute('blog', redirectHtml('/vision/'))

// The Remote Agents guide became the remote server guide; its URLs, old prefixes included, redirect.
for (const route of ['guides/remote-agents', 'desktop/docs/guides/remote-agents', 'happy2/docs/guides/remote-agents']) {
  await writeRoute(route, redirectHtml('/guides/remote-server/'))
}

// The Vision essay is a docs page (src/documents.ts), written by the docs loop above.
const visionHtml = await readFile(path.join(distRoot, 'vision', 'index.html'), 'utf8')
const visionApp = visionHtml.slice(visionHtml.indexOf('<div id="app">'))
const visionSource = await readFile(path.join(projectRoot, 'content', 'thesis.md'), 'utf8')
if (!visionApp.includes('href="/vision/" aria-current="page">Vision</a>')) {
  throw new Error('/vision/ should be the current page in the docs sidebar')
}
// The essay's images ship from public/; the build fails if one is missing or not rendered.
// An image line may carry a quoted title after the path; that title is its caption.
for (const [, imagePath] of visionSource.matchAll(/^!\[[^\]]*\]\((\/[^)\s]+)(?: "[^"]*")?\)$/gm)) {
  await readFile(path.join(distRoot, imagePath))
  if (!visionApp.includes(`src="${imagePath}"`)) {
    throw new Error(`/vision/ should render the image ${imagePath}`)
  }
}

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
${sitemapPages.map(({ route, sources }) => `  <url><loc>${escapeHtml(new URL(route, siteUrl).toString())}</loc><lastmod>${lastModified(sources)}</lastmod></url>`).join('\n')}
</urlset>
`,
)

// llms.txt (https://llmstxt.org): what Happy is and where its docs are, for language models.
const absoluteUrl = (route) => new URL(route, siteUrl).toString()
function docsLinks(product) {
  return documents
    .filter((document) => document.product === product.key && !document.hidden)
    .map((document) => `- [${document.title}](${absoluteUrl(documentHref(product, document.path))}): ${document.description}`)
}
await writeFile(path.join(distRoot, 'llms.txt'), `# Happy

> ${metadataForPath('/').description}

Happy Desktop is the current product: a desktop app with its own agent runtime, free and MIT licensed, for macOS, Windows, and Linux. The Happy mobile app for iOS and Android works with it. The docs for the original Happy CLI (Happy Coder, \`happy\` on npm) at ${absoluteUrl(HAPPY.docsHome)} are in maintenance mode: it keeps working and gets critical fixes, but new features ship in Happy Desktop.

## Happy Desktop docs

${docsLinks(HAPPY_DESKTOP).join('\n')}

## Download

- [Happy Desktop for macOS, Windows, and Linux](https://github.com/slopus/happy-desktop/releases/latest): the latest release. Also on ${absoluteUrl('/#download')}.
- [Happy for iPhone and iPad](${APP_STORE_LINK}): App Store.
- [Happy for Android](${GOOGLE_PLAY_LINK}): Google Play.
- [Source code](${HAPPY_DESKTOP.repository}): MIT licensed.

## Optional

${docsLinks(HAPPY).map((line) => line.replace(/^- \[/, '- [Original Happy CLI: ')).join('\n')}
`)

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
const routesHeader = [
  '# Every URL happy.engineering serves, one per line, kept by scripts/generate-static-routes.mjs.',
  '# The build adds new URLs here and fails if a listed URL is no longer served.',
  '# Dropping a URL is a decision: redirect it or delete its line in the same commit.',
]
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
for (const { route } of sitemapPages) {
  if (!served.has(route)) {
    throw new Error(`sitemap.xml lists ${route}, which this build does not serve at that exact URL.`)
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

console.log(`Generated ${documentRoutes + 9 + pluginPages.length} static routes, a ${sitemapPages.length}-URL sitemap, and llms.txt.`)
