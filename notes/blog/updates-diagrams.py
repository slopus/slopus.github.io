# Writes the two diagrams on /updates/, in the hand-drawn style of notes/guides/workos-diagram.py
# (same primitives). Transparent, with no frame or nested boxes.
# Run from the repository root: python3 notes/blog/updates-diagrams.py
#
# - public/img/updates.svg: what an update replaces. The window stays, the Happy Agent process is
#   replaced, and the SQLite database carries the turn across.
# - public/img/updates-drain.svg: the recorded update as a timeline, to scale. Times are seconds from
#   the start of the turn, read from the demo's evidence file (happy-desktop,
#   scripts/demo/demos/resume, take square-take-02): the drain began at 2.2s and ended at 5.85s, the
#   new process was starting from 5.97s, reconnecting at 11.73s, updated at 12.27s ("Took 10s"); the
#   second tool call appeared at 12.98s and the turn completed at 15.54s ("Completed in 15s").
import math
import random

random.seed(11)
INK = "#183f38"; MUTED = "#6b7f78"; ACC = "#e6522c"; PAPER = "#fffdf8"
SAND = "#f6eadf"; STONE = "#efe9dc"; MINT = "#e3efe9"
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


def text(x, y, s, size=18, c=INK, wt=400, anchor=None):
    a = f' text-anchor="{anchor}"' if anchor else ""
    s = s.replace("&", "&amp;")
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{wt}" fill="{c}"{a}>{s}</text>'


def arrow(x1, y1, x2, y2, c=INK, w=1.6, dash=None):
    ang = math.atan2(y2 - y1, x2 - x1)
    hx, hy = x2 - 9 * math.cos(ang), y2 - 9 * math.sin(ang)
    l = (hx + 5 * math.cos(ang + math.pi / 2), hy + 5 * math.sin(ang + math.pi / 2))
    r = (hx - 5 * math.cos(ang + math.pi / 2), hy - 5 * math.sin(ang + math.pi / 2))
    return line(x1, y1, x2, y2, w, c, .6, dash) + line(l[0], l[1], x2, y2, w, c, .2) + line(r[0], r[1], x2, y2, w, c, .2)


def svg(o, w, h):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" '
            "font-family=\"'Shantell Sans', 'Comic Sans MS', 'Chalkboard SE', 'Segoe Print', cursive\" role=\"img\">\n"
            + "\n".join(o) + "\n</svg>\n")


# Text is at least 18 units: about 12px when a phone shrinks these to 350px.

def architecture():
    o = []
    # Happy Desktop: the window, which stays, and the updater in its main process.
    o.append(rect(8, 8, 296, 66, 1.6, INK, SAND))
    o.append(text(156, 36, "Desktop window", 20, INK, 700, "middle"))
    o.append(text(156, 62, "stays open, never reloads", 18, MUTED, 400, "middle"))
    o.append(rect(328, 8, 184, 66, 1.6, INK, STONE))
    o.append(text(420, 36, "Updater", 20, INK, 700, "middle"))
    o.append(text(420, 62, "downloads release", 18, MUTED, 400, "middle"))

    # The two Happy Agent processes: the old one drains and exits, the new one takes over.
    OLD, NEW = 8, 292
    o.append(rect(OLD, 182, 220, 66, 1.6, MUTED, None, "6 5"))
    o.append(text(OLD + 110, 210, "Happy Agent", 20, MUTED, 700, "middle"))
    o.append(text(OLD + 110, 236, "old version, old PID", 18, MUTED, 400, "middle"))
    o.append(rect(NEW, 182, 220, 66, 1.8, INK, MINT))
    o.append(text(NEW + 110, 210, "Happy Agent", 20, INK, 700, "middle"))
    o.append(text(NEW + 110, 236, "new version, new PID", 18, INK, 400, "middle"))
    o.append(arrow(OLD + 228, 215, NEW - 8, 215, INK, 1.8))

    # The window talks to whichever process is running; the updater drives the swap.
    o.append(arrow(80, 80, 80, 176, MUTED, 1.4, "5 5"))
    o.append(arrow(80, 176, 80, 80, MUTED, 1.4, "5 5"))
    o.append(text(92, 134, "before", 18, MUTED))
    o.append(arrow(236, 80, 360, 176, INK, 1.6))
    o.append(arrow(360, 176, 236, 80, INK, 1.6))
    o.append(text(306, 160, "reconnects", 18, INK, 400, "end"))
    o.append(arrow(490, 80, 490, 176, INK, 1.6))
    o.append(text(478, 112, "1 drain old", 18, INK, 400, "end"))
    o.append(text(478, 136, "2 stop old", 18, INK, 400, "end"))
    o.append(text(478, 160, "3 start new", 18, INK, 400, "end"))

    # The database outlives both processes.
    o.append(rect(8, 330, 504, 66, 1.8, INK, SAND))
    o.append(text(260, 358, "SQLite database", 20, INK, 700, "middle"))
    o.append(text(260, 384, "~/.happy/agent: turns, tool calls, results", 18, MUTED, 400, "middle"))
    o.append(arrow(60, 254, 60, 324, MUTED, 1.4))
    o.append(text(72, 296, "saves each step", 18, MUTED))
    o.append(arrow(330, 324, 330, 254, INK, 1.6))
    o.append(text(342, 296, "reads the turn", 18, INK))

    o.append(line(8, 424, 512, 424, 1.2, MUTED, .4, "3 7"))
    o.append(text(8, 460, "The same turn continues", 20, INK, 700))
    o.append(text(8, 488, "on the new version, from its last saved step", 18, MUTED))
    return svg(o, 520, 500)


