# Log

What shipped, newest first: site launches, pages, listing changes, posts. One line each, with the URL. Read Search Console changes against these dates.

## 2026-10-09

- Docs moved to top-level URLs: `/welcome/`, `/quick-start/`, `/guides/terminal/` and the rest. `/desktop/docs/*` and `/happy2/docs/*` still serve, canonical to the new URLs.
- Vision essay at `/vision/`; `/thesis/` and `/blog/` redirect to it.
- Docs pages prerendered: crawlers that do not run JavaScript read the full page, title, and description.
- New pages: `/mobile-app/` (Claude Code and Codex on your phone), `/desktop-app/` (the desktop app for Claude Code, Codex, and Grok), `/vs/claude-code-remote-control/`.
- `/llms.txt` generated on every build.
- HTTPS enforced on happy.engineering.
- Mobile hero on the homepage.
- `marketing/` set up, with `pnpm gsc` for Search Console snapshots.
