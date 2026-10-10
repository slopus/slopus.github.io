# Writes public/img/remote-server-harness.svg, the remote server guide's diagram of a remote control
# beside Happy Agent running the harness, in the hand-drawn style of public/multiplayer/team-server.svg
# (same primitives as notes/multiplayer/team-server-diagram.py).
# Run from the repository root: python3 notes/guides/harness-diagram.py
import math
import random

random.seed(11)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"; PAPER = "#fffdf8"
SAND = "#f6eadf"; STONE = "#efe9dc"; MINT = "#e3efe9"
W, H = 520, 574
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


def circle(cx, cy, r, c=INK, w=1.6, fill="none"):
    pts = []
    for i in range(0, 26):
        t = i / 24 * 2 * math.pi + 0.3
        k = 1 + j(.04)
        pts.append((cx + r * k * math.cos(t), cy + r * k * math.sin(t)))
    d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts)
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'


def text(x, y, s, size=15, c=INK, wt=400, anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    s = s.replace("&", "&amp;")
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{wt}" fill="{c}"{a}>{s}</text>'


def arrow(x1, y1, x2, y2, c=INK, w=1.6, dash=None):
    ang = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 9 * math.cos(ang), y2 - 9 * math.sin(ang)
    l = (hx + 5 * math.cos(ang + math.pi / 2), hy + 5 * math.sin(ang + math.pi / 2))
    r = (hx - 5 * math.cos(ang + math.pi / 2), hy - 5 * math.sin(ang + math.pi / 2))
    return line(x1, y1, x2, y2, w, c, .6, dash) + line(l[0], l[1], x2, y2, w, c, .2) + line(r[0], r[1], x2, y2, w, c, .2)


def face(cx, cy, r=13):
    return (circle(cx, cy, r) + circle(cx - r * .33, cy - r * .18, 1, w=2) + circle(cx + r * .33, cy - r * .18, 1, w=2)
            + line(cx - r * .4, cy + r * .3, cx, cy + r * .45, 1.3) + line(cx, cy + r * .45, cx + r * .4, cy + r * .3, 1.3))


def laptop(x, y):
    return rect(x + 3, y, 20, 13, 1.3) + line(x, y + 16, x + 26, y + 16, 1.5)


def phone(x, y):
    return rect(x, y, 11, 18, 1.3) + line(x + 4, y + 15, x + 7, y + 15, 1.2)


def lock(x, y, c=INK):
    return rect(x, y + 8, 16, 12, 1.4, c) + line(x + 3, y + 8, x + 3, y + 3, 1.4, c) + line(x + 3, y + 3, x + 8, y, 1.4, c) + line(x + 8, y, x + 13, y + 3, 1.4, c) + line(x + 13, y + 3, x + 13, y + 8, 1.4, c)


def key(x, y):
    return circle(x + 6, y + 8, 6) + line(x + 12, y + 8, x + 28, y + 8, 1.5) + line(x + 23, y + 8, x + 23, y + 13, 1.4) + line(x + 27, y + 8, x + 27, y + 12, 1.4)


# Transparent, with no frame or nested boxes: each half is a heading, one row of shapes, and a note.
o = []

# Text is at least 18 units: about 12px when a phone shrinks this to 350px.
# 1. A remote control: the vendor's own harness keeps running in a terminal on your computer.
o.append(text(8, 30, "A remote control", 22, INK, 700))
o.append(text(8, 56, "Claude Remote Control, or the original Happy CLI", 18, MUTED))
o.append(rect(8, 78, 96, 74, 1.5, INK, SAND))
o.append(phone(51, 88))
o.append(text(56, 138, "Phone", 18, INK, 700, "middle"))
o.append(arrow(108, 115, 140, 115, MUTED, 1.4, "5 5"))
o.append(rect(144, 78, 96, 74, 1.5, MUTED, STONE, "5 5"))
o.append(text(192, 121, "Relay", 20, INK, 700, "middle"))
o.append(arrow(244, 115, 276, 115, MUTED, 1.4, "5 5"))
o.append(rect(280, 78, 232, 74, 1.5, INK, SAND))
o.append(laptop(294, 90))
o.append(text(328, 106, "Your laptop", 20, INK, 700))
o.append(text(294, 138, "claude in a terminal", 18))
o.append(text(8, 184, "Only while your computer stays on", 18, MUTED))

o.append(line(8, 214, 512, 214, 1.2, MUTED, .4, "3 7"))

# 2. Happy Agent is the harness: it runs the models itself, on a machine that stays on.
o.append(text(8, 256, "Happy Agent runs the harness", 22, INK, 700))
o.append(rect(8, 274, 150, 52, 1.5, INK, SAND))
o.append(laptop(22, 290))
o.append(text(56, 307, "Desktop", 20, INK, 700))
o.append(rect(170, 274, 124, 52, 1.5, INK, SAND))
o.append(phone(184, 286))
o.append(text(206, 307, "Phone", 20, INK, 700))
o.append(arrow(83, 330, 83, 356, INK))
o.append(arrow(232, 330, 232, 356, INK))
o.append(rect(8, 360, 504, 44, 2, INK, INK))
o.append(text(24, 389, "Your server: Happy Agent", 20, PAPER, 700))
o.append(text(8, 436, "Its own loop, tools, sandbox, review", 18))
for x, w, label in [(8, 204, "Claude Agent SDK"), (222, 136, "Codex"), (368, 144, "Grok")]:
    o.append(rect(x, 452, w, 44, 1.4, INK, MINT))
    o.append(text(x + w / 2, 480, label, 18, INK, 700, "middle"))
o.append(text(8, 524, "On the subscriptions you have", 18, MUTED))
o.append(text(8, 562, "Keeps working while your laptop sleeps", 18, INK, 700))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
       + "\n".join(o) + "\n</svg>\n")
open("public/img/remote-server-harness.svg", "w").write(svg)
