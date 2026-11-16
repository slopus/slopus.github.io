# Design rules for happy.engineering

These rules cover the docs, guides, comparisons, and blog. The homepage has rules of its own; see Landing page below.

## Positioning

> Happy is one place for you, your team, and your agents: a desktop and phone app where a team and its coding agents share tasks, bots, and a feed, on the Claude, Codex, Grok, and Gemini subscriptions you already pay for. Free and MIT licensed.

Use this sentence, or a shortening of it, wherever a page says what Happy is: the homepage metadata, Welcome, and every lede that introduces Happy. The short form is the homepage hero line, **One place for you, your team, and your agents.** It sits under the footer wordmark (`HAPPY_TAGLINE` in `src/products.ts`).

- **Lead with the team and its agents in one place.** What a person sees and does comes first: a teammate's task appearing, a bot that owns a job, the feed, who may do what. Models, the harness, and the runtime are how it works, never the headline. Happy is not a phone remote for Claude Code; that describes only the original Happy CLI.
- **Say what you see, not where it runs.** "Your team", not "team server" or "team mode". Happy Agent, daemon, harness, WorkOS, Tailcat, and runner belong to the Under the hood pages, the guides, and the blog.
- **Words.** Say team, computer, task, bot, role, and the feed. Not server, tenant, organization, node, pool, or worker. A session is a task's conversation with one model; the reading path says task.
- **"Reuse your subscriptions"**, or "the subscriptions you already pay for". Don't mix in "plans", "existing subscriptions", or "the subscriptions you have".
- **Competitors appear in two places only:** the homepage's one positioning line, which opens its last value row ("Open source, MIT"), and the Compare pages. Never under the hero: the header, hero and demo stay as they are.
- **Not shipped means Vision only.** Direct messages, calls, and rented compute are described on `/vision/`, labelled as not shipped. Happy Cloud features (roles, invitations with a role, vaults, the audit trail, computer modes) sit under a "Coming with Happy Cloud" heading until an outside team can sign up.

## Copy

- **No commentary or narration.** Every line must tell the reader something they can use. Cut lines that only describe the page or point at a file:
  - "The diagram as SVG and as a 1600px PNG."
  - "Below is a diagram of…"
  - "This page explains…"
  - "In this guide we will…"
  - "Let's take a look at…"

  The download links for a diagram live where they are needed, such as the post that shares it, and not in the article.
- **We write as ourselves, in first person.** "We" for the team; the product name only for what the software does. "We haven't built a remove-member action yet", but "Happy Agent checks the token".
- **Terse and concrete.** Use names, commands, file paths, and settings. Drop marketing filler: "seamless", "powerful", "effortless", "unlock", "supercharge", "next-level".
- **Lead with the answer.** The first paragraph says what the thing is and why it matters. Background comes after.
- **Short enough to read on a phone.**
- **Repositories, tasks, bots. In that order.** Those are the three things in the app, and Quick Start teaches them in that order. A repository is only where code gets checked out from. Nobody cares about a "first project" or a "first session"; the app's word *project* appears once, in brackets, where a reader will meet it in the UI.
- **You should never have to click through settings.** The Chief of Staff does setup when asked. Say this as a belief, once, on Quick Start, and show it.
- **Use our own team as the example, and say that is what it is.** We build Happy with Happy, and the reader has never heard of Kirill or Steve. On every page that uses our team, the first mention says so in one sentence ("We build Happy in Happy. There are two of us, Kirill and Steve.") before any name is used. The section is called "How we use it" (or "The bots we run"), never "From ours" or "Ours". Dates are written out ("in November 2026"), never "last week". The facts: two people, 419 tasks in five weeks, 491 checkouts across 16 repositories, and bots for desktop releases, mobile releases, and product health.
- **A little of Kirill's voice.** The reader is an engineer. Direct, warm, a bit funny, and decent about the reader's freedom to leave. At most one such line on a page, and never at the cost of a fact.
- **Not shipped is not on the page.** Stories are not shipped: they appear in the changelog only. Same test for anything else before it is named in the reading path.

## Claims

