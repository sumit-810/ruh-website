# Brand Design System — "Soft Architecture"

The visual system for the brand (working name **Rūh**). Every token below is implemented in [`assets/css/main.css`](assets/css/main.css) §2 *Tokens*. Change a token there and it changes everywhere.

## 1. Design rationale

**Research finding:** Indian D2C beauty sites compete through saturated colour, dense grids and discount mechanics. Indian luxury relies on ornate heritage codes (maroon, gold, festive motifs). International premium (Aesop, Byredo) is restrained but cool and Western. See `RESEARCH_AND_BRAND_STRATEGY.md` §1–2.

**Direction:** *Soft Architecture.* Warm limewash, travertine and terracotta clay, lit by low sun through a carved Indian **jaali** screen. It is modern-Indian without ornament and premium without austerity, and its calm stands out in a loud category.

**Why it works for a skincare and body-care house:**
- **Light** is the brand's metaphor (softening, care, ritual) and its signature asset. Every hero image carries patterned jaali light, which no competitor in the category owns.
- **Warm neutrals** flatter skin and product, travel well across body, face and lip ranges, and age better than trend colours.
- **One earthy accent (terracotta clay)** links the bottle cap, UI accents and future packaging into one recognisable system.
- **Editorial Didone + geometric sans** is the classic beauty-magazine pairing. It reads as premium immediately and avoids the overused Playfair/Inter and Cormorant/Montserrat combinations common to AI-generated templates.

**Deliberately avoided:** gradients-as-decoration, floating blobs, glassmorphism, emoji, badge clutter, countdown timers, pop-ups, and Sol de Janeiro yellow or Rhode grey (to stay distinct).

## 2. Colour

| Token | Hex | Use | Contrast on Ivory |
|---|---|---|---|
| `--ivory` | `#F6F1EA` | Page canvas | — |
| `--ivory-2` | `#FBF8F4` | Raised surfaces (forms, summaries, notices) | — |
| `--limewash` | `#EEE5D9` | Alternate sections, service band | — |
| `--sand` | `#E3D6C5` | Image wells, tiles, placeholders | — |
| `--stone` | `#CDBCA6` | Borders on sand, inputs | — |
| `--line` | `#DCCFBE` | Hairlines and dividers | — |
| `--champagne` | `#B89A6A` | Fine details, stars, dashed "placeholder" outlines | decorative only |
| `--clay` | `#94503C` | **Brand accent**: eyebrows, links, focus ring, badges | 5.4 : 1 (AA; 4.9 on limewash) |
| `--clay-deep` | `#7D4231` | Accent hover / primary button hover | 6.9 : 1 |
| `--rose` | `#E2C9BD` | Soft wash, text selection | — |
| `--cocoa` | `#2E231D` | Primary text, primary buttons | 13.6 : 1 (AAA) |
| `--cocoa-2` | `#66564B` | Secondary text | 6.2 : 1 (AA) |
| `--cocoa-3` | `#736356` | Meta labels (uppercase, small) | 5.1 : 1 (AA; 4.6 on limewash) |
| `--kohl` | `#1F1915` | Footer, announcement bar, toasts | — |
| `--on-dark` / `--on-dark-2` | `#EFE6DA` / `#B9AA99` | Text on kohl | 14.1 : 1 / 7.7 : 1 |

**Ratio of use:** about 80% ivory/limewash/sand, 15% cocoa (type), 5% clay (accent). Clay never fills large areas; it is the "cap" of the system, just as it is the cap of the bottle.

**Product colour (concept bottle):** frosted glass, pale champagne liquid, champagne-metal collar, terracotta cap (render values in `tools/render/scenes.py` → `PALETTE`, `BOTTLE`).

## 3. Typography

| Role | Family | Settings |
|---|---|---|
| Display / headings | **Bodoni Moda** (variable, optical size) | Weight 400; italic for emphasis words; tracking −0.015em; line-height 0.98–1.15 |
| Text / UI | **Jost** (variable) | 400 body, 500 labels; body 17 px / 1.65 |
| Labels / eyebrows / buttons | Jost 500 uppercase | 12–13 px, tracking 0.14–0.18em |

Both are SIL Open Font License and **self-hosted** (`assets/fonts/`, Latin + Latin-Extended subsets, which include ₹ and the macron in Rūh). No third-party font requests are made.

**Scale (fluid, `clamp`)**

