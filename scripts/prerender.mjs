/**
 * Prerender every route to static HTML (dist/<route>/index.html) so pages are
 * indexable and paint before JavaScript runs; React then hydrates them.
 * Also writes robots.txt and, once site.company.website is set, sitemap.xml.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const SSR = join(ROOT, 'dist-ssr');

const { render, routes, pageModule } = await import(pathToFileURL(join(SSR, 'entry-server.js')).href);
const { site } = await import(pathToFileURL(join(ROOT, 'site.config.js')).href);
const template = readFileSync(join(DIST, 'index.html'), 'utf8');
const manifest = JSON.parse(readFileSync(join(DIST, '.vite', 'manifest.json'), 'utf8'));

/** JS files a lazy page needs, so the browser fetches them alongside the main bundle. */
const preloads = (src) => {
  const files = new Set();
  const walk = (key) => {
    const m = manifest[key];
    if (!m || files.has(m.file)) return;
    files.add(m.file);
    (m.imports || []).forEach(walk);
  };
  if (src) walk(src);
  const entry = manifest['index.html'];
  return [...files].filter((f) => f !== entry?.file).map((f) => `<link rel="modulepreload" href="/${f}">`).join('');
};

const PRIVATE = ['/checkout', '/order', '/search', '/404'];
let count = 0;
for (const url of routes()) {
  const { html, head } = await render(url);
  const page = template.replace('<!--app-head-->', head + preloads(pageModule(url))).replace('<!--app-html-->', html);
  const file = url === '/' ? join(DIST, 'index.html') : url === '/404' ? join(DIST, '404.html') : join(DIST, url.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
  count++;
}

writeFileSync(
  join(DIST, 'robots.txt'),
  `User-agent: *\n${PRIVATE.map((p) => `Disallow: ${p}`).join('\n')}\n${site.company.website ? `\nSitemap: ${site.company.website.replace(/\/$/, '')}/sitemap.xml\n` : ''}`,
);
if (site.company.website) {
  const base = site.company.website.replace(/\/$/, '');
  const urls = routes().filter((u) => !PRIVATE.includes(u));
  writeFileSync(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>\n`,
  );
}
rmSync(SSR, { recursive: true, force: true });
rmSync(join(DIST, '.vite'), { recursive: true, force: true });
console.log(`prerendered ${count} pages${site.company.website ? ' + sitemap.xml' : ''} + robots.txt`);
