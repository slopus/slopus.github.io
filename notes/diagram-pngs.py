# Writes the diagrams as PNGs for posting on X, which takes no SVG. Run from the repository root
# after changing a diagram's generator:
#   python3 notes/diagram-pngs.py
#
# - public/img/<name>.png: the diagram 1600px wide, on the page colour, with a 40-unit margin.
# - public/img/<name>-16x9.png: 1600x900. A tall diagram is laid out in two columns, its sequence
#   on the left and its notes on the right, so the text stays readable as a thumbnail.
# - public/img/tailcat-x.png: a simpler Tailcat picture for the post, with the brand lockup.
#   tailcat_x() draws it; it renders alone with: python3 notes/diagram-pngs.py tailcat-x
#
# Needs Python Playwright with Chromium (pip install playwright; playwright install chromium);
# CHROMIUM=/path/to/chrome overrides the browser. Fonts download once into notes/og/.fonts/,
# shared with notes/og/cards.py, and are embedded so no system font stands in.
import base64
import math
import os
import random
import re
import sys
import urllib.request
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path.cwd()
IMG = ROOT / "public/img"
FONTS = ROOT / "notes/og/.fonts"
GOOGLE_FONTS = "https://raw.githubusercontent.com/google/fonts/bd8f81ddb5c74d5c8897b36ad88b440266245103/ofl"
FONT_FILES = {
    "ShantellSans.ttf": "shantellsans/ShantellSans%5BBNCE,INFM,SPAC,wght%5D.ttf",
    "DMSans.ttf": "dmsans/DMSans%5Bopsz,wght%5D.ttf",
    "DMMono-Medium.ttf": "dmmono/DMMono-Medium.ttf",
}
FAMILIES = {"ShantellSans.ttf": "Shantell Sans", "DMSans.ttf": "DM Sans", "DMMono-Medium.ttf": "DM Mono"}
PAGE = "#f5f0e7"
INK = "#183f38"; MUTED = "#6b7f78"; BODY = "#47645e"; SAND = "#f6eadf"; MINT = "#e3efe9"

# name: (left column ends, right column starts, right column width), in viewBox units, or None
# for a single column.
DIAGRAMS = {
    "tailcat": (396, 418, 440),
    "voice": (448, 470, 440),
    "team-sign-in-workos": None,
}


def fonts_css():
    FONTS.mkdir(parents=True, exist_ok=True)
    css = []
    for name, remote in FONT_FILES.items():
        target = FONTS / name
        if not target.exists():
            print(f"downloading {name}")
            target.write_bytes(urllib.request.urlopen(f"{GOOGLE_FONTS}/{remote}").read())
        family = FAMILIES[name]
        data = base64.b64encode(target.read_bytes()).decode()
        css.append(f"@font-face{{font-family:'{family}';src:url(data:font/ttf;base64,{data}) format('truetype');font-weight:100 900}}")
    return "".join(css)


def shoot(browser, head, path, width, height, scale, body):
    page = browser.new_page(viewport={"width": width, "height": height}, device_scale_factor=scale)
    page.set_content(f"<html><head><style>{head}html,body{{margin:0;background:{PAGE}}}svg{{display:block}}</style></head><body>{body}</body></html>")
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(300)
    if not page.evaluate("document.fonts.check(\"16px 'Shantell Sans'\")"):
        raise RuntimeError("Shantell Sans did not load")
    page.screenshot(path=str(path))
    page.close()
    print("wrote", path.relative_to(ROOT))


def export(browser, head, name, split):
    svg = (IMG / f"{name}.svg").read_text()
    w, h = (float(v) for v in re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg).groups())
    pad = 40
    shoot(browser, head, IMG / f"{name}.png", round(w + pad * 2), round(h + pad * 2), 1600 / (w + pad * 2),
          f'<div style="padding:{pad}px">{svg}</div>')
    if split is None:
        return

    def crop(y, cw, ch, scale):
        return re.sub(r'width="[\d.]+" height="[\d.]+" viewBox="[^"]+"',
                      f'width="{cw * scale}" height="{ch * scale}" viewBox="0 {y} {cw} {ch}"', svg, count=1)

    bottom, top, right = split
    margin, gap = 36, 60
    fit = min((1600 - margin * 2) / (w + gap + right), (900 - margin * 2) / max(bottom, h - top))
    shoot(browser, head, IMG / f"{name}-16x9.png", 1600, 900, 1,
          f'<div style="display:flex;align-items:center;justify-content:center;width:1600px;height:900px;gap:{gap * fit}px">'
          f"{crop(0, w, bottom, fit)}{crop(top, right, h - top, fit)}</div>")