| Token | Range | Used for |
|---|---|---|
| `--fs-3xl` | 46 → 102 px | Home hero |
| `--fs-2xl` | 40 → 76 px | Page heroes |
| `--fs-xl` | 32 → 52 px | Section titles |
| `--fs-lg` | 24 → 32 px | Sub-titles, card titles |
| `--fs-md` | 20 px | Lead text |
| `--fs-base` | 17 px | Body |
| `--fs-sm` / `--fs-xs` | 14 / 12 px | Meta, labels |

**Rules**
- Bodoni is never set below 18 px (hairlines disappear). Use Jost for small text.
- Headlines use `*italic*` emphasis on the second clause ("A softer light, *worn on skin.*"), a recurring editorial cadence.
- Eyebrows always carry the eight-point star glyph (from the jaali) and sit in clay.
- `text-wrap: balance` on headings, `pretty` on paragraphs. Body measure is capped at 62ch.

## 4. Spacing & layout

- **4-pt base scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 (`--s-1` … `--s-10`).
- **Section rhythm:** `--section` = 72 → 152 px vertical padding, fluid.
- **Gutter:** `--gutter` = 16 → 56 px (16 px minimum on phones).
- **Max width:** 1440 px; narrow reading container 920 px.
- **Grids:** editorial splits (1 : 1, 1.25 : 1, 1.35 : 1), card grids `auto-fill minmax(270px, 1fr)`, and every single-column grid uses `minmax(0, 1fr)` to prevent overflow.
- **Image ratios:** 4 : 5 (product, editorial portrait), 3 : 4 (ritual), 1 : 1 (social), 16 : 9 (wide hero / articles).

## 5. Components

| Component | Spec |
|---|---|
| **Primary button** | Cocoa fill, ivory text, 52 px tall, 2 px radius, uppercase Jost 500 / 0.16em; hover → clay-deep. Price in CTA: "Add to bag — ₹1,295". |
| **Ghost button** | 1 px current-colour outline; hover fills cocoa. |
| **Light button** | Ivory on dark surfaces (footer). |
| **Text link** | Uppercase, 1 px underline that retracts on hover; arrow nudges 4 px. |
| **Icon button** | 44 × 44 px hit area (WCAG target size), subtle tint on hover. |
| **Inputs** | 52 px, ivory-2 fill, stone border, cocoa focus border + 3 px clay halo; errors in `--error` with `aria-invalid` and an inline message. |
| **Chips** | Pill checkboxes/radios, 38 px; selected = cocoa fill. |
| **Tags** | Small uppercase pills: *New* (cocoa), *Coming soon* (frosted ivory with a clay dot), *Outline*. |
| **Product card** | 4 : 5 sand well; second image cross-fades on hover; quick add slides up on hover (always visible on touch); Bodoni name, Jost scent line, size meta. |
| **Coming-soon card** | Same frame, *Coming soon* tag, "In development" meta, *Notify me* link. Never shows a price or add-to-bag. |
| **Tiles** | 4 : 5 image, ivory gradient label strip (for legibility only), circular arrow. |
| **Accordions** | Native `<details>/<summary>` (keyboard and screen-reader friendly), animated plus/minus. |
| **Drawers** | Bag (right) and menu (left): 440 px max, scrim, focus trap, Esc to close, focus restored to trigger. |
| **Sticky purchase bar** | Appears only when the main Add-to-bag is off-screen; hides near the footer; safe-area aware; removed from the tab order when hidden. |
| **Placeholder marker** (`.prov`) | Dashed champagne pill, shown only when `previewMode: true`, so provisional content is never mistaken for final. |

## 6. Navigation

- **Header:** centred wordmark; left: Shop and Skincare (mega menus), Our Story, Journal, Contact; right: Search, Account, Bag (count).
- **On the home page** the header is transparent over the hero and becomes frosted ivory after 8 px of scroll or when a mega menu opens.
- **Mega menus** list available products first and upcoming items in muted type with a *Coming soon* label, plus a featured product card and a "what's next" tile.
- **Mobile (< 1100 px):** hamburger → left drawer with accordion sections; *Soon* labels on upcoming items.
- **Announcement bar:** rotates every 5 s, with a pause control (WCAG 2.2.2) and pause-on-hover; static if reduced motion is on.

## 7. Image treatment

