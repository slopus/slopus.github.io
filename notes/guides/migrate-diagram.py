# Writes src/diagrams/migrate.svg, the /migrate diagram: before, the phone reached a terminal through
# the Happy server; now it reaches each Happy Agent, on your computer and on an optional server,
# separately. In the white-card style of notes/diagrams/cards.py.
# Run from the repository root: python3 notes/guides/migrate-diagram.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'diagrams'))
from cards import Diagram  # noqa: E402

d = Diagram('migrate', 600, 612)
PH, MID, COL = (0, 88), (120, 348), (380, 600)
CHIP, CHIP_H = (396, 576), 44

# Before: the Happy CLI.
y, h = 40, 72
d.section(22, 'Before: the Happy CLI')
d.card(PH[0], y, PH[1] - PH[0], h, 'Phone', 'phone', center=True)
d.card(MID[0], y, MID[1] - MID[0], h, 'Happy server', 'cloud', center=True)
d.card(COL[0], y, COL[1] - COL[0], h, 'Your computer', 'laptop', sub='happy in a terminal')
d.arrow(PH[1] + 6, y + h / 2, MID[0] - 6, y + h / 2)
d.arrow(MID[1] + 6, y + h / 2, COL[0] - 6, y + h / 2)
d.text(MID[0], y + h + 28, 'Stores your chats, encrypted', 'cap')
d.rule(168)

# Now: your computer runs Happy Desktop and Happy Agent; an optional server runs Happy Agent.
d.section(206, 'Now: Happy Agent')
cy = 222
d.card(COL[0], cy, COL[1] - COL[0], 176, 'Your computer', 'laptop', radius=16)
d.chip(CHIP[0], cy + 48, CHIP[1] - CHIP[0], CHIP_H, 'Happy Desktop')
agent = cy + 112
d.chip(CHIP[0], agent, CHIP[1] - CHIP[0], CHIP_H, 'Happy Agent', accent=True)
sy = 452
d.card(COL[0], sy, COL[1] - COL[0], 156, 'Your server', 'server', dashed=True, radius=16)
d.text(COL[0] + 46, sy + 56, 'optional', 'note')
srv = sy + 96
d.chip(CHIP[0], srv, CHIP[1] - CHIP[0], CHIP_H, 'Happy Agent', accent=True)

# The phone sits on the computer's Happy Agent row: a straight link to it, an angled one to the
# server's. The relay is a label on the links, not a stop on the way.
mid = agent + CHIP_H / 2
d.card(PH[0], mid - 36, PH[1] - PH[0], 72, 'Phone', 'phone', center=True)
d.arrow(PH[1] + 6, mid, CHIP[0] - 6, mid, dashed=True)
d.text(PH[1] + 14, mid - 40, 'Relay', 'cap')
d.text(PH[1] + 14, mid - 16, 'passes traffic, stores nothing', 'cap')
x1, y1, x2, y2 = PH[1] + 6, mid + 30, CHIP[0] - 6, srv + CHIP_H / 2
d.arrow(x1, y1, x2, y2, dashed=True)
d.text((x1 + x2) / 2 - 52, (y1 + y2) / 2 + 26, 'Relay', 'cap')

# The two Happy Agents connect, along the tiles' right side, clear of the phone's links.
a, b, x = agent + CHIP_H / 2, srv + CHIP_H / 2, CHIP[1] + 12
d.line(f'M{CHIP[1]} {a}H{x}V{b}H{CHIP[1]}', accent=True)
d.dot(CHIP[1], a)
d.dot(CHIP[1], b)

d.write()
