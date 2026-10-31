# Product & Site Configuration

Everything the website shows is edited in **[`site.config.js`](site.config.js)**:
- journal articles live in [`content/journal.js`](content/journal.js);
- the policies live in [`content/policies.js`](content/policies.js).

There is no build step: edit, save, refresh.

## The one rule

**`null` means hidden.** The website never shows a placeholder, a "to be confirmed" note or an example value.

When a field is empty, the section that uses it doesn't render. A missing price shows **Notify me** instead; a missing ingredient list means no Ingredients section. When you fill a field with confirmed information, it appears.

`node tools/launch_check.mjs` lists what is still empty.

---

## 1. Where things live

| What | Where |
|---|---|
| Company details (legal name, address, GSTIN, website) | `site.company` |
| Brand name, tagline, description, logo file | `site.brand` |
| Announcement bar | `site.announcements` |
| Contact details, grievance officer | `site.contact` |
| Social links (null = hidden) | `site.social` |
| Shop switch, checkout, quantities, notes under the buy button | `site.commerce` |
| Delivery charges, COD | `site.shipping` |
| Footer service promises (only confirmed ones) | `site.servicePromises` |
| Forms → Brevo (`provider: 'api'`) | `site.forms` |
| Body / Face / Lip lines | `collections` |
| Products with a page (Body Mist Nº 01) | `products` |
| The rest of the range, with status | `upcoming` |
| Status wording ("Coming soon", "In development") | `statusLabels` |
| Header and footer links | `navigation` |
| Homepage, Our Story, FAQs copy (short by design) | `content` |

## 2. Body Mist Nº 01 (`products[0]`)

| Field | Now | What it controls |
|---|---|---|
| `name`, `category`, `tagline`, `shortDescription` | Set | Cards, product page, search |
| `badge` | `First release` | Tag on cards and the product page |
| `statusLabel` | `Launching soon` | Shown while the product can't be bought |
| `available` | `false` | Set to `true` at launch |
| `variants[0].size`, `variants[0].price` | `null` | Size chip and price (₹, MRP incl. taxes). Both must be set to sell |
| `scent.name`, `scent.family`, `scent.mood`, `scent.notes` | `null` | Scent accordion and the interactive notes chips (`notes: { top: [], heart: [], base: [] }`) |
| `highlights` | `null` | Highlight tiles under the buy box. Only substantiated statements |
| `description` | `null` | Extra paragraphs in Details |
| `howToUse` | `null` | How to use accordion (copy from the approved label) |
| `ingredients` | `null` | Ingredients accordion (full INCI) |
| `productInformation` | All `null` | Legal Metrology table. Each row appears when filled. *Marketed by* and *Customer care* fill in automatically from `site.company` and `site.contact` |
| `images` | 7 keys | Gallery order, with alt text |
| `packagingNote` | Set | One line in Details saying the images show the packaging design |
| `moments` | 4 | Lifestyle images with one-line captions (homepage switcher, product page strip) |
| `faqs` | 2 | Questions accordion |
| `pairsWith` | 3 handles | First cards in "Discover the range" |
| `reviews` | `[]` | Only genuine, verifiable reviews |

## 3. Opening the shop

1. Set `variants[0].size` and `variants[0].price` (₹, MRP inclusive of taxes), and `available: true`.
2. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel.
3. Set `site.commerce.enabled: true`.

The price, size chips, quantity, Add to bag, Buy now, the bag icon and checkout then appear automatically. The payment server re-prices every order from this file.

Optional:
- `site.shipping.flatRate` / `freeAbove` for delivery charges;
- `site.shipping.cod.enabled` for cash on delivery (emailed to you for manual confirmation);
- `site.commerce.serviceNotes`.

## 4. The rest of the range (`upcoming[]`)

Each item has a name, a format, a one-line `line`, an `image`, a `status` (`'in-development'` or `'coming-soon'`) and an `eta` (keep it `null` until real).

Items appear in the shelf, the collections, quick view, the mega menu, search and the range hotspots, always with their status and a notify-me form. **They can never be bought.**

To launch one, move it to `products` with full fields.

## 5. Forms and email

`site.forms.provider: 'api'` posts to this site's Vercel functions:
- `/api/subscribe`: early access and notify-me, saved to the Brevo list `BREVO_LIST_ID`;
- `/api/contact`: the contact form, emailed to `CONTACT_TO_EMAIL`.

The site says "thank you" only when Brevo confirms. See README → Deploy.

## 6. Images

All product imagery is rendered from `tools/render/`, using the packaging design in `GENTLE_COMPANY_BRAND_GUIDELINES.md`.

- **To change the packaging artwork:** edit `tools/render/make_textures.py`, then re-render (README → Images).
- **To use real photography:** save each photo as `assets-src/photography/<key>.jpg` and run `python3 tools/build_images.py`. Then check the alt texts in `products[0].images`.

| Key | Used for |
|---|---|
| `hero_wide` / `hero_portrait` | Homepage hero (desktop / mobile), og-image, product gallery |
| `pack_front`, `pack_angle`, `pack_open`, `detail_label` | Product gallery, cards, quick view, early-access panel |
| `mist`, `vanity`, `ritual` | Moments, intro, gallery |
| `lineup` | "What comes next" (with hotspots), Our Story, mobile menu |
| `family_body`, `family_face`, `family_lip` | Category tiles, collection pages, hover images |
| `up_*` (13) | Each product in the range |
