# Hidden preview: download grouping variations

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