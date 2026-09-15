# Direct desktop download badges

These identify direct desktop downloads, not Mac App Store or Microsoft
Store listings. They must not imply that the desktop app is sold in either store.

The frame, Apple silhouette (including its leaf), and `Download` lettering are
taken verbatim from this website's existing App Store SVG
(`src/StoreButtons.tsx`). Both Apple treatments have its exact viewBox and
untransformed icon coordinates. The macOS name's ink starts at x=70.946, exactly
under the `D`, instead of the previous x=68.472. Its baseline remains y=60.992.

The rainbow variant changes only the Apple path's fill. Its six colors and
stripe proportions were read from the downloaded original SVG at:
https://commons.wikimedia.org/wiki/File:Apple_Computer_Logo_rainbow.svg
https://commons.wikimedia.org/wiki/Special:Redirect/file/Apple_Computer_Logo_rainbow.svg
The historical Apple logo was designed by Rob Janoff. This is a rainbow color
treatment of the existing App Store silhouette, not a claim that the historical
and modern silhouettes are identical.

Remaining text is converted to SVG outlines from Apple's SF Pro Display Medium
and SF Pro Text Regular. Font binaries are not distributed with the website.
The source fonts were obtained from this pinned mirror:
https://github.com/javdl/fonts/tree/5939d074b63a44672a04da2b0fe49da960a02cb7/MacOS
Apple's original typeface distribution: https://developer.apple.com/fonts/

The Windows mark is the standard four-pane Microsoft/Windows symbol, using the
same geometry as Bootstrap Icons' Microsoft glyph:
https://icons.getbootstrap.com/icons/microsoft/

The Linux badge uses the original filled Tux path from Font Awesome Free 6.7.2
by @fontawesome (CC BY 4.0), scaled and recolored white. It identifies Linux
without implying that only Ubuntu is supported:
https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/linux.svg
https://fontawesome.com/license/free
https://creativecommons.org/licenses/by/4.0/
Copyright Fonticons, Inc. Tux was originally created by Larry Ewing using GIMP.

The retained, currently unused generic `desktop.svg` badge uses the original
Lucide `laptop-minimal` geometry. Source:
https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/laptop-minimal.svg
It is scaled, not redrawn. It is not an Apple SF Symbol.

## ISC License — Lucide laptop-minimal

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

Apple, macOS, Microsoft and Windows marks remain their respective owners'
trademarks. These custom direct-download badges are not official store badges.