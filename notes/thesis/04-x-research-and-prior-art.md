# Tweets for the Happy blog draft

Research only. Every quote below was retrieved from X (page HTML or `api.fxtwitter.com`) or from the tweet payload embedded in a retrieved post. Nothing here was reconstructed. Engagement is likes and reposts at retrieval time (about 6 Oct 2026). Where a field was missing from the payload, it is marked unknown.

Draft this set is meant to support: one agent over other agents and session sprawl; Muse’s UX vs weak models; no vendor lock-in; always-on / proactive notifications; agents spreading across accounts and machines, plus permissions; early adopters who want frontier models and open source; engineers pulling tools like Happy or T3 Code into companies.

## Required

### maria (@maria_rcks) — “maria”

- URL: https://x.com/maria_rcks/status/2106620125923393849
- Date: Sun 4 Oct 2026, 05:39:11 UTC
- Text: `is this where we're going`
- Also has one image (UI mockup). Display text is those six words; the raw payload appends the image short link.
- Engagement: 1,083 likes, 23 reposts, 186 replies, 33 quotes, 153 bookmarks, ~77.9K views
- Bio retrieved with the post: “doing something at @theo corp | @t3dotcodes” (T3 Code). ~24.2K followers.
- Claims: one agent / chat-first orchestrator UI; fewer buttons. This is the post the draft should embed.
- Why it’s strong: High engagement on a minimal “is this the UI” mockup from someone at T3, in the last few days. The follow-up makes the point explicit.

Follow-up, same thread, retrieved separately:

- URL: https://x.com/maria_rcks/status/2106620434867237134
- Date: Sun 4 Oct 2026, 05:40:25 UTC
- Text: `oh also no toolcalls or commands visible`
- Engagement: 57 likes, 0 reposts, 2 replies
- Why it’s useful: She is describing a surface that hides the machinery. Lower engagement than the parent, so embed the parent and treat this as the caption.

---

## 1. One agent that talks to the other agents

### Theo (@theo) — “Theo - t3.gg”

- URL: https://x.com/theo/status/2106581208193003977
- Date: Sun 4 Oct 2026, 03:04:33 UTC
- Text: `So who has installed the latest nightly for T3 Code and given Orchestrator V2 a shot? If you have, tell me what went wrong. What was confusing? What broke? What should we focus on next?`
- Engagement: 930 likes, 10 reposts, 371 replies, 3 quotes, ~85K views
- Quotes his own post https://x.com/theo/status/2106221780323143803 (“This is cool as hell” plus a screenshot), which itself had 3,364 likes and 34 reposts on Sat 3 Oct 2026, 03:16:18 UTC. The quoted line does not describe the feature; the Orchestrator V2 post does.
- Claim: T3 Code’s orchestrator is the thing power users are being asked to run.
- Why it’s strong: Founder of T3 Code, posted two days ago, hundreds of replies. Direct evidence the coding-agent crowd is moving to an orchestrator, not another chat tab.

### lauren (@poteto) — “lauren”

- URL: https://x.com/poteto/status/2107244768917172618
- Date: Mon 5 Oct 2026, 23:01:18 UTC
- Text: `love t3code! Projects in cursor are just too good though. you don't need to see threads cluttering up your sidebar if you have a smart coordinator managing them for you. it's entirely changed how i use agents. you'll find that threads and side chats just become busy work for you to manage - when an agent could do it for you`
- Engagement: 381 likes, 9 reposts, 28 replies, ~23K views
- Bio: “Grok @Bot at @SpaceXAI. Shipping with … React compiler core team, prev cursor, meta, netflix”. ~158K followers.
- Claim: one coordinator agent so you stop managing threads by hand. Also session sprawl.
- Why it’s strong: A known agent-product engineer, yesterday, saying the sidebar should disappear behind a coordinator. Very close to the draft.

### TestingCatalog (@testingcatalog) — “🚨 AI News | TestingCatalog”

- URL: https://x.com/testingcatalog/status/2105619522514190357
- Date: Thu 1 Oct 2026, 11:23:09 UTC
- Text:

```
SPACEXAI 🔥: Grok Bot is getting a Primary Bot! Primary bot is meant to be your main AI assistant that can manage other bots and act proactively.

> “I'm here to be your primary bot. I can manage your other bots. Task me with anything. I'll make sure it gets to the right bot.”

> Bot prime appears in the latest iOS app. 

Now it’s a SpaceXAI turn to hop into a private assistant area and compete with Muse. I think it is also a best possible time for Grok Bot to capture global markets outside of US. 

Bot Prime! 🤖
```

- Engagement: 808 likes, 35 reposts, 71 replies, 20 quotes, ~55K views
- Claim: Grok Bot shipping a single primary agent that manages the others and acts proactively. Also always-on.
- Why it’s strong: The clearest public description of “one agent over the other bots,” with real engagement, from a known AI-product news account.

### Matt Van Horn (@mvanhorn) — “Matt Van Horn”

- URL: https://x.com/mvanhorn/status/2103524365090553895
- Date: Fri 25 Sep 2026, 16:37:44 UTC
- Text:

```
Introducing Agent Tincan. Let your AI agents ask each other for help. 

Your agents each have a superpower. Grok Bot is always on in the cloud. Muse makes phone calls and has access to Meta. Instinct runs in iMessage. Codex and Claude Code have your code. ChatGPT and Claude have your chats. 

But they can't talk to each other, so you're the copy-paste. Now they can, all securely over Tailscale.

📞 Ask Grok Bot to have Muse call the restaurant
🖼 Get an image from ChatGPT, from any agent
🔎 Pull a detail out of an old Claude chat
🛠 Talk to Codex on your primary development machine

Runs on your own private Tailscale network. No open ports, nothing leaves it. Open source.

Setup is agent-first: paste one message into your always-on agent and it sets up the rest.
```

- Engagement: 358 likes, 27 reposts, 112 replies, 564 bookmarks, ~52K views
- Claim: people are stuck being the router between specialist agents; the desired shape is one always-on agent that can ask the others. Also open source, and agents reaching across machines.
- Why it’s strong: Names Muse, Grok Bot, Codex, and Claude Code in one breath, and the pain is exactly “you are the copy-paste.” Founder-level account (~41K followers).

### Theo, lower engagement but on the mechanism

