---
title: "Vision"
---

Everyone is going to need a way to talk to AI. We think this is one of the most important problems to be solving today, and we want to get it right.

- **Make people happy.** ![A small, very happy pig](/thesis/pig.png) We want to make something nice. Polished UX, open source, any model, no lock-in. If people are happy using us, the rest follows.
- **One primary agent.** You'll run lots of agents, but only one talks back to you.
- **Chat left the chat.** When was the last time you scrolled up in a chat? The sidebar (your task tracker) and the chat (your deep focus) are both prime to become generated artifacts.
- **Fiddle less, understand more.** The busy work of the interface is leaving. Your comprehension is the bottleneck now.
- **Phone first.** Less to read and less to fiddle with means your phone is enough.
- **One harness.** Any model from any provider, and things a pile of separate CLIs can't do.
- **Permissions belong to the agent.** Today whoever can talk to an agent holds its permissions. They should be the agent's own.

# Make people happy

We want to make something nice. Polished UX. Open source. Any model from any provider, and switch when a better one ships. Host it yourself or let us.

How will we make money? We're not focusing on it right now. Today the only paid thing is voice: 20 free minutes every 30 days through ElevenLabs, then up to 5 hours per 30 days on a paid tier in the mobile app. Later, probably a referral code with the VPS providers you host your Happy agents on, or our own hosting and extra features. The question right now is whether people get genuinely excited and become hardcore fans. We're going after the top of the funnel: the main agent you talk to for work, and later for the rest of your life.

Meta got in touch about an internal pilot because their engineers kept asking to use Happy at work. We hope enough people agree with these bets to give Happy a shot.

# One primary agent

**You'll run lots of agents. Only one of them should talk back to you.**

![A fragment of our sidebar today](/thesis/sidebar.png "A fragment of our sidebar today")

Ten sessions means ten sources of pings, and most don't need you. One agent takes them all, knows what you care about this week, and interrupts you only when it must. Cheap models let it check "anything new?" all day for almost nothing, and it lives in the cloud, so it keeps going when a device goes offline.

If you keep opening more work than you can handle, this agent is your scrum master: what's in flight, what's blocked, what needs you.

# Chat left the chat

![Your agent at the top of the sidebar with a tree of tasks below it, and the focused task as one living page](/thesis/layout.svg)

**Nobody rereads old messages.** So the chat doesn't need to be a log that only grows. **The sidebar and the chat are both prime to become generated artifacts.** The agent will maintain a live version of this chat-like artifact, so context switching feels seamless: one screen gets you up to speed. There are already [glimpses of it](https://openai.com/index/gpt-6-for-everyone/) in ChatGPT's Intelligent UI.

Sessions are really tasks. They spin off more sessions, span repos and form a tree, so the sidebar becomes a map of what your agents are doing and what they've made. Reminds you of Arc a bit, right?

The agent keeps that map and hides what doesn't matter right now. We all start five side hustles and context-switch ourselves to death. Don't switch. Come back when they've made something you trust.

# Fiddle less, understand more

![Static buttons in apps over time, falling toward zero, with a marker for where we are today](/thesis/buttons.svg "Static buttons in apps are on their way to zero")

Configuring, naming things, archiving sessions, searching for code: when was the last time you changed an app's settings by hand? That busy work is next to go.

You say what you want, or mark up what the agent shows you: circle a number, cross out a paragraph, click a thing. It all goes to the agent, not to a fixed action. Our [Chief of Staff](/chief-of-staff/) already works this way: tell it to pair your phone, and it does the setup. Only what you can't take back, like sharing a secret or messaging someone as you, stays a permission you approve yourself.

Your brain isn't getting smarter, but the agents are. So they should do the explaining: simple visualizations, small demos, an overview of a change instead of a diff. Generative UI, from our own components, inside areas we design.

# Phone first

Approving from your phone is already normal. Doing the work from it is next. We started Happy as Claude Code on your phone; today the [mobile app](/mobile/) joins the same sessions as Desktop, and we still design for the phone first.

# One harness

![Happy's model picker, with Codex, Claude and Grok models in one list](/thesis/model-picker.png "Codex, Claude and Grok in one picker")

We're betting on one harness, [Happy Agent](/how-it-works/), under every agent. Each provider gets its vendor's own prompts and tools, verbatim. Everything else is shared: one session, one permission model, one set of tools.

That's what lets you [run Claude, GPT and Grok](/models/) in one app and give each subagent the model it's best with: Grok for X research, Anthropic models for novel problems, GPT Astra for computer use.

It also allows what a pile of separate CLIs can't: one hypervisor over every terminal session, a harness that updates itself, agents spread across a team server's runners, and later, finer permissions.

# Permissions belong to the agent

Agents need permissions to do anything. Let someone talk to your agent and they hold its permissions. Let agents message agents and those need permissions too. Should an automatic reviewer approve an agent asking for more access? Whose commit is it when several people work from one server?

Today a team that trusts each other can run a [shared server](/multiplayer/), each member with their own identity, everyone under the same [sandbox and review](/permissions/). But the agent still runs with the server's permissions, whoever is talking to it. A start, not an answer.

The one serious attempt we've seen is [OpenClaw Enterprise](https://openclaw.ai/blog/openclaw-enterprise): each agent gets its own identity, and agents and credentials live in separate namespaces with roles. Respect. Permissions should belong to the agent, not to whoever is talking to it.

![A small, very happy pig](/thesis/pig.png)