- **Write for humans.** A page is read, not audited.
- **Verify every claim** against the code or the docs before writing it.
- **Link sparingly and inline**, only on a claim about another product or one a reader would doubt. Too many links and none of them carry weight.
- **No source lists** and no file-by-file references at the end of a page. Code references belong in commit messages and agent reports, not on the page.
- Quote other companies verbatim, with the date. Don't paraphrase them into something stronger.
- Use no number without a source: no setup times, user counts, or benchmarks that nobody measured.
- Don't overclaim. If the code doesn't do it yet, leave it out. If you can't verify it, leave it out.

## Diagrams

- **White cards on the page**, in the site's own palette, so they read as part of Happy rather than a sketch. `notes/diagrams/cards.py` holds the style; `notes/guides/migrate-diagram.py` is the reference.

  | Part | Light | Dark |
  | --- | --- | --- |
  | Text and icons | `--home-ink` (`#14112e`) | `--home-ink` (`#ffffff`) |
  | Muted text and connectors | the ink at 62% | the ink at 62% |
  | Accent (the thing the diagram is about) | `--home-accent` (`#5b21b6`) | `--home-accent` (`#c4b5fd`) |
  | Card | white at 78%, a hairline of the ink at 10%, a soft drop shadow | white at 7% |
  | Tile inside a card | the ink at 5%; accent tiles the accent at 10% | the accent at 16% |

- **Shapes.** Cards have a 14-unit radius (16 for a card that holds tiles), tiles 10. Strokes are 1.25 units; an accent connector is 2. A dashed card (5 5) is optional; a dashed connector (4 4) is a link that goes through something else, such as a relay. Arrowheads are open chevrons.
- **Type.** The page's own font, IBM Plex Sans: card titles 18 units at weight 600, tiles 18 at 500 (600 for accent tiles), muted lines 18, small notes 16, section labels 15 in capitals with .08em tracking.
- **Icons.** Small line icons, about 21 units square, 1.3-unit strokes with round caps.
- **Inline, not an image.** Each script writes `src/diagrams/<name>.svg`; a page names it as an image, `![alt](/diagrams/<name>.svg)`, and `src/InlineDiagram.tsx` puts the SVG in the page, so it follows light and dark through the CSS variables. Never invert it.
- **Left-aligned** with the text column, at most 600 units wide. A line in italics right under it is its caption: small, muted, and left-aligned.
- **Transparent background.** The page shows between the cards: no outer frame or panel.
- **Nested boxes only for real containment**: a machine card holding the apps that run on it. Otherwise group with a section label, a rule, or space.
- **Legible on a phone.** The smallest text is 15 units in a viewBox of at most 600, about 10px at 390; keep labels at 18.
- **No label touches a line or a box edge.** Check zoomed in, in light and dark, on a phone and on a desktop.
- **Script in `notes/`.** Change the script, not the SVG.
- **Full alt text.** The alt text says everything the diagram says.
- Older diagrams are hand-drawn SVGs under `public/` (`notes/guides/workos-diagram.py` and its siblings). Redraw one in this style when its page changes.

## Screenshots

The test: every picture on the site should look like it was taken during **one run of the app**, from different parts of the same window.

1. **One world.** Every capture comes from the same staged team (same people, same bots, same task names), the same app build, the same window size, and 100% zoom. A task named in one picture has the same name, owner, and state in the next.
2. **One scale.** Every desktop picture and clip shows the app at the same scale: the whole 1133 px window is 880 CSS px wide on the page (80/103, about 78%). Files are exactly twice the display size, resampled once from the 2× capture with one filter. Type inside every capture is therefore the same size from picture to picture. Phone pictures show the app at its true size. (Supersedes "true size" for desktop, 15 Nov: true size could not hold the sidebar and the pane in one column.)
3. **Narrow screens get the phone picture.** A desktop picture is never shown below 70% of the app's size; under that width the page shows the phone file instead. The whole-window film on Multiplayer keeps its own fixed size.
4. **In context.** A feature is shown as part of the bigger app, with enough of the sidebar or pane around it to tell where it lives. No tight crops of a chat bubble, no backdrop, no nested surface.
4a. **Fade only where the app really continues.** An edge of the picture dissolves into the page only where the crop cuts through the app with a lot more of it beyond (a hundred pixels or more). Where the crop is at a real window edge, or close to one, the picture goes to that edge and shows it as it is: a crisp border, no fade. A fade a few pixels from the border adds nothing and reads as a rendering bug (Kirill, 15 Nov).
4b. **The sidebar stays in the picture, almost always.** The app's sidebar tells a reader where they are (Kirill, 15 Nov: "almost never chop the sidebar"). Three framings, in order of how often they are used:
   - **Usual: the window's full width.** Sidebar and whole pane, both side edges real, fading only at the top and bottom.
   - **Allowed, unused so far: sidebar emphasis.** The right side may fade too when the sidebar is the subject. We tried it on four pictures and took it out: two kinds of right edge on one page read as inconsistent, and the crop height already puts the weight on the sidebar.
   - **Rarely: a single component.** Only when the thing needs no context (the mode menu). It has to be argued for.
