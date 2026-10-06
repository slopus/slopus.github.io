import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const projectRoot = process.cwd()
const distRoot = path.join(projectRoot, 'dist')
const baseHtml = await readFile(path.join(distRoot, 'index.html'), 'utf8')
const siteUrl = 'https://happy.engineering'

const docsSections = [
  {
    contentRoot: path.join(projectRoot, 'content', 'docs'),
    routeRoot: 'docs',
    canonicalRoot: '/docs',
    indexTitle: 'Happy Docs — Remote Control for Coding Agents',
    titleSuffix: 'Happy Docs',
    description:
      'Install, configure, self-host, and use Happy with Claude Code, Codex, and other coding agents across desktop, mobile, and web.',
  },
  {
    contentRoot: path.join(projectRoot, 'content', 'desktop'),
    routeRoot: path.posix.join('desktop', 'docs'),
    legacyRouteRoot: path.posix.join('happy2', 'docs'),
    canonicalRoot: '/desktop/docs',
    indexTitle: 'Happy Desktop Docs — The Open Source Harness for Coding Agents',
    titleSuffix: 'Happy Desktop Docs',
    description:
      'Install Happy Desktop, run Claude, Codex, and Grok in one harness, pair your phone, and understand permissions, workspaces, teams, and plugins.',
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
  const routeDirectory = path.join(distRoot, route)
  await mkdir(routeDirectory, { recursive: true })
  await writeFile(path.join(routeDirectory, 'index.html'), html)
}

let documentRoutes = 0

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

    const html = htmlForPage({
      title: isIndex ? section.indexTitle : `${contentTitle} — ${section.titleSuffix}`,
      description: section.description,
      canonicalPath: `${section.canonicalRoot}/${documentPath ? `${documentPath}/` : ''}`,
    })

    await writeRoute(path.posix.join(section.routeRoot, documentPath), html)
    documentRoutes += 1

    // The old URLs keep serving; each one canonicals to its new home and the app rewrites the path.
    if (section.legacyRouteRoot) {
      await writeRoute(path.posix.join(section.legacyRouteRoot, documentPath), html)
      documentRoutes += 1
    }
  }
}

// Mirrors desktopMetadata in src/siteMetadata.ts. The social image is the
// screenshot described in docs/happy-one-demo.md.
const desktopPage = {
  title: 'Any Model. Your Team. Happy Harness.',
  description: 'Multi-provider and natively multiplayer. Use your current subscriptions. Open source under MIT, with an end-to-end encrypted mobile app.',
  canonicalPath: '/desktop/',
  socialImage: {
    path: '/og/happy-harness-v23.png', width: 1200, height: 630,
    alt: 'Happy Harness model picker and paired phone, with Free and open source and 23.8k GitHub stars.',
  },
}

const desktopHtml = htmlForPage(desktopPage)

await writeRoute('desktop', desktopHtml)
await writeRoute('happy2', desktopHtml)

// Mirrors modelBenchmarksMetadata. No trailing slash in the picker’s public URL.
await writeRoute('model-benchmarks', htmlForPage({
  title: 'The Trust Me Bro Model Tier List — Happy',
  description: 'A curated AI model tier list, with exact-version evidence from X, strengths, caveats, and head-to-head comparisons. Subjective synthesis, not a lab benchmark.',
  canonicalPath: '/model-benchmarks',
}))

// The page was reviewed unlisted at this URL before it became /desktop/.
// Keep shared links working; the app rewrites the path on load.
await writeRoute('tmp/happy-one', htmlForPage({ ...desktopPage, robots: 'noindex, nofollow' }))

// The Buzz comparison moved into the Happy Desktop section; keep the announced URL resolving.
await writeRoute('docs/comparisons/happy-2-vs-buzz', htmlForPage({
  title: 'Happy Desktop vs Buzz — Happy Desktop Docs',
  description: "Where Happy Desktop and Block's Buzz agree, and where the designs split.",
  canonicalPath: '/desktop/docs/comparisons/buzz/',
}))

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
}

// Mirrors thesisMetadata in src/siteMetadata.ts. Unlisted: reachable here, linked from nowhere.
const thesisHtml = withAppMarkup(htmlForPage({
  title: 'Happy: Muse for agentmaxxers',
  description: "Soon you'll talk to one agent, and it will run all your other agents.",
  canonicalPath: '/thesis/',
}), renderPath('/thesis/'))
const thesisApp = thesisHtml.slice(thesisHtml.indexOf('<div id="app">'))
const thesisPostUrls = (await readFile(path.join(projectRoot, 'content', 'thesis.md'), 'utf8'))
  .match(/^https:\/\/x\.com\/\S+$/gm) ?? []
if (thesisApp.match(/<h1[\s>]/g)?.length !== 1) {
  throw new Error('/thesis/ should render exactly one h1')
}
if (thesisApp.match(/<blockquote class="twitter-tweet"/g)?.length !== thesisPostUrls.length) {
  throw new Error('/thesis/ should render every X post in content/thesis.md as an embed')
}
await writeRoute('thesis', thesisHtml)

await writeFile(
  path.join(distRoot, '404.html'),
  htmlForPage({
    title: 'Page not found — Happy',
    description: 'The requested Happy page could not be found.',
    canonicalPath: '/404.html',
    robots: 'noindex, follow',
  }),
)

console.log(`Generated ${documentRoutes + 9 + pluginPages.length} static routes.`)
