# Agent notes

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
docs at `/desktop/docs` (content in `content/desktop/`, registered in
`src/documents.ts`); the header's Docs link goes there. `/desktop/`, `/happy2/`,
and `/tmp/happy-one/` redirect to `/` (static redirect pages written by
`scripts/generate-static-routes.mjs`, carrying the homepage's preview tags), and
`/happy2/docs/*` still serves the desktop docs; keep them all resolving. The
original Happy CLI docs (`/docs`, `content/docs/`) are in maintenance mode:
every page opens with the maintenance notice, and only a quiet footer link
points to them. The Buzz comparison stays reachable at
`/desktop/docs/comparisons/buzz/` but is unlisted (`hidden: true`).

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
