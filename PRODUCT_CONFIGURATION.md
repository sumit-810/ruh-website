# Product & Brand Configuration

Everything the website displays is edited in **[`site.config.js`](site.config.js)**:
- Journal articles live in [`content/journal.js`](content/journal.js).
- The policy texts live in [`content/policies.js`](content/policies.js).
- There is no build step: edit, save, refresh.

> **Before launch:** work through [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) until `node tools/launch_check.mjs` reports no blockers, then set `previewMode: false`.
>
> While `previewMode` is `true`, the site shows a "Preview build" badge and dashed **Placeholder** labels next to provisional content. With it set to `false`, those labels go, and service notes or promises flagged `provisional` are hidden. The deploy build also refuses to publish while blockers remain.

---

## 1. Where things live

| What | Where in `site.config.js` |
|---|---|
| Company (seller): GentleCare's name, legal name, address, CIN, GSTIN, website | `site.company` |
| Brand name, wordmark, logo, endorsement, tagline, description | `site.brand` |
| Announcement bar messages | `site.announcements` |
| Customer care email, phone, WhatsApp, hours, grievance officer | `site.contact` |
| Social links | `site.social` |
| Checkout provider (Razorpay), Buy-now switch, max quantity, notes under Add to bag | `site.commerce` |
| Delivery charge, free-delivery threshold, cash on delivery | `site.shipping` |
| Footer service promises | `site.servicePromises` |
| Form provider (Netlify Forms) and consent text | `site.forms` |
| Collections (Body / Face / Lip) | `collections` |
| Purchasable products | `products` |
| Coming-soon items | `upcoming` |
| Header mega menus and footer links | `navigation` |
| Homepage, Our Story (including the GentleCare chapter), FAQs | `content` |
| Shipping & Returns, Privacy, Terms | `content/policies.js` |

---

## 2. Product fields (`products[]`)

| Field | Meaning | Current value | Status |
|---|---|---|---|
| `handle` | URL id → `product.html?p=<handle>` | `body-mist-no-01` | Keep stable once live |
| `available` | `false` hides purchase everywhere | `true` | — |
| `badge` | Small tag on cards | `New` | Optional |
| `name` | Product name | `Body Mist Nº 01` | Provisional (naming system) |
| `scentName` | Scent name | `First Light` | **PROVISIONAL** |
| `scentDescriptor` | One-line sensory description | "A luminous veil of citrus, white florals and soft woods" | **PROVISIONAL** — must match the real notes |
| `shortDescription` | Summary under the price | (see file) | **PROVISIONAL** |
| `description[]` | Paragraphs in the Description accordion | (see file) | **PROVISIONAL** |
| `variants[]` | Sizes: `id`, `size`, `netQuantity`, `price` (₹, MRP incl. taxes), `compareAtPrice`, `sku`, `shopifyVariantId`, `available` | one 100 ml variant at **₹1,295** | **PROVISIONAL** price & size |
| `family` | Fragrance family | `Floral · Woody` | **PROVISIONAL** |
| `mood` | Mood words | `Bright, calm, clean-skinned` | **PROVISIONAL** |
| `wearIt[]` | Suitable occasions | 4 occasions | **PROVISIONAL** |
| `notes.top / heart / base` | Scent pyramid | Bergamot, Pink grapefruit / Jasmine sambac, Orange blossom / Sandalwood, Soft musk | **PROVISIONAL — example notes only. Replace with the perfumer's composition.** |
| `benefits[]` | Key features (`title`, `text`) | 3 non-claim features | **PROVISIONAL** — keep to what you can substantiate |
| `howToUse[]` | Directions | 4 steps | **PROVISIONAL** — confirm with formulator & label |
| `ingredients` | Full INCI list (string) | `null` → shows "will be published here" | **REQUIRED before launch** |
| `ingredientsNote` | Disclaimer under ingredients | "subject to change… refer to the product label" | Keep |
| `productInformation` | Legal Metrology declarations: Net quantity, MRP, Manufactured by, Marketed by, Country of origin, Best before/expiry, Customer care | mostly `null` → shows "To be added before launch" | **REQUIRED before launch** |
| `images[]` | `{ key, alt }`; `key` = image in `assets/js/data/images.js` | 6 concept renders | Replace with real photography |
| `imageDisclaimer` | Caption on product imagery | "Concept render — final packaging may differ." | Set to `null` once real photos are used |
| `faqs[]` | Product FAQs | 4 honest Q&As | Update once wear/safety testing exists |
| `pairsWith[]` | Upcoming handles for "Complete the ritual" | lotion, butter, hand cream | — |
| `reviews[]` | **Real, verifiable reviews only** | `[]` → shows "No reviews yet" | Connect a reviews app or add genuine reviews |
| `provisional{}` | Which sections show a Placeholder label in preview mode | most `true` | Set each to `false` as you confirm it |

**To add a size:** add a second object to `variants`. A size selector appears automatically when there is more than one size.

**To launch a new product:** copy the Body Mist object, give it a new `handle`, set `available: true`, and point `images` at new image keys. It then appears in Shop, Search, its collection and the menus (add its handle to `navigation.primary[…].mega.columns[…].items`). If it was previously listed in `upcoming`, remove it from there.

---

## 3. Coming-soon items (`upcoming[]`)

| Field | Meaning |
|---|---|
| `handle` | Anchor id on its collection page (`collection.html?c=face-care#sunscreen`) |
| `collection` | `body-care`, `face-care` or `lip-care` |
| `name`, `format`, `intro` | Display copy (intros are deliberately claim-free) |
| `image` | Concept maquette render key |
| `eta` | Keep `null` until a date is real (not displayed while `null`) |
| `theme` | Optional label used by search (e.g. "Hydration") |

