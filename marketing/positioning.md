# Positioning

Draft, 2026-10-09. Every product claim here is backed by a page in `content/desktop/` (cited as its URL). If the docs change, this file follows them, not the other way round.

## In one line

Happy is the open source harness for coding agents: Claude, Codex, and Grok on the subscriptions you already have, on machines you control, reachable from your desktop and your phone. (`/welcome/`, `/how-it-works/`)

## Audiences

### 1. Agents on your own server (new primary, proposed)

**Who.** Developers who keep coding agents running on a machine that is not their laptop: a VPS, a home server, a GPU box, a cloud VM they leave on. They want the agent to keep working while the laptop sleeps, and to start, watch, and approve work from anywhere. exe.dev's users are this crowd: persistent Linux VMs with root and systemd, a built-in web agent (Shelley), and quotes like "I haven't found a service I could code on my phone from like this" on its homepage.

**Pitch.** *Run Claude Code, Codex, and Grok on your own server. Manage them from your desktop and your phone.*

Short forms: "Your agents, on your server, in your pocket." / "A home for coding agents on machines you own."

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

**How we relate to exe.dev.** Complementary, not a rival. exe.dev sells the computer (persistent VMs from $15/month, SSH in as root, HTTPS proxy, its own agent Shelley, bring-your-own LLM subscription; checked 2026-10-09). Happy is what runs the agents on it and puts them on your desktop and phone, with Claude Code's, Codex's, and Grok's native tools. A "Happy on an exe.dev VM" guide fits better than a "Happy vs exe.dev" page; the only real overlap is Shelley. Test the install on an exe.dev VM before writing it.

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

> Placeholder. A Grok research subtask is collecting: how the agents-on-your-server crowd describes the problem in their own words, how exe.dev and similar tools are talked about, which one-liners match that language, and which practitioners are credible. This section and the audience 1 pitch get updated when it arrives.
