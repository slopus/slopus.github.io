# Writes public/img/stem-cell-filing.svg, the filing diagram on /stem-cell/: named rows wait right
# below Happy; once you step away, Prioritizing moves each next to related work and adds a section
# only where several rows share a subject no section fits. Hand-drawn primitives from
# notes/guides/workos-diagram.py; transparent, no frame.
# Run from the repository root: python3 notes/blog/stem-cell-filing-diagram.py
import math
import random

random.seed(23)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"
SAND = "#f6eadf"; MINT = "#e3efe9"; PINK = "#f6d3e4"
W, H = 520, 470
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


def blob(cx, cy, r, c=INK, w=1.6, fill="none"):
    """A cell: a wobbly circle."""
    pts = []
    for i in range(0, 26):
        t = i / 24 * 2 * math.pi + 0.3
        k = 1 + .08 * math.sin(3 * t) + j(.03)
        pts.append((cx + r * k * math.cos(t), cy + r * k * math.sin(t)))
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'


def text(x, y, s, size=18, c=INK, wt=400, anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    s = s.replace("&", "&amp;")
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{wt}" fill="{c}"{a}>{s}</text>'


def arrow(x1, y1, x2, y2, c=INK, w=1.6):
    ang = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 9 * math.cos(ang), y2 - 9 * math.sin(ang)
    l = (hx + 5 * math.cos(ang + math.pi / 2), hy + 5 * math.sin(ang + math.pi / 2))
    r = (hx - 5 * math.cos(ang + math.pi / 2), hy - 5 * math.sin(ang + math.pi / 2))
    return line(x1, y1, x2, y2, w, c, .6) + line(l[0], l[1], x2, y2, w, c, .2) + line(r[0], r[1], x2, y2, w, c, .2)



o = []
# Text is at least 18 units: about 12px when a phone shrinks this to 350px.
CLAY = ["#d9806b", "#8fb7a6", "#e3b35c", "#9aa7d6", "#c99ad0", "#7fa9c9", "#d6a07c"]
LEFT, RIGHT = 8, 290


def section(x, y, label, c=INK):
    return text(x, y, label, 18, c, 700)


def row(x, y, label, k, moved=False):
    out = [blob(x + 9, y - 6, 8, INK, 1.2, CLAY[k % len(CLAY)]), text(x + 26, y, label, 18, INK)]
    if moved:
        out.append(line(x - 10, y - 14, x - 10, y + 2, 2.4, ACC, .2))
    return "\n".join(out)


o.append(text(LEFT, 24, "New work lands here", 20, INK, 700))
o.append(text(RIGHT, 24, "Once you step away", 20, INK, 700))

# Before: four named rows waiting right below Happy, at its level, above the sections.
o.append(row(LEFT, 70, "Happy", 1))
for i, label in enumerate(["PostHog alerts", "Signup funnel", "Fix login bug", "Q4 board deck"]):
    o.append(row(LEFT, 104 + i * 32, label, i + 2))
o.append(section(LEFT, 256, "Engineering"))
o.append(row(LEFT + 14, 288, "Auth refactor", 0))
o.append(section(LEFT, 330, "Board"))
o.append(row(LEFT + 14, 362, "Q3 board deck", 6))

o.append(arrow(236, 200, 278, 200, ACC, 1.8))

# After: each row beside related work; one new section for the two analytics rows.
o.append(row(RIGHT, 70, "Happy", 1))
o.append(section(RIGHT, 112, "Engineering"))
o.append(row(RIGHT + 14, 144, "Auth refactor", 0))
o.append(row(RIGHT + 14, 176, "Fix login bug", 4, True))
o.append(section(RIGHT, 218, "Board"))
o.append(row(RIGHT + 14, 250, "Q3 board deck", 6))
o.append(row(RIGHT + 14, 282, "Q4 board deck", 5, True))
o.append(section(RIGHT, 324, "Analytics"))
o.append(text(RIGHT + 96, 324, "new", 18, ACC, 700))
o.append(row(RIGHT + 14, 356, "PostHog alerts", 2, True))
o.append(row(RIGHT + 14, 388, "Signup funnel", 3, True))

o.append(line(8, 418, 512, 418, 1.2, MUTED, .4, "3 7"))
o.append(text(8, 448, "A new section only when rows share a subject", 18, MUTED))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
       + "\n".join(o) + "\n</svg>\n")
open("public/img/stem-cell-filing.svg", "w").write(svg)
