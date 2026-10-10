# SEO backlog

Open items as of 2026-10-09. Owner is who has to act: **site** (a change in this repository), **Kirill** (an account only he holds: GitHub org settings, npm, third-party listings), **store accounts** (App Store Connect, Google Play Console). Effort: **S** under an hour, **M** an afternoon, **L** more. Move finished items to `log.md`.

## Top five next

1. Search Console access for `pnpm gsc` and the sitemap submitted (Kirill, S). Everything after this gets measured.
2. GitHub topics, README line, and docs link on both repositories (Kirill, S). The repositories outrank the site for most product queries.
3. Homepage prerender (site, M). `/` is the page with the most links and still ships an empty `<div id="app">`.
4. App Store and Google Play listing text (store accounts, S).
5. The "run Claude Code and Codex on your server" guide (site, M), the first page for the new audience in `positioning.md`.

## Site

| Item | Status | Owner | Effort |
| --- | --- | --- | --- |
| **Homepage prerender.** Unblocked now that the hero change is merged. Add `/` to `prerenderedPaths` in `src/prerender.tsx` and write it from `generate-static-routes.mjs`. The catch is `DownloadOptions`: it calls `desktopPlatform()` during render, so the server renders the generic `desktop` layout and a Windows or Linux browser would hydrate different markup. Read the platform through `useSyncExternalStore` with a `'desktop'` server snapshot, the way the store preference already is, so hydration matches and then settles. The demo player and the GitHub star count also need to render the same on server and first client pass. | Ready | site | M |
| **Real sitemap dates.** Add `fetch-depth: 0` to the Checkout step in `.github/workflows/deploy-pages.yml`. The build falls back to the build date in a shallow clone, so every `<lastmod>` is the deploy date today. | Ready | site | S |
| **Remote agents landing page**, e.g. `/remote-agents/` or `/server/`: Happy Agent on your own server, Tailcat, desktop and phone. A marketing page over `/guides/remote-agents/`, honest that adding a remote by name is in progress. Check the slug against existing routes. | Idea | site | M |
| **Guide: run Claude Code and Codex on a server and control it from your phone.** From a fresh Ubuntu VM to an approved change on the phone. Two paths: Happy Agent as a systemd service over Tailcat (with Desktop), and `happy claude` on the server (phone only). Test both end to end before publishing. | Idea | site | M |
| **Guide: Happy on an exe.dev VM.** Only after testing the install there. Write it as "use them together", not a versus page; see `positioning.md`. A "Happy vs exe.dev" page only if testing shows a real overlap to compare fairly. | Idea, needs a test | site | M |
| More pages from Grok's research and the first Search Console pull. | Waiting | site | – |

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
