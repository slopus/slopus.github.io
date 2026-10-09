---
title: "Our Thesis"
---

## Why we're building this

Everyone is going to need a way to talk to AI. We've tried a lot of ways ourselves: a phone remote for Claude Code, a desktop harness, a terminal UI, sub-agents, teams. Other teams are working on the same problem, and we've learned a lot from them. Most of the bets below aren't new, and where someone got there first, we say so. We think this is the last fun piece of software to build for humans, and we want to get it right.

- **One core agent.** You'll run lots of agents, but only one talks back to you. It sorts everything coming in and reaches out when something actually needs you.
- **Chat left the chat.** Nobody scrolls up. The sidebar and the chat are ready to become pages the agent keeps current, not logs you keep up with.
- **Fiddle less, understand more.** The busy work of the interface is leaving. The time it frees goes into understanding, because your comprehension is the bottleneck now.
- **Phone first.** Less to read and less to fiddle with means your phone is enough to steer your agents.
- **One harness.** One harness under every agent lets you switch models mid-session and build things a pile of separate CLIs can't.
- **Multiplayer is hard.** Whoever can talk to an agent holds its permissions. Sharing agents safely is the unsolved part, for us and for everyone else.
- **Be the nice guys.** Open source, any model, no lock-in. Host it yourself or let us host it.

# One core agent

You'll run lots of agents. Only one of them should talk back to you.

Ten sessions means ten sources of pings, and most of them don't need you. So everything coming in goes through one agent. It knows what you care about this week, sorts the pings and escalations, and interrupts you only when something does need you. It also checks on things without being asked. Cheap models can ask "is everything ok? anything new?" all day for almost nothing. It should live in the cloud, so it keeps going when one of your devices goes offline.

This isn't our idea. Greg Brockman [described ChatGPT](https://x.com/gdb/status/2055335361921130861) as becoming "your personal agent, operating on your behalf 24/7" back in May, and Muse, dots and Grok Bot are all pitched as one always-on agent. In Happy today, the first row of the sidebar is the Chief of Staff, a built-in agent you configure Happy by talking to.

[screenshot: Happy sidebar with the Chief of Staff as the first row and sessions below it]

Once one agent does the talking, you stop needing to read everything the others said.

# Chat left the chat

When was the last time you scrolled up in a chat? Nobody rereads old messages.

So the chat doesn't need to be a log that only grows. The sidebar (your task tracker) and the chat (your deep focus) are both prime to become artifacts the agent generates and keeps current. What replaces the log is still open. Maybe much better documents. Maybe a plan the agent keeps current as the work moves. Maybe an agent that decides when to clear the screen and when to edit what's already there. Codex, ChatGPT and T3 Code already draw charts and diagrams inline instead of walls of text.

Sessions are really tasks. They spin off more sessions, work across repos and form a tree. So the sidebar becomes a map of what your agents are doing and what they've made: tasks, docs, previews, pull requests.

https://x.com/maria_rcks/status/2106620125923393849

[diagram: core agent at the top of the sidebar, a tree of tasks below it with docs, previews and PRs under each task, the focused task in the middle as one living page — could reuse /thesis/layout.svg]

If the agent keeps the page current, you shouldn't have to keep the app tidy either.

# Fiddle less, understand more

Agents already took over a lot of busy work. The busy work of the interface is next: configuring, naming things, archiving sessions, opening documents, searching for code. When was the last time you changed an app's settings by hand?

You say what you want, or you mark up what the agent shows you. Circle a number, cross out a paragraph, click a thing. It goes to the agent instead of running a fixed action. Our Chief of Staff already configures Happy this way. The exceptions are things you can't take back, like sharing a secret or messaging someone as you. Those stay hard permissions you approve yourself.

The time you save goes into understanding. Your brain isn't getting smarter, but the agents are. Our comprehension speed is the bottleneck now, so agents should spend more effort explaining: very simple visualizations, small interactive demos. As Charlie Holtz at Conductor [put it](https://x.com/charlieholtz/status/2107214308744790109), you don't need to read the diffs closely when the agent can package up an overview instead. That's generative UI through and through, built from our own components (sidebar trees, progress indicators on tasks, session icons) inside areas we design.

[mockup: user circles a number in a chart the agent made; the mark goes back to the agent as a message]

And once there's less to read and less to click, you don't need a big screen.

# Phone first

Less to read and less to fiddle with means you can steer your agents from your phone. The phone is already where people approve agents: Stripe Link asks you to confirm an agent's purchase there.