- URL: https://x.com/theo/status/2106526518382137750
- Date: Sat 3 Oct 2026, 23:27:14 UTC
- Text:

```
tl;dr - we exposed most of T3 Code's thread capabilities as a built-in MCP

Agents can now:
- Spawn "subagents" (delegates) in any harness with any model
- Spawn threads (even in other projects)
- Communicate with other threads
- Fork context between threads

Very fun :) ask your agent about it!
```

- Engagement: 4 likes, 0 reposts. Reply, not a launch post.
- Why it’s here: This is the only retrieved Theo post that says the orchestrator can spawn subagents in any harness with any model. Do not embed for engagement. Use only if you need the mechanism in his words.

---

## 2. Pain of juggling sessions / sidebar sprawl

### lauren (@poteto)

- URL: https://x.com/poteto/status/2098186080839475568
- Date: Thu 10 Sep 2026, 23:05:18 UTC
- Text:

```
clean up your sidebar!
one tip I have is that you can think of Projects in cursor like a special folder for your chats! a coordinator agent supervises all the agents inside of the project, and you can drag in existing chats from your sidebar into the project

if you have many related chats scattered everywhere, consider moving them into a project! even completed agents can be dragged in - it's a great source of context for the rest of your project
```

- Engagement: 816 likes, 35 reposts, 91 replies, 377 bookmarks, ~102K views
- Claim: sidebar sprawl is bad enough that a known Cursor/Grok Bot engineer’s advice is “clean up your sidebar” and put a coordinator over the chats.
- Why it’s strong: Highest-engagement session-management post retrieved. Pairs with her 5 Oct post above.

### Daniel (@dannyinsf_) — “Daniel”

- URL: https://x.com/dannyinsf_/status/2093407620967092359
- Date: Fri 28 Aug 2026, 18:37:25 UTC
- Text:

```
I usually have 5-10 coding agents running at once, and I kept losing track of what each one was doing, where it was in the repo, and how the work connected.

So I made an infinite map for Claude Code, Codex, and Cursor.

The canvas is endless. Add as many agents as you want, watch them work in parallel, and see the relationships and data flowing between them.

Completely open source. Repo in the replies.
```

- Engagement: 454 likes, 32 reposts, 44 replies, 845 bookmarks, ~56K views
- Claim: parallel agent sessions are untrackable. Also open source.
- Why it’s strong: Concrete pain (5–10 agents, lost track) and the bookmark count says people saved it. About six weeks old, still inside ~2 months.

### forloop (@forloopcodes) — “forloop”

- URL: https://x.com/forloopcodes/status/2093783046415913053
- Date: Sat 29 Aug 2026, 19:29:13 UTC
- Text:

```
I just coined a new term:

Agent saturation
/ˈeɪdʒənt ˌsætʃəˈreɪʃən/

is a state in vibe coding in which a developer, intending to fix bugs and rapidly build features, begins a session by parallel-prompting multiple agents (typically more than five) using goal, ultrawork, and multi-hour sessions. While each agent performs its task, the developer continues to spawn additional agents in order to work faster. Each new agent produces the impression of working hard. Eventually, so many chats are open that the developer's own context becomes saturated. The developer loses track of which agent is doing what and ends up asking each one what it was working on. By the end of the day, none of the implemented features have been tested, no PRs have been merged, and the code shipped is of far lower quality than what a single session would have produced. The developer realizes that more would have been accomplished by working on a single feature at a time in a single chat session.
```

- Engagement: 389 likes, 35 reposts, 43 replies, 18 quotes, ~21K views
- Claim: session sprawl. People lose track of which agent is doing what.
- Why it’s strong: The definition is the draft’s complaint, written by a user, with real engagement.

### Da7em (@Da7_Tech) — “Da7em”

- URL: https://x.com/Da7_Tech/status/2105565507529118005
- Date: Thu 1 Oct 2026, 07:48:31 UTC
- Text:

```
Quick tip: Don't use multiple sessions for your daily, ongoing work.

Keep everything in one session as much as possible.
```

- Engagement: 150 likes, 4 reposts, 33 replies, ~27K views
- Bio: Cognition ambassador, ~11.6K followers.
- Claim: power users are already telling each other to collapse daily work into one session.
- Why it’s strong: Short, recent, and the replies (below) spell out the pain.

Reply with the longer argument. Full text retrieved; likes from the syndication payload; repost count was not in the fields returned before that payload truncated.

- URL: https://x.com/Da7_Tech/status/2105585564695003434
- Date: Thu 1 Oct 2026, 09:08:13 UTC
- Likes: 68. Reposts: unknown. Conversation count on the syndication payload: 20.
- Text (full, from fxtwitter):

```
For me, it’s pretty simple.

If I’m starting a long project that could take hours or even days, I open a fresh session for it. That project gets its own space, and I let the agent work through it without mixing it with everything else.

But for everything around my actual work, research, organizing things, keeping track of projects, checking where previous tasks left off, figuring out what still needs attention, etc., I keep as much of that as possible in one main conversation.

It’s way easier to manage.

I see people with dozens of sessions open at the same time, and at some point you’re not really managing your work anymore.

And I think there’s also this weird illusion of productivity that comes from starting a bunch of sessions. You see 20 agents running and it feels like you’re doing a ton of work.

But you still have a limit.

You can only keep track of so many things at once. You still need to know what stopped, what finished, what needs review, what needs another pass, and what you completely forgot about three hours ago.

That gets exhausting fast.

The more of my work I can keep in one place, the easier it is for me to stay organized and actually know what’s going on.

Some people argue that a long conversation burns more tokens. Maybe it does. Even if it costs me 10% or 20% more, I honestly don’t care.

If that extra usage gives me much better productivity and saves me from constantly jumping between sessions trying to remember what the hell I was doing, that’s an easy trade for me.
```

- Why it’s strong: “dozens of sessions” and “forgot about three hours ago” is the sidebar problem in plain language. Prefer the short post if you only embed one; this is the quote bank.

### Theo on the inbox-style sidebar

- URL: https://x.com/theo/status/2106146674561438124
- Date: Fri 2 Oct 2026, 22:17:52 UTC
- Text:

