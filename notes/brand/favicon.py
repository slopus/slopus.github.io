"""Generate the site's icons from the exact Happy mobile app artwork.

Source: slopus/happy, packages/happy-app/sources/assets/images/icon.png,
selected by expo.icon in packages/happy-app/app.config.js. The source is copied
unchanged to public/brand/mobile-app-icon.png; do not redraw the segmented H.
SHA-256: 21c94889bb20f1e6fe7746ac040049d2ccde4ee04ea545d38ae34c5d4b3bc36a

Run from the repository root with Pillow installed:
    python3 notes/brand/favicon.py
"""

import base64
import hashlib
import io
from pathlib import Path

from PIL import Image

PUBLIC = Path(__file__).resolve().parents[2] / "public"
SOURCE = PUBLIC / "brand/mobile-app-icon.png"
SOURCE_SHA256 = "21c94889bb20f1e6fe7746ac040049d2ccde4ee04ea545d38ae34c5d4b3bc36a"

if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != SOURCE_SHA256:
    raise ValueError("Mobile icon source changed; verify expo.icon and update its recorded hash.")

with Image.open(SOURCE) as source:
    source = source.convert("RGBA")

    def resized(size):
        return source.resize((size, size), Image.Resampling.LANCZOS)

    # Keep the existing SVG URL working. Its embedded PNG uses the same mobile
    # artwork; external image references do not work in browser SVG favicons.
    embedded = io.BytesIO()
    resized(192).save(embedded, format="PNG")
    encoded = base64.b64encode(embedded.getvalue()).decode("ascii")
    (PUBLIC / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">'
        f'<image width="192" height="192" href="data:image/png;base64,{encoded}"/>'
        '</svg>\n'
    )

    # Explicit frames keep every ICO size identical to resizing the source.
    frames = [resized(size) for size in (16, 32, 48)]
    frames[-1].save(
        PUBLIC / "favicon.ico",
        sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=frames[:-1],
    )
    resized(96).save(PUBLIC / "favicon-96x96.png")
    resized(180).save(PUBLIC / "apple-touch-icon.png")
    for size in (192, 512):
        resized(size).save(PUBLIC / f"web-app-manifest-{size}x{size}.png")

print("Wrote SVG, ICO, PNG, Apple touch, and manifest icons from the mobile app icon.")
