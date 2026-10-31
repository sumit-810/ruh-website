# Implementation Report

*Phase 1 (below) built the brand website. [Phase 2](#phase-2-commercial-readiness-rūh-by-gentlecare) made it commercially ready and integrated GentleCare.*

## Competitors studied
**18 homepages and 6 product pages, accessed via Firecrawl (remote rendering, desktop + mobile screenshots, structured extraction):**
Sol de Janeiro, Rhode, Aesop, Byredo, Glossier, Rare Beauty, Fenty Skin, The Ordinary (India), Bath & Body Works (India + US PDP), Laneige (KR), Forest Essentials, Kama Ayurveda*, Minimalist, Plum*, Dot & Key, Foxtale, Mamaearth (intl.), Pilgrim, mCaffeine, plus Kimirica (Indian body-mist PDP) and Nykaa's body-mist listing for pricing.
*Kama returned only a sign-in modal and Plum's PDP redirected, so evidence there is limited. Full log and limitations: `RESEARCH_EVIDENCE.md`.

**Tooling honesty:** Firecrawl was used throughout. Claude in Chrome and a "Frontend Design" tool were not available in this session, and direct browsing of competitor sites (and Unsplash/Pexels) was blocked by the environment's network policy, so visual inspection used Firecrawl screenshots. Playwright was used for all QA of our site. Context7 was available but not needed: the site uses no third-party libraries, and Blender 5.2 API questions were answered by introspecting the installed module.

## Design direction, and why
**"Soft Architecture"**: warm limewash, travertine and a terracotta-clay accent, lit by sun falling through a carved Indian *jaali* screen; Bodoni Moda (editorial Didone) with Jost (geometric sans).
- Indian D2C beauty is loud (B2G4 offers, saturated grids). Indian luxury is ornate heritage. International premium is cool and austere. A calm, warm, architectural world fills the gap and reads as both Indian and international.
- Light is an ownable signature (no competitor uses it) and a natural metaphor for gentle care.

## What makes it distinctive
- The jaali-light signature runs through every image, the star glyph in eyebrows, and the favicon.
- A coherent product world: a concept bottle (frosted glass, terracotta cap, champagne collar) plus blank plaster maquettes for every upcoming format.
- **Calm commerce:** no pop-ups, countdowns, fake counters or badge walls. An honest single price, MRP and net-quantity cues for India.
- Coming Soon is treated as content: six category tiles, three preview pages, per-item Notify Me.

## Pages & features built
Home · Shop all (category + availability filters, URL-synced) · Body Mist PDP · Body / Face / Lip Care Coming Soon pages · Our Story · Journal + 3 articles · Contact · FAQs · Shipping & Returns, Privacy, Terms (outlines) · Search page + overlay · Demo checkout · Account placeholder · 404.
Mega menus, mobile drawer, rotating announcement bar (with pause), transparent-to-frosted sticky header, bag drawer (add/remove/quantities/subtotal/persistence/free-shipping meter slot), quick add, product gallery (thumbnails, swipe, dots, keyboard), sticky purchase bar, scent pyramid, accordions, honest forms (newsletter, waitlist, notify me, contact) with validation, recently viewed, JSON-LD product data, preview-mode placeholder markers.

## What was tested (Playwright + axe-core)
- `qa/smoke.mjs`: 20 pages × 1440 / 820 / 390 px. **0** console errors, failed requests, broken images or horizontal overflow.
- `qa/interactions.mjs`: **49/49 checks pass**. Add to bag (PDP, featured, sticky bar), quantity stepper and cap, subtotal maths, persistence across reload, removal, Escape/focus handling, mega menu, mobile menu, search, newsletter validation and honest messaging, shop filters + URL sync, notify-me panels, no purchase on coming-soon items, FAQ keyboard toggling, all internal links resolve, demo checkout validation (never claims an order), and **axe-core WCAG A/AA scans of 6 key templates with 0 violations**.
- `qa/perf.mjs`: 45–155 KB first load per page, LCP about 0.2–0.3 s, CLS 0.000–0.008 (local, unthrottled).
- **Bugs found and fixed during QA:** header not sticking; focus lost after a bag re-render (Escape stopped working); the sticky bar missed fast scrolls; mobile overflow; contrast tokens; layout shift (CLS 0.38 → 0.008); tablet layouts; double hero download.

## Provisional content (marked on-site while `previewMode: true`)
Brand name "Rūh" (working name), tagline and brand copy · product name system, scent name "First Light", scent descriptor, **all scent notes**, family, mood, occasions · price ₹1,295 and 100 ml size · benefits, how-to-use · announcement messages · service promises · contact email/hours · philosophy commitments · policy pages · all product imagery (concept renders).

## Business details still required before launch
Trademark-cleared name and logo · perfumer's final notes · final INCI ingredient list · price/sizes/SKUs · Legal Metrology declarations (manufacturer, marketer, country of origin, best-before, customer care) · label directions and cautions · any safety/testing evidence before any claim · real photography · shipping/COD/returns/privacy/terms (with legal advice, including DPDP Act 2023) · registered address and grievance officer · email inbox, phone/WhatsApp, social accounts · founder's note.

## Limitations / integrations pending (phase 1; see phase 2 for what changed)
- **Payments:** demo checkout only. Ready for Shopify cart permalinks or a custom endpoint (Razorpay/Cashfree/PayU), with UPI support recommended.
- **Forms:** not connected (`site.forms.provider: 'none'`), and the UI says so honestly. Formspree, Netlify or a custom endpoint can be plugged in from config.
- **Reviews, accounts, order emails, inventory, analytics:** not implemented (no real data).
- **Rendering:** client-side from `site.config.js` (simple to edit). Pre-render for production SEO.
- **Imagery:** concept renders, no human/lifestyle photography.


---

## Phase 2: commercial readiness (Rūh by GentleCare)

This phase responds to the review, which scored the concept 8.5, positioning 8.5, product presentation 8 and **commercial readiness 3/10**. The direction was kept and nothing was rebuilt from scratch. **GentleCare** is the company and **Rūh** is its brand.

### What changed

| Review priority | What was done |
|---|---|
| 3. Real payment gateway and checkout | **Razorpay Standard Checkout** (UPI, cards, net banking, wallets) through two Netlify Functions. <ul><li>The server re-prices the bag from the catalogue, so tampered prices are ignored.</li><li>Payments are verified by HMAC-SHA256 signature with a timing-safe compare.</li><li>There is an order confirmation page and Buy Now.</li><li>Optional COD (off by default).</li><li>One pricing module, used by the bag, checkout and server: delivery charge, free-delivery threshold, COD fee and limit.</li></ul> |
| 4. Newsletter and waitlist connected | **Netlify Forms** (early-access, notify-me, contact, cod-order) with hidden detection forms and honeypots. <ul><li>A success message is shown only on a 2xx response.</li><li>Local previews say plainly that nothing was sent.</li></ul> |
| 5. Replace hello@example.com | The placeholder is removed. `contact.email` is `null` until GentleCare supplies its inbox, and the site shows "to be added before launch" in its place. It never shows a fake address. |
| 6. Finalise policies | Full **India-specific drafts** in `content/policies.js`: <ul><li>Shipping & Returns.</li><li>Privacy (DPDP Act 2023 and Rules 2025).</li><li>Terms (Consumer Protection Act 2019 and E-Commerce Rules 2020, including the 2026 amendment's grievance duties).</li></ul> Company, contact and delivery details fill in automatically. The 13 business decisions are highlighted in brackets. The FAQs were rewritten to match. |
| 7. Remove the Preview banner and provisional content | A **launch gate**: <ul><li>`tools/launch_check.mjs` lists the blockers, warnings and manual checks.</li><li>`previewMode: false` removes every placeholder marker and hides the provisional service notes.</li><li>The Netlify build **fails** while blockers remain.</li></ul> `LAUNCH_CHECKLIST.md` gives the human steps. |
| 1. Real photography | A **photo-first image pipeline**: <ul><li>Photos go in `assets-src/photography/`. The manifest records photo or render per image.</li><li>Concept-render captions disappear for each image once its photo exists.</li><li>Renders stay for anything not yet shot.</li></ul> `PHOTOGRAPHY_BRIEF.md` gives the shot list, crops, look and specs. |
| 2. Finalise notes, ingredients and claims | Not invented. These must come from the perfumer and formulator. They remain flagged on the site and are **blockers** in the launch check. |

**Brand differentiation**
- A real **vector logo system**: the RŪH wordmark outlined from Bodoni Moda with a custom macron, the jaali star, and the "Rūh by GentleCare" lockups (light and dark), plus a social avatar.
- Usage rules in `BRAND_DESIGN_SYSTEM.md` §11.

**GentleCare throughout**
- Footer endorsement and copyright.
- A "Made by GentleCare" chapter on Our Story.
- The seller block on the Contact page.
- "Marketed by" on the product page.
- Organization and seller JSON-LD.
- Page titles and the form consent text.

**Support:** a WhatsApp button appears once a number is set, and the contact page shows the seller and grievance officer.

**Deploy:** `netlify.toml` and `tools/build_public.mjs` publish only the public site, with security headers, `robots.txt` and a sitemap. Internal docs are never deployed.

### Tested

| Suite | Result |
|---|---|
| `qa/functions.test.mjs` (`node --test`) | **7/7**: price tampering ignored, invalid bag or customer rejected, missing keys give 503, gateway errors give 502, signatures valid or invalid |
| `qa/checkout.mjs` | **12/12**. The full flow from bag to Razorpay (stubbed) to verify to confirmation, using the real function code with a mocked Razorpay API |
| `qa/interactions.mjs` | **49/49**, including axe-core WCAG A/AA on 6 templates. Tests were updated for Buy Now, the real checkout, and the preview fallback that never claims an order |
| `qa/smoke.mjs` | Every page at 3 viewports: 0 console errors, failed requests, broken images or overflow |
| `qa/single-file.mjs` | 27/27 |
| `qa/perf.mjs` | 60–210 KB first load, LCP about 0.15–0.23 s, CLS ≤ 0.008 (local) |
| Production mode (`previewMode: false`) | No badge and no placeholder markers. The policies still show "Draft" until their brackets are resolved, and the deploy build refuses to publish |

### Still needed from GentleCare (the launch check reports these as blockers)
- Legal name and registered address, GSTIN, and the business email.
- A grievance officer.
- A trademark search for "Rūh".
- The perfumer's notes, the INCI list, and the Legal Metrology fields (manufacturer, origin, best-before).
- Product photography.
- The delivery and returns decisions.
- Razorpay activation and keys, and Netlify form notifications.
- A lawyer's review of the policies.
