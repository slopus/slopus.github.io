import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const docsRoot = path.join(projectRoot, 'content', 'docs')
const distRoot = path.join(projectRoot, 'dist')
const baseHtml = await readFile(path.join(distRoot, 'index.html'), 'utf8')

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

function htmlForPage(title, description) {
  return baseHtml
    .replace(/<title>.*?<\/title>/, `<title>${title} — Happy</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/, `$1${description}$2`)
}

async function writeRoute(route, html) {
  const routeDirectory = path.join(distRoot, route)
  await mkdir(routeDirectory, { recursive: true })
  await writeFile(path.join(routeDirectory, 'index.html'), html)
}

const docsFiles = await findMarkdownFiles(docsRoot)

for (const filename of docsFiles) {
  const relativePath = path.relative(docsRoot, filename).replace(/\\/g, '/')
  const documentPath = relativePath
    .replace(/\.mdx$/, '')
    .replace(/(^|\/)index$/, '')
    .replace(/\/$/, '')
  const markdown = await readFile(filename, 'utf8')
  const markdownTitle = markdown.match(/^#\s+(.+)$/m)?.[1].trim()
  const fallbackName = path.basename(relativePath)
  const title = markdownTitle ?? titleFromFilename(fallbackName)
  await writeRoute(
    path.posix.join('docs', documentPath),
    htmlForPage(title, `Happy documentation: ${title}.`),
  )
}

await writeRoute('privacy', htmlForPage('Privacy Policy', 'Privacy policy for Happy.'))
await writeRoute('terms', htmlForPage('Terms of Use', 'Terms of use for Happy.'))
await writeRoute('tos', htmlForPage('Terms of Use', 'Terms of use for Happy.'))
await writeFile(
  path.join(distRoot, '404.html'),
  htmlForPage('Page not found', 'The requested Happy page could not be found.'),
)

console.log(`Generated ${docsFiles.length + 3} static document routes.`)