# Generates public/thesis/buttons.svg. Run from the repo root: python3 notes/thesis/drafts/buttons-chart.py
# Draws public/thesis/buttons.svg: static buttons in apps over time, falling toward zero,
# with a "we are here" marker. Same hand-drawn style and palette as public/thesis/layout.svg
# (see notes/thesis/drafts/wireframe-sketch-generator.py). Illustrative: no numbers, no years.
# Labels are 19px+ in a 520-wide viewBox, so at a 350px phone column they render at 12.8px+.
import math
import random

random.seed(11)
INK = "#183f38"
MUTED = "#6b7f78"
ACC = "#e6522c"
W, H = 520, 320
FONT = "'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive"


def j(a=1.2):
    return random.uniform(-a, a)


def path(pts, w=1.8, c=INK, dash=None):
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    da = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"{da}/>'


def line(x1, y1, x2, y2, w=1.8, c=INK, a=1.0, dash=None):
    n = max(2, int(abs(x2 - x1) + abs(y2 - y1)) // 40 + 1)
    pts = [(x1 + j(.5), y1 + j(.5))]
    for i in range(1, n):
        t = i / n
        pts.append((x1 + (x2 - x1) * t + j(a), y1 + (y2 - y1) * t + j(a)))
    pts.append((x2 + j(.5), y2 + j(.5)))
    return path(pts, w, c, dash)


def rect(x, y, w, h, sw=1.8, c=INK):
    return "\n".join([
        line(x, y, x + w + 1, y + j(.6), sw, c),
        line(x + w, y - 1, x + w + j(.6), y + h + 1, sw, c),
        line(x + w + 1, y + h, x - 1, y + h + j(.6), sw, c),
        line(x, y + h + 1, x + j(.6), y - 1, sw, c),
    ])


def text(x, y, s, size=19, c=INK, wt=400, anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{wt}" fill="{c}"{a}>{s}</text>'


def arrowhead(x, y, dx, dy, size=9, w=1.8, c=INK):
    """Two strokes meeting at (x, y); (dx, dy) is the unit direction the arrow points."""
    px, py = -dy, dx
    return (line(x - dx * size + px * size * .6, y - dy * size + py * size * .6, x, y, w, c)
            + "\n" + line(x - dx * size - px * size * .6, y - dy * size - py * size * .6, x, y, w, c))


# Axes: origin bottom-left, both arrows.
OX, OY = 72, 252
TOP, RIGHT = 52, 484


def curve_y(t):
    # A logistic decline: slow at first, fast in the middle, flattening out at zero.
    return OY - 176 / (1 + math.exp(7 * (t - .5)))


X0, X1 = 86, 472
o = []
o.append(f'<rect x="0" y="0" width="{W}" height="{H}" rx="12" fill="#fffdf8"/>')
o.append(rect(4, 4, W - 8, H - 8, 1.8))
o.append(line(OX, OY, OX, TOP, 1.8))
o.append(arrowhead(OX, TOP, 0, -1))
o.append(line(OX, OY, RIGHT, OY, 1.8))
o.append(arrowhead(RIGHT, OY, 1, 0))
o.append(text(86, 50, "static buttons in apps", 19, INK, 700))
o.append(text(RIGHT, 278, "time", 19, MUTED, 400, "end"))
o.append(text(60, 258, "0", 19, MUTED, 400, "end"))

pts = []
for i in range(41):
    t = i / 40
    pts.append((X0 + (X1 - X0) * t + j(.6), curve_y(t) + j(.9)))
o.append(path(pts, 2.4))

# We are here: a dot on the steep part of the drop, a drop line to the axis, and the label beside it.
T = .45
MX, MY = X0 + (X1 - X0) * T, curve_y(T)
o.append(line(MX, MY + 11, MX, OY - 3, 1.4, MUTED, .6, "4 5"))
o.append(f'<circle cx="{MX:.1f}" cy="{MY:.1f}" r="6" fill="{ACC}"/>')
o.append(text(round(MX + 16), round(MY - 8), "we are here", 20, ACC, 700))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="{FONT}">\n'
       + "\n".join(o) + "\n</svg>\n")
open("public/thesis/buttons.svg", "w").write(svg)
print(f"wrote public/thesis/buttons.svg ({len(svg)} bytes)")
