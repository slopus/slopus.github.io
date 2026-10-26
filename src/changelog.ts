import type { PageMetadata } from './siteMetadata'

interface ProductionChangelogEntry {
  product: 'agent' | 'desktop'
  slug: string
  version: string
  /** The stable release's publication date, never its preview's date. */
  date: string
  title: string
  description: string
  sourcePath: string
  image: NonNullable<PageMetadata['socialImage']>
  video?: PageMetadata['socialVideo']
}

const sources = import.meta.glob('/content/changelog/*.mdx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

// Production releases only; verify each version and publication date on GitHub.
const entries: ProductionChangelogEntry[] = [
  {
    product: 'agent',
    slug: 'gpt-6-1-terra',
    version: '0.4.108',
    date: '2026-10-26',
    title: 'GPT-6.1 Terra, newest models first',
    description: 'GPT-6.1 Terra is in Happy’s model picker. GPT-6.1 models appear before GPT-6; chats using removed GPT-5.6 models need to switch.',
    sourcePath: '/content/changelog/terra.mdx',
    image: { path: '/og/terra.png', width: 1200, height: 675, alt: 'GPT-6.1 Terra is in Happy. Terra selected in the real model picker at Medium effort.' },
    video: { path: '/video/terra.mp4', width: 1280, height: 720 },
  },
]
export const productionChangelogEntries: readonly ProductionChangelogEntry[] = entries.sort((a, b) => b.date.localeCompare(a.date))

for (const entry of productionChangelogEntries) {
  if (!/^\d+\.\d+\.\d+$/.test(entry.version)) {
    throw new Error(`Changelog entries require stable versions: ${entry.version}`)
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !sources[entry.sourcePath]?.trim()) {
    throw new Error(`Changelog entry needs a publication date and source: ${entry.version}`)
  }
}

export function changelogVersionLabel(entry: ProductionChangelogEntry) {
  return `${entry.product === 'agent' ? 'Happy Agent' : 'Happy Desktop'} v${entry.version}`
}

/** Matches the feature heading's id in the complete changelog. */
export function changelogAnchor(entry: ProductionChangelogEntry) {
  return entry.slug
}

export function changelogSharePath(entry: ProductionChangelogEntry) {
  return `/changelog/${entry.slug}/`
}

export function changelogEntryForPath(pathname: string) {
  const path = `${pathname.replace(/\/+$/, '')}/`
  return productionChangelogEntries.find((entry) => changelogSharePath(entry) === path)
}

export function changelogEntryMetadata(entry: ProductionChangelogEntry): PageMetadata {
  return {
    title: entry.title,
    description: entry.description,
    canonicalPath: changelogSharePath(entry),
    socialImage: entry.image,
    socialVideo: entry.video,
  }
}

export function changelogMarkdown(firstEntry?: ProductionChangelogEntry) {
  const ordered = firstEntry
    ? [firstEntry, ...productionChangelogEntries.filter((entry) => entry !== firstEntry)]
    : productionChangelogEntries
  return ordered.map((entry, index) => {
    const date = new Date(`${entry.date}T12:00:00Z`).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC',
    })
    const permalink = firstEntry === entry ? '[All releases](/changelog/)' : `[Share this release](${changelogSharePath(entry)})`
    const heading = firstEntry && index === 0 ? '#' : '##'
    return `${heading} ${entry.title}\n\n${changelogVersionLabel(entry)} · ${date} · ${permalink}\n\n${sources[entry.sourcePath].trim()}`
  }).join('\n\n---\n\n')
}