4c. **One fade.** Whichever framing, the fade bands have the same height, width and curve on every picture and clip, so the interface dissolves the same way everywhere: 14 app px at the top or bottom, always in a gap between rows, never through a word, an icon or a selected row. A whole-window picture has no fade at all. The check fails a picture whose bands are not the preset.
4d. **Pages switch whole.** A page never mixes old and new framing: it takes a recut only when every picture and clip on it is ready.
5. **Theme matches the page.** Light and dark versions of every capture, and everything inside the capture (artifact covers, inline images) is in the same theme.
6. **No fade in time.** A feature clip starts on its true first frame, plays once, and rests on its last. The only fade is the spatial one in rule 4a. The whole-window film (rule 3) is the exception: it is a film with its own opening and may loop as it does today.
6a. **Clips move like the app.** 60 frames per second, constant, recorded from the running app at that rate: every frame during motion is a new frame, none dropped, none repeated, none interpolated. Played on a Mac next to the real app, the clip must not look slower than the machine. A clip recorded at 30 does not ship. The build or the capture script checks frame rate and counts repeated frames during motion.
7. **Show it, don't quote it.** The picture shows the thing the heading names, not a conversation about it. "Several repositories" is a sidebar tree with three repository icons, not a chat that says "three repositories".
8. **One picture per section, placed right after the sentence it proves.** Never two in a row. If a page needs a third picture, it probably needs a cut.
1a. **The staged world looks lived in, not generated.** Model it on our real sidebar. A few bots, not a column of them, each with its own picture and at least one with subtasks under it. Tasks that differ from each other: some plain, some with nested subtasks, a few spanning several repositories with their line counts, an unread dot here, a question waiting there. Variety, not volume: it should be pleasant to look at and nothing should repeat a pattern six times.
9. **Nothing private.** No secrets, tokens, real hostnames, home paths, or anything from the real server; staged data only.
11. **Pages arrive with their pictures.** The HTML the server returns already holds every still at full quality and true size, with width and height set, so the page is complete on first paint and nothing jumps. No blurry placeholder that sharpens later. A clip loads behind its still and takes over on an identical frame: the still is the clip's own first frame, converted exactly, same pixels, same size, same colour. This holds for the whole-window film too.
10. **Checked by the build.** Intrinsic size against displayed size (rule 2) is a build or test check, not a habit.

How the site does it:

