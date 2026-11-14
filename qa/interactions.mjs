/**
 * Interaction + accessibility checks for the Gentle Company site.
 *
 *   python3 -m http.server 8080        # project root, another terminal
 *   cd qa && node interactions.mjs [baseUrl]
 *
 * Covers: product-first hero (living loop, blur-in headline, pause control),
 * collection shelf tabs, quick view, hover image, mega menu, mobile menu
 * (staggered reveal), product gallery (thumbs, arrows, full-screen viewer with
 * zoom), At a glance card, honest notify-me forms (fails honestly without a
 * server, thanks only on 2xx), living category panels, brand statement,
 * stacked moments, range filter and hotspots, collections, shop filters,
 * search palette (⌘K, arrow keys, Enter), shop-closed and shop-open behaviour
 * (config overridden in-browser), sticky bar never covering the notify panel,
 * reduced motion and Save-Data (no video or WebGL), internal links,
 * axe-core WCAG A/AA, and JavaScript errors. Per-effect checks: qa/motion.mjs.
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

  // living loops (only when the rendered loops are present in the manifest)
  const loopCount = await page.evaluate(async () => Object.keys((await import('/assets/js/data/loops.js')).loops).length);
  if (loopCount) {
    await page.waitForFunction(() => document.querySelector('.hero__media video') && !document.querySelector('.hero__media video').paused, null, { timeout: 15000 }).catch(() => {});
    ok('Hero loop plays over the still image', await page.$eval('.hero__media', (h) => !!h.querySelector('video') && !h.querySelector('video').paused && !!h.querySelector('img')));
    await page.click('.hero__toggle');
    ok('Pause control stops the hero loop', await page.$eval('.hero__media video', (v) => v.paused));
    await page.click('.hero__toggle');
  } else ok('No loop videos are requested before they are rendered', !(await page.$('video')));
  // blur-in headline: same words, all visible once settled
  await page.waitForTimeout(1500);
  const h1 = await page.$eval('#hero-title', (h) => ({ text: h.textContent, words: h.querySelectorAll('.bt-w').length, min: Math.min(...[...h.querySelectorAll('.bt-w')].map((w) => +getComputedStyle(w).opacity)) }));
  ok('Hero headline resolves word by word and ends fully visible', h1.words >= 4 && h1.min === 1 && /first mist/.test(h1.text), `${h1.words} words`);
  ok('Hero has a pause control for background motion', !!(await page.$('.hero__toggle[aria-pressed]')));

  // shelf tabs
  const total = await page.$$eval('[data-shelf] [data-col]', (els) => els.length);
  await page.click('[data-tab="face-care"]');
  const visible = await page.$$eval('[data-shelf] [data-col]', (els) => els.filter((e) => !e.hidden).map((e) => e.dataset.col));
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

  // living category panels
  const panels = await page.$$('.panel');
  ok('Shop by category shows three living panels', panels.length === 3 && (await page.$$('.panel [data-loop]')).length === 3);
  await page.evaluate(() => document.querySelector('.panels').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  const w0 = (await panels[1].boundingBox()).width;
  await panels[1].hover();
  await page.waitForTimeout(1100);
  const w1 = (await panels[1].boundingBox()).width;
  ok('Hovering a panel widens it', w1 > w0 * 1.2, `${Math.round(w0)} → ${Math.round(w1)}px`);
  await page.mouse.move(5, 5);

  // brand statement: a new image (not the bottle again) and words that brighten with scroll
  ok('Brand intro uses its own composition', /intro_still/.test(await page.$eval('.statement__media', (m) => m.innerHTML)));
  ok('Early access uses its own composition', /trio_still/.test(await page.$eval('.early__media', (m) => m.innerHTML)));
  await page.evaluate(() => document.querySelector('[data-scroll-reveal]').scrollIntoView({ block: 'end' }));
  await page.waitForTimeout(200);
  const litA = await page.$$eval('.sr-w.is-lit', (w) => w.length);
  await page.evaluate(() => document.querySelector('[data-scroll-reveal]').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  const litB = await page.$$eval('.sr-w.is-lit', (w) => w.length);
  ok('Brand statement brightens as it is read', litB > litA, `${litA} → ${litB} words`);

  // moments: cards stack as you scroll, the index follows
  const cards = await page.$$('[data-stack-card]');
  ok('Moments are four stacked cards', cards.length === 4 && (await cards[0].evaluate((c) => getComputedStyle(c).position)) === 'sticky');
  await page.evaluate(() => {
    const c = document.querySelectorAll('[data-stack-card]')[2];
    window.scrollTo(0, c.parentElement.getBoundingClientRect().top + window.scrollY + c.offsetTop - 60);
  });
  await page.waitForTimeout(500);
  const stack = await page.evaluate(() => ({ cover: +document.querySelector('[data-stack-card]').style.getPropertyValue('--cover'), on: [...document.querySelectorAll('.exp__index li')].findIndex((l) => l.classList.contains('is-on')) }));
  ok('Covered moments settle back and the index follows', stack.cover > 0 && stack.on >= 1, `cover ${stack.cover}, index ${stack.on}`);

  // range: filter by line
  await page.click('[data-range-filter="lip-care"]');
  const chips = await page.$$eval('[data-range-chips] li', (l) => l.filter((x) => !x.hidden).length);
  const lit = await page.$$eval('[data-hotspot]', (h) => h.filter((x) => !x.classList.contains('is-dim')).length);
  ok('Range filter shows one line (chips and hotspots)', chips === 2 && lit === 2, `${chips} chips, ${lit} hotspots`);
  ok('Range list is compact chips, not a table', !(await page.$('.range-list')) && (await page.$$('[data-range-chips] .range-chip')).length === 14);
  await page.click('[data-range-filter="all"]');

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
  await page.waitForSelector('.lb.is-open');
  ok('Clicking the image opens the full-screen viewer at that image', (await page.textContent('[data-lb-count]')).trim() === '4 / 7');
  await page.keyboard.press('ArrowRight');
  ok('Viewer: arrow key shows the next image', (await page.textContent('[data-lb-count]')).trim() === '5 / 7');
  await page.keyboard.press('+');
  await page.waitForTimeout(350);
  ok('Viewer: zooms in', await page.$eval('.lb', (l) => l.classList.contains('is-zoomed')));
  if (axeSource) {
    await page.addScriptTag({ content: axeSource });
    const v = await page.evaluate(async () => (await window.axe.run('.lb', { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map((x) => `${x.id}(${x.nodes.length})`));
    ok('axe WCAG A/AA: open image viewer', !v.length, v.join(', '));
  }
  await page.mouse.move(720, 450);
  await page.mouse.down();
  await page.mouse.move(640, 420, { steps: 4 });
  await page.mouse.up();
  ok('Viewer: drag pans the zoomed image', /translate3d\(-/.test(await page.$eval('.lb__frame img', (i) => i.style.transform)));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  ok('Viewer: Escape closes, focus returns, gallery follows', !(await page.$eval('.lb', (l) => l.classList.contains('is-open'))) && (await page.evaluate(() => document.activeElement.classList.contains('gallery__main'))) && (await page.textContent('.gallery__count')).trim() === '5 / 7');
  const glance = await page.textContent('.glance');
  ok('At a glance shows category, line and status only', /Body Mist/.test(glance) && /Body Care/.test(glance) && /Launching soon/.test(glance) && !/₹/.test(glance));
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
  await page.waitForTimeout(300);
  // search palette: ⌘K / Ctrl+K, arrow keys, Enter
  await page.keyboard.press('Control+k');
  await page.waitForSelector('.search-panel.is-open');
  ok('Ctrl+K opens the search palette with suggestions', (await page.$$('#search-list [role=option]')).length >= 5);
  if (axeSource) {
    await page.addScriptTag({ content: axeSource });
    const v = await page.evaluate(async () => (await window.axe.run('#search-panel', { runOnly: ['wcag2a', 'wcag2aa'] })).violations.map((x) => `${x.id}(${x.nodes.length})`));
    ok('axe WCAG A/AA: open search palette', !v.length, v.join(', '));
  }
  await page.keyboard.type('face');
  await page.waitForTimeout(300);
  ok('Nothing is highlighted until an arrow key is used', (await page.$eval('#search-input', (i) => i.getAttribute('aria-activedescendant'))) === '');
  await page.keyboard.press('ArrowDown');
  const ad = await page.$eval('#search-input', (i) => i.getAttribute('aria-activedescendant'));
  ok('Arrow keys move through results (aria-activedescendant)', ad === 'sopt-0');
  const target = await page.$eval(`#${ad}`, (a) => a.getAttribute('href'));
  await Promise.all([page.waitForURL((u) => u.href.includes(target.split('#')[0]), { timeout: 5000 }).catch(() => {}), page.keyboard.press('Enter')]);
  ok('Enter opens the highlighted result', page.url().includes(target.split('#')[0]), target);

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
  await page.waitForTimeout(1200);
  ok('Mobile menu items arrive in sequence and settle visible', await page.$$eval('#mobile-menu .mnav-tile, #mobile-menu .mnav li', (els) => els.every((e) => getComputedStyle(e).opacity === '1') && els.every((e, i, a) => i === 0 || parseFloat(getComputedStyle(e).transitionDelay) >= parseFloat(getComputedStyle(a[i - 1]).transitionDelay))));
  await page.click('#mobile-menu [data-close]');
  await page.waitForTimeout(500);
  ok('Mobile menu closes', !(await page.$eval('#mobile-menu', (d) => d.classList.contains('is-open'))));
  ok('No horizontal overflow on mobile home', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.goto(`${BASE}/product.html?p=body-mist-no-01`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, 2200));
  await page.waitForTimeout(500);
  ok('Mobile: sticky bar appears after the main action scrolls away', await page.$eval('[data-sticky]', (b) => b.classList.contains('is-on')));
  // the sticky bar must never sit on top of the notify panel
  const H = await page.evaluate(() => document.body.scrollHeight);
  let overlap = 0;
  for (let y = 0; y < H; y += 80) {
    overlap += await page.evaluate((y) => {
      window.scrollTo(0, y);
      const bar = document.querySelector('[data-sticky]');
      if (!bar.classList.contains('is-on')) return 0;
      const b = bar.getBoundingClientRect();
      const n = document.querySelector('#notify').getBoundingClientRect();
      return Math.max(0, Math.min(n.bottom, innerHeight) - Math.max(n.top, b.top)) > 0 ? 1 : 0;
    }, y);
  }
  ok('Mobile: sticky bar never covers the notify panel', overlap === 0, `${overlap} overlapping positions`);
  // viewer on touch: tap opens, double-tap zooms
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.tap('.gallery__main');
  await page.waitForSelector('.lb.is-open');
  const sb = await page.locator('[data-lb-stage]').boundingBox();
  await page.touchscreen.tap(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.waitForTimeout(80);
  await page.touchscreen.tap(sb.x + sb.width / 2, sb.y + sb.height / 2);
  await page.waitForTimeout(400);
  ok('Mobile: tap opens the viewer and double-tap zooms', await page.$eval('.lb', (l) => l.classList.contains('is-zoomed')));
  await page.click('[data-lb-close]');
  await page.waitForTimeout(400);
  ok('No horizontal overflow on mobile product page', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await ctx.close();
}

// ---------------------------------------------------------------- reduced motion + Save-Data
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  watch(page);
  const media = [];
  page.on('request', (r) => /\.(mp4|webm)$/.test(r.url()) && media.push(r.url()));
  await page.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const s = await page.evaluate(() => ({
    hidden: [...document.querySelectorAll('.bt-w, .sr-w')].filter((w) => getComputedStyle(w).opacity !== '1').length,
    lit: document.querySelectorAll('.sr-w.is-lit').length === document.querySelectorAll('.sr-w').length,
    video: !!document.querySelector('video'),
    canvas: !!document.querySelector('canvas'),
    toggle: !!document.querySelector('[data-motion-toggle]'),
  }));
  ok('Reduced motion: all text is visible at once', s.hidden === 0 && s.lit);
  ok('Reduced motion: no video or WebGL is loaded', !s.video && !s.canvas && !media.length);
  ok('Reduced motion: no pause control is shown (nothing moves)', !s.toggle);
  await ctx.close();

  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx2.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true, effectiveType: '4g' } }));
  const p2 = await ctx2.newPage();
  watch(p2);
  const media2 = [];
  p2.on('request', (r) => /\.(mp4|webm)$/.test(r.url()) && media2.push(r.url()));
  await p2.goto(`${BASE}/index.html`, { waitUntil: 'networkidle' });
  await p2.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p2.waitForTimeout(800);
  ok('Save-Data: no video or WebGL is downloaded or started', !media2.length && !(await p2.$('video')) && !(await p2.$('canvas')));
  await ctx2.close();
}

ok('No JavaScript errors during tests', !errors.length, errors.slice(0, 3).join(' | '));
await browser.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed.`);
process.exitCode = passed === results.length ? 0 : 1;
