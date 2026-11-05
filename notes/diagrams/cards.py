# The site's diagram style: white cards on the page, drawn as SVG that sits inline in the page
# (src/InlineDiagram.tsx), so it takes the page's fonts and its light or dark palette
# (--home-ink, --home-accent, --home-shadow; DESIGN.md, Diagrams). Each script under notes/ builds
# one Diagram and writes it to src/diagrams/<name>.svg.
from pathlib import Path

CSS = """
.card-diagram{--ink:var(--home-ink,#14112e);--acc:var(--home-accent,#5b21b6);--mut:color-mix(in srgb,var(--ink) 62%,transparent);--ln:color-mix(in srgb,var(--ink) 28%,transparent);--card:color-mix(in srgb,#fff 78%,transparent);--tint:color-mix(in srgb,var(--acc) 10%,var(--card))}
@media (prefers-color-scheme:dark){.card-diagram{--card:color-mix(in srgb,#fff 7%,transparent);--tint:color-mix(in srgb,var(--acc) 16%,transparent)}}
.card-diagram .sec{font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;fill:var(--mut)}
.card-diagram .ttl{font-size:18px;font-weight:600;fill:var(--ink)}
.card-diagram .sub,.card-diagram .cap{font-size:18px;fill:var(--mut)}
.card-diagram .note{font-size:16px;fill:var(--mut)}
.card-diagram .box{fill:var(--card);stroke:color-mix(in srgb,var(--ink) 10%,transparent);stroke-width:1.25}
.card-diagram .box.dash{fill:color-mix(in srgb,var(--card) 55%,transparent);stroke:color-mix(in srgb,var(--ink) 18%,transparent);stroke-dasharray:5 5}
.card-diagram .chip{fill:color-mix(in srgb,var(--ink) 5%,transparent)}
.card-diagram .chip.ag{fill:var(--tint)}
.card-diagram .ctxt{font-size:18px;font-weight:500;fill:var(--ink)}
.card-diagram .ctxt.ag{font-weight:600;fill:var(--acc)}
.card-diagram .ic{fill:none;stroke:var(--ink);stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}
.card-diagram .ln{fill:none;stroke:var(--mut);stroke-width:1.25}
.card-diagram .ln.d{stroke-dasharray:4 4}
.card-diagram .al{fill:none;stroke:var(--acc);stroke-width:2}
.card-diagram .dot{fill:var(--acc)}
.card-diagram .head{fill:none;stroke:var(--mut);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}
.card-diagram .rule{stroke:var(--ln);stroke-width:1}
"""


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;')