```
Currently at the hospital waiting for my doc but tl;dr - working hard to solve this with the “inbox style” sidebar in t3 code.

Treat threads as tasks. Goal is always to close/archive/“settle”. If the work is done, make it go away. Screen space should be reserved for incomplete work that is clearly labeled.

Try to end every day with a near-empty inbox. We have auto-settle on PR merge and auto cleanup on threads that haven’t been touched for 3 days
```

- Engagement: 25 likes, 1 repost, 6 replies. Modest. Known account, directly about sidebar pollution in T3 Code.
- Why it’s here: He is treating a polluted thread list as a product bug. Don’t lead with it; the poteto and forloop posts carry the engagement.

### Counter-note, same world

- URL: https://x.com/theo/status/2097818702016290930
- Date: Wed 9 Sep 2026, 22:45:28 UTC
- Text: `If you only run one agent at a time, T3 Code is not for you.`
- Engagement: 1,008 likes, 7 reposts, 151 replies, ~70K views
- Not “one agent on the surface.” It is evidence the T3 audience is people who run many agents at once, which is why an orchestrator and a sidebar cleanup exist. Useful tension with the draft, not a supporting quote for “one agent.”

---

## 3. Muse has the UX; the model is not frontier

### Jay (@jayair) — “Jay”, CEO of OpenCode

- URL: https://x.com/jayair/status/2105834279557341382
- Date: Fri 2 Oct 2026, 01:36:31 UTC
- Text: `The fact that Muse Spark, a non-SOTA model is good enough for Muse the agent is a sign of things to come`
- Engagement: 1,216 likes, 30 reposts, 62 replies, 16 quotes, ~55K views
- Bio retrieved: “CEO @anomalyco @opencode”. ~23.4K followers.
- Claim: Muse Spark is explicitly not SOTA. This is the Jay Air / OpenCode tweet. It is real.
- Why it’s strong: The single best retrieved post for “Muse’s model is not frontier.” Caveat, which the draft should not ignore: Jay’s point is that a non-frontier model is *already good enough* for the Muse agent. That supports “the model is not frontier.” It does not support “it can’t finish the job.” Replies split on whether Spark is actually non-SOTA.

Reply retrieved, low engagement, do not embed:

- https://x.com/Heaney555/status/2106169527088144500 — David Heaney, Fri 2 Oct 2026, 23:48:40 UTC. Text: `Muse Spark 1.3 is 83% as smart as the current SOTA, while being 50% faster and 4x cheaper.` plus a link to artificialanalysis.ai. 2 likes, 1 repost. Direct reply to Jay. Numbers are his, not verified here.

### Paradis (@ParadisLabs) — partial

- URL: https://x.com/ParadisLabs/status/2102372040732795196
- Date: Tue 22 Sep 2026, 12:18:49 UTC
- Likes: 663 (syndication). Replies/conversation: 44. Reposts: not in the fields returned before truncation. The note is longer than what came back.
- Exact text retrieved, ending mid-sentence. Do not invent the rest:

```
I think Muse is what AI is supposed to look like.

Feels like every lab has been shipping the same thing recently with minor incramental improvements. Text boxes in front of a model = shiny new toy syndrome!

No one cares if Muse Spark is the best model in the world rn because it literally doesn't matter to 99.9% of people. Only the top 1% of coders/engineers care about what's changed from one Claude release to the next ChatGPT release. Personally, I have found little improvement since Fable 5 was released and I think that says a lot. I'd probably sa
```

- Claim: Muse’s UX is what people wanted; whether Spark is the best model is a power-user argument, not a mainstream one. Also the audience split (top 1% vs everyone else).
- Why it’s strong: High likes, and it is the cleanest “great product, model quality is a niche concern” take. Incomplete retrieval, so quote only the finished sentences.

Other Muse-quality complaints were retrieved and dropped for engagement: Paul Brody (`Muse Spark just isn't a frontier-class model`, 1 like), Vishesh Saxena (1 like), Jonathan (`muse spark is overrated`, 0 likes).

---

## 4. No vendor lock-in / switching subscriptions

Thin. The on-thesis lines from small accounts had ~0 likes. Keeping only posts with either real engagement or a primary source, and saying so.

### Kai (@hqmank) — “Kai”

- URL: https://x.com/hqmank/status/2104414021072077108
- Date: Mon 28 Sep 2026, 03:32:55 UTC
- Text:

```
Claude Pro $20 > ChatGPT Pro $100?

Some users report that on ChatGPT Pro, GPT-6 Sol High lasts fine. Switch to Astra and the quota is gone fast, even on Light.

After a few days with Opus 5.5, Medium is plenty for daily coding. It's already on par with GPT-6 Astra High, and Opus 5.5 High even beats Astra Max.
```

- Engagement: 175 likes, 3 reposts, 24 replies, ~16K views
- Claim: people are actively comparing subscriptions and models (Claude Pro vs ChatGPT Pro, Opus vs Astra) rather than staying on one vendor.
- Why it’s strong: Recent, specific, and the only lock-in-adjacent post in this search with solid likes. It is a quota/quality comparison, not a “don’t lock me in” manifesto.

### Counterpoint, modest engagement

- URL: https://x.com/Sabrina_Ramonov/status/2106761290332938407
- Date: Sun 4 Oct 2026, 15:00:08 UTC
- Likes: 13 (syndication). Reposts: not returned before truncation.
- Opening, exact:

```
Don't be a tokenmaxxer...

Tokenmaxxers chase the perfect prompt, squeeze every token, and switch between Claude and ChatGPT to stay on whichever model tech Twitter calls best.

None of those choices guarantees more progress. A more optimized model doesn't choose the right business problem for you.
```

The post continues (video). Full text was returned by fxtwitter and matches that argument through “Start with the problem, then use ChatGPT or Claude to think and plan.”
- Why it’s here: Evidence the switching behavior is visible enough to scold. Not a quote for the draft’s side. Low likes.

### Retrieved and not worth embedding (0–5 likes)

Exact, but no audience:

- Dylan Normandin, https://x.com/DNormandin1234/status/2107139607124967518 (Mon 5 Oct 2026): `I've switched my main AI subscription between ChatGPT and Claude three times in a few months. OpenAI and Anthropic keep leapfrogging. So: pay month to month, keep your rules in plain files that move with you, and re-check every few weeks. Right now: Claude Code.` 0 likes.
- Joshua Stone, https://x.com/joshualeestone/status/2107162740095602749 (Mon 5 Oct 2026): `Bring your own subscription: Claude, OpenAI, Gemini, Grok, or Meta Muse. Yes, your subscription. You don’t need an API key.` 5 likes. Product pitch.
- Giustino, https://x.com/jubstuff/status/2105559299846005230 (Thu 1 Oct 2026): a $410 stack of Claude Max for Opus 5.5, ChatGPT Pro for Astra/Sol, and OpenCode Go for experiments. 0 likes.

