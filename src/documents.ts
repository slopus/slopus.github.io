import type { ProductKey } from './products'

export type DocumentGroup =
  | 'Start here'
  | 'Guides'
  | 'Features'
  | 'Use cases'
  | 'Comparisons'
  | 'Releases'
  | 'Resources'

export interface DocumentEntry {
  product: ProductKey
  path: string
  sourcePath: string
  title: string
  description: string
  group: DocumentGroup
  /** The page's own browser and search title, in place of its heading and the docs suffix. */
  pageTitle?: string
  /** Reachable by URL, but left out of navigation and previous/next links. */
  hidden?: boolean
  /** An essay: rendered with captioned figures, floats, and the pig in its bullet (src/DocumentPages.tsx). */
  essay?: boolean
}

const documentSources = import.meta.glob(
  ['/content/docs/**/*.mdx', '/content/desktop/**/*.mdx'],
  {
    eager: true,
    import: 'default',
    query: '?raw',
  },
) as Record<string, string>

const legalSources = import.meta.glob('/content/legal/**/*.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>

/** The Vision essay, a plain .md with a frontmatter title; it is the only doc outside the .mdx globs. */
const THESIS_SOURCE_PATH = '/content/thesis.md'
const thesisSource = Object.values(import.meta.glob('/content/thesis.md', {
  eager: true,
  import: 'default',
  query: '?raw',
}) as Record<string, string>)[0] ?? ''

type DocumentDefinition = Omit<DocumentEntry, 'product'>

const happyDocuments: DocumentDefinition[] = [
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

// Served at the top level: /welcome/, /quick-start/, /guides/terminal/. A new path
// must not collide with another site route; src/DocumentPages.test.tsx checks.
const desktopDocuments: DocumentDefinition[] = [
  {
    path: 'welcome',
    sourcePath: '/content/desktop/index.mdx',
    title: 'Welcome',
    description: 'What Happy Desktop is, what you get, and where to start.',
    group: 'Start here',
  },
  {
    path: 'quick-start',
    sourcePath: '/content/desktop/quick-start.mdx',
    title: 'Quick Start',
    description: 'Download Happy Desktop, open a project, make one change, and pair your phone.',
    group: 'Start here',
  },
  {
    path: 'chief-of-staff',
    sourcePath: '/content/desktop/chief-of-staff.mdx',
    title: 'Chief of Staff',
    description: 'The built-in agent that configures your setup in conversation, and what it will not do.',
    group: 'Start here',
  },
  {
    path: 'how-it-works',
    sourcePath: '/content/desktop/how-it-works.mdx',
    title: 'How It Works',
    description: 'The agent runtime on your machine, the app in front of it, and the phone beside it.',
    group: 'Start here',
  },
  {
    // The Vision essay. It was published at /thesis/; /thesis/ and /blog/ redirect here.
    path: 'vision',
    sourcePath: THESIS_SOURCE_PATH,
    title: 'Vision',
    description: 'What Happy is betting on: one core agent, chat that left the chat, phone first, one harness, and open source with no lock-in.',
    group: 'Start here',
    essay: true,
  },
  {
    path: 'models',
    sourcePath: '/content/desktop/models.mdx',
    title: 'Models & Subscriptions',
    description: 'Claude, Codex, and Grok in one session, on the plans you already pay for.',
    group: 'Features',
  },
  {
    path: 'permissions',
    sourcePath: '/content/desktop/permissions.mdx',
    title: 'Permissions & Sandbox',
    description: 'The four permission modes, automatic review in Auto, and what the sandbox enforces.',
    group: 'Features',
  },
  {
    path: 'workspaces',
    sourcePath: '/content/desktop/workspaces.mdx',
    title: 'Projects & Workspaces',
    description: 'Projects are folders, workspaces are Git worktrees, and parallel work stays apart.',
    group: 'Features',
  },
  {
    path: 'agents',
    sourcePath: '/content/desktop/agents.mdx',
    title: 'Agents That Never Die',
    description: 'Durable sessions, subagents, scheduling, the Inbox, and presence.',
    group: 'Features',
  },
  {
    path: 'mobile',
    sourcePath: '/content/desktop/mobile.mdx',
    title: 'Mobile Access',
    description: 'Pair your phone once, then watch and steer every session with end-to-end encryption.',
    group: 'Features',
  },
  {
    path: 'multiplayer',
    sourcePath: '/content/desktop/multiplayer.mdx',
    title: 'Multiplayer & Teams',
    pageTitle: 'Multiplayer & Teams: a Self-Hosted Coding Agent Server for Your Team — Happy',
    description: 'Run one Happy Agent for your team: each member signs in as themselves, shares projects and sessions, and works under one sandbox. Plus sharing your own computer.',
    group: 'Features',
  },
  {
    path: 'extending',
    sourcePath: '/content/desktop/extending.mdx',
    title: 'Skills & MCP',
    description: 'Add instructions with skills and tools over MCP.',
    group: 'Features',
  },
  {
    path: 'guides/terminal',
    sourcePath: '/content/desktop/guides/terminal.mdx',
    title: 'Using the Terminal',
    description: 'Keep Claude Code and Codex in your terminal and reach them from your phone.',
    group: 'Guides',
  },
  {
    path: 'guides/configuration',
    sourcePath: '/content/desktop/guides/configuration.mdx',
    title: 'Configuration',
    description: 'Where happy.toml lives and the settings worth knowing about.',
    group: 'Guides',
  },
  {
    // Replaced /guides/remote-agents/, which redirects here.
    path: 'guides/remote-server',
    sourcePath: '/content/desktop/guides/remote-server.mdx',
    title: 'Remote Server',
    pageTitle: 'Claude Code and Codex on a Remote Server, from Phone or Desktop — Happy',
    description: 'Run Claude Code and Codex on a server that keeps working while your laptop sleeps. Steer it from Happy Desktop or your phone, alone or as a team.',
    group: 'Guides',
  },
  {
    path: 'comparisons/buzz',
    sourcePath: '/content/desktop/comparisons/buzz.mdx',
    title: 'Happy Desktop vs Buzz',
    description: 'Where Happy Desktop and Block\'s Buzz agree, and where the designs split.',
    group: 'Comparisons',
    hidden: true,
  },
  {
    path: 'desktop-app',
    sourcePath: '/content/desktop/desktop-app.mdx',
    title: 'Desktop App for Claude Code & Codex',
    pageTitle: 'Open Source Desktop App for Claude Code, Codex & Grok — Happy',
    description: 'Happy Desktop is a free, MIT-licensed desktop app for Claude Code, Codex, and Grok on macOS, Windows, and Linux, on the subscriptions you already have.',
    group: 'Comparisons',
  },
  {
    path: 'mobile-app',
    sourcePath: '/content/desktop/mobile-app.mdx',
    title: 'Claude Code on Your Phone',
    pageTitle: 'Claude Code & Codex Mobile App for iPhone and Android — Happy',
    description: 'Control Claude Code and Codex from your phone with Happy, a free, open source iOS and Android app. The agents stay on your computer; the sync is end-to-end encrypted.',
    group: 'Comparisons',
  },
  {
    path: 'vs/claude-code-remote-control',
    sourcePath: '/content/desktop/vs/claude-code-remote-control.mdx',
    title: 'Happy vs Remote Control',
    pageTitle: 'Claude Code Remote Control vs Happy — An Open Source Alternative',
    description: 'How Anthropic\'s Claude Code Remote Control and Happy compare for steering coding agents from your phone: models, encryption, sessions, setup, and where each one is better.',
    group: 'Comparisons',
  },
]

export const documents: DocumentEntry[] = [
  ...happyDocuments.map((document) => ({ ...document, product: 'happy' as const })),
  ...desktopDocuments.map((document) => ({ ...document, product: 'desktop' as const })),
]

const productDocumentGroups: Record<ProductKey, DocumentGroup[]> = {
  happy: ['Start here', 'Guides', 'Features', 'Use cases', 'Comparisons', 'Releases', 'Resources'],
  desktop: ['Start here', 'Features', 'Guides', 'Comparisons'],
}

export function documentsForProduct(product: ProductKey) {
  return documents.filter((document) => document.product === product)
}

/** The documents a reader is shown: everything except pages kept reachable but unlisted. */
export function listedDocumentsForProduct(product: ProductKey) {
  return documentsForProduct(product).filter((document) => !document.hidden)
}

export function documentGroupsForProduct(product: ProductKey) {
  return productDocumentGroups[product]
}

export function normalizeDocumentPath(path: string) {
  return path.replace(/^\/+|\/+$/g, '')
}

export function getDocument(product: ProductKey, path: string) {
  const normalizedPath = normalizeDocumentPath(path)
  return documents.find(
    (document) => document.product === product && document.path === normalizedPath,
  )
}

export function getDocumentSource(document: DocumentEntry) {
  if (document.sourcePath === THESIS_SOURCE_PATH) {
    return getThesisMarkdown()
  }

  const source = documentSources[document.sourcePath] ?? ''

  if (source.trim()) {
    return /^#\s+/m.test(source) ? source : `# ${document.title}\n\n${source}`
  }

  return `# ${document.title}\n\nDocumentation for this feature is coming soon.`
}

/** The page's h1. Its served title is this heading with the docs suffix, unless it sets its own. */
export function documentHeading(document: DocumentEntry) {
  return getDocumentSource(document).match(/^#\s+(.+)$/m)?.[1].trim() ?? document.title
}

/** The Happy app's policies, and the separate ones for Happy plugins. */
export type LegalName = 'privacy' | 'terms' | 'plugins/privacy' | 'plugins/terms'

export function getLegalSource(name: LegalName) {
  return legalSources[`/content/legal/${name}.md`] ?? ''
}

/** The Vision essay at /vision/, titled by its frontmatter; the h1 is that title. */
export function getThesisMarkdown() {
  const title = thesisSource.match(/^title:\s*"(.+)"\s*$/m)?.[1] ?? ''
  // The essay's sections are written as `#`; the frontmatter title is the page's only h1.
  const body = prepareMarkdown(thesisSource).replace(/^# /gm, '## ')
  return `# ${title}\n\n${body}`
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