class Diagram:
    """One diagram: shapes are appended in order; `write` saves the SVG."""

    def __init__(self, name, width, height):
        self.name, self.w, self.h, self.o = name, width, height, []

    # Text. Classes: sec (section label), ttl (card title), sub/cap (muted line), note (small muted).
    def text(self, x, y, s, cls, anchor=None):
        a = f' text-anchor="{anchor}"' if anchor else ''
        self.o.append(f'<text x="{x}" y="{y}" class="{cls}"{a}>{esc(s)}</text>')

    def section(self, y, s):
        self.text(0, y, s, 'sec')

    def rule(self, y):
        self.o.append(f'<path d="M0 {y}H{self.w}" class="rule"/>')

    # Small line icons, 21 units square, top left at x, y.
    def icon(self, kind, x, y):
        c = 'ic'
        shapes = {
            'phone': f'<rect x="{x+5}" y="{y}" width="11" height="19" rx="2.5" class="{c}"/><path d="M{x+9} {y+15.5}h3" class="{c}"/>',
            'laptop': f'<rect x="{x+2.5}" y="{y+3}" width="16" height="11" rx="1.5" class="{c}"/><path d="M{x} {y+17.5}h21" class="{c}"/>',
            'server': f'<rect x="{x+1}" y="{y+1}" width="19" height="7.5" rx="1.5" class="{c}"/><rect x="{x+1}" y="{y+11}" width="19" height="7.5" rx="1.5" class="{c}"/><path d="M{x+4.5} {y+4.75}h2M{x+4.5} {y+14.75}h2" class="{c}"/>',
            'cloud': f'<path d="M{x+5.5} {y+16.5}h10.5a4.2 4.2 0 0 0 .4-8.4 6 6 0 0 0-11.4 1.6 3.4 3.4 0 0 0 .5 6.8z" class="{c}"/>',
            'person': f'<circle cx="{x+10.5}" cy="{y+6}" r="4.5" class="{c}"/><path d="M{x+2} {y+19.5}a8.5 8.5 0 0 1 17 0" class="{c}"/>',
            'lock': f'<rect x="{x+3}" y="{y+9}" width="15" height="11" rx="2" class="{c}"/><path d="M{x+6.5} {y+9}V{y+6}a4 4 0 0 1 8 0v3" class="{c}"/>',
            'key': f'<circle cx="{x+6}" cy="{y+10.5}" r="4.5" class="{c}"/><path d="M{x+10.5} {y+10.5}H{x+20}M{x+16} {y+10.5}v4M{x+19.5} {y+10.5}v3" class="{c}"/>',
            'chip': f'<rect x="{x+4}" y="{y+4}" width="13" height="13" rx="2" class="{c}"/><path d="M{x+8} {y+1}v3M{x+13} {y+1}v3M{x+8} {y+17}v3M{x+13} {y+17}v3M{x+1} {y+8}h3M{x+1} {y+13}h3M{x+17} {y+8}h3M{x+17} {y+13}h3" class="{c}"/>',
            'mic': f'<rect x="{x+7}" y="{y}" width="7" height="12" rx="3.5" class="{c}"/><path d="M{x+3.5} {y+9}a7 7 0 0 0 14 0M{x+10.5} {y+16}v4" class="{c}"/>',
            'doc': f'<path d="M{x+4} {y+1}h9l5 5v14H{x+4}z" class="{c}"/><path d="M{x+8} {y+11}h7M{x+8} {y+15}h7" class="{c}"/>',
        }
        self.o.append(shapes[kind])

    # A card: title (and icon) on top, an optional muted line under it, or centred for a small card.
    def card(self, x, y, w, h, title, icon=None, sub=None, center=False, dashed=False, radius=14):
        self.o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{radius}" class="box{" dash" if dashed else ""}"/>')
        if center:
            if icon:
                self.icon(icon, x + w / 2 - 10.5, y + 14)
            self.text(x + w / 2, y + (56 if icon else h / 2 + 6), title, 'ttl', 'middle')
            if sub:
                self.text(x + w / 2, y + (56 if icon else h / 2 + 6) + 24, sub, 'note', 'middle')
            return
        tx = x + 16
        if icon:
            self.icon(icon, x + 16, y + 14)
            tx = x + 46
        self.text(tx, y + 31, title, 'ttl')
        if sub:
            self.text(x + 16, y + 58, sub, 'sub')

    # A tile inside a card. accent marks the thing the diagram is about (Happy Agent, say).
    def chip(self, x, y, w, h, label, accent=False, anchor=None):
        c = ' ag' if accent else ''
        self.o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" class="chip{c}"/>')
        if anchor == 'middle':
            self.text(x + w / 2, y + h / 2 + 6, label, 'ctxt' + c, 'middle')
        else:
            self.text(x + 16, y + h / 2 + 6, label, 'ctxt' + c)

    def arrow(self, x1, y1, x2, y2, dashed=False, both=False):
        start = f' marker-start="url(#{self.name}-head)"' if both else ''
        self.o.append(f'<path d="M{x1} {y1}L{x2} {y2}" class="ln{" d" if dashed else ""}" marker-end="url(#{self.name}-head)"{start}/>')

    def line(self, d, accent=False, dashed=False):
        cls = 'al' if accent else 'ln' + (' d' if dashed else '')
        self.o.append(f'<path d="{d}" class="{cls}"/>')

    def dot(self, x, y):
        self.o.append(f'<circle cx="{x}" cy="{y}" r="3" class="dot"/>')

    def svg(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" class="card-diagram" '
                f'font-family="inherit" aria-hidden="true"><style>{CSS}</style><defs>'
                f'<filter id="{self.name}-shadow" x="-10%" y="-20%" width="120%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#14112e" flood-opacity=".08"/></filter>'
                f'<marker id="{self.name}-head" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5L1 9" class="head"/></marker>'
                f'</defs>' + ''.join(self.o).replace('class="box"', f'class="box" filter="url(#{self.name}-shadow)"') + '</svg>\n')

    def write(self):
        out = Path('src/diagrams') / f'{self.name}.svg'
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(self.svg())
        print(out)
