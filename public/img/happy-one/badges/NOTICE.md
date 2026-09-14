# Direct desktop download badges

These identify direct desktop downloads, not Mac App Store or Microsoft
Store listings. They must not imply that the desktop app is sold in either store.

The frame and `Download` lettering are taken verbatim from this
website's existing App Store SVG (`src/StoreButtons.tsx`). The desktop badges use
its exact viewBox, text origins, baseline and capital-height geometry.

Remaining text is converted to SVG outlines from Apple's SF Pro Display Medium
and SF Pro Text Regular. Font binaries are not distributed with the website.
The source fonts were obtained from this pinned mirror:
https://github.com/javdl/fonts/tree/5939d074b63a44672a04da2b0fe49da960a02cb7/MacOS
Apple's original typeface distribution: https://developer.apple.com/fonts/

The Windows mark is the standard four-pane Microsoft/Windows symbol, using the
same geometry as Bootstrap Icons' Microsoft glyph:
https://icons.getbootstrap.com/icons/microsoft/

The macOS, Linux, and generic Desktop badges use the original Lucide
`laptop-minimal` geometry instead of an Apple mark. Source:
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