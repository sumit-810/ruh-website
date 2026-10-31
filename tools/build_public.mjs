/**
 * Copies the public website into ./public for deployment (used by netlify.toml).
 * Internal material — strategy docs, render tools, QA — is never published.
 * Also writes robots.txt and, when site.company.website is set, sitemap.xml.
 *
 * Launch guard: with site.previewMode false, the build fails while
 * tools/launch_check.mjs reports blockers, so an unfinished site can't go
 * live by accident. Preview builds deploy, and print the blocker count.
 *
 *   node tools/build_public.mjs
 */
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, products, collections } from '../site.config.js';
import { journal } from '../content/journal.js';
import { launchReport } from './launch_check.mjs';

const report = await launchReport();
if (!site.previewMode && report.blockers.length) {
  console.error(`Refusing to build a launch (previewMode: false) site with ${report.blockers.length} launch blocker(s):`);
  for (const b of report.blockers) console.error(`  • [${b.area}] ${b.msg}`);
  console.error('Run `node tools/launch_check.mjs` for details, or set previewMode back to true.');
  process.exit(1);
}
if (site.previewMode) console.log(`Preview build — ${report.blockers.length} launch blocker(s) remain (node tools/launch_check.mjs).`);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public');
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);

const html = readdirSync(ROOT).filter((f) => f.endsWith('.html'));
for (const f of html) cpSync(join(ROOT, f), join(OUT, f));
for (const d of ['assets', 'content']) cpSync(join(ROOT, d), join(OUT, d), { recursive: true });
cpSync(join(ROOT, 'site.config.js'), join(OUT, 'site.config.js'));

const PRIVATE = ['checkout.html', 'order.html', 'account.html', 'search.html', '404.html', 'netlify-forms.html'];
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
