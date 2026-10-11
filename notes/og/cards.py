# Writes public/og/<slug>.png, the 1200x630 link preview of every desktop doc: the
# Happy Engineering wordmark, the page's title and description, its URL, and its
# figure (the first image on the page) on the right. A page without a figure gets
# the site's H mark instead. The original CLI docs under /docs/ keep the homepage's card.
#
# Run from the repository root after adding or retitling a desktop doc:
#   python3 notes/og/cards.py            # every desktop doc
#   python3 notes/og/cards.py tailcat    # only the named slugs
# Needs Python Playwright with Chromium (pip install playwright; playwright install
# chromium); CHROMIUM=/path/to/chrome overrides the browser. The site fonts download
# once into notes/og/.fonts/. The build only checks the committed PNGs, so CI needs
# neither a browser nor the network.
import html
import io
import json
import mimetypes
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

ROOT = Path.cwd()
PUBLIC = ROOT / "public"
FONTS = ROOT / "notes/og/.fonts"
SITE = "https://happy.engineering"
# google/fonts at a fixed commit, so a rerun draws the same letters.
GOOGLE_FONTS = "https://raw.githubusercontent.com/google/fonts/bd8f81ddb5c74d5c8897b36ad88b440266245103/ofl"
FONT_FILES = {
    "SpaceGrotesk.ttf": "spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf",
    "DMSans.ttf": "dmsans/DMSans%5Bopsz,wght%5D.ttf",
    "DMMono-Medium.ttf": "dmmono/DMMono-Medium.ttf",
    # The diagrams' hand-drawn face (their font-family names it first).
    "ShantellSans.ttf": "shantellsans/ShantellSans%5BBNCE,INFM,SPAC,wght%5D.ttf",
}
# Where the first image is not the one that says what the page is about.
FIGURE_OVERRIDES = {
    "/vision/": "/thesis/layout.svg",
}

W, H = 1200, 630
INK, MUTED, BODY, ACCENT, PAPER = "#183f38", "#6b7f78", "#47645e", "#e6522c", "#f5f0e7"


def fetch_fonts():
    FONTS.mkdir(parents=True, exist_ok=True)
    for name, remote in FONT_FILES.items():
        target = FONTS / name
        if not target.exists():
            print(f"downloading {name}")
            target.write_bytes(urllib.request.urlopen(f"{GOOGLE_FONTS}/{remote}").read())


def desktop_documents():
    """Every desktop doc as the site builds it: URL, h1, description, card path, figures."""
    subprocess.run(["pnpm", "exec", "vite", "build", "--ssr", "src/prerender.tsx", "--outDir", "dist-ssr", "--logLevel", "error"], check=True)
    script = """
      const m = await import(process.argv[1])
      const pages = m.documents.filter((d) => d.product === m.HAPPY_DESKTOP.key).map((d) => {
        const href = m.documentHref(m.HAPPY_DESKTOP, d.path)
        const markup = m.renderPath(href)
        const article = markup.slice(markup.indexOf('<article'), markup.indexOf('</article>'))
        const figures = [...article.matchAll(/<img [^>]*?src="([^"]+)"[^>]*?alt="([^"]*)"/g)].map(([, src, alt]) => ({ src, alt }))
        return { href, heading: m.documentHeading(d), description: d.description, card: m.metadataForPath(href).socialImage?.path, figures }
      })
      console.log(JSON.stringify(pages))
    """
    bundle = (ROOT / "dist-ssr/prerender.js").as_uri()
    output = subprocess.run(["node", "--input-type=module", "-e", script, bundle], check=True, capture_output=True, text=True).stdout
    return json.loads(output)


