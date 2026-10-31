/**
 * Smoke test: loads every page at desktop / tablet / mobile widths, records
 * console errors, page errors, failed requests and horizontal overflow, and
 * saves screenshots to qa/screens/.
 *
 *   python3 -m http.server 8080        # from the project root, in another terminal
 *   node qa/smoke.mjs [baseUrl]
 */
import { createRequire } from 'node:module';
// Playwright may be installed globally (NODE_PATH); fall back to a local install.
const { chromium } = createRequire(import.meta.url)('playwright');
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8080';
const OUT = new URL('./screens/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['home', 'index.html'],
  ['shop', 'shop.html'],
  ['shop-soon', 'shop.html?avail=soon'],
  ['product', 'product.html?p=body-mist-no-01'],
  ['body-care', 'collection.html?c=body-care'],
  ['face-care', 'collection.html?c=face-care'],
  ['lip-care', 'collection.html?c=lip-care'],
  ['story', 'story.html'],
  ['journal', 'journal.html'],
  ['article', 'article.html?a=how-to-wear-a-body-mist'],
  ['contact', 'contact.html'],
  ['faq', 'faq.html'],
  ['shipping', 'shipping-returns.html'],
  ['privacy', 'privacy.html'],
  ['terms', 'terms.html'],
  ['search', 'search.html?q=mist'],
  ['checkout-empty', 'checkout.html'],
  ['account', 'account.html'],
  ['404', '404.html'],
  ['bad-product', 'product.html?p=does-not-exist'],
];

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900 }],
  ['tablet', { width: 820, height: 1180 }],
  ['mobile', { width: 390, height: 844 }],
];

const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
const fullPage = process.env.FULL !== '0';

const browser = await chromium.launch();
const problems = [];
for (const [vpName, vp] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  for (const [name, path] of PAGES) {
    if (only && !only.includes(name)) continue;
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => m.type() === 'error' && errs.push(`console: ${m.text()}`));
    page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
    page.on('requestfailed', (r) => errs.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
    page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('favicon.ico') && errs.push(`http ${r.status()}: ${r.url()}`));
    await page.goto(`${BASE}/${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    // scroll through like a visitor so lazy images load, then return to the top
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += Math.round(vp.height * 0.8)) {
      await page.evaluate((top) => window.scrollTo(0, top), y);
      await page.waitForTimeout(80);
    }
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in'));
      // images in horizontal scrollers stay lazy until swiped to — don't wait on them forever
      const pending = [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r; }));
      await Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 3000))]);
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) errs.push(`horizontal overflow: ${overflow}px`);
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
    broken.forEach((b) => errs.push(`broken image: ${b}`));
    await page.screenshot({ path: `${OUT}${name}-${vpName}.png`, fullPage });
    if (errs.length) problems.push({ page: name, viewport: vpName, errs });
    await page.close();
  }
  await ctx.close();
}
await browser.close();

if (problems.length) {
  console.log(JSON.stringify(problems, null, 2));
  process.exitCode = 1;
} else {
  console.log('No console errors, failed requests, broken images or overflow on any page/viewport.');
}
