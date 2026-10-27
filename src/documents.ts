import type { ProductKey } from './products'
import { changelogMarkdown } from './changelog'

export type DocumentGroup =
  | 'Start here'
  | 'Guides'
  | 'Recipes'
  | 'Features'
  | 'Use cases'
  | 'Comparisons'
  | 'Releases'
  | 'Resources'
  | 'Changelog'
  | 'Blog'

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
  /**
   * What the link-preview card says under the title, in place of the description: four to eight
   * words, benefit first, no closing period. Required on a page without a figure (notes/og/cards.py).
   */
  cardLine?: string
  /**
   * A post whose link preview plays a video: an H.264 MP4 under public/, at its pixel size. Its
   * card is a frame of the video, /og/<path>.png, 1200 wide at the video's aspect ratio.
   */
  video?: Readonly<{ path: string; width: number; height: number }>
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
    description: 'The original Happy CLI: control Claude Code and Codex on your computer from your phone. In maintenance mode; Happy today is the desktop harness.',
    group: 'Start here',
  },
  {
    path: 'quick-start',
    sourcePath: '/content/docs/quick-start.mdx',
    title: 'Quick Start',
    description: 'Install the original Happy CLI, pair your phone, and start a Claude Code session. For Happy today, see the Happy Desktop Quick Start.',
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
    pageTitle: 'All Features of Happy Coder — Original Happy CLI Docs',
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
    pageTitle: 'Why Voice Coding Makes Sense — Original Happy CLI Docs',
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
    description: 'Happy is an open-source harness for orchestrating Claude, Codex, and Grok agents in one desktop app, reusing your subscriptions: what you get, where to start.',
    cardLine: 'Free, open source, reusing your subscriptions',
    group: 'Start here',
  },
  {
    path: 'quick-start',
    sourcePath: '/content/desktop/quick-start.mdx',
    title: 'Quick Start',
    pageTitle: 'Quick Start: Install Happy Desktop and Run Your First Agent',
    description: 'Download Happy Desktop, open a project, make one change, and pair your phone.',
    cardLine: 'From download to your first agent',
    group: 'Start here',
  },
  {
    path: 'chief-of-staff',
    sourcePath: '/content/desktop/chief-of-staff.mdx',
    title: 'Chief of Staff',
    pageTitle: 'Chief of Staff: The Built-In Bot That Sets Up Happy Desktop',
    description: 'The first bot in Happy Desktop: it walks you through setup, adds model accounts and providers, pairs your phone, and deploys servers, in conversation.',
    cardLine: 'Your first bot sets up the rest',
    group: 'Start here',
  },
  {
    path: 'how-it-works',
    sourcePath: '/content/desktop/how-it-works.mdx',
    title: 'How It Works',
    pageTitle: 'How Happy Works: One Agent Runtime for Claude, Codex and Grok',
    description: 'How Happy orchestrates agents: Happy Agent runs the loop, tools, and sandbox for Claude, Codex, and Grok, and Desktop and the phone app are its clients.',
    cardLine: 'One runtime for Claude, Codex and Grok',
    group: 'Start here',
  },
  {
    // The Vision essay. It was published at /thesis/; /thesis/ and /blog/ redirect here.
    path: 'vision',
    sourcePath: THESIS_SOURCE_PATH,
    title: 'Vision',
    description: 'What Happy is betting on: one primary agent, chat that left the chat, phone first, one harness, and open source with no lock-in.',
    group: 'Start here',
    essay: true,
  },
  {
    // Who builds Happy, in our own words, from our own sites and profiles. Never anyone's level of involvement.
    path: 'team',
    sourcePath: '/content/desktop/team.mdx',
    title: 'Team',
    pageTitle: 'The Team Behind Happy: Steve Korshakov and Kirill Dubovitskiy',
    description: 'Who builds Happy, in our own words: Steve Korshakov and Kirill Dubovitskiy, and what we built before.',
    group: 'Start here',
  },
  {
    path: 'models',
    sourcePath: '/content/desktop/models.mdx',
    title: 'Models & Subscriptions',
    pageTitle: 'Use Claude, Codex and Grok Subscriptions in One App — Happy',
    description: 'Run Claude, Codex, and Grok side by side, reusing the subscriptions you already pay for: subagents on any model, several accounts per provider, and quotas.',
    cardLine: 'Every subscription you pay for, in one app',
    group: 'Features',
  },
  {
    path: 'permissions',
    sourcePath: '/content/desktop/permissions.mdx',
    title: 'Permissions & Sandbox',
    pageTitle: 'Permissions and OS Sandbox for Claude Code and Codex — Happy',
    description: 'The four permission modes, automatic review in Auto, and what the sandbox enforces.',
    cardLine: 'One sandbox for every agent and model',
    group: 'Features',
  },
  {
    path: 'secrets',
    sourcePath: '/content/desktop/secrets.mdx',
    title: 'Secrets',
    pageTitle: 'Secrets for AI Coding Agents: Give Claude Code API Keys Safely',
    description: 'Secrets for Claude Code, Codex, and Grok in Happy: a catalog on your machine, values the model never sees, and how Hermes Agent and OpenClaw compare.',
    group: 'Features',
  },
  {
    path: 'workspaces',
    sourcePath: '/content/desktop/workspaces.mdx',
    title: 'Projects & Workspaces',
    pageTitle: 'Projects and Git Worktree Workspaces for Coding Agents — Happy',
    description: 'Projects are folders, workspaces are Git worktrees, and parallel work stays apart.',
    cardLine: 'Parallel work, each on its own branch',
    group: 'Features',
  },
  {
    path: 'agents',
    sourcePath: '/content/desktop/agents.mdx',
    title: 'Agents That Never Die',
    pageTitle: 'Coding Agents That Survive Restarts — Happy',
    description: 'Agent sessions that survive restarts: subagents on other models, agent-to-agent messages, scheduled messages, the Inbox, and presence.',
    cardLine: 'Subagents on any model, talking to each other',
    group: 'Features',
  },
  {
    path: 'mobile',
    sourcePath: '/content/desktop/mobile.mdx',
    title: 'Mobile Access',
    pageTitle: 'Check On Your Coding Agents from Your Phone — Happy',
    description: 'Pair your phone once, then watch and steer every session with end-to-end encryption.',
    cardLine: 'Pair once, then follow every session',
    group: 'Features',
  },
  {
    path: 'multiplayer',
    sourcePath: '/content/desktop/multiplayer.mdx',
    title: 'Multiplayer & Teams',
    pageTitle: 'Multiplayer: Self-Hosted Coding Agent Server for Teams — Happy',
    description: 'A self-hosted coding agent server for your team: one Happy Agent, each member signed in as themselves, sharing projects and sessions under one sandbox.',
    group: 'Features',
  },
  {
    path: 'extending',
    sourcePath: '/content/desktop/extending.mdx',
    title: 'Skills & MCP',
    pageTitle: 'Skills and MCP Servers for Claude, Codex and Grok — Happy',
    description: 'Give coding agents skills, Markdown instructions loaded on demand, and tools from MCP servers, the same for Claude, Codex, and Grok.',
    cardLine: 'One set of skills for every model',
    group: 'Features',
  },
  {
    path: 'guides/terminal',
    sourcePath: '/content/desktop/guides/terminal.mdx',
    title: 'The Original Happy CLI',
    pageTitle: 'The Original Happy CLI (Happy Coder) with Happy Desktop — Happy',
    description: 'The original Happy CLI (happy on npm, formerly happy-coder) still works, and the same phone app reaches it and Happy Desktop. New features ship in Happy Desktop.',
    cardLine: 'Happy Coder still works, beside Happy Desktop',
    group: 'Guides',
  },
  {
    path: 'guides/configuration',
    sourcePath: '/content/desktop/guides/configuration.mdx',
    title: 'Configuration',
    pageTitle: 'Configure Happy with happy.toml: Permissions, Sandbox, Docker',
    description: 'Configure Happy in happy.toml: default permission mode, network allowlist, workspace setup commands, provider accounts, and Docker sessions.',
    cardLine: 'Set your defaults once, per machine or repo',
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
    path: 'recepies',
    sourcePath: '/content/desktop/recepies/index.mdx',
    title: "Operational recipes",
    description: "These documents are step-by-step instructions for recurring Happy Agent tasks. The recipe table in the documentation index lists each recipe and when to use...",
    cardLine: 'Ask once, get a verified setup',
    group: 'Recipes',
  },
  {
    path: 'recepies/first-project',
    sourcePath: '/content/desktop/recepies/first-project.mdx',
    title: "Start with one project",
    description: "Use this recipe when someone asks the Chief of Staff to help set up Happy, discover recent projects, or import their first project. Recommend starting...",
    cardLine: 'One project, one useful first change',
    group: 'Recipes',
  },
  {
    path: 'recepies/mobile-access',
    sourcePath: '/content/desktop/recepies/mobile-access.mdx',
    title: "Set up or repair Mobile Access",
    description: "Use this recipe when someone wants to control Happy Desktop from Happy Coder on their phone, or control terminal Claude Code/Codex sessions remotely. Mobile...",
    cardLine: 'Your agents, reachable from your phone',
    group: 'Recipes',
  },
  {
    path: 'recepies/accounts-and-models',
    sourcePath: '/content/desktop/recepies/accounts-and-models.mdx',
    title: "Accounts, models, effort, and service tier",
    description: "Use this recipe when the user wants to add or pool provider accounts, limit or change models, set the default effort or service tier, or move existing...",
    cardLine: 'Your accounts, with the defaults you choose',
    group: 'Recipes',
  },
  {
    path: 'recepies/harnesses',
    sourcePath: '/content/desktop/recepies/harnesses.mdx',
    title: "Harnesses: Claude Code, Codex CLI, Antigravity, OpenCode, and ACP agents",
    description: "Use this recipe when the user wants a Happy agent to run on another vendor's whole agent rather than on Happy's own loop: Claude Code itself, Codex CLI...",
    cardLine: 'Claude Code, Codex, and ACP agents as harnesses',
    group: 'Recipes',
  },
  {
    path: 'recepies/wsl',
    sourcePath: '/content/desktop/recepies/wsl.mdx',
    title: "Set up WSL projects from Windows",
    description: "Use this recipe when a Windows 11 user wants Linux projects in Happy Desktop. Chief of Staff performs the setup and verification within the user's...",
    cardLine: 'Linux projects beside your Windows bots',
    group: 'Recipes',
  },
  {
    path: 'recepies/telegram',
    sourcePath: '/content/desktop/recepies/telegram.mdx',
    title: "Export a bot to Telegram",
    description: "Use this recipe when the user wants people, themselves included, to talk to a bot from Telegram, or wants to change who may. Exporting a bot makes it...",
    cardLine: 'A dedicated bot, in your Telegram chats',
    group: 'Recipes',
  },
  {
    path: 'recepies/chat-bridge',
    sourcePath: '/content/desktop/recepies/chat-bridge.mdx',
    title: "Export a bot to any chat service",
    description: "Use this recipe when the user wants people to talk to a bot from a chat service Happy Agent does not have built in, such as Slack, Discord, Matrix, or their...",
    cardLine: 'Your bot, connected through a chat bridge',
    group: 'Recipes',
  },
  {
    path: 'recepies/bot-settings',
    sourcePath: '/content/desktop/recepies/bot-settings.mdx',
    title: "Restrict a bot with bot settings",
    description: "Use this recipe when the user wants one bot to see only certain secrets, to stay away from other projects, workspaces, tasks, bots, and agents, or to run...",
    cardLine: 'Choose each bot’s secrets and reach',
    group: 'Recipes',
  },
  {
    path: 'recepies/shared-app',
    sourcePath: '/content/desktop/recepies/shared-app.mdx',
    title: "Build a live, shared HTML artifact",
    description: "Use this recipe when an html artifact should remember things or be shared: a to-do list, a poll, a sign-up sheet, a scoreboard, a small game, or a dashboard...",
    cardLine: 'Saved data, shared live with everyone viewing',
    group: 'Recipes',
  },
  {
    path: 'recepies/peer-messaging',
    sourcePath: '/content/desktop/recepies/peer-messaging.mdx',
    title: "Connect two Happy Agents over one WebSocket",
    description: "Use this recipe when a desktop or private machine should initiate one outbound connection to a reachable Happy Agent, then exchange messages in both...",
    cardLine: 'Two installations, one outbound connection',
    group: 'Recipes',
  },
  {
    path: 'recepies/rest-api',
    sourcePath: '/content/desktop/recepies/rest-api.mdx',
    title: "Drive Happy Agent over its REST API",
    description: "Use this recipe when a script or an agent with only a shell should set up, use, or debug Happy Agent: find and message agents, create bots, tasks, projects,...",
    cardLine: 'Set up, use, and debug Happy from a shell',
    group: 'Recipes',
  },
  {
    path: 'recepies/remote-agent',
    sourcePath: '/content/desktop/recepies/remote-agent.mdx',
    title: "Deploy a standalone remote agent",
    description: "Use this recipe when the user wants a personal, non-team Happy Agent on another machine, ready to run coding tasks from their existing Happy installation...",
    cardLine: 'A personal server, connected and verified',
    group: 'Recipes',
  },
  {
    path: 'recepies/team',
    sourcePath: '/content/desktop/recepies/team.mdx',
    title: "Create and deploy a Happy team",
    description: "Use this recipe when the user wants a shared Happy Agent server for a named team. The outcome is a WorkOS-backed Happy team, a working team-mode deployment,...",
    cardLine: 'Your team’s server, verified before invitations',
    group: 'Recipes',
  },
  {
    path: 'recepies/runner',
    sourcePath: '/content/desktop/recepies/runner.mdx',
    title: "Add a dedicated runner",
    description: "Use this recipe to give a deployed Happy Agent node — standalone or team — a separate machine that does its work. It is strongly recommended for every...",
    cardLine: 'Project commands apart from your node’s credentials',
    group: 'Recipes',
  },
  {
    path: 'recepies/hardening',
    sourcePath: '/content/desktop/recepies/hardening.mdx',
    title: "Harden a node with separate Linux users",
    description: "Use this recipe to split one Linux machine that runs Happy Agent into two kinds of account. The service user (here happy-agent) runs the daemon, and only it...",
    cardLine: 'Private daemon files, separate workload users',
    group: 'Recipes',
  },
  {
    path: 'recepies/enterprise-sign-in',
    sourcePath: '/content/desktop/recepies/enterprise-sign-in.mdx',
    title: "Set up enterprise JWT sign-in",
    description: "Use this recipe when an organization wants its members to sign in to a team-mode Happy Agent with the organization's own identity provider (Okta, Entra ID,...",
    cardLine: 'Your identity provider, your team’s sign-in',
    group: 'Recipes',
  },
  {
    path: 'recepies/upgrade',
    sourcePath: '/content/desktop/recepies/upgrade.mdx',
    title: "Upgrade Happy Agent",
    description: "Use this recipe to upgrade an existing Happy Agent installation, especially a standalone remote created with the deployment recipe. An upgrade replaces the...",
    cardLine: 'A checked upgrade, with your state preserved',
    group: 'Recipes',
  },
  {
    path: 'comparisons/buzz',
    sourcePath: '/content/desktop/comparisons/buzz.mdx',
    title: 'Happy Desktop vs Buzz',
    pageTitle: 'Happy Desktop vs Buzz — Happy',
    description: 'Where Happy Desktop and Block\'s Buzz agree, and where the designs split.',
    cardLine: 'A harness for agents, or a chat with them',
    group: 'Comparisons',
    hidden: true,
  },
  {
    path: 'desktop-app',
    sourcePath: '/content/desktop/desktop-app.mdx',
    title: 'Desktop App for Claude Code & Codex',
    pageTitle: 'Open Source Desktop App for Claude Code, Codex & Grok — Happy',
    description: 'Happy Desktop is a free, MIT-licensed app for orchestrating Claude Code, Codex, and Grok agents on macOS, Windows, and Linux, reusing your subscriptions.',
    cardLine: 'Free on macOS, Windows and Linux',
    group: 'Comparisons',
  },
  {
    path: 'mobile-app',
    sourcePath: '/content/desktop/mobile-app.mdx',
    title: 'Claude Code on Your Phone',
    pageTitle: 'Claude Code & Codex Mobile App for iPhone and Android — Happy',
    description: 'The Happy phone app for iPhone and Android: steer the Claude Code, Codex, and Grok agents Happy runs on your computer, end-to-end encrypted. Free, open source.',
    cardLine: 'Free on iPhone and Android, end-to-end encrypted',
    group: 'Comparisons',
  },
  {
    // First published at /vs/claude-code-remote-control/, which redirects here.
    path: 'claude-code-remote-control',
    sourcePath: '/content/desktop/claude-code-remote-control.mdx',
    title: 'Happy vs Remote Control',
    pageTitle: 'Claude Code Remote Control vs Happy — An Open Source Alternative',
    description: 'Claude Code Remote Control vs Happy for steering coding agents from your phone: models, encryption, sessions, setup, and where each one is better.',
    cardLine: 'An open-source harness for every model',
    group: 'Comparisons',
  },
  {
    path: 'changelog',
    sourcePath: '/content/desktop/changelog.mdx',
    title: 'Changelog',
    pageTitle: 'Changelog — Happy Agent and Happy Desktop Production Releases',
    description: 'Production releases of Happy Agent and Happy Desktop: new models, features and fixes, with a version and date for each release.',
    cardLine: 'Production updates to Happy Agent and Desktop',
    group: 'Changelog',
  },
  {
    // Blog: short URLs to type from memory; the titles stay long.
    // First published at /team-sign-in-workos/, which redirects here.
    path: 'workos',
    sourcePath: '/content/desktop/workos.mdx',
    title: 'Team Sign-In with WorkOS',
    pageTitle: 'Team Sign-In with WorkOS for a Self-Hosted Agent Server — Happy',
    description: 'How a Happy Agent team server uses WorkOS AuthKit and Organizations: members sign in, and the server checks each token locally. Or bring your own IdP.',
    group: 'Blog',
  },
  {
    path: 'tailcat',
    sourcePath: '/content/desktop/tailcat.mdx',
    title: 'No Open Ports: Tailcat',
    pageTitle: 'No Open Ports: How Happy Reaches Your Server with Tailcat',
    description: 'How Happy Desktop reaches a remote Happy Agent through Tailcat, Tailscale\'s open source data plane: WireGuard end to end, no open port, no account.',
    group: 'Blog',
  },
  {
    path: 'voice',
    sourcePath: '/content/desktop/voice.mdx',
    title: 'Voice with ElevenLabs',
    pageTitle: 'Talk to Your Agents: How Happy Uses ElevenLabs for Voice',
    description: 'How voice in the Happy app runs on ElevenLabs: the token flow, what ElevenLabs hears, the free minutes, the subscription, and bringing your own agent.',
    group: 'Blog',
  },
  {
    path: 'updates',
    sourcePath: '/content/desktop/updates.mdx',
    title: 'Updates Mid-Turn',
    pageTitle: 'Updates That Pick Up Where They Left Off — Happy',
    description: 'Update Happy Agent mid-turn: the running step finishes and is saved, the new version starts, and the same turn continues. The window never reloads.',
    group: 'Blog',
  },
  {
    path: 'stem-cell',
    sourcePath: '/content/desktop/stem-cell.mdx',
    title: 'Stem Cells',
    pageTitle: 'Sure, GPT, I need another 10 different buttons to start my work! — Happy',
    description: 'Every AI app keeps adding ways to start. In Happy, new work starts as a stem cell: say what it is, and it names itself, grows its icon and finds its place.',
    group: 'Blog',
    video: { path: '/video/stem-cell.mp4', width: 1280, height: 720 },
  },
]

