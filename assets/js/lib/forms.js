import { site } from '../../../site.config.js';
import { $, $$, esc } from './util.js';

/**
 * Form handling for early access, notify-me and contact forms.
 *
 * Honest by design: a success message appears ONLY when the server confirms
 * the email was stored or sent (HTTP 2xx). Otherwise the visitor is told,
 * plainly, that it did not go through.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const validators = {
  required: (v) => (String(v).trim() ? '' : 'This field is required.'),
  email: (v) => (EMAIL.test(String(v).trim()) ? '' : 'Please enter a valid email address.'),
  phoneIN: (v) => (/^(\+?91[\s-]?)?[6-9]\d{9}$/.test(String(v).replace(/\s/g, '')) ? '' : 'Please enter a valid 10-digit mobile number.'),
  pin: (v) => (/^[1-9]\d{5}$/.test(String(v).trim()) ? '' : 'Please enter a valid 6-digit PIN code.'),
};

/** Validate fields that carry data-validate="required email" etc. Returns true if valid. */
export const validate = (form) => {
  let firstBad = null;
  $$('[data-validate]', form).forEach((el) => {
    const rules = el.dataset.validate.split(/\s+/);
    const value = el.type === 'checkbox' ? (el.checked ? 'yes' : '') : el.value;
    let msg = '';
    for (const r of rules) {
      if (r !== 'required' && !String(value).trim()) continue;
      msg = validators[r]?.(value) || '';
      if (msg) break;
    }
    const err = form.querySelector(`#${el.getAttribute('aria-describedby')?.split(' ').find((id) => id.endsWith('-err'))}`);
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      if (err) err.textContent = msg;
      firstBad ??= el;
    } else {
      el.removeAttribute('aria-invalid');
      if (err) err.textContent = '';
    }
  });
  if (firstBad) firstBad.focus();
  return !firstBad;
};

/** Live-clear errors once the visitor fixes a field. */
export const liveValidate = (form) => {
  form.addEventListener('input', (e) => {
    const el = e.target;
    if (el.getAttribute('aria-invalid') === 'true') {
      el.removeAttribute('aria-invalid');
      const id = el.getAttribute('aria-describedby')?.split(' ').find((x) => x.endsWith('-err'));
      if (id) form.querySelector(`#${id}`).textContent = '';
    }
  });
};

const toObject = (form) => {
  const data = {};
  new FormData(form).forEach((v, k) => {
    if (k in data) data[k] = [].concat(data[k], v);
    else data[k] = v;
  });
  return data;
};

const API = { 'early-access': '/api/subscribe', 'notify-me': '/api/subscribe', contact: '/api/contact', 'cod-order': '/api/contact' };

/** Send to the configured provider. Resolves { ok, reason }. */
export const send = async (formName, data) => {
  const { provider, endpoint } = site.forms;
  const fields = Object.fromEntries(Object.entries(data).filter(([k]) => k !== 'bot-field'));
  try {
    let url = null;
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

const MESSAGES = {
  unavailable: () => `We couldn’t save your details just now, so nothing was sent. Please try again a little later${site.contact.email ? ` or write to ${site.contact.email}` : ''}.`,
  invalid: () => 'Please check your details and try again.',
  network: () => 'We couldn’t reach the server. Please check your connection and try again.',
  default: () => 'Something went wrong and your details were not sent. Please try again.',
};

/**
 * Wire a form: validation + submission + honest status messaging.
 * options.success: message on a confirmed 2xx.
 */
export const wireForm = (form, { name, success = 'Thank you — you’re on the list.', onSuccess } = {}) => {
  if (!form) return;
  form.noValidate = true;
  liveValidate(form);
  const status = $('[data-status]', form);
  const btn = $('button[type="submit"]', form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    if (form.querySelector('[name="bot-field"]')?.value) return; // spam trap filled — silently ignore
    if (btn) {
      btn.disabled = true;
      btn.dataset.label ??= btn.innerHTML;
      btn.textContent = 'Sending…';
    }
    const result = await send(name, toObject(form));
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.label;
    }
    if (status) {
      status.hidden = false;
      if (result.ok) {
        status.dataset.tone = 'success';
        status.textContent = success;
        form.reset();
        onSuccess?.();
      } else {
        status.dataset.tone = 'error';
        status.textContent = (MESSAGES[result.reason] || MESSAGES.default)();
      }
    }
  });
};

/** Email field markup with label, error slot and accessible wiring. */
export const emailField = (id, { label = 'Email address', placeholder = 'Your email address', hideLabel = false } = {}) => `
<div class="field">
  <label for="${id}"${hideLabel ? ' class="visually-hidden"' : ''}>${esc(label)}</label>
  <input class="input" id="${id}" name="email" type="email" autocomplete="email" inputmode="email" placeholder="${esc(placeholder)}" data-validate="required email" aria-describedby="${id}-err">
  <span class="field-error" id="${id}-err" aria-live="polite"></span>
</div>`;
