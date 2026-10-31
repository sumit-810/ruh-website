"""Generate the brand identity files as true vector outlines.

Writes to assets/brand/:
  ruh-wordmark.svg      RŪH wordmark (Bodoni Moda, outlined, tracked)
  ruh-star.svg          the Rūh star — eight-point jaali star symbol
  ruh-lockup.svg        star + wordmark + "BY GENTLECARE" endorsement
  ruh-lockup-dark.svg   same, ivory on kohl
and assets/js/data/brand.js (inline SVG strings the header uses).

Text is converted to paths, so the files need no fonts and can go straight
to packaging, print and social profiles.

    pip install fonttools
    python tools/build_brand.py
"""
import json
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "tools" / "render"
OUT = ROOT / "assets" / "brand"
DATA = ROOT / "assets" / "js" / "data" / "brand.js"

BRAND = "RŪH"
ENDORSEMENT = "BY GENTLECARE"
COLORS = {"cocoa": "#2e231d", "clay": "#94503c", "ivory": "#f6f1ea", "kohl": "#1f1915", "champagne": "#b89a6a"}
# Eight-point star from the jaali lattice (10 x 10 units)
STAR = "M5 0l1.2 2.1L8.5 1.5 7.9 3.8 10 5 7.9 6.2l.6 2.3-2.3-.6L5 10 3.8 7.9l-2.3.6.6-2.3L0 5l2.1-1.2-.6-2.3 2.3.6z"


def instance(path, **axes):
    font = TTFont(path)
    return instantiateVariableFont(font, axes)


def text_path(font, text, size, tracking_em=0.0):
    """Return (svg path data, width, (ymin, ymax), glyph positions) for text set at `size` px, baseline y=0."""
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upm = font["head"].unitsPerEm
    scale = size / upm
    hmtx = font["hmtx"]
    pen = SVGPathPen(gs)
    bounds = BoundsPen(gs)
    x = 0.0
    positions = []
    for i, ch in enumerate(text):
        name = cmap[ord(ch)]
        positions.append((x, hmtx[name][0] * scale))
        t = (scale, 0, 0, -scale, x, 0)  # flip y: font units are y-up
        gs[name].draw(TransformPen(pen, t))
        gs[name].draw(TransformPen(bounds, t))
        adv = hmtx[name][0] * scale
        x += adv + (tracking_em * size if i < len(text) - 1 else 0)
    xmin, ymin, xmax, ymax = bounds.bounds
    return pen.getCommands(), x, (ymin, ymax), positions


def svg(width, height, body, title):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.1f} {height:.1f}" width="{width:.0f}" height="{height:.0f}" role="img" aria-label="{title}">'
        f"<title>{title}</title>{body}</svg>\n"
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    serif = instance(FONTS / "BodoniModa[opsz,wght].ttf", wght=430, opsz=96)
    sans = instance(FONTS / "Jost[wght].ttf", wght=480)

    # Wordmark — tracked like the header (0.32em)
    # Set "RUH" and draw our own macron: the font's hairline macron vanishes at small sizes.
    wm_d, wm_w, (cap_top, wm_y1), pos = text_path(serif, BRAND.replace("Ū", "U"), 100, tracking_em=0.32)
    ux, uadv = pos[BRAND.index("Ū")]
    bar_w, bar_h, gap = uadv * 0.46, 3.4, 9
    bar_x, bar_y = ux + (uadv - bar_w) / 2, cap_top - gap - bar_h
    wm_d += f"M{bar_x:.2f} {bar_y:.2f}h{bar_w:.2f}v{bar_h:.2f}h{-bar_w:.2f}z"
    wm_y0 = bar_y
    pad = 2
    wm_h = wm_y1 - wm_y0
    wordmark = svg(
        wm_w + pad * 2,
        wm_h + pad * 2,
        f'<path fill="currentColor" transform="translate({pad - 0:.1f} {pad - wm_y0:.1f})" d="{wm_d}"/>',
        "Rūh",
    )
    (OUT / "ruh-wordmark.svg").write_text(wordmark.replace("currentColor", COLORS["cocoa"]), encoding="utf-8")

    (OUT / "ruh-star.svg").write_text(svg(100, 100, f'<path fill="{COLORS["clay"]}" transform="scale(10)" d="{STAR}"/>', "Rūh star"), encoding="utf-8")

    # Lockup: star / wordmark / endorsement, centred
    en_d, en_w, (en_y0, en_y1), _ = text_path(sans, ENDORSEMENT, 15, tracking_em=0.32)
    W = max(wm_w, en_w) + 40
    star_size = 30
    y_star = 10
    y_wm = y_star + star_size + 26 - wm_y0
    y_en = y_wm + wm_y1 + 30 - en_y0
    H = y_en + en_y1 + 12

    def lockup(fg, accent, bg=None):
        rect = f'<rect width="100%" height="100%" fill="{bg}"/>' if bg else ""
        return svg(
            W,
            H,
            rect
            + f'<path fill="{accent}" transform="translate({(W - star_size) / 2:.1f} {y_star}) scale({star_size / 10})" d="{STAR}"/>'
            + f'<path fill="{fg}" transform="translate({(W - wm_w) / 2:.1f} {y_wm:.1f})" d="{wm_d}"/>'
            + f'<path fill="{fg}" fill-opacity="0.72" transform="translate({(W - en_w) / 2:.1f} {y_en:.1f})" d="{en_d}"/>',
            "Rūh by GentleCare",
        )

    (OUT / "ruh-lockup.svg").write_text(lockup(COLORS["cocoa"], COLORS["clay"], COLORS["ivory"]), encoding="utf-8")
    (OUT / "ruh-lockup-dark.svg").write_text(lockup(COLORS["ivory"], COLORS["champagne"], COLORS["kohl"]), encoding="utf-8")

    # Inline strings for the site (currentColor so CSS controls the colour)
    inline_wordmark = (
        f'<svg class="wordmark__svg" viewBox="0 0 {wm_w + pad * 2:.1f} {wm_h + pad * 2:.1f}" aria-hidden="true" focusable="false">'
        f'<path fill="currentColor" transform="translate({pad:.1f} {pad - wm_y0:.1f})" d="{wm_d}"/></svg>'
    )
    inline_star = f'<svg class="star-mark" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path fill="currentColor" d="{STAR}"/></svg>'
    DATA.write_text(
        "// Generated by tools/build_brand.py — do not edit by hand.\n"
        f"export const wordmarkSvg = {json.dumps(inline_wordmark)};\n"
        f"export const starSvg = {json.dumps(inline_star)};\n",
        encoding="utf-8",
    )
    print("brand assets:", ", ".join(sorted(p.name for p in OUT.iterdir())))


if __name__ == "__main__":
    main()
