# Implementation Report: Gentle Company redesign

**Date:** 31 October 2026.
**Scope:** a full rebrand to **Gentle Company** and a product-first redesign of the existing website (`sumit-810/ruh-website`, deployed on Vercel).

Earlier phases built the original site and its checkout. Their history is in git (commits `8e8e3e3` and `77a01e7`).

---

## 1. Research

Live sites were accessed on 31 Oct 2026 through Firecrawl: desktop and mobile screenshots plus structured extraction, with every visual claim checked against the screenshots. Full notes, URLs and answers to the eight research questions are in [`RESEARCH_AND_DESIGN_STRATEGY.md`](RESEARCH_AND_DESIGN_STRATEGY.md).

| Group | Brands examined |
|---|---|
| International skincare and DTC | Rhode (home and PDP, desktop and mobile), Glossier, Rare Beauty, Fenty Skin |
| Fragrance and body | Sol de Janeiro (home and PDP, desktop and mobile), Kayali (home and PDP), Byredo |
| Mass-premium body and mists, India | Bath & Body Works India, Victoria's Secret India, Plum BodyLovin' (collection, mobile collection, mist PDP) |
| Indian premium and D2C | Forest Essentials, Kama Ayurveda, Minimalist, Foxtale, Dot & Key |

**Not usable:**
- Aesop India returned a 404.
- The Nykaa Wanderlust brand page returned a 404.
- mCaffeine was captured on its loading screen.
- Forest Essentials' hero image did not load.

These are reported as such and no claims are made from them.

**What drove the design:**
- Image-led heroes with headlines of 10 words or fewer.
- Scent shown through props and colour rather than paragraphs.
- Notes presented as chips.
- Products visible within the first mobile screen.
- Shelves tabbed by category.
- "Join waitlist" in place of "Buy" when a product isn't available (as Rhode does).
- No pop-ups.

## 2. Design direction: "Daylight vanity"

The look is warm plaster and travertine, soft leaf-shadow window light, clear glass with glowing apricot liquid, matte packaging in a colour for each line, and cocoa ink.

**Typography:**
- Wordmark: **Marcellus**, chosen for its soft flared serifs.
- Headlines: **Cormorant Garamond**.
- UI and body text: **Instrument Sans**.

The site follows a "75% visual, 25% words" principle. The details are in [`GENTLE_COMPANY_BRAND_GUIDELINES.md`](GENTLE_COMPANY_BRAND_GUIDELINES.md).

## 3. How the new site differs from the old one

| Before | Now |
|---|---|
| Editorial, text-led. The hero was a manifesto; a large "We make body and skin care for the unhurried moments…" statement filled a screen. Repeated philosophy sections | The hero is the product: Body Mist Nº 01 with GENTLE COMPANY on the label, a six-word headline, one line and one CTA. Brand intro cut to a headline plus two lines |
| Products appeared after several text sections | A collection shelf comes straight after the hero, tabbed All / Body / Face / Lip, with hover images, quick view and arrows plus progress |
| Upcoming items shown as blank plaster forms | The whole range shown in one packaging system, each item labelled "In development" with a notify-me |
| "Placeholder", "To confirm", "Concept render" and "Preview build" visible on the site; an unconfirmed ₹1,295 price and 100 ml size; invented notes and benefits | **Nothing unconfirmed is shown.** Missing fields are hidden. No price, so the page shows **Notify me**. No notes, so no notes section. Preview mode removed entirely |
| Checkout reachable in a demo mode | Checkout and bag appear only when `commerce.enabled` is true and a price is confirmed. Until then `checkout.html` explains the shop opens soon |
| Netlify Forms and Netlify Functions, though the site deploys on Vercel | Vercel functions: `/api/subscribe` and `/api/contact` (Brevo), `/api/create-order` and `/api/verify-payment` (Razorpay) |
| Account page (non-functional) | Removed |

**Homepage sections:**
1. Product hero.
2. Collection shelf.
3. Shop by category: three image tiles with product counts and status.
4. Brand intro: one image, a headline and two lines.
5. Body Mist experience: a switcher of moments images, plus notes chips once confirmed.
6. What comes next: the full range photographed on one shelf, with **interactive hotspots** for every product.
7. Early access, connected to Brevo.
8. Compact footer.

