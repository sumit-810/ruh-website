/**
 * Email capture and contact messages via Brevo (https://www.brevo.com).
 *
 *   subscribe(req)  → adds the email to a Brevo contact list (early access, notify me)
 *   contact(req)    → emails a contact-form message (or a cash-on-delivery order) to the business inbox
 *
 * Environment variables (Vercel → Project → Settings → Environment Variables):
 *   BREVO_API_KEY      API key (Brevo → SMTP & API → API keys)
 *   BREVO_LIST_ID      numeric id of the list sign-ups go to
 *   CONTACT_TO_EMAIL   inbox that receives contact messages
 *   MAIL_FROM_EMAIL    a sender address verified in Brevo (e.g. hello@your-domain)
 *   MAIL_FROM_NAME     optional, defaults to "Gentle Company"
 *   BREVO_ATTRIBUTES   optional "true": also store SOURCE and INTERESTS as contact attributes
 *                      (create text attributes with those names in Brevo first)
 *
 * The website shows "thank you" only when these return 2xx, so a missing key
 * can never produce a fake success.
 */
import { json, clean, readJson } from './http.mjs';

export const BREVO_API = 'https://api.brevo.com/v3';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const brevo = (env, fetchImpl, path, body) =>
  fetchImpl(`${BREVO_API}${path}`, {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(body),
  });

export const subscribe = async (req, env = process.env, fetchImpl = fetch) => {
  if (req.method !== 'POST') return json(405, { error: 'method-not-allowed' });
  if (!env.BREVO_API_KEY || !env.BREVO_LIST_ID) return json(503, { error: 'email-not-configured' });
  const body = await readJson(req);
  const email = clean(body?.email, 254).toLowerCase();
  if (!EMAIL.test(email)) return json(422, { error: 'invalid-email' });
  const interests = [].concat(body?.interests || []).map((x) => clean(x, 40)).filter(Boolean);
  const source = clean(body?.item ? `notify: ${body.item}` : body?.form || 'early-access', 80);
  const payload = { email, listIds: [Number(env.BREVO_LIST_ID)], updateEnabled: true };
  if (env.BREVO_ATTRIBUTES === 'true') payload.attributes = { SOURCE: source, INTERESTS: interests.join(', ') };
  let res;
  try {
    res = await brevo(env, fetchImpl, '/contacts', payload);
  } catch {
    return json(502, { error: 'email-service-unreachable' });
  }
  if (!res.ok) return json(502, { error: 'email-service-error', status: res.status });
  return json(200, { ok: true });
};

export const contact = async (req, env = process.env, fetchImpl = fetch) => {
  if (req.method !== 'POST') return json(405, { error: 'method-not-allowed' });
  if (!env.BREVO_API_KEY || !env.CONTACT_TO_EMAIL || !env.MAIL_FROM_EMAIL) return json(503, { error: 'email-not-configured' });
  const body = await readJson(req);
  const email = clean(body?.email, 254);
  if (!EMAIL.test(email)) return json(422, { error: 'invalid-email' });
  const isOrder = body?.form === 'cod-order';
  const message = String(body?.message ?? '').slice(0, 5000).trim();
  if (!isOrder && !message) return json(422, { error: 'empty-message' });
  const fields = Object.entries(body || {})
    .filter(([k]) => !['form', 'bot-field'].includes(k))
    .map(([k, v]) => `${k}: ${k === 'message' ? String(v).slice(0, 5000) : clean([].concat(v).join(', '), 500)}`)
    .join('\n');
  const subject = isOrder ? `Cash-on-delivery order ${clean(body.reference, 40)}` : `Website message: ${clean(body.topic || 'General', 60)}`;
  let res;
  try {
    res = await brevo(env, fetchImpl, '/smtp/email', {
      sender: { email: env.MAIL_FROM_EMAIL, name: env.MAIL_FROM_NAME || 'Gentle Company' },
      to: [{ email: env.CONTACT_TO_EMAIL }],
      replyTo: { email, ...(body?.name ? { name: clean(body.name, 80) } : {}) },
      subject,
      textContent: fields,
    });
  } catch {
    return json(502, { error: 'email-service-unreachable' });
  }
  if (!res.ok) return json(502, { error: 'email-service-error', status: res.status });
  return json(200, { ok: true });
};