def inline_svg(path, width, height):
    """An SVG inlined, not an <img>, so its text uses the fonts loaded here."""
    source = re.sub(r"<\?xml[^>]*>\s*", "", (PUBLIC / path.lstrip("/")).read_text())
    tag = re.search(r"<svg\b[^>]*>", source).group(0)
    sized = re.sub(r'\s(?:width|height)="[^"]*"', "", tag).replace("<svg", f'<svg width="{width:.0f}" height="{height:.0f}"', 1)
    return source.replace(tag, sized, 1)


def natural_size(path):
    file = PUBLIC / path.lstrip("/")
    if file.suffix == ".svg":
        x, y, w, h = map(float, re.search(r'viewBox="([^"]+)"', file.read_text()).group(1).replace(",", " ").split())
        return w, h
    with Image.open(file) as image:
        return image.size


def figure_markup(page):
    """The right column: its width and markup. A page without a figure gets the site's H mark."""
    figures = page["figures"]
    override = FIGURE_OVERRIDES.get(page["href"])
    if override:
        figures = [f for f in figures if f["src"] == override]
    if not figures:
        mark = (PUBLIC / "favicon.svg").read_text().replace("<svg ", '<svg width="240" height="240" ', 1)
        return 240, f'<div class="figure mark">{mark}</div>'
    # Portraits (the Team page): every photo, side by side, with its caption.
    if all(f["src"].endswith(".jpg") for f in figures):
        people = "".join(
            f'<figure class="person"><img src="{html.escape(f["src"])}" alt=""><figcaption>{html.escape(f["alt"])}</figcaption></figure>'
            for f in figures[:2])
        return 470, f'<div class="figure people">{people}</div>'
    figure = figures[0]
    box_w, box_h = 520, H - 2 * 44
    w, h = natural_size(figure["src"])
    scale = min(box_w / w, box_h / h)
    if not figure["src"].endswith(".svg"):
        scale = min(scale, 2)  # a screenshot at most at its 2x size
    w, h = w * scale, h * scale
    if figure["src"].endswith(".svg"):
        inner = inline_svg(figure["src"], w, h)
    else:
        inner = f'<img src="{html.escape(figure["src"])}" alt="" width="{w:.0f}" height="{h:.0f}">'
    return w, f'<div class="figure">{inner}</div>'


def card_html(page):
    figure_w, figure = figure_markup(page)
    copy_w = W - 72 - 56 - 48 - figure_w
    url = f"happy.engineering{page['href']}".rstrip("/")
    wordmark = (PUBLIC / "brand/happy-engineering-inline-light.svg").read_text()
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: 'Space Grotesk'; src: url(/__fonts/SpaceGrotesk.ttf); font-weight: 300 700; }}
@font-face {{ font-family: 'DM Sans'; src: url(/__fonts/DMSans.ttf); font-weight: 100 1000; }}
@font-face {{ font-family: 'DM Mono'; src: url(/__fonts/DMMono-Medium.ttf); font-weight: 500; }}
@font-face {{ font-family: 'Shantell Sans'; src: url(/__fonts/ShantellSans.ttf); font-weight: 300 800; }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; background: {PAPER}; }}
.card {{ position: relative; width: {W}px; height: {H}px; overflow: hidden; background: {PAPER}; color: {INK}; font-family: 'DM Sans', sans-serif; }}
.copy {{ position: absolute; left: 72px; top: 62px; bottom: 58px; width: {copy_w}px; display: flex; flex-direction: column; }}
.wordmark svg {{ display: block; width: auto; height: 30px; }}
.text {{ margin: auto 0; }}
h1 {{ margin: 0; font: 600 var(--size, 76px)/1.04 'Space Grotesk', sans-serif; letter-spacing: -.025em; text-wrap: balance; }}
p {{ margin: 24px 0 0; color: {BODY}; font-size: 27px; line-height: 1.4; text-wrap: pretty;
     display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; overflow: hidden; }}