# The hand-drawn primitives of notes/blog/tailcat-diagram.py.
random.seed(11)
j = lambda a=1.2: random.uniform(-a, a)


def line(x1, y1, x2, y2, w=1.6, c=INK, a=1.0, dash=None):
    n = max(2, int(abs(x2 - x1) + abs(y2 - y1)) // 40 + 1)
    pts = [(x1 + j(.5), y1 + j(.5))]
    for i in range(1, n):
        t = i / n
        pts.append((x1 + (x2 - x1) * t + j(a), y1 + (y2 - y1) * t + j(a)))
    pts.append((x2 + j(.5), y2 + j(.5)))
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"{da}/>'


def rect(x, y, w, h, sw=1.6, c=INK, fill=None):
    out = []
    if fill:
        out.append(f'<path d="M{x+2} {y+2} L{x+w-1} {y+1} L{x+w-2} {y+h-1} L{x+1} {y+h-2} Z" fill="{fill}"/>')
    out += [line(x, y, x + w + 1, y + j(.6), sw, c), line(x + w, y - 1, x + w + j(.6), y + h + 1, sw, c),
            line(x + w + 1, y + h, x - 1, y + h + j(.6), sw, c), line(x, y + h + 1, x + j(.6), y - 1, sw, c)]
    return "\n".join(out)


def text(x, y, s, size, c=INK, wt=400, anchor="middle", family=None):
    f = f' font-family="{family}"' if family else ""
    s = s.replace("&", "&amp;").replace("'", "&#8217;")
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{wt}" fill="{c}" text-anchor="{anchor}"{f}>{s}</text>'


def arrow(x1, y1, x2, y2, c=INK, w=1.6, dash=None):
    ang = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 9 * math.cos(ang), y2 - 9 * math.sin(ang)
    l = (hx + 5 * math.cos(ang + math.pi / 2), hy + 5 * math.sin(ang + math.pi / 2))
    r = (hx - 5 * math.cos(ang + math.pi / 2), hy - 5 * math.sin(ang + math.pi / 2))
    return line(x1, y1, x2, y2, w, c, .6, dash) + line(l[0], l[1], x2, y2, w, c, .2) + line(r[0], r[1], x2, y2, w, c, .2)


def chip(x, y, w, s, h=30, size=15):
    """A process inside a machine: its name in a thin outline, no fill."""
    return rect(x, y, w, h, 1.2, INK) + "\n" + text(x + w / 2, y + h / 2 + size * .36, s, size, INK, 600)


# github.com/slopus/happy stars, rounded down to whole thousands, shown as "★ 24k": gh api repos/slopus/happy --jq .stargazers_count
GITHUB_STARS = "24k"

# The site header's GitHub mark (src/SiteChrome.tsx), 16 units square.
GITHUB_MARK = "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"


# The Tailscale logo, unmodified: Tailscale_logo_blk_rgb.svg from the media kit linked as
# "Brand Assets" on https://tailscale.com/press
# (https://cdn.sanity.io/files/w77i7m8x/production/a426ba5f63316745e108a18a6dbbfed6970752fd.zip).
# Their brand toolkit asks for at least 48px; it renders 52px tall here. Never recolor or stretch it.
TAILSCALE_LOGO = ROOT / "notes/brand/tailscale-logo-blk-rgb.svg"
# Tailcat's own mark, unmodified: the pixel cat in its README,
# https://github.com/tailscale/tailcat/blob/main/tailcat.png (149x176, BSD-3-Clause), the same
# cat as the @tailcat.dev Bluesky avatar. Scaled whole, never recolored or stretched.
TAILCAT_MARK = ROOT / "notes/brand/tailcat.png"

DESCRIPTOR = "Orchestrate Claude, Codex and Grok in one app"


def star(cx, cy, r):
    """A five-pointed star (★) as a path, so no font has to carry the glyph. Its outline is
    1.81r tall; its centre (cx, cy) sits 0.095r below the middle of that outline."""
    pts = []
    for i in range(10):
        a = math.radians(-90 + 36 * i)
        rr = r if i % 2 == 0 else r * .382
        pts.append(f"{cx + rr * math.cos(a):.2f} {cy + rr * math.sin(a):.2f}")
    return f'<path d="M{" L".join(pts)} Z" fill="{INK}"/>'


def lockup(x, y):
    """The brand lockup, as in the site header: the wordmark, then the GitHub mark and "★ 24k",
    and the descriptor under them, all at the wordmark's cap height (17 units, from y + .6 to its
    baseline at y + 17.4). The icons are centred on that cap band, at y + 9. 204 units wide, 60 tall,
    from its top-left corner."""
    wordmark = (ROOT / "public/brand/happy-engineering-inline-light.svg").read_text()
    wordmark = re.sub(r'width="[\d.]+" height="[\d.]+"', 'width="204" height="23"', wordmark, count=1)
    mid = y + 9
    return "\n".join([
        f'<g transform="translate({x} {y})">{wordmark}</g>',
        f'<path transform="translate({x + 222} {mid - 9}) scale(1.125)" d="{GITHUB_MARK}" fill="{INK}"/>',
        star(x + 259, mid + .095 * 9.3, 9.3),
        text(x + 274, y + 17.4, GITHUB_STARS, 24, INK, 500, "start", "DM Mono"),
        text(x, y + 56, DESCRIPTOR, 24, BODY, 500, "start", "DM Sans"),
    ])


def tailcat_x(browser, head):
    """Tailcat for X, drawn in 800x600 units and rendered at 2x, 1600x1200. On each machine Happy
    Agent runs Tailcat as a child process: `tailcat socks` beside Happy Desktop, `tailcat serve` on
    the server. Text is 17 units or larger so it reads in a phone feed."""
    logo = TAILSCALE_LOGO.read_text()
    logo = re.sub(r"<\?xml[^>]*>\s*", "", logo)
    # The logo's centre on the wordmark's cap band (y 29).
    logo = logo.replace("<svg ", '<svg x="646" y="16" width="134" height="26" ', 1)
    cat = base64.b64encode(TAILCAT_MARK.read_bytes()).decode()
    o = [lockup(20, 20), logo]

    # Tailscale runs the relay; it only forwards.
    o.append(rect(190, 112, 420, 80, 2, INK, MINT))
    o.append(text(400, 145, "Tailcat relay", 28, INK, 700))
    o.append(text(400, 177, "Tailscale DERP · forwards ciphertext only", 19, MUTED))

    # Each machine: Happy Agent, and under it the Tailcat it talks through, on the side facing the
    # other machine.
    chip_w, chip_h = 224, 46
    for bx, title, anchor, cx in ((20, "Happy Desktop", "start", 106), (430, "Your server", "end", 470)):
        o.append(rect(bx, 250, 350, 222, 1.8, INK, SAND))
        o.append(text(bx + 24 if anchor == "start" else bx + 326, 286, title, 25, INK, 700, anchor))
        o.append(chip(cx, 300, chip_w, "Happy Agent", chip_h, 23))
        o.append(chip(cx, 394, chip_w, "Tailcat", chip_h, 23))
        o.append(f'<image x="{cx + 16}" y="397" width="34" height="40.2" href="data:image/png;base64,{cat}"/>')
    o.append(line(218, 348, 218, 392, 1.6, INK, .3))
    o.append(line(582, 378, 582, 392, 1.6, INK, .3))
    o.append(text(470, 370, "Claude · Codex · Grok agents", 18, MUTED, 400, "start"))

    # Both sides dial out to the relay.
    o.append(line(330, 417, 350, 417, 2, INK, .3))
    o.append(arrow(350, 417, 350, 198, INK, 2))
    o.append(line(470, 417, 450, 417, 2, INK, .3))
    o.append(arrow(450, 417, 450, 198, INK, 2))
    # The direct path, Tailcat to Tailcat.
    o.append(line(218, 442, 218, 498, 2, INK, .4, "8 7"))
    o.append(line(218, 498, 582, 498, 2, INK, .6, "8 7"))
    o.append(line(582, 498, 582, 442, 2, INK, .4, "8 7"))
    o.append(text(400, 528, "direct WireGuard (UDP) when NAT allows", 20, MUTED))

    o.append(text(400, 578, "No open ports · no public IP · no Tailscale account", 27, INK, 700))

    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" '
           "font-family=\"'Shantell Sans', cursive\">" + "\n".join(o) + "</svg>")
    shoot(browser, head, IMG / "tailcat-x.png", 800, 600, 2, svg)


def main():
    head = fonts_css()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ.get("CHROMIUM") or None)
        only = sys.argv[1:]
        for name, split in DIAGRAMS.items():
            if not only or name in only:
                export(browser, head, name, split)
        if not only or "tailcat-x" in only:
            tailcat_x(browser, head)
        browser.close()


main()
