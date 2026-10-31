/**
 * Interaction + accessibility checks for the Gentle Company site.
 *
 *   python3 -m http.server 8080        # project root, another terminal
 *   cd qa && node interactions.mjs [baseUrl]
 *
 * Covers: product-first hero, collection shelf tabs, quick view, hover image,
 * mega menu, mobile menu, product gallery (thumbs, arrows, zoom), honest
 * notify-me forms (fails honestly without a server, thanks only on 2xx),
 * moments switcher, range hotspots, collections, shop filters, search,
 * shop-closed behaviour, shop-open behaviour (config overridden in-browser),
 * internal links, axe-core WCAG A/AA, and JavaScript errors.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'http://localhost:8080';
let axeSource = null;
try {
  axeSource = require('fs').readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
} catch {
  /* axe optional */
}
const results = [];
const ok = (name, cond, detail = '') => {
  results.push(cond);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const browser = await chromium.launch();
const errors = [];
const watch = (page) => {
  page.on('pageerror', (e) => errors.push(e.message));
  // the static preview server answers /api POSTs with 501 — expected locally
  page.on('console', (m) => m.type() === 'error' && !/501|Unsupported method/.test(m.text()) && errors.push(m.text()));
};

// ---------------------------------------------------------------- desktop
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page);
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });

  // first screen: brand + product, not text
  const wm = await page.$eval('.site-header .wordmark svg', (s) => s.getBoundingClientRect().width);
  ok('Header shows the Gentle Company wordmark', wm > 100, `${Math.round(wm)}px wide`);
  const heroImg = await page.$eval('.hero__media img', (i) => ({ w: i.getBoundingClientRect().width, h: i.getBoundingClientRect().height, top: i.getBoundingClientRect().top }));
  ok('Hero image fills the first screen', heroImg.w >= 1400 && heroImg.h >= 600, `${Math.round(heroImg.w)}×${Math.round(heroImg.h)}`);
  const heroWords = (await page.textContent('.hero__content')).trim().split(/\s+/).length;
  ok('Hero copy is short', heroWords <= 30, `${heroWords} words`);
  ok('No bag while the shop is closed', (await page.$('[data-open-bag]')) === null);

  // mega menu shows products as images
  await page.hover('[data-mega-trigger="mega-1"]');
  await page.waitForTimeout(400);
  ok('Mega menu opens with product images', await page.$eval('#mega-1', (m) => m.classList.contains('is-open') && m.querySelectorAll('.mega-item img').length >= 4));
  await page.mouse.move(700, 600);
  await page.waitForTimeout(400);

  // shelf tabs
  const total = await page.$$eval('[data-col]', (els) => els.length);
  await page.click('[data-tab="face-care"]');
  const visible = await page.$$eval('[data-col]', (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.col));
  ok('Collection shelf filters by tab', visible.length === 6 && visible.every((c) => c === 'face-care'), `${visible.length}/${total}`);
  await page.click('[data-tab="all"]');
  ok('Cards have a second image on hover', (await page.$$('.card .card__alt')).length >= 10);

  // quick view
  const qvBtn = await page.$('[data-col="body-care"] [data-quick-view="body-wash"]');
  await qvBtn.evaluate((b) => b.click());
  await page.waitForSelector('.qv.is-open');
  ok('Quick view opens', true);
  ok('Quick view offers notify-me, not a price', !!(await page.$('.qv form[data-waitlist]')) && !(await page.$('.qv .price')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  ok('Escape closes quick view', !(await page.$eval('.qv', (q) => q.classList.contains('is-open'))));

  // moments switcher
  await page.click('[data-moment="2"]');
  ok('Moments switcher changes the image', await page.$eval('[data-slide="2"]', (s) => s.classList.contains('is-on')));

  // range hotspots
  const hs = await page.$$('[data-hotspot]');
  ok('Range image has a hotspot per product', hs.length === 14, `${hs.length}`);
  if (hs.length) {
    await hs[0].click();
    ok('Hotspot opens a product popover', await page.$eval('#hs-pop', (p) => !p.hidden && !!p.querySelector('a')));
  }

  // early access: honest failure without a server
  await page.fill('#early-access input[type=email]', 'test@example.org');
  await page.click('#early-access button[type=submit]');
  await page.waitForFunction(() => !document.querySelector('#early-access [data-status]').hidden, null, { timeout: 5000 }).catch(() => {});
  const failMsg = await page.textContent('#early-access [data-status]');
  ok('Sign-up never fakes success when the server is unavailable', /nothing was sent/i.test(failMsg) && !/thank you/i.test(failMsg), failMsg.slice(0, 60));

  // …and thanks only on a confirmed 2xx
  await page.route('**/api/subscribe', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
  await page.fill('#early-access input[type=email]', 'test@example.org');
  await page.click('#early-access button[type=submit]');
  await page.waitForFunction(() => /thank/i.test(document.querySelector('#early-access [data-status]').textContent), null, { timeout: 5000 }).catch(() => {});
  ok('Sign-up confirms when the server stores it', /thank you/i.test(await page.textContent('#early-access [data-status]')));
  await page.unroute('**/api/subscribe');

  // internal links resolve
  const hrefs = [...new Set(await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')).filter((h) => /^[a-z0-9-]+\.html/i.test(h))))];
  let broken = [];
  for (const h of hrefs) {
    const r = await page.request.get(`${BASE}/${h.split('#')[0]}`);
    if (!r.ok()) broken.push(h);
  }
  ok('All internal links on home resolve', !broken.length, `${hrefs.length} links${broken.length ? `; broken: ${broken.join(', ')}` : ''}`);

  // product page
  await page.goto(`${BASE}/product.html?p=body-mist-no-01`, { waitUntil: 'networkidle' });
  ok('Product page shows no unconfirmed price', !(await page.$('.buy .price')) && !/₹/.test(await page.textContent('.buy')));
  ok('Product page offers notify-me', !!(await page.$('#notify form[data-waitlist]')));
  const accTitles = await page.$$eval('.acc summary', (s) => s.map((x) => x.textContent.trim()));
  ok('Only sections with confirmed data are shown', !accTitles.some((t) => /Ingredients|How to use|Product information|Scent/.test(t)), accTitles.join(', '));
  await page.click('.gallery__thumbs button:nth-child(3)');
  ok('Gallery thumbnail switches image', await page.$eval('.gallery__slide:nth-child(3)', (s) => s.classList.contains('is-on')));
  await page.click('.gallery__nav--next');
  ok('Gallery arrow advances', await page.$eval('.gallery__slide:nth-child(4)', (s) => s.classList.contains('is-on')));
  await page.click('.gallery__main', { position: { x: 300, y: 300 } });
  ok('Gallery zooms on click', await page.$eval('.gallery__main', (m) => m.classList.contains('is-zoom')));
  ok('Product structured data has no price', !(await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent).join(''))).includes('"price"'));

  // notify-me validation
  await page.click('#notify button[type=submit]');
  ok('Notify-me validates the email', (await page.$eval('#notify input[type=email]', (i) => i.getAttribute('aria-invalid'))) === 'true');

  // collections + shop
  await page.goto(`${BASE}/collection.html?c=body-care`, { waitUntil: 'networkidle' });
  ok('Body care collection lists 6 products', (await page.$$('.grid-cards .card')).length === 6);
  await page.goto(`${BASE}/shop.html`, { waitUntil: 'networkidle' });
  const all = (await page.$$('[data-results] .card')).length;
  await page.click('[data-cat="lip-care"]');
  ok('Shop filter works and syncs to the URL', (await page.$$('[data-results] .card')).length === 2 && page.url().includes('cat=lip-care'), `${all} → 2`);

  // search overlay
  await page.click('[data-open-search]');
  await page.fill('#search-input', 'lotion');
  await page.waitForTimeout(400);
  ok('Search finds Body Lotion', /Body Lotion/.test(await page.textContent('.search-panel')));
  await page.keyboard.press('Escape');

  // checkout closed
  await page.goto(`${BASE}/checkout.html`, { waitUntil: 'networkidle' });
  ok('Checkout is closed while the shop is not open', /opens soon/i.test(await page.textContent('main')) && !(await page.$('form[data-checkout]')));

  // contact form never fakes success
  await page.goto(`${BASE}/contact.html`, { waitUntil: 'networkidle' });
  await page.fill('#c-email', 'test@example.org');
  await page.fill('#c-msg', 'Hello');
  await page.click('[data-contact] button[type=submit]');
  await page.waitForFunction(() => !document.querySelector('[data-contact] [data-status]').hidden, null, { timeout: 5000 }).catch(() => {});
  ok('Contact form reports honestly without a server', /nothing was sent/i.test(await page.textContent('[data-contact] [data-status]')));

  // axe
  if (axeSource) {
    for (const url of ['index.html', 'product.html?p=body-mist-no-01', 'collection.html?c=face-care', 'shop.html', 'story.html', 'contact.html']) {
      await page.goto(`${BASE}/${url}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-in')));
      await page.waitForTimeout(1000);
      await page.addScriptTag({ content: axeSource });
      const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map((x) => `${x.id}(${x.nodes.length})`));
      ok(`axe WCAG A/AA: ${url}`, !v.length, v.join(', '));
    }
  }
  await page.close();
}

// ---------------------------------------------------------------- shop open (config overridden in the browser only)
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  watch(page);
  await page.route('**/site.config.js', async (route) => {
    const res = await route.fetch();
    let body = await res.text();
    body = body
      .replace('enabled: false,', 'enabled: true,')
      .replace("available: false, // set true", "available: true, // set true")
      .replace("variants: [{ id: 'bm01', size: null, price: null, compareAtPrice: null, sku: null, available: false }]", "variants: [{ id: 'bm01', size: '100 ml', price: 1500, compareAtPrice: null, sku: null, available: true }]");
    route.fulfill({ response: res, body });
  });
  await page.goto(`${BASE}/product.html?p=body-mist-no-01`, { waitUntil: 'networkidle' });
  ok('[shop open] Price and size appear once confirmed', /₹1,500/.test(await page.textContent('.buy')) && /100 ml/.test(await page.textContent('.buy')));
  ok('[shop open] Bag appears in the header', !!(await page.$('[data-open-bag]')));
  await page.click('#main-buy [data-add]');
  await page.waitForSelector('#bag-drawer.is-open');
  ok('[shop open] Add to bag opens the bag', true);
  ok('[shop open] Bag count updates', (await page.textContent('[data-bag-count]')).trim() === '1');
  await page.keyboard.press('Escape');
  await page.goto(`${BASE}/checkout.html`, { waitUntil: 'networkidle' });
  ok('[shop open] Checkout form is available', !!(await page.$('form[data-checkout]')));
  await page.close();
}

// ---------------------------------------------------------------- mobile
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  watch(page);
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  const top = await page.$eval('.hero__media img', (i) => i.getBoundingClientRect().top);
  ok('Mobile: product image is visible immediately', top < 200, `top ${Math.round(top)}px`);
  const cardTop = await page.$eval('.shelf .card', (c) => c.getBoundingClientRect().top);
  ok('Mobile: products start within two screens', cardTop < 844 * 2, `${Math.round(cardTop)}px`);
  ok('Mobile: shelf scrolls sideways', await page.$eval('.shelf__track', (t) => t.scrollWidth > t.clientWidth));
  await page.click('[data-open-menu]');
  await page.waitForSelector('#mobile-menu.is-open');
  ok('Mobile menu opens with image tiles', (await page.$$('#mobile-menu .mnav-tile img')).length >= 4);
  await page.click('#mobile-menu [data-close]');
  await page.waitForTimeout(500);
  ok('Mobile menu closes', !(await page.$eval('#mobile-menu', (d) => d.classList.contains('is-open'))));
  ok('No horizontal overflow on mobile home', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.goto(`${BASE}/product.html?p=body-mist-no-01`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 2200));
  await page.waitForTimeout(500);
  ok('Mobile: sticky bar appears after the main action scrolls away', await page.$eval('[data-sticky]', (b) => b.classList.contains('is-on')));
  ok('No horizontal overflow on mobile product page', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await ctx.close();
}

ok('No JavaScript errors during tests', !errors.length, errors.slice(0, 3).join(' | '));
await browser.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed.`);
process.exitCode = passed === results.length ? 0 : 1;
