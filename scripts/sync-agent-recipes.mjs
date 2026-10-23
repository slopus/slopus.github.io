import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Copy the instructions byte for byte; URL resolution belongs to the renderer.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const checkout = process.argv[2]
if (!checkout) throw new Error('Usage: node scripts/sync-agent-recipes.mjs /path/to/happy-agent')
const revision = execFileSync('git', ['-C', checkout, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
const recipes = {
  index: 'README.md',
  'first-project': 'first-project.md',
  'mobile-access': 'mobile-access.md',
  'accounts-and-models': 'accounts-and-models.md',
  harnesses: 'harnesses.md',
  wsl: 'setup-wsl-agent.md',
  telegram: 'exported-bot-telegram.md',
  'chat-bridge': 'exported-bot-bridge.md',
  'bot-settings': 'bot-settings.md',
  'shared-app': 'artifact-apps.md',
  'peer-messaging': 'peer-messaging.md',
  'rest-api': 'happy-rest-api.md',
  'remote-agent': 'deploy-standalone-remote.md',
  team: 'deploy-happy-team.md',
  runner: 'add-runner.md',
  hardening: 'harden-node.md',
  'enterprise-sign-in': 'enterprise-jwt-authentication.md',
  upgrade: 'upgrade-happy-agent.md',
}
const upstream = execFileSync('git', ['-C', checkout, 'ls-tree', '-r', '--name-only', revision, '--', 'docs/recipe/'], { encoding: 'utf8' })
  .trim().split('\n').filter((file) => file.endsWith('.md')).sort()
const expected = Object.values(recipes).map((file) => `docs/recipe/${file}`).sort()
const added = upstream.filter((file) => !expected.includes(file))
const removed = expected.filter((file) => !upstream.includes(file))
if (added.length || removed.length) {
  throw new Error(`Recipe catalog changed; update the mapping and preserve existing URLs before syncing. Added: ${added.join(', ') || 'none'}. Removed: ${removed.join(', ') || 'none'}.`)
}
const files = []
for (const [slug, filename] of Object.entries(recipes)) {
  const source = `docs/recipe/${filename}`
  // Read the committed snapshot, rather than silently publishing local source edits.
  const content = execFileSync('git', ['-C', checkout, 'show', `${revision}:${source}`])
  const target = `content/desktop/recepies/${slug}.mdx`
  await writeFile(path.join(root, target), content)
  files.push({ route: slug === 'index' ? 'recepies' : `recepies/${slug}`, source, target, sha256: createHash('sha256').update(content).digest('hex') })
}
await writeFile(path.join(root, 'content/desktop/recepies/sources.json'), `${JSON.stringify({ repository: 'https://github.com/slopus/happy-agent', revision, files }, null, 2)}\n`)
// Keep navigation labels aligned with the actual recipe headings, without editing recipe text.
const registryPath = path.join(root, 'src/documents.ts')
let registry = await readFile(registryPath, 'utf8')
for (const file of files) {
  const content = await readFile(path.join(root, file.target), 'utf8')
  const heading = content.match(/^# (.+)$/m)?.[1]
  if (!heading) throw new Error(`${file.source} has no heading`)
  const lede = content.split(/\n\s*\n/)[1].replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[`*]/g, '').replace(/\s+/g, ' ').trim()
  const description = lede.length <= 160 ? lede : `${lede.slice(0, 157).replace(/\s+\S*$/, '')}...`
  const start = registry.indexOf(`    path: '${file.route}',`)
  const end = registry.indexOf('\n  },', start)
  if (start < 0 || end < 0) throw new Error(`Register ${file.route} in src/documents.ts first`)
  const block = registry.slice(start, end)
    .replace(/    title: .*?,\n/, `    title: ${JSON.stringify(heading)},\n`)
    .replace(/    description: .*?,\n/, `    description: ${JSON.stringify(description)},\n`)
  registry = registry.slice(0, start) + block + registry.slice(end)
}
await writeFile(registryPath, registry)
console.log(`Copied ${files.length} unmodified recipe documents from happy-agent ${revision}`)