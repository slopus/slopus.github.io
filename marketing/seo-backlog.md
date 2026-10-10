# SEO backlog

Open items as of 2026-10-09. Owner is who has to act: **site** (a change in this repository), **Kirill** (an account only he holds: GitHub org settings, npm, third-party listings), **store accounts** (App Store Connect, Google Play Console). Effort: **S** under an hour, **M** an afternoon, **L** more. Move finished items to `log.md`.

## Top five next

1. Search Console access for `pnpm gsc` and the sitemap submitted (Kirill, S). Everything after this gets measured.
2. The server tutorial, "Run Claude Code on a Hetzner VPS and approve it from your phone" (site, M), tested end to end. It is the first page for the new audience, and the Show HN and Reddit posts in `channels.md` wait for it.
3. Decide the homepage headline (Kirill, S), then prerender the homepage (site, M). `/` is the page with the most links, leads with the model list, and still ships an empty `<div id="app">`.
4. GitHub topics, README line, and docs link on both repositories (Kirill, S). The repositories outrank the site for most product queries.
5. App Store and Google Play listing text (store accounts, S).

## Four weeks, in order

From the growth research in `positioning.md` and `channels.md`. Week numbers are a suggestion.

| Week | Item | Channel |
| --- | --- | --- |
| 1 | Search Console, GitHub, stores, sitemap dates (above) | accounts |
| 1 | Homepage headline decided and shipped with the prerender | site |
| 1 | "How did you hear about Happy?" in onboarding | Happy Desktop |
| 2 | Hetzner tutorial, then "Happy on exe.dev" | site |
| 2 | 20-second phone-approval clip; start replying on X | X |
| 3 | One r/ClaudeCode post about the setup | Reddit |
| 3 | Comparison page that does not rank Happy first | site |
| 4 | Show HN, as a workflow, founder in the thread all day | Hacker News |
| 4 | First Search Console review against the log; pick the next pages | site |

## Site

| Item | Status | Owner | Effort |
| --- | --- | --- | --- |
| **Homepage headline.** The current H1 and schema lead with the model list, which is T3 Code's category and not how this audience talks. Proposed: H1 "Your Claude Code and Codex subscription, on a computer that doesn't sleep."; second line "Steer it from your phone. Desktop app for Claude, Codex, and Grok." The wording is opinion; the diagnosis is in `positioning.md`. Kirill decides. The social preview title and description stay unless he says otherwise (`AGENTS.md`). | Needs a decision | Kirill, then site | S |
| **Homepage prerender.** Unblocked now that the hero change is merged. Add `/` to `prerenderedPaths` in `src/prerender.tsx` and write it from `generate-static-routes.mjs`. The catch is `DownloadOptions`: it calls `desktopPlatform()` during render, so the server renders the generic `desktop` layout and a Windows or Linux browser would hydrate different markup. Read the platform through `useSyncExternalStore` with a `'desktop'` server snapshot, the way the store preference already is, so hydration matches and then settles. The demo player and the GitHub star count also need to render the same on server and first client pass. | Ready | site | M |
| **Real sitemap dates.** Add `fetch-depth: 0` to the Checkout step in `.github/workflows/deploy-pages.yml`. The build falls back to the build date in a shallow clone, so every `<lastmod>` is the deploy date today. | Ready | site | S |
| **Tutorial: "Run Claude Code on a Hetzner VPS and approve it from your phone."** The title is the query; the answer is on the first screen. From a fresh VM to an approved change on the phone, and what happens when the laptop sleeps (nothing). Two paths: Happy Agent as a systemd service over Tailcat, with Desktop; and `happy claude` on the server, phone only. No Tailscale or tmux needed; say so, since that is the stack readers have. Honest aside: tmux and Termius still win for a full terminal, and Remote Control wins for a ten-minute break. Test both paths end to end before publishing. | Ready to write | site | M |
| **Guide: Happy on exe.dev.** `ssh exe.dev`, Claude Code and Codex are already installed, install Happy, pair the phone. Shelley is theirs; Happy is for the subscription you already have. Not a versus page. Test the install there first. | Needs a test | site | S |
| **Comparison: Happy vs Claude Code Remote Control vs tmux and Termius vs T3 Code vs Omnara.** States tradeoffs and does not rank Happy first. Cite T3's user numbers as founder claims, Remote Control's sleep failures with the HN links, and phone-terminal pain. Extends `/vs/claude-code-remote-control/` or lives beside it. | Idea | site | M |
| **Remote agents landing page**, e.g. `/remote-agents/` or `/server/`: Happy Agent on your own server, Tailcat, desktop and phone, over `/guides/remote-agents/`. Honest that adding a remote by name is in progress. Check the slug against existing routes. Could be the tutorial's parent instead. | Idea | site | M |
| **Self-hosted relay.** People ask for the relay on their own box. It is documented for the original stack (`/docs/guides/self-hosting/`). Find out whether Happy Desktop's Mobile Access can use it; if so, tighten the guide to ten minutes and add it to the desktop docs. Only then a careful r/selfhosted post. | Needs a check | Kirill, then site | S–M |
| **"How did you hear about Happy?"** One free-text question in onboarding. Lives in the Happy Desktop repo, not here. | Idea | Kirill | S |

