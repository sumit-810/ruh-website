# Implementation Report

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

## Limitations / integrations pending
- **Payments:** demo checkout only. Ready for Shopify cart permalinks or a custom endpoint (Razorpay/Cashfree/PayU), with UPI support recommended.
- **Forms:** not connected (`site.forms.provider: 'none'`), and the UI says so honestly. Formspree, Netlify or a custom endpoint can be plugged in from config.
- **Reviews, accounts, order emails, inventory, analytics:** not implemented (no real data).
- **Rendering:** client-side from `site.config.js` (simple to edit). Pre-render for production SEO.
- **Imagery:** concept renders, no human/lifestyle photography.
