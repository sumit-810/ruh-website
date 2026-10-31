/**
 * Unit tests for the payment functions (no network: Razorpay is mocked).
 *   node --test qa/functions.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createOrder, validateCustomer } from '../server/create-order.mjs';
import { verifyPayment, signatureFor, isValidSignature } from '../server/verify-payment.mjs';
import { quote } from '../assets/js/lib/pricing.js';
import { products } from '../site.config.js';

const env = { RAZORPAY_KEY_ID: 'rzp_test_key', RAZORPAY_KEY_SECRET: 'test_secret' };
const p = products[0];

// The shipped catalogue has no confirmed price, so nothing can be bought:
const shippedQuote = quote([{ handle: p.handle, variantId: p.variants[0].id, qty: 1 }]);
test('the shipped product (no confirmed price) cannot be ordered', () => {
  assert.ok(shippedQuote.errors.length > 0 && shippedQuote.items.length === 0);
});
// Test fixture: give the product a price in memory only, to exercise the payment path.
p.available = true;
Object.assign(p.variants[0], { size: '100 ml', price: 1500, available: true });
const v = p.variants[0];
const customer = { name: 'Asha Rao', email: 'asha@example.com', phone: '9876543210', address1: '12 MG Road', city: 'Bengaluru', state: 'Karnataka', pin: '560001' };
const post = (url, body) => new Request(`http://localhost${url}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

test('quote prices from the catalogue and rejects bad input', () => {
  const ok = quote([{ handle: p.handle, variantId: v.id, qty: 2 }]);
  assert.equal(ok.subtotal, v.price * 2);
  assert.equal(ok.errors.length, 0);
  assert.ok(quote([{ handle: p.handle, variantId: v.id, qty: 0 }]).errors.length);
  assert.ok(quote([{ handle: p.handle, variantId: v.id, qty: 99 }]).errors.length);
  assert.ok(quote([{ handle: 'nope', variantId: 'x', qty: 1 }]).errors.length);
  assert.ok(quote([]).errors.length);
});

test('create-order refuses when keys are missing', async () => {
  const res = await createOrder(post('/api/create-order', {}), {});
  assert.equal(res.status, 503);
});

test('create-order rejects non-POST and invalid customers', async () => {
  assert.equal((await createOrder(new Request('http://localhost/api/create-order'), env)).status, 405);
  const res = await createOrder(post('/api/create-order', { lines: [{ handle: p.handle, variantId: v.id, qty: 1 }], customer: { ...customer, pin: '12' } }), env);
  assert.equal(res.status, 422);
  assert.deepEqual((await res.json()).fields, ['pin']);
  assert.deepEqual(validateCustomer(customer), []);
});

test('create-order charges the server-side price, ignoring any price from the browser', async () => {
  let sent;
  const fakeFetch = async (url, init) => {
    sent = { url, init, body: JSON.parse(init.body) };
    return new Response(JSON.stringify({ id: 'order_TEST123', amount: sent.body.amount, currency: 'INR' }), { status: 200 });
  };
  const res = await createOrder(post('/api/create-order', { lines: [{ handle: p.handle, variantId: v.id, qty: 2, price: 1 }], customer, amount: 1 }), env, fakeFetch);
  assert.equal(res.status, 200);
  const data = await res.json();
  const expected = quote([{ handle: p.handle, variantId: v.id, qty: 2 }]).total * 100;
  assert.equal(sent.url, 'https://api.razorpay.com/v1/orders');
  assert.equal(sent.body.amount, expected, 'amount in paise from the catalogue');
  assert.equal(sent.body.currency, 'INR');
  assert.match(sent.init.headers.authorization, /^Basic /);
  assert.ok(sent.body.receipt.length <= 40, 'Razorpay receipts are max 40 chars');
  for (const val of Object.values(sent.body.notes)) assert.ok(String(val).length <= 256, 'notes values max 256 chars');
  assert.equal(data.orderId, 'order_TEST123');
  assert.equal(data.keyId, env.RAZORPAY_KEY_ID);
  assert.ok(!JSON.stringify(data).includes(env.RAZORPAY_KEY_SECRET), 'secret never leaves the server');
});

test('create-order reports gateway failures without leaking details', async () => {
  const res = await createOrder(post('/api/create-order', { lines: [{ handle: p.handle, variantId: v.id, qty: 1 }], customer }), env, async () => new Response('{}', { status: 401 }));
  assert.equal(res.status, 502);
});

test('payment signature verification', () => {
  const sig = signatureFor('order_1', 'pay_1', env.RAZORPAY_KEY_SECRET);
  assert.ok(isValidSignature('order_1', 'pay_1', sig, env.RAZORPAY_KEY_SECRET));
  assert.ok(!isValidSignature('order_1', 'pay_2', sig, env.RAZORPAY_KEY_SECRET), 'payment id swapped');
  assert.ok(!isValidSignature('order_1', 'pay_1', sig, 'other_secret'), 'wrong secret');
  assert.ok(!isValidSignature('order_1', 'pay_1', 'short', env.RAZORPAY_KEY_SECRET), 'malformed signature');
  assert.ok(!isValidSignature('', '', '', env.RAZORPAY_KEY_SECRET));
});

test('verify-payment accepts only valid signatures', async () => {
  const fakeFetch = async () => new Response(JSON.stringify({ receipt: 'GC-ABC', amount_paid: 129500, status: 'paid' }), { status: 200 });
  const good = { razorpay_order_id: 'order_9', razorpay_payment_id: 'pay_9', razorpay_signature: signatureFor('order_9', 'pay_9', env.RAZORPAY_KEY_SECRET) };
  const ok = await verifyPayment(post('/api/verify-payment', good), env, fakeFetch);
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), { verified: true, orderId: 'order_9', paymentId: 'pay_9', receipt: 'GC-ABC', amountPaid: 129500, status: 'paid' });
  const bad = await verifyPayment(post('/api/verify-payment', { ...good, razorpay_signature: 'f'.repeat(64) }), env, fakeFetch);
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).verified, false);
});

// ---------------------------------------------------------------- email (Brevo)
import { subscribe, contact, BREVO_API } from '../server/email.mjs';

const postJson = (body) => new Request('https://example.test/api', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const brevoEnv = { BREVO_API_KEY: 'xkeysib-test', BREVO_LIST_ID: '7', CONTACT_TO_EMAIL: 'care@gentle.test', MAIL_FROM_EMAIL: 'hello@gentle.test' };

test('subscribe: answers 503 (never success) when Brevo is not configured', async () => {
  const res = await subscribe(postJson({ email: 'a@b.co' }), {}, async () => assert.fail('must not call Brevo'));
  assert.equal(res.status, 503);
});

test('subscribe: rejects an invalid email', async () => {
  const res = await subscribe(postJson({ email: 'nope' }), brevoEnv, async () => assert.fail('must not call Brevo'));
  assert.equal(res.status, 422);
});

test('subscribe: adds the contact to the configured list', async () => {
  let call;
  const res = await subscribe(postJson({ email: 'Ana@Example.org', interests: ['Body care'] }), brevoEnv, async (url, init) => {
    call = { url, init };
    return new Response(null, { status: 201 });
  });
  assert.equal(res.status, 200);
  assert.equal(call.url, `${BREVO_API}/contacts`);
  assert.equal(call.init.headers['api-key'], 'xkeysib-test');
  const body = JSON.parse(call.init.body);
  assert.deepEqual(body, { email: 'ana@example.org', listIds: [7], updateEnabled: true });
});

test('subscribe: reports a Brevo error as a failure', async () => {
  const res = await subscribe(postJson({ email: 'a@b.co' }), brevoEnv, async () => new Response('{}', { status: 401 }));
  assert.equal(res.status, 502);
});

test('contact: 503 without configuration, 422 without a message', async () => {
  assert.equal((await contact(postJson({ email: 'a@b.co', message: 'Hi' }), {}, fetch)).status, 503);
  assert.equal((await contact(postJson({ email: 'a@b.co', message: '  ' }), brevoEnv, fetch)).status, 422);
});

test('contact: emails the business inbox with the sender as reply-to', async () => {
  let sent;
  const res = await contact(postJson({ name: 'Ana', email: 'ana@example.org', topic: 'The launch', message: 'When?' }), brevoEnv, async (url, init) => {
    sent = { url, body: JSON.parse(init.body) };
    return new Response('{"messageId":"x"}', { status: 201 });
  });
  assert.equal(res.status, 200);
  assert.equal(sent.url, `${BREVO_API}/smtp/email`);
  assert.deepEqual(sent.body.to, [{ email: 'care@gentle.test' }]);
  assert.equal(sent.body.replyTo.email, 'ana@example.org');
  assert.match(sent.body.textContent, /When\?/);
});
