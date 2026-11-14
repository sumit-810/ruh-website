/**
 * One isolated check per motion effect, each run twice: with normal motion and
 * with prefers-reduced-motion. Every effect is mounted alone on
 * qa/fixtures/motion.html, so a failure points at one effect only.
 *
 *   python3 -m http.server 8080        # project root, another terminal
 *   cd qa && node motion.mjs [baseUrl]
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.argv[2] || 'http://localhost:8080';
const results = [];
const ok = (name, cond, detail = '') => {
  results.push(cond);
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const browser = await chromium.launch();

const open = async (effect, reduced) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(`${BASE}/qa/fixtures/motion.html?effect=${effect}`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ready);
  return { page, ctx, errors };
};

const each = async (effect, fn) => {
  for (const reduced of [false, true]) {
    const { page, ctx, errors } = await open(effect, reduced);
    const tag = `${effect}${reduced ? ' [reduced]' : ''}`;
    await fn(page, reduced, tag);
    ok(`${tag}: no JavaScript errors`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
};

await each('blur', async (page, reduced, tag) => {
  await page.waitForTimeout(reduced ? 100 : 1600);
  const s = await page.evaluate(() => {
    const words = [...document.querySelectorAll('.bt-w')];
    return { n: words.length, text: document.querySelector('h1').textContent, opacity: Math.min(...words.map((w) => +getComputedStyle(w).opacity)), em: !!document.querySelector('h1 em .bt-w') };
  });
  ok(`${tag}: words are split, text unchanged, emphasis kept`, s.n === 5 && s.text === 'Gentle, from the first mist.' && s.em, `${s.n} words`);
  ok(`${tag}: every word ends fully visible`, s.opacity === 1, `min opacity ${s.opacity}`);
});

await each('mask', async (page, reduced, tag) => {
  await page.waitForTimeout(reduced ? 100 : 1600);
  const t = await page.evaluate(() => [...document.querySelectorAll('.mt-i')].map((w) => getComputedStyle(w).transform));
  ok(`${tag}: words rise into place`, t.length === 4 && t.every((x) => x === 'none' || x === 'matrix(1, 0, 0, 1, 0, 0)'), t.join(','));
});

await each('scroll-reveal', async (page, reduced, tag) => {
  const lit = () => page.evaluate(() => document.querySelectorAll('.sr-w.is-lit').length);
  const total = await page.evaluate(() => document.querySelectorAll('.sr-w').length);
  const before = await lit();
  await page.evaluate(() => document.querySelector('[data-scroll-reveal]').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(300);
  const mid = await lit();
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.6));
  await page.waitForTimeout(300);
  const after = await lit();
  if (reduced) ok(`${tag}: all words lit without scrolling`, before === total, `${before}/${total}`);
  else ok(`${tag}: words brighten with scroll`, before === 0 && mid > 0 && after === total, `${before} → ${mid} → ${after} of ${total}`);
  const dim = await page.evaluate(() => getComputedStyle(document.querySelector('.statement__text')).getPropertyValue('--sr-dim').trim());
  ok(`${tag}: resting colour is the AA-checked token`, dim === '#8f7e72', dim);
});

await each('stack', async (page, reduced, tag) => {
  await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-stack-card]');
    window.scrollTo(0, cards[1].offsetTop - 200);
  });
  await page.waitForTimeout(400);
  const s = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('[data-stack-card]')];
    return { cover: cards[0].style.getPropertyValue('--cover'), pos: getComputedStyle(cards[0]).position, i: cards[2].style.getPropertyValue('--i') };
  });
  ok(`${tag}: cards pin with sticky positioning`, s.pos === 'sticky' && s.i === '2');
  if (reduced) ok(`${tag}: no scaling or shading`, s.cover === '', `--cover "${s.cover}"`);
  else ok(`${tag}: covered card settles back`, Number(s.cover) > 0, `--cover ${s.cover}`);
});

await each('tilt', async (page, reduced, tag) => {
  const box = await page.locator('[data-tilt]').boundingBox();
  await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2, { steps: 4 });
  await page.waitForTimeout(150);
  const s = await page.evaluate(() => {
    const el = document.querySelector('[data-tilt]');
    return { on: el.classList.contains('is-tilting'), ry: el.style.getPropertyValue('--ry') };
  });
  if (reduced) ok(`${tag}: no tilt`, !s.on && !s.ry);
  else ok(`${tag}: tilts toward the pointer, within 4°`, s.on && parseFloat(s.ry) > 0 && parseFloat(s.ry) <= 4, s.ry);
  await page.mouse.move(5, 5);
  await page.waitForTimeout(100);
  ok(`${tag}: resets when the pointer leaves`, !(await page.evaluate(() => document.querySelector('[data-tilt]').classList.contains('is-tilting'))));
});

await each('magnet', async (page, reduced, tag) => {
  const box = await page.locator('[data-magnet]').boundingBox();
  await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, { steps: 4 }); // inside the pill (hit-testing follows border-radius)
  await page.waitForTimeout(150);
  const x = await page.evaluate(() => document.querySelector('[data-magnet]').style.getPropertyValue('--mgx'));
  if (reduced) ok(`${tag}: button does not move`, !x);
  else ok(`${tag}: button leans toward the pointer, at most 6px`, parseFloat(x) > 0 && parseFloat(x) <= 6, x);
});

await each('curve', async (page, reduced, tag) => {
  const off = () => page.evaluate(() => Number(document.querySelector('textPath').getAttribute('startOffset')));
  const a = await off();
  await page.waitForTimeout(700);
  const b = await off();
  if (reduced) ok(`${tag}: text stays still`, a === b);
  else {
    ok(`${tag}: text drifts along the arc`, b !== a, `${a} → ${b}`);
    await page.evaluate(() => window.__motion.setPaused(true));
    const c = await off();
    await page.waitForTimeout(500);
    ok(`${tag}: pausing motion stops it`, (await off()) === c);
    await page.evaluate(() => window.__motion.setPaused(false));
  }
});

await each('field', async (page, reduced, tag) => {
  await page.waitForTimeout(800);
  const s = await page.evaluate(() => ({ canvas: !!document.querySelector('.field__canvas'), live: document.querySelector('.field').classList.contains('is-live'), bg: getComputedStyle(document.querySelector('.field')).backgroundImage }));
  ok(`${tag}: CSS gradient fallback is always present`, /gradient/.test(s.bg));
  if (reduced) ok(`${tag}: no WebGL started`, !s.canvas);
  else ok(`${tag}: WebGL field renders (or falls back cleanly)`, s.live || !s.canvas, s.live ? 'live' : 'no WebGL in this browser');
});

await each('toggle', async (page, reduced, tag) => {
  const btn = await page.$('[data-motion-toggle]');
  if (reduced) return ok(`${tag}: no pause control needed`, !btn);
  ok(`${tag}: pause control is a labelled toggle button`, (await btn.getAttribute('aria-pressed')) === 'false' && /pause/i.test(await btn.textContent()));
  await btn.click();
  ok(`${tag}: pressing pauses and is remembered`, (await btn.getAttribute('aria-pressed')) === 'true' && (await page.evaluate(() => window.__motion.isPaused())));
  await btn.click();
  ok(`${tag}: pressing again resumes`, (await btn.getAttribute('aria-pressed')) === 'false');
});

await browser.close();
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} motion checks passed`);
process.exit(passed === results.length ? 0 : 1);
