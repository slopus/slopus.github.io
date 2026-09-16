# Hidden preview: Apple badge comparison

Current comparison (2026-09-15): rainbow Apple / white Apple only. Click the
download area's background to switch; actual download links and the terminal
copy button keep their normal behavior. Keyboard left/right arrows also switch
the two synchronized instances. No dropdown or extra platform-badge stack.

Both Apple variants use the exact path, leaf, viewBox, and placement from the
existing App Store button. The rainbow variant changes only the fill, using the
downloaded Wikimedia source's six colors and stripe proportions. See the badge
directory's NOTICE for original sources and attribution.

Measured in Chromium at the actual 180 × 56 CSS-pixel badge size:

| Measurement, relative to badge | macOS rainbow | macOS white | App Store |
| --- | ---: | ---: | ---: |
| Apple left | 16.929 px | 16.929 px | 16.929 px |
| Apple top | 11.377 px | 11.377 px | 11.377 px |
| Apple width | 25.964 px | 25.964 px | 25.964 px |
| Apple height | 32.091 px | 32.091 px | 32.091 px |

Full-precision geometry is identical, not merely equal after rounding. Desktop
badge boxes share the same top edge. Both `Download` and `macOS` now start at
SVG x=70.946 (rendered x=54.592 px); the old macOS origin was x=68.472. Text remains
outlined SF Pro; the existing App Store artwork is not modified.

Font audit: SF Pro Display Regular, Medium, and Semibold were compared against
Apple's original outlined A/S/p/o/e at the same cap height and baseline. Medium
was closest: aggregate ink coverage +1.4% versus the reference, compared with
Regular −15.3% and Semibold +13.8%. Those are ink-coverage measurements, not a
claim that different outlines are identical. Opus 5 independently checked the
actual-size screenshot: the shared capital S had the same 14 × 19px box and
median stroke width, with 0.6% difference in raster ink mass. The shared
`Download` letters are verbatim reference paths, with matching advances and
placement. Medium is retained; no synthetic stroke or font-weight hack is used.

Windows keeps its original Microsoft mark. Linux uses original filled Font
Awesome Tux artwork, rather than implying Ubuntu-only support. Phones have no desktop
OS to detect, so they show the macOS badge for the comparison with all three
macOS / Windows / Linux links explicitly visible below it.

Homebrew is a centered, content-sized black 46px terminal strip with a left-pinned
prompt, monospace command, and 44px copy target. The command never wraps or shrinks
to fit: at narrow widths or enlarged text sizes, only the command scrolls
horizontally (including with keyboard focus), leaving `$` and Copy in place.
Copy briefly swaps the icon for a checkmark, reverting after 1.4 seconds with no
tooltip, toast, or visible text selection. Browsers that deny the async clipboard
API get a native-copy fallback that restores focus and any previous selection;
if both fail, an accessible status reports the failure without claiming success.
Only the command is copied, without the decorative `$`. The strip belongs to the
macOS option: phones keep it, while Windows and Linux use their direct-download
badges without a cask command.

## Store ratings

Added after the badge/terminal pass, using the homepage's existing
`store-rating`, `store-stars`, and `store-count` styling. Values are a static US
snapshot, not a runtime fetch. The public homepage remains unchanged.

| Store | Raw score | Count | Preview display |
| --- | ---: | ---: | --- |
| App Store (US) | 4.87276 | 1,006 | 4.9 · 1,000+ ratings |
| Google Play (US, overall) | 4.973684310913086 | 3,128 | 5.0 · 3.1k+ reviews |

Checked 2026-09-15. Google Play's visible page also showed 5.0 and 3.13K reviews;
its phone-only breakdown had a different count, so do not mix those populations.
Scores can vary by country and device category.

Run `node scripts/check-store-ratings.mjs` for a read-only first-party refresh,
verify the visible listings, and then update `src/storeRatings.ts` deliberately.
The script never writes files or silently changes marketing claims.

- https://itunes.apple.com/lookup?id=6748571505&country=us
- https://play.google.com/store/apps/details?id=com.ex3ndr.happy&hl=en_US&gl=US

## Archived interaction experiments

The following describes the previous three-way comparison, removed from the UI
on 2026-09-15. Kept here as design history, not current implementation guidance.

This is a temporary taste comparison on `/tmp/happy-one/`, not a new public page
or a setup wizard. Click the download section's background to cycle the three
variations. Links, copy controls, and text selection keep their normal behavior.
Keyboard users can focus the group and use the left/right arrows. Both instances
on the page stay in sync. No visible switcher, headings, divider, cards, or toast.

1. Detected-platform download badge, with quiet links to the other platforms.
   Phones use a generic Desktop badge and all three platform links rather than
   assuming macOS.
2. The same primary download with an adjacent platform chooser. On phones,
   clicking the whole Desktop badge opens the chooser. All three platform names
   remain visible below it even when closed. The non-modal popover supports
   outside-click dismissal, Escape with focus restoration, and ordinary Tab
   navigation; opening it does not shift the page.
3. Three explicit OS download badges, with no chooser or hidden options.

Desktop uses two equal-width groups separated by whitespace; phones stack them.
Groups have natural heights, without padding shorter variants into empty rows.
The actual App Store and Google Play SVGs are unchanged. The custom desktop
badges reuse their existing outlined typography, not an approximate web font.
Desktop/device glyphs use Lucide's original laptop-minimal;
its license is in `public/img/happy-one/badges/NOTICE.md`.

The exact alternate command is `brew install --cask slopus/tap/happy`. It remains
visible on phones at the user's explicit request, as well as macOS and Linux.
Windows never renders the command or copy control. Phones show all three desktop
platforms instead of pretending they are Macs. The tap
and current release were checked for macOS, Windows, and Linux support:

- https://raw.githubusercontent.com/slopus/homebrew-tap/main/Casks/happy.rb
- https://github.com/slopus/happy-desktop/releases/latest

All desktop links retain the site's existing latest-release destination. This
comparison does not introduce an installer resolver or pin stale versioned
binary URLs. GitHub's release page contains the actual platform assets.

Research used Grok web search, then original-source checks of Lucide, Ghostty,
Claude, ChatGPT, and Grok Bot. Claude exposes macOS and Windows downloads
directly. ChatGPT leads with a primary OS download; its official desktop URL
redirected to the current download page during the check. Grok Bot pairs its
primary OS download with “More downloads,” which opens a modal listing desktop
and mobile platforms. These are references for primary/secondary hierarchy,
not claims that every comparator uses the same popover interaction. The Happy
preview keeps its mobile app stores visible and uses a small anchored chooser.
Opus 5 reviewed the hierarchy and the variant approach.
Its final screenshot review favored the first variation. The review also led
to quieter secondary links, removing redundant current-OS links on desktop,
fixing the chooser caret alignment, and removing extra dropdown arrows. The
explicit three-badge variation is deliberately available for comparison even
though it is taller, especially on phones.
The literal SF Symbols glyphs were not used; the openly licensed Lucide outline
matches the supplied screen-and-base reference.

- https://lucide.dev/icons/laptop-minimal
- https://raw.githubusercontent.com/lucide-icons/lucide/main/LICENSE
- https://ghostty.org/download
- https://claude.com/download
- https://chatgpt.com/download/
- https://chatgpt.com/features/desktop
- https://x.ai/bot