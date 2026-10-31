/**
 * Launch-readiness check. Lists everything that still stands between this
 * build and a public launch.
 *
 *   node tools/launch_check.mjs          # human-readable report, exit 1 if blockers
 *   node tools/launch_check.mjs --json   # machine-readable
 *
 * BLOCKERS must be fixed before setting site.previewMode to false; the deploy
 * build (tools/build_public.mjs) refuses to publish a non-preview site while
 * any remain. WARNINGS are worth a decision but don't stop a launch.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function launchReport() {
  const { site, products } = await import(pathToFileURL(join(ROOT, 'site.config.js')));
  const { policies } = await import(pathToFileURL(join(ROOT, 'content/policies.js')));
  const { images } = await import(pathToFileURL(join(ROOT, 'assets/js/data/images.js')));

  const blockers = [];
  const warnings = [];
  const block = (area, msg) => blockers.push({ area, msg });
  const warn = (area, msg) => warnings.push({ area, msg });

  // --- Business identity (E-Commerce Rules: seller details on the platform) --
  const co = site.company;
  if (!co.legalName) block('Company', 'company.legalName — registered legal name of GentleCare');
  if (!co.registeredAddress) block('Company', 'company.registeredAddress — registered office address');
  if (!co.gstin) warn('Company', 'company.gstin is not set (required if GST-registered; shown in the footer and terms)');
  if (!co.website) warn('Company', 'company.website is not set — needed for sitemap.xml and canonical links');
  if (!site.brand.trademarkCleared) block('Brand', `brand.trademarkCleared is false — complete a trademark search/filing for "${site.brand.name}" in classes 3 (and 35)`);

  // --- Contact & grievance -------------------------------------------------
  const c = site.contact;
  if (!c.email) block('Contact', 'contact.email — business customer-care inbox (replaces the old placeholder address)');
  const g = c.grievanceOfficer;
  if (!g) block('Contact', 'contact.grievanceOfficer — name, designation, email and phone (Consumer Protection (E-Commerce) Rules)');
  else for (const k of ['name', 'designation', 'email', 'phone']) if (!g[k]) block('Contact', `contact.grievanceOfficer.${k} is missing`);
  if (!c.phone && !c.whatsapp) warn('Contact', 'No phone or WhatsApp number — customers can only reach you by email and the contact form');

  // --- Commerce ------------------------------------------------------------
  const provider = site.commerce.checkout.provider;
  if (provider === 'demo') block('Checkout', 'commerce.checkout.provider is "demo" — no real payments');
  if (provider === 'shopify' && !site.commerce.checkout.shopifyDomain) block('Checkout', 'Shopify checkout selected but shopifyDomain is not set');
  if (provider === 'shopify') for (const p of products) for (const v of p.variants) if (!v.shopifyVariantId) block('Checkout', `${p.name} ${v.size}: shopifyVariantId missing`);
  if (site.shipping.flatRate == null) warn('Shipping', 'shipping.flatRate is null — delivery is free on every order. Confirm that is intended.');
  if (site.shipping.cod.enabled) warn('Shipping', 'Cash on delivery is enabled — COD orders arrive as Netlify form submissions and must be confirmed by hand');

  // --- Forms ---------------------------------------------------------------
  const f = site.forms;
  if (f.provider === 'none') block('Forms', 'forms.provider is "none" — newsletter, waitlist and contact forms send nothing');
  if (['formspree', 'custom'].includes(f.provider) && !f.endpoint) block('Forms', `forms.provider is "${f.provider}" but forms.endpoint is not set`);

  // --- Product content -----------------------------------------------------
  for (const p of products) {
    const flags = Object.entries(p.provisional || {}).filter(([, v]) => v).map(([k]) => k);
    if (flags.length) block('Product', `${p.name}: still provisional — ${flags.join(', ')} (confirm, then set each provisional flag to false)`);
    if (!p.ingredients) block('Product', `${p.name}: ingredients (full INCI list from the approved formulation) is not set`);
    const info = p.productInformation || {};
    const defaulted = ['Marketed by', 'Customer care']; // filled from company / contact when null
    for (const [k, v] of Object.entries(info)) if (v == null && !defaulted.includes(k)) block('Product', `${p.name}: product information "${k}" is not set (Legal Metrology declaration)`);
    for (const v of p.variants) {
      if (!v.sku) warn('Product', `${p.name} ${v.size}: no SKU`);
      if (v.compareAtPrice) warn('Product', `${p.name} ${v.size}: compareAtPrice is set — only use for a genuine, time-bound reduction`);
    }
    if (!(p.reviews || []).length) warn('Product', `${p.name}: no reviews yet (fine at launch — never add unverifiable ones)`);
  }

  // --- Images --------------------------------------------------------------
  const renders = Object.entries(images).filter(([k, m]) => m.kind !== 'photo' && !k.startsWith('up_')).map(([k]) => k);
  if (renders.length) block('Images', `Concept renders still used for the live product and pages: ${renders.join(', ')} (see PHOTOGRAPHY_BRIEF.md)`);
  for (const p of products) {
    if (p.imageDisclaimer && !renders.length) warn('Images', `${p.name}: imageDisclaimer is set but every image is a photo — set it to null`);
    for (const im of p.images) if (images[im.key]?.kind === 'photo' && /concept/i.test(im.alt)) warn('Images', `${p.name}: alt text for ${im.key} still says "concept"`);
  }
  const upcoming = Object.entries(images).filter(([k, m]) => k.startsWith('up_') && m.kind !== 'photo').length;
  if (upcoming) warn('Images', `${upcoming} coming-soon images are concept forms (allowed: they are labelled as concepts)`);

  // --- Policies ------------------------------------------------------------
  if (!policies.updated) block('Policies', 'content/policies.js → updated: set the date the policies take effect');
  for (const [key, pol] of Object.entries(policies)) {
    if (!pol || typeof pol !== 'object') continue;
    const strings = (v) => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);
    const todos = strings(pol).flatMap((t) => [...t.matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]));
    if (todos.length) block('Policies', `${pol.title}: ${todos.length} [bracketed] decision(s) left — ${todos.slice(0, 4).join('; ')}${todos.length > 4 ? '; …' : ''}`);
  }
  warn('Policies', 'Have the Shipping & Returns, Privacy and Terms drafts reviewed by a lawyer before launch');

  // --- Provisional markers -------------------------------------------------
  const cfg = readFileSync(join(ROOT, 'site.config.js'), 'utf8').split('\n');
  const marked = cfg.map((l, i) => (/\/\/\s*PROVISIONAL/.test(l) ? i + 1 : 0)).filter(Boolean);
  if (marked.length) block('Content', `${marked.length} "// PROVISIONAL" item(s) in site.config.js — confirm each and delete the comment (lines ${marked.join(', ')})`);
  const hidden = [...(site.commerce.serviceNotes || []), ...(site.servicePromises || [])].filter((x) => x.provisional);
  if (hidden.length) warn('Content', `${hidden.length} provisional service note(s)/promise(s) will be hidden when previewMode is false: ${hidden.map((x) => x.title || x.text).join(' | ')}`);

  if (site.previewMode) block('Launch', 'site.previewMode is true — set it to false once everything above is done');

  const manual = [
    'Netlify → Site settings → Environment variables: RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET (live keys, not rzp_test_)',
    'Razorpay dashboard: account activated (KYC done), business name and website approved, settlement account verified',
    'Place one real order end to end on the live site, then refund it from the Razorpay dashboard',
    'Netlify → Forms: confirm the four forms were detected and set an email notification to the business inbox',
    'Submit the newsletter, notify-me and contact forms on the live site and check they arrive',
    'Check the email inbox, WhatsApp number and grievance officer contact all reach a real person',
    'Connect the domain and confirm HTTPS',
  ];
  return { blockers, warnings, manual, previewMode: site.previewMode };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await launchReport();
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(r, null, 2));
  } else {
    const group = (items) => {
      const by = {};
      for (const i of items) (by[i.area] ||= []).push(i.msg);
      return Object.entries(by).map(([a, ms]) => `  ${a}\n${ms.map((m) => `    • ${m}`).join('\n')}`).join('\n');
    };
    console.log(`\nLaunch check — ${r.blockers.length} blocker(s), ${r.warnings.length} warning(s)\n`);
    if (r.blockers.length) console.log(`BLOCKERS (must fix before launch)\n${group(r.blockers)}\n`);
    if (r.warnings.length) console.log(`WARNINGS\n${group(r.warnings)}\n`);
    console.log(`MANUAL CHECKS (can't be verified from the code)\n${r.manual.map((m) => `  ☐ ${m}`).join('\n')}\n`);
    console.log(r.blockers.length ? 'Not ready to launch.' : 'No blockers — ready to set previewMode: false and deploy.');
  }
  process.exitCode = r.blockers.length ? 1 : 0;
}