## Search Console and Bing

| Item | Status | Owner | Effort |
| --- | --- | --- | --- |
| Create the service account and add it to the property; run `pnpm gsc --list-sites`. Steps in `README.md`. | Ready | Kirill | S |
| Submit `https://happy.engineering/sitemap.xml` under Sitemaps, if not already. | Check | Kirill | S |
| Bing Webmaster Tools: import the site from Search Console. Bing's index also feeds DuckDuckGo and, in part, ChatGPT search. | Ready | Kirill | S |

## App stores

| Item | Status | Owner | Effort |
| --- | --- | --- | --- |
| App Store: **Developer Website** → `https://happy.engineering/`, **Privacy Policy URL** → `https://happy.engineering/privacy/`. | Ready | store accounts | S |
| App Store subtitle: **Remote control for AI agents**. | Ready | store accounts | S |
| App Store keywords field (100 characters, comma-separated, no spaces after commas). Apple already indexes the app name and subtitle, so repeat no word from either; spend the characters on terms like codex, claude, grok, terminal, coding, cli, developer, encrypted, server, mobile. Check the final list against the live name and subtitle. | Ready | store accounts | S |
| Google Play: make the first line of the full description **"Run Claude Code and Codex from your phone. Your agents keep working on your own computer."** Google indexes the description, and the first line shows above the fold. | Ready | store accounts | S |

## GitHub

| Item | Status | Owner | Effort |
| --- | --- | --- | --- |
| `slopus/happy-desktop` has no topics. Add: claude-code, codex, codex-cli, grok, coding-agent, ai-coding-agent, claude-code-gui, codex-gui, desktop-app, electron, macos, windows, linux, multi-model, open-source. | Ready | Kirill | S |
| `slopus/happy` topics, add: codex-gui, claude-code-gui, coding-agent, grok, ios, android, expo, end-to-end-encryption, remote-control. | Ready | Kirill | S |
| README line under the H1 of both: "The open-source desktop app for Claude Code, Codex and Grok, with iOS and Android apps to run and approve your agents from your phone." | Ready | Kirill | S |
| README docs links → `https://happy.engineering/welcome/`, not `/desktop/docs/` (it still works, but redirects add a hop and split signals). | Ready | Kirill | S |
| Custom 1280×640 social preview images for both repositories (Settings → Social preview). | Ready | Kirill | S |
| Archived `happy-cli` and `happy-server`: set descriptions to point at `slopus/happy`, e.g. "Archived: now part of github.com/slopus/happy". | Ready | Kirill | S |

## npm

| Item | Status | Owner | Effort |
| --- | --- | --- | --- |
| `happy`: add `keywords` (claude-code, codex, coding-agent, mobile, remote-control, end-to-end-encryption) and a README line pointing at Happy Desktop and `https://happy.engineering/`. Ships with the next CLI release. | Ready | Kirill | S |

## Third parties

| Item | Status | Owner | Effort |
| --- | --- | --- | --- |
| AlternativeTo: claim the listing, still titled "Happy Coder". Rename to Happy, update the description, platforms (macOS, Windows, Linux, iOS, Android), and links. | Ready | Kirill | S |
| Correction requests to the Nimbalyst, Sealos, Melta, and Zilliz roundups. Stale facts: "npm i -g happy-coder" (it is `npm install -g happy`), "read-only, no diff review" (the phone reads files and Git changes; Desktop reviews changed files), "macOS only" (macOS, Windows, Linux, iOS, Android). Send one short email or form per site with the corrected sentence and the doc link backing it. | Ready | Kirill | S each |
