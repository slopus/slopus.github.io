# Writes the diagrams as PNGs for posting on X, which takes no SVG. Run from the repository root
# after changing a diagram's generator:
#   python3 notes/diagram-pngs.py
#
# - public/img/<name>.png: the diagram 1600px wide, on the page colour, with a 40-unit margin.
# - public/img/<name>-16x9.png: 1600x900. A tall diagram is laid out in two columns, its sequence
#   on the left and its notes on the right, so the text stays readable as a thumbnail.
# - public/img/tailcat-x.png: a simpler Tailcat picture for the post, with the brand lockup.
#
# Needs Python Playwright with Chromium (pip install playwright; playwright install chromium);
# CHROMIUM=/path/to/chrome overrides the browser. Fonts download once into notes/og/.fonts/,
# shared with notes/og/cards.py, and are embedded so no system font stands in.
import base64
import math
import os
import random
import re
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
}
PAGE = "#f5f0e7"
INK = "#183f38"; MUTED = "#6b7f78"; SAND = "#f6eadf"; MINT = "#e3efe9"

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
        family = "Shantell Sans" if name.startswith("Shantell") else "DM Sans"
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


def tailcat_x(browser, head):
    """Tailcat for X, drawn in 800x450 units and rendered at 2x: three boxes, three paths, one line of claims."""
    wordmark = (ROOT / "public/brand/happy-engineering-inline-light.svg").read_text()
    wordmark = re.sub(r'width="[\d.]+" height="[\d.]+"', 'width="151" height="17"', wordmark, count=1)
    o = []
    o.append(f'<g transform="translate(40 26)">{wordmark}</g>')
    o.append(text(40, 60, "Open-source harness for Claude, Codex & Grok agents", 11.5, MUTED, 500, "start", "DM Sans"))

    o.append(rect(320, 146, 160, 44, 1.8, INK, MINT))
    o.append(text(400, 175, "Relay", 20, INK, 700))
    o.append(text(400, 214, "forwards ciphertext only", 15, MUTED))

    o.append(rect(50, 242, 180, 48, 1.6, INK, SAND))
    o.append(text(140, 273, "Happy Desktop", 20, INK, 700))
    o.append(rect(570, 242, 180, 48, 1.6, INK, SAND))
    o.append(text(660, 273, "Your server", 20, INK, 700))
    o.append(text(660, 314, "Claude · Codex · Grok agents", 15, MUTED))

    o.append(arrow(180, 238, 316, 182, INK, 1.6))
    o.append(arrow(484, 182, 620, 238, INK, 1.6))
    o.append(arrow(236, 266, 564, 266, INK, 1.6, "7 6"))
    o.append(text(400, 290, "direct UDP when NAT allows", 15, MUTED))

    o.append(text(400, 378, "No open ports · no public IP · no Tailscale account", 18, INK, 700))
    o.append(text(760, 426, "Powered by Tailscale’s Tailcat", 10.5, MUTED, 500, "end", "DM Sans"))

    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" '
           "font-family=\"'Shantell Sans', cursive\">" + "\n".join(o) + "</svg>")
    shoot(browser, head, IMG / "tailcat-x.png", 800, 450, 2, svg)


def main():
    head = fonts_css()
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ.get("CHROMIUM") or None)
        for name, split in DIAGRAMS.items():
            export(browser, head, name, split)
        tailcat_x(browser, head)
        browser.close()


main()
