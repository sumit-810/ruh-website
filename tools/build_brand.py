"""Generate the Gentle Company identity as true vector outlines.

Writes to assets/brand/:
  gentle-company-wordmark.svg        GENTLE COMPANY, one line (header, footer, documents)
  gentle-company-stacked.svg         GENTLE / COMPANY, two lines (packaging, square formats)
  gentle-company-monogram.svg        GC monogram in a soft arch (favicon, social avatar, seals)
  gentle-company-wordmark-ivory.svg  reversed wordmark for dark backgrounds
and assets/img/favicon.svg, plus assets/js/data/brand.js (inline SVG strings
the site uses; currentColor so CSS controls the colour).

Letterforms are Marcellus (SIL Open Font License, tools/brand-fonts/) with
custom tracking. Everything is converted to paths, so the files need no fonts
and can go straight to packaging, print and social profiles.

    pip install fonttools
    python tools/build_brand.py
"""
import json
from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / "tools" / "brand-fonts" / "Marcellus-Regular.ttf"
OUT = ROOT / "assets" / "brand"
DATA = ROOT / "assets" / "js" / "data" / "brand.js"
FAVICON = ROOT / "assets" / "img" / "favicon.svg"

COLORS = {"cocoa": "#2a201b", "milk": "#f6f2ec", "clay": "#9c5a40", "apricot": "#e9c2a2"}
TRACK = 0.2  # letter-spacing, in em — the wordmark's signature openness


def text_path(font, text, size, tracking_em=0.0):
    """(path data, advance width, (ymin, ymax)) for text at `size`, baseline y=0, y down."""
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font["head"].unitsPerEm
    hmtx = font["hmtx"]
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
    bounds = BoundsPen(gs)
    x = 0.0
    for i, ch in enumerate(text):
        name = cmap[ord(ch)]
        adv = hmtx[name][0] * scale
        if ch != " ":
            t = (scale, 0, 0, -scale, x, 0)
            gs[name].draw(TransformPen(pen, t))
            gs[name].draw(TransformPen(bounds, t))
        x += adv + (tracking_em * size if i < len(text) - 1 else 0)
    _, ymin, _, ymax = bounds.bounds
    return pen.getCommands(), x, (ymin, ymax)


def svg(w, h, body, title, extra=""):
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}"{extra}>'
        f"<title>{title}</title>{body}</svg>\n"
    )


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    font = TTFont(FONT)

    # 1. One-line wordmark. A word space of 0.62em keeps the two words reading as one name.
    g_d, g_w, (top, base) = text_path(font, "GENTLE", 100, TRACK)
    c_d, c_w, _ = text_path(font, "COMPANY", 100, TRACK)
    gap = 62
    cap_h = base - top
    pad = 2
    W = g_w + gap + c_w + pad * 2
    H = cap_h + pad * 2

    def wordmark_body(fill):
        return (
            f'<path fill="{fill}" transform="translate({pad} {pad - top:.2f})" d="{g_d}"/>'
            f'<path fill="{fill}" transform="translate({pad + g_w + gap:.2f} {pad - top:.2f})" d="{c_d}"/>'
        )

    (OUT / "gentle-company-wordmark.svg").write_text(svg(W, H, wordmark_body(COLORS["cocoa"]), "Gentle Company"), encoding="utf-8")
    (OUT / "gentle-company-wordmark-ivory.svg").write_text(svg(W, H, wordmark_body(COLORS["milk"]), "Gentle Company"), encoding="utf-8")

    # 2. Stacked lockup: GENTLE over COMPANY, optically matched widths.
    s_g, s_gw, (s_top, s_base) = text_path(font, "GENTLE", 100, 0.26)
    s_c, s_cw, _ = text_path(font, "COMPANY", 100, 0.14)
    lead = 38
    SW = max(s_gw, s_cw) + 40
    SH = (s_base - s_top) * 2 + lead + 40
    y1 = 20 - s_top
    y2 = y1 + (s_base - s_top) + lead
    stacked = (
        f'<path fill="{COLORS["cocoa"]}" transform="translate({(SW - s_gw) / 2:.2f} {y1:.2f})" d="{s_g}"/>'
        f'<path fill="{COLORS["cocoa"]}" transform="translate({(SW - s_cw) / 2:.2f} {y2:.2f})" d="{s_c}"/>'
    )
    (OUT / "gentle-company-stacked.svg").write_text(svg(SW, SH, stacked, "Gentle Company"), encoding="utf-8")

    # 3. Monogram: G and C sharing one baseline inside a soft arch (a nod to the vanity niche).
    m_d, m_w, (m_top, m_base) = text_path(font, "GC", 100, 0.06)
    AW, AH = 200, 240
    arch = f"M14 {AH - 14}V100A86 86 0 0 1 186 100V{AH - 14}Z"
    mono_scale = 0.74
    mx = (AW - m_w * mono_scale) / 2
    my = 158 - (m_base - m_top) * mono_scale / 2 - m_top * mono_scale
    def monogram(fg, bg=None, stroke=True):
        bgrect = f'<rect width="{AW}" height="{AH}" fill="{bg}"/>' if bg else ""
        outline = f'<path d="{arch}" fill="none" stroke="{fg}" stroke-width="3.2"/>' if stroke else ""
        return bgrect + outline + f'<path fill="{fg}" transform="translate({mx:.2f} {my:.2f}) scale({mono_scale})" d="{m_d}"/>'
    (OUT / "gentle-company-monogram.svg").write_text(svg(AW, AH, monogram(COLORS["cocoa"]), "Gentle Company monogram"), encoding="utf-8")

    # 4. Favicon: monogram reversed on cocoa, square.
    fav_scale = 0.165
    f_w = m_w * fav_scale
    f_h = (m_base - m_top) * fav_scale
    favicon = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">'
        f'<rect width="32" height="32" rx="7" fill="{COLORS["cocoa"]}"/>'
        f'<path fill="{COLORS["milk"]}" transform="translate({(32 - f_w) / 2:.2f} {(32 - f_h) / 2 - m_top * fav_scale:.2f}) scale({fav_scale})" d="{m_d}"/>'
        "</svg>\n"
    )
    FAVICON.write_text(favicon, encoding="utf-8")

    # 5. Inline strings for the site
    inline_wordmark = (
        f'<svg class="wordmark__svg" viewBox="0 0 {W:.1f} {H:.1f}" aria-hidden="true" focusable="false">'
        + wordmark_body("currentColor")
        + "</svg>"
    )
    inline_stacked = (
        f'<svg class="wordmark__stacked" viewBox="0 0 {SW:.1f} {SH:.1f}" aria-hidden="true" focusable="false">'
        + stacked.replace(COLORS["cocoa"], "currentColor")
        + "</svg>"
    )
    inline_mono = (
        f'<svg class="monogram" viewBox="0 0 {AW} {AH}" aria-hidden="true" focusable="false">'
        + monogram("currentColor")
        + "</svg>"
    )
    DATA.write_text(
        "// Generated by tools/build_brand.py — do not edit by hand.\n"
        f"export const wordmarkSvg = {json.dumps(inline_wordmark)};\n"
        f"export const stackedSvg = {json.dumps(inline_stacked)};\n"
        f"export const monogramSvg = {json.dumps(inline_mono)};\n",
        encoding="utf-8",
    )
    print(f"wordmark {W:.0f}x{H:.0f} (ratio {W / H:.2f}), stacked {SW:.0f}x{SH:.0f}, monogram {AW}x{AH}")
    print("brand assets:", ", ".join(sorted(p.name for p in OUT.iterdir())))


if __name__ == "__main__":
    main()
