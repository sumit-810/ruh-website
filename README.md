# Gentle Company — Website

The D2C website for **Gentle Company**, a body and skin care brand for India. It launches with **Body Mist Nº 01**; the body, face and lip care range is shown with honest status labels.

- **Product-first and photography-led.** Every product is shown in Gentle Company's packaging system.
- **No placeholders, ever.** Anything unconfirmed (price, size, notes, ingredients, company details) is simply hidden until it's filled in.
- **Shop opens from config.** When the shop is enabled and a price is confirmed, Razorpay checkout appears. Until then, product pages offer **Notify me**, which posts to Brevo through `/api/subscribe`.

## Documents

| File | Contents |
|---|---|
| [`RESEARCH_AND_DESIGN_STRATEGY.md`](RESEARCH_AND_DESIGN_STRATEGY.md) | Competitor research (sources and dates), answers to the 8 research questions, design direction |
| [`GENTLE_COMPANY_BRAND_GUIDELINES.md`](GENTLE_COMPANY_BRAND_GUIDELINES.md) | Name, logo system, colour (with contrast ratios), type, voice, packaging, photography |
| [`IMPLEMENTATION_REPORT.md`](IMPLEMENTATION_REPORT.md) | What changed, how the old brand was removed, interactions, testing, what's still needed |
| [`PRODUCT_CONFIGURATION.md`](PRODUCT_CONFIGURATION.md) | Every editable field, and how to open the shop |
| [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) | The business details and decisions needed to start selling |
| [`PHOTOGRAPHY_BRIEF.md`](PHOTOGRAPHY_BRIEF.md) | Shot list and specs for photographing manufactured packaging |
| [`RESEARCH_EVIDENCE.md`](RESEARCH_EVIDENCE.md) | First-phase research log (market, pricing, legal sources) |

## Run locally

The site is **React 19 + Vite + TypeScript**, styled with **Tailwind CSS v4** and **shadcn/ui**, with motion from **React Bits** components (GSAP and Motion). Every page is prerendered to static HTML at build time, then hydrated, so pages are indexable and paint before any JavaScript runs.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check, build, prerender every route into dist/
```

To check the production build: `python3 -m http.server 4173 --directory dist`.

The `/api` functions only run on Vercel. To exercise them locally, use `vercel dev`. On a plain static server, forms answer honestly that nothing was sent.

### shadcn/ui and React Bits

- `components.json` is the shadcn configuration (new-york style, `src/components/ui/`, brand colours mapped onto shadcn's CSS variables in `src/index.css`). Add components with `npx shadcn@latest add <name>`. It also registers the React Bits registry, so `npx shadcn@latest add @react-bits/BlurText-TS-TW` works.
- `.mcp.json` registers the shadcn MCP server for Claude Code (the same file `npx shadcn@latest mcp init --client claude` writes).
- React Bits components live in `src/components/reactbits/` (copied from the TS + Tailwind variants, with small brand tweaks noted at the top of the PR): BlurText (hero headline), ScrollVelocity (marquee band), ScrollReveal (scroll-lit statements), ScrollExpand (image that opens to full bleed), Magnet (hero button), GlareHover (glass sheen on product cards), AnimatedContent (section reveals). Everything respects `prefers-reduced-motion`.

## Deploy (Vercel)

The project deploys from GitHub to Vercel. `vercel.json` sets everything up:
- **Build:** `npm run build` → `dist/` (one static HTML file per route, plus `robots.txt`, and `sitemap.xml` once `company.website` is set). Strategy docs, tools and QA are never published.
- **Clean URLs:** `/products/body-mist-no-01`, `/collections/face-care`, `/journal/<slug>`. Old `.html` addresses (`product.html?p=…`, `collection.html?c=…`, `shop.html` …) redirect permanently.
- **Functions:** `api/subscribe.js`, `api/contact.js`, `api/create-order.js` and `api/verify-payment.js`. Their logic lives in `server/`.
- **Headers:** security headers and long-lived caching for hashed JS/CSS and fonts.

**Environment variables** (Vercel → Project → Settings → Environment Variables):

| Variable | Needed for |
|---|---|
| `BREVO_API_KEY`, `BREVO_LIST_ID` | Early-access and notify-me sign-ups (stored in a Brevo list) |
| `CONTACT_TO_EMAIL`, `MAIL_FROM_EMAIL` (`MAIL_FROM_NAME` optional) | Contact form → email to the business inbox (sender verified in Brevo) |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Payments, once `site.commerce.enabled` is true |

Without these variables the forms tell the visitor plainly that nothing was sent. They never show a fake success.

### Renaming the Vercel project

The Vercel project and its URL (`ruh-website-virid.vercel.app`) still carry the old working name, and so does the GitHub repository (`sumit-810/ruh-website`). None of this is customer-facing once a custom domain is connected, but to rename them without breaking deployment:

1. **Vercel:** go to Project → Settings → General → Project Name and change it, for example to `gentle-company`. The `*.vercel.app` URL changes with it. Git integration, environment variables and domains are kept.
2. **Domain (recommended):** go to Settings → Domains, add your own domain (e.g. `gentlecompany.in`), and set `site.company.website`.
3. **GitHub (optional):** go to Settings → General → Repository name, for example `gentle-company-website`. GitHub redirects the old URL. Then, in Vercel → Settings → Git, confirm the connection still points at the renamed repository. Reconnect it if not.

These are account changes, so they have not been made by this work.

## Project structure

```
site.config.js             ← all brand, product, navigation and page content
content/journal.js         journal articles
content/policies.js        privacy (published), shipping & terms (drafts until published)
index.html                 Vite HTML template (prerendered pages are built from it)
src/
  App.tsx                  routes and site chrome (pages are code-split)
  entry-server.tsx         prerender entry (React 19 static rendering)
  index.css                Tailwind v4, brand tokens, shadcn variables
  pages/                   one component per page
  components/site/         header, footer, product card, quick view, bag, search (⌘K), forms
  components/ui/           shadcn/ui components
  components/reactbits/    React Bits animation components
  lib/                     catalog.js + pricing.js (shared with the server), cart, forms, SEO
  data/                    generated: images.js (manifest), brand.js (inline SVG), hotspots.js
