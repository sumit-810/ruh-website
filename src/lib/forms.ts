import { site } from '../../site.config.js';

/**
 * Form handling for early access, notify-me, contact and COD forms.
 *
 * Honest by design: a success message appears ONLY when the server confirms
 * the email was stored or sent (HTTP 2xx). Otherwise the visitor is told,
 * plainly, that it did not go through.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validators: Record<string, (v: string) => string> = {
  required: (v) => (String(v).trim() ? '' : 'This field is required.'),
  email: (v) => (EMAIL.test(String(v).trim()) ? '' : 'Please enter a valid email address.'),
  phoneIN: (v) => (/^(\+?91[\s-]?)?[6-9]\d{9}$/.test(String(v).replace(/\s/g, '')) ? '' : 'Please enter a valid 10-digit mobile number.'),
  pin: (v) => (/^[1-9]\d{5}$/.test(String(v).trim()) ? '' : 'Please enter a valid 6-digit PIN code.'),
};

/** Validate a form's [data-validate] fields; returns { name: message } for the ones that fail. */
export const validateForm = (form: HTMLFormElement) => {
  const errors: Record<string, string> = {};
  form.querySelectorAll<HTMLInputElement>('[data-validate]').forEach((el) => {
    const rules = (el.dataset.validate || '').split(/\s+/).filter(Boolean);
    const value = el.value;
    for (const r of rules) {
      if (r !== 'required' && !String(value).trim()) continue;
      const msg = validators[r]?.(value) || '';
      if (msg) {
        errors[el.name] = msg;
        break;
      }
    }
  });
  const first = Object.keys(errors)[0];
  if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  return errors;
};

export const formToObject = (form: HTMLFormElement) => {
  const data: Record<string, string | string[]> = {};
  new FormData(form).forEach((v, k) => {
    const value = String(v);
    if (k in data) data[k] = ([] as string[]).concat(data[k], value);
    else data[k] = value;
  });
  return data;
};

const API: Record<string, string> = {
  'early-access': '/api/subscribe',
  'notify-me': '/api/subscribe',
  contact: '/api/contact',
  'cod-order': '/api/contact',
};

export type SendResult = { ok: boolean; reason: '' | 'unavailable' | 'invalid' | 'network' };

/** Send to the configured provider. */
export const send = async (formName: string, data: Record<string, unknown>): Promise<SendResult> => {
  const { provider, endpoint } = site.forms as { provider: string; endpoint: string | null };
  const fields = Object.fromEntries(Object.entries(data).filter(([k]) => k !== 'bot-field'));
  try {
    let url: string | null = null;
    if (provider === 'api') url = API[formName] || '/api/subscribe';
    else if (provider === 'formspree' || provider === 'custom') url = endpoint;
    if (!url) return { ok: false, reason: 'unavailable' };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ form: formName, ...fields }),
    });
    if (res.ok) return { ok: true, reason: '' };
    return { ok: false, reason: res.status === 400 || res.status === 422 ? 'invalid' : 'unavailable' };
  } catch {
    return { ok: false, reason: 'network' };
  }
};

export const failureMessage = (reason: SendResult['reason']) => {
  switch (reason) {
    case 'unavailable':
      return `We couldn’t save your details just now, so nothing was sent. Please try again a little later${site.contact.email ? ` or write to ${site.contact.email}` : ''}.`;
    case 'invalid':
      return 'Please check your details and try again.';
    case 'network':
      return 'We couldn’t reach the server. Please check your connection and try again.';
    default:
      return 'Something went wrong and your details were not sent. Please try again.';
  }
};