def timeline():
    o = []
    L, R, END = 20, 500, 16.0
    x = lambda s: round(L + (R - L) * s / END, 1)
    DRAIN, STOP, START, RECONNECT, DONE = 2.2, 5.85, 5.97, 11.73, 12.27
    TOOL1 = (0.3, 5.6)
    TOOL2 = (12.98, 15.4)
    COMPLETED = 15.54

    # The card's steps, as a segmented bar with the step names stacked above it.
    BAR = 112
    steps = [("Finishing work", DRAIN, STOP, 26), ("Shutting down", STOP, START, 54),
             ("Starting", START, RECONNECT, 82), ("Reconnecting", RECONNECT, DONE, 26),
             ("Updated", DONE, END, 54)]
    for name, a, b, y in steps:
        o.append(text(x(a), y, name, 18, INK if name != "Updated" else MUTED, 600))
        o.append(line(x(a), y + 6, x(a), BAR - 6, 1.2, MUTED, .2))
        o.append(line(x(a) + 2, BAR, max(x(b) - 2, x(a) + 3), BAR, 5, MUTED if name == "Updated" else INK, .3))

    # Lanes: the window, the old process, the new process.
    def bar(a, b, y, fill, c=INK, dash=None):
        return rect(x(a), y, x(b) - x(a), 30, 1.4, c, fill, dash)

    o.append(bar(0, END, 140, SAND))
    o.append(text(x(0) + 10, 161, "Desktop window", 18, INK, 600))
    o.append(text(x(STOP) + 12, 161, "open throughout", 18, INK, 600))
    o.append(bar(0, START, 186, None, MUTED, "6 5"))
    o.append(text(x(0) + 10, 207, "old Happy Agent", 18, MUTED, 600))
    # One process: starting, then ready from the reconnect on.
    o.append(f'<path d="M{x(RECONNECT):.1f} 233 L{x(END)-1:.1f} 233 L{x(END)-2:.1f} 261 L{x(RECONNECT):.1f} 261 Z" fill="{MINT}"/>')
    o.append(bar(START, END, 232, None))
    o.append(text(x(START) + 10, 253, "new Happy Agent", 18, INK, 600))

    # The turn: tool 1, the restart, tool 2.
    o.append(text(L, 302, "The agent's turn", 18, MUTED))
    o.append(bar(*TOOL1, 314, MINT))
    o.append(text(x(TOOL1[0]) + 10, 335, "check.mjs", 18, INK, 600))
    o.append(line(x(STOP) + 6, 329, x(TOOL2[0]) - 6, 329, 1.4, MUTED, .4, "2 6"))
    o.append(text((x(STOP) + x(TOOL2[0])) / 2, 320, "saved, waiting", 18, MUTED, 400, "middle"))
    o.append(bar(*TOOL2, 314, MINT))
    o.append(text(x(TOOL2[1]), 370, "verify.mjs", 18, INK, 600, "end"))
    o.append(text(x(COMPLETED), 394, "Completed in 15s", 18, INK, 700, "end"))

    # The drain boundary: the old process stops only once the running step is saved.
    o.append(line(x(STOP), 122, x(STOP), 412, 2, ACC, .3, "7 5"))
    o.append(text(x(STOP) - 8, 436, "Drain boundary", 20, ACC, 700, "middle"))
    o.append(text(L, 462, "the running step finishes and is saved,", 18, MUTED))
    o.append(text(L, 486, "then the old process exits", 18, MUTED))

    # Seconds from the start of the turn.
    o.append(line(L, 512, R, 512, 1.2, MUTED, .3))
    for s in (0, 5, 10, 15):
        o.append(line(x(s), 508, x(s), 518, 1.2, MUTED, .1))
        o.append(text(x(s), 540, f"{s}s", 18, MUTED, 400, "middle"))
    return svg(o, 520, 548)


open("public/img/updates.svg", "w").write(architecture())
open("public/img/updates-drain.svg", "w").write(timeline())
