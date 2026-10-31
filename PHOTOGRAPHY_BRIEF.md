# Photography Brief: Rūh Body Mist Nº 01 (by GentleCare)

Every product image on the site is currently a **concept render**. This brief covers what to photograph so real photos can replace the renders one by one, and how to put them on the site.

## 1. How photos replace renders

1. Name each final, retouched file after the image key it replaces (see the shot list), e.g. `pack_front.jpg`.
2. Put the files in `assets-src/photography/`. You can use JPG, PNG, WebP or TIFF in sRGB.
3. Optional: write alt text in `assets-src/photography/alt.json`:
   ```json
   { "pack_front": "Rūh Body Mist Nº 01, a frosted glass bottle with a terracotta cap" }
   ```
4. Run the image build, either for every key or for only the keys you name:
   ```bash
   python3 tools/build_images.py
   ```
   ```bash
   python3 tools/build_images.py pack_front hero_wide
   ```

The build writes AVIF, WebP and JPEG files at every width and marks each key as `photo` in `assets/js/data/images.js`. Keys you haven't photographed keep their render, so you can move over in stages.

Once a key's photo is built, the site stops showing its "Concept render" caption. Run `node tools/launch_check.mjs` to see which renders are still in use.

**After shooting the Nº 01 photos:**
- Update the `alt` texts in `site.config.js` → `products[0].images`, because they still say "concept bottle".
- Set `imageDisclaimer: null`.

## 2. The look

The art direction is in `BRAND_DESIGN_SYSTEM.md`:
- **Light:** warm, low, directional daylight, or patterned light through a carved *jaali* screen.
- **Surfaces:** travertine, limewash, unbleached linen, terracotta.
- **Colour:** stays in the palette (ivory `#f6f1ea`, sand, clay `#94503c`, cocoa `#2e231d`).
- **Retouching:** no heavy saturation, no cool or blue casts, and no props that compete with the bottle.
- **Text:** none in the frame except the product's own label.

**Honesty rules** (these follow from the site's no-invented-claims policy):
- Photograph **the real, final pack**. The site must not show packaging that customers won't receive.
- Don't use stock images of ingredients that aren't in the formula, such as a rose if there's no rose note.
- Don't show "results" imagery (glowing skin, before and after). Body Mist Nº 01 is a fragrance product.
- Model shots need a signed model release kept on file.

## 3. Shot list

These keys are what the site uses today. Aspect ratios are the ones the layouts crop to, so frame with some room to spare.

| Key | Aspect / min. size | Where it appears | Shot |
|---|---|---|---|
| `hero_wide` | 16:9, ≥ 2400 × 1350 | Home hero (desktop), social share image | Bottle on a stone block, jaali light across the wall, calm negative space in the **lower left**, where the headline sits on desktop |
| `hero_portrait` | 4:5, ≥ 1600 × 2000 | Home hero (mobile), product gallery | Same scene in portrait, bottle in the lower-middle third |
| `pack_front` | 4:5, ≥ 1600 × 2000 | Product page (first image), cards, bag, search, structured data | Clean front pack shot on a warm ivory background, label legible, soft shadow |
| `pack_angle` | 4:5 | Home feature, Our Story (GentleCare chapter), product gallery | Three-quarter view showing the bottle's depth |
| `pack_open` | 4:5 | Product gallery | Cap off, actuator visible |
| `detail_label` | 4:5 | Product gallery, Our Story chapter, home gallery | Macro of the label: name, volume, Nº 01 |
| `detail_cap` | 4:5 | Home "ritual" step | Macro of the cap and shoulder in patterned light |
| `mist` | 4:5 | Home ritual intro, product gallery | Spray captured in warm backlight (use a fast flash or a high shutter speed) |
| `ritual_ledge` | 4:5 | Home "After the shower" step, journal article | Bottle on a bathroom stone ledge beside a folded linen towel |
| `niche` | 4:5 | Home philosophy section and ritual step, Our Story opener | Bottle in an arched limewash niche |
| `wall_light` | 16:10, ≥ 1920 × 1200 | Home early-access section, Our Story chapter | Light only: jaali pattern on limewash, no product |

**Coming soon (`up_*`)**
- These are deliberately **blank concept forms** for products that don't exist yet, and the site labels them that way.
- Keep the renders until each product's real packaging exists, then shoot it to the same 4:5 spec as `pack_front`.

**Optional extras for social and launch use (not wired into the site)**
- A flat lay of the pack with its outer carton.
- Hand-held use at the wrist.
- Lifestyle shots with a model in natural Indian light.
- A short 6–10 s vertical video of the spray, which could replace the `mist` still later.

## 4. Technical

- RAW capture. Deliver retouched **sRGB** JPEG at quality 95 or above, or 16-bit TIFF.
- Long edge **≥ 2400 px** for `hero_wide`, and ≥ 2000 px for 4:5 shots. The build warns below 1600 px wide.
- Keep the bottle sharp edge to edge (focus-stack the pack shots if needed).
- Clean the dust and fingerprints off the glass during retouching, but leave the shape, colour and label of the real pack exactly as they are.
- Deliver a **colour-checked** set: shoot a grey card in each setup, so the terracotta cap matches the real product on every shot.
- File names must match the keys exactly, in lower case (`pack_front.jpg`, not `Pack Front FINAL v2.jpg`).

## 5. Rights and records

- Get a written licence or assignment from the photographer covering web, social, marketplace and print use, with no time limit.
- Keep model and location releases on file.
- Credit the photographer in `RESEARCH_EVIDENCE.md` or your asset register.
