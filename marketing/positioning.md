# Positioning

Draft, 2026-10-09. Every product claim here is backed by a page in `content/desktop/` (cited as its URL). If the docs change, this file follows them, not the other way round.

## In one line

Happy is the open source harness for coding agents: Claude, Codex, and Grok on the subscriptions you already have, on machines you control, reachable from your desktop and your phone. (`/welcome/`, `/how-it-works/`)

## Audiences

### 1. Agents on your own server (new primary, proposed)

**Who.** People who already pay for Claude Code or Codex and are tired of a laptop that sleeps. They put the agent on a Hetzner or OVH box (about £5–€19 a month), an old laptop, a Mac mini, or an exe.dev or Fly Sprite VM; keep it alive with tmux; reach it over Tailscale; and steer it from Termius, Termux, a Telegram bot, or a phone app (T3 Code, Omnara, Looper, Shellular, Happy). They post the stack, the price, and the failure. See [the research](#x-and-reddit-research) below.

**Pitch.** *Your Claude Code and Codex subscription, on a computer that doesn't sleep.* Subhead: *Steer it from your phone. Open source, with a desktop app for Claude, Codex, and Grok.*

Alternatives, in the order the research ranks them: "Run Claude Code, Codex, and Grok on your own server. Manage them from your desktop and your phone." (closest to the brief; assumes the reader already has a server) and, for a Reddit title only, "The open-source remote control for a VPS."

The headline is true only on the server path: Happy does not keep a laptop awake. Keep the model list as the second or third line, not the headline; multi-model is a reason to stay, not the job people search for.

**What is true today.**

- A remote agent is a personal Happy Agent on another machine, with its own projects, sessions, profile, and credentials. (`/guides/remote-agents/`)
- It runs as one binary under systemd as a dedicated user, signed in to Claude Code, Codex, or the Grok CLI as that user. (`/guides/remote-agents/`)
- It connects over **Tailcat** only, embedded in every release: a stable, unguessable address through NAT, with no tunnel account or firewall rules. Reaching the address is not authentication; the runtime's own credential is still required. (`/guides/remote-agents/`)
- It is registered as a `[connections.<id>]` entry in the local `happy.toml`, or by the Chief of Staff, which installs the binary and service on a machine you SSH to, with the provider accounts and Git identity you approve, and verifies a real session. (`/guides/remote-agents/`, `/chief-of-staff/`)
- A remote has its own Mobile Access path, so the phone reaches it too. (`/guides/remote-agents/`)
- Sessions are durable: they survive a closed window and a restart. (`/agents/`, `/how-it-works/`)
- Every command runs under the same OS sandbox and Auto review on the server as on a laptop. (`/permissions/`, `/multiplayer/`)
- Phone-only alternative that works today: `npm install -g happy` and `happy claude` or `happy codex` on the server; its daemon lets the phone start and resume sessions with no terminal attached. (`/guides/terminal/`) The original CLI is in maintenance mode, so lead with Happy Agent and mention this as the light option.

**What is not true yet. Do not imply it.**

- "Add a remote by naming a machine, with its projects beside local ones and connect/disconnect on demand" is in progress. (`/guides/remote-agents/`, `/how-it-works/`) Setup today is the Chief of Staff or the by-hand steps.
- There is no SSH transport. SSH is only how the Chief of Staff reaches the machine to install it.
- Not hosted. We do not sell machines; you bring the server.
- The by-hand path is Linux with systemd. On Ubuntu 24.04 an administrator AppArmor profile for the daemon is needed. (`/guides/remote-agents/`)
- Tailscale and tmux are what this crowd uses today, but Happy needs neither: Tailcat reaches the remote, the relay reaches the phone, and sessions live in the runtime. Say that, rather than writing tutorials that require them.
- A self-hosted relay is documented only for the original stack (`/docs/guides/self-hosting/`). Check whether Happy Desktop's Mobile Access can use one before promising it to the people asking for it.

**How we relate to exe.dev.** Complementary, not a rival. exe.dev sells the computer: persistent Linux VMs sharing a CPU and memory pool (Personal plan $15/month for 2 vCPU / 4 GiB), SSH in as root with apt and systemd, an HTTPS proxy, no public IP. New VMs ship with Claude Code and Codex installed; Shelley is its own web agent, and it proxies LLM calls so no key sits on disk. (exe.dev, `/pricing`, `/docs/use-case-agent`, checked 2026-10-09.) Happy is the control surface for the subscription the user already has: approvals and sessions on the phone and desktop instead of a phone terminal. Never pitch Happy as a Shelley replacement. A "Happy on exe.dev" docs page fits; a "Happy vs exe.dev" page does not. Test the install on an exe.dev VM first. A helpful docs page and answers beat a co-marketing ask.

**Proof we owe this audience.** A page that walks from a fresh VM to an approved change from the phone, a 60-second video of the same, and the by-hand install tested on Ubuntu 24.04 and Debian.

### 2. Claude Code and Codex from your phone (existing, largest)

**Who.** The Happy Coder audience: people already using Claude Code or Codex who want to keep going away from the desk. They find us through "claude code mobile", "claude code on phone", and the App Store.

**Pitch.** *Run Claude Code and Codex from your phone. Your agents keep working on your own computer.*

**True.** iOS and Android, free, MIT. Pair once by QR. Send messages and images, answer permission requests, switch model and permission mode, start a session in a directory, read files and Git changes. End-to-end encrypted: the relay sees that sessions exist, not their content. (`/mobile-app/`, `/mobile/`)

**Fair comparison.** Claude Code Remote Control is simpler for Claude-only users who already have the Claude app; we say so. (`/vs/claude-code-remote-control/`)

### 3. One desktop app for every model

**Who.** Developers with more than one of Claude Code, Codex, and the Grok CLI who want them in one place and do not want API keys.

**Pitch.** *The open source desktop app for Claude Code, Codex, and Grok.*

**True.** macOS, Windows, Linux. Each model gets its vendor's own prompts and tools; switch mid-session and the transcript stays; subagents pick their own model. Credentials come from the CLI sign-ins already on the machine; no Happy plan for model access; requests are never proxied. Bedrock for Claude and GPT. (`/desktop-app/`, `/models/`)

**Fair comparison.** Vendor apps get new features first and do things we do not (cloud sessions, computer use). (`/desktop-app/`)

### 4. Small teams (later)

**Who.** A few people sharing one agent server.

**Pitch.** *One Happy Agent for your team, on a server you run.*

**True.** A team is a Happy Social organization with a registered Happy Agent endpoint. Members sign in with Happy Social; that is the authentication boundary, and Tailcat encrypts the transport. Setup is deliberate and multi-step today; adding a teammate from the sidebar is not built. (`/multiplayer/`) Hold back on marketing this until setup is shorter.

## Claims checklist

| Say | Do not say |
| --- | --- |
| Open source, MIT | "Free forever" or anything about pricing plans we have not announced |
| Your Claude Code, Codex, and Grok CLI sign-ins; no Happy plan for model access | "Bring your API key" as the main path (Bedrock keys are the exception) |
| Remote agents over Tailcat, registered in `happy.toml` or by the Chief of Staff | SSH transport, "connect over SSH", hosted machines |
| Team servers with Happy Social sign-in | SSO, LDAP, or "enterprise" |
| Skills and MCP; an agent can write both | Plugins, a plugin system, or a marketplace. Happy Desktop ships none. `/plugins/` is a Codex plugin we publish, not a Happy extension surface |
| End-to-end encrypted phone sync; the relay sees ciphertext | "Zero-knowledge" or "nothing leaves your machine": model requests go to the provider, and analytics go to PostHog unless turned off (`/how-it-works/`) |
| Durable sessions that survive a restart | "Never loses work" |
| Auto mode: sandboxed, with automatic review instead of prompts | "Safe to run unattended in Full access", or that the sandbox makes Full access safe |
| Happy Desktop (current); the `happy` CLI in maintenance mode | "Happy Coder" as the product name, except to say it is the same project |

## X and Reddit research

Read-only research on X, Reddit, and Hacker News, 2026-10-09. Links are to public posts; titles and paraphrases come from search tools, and Reddit bodies were not fully fetched. Founder-claimed numbers are marked as claims; opinions are marked.

### What the audience says

The language is "a computer that doesn't sleep, steered from my phone", not "one app for three models".

- The common stack: agent in tmux, Tailscale to the box, Termius on the phone. Termius posts it as a recipe ([TermiusHQ](https://x.com/TermiusHQ/status/2082616764605874207)). Variations add Hetzner, Herdr, mosh, or a Telegram bot with a button for decisions ([1](https://x.com/millerbath/status/2108000199255929102), [2](https://x.com/gamccarthy/status/2108569720001528088), [3](https://x.com/axadrn/status/2107020048787255696), [4](https://x.com/henryhund/status/2108584951171989826)).
- Reddit threads with the job in the title: "Tmux + Tailscale + Claude Code + Phone, 2026 coding meta" ([r/Tailscale](https://www.reddit.com/r/Tailscale/comments/1q9xwni/tmux_tailscale_claude_code_phone_2026_coding_meta)); "why I moved Claude Code off my laptop and onto a [Hetzner]" ([r/ClaudeAI](https://www.reddit.com/r/ClaudeAI/comments/1w5bx9x/why_i_moved_claude_code_off_my_laptop_and_onto_a/)); "PSA: you don't need a paid closed-lid agent", since tmux, Tailscale, and SSH are enough ([r/LLMDevs](https://www.reddit.com/r/LLMDevs/comments/1wu0r26/psa_you_dont_need_a_paid_closedlid_agent/)). Commenters say the tools on top exist to fix phone UX.
- Complaints:
  - Phone terminals: bad paste, no images, a shifting screen ([jackfriks](https://x.com/jackfriks/status/2080647131241591098)).
  - Claude Code Remote Control drops when the host sleeps or the network is down for about ten minutes ([HN](https://news.ycombinator.com/item?id=47645915), [HN](https://news.ycombinator.com/item?id=47775039), [r/ClaudeCode](https://www.reddit.com/r/ClaudeCode/comments/1wv64xl/remotecontrol_still_dies_fix_it_or_remove_the/)).
  - A phone app lives or dies on one-tap permission approval ([karanjagtiani04](https://x.com/karanjagtiani04/status/2108304916800471171)).
- Happy users already do this: a VPS or Mac mini with Happy for notifications, and some ask to run the relay on their own box over Tailscale ([chrisemoody](https://x.com/chrisemoody/status/2028115246926156016), [9hills](https://x.com/9hills/status/2042445100421406775)).
- The unit people shared about Happy was "type `happy` instead of `claude`, pick it up on your phone" ([iannuttall](https://x.com/iannuttall/status/1963938928186245536)).
- Not in this conversation: Modal and Coolify (an app PaaS, not an agent host). OpenClaw on a Hetzner box is a chat assistant, a different job.

### One-liners tested against that language

| Line | Verdict |
| --- | --- |
| "One app for Claude Code, Codex and Grok" (the current homepage) | Nobody talks this way; they name one agent and a box. It is T3 Code's category, and T3 has Theo's audience. Keep it as the third line |
| "Agents on your server, steered from your phone" | Closest to the brief. Assumes the reader already has a server |
| "Your Claude subscription, on a computer that doesn't sleep" | The strongest pain line: Remote Control's documented failure is the host sleeping. Proposed headline (opinion) |
| "ssh, but you can approve the diff from your phone" | Matches Termius refugees, but sounds like another phone terminal |
| "The open-source remote control for a VPS" | A good Reddit title, too aggressive as the brand line (opinion) |

What the current pitch misses: the laptop can sleep when the agent is on a server, and the pain is permission stalls and dropped sessions, not a model list. Theo's claim of about 85% week-over-week retention among T3 users with both Claude and Codex installed ([theo](https://x.com/theo/status/2108710634095612213)) is a reason to keep multi-model visible, lower down.

### The landscape

| Product | What it is | Signal |
| --- | --- | --- |
| [T3 Code](https://github.com/pingdotgg/t3code) | Free OSS client; mobile apps since July 2026; drives a machine you own | Founder claims 400k → 450k users in four days in early October 2026; distribution is Theo's existing audience |
| [Omnara](https://news.ycombinator.com/item?id=44878650) (YC S25) | "Run Claude Code from anywhere"; later a cloud sandbox for when the laptop drops | Show HN about 310 points; Product Hunt #1 |
| [Conductor](https://www.conductor.build/changelog/0.90.0-conductor-for-ios) (YC S24) | Mac app for parallel agents in worktrees; iOS app on 2 October 2026 | Site claims 100k+ builders |
| Claude Code Remote Control | First-party, Claude only | Simplest; drops on sleep (above). See `/vs/claude-code-remote-control/` |
| Looper, Shellular, pocketdev | Small phone apps or scripts for a VPS-hosted agent | Single posts |
| exe.dev | The computer, not the client | Preview Show HN 457 points; Crawshaw's essay ["I am building a cloud"](https://news.ycombinator.com/item?id=47872324) 1,115 points, while the Series A post got 20 |
| [Crystal](https://github.com/stravu/crystal), [1Code](https://github.com/21st-dev/1code) | "A nicer Claude window" | Stalled at about 3k and 5.6k stars; deprecated or archived |

The pattern: launches that moved had an existing audience (Theo), a one-line job (Omnara, `ssh exe.dev`), or a technical essay (Crawshaw). GUIs without a job stalled.

exe.dev was built by David Crawshaw (a Tailscale co-founder) and Josh Bleecher Snyder ([about](https://exe.dev/about)).
