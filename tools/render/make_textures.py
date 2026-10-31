"""Packaging artwork and light textures for the Gentle Company renders.

Every label is typeset here with the real brand fonts (tools/brand-fonts/),
so "GENTLE COMPANY" on the packaging is accurate type, never AI-generated
lettering. The renders map these images onto the bottle, tubes and jars.

Writes tools/render/textures/:
  label_<key>.png   ink-on-transparent label artwork for each product
  leaves.png        soft leaf-shadow gobo (botanical window light)
  arch.png          arched-window gobo

    pip install pillow
    python tools/render/make_textures.py
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).parent
TEX = HERE / "textures"
FONTS = HERE.parent / "brand-fonts"
MARCELLUS = str(FONTS / "Marcellus-Regular.ttf")
SANS = str(FONTS / "InstrumentSans[wdth,wght].ttf")
SERIF = str(FONTS / "CormorantGaramond[wght].ttf")

INK = (42, 32, 27, 255)

# key: (product line, small descriptor, edition or None)
LABELS = {
    "body_mist": ("BODY MIST", None, "Nº 01"),
    "body_wash": ("BODY WASH", None, None),
    "body_lotion": ("BODY LOTION", None, None),
    "body_scrub": ("BODY SCRUB", None, None),
    "body_butter": ("BODY BUTTER", None, None),
    "hand_cream": ("HAND & BODY", "CREAM", None),
    "cleanser": ("FACE", "CLEANSER", None),
    "toner": ("TONER", None, None),
    "serum": ("FACE", "SERUM", None),
    "moisturiser": ("MOISTURISER", None, None),
    "sunscreen": ("SUNSCREEN", None, None),
    "mask": ("FACE MASK", None, None),
    "lip_balm": ("LIP BALM", None, None),
    "lip_treatment": ("LIP", "TREATMENT", None),
}


def font(path, size, wght=None):
    f = ImageFont.truetype(path, size)
    if wght is not None:
        try:
            f.set_variation_by_axes([100, wght] if "Instrument" in path else [wght])
        except Exception:
            pass
    return f


def tracked(draw, cx, y, text, f, track_em, fill=INK):
    """Draw centred text with letter-spacing; returns the line's height."""
    size = f.size
    widths = [draw.textlength(ch, font=f) for ch in text]
    total = sum(widths) + track_em * size * (len(text) - 1)
    x = cx - total / 2
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=f, fill=fill)
        x += w + track_em * size
    return size


def label(key, w=1200, h=1500, stacked=True, bias=0.46, scale=1.0):
    """Typeset the label block, then centre it vertically (slightly above centre)."""
    block = _label_block(key, w, h * 2, stacked, scale)
    l, t, r, b = block.getbbox()
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    im.alpha_composite(block.crop((0, t, w, b)), (0, int((h - (b - t)) * bias)))
    return im


def _label_block(key, w, h, stacked, scale=1.0):
    line, sub, edition = LABELS[key]
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx = w / 2
    mark = font(MARCELLUS, int(w * 0.105 * scale))
    y = 40
    if stacked:
        tracked(d, cx, y, "GENTLE", mark, 0.26)
        tracked(d, cx, y + mark.size * 1.22, "COMPANY", mark, 0.14)
        y += mark.size * 2.6
    # hairline rule
    d.rectangle([cx - w * 0.07, y, cx + w * 0.07, y + max(2, w // 400)], fill=INK)
    y += w * 0.09
    small = font(SANS, int(w * 0.052 * scale), 560)
    tracked(d, cx, y, line, small, 0.32)
    y += small.size * 1.6
    if sub:
        tracked(d, cx, y, sub, small, 0.32)
        y += small.size * 1.6
    if edition:
        ed = font(SERIF, int(w * 0.12 * scale), 500)
        y += w * 0.03
        tracked(d, cx, y, edition, ed, 0.04)
    return im


def bottle_label():
    """Body Mist Nº 01: cream paper label, cocoa type. Paper texture is subtle grain."""
    w, h = 1400, 1800
    paper = Image.new("RGBA", (w, h), (240, 232, 220, 255))
    noise = Image.effect_noise((w, h), 9).convert("L").filter(ImageFilter.GaussianBlur(0.6))
    grain = Image.merge("RGBA", [noise.point(lambda v: 236 + (v - 128) * 0.05)] * 3 + [Image.new("L", (w, h), 255)])
    paper = Image.blend(paper, grain, 0.35)
    art = label("body_mist", w, h, scale=1.22)
    paper.alpha_composite(art)
    # fine inset border
    d = ImageDraw.Draw(paper)
    m = 42
    d.rectangle([m, m, w - m, h - m], outline=(42, 32, 27, 120), width=3)
    return paper


def leaves(size=2048, seed=11):
    """Soft branches of leaves: white = light passes, black = shadow."""
    rnd = random.Random(seed)
    im = Image.new("L", (size, size), 255)
    d = ImageDraw.Draw(im)
    for _ in range(9):
        x, y = rnd.uniform(0, size), rnd.uniform(0, size)
        ang = rnd.uniform(0, math.tau)
        length = rnd.uniform(size * 0.35, size * 0.6)
        steps = 14
        for s in range(steps):
            t = s / steps
            px = x + math.cos(ang) * length * t
            py = y + math.sin(ang) * length * t
            ang += rnd.uniform(-0.12, 0.12)
            for side in (-1, 1):
                la = ang + side * rnd.uniform(0.6, 1.0)
                ll = rnd.uniform(size * 0.05, size * 0.09)
                lw = ll * 0.32
                cxl, cyl = px + math.cos(la) * ll / 2, py + math.sin(la) * ll / 2
                pts = []
                for k in range(24):
                    a = math.tau * k / 24
                    ex, ey = math.cos(a) * ll / 2, math.sin(a) * lw / 2 * (1 - 0.3 * math.cos(a))
                    pts.append((cxl + ex * math.cos(la) - ey * math.sin(la), cyl + ex * math.sin(la) + ey * math.cos(la)))
                d.polygon(pts, fill=0)
            d.line([(px, py), (px + math.cos(ang) * length / steps, py + math.sin(ang) * length / steps)], fill=0, width=6)
    return im.filter(ImageFilter.GaussianBlur(3))


def arch(size=1024):
    im = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(im)
    w = size * 0.42
    x0, x1 = (size - w) / 2, (size + w) / 2
    d.rectangle([x0, size * 0.42, x1, size * 0.95], fill=255)
    d.ellipse([x0, size * 0.42 - w / 2, x1, size * 0.42 + w / 2], fill=255)
    # mullion
    d.rectangle([size / 2 - 6, size * 0.2, size / 2 + 6, size * 0.95], fill=0)
    return im.filter(ImageFilter.GaussianBlur(2))


def main():
    TEX.mkdir(parents=True, exist_ok=True)
    bottle_label().save(TEX / "label_body_mist_paper.png")
    for key in LABELS:
        label(key).save(TEX / f"label_{key}.png")
    leaves().save(TEX / "leaves.png")
    arch().save(TEX / "arch.png")
    print("textures:", ", ".join(sorted(p.name for p in TEX.glob("*.png"))))


if __name__ == "__main__":
    main()
