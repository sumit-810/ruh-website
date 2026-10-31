/**
 * Brand & placeholder audit.
 * 1. Renders every page and scans what a customer can see or a crawler can
 *    read — visible text, <title>, meta tags, alt text, aria-labels, link
 *    titles — for the retired brand name and for placeholder / development
 *    language.
 * 2. Scans every file that is published (public/ after `node tools/build_public.mjs`)
 *    for the retired name.
 *
 *   python3 -m http.server 8080 &   (project root)
 *   node tools/build_public.mjs && cd qa && node brand-audit.mjs
 */
import { createRequire } from 'node:module';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = process.argv[2] || 'http://localhost:8080';
const OLD_BRAND = /r[uū]h\b|rūh|RŪH|gentlecare/i;
const PLACEHOLDER = /placeholder|provisional|to be confirmed|to confirm|preview build|concept render|lorem|example\.com|\bTBD\b|\bTODO\b|\[[^\]]*(confirm|decide|tbd)[^\]]*\]/i;
const PAGES = [
  'index.html', 'shop.html', 'shop.html?cat=face-care', 'product.html?p=body-mist-no-01', 'collection.html?c=body-care', 'collection.html?c=face-care',
  'collection.html?c=lip-care', 'story.html', 'journal.html', 'article.html?a=how-to-wear-a-body-mist', 'article.html?a=reading-a-scent-pyramid',
  'article.html?a=body-mist-or-perfume', 'contact.html', 'faq.html', 'shipping-returns.html', 'privacy.html', 'terms.html', 'search.html?q=mist',
  'checkout.html', '404.html',
];
let fails = 0;
const report = (ok, msg) => {
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
for (const url of PAGES) {
  await page.goto(`${BASE}/${url}`, { waitUntil: 'networkidle' });
  // open hidden-but-reachable content: mega menus, accordions, the mobile menu markup is in the DOM already
  await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
  const surface = await page.evaluate(() => {
    const bits = [document.title, document.body.innerText];
    document.querySelectorAll('meta[content]').forEach((m) => bits.push(m.content));
    document.querySelectorAll('[alt],[aria-label],[title],[placeholder]').forEach((el) =>
      ['alt', 'aria-label', 'title'].forEach((a) => el.getAttribute(a) && bits.push(el.getAttribute(a))),
    );
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => bits.push(s.textContent));
    return bits.join('\n');
  });
  const old = surface.match(OLD_BRAND);
  const ph = surface.match(PLACEHOLDER);
  report(!old && !ph, `${url}${old ? ` — old brand: "${old[0]}"` : ''}${ph ? ` — placeholder: "${ph[0]}"` : ''}`);
}
await browser.close();

const PUB = new URL('../public/', import.meta.url).pathname;
if (existsSync(PUB)) {
  const hits = [];
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(html|js|css|svg|txt|json|xml)$/.test(f) && OLD_BRAND.test(readFileSync(p, 'utf8'))) hits.push(p.replace(PUB, ''));
      if (OLD_BRAND.test(f)) hits.push(`filename: ${p.replace(PUB, '')}`);
    }
  };
  walk(PUB);
  report(!hits.length, `Published files contain no retired brand name${hits.length ? `: ${hits.slice(0, 8).join(', ')}` : ''}`);
} else console.log('SKIP  public/ not built (run node tools/build_public.mjs)');

console.log(fails ? `\n${fails} problem(s) found.` : '\nClean: no retired brand or placeholder language anywhere a customer can see.');
process.exitCode = fails ? 1 : 0;