### Partial: Anthropic cutting third-party harnesses off Claude Max

- URL: https://x.com/botnewsnetwork/status/2103278212465975309
- Date: Thu 25 Sep 2026, 00:19:37 UTC. Likes: 2. Account label: Automated. Text below is the retrieved prefix only. The post continues after “The 03:00”.

```
ANTHROPIC FLIPPED A SWITCH TODAY: THIRD-PARTY AGENTS CUT OFF WITH NO ANNOUNCEMENT

At 3:00 AM Pacific today, Opus 5.5 answered a request arriving through a third-party agent harness, on a paid Claude Max subscription — the arrangement Anthropic's own documentation described as sanctioned as recently as yesterday. At 4:46 PM Pacific, that same login, same model, same account, same harness was refused. HTTP 400:

"Third-party apps now draw from your extra usage, not your plan limits."

No announcement. No changelog. No email. Nothing on Anthropic's developer account about harnesses at all today.
```

It goes on to say the gate keys on client identity (Claude Code still works; third-party harnesses on the same login do not), cites CLIProxyAPI and Hermes hitting the same 400, and lists three rule changes in five months (April, June, then 24 Sep 2026). Ends the retrieved portion with: `We ran a piece in July titled "the agent's brain is a rented resource." Today is that thesis with a timestamp on it.` plus a counterpoint that third-party harnesses were burning flat-rate plans, and `A price you can look up is a price. A rule you cannot look up is a mood.`

- Follow-up: date is Thu 25 Sep 2026, 00:19:37 UTC. Likes: 2. The account is labeled Automated. Do not embed. The wording is the lock-in story, the distribution is not there. A primary-source version of the same cutoff was not retrieved.

---

## 5. Always on, and notify only when it matters

### John Helmuth (@johnhelmuth_)

- URL: https://x.com/johnhelmuth_/status/2104367036428067109
- Date: Mon 28 Sep 2026, 00:26:13 UTC
- Text:

```
I don’t know what mechanism @Muse is using to do proactive notifications like this, but stuff like this is extremely nice compared to Grok @bot.

I never asked it to monitor my flight, I never set up any routine or anything at all. The fact that it is checking anyway is really nice.
```

- Engagement: 469 likes, 11 reposts, 38 replies, ~35K views. Has a screenshot.
- Claim: an always-on agent that goes looking without a routine, and the user likes the ping.
- Why it’s strong: Best retrieved “it checked without being asked” post.

### Mike P (@mikepat711)

- URL: https://x.com/mikepat711/status/2106852035924480407
- Date: Sun 4 Oct 2026, 21:00:43 UTC
- Text:

```
So far I'm preferring Grok Bot proactivity to Muse proactivity. 

Grok Bot doesn't ping me with proactive notifications as often as Muse, but they've always been useful pings so far.  Many Muse pings I just ignore because it's telling me stuff I already knew or didn't need to know.
```

- Engagement: 80 likes, 2 reposts, 19 replies, ~6.7K views. ~23K followers.
- Claim: the product problem is not “be proactive,” it is “only interrupt when it matters.” Several agents ping on their own schedules.
- Why it’s strong: Recent, first-person, and it is the draft’s notification thesis from the user side.

### Dan Woods (@danveloper) — “Dan Woods”

- URL: https://x.com/danveloper/status/2106475882877694364
- Date: Sat 3 Oct 2026, 20:06:01 UTC
- Text:

```
Ok I think I was wrong about Dots. The “proactive agent” part is different and I guess because I have my Google stuff plugged in to chatgpt, my dot just found things that actually were important and messaged me: an assignment for my son’s English class, pick up time changed for doggy daycare, and then the obvious “your American flight is delayed again”. I didn’t ask it to do anything at all, so this is super cool to me that it discovered things that might be important and surfaces them without me prompting. I like that.
```

