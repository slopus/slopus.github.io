# Agent notes

Follow `DESIGN.md` for copy, claims, diagrams, screenshots, tables, and docs
pages. Its first rule: no narration; every line must give the reader something.

## The code is the source of truth

Most of this site isn't original writing. It comes from the product code:
[slopus/happy-agent](https://github.com/slopus/happy-agent),
[slopus/happy](https://github.com/slopus/happy) (the phone apps, the CLI and the server),
[slopus/happy-desktop](https://github.com/slopus/happy-desktop), and the repos around
them. Every page (features, docs, recipes, comparisons, changelog) retells what the
product already does.

- If the site and the code disagree, the code is right. Fix the site.
- Read the code before you write about it. Go by the released version, and label
  anything that is only on `main` or behind a setting (see Changelog below).
- Every feature, number, limit, settings path and platform on a page has to match
  the code or its docs today. Don't make one up. Don't copy an old claim forward
  without checking it again.
- If a page you're editing says something the code no longer does, fix it in the
  same change, or report it if it's out of scope.

## Happy Desktop link preview

The homepage `/` (the Happy Harness page, formerly at `/desktop/` and reviewed
unlisted at `/tmp/happy-one/`) has a screenshot-based social image. Before
regenerating it, follow **Regenerating the social preview** in
`docs/happy-one-demo.md`. Use the current recorded model-selection frame and the
page's explicit screenshot mode; do not substitute an illustrated mockup. Keep
the existing preview title and description unless the user asks to change them.
The screenshot-only GitHub/stars line must stay absent from the normal hero, whose
"Free and open source" carries the stars instead.
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
notice. The CLI is legacy; we push people to Happy Desktop and the phone app.
Desktop docs never offer the CLI as a way to use Happy and never mention Happy
Terminal; where the CLI is relevant, they link to `/docs/`, whose notice sends
readers on. `/guides/terminal/` is the one desktop page about the CLI: what still
works beside Desktop, a link to `/docs/`, and a DM to Kirill on X for CLI users
missing something. Desktop doc URLs carry no prefix: the Remote Control
comparison is `/claude-code-remote-control/` (`/vs/claude-code-remote-control/`
redirects there). The Buzz comparison stays reachable at `/comparisons/buzz/`
but is unlisted (`hidden: true`).

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

Changelog is a disclosure directly above Recipes, after Comparisons, collapsed by default
on desktop and phones, including on changelog pages. `/changelog/` lists production releases
newest first; previews never get entries. Each entry has a feature title, with its product,
stable version and publication date in a small line below it. Human permalinks such as
`/changelog/gpt-6-1-terra/` are complete prerendered pages with that entry first and their own
canonical URL, og:url and link-preview tags; GitHub Pages cannot vary HTML by query string.
Entries and share metadata live in `src/changelog.ts`, copy in `content/changelog/`.
Experimental features in stable releases still need a visible **Beta** label.
Set `beta: true` when the whole entry is experimental: its heading gets a Beta
pill and its social title includes Beta. When only part is experimental, label
that part inline. State the setting or opt-in needed to enable it, using the
released code as evidence; a stable app version does not make every feature stable.
Terra is keyed to the Happy Agent release that supplies the model catalog; video sources
and regeneration instructions live in `notes/terra-video/`. `/terra/` was deliberately removed.

The Blog follows Guides and precedes Comparisons in the desktop docs sidebar, with no list page.
Posts are desktop docs (`group: 'Blog'` in `src/documents.ts`) at one-word
URLs you can type from memory: `/workos/`, `/tailcat/`, `/voice/`.
`/team-sign-in-workos/`, where the WorkOS post was first shared, redirects to
`/workos/`; `/blog/` still redirects to `/vision/`.

Recipes comes last, after Changelog, in a disclosure labeled **Recipes (for agents)**,
collapsed by default on desktop and phones, including on recipe pages. The `/recepies/`
pages reproduce Happy Agent's operational instructions byte for byte, rather than adapting
them for people or adding Chief of Staff prompt blocks. `/recipes/` aliases those URLs.
Every file in `content/desktop/recepies/` is generated by
`node scripts/sync-agent-recipes.mjs /path/to/happy-agent`. Never edit one by hand: change
the recipe in happy-agent's `docs/recipe/`, commit it there, then re-sync. The script copies
the checkout's committed `HEAD` and records that revision, the paths, and content hashes in
`content/desktop/recepies/sources.json`; sync from happy-agent `main` (or another pushed
commit), since every GitHub link on the recipe pages is pinned to that revision. A new upstream
recipe fails the sync until it is mapped to a slug in the script and registered in
`src/documents.ts`. Keep source-relative link resolution and the "Synced from happy-agent"
line in the renderer, so the copied Markdown stays unchanged.

`routes.txt` records every URL the site has ever served. The build appends new
URLs and fails if a listed URL is no longer served; dropping one means
redirecting it or deleting its line on purpose. The build also fails on any
internal link or asset reference that does not resolve inside `dist/`.

## Header and downloads

Every page shares one plain `SiteHeader`: the full "Happy Engineering" wordmark
at every width, Docs, and the GitHub mark with its plain star count (no star glyph, border, or
pill). It is 60px tall (52px on phones), pinned while scrolling, and shows a
hairline only once the page has scrolled. The homepage keeps it out of sight until the
hero's "Happy" has scrolled up past it (`usePastHeading` in `src/DesktopApp.tsx`, an
IntersectionObserver, never a scroll listener), then shows it unchanged; keyboard focus
inside it shows it at once, and without scripts it is always there. Wider than 700px it is
fixed there and takes no room, so "Happy" starts 32px from the top of the screen and the
demo gets the header's height. Page shells must not use
`overflow: hidden` (it breaks `position: sticky`); clip horizontally with
`overflow-x: clip`. `/#download` is the README "Download" target:
`id="download"` sits on the download block right under the demo, and the second
download section, after "Trust the code", is `#download-again`. The router
scrolls to the fragment after the first render, and the 82px `scroll-margin-top`
must keep the whole block visible under the header; change it with the header
height. Windows visitors see the SmartScreen note; its signer name and profile
link are constants in `src/DownloadOptions.tsx`. Release links use
`releases/latest`, never a pinned version.

The favicon and installed icons are Happy Desktop's app icon, the black H on a white
tile, so they read on light and dark tabs alike. `notes/brand/favicon.py` renders every
icon file from `notes/brand/mark.svg`; when they change, bump the `?v=` on their links in
`index.html` and `public/site.webmanifest`.

## Homepage look

The homepage is in the phone apps' first-screen look: their Grain Gradient
(`src/grainGradientShader.ts`, from happy-desktop's onboarding shader, which ports
the native iOS/Android one; Apache-2.0 notice in `THIRD_PARTY_NOTICES.md`), the
native start-screen palette light or dark with the system, IBM Plex Sans, and
Bricolage Grotesque for the wordmark (`src/happy-home.css`, scoped to `.happy-home`;
its palette is shared with the other pages, below).

The gradient is the page's one surface, top to bottom, scrolling with the content:
never fixed, never boxed into panels, with no plain page background between grain
areas. Its noise and grain are the apps'; only `main()` differs, working in page
space (`HOME_SURFACE` in `src/GrainGradient.tsx`): a few big, slow swells along the
left and right edges, a large patch in the top right corner, and one in the bottom
left at the page's end, which may run under the footer's text, with a plain column
down the middle in the palette's base colour. No band along the top, and nothing
choppy: no thin jagged edges or quick wobble. On phones the colour stays out of the
content: the top right corner and the bottom left at the footer. It never wraps
around content blocks; Kirill found that claustrophobic. Text, emoji, video, and
buttons sit directly on it, and the header is transparent until the page scrolls,
then frosted. The field is a still, never animated: the apps' field at one moment
(`GRAIN_STILL`). `src/grainGradientRenderer.ts` draws it once, in page space, into
canvases only where the shader can put colour (bounds from the shader's own reach),
with the plain base colour between them, and draws again only on a resize or a new
scheme: scrolling never draws or moves anything, so it stays on the compositor. The
canvas that used to follow the viewport redrew 9.7 MP (12.6ms of GPU on an M4 Pro)
every 240px of scroll. The pieces match one whole-page draw pixel for pixel; check
that again when the shapes or the shader's reach change. Each half of the page has
noise of its own, blended across the middle, so where a corner patch crosses the
middle the halves never meet in a line. Baked images were weighed and rejected: the
grain is one device pixel and the shapes follow the page's width and height, so an
image would be resampled at every other width and pixel ratio. The frosted header
makes Chrome build GPU pipelines the first time it draws, which stalled the first
scroll for 150-230ms on a cold cache; `.one-demo-warm` sweeps the same frost, at 1%,
down the demo once while the page rests, so that happens before the first scroll.

Its order is the demo, the downloads, the five value rows (subscriptions,
multiplayer, F1 Fast Mobile, open source, end-to-end encryption), "Don't trust our words. Trust
the code." with a copyable prompt, the downloads again (just the buttons), "Talk to
us on Twitter or Discord", and the footer, which keeps its statement and drops the
links to us, since "Talk to us" has them. The demo
is the Mac window and the phone straight on the surface, with no stage; on phones the
window's left edge is 8px from the screen's, and when the phone comes forward it grows,
taller than the window, until its top is just under "Free and open source"; wider
screens keep it at 1.18×, which Kirill prefers there. Wider than a phone the window is as
large as the first screen allows, with the download badge 20px under it: on a 1015×637
Windows laptop at 200% it looked small and blurry, so keep the copy above it tight. Swap the take
in `src/happyOneDemoMedia.ts` (`docs/happy-one-demo.md`). It never mentions the CLI,
not even in the footer. Keep the copy short: the hero is the headline, at most one
short line, and "Free and open source"; each value is a title and two short
sentences of about 100 characters, about the same length; F1 Fast Mobile is
Kirill's line as written, and the length check skips it. The emoji are
what got smaller, not the explanations. The value rows zig-zag on two
columns: everything on the left starts on one edge and everything on the right ends
on the other, so each emoji lines up with the words of the next row. On phones too,
each emoji stays beside its words, trading sides. Each value's
animated emoji is a Telegram Lottie under `src/assets/emoji/`, drawn by dotLottie as
in happy-desktop, a little shorter than its words. Scrolling plays it once as it
crosses the middle of the viewport, and again only after it has left the middle half,
so jitter never replays it. The pointer moving onto the drawing, or a tap on it,
restarts it from the first frame every time; the words beside it do nothing.
The F1 car is the exception: it loops on its own while it is on screen. The
drawing, not its box, meets the edge and takes the hover: `AnimatedEmoji.tsx` records
each emoji's four empty margins at rest, so measure them again when an emoji changes. Twitter means the founders' accounts (`STEVE`,
`KIRILL` in `src/Team.tsx`); we have no company account. The Discord invite is
`HAPPY_DISCORD` in `src/products.ts`.

The hero is "Happy", Kirill's "One place for you, your team, and your agents." under
it, plain with no accent, and "Free and open source" followed by the GitHub mark and
the plain star count, as in the header (`HOME_HEADLINE` in
`src/homeVariants.ts`), in lavender; the build checks the headline and the line. The
hero's name is set in the page's own face, not the wordmark's. The candidates still
under review, headlines (`?hero=`) and palettes (`?palette=`), live in
`src/homeVariantsDev.ts` and `.css` and work on the dev server only, with a switcher
in the corner (`src/HomeVariantSwitcher.tsx`); the build leaves all three out and
ignores the parameters. `?preview=og` keeps the link-preview card's own headline
(`SOCIAL_HEADLINE`) until the card is regenerated.

## The other pages' look

Every other page (docs, blog posts, legal pages, `/releases/`, `/plugins/`,
`/model-benchmarks/` and the 404) takes the homepage's look minimally: `.site-theme` on
its shell (`src/site-theme.css`), the same palette (defined once, on `:root` in
`happy-home.css`, so a page whose markup comes with its script never shows another colour
first) light or dark with the system, IBM
Plex Sans and Plex Mono, Bricolage for the wordmark, and the Grain Gradient only as a
patch in the top right corner (`SITE_SURFACE` in `src/GrainGradient.tsx`), behind the
header and beside the title: never under the text, no side swells. Like the
homepage's, it is a still. Its layer is only as tall as the patch, so the renderer
draws it whole, once, and scrolling never redraws it.
It scrolls away with the page; wide docs scroll their article, and the patch goes up
with it. `theme-color` is the base colour, `#f4f2ff` light and `#06050f` dark. In dark
mode the hand-drawn diagrams are inverted with their hues kept, and X and Reddit embeds
load in the system's scheme. The tier list's rows take the gradient's hues, strongest at
S. Redirect pages carry the base colour inline. No page keeps the old cream look.

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

`scripts/gsc.sh` reads Search Console: `sitemaps` for when Google last fetched
the sitemap, `inspect` for each sitemap URL's index status, or any API path. It
uses no key file; it impersonates the SEO service account with your gcloud
login, which needs Token Creator on it. The Search Console UI lags the API by
hours, so check the API before acting on a UI error. Request indexing has no
API: ask the user to click it, about ten URLs a day.
