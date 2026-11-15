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
  | 'Your team'
  | 'The app'
  | 'Where this goes'
  | 'Under the hood'
  | 'Compare'

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
  /** An original Happy CLI page's Happy Desktop counterpart, linked from its maintenance notice. */
  current?: Readonly<{ path: string; label: string }>
  /**
   * A post whose link preview plays a video: an H.264 MP4 under public/, at its pixel size. Its
   * card is a frame of the video, /og/<path>.png, 1200 wide at the video's aspect ratio.
   */
  video?: Readonly<{ path: string; width: number; height: number }>
  /**
   * The page's thesis: one sentence that survives a screenshot. It is the pull quote under the h1,
   * the line under the page's active item in the sidebar, and its link-preview card's text.
   */
  thesis?: string
  /** Nested under this page in the sidebar, and left out of the reading path's previous and next. */
  parent?: string
  /** A recipe's page for people, linked by the renderer under the source line; the recipe text stays byte for byte. */
  forPeople?: Readonly<{ href: string; label: string }>
}

/** The pages' text, from src/documentSources.ts, which registers it when it loads (loadDocumentSources). */
type DocumentSources = {
  documents: Record<string, string>
  legal: Record<string, string>
  thesis: string
}
let sources: DocumentSources | undefined
export function setDocumentSources(loaded: DocumentSources) {
  sources = loaded
}
function loadedSources() {
  if (!sources) throw new Error('The docs text is not loaded yet: await preparePath() (src/Router.tsx) first.')
  return sources
}

/** The Vision essay, a plain .md with a frontmatter title; it is the only doc outside the .mdx globs. */
const THESIS_SOURCE_PATH = '/content/thesis.md'

type DocumentDefinition = Omit<DocumentEntry, 'product'>

const happyDocuments: DocumentDefinition[] = [
  {
    path: '',
    sourcePath: '/content/docs/index.mdx',
    title: 'Welcome',
    description: 'Docs for the original Happy CLI, a phone remote for Claude Code and Codex. Happy (formerly Happy Coder) is now a desktop app for Claude, Codex, Grok and more.',
    group: 'Start here',
    current: { path: '/welcome/', label: 'Welcome' },
  },
  {
    path: 'quick-start',
    sourcePath: '/content/docs/quick-start.mdx',
    pageTitle: 'Happy (formerly Happy Coder) CLI Quick Start: npm i -g happy',
    title: 'Quick Start',
    description: 'Install the original Happy CLI with npm and pair your phone by QR code. Happy (formerly Happy Coder) is now a desktop app; start with its Quick Start.',
    group: 'Start here',
    current: { path: '/quick-start/', label: 'Quick Start' },
  },
  {
    path: 'how-it-works',
    sourcePath: '/content/docs/how-it-works.mdx',
    pageTitle: 'How the Happy (formerly Happy Coder) CLI Works: Phone and Relay',
    title: 'How It Works',
    description: 'How the original Happy CLI, the phone app and the encrypted relay fit together. Happy (formerly Happy Coder) is now a desktop app with its own runtime.',
    group: 'Start here',
    current: { path: '/how-it-works/', label: 'How It Works' },
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
    pageTitle: 'Happy (formerly Happy Coder) CLI FAQ: Pricing, Privacy, Setup',
    title: 'FAQ',
    description: 'Answers about the original Happy CLI: cost, privacy, setup and fixes. Happy (formerly Happy Coder) is now a desktop app for Claude, Codex, Grok and more.',
    group: 'Start here',
    current: { path: '/welcome/', label: 'Welcome' },
  },
  {
    path: 'guides/happy-coder-best-practices',
    sourcePath: '/content/docs/guides/happy-coder-best-practices.mdx',
    pageTitle: 'Happy Coder Tips: Running Claude Code from Your Phone',
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
    pageTitle: 'Happy (formerly Happy Coder) CLI Features: Sync, Voice, Push',
    description: 'What the original Happy CLI does: live sync with your phone, parallel sessions, voice and push. Happy (formerly Happy Coder) is now a desktop app.',
    group: 'Features',
    current: { path: '/welcome/#what-you-get', label: 'its features' },
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
    pageTitle: 'Voice Coding with Claude Code from Your Phone — Happy',
    description: 'Voice coding with Claude Code in the Happy app: tap the mic, talk, and a voice agent sends your request to the session and tells you when it is done.',
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
    title: 'Alternatives',
    pageTitle: 'Claude Code and Codex on Mobile and Desktop: 6 Alternatives Compared',
    description: 'Claude Code Remote Control, Codex in ChatGPT, T3 Code, Conductor, Happy, and tmux with Termius: agents, phone and desktop apps, encryption, and price.',
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
    pageTitle: 'Happy (formerly Happy Coder): Product Descriptions and Links',
    title: 'Distribution Resources',
    description: 'Copy-paste descriptions and links for listing Happy (formerly Happy Coder): the desktop app, the phone app, and the original CLI.',
    group: 'Resources',
    current: { path: '/welcome/', label: 'Welcome' },
  },
]

