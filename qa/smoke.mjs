/**
 * Smoke test for the built site: loads every prerendered page at desktop and
 * mobile widths and checks for console/page errors, horizontal overflow and a
 * real <h1>; then exercises search (⌘K), the shelf filter, quick view and the
 * honest form messaging. Screenshots go to qa/screens/.
 *
 *   npm run build
 *   python3 -m http.server 4173 --directory dist   # in another terminal
 *   node qa/smoke.mjs [baseUrl]
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = (process.argv[2] || 'http://localhost:4173').replace(/\/$/, '');
const OUT = new URL('./screens/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const PAGES = ['/', '/shop/', '/shop/?cat=face-care', '/products/body-mist-no-01/', '/collections/body-care/', '/collections/face-care/', '/collections/lip-care/', '/story/', '/journal/', '/journal/how-to-wear-a-body-mist/', '/contact/', '/faq/', '/privacy/', '/shipping-returns/', '/terms/', '/search/?q=mist', '/checkout/', '/404.html'];
const SIZES = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`  ✗ ${msg}`);
};

const browser = await chromium.launch();
for (const [label, viewport] of Object.entries(SIZES)) {
  const page = await browser.newPage({ viewport });
  for (const path of PAGES) {
    const errors = [];
    page.removeAllListeners('console');
    page.removeAllListeners('pageerror');
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const { overflow, h1 } = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelector('h1')?.textContent?.trim() || '',
    }));
    const name = `${label}${path.replace(/[/?=.]+/g, '-')}`.replace(/-$/, '');
    await page.screenshot({ path: `${OUT}${name}.png` });
    if (errors.length) fail(`${label} ${path}: ${errors.join(' | ')}`);
    if (overflow > 1) fail(`${label} ${path}: horizontal overflow ${overflow}px`);
    if (!h1) fail(`${label} ${path}: no <h1>`);
  }
  await page.close();
}

// interactions (desktop)
const page = await browser.newPage({ viewport: SIZES.desktop });
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

await page.keyboard.press('Control+k');
await page.getByPlaceholder('Search products and the journal').fill('mist');
await page.waitForTimeout(300);
if (!(await page.getByRole('option', { name: /Body Mist/ }).first().isVisible())) fail('search: no result for "mist"');
await page.keyboard.press('Escape');

await page.getByRole('tab', { name: 'Face' }).click();
await page.waitForTimeout(800);
const names = await page.locator('#collection h3').allTextContents();
if (names.includes('Body Wash') || !names.includes('Serum')) fail(`shelf filter: unexpected items ${names.join(', ')}`);

await page.locator('#collection article').first().hover();
await page.getByRole('button', { name: /Quick view/ }).first().click();
try {
  await page.getByRole('dialog').waitFor({ state: 'visible', timeout: 5000 });
} catch {
  fail('quick view did not open');
}
await page.keyboard.press('Escape');

// no /api on a static server: the form must say it was NOT sent, never fake success
await page.goto(`${BASE}/products/body-mist-no-01/`, { waitUntil: 'networkidle' });
await page.locator('#notify input[type=email]').fill('test@example.com');
await page.locator('#notify button[type=submit]').click();
await page.waitForTimeout(800);
const status = await page.locator('#notify [role=status]').textContent();
if (!/nothing was sent|couldn’t|not sent/i.test(status || '')) fail(`notify form: expected an honest failure message, got "${status}"`);

await browser.close();
console.log(failures ? `\n${failures} problem(s) found` : `\nAll checks passed (${PAGES.length} pages × ${Object.keys(SIZES).length} sizes + interactions)`);
process.exit(failures ? 1 : 0);
