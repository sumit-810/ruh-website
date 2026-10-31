/**
 * Launch-readiness report for Gentle Company.
 *
 * The website never shows placeholders: anything unconfirmed is simply hidden.
 * This script lists what is still missing, so you know which parts of the
 * site are switched off and what is needed to open the shop.
 *
 *   node tools/launch_check.mjs          # readable report (exit 1 while blockers remain)
 *   node tools/launch_check.mjs --json
 *
 * BLOCKERS: needed before selling (opening the shop: site.commerce.enabled).
 * WARNINGS: worth a decision; the site works without them.
 */
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function launchReport() {
  const { site, products } = await import(pathToFileURL(join(ROOT, 'site.config.js')));
  const { policies } = await import(pathToFileURL(join(ROOT, 'content/policies.js')));
  const { images } = await import(pathToFileURL(join(ROOT, 'assets/js/data/images.js')));
  const blockers = [];
  const warnings = [];
  const block = (area, msg) => blockers.push({ area, msg });
  const warn = (area, msg) => warnings.push({ area, msg });

  const co = site.company;
  if (!co.legalName) block('Company', 'company.legalName — registered legal name (seller identity under the E-Commerce Rules)');
  if (!co.registeredAddress) block('Company', 'company.registeredAddress');
  if (!co.gstin) warn('Company', 'company.gstin not set (required if GST-registered)');
  if (!co.website) warn('Company', 'company.website not set — needed for sitemap.xml, canonical links and absolute image URLs');
  if (!site.brand.trademarkCleared) warn('Brand', 'Trademark search/filing for "Gentle Company" (classes 3 and 35) not confirmed (brand.trademarkCleared)');

  const c = site.contact;
  if (!c.email) block('Contact', 'contact.email — business inbox (shown on contact page, footer and policies)');
  if (!c.grievanceOfficer) block('Contact', 'contact.grievanceOfficer — name, designation, email, phone');
  if (!c.phone && !c.whatsapp) warn('Contact', 'No phone or WhatsApp number');

  for (const p of products) {
    const priced = p.variants.filter((v) => v.price > 0 && v.size);
    if (!priced.length) block('Product', `${p.name}: no confirmed size and price (variants[].size, variants[].price) — the page shows "Notify me" instead of a price`);
    if (!p.available) block('Product', `${p.name}: available is false`);
    if (!p.ingredients) block('Product', `${p.name}: ingredients (full INCI) not set — the Ingredients section is hidden`);
    if (!p.howToUse) warn('Product', `${p.name}: howToUse not set — the How to use section is hidden`);
    if (!p.scent?.notes) warn('Product', `${p.name}: scent.notes not set — the notes visualisation is hidden`);
    for (const [k, v] of Object.entries(p.productInformation || {}))
      if (v == null && !['Marketed by', 'Customer care'].includes(k)) block('Product', `${p.name}: product information "${k}" not set (Legal Metrology)`);
    if (!(p.reviews || []).length) warn('Product', `${p.name}: no reviews yet — never add unverifiable ones`);
  }

  const renders = Object.entries(images).filter(([, m]) => m.kind !== 'photo').length;
  if (renders) warn('Images', `${renders} image(s) are rendered packaging visuals, not photographs of manufactured stock — replace with photography when final packaging exists (PHOTOGRAPHY_BRIEF.md)`);

  for (const [k, on] of Object.entries(policies.published || {})) if (!on) block('Policies', `${policies[k].title} is not published (content/policies.js → published.${k}); decide the [bracketed] items and have it reviewed`);
  if (!policies.updated) warn('Policies', 'content/policies.js → updated: set the effective date');

  const cfg = readFileSync(join(ROOT, 'site.config.js'), 'utf8');
  if (/\bTODO|PROVISIONAL|example\.com/i.test(cfg)) warn('Content', 'site.config.js contains a TODO / PROVISIONAL / example.com marker');

  if (!site.commerce.enabled) warn('Shop', 'commerce.enabled is false — purchase buttons and the bag are hidden; product pages offer "Notify me"');

  const manual = [
    'Vercel → Settings → Environment Variables: BREVO_API_KEY, BREVO_LIST_ID, CONTACT_TO_EMAIL, MAIL_FROM_EMAIL (sign-ups and contact form)',
    'Vercel → Environment Variables: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (live keys) before enabling the shop',
    'Submit the early-access, notify-me and contact forms on the live site and confirm they arrive in Brevo / the inbox',
    'Place one real order end to end once the shop is enabled, then refund it from the Razorpay dashboard',
    'Connect the domain and confirm HTTPS',
  ];
  return { blockers, warnings, manual };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = await launchReport();
  if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 2));
  else {
    const group = (items) => {
      const by = {};
      for (const i of items) (by[i.area] ||= []).push(i.msg);
      return Object.entries(by).map(([a, ms]) => `  ${a}\n${ms.map((m) => `    • ${m}`).join('\n')}`).join('\n');
    };
    console.log(`\nLaunch check — ${r.blockers.length} blocker(s) before selling, ${r.warnings.length} warning(s)\n`);
    if (r.blockers.length) console.log(`NEEDED BEFORE SELLING\n${group(r.blockers)}\n`);
    if (r.warnings.length) console.log(`WARNINGS\n${group(r.warnings)}\n`);
    console.log(`MANUAL CHECKS\n${r.manual.map((m) => `  ☐ ${m}`).join('\n')}\n`);
  }
  process.exitCode = r.blockers.length ? 1 : 0;
}
