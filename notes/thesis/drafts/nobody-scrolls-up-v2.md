---
title: "Nobody scrolls up"
---

- The work agents do is moving off the screen. The goal is to review less, not read more logs.
- One agent triages everything coming in and decides what reaches you.
- Tool calls leave the default view.
- The chat stops being a log. It becomes an artifact the agent keeps editing.
- Everything you do, talking, marking up, clicking, goes back to the agent instead of running a fixed action.
- The sidebar turns into a browser: a tree of tasks, documents, previews and people, drawn by the agent.

# Our own sidebar

![A fragment of our sidebar today](/thesis/sidebar.png)

This is part of our sidebar on a normal day. We build Happy, an open-source app for running coding agents, and we can't keep up with our own sessions.

Agents got good fast. The apps we use to work with them didn't change much. Most of them, ours included, still show a chat log full of tool calls, next to a list of sessions you're supposed to track yourself.

Sub-agents already run without anyone reading what they did, and that's fine. We think the rest of the transcript goes the same way. The goal is to review less, not read more logs.

We're keeping the layout people already know: tasks on the left, the session you're focused on in the middle, artifacts on the right.

![Tasks and inbox on the left, the focused session in the middle, artifacts on the right](/thesis/layout.svg)

Almost everything inside those columns changes. Here's what we're building for.

# One agent decides what reaches you

Today every agent and every tool notifies you on its own. Ten sessions means ten sources of pings, and most of them don't need you.

We think all of it should go through one agent. It knows what you care about this week, so it can rank what comes in and only interrupt you when it matters. It also goes looking on its own. Cheap models can now ask "is everything ok? anything new?" all day for almost nothing.

You'll still run lots of agents. Only one of them talks to you.

# Tool calls leave the default view

Almost every agent app shows tool calls: every file read, every search, every command. We do too. Nobody reads them. They're on screen because they were easy to show, not because they help.

We want to remove them. You see what changed and what the agent needs from you. The steps are still there if you go looking, and code review stays, because engineers still read code. But the default is the result, not the process.

# The chat becomes the artifact

Nobody scrolls up. You read the last message, maybe the one before it, and move on. So the chat doesn't need to be an append-only log.

Codex, ChatGPT and T3 Code already draw charts and diagrams inline instead of walls of text. We think it goes further. Older turns get summarized, and the agent edits what it already showed you instead of adding more below. The extreme version is a single page that the agent keeps rewriting as you give feedback. We want to try that.

# Everything goes back to the agent

Today you steer an agent two ways. You type into the chat, or you press buttons that run code someone wrote in advance.

We think the buttons mostly go away. You talk, or ramble. You mark up the artifact: circle a number, cross out a paragraph, leave a note on a line. You click on something in it. None of that runs a fixed action. It all goes to the agent as input, and the agent decides what to do. Muse already does this well: click on something and it goes to the agent.

# The sidebar becomes a browser

You still need to know where you are. When the main view keeps changing, you need something that stays put. That's the sidebar, and we're keeping it.

https://x.com/maria_rcks/status/2106620125923393849

But it stops being a list of chats. A session is really a task. It spins off more sessions, works across several repos, and ends in something you ship. So the sidebar becomes a tree of your work, and the tree holds everything: tasks, documents, previews, people.

That's browser territory. We think the AI app of the next few years has more in common with Arc, or Zen today, than with the agent orchestrators we have now.

# The agent draws the interface

Nobody should hand-build that sidebar, or the views in the middle. People already ask agents for charts, diagrams and small apps, and get them. We'll keep a handful of simple building blocks and let the agent generate the rest: the sidebar, and more and more of the chat.

# What we haven't figured out

**Teams.** The naive version works: give everyone on the team the same agent. Keeping that secure is much harder. Who sees what the agent knows? Whose accounts does it act with? OpenClaw is trying this for companies. We don't have an answer yet.

**Permissions.** The agent logs into your computers and accounts, and it hands some of that access to its sub-agents. How much should it hold? How does a service know it's acting for you? One company can't settle that. It needs standards.

https://x.com/nikitabier/status/2107157904168239416

Those are starting to show up. Meta and Sierra just announced the [Personal Agent Protocol](https://sierra.ai/blog/introducing-personal-agent-protocol), an open standard for personal agents to prove they act for a real user. We'll build on standards like that rather than invent our own.

# Who it's for

Muse, dots and Grok will be enough for most people. We're building for the people who want more: the best model this month, the freedom to switch when a better one ships, and code they can read and run themselves. Happy is open source. We'll host it, or you run it.

Meta got in touch about an internal pilot because their engineers kept asking to use Happy at work. That's how we want to grow.
