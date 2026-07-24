export type DocumentGroup =
  | 'Start here'
  | 'Guides'
  | 'Features'
  | 'Use cases'
  | 'Comparisons'
  | 'Releases'
  | 'Resources'

export interface DocumentEntry {
  path: string
  sourcePath: string
  title: string
  description: string
  group: DocumentGroup
}

const documentSources = import.meta.glob('/content/docs/**/*.mdx', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

const legalSources = import.meta.glob('/content/legal/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

export const documents: DocumentEntry[] = [
  {
    path: '',
    sourcePath: '/content/docs/index.mdx',
    title: 'Welcome',
    description: 'Learn what Happy does and start controlling coding agents from anywhere.',
    group: 'Start here',
  },
  {
    path: 'quick-start',
    sourcePath: '/content/docs/quick-start.mdx',
    title: 'Quick Start',
    description: 'Install Happy, pair your phone, and start your first coding session.',
    group: 'Start here',
  },
  {
    path: 'how-it-works',
    sourcePath: '/content/docs/how-it-works.mdx',
    title: 'How It Works',
    description: 'Understand the CLI, mobile app, relay server, and encrypted data flow.',
    group: 'Start here',
  },
  {
    path: 'security',
    sourcePath: '/content/docs/security.mdx',
    title: 'Security & Encryption',
    description: 'A detailed guide to Happy’s end-to-end encryption architecture.',
    group: 'Start here',
  },
  {
    path: 'faq',
    sourcePath: '/content/docs/faq.mdx',
    title: 'FAQ',
    description: 'Answers to common questions about Happy, setup, privacy, and troubleshooting.',
    group: 'Start here',
  },
  {
    path: 'guides/happy-coder-best-practices',
    sourcePath: '/content/docs/guides/happy-coder-best-practices.mdx',
    title: 'Best Practices',
    description: 'Patterns and workflows for getting more from mobile agent sessions.',
    group: 'Guides',
  },
  {
    path: 'guides/push-notifications',
    sourcePath: '/content/docs/guides/push-notifications.mdx',
    title: 'Push Notifications',
    description: 'Test Happy push notifications from the CLI.',
    group: 'Guides',
  },
  {
    path: 'guides/self-hosting',
    sourcePath: '/content/docs/guides/self-hosting.mdx',
    title: 'Self-Hosting',
    description: 'Run the Happy relay server on infrastructure you control.',
    group: 'Guides',
  },
  {
    path: 'features',
    sourcePath: '/content/docs/features/index.mdx',
    title: 'All Features',
    description: 'Explore Happy’s core architecture and mobile workflow features.',
    group: 'Features',
  },
  {
    path: 'features/real-time-sync',
    sourcePath: '/content/docs/features/real-time-sync.mdx',
    title: 'Real-Time Sync',
    description: 'Why seamless synchronization matters for coding away from your desk.',
    group: 'Features',
  },
  {
    path: 'features/parallel-tasks',
    sourcePath: '/content/docs/features/parallel-tasks.mdx',
    title: 'Parallel Tasks',
    description: 'Run and manage multiple coding-agent sessions.',
    group: 'Features',
  },
  {
    path: 'features/voice-coding-with-claude-code',
    sourcePath: '/content/docs/features/voice-coding-with-claude-code.mdx',
    title: 'Voice Coding',
    description: 'Use voice to shape ideas and send structured work to your coding agent.',
    group: 'Features',
  },
  {
    path: 'use-cases/hemingway-technique',
    sourcePath: '/content/docs/use-cases/hemingway-technique.mdx',
    title: 'The Hemingway Technique',
    description: 'Keep momentum by preparing a clear next task before you stop working.',
    group: 'Use cases',
  },
  {
    path: 'comparisons/alternatives',
    sourcePath: '/content/docs/comparisons/alternatives.mdx',
    title: 'Happy vs. Alternatives',
    description: 'Compare Happy with other mobile and remote coding-agent tools.',
    group: 'Comparisons',
  },
  {
    path: 'comparisons/diy-terminal-app',
    sourcePath: '/content/docs/comparisons/diy-terminal-app.mdx',
    title: 'Happy vs. a Terminal App',
    description: 'See how a purpose-built mobile interface differs from SSH and tmux.',
    group: 'Comparisons',
  },
  {
    path: 'comparisons/happy-2-vs-buzz',
    sourcePath: '/content/docs/comparisons/happy-2-vs-buzz.mdx',
    title: 'Happy (2) vs Buzz',
    description: 'Announcing Happy (2), and how its architecture compares to Block\'s Buzz.',
    group: 'Comparisons',
  },
  {
    path: 'versions/release-notes',
    sourcePath: '/content/docs/versions/release-notes.mdx',
    title: 'Release Notes',
    description: 'A history of notable Happy mobile-app updates.',
    group: 'Releases',
  },
  {
    path: 'versions/known-issues',
    sourcePath: '/content/docs/versions/known-issues.mdx',
    title: 'Known Issues',
    description: 'Current limitations and behavior to be aware of.',
    group: 'Releases',
  },
  {
    path: 'distribution',
    sourcePath: '/content/docs/distribution/index.mdx',
    title: 'Distribution Resources',
    description: 'Product descriptions, feature summaries, and canonical Happy links.',
    group: 'Resources',
  },
]

export const documentGroups: DocumentGroup[] = [
  'Start here',
  'Guides',
  'Features',
  'Use cases',
  'Comparisons',
  'Releases',
  'Resources',
]

export function normalizeDocumentPath(path: string) {
  return path.replace(/^\/+|\/+$/g, '')
}

export function getDocument(path: string) {
  const normalizedPath = normalizeDocumentPath(path)
  return documents.find((document) => document.path === normalizedPath)
}

export function getDocumentSource(document: DocumentEntry) {
  const source = documentSources[document.sourcePath] ?? ''

  if (source.trim()) {
    return /^#\s+/m.test(source) ? source : `# ${document.title}\n\n${source}`
  }

  return `# ${document.title}\n\nDocumentation for this feature is coming soon.`
}

export function getLegalSource(name: 'privacy' | 'terms') {
  return legalSources[`/content/legal/${name}.md`] ?? ''
}

function readAttribute(attributes: string, name: string) {
  return attributes.match(new RegExp(`${name}="([^"]*)"`))?.[1]
}

function cardToMarkdown(_match: string, attributes: string) {
  const title = readAttribute(attributes, 'title')
  const description = readAttribute(attributes, 'description')
  const href = readAttribute(attributes, 'href')

  if (!title || !href) {
    return ''
  }

  return `### [${title}](${href})\n\n${description ?? ''}`
}

export function prepareMarkdown(source: string) {
  return source
    .replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '')
    .replace(/^import\s+.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/<(?:Card|Cards\.Card)\s+([\s\S]*?)\n\s*\/>/g, cardToMarkdown)
    .replace(/<Image\s+([^>]*?)\/>/g, (_match, attributes: string) => {
      const sourcePath = readAttribute(attributes, 'src')
      const alt = readAttribute(attributes, 'alt') ?? ''
      return sourcePath ? `![${alt}](${sourcePath})` : ''
    })
    .replace(/<\/?(?:Steps|div)(?:\s+[^>]*)?>/g, '')
    .replace(/^\s{4}(### \[[^\n]+\]\([^\n]+\))$/gm, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function slugifyHeading(value: string) {
  return value
    .toLowerCase()
    .replace(/[`*_~[\]{}()]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}