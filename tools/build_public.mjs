/**
 * Copies the public website into ./public for deployment (Vercel: vercel.json → outputDirectory).
 * Internal material — strategy docs, render tools, QA — is never published.
 * Also writes robots.txt and, when site.company.website is set, sitemap.xml.
 *
 *   node tools/build_public.mjs
 */
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, products, collections } from '../site.config.js';
import { journal } from '../content/journal.js';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);

const html = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
for (const f of html) cpSync(join(ROOT, f), join(OUT, f));
for (const d of ['assets', 'content']) cpSync(join(ROOT, d), join(OUT, d), { recursive: true });
cpSync(join(ROOT, 'site.config.js'), join(OUT, 'site.config.js'));

const PRIVATE = ['checkout.html', 'order.html', 'search.html', '404.html'];
writeFileSync(
  join(OUT, 'robots.txt'),
  `User-agent: *\n${PRIVATE.map((p) => `Disallow: /${p}`).join('\n')}\n${site.company.website ? `\nSitemap: ${site.company.website.replace(/\/$/, '')}/sitemap.xml\n` : ''}`
);

if (site.company.website) {
  const base = site.company.website.replace(/\/$/, '');
  const urls = [
    ...html.filter((f) => !PRIVATE.includes(f) && !['product.html', 'collection.html', 'article.html'].includes(f)).map((f) => (f === 'index.html' ? '/' : `/${f}`)),
    ...products.map((p) => `/product.html?p=${p.handle}`),
    ...collections.map((c) => `/collection.html?c=${c.handle}`),
    ...journal.map((a) => `/article.html?a=${a.slug}`),
  ];
  writeFileSync(
    join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u.replace(/&/g, '&amp;')}</loc></url>`).join('\n')}\n</urlset>\n`
  );
}
console.log(`public/: ${html.length} pages + assets${site.company.website ? ' + sitemap.xml' : ''} + robots.txt`);
