/**
 * POST /api/create-order
 * Body: { lines: [{ handle, variantId, qty }], customer: { name, email, phone, address1, address2, city, state, pin } }
 *
 * Prices the bag from the catalogue (never trusting amounts from the browser),
 * creates a Razorpay order and returns what Razorpay Checkout needs.
 * Env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (Netlify → Site configuration → Environment variables).
 */
import { quote } from '../../assets/js/lib/pricing.js';
import { site } from '../../site.config.js';
import { json, clean, readJson, RAZORPAY_API, basicAuth } from './_shared.mjs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^(\+?91[\s-]?)?[6-9]\d{9}$/;
const PIN = /^[1-9]\d{5}$/;

export const validateCustomer = (c = {}) => {
  const errors = [];
  if (!clean(c.name)) errors.push('name');
  if (!EMAIL.test(clean(c.email))) errors.push('email');
  if (!PHONE.test(String(c.phone ?? '').replace(/\s/g, ''))) errors.push('phone');
  if (!clean(c.address1)) errors.push('address1');
  if (!clean(c.city)) errors.push('city');
  if (!clean(c.state)) errors.push('state');
  if (!PIN.test(clean(c.pin))) errors.push('pin');
  return errors;
};

export const makeReceipt = (now = Date.now()) =>
  `RUH-${now.toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

export const createOrder = async (req, env = process.env, fetchImpl = fetch) => {
  if (req.method !== 'POST') return json(405, { error: 'method-not-allowed' });
  const keyId = env.RAZORPAY_KEY_ID;
  const secret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) return json(503, { error: 'payments-not-configured' });

  const body = await readJson(req);
  if (!body) return json(400, { error: 'invalid-json' });

  const priced = quote(body.lines, { paymentMethod: 'online' });
  if (priced.errors.length) return json(422, { error: 'invalid-bag', details: priced.errors });
  const customerErrors = validateCustomer(body.customer);
  if (customerErrors.length) return json(422, { error: 'invalid-customer', fields: customerErrors });

  const c = body.customer;
  const receipt = makeReceipt();
  const notes = {
    brand: clean(site.brand.name, 40),
    customer_name: clean(c.name),
    email: clean(c.email),
    phone: clean(c.phone, 20),
    address: clean([c.address1, c.address2, c.city, c.state, c.pin].filter(Boolean).join(', '), 256),
    items: clean(priced.items.map((i) => `${i.sku} x${i.qty}`).join(', '), 256),
    subtotal: String(priced.subtotal),
    delivery: String(priced.delivery),
  };

  let res;
  try {
    res = await fetchImpl(`${RAZORPAY_API}/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: basicAuth(keyId, secret) },
      body: JSON.stringify({ amount: priced.total * 100, currency: priced.currency, receipt, notes }),
    });
  } catch {
    return json(502, { error: 'gateway-unreachable' });
  }
  if (!res.ok) return json(502, { error: 'gateway-error', status: res.status });
  const order = await res.json();

  return json(200, {
    orderId: order.id,
    amount: order.amount, // paise
    currency: order.currency,
    keyId, // the public key id — safe to share with the browser
    receipt,
    quote: { items: priced.items, subtotal: priced.subtotal, delivery: priced.delivery, total: priced.total },
    merchant: { name: `${site.brand.name} by ${site.company.name}`, description: priced.items.map((i) => i.name).join(', ') },
  });
};

export default (req) => createOrder(req);

export const config = { path: '/api/create-order' };
