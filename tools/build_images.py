"""Turn source images into optimised responsive images.

Sources, per image key (e.g. hero_wide, pack_front):
  1. assets-src/photography/<key>.{jpg,jpeg,png,webp,tif,tiff}  — real photography (preferred)
  2. tools/render/out/<key>.png                                  — concept renders (Blender)

For each key found it writes assets/img/<key>-<width>.{avif,webp,jpg} and
updates assets/js/data/images.js — the manifest the site reads for srcset,
width/height, default alt text and `kind` ("photo" or "render"). Keys with no
source this run are kept as they are, so you can replace renders one photo at
a time. The site labels renders as concept renders and stops doing so for a
key as soon as its photo is built.

Alt text for photos comes from assets-src/photography/alt.json
({"pack_front": "…"}) when present.

    pip install pillow pillow-avif-plugin   # AVIF support on older Pillow
    python3 tools/build_images.py
    python3 tools/build_images.py pack_front hero_wide   # only these keys

See PHOTOGRAPHY_BRIEF.md for the shot list, crops and minimum sizes.
"""
import json
import sys
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "render" / "out"
PHOTO = ROOT / "assets-src" / "photography"
PHOTO_EXT = (".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff")
MIN_WIDTH = 1600  # warn when a photo is smaller than this
DST = ROOT / "assets" / "img"
MANIFEST = ROOT / "assets" / "js" / "data" / "images.js"

WIDTHS = [480, 800, 1200, 1600, 2400]
QUALITY = {"avif": 52, "webp": 78, "jpg": 82}

ALT = {
    "hero_wide": "Gentle Company Body Mist Nº 01 on a travertine block against warm apricot plaster, in leaf-dappled sunlight",
    "hero_portrait": "Body Mist Nº 01 on a travertine block against apricot plaster, in leaf-dappled sunlight",
    "pack_front": "Gentle Company Body Mist Nº 01: a clear glass bottle of apricot-coloured mist with a cocoa cap and a cream label",
    "pack_angle": "Body Mist Nº 01 seen at an angle, showing the depth of the glass",
    "pack_open": "Body Mist Nº 01 with its cap off, showing the spray",
    "detail_label": "Close-up of the label: GENTLE COMPANY, Body Mist, Nº 01",
    "mist": "A fine mist leaving the bottle in warm backlight",
    "vanity": "Body Mist Nº 01 on a ceramic tray on a marble vanity, beside a folded towel",
    "ritual": "Body Mist Nº 01 on a travertine bath ledge beside a folded linen towel",
    "lineup": "The Gentle Company range on a long travertine shelf",
    "family_body": "Gentle Company body care in apricot packaging",
    "family_face": "Gentle Company face care in milk-white packaging",
    "family_lip": "Gentle Company lip care in rose packaging",
}


def load_manifest():
    if not MANIFEST.exists():
        return {}
    text = MANIFEST.read_text(encoding="utf-8")
    data = json.loads(text[text.index("{"): text.rindex("}") + 1])
    for m in data.values():
        m.setdefault("kind", "render")
    return data


def sources(only):
    """{key: (path, kind)} — photography wins over renders."""
    found = {}
    if SRC.exists():
        for f in sorted(SRC.glob("*.png")):
            found[f.stem] = (f, "render")
    if PHOTO.exists():
        for f in sorted(PHOTO.iterdir()):
            if f.suffix.lower() in PHOTO_EXT:
                found[f.stem] = (f, "photo")
    if only:
        found = {k: v for k, v in found.items() if k in only}
    return found


def photo_alt():
    f = PHOTO / "alt.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}


def main():
    only = set(sys.argv[1:])
    DST.mkdir(parents=True, exist_ok=True)
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    manifest = load_manifest()
    alts = photo_alt()
    for key, (src, kind) in sources(only).items():
        im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        w, h = im.size
        if kind == "photo" and w < MIN_WIDTH:
            print(f"  ! {key}: photo is only {w}px wide (aim for {MIN_WIDTH}px or more)")
        widths = sorted(set([x for x in WIDTHS if x < w] + [w]))
        for old in DST.glob(f"{key}-*.*"):
            if old.stem.rsplit("-", 1)[-1].isdigit():
                old.unlink()  # drop stale widths from a previous source
        for tw in widths:
            th = round(h * tw / w)
            r = im if tw == w else im.resize((tw, th), Image.LANCZOS)
            r.save(DST / f"{key}-{tw}.avif", quality=QUALITY["avif"])
            r.save(DST / f"{key}-{tw}.webp", quality=QUALITY["webp"], method=6)
            r.save(DST / f"{key}-{tw}.jpg", quality=QUALITY["jpg"], optimize=True, progressive=True)
        if kind == "photo":
            alt = alts.get(key) or ALT.get(key, "").removeprefix("Concept render: ")
            alt = alt[:1].upper() + alt[1:]
        else:
            alt = ALT.get(key, manifest.get(key, {}).get("alt", ""))
        manifest[key] = {"w": w, "h": h, "widths": widths, "alt": alt, "kind": kind}
        print(f"{key} ({kind}): {w}x{h} -> {widths}")

    MANIFEST.write_text(
        "// Generated by tools/build_images.py — do not edit by hand.\n"
        f"export const images = {json.dumps(dict(sorted(manifest.items())), indent=2, ensure_ascii=False)};\n",
        encoding="utf-8",
    )
    renders = sorted(k for k, m in manifest.items() if m["kind"] == "render")
    print(f"{len(manifest) - len(renders)} photo(s), {len(renders)} rendered image(s) in use" + (f": {', '.join(renders)}" if renders else ""))

    # social share image (1200x630): the hero, with the outlined wordmark set on the calm left side
    hero = next((f for f in [*(PHOTO / f"hero_wide{e}" for e in PHOTO_EXT), SRC / "hero_wide.png"] if f.exists()), None)
    if hero and (not only or "hero_wide" in only):
        im = ImageOps.exif_transpose(Image.open(hero)).convert("RGB")
        w, h = im.size
        tw, th = 1200, 630
        scale = max(tw / w, th / h)
        r = im.resize((round(w * scale), round(h * scale)), Image.LANCZOS)
        left = (r.width - tw) // 2
        og = r.crop((left, 0, left + tw, th))
        mark = ROOT / "assets" / "brand" / "og-wordmark.png"
        if mark.exists():
            wm = Image.open(mark).convert("RGBA")
            og.paste(wm, (72, th - 72 - wm.height), wm)
        og.save(DST / "og-image.jpg", quality=86, optimize=True)

    # favicon.svg is written by tools/build_brand.py
    print("manifest:", MANIFEST.relative_to(ROOT), len(manifest), "images")


if __name__ == "__main__":
    main()