public/assets/             fonts, brand SVGs, responsive AVIF/WebP/JPEG images
scripts/prerender.mjs      writes dist/<route>/index.html, robots.txt, sitemap.xml
api/                       Vercel functions (thin entry points)
server/                    email.mjs (Brevo), create-order.mjs + verify-payment.mjs (Razorpay), http.mjs
tools/                     brand + image pipelines, launch_check.mjs
qa/                        node tests + Playwright smoke test
```

## Images

All product imagery is original and generated from code: Gentle Company's packaging design, rendered with Blender Cycles.

Every label is typeset with the real brand fonts and applied as a texture, so **GENTLE COMPANY is accurate type** on every bottle, tube and jar.

To regenerate the images (needs `pip install bpy==5.2.3 pillow fonttools`), run these in order:

1. Typeset every packaging label with the brand fonts:
   ```bash
   python tools/render/make_textures.py
   ```
2. Render all the scenes:
   ```bash
   python tools/render/scenes.py all --samples 64
   ```
3. Write the product hotspot positions for the "What comes next" image:
   ```bash
   python tools/render/scenes.py --hotspots src/data/hotspots.js
   ```
4. Build the AVIF, WebP and JPEG images, the manifest and the og-image:
   ```bash
   python3 tools/build_images.py
   ```

When manufactured packaging exists, photograph it (`PHOTOGRAPHY_BRIEF.md`), drop the files into `assets-src/photography/<key>.jpg` and run `build_images.py`. Photos replace renders one by one.

## Quality assurance

| Command | What it checks |
|---|---|
| `npm test` | Payment and email server functions (Razorpay and Brevo mocked) |
| `npm run typecheck` | TypeScript |
| `node qa/smoke.mjs` | Builds must be served first (`python3 -m http.server 4173 --directory dist`). Every page at 1440 and 390 px: console and hydration errors, horizontal overflow, a real `<h1>`; then ⌘K search, shelf filter, quick view and honest form messages |
| `npm run check` | What is still needed before selling |

## Editing

Edit `site.config.js`; the comments explain each field. To start selling:
- fill in the business details;
- add the product's size and price and set `available: true`;
- set `commerce.enabled: true`.

`LAUNCH_CHECKLIST.md` walks through it.