That's where Happy started: running Claude Code from your phone. Today the mobile app joins the same sessions as Desktop through an encrypted relay. We still design for the phone first.

[screenshot: Happy on iPhone answering an agent's question from the Inbox]

To be the same agent on every device, it has to be the same harness underneath.

# One harness

We're betting on one harness, Happy Agent, under every agent. Each provider gets its vendor's own prompts and tools, close enough to the native request that prompt caching keeps working. Everything around the model is shared: one session, one permission model, one set of tools.

That's what lets you switch from Claude to GPT to Grok mid-session and keep the transcript. Mixing providers isn't new; T3 Code and Conductor do it too. Happy uses the Claude Code, Codex and Grok CLI sign-ins already on your machine, so there's no key to paste. You get each model's strengths natively: Grok for X research, Anthropic models for novel problems, GPT Astra for computer use.

https://x.com/dani_avila7/status/2107918789316854010

One harness also makes deeper integrations possible that a pile of separate CLIs can't do: controlling every terminal session from one hypervisor, controlling updates of the harness itself, spreading agents across runners on a busy team server, and later, finer control over permissions.

[screenshot: Happy's model picker switching Claude → Grok mid-session, transcript intact]

A busy team server brings us to the hardest part.

# Multiplayer is hard

Agents need permissions to do anything. If you let someone talk to your agent, that person now has its permissions. If agents message other agents, those agents need permissions too. Should an automatic reviewer approve an agent asking for more access? Whose commit is it when several people work from the same server?

Group chats in ChatGPT and Claude in Slack already put several people in front of one AI. Our team mode keeps the trust question simple: a team that trusts each other runs a [shared server](https://happy.engineering/desktop/docs/multiplayer/), and everyone connects with their own identity. Plain OpenClaw also draws one trust boundary per gateway. [OpenClaw Enterprise](https://openclaw.ai/blog/openclaw-enterprise), announced September 29, goes further: each agent gets its own identity, and agents and credentials are split into separate namespaces with roles.

Some of this is bigger than one team.

https://x.com/nikitabier/status/2107157904168239416

Meta and Sierra's [Personal Agent Protocol](https://sierra.ai/blog/introducing-personal-agent-protocol), announced October 6, is a start: an open way for personal agents to prove they act for a real user. We'd rather build on standards like that than invent our own.

Standards only work when nobody owns the whole stack. That's how we want to build Happy too.

# Be the nice guys

Be the nice guys. Happy is open source, with no vendor lock-in. Host it yourself, or let us host it. Use any model from any provider, and switch when a better one ships. Muse runs only Meta's model. dots runs only OpenAI's.

Meta got in touch about an internal pilot because their engineers kept asking to use Happy at work. We hope enough people agree with these bets to give Happy a shot.

---

<!-- Visual notes (not part of the post) -->

One harness, candidate files (none opened; sizes checked with sips):

- /Users/kirilldubovitskiy/Developer/happy-desktop/packages/happy-desktop-ui/src/__screenshots__/ComposerModelControl.test.tsx/composes-the-controlled-model-picker-into-the-composer-and-navigates-its-panels-1.png (1568×1048). Component-test capture of the model picker inside the composer.
- /Users/kirilldubovitskiy/Developer/happy-desktop/packages/happy-desktop-ui/dev/pages/ComposerModelControlPage.tsx. Blueprint page C-145 "Composer model control", models grouped by provider (GPT-5.6 Sol under Codex, Opus 5 under Claude). Re-capture with `pnpm blueprint`; add a Grok entry to show Claude → Grok.
- /Users/kirilldubovitskiy/Developer/happy-desktop/packages/happy-desktop-ui/src/__screenshots__/ProviderSearchTranscript.test.tsx/shows-a-provider-run-search-in-the-transcript--from-Rig-s-own-events-1.png (1528×648). A provider-native search shown in the shared transcript.
- /Users/kirilldubovitskiy/Happy/Workspaces/slopus-github-io/thesis-page/public/og/happy-harness-v24.png (1200×630). Existing harness OG image.
- /Users/kirilldubovitskiy/Happy/Workspaces/slopus-github-io/thesis-page/public/img/happy-one/providers/{claude,openai,grok}.svg. Provider logos for a simple "one harness, three providers" diagram.

Chat left the chat: /Users/kirilldubovitskiy/Happy/Workspaces/slopus-github-io/thesis-page/public/thesis/layout.svg (already used in earlier drafts).

Embedded posts: dani_avila7's image wasn't opened; check that it shows per-task model routing before publishing.
