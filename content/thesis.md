---
title: "Vision"
---

Everyone is going to need a way to talk to AI. As agents kept improving, working with them has changed quite a bit: chat to the side of the code, then chat front and center, then a growing need for worktrees, plugins, cloud environments and more. We think this is the last fun piece of software to build for humans, and we want to get it right.

- **One core agent.** You'll run lots of agents, but only one talks back to you.
- **Chat left the chat.** When was the last time you scrolled up in a chat? The sidebar (your task tracker) and the chat (your deep focus) are both prime to become generated artifacts.
- **Fiddle less, understand more.** The busy work of the interface is leaving. Your comprehension is the bottleneck now.
- **Phone first.** Less to read and less to fiddle with means your phone is enough.
- **One harness.** Any model from any provider, and things a pile of separate CLIs can't do.
- **Multiplayer is very hard.** Whoever can talk to an agent holds its permissions. None of the labs have truly figured this out yet, and neither have we.
- **Make people happy.** ![A small, very happy pig](/thesis/pig.png) Open source, any model, no lock-in. If people are happy using us, the rest follows.

# One core agent

**You'll run lots of agents. Only one of them should talk back to you.**

![A fragment of our sidebar today](/thesis/sidebar.png "A fragment of our sidebar today")

Ten sessions means ten sources of pings, and most don't need you. One agent takes them all, knows what you care about this week, and interrupts you only when it must. Cheap models let it check "anything new?" all day for almost nothing, and it lives in the cloud, so it keeps going when a device goes offline.

If you keep opening more work than you can handle, this agent is your scrum master: what's in flight, what's blocked, what needs you.

# Chat left the chat

Nobody rereads old messages, so the chat doesn't need to be a log that only grows. The sidebar and the chat are both prime to become artifacts the agent generates and keeps current: better documents, a living plan, a screen it clears or edits instead of appending to.

Sessions are really tasks. They spin off more sessions, span repos and form a tree, so the sidebar becomes a map of what your agents are doing and what they've made. Reminds you of Arc a bit, right?

![Your agent at the top of the sidebar with a tree of tasks below it, and the focused task as one living page](/thesis/layout.svg)

The agent keeps that map and hides what doesn't matter right now. We all start five side hustles and context-switch ourselves to death. Don't switch. Come back when they've made something you trust.

# Fiddle less, understand more

Configuring, naming things, archiving sessions, searching for code: when was the last time you changed an app's settings by hand? That busy work is next to go.

You say what you want, or mark up what the agent shows you: circle a number, cross out a paragraph, click a thing. It all goes to the agent, not to a fixed action. Our [Chief of Staff](/chief-of-staff/) already works this way: tell it to pair your phone, and it does the setup. Only what you can't take back, like sharing a secret or messaging someone as you, stays a permission you approve yourself.

Your brain isn't getting smarter, but the agents are. So they should do the explaining: simple visualizations, small demos, an overview of a change instead of a diff. Generative UI, from our own components, inside areas we design.

# Phone first

Approving from your phone is already normal. Doing the work from it is next. Happy started as Claude Code on your phone; today the [mobile app](/mobile/) joins the same sessions as Desktop, and we still design for the phone first.

# One harness

We're betting on one harness, [Happy Agent](/how-it-works/), under every agent. Each provider gets its vendor's own prompts and tools, verbatim. Everything else is shared: one session, one permission model, one set of tools.

![Happy's model picker, with Codex, Claude and Grok models in one list](/thesis/model-picker.png "Codex, Claude and Grok in one picker")

That's what lets you [run Claude, GPT and Grok](/models/) in one app and give each subagent the model it's best with: Grok for X research, Anthropic models for novel problems, GPT Astra for computer use.

It also allows what a pile of separate CLIs can't: one hypervisor over every terminal session, a harness that updates itself, agents spread across a team server's runners, and later, finer permissions.

# Multiplayer is very hard

Agents need permissions to do anything. Let someone talk to your agent and they hold its permissions. Let agents message agents and those need permissions too. Should an automatic reviewer approve an agent asking for more access? Whose commit is it when several people work from one server?

Today you can invite someone into a Happy session, but the agent still runs with your permissions. A team that trusts each other can run a [shared server](/multiplayer/), each member with their own identity, every command under the same [sandbox and review](/permissions/). A start, not an answer.

The one serious attempt we've seen is [OpenClaw Enterprise](https://openclaw.ai/blog/openclaw-enterprise): each agent gets its own identity, and agents and credentials live in separate namespaces with roles. Respect. Permissions should belong to the agent, not to whoever is talking to it.

# Make people happy

Open source. Any model from any provider, and switch when a better one ships. Host it yourself or let us.

How will we make money? Not the question right now. The question is whether people get genuinely excited and become hardcore fans. We're going after the top of the funnel: the main agent you talk to for work, and later for the rest of your life.

Meta got in touch about an internal pilot because their engineers kept asking to use Happy at work. We hope enough people agree with these bets to give Happy a shot.