.url {{ display: flex; align-items: center; gap: 12px; color: {MUTED}; font: 500 20px/1 'DM Mono', monospace; white-space: nowrap; }}
.url::before {{ content: ''; width: 28px; height: 4px; border-radius: 2px; background: {ACCENT}; }}
.figure {{ position: absolute; top: 44px; bottom: 44px; right: 56px; width: {figure_w:.0f}px; display: flex; align-items: center; justify-content: center; }}
.figure img, .figure svg {{ display: block; }}
.mark {{ right: 72px; }}
.people {{ gap: 30px; }}
.person {{ margin: 0; display: flex; flex-direction: column; align-items: center; gap: 16px; }}
.person img {{ width: 220px; height: 220px; border-radius: 50%; object-fit: cover; }}
.person figcaption {{ font-size: 24px; font-weight: 500; color: {INK}; text-align: center; }}
</style></head><body><div class="card">
<div class="copy">
  <div class="wordmark">{wordmark}</div>
  <div class="text"><h1>{html.escape(page['heading'])}</h1><p>{html.escape(page['description'])}</p></div>
  <div class="url">{html.escape(url)}</div>
</div>
{figure}
</div></body></html>"""


# A description over three lines loses whole clauses from its end, never half a word.
# Then the title is the largest that fits in four lines, 32px clear of the wordmark and the URL.
FIT = """(max) => {
  const box = (selector) => document.querySelector(selector).getBoundingClientRect()
  const h1 = document.querySelector('h1'), p = document.querySelector('p')
  const clauses = p.textContent.split(/(?<=[.,:;])\s+/)
  while (p.scrollHeight > p.clientHeight + 1 && clauses.length > 1) {
    clauses.pop()
    p.textContent = clauses.join(' ').replace(/[,:;]$/, '.')
  }
  for (let size = max; size > 40; size -= 2) {
    h1.style.setProperty('--size', size + 'px')
    const lines = Math.round(box('h1').height / (size * 1.04))
    if (lines <= 4 && box('.text').top >= box('.wordmark').bottom + 32 && box('.text').bottom <= box('.url').top - 32) return size
  }
  h1.style.setProperty('--size', '40px')
  return 40
}"""


def serve(route):
    url = route.request.url
    path = url.split(SITE, 1)[1].split("?")[0]
    if path == "/__card":
        return route.fulfill(status=200, body=serve.html, content_type="text/html")
    file = FONTS / path[len("/__fonts/"):] if path.startswith("/__fonts/") else PUBLIC / path.lstrip("/")
    if not file.is_file():
        return route.fulfill(status=404, body="")
    route.fulfill(status=200, body=file.read_bytes(), content_type=mimetypes.guess_type(str(file))[0] or "application/octet-stream")


def main():
    only = set(sys.argv[1:])
    fetch_fonts()
    pages = [p for p in desktop_documents() if not only or p["card"].split("/")[-1][:-4] in only]
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ.get("CHROMIUM") or None)
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)
        page.route(f"{SITE}/**", serve)
        page.route(lambda url: not url.startswith(SITE), lambda route: route.abort())
        for doc in pages:
            serve.html = card_html(doc)
            page.goto(f"{SITE}/__card", wait_until="load")
            page.evaluate("document.fonts.ready")
            page.evaluate(FIT, 88 if 'figure mark' in serve.html else 76)
            png = page.screenshot(clip={"x": 0, "y": 0, "width": W, "height": H})
            # Drawn at 2x and reduced, so thin diagram strokes stay smooth.
            image = Image.open(io.BytesIO(png)).convert("RGB").resize((W, H), Image.LANCZOS)
            # Drawings and screenshots keep their look in 256 colors at a third of the size; photos stay full color.
            if ".jpg" not in serve.html:
                image = image.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
            target = PUBLIC / doc["card"].lstrip("/")
            target.parent.mkdir(parents=True, exist_ok=True)
            image.save(target, optimize=True)
            print(f"{doc['href']:40} -> {target.relative_to(ROOT)}")
        browser.close()


if __name__ == "__main__":
    main()
