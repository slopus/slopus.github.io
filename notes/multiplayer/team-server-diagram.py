# Writes public/multiplayer/team-server.svg, the Multiplayer & Teams diagram, in the hand-drawn
# style of public/thesis/layout.svg (same primitives as notes/thesis/drafts/wireframe-sketch-generator.py).
# Run from the repository root: python3 notes/multiplayer/team-server-diagram.py
import math
import random

random.seed(11)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"; PAPER = "#fffdf8"
SAND = "#f6eadf"; STONE = "#efe9dc"; MINT = "#e3efe9"
W, H = 520, 696
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


o = [f'<rect x="0" y="0" width="{W}" height="{H}" rx="12" fill="{PAPER}"/>']

# The core picture only; relays, drafts, and the mode details live in the page text below it.
# Text is at least 18 units: about 12px when a phone shrinks this to 350px.
o.append(text(16, 36, "Members", 24, INK, 700))
for i, name in enumerate(["Ana", "Ben", "Chi"]):
    x = 12 + i * 168
    o.append(rect(x, 50, 160, 64, 1.6, INK, SAND))
    o.append(face(x + 26, 82))
    o.append(text(x + 48, 89, name, 20, INK, 700))
    o.append(laptop(x + 94, 72))
    o.append(phone(x + 134, 70))

# Desktop over Tailcat (solid); phones through Happy's relay (dashed).
o.append(line(119, 132, 455, 132, 1.6, INK, .5))
o.append(line(151, 146, 487, 146, 1.4, MUTED, .5, "5 5"))
for i in range(3):
    x = 12 + i * 168
    o.append(line(x + 107, 118, x + 107, 132, 1.6, INK, .3))
    o.append(line(x + 139, 118, x + 139, 146, 1.4, MUTED, .3, "5 5"))
o.append(arrow(150, 132, 150, 170, INK))
o.append(arrow(420, 146, 420, 170, MUTED, 1.4, "5 5"))

o.append(rect(12, 174, 316, 84, 1.8, INK, MINT))
o.append(lock(26, 186))
o.append(text(52, 202, "Desktop: Tailcat", 20, INK, 700))
o.append(text(26, 232, "Encrypted connection,", 18))
o.append(text(26, 252, "no open ports", 18))

o.append(rect(340, 174, 168, 84, 1.6, MUTED, STONE, "5 5"))
o.append(text(354, 202, "Phone", 20, INK, 700))
o.append(text(354, 232, "End-to-end", 18))
o.append(text(354, 252, "encrypted", 18))

o.append(arrow(170, 262, 170, 296, INK))
o.append(arrow(424, 262, 424, 296, MUTED, 1.4, "5 5"))

# The team server
o.append(rect(6, 300, 508, 384, 2, INK))
o.append(rect(6, 300, 508, 48, 2, INK, INK))
o.append(text(22, 331, "Team server: one Happy Agent", 22, PAPER, 700))

# 1. The sign-in gate
o.append(rect(20, 362, 480, 52, 1.6, INK, MINT))
o.append(lock(34, 375))
o.append(text(62, 395, "Only this team's sign-ins get in", 18, INK, 700))

# 2. Shared work
o.append(text(20, 446, "Shared by all members", 20, INK, 700))
for k, label in enumerate(["Projects", "Sessions", "Tasks"]):
    x = 20 + k * 162
    o.append(rect(x, 458, 154, 40, 1.4, INK, SAND))
    o.append(text(x + 77, 484, label, 18, INK, 400, "middle"))

# 3. Permission modes: the sandbox holds three of them; Full access sits outside it.
o.append(rect(20, 518, 330, 150, 1.6, INK, None, "7 5"))
o.append(text(34, 544, "OS sandbox", 20, INK, 700))
o.append(rect(34, 556, 116, 42, 1.5, INK, STONE))
o.append(text(92, 583, "Read only", 18, INK, 400, "middle"))
o.append(rect(158, 556, 178, 42, 1.5, INK, STONE))
o.append(text(247, 583, "Workspace write", 18, INK, 400, "middle"))
o.append(rect(34, 610, 302, 46, 2.2, INK, MINT))
o.append(text(48, 639, "Auto", 18, INK, 700))
o.append(text(98, 639, "reviews each crossing", 18, MUTED))

o.append(rect(362, 556, 138, 100, 1.6, ACC, "#fbe6dc"))
o.append(text(431, 596, "Full access", 18, ACC, 700, "middle"))
o.append(text(431, 624, "no sandbox", 18, ACC, 400, "middle"))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
       + "\n".join(o) + "\n</svg>\n")
open("public/multiplayer/team-server.svg", "w").write(svg)
