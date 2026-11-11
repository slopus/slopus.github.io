# Writes src/diagrams/team-server.svg, the /guides/team-server/ diagram: three members, each with
# Happy Desktop and a phone, reaching one Happy Agent in team mode on a machine the team runs.
# Desktop goes through Tailcat; the phone goes through Happy's relay. In the white-card style of
# notes/diagrams/cards.py. It replaces the hand-drawn public/multiplayer/team-server.svg
# (notes/multiplayer/team-server-diagram.py), which /t3-code/ still shows.
# Run from the repository root: python3 notes/guides/team-server-diagram.py
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'diagrams'))
from cards import Diagram  # noqa: E402

d = Diagram('team-server', 600, 596)
COLS = (0, 208, 416)
CW = 184

# The members: each signs in as themselves, from their own Desktop and their own phone.
d.section(22, 'Each member, signed in as themselves')
my, mh = 40, 124
for x, name in zip(COLS, ('Ana', 'Ben', 'Chi')):
    d.card(x, my, CW, mh, name, 'person')
    d.icon('laptop', x + 16, my + 52)
    d.text(x + 46, my + 69, 'Desktop', 'sub')
    d.icon('phone', x + 16, my + 86)
    d.text(x + 46, my + 103, 'Phone', 'sub')

# The two ways in. Desktop: a tunnel, end to end. Phone: through a relay, so the link is dashed.
top, sy = my + mh + 8, 292
d.arrow(92, top, 92, sy - 8)
d.text(108, top + 34, 'Desktop: Tailcat', 'cap')
d.text(108, top + 58, 'WireGuard, no open port', 'note')
d.arrow(400, top, 400, sy - 8, dashed=True)
d.text(416, top + 34, 'Phone: Happy relay', 'cap')
d.text(416, top + 58, 'end-to-end encrypted', 'note')

# The server: one Happy Agent, on a machine the team runs.
d.card(0, sy, 600, 304, 'Team server, on a machine you run', 'server', radius=16)
rows = (
    ('Happy Agent in team mode', True),
    ("Lets in only this team's sign-ins", False),
    ('Shared projects, tasks, and sessions', False),
    ("Claude, Codex, Grok: the server's accounts", False),
    ('OS sandbox, and review in Auto', False),
)
for i, (label, accent) in enumerate(rows):
    d.chip(16, sy + 48 + i * 50, 568, 42, label, accent=accent)

d.write()
