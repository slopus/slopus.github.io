# Writes public/img/team-sign-in-workos.svg, the team sign-in diagram on /guides/team-sign-in-workos/, in
# the hand-drawn style of public/multiplayer/team-server.svg (same primitives as
# notes/multiplayer/team-server-diagram.py). Transparent, with no frame or nested boxes.
# Run from the repository root: python3 notes/guides/workos-diagram.py
# The 1600px PNG beside it, for posting, is exported from this SVG on the site's background (#f5f0e7).
import math
import random

random.seed(11)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"; PAPER = "#fffdf8"
SAND = "#f6eadf"; STONE = "#efe9dc"; MINT = "#e3efe9"
W, H = 520, 566
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


o = []
# Text is at least 18 units: about 12px when a phone shrinks this to 350px.
APP, WOS, SRV = 78, 272, 446
o.append(rect(8, 8, 140, 44, 1.5, INK, SAND))
o.append(text(APP, 37, "Happy Desktop", 18, INK, 700, "middle"))
o.append(rect(212, 8, 120, 44, 1.8, INK, MINT))
o.append(text(WOS, 37, "WorkOS", 20, INK, 700, "middle"))
o.append(rect(380, 8, 132, 44, 1.5, INK, SAND))
o.append(text(SRV, 37, "Team server", 18, INK, 700, "middle"))
for x in (APP, WOS, SRV):
    o.append(line(x, 56, x, 340, 1.2, MUTED, .3, "3 6"))

# 1-2. Sign-in happens between the app and WorkOS; the server never sees it.
o.append(text(APP + 10, 92, "1  Sign in", 18, INK, 700))
o.append(arrow(APP, 102, WOS, 102, INK))
o.append(text(APP + 10, 126, "AuthKit, PKCE", 18, MUTED))
o.append(text(APP + 10, 166, "2  Access token", 18, INK, 700))
o.append(arrow(WOS, 176, APP, 176, INK))
o.append(text(APP + 10, 200, "for the team", 18, MUTED))

# 3. Each request carries the token.
o.append(text(APP + 10, 246, "3  Every request: Bearer token", 18, INK, 700))
o.append(arrow(APP, 256, SRV, 256, INK))

# The server fetches WorkOS's public signing keys and caches them.
o.append(arrow(SRV, 300, WOS, 300, MUTED, 1.4, "5 5"))
o.append(text(WOS + 12, 290, "Signing keys", 18, MUTED))
o.append(text(WOS + 12, 324, "(JWKS, cached)", 18, MUTED))

# 4. What the server checks, locally.
o.append(text(8, 380, "4  The server checks it locally", 20, INK, 700))
o.append(text(8, 408, "RS256 signature, issuer, client, org_id", 18))
o.append(text(8, 434, "then maps the user to a team member", 18))

o.append(line(8, 462, 512, 462, 1.2, MUTED, .4, "3 7"))
o.append(text(8, 498, "Or your own identity provider", 20, INK, 700))
o.append(text(8, 526, 'authentication = "jwt": the server verifies', 18, MUTED))
o.append(text(8, 552, "your OAuth server's tokens instead", 18, MUTED))

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" '
       "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
       + "\n".join(o) + "\n</svg>\n")
open("public/img/team-sign-in-workos.svg", "w").write(svg)