// Served at the top level: /welcome/, /quick-start/, /guides/terminal/. A new path
// must not collide with another site route; src/DocumentPages.test.tsx checks.
// The order is the sidebar's, and Start here through Where this goes are the reading path:
// read top to bottom, with Previous/Next handing off (DESIGN.md, Docs pages).
const desktopDocuments: DocumentDefinition[] = [
  {
    path: 'welcome',
    sourcePath: '/content/desktop/index.mdx',
    title: 'Welcome',
    description: 'Happy is the open-source app where a team and its agents work in one place: shared tasks, shared bots, a feed, and permissions, on Claude, Codex, Grok, and Gemini.',
    thesis: 'Work is moving into agents. It needs a home you own.',
    cardLine: 'Your team and its agents in one place',
    group: 'Start here',
  },
  {
    path: 'quick-start',
    sourcePath: '/content/desktop/quick-start.mdx',
    title: 'Quick Start',
    pageTitle: 'Quick Start: Install Happy Desktop and Run Your First Agent',
    description: 'Install Happy Desktop, then learn the three things in it: repositories, tasks, and bots. No account and no key to paste; the Chief of Staff does the setup when you ask.',
    thesis: 'Install it, then ask for everything else.',
    cardLine: 'From download to your first agent',
    group: 'Start here',
  },
  {
    // The team overview: it links down to Bots, Tasks, and The feed. How the server is deployed is the Team Server guide.
    path: 'multiplayer',
    sourcePath: '/content/desktop/multiplayer.mdx',
    title: 'One place for the team',
    pageTitle: 'Multiplayer: Share Claude Code and Codex Sessions with Your Team — Happy',
    description: "See teammates' tasks as they start, follow their agents' updates in Activity, and share bots on a server your team runs.",
    thesis: 'Your team already works through agents. Give that work one address.',
    cardLine: 'Your team and your agents in one place',
    group: 'Your team',
  },
  {
    path: 'bots',
    sourcePath: '/content/desktop/bots.mdx',
    title: 'Bots that own a job',
    pageTitle: 'Shared Bots for Your Team: Persistent Coding Agents with One Job — Happy',
    description: 'A bot is a persistent agent with a name, a folder, and one conversation the whole team writes into. Give it releases or alerts; reach it from Telegram too.',
    thesis: 'A bot is one job, one key, and one rulebook.',
    group: 'Your team',
  },
  {
    // The first bot: nested under Bots in the sidebar, outside the reading path's previous and next.
    path: 'chief-of-staff',
    sourcePath: '/content/desktop/chief-of-staff.mdx',
    title: 'Chief of Staff',
    pageTitle: 'Chief of Staff: The Built-In Bot That Sets Up Happy Desktop',
    description: 'The first bot in Happy Desktop: it walks you through setup, adds model accounts and providers, pairs your phone, and deploys servers, in conversation.',
    cardLine: 'Your first bot sets up the rest',
    group: 'Your team',
    parent: 'bots',
  },
  {
    path: 'tasks',
    sourcePath: '/content/desktop/tasks.mdx',
    title: 'Tasks in the open',
    pageTitle: "Shared Tasks: See What Your Team's Coding Agents Are Working On — Happy",
    description: "Every task in Happy has an owner, and the team sees it start. Follow a teammate's task, split work across repositories, and get looped in when it's your call.",
    thesis: 'You see work when it starts, not when the pull request lands.',
    group: 'Your team',
  },
  {
    path: 'feed',
    sourcePath: '/content/desktop/feed.mdx',
    title: 'The feed',
    pageTitle: 'The Team Feed: What Your Coding Agents Shipped Today — Happy',
    description: 'Agents in Happy publish reviews, reports, designs, and screenshots as artifacts. They land in one feed for the team, grouped by day, with a cover and a summary.',
    thesis: 'Agents write the status update. You scroll it.',
    group: 'Your team',
  },
  {
    path: 'permissions',
    sourcePath: '/content/desktop/permissions.mdx',
    title: 'Exactly enough access',
    pageTitle: 'Permissions and OS Sandbox for Claude Code and Codex — Happy',
    description: 'An OS sandbox and automatic review for every agent, and secrets it uses without seeing: the four permission modes, Auto review, and what the sandbox enforces.',
    thesis: 'The easiest permission to grant is "everything". We made "exactly this" easier.',
    cardLine: 'One sandbox for every agent and model',
    group: 'Your team',
  },
  {
    path: 'computers',
    sourcePath: '/content/desktop/computers.mdx',
    title: "Your computers, the team's",
    pageTitle: 'Where Happy Runs: Your Computer or a Team Server',
    description: "Agents in Happy run on the computers you connect: your own laptop, or a server your team shares. Close the laptop and the team's computer keeps working.",
    thesis: 'Your laptop is a computer for your agents. So is the box under your desk.',
    group: 'Your team',
  },
  {
    path: 'models',
    sourcePath: '/content/desktop/models.mdx',
    title: 'Models on your subscriptions',
    pageTitle: 'Use Claude, Codex and Grok Subscriptions in One App — Happy',
    description: 'Run Claude, Codex, Grok, Gemini, and more side by side, reusing the subscriptions you already pay for: subagents on any model, several accounts, and quotas.',
    thesis: "We don't sell tokens. Bring the subscriptions you already pay for.",
    cardLine: 'Every subscription you pay for, in one app',
    group: 'The app',
  },
  {
    path: 'agents',
    sourcePath: '/content/desktop/agents.mdx',
    title: 'Agents That Never Die',
    pageTitle: 'Coding Agents That Survive Restarts — Happy',
    description: 'Agent sessions that survive restarts: subagents on other models, agent-to-agent messages, scheduled messages, the Inbox, and presence.',
    thesis: 'Every conversation is still there tomorrow, and still knows what it was doing.',
    cardLine: 'Subagents on any model, talking to each other',
    group: 'The app',
  },
  {
    path: 'mobile',
    sourcePath: '/content/desktop/mobile.mdx',
    title: 'Happy on your phone',
    pageTitle: 'Check On Your Coding Agents from Your Phone — Happy',
    description: 'Pair your phone once, then follow every task, bot, and the feed, and answer the agents that ask for you, end-to-end encrypted.',
    thesis: 'Our phone app got a speeding ticket.',
    cardLine: 'Pair once, then follow every task',
    group: 'The app',
  },
  {
    // Moved up from the Blog into the reading path; URL and title unchanged.
    path: 'voice',
    sourcePath: '/content/desktop/voice.mdx',
    title: 'Talk to it',
    pageTitle: 'Talk to Your Agents: How Happy Uses ElevenLabs for Voice',
    description: 'How voice in the Happy app runs on ElevenLabs: the token flow, what ElevenLabs hears, the free minutes, the subscription, and bringing your own agent.',
    thesis: 'Tap the mic. Say what you want done.',
    group: 'The app',
  },
  {
    // The Vision essay. It was published at /thesis/; /thesis/ and /blog/ redirect here.
    path: 'vision',
    sourcePath: THESIS_SOURCE_PATH,
    title: 'Vision',
    description: 'What Happy is betting on: one primary agent, chat that left the chat, phone first, one harness, open source with no lock-in, and a company that runs on one app.',
    thesis: "A company should be able to run on one app. We're building it in the open.",
    group: 'Where this goes',
    essay: true,
  },
  {
    // Who builds Happy, in our own words, from our own sites and profiles. Never anyone's level of involvement.
    path: 'team',
    sourcePath: '/content/desktop/team.mdx',
    title: 'Who builds it',
    pageTitle: 'The Team Behind Happy: Steve Korshakov and Kirill Dubovitskiy',
    description: 'Who builds Happy, in our own words: Steve Korshakov and Kirill Dubovitskiy, and what we built before.',
    group: 'Where this goes',
  },
  {
    path: 'how-it-works',
    sourcePath: '/content/desktop/how-it-works.mdx',
    title: 'How It Works',
    pageTitle: 'How Happy Works: One Agent Runtime for Claude, Codex, Grok and More',
    description: 'How Happy orchestrates agents: Happy Agent runs Claude, Codex, Grok, Gemini, and ACP agents in one runtime, and Desktop and the phone app are its clients.',
    cardLine: 'One runtime for Claude, Codex, Grok and more',
    group: 'Under the hood',
  },
  {
    path: 'workspaces',
    sourcePath: '/content/desktop/workspaces.mdx',
    title: 'Projects & Workspaces',
    pageTitle: 'Projects and Git Worktree Workspaces for Coding Agents — Happy',
    description: 'Projects are folders, workspaces are Git worktrees, and parallel work stays apart.',
    cardLine: 'Parallel work, each on its own branch',
    group: 'Under the hood',
  },
  {
    path: 'secrets',
    sourcePath: '/content/desktop/secrets.mdx',
    title: 'Secrets',
    pageTitle: 'Secrets for AI Coding Agents: Give Claude Code API Keys Safely',
    description: 'Secrets for Claude Code, Codex, and Grok in Happy: a catalog on your machine, values the model never sees, and grants to an agent, workspace, or project.',
    group: 'Under the hood',
  },
  {
    path: 'extending',
    sourcePath: '/content/desktop/extending.mdx',
    title: 'Skills & MCP',
    pageTitle: 'Skills and MCP Servers for Claude, Codex and Grok — Happy',
    description: 'Give coding agents skills, Markdown instructions loaded on demand, and tools from MCP servers, the same for Claude, Codex, and Grok.',
    cardLine: 'One set of skills for every model',
    group: 'Under the hood',
  },
  {
    path: 'guides/configuration',
    sourcePath: '/content/desktop/guides/configuration.mdx',
    title: 'Configuration',
    pageTitle: 'Configure Happy with happy.toml: Permissions, Sandbox, Docker',
    description: 'Configure Happy in happy.toml: default permission mode, network allowlist, workspace setup commands, provider accounts, and Docker sessions.',
    cardLine: 'Set your defaults once, per machine or repo',
    group: 'Under the hood',
  },
  {
    // Took the deployment detail that /multiplayer/ carried until it became the feature page.
    path: 'guides/team-server',
    sourcePath: '/content/desktop/guides/team-server.mdx',
    title: 'Bring your team',
    pageTitle: 'Self-Hosted Coding Agent Server for a Team: Run a Happy Team Server',
    description: 'Run one Happy Agent for your team on your own machine: sign-in, how Desktop and phones reach it, whose provider accounts pay, the sandbox, and the owner.',
    cardLine: 'One agent server for your whole team',
    group: 'Guides',
  },
  {
    // Replaced /guides/remote-agents/, which redirects here.
    path: 'guides/remote-server',
    sourcePath: '/content/desktop/guides/remote-server.mdx',
    title: 'Run it on a remote machine',
    pageTitle: 'Claude Code and Codex on a Remote Server, from Phone or Desktop — Happy',
    description: 'Run Claude Code and Codex on a server that keeps working while your laptop sleeps. Steer it from Happy Desktop or your phone, alone or as a team.',
    group: 'Guides',
  },
  {
    // happy.engineering/migrate, linked from the Happy CLI home's migration screen in the iOS and Android apps. Keep the URL.
    path: 'migrate',
    sourcePath: '/content/desktop/migrate.mdx',
    title: 'Switch to Happy Agent',
    pageTitle: 'Switch from the Happy CLI to Happy Agent and Happy Desktop',
    description: 'Happy now has a desktop app: multiplayer for remote servers, lower latency, and better attachments. Move from the Happy CLI in around 5 minutes.',
    cardLine: 'A desktop app, and multiplayer servers',
    group: 'Guides',
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
    // The comparison table that /multiplayer/ carried, moved whole.
    path: 'cursor-projects-claude-team-capy',
    sourcePath: '/content/desktop/cursor-projects-claude-team-capy.mdx',
    title: 'Happy vs Cursor Projects, Claude Team, and Capy',
    pageTitle: 'Happy vs Cursor Projects, Claude Team, ChatGPT Projects, and Capy',
    description: 'Cursor Projects, Claude Projects on the Team plan, ChatGPT shared projects, and Capy compared with Happy: working together, models, where it runs, and price.',
    thesis: 'The same idea, except you can read the source and you own the computers.',
    group: 'Compare',
  },
  {
    path: 'comparisons/buzz',
    sourcePath: '/content/desktop/comparisons/buzz.mdx',
    title: 'Happy Desktop vs Buzz',
    pageTitle: 'Happy Desktop vs Buzz — Happy',
    description: 'Where Happy Desktop and Block\'s Buzz agree, and where the designs split.',
    cardLine: 'A harness for agents, or a chat with them',
    group: 'Compare',
    hidden: true,
  },
  {
    path: 'desktop-app',
    sourcePath: '/content/desktop/desktop-app.mdx',
    title: 'Desktop App for Claude Code & Codex',
    pageTitle: 'Open Source Desktop App for Claude Code, Codex, Grok & Gemini',
    description: 'Happy Desktop is a free, MIT-licensed desktop app for Claude Code, Codex, Grok, Gemini, and more. Download it for macOS, Windows, or Linux.',
    cardLine: 'Free on macOS, Windows and Linux',
    group: 'Compare',
  },
  {
    path: 'mobile-app',
    sourcePath: '/content/desktop/mobile-app.mdx',
    title: 'Claude Code on Your Phone',
    pageTitle: 'Claude Code Mobile App for iPhone and Android, with Codex — Happy',
    description: 'A free, open-source Claude Code mobile app for iPhone and Android. Control Claude Code, Codex, Grok, and Gemini from your phone, end-to-end encrypted.',
    cardLine: 'Free on iPhone and Android, end-to-end encrypted',
    group: 'Compare',
  },
  {
    // First published at /vs/claude-code-remote-control/, which redirects here.
    path: 'claude-code-remote-control',
    sourcePath: '/content/desktop/claude-code-remote-control.mdx',
    title: 'Happy vs Remote Control',
    pageTitle: 'Claude Code Remote Control vs Happy — An Open Source Alternative',
    description: 'Claude Code Remote Control vs Happy for steering coding agents from your phone: models, encryption, sessions, setup, and where each one is better.',
    cardLine: 'An open-source harness for every model',
    group: 'Compare',
  },
  {
    path: 't3-code',
    sourcePath: '/content/desktop/t3-code.mdx',
    title: 'Happy vs T3 Code',
    pageTitle: 'Happy vs T3 Code — A T3 Code Alternative for Teams',
    description: 'Happy vs T3 Code: two open-source apps for Claude, Codex, Grok, and ACP agents. Where T3 Code is better, and why Happy is the T3 Code alternative for teams.',
    cardLine: 'A team server and one harness for every model',
    group: 'Compare',
  },
  {
    path: 'pi-durable',
    sourcePath: '/content/desktop/pi-durable.mdx',
    title: 'Happy vs Pi Durable',
    pageTitle: 'Happy vs Pi Durable — Durable Agent Harnesses Compared',
    description: 'Happy vs Pi Durable, plus PiHarness on Cloudflare and durable-harness on Vercel: what survives a crash, where each runs, and who each one is for.',
    cardLine: 'An app you use, or a library you build on',
    group: 'Compare',
  },
  {
    // The two comparison sections that opened the remote server guide, moved whole.
    path: 'remote-server-alternatives',
    sourcePath: '/content/desktop/remote-server-alternatives.mdx',
    title: 'Happy vs tmux, Remote Control, and exe.dev',
    pageTitle: 'Keep Claude Code Running: tmux, Remote Control, exe.dev, T3 Code, Happy',
    description: 'Keep a coding agent running while your laptop sleeps: tmux and SSH, Claude Code Remote Control, exe.dev, T3 Code, and Happy Agent on a server, compared.',
    cardLine: 'tmux, Remote Control, exe.dev, T3 Code, and Happy',
    group: 'Compare',
  },
  {
    // The comparison that closed the Secrets page, moved whole.
    path: 'hermes-agent-openclaw-secrets',
    sourcePath: '/content/desktop/hermes-agent-openclaw-secrets.mdx',
    title: 'Secrets: Happy vs Hermes Agent and OpenClaw',
    pageTitle: 'Agent Secrets Compared: Happy, Hermes Agent, and OpenClaw',
    description: "How Happy, Hermes Agent, and OpenClaw keep API keys from coding agents: where values live, how a command receives one, and scope, from each project's docs.",
    cardLine: 'Three designs for keeping keys from models',
    group: 'Compare',
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
    description: 'Every AI app keeps adding ways to start. In Happy, all new work starts with a stem cell: just say what you want done, and the sidebar self-organizes.',
    group: 'Blog',
    video: { path: '/video/stem-cell.mp4', width: 1280, height: 720 },
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
    forPeople: { href: '/mobile-app/', label: 'Claude Code mobile app' },
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
]

export const documents: DocumentEntry[] = [
  ...happyDocuments.map((document) => ({ ...document, product: 'happy' as const })),
  ...desktopDocuments.map((document) => ({ ...document, product: 'desktop' as const })),
]

const productDocumentGroups: Record<ProductKey, DocumentGroup[]> = {
  happy: ['Start here', 'Guides', 'Features', 'Use cases', 'Comparisons', 'Releases', 'Resources'],
  desktop: ['Start here', 'Your team', 'The app', 'Where this goes', 'Under the hood', 'Guides', 'Compare', 'Blog', 'Changelog', 'Recipes'],
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

/** The page a document sits under in the sidebar: its own `parent`, or the recipe index for a recipe. */
export function documentParent(document: DocumentEntry) {
  if (document.parent) return document.parent
  return document.product === 'desktop' && document.group === 'Recipes' && document.path !== 'recepies' ? 'recepies' : undefined
}

/**
 * Previous and next follow the reading order, which skips nested pages: a nested page sits
 * between its parent and the page after the parent. An unlisted page gets neither.
 */
export function adjacentDocuments(document: DocumentEntry): { previous?: DocumentEntry; next?: DocumentEntry } {
  const order = listedDocumentsForProduct(document.product).filter((entry) => !documentParent(entry))
  const parentPath = documentParent(document)
  const anchor = parentPath ? order.find((entry) => entry.path === parentPath) : document
  const index = anchor && !document.hidden ? order.indexOf(anchor) : -1
  if (index === -1) return {}
  return parentPath ? { previous: anchor, next: order[index + 1] } : { previous: order[index - 1], next: order[index + 1] }
}

/**
 * A page's label in the sidebar and in previous and next. The recipe index keeps its synced title
 * (scripts/sync-agent-recipes.mjs rewrites it) and shows as the one Recipes link.
 */
export function documentLabel(document: DocumentEntry) {
  return document.product === 'desktop' && document.path === 'recepies' ? 'Recipes' : document.title
}

/** A sidebar group's heading, where it differs from the group's name. */
export function documentGroupLabel(group: DocumentGroup) {
  return group === 'Recipes' ? 'For agents' : group
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

  const intro = loadedSources().documents[document.sourcePath] ?? ''
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
  return loadedSources().legal[`/content/legal/${name}.md`] ?? ''
}

/** The Vision essay at /vision/, titled by its frontmatter; the h1 is that title. */
export function getThesisMarkdown() {
  const thesisSource = loadedSources().thesis
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