import { site } from '../../../site.config.js';

/** Escape text for safe insertion into HTML. */
export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Escape, then turn *phrase* into <em>phrase</em> (used for editorial italics). */
export const rich = (v) => esc(v).replace(/\*(.+?)\*/g, '<em>$1</em>');

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const moneyFmt = new Intl.NumberFormat(site.locale.lang, {
  style: 'currency',
  currency: site.locale.currency,
  maximumFractionDigits: 0,
});
export const money = (n) => moneyFmt.format(Number(n) || 0);

/**
 * Current route. In the normal multi-page build it mirrors the real URL; in
 * the single-file build (window.__SINGLE_FILE__) app.js fills it from the
 * hash, e.g. #/product.html?p=body-mist-no-01.
 */
export const SINGLE_FILE = typeof window !== 'undefined' && !!window.__SINGLE_FILE__;
export const route = {
  file: location.pathname.split('/').pop() || 'index.html',
  params: new URLSearchParams(location.search),
  anchor: location.hash.slice(1),
};

export const param = (name) => route.params.get(name);

/** Update the query string without reloading (e.g. shop filters). */
export const setRouteParams = (q) => {
  route.params = q;
  const qs = q.toString() ? `?${q}` : '';
  if (SINGLE_FILE) history.replaceState(null, '', `#/${route.file}${qs}`);
  else history.replaceState(null, '', qs || location.pathname);
};

/** Go to a site URL such as 'collection.html?c=body-care#sunscreen'. */
export const navigate = (href, { replace = false } = {}) => {
  if (SINGLE_FILE) {
    const target = `#/${href}`;
    if (replace) history.replaceState(null, '', target);
    if (replace || location.hash === target) window.dispatchEvent(new HashChangeEvent('hashchange'));
    else location.hash = target;
  } else if (replace) location.replace(href);
  else location.href = href;
};

export const debounce = (fn, ms = 200) => {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
};

let _id = 0;
export const uid = (p = 'id') => `${p}-${++_id}`;

/** "Placeholder" marker, rendered only in preview mode. */
export const prov = (on, label = 'Placeholder', block = false, style = '') =>
  site.previewMode && on ? `<span class="prov${block ? ' prov--block' : ''}"${style ? ` style="${style}"` : ''} title="Provisional content — replace before launch (see PRODUCT_CONFIGURATION.md)">${esc(label)}</span>` : '';

export const setTitle = (t) => {
  document.title = t ? `${t} — ${site.brand.name}` : `${site.brand.name} — ${site.brand.tagline}`;
};

export const setMeta = (description) => {
  if (!description) return;
  let m = document.querySelector('meta[name="description"]');
  if (!m) {
    m = document.createElement('meta');
    m.name = 'description';
    document.head.append(m);
  }
  m.content = description;
};

/** Announce a message to screen readers via the shared live region. */
export const announce = (msg) => {
  const r = document.getElementById('sr-live');
  if (!r) return;
  r.textContent = '';
  requestAnimationFrame(() => (r.textContent = msg));
};

let toastTimer;
export const toast = (msg) => {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    t.setAttribute('aria-hidden', 'true');
    document.body.append(t);
  }
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
};

/** Focus trap for dialogs/drawers. Returns a release function. */
export const trapFocus = (container) => {
  const sel = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
  const onKey = (e) => {
    if (e.key !== 'Tab') return;
    const items = $$(sel, container).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', onKey);
  return () => container.removeEventListener('keydown', onKey);
};

// --- Icons (inline SVG, 24px grid, stroke) -----------------------------------
const svg = (body, extra = '') => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"${extra}>${body}</svg>`;
export const icon = {
  search: svg('<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  bag: svg('<path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>'),
  menu: svg('<path d="M3 7h18M3 12h18M3 17h12"/>'),
  close: svg('<path d="M5 5l14 14M19 5 5 19"/>'),
  arrow: svg('<path d="M4 12h15M14 6l6 6-6 6"/>'),
  arrowLeft: svg('<path d="M20 12H5M10 6l-6 6 6 6"/>'),
  chev: '<svg class="chev" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M2 4.5 6 8l4-3.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  minus: svg('<path d="M5 12h14"/>'),
  gift: svg('<rect x="3.5" y="8.5" width="17" height="12"/><path d="M3.5 12.5h17M12 8.5v12M12 8.5c-1.5-3-5-4-5.5-2S9 8.5 12 8.5zm0 0c1.5-3 5-4 5.5-2S15 8.5 12 8.5z"/>'),
  truck: svg('<path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3.5v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
  leaf: svg('<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19c3-4 6-7 10-9"/>'),
  check: svg('<path d="M4 12.5 9.5 18 20 6.5"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
  lock: svg('<rect x="5" y="10.5" width="14" height="10"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
  pause: '<svg viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4 2.5v9M10 2.5v9" stroke="currentColor" stroke-width="1.4"/></svg>',
  play: '<svg viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4 2.5 11 7l-7 4.5z" fill="currentColor"/></svg>',
  star: '<svg class="star" viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path fill="currentColor" d="M5 0l1.2 2.1L8.5 1.5 7.9 3.8 10 5 7.9 6.2l.6 2.3-2.3-.6L5 10 3.8 7.9l-2.3.6.6-2.3L0 5l2.1-1.2-.6-2.3 2.3.6z"/></svg>',
  instagram: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7v.01"/>'),
  pinterest: svg('<circle cx="12" cy="12" r="9"/><path d="M11 8.5c3-1 5 .5 5 3 0 2.5-1.6 4-3.3 4-1 0-1.6-.6-1.6-.6L9.5 21"/>'),
  youtube: svg('<rect x="2.5" y="5.5" width="19" height="13" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/>'),
  linkedin: svg('<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M8 10.5v6M8 7.5v.01M11.5 16.5v-6M11.5 13c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v3.5"/>'),
  whatsapp: svg('<path d="M4 20l1.2-3.6A8 8 0 1 1 8 19z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1-1 2 1c-.5 1.5-1.5 2-3 1.5-2.5-.8-4.5-2.8-5.3-5.3-.5-1.5 0-2.5 1.5-3l1 2z"/>'),
  mail: svg('<rect x="3" y="5.5" width="18" height="13"/><path d="m3.5 6 8.5 7 8.5-7"/>'),
};
