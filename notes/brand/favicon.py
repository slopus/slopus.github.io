# Writes the favicon set under public/: favicon.svg, favicon.ico (16, 32, 48),
# favicon-96x96.png, apple-touch-icon.png, and the two web-app-manifest icons.
# The mark is the H of the Happy Engineering wordmark (public/brand/, DM Sans 700):
# cream on an ink tile. Its stems, bar, and height are snapped to a 16-unit grid,
# so the edges land on whole pixels at 16 and 32 and stay sharp in a browser tab.
# Run from the repository root: python3 notes/brand/favicon.py
from PIL import Image, ImageDraw

INK = "#183f38"; CREAM = "#f5f0e7"

# The wordmark's H is 576 wide and 700 tall, stems 135, bar 109 high centered 357 up
# from the baseline. On a 16 grid: 8 wide, 10 tall, stems 2, bar 2.
H_RECTS = [(4, 3, 6, 13), (10, 3, 12, 13), (6, 7, 10, 9)]
RADIUS = 3.5


def svg():
    rects = "".join(f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}"/>' for x0, y0, x1, y1 in H_RECTS)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">'
            f'<rect width="16" height="16" rx="{RADIUS}" fill="{INK}"/>'
            f'<g fill="{CREAM}" shape-rendering="crispEdges">{rects}</g></svg>\n')


def png(size, rounded=True, scale=1.0, supersample=8):
    """The tile at size px. Square tiles (rounded=False) are for platforms that mask
    their own shape; scale < 1 keeps the H inside a maskable icon's safe zone."""
    s = size * supersample; u = s / 16
    image = Image.new("RGBA", (s, s), (0, 0, 0, 0)); draw = ImageDraw.Draw(image)
    if rounded:
        draw.rounded_rectangle([0, 0, s - 1, s - 1], radius=round(RADIUS * u), fill=INK)
    else:
        draw.rectangle([0, 0, s - 1, s - 1], fill=INK)
    for x0, y0, x1, y1 in H_RECTS:
        box = [8 + (v - 8) * scale for v in (x0, y0, x1, y1)]
        draw.rectangle([round(box[0] * u), round(box[1] * u), round(box[2] * u) - 1, round(box[3] * u) - 1], fill=CREAM)
    return image.resize((size, size), Image.LANCZOS)


with open("public/favicon.svg", "w") as f:
    f.write(svg())
icons = [png(n) for n in (16, 32, 48)]
icons[-1].save("public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)], append_images=icons[:-1])
png(96).save("public/favicon-96x96.png")
# iOS rounds the corners itself; a transparent corner would show as black.
png(180, rounded=False).save("public/apple-touch-icon.png")
# "any maskable": full bleed, the H inside the central 80% circle.
for n in (192, 512):
    png(n, rounded=False, scale=.8).save(f"public/web-app-manifest-{n}x{n}.png")
print("wrote public/favicon.svg, favicon.ico, favicon-96x96.png, apple-touch-icon.png, web-app-manifest-{192,512}")
