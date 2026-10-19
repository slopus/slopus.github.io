"""Generate website icons from the canonical vector in notes/brand/mark.svg.

The master follows public/brand/mobile-app-icon.png: a 607-unit mark with
190-unit blocks, 18.5-unit seams, and 64-unit external corner radii. It omits
the mobile artwork's textured background. Keep the master geometry unchanged.

The browser SVG is transparent and theme adaptive. At widths up to 32px it
uses a derived optical variant: integer-aligned 4-unit blocks and 1-unit seams
on a 16-unit canvas. ICO16/32 use that same variant; ICO48 and larger exports
use canonical proportions. Legacy ICO/PNG are neutral gray for both themes.
Installed icons are white on a flat dark square, with platform-safe padding.

Run from the repository root:
    python3 -m pip install Pillow==13.0.0 CairoSVG==2.9.1
    python3 notes/brand/favicon.py
"""

import io
from pathlib import Path
import re
import xml.etree.ElementTree as ET

import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
SOURCE = Path(__file__).with_name("mark.svg")
SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)


def optical_path(path):
    """Snap the canonical path to the tiny-icon grid, retaining its commands."""
    def coordinate(value):
        value = float(value)
        scaled = 1 + value * 14 / 607
        # The rounded corner anchors retain half-unit precision.
        return round(scaled * 2) / 2 if value in (64, 543) else round(scaled)

    result = []
    for command, text in re.findall(r"([MHVAZ])([^MHVAZ]*)", path):
        values = [float(value) for value in re.findall(r"[\d.]+", text)]
        if command == "A":
            assert len(values) == 7
            values[:2] = [round(value * 14 / 607 * 2) / 2 for value in values[:2]]
            values[-2:] = [coordinate(value) for value in values[-2:]]
        else:
            values = [coordinate(value) for value in values]
        result.append(command + " ".join(f"{value:g}" for value in values))
    return "".join(result)


def paths(optical=False):
    root = ET.parse(SOURCE).getroot()
    if any(element.tag != f"{{{SVG_NS}}}path" for element in root):
        raise ValueError("The canonical mark must contain vector paths only.")
    return [optical_path(path.attrib["d"]) if optical else path.attrib["d"] for path in root]


def browser_svg():
    canonical = "\n".join(f'    <path d="{path}"/>' for path in paths())
    optical = "\n".join(f'    <path d="{path}"/>' for path in paths(optical=True))
    return f'''<svg xmlns="{SVG_NS}" viewBox="0 0 16 16">
  <style>
    :root {{ color-scheme: light dark; }}
    g {{ fill: #101014; }}
    .optical {{ display: none; }}
    @media (prefers-color-scheme: dark) {{ g {{ fill: #fff; }} }}
    @media (max-width: 32px) {{ .canonical {{ display: none; }} .optical {{ display: inline; }} }}
  </style>
  <g class="canonical" transform="translate(1 1) scale({14 / 607:.14g})">
{canonical}
  </g>
  <g class="optical">
{optical}
  </g>
</svg>
'''


def render(size, mark_fraction=14 / 16, installed=False, optical=False):
    root = ET.Element(f"{{{SVG_NS}}}svg", {"viewBox": "0 0 16 16"})
    if installed:
        ET.SubElement(root, f"{{{SVG_NS}}}rect", {
            "width": "16", "height": "16", "fill": "#101014"
        })
    group = ET.SubElement(root, f"{{{SVG_NS}}}g", {"fill": "#fff" if installed else "#808080"})
    if not optical:
        width = mark_fraction * 16
        group.set("transform", f"translate({(16 - width) / 2:g} {(16 - width) / 2:g}) scale({width / 607:.14g})")
    for path in paths(optical=optical):
        ET.SubElement(group, f"{{{SVG_NS}}}path", {"d": path})
    png = cairosvg.svg2png(bytestring=ET.tostring(root), output_width=size, output_height=size)
    return Image.open(io.BytesIO(png)).convert("RGBA")


def main():
    (PUBLIC / "favicon.svg").write_text(browser_svg())
    frames = [render(size, optical=size <= 32) for size in (16, 32, 48)]
    frames[-1].save(
        PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
        append_images=frames[:-1],
    )
    render(96).save(PUBLIC / "favicon-96x96.png")
    render(180, mark_fraction=0.7, installed=True).save(PUBLIC / "apple-touch-icon.png")
    for size in (192, 512):
        # A 9/16-width square fits inside the central 80%-diameter circle.
        render(size, mark_fraction=9 / 16, installed=True).save(
            PUBLIC / f"web-app-manifest-{size}x{size}.png"
        )
    print("Rendered responsive SVG, optical ICO16/32, canonical ICO48/PNG96/Apple180/maskable192/512.")


if __name__ == "__main__":
    main()