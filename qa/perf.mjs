/** Page weight + Largest Contentful Paint + layout shift for key pages (local server, no throttling). */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const BASE = process.argv[2] || 'http://localhost:8080';
const b = await chromium.launch();
for (const [label, vp] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }]]) {
  for (const path of ['index.html', 'product.html?p=body-mist-no-01', 'collection.html?c=face-care']) {
    const ctx = await b.newContext({ viewport: vp });
    const page = await ctx.newPage();
    let bytes = 0, requests = 0;
    page.on('response', async (r) => { requests++; try { bytes += (await r.body()).length; } catch {} });
    await page.addInitScript(() => {
      window.__lcp = 0; window.__cls = 0;
      new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(`${BASE}/${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: window.__cls.toFixed(3) }));
    console.log(`${label.padEnd(8)} ${path.padEnd(32)} ${(bytes / 1024).toFixed(0).padStart(5)} KB  ${String(requests).padStart(3)} req  LCP ${m.lcp} ms  CLS ${m.cls}`);
    await ctx.close();
  }
}
await b.close();
