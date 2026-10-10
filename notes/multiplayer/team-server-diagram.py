# Writes public/multiplayer/team-server.svg, the Multiplayer & Teams diagram, in the hand-drawn
# style of public/thesis/layout.svg (same primitives as notes/thesis/drafts/wireframe-sketch-generator.py).
# Run from the repository root: python3 notes/multiplayer/team-server-diagram.py
import math
import random

random.seed(11)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"; PAPER = "#fffdf8"
SAND = "#f6eadf"; STONE = "#efe9dc"; MINT = "#e3efe9"
W, H = 520, 1010
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

# Members
o.append(text(20, 38, "Members", 20, INK, 700))
o.append(text(W - 20, 38, "each with their own sign-in", 15, MUTED, 400, "end"))
for i, name in enumerate(["Ana", "Ben", "Chi"]):
    x = 16 + i * 166
    o.append(rect(x, 54, 156, 96, 1.6, INK, SAND))
    o.append(face(x + 26, 80))
    o.append(text(x + 48, 87, name, 18, INK, 700))
    o.append(laptop(x + 12, 108)); o.append(text(x + 13, 140, "Desktop", 14))
    o.append(phone(x + 112, 106)); o.append(text(x + 118, 140, "Phone", 14, INK, 400, "middle"))

# Desktop goes over Tailcat; phones sync through their own end-to-end encrypted path.
o.append(line(41, 172, 373, 172, 1.6, INK, .5))
o.append(line(134, 188, 466, 188, 1.4, MUTED, .5, "5 5"))
for i in range(3):
    x = 16 + i * 166
    o.append(line(x + 25, 154, x + 25, 172, 1.6, INK, .3))
    o.append(line(x + 118, 154, x + 118, 188, 1.4, MUTED, .3, "5 5"))
o.append(arrow(240, 172, 240, 214, INK))
o.append(arrow(417, 188, 417, 214, MUTED, 1.4, "5 5"))
o.append(text(24, 205, "Happy Social sign-in", 14, INK, 700))

o.append(rect(16, 218, 300, 96, 1.8, INK, MINT))
o.append(lock(30, 230))
o.append(text(56, 245, "Tailcat", 18, INK, 700))
o.append(text(30, 270, "Encrypted, through NAT,", 15))
o.append(text(30, 288, "outbound only. Carries requests;", 15))
o.append(text(30, 306, "does not let anyone in.", 15, MUTED))

o.append(rect(330, 218, 174, 96, 1.6, MUTED, STONE, "5 5"))
o.append(text(344, 245, "Phone sync", 18, INK, 700))
o.append(text(344, 270, "End-to-end", 15))
o.append(text(344, 288, "encrypted. Each", 15))
o.append(text(344, 306, "pairs their own.", 15, MUTED))

o.append(arrow(166, 318, 166, 360, INK))
o.append(arrow(417, 318, 417, 360, MUTED, 1.4, "5 5"))

# The team server
o.append(rect(8, 364, 504, 634, 2, INK))
o.append(rect(8, 364, 504, 50, 2, INK, INK))
o.append(text(26, 395, "Team server: one Happy Agent", 18, PAPER, 700))

# 1. The authentication boundary
o.append(rect(24, 430, 472, 76, 1.6, ACC, "#fbe6dc"))
o.append(lock(40, 444, ACC))
o.append(text(68, 460, "Checks every request", 17, INK, 700))
o.append(text(40, 490, "Happy Social token for this team, or 401.", 15))

# 2. What members share
o.append(text(24, 540, "Shared by all members", 17, INK, 700))
for k, label in enumerate(["Projects", "Sessions", "Tasks"]):
    x = 24 + k * 160
    o.append(rect(x, 554, 150, 38, 1.4, INK, SAND))
    o.append(text(x + 75, 579, label, 15, INK, 400, "middle"))
o.append(text(24, 616, "The agent is told who sent each message.", 15))
o.append(text(24, 636, "Drafts and task order stay per person.", 15, MUTED))

# 3. Provider credentials
o.append(key(24, 662))
o.append(text(62, 675, "Service account", 17, INK, 700))
o.append(text(24, 702, "Claude, Codex, and Grok sign-ins live here.", 15))
o.append(text(24, 722, "Every member's work spends these accounts.", 15, MUTED))

# 4. The sandbox and review boundary
o.append(rect(24, 746, 472, 236, 1.6, INK, None, "7 5"))
o.append(text(40, 774, "Every command runs under", 17, INK, 700))
o.append(text(40, 795, "the OS sandbox and Auto review", 17, INK, 700))
o.append(text(40, 820, "Each member picks a session's mode:", 15, MUTED))
modes = [("Read only", STONE, INK, None), ("Workspace write", STONE, INK, None),
         ("Auto", MINT, INK, "default"), ("Full access", "#fbe6dc", ACC, "no sandbox")]
for k, (label, fill, color, note) in enumerate(modes):
    x = 40 + (k % 2) * 224
    y = 834 + (k // 2) * 54
    o.append(rect(x, y, 216, 42, 2.2 if label == "Auto" else 1.5, color, fill))
    o.append(text(x + 14, y + 27, label, 15, color, 700 if label == "Auto" else 400))
    if note:
        o.append(text(x + 202, y + 27, note, 13, ACC if color == ACC else MUTED, 400, "end"))
o.append(text(40, 960, "Crossings are reviewed one action at a time.", 15))
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
       + "\n".join(o) + "\n</svg>\n")
open("public/multiplayer/team-server.svg", "w").write(svg)
