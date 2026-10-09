# Thesis v5: section rewrite brief (Oct 9)

Current article: /Users/kirilldubovitskiy/Happy/Workspaces/slopus-github-io/thesis-page/content/thesis.md (read it first, whole thing, so your section fits the story).
Outline and voice rules: /Users/kirilldubovitskiy/Happy/Bots/where_are_we_going/.context/thesis-core-points-v4.md.
Research (quotable posts and prior art): /Users/kirilldubovitskiy/Happy/Bots/where_are_we_going/.context/thesis-tweets.md, heading "## Thesis v4, per point".
Happy Desktop docs for facts: /Users/kirilldubovitskiy/Happy/Workspaces/slopus-github-io/thesis-page/content/desktop/*.mdx. Claim only what they support.

Voice: "we" (Happy Engineering). Short, plain, quotable. No AI slop. No fancy words. Don't advertise competitors: never say "X and Y do it too". Credit prior art sparingly, only when it genuinely helps the reader. Each section is 2–4 short paragraphs and ends with one line that leads into the next section.

Write ONLY your section, as markdown starting with its `# Title` line, to the output path you were given. Don't touch any other file. Reply with the text when done.

## Kirill's corrections, by section

### One core agent
- Make this the one bold line in the section: **You'll run lots of agents. Only one of them should talk back to you.**
- Add: this agent is invaluable for people who keep opening more work than they can handle. It becomes something like a scrum master for your agents: it knows what's in flight, what's blocked, what needs you.
- REMOVE the Chief of Staff claim. Our current Chief of Staff is NOT this agent. Don't mention it here.
- Keep: one funnel for pings and escalations, checks on things without being asked (cheap models), should live in the cloud. Keep the Greg Brockman credit ("your personal agent, operating on your behalf 24/7", https://x.com/gdb/status/2055335361921130861) and that Muse, dots and Grok Bot are pitched this way.
- The sidebar screenshot stays in this section, with a caption "A fragment of our sidebar today" under it (I handle the caption).

### Chat left the chat
- Already cut: the "Codex, ChatGPT and T3 Code draw charts" line and Maria's tweet. Keep "Reminds you of Arc a bit, right?"
- Otherwise fine. Tighten if anything.

### Fiddle less, understand more
- The Chief of Staff sentence must read as plain English. The fact (from chief-of-staff.mdx): the Chief of Staff is a built-in agent with admin tools; you tell it what you want (set up a project, pair your phone, put an agent on a server, create a team) and it does the setup, asking only for the choices that are yours. Say that plainly, in one sentence, e.g. "Our Chief of Staff already works this way: tell it to pair your phone or put an agent on your server, and it does the setup."
- Keep the Charlie Holtz credit.

### Phone first
- Fine as is.

### One harness
- REMOVE "Mixing providers isn't new; T3 Code and Conductor do it too." No competitor names here.
- A real product screenshot of Happy's model picker (Claude / Codex / Grok) will go in this section; leave a line `![Happy's model picker: switch provider mid-session](/thesis/model-picker.png)` where it belongs (after the paragraph about switching mid-session).
- Keep the facts from how-it-works.mdx and models.mdx: vendor's own prompts and tools verbatim, prompt caching keeps working, shared session/permissions/tools, uses the Claude Code / Codex / Grok CLI sign-ins already on the machine, switch mid-session with the transcript kept. Keep the deeper-integrations list (every terminal session from one hypervisor, updating the harness itself, spreading agents across runners on a team server, later permissions).

### Multiplayer is hard
- REMOVE the Personal Agent Protocol, Nikita Bier's tweet, "Some of this is bigger than one team", and "Standards only work when nobody owns the whole stack". This section is about teams and permissions inside a team only.
- Keep the four questions (whoever can talk to an agent holds its permissions; agents messaging agents; auto-reviewer approving escalation; whose commit on a shared server). Keep our shared-server team mode (https://happy.engineering/desktop/docs/multiplayer/) and OpenClaw Enterprise (https://openclaw.ai/blog/openclaw-enterprise, Sept 29: per-agent identity, agents and credentials in separate namespaces with roles). ChatGPT group chats and Claude in Slack can stay as one sentence.
- End with a line that leads into "Make people happy".

### Make people happy (replaces "Be the nice guys")
- New title: "Make people happy". Bullet: **Make people happy.** plus one sentence.
- Content: open source, any model from any provider, no lock-in, host it yourself or let us host it (Muse runs only Meta's model, dots only OpenAI's). Then: how do we make money is not the question right now; the question is whether we can ship experiences people are genuinely excited about and get hardcore fans. We're going after the top of the funnel: the main agent you talk to for work, and later for the rest of your life. If people are happy using us, the rest follows. Close with: Meta got in touch about an internal pilot because their engineers kept asking to use Happy at work; we hope enough people agree with these bets to give Happy a shot.
