# Direct desktop download badges

These identify direct macOS/Windows downloads, not Mac App Store or Microsoft
Store listings. They must not imply that the desktop app is sold in either store.

The frame, Apple mark, and `Download` lettering are taken verbatim from this
website's existing App Store SVG (`src/StoreButtons.tsx`). Both desktop badges use
its exact viewBox, text origins, baseline and capital-height geometry.

Remaining text is converted to SVG outlines from Apple's SF Pro Display Medium
and SF Pro Text Regular. Font binaries are not distributed with the website.
The source fonts were obtained from this pinned mirror:
https://github.com/javdl/fonts/tree/5939d074b63a44672a04da2b0fe49da960a02cb7/MacOS
Apple's original typeface distribution: https://developer.apple.com/fonts/

The Windows mark is the standard four-pane Microsoft/Windows symbol, using the
same geometry as Bootstrap Icons' Microsoft glyph:
https://icons.getbootstrap.com/icons/microsoft/

Apple, macOS, Microsoft and Windows marks remain their respective owners'
trademarks. These custom direct-download badges are not official store badges.