- A capture lives in `public/img/docs/` at 2x. The page shows it at half its pixel width and height, set as `width` and `height` on the image (`src/MarkdownDocument.tsx`, from sizes `vite.config.ts` reads off the files), so the text around it never moves while it loads. A capture whose half width is wider than the column (728px) is recaptured narrower, never shrunk. `src/docImages.test.ts` fails on a capture that is not 2x or whose half width is wider than the column.
- A still from the capture script (`![](/img/docs/<name> "still")`, `src/DocStill.tsx`) comes with its manifest entry, kept in `src/docStills.json` with the manifest's `_presets`, as AVIF files (4:4:4; `src/imageSize.ts` reads their size), each light and dark, switched with `prefers-color-scheme`. A recut desktop cut (one with `scale`, `minDisplayWidth` and `fadeCss`) shows at its display size with its left edge on the column's, and shrinks with the room it has, down to 16px short of the article's right edge; where that would take it under `minDisplayWidth` (70% of the app's size), the phone cut shows instead, at true size (a still whose manifest has `"phone": null` is hidden there and loads nothing). Its fades are `fadeCss`, CSS masks in percent, so they shrink with it. A still not yet recut keeps its older fields: its desktop cut shows where the layout leaves it its `needsWidth` clear, at its display size, may run into the right margin by its `overhang`, and where the article ends first the last `edge` px dissolve. Real edges get a 1px hairline (ink at 16%), and the window's corner (12px at the cut's scale) where two window edges meet, never at the line between sidebar and pane (`divider`); no other border, radius, or shadow. `node scripts/sync-doc-stills.mjs <folder> <page>...` takes the capture script's stills and clips for whole pages (a still a clip replaces keeps its entry, not its files), and refuses a page with a picture pending or waiting on a clip. `src/docImages.test.ts` checks every file against its manifest size, every recut picture against the presets (scale, frame, `minDisplayWidth`, fade bands, no fade on a real edge), that a page is recut whole or not at all, and that each still sits in the section its manifest names.
- A still that plays (`src/DocClip.tsx`) has an entry under the still's name in `src/docClips.json`, the capture script's clip manifest: per cut and scheme a 60 fps clip in `public/video/docs/` and its first and last frames as AVIF stills (`.first.avif`, `.rest.avif`) in `public/img/docs/`, placed, edged and faded from the manifest like any still. The served page holds the first frame. Once the page has loaded and the picture is within a screen, the clip is fetched and laid over the still on that frame; it plays once when 60% of it is on screen and stays on its last frame. Off the screen it is emptied and made ready again, so a return starts on the first frame, never the finished state; a click on a finished clip plays it again. Reduced motion and no script get the rest by the picture's media queries, Save-Data and 2G by a script right after it, and none of them fetches the clip (`src/DocClip.test.tsx`). Its share card is cut from the rest. `src/docImages.test.ts` checks each clip's frame rate and that its stills are its size.
- A page's first picture loads with the page (`loading="eager"`, `fetchpriority="high"`, decoded synchronously) when it comes before the page's second h2; every later picture is lazy, so nothing below the fold loads eagerly (`rehypeFirstImage` in `src/MarkdownDocument.tsx`). A first clip preloads its still in the page's head.
- Moving between pages, the next page's first picture is fetched ahead: when the pointer, a touch, or focus reaches its link, and when the reader nears the foot of the page with Next on it (`src/firstPicture.ts`). Only the still that page will show at this width and scheme, never a clip, and nothing on Save-Data or 2G.
- New captures go to the reading-path pages that carry the story: Welcome, Quick Start, One place for the team, Bots, Tasks, The feed, Exactly enough access, and Computers. Every other page keeps the simple pictures it has.
- A clip's still (`poster.webp` beside `clip.mp4`) is its frame 0, decoded with `ffmpeg -i clip.mp4 -vf "select=eq(n\,0),scale=in_color_matrix=bt709:in_range=tv:out_range=pc:flags=accurate_rnd+full_chroma_int+full_chroma_inp+bitexact,format=rgb24" -frames:v 1 first.png`, then `magick first.png -quality 95 -define webp:method=6 poster.webp`. ffmpeg's default conversion comes out darker. Measured on the multiplayer film (November 2026): the still is within 0.3% of the exactly decoded frame, but headless Chromium shows the playing clip's blue channel about 4 levels lower (up to 8 on saturated blues), a 0.74% mean difference; near-white clips such as /stem-cell/ match within 0.3%. That was checked only in headless Chromium's software decoder: it is unverified on a Mac with hardware decoding and in Safari. Compare the still with the playing clip's first frame in headless Chromium before shipping it; `src/docImages.test.ts` checks that it is the clip's size.
- The whole-window shot (image title `window` or `window chrome`, `src/AppWindowImage.tsx`) is the app's window sitting directly on the page, with its rounded corners (10–12px at display size), title bar, a subtle border, and a soft shadow, at the column's width. Keep the captured title bar. For the multiplayer recorder's 1133px-wide captures, whose top 40px already reserve the title bar, `window chrome` adds the film's macOS traffic lights. Do not add controls over controls already in the capture.
- Phone captures (image title `row`) sit in the device frame at 272px wide.
- A reading-path clip (`src/AutoplayClip.tsx`, `<folder>clip.mp4`) must be a constant 60 fps; `src/docImages.test.ts` reads the rate from the MP4 header (`src/mp4Timing.ts`). Repeated frames need a decoder, so the capture script counts those.

## Tables

- On a phone a table stays a real table. It wraps to fit, at 12.5px if it has to.
- Only comparison tables with five or more columns become cards on a phone (`data-cards`, set in `src/MarkdownDocument.tsx`).

## Docs pages

- **Reading-path pages** are the pages in the sidebar's Start here, Your team, The app, and Where this goes groups. Each is read in a row with the one before it:
  1. the h1, which keeps the page's search phrase;
  2. the page's thesis line (`thesis` in `src/documents.ts`): one sentence that survives a screenshot, a claim about how teams work with the product second. It renders as the pull quote under the h1 and as the text on its link-preview card. It never appears in the sidebar: a second line under a sidebar item reads as a confusing subtitle;
  3. the story, in prose, a screen or two, with real examples from our own team;
  4. no closing "Next:" line; Previous/Next at the foot of the page hands off;
  5. then, if the page has reference material, a "The details" h2 and the search-phrased sections under it.

  A reading-path page never names a competitor; that material lives on a Compare page linked in one line.
- **Two layers** for every other docs page (Under the hood, Guides, Compare). Most people read the top of a page and act on it. That top is, in order:
  1. the h1;
  2. a lede of one or two sentences that says what the feature does;
  3. the visual, if the page has one;
  4. the Chief of Staff block.

  Everything below is the reference layer. It is for readers who want to know how the feature works, and for search engines and AI assistants working out what Happy can do. Each h2 names its question in the words people search with: "Use several accounts of one provider", not "Accounts". Each section stands on its own and states concrete facts. No keyword stuffing.

  Lead with what you get, never with the problem. The problem and the workarounds belong in the reference layer, beside the alternatives.
- **Operational recipes are source quotations for agents.** The `/recepies/` pages preserve the full Happy Agent source text byte for byte. Do not rewrite them into human tutorials or add prompt blocks. The sync script and provenance manifest record their source revision, and each page names its source file and revision above the text. Never edit the copies; change happy-agent and re-sync. The sidebar shows them as one link, **Recipes**, in the last group, **For agents**; every recipe page stays live and is listed on `/recepies/`.
- **The Chief of Staff block.** Every Under the hood page, and every guide whose task the [Chief of Staff](/chief-of-staff/) can do, has a `chief-of-staff` fence right after its intro, with one prompt per line. A reading-path page that keeps one carries it after its opening or at the top of The details, never ahead of the story. Every page renders it the same way (`src/ChiefOfStaffPrompt.tsx`):
  - One line naming what the prompts do, from the fence's first line: ```` ```chief-of-staff add skills ```` renders "To add skills, simply ask the Chief of Staff:". Keep the task short and specific to the page.
  - Each prompt in its own quote-style box: the accent at 7% as its fill and a 3px accent left edge. No card: no full border, no shadow, no heavy fill.
  - Inside the box: a quiet "Example" label in small caps top left, a copy icon top right. The prompt runs the full width below them, never squeezed by a button column, and wraps under them at 390.
  - The copy icon has no text and no border, and copies only the prompt. It sits out of the flow, so it never sets a line's height or pushes text down. It keeps a fixed size and place, shows a check for 1.5 seconds, has an `aria-label` naming the prompt and a visible focus ring, and a hit area of at least 32px (44px on phones).
  - Contrast on the tint: text and label at least 4.5:1, the accent edge and the focus ring at least 3:1.
  - Without JavaScript the prompt is plain text that selects and copies by hand.
  - Use prompts the Chief of Staff can carry out today with its tools and recipes. Check before adding one.
  - Make them copyable as written. Use example names such as `acme/api`, `ubuntu@203.0.113.10`, and `alice@example.com`.
  - Leave the block off pages where it can't help: Using the Terminal, How It Works, comparisons, Vision, Team, and the new reading-path pages (Bots, Tasks, The feed, Computers).
  - Blog posts never get it. They explain how something works; the feature page they link to carries the prompt.
  - Don't repeat the prompt in a prose "Ask the Chief of Staff" section.