Current items: Body Wash, Body Lotion, Body Scrub, Body Butter, Hand & Body Cream · Face Cleanser, Toner, Face Serum, Moisturiser, Sunscreen, Face Masks · Lip Balm, Lip Treatment. **None can be purchased.** They render with a *Coming soon* tag and a *Notify me* form.

---

## 4. Company, brand & site settings

| Setting | Current value | Status |
|---|---|---|
| `previewMode` | `true` | Set `false` once the launch check passes |
| `company.name` | `GentleCare` | Confirmed |
| `company.legalName`, `registeredAddress` | `null` | **REQUIRED**. The seller identity used in the footer, policies, product information and JSON-LD |
| `company.gstin`, `cin`, `website` | `null` | Add when available |
| `brand.name` / `wordmark` | `Rūh` / `RŪH` | **Working name. Trademark clearance required** (`brand.trademarkCleared: false`) |
| `brand.logoSvg`, `endorsement` | `assets/brand/ruh-wordmark.svg`, "A GentleCare brand" | Vector logo system; see `BRAND_DESIGN_SYSTEM.md` §11 |
| `brand.tagline`, `description` | (see file) | **PROVISIONAL** |
| `announcements` | 3 messages | Confirm the wording |
| `contact.email` | `null` (the old `hello@example.com` placeholder has been removed) | **REQUIRED**: the business inbox |
| `contact.phone`, `whatsapp` | `null` | Optional. WhatsApp adds a chat button to every page |
| `contact.hours`, `responseTime` | placeholders | **PROVISIONAL** |
| `contact.grievanceOfficer` | `null` | **REQUIRED** `{ name, designation, email, phone }` (E-Commerce Rules) |
| `social.*` | all `null`, so the links are hidden | Add real URLs and the handle |
| `commerce.checkout.provider` | `razorpay` | Needs the Netlify env vars `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` |
| `commerce.buyNowEnabled` | `true` | Buy Now goes straight to checkout |
| `commerce.maxQuantityPerItem` | `6` | Enforced in the browser and on the server |
| `commerce.serviceNotes` | 2 notes, 1 provisional | Provisional ones are hidden in production |
| `shipping.flatRate` / `freeAbove` | `null` / `null` (free delivery) | **Decide**, e.g. `79` / `999`. Drives the bag meter, checkout, server total and policy text |
| `shipping.cod` | `{ enabled: false, fee: 0, maxOrderValue: 3000 }` | Optional |
| `servicePromises` | 3, 1 provisional | Confirm the delivery promise |
| `forms.provider` | `netlify` | Set form notifications in Netlify after the first deploy |

## 5. Content (`content`)

| Block | Status |
|---|---|
| `home.*` | Hero, intro statement, ritual steps, "what comes next" tiles, philosophy pillars, early access, social. Copy is **provisional brand copy**; philosophy pillars are commitments the business must confirm ("One honest price", "Full ingredient lists"…). |
| `story.*` | Name meaning (sourced), art-direction story, how we work. **`founderNote.text` is `null`**: add the founders' own words (shown as a placeholder card only in preview mode). |
| `faqs[]` | Honest answers; items needing business decisions say so. |
| `content/policies.js` | **Drafts written for India.** <ul><li>Consumer Protection (E-Commerce) Rules 2020, including the 2026 amendment's grievance duties.</li><li>DPDP Act 2023 and Rules 2025.</li><li>Legal Metrology.</li></ul> Company and contact details fill `{{tokens}}` automatically. Each **[bracketed]** item is a business decision and is highlighted on the page. Set `updated` when they take effect, and have a lawyer review them. |

## 6. Business details still required before launch

`node tools/launch_check.mjs` prints the live list. In summary:

1. **GentleCare's legal details:** registered name, registered address, and the GSTIN and CIN.
2. **Contact details:**
   - the business email;
   - a phone and/or WhatsApp number;
   - a **grievance officer** (name, designation, email, phone).
3. A trademark-cleared brand name. The logo then follows automatically from `tools/build_brand.py`.
4. **Product truth for Body Mist Nº 01:**
   - the perfumer's notes and the scent name;
   - the final **INCI** list;
   - the price, size and SKU;
   - usage directions and cautions;
   - the Legal Metrology fields: manufacturer, country of origin, best-before.
5. Safety or testing evidence before making any claim. Until then, **no** "dermatologist tested", "suitable for sensitive skin", "long-lasting X hours", "cruelty-free" or "vegan".
6. Real product photography (see `PHOTOGRAPHY_BRIEF.md`).
7. **Delivery:** charges, dispatch times, courier, the returns window, refund days and COD.
8. **Payments and forms:**
   - Razorpay activation and keys;
   - Netlify form notifications.
9. Social accounts, the founder's note and the founding year.

## 7. Images

**Real photography (preferred):**
1. Save each photo as `assets-src/photography/<key>.jpg`. Keys and crops are listed in `PHOTOGRAPHY_BRIEF.md`.
2. Run `python3 tools/build_images.py`.

Photos replace renders one key at a time. For any key that is now a photo:
- its "concept render" captions disappear automatically;
- alt text loses the "Concept render:" prefix.

When every Nº 01 image is a photo:
- update the product `alt` texts;
- set `imageDisclaimer: null`.

**Concept renders** are made with Blender. See `tools/render/`. To re-render:

```bash
python3 tools/render/make_textures.py   # edit LABEL at top first
python tools/render/scenes.py all --samples 64   # needs: pip install bpy==5.2.3
python3 tools/build_images.py
```
