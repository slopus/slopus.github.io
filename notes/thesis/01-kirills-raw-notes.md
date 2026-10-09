# Happy Next: raw thesis notes (Kirill's points, for the blog post)

Audience: happy.engineering blog. Author voice: Kirill, first person, founder of Happy.

## Core points (in Kirill's words where possible)

- We are moving towards one agent. You will be talking to a single agent most of the time. We've seen this with Muse, OpenAI's dots, Grok Bot. The level of abstraction is increasing.
- What people don't want: switching between a bunch of different sessions manually and tracking work using the sessions. (Today's Happy sidebar gets polluted fast.)
- Engineers still read code. We still want to look at individual code changes, for very small subsets. New Happy feature for this: "slices", which shows you a subset of the file directory. (Mention briefly; don't elaborate.)
- Engineers have a lot to manage. Non-engineers make almost no sense to target: Muse, Grok, dots, and soon Anthropic and Gemini will satisfy them completely.
- Going up the funnel: hardware, then operating system, then apps. Apps are much easier to distribute and get people to try, and they can become your top-level entry. The top-level orchestrating agent is that entry.
- Core reason to use Happy: use your existing subscriptions, and switch between them without swapping your entire setup when the new agent or model comes out. People who experiment with their setups constantly rotate, try new things, and don't want to be vendor locked in.
- Positioning: "Muse for geeks." Open source. We run it for you in the cloud, and you can also run it yourself.
- Why not just use Muse: tried it, annoyed. The model (Muse Spark, not frontier) is not good compared to Opus 5.5, Fable, or Astra. It just can't do the job.
- One agent on the surface, sub-agents under the hood, including agents on your own machines (Happy Desktop). An agent to talk to your other agents doing the real work.
- It's the only agent that knows all your priorities, so it's the only one that knows when to push-notify you.
- It gets notified about important issues, and sometimes proactively seeks out updates on important things. Dirt-cheap models (e.g. Luna on high) can now do "let's check everything's fine / any updates on the core things we're tracking" for almost nothing.
- Always on, in the cloud. It may lose a computer, but it never stops working. It's your lifeline to your work.
- Fewer buttons, not zero. UX is still worth polishing. Settings can stay hardened and togglable by hand. But the core product interactions, the actual value, go through the chat.
- We need to change how people think about interacting with products: you don't press buttons, you consume information in the most effective form, maybe customize it a bit, and loop it back to take action within the agent (click an artifact and it attaches to your agent; Muse does this well).
- Task tracking / some sidebar stays (reviewing artifacts, prioritizing), even though many products are dropping the sidebar.
- Built as a new interface, to avoid the shackles of the existing codebase.
- Hard, unsolved: permissions and security. It signs into multiple computers and services, and has to hand credentials to sub-agents.
- Distribution: not enterprises (too complex, too hard to scale). Happy and T3 Code showed people bring a good product into their company themselves. Have a viral moment, then keep growing with a really good product in a valid niche.

## Facts from research (use sparingly, verify before quoting numbers)

- Meta Muse launched Sep 8 2026, runs on Muse Spark (not frontier).
- OpenAI dots launched at DevDay Sep 29, GPT-6 Astra, OpenAI-only, delegate to Codex.
- Grok Bot (SpaceXAI + Cursor): always-on bots with their own cloud computers.
- OpenCode's Jay Air: "Muse Spark, a non-SOTA model is good enough for Muse the agent is a sign of things to come."
- Anthropic bans Claude subscription OAuth in third-party apps; wrapping the official Claude Code CLI (as Happy does) is the compliant path.
