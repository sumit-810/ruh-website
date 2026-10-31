# Product & Brand Configuration

Everything the website displays is edited in **one file: [`site.config.js`](site.config.js)**. Journal articles live in [`content/journal.js`](content/journal.js). There is no build step: edit, save, refresh.

> **Before launch:** replace every value marked `// PROVISIONAL` in `site.config.js` (listed below), then set `previewMode: false`. While `previewMode` is `true`, the site shows a "Preview build" badge and dashed **Placeholder** labels next to provisional content, so nobody mistakes it for final information.

---

## 1. Where things live

| What | Where in `site.config.js` |
|---|---|
| Brand name, wordmark, logo, tagline, description | `site.brand` |
| Announcement bar messages | `site.announcements` |
| Contact details, grievance officer, address | `site.contact` |
| Social links | `site.social` |
| Checkout provider, Buy-now switch, max quantity, free-shipping threshold, notes under Add to bag | `site.commerce` |
| Footer service promises | `site.servicePromises` |
| Newsletter / waitlist / contact form endpoint | `site.forms` |
| Collections (Body / Face / Lip) | `collections` |
| Purchasable products | `products` |
| Coming-soon items | `upcoming` |
| Header mega menus and footer links | `navigation` |
| Homepage, Our Story, FAQs, policy outlines | `content` |

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

## 4. Brand & site settings

| Setting | Current value | Status |
|---|---|---|
| `previewMode` | `true` | Set `false` at launch |
| `brand.name` / `brand.wordmark` | `Rūh` / `RŪH` | **PROVISIONAL working name — trademark clearance required** (see strategy §4.4) |
| `brand.logoSrc` | `null` (text wordmark) | Add `assets/img/logo.svg` when a logo exists |
| `brand.tagline` | "Scent and skin, in softer light." | **PROVISIONAL** |
| `brand.description` | (see file) | **PROVISIONAL** |
| `brand.legalName` | `null` | **REQUIRED** (footer, product information) |
| `announcements` | 3 messages | **PROVISIONAL** (delivery wording) |
| `contact.email` | `hello@example.com` | **PROVISIONAL — replace** |
| `contact.hours`, `responseTime` | placeholders | **PROVISIONAL** |
| `contact.address`, `grievanceOfficer` | `null` | **REQUIRED** for Indian e-commerce compliance |
| `social.*` | all `null` → links hidden, gallery says channels open at launch | Add real URLs/handle |
| `commerce.checkout.provider` | `demo` | Switch to `shopify` or `custom` (see README) |
| `commerce.buyNowEnabled` | `false` | Enable only with a real checkout |
| `commerce.freeShippingThreshold` | `null` (meter hidden) | Set e.g. `999` when policy is decided |
| `commerce.serviceNotes` | 2 placeholder notes | **PROVISIONAL** |
| `commerce.maxQuantityPerItem` | `6` | — |
| `servicePromises` | 3 placeholder promises (all `provisional: true`) | **PROVISIONAL** — confirm or remove |
| `forms.provider` / `endpoint` | `none` / `null` | Configure Formspree, Netlify Forms or a custom endpoint |

## 5. Content (`content`)

| Block | Status |
|---|---|
| `home.*` | Hero, intro statement, ritual steps, "what comes next" tiles, philosophy pillars, early access, social. Copy is **provisional brand copy**; philosophy pillars are commitments the business must confirm ("One honest price", "Full ingredient lists"…). |
| `story.*` | Name meaning (sourced), art-direction story, how we work. **`founderNote.text` is `null`**: add the founders' own words (shown as a placeholder card only in preview mode). |
| `faqs[]` | Honest answers; items needing business decisions say so. |
| `policies.shipping / privacy / terms` | **Outlines with [bracketed] placeholders, not legal text.** Must be written with legal advice (including the Digital Personal Data Protection Act, 2023) before launch. |

## 6. Business details still required before launch

1. Final brand name (trademark-cleared), logo and wordmark.
2. Final product name, scent name and **perfumer's notes**.
3. **Final INCI ingredient list** from the approved formulation.
4. Price (MRP incl. taxes), size(s), SKUs.
5. Legal Metrology declarations: manufacturer/packer, marketer, country of origin, net quantity, best-before, customer-care details.
6. Usage directions and cautions as printed on the label.
7. Any safety/skin testing results. Until then, **no** claims such as "dermatologist tested", "suitable for sensitive skin", "long-lasting X hours", "cruelty-free" or "vegan".
8. Real product photography (to replace concept renders).
9. Shipping, COD, returns and refund policies; privacy policy; terms.
10. Payment gateway and checkout integration; email/waitlist service.
11. Contact email, phone/WhatsApp, registered address, grievance officer.
12. Social media accounts.
13. Founder's note and any verified brand facts (founding year, location).

## 7. Images

Product and editorial images are original concept renders generated with Blender (see `tools/render/`). To re-render after changing the bottle label or colours:

```bash
python3 tools/render/make_textures.py   # edit LABEL at top first
python tools/render/scenes.py all --samples 64   # needs: pip install bpy==5.2.3
python3 tools/build_images.py           # writes assets/img/* and the manifest
```

To use **real photography** instead: export each photo as a PNG into `tools/render/out/<key>.png` (e.g. `pack_front.png`) and run `python3 tools/build_images.py`. Every page picks up the new image, with AVIF/WebP/JPEG sizes generated automatically. Then set `imageDisclaimer: null`.
