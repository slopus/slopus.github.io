# Writes public/img/secrets.svg, the diagram on /secrets/: how a secret reaches a command, in the
# hand-drawn style of notes/guides/workos-diagram.py (same primitives). Transparent, with no frame or
# nested boxes. Lifelines are drawn in segments that stop short of any label they would cross.
# Run from the repository root: python3 notes/features/secrets-diagram.py
import math
import random

random.seed(23)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"; PAPER = "#fffdf8"
SAND = "#f6eadf"; STONE = "#efe9dc"; MINT = "#e3efe9"
W, H = 520, 548
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


def rect(x, y, w, h, sw=1.6, c=INK, fill=None, dash=None):
    out = []
    if fill:
        out.append(f'<path d="M{x+2} {y+2} L{x+w-1} {y+1} L{x+w-2} {y+h-1} L{x+1} {y+h-2} Z" fill="{fill}"/>')
    out += [line(x, y, x + w + 1, y + j(.6), sw, c, dash=dash), line(x + w, y - 1, x + w + j(.6), y + h + 1, sw, c, dash=dash),
            line(x + w + 1, y + h, x - 1, y + h + j(.6), sw, c, dash=dash), line(x, y + h + 1, x + j(.6), y - 1, sw, c, dash=dash)]
    return "\n".join(out)


def text(x, y, s, size=15, c=INK, wt=400, anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    s = s.replace("&", "&amp;").replace("<", "&lt;")
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{wt}" fill="{c}"{a}>{s}</text>'


def arrow(x1, y1, x2, y2, c=INK, w=1.6, dash=None):
    ang = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 9 * math.cos(ang), y2 - 9 * math.sin(ang)
    l = (hx + 5 * math.cos(ang + math.pi / 2), hy + 5 * math.sin(ang + math.pi / 2))
    r = (hx - 5 * math.cos(ang + math.pi / 2), hy - 5 * math.sin(ang + math.pi / 2))
    return line(x1, y1, x2, y2, w, c, .6, dash) + line(l[0], l[1], x2, y2, w, c, .2) + line(r[0], r[1], x2, y2, w, c, .2)


labels = []  # (x1, y1, x2, y2): each label's extent, which lifelines keep clear of


def label(x, y, s, size=18, c=INK, wt=400):
    """Text that lifelines stop short of. The width is an estimate for the handwritten face."""
    labels.append((x - 6, y - size, x + 0.62 * size * len(s) + 6, y + 6))
    return text(x, y, s, size, c, wt)


def lifeline(x, y1, y2):
    """A dashed lifeline drawn in segments, skipping every label whose extent spans x."""
    out, y = [], y1
    for a, b in sorted((a, b) for (x1, a, x2, b) in labels if x1 <= x <= x2):
        if a > y:
            out.append(line(x, y, x, min(a, y2), 1.2, MUTED, .3, "3 6"))
        y = max(y, b)
    if y < y2:
        out.append(line(x, y, x, y2, 1.2, MUTED, .3, "3 6"))
    return "\n".join(out)


o = []
# Text is at least 18 units: about 12px when a phone shrinks this to 350px.
AGT, CAT, CMD = 78, 270, 446
o.append(rect(8, 8, 140, 44, 1.5, INK, SAND))
o.append(text(AGT, 37, "Agent", 18, INK, 700, "middle"))
o.append(rect(194, 8, 152, 44, 1.8, INK, MINT))
o.append(text(CAT, 37, "Secret catalog", 18, INK, 700, "middle"))
o.append(rect(380, 8, 132, 44, 1.5, INK, SAND))
o.append(text(CMD, 37, "Command", 18, INK, 700, "middle"))

# 1. The value enters once: inline in a reviewed call, or read by the daemon from a host .env file.
o.append(label(AGT + 10, 92, "1  create_secret", 18, INK, 700))
o.append(arrow(AGT, 102, CAT, 102, INK))
o.append(label(AGT + 10, 126, "inline, or from an absolute .env path", 18, MUTED))

# 2. Metadata comes back; never a value.
o.append(label(AGT + 10, 166, "2  ID and variable names", 18, INK, 700))
o.append(arrow(CAT, 176, AGT, 176, INK))
o.append(label(AGT + 10, 200, "never the values", 18, MUTED))

# 3. A grant: the agent attaches to itself; a client grants a project or workspace.
o.append(label(AGT + 10, 240, "3  attach_secret to this agent", 18, INK, 700))
o.append(arrow(AGT, 250, CAT, 250, INK))
o.append(label(AGT + 10, 274, "or a project or workspace, in the app", 18, MUTED))

# 4. A command names only the bundles it needs.
o.append(label(AGT + 10, 314, '4  Bash, secrets: ["stripe"]', 18, INK, 700))
o.append(arrow(AGT, 324, CMD, 324, INK))
o.append(label(AGT + 10, 348, "reviewed, still sandboxed", 18, MUTED))

# 5. The catalog puts the values into a fresh shell's environment.
o.append(label(CAT + 10, 388, "5  Values as env vars", 18, INK, 700))
o.append(arrow(CAT, 398, CMD, 398, INK))
o.append(label(CAT + 10, 422, "in a fresh shell", 18, MUTED))

for x in (AGT, CAT, CMD):
    o.append(lifeline(x, 56, 440))

o.append(line(8, 466, 512, 466, 1.2, MUTED, .4, "3 7"))
o.append(text(8, 502, "Values never return to the model", 20, INK, 700))
o.append(text(8, 530, "Kept on your machine in SQLite, mode 0600", 18, MUTED))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
       + "\n".join(o) + "\n</svg>\n")
open("public/img/secrets.svg", "w").write(svg)
