/**
 * Functional tests for the shopping flow and interactive components.
 *
 *   python3 -m http.server 8080   # project root
 *   node qa/interactions.mjs [baseUrl]
 *
 * Covers: add to bag (PDP + card quick add), quantity changes, totals,
 * persistence across reloads, removal, sticky mobile bar, mega menu + mobile
 * menu, search, FAQ accordions, newsletter validation + honest messaging,
 * shop filters, coming-soon notify panels, checkout demo validation,
 * keyboard focus handling, and a basic axe-core accessibility scan when axe
 * is available.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'http://localhost:8080';
const results = [];
const ok = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const rupees = (s) => Number(String(s).replace(/[^\d]/g, ''));

let axeSource = null;
try {
  axeSource = require('fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
} catch {
  /* axe optional */
}

const browser = await chromium.launch();
const errors = [];

// ---------------------------------------------------------------- desktop
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(`${BASE}/product.html?p=body-mist-no-01`, { waitUntil: 'networkidle' });
  const unit = rupees(await page.textContent('#main-buy [data-btn-price]'));
  ok('PDP shows a price in the CTA', unit > 0, `₹${unit}`);
  ok('PDP shows MRP inclusive of taxes', (await page.textContent('[data-price-row]')).includes('MRP inclusive of all taxes'));
  ok('Buy now hidden without real checkout', (await page.$('[data-buy-now]')) === null);
  ok('Size selector hidden with one size', (await page.$('#main-buy input[type=radio][name=variant]')) === null);

  // quantity stepper then add
  await page.click('#main-buy [data-step="1"]');
  await page.click('#main-buy [data-step="1"]');
  ok('Quantity stepper increments', (await page.inputValue('#main-buy input[type=number]')) === '3');
  await page.click('#main-buy [data-add]');
  await page.waitForSelector('#bag-drawer.is-open');
  ok('Add to bag opens the bag drawer', true);
  ok('Bag count updates', (await page.textContent('[data-bag-count]')).trim() === '3');
  let subtotal = rupees(await page.textContent('#bag-drawer .cart-totals strong'));
  ok('Subtotal = qty × price', subtotal === unit * 3, `₹${subtotal}`);
  ok('Focus moved into the bag drawer', await page.evaluate(() => document.getElementById('bag-drawer').contains(document.activeElement)));

  // change quantity in drawer
  await page.click('#bag-drawer [data-step="-1"]');
  await page.waitForTimeout(100);
  subtotal = rupees(await page.textContent('#bag-drawer .cart-totals strong'));
  ok('Decrease quantity in drawer updates subtotal', subtotal === unit * 2, `₹${subtotal}`);
  await page.fill('#bag-drawer input[type=number]', '99');
  await page.press('#bag-drawer input[type=number]', 'Tab');
  await page.waitForTimeout(100);
  const capped = Number(await page.inputValue('#bag-drawer input[type=number]'));
  ok('Quantity is capped at the configured maximum', capped <= 10 && capped > 0, `qty ${capped}`);

  // escape closes and returns focus
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  ok('Escape closes the bag drawer', !(await page.$eval('#bag-drawer', (d) => d.classList.contains('is-open'))));

  // persistence
  await page.reload({ waitUntil: 'networkidle' });
  ok('Bag persists across reloads', Number((await page.textContent('[data-bag-count]')).trim()) === capped);

  // checkout demo
  await page.goto(`${BASE}/checkout.html`, { waitUntil: 'networkidle' });
  ok('Checkout is labelled as a demo', (await page.textContent('main')).includes('Demo checkout'));
  await page.click('[data-checkout] button[type=submit]');
  const invalid = await page.$$eval('[data-checkout] [aria-invalid="true"]', (els) => els.length);
  ok('Checkout validates required fields', invalid >= 5, `${invalid} invalid fields`);
  await page.fill('#co-email', 'test@example.com');
  await page.fill('#co-phone', '9876543210');
  await page.fill('#co-name', 'Test Person');
  await page.fill('#co-a1', '1 Test Street');
  await page.fill('#co-city', 'Mumbai');
  await page.fill('#co-pin', '400001');
  await page.selectOption('#co-state', 'Maharashtra');
  await page.click('[data-checkout] button[type=submit]');
  const msg = await page.textContent('[data-checkout] [data-status]');
  ok('Demo checkout never claims an order was placed', /No order has been placed/.test(msg), msg.slice(0, 60) + '…');

  // remove item
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.click('[data-open-bag]');
  await page.waitForSelector('#bag-drawer.is-open');
  await page.click('#bag-drawer [data-remove]');
  await page.waitForTimeout(150);
  ok('Remove empties the bag', (await page.textContent('#bag-drawer')).includes('Your bag is empty'));
  await page.keyboard.press('Escape');

  // quick add from home featured buy box
  await page.click('#featured [data-add]');
  await page.waitForSelector('#bag-drawer.is-open');
  ok('Featured module adds to bag', (await page.textContent('[data-bag-count]')).trim() === '1');
  await page.keyboard.press('Escape');

  // mega menu
  await page.click('[data-mega="0"]');
  ok('Shop mega menu opens', await page.$eval('#mega-0', (m) => m.classList.contains('is-open')));
  ok('Mega menu marks coming-soon items', (await page.textContent('#mega-0')).includes('Coming soon'));
  await page.keyboard.press('Escape');
  ok('Escape closes mega menu', !(await page.$eval('#mega-0', (m) => m.classList.contains('is-open'))));

  // search
  await page.click('[data-open-search]');
  await page.fill('#search-input', 'lotion');
  await page.waitForTimeout(250);
  const hits = await page.$$eval('#search-live .search-hit', (a) => a.map((x) => x.textContent));
  ok('Search finds coming-soon items', hits.some((t) => t.includes('Body Lotion')), `${hits.length} hits`);
  await page.keyboard.press('Escape');

  // newsletter validation + honest messaging (no endpoint configured)
  const form = '#early-access form[data-waitlist]';
  await page.click(`${form} button[type=submit]`);
  ok('Newsletter rejects empty email', (await page.getAttribute(`${form} input[type=email]`, 'aria-invalid')) === 'true');
  await page.fill(`${form} input[type=email]`, 'not-an-email');
  await page.click(`${form} button[type=submit]`);
  ok('Newsletter rejects invalid email', ((await page.textContent(`${form} .field-error`)) || '').includes('valid email'));
  await page.fill(`${form} input[type=email]`, 'reader@example.com');
  await page.click(`${form} button[type=submit]`);
  await page.waitForTimeout(150);
  const status = await page.textContent(`${form} [data-status]`);
  ok('Unconnected form does not fake success', !/you’re on the list/i.test(status) && /nothing was sent|isn’t accepting/i.test(status), status.slice(0, 70) + '…');

  // shop filters
  await page.goto(`${BASE}/shop.html`, { waitUntil: 'networkidle' });
  const all = await page.$$eval('[data-results] .pcard', (x) => x.length);
  await page.check('input[name=avail][value=now]', { force: true });
  const now = await page.$$eval('[data-results] .pcard', (x) => x.length);
  await page.check('input[name=avail][value=soon]', { force: true });
  await page.check('input[name=cat][value=lip-care]', { force: true });
  const lip = await page.$$eval('[data-results] .pcard', (x) => x.length);
  ok('Shop filters work', all === 14 && now === 1 && lip === 2, `all ${all}, available ${now}, lip ${lip}`);
  ok('Filters sync to URL', page.url().includes('cat=lip-care') && page.url().includes('avail=soon'));
  ok('Coming-soon cards have no add-to-bag', (await page.$$('[data-results] .pcard--soon [data-quick-add]')).length === 0);

  // coming soon notify panel
  await page.goto(`${BASE}/collection.html?c=face-care`, { waitUntil: 'networkidle' });
  await page.click('[data-notify="sunscreen"]');
  ok('Notify me opens an inline form', await page.$eval('#notify-sunscreen', (n) => !n.hidden));
  ok('Coming soon page offers no purchase', (await page.$$('main [data-add], main [data-quick-add]')).length === 0);

  // FAQ accordion
  await page.goto(`${BASE}/faq.html`, { waitUntil: 'networkidle' });
  const first = page.locator('details.acc').first();
  await first.locator('summary').click();
  ok('FAQ accordion opens', await first.evaluate((d) => d.open));
  await first.locator('summary').press('Enter');
  ok('FAQ accordion closes with keyboard', !(await first.evaluate((d) => d.open)));

  // nav links resolve (no 404s)
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  const hrefs = await page.$$eval('a[href]', (as) => [...new Set(as.map((a) => a.getAttribute('href')).filter((h) => h && !h.startsWith('#') && !h.startsWith('mailto:') && !h.startsWith('http')))]);
  const bad = [];
  for (const h of hrefs) {
    const r = await page.request.get(`${BASE}/${h.split('#')[0]}`);
    if (r.status() >= 400) bad.push(`${h} → ${r.status()}`);
  }
  ok('All internal links on home resolve', bad.length === 0, bad.join(', ') || `${hrefs.length} links`);

  // accessibility scan
  if (axeSource) {
    for (const path of ['index.html', 'product.html?p=body-mist-no-01', 'collection.html?c=body-care', 'shop.html', 'checkout.html', 'contact.html']) {
      await page.goto(`${BASE}/${path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-in')));
      await page.waitForTimeout(1200); // let reveal transitions finish so contrast is measured at full opacity
      await page.addScriptTag({ content: axeSource });
      const res = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map((v) => `${v.id} (${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`));
      ok(`axe WCAG A/AA: ${path}`, res.length === 0, res.join('; '));
    }
  } else {
    console.log('SKIP  axe-core not installed (npm i -D axe-core) — accessibility scan skipped');
  }
  await ctx.close();
}

// ---------------------------------------------------------------- mobile
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/product.html?p=body-mist-no-01`, { waitUntil: 'networkidle' });
  ok('Sticky bar shown on load while main CTA is below the fold', await page.$eval('#sticky-bar', (b) => b.classList.contains('is-on')));
  await page.$eval('#main-buy [data-add]', (el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  ok('Sticky bar hidden while main CTA visible', !(await page.$eval('#sticky-bar', (b) => b.classList.contains('is-on'))));
  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(500);
  ok('Sticky bar appears after scrolling past CTA', await page.$eval('#sticky-bar', (b) => b.classList.contains('is-on')));
  const before = Number((await page.textContent('[data-bag-count]')).trim());
  await page.click('[data-sticky-add]');
  await page.waitForSelector('#bag-drawer.is-open');
  ok('Sticky bar adds to bag', Number((await page.textContent('[data-bag-count]')).trim()) === before + 1);
  await page.keyboard.press('Escape');

  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.click('[data-open-menu]');
  await page.waitForSelector('#mobile-menu.is-open');
  ok('Mobile menu opens', true);
  await page.click('#mobile-menu .mnav__toggle');
  ok('Mobile menu sections expand', await page.$eval('#msub-0', (n) => !n.hidden));
  ok('Mobile menu shows Soon labels', (await page.textContent('#msub-0')).includes('Soon'));
  await page.click('#mobile-menu [data-close]');
  await page.waitForTimeout(600);
  ok('Mobile menu closes', !(await page.$eval('#mobile-menu', (n) => n.classList.contains('is-open'))));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  ok('No horizontal overflow on mobile home', overflow <= 0, `${overflow}px`);
  await ctx.close();
}

await browser.close();
ok('No JavaScript errors during tests', errors.length === 0, errors.slice(0, 3).join(' | '));
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
process.exitCode = failed.length ? 1 : 0;
