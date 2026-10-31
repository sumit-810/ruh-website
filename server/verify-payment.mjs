/**
 * POST /api/verify-payment
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature } (as returned by Razorpay Checkout)
 *
 * A payment only counts once its signature is verified here:
 * HMAC-SHA256(order_id + "|" + payment_id, key_secret) must equal the signature.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import { json, readJson, RAZORPAY_API, basicAuth } from './http.mjs';

export const signatureFor = (orderId, paymentId, secret) =>
  createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');

export const isValidSignature = (orderId, paymentId, signature, secret) => {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = Buffer.from(signatureFor(orderId, paymentId, secret), 'utf8');
  const given = Buffer.from(String(signature), 'utf8');
  return expected.length === given.length && timingSafeEqual(expected, given);
};

export const verifyPayment = async (req, env = process.env, fetchImpl = fetch) => {
  if (req.method !== 'POST') return json(405, { error: 'method-not-allowed' });
  const keyId = env.RAZORPAY_KEY_ID;
  const secret = env.RAZORPAY_KEY_SECRET;
  if (!keyId || !secret) return json(503, { error: 'payments-not-configured' });

  const body = await readJson(req);
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = body || {};
  if (!isValidSignature(orderId, paymentId, signature, secret)) return json(400, { verified: false, error: 'invalid-signature' });

  // Best effort: read the order back for the confirmation page (receipt, amount paid).
  let order = null;
  try {
    const res = await fetchImpl(`${RAZORPAY_API}/orders/${encodeURIComponent(orderId)}`, { headers: { authorization: basicAuth(keyId, secret) } });
    if (res.ok) order = await res.json();
  } catch {
    /* the signature is what proves payment; order details are optional */
  }
  return json(200, {
    verified: true,
    orderId,
    paymentId,
    receipt: order?.receipt ?? null,
    amountPaid: order?.amount_paid ?? null,
    status: order?.status ?? null,
  });
};

