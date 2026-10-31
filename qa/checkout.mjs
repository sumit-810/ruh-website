/**
 * End-to-end checkout test. The browser runs the real checkout page; /api/*
 * calls are answered by the real Netlify function code (Razorpay's REST API
 * and its Checkout popup are simulated — no network, no money).
 *
 *   python3 -m http.server 8080 &   # project root
 *   node qa/checkout.mjs
 */
import { createRequire } from 'node:module';
import { createOrder } from '../netlify/functions/create-order.mjs';
import { verifyPayment, signatureFor } from '../netlify/functions/verify-payment.mjs';
import { quote } from '../assets/js/lib/pricing.js';
const { chromium } = createRequire(import.meta.url)('playwright');

const BASE = process.argv[2] || 'http://localhost:8080';
const env = { RAZORPAY_KEY_ID: 'rzp_test_e2e', RAZORPAY_KEY_SECRET: 'e2e_secret' };
const ORDER_ID = 'order_E2E1';
const results = [];
const ok = (n, c, d = '') => { results.push(c); console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${d ? ` — ${d}` : ''}`); };

// Razorpay REST API stand-in
let razorpayOrder;
const fakeRazorpayApi = async (url, init = {}) => {
  if (init.method === 'POST') {
    razorpayOrder = { id: ORDER_ID, ...JSON.parse(init.body), status: 'created' };
    return new Response(JSON.stringify(razorpayOrder), { status: 200 });
  }
  return new Response(JSON.stringify({ ...razorpayOrder, amount_paid: razorpayOrder.amount, status: 'paid' }), { status: 200 });
};

// Razorpay Checkout popup stand-in: "pays" immediately with the given signature
const checkoutStub = (signature) => `window.Razorpay = class {
  constructor(o) { this.o = o; window.__rzpOptions = o; }
  on() {}
  open() { setTimeout(() => this.o.handler({ razorpay_order_id: this.o.order_id, razorpay_payment_id: 'pay_E2E1', razorpay_signature: ${JSON.stringify(signature)} }), 50); }
};`;

const toRequest = (r) => new Request(r.url(), { method: r.method(), headers: { 'content-type': 'application/json' }, body: r.postData() });
const fromResponse = async (res) => ({ status: res.status, contentType: 'application/json', body: await res.text() });

const fillAndSubmit = async (page) => {
  await page.fill('#co-email', 'asha@example.com');
  await page.fill('#co-phone', '9876543210');
  await page.fill('#co-name', 'Asha Rao');
  await page.fill('#co-a1', '12 MG Road');
  await page.fill('#co-city', 'Bengaluru');
  await page.fill('#co-pin', '560001');
  await page.selectOption('#co-state', 'Karnataka');
  await page.click('[data-pay]');
};

const browser = await chromium.launch();
const errors = [];
const scenario = async (name, { signature, mockApi = true }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  if (mockApi) {
    await page.route('**/api/create-order', async (route) => route.fulfill(await fromResponse(await createOrder(toRequest(route.request()), env, fakeRazorpayApi))));
    await page.route('**/api/verify-payment', async (route) => route.fulfill(await fromResponse(await verifyPayment(toRequest(route.request()), env, fakeRazorpayApi))));
    await page.route('https://checkout.razorpay.com/**', (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: checkoutStub(signature) }));
  }
  await page.goto(`${BASE}/product.html?p=body-mist-no-01`, { waitUntil: 'networkidle' });
  await page.click('#main-buy [data-step="1"]');
  await page.click('#main-buy [data-add]');
  await page.waitForSelector('#bag-drawer.is-open');
  await page.goto(`${BASE}/checkout.html`, { waitUntil: 'networkidle' });
  const shownTotal = Number((await page.textContent('.summary__total strong')).replace(/[^\d]/g, ''));
  await fillAndSubmit(page);
  return { ctx, page, shownTotal };
};

// 1. successful payment
{
  const { ctx, page, shownTotal } = await scenario('success', { signature: signatureFor(ORDER_ID, 'pay_E2E1', env.RAZORPAY_KEY_SECRET) });
  await page.waitForURL(/order\.html\?ref=/, { timeout: 10000 });
  const opts = await page.evaluate(() => window.__rzpOptions || null);
  ok('Checkout opens Razorpay with the server order', razorpayOrder?.id === ORDER_ID);
  ok('Amount charged equals the total shown', razorpayOrder.amount === shownTotal * 100, `₹${shownTotal} → ${razorpayOrder.amount} paise`);
  ok('Charged amount comes from the catalogue', razorpayOrder.amount === quote([{ handle: 'body-mist-no-01', variantId: 'bm01-100', qty: 2 }]).total * 100);
  ok('Customer details reach the Razorpay order notes', razorpayOrder.notes.customer_name === 'Asha Rao' && razorpayOrder.notes.address.includes('560001'));
  ok('Verified payment lands on the confirmation page', (await page.textContent('main')).includes('Your order is confirmed'));
  ok('Confirmation shows the receipt reference', (await page.textContent('main')).includes(razorpayOrder.receipt));
  ok('Bag is emptied after payment', (await page.textContent('[data-bag-count]')).trim() === '0');
  await page.screenshot({ path: new URL('./screens/checkout-confirmed.png', import.meta.url).pathname, fullPage: true });
  await ctx.close();
}

// 2. forged signature must not confirm the order
{
  const { ctx, page } = await scenario('forged', { signature: 'f'.repeat(64) });
  await page.waitForFunction(() => document.querySelector('[data-status]')?.textContent.includes('couldn’t confirm'), null, { timeout: 10000 });
  ok('Forged payment signature is rejected', page.url().includes('checkout.html'));
  ok('Bag kept after a failed verification', (await page.textContent('[data-bag-count]')).trim() === '2');
  await ctx.close();
}

// 3. preview without a payment server: honest fallback, nothing charged
{
  const { ctx, page } = await scenario('preview', { mockApi: false });
  await page.waitForFunction(() => document.querySelector('[data-status]')?.textContent.includes('nothing was charged'), null, { timeout: 10000 });
  ok('Preview without payment server says nothing was charged', true);
  ok('No confirmation page in preview fallback', page.url().includes('checkout.html'));
  await ctx.close();
}

await browser.close();
ok('No JavaScript errors', errors.length === 0, errors.join(' | '));
console.log(`\n${results.filter(Boolean).length}/${results.length} checks passed.`);
process.exitCode = results.every(Boolean) ? 0 : 1;
