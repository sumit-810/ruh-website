"""Generate the textures used by the Blender scenes.

- label.png  : screen-printed label artwork for the concept bottle (transparent PNG).
- jaali_*.png: lattice masks used to cast patterned window light (white = opening).

Edit LABEL below and re-run, then re-render, to change what is printed on the
concept bottle.

    python3 make_textures.py
"""
from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
OUT = HERE / "textures"
OUT.mkdir(exist_ok=True)

LABEL = {
    "wordmark": "RŪH",
    "line1": "BODY MIST",
    "line2": "Nº 01",
    "ink": (52, 38, 31, 235),  # cocoa ink
}

SERIF = str(HERE / "BodoniModa[opsz,wght].ttf")
SANS = str(HERE / "Jost[wght].ttf")


def font(path, size, wght=None, opsz=None):
    """Load a variable font and pin its weight / optical-size axes."""
    f = ImageFont.truetype(path, size)
    values = []
    for axis in f.get_variation_axes():
        name = axis["name"].decode() if isinstance(axis["name"], bytes) else axis["name"]
        if name.lower().startswith("weight") and wght:
            values.append(wght)
        elif "optical" in name.lower() and opsz:
            values.append(opsz)
        else:
            values.append(axis["default"])
    if values:
        f.set_variation_by_axes(values)
    return f


def tracked(draw, cx, y, text, f, fill, tracking):
    """Draw centred text with letter-spacing (tracking in px)."""
    widths = [draw.textlength(ch, font=f) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=f, fill=fill)
        x += w + tracking


def make_label():
    # The label wraps the front half of the cylinder. U spans 0..1 around the
    # full circumference, so the artwork sits in the middle third.
    W, H = 4096, 2048
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    cx = W / 2
    ink = LABEL["ink"]
    wm = font(SERIF, 250, wght=420, opsz=96)
    tracked(d, cx, 300, LABEL["wordmark"], wm, ink, 70)
    # hairline rule
    d.line([(cx - 60, 700), (cx + 60, 700)], fill=ink, width=5)
    s = font(SANS, 70, wght=420)
    tracked(d, cx, 1380, LABEL["line1"], s, ink, 26)
    s2 = font(SERIF, 92, wght=420, opsz=40)
    tracked(d, cx, 1490, LABEL["line2"], s2, ink, 10)
    img.save(OUT / "label.png")


def make_jaali_star(size=2048, tiles=7, name="jaali_star.png"):
    """Eight-point star lattice, a common motif in Indian stone screens."""
    img = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(img)
    t = size / tiles
    for i in range(tiles + 1):
        for j in range(tiles + 1):
            cx, cy = i * t, j * t
            r = t * 0.24
            sq = [(cx - r, cy - r), (cx + r, cy - r), (cx + r, cy + r), (cx - r, cy + r)]
            rot = [(cx + r * 1.414 * math.cos(math.radians(a)), cy + r * 1.414 * math.sin(math.radians(a))) for a in (0, 90, 180, 270)]
            d.polygon(sq, fill=255)
            d.polygon(rot, fill=255)
            # small cross-shaped openings between stars
            ox, oy = cx + t / 2, cy + t / 2
            k = t * 0.07
            d.polygon([(ox, oy - k * 1.6), (ox + k * 1.6, oy), (ox, oy + k * 1.6), (ox - k * 1.6, oy)], fill=255)
    img.save(OUT / name)


def make_jaali_arch(size=2048, name="jaali_arch.png"):
    """A tall arched window opening filled with a fine lattice."""
    img = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(img)
    w, h = size * 0.5, size * 0.86
    x0, y0 = (size - w) / 2, size * 0.1
    # arch window mask
    win = Image.new("L", (size, size), 0)
    wd = ImageDraw.Draw(win)
    wd.rectangle([x0, y0 + w / 2, x0 + w, y0 + h], fill=255)
    wd.ellipse([x0, y0, x0 + w, y0 + w], fill=255)
    # lattice: eight-point stars with small lozenges between them
    lat = Image.new("L", (size, size), 0)
    ld = ImageDraw.Draw(lat)
    t = w / 7
    for i in range(-2, 20):
        for j in range(-2, 24):
            cx, cy = x0 + i * t, y0 + j * t
            r = t * 0.27
            ld.polygon([(cx - r, cy - r), (cx + r, cy - r), (cx + r, cy + r), (cx - r, cy + r)], fill=255)
            ld.polygon([(cx + r * 1.414 * math.cos(math.radians(a)), cy + r * 1.414 * math.sin(math.radians(a))) for a in (0, 90, 180, 270)], fill=255)
            ox, oy, k = cx + t / 2, cy + t / 2, t * 0.12
            ld.polygon([(ox, oy - k), (ox + k, oy), (ox, oy + k), (ox - k, oy)], fill=255)
    img.paste(lat, (0, 0), win)
    img.save(OUT / name)


if __name__ == "__main__":
    make_label()
    make_jaali_star()
    make_jaali_arch()
    print("textures written to", OUT)
