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
hairline only once the page has scrolled. On phones it is `position: fixed` in a slot that
keeps its room (`.site-header-slot`), not sticky: iOS Safari left a sticky header up to 2px
off while the page scrolled, and at rest. The homepage keeps it out of sight until the
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
height. The store badges and the platforms row under the desktop download are one stack,
one gap apart (`--one-stack-gap`), on every screen. Where the bottom of the first screen
would cut a row, or come closer to it than the gap allows, the stack moves so the bottom of
the screen crosses the gap after the last row that fits, 80% of the gap above it and 20%
below (`placeFirstScreenDownloads` in `src/DesktopApp.tsx`); the gaps themselves never
change. The page's scrollbar is the browser's own, thin, in the ink, with its gutter kept
(`scrollbar-gutter: stable`) so the header sits still between pages; no script paints one.
Windows visitors see the SmartScreen note; its signer name and profile
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

The gradient is the page's one surface, scrolling with the content: never fixed, never
boxed into panels. Its noise and grain are the apps'; only `main()` differs, working in
page space (`HOME_SURFACE` in `src/GrainGradient.tsx`): a few big, slow swells along the
left and right edges, a large patch in the top right corner, and one in the bottom left
at the page's end, which may run under the footer's text, with a plain column down the
middle in the palette's base colour. The colour belongs to the page's two ends: whole in
the first and last screen, it fades out over half a screen more (`u_zone`), and the middle
of the page is the plain base colour, with no canvas. The fade is of the colour, never of
time: `u_time` is the same on every row, because a time that changed down the fade tore
the swells into jagged spikes the longer the page stayed open. No band along the top, and
nothing choppy: no thin jagged edges or quick wobble. On phones the colour stays out of
the content: the top right corner and the bottom left at the footer. It never wraps
around content blocks; Kirill found that claustrophobic. The page bounces as usual: turning
the rubber band off (`overscroll-behavior-y: none`) also turned off pull-to-refresh on the
iPhone, so the phones' corners fade out just before the page's ends instead. Text, emoji,
video, and buttons sit directly on it, and the header is transparent until the page
scrolls, then frosted. Kirill wants it to move on phones and desktops alike, slowly: a
fifth of the apps' speed (`GRAIN_SPEED`), ten frames a second.

Something is always drawn. Phones (narrower than 700px, `PHONE`) don't run the shader:
their corners are the shader recorded (`GrainCorner` in `src/GrainGradient.tsx`; the
homepage's top right and bottom left, the other pages' top right, smaller), a looping H.264
movie over an AVIF of its own frame 0 that the page's markup carries, so the first paint
already shows them; the movie plays over it once the page has loaded and the corner is near
the screen, never on reduced motion, Save-Data or 2G. Everything on the page beside the
layer isolates, so it paints over a playing corner: iOS Safari drew it above the hero's
text and the docs breadcrumb otherwise. The corners fade before the page's top and end, so
Safari's app banner above the page, or a rubber band past it, shows no cut.

