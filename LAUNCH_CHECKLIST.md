# Launch Checklist: Gentle Company

The website is live-ready as a **pre-launch brand site**. It shows the range, takes early-access sign-ups and answers contact messages, with no placeholders.

This checklist covers what's needed to **start selling**. The command below prints the live list:

```bash
node tools/launch_check.mjs
```

## 1. Make the forms live (do this first)

1. Create a free [Brevo](https://www.brevo.com) account, then a contact list. Note its numeric ID.
2. In Brevo, verify a sender address (e.g. `hello@your-domain`) and create an API key.
3. In Vercel → Project → Settings → Environment Variables, add:
   - `BREVO_API_KEY`
   - `BREVO_LIST_ID`
   - `CONTACT_TO_EMAIL`: your inbox
   - `MAIL_FROM_EMAIL`: the verified sender
4. Redeploy.
5. On the live site, submit the early-access form, a notify-me form and the contact form, then check they arrive in Brevo and your inbox.

Until this is done, the forms tell visitors plainly that nothing was sent.

## 2. Business details (required by law to sell online in India)

All of these go in `site.config.js`.

| What | Where |
|---|---|
| Registered legal name and registered office address | `company.legalName`, `company.registeredAddress` |
| GSTIN (and CIN if incorporated) | `company.gstin`, `company.cin` |
| Business email; phone or WhatsApp | `contact.email`, `contact.phone`, `contact.whatsapp` |
| Grievance Officer: name, designation, email, phone (E-Commerce Rules) | `contact.grievanceOfficer` |
| Your domain | `company.website` |
| Trademark search or filing for "Gentle Company" (class 3; class 35 for retail) | then set `brand.trademarkCleared: true` |

## 3. Body Mist Nº 01: product facts

Fill these only with confirmed information. Each section appears as soon as its field is set.

- [ ] Size and price (MRP inclusive of taxes).
- [ ] Scent name, family, mood and **notes** from the perfumer. The notes chips appear on the homepage and the product page.
- [ ] **Ingredients:** the full INCI list from the approved formulation.
- [ ] **How to use**, as printed on the label.
- [ ] **Legal Metrology** fields: net quantity, MRP, manufacturer, country of origin, best before.
- [ ] Highlights: only claims you can substantiate. No "dermatologist tested", "long-lasting", "cruelty-free" or "vegan" without evidence.

## 4. Policies

- [ ] `content/policies.js`: decide each [bracketed] item in Shipping & Returns and Terms. These include dispatch days, courier, return window, refund days, minimum shelf life and jurisdiction.
- [ ] Have a lawyer review the policies, then set `published.shipping` and `published.terms` to `true` and set `updated`.
- [ ] The Privacy Policy is already published, because the site collects email sign-ups. Re-check it once company details are set.

## 5. Payments

1. Activate Razorpay (KYC). The business name and website must match.
2. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel. Start with test keys.
3. Set the product's price, set `available: true`, then set `site.commerce.enabled: true`.
4. Place a test order and a real order, then refund the real one.

## 6. Photography

Once manufactured packaging exists, photograph it to `PHOTOGRAPHY_BRIEF.md`. The current images are renders of the packaging design.

## 7. Go live

- [ ] Connect the domain, check HTTPS and set `company.website`.
- [ ] Optional: rename the Vercel project and the GitHub repo away from the retired working name (steps in README → Deploy).
- [ ] Run the QA suite (README → Quality assurance).