- **Look:** warm golden-hour sun (≈ 3,200–3,600 K feel) from the upper left, one hard light source broken by a jaali pattern, soft bounce fill, low-contrast AgX tone curve, no pure white and no pure black.
- **Surfaces:** limewash plaster, travertine (with pits and veins), sand linen, terracotta.
- **Products:** concept bottle on a plinth, never floating; the patterned light always crosses the product.
- **Coming soon:** blank, label-free *plaster maquettes* of generic formats (tube, jar, pump, dropper, stick). These communicate "in development" without inventing final packaging.
- **Captions:** every render of the bottle is labelled "Concept render — final packaging may differ" until real photography replaces it.
- **Delivery:** AVIF → WebP → JPEG `<picture>` sources at 480–2400 px, explicit width/height (no layout shift), lazy-loaded below the fold, `fetchpriority="high"` on the hero.

**Future photography brief (for the real shoot):** keep the same light (a real jaali or cut-steel gobo in front of a 2–3 kW HMI), limewash backdrops and travertine plinths. Add human touch (hands, shoulders, décolleté) in warm skin-true grading, across a range of Indian skin tones.

## 8. Motion

| Pattern | Spec |
|---|---|
| Reveal on scroll | Opacity 0 → 1, translateY 18 → 0 px, 900 ms `cubic-bezier(.16,1,.3,1)`, staggered 90 ms |
| Image hover | scale 1.035–1.05 over 1.2–1.4 s |
| Drawers / panels | 520 ms ease-out slide |
| Header state | 360 ms background/border fade |
| Micro (buttons, chips) | 180 ms |
| Reduced motion | All transitions about 0 ms; reveals shown immediately; announcement rotation paused |

## 9. Mobile rules

1. Content first: on phones the hero image sits above the text (no text over images).
2. Minimum 16 px gutters; no horizontal page scroll (tested at 390 px).
3. Horizontal swipe rows (ritual steps, related items, gallery) use scroll-snap and show a peek of the next card.
4. Tap targets ≥ 44 px; quantity steppers 40–52 px.
5. Sticky Add-to-bag bar on the PDP; the bag drawer is full-width on small screens.
6. Inputs are 16 px+ (no iOS zoom) and use the right `inputmode`/`autocomplete` (email, tel, postal-code).

## 10. Brand voice (quick reference)

Calm, warm, precise. Short sentences. Sensory nouns over adjectives. No exclamation marks, no superlatives, and no claims we cannot prove. Examples: "A softer light, worn on skin." · "Made to be returned to." · "One honest price."

## 11. Logo & brand assets (Rūh by GentleCare)

Generated as true vector outlines by `tools/build_brand.py` (no fonts needed), in `assets/brand/`:

| File | Use |
|---|---|
| `ruh-wordmark.svg` | Primary logo: RŪH in Bodoni Moda, tracked 0.32em, with a custom macron bar (the font's hairline macron disappears at small sizes) |
| `ruh-star.svg` | The **Rūh star**: the eight-point jaali star. Brand symbol for favicons, stickers, carton seals and pattern |
| `ruh-lockup.svg` / `ruh-lockup-dark.svg` | Star + wordmark + "BY GENTLECARE": packaging back panels, shipping boxes, press, invoices |
| `ruh-social-avatar.png` | 1080 × 1080 profile image (ivory mark on terracotta) for Instagram, WhatsApp Business and marketplaces |

**Brand architecture.** **Rūh** is the consumer brand; **GentleCare** is the company. The endorsement reads "A GentleCare brand" or "by GentleCare" and is always secondary: small, tracked capitals, about 15% of the wordmark's cap height. GentleCare appears as the legal seller in the footer, product information (Marketed by), invoices and policies. Never set "GentleCare" larger than "Rūh" on consumer-facing surfaces.

**Rules**
- **Clear space:** at least the height of the macron gap (about 0.3 × cap height) on all sides; on packaging, at least the width of the "R".
- **Minimum size:** wordmark 18 px tall on screen and 6 mm in print; the star alone 12 px and 3 mm.
- **Colour:** cocoa on ivory (primary), ivory on kohl, or ivory on terracotta. The star may be terracotta or champagne while the wordmark stays one colour. Never recolour the wordmark in clay on a busy photograph.
- **Don't:** re-typeset the wordmark from the font, stretch it, change the tracking, add effects, or place it on the jaali-light pattern where shadows cross the letters.
