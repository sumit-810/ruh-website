/**
 * Rasterise brand SVGs for places that need bitmaps:
 *   assets/brand/og-wordmark.png       wordmark for the social share image (cocoa, transparent)
 *   assets/img/apple-touch-icon.png    180×180 home-screen icon (monogram on cocoa)
 *   assets/brand/gentle-company-social-avatar.png  1080×1080 profile image
 *
 *   node tools/rasterize_brand.mjs     (needs Playwright + Chromium)
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = createRequire('/opt/node22/lib/node_modules/')('playwright')); }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = (f) => readFileSync(join(ROOT, f), 'utf8');
const b = await chromium.launch();
const shot = async (html, w, h, out, transparent = false) => {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<body style="margin:0;width:${w}px;height:${h}px;display:grid;place-items:center;${transparent ? 'background:transparent' : ''}">${html}</body>`);
  await p.screenshot({ path: join(ROOT, out), omitBackground: transparent });
  await p.close();
};
const wm = svg('assets/brand/gentle-company-wordmark.svg').replace('<svg', '<svg style="width:440px;height:auto;display:block"');
await shot(wm, 440, 32, 'assets/brand/og-wordmark.png', true);
const mono = (size, pad) =>
  `<div style="width:${size}px;height:${size}px;background:#2a201b;display:grid;place-items:center">${svg('assets/brand/gentle-company-monogram.svg')
    .replace(/fill="#2a201b"/g, 'fill="#f6f2ec"').replace(/stroke="#2a201b"/g, 'stroke="#f6f2ec"')
    .replace('<svg', `<svg style="height:${size - pad * 2}px;width:auto"`)}</div>`;
await shot(mono(180, 26), 180, 180, 'assets/img/apple-touch-icon.png');
await shot(mono(1080, 200), 1080, 1080, 'assets/brand/gentle-company-social-avatar.png');
await b.close();
console.log('rasterised: og-wordmark.png, apple-touch-icon.png, gentle-company-social-avatar.png');
