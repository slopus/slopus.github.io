# Writes public/img/tailcat.svg, the Tailcat diagram on /tailcat/, in the
# hand-drawn style of the WorkOS post diagram (same primitives as notes/guides/workos-diagram.py).
# Transparent, with no frame or nested boxes. Text is at least 18 units: about 12px at a phone's 350px.
# Run from the repository root: python3 notes/blog/tailcat-diagram.py
import math
import random

random.seed(7)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"; PAPER = "#fffdf8"
SAND = "#f6eadf"; STONE = "#efe9dc"; MINT = "#e3efe9"
W, H = 520, 590
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


def lock(x, y, c=INK):
    return rect(x, y + 8, 16, 12, 1.4, c) + line(x + 3, y + 8, x + 3, y + 3, 1.4, c) + line(x + 3, y + 3, x + 8, y, 1.4, c) + line(x + 8, y, x + 13, y + 3, 1.4, c) + line(x + 13, y + 3, x + 13, y + 8, 1.4, c)


def key(x, y):
    return circle(x + 6, y + 8, 6) + line(x + 12, y + 8, x + 28, y + 8, 1.5) + line(x + 23, y + 8, x + 23, y + 13, 1.4) + line(x + 27, y + 8, x + 27, y + 12, 1.4)


o = []
# Text is at least 18 units: about 12px when a phone shrinks this to 350px.
DESK, RELAY, SRV = 88, 262, 440
o.append(rect(8, 8, 160, 44, 1.5, INK, SAND))
o.append(text(DESK, 37, "Happy Desktop", 18, INK, 700, "middle"))
o.append(rect(192, 8, 140, 44, 1.8, INK, MINT))
o.append(text(RELAY, 37, "DERP relay", 20, INK, 700, "middle"))
o.append(rect(368, 8, 144, 44, 1.5, INK, SAND))
o.append(text(SRV, 37, "Your server", 18, INK, 700, "middle"))

# Labels between the lifelines, with their extents, so a lifeline breaks instead of crossing one.
# They start at x = 90, so the longest still ends at the server lifeline.
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


# 1. Both machines dial out to the relay; neither opens a port.
o.append(label(DESK + 2, 92, "1  Both sides dial out to a relay", 18, INK, 700))
o.append(arrow(DESK, 102, RELAY - 4, 102, MUTED, 1.4))
o.append(arrow(SRV, 102, RELAY + 4, 102, MUTED, 1.4))
o.append(label(DESK + 2, 126, "no inbound port, either side", 18, MUTED))

# 2. The WireGuard handshake runs end to end; the relay only forwards it.
o.append(label(DESK + 2, 166, "2  WireGuard handshake, end to end", 18, INK, 700))
o.append(arrow(DESK, 176, SRV, 176, INK))
o.append(label(DESK + 2, 200, "throwaway client key on this side", 18, MUTED))
o.append(label(DESK + 2, 224, "server key and pre-shared key from tc\u2026", 18, MUTED))

# 3. NAT traversal, with the relay as the fallback path.
o.append(label(DESK + 2, 264, "3  Direct UDP path when NAT allows", 18, INK, 700))
o.append(arrow(DESK, 274, SRV, 274, INK, 1.6, "6 5"))
o.append(label(DESK + 2, 298, "else the relay forwards ciphertext", 18, MUTED))
for x in (DESK, RELAY, SRV):
    o.append(lifeline(x, 56, 318))

# 4. Inside the tunnel, the ordinary Happy Agent API with its credential.
o.append(text(8, 350, "4  Inside: HTTP to server.tailcat:24779", 20, INK, 700))
o.append(key(8, 366))
o.append(text(44, 380, "bearer token or team sign-in, every request", 18))

o.append(line(8, 406, 512, 406, 1.2, MUTED, .4, "3 7"))
o.append(text(8, 442, "The address is not the lock", 20, INK, 700))
o.append(text(8, 470, "tc\u2026 = server's keys + pre-shared key + region", 18))
o.append(text(8, 496, "Anyone with it reaches the lock, not the agent", 18))

o.append(line(8, 522, 512, 522, 1.2, MUTED, .4, "3 7"))
o.append(text(8, 558, "Your phone: Happy's relay, not Tailcat", 20, INK, 700))
o.append(text(8, 584, "end-to-end encrypted, server online or not", 18, MUTED))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
       + "\n".join(o) + "\n</svg>\n")
open("public/img/tailcat.svg", "w").write(svg)
