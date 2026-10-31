# Gentle Company — Brand Guidelines

**Gentle Company** is the brand, and the only brand name. There is no sub-brand, house name or alternative identity.

The previous working name has been retired. It must not appear on the website, on packaging, or in any visual or marketing material.

---

## 1. The name

- Write **Gentle Company**: two words, title case, in running text.
- In the wordmark and on packaging, it is **GENTLE COMPANY**, all capitals.
- Don't abbreviate it in customer copy. "GC" is reserved for the monogram (§2.3).
- Product names follow the brand: **Body Mist Nº 01**, **Body Wash**, **Lip Balm**. Don't append the brand name to the product name ("Gentle Company Body Mist") except in page titles and search snippets.

## 2. Logo system

All assets are vector outlines; they need no fonts. Source: `tools/build_brand.py`; outputs in `assets/brand/`.

| Asset | File | Use |
|---|---|---|
| Wordmark (one line) | `gentle-company-wordmark.svg` / `-ivory.svg` | Header, footer, documents, social banners |
| Stacked lockup | `gentle-company-stacked.svg` | Packaging fronts, square formats, stickers |
| Monogram | `gentle-company-monogram.svg` | Favicon, social avatar, seals, tissue paper, caps |
| Favicon | `assets/img/favicon.svg` | Browser tab: monogram reversed on cocoa |

### 2.1 Wordmark
- **Typeface:** Marcellus (SIL Open Font License).
- **Tracking:** 0.2 em between letters, with a 0.62 em word space.
- **Why Marcellus:** its flared, softly cut serifs are classical without being cold. The terminals taper the way a brush stroke does, which reads as *gentle* while still holding up at 15 px in a header.
- **Clear space:** keep the height of the "G" free on every side.
- **Minimum size:** 110 px wide on screen (about 15 px cap height) and 30 mm in print.

### 2.2 Stacked lockup
- GENTLE above COMPANY, both centred, with widths optically matched (GENTLE is tracked wider).
- This is the lockup used on every pack.

### 2.3 Monogram
- G and C in Marcellus inside a soft arch, a nod to the vanity niche and the arched window of the photography.
- Use it where the full name doesn't fit. Never set it beside the wordmark as a "logo + name" pair.

### 2.4 Don'ts
- Don't stretch, outline, add shadows to, or recolour the logo outside the palette.
- Don't retype the wordmark in another font.
- Don't place it on a busy part of a photograph without enough contrast.
- Don't put the stacked lockup in navigation.

## 3. Colour

| Token | Hex | Role |
|---|---|---|
| Milk | `#F6F2EC` | Page background |
| Porcelain | `#FBF9F6` | Cards, panels |
| Sand | `#ECE3D7` | Alternate sections, image wells |
| Stone | `#CBBCAA` | Borders on sand |
| **Cocoa** | `#2A201B` | Text, ink on packaging, caps, primary buttons |
| Cocoa 2 | `#5D4F46` | Secondary text |
| Cocoa 3 | `#6F6056` | Meta text, captions |
| Clay | `#9C5A40` | Accent: links, focus rings, hover |
| Kohl | `#211915` | Footer, dark early-access panel |

**Line colours** (packaging and backgrounds for each category):

| Line | Packaging | Soft background |
|---|---|---|
| Body care | Apricot `#E9C6AA` | `#F3E1D2` |
| Face care | Milk `#E9E4DC` | `#E9E4DC` |
| Lip care | Rose `#DDB6AE` | `#F1E0DB` |
| Body Mist Nº 01 | Clear glass, apricot liquid, cream paper label | — |

**Contrast (WCAG 2.1), measured:**

| Foreground on background | Ratio | Passes |
|---|---|---|
| Cocoa on milk | 14.3 : 1 | AAA |
| Cocoa 2 on milk | 7.1 : 1 | AAA |
| Cocoa 3 on milk | 5.4 : 1 | AA |
| Cocoa 3 on sand | 4.8 : 1 | AA |
| Clay on milk | 4.8 : 1 | AA |
| On-dark `#F1E9DF` on kohl | 14.4 : 1 | AAA |
| On-dark 2 `#BCAE9F` on kohl | 8.0 : 1 | AAA |

## 4. Typography

| Role | Typeface | Notes |
|---|---|---|
| Wordmark | Marcellus | Outlined; never typed live |
| Display headlines | Cormorant Garamond 500, with italic 400 for emphasis | Used sparingly: one headline per section, six words or fewer where possible |
| UI and body | Instrument Sans 400–600 | Buttons and labels in capitals with 0.1–0.14 em tracking |

All three fonts are SIL OFL. The web fonts are subset to Latin and include ₹ and Nº.

## 5. Voice

- **Short.** A headline, plus one or two lines. If a section needs a paragraph, it probably needs an image instead.
- **Plain.** Say what the product is. No superlatives and no wellness clichés.
- **Honest.**
  - Publish only confirmed facts: price, size, notes, ingredients and claims all wait until they're final.
  - Unconfirmed information is left out, never replaced by "to be confirmed" text.
  - No testing, dermatological, natural, vegan or cruelty-free claims without evidence on file.

## 6. Packaging system

Every product shares one system.

**The family**
- The **stacked GENTLE COMPANY lockup**, with a short hairline rule and the product name in tracked Instrument Sans capitals.
- **Cocoa ink**, and **cocoa caps, pumps and lids**.
- Each line's packaging colour (apricot, milk or rose) on matte stock with a soft-touch coat.

**Body Mist Nº 01**
- A heavy clear-glass bottle with a rounded rectangular body, apricot liquid, a cream uncoated paper label and a cocoa cap with a champagne collar.
- **"Nº 01"** in Cormorant on the label marks the first release.
- The label carries no volume or claims until they are confirmed.

The renders in `tools/render/` are generated from these rules. Label artwork is typeset from the brand fonts (`tools/render/make_textures.py`) and mapped onto the packaging as an accurate graphic layer. The brand name is never AI-generated lettering.

The current imagery shows the **packaging design**. When manufactured packaging exists, photograph it to `PHOTOGRAPHY_BRIEF.md`; it must follow this system.

## 7. Photography — "Daylight vanity"

- **Light:** warm, low, directional daylight, with soft leaf shadows (the brand's signature texture). Backlight the glass so the liquid glows.
- **Surfaces:** apricot and milk plaster, travertine, marble, folded linen, a ceramic tray.
- **Composition:**
  - The product is the hero, and the GENTLE COMPANY label faces the camera and is legible.
  - Use one prop at most, chosen from the surfaces above.
  - For campaign frames, keep negative space on the side where the headline sits.
- **Families:** shoot the range together on one long shelf, or as category groups, to show it is one coherent brand.
- **Avoid:**
  - stock photos;
  - botanicals that imply fragrance notes the perfumer hasn't confirmed;
  - "results" imagery;
  - models without signed releases.

## 8. Website principles

1. The first screen shows Gentle Company and the product, not a manifesto.
2. Aim for about 75% image and 25% words.
3. Every section has one job; don't repeat messages.
4. Interactions should help people explore:
   - tabs on the collection shelf;
   - quick view;
   - hover shows a second image;
   - the gallery zooms;
   - moments switcher;
   - range hotspots;
   - sticky mobile bar.
5. Commerce stays honest. A price and bag appear only when the shop is open. Until then the action is "Notify me", which saves the email to Brevo.
