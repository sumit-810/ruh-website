/** Tests dist/gentle-company.html opened straight from disk (file://, no server). */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)('playwright');
const FILE = pathToFileURL(new URL('../dist/gentle-company.html', import.meta.url).pathname).href;
const results = [];
const ok = (n, c, d = '') => { results.push(c); console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`); };
const b = await chromium.launch();
const errors = [];
for (const [label, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const ctx = await b.newContext({ viewport: vp });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(`${label}: ${e.message}`));
  p.on('console', (m) => m.type() === 'error' && errors.push(`${label}: ${m.text()}`));
  p.on('requestfailed', (r) => errors.push(`${label}: failed ${r.url().slice(0, 80)}`));
  await p.goto(FILE, { waitUntil: 'load' });
  await p.waitForSelector('body.is-ready');
  ok(`${label}: home renders`, (await p.textContent('#hero-title')).includes('first mist'));
  const imgs = await p.$$eval('#main img', (is) => is.length);
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } scrollTo(0, 0); });
  await p.waitForTimeout(300);
  const broken = await p.$$eval('#main img', (is) => is.filter((i) => i.complete && i.naturalWidth === 0).length);
  ok(`${label}: images load from the file`, broken === 0, `${imgs} images, ${broken} broken`);
  const fontOk = await p.evaluate(async () => { await document.fonts.ready; return document.fonts.check('40px "Cormorant Garamond"') && [...document.fonts].some((f) => f.family.includes('Cormorant') && f.status === 'loaded'); });
  ok(`${label}: embedded fonts load`, fontOk);

  // navigate to the product page via the hero CTA
  await p.click('.hero__ctas .btn');
  await p.waitForSelector('#notify form[data-waitlist]');
  ok(`${label}: link → product page`, p.url().includes('#/product.html?p=body-mist-no-01'));
  ok(`${label}: product offers notify-me (shop not open)`, !(await p.$('[data-open-bag]')));

  // coming soon page via deep link with anchor
  await p.evaluate(() => (location.hash = '#/collection.html?c=face-care#sunscreen'));
  await p.waitForSelector('#sunscreen');
  await p.waitForTimeout(300);
  const top = await p.$eval('#sunscreen', (el) => Math.round(el.getBoundingClientRect().top));
  ok(`${label}: deep link scrolls to item`, top >= 0 && top < 300, `top ${top}px`);

  // shop filters keep the route
  await p.evaluate(() => (location.hash = '#/shop.html'));
  await p.waitForSelector('[data-cat]');
  await p.click('[data-cat="face-care"]');
  await p.waitForTimeout(150);
  ok(`${label}: shop filter updates the hash route`, p.url().endsWith('#/shop.html?cat=face-care'));
  ok(`${label}: shop filter result`, (await p.$$eval('[data-results] .card', (x) => x.length)) === 6);

  // search form → search page
  await p.click('[data-open-search]');
  await p.fill('#search-input', 'serum');
  await p.press('#search-input', 'Enter');
  await p.waitForSelector('.search-hit');
  ok(`${label}: search submits to results page`, p.url().includes('#/search.html?q=serum') && (await p.textContent('main')).includes('Serum'));

  // back button works between pages
  await p.goBack();
  await p.waitForSelector('[data-cat]');
  ok(`${label}: browser back returns to previous page`, p.url().includes('#/shop.html'));

  await p.reload();
  await p.waitForSelector('body.is-ready');
  ok(`${label}: reload keeps the route`, p.url().includes('#/shop.html'));

  // every page route renders without errors
  for (const r of ['story.html', 'journal.html', 'article.html?a=reading-a-scent-pyramid', 'contact.html', 'faq.html', 'shipping-returns.html', 'privacy.html', 'terms.html', 'checkout.html', 'nope.html']) {
    await p.evaluate((h) => (location.hash = h), `#/${r}`);
    await p.waitForTimeout(150);
  }
  ok(`${label}: unknown route shows 404`, (await p.textContent('main')).includes('slipped away'));
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok(`${label}: no horizontal overflow`, overflow <= 0);
  await p.evaluate(() => (location.hash = '#/index.html'));
  await p.waitForSelector('#hero-title');
  await p.screenshot({ path: new URL(`./screens/single-file-${label}.png`, import.meta.url).pathname });
  await ctx.close();
}
await b.close();
ok('no JavaScript errors or failed requests', errors.length === 0, errors.slice(0, 3).join(' | '));
console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed.`);
