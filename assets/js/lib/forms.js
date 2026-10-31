import { site } from '../../../site.config.js';
import { $, $$, esc } from './util.js';

/**
 * Form handling for newsletter, waitlist and contact forms.
 *
 * Honest by design: a success message appears ONLY when a configured
 * endpoint answers with HTTP 2xx. With provider 'none' the visitor is told
 * plainly that nothing was sent.
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

/** True when running somewhere Netlify Forms can't receive posts (local server, file://). */
const isLocalPreview = () =>
  location.protocol === 'file:' || ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'].includes(location.hostname);

/** Send to the configured provider. Resolves { ok, reason }. */
export const send = async (formName, data) => {
  const { provider, endpoint } = site.forms;
  const fields = Object.fromEntries(Object.entries(data).filter(([k]) => k !== 'bot-field'));
  try {
    if (provider === 'formspree' || provider === 'custom') {
      if (!endpoint) return { ok: false, reason: 'not-configured' };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ form: formName, ...fields }),
      });
      return { ok: res.ok, reason: res.ok ? '' : `http-${res.status}` };
    }
    if (provider === 'netlify') {
      if (isLocalPreview()) return { ok: false, reason: 'local-preview' };
      // form definitions: netlify-forms.html (Netlify detects forms in static HTML at deploy time)
      const body = new URLSearchParams({ 'form-name': formName, ...Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, [].concat(v).join(', ')])) });
      const res = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
      return { ok: res.ok, reason: res.ok ? '' : `http-${res.status}` };
    }
    return { ok: false, reason: 'not-configured' };
  } catch {
    return { ok: false, reason: 'network' };
  }
};

const MESSAGES = {
  'local-preview': () => 'Preview: forms are delivered through Netlify on the live site, so nothing was sent from this local copy.',
  'not-configured': () =>
    site.previewMode
      ? 'Preview: this form isn’t connected to an email service yet, so nothing was sent or stored. (Configure site.forms in site.config.js.)'
      : 'Sign-ups open soon — this form isn’t accepting submissions yet. Please check back shortly.',
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
        status.dataset.tone = result.reason === 'not-configured' || result.reason === 'local-preview' ? 'info' : 'error';
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
