# Agent notes

Follow `DESIGN.md` for copy, claims, diagrams, screenshots, tables, and docs
pages. Its first rule: no narration; every line must give the reader something.

## Happy Desktop link preview

The homepage `/` (the Happy Harness page, formerly at `/desktop/` and reviewed
unlisted at `/tmp/happy-one/`) has a screenshot-based social image. Before
regenerating it, follow **Regenerating the social preview** in
`docs/happy-one-demo.md`. Use the current recorded model-selection frame and the
page's explicit screenshot mode; do not substitute an illustrated mockup. Keep
the existing preview title and description unless the user asks to change them.
The screenshot-only GitHub/stars line must stay absent from the normal hero.
Maintain regeneration instructions, not a dedicated screenshot script.

## Products and docs

Happy is desktop-first. The desktop app owns the homepage `/` and the primary
docs as top-level pages: `/welcome/`, `/quick-start/`, `/guides/terminal/`
(content in `content/desktop/`, registered in `src/documents.ts`; a new slug
must not collide with another route). The header's Docs link goes to
`/welcome/`. `/desktop/`, `/happy2/`, and `/tmp/happy-one/` redirect to `/`
(static redirect pages written by `scripts/generate-static-routes.mjs`,
carrying the homepage's preview tags), and `/desktop/docs/*` and
`/happy2/docs/*` still serve the desktop docs, each canonical to its top-level
URL; keep them all resolving. The original Happy CLI docs (`/docs`,
`content/docs/`) are in maintenance mode: every page opens with the maintenance
notice, and only a quiet footer link points to them. The Buzz comparison stays
reachable at `/comparisons/buzz/` but is unlisted (`hidden: true`).

The Vision essay (`content/thesis.md`, a plain `.md` whose frontmatter title is
the h1) is a desktop doc at `/vision/` under Start here, right after How It
Works, registered with `essay: true` so `DocsPage` renders its captioned
figures, side floats, the centered chart, the pig in its first bullet and the
pig alone on its last line as the sign-off. Its seven bold bullets match its
seven sections 1:1, and "Make people happy" comes first so it is on the first
phone screen. Each section leads with its figure. It says "one primary agent",
never "core agent", and does not call multiplayer hard. It was first published
at `/thesis/`, which redirects to `/vision/`. Its images stay under `public/thesis/`; the
hand-drawn SVGs are generated in the style of
`notes/thesis/drafts/wireframe-sketch-generator.py`, with labels of 19px+ in a
520-wide viewBox so they read at a 350px phone column. Keep the essay short
enough to read on a phone. Its money paragraph names what is paid today (voice)
and what might be later, and says plainly that monetization is not the focus.

The Team page (`content/desktop/team.mdx`, `/team/`) follows Vision under Start
here: Steve first, then Kirill, each bio in its own first person ("I built"),
two or three lines of specific, sourced wins taken from their own sites, talks
and public profiles, with their X handles and the photos in `public/img/team/`.
It never states or hints at anyone's level of involvement, in either direction.

The Blog is the last group in the desktop docs sidebar, with no list page.
Posts are desktop docs (`group: 'Blog'` in `src/documents.ts`) at one-word
URLs you can type from memory: `/workos/`, `/tailcat/`, `/voice/`.
`/team-sign-in-workos/`, where the WorkOS post was first shared, redirects to
`/workos/`; `/blog/` still redirects to `/vision/`.

`routes.txt` records every URL the site has ever served. The build appends new
URLs and fails if a listed URL is no longer served; dropping one means
redirecting it or deleting its line on purpose. The build also fails on any
internal link or asset reference that does not resolve inside `dist/`.

## Header and downloads

Every page shares one plain `SiteHeader`: the full "Happy Engineering" wordmark
at every width, Docs, and the GitHub mark with its plain star count (no star glyph, border, or
pill). It is 60px tall (52px on phones), pinned while scrolling, and shows a
hairline only once the page has scrolled, so page shells must not use
`overflow: hidden` (it breaks `position: sticky`); clip horizontally with
`overflow-x: clip`. `/#download` is the README "Download" target:
`id="download"` sits on the download block right under the demo, and the closing
section is `#download-again`. The router scrolls to the fragment after the first
render, and the 82px `scroll-margin-top` must keep the whole block visible under
the header; change it with the header height. Windows visitors see the SmartScreen
note; its signer name and profile link are constants in
`src/DownloadOptions.tsx`. Release links use `releases/latest`, never a pinned
version.

## SEO skills

Three upstream SEO skills are installed under `.agents/skills/`, with their
sources pinned in `skills-lock.json`. Update them with `npx skills update`
and read the diff before committing; don't edit them in place.

- `seo-audit`: technical and on-page SEO audit.
  [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
- `ai-seo`: citations in AI answers and crawler access. We don't ship
  `llms.txt`; assistants read the prerendered pages.
  [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)
- `seo-geo`: AI Overviews and answer engines, weighed against Google's own
  guidance. [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo);
  this skill only, never the plugin, its scripts, hooks or `install.sh`.

Their advice is generic: `DESIGN.md` wins wherever they disagree. Reports go
in `.context/`, never in the repo or `dist/`.