- Engagement: 82 likes, 4 reposts, 14 replies, 5 quotes
- Bio: “Vice President of AI Platforms for CVS Health. Former CTO for @JoeBiden.”
- Quoted his own earlier skepticism (https://x.com/danveloper/status/2105358661941895378): `I don’t see the use case for dots, openclaw, grok bot, Hermes… I never have. I’ve tried them and I just end up back in the ChatGPT or Claude app.`
- Claim: Dots-style proactive surfacing, unprompted, is the feature that changed his mind. Also a credible non-hobbyist user.
- Why it’s strong: A reversal from “I don’t get personal agents” to “it found three real things.” Modest likes, high-signal author.

Primary Bot (section 1) and Tincan (section 1) also belong here: “act proactively” and “Grok Bot is always on in the cloud.”

### Alexandr Wang (@alexandr_wang) — Muse launch

- URL: https://x.com/alexandr_wang/status/2097402344061510004
- Date: Tue 8 Sep 2026, 19:11:01 UTC
- Text: `1/ today we're rolling out Muse, our new personal ai assistant. Muse is always-on, wicked fast, can use a browser, connect to your apps, and is designed to be secure.` plus `try it now: https://muse.ai` and a video.
- Engagement: 6,601 likes, 516 reposts, 687 replies, 464 quotes, ~12.8M views
- Claim: the category leader describing the product as always-on, with a browser and app connections. Also the “spreads into your accounts” setup, from the company that shipped it.
- Why it’s strong: Primary source, the largest post retrieved. About four weeks old. Pair with the security follow-up in section 7 rather than treating “designed to be secure” as settled.

Dropped for 0–1 likes despite good wording: Pejman Pour-Moezzi on muting Instinct/Muse/Dot, and two “only ping me when you need a decision” replies.

---

## 6. Chat-first UI, fewer buttons, artifacts

### Alex Cornell (@alexcornell) — Muse design director

- URL: https://x.com/alexcornell/status/2103276525701517434
- Date: Fri 25 Sep 2026, 00:12:55 UTC
- Text:

```
One of the most fundamental decisions we made early on with @Muse, was to contain every message in a bubble, like a chat app. Attaching the earliest comparison I could find – showing no container vs. the initial bubble treatment we used.

A founding principle was that Muse should feel like an entity not a tool. It’s an agent! Not a search box. And one of the clearest patterns to imply this is a message bubble.

Ironically, years before, I had argued for the exact opposite model.
```

- Engagement: 1,282 likes, 28 reposts, 78 replies, 525 bookmarks, ~106K views
- Bio: “Design Director at Meta Superintelligence Lab working on Muse. Prev: Linear / Substack / Cocoon / Facebook / Dialpad / ISO50”.
- Claim: Muse’s chat-first UI is a founding product decision, not an accident. Has a comparison image.
- Why it’s strong: Primary source, very high engagement. This is the “Muse does the chat surface well” quote.

### maria’s mockup

The required tweet plus “no toolcalls or commands visible” (top of this file). That is the “fewer buttons / hide the machinery” artifact from inside T3.

### Charlie Holtz (@charlieholtz) — “Charlie Holtz”

- URL: https://x.com/charlieholtz/status/2107214308744790109
- Date: Mon 5 Oct 2026, 21:00:16 UTC
- Text:

```
experimenting with an Artifacts tab as the default right panel in every workspace. 

the agents are good enough now that you don't need to look closely at the diffs. instead, the agent can package up a quick + beautiful overview its work as an artifact
```

- Engagement: 84 likes, 1 repost, 9 replies, 38 bookmarks. Bio: `@conductor_build`. Has a screenshot.
- Claim: artifacts as a primary surface next to chat, because you no longer read every diff. Close to “click an artifact,” but he does not say clicking attaches it back to the agent.
- Why it’s strong: A builder shipping the artifact panel this week. No retrieved tweet actually says “click the artifact and it attaches to the agent.” That specific Muse gesture was not found.

---

## 7. Agents spread across accounts and machines; permissions are unsolved

### Nikita Bier (@nikitabier)

- URL: https://x.com/nikitabier/status/2107157904168239416
- Date: Mon 5 Oct 2026, 17:16:08 UTC
- Text:

```
The most important technology problem of the next 5 years: 

Creating a broadly accepted standard for agents to identify themselves to service providers, so that providers can adjust the way they interface with clients (as compared to human-based traffic).

In the interim (i.e., for the next 6 months), there will be a cat-and-mouse game that agents will play -- to circumvent detection and maintain their product's utility during this growth phase.

However, this will only be a stopgap and it will not be the terminal state of the world.
```

- Engagement: 3,498 likes, 194 reposts, 403 replies, 102 quotes, 1,188 bookmarks, ~261K views
- Bio: former head of product at X. ~1.35M followers.
- Quotes Jessica Lessin (@Jessicalessin), text retrieved from this payload (her engagement was not in the truncated embed): `So in the last two days about half of my Muse use cases have vanished because the browser won’t do it any more. Are websites changing their policies? Bot detection???`
- Claim: agents are already reaching into other sites, sites are shutting the browser, and there is no accepted way for an agent to say who it is. That is the “virus” behavior from the service’s side, and the unsolved identity problem.
- Why it’s strong: The highest-engagement post in this whole search. It is about identification and bot detection more than “how do I delegate a credential to a sub-agent.” Don’t overclaim it.

### chl$ (@chelsssseeeea), reply to Bier

- URL: https://x.com/chelsssseeeea/status/2107162193477390775
- Date: Mon 5 Oct 2026, 17:33:10 UTC
- Text: `I think the harder problem will be permissions. Once an agent can reliably say “I’m an agent acting for Nikita” then every service needs a standard way to understand what you’ve actually authorized it to do. The entire internet needs an OAuth-like layer for agents.`
- Engagement: 12 likes, 2 reposts. Author has ~72K followers.
- Claim: permissions, not just identity. This is the draft’s “we haven’t solved delegation.”
- Why it’s here: Best short statement retrieved of the permissions gap. Engagement is low because it is a reply; the parent post is the distribution.

### The Hacker News (@TheHackersNews)

- URL: https://x.com/TheHackersNews/status/2107144401474732327
- Date: Mon 5 Oct 2026, 16:22:28 UTC
- Text:

```
GitGuardian found 28.65 million new hardcoded secrets in public GitHub commits in 2025, up 34% year over year.

It also found 24,008 unique secrets in public MCP configuration files, including 2,117 verified as valid.

See how credentials are spreading across code, endpoints, and AI tooling: https://thehackernews.com/2026/10/the-credential-layer-is-expanding.html
```

- Engagement: 27 likes, 6 reposts, ~16.5K views. Account has ~2.4M followers, so the like count is modest for them.
- Claim: agent/MCP configs are already a credential leak surface. “Spreading across code, endpoints, and AI tooling” is the virus line with a number on it.
- Why it’s strong: Primary-source news account, this week, specific counts. A smaller account repeating the same stats (Rehan Shakir) had 1 like and was dropped.

### Insecure Agents Podcast (@insecureagents) — low likes, right sentence

- URL: https://x.com/insecureagents/status/2107063266191036849
- Date: Mon 5 Oct 2026, 11:00:04 UTC
- Likes: 5 (syndication). Reposts: not returned.
- The pulled quote, exact: `"There's a tendency to think, we've got OAuth on behalf of flows, we've solved this problem. We really haven't."`
- Attributed in the post to Andy McMahon, Principal AI & MLOps Engineer at Barclays. The post calls the rest “the fishbowl problem” of stitching permissions across clouds and SaaS, and says knowing when to pull a kill switch is still unsolved. Full episode blurb was retrieved; it is a podcast promo, not a personal post.
- Why it’s here: Closest retrieved wording to “OAuth did not solve agent credentials.” Too small to embed unless you want the Barclays line. Prefer Bier + the Hacker News post.

### Alexandr Wang, security follow-up

- URL: https://x.com/alexandr_wang/status/2097402345936314855
- Date: Tue 8 Sep 2026, 19:11:01 UTC (reply to the launch post in section 5)
- Text: `2/ a big focus for us here was making sure it was safe to give Muse access to your inbox, calendar, and finances. each Muse runs in its own secure VM, an isolated computer dedicated to you. a separate system, the sentinel, checks every action before anything leaves the vm. your Muse never sees your actual passwords or card numbers.`
- Engagement: 396 likes, 10 reposts, 20 replies, ~130K views
- Claim: Meta’s own framing. The agent is supposed to reach inbox, calendar, and finances, and they are still explaining why that is safe.
- Why it’s strong: Primary source. Supports “agents get into your accounts.” It is the design they are selling, not an admission that nothing exists.

### Mark Zuckerberg (@finkd)

- URL: https://x.com/finkd/status/2097402106487382309
- Date: Tue 8 Sep 2026, 19:10:04 UTC
- Text: `You're in control. You choose which apps and services Muse has access to and you can disconnect them at any time. For sensitive actions like purchases or sending emails, Muse checks with you first. Passwords live in the Secure Credential Storage so Muse can't read this information.`
- Engagement: 800 likes, 14 reposts, 20 replies, ~299K views
- Claim: the vendor answer to permissions. Useful next to the draft’s “this is not solved.”
- Why it’s strong: Zuckerberg, specific about what the agent may and may not see.

### Agents across machines

Matt Van Horn’s Tincan post (section 1) is also this claim: Grok Bot in the cloud, Codex on “your primary development machine,” Muse placing calls, Tailscale between them, “open source.” That is the spread across accounts and computers, framed as a feature.

### Same idea, engagement too low to embed

Exact, and closer to the draft’s Chrome line, but 1 like each:

- SunsetSyntax, https://x.com/sunsetsyntax/status/2107006707771810170, Mon 5 Oct 2026: `don't point it at your daily Chrome. The agent can read every logged-in tab it lands on.`
- Brandon Smith, https://x.com/bndnsmth/status/2106014211692257314, Fri 2 Oct 2026: `muse, grok bot, dots, etc. are getting people comfortable handing a black box in someone else’s cloud access to a huge chunk of their digital life` then `email, files, calendars, browser sessions, credentials`.

No retrieved tweet used the word “virus.” The evidence is the behavior (browser, inbox, MCP secrets, cross-machine agents) and the missing standard.

---

## 8. Early adopters, frontier performance, open source, and non-engineers squeezing agents

### Jay and Paradis

Jay (section 3) is the frontier-performance audience: OpenCode’s CEO grading Muse Spark as non-SOTA. Paradis (section 3, partial) says only the top 1% of coders care about the model delta, which is the draft’s “Happy is not for the mainstream Muse user.”

### Open source, in posts already above

- Van Horn: “Open source.”
- dannyinsf_: “Completely open source.”
- Theo’s orchestrator work is in public nightlies of T3 Code (section 1). No separate “I want this open source” tweet with engagement was retrieved.

### Non-engineers, mostly too small to embed

One worth knowing, low likes:

- Carly Martinetti (@PRcarly), https://x.com/PRcarly/status/2107108533229760578, Mon 5 Oct 2026, 13:59:57 UTC. 5 likes, 0 reposts.

```
Single-player software is so underrated.

I'm a PR person, not an engineer. I've built about 60 custom skills with Claude since July.

My favorite is a morning digest that stays silent unless a client needs me.

It's not replacing Salesforce but it is replacing my 7am panic.
```

She quotes Jason Lemkin (@jasonlk, https://x.com/jasonlk/status/2107056956355821865). Text confirmed from the post itself:

```
"I had Muse build me a personal CRM, that updates in real-time, reads every customer email, and updates projections, and more.

It's free and it's great.

It's not multi-player.  It's not replacing Salesforce.

But it's pretty impressive for ... $0."
```

- Fetched on its own after the embed. Date: Mon 5 Oct 2026, 10:35:00 UTC. Engagement: 48 likes, 6 reposts, 17 replies, ~11K views. ~252K followers. Has a video. The quotation marks are in the tweet.
- Why it’s usable: recognizable name, this week, modest likes for his audience. Carly’s reply (5 likes) is the explicit “I’m not an engineer” line. Dan Woods (section 5) is the stronger “the proactive agent is the product” quote.

Several other “I’m not an engineer and I shipped X” posts were retrieved at 0–2 likes and dropped (mechanical-engineer anecdote, Hourglass AI homework, a vibe-coding equalizer reply).

---

## 9. Engineers trying to bring T3 Code (and similar) into companies

No high-engagement “we lobbied the company and they let us use it” tweet was retrieved. Nothing about a Meta internal Happy pilot showed up in these searches. Do not attach a tweet to that line.

What was retrieved, all small:

- Dylan (@Dylan02939106), https://x.com/Dylan02939106/status/2107012272753426725, Mon 5 Oct 2026, 0 likes, unverified account, 398 followers. Text: `Given T3 Code a try yet? It's become the app I use for everything, both personally and at Amazon. I'd bet something like 70% of my screen time across all devices is in that damn app haha, way better than Codex Desktop`. He says he uses it at Amazon. That is not confirmed employment, and nobody engaged. Do not embed.
- Luis Rudge (@luisrudge), Shopify SWE per his bio, https://x.com/luisrudge/status/2107169513951404450, Mon 5 Oct 2026, 1 like. Text: `use t3code (unless you're in your company laptop)`. This is the opposite of a successful pull-in: the company machine is where you cannot use it.
- MONKE2525E, https://x.com/MONKE2525E/status/2107192531062800630, Mon 5 Oct 2026, 6 likes. Text: `Every single company that makes a harness and a GUI for it should just fork T3 code and delete their current desktop app.` Open-source wish, not an internal rollout.

What does have engagement, and is the adjacent fact:

- Theo asking engineers to run Orchestrator V2 (section 1, 930 likes). Adoption among his users, not inside a company.
- lauren comparing T3 Code with Cursor’s coordinator (section 1). Engineers cross-shopping. She does not say she is bringing either into a company.

---

## Gaps still open

- A high-engagement “I will not be vendor locked” post. hqmank is the best retrieved comparison of subscriptions. The Anthropic harness-cutoff writeup is real and has 2 likes on an Automated account, so it is not embeddable.
- “Click an artifact and it attaches to the agent.” Cornell covers chat-first. Holtz covers an artifacts panel. The click-to-attach gesture was not retrieved.
- The word “virus.” Wang, Zuckerberg, Bier, GitGuardian, and Tincan are the adjacent evidence. Daily-Chrome warnings were retrieved at 1 like.
- Engineers pulling Happy or T3 into a company. The retrieved lines are a 0-like “I use it at Amazon,” a Shopify engineer saying not on the company laptop, and a 6-like “companies should fork T3.”
- Still incomplete: the rest of Paradis’s note and its repost count, and Da7’s long-reply repost count. Jason Lemkin and the botnewsnetwork post are now complete.

---

## Personal Agent Protocol

Looked up 7 Oct 2026. Meta and Sierra announced PAP on 6 Oct 2026. No post from @alexandr_wang, @finkd, or @Meta turned up in search. Neither announcement tweet says “OAuth” in the text. The OAuth / identify-yourself / prove-you-act-for-a-user detail is in the linked Sierra post (https://sierra.ai/blog/introducing-personal-agent-protocol), not in the tweet copy. Shopify’s Mani Fazeli replied that PAP is the authentication and authorization layer (18 likes, 1 repost): https://x.com/mcfazeli/status/2107533670315692306.

### Top pick: Bret Taylor (@btaylor) — “Bret Taylor”

- URL: https://x.com/btaylor/status/2107535182119244176
- Date: Tue 6 Oct 2026, 18:15:18 UTC
- Text: `Today we’re announcing Personal Agent Protocol — an open standard @Meta and @SierraPlatform are developing along with industry partners at @Genesys, @instinct, @RocketOTD, @Shopify, @stripe, and @Walmart. It will help define how personal agents interact with businesses and is open for anyone to implement. You can read more here - and if anyone is interested in joining let me know! https://sierra.ai/blog/introducing-personal-agent-protocol`
- Engagement: 2,481 likes, 210 reposts, 164 replies, 109 quotes, ~249K views
- Media: one photo (3840×2160). No quoted post. Link card is the Sierra blog.
- Bio: “Co-Founder @SierraPlatform. Board @OpenAI.”
- Why this one: official announcement from a named founder, highest engagement of the posts retrieved, and it names Meta plus Shopify, Stripe, and Walmart. Embed this in “What we haven’t solved.”

### Backup: Sierra (@SierraPlatform) — “Sierra”

- URL: https://x.com/SierraPlatform/status/2107531483837862324
- Date: Tue 6 Oct 2026, 18:00:36 UTC (about 15 minutes before Taylor)
- Text: `Today we’re announcing Personal Agent Protocol — an open standard @Meta and @SierraPlatform are developing along with industry partners at @Genesys, @instinct, @RocketOTD, @Shopify, @stripe, and @Walmart. It will help define how personal agents interact with businesses and is open for anyone to implement.` then `Read more: https://sierra.ai/blog/introducing-personal-agent-protocol`
- Engagement: 780 likes, 70 reposts, 47 replies, 79 quotes, ~149K views
- Media: one photo (3840×2160). No quoted post.
- Why it’s the backup: the company account, posted first, same claim. Use it if you want the org voice instead of Taylor’s.

---

## Thesis v4, per point

Added 9 Oct 2026. Quotable posts are ones retrieved in full that do not praise a competitor product by name. Prior art is allowed to name those products, because the point is to credit who already said it. Posts with 0 likes were dropped even when the wording matched.

### 1. One core agent

**Quote.** Da7em (@Da7_Tech), https://x.com/Da7_Tech/status/2105565507529118005, Thu 1 Oct 2026, 07:48:31 UTC. 150 likes, 4 reposts.

`Quick tip: Don't use multiple sessions for your daily, ongoing work. Keep everything in one session as much as possible.`

Supports the point: power users are already telling each other to keep daily work in one conversation.

**Quote.** forloop (@forloopcodes), https://x.com/forloopcodes/status/2093783046415913053, Sat 29 Aug 2026, 19:29:13 UTC. 389 likes, 35 reposts. Full text is in section 2 above. The line that matters: so many chats are open that you lose track of which agent is doing what and end up asking each one. Supports the point from the other side: lots of agents, and the human is the one who can't hold them.

**Prior art.** Greg Brockman (@gdb), https://x.com/gdb/status/2055335361921130861, Fri 15 May 2026, 17:11:51 UTC. 1,609 likes, 66 reposts. Quotes a ChatGPT finance preview. Text: `Understand and manage your personal finances in ChatGPT. A further step towards ChatGPT becoming your personal agent, operating on your behalf 24/7, for helping you at home and work.` OpenAI's president, naming the always-on personal agent months ago.

**Prior art.** Alexandr Wang (@alexandr_wang), https://x.com/alexandr_wang/status/2097402344061510004, Tue 8 Sep 2026, 19:11:01 UTC. 6,601 likes, 516 reposts. `Muse is always-on, wicked fast, can use a browser, connect to your apps.` Meta's own launch of the one always-on agent. Details in section 5 above.

### 2. Chat left the chat

**Quote.** Foufou (@Foufoube), https://x.com/Foufoube/status/2107949965075198330, Wed 7 Oct 2026, 21:43:30 UTC. 19 likes, 1 repost.

`We need a place in the sidebar (lol) to pin useful visuals and responses, like Claude's Artifacts panel. It's so convenient to have quick access to the best parts of a chat instead of downloading a file or having to scroll the whole chat...`

Supports the point: a user saying they will not scroll the log, and want the useful part pinned. Names Claude's panel as the existing pattern. Modest likes.

**Quote.** maria (@maria_rcks), https://x.com/maria_rcks/status/2106620125923393849 and the follow-up https://x.com/maria_rcks/status/2106620434867237134, Sun 4 Oct 2026. Parent: `is this where we're going` (1,083 likes, 23 reposts, UI mockup). Follow-up: `oh also no toolcalls or commands visible` (57 likes, 0 reposts). Supports the point: the log of tool calls is what people are ready to stop showing. Not a claim that artifacts have replaced it.

**Prior art.** Charlie Holtz (@charlieholtz, Conductor), https://x.com/charlieholtz/status/2107214308744790109, Mon 5 Oct 2026, 21:00:16 UTC. 84 likes, 1 repost. He is shipping an Artifacts tab as the default right panel: `the agents are good enough now that you don't need to look closely at the diffs. instead, the agent can package up a quick + beautiful overview its work as an artifact`. A builder, this week, replacing the diff log with a generated artifact. Screenshot attached.

### 3. Fiddle less, understand more

**Quote.** Charlie Holtz, same post as above. The sentence `you don't need to look closely at the diffs` is this point: the agent spends the effort on an explanation, because reading the raw change is the bottleneck.

**Quote.** Arun (@hiarun02), https://x.com/hiarun02/status/2108480764354666689, Fri 9 Oct 2026, 08:52:42 UTC. 9 likes, 0 reposts.

`Haiku 5.5 is crazy cheap, but it looks like it still can't replace Opus for everything. It did just as well on code search, but struggled badly with web research and fact-checking. The smart move is using the right model for each task, not just the cheapest one.`

This is closer to point 5. Kept here only as a short retrieved line about not hand-tuning one model for every job. Low likes. Prefer Holtz.

**Prior art.** Holtz again: the artifact is generated from the agent's work, inside a panel he designed, instead of the user configuring a review view. No separate "circle this number and it goes to the agent" post was retrieved.

### 4. Phone first

**Quote.** Leo (@leodev), https://x.com/leodev/status/2099467198939181181, Mon 14 Sep 2026, 11:56:01 UTC. 53 likes. Reposts were not in the syndication fields returned.

`I really like how @stripe link works. Agents request to buy something --> I approve it on my phone. So why hasn't anyone done the same but for passwords, I want to let agents sign in for me but: I either do it manually, or have to share them to my agent. @1Password should build this, or someone else will.`

Supports the point: the phone is where you approve the agent, not where you do the work.

**Quote.** Priyank Rajai (@Ipriyankrajai), https://x.com/Ipriyankrajai/status/2108161464087556349, Thu 8 Oct 2026, 11:43:55 UTC. 3 likes, 1 repost.

`Setting up an always-on box so I can steer Claude Code and Codex from my phone.`

Supports the point in the plainest words. Low likes. He names the tools he is steering, he does not review them.

**Prior art.** Product Hunt (@ProductHunt), https://x.com/ProductHunt/status/2105961297158570023, Fri 2 Oct 2026, 10:01:14 UTC. 69 likes. Reposts not in the syndication fields returned. Video. Text includes `Reply and approve from my phone` and `Can run any agent I want` and `Open-source`. It is a launch post framed as a Grok Bot alternative, so don't embed the framing. The feature list is the prior art: phone approve, any agent, open source, already shipped by someone else this month.

### 5. One harness

**Quote.** Daniel San (@dani_avila7), https://x.com/dani_avila7/status/2107918789316854010, Wed 7 Oct 2026, 19:39:37 UTC. 9,216 likes, 373 reposts, 44 replies. Photo.

`I really like this image! It perfectly reflects how I’m distributing each task across the different models`

Supports the point: a known AI engineer (Head of AI at Hedgineer, ~35K followers) treating model choice as per-task, not per-app. The image itself was not read, so don't describe what it shows.

**Quote.** His follow-up, https://x.com/dani_avila7/status/2108030840345116819, Thu 8 Oct 2026, 03:04:52 UTC. 18 likes. Reposts not returned. Full text retrieved via fxtwitter. The line: `Choosing the right model for each task is a core AI engineering skill` and `If you’re using Opus for tasks Haiku can handle with the same quality, you’re likely wasting time and money.`

**Quote.** Kai (@hqmank), https://x.com/hqmank/status/2104414021072077108, Mon 28 Sep 2026, 03:32:55 UTC. 175 likes, 3 reposts. Compares Claude Pro and ChatGPT Pro on which model you can actually run (Opus 5.5 vs Astra). Supports switching providers because the quotas and the jobs don't line up. It does pick a side, so use it as evidence of the comparison, not as an endorsement.

**Prior art.** Delphi Digital (@Delphi_Digital), https://x.com/Delphi_Digital/status/2107959150990835830, Wed 7 Oct 2026, 22:20:00 UTC. 39 likes, 4 reposts.

`AI lock-in has moved from model to harness. Users switch when a better model ships. The harness is harder to leave as it holds your context.`

The rest of the post pitches Hermes. Credit the first two sentences. Don't embed the product pitch.

No retrieved post says "Grok for X, Anthropic for novel work, Astra for computer use" in those words.

### 6. Multiplayer is hard

**Quote.** Nikita Bier (@nikitabier), https://x.com/nikitabier/status/2107157904168239416, Mon 5 Oct 2026, 17:16:08 UTC. 3,498 likes, 194 reposts. Full text in section 7 above. The standard for an agent to identify itself to a service does not exist yet.

**Quote.** chl$ (@chelsssseeeea), reply, https://x.com/chelsssseeeea/status/2107162193477390775, Mon 5 Oct 2026, 17:33:10 UTC. 12 likes, 2 reposts. `the harder problem will be permissions` and `what you’ve actually authorized it to do`. This is the "if someone can talk to the agent, they have its permissions" problem, one layer up.

**Prior art.** Bret Taylor (@btaylor), https://x.com/btaylor/status/2107535182119244176, Tue 6 Oct 2026, 18:15:18 UTC. 2,481 likes, 210 reposts. Personal Agent Protocol, with Meta, Shopify, Stripe, Walmart. The open standard aimed at agents acting for a user with a business. Full text in the PAP section above. This is the prior art for permissions bigger than one team. It does not solve the in-team case (whose commit, shared server, an automatic reviewer granting itself more access). Nothing retrieved covered that in-team case with real engagement. Several replies said "multiplayer is the hard part" at 0–1 likes and were dropped.

### 7. Be the nice guys

**Quote.** Delphi Digital, same post as point 5. `Users switch when a better model ships.` That is the no-lock-in sentence. The post then names Hermes as the open-source harness. Credit the observation. Don't quote the pitch.

**Quote.** Kai, same post as point 5. People are already moving a $20 or $100 subscription because a different model got better at the job. 175 likes.

**Prior art.** Product Hunt post in point 4: open source, run any agent, approve from the phone. 69 likes. Framed as a Grok Bot alternative, so it is prior art for the shape, not a line to embed.

**Prior art.** No retrieved post from a lab says "host it yourself or let us host it" without pitching their own harness. Muse-only and dots-only are visible in the product launches above (Wang: Muse; Brockman and OpenAI: ChatGPT), which is the contrast, not a quote about being open.

Posts that praised a competitor by name (Muse is nice, T3 is the one, Dots changed my mind) were left out of this section on purpose. They are still in the earlier sections if you need them.