- **One h1 per page.** The build fails otherwise. Sections are h2.
- **Nothing above the h1 on desktop.** No eyebrow, breadcrumb, or product label, because the sidebar already shows where you are. On a phone, the docs navigation is the group-and-page trail:
  - a 44px tap target;
  - its chevron at the right end, no taller than the text's capitals.
- **Sidebar rows never move.** Each label reserves the width of its bold, active form (`data-label` on `.docs-nav-label`, a hidden bold copy in `src/style.css`), so a row has the same lines and height active or not. `node scripts/check-sidebar-rows.mjs` measures every row at 1440, 1180, 1024 and in the phone menu and fails on any that moves; it also lists labels that wrap while inactive. No row takes two lines: shorten a reading-path title that wraps, and give any other page a `navLabel` in `src/documents.ts`, which the navigation shows while the title and h1 keep the search phrase.
- **Metadata.** Each page's title, search title, and description (160 characters at most) live in `src/documents.ts`.
- **Link preview.** Each desktop doc has its own card, `public/og/<path with dashes>.png`: its title, description, and first figure. After adding a page or changing its title, description, or figure, run `python3 notes/og/cards.py <slug>` and commit the PNG; the build fails without it. The original CLI docs under `/docs/` keep the homepage's card. The description is also the page's meta description and preview text, so it states the capability plainly.
  - A page without a figure gets no logo tile in its place. Its card keeps the header and the URL line, gives the title the full width, and swaps the description for the page's `cardLine` in `src/documents.ts`: one line of four to eight words, benefit first, no closing period, true to the page. `cards.py` stops if the line is missing or wraps. A page with a figure may have a `cardLine` too.
  - A screenshot too small to carry a card gets a larger cutout of the same UI in `notes/og/figures/`, named in `CARD_FIGURES` in `cards.py`. It fills the right side the way a diagram does.
  - A post whose preview should play a video sets `video` in `src/documents.ts`. Its card is a frame of the video, the one that carries its hook, 1200 wide at the video's aspect ratio, not a `cards.py` card; iMessage and Discord play the MP4, everything else shows the frame. `docs/og-video.md` has the tags, the per-platform limits, and how to replace the video.
  - After changing cards that are already shared, bump `SOCIAL_IMAGE_VERSION` in `src/siteMetadata.ts` and the `?v=` on the homepage image in `index.html`, so X, Slack, and LinkedIn fetch them again.
- **Changelog** is collapsed by default, directly above For agents, after the Blog. `/changelog/` lists production releases newest first, never previews. Entry titles name their core features; product, stable version and date sit in a small line below. Each human permalink (`/changelog/gpt-6-1-terra/`) is a complete prerendered page with that entry first and its own canonical, og:url and preview. GitHub Pages cannot vary HTML by query string.
- **The Blog** follows Compare and precedes Changelog in the sidebar, with no list page. Each post gets a one-word slug you can type from memory: `/workos/`, `/tailcat/`, `/voice/`. Every post ends on the homepage's download options, added by the page layout (`src/DocumentPages.tsx`), never by the post.
- **URLs don't break.** `routes.txt` only grows. A shared URL keeps working when its page moves: `/team-sign-in-workos/` redirects to `/workos/`. Nor do their anchors: when a section moves to another page, add its old id to `MOVED_ANCHORS` in `src/movedAnchors.ts`, which sends the link on; when a heading is renamed or removed but its content stays, put `<Anchor id="old-id" />` on its own line before the block that holds it now. `src/movedAnchors.test.ts` checks every heading id `main` served before the November 2026 rewrite (`src/mainHeadingIds.json`).

## Landing page

The homepage is off-limits without explicit approval for the specific change. Kirill approved the team-story rewrite of November 2026: the copy and order of the value rows, the footer line, and the homepage metadata. That approval does not cover the demo, the downloads, or the speed budget. The homepage covers:

- `src/DesktopApp.tsx`
- `src/DownloadOptions.tsx`
- `src/happy-one*.css`, `src/happy-home.css`
- `src/GrainGradient.tsx`, `src/grainGradient*.ts`, `src/AnimatedEmoji.tsx`
- `src/homeVariants.ts`, `src/homeVariantsDev.ts`, `src/homeVariantsDev.css`, `src/HomeVariantSwitcher.tsx`
- `src/StoreButtons.tsx`
- `index.html`
