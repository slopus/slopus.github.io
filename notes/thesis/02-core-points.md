# Our Thesis: core points (agreed with Kirill, Oct 9)

Voice: "we" (Happy Engineering). Plain words for a visionary tech-Twitter / Hacker News crowd. Short, quotable, no fancy words, no AI slop ("That's the plan", "In a world where", "game-changing", "seamless"). No baseless claims. The order below is the order of the article: each point is one bullet up top and one section below with the same title.

## Why we're building this (opening paragraph, no bullet)

Everyone is going to need a way to talk to AI. We've experimented with a lot of interfaces ourselves (phone remote control for Claude Code, a desktop harness, a terminal UI, sub-agents, teams) and we've been inspired by other teams iterating in the same space. We think this is the last fun piece of software to build for humans, and we want to get it right.

Do NOT claim "the interface has barely moved" or anything like it.

## 1. One core agent

You'll run lots of agents, but only one talks back to you. It sits at the top of your sidebar and is the page you land on. Everything coming in goes through it: it sorts pings and escalations, knows what you care about this week, and reaches out on its own when something needs you. It also checks on things without being asked (cheap models can ask "is everything ok? anything new?" all day for almost nothing). It runs in the cloud, so it keeps going if a device goes offline. Muse, dots and Grok Bot are all pitched this way: one always-on agent. In Happy today, the first row of the sidebar is the Chief of Staff, a built-in agent that configures Happy by conversation.

## 2. Chat left the chat

When was the last time you scrolled up in a chat? Nobody rereads old messages. The sidebar (your task tracker) and the chat (your deep focus) are both PRIME TO BECOME generated artifacts the agent keeps up to date. Don't say they already are. Don't mention "tool calls left first". What replaces the log is open: better documents, a plan the agent keeps current, the agent deciding when to clear the screen vs edit what's there. Codex, ChatGPT and T3 Code already draw charts and diagrams inline. Sessions are really tasks: they spin off more sessions, work across repos, form a tree; the sidebar becomes a map of what agents are doing and what they've made (tasks, docs, previews, PRs).

## 3. Fiddle less, understand more

The busy work OF THE INTERFACE is leaving, not just the busy work of actions agents do for us: configuring, naming things, archiving sessions, opening documents, searching for code. When was the last time you changed an app's settings by hand? You say what you want, or mark up what the agent shows you (circle a number, cross out a paragraph, click a thing), and it goes to the agent instead of running a fixed action. Our Chief of Staff already configures Happy by conversation.
We consume more and more through extremely simple visualizations and interactive demos. Your brain isn't getting smarter, but the agents are: they can spend more effort explaining what's going on, because our comprehension speed is the bottleneck now. This is generative UI through and through: the agent builds from our own components (sidebar trees, progress indicators on tasks, session icons), inside areas we design.
Exceptions: things you can't take back (sharing a secret, messaging someone as you) stay hard permissions you approve yourself.

## 4. Phone first

Less to read and less to fiddle with means you can steer your agents from your phone. That's where Happy started: running Claude Code from your phone. We still design for the phone first.

## 5. One harness

We're betting on a single harness (Happy Agent) under every agent. One harness lets you switch providers and models mid-session without rebuilding your setup, and it makes deeper integrations possible that a pile of separate CLIs can't do:
- controlling all terminal sessions in the hypervisor
- controlling updates of the harness itself
- controlling permissions (in the future)
- distributing agents between runners on a busy team server
And it lets you use each model's strengths natively: Grok for X research, Anthropic models for novel problems, GPT Astra for computer use. Facts to check in the Happy Desktop docs (content/desktop/how-it-works.mdx, models.mdx, agents.mdx): each provider gets its vendor's native prompts and tools; switch model mid-session with the transcript kept; it reuses the Claude Code, Codex and Grok sign-ins already on the machine.

## 6. Multiplayer is hard

Agents need permissions to do anything. If you let someone talk to your agent, that person now has its permissions. If agents message other agents, those agents need the permissions too. Should an automatic reviewer approve an agent asking for more access? Whose commit is it when several people work from the same server? Facts: our team mode is a shared server a team that trusts each other runs (happy.engineering/desktop/docs/multiplayer/); plain OpenClaw is one trust boundary per gateway; OpenClaw Enterprise (announced Sept 29, 2026, started at OpenAI) gives each agent its own identity and splits agents/credentials into separate namespaces with roles. ChatGPT has group chats; Claude Tag puts Claude in Slack channels. Permissions bigger than one team: Nikita Bier tweet; Meta + Sierra's Personal Agent Protocol (Oct 6).

## 7. Be the nice guys

Not "open source is the moat". Say: be the nice guys. Open source, no vendor lock-in, host it yourself or let us host it. Any model from any provider; switch when a better one ships. Muse runs only Meta's model, dots only OpenAI. Closing: Meta got in touch about an internal pilot because their engineers kept asking to use Happy at work; we hope enough people agree with these bets to give Happy a shot.
