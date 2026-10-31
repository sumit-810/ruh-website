import { site } from '../../../site.config.js';
import { esc, icon, money, $, $$, announce, toast } from '../lib/util.js';
import { bag } from '../lib/cart.js';
import { productUrl } from '../lib/catalog.js';
import { thumb } from '../lib/images.js';
import { makeOverlay } from './overlay.js';

let overlay;

const meter = (subtotal) => {
  const t = site.commerce.freeShippingThreshold;
  if (!t) return '';
  const left = Math.max(0, t - subtotal);
  const pct = Math.min(100, Math.round((subtotal / t) * 100));
  return `<div class="cart-meter" role="status">
    <span>${left > 0 ? `You are ${money(left)} away from complimentary delivery.` : 'Your order qualifies for complimentary delivery.'}</span>
    <div class="cart-meter__bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
  </div>`;
};

export const qtyControl = ({ value, min = 1, max = 10, label, attrs = '', className = 'qty', focusKey = '' }) => `
<div class="${className}" ${attrs}>
  <button type="button" data-step="-1"${focusKey ? ` data-f="${focusKey}|dec"` : ''} aria-label="Decrease quantity${label ? ` of ${esc(label)}` : ''}" ${value <= min ? 'disabled' : ''}>${'<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10" stroke="currentColor" stroke-width="1.3"/></svg>'}</button>
  <input type="number" inputmode="numeric" min="${min}" max="${max}" value="${value}"${focusKey ? ` data-f="${focusKey}|qty"` : ''} aria-label="Quantity${label ? ` of ${esc(label)}` : ''}">
  <button type="button" data-step="1"${focusKey ? ` data-f="${focusKey}|inc"` : ''} aria-label="Increase quantity${label ? ` of ${esc(label)}` : ''}" ${value >= max ? 'disabled' : ''}>${'<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10M7 2v10" stroke="currentColor" stroke-width="1.3"/></svg>'}</button>
</div>`;

const body = () => {
  const lines = bag.lines();
  if (!lines.length) {
    return `<div class="cart-empty">
      <p class="display">Your bag is empty.</p>
      <p class="muted small">Begin with our first ritual.</p>
      <a class="btn" href="product.html?p=body-mist-no-01">Shop Body Mist</a>
      <a class="link" href="shop.html">See what’s coming ${icon.arrow}</a>
    </div>`;
  }
  return `${meter(bag.subtotal())}
  <ul style="list-style:none;margin:0;padding:0">
    ${lines
      .map(
        (l) => `<li class="line" data-line data-handle="${esc(l.handle)}" data-variant="${esc(l.variantId)}">
        <a class="line__media" href="${productUrl(l.product)}" tabindex="-1" aria-hidden="true"><img src="${thumb(l.product.images[0]?.key)}" alt="" width="88" height="110" loading="lazy"></a>
        <div>
          <div class="line__top">
            <a class="line__name" href="${productUrl(l.product)}">${esc(l.product.name)}</a>
            <span>${money(l.lineTotal)}</span>
          </div>
          <p class="line__meta">${esc([l.product.scentName, l.variant.size].filter(Boolean).join(' · '))}</p>
          <div class="line__bottom">
            ${qtyControl({ value: l.qty, max: bag.max(), label: l.product.name, focusKey: esc(`${l.handle}|${l.variantId}`) })}
            <button class="line__remove" type="button" data-remove>Remove<span class="visually-hidden"> ${esc(l.product.name)}</span></button>
          </div>
        </div>
      </li>`
      )
      .join('')}
  </ul>`;
};

const foot = () => {
  const lines = bag.lines();
  if (!lines.length) return '';
  const demo = site.commerce.checkout.provider === 'demo';
  return `
  <div class="cart-totals"><span>Subtotal</span><strong>${money(bag.subtotal())}</strong></div>
  <p class="cart-note">Prices are MRP, inclusive of all taxes. Delivery is calculated at checkout.</p>
  <a class="btn btn--block" href="checkout.html">${icon.lock}<span>Checkout</span></a>
  ${demo ? `<p class="demo-note">${icon.info}<span>Payments are not connected yet. Checkout is a clearly labelled demo — no order is placed and no payment is taken.</span></p>` : ''}`;
};

