# Writes public/img/voice.svg, the voice diagram on /voice/, in the hand-drawn
# style of public/img/team-sign-in-workos.svg (same primitives as notes/guides/workos-diagram.py).
# Transparent, with no frame or nested boxes. Text is at least 18 units: about 12px at a phone's 350px.
# Run from the repository root: python3 notes/blog/voice-diagram.py
import math
import random

random.seed(5)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"; PAPER = "#fffdf8"
SAND = "#f6eadf"; STONE = "#efe9dc"; MINT = "#e3efe9"
W, H = 520, 676
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


def head(x1, y1, x2, y2, c, w):
    ang = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 9 * math.cos(ang), y2 - 9 * math.sin(ang)
    l = (hx + 5 * math.cos(ang + math.pi / 2), hy + 5 * math.sin(ang + math.pi / 2))
    r = (hx - 5 * math.cos(ang + math.pi / 2), hy - 5 * math.sin(ang + math.pi / 2))
    return line(l[0], l[1], x2, y2, w, c, .2) + line(r[0], r[1], x2, y2, w, c, .2)


def arrow(x1, y1, x2, y2, c=INK, w=1.6, dash=None):
    return line(x1, y1, x2, y2, w, c, .6, dash) + head(x1, y1, x2, y2, c, w)


def darrow(x1, y1, x2, y2, c=INK, w=1.6):
    return line(x1, y1, x2, y2, w, c, .6) + head(x1, y1, x2, y2, c, w) + head(x2, y2, x1, y1, c, w)


def mic(x, y, c=INK):
    return (rect(x + 4, y, 8, 14, 1.4, c) + line(x, y + 10, x, y + 14, 1.4, c) + line(x, y + 14, x + 8, y + 20, 1.4, c)
            + line(x + 8, y + 20, x + 16, y + 14, 1.4, c) + line(x + 16, y + 14, x + 16, y + 10, 1.4, c)
            + line(x + 8, y + 20, x + 8, y + 26, 1.4, c) + line(x + 3, y + 26, x + 13, y + 26, 1.4, c))


o = []
# Text is at least 18 units: about 12px when a phone shrinks this to 350px.
APP, HS, EL = 78, 260, 442
o.append(rect(8, 8, 140, 44, 1.5, INK, SAND))
o.append(text(APP, 37, "Phone app", 18, INK, 700, "middle"))
o.append(rect(190, 8, 140, 44, 1.5, INK, SAND))
o.append(text(HS, 37, "Happy server", 18, INK, 700, "middle"))
o.append(rect(372, 8, 140, 44, 1.8, INK, MINT))
o.append(text(EL, 37, "ElevenLabs", 20, INK, 700, "middle"))

# Labels between the lifelines, with their extents, so a lifeline breaks instead of crossing one.
rows = []


def label(x, y, s, size=18, c=INK, wt=400):
    per = size * (0.56 if wt >= 700 else 0.52)
    rows.append((x - 3, x + per * len(s) + 3, y - size * 0.8 - 6, y + size * 0.28 + 6))
    return text(x, y, s, size, c, wt)


def lifeline(x, y1, y2):
    out, start = [], y1
    for y0, yb in sorted((y0, yb) for x0, x1, y0, yb in rows if x0 <= x <= x1):
        # A stub shorter than a dash or two between rows reads as a strike through the text: skip it.
        if y0 > start + 14:
            out.append(line(x, start, x, y0, 1.2, MUTED, .3, "3 6"))
        start = max(start, yb)
    if y2 > start + 14:
        out.append(line(x, start, x, y2, 1.2, MUTED, .3, "3 6"))
    return "\n".join(out)


# 1. The app asks Happy's server for a conversation.
o.append(label(APP + 10, 92, "1  Tap the mic", 18, INK, 700))
o.append(mic(APP + 150, 76))
o.append(arrow(APP, 102, HS, 102, INK))
o.append(label(APP + 10, 126, "with your Happy sign-in", 18, MUTED))

# 2. The server reads usage from ElevenLabs and mints a token there.
o.append(label(APP + 10, 160, "2  Minutes used? Then a token", 18, INK, 700))
o.append(arrow(HS, 170, EL, 170, INK))
o.append(arrow(EL, 196, HS, 196, INK))
o.append(label(APP + 10, 220, "user id is a one-way hash, no voice DB", 18, MUTED))

# 3. The token comes back, or the paywall.
o.append(label(APP + 10, 256, "3  Token, or the paywall", 18, INK, 700))
o.append(arrow(HS, 266, APP, 266, INK))

# 4. Audio runs between the phone and ElevenLabs; the server is out of the loop.
o.append(label(APP + 10, 302, "4  WebRTC: your voice, its voice", 18, INK, 700))
o.append(darrow(APP, 312, EL, 312, INK))
o.append(label(APP + 10, 336, "plus the session's recent messages", 18, MUTED))
for x in (APP, HS, EL):
    o.append(lifeline(x, 56, 346))

# 5. What you asked for goes to the coding agent on your computer.
o.append(arrow(APP, 350, APP, 392, INK))
o.append(text(100, 376, "5  On to the coding agent", 20, INK, 700))
o.append(rect(8, 396, 140, 44, 1.5, INK, SAND))
o.append(text(APP, 425, "Coding agent", 18, INK, 700, "middle"))
o.append(text(160, 424, "your request, allow, or deny", 18, MUTED))

o.append(line(8, 462, 512, 462, 1.2, MUTED, .4, "3 7"))
o.append(text(8, 498, "What ElevenLabs hears", 20, INK, 700))
o.append(text(8, 526, "your voice, the session list, recent chat,", 18))
o.append(text(8, 552, "permission requests with their arguments", 18))

o.append(line(8, 574, 512, 574, 1.2, MUTED, .4, "3 7"))
o.append(text(8, 606, "Limits per 30 days", 20, INK, 700))
o.append(text(8, 634, "20 minutes free, 5 hours with a subscription", 18))
o.append(text(8, 660, "your own ElevenLabs agent: no limit from Happy", 18, MUTED))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
       + "\n".join(o) + "\n</svg>\n")
open("public/img/voice.svg", "w").write(svg)
