# Photography Brief: Gentle Company

The website's product imagery is rendered from Gentle Company's packaging design (`tools/render/`). When manufactured packaging exists, photograph it to this brief. Photos replace the renders one image at a time.

## 1. How photos replace renders

1. Name each retouched file after the image key it replaces (table below), e.g. `pack_front.jpg`.
2. Put it in `assets-src/photography/`. JPG, PNG, WebP or TIFF are fine, in sRGB.
3. Optional: write alt text in `assets-src/photography/alt.json`:
   ```json
   { "pack_front": "Gentle Company Body Mist Nº 01 on a warm backdrop" }
   ```
4. Build the images, either for every key or for only the keys you name:
   ```bash
   python3 tools/build_images.py
   ```
   ```bash
   python3 tools/build_images.py pack_front hero_wide
   ```
   This writes AVIF, WebP and JPEG at every size and marks each key as `photo` in the manifest.

## 2. The look: "Daylight vanity"

Follow `GENTLE_COMPANY_BRAND_GUIDELINES.md` §7:
- warm, low daylight with soft leaf shadows;
- apricot and milk plaster, travertine, marble, folded linen;
- backlight the glass so the liquid glows;
- one prop at most.

**The GENTLE COMPANY label must face the camera and be legible** in every product shot.

**Honesty rules**
- Photograph the real, final pack.
- Don't use props that imply ingredients or fragrance notes that aren't in the formula.
- No "results" imagery.
- Keep a signed release for any model.

## 3. Shot list

| Key | Aspect / min. size | Where it appears | Shot |
|---|---|---|---|
| `hero_wide` | 16:9, ≥ 2400 × 1350 | Homepage hero (desktop), share image | Bottle on travertine, right third. Apricot plaster wall with leaf shadows. Calm space on the left for the headline |
| `hero_portrait` | 4:5, ≥ 1440 × 1800 | Homepage hero (mobile), gallery | The same scene in portrait, bottle centred |
| `pack_front` | 4:5 | First gallery image, cards, quick view | Front packshot on a warm seamless backdrop, backlit, label legible |
| `pack_angle` | 4:5 | Gallery, early-access panel | Three-quarter view |
| `pack_open` | 4:5 | Gallery | Cap off, spray visible, cap lying beside |
| `detail_label` | 4:5 | Gallery, moments | Macro of the label: GENTLE COMPANY / BODY MIST / Nº 01 |
| `mist` | 4:5 | Gallery, moments | Spray in warm backlight against clay plaster |
| `vanity` | 4:5 | Gallery, moments | Marble vanity, ceramic tray, folded towel, vase |
| `ritual` | 4:5 | Homepage intro, journal | Travertine bath ledge, folded linen |
| `lineup` | 16:9 | "What comes next" (hotspots), Our Story | The whole range on one long shelf, in the same order as now (otherwise re-measure the hotspots) |
| `family_body`, `family_face`, `family_lip` | 4:5 | Category tiles, collections | Each line grouped on its backdrop colour |
| `up_*` | 4:5, ≥ 1020 × 1275 | Product cards in the range | Single product, front-on, on its line's backdrop |

## 4. Technical

- Shoot RAW. Deliver sRGB JPEG at quality 95 or above, or 16-bit TIFF.
- Keep the pack sharp edge to edge; focus-stack if needed.
- Shoot a grey card in every setup so the cap and packaging colours match the real product.
- Retouch dust only. Never alter the pack's shape, colour or label.
- If the `lineup` photo changes the product positions, update the hotspots in `assets/js/data/hotspots.js` (x and y are percentages of the image).

## 5. Rights

- Get a written licence or assignment from the photographer covering web, social, marketplace and print, with no time limit.
- Keep model and location releases on file.