Wider than a phone the gradient is the shader or its still, never both, and which is
decided before the first paint and kept until a reload. An inline script in the head of
`index.html`, ahead of the stylesheet, sets `data-grain="shader"` on `<html>` when the
window is 700px or wider, motion is not reduced, `Worker` and `OffscreenCanvas` exist, the
machine has at least `CORES` (4) cores and, where the browser says, `MEMORY_GB` (16) of
memory, both estimates in that script, and a probe gets WebGL on a GPU
(`failIfMajorPerformanceCaveat`), which it gives back at once. Only Chromium reports memory:
2, 4, 8, 16 or 32 since Chrome 147 and at most 8 before, so an older one keeps the still
(about 2% of the site's Chrome and Edge desktop sessions when this was set); Safari and
Firefox pass on cores and the probe alone, and Safari reports at most 8 cores. The probe
took 0-3ms in Safari and 4-7ms in Chrome on an M4 Pro, 20-30ms in the first page of a cold
Chrome. Without the attribute, and so without scripts, the still shows:
the corners recorded at frame 0 of the same shader, AVIF for 1x and 2x screens, as CSS
backgrounds on `.grain-corner` (`src/grain-gradient.css`), so a page with the attribute
never fetches them. A background is found only after the stylesheet, which put the corner
76ms after the first paint, so the same script preloads the top right one, the file the
`image-set()` then takes (the 2x past one device pixel a CSS pixel), and it is fetched once. The still has the corners and no side swells,
and the other pages use the homepage's top right, smaller. There is no stand-in drawn in
CSS: one of another shape was visibly swapped, and its gradients cost a software rasterizer
a tenth of a second a tile. With the attribute the layer starts as the plain base colour and
the shader's canvases fade in over it; the two never cross-fade, since a recording cannot
match the live field pixel for pixel. A page that loaded narrow and was widened stays on
the still. `notes/grain/render-corners.mjs` renders every recording from the shader; run it
again when the shader or the palette changes.

`src/grainGradientRenderer.ts` places the shader in page space: each end of the page is one
strip, a screen and a half tall, across where the shader can put colour (the homepage's
full width; the other pages' corner). On a page shorter than three screens the two are half
the page each and meet, so still only the end near the screen is drawn; a layer no taller
than a screen and a half (the other pages' corner) is one strip. A strip
is cut into equal pieces of at most 4096 device px a side, each a plain canvas showing a
bitmap, so big displays get the full pixel ratio (`min(2, max(1, devicePixelRatio))`) and
scrolling never draws or moves anything: it stays on the compositor. One worker
(`src/grainGradientWorker.ts`), started only with the attribute, draws every piece in the
visit's one WebGL context, off the main thread, and only the pieces near the screen while
the tab is in view; the pieces are one size so its canvas is never resized between them.
One context, because Chromium keeps four to a worker and loses the oldest (five lost the
whole gradient on windows from about 1500px wide), and Safari's memory grew with each until
it reported "out of memory": five contexts added 619MB in Safari and 332MB in Chrome at
1512×859 on a 2x screen, one adds 379MB and 291MB, and 681MB and 610MB at 3008×1692.
Reduced motion switched on after the load pauses the drawing.
No check before the first paint knows how fast the GPU is, so the worker times its second
frame, reading a pixel back to wait for it (Chromium's `finish()` only flushes): a GPU that
needs longer than the 100ms between frames never moves the gradient, and the frame it drew
stays. Without that, frames it cannot finish queue ahead of the page's own: a software
renderer given 7.7 MP ten times a second left the page 18 frames in five seconds.
It is one way: if the worker gets no context on a GPU, the shader does not compile, the
context is lost or a draw throws, the worker stops, the canvases go, the attribute is
removed and CSS shows the still. Nothing starts the shader again; a reload starts over.
Software WebGL is never used: it took 1.1s of main thread for one frame. Each half of the
page has noise of its own, blended across the middle, so where a corner patch crosses the
middle the halves never meet in a line. The frosted header
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
homepage's, it is the shader moving while it is in view, or its still (`GrainCorner`), and
phones show it recorded. Its layer is only as tall as the patch: one piece, and scrolling
never redraws it.
It scrolls away with the page; wide docs scroll their article, and the patch goes up
with it. `theme-color` is the base colour, `#f4f2ff` light and `#06050f` dark. In dark
mode the hand-drawn diagrams are inverted with their hues kept (card diagrams, drawn inline, take the palette instead; DESIGN.md), and X and Reddit embeds
load in the system's scheme. The tier list's rows take the gradient's hues, strongest at
S. Redirect pages carry the base colour inline. No page keeps the old cream look.

## Page speed and Google's page experience

**Non-negotiable: every page loads instantly, or near it, on a slow phone.** Kirill's
order: speed comes before polish, and a change that makes the first screen slower or
makes it jump does not ship, however it looks. Hold the homepage to what it does today
in the lab run below (phone: LCP about 1.1s, CLS 0, TBT under 150ms, under 400KB
before the movies; desktop: LCP about 0.3s, TBT 0), and keep the rest of the site
within the same budget. Pixel parity comes with it: whatever upgrades the first
screen (a movie over its still) must start on the pixels already shown; the Grain
Gradient's shader and still are never swapped, one for the other, in view.

Search ranks pages partly on Core Web Vitals from real Chrome visitors (the Chrome UX Report,
28 days, 75th percentile), on phones and desktops separately: LCP at most 2.5s, INP at most
200ms, CLS at most 0.1. Lighthouse and other lab scores do not rank, but they show why a
field number is bad. Before shipping a change to the homepage's first screen, its media, its
fonts, or the Grain Gradient, and after any report of a slow or jumpy load:

- Run `scripts/vitals.sh` (homepage by default, any URLs as arguments) for the field numbers
  of the URL and the whole site and one Lighthouse run, phone and desktop. Export
  `PSI_API_KEY`; the keyless quota is shared and often used up.
- Check the phone lab run under Lighthouse's conditions (4x CPU, 150ms RTT, 1.6 Mbps) in
  headless Chromium as well: the LCP element and time, layout shifts and their sources, and
  long tasks. Watch a filmstrip of the first screen; nothing may appear and then change shape:
  black boxes before posters, a stand-in background swapped for another.
- The first screen is plain HTML, CSS and images that are already the right size, laid out
  in its final place before the first paint, with nothing that moves when the app hydrates:
  the demo's stills are AVIF from each movie's own frame 0 (`docs/happy-one-demo.md`), the
  window's at high priority, the phone frame a WebP, the body face preloaded from
  `/fonts/` (self-hosted, `scripts/self-host-fonts.py`; no other origin draws text), and
  the store badges placed by an inline script as they are parsed. Nothing below the fold
  loads eagerly. The movies load only after the page has, while it is idle, and not on
  Save-Data or 2G; the shader only on a GPU, in a worker, and otherwise its still. Never block the main thread for more
  than 50ms.
- The homepage's script is the homepage: every other page, the docs text and react-markdown
  live in `src/sitePages.ts`, a chunk the homepage never loads (98KB gzipped for the
  homepage). Don't import a page or content into the homepage's graph; other pages preload
  their chunk from their served HTML (`scripts/generate-static-routes.mjs`).
- Report the field numbers with the change. A field number that is not good is a bug to fix,
  ahead of new polish.

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
