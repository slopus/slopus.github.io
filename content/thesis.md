---
title: "Our Thesis"
---

Everyone is going to need a way to talk to AI. We've tried a lot of ways ourselves: a phone remote for Claude Code, a desktop harness, a terminal UI, sub-agents, teams. Other teams are working on the same problem, and we've learned a lot from them. Most of the bets below aren't new, and where someone got there first, we say so. We think this is the last fun piece of software to build for humans, and we want to get it right.

- **One core agent.** You'll run lots of agents, but only one talks back to you. It sorts everything coming in and reaches out when something actually needs you.
- **Chat left the chat.** When was the last time you scrolled up in a chat? The sidebar (your task tracker) and the chat (your deep focus) are both prime to become generated artifacts the agent keeps current.
- **Fiddle less, understand more.** The busy work of the interface is leaving. The time it frees goes into understanding, because your comprehension is the bottleneck now.
- **Phone first.** Less to read and less to fiddle with means your phone is enough to steer your agents.
- **One harness.** One harness under every agent lets you switch models mid-session and build things a pile of separate CLIs can't.
- **Multiplayer is hard.** Whoever can talk to an agent holds its permissions. Sharing agents safely is the unsolved part, for us and for everyone else.
- **Be the nice guys.** Open source, any model, no lock-in. Host it yourself or let us host it.

# One core agent

You'll run lots of agents. Only one of them should talk back to you.

Ten sessions means ten sources of pings, and most of them don't need you. So everything coming in goes through one agent. It knows what you care about this week, sorts the pings and escalations, and interrupts you only when something does need you. It also checks on things without being asked. Cheap models can ask "is everything ok? anything new?" all day for almost nothing. It should live in the cloud, so it keeps going when one of your devices goes offline.

![A fragment of our sidebar today](/thesis/sidebar.png)

This isn't our idea. Greg Brockman [described ChatGPT](https://x.com/gdb/status/2055335361921130861) as becoming "your personal agent, operating on your behalf 24/7" back in May, and Muse, dots and Grok Bot are all pitched as one always-on agent. In Happy today, the first row of the sidebar is the Chief of Staff, a built-in agent you configure Happy by talking to.

Once one agent does the talking, you stop needing to read everything the others said.

# Chat left the chat

When was the last time you scrolled up in a chat? Nobody rereads old messages.

So the chat doesn't need to be a log that only grows. The sidebar (your task tracker) and the chat (your deep focus) are both prime to become artifacts the agent generates and keeps current. What replaces the log is still open. Maybe much better documents. Maybe a plan the agent keeps current as the work moves. Maybe an agent that decides when to clear the screen and when to edit what's already there.

Sessions are really tasks. They spin off more sessions, work across repos and form a tree. So the sidebar becomes a map of what your agents are doing and what they've made: tasks, docs, previews, pull requests. Reminds you of Arc a bit, right?

![Your agent at the top of the sidebar with a tree of tasks below it, the focused task as one living page in the middle, artifacts on the right](/thesis/layout.svg)

If the agent keeps the page current, you shouldn't have to keep the app tidy either.

# Fiddle less, understand more

Agents already took over a lot of busy work. The busy work of the interface is next: configuring, naming things, archiving sessions, opening documents, searching for code. When was the last time you changed an app's settings by hand?

You say what you want, or you mark up what the agent shows you. Circle a number, cross out a paragraph, click a thing. It goes to the agent instead of running a fixed action. Our Chief of Staff already configures Happy this way. The exceptions are things you can't take back, like sharing a secret or messaging someone as you. Those stay hard permissions you approve yourself.

The time you save goes into understanding. Your brain isn't getting smarter, but the agents are. Our comprehension speed is the bottleneck now, so agents should spend more effort explaining: very simple visualizations, small interactive demos. As Charlie Holtz at Conductor [put it](https://x.com/charlieholtz/status/2107214308744790109), you don't need to read the diffs closely when the agent can package up an overview instead. That's generative UI through and through, built from our own components (sidebar trees, progress indicators on tasks, session icons) inside areas we design.

And once there's less to read and less to click, you don't need a big screen.

# Phone first

Less to read and less to fiddle with means you can steer your agents from your phone. Approving is already a phone thing; doing the work is next.

That's where Happy started: running Claude Code from your phone. Today the mobile app joins the same sessions as Desktop through an encrypted relay. We still design for the phone first.

To be the same agent on every device, it has to be the same harness underneath.

# One harness

We're betting on one harness, Happy Agent, under every agent. Each provider gets its vendor's own prompts and tools, close enough to the native request that prompt caching keeps working. Everything around the model is shared: one session, one permission model, one set of tools.

That's what lets you switch from Claude to GPT to Grok mid-session and keep the transcript. Mixing providers isn't new; T3 Code and Conductor do it too. Happy uses the Claude Code, Codex and Grok CLI sign-ins already on your machine, so there's no key to paste. You get each model's strengths natively: Grok for X research, Anthropic models for novel problems, GPT Astra for computer use.

One harness also makes deeper integrations possible that a pile of separate CLIs can't do: controlling every terminal session from one hypervisor, controlling updates of the harness itself, spreading agents across runners on a busy team server, and later, finer control over permissions.

A busy team server brings us to the hardest part.

# Multiplayer is hard

Agents need permissions to do anything. If you let someone talk to your agent, that person now has its permissions. If agents message other agents, those agents need permissions too. Should an automatic reviewer approve an agent asking for more access? Whose commit is it when several people work from the same server?

Group chats in ChatGPT and Claude in Slack already put several people in front of one AI. Our team mode keeps the trust question simple: a team that trusts each other runs a [shared server](https://happy.engineering/desktop/docs/multiplayer/), and everyone connects with their own identity. Plain OpenClaw also draws one trust boundary per gateway. [OpenClaw Enterprise](https://openclaw.ai/blog/openclaw-enterprise), announced September 29, goes further: each agent gets its own identity, and agents and credentials are split into separate namespaces with roles.

https://x.com/nikitabier/status/2107157904168239416

Some of this is bigger than one team.

Meta and Sierra's [Personal Agent Protocol](https://sierra.ai/blog/introducing-personal-agent-protocol), announced October 6, is a start: an open way for personal agents to prove they act for a real user. We'd rather build on standards like that than invent our own.

Standards only work when nobody owns the whole stack. That's how we want to build Happy too.

# Be the nice guys

Be the nice guys. Happy is open source, with no vendor lock-in. Host it yourself, or let us host it. Use any model from any provider, and switch when a better one ships. Muse runs only Meta's model. dots runs only OpenAI's.

How are we going to make money? Not the question right now. The question is whether we can ship experiences people are genuinely excited about and get hardcore fans. We're going after the top of the funnel: the main agent you talk to for work, and later for the rest of your life. If people are happy using us, the rest follows.

Meta got in touch about an internal pilot because their engineers kept asking to use Happy at work. We hope enough people agree with these bets to give Happy a shot.