export const documents: DocumentEntry[] = [
  ...happyDocuments.map((document) => ({ ...document, product: 'happy' as const })),
  ...desktopDocuments.map((document) => ({ ...document, product: 'desktop' as const })),
]

const productDocumentGroups: Record<ProductKey, DocumentGroup[]> = {
  happy: ['Start here', 'Guides', 'Features', 'Use cases', 'Comparisons', 'Releases', 'Resources'],
  desktop: ['Start here', 'Features', 'Guides', 'Blog', 'Comparisons', 'Changelog', 'Recipes'],
}

export function documentsForProduct(product: ProductKey) {
  return documents.filter((document) => document.product === product)
}

/** The documents a reader is shown: everything except pages kept reachable but unlisted. */
export function listedDocumentsForProduct(product: ProductKey) {
  const groups = productDocumentGroups[product]
  return documentsForProduct(product).filter((document) => !document.hidden)
    .sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group))
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

export function getDocumentSource(document: DocumentEntry): string {
  if (document.sourcePath === THESIS_SOURCE_PATH) {
    return getThesisMarkdown()
  }

  const intro = documentSources[document.sourcePath] ?? ''
  const source = document.product === 'desktop' && document.path === 'changelog'
    ? `${intro.trim()}\n\n${changelogMarkdown()}`
    : intro

  if (source.trim()) {
    return /^#\s+/m.test(source) ? source : `# ${document.title}\n\n${source}`
  }

  return `# ${document.title}\n\nDocumentation for this feature is coming soon.`
}

/** The page's h1. Its served title is this heading with the docs suffix, unless it sets its own. */
export function documentHeading(document: DocumentEntry): string {
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