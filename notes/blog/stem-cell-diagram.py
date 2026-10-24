# Writes public/img/stem-cell-doors.svg, the before-and-after diagram on /stem-cell/: six ways
# to start, each asking what the work is first, against one stem cell that finds out from what
# you say. Hand-drawn primitives from notes/guides/workos-diagram.py; transparent, no frame.
# Run from the repository root: python3 notes/blog/stem-cell-diagram.py
import math
import random

random.seed(23)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"
SAND = "#f6eadf"; MINT = "#e3efe9"; PINK = "#f6d3e4"
W, H = 520, 520
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
# Before: six doors, each one a decision made before a word is said.
o.append(text(8, 26, "Before: decide what it is, then start", 20, INK, 700))
doors = ["New task", "New tab", "New chat", "New bot", "New document", "New todo list"]
for i, label in enumerate(doors):
    x, y = 8 + (i % 3) * 172, 50 + (i // 3) * 74
    o.append(rect(x, y, 160, 52, 1.5, INK, SAND))
    o.append(text(x + 80, y + 33, label, 18, INK, 400, "middle"))
o.append(text(8, 222, "Each one is a kind of thing. You pick before", 18, MUTED))
o.append(text(8, 248, "you have said a word about the work.", 18, MUTED))

o.append(line(8, 280, 512, 280, 1.2, MUTED, .4, "3 7"))

# Now: one cell, a sentence, and the work becomes what it is.
o.append(text(8, 320, "Now: start, then say what it is", 20, INK, 700))
o.append(blob(52, 384, 30, INK, 1.6, PINK))
o.append(blob(52, 384, 9, INK, 1.2, "#e9a2c2"))
o.append(text(52, 440, "New", 18, MUTED, 700, "middle"))
o.append(arrow(98, 384, 186, 384, INK))
o.append(text(142, 366, "say it", 18, ACC, 700, "middle"))
o.append(rect(198, 356, 314, 56, 1.5, INK, MINT))
o.append(blob(228, 384, 15, INK, 1.4, "#d9806b"))
o.append(text(254, 391, "PostHog alerts", 20, INK, 700))
o.append(text(198, 440, "named, with an icon, filed later", 18, MUTED))
o.append(text(8, 484, "One button and one input box. The work", 18, MUTED))
o.append(text(8, 510, "takes its name, icon and place from you.", 18, MUTED))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
       + "\n".join(o) + "\n</svg>\n")
open("public/img/stem-cell-doors.svg", "w").write(svg)
