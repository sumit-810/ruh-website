# Launch Checklist: Rūh by GentleCare

The site is a **preview build** (`site.previewMode: true`):
- It shows a "Preview build" badge.
- Content still to be confirmed is marked with a *Placeholder* tag.

You can launch when this command reports **no blockers**:

```bash
node tools/launch_check.mjs
```

There is a safety net in the deploy: with `previewMode: false`, the Netlify build (`tools/build_public.mjs`) **fails** while any blocker remains. An unfinished site can't go live by accident.

This file is the human checklist behind that script, in the order of your review's priorities.

---

## 1. Business details (needed by law, and only you have them)

All of these go in `site.config.js`.

| What | Where | Why |
|---|---|---|
| Registered legal name, e.g. "GentleCare Private Limited" | `company.legalName` | E-Commerce Rules: seller identity. Used in the footer, policies, product info and structured data |
| Registered office address | `company.registeredAddress` | Same as above |
| GSTIN, and CIN if incorporated | `company.gstin`, `company.cin` | Footer and terms |
| Domain | `company.website` | Sitemap and canonical links |
| **Business email** (replaces the old `hello@example.com`) | `contact.email` | Customer care, policies, order confirmation |
| Phone and/or WhatsApp | `contact.phone`, `contact.whatsapp` | WhatsApp shows a chat button on every page |
| **Grievance Officer**: name, designation, email, phone | `contact.grievanceOfficer` | Mandatory. Complaints are acknowledged in 48 h, the customer gets a copy of the complaint as recorded (2026 amendment), and complaints are resolved within a month |
| Trademark search or filing for "Rūh" (class 3, and class 35 for retail) | then set `brand.trademarkCleared: true` | Brand risk |

## 2. Product truth (Body Mist Nº 01)

Confirm each item with the formulator, then delete its `// PROVISIONAL` comment and set the matching `provisional.*` flag to `false`.

- [ ] Scent name, family, mood, and the fragrance **notes** (top, heart, base) from the perfumer's brief.
- [ ] Description and "Key features": only statements you can substantiate.
- [ ] **Ingredients**: the full INCI list from the approved formulation.
- [ ] **Legal Metrology** fields:
  - net quantity
  - manufacturer name and address
  - country of origin
  - best-before or expiry
  - Marketed by and Customer care fill in from the company and contact details automatically.
- [ ] Price (MRP, inclusive of taxes), SKU, and the remaining FAQs.
- [ ] How to use, and safety and patch-test guidance.

## 3. Photography

Follow `PHOTOGRAPHY_BRIEF.md`:
1. Put the retouched photos in `assets-src/photography/<key>.jpg`.
2. Run `python3 tools/build_images.py`.

The "Concept render" captions disappear one image at a time. When all the Nº 01 photos are in:
- update the product `alt` texts;
- set `imageDisclaimer: null`.

## 4. Payments (Razorpay)

1. Complete Razorpay KYC and activation. Make sure the business name and website URL match the site.
2. In Netlify, go to **Site configuration → Environment variables** and add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
   - Use test keys first (`rzp_test_…`) and place a test order.
   - Then switch to live keys.
3. Decide on delivery charges: `shipping.flatRate` and `shipping.freeAbove`.
   - Leaving `flatRate` as `null` means free delivery on every order.
4. Optional: cash on delivery (`shipping.cod.enabled`). COD orders arrive as Netlify form submissions and need you to confirm each one by phone.
5. Place one real order on the live site, then refund it from the Razorpay dashboard.

Prices are recalculated **on the server** from `site.config.js`, so a customer can't change what they pay. Each payment is signature-verified before the confirmation page is shown.

## 5. Email capture and forms (Netlify Forms)

- [ ] After the first deploy, open **Netlify → Forms** and check that `early-access`, `notify-me`, `contact` and `cod-order` were detected.
- [ ] In **Forms → Form notifications**, add an email notification to the business inbox for each form.
- [ ] Submit each form on the live site and check that it arrives.
- [ ] When you choose an email platform (Brevo, Mailchimp, Klaviyo and so on), either:
  - export the list from Netlify;
  - or switch `forms.provider` to `custom` with your endpoint.

## 6. Policies

These drafts are in `content/policies.js`:
- Shipping & Returns;
- Privacy, written for the DPDP Act 2023 and Rules 2025;
- Terms, written for the Consumer Protection Act 2019 and the E-Commerce Rules 2020, including the 2026 amendment.

The company, contact and delivery details fill in automatically.

- [ ] Decide each **[bracketed]** item: dispatch days, courier partner, return window, change-of-mind returns, refund days, minimum shelf life, email provider, analytics, jurisdiction city.
- [ ] Have a lawyer review all three policies.
- [ ] Set `policies.updated` to the date they take effect.

## 7. Go live

- [ ] `node tools/launch_check.mjs` shows **no blockers**.
- [ ] Set `site.previewMode: false`. This removes the preview badge and all *Placeholder* markers, and hides the provisional service notes.
- [ ] Deploy, connect the domain, and confirm HTTPS works.
- [ ] Re-run the manual checks the script prints at the end.
