/** Helpers shared by the payment functions. */
export const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** Single-line, length-limited text (Razorpay notes allow 256 chars per value). */
export const clean = (value, max = 120) => String(value ?? '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

export const RAZORPAY_API = 'https://api.razorpay.com/v1';

export const basicAuth = (keyId, secret) => `Basic ${Buffer.from(`${keyId}:${secret}`).toString('base64')}`;

export const readJson = async (req) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
};
