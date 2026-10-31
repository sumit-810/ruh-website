# Gentle Company: Research & Design Strategy

**Purpose:** decide, from evidence, how Gentle Company's website should look and behave. The brief is to move from a text-led editorial site to a **product-first, photography-led** premium beauty storefront for India. The first product is a Body Mist, and body, face and lip care follow.

**Date of research:** 31 October 2026.
**Method:** live pages rendered remotely through Firecrawl, with desktop screenshots (1440 × 900), mobile screenshots (360 px), and structured extraction of page sections, cards, galleries and product-page anatomy. Screenshots were reviewed by eye in contact sheets.

The extraction step is machine-written, so any claim in this document that depends on how a page *looks* was checked against the screenshot. Direct browsing from the build environment is blocked by its network policy, so every observation comes through Firecrawl.

This builds on the first-phase competitor study (18 homepages and 6 product pages, logged in [`RESEARCH_EVIDENCE.md`](RESEARCH_EVIDENCE.md)). The pages below were re-accessed on the date above.

---

## 1. What was accessed

### 1.1 Accessed and examined

| Brand | Positioning / category | Pages (date accessed: 31 Oct 2026) | What we looked at |
|---|---|---|---|
| Rhode | International, celebrity-founded skincare, minimal | [rhodeskin.com](https://www.rhodeskin.com/) (desktop + mobile), [Peptide Lip Treatment PDP](https://www.rhodeskin.com/products/peptide-lip-treatment) | Hero, mobile first screen, PDP |
| Sol de Janeiro | International body care and body mists, high energy | [soldejaneiro.com](https://soldejaneiro.com/) (desktop + mobile), [Cheirosa 62 Perfume Mist PDP](https://soldejaneiro.com/products/cheirosa-62-hair-body-fragrance-mist) | Hero, PDP structure, scent pyramid, pop-ups |
| Kayali | Fragrance, gourmand, layering-led | [kayali.com](https://kayali.com/) (served UAE storefront), [Vanilla 28 PDP](https://us.kayali.com/products/vanilla-28) | Product overlay in hero, PDP notes chips, "Layer me with" |
| Byredo | Luxury fragrance and body | [byredo.com](https://www.byredo.com/) | Campaign hero |
| Glossier | International DTC beauty | [glossier.com](https://www.glossier.com/) | Hero, wordmark scale |
| Rare Beauty | International makeup and fragrance | [rarebeauty.com](https://www.rarebeauty.com/) | Hero, navigation |
| Fenty Skin | International skincare | [fentyskin.com](https://fentyskin.com/) (redirected to fentybeauty.com/pages/fenty-skin) | Split hero, nav |
| Bath & Body Works India | Mass-premium body care and mists, India | [bathandbodyworks.in](https://www.bathandbodyworks.in/) | Hero, product clusters, India pricing UI |
| Victoria's Secret India | Mass-premium mists and lotions, India | [victoriassecret.in](https://www.victoriassecret.in/) | Hero, mist cluster photography |
| Forest Essentials | Indian luxury Ayurveda | [forestessentialsindia.com](https://www.forestessentialsindia.com/) | Nav, festive hero (hero image did not render) |
| Kama Ayurveda | Indian luxury Ayurveda | [kamaayurveda.com](https://www.kamaayurveda.com/) | Product-led festive banner |
| Plum BodyLovin' | Indian body mists, masstige | [BodyLovin' collection](https://plumgoodness.com/collections/bodylovin), [Body mists collection](https://plumgoodness.com/collections/body-mists) (mobile), [Vanilla Vibes Body Mist PDP](https://plumgoodness.com/products/vanilla-vibes-body-mist-by-plum-bodylovin) | Product cards with scent props, size chips, mobile category chips |
| Minimalist | Indian ingredient-led skincare | [beminimalist.co](https://beminimalist.co/) | Clean launch hero, one-line benefit |
| Foxtale | Indian skincare, D2C | [foxtale.in](https://foxtale.in/) | Sale-led hero |
| Dot & Key | Indian skincare, D2C | [dotandkey.com](https://www.dotandkey.com/) | Bestseller tabs by category, anti-fraud banner |

### 1.2 Not examined properly

- **Aesop:** `aesop.com/in/` returned a 404 page. No Aesop observations are used here; first-phase notes are in `RESEARCH_EVIDENCE.md`.
- **Nykaa Wanderlust:** the brand page we tried returned 404 through the scraper. Its pricing from the first phase is in `RESEARCH_EVIDENCE.md`. No design claims are made about it.
- **mCaffeine:** the homepage was still on its loading screen when captured. No design observations.
- **Forest Essentials:** navigation and banner text rendered, but the hero image did not load in the capture.

### 1.3 How we classify these brands

They are not all competitors. We sort them by what we can learn from each.

| Group | Brands | Why we study them |
|---|---|---|
| Direct category: body mist / body care in India | Plum BodyLovin', Bath & Body Works India, Victoria's Secret India, (Nykaa Wanderlust, Kimirica in phase 1) | Price ladder, how mists are merchandised, Indian shopper expectations |
| Aspirational fragrance and body | Sol de Janeiro, Kayali, Byredo | How scent is made visible; fragrance PDP anatomy |
| Aspirational premium skincare / DTC | Rhode, Glossier, Rare Beauty, Fenty Skin | Hero restraint, product cards, mobile discovery |
| Indian premium and luxury | Forest Essentials, Kama Ayurveda | Indian luxury codes; festive merchandising |
| Indian D2C skincare | Minimalist, Foxtale, Dot & Key | Category tabs, launch presentation, trust and anti-fraud messaging |

---

## 2. Observations: what works and why

**Heroes are images, not paragraphs.** Every international reference opens on one image with a headline of 10 words or fewer and one CTA.
- Rhode's is three words ("Edited, efficacious, intentional.") over one campaign photo.
- Byredo's is a full-bleed film with only the wordmark and a "Discover" link.
- Glossier sets its wordmark huge over a close-up of the product in use.
- Kayali floats a *product card* (name, price, add to bag) over its hero image, so the first screen is already shoppable.

**Scent is shown, not described.** The fragrance-led brands translate notes into **props and colour**:
- Bath & Body Works India: a peach and a flower around a product cluster on deep blue.
- Victoria's Secret: fruit and flowers spilling around the mists.
- Plum: cupcakes and vanilla flowers around Vanilla Vibes; a dragonfruit on a pink card.
- Kayali: sugar cubes and vanilla pods around the bottle.

Copy is limited to a three-word mood ("Sweet • Addictive • Warm" on Kayali) and **notes as chips**: Kayali shows five icon chips; Sol de Janeiro uses a Top / Mid / Dry list.

**Product-detail pages share one anatomy.**
- **Above the fold:** a large gallery (half the screen or more) with thumbnails, then name, a short mood line or descriptor, rating, price and size, and **one** dominant CTA.
- **Further down:** fragrance notes, ingredients and how to use, inside tabs or accordions (Sol de Janeiro uses tabs: Description, Ingredients, How to Use, Fragrance Notes).
- **Cross-sell** is framed as a ritual: "Layer me with…" (Kayali), "Add it to your routine… layer with Bum Bum Cream" (Sol de Janeiro).

**Unavailable products keep their place.** Rhode's sticky button reads "Join Waitlist" instead of "Buy" when a shade is unavailable. The product page stays a full product page; only the action changes. This is the most relevant precedent for a brand whose prices aren't confirmed yet.

**Mobile shows products in the first screen.**
- On Rhode's mobile homepage, a horizontal swipe row of product cards (with a "swipe" hint) begins *inside* the first viewport, right under the hero.
- Plum's mobile collection opens with a product-cluster hero, then **horizontal category chips** (Toners & Mists, Moisturiser…) and a bottom tab bar.

**Discovery runs through category tabs and chips.** Dot & Key's "Bestseller" shelf is tabbed by category (Sunscreen, Moisturizer, Serum, Facewash, Lip Balm), and Plum and Sol de Janeiro both use chip rows. One shelf with tabs lets the shopper browse every line without reading.

**Anti-patterns to avoid.**
- Sol de Janeiro shows a full-screen discount pop-up over the product page, on desktop and mobile. It blocks the very thing the page is for.
- Indian D2C heroes (Foxtale, Kama, Plum, Forest Essentials) are dominated by sale mechanics (B2G4, "Glowali Sale", countdown timers). That works for them, but it would undercut a new premium brand with no sales history.
- Dot & Key's top banner ("No one from our team will call you for offers…") shows that payment-fraud warnings are a real concern for Indian shoppers. We keep this message, but quietly, on the contact page and at checkout.

---

## 3. Answers to the eight questions

**1. How do successful beauty brands make their products visually attractive?**
- They light the product like a campaign: directional light and real shadows (Byredo, Kayali, Bath & Body Works).
- They give each product a **colour world** (Plum's per-scent colours, Bath & Body Works' blue).
- They shoot **families** of products together, so a single item looks like part of a considered range.
- Glass is backlit so the liquid glows. Labels face the camera and stay legible.

**2. How do they communicate benefits without much text?**
- One line under the name.
- Three-word mood descriptors.
- Chips with icons for notes or key ingredients.
- Short tags ("New", "Bestseller").
- Detail lives in accordions or tabs, never in the first screen.

**3. How do they make customers explore more products?**
- Swipeable rows (Rhode mobile).
- Category tabs on a single shelf (Dot & Key).
- "Layer with" and "complete your routine" cross-sells (Kayali, Sol de Janeiro, Rhode).
- Hover images on cards.
- Category chips (Plum).

**4. How do they use imagery to communicate fragrance, ingredients and experience?**
- **Props stand in for the notes:** fruit, flowers, sugar, vanilla.
- Textures and swatches show feel.
- Spray and mist shots show use.
- Lifestyle frames (vanity, bath) show the ritual.

**5. What makes a customer click on a product?**
- A large, well-lit image with the brand legible on the pack.
- A clear name and category.
- Visible price (when it exists).
- A second image on hover.
- A badge that signals newness.

**6. What is the best way to display upcoming products?**
- Show them as **real members of the range**, with the same packaging language and the same card format.
- Give each a clear status label and a "Notify me" action in place of a purchase (as Rhode does with "Join Waitlist").
- Never show a price, size or claim until it's final.

**7. How do they balance premium aesthetics with easy shopping?**
- Restraint where it builds the brand: hero, typography, colour.
- Familiar e-commerce conventions everywhere else: bag icon, sticky CTA, size chips, accordions, filter chips.
- The premium brands don't reinvent the PDP. They make the photography better.

**8. What makes their mobile websites engaging?**
- Products appear in the first viewport.
- Thumb-sized swipe rows and chip rows.
- Sticky purchase bars.
- Short text.
- Full-width imagery cropped specifically for portrait screens (not desktop images shrunk).

---

## 4. Recommended direction for Gentle Company

### 4.1 Positioning

Gentle Company is a **premium, accessible body and skin care brand for India**. Its visual promise is *gentle*: soft daylight, warm materials and clean packaging. It is positioned between the sale-driven Indian D2C brands and the ornate heritage luxury houses.

The name does the explaining, so the site doesn't need to. **No manifesto. The product leads.**

### 4.2 Design principles (from the research)

1. **The first screen is the product.**
   - A campaign image of the Body Mist, with GENTLE COMPANY legible on the bottle.
   - A headline of six words or fewer, one short line, and one CTA.
   - On mobile, the image comes first, followed by the product row within the first scroll.
2. **About 75% image, 25% words.**
   - Every section leads with an image.
   - Copy is a headline plus at most two or three short lines.
   - Long text lives only in accordions, policies and the Journal.
3. **Show scent; don't write about it.**
   - Mist, light, glass and texture imagery.
   - Notes shown as chips with a small visual scale *once the perfumer confirms them*. Until then, the notes component stays hidden rather than showing placeholders.
4. **One range, one look.**
   - Every product shares the same packaging system: the stacked GENTLE COMPANY mark, cocoa ink and cocoa caps.
   - Line colours: apricot for Body, milk for Face, rose for Lip.
   - Coming-soon products appear in this system, clearly labelled.
5. **Effortless discovery.**
   - A category-tabbed product shelf.
   - Image-first category tiles.
   - Hover images and quick view on desktop; swipe rows on mobile.
   - "Discover the range" cross-links on every product page.
6. **Honest commerce.**
   - Purchase appears only when price and size are confirmed *and* payments are configured. Until then, the action is "Notify me at launch", which posts to a real email list.
   - No fake reviews, counters, timers or pop-ups.

### 4.3 Visual identity

- **Wordmark: GENTLE COMPANY** in Marcellus with 0.2 em tracking.
  - Its flared, softly cut serifs read as "gentle" without being fragile, and it stays clear from 16 px headers up to packaging.
  - A stacked GENTLE / COMPANY lockup is used for packaging.
  - A **GC monogram** set in a soft arch (a nod to a vanity niche) is used for the favicon and social avatar.
- **Typography:**
  - Cormorant Garamond for display headlines, used sparingly.
  - Instrument Sans for UI and body text: crisp, modern and highly legible on mobile.
- **Palette:**
  - Base colours: milk `#F6F2EC`, sand, travertine, cocoa `#2A201B`.
  - Accent: clay `#9C5A40`.
  - Line colours: apricot (Body), milk (Face), rose (Lip).
- **Photography — "Daylight vanity":**
  - Warm plaster and travertine, with soft window light falling through leaves.
  - Clear glass backlit so the apricot liquid glows.
  - Matte packaging and a single prop at most.
  - See `GENTLE_COMPANY_BRAND_GUIDELINES.md` for the rules.

### 4.4 Page structures

**Homepage**
1. Product-led hero.
2. Featured products shelf, with tabs: All, Body, Face, Lip.
3. Shop by category: image tiles.
4. Short brand introduction: one headline, two lines, one image.
5. Body Mist experience: an interactive gallery of moments, the bottle details, and notes (shown once confirmed).
6. The future range: visual grid with status.
7. Early-access sign-up.
8. Compact footer.

**Product page (Body Mist)**
- Gallery with thumbnails, swipe and zoom.
- Name, category and one line of description.
- Status, then either the purchase action or "Notify me".
- Highlights and scent, shown only when confirmed.
- Accordions: Details, Ingredients, How to use, Product information. Each appears only when its data exists.
- The bottle in detail.
- "Discover the range" cross-links.
- A sticky mobile bar.

**Collections**
- An image hero for the category.
- A grid of product cards with status.
- A notify-me action per item.

### 4.5 What we deliberately did not copy

- **Sale-led heroes, countdowns and pop-ups.** They suit established brands with known prices. They would damage trust for a brand that is just launching.
- **Celebrity and model imagery.** We have none. Faking it is out of the question, and stock models would make the brand look generic.
- **Star ratings and review counts.** Gentle Company has no reviews yet, so the review area only appears once real reviews exist.
