# Channels

How Happy shows up, per channel. Every post links to a page on happy.engineering, the repository, or a release, and every claim follows the checklist in `positioning.md`. Log each post in `log.md`. The evidence behind this file is the research section of `positioning.md` and the sources below.

## Principles

- **Lead with the job, not the model list.** "My agent runs on a box that doesn't sleep and I approve it from my phone" is what this crowd posts. Multi-model is the second sentence.
- **A setup with a price, a screenshot of the phone approval, and an honest "tmux is still better when…"** does well. A link and a tagline gets removed.
- **One good post beats five.** Founders post as themselves and say they build Happy. Kirill's account carries more than any company account.
- **Name the competitor fairly** when it is better at something; our comparison pages already do.
- **Do not rank ourselves first in a listicle.** Lily Ray measured self-ranking "best X" pages being left out of Google's AI Overview recommendations 83% of the time in September 2026 ([ppc.land](https://ppc.land/google-ai-overviews-cut-self-ranking-listicle-citations-38-lily-ray-finds/)).

## X

- **Replies, not threads.** A 20-second screen recording of a permission approval on the phone while the agent runs on a VM, posted under Remote Control complaint threads and exe.dev phone-coding threads. The complaints cluster is dropped sessions, walking back to the Mac, and phone terminals ([karanjagtiani04](https://x.com/karanjagtiani04/status/2108304916800471171), [jackfriks](https://x.com/jackfriks/status/2080647131241591098), [Divine_machine](https://x.com/Divine_machine/status/2108292756418494543)).
- **Release notes with a clip** whenever one ships.
- **What gets shared** about Happy is one line: "type `happy` instead of `claude`, pick it up on your phone" ([iannuttall](https://x.com/iannuttall/status/1963938928186245536)). Find the equivalent for the server path once it is one command.

## Reddit

Read the sidebar the day you post; rules change. Sizes are scraper snapshots from early October 2026.

| Subreddit | Size | Fit | Rules that matter |
| --- | --- | --- | --- |
| r/ClaudeCode | ~441k | Best. Workflow posts (tmux, VPS, Remote Control dying) are the native genre | Simple shares go in the weekly showcase. A standalone post says what you built, how Claude Code was used, and what you learned |
| r/ClaudeAI | ~1.18M | Good, if the account qualifies | [Rule 7](https://www.reddit.com/r/ClaudeAI/comments/1qe5wtt/rule_7_is_getting_a_glowup_less_spam_more_how_the/): built with or for Claude, free to try, explain how, no referral links; feed posts want OP karma above 100 |
| r/codex | ~217k | Good for honest comparisons | No dedicated promo ban; feed priority follows comment karma |
| r/ChatGPTCoding | ~405k | Medium | [Project posts](https://www.reddit.com/r/ChatGPTCoding/comments/1vug6d5/updated_rules_for_project_posts_on_rchatgptcoding/) state the problem and how the tool differs; GitHub links, not personal sites; pure ads in the weekly thread |
| r/selfhosted | ~852k | Only a self-hosting writeup | [Rules](https://old.reddit.com/r/selfhosted/wiki/rules): production-ready, documented, affiliation clear; new projects go to the megathread |
| r/opensource | ~387k | A substantial release, not a launch | Under ~10% promo, Promotional flair, OSI license (MIT qualifies) |
| r/SideProject | ~855k | Allowed, weak audience match | Demo or screenshots, disclosure, no reposts without a real update |
| r/Tailscale | small | Comments in the existing "2026 coding meta" thread | A careful setup post, not an announcement |
| r/LLMDevs | small | The closed-lid PSA lives here | Don't lead with it |

**Skip:** r/homelab (commercial self-promotion banned, [rules](https://www.reddit.com/r/homelab/wiki/rules/)), r/LocalLLaMA (about local models; 10% promo cap), r/vibecoding (dev tools need prior approval through their X community).

**First post (draft title):** "I stopped using /remote-control because the laptop sleeps. Hetzner + Happy, and where tmux is still better." In r/ClaudeCode, from an account with history, with the price, a phone screenshot, and a real limitation. Cross-post to r/ClaudeAI only if Rule 7 fits.

## Hacker News

- **Show HN once, as a workflow.** Draft title: "Show HN: Claude Code on a $15 VM, steered from a phone (open source)". Lead with the sleep problem, not "one app for three models". The founder is in the thread all day. Wait until the server guide works end to end.
- Comparable launches: Omnara's "Run Claude Code from anywhere" got about 310 points ([HN](https://news.ycombinator.com/item?id=44878650)); exe.dev's preview 457. David Crawshaw's essay "I am building a cloud" got 1,115 points against 20 for exe.dev's funding post ([HN](https://news.ycombinator.com/item?id=47872324)): write about the computer, not the round.
- The Vision essay (`/vision/`) is a candidate for a plain submission, separately.

## Search and AI answers

- **One page per real setup, titled with the query.** Long prompts and long-tail queries are where a small site gets cited (Ethan Smith's talks, secondhand: [leadwithai.co](https://www.leadwithai.co/article/ethan-smith-graphite-answer-engine-optimization)). Kevin Indig found headlines that directly answer the question cited more often by ChatGPT ([growth-memo.com](https://www.growth-memo.com/p/shorter-focused-content-wins-in-chatgpt)). Example: "Run Claude Code on a Hetzner VPS and approve it from your phone", with the answer on the first screen.
- Comparisons state tradeoffs and do not rank us first (see Principles).

## Directories and awesome lists

- Pull requests to awesome lists for Claude Code, Codex, and coding agents, each with the one-line description from `positioning.md` and a link to `/desktop-app/` or the repository.
- Product directories (AlternativeTo and similar): claim and correct; see `seo-backlog.md`. A corrected roundup is a better link than a new one.

## Communities we don't post into

- exe.dev's Discord and Fly's forum (which has a thread on an iOS app for Claude on Sprites, [community.fly.io](https://community.fly.io/t/i-built-an-ios-app-to-use-claude-on-sprites/27188)): answer questions when asked, link the docs page. No co-marketing ask until the guide exists (opinion).

## YouTube and demo video

- One 60-second video per audience: the phone approving a change from an agent on a server; one session switching Claude, Codex, and Grok; pairing the phone. Upload with the page link first in the description, and link from the matching page.
- Cut 20-second versions for X replies.

## Learn where users come from

James Hawkins asked every early PostHog user how they heard about it and found word of mouth ahead of content ([posthog.com](https://posthog.com/founders/first-1000-users)). Happy grew to tens of thousands of GitHub stars without knowing which of GitHub, X, Reddit, or the stores did it. One free-text "How did you hear about Happy?" in onboarding, before more content (see `seo-backlog.md`).

## Don't

- No "best Claude Code apps" listicle with Happy first.
- No OpenClaw-style stunt; a different product and audience.
- No "another nicer Claude window" launch: Crystal and 1Code stalled at a few thousand stars and were deprecated or archived.
- No Modal or Coolify positioning; this crowd is not there.
- No cold posts in r/homelab, r/LocalLLaMA, or r/vibecoding.