const render = () => {
  const el = document.getElementById('bag-drawer');
  if (!el) return;
  const hadFocus = el.contains(document.activeElement);
  const focusKey = document.activeElement?.dataset?.f;
  const n = bag.count();
  $('[data-bag-title]', el).innerHTML = `Your bag <span class="muted" style="font-size:1rem">(${n})</span>`;
  $('[data-bag-body]', el).innerHTML = body();
  const f = $('[data-bag-foot]', el);
  f.innerHTML = foot();
  f.hidden = !n;
  // re-rendering replaces the focused control: put focus back on its twin
  if (hadFocus && !el.contains(document.activeElement)) {
    const twin = focusKey && el.querySelector(`[data-f="${CSS.escape(focusKey)}"]`);
    (twin && !twin.disabled ? twin : $('[data-close]', el)).focus({ preventScroll: true });
  }
};

export const renderBag = () => {
  const el = document.createElement('div');
  el.innerHTML = `<aside class="drawer drawer--right" id="bag-drawer" role="dialog" aria-modal="true" aria-labelledby="bag-title" tabindex="-1" hidden>
    <div class="drawer__head">
      <h2 class="drawer__title" id="bag-title" data-bag-title>Your bag</h2>
      <button class="icon-btn" type="button" data-close aria-label="Close bag">${icon.close}</button>
    </div>
    <div class="drawer__body" data-bag-body></div>
    <div class="drawer__foot" data-bag-foot></div>
  </aside>`;
  const drawer = el.firstElementChild;
  document.body.append(drawer);
  render();

  overlay = makeOverlay(drawer, {
    onOpen: () => $$('[data-open-bag]').forEach((b) => b.setAttribute('aria-expanded', 'true')),
    onClose: () => $$('[data-open-bag]').forEach((b) => b.setAttribute('aria-expanded', 'false')),
    initialFocus: () => $('[data-close]', drawer),
  });
  $('[data-close]', drawer).addEventListener('click', () => overlay.close());
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-bag]');
    if (!t) return;
    e.preventDefault();
    overlay.open(t);
  });

  drawer.addEventListener('click', (e) => {
    const line = e.target.closest('[data-line]');
    if (!line) return;
    const { handle, variant } = line.dataset;
    const cur = bag.lines().find((l) => l.handle === handle && l.variantId === variant);
    if (e.target.closest('[data-remove]')) {
      bag.remove(handle, variant);
      announce(`${cur?.product.name || 'Item'} removed from your bag.`);
      return;
    }
    const step = e.target.closest('[data-step]');
    if (step && cur) {
      const q = cur.qty + Number(step.dataset.step);
      bag.setQty(handle, variant, Math.max(1, q));
      announce(`Quantity updated to ${Math.max(1, Math.min(q, bag.max()))}.`);
    }
  });
  drawer.addEventListener('change', (e) => {
    const line = e.target.closest('[data-line]');
    if (!line || e.target.type !== 'number') return;
    const v = parseInt(e.target.value, 10);
    bag.setQty(line.dataset.handle, line.dataset.variant, Number.isFinite(v) && v > 0 ? v : 1);
  });

  window.addEventListener('bag:change', render);
};

export const openBag = (trigger) => overlay?.open(trigger);

/** Add to bag + feedback; used by product cards, the featured module and the PDP. */
export const addToBag = (product, variant, qty, trigger) => {
  const ok = bag.add(product.handle, variant.id, qty);
  if (!ok) {
    toast('Sorry, this item is unavailable.');
    return;
  }
  announce(`${product.name} added to your bag.`);
  openBag(trigger);
};