**Product page:**
- **Gallery:** seven images with thumbnails, arrows, swipe, keyboard control and zoom on click that follows the pointer.
- **Buy box:** "Launching soon" with notify-me. It turns into size, price, quantity, Add to bag and Buy now automatically when the product can be sold.
- **Accordions:** each appears only when its data exists (Details, Scent, How to use, Ingredients, Product information, Questions).
- **Other sections:** an "In the everyday" moments strip, a "Discover the range" shelf, and a sticky mobile bar.

**Collection, Shop and Story:**
- **Collections:** an image hero and a grid of cards with status.
- **Shop:** tabbed by line, synced to the URL.
- **Story:** one wide image and three short chapters.

## 4. Visual identity and packaging

- **Logo system** (`tools/build_brand.py`, all vector outlines):
  - the GENTLE COMPANY wordmark (one line), with an ivory version;
  - a stacked lockup for packaging;
  - a GC monogram in a soft arch;
  - the favicon, Apple touch icon and social avatar;
  - a share image with the wordmark composited onto the hero.
- **Packaging, Body Mist Nº 01:** heavy clear glass, apricot liquid, a cream paper label (GENTLE / COMPANY, BODY MIST, Nº 01) and a cocoa cap with a champagne collar.
- **Packaging, the range:** apricot for body, milk for face, rose for lip. Every pack carries the stacked GENTLE COMPANY lockup and its product name, with cocoa caps.
- **Accurate brand text:** every label is typeset from the brand fonts (`tools/render/make_textures.py`) and applied as a texture in Blender (`tools/render/scenes.py`). The brand name on every bottle, tube and jar is real type, not AI-generated lettering.
- **26 rendered images:**
  - campaign hero (wide and portrait);
  - packshots (front, angle, open, label macro);
  - mist, vanity and bath-ledge scenes;
  - the full range lineup;
  - three category groups;
  - 13 single products.

  Hotspot positions are computed by projecting each product through the scene camera.

## 5. How the old branding was removed

- **Assets:**
  - all old logo SVGs and the social avatar deleted;
  - every rendered image regenerated with GENTLE COMPANY labels (the old images, whose labels showed the old name, were deleted);
  - old label and lattice textures and the Bodoni and Jost fonts removed.
- **Code:**
  - wordmark, header, footer, titles, meta and Open Graph tags, JSON-LD, alt text, page shells, policies and the payment merchant name all updated;
  - order references changed from `RUH-…` to `GC-…`, and storage keys renamed;
  - the single-file build is now named `gentle-company.html`.
- **Company:** the earlier "GentleCare" endorsement has been removed as well, so the site carries one identity only. If the registered legal entity has a different name, enter it in `site.company.legalName`; it then appears only where the law requires the seller's legal name.
- **Docs:** the old strategy and design-system documents were replaced by the new ones. The research evidence log carries a note about the rename.
- **Audit:** `qa/brand-audit.mjs` renders every page and scans visible text, titles, meta tags, alt text, ARIA labels and JSON-LD for the retired name and for placeholder language. It also scans every published file. *Result: see §7.*
- **Account changes not made:** the Vercel project (`ruh-website-virid.vercel.app`) and the GitHub repository still carry the retired name. The README gives safe rename steps; these are account changes, so they were not made.

## 6. Interactions implemented

- Collection shelf: tabs, arrows and a progress bar.
- Hover image on cards.
- Quick view: a dialog with a focus trap, notify-me or add to bag.
- Mega menus showing product images.
- Image-first mobile menu.
- Product gallery: thumbnails, arrows, swipe, keyboard control and zoom.
- Accordions.
- Sticky mobile purchase bar.
- Moments switcher (pauses when the visitor chooses).
- Range hotspots with popovers.
- Search overlay.
- Bag drawer, when the shop is open.
- Scroll reveals, respecting `prefers-reduced-motion`.

## 7. Testing

See §7 of the final summary below. It is filled in after the full QA run.

## 8. Business information still required

`node tools/launch_check.mjs` prints the live list:
- the legal name and registered address, plus GSTIN and CIN;
- a business email and phone number, and a grievance officer;
- Brevo and Razorpay keys in Vercel;
- for Body Mist Nº 01: size, price, scent notes, ingredients (INCI), how to use, and the Legal Metrology fields;
- decisions for the Shipping and Terms policies, and a legal review;
- photography of the manufactured packaging;
- a trademark search for "Gentle Company";
- a domain.
