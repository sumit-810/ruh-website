import { site } from '../../../site.config.js';
import { esc, money, icon, $, $$, navigate } from '../lib/util.js';
import { defaultVariant, getVariant, isPurchasable } from '../lib/catalog.js';
import { bag } from '../lib/cart.js';
import { qtyControl, addToBag } from './bag-drawer.js';
import { waitlistForm } from './waitlist.js';

/** Price + size, only for products that are on sale with a confirmed price. */
export const priceRow = (p, v = defaultVariant(p)) =>
  `<div class="price-row" data-price-row><span class="price">${money(v.price)}</span>${v.size ? `<span class="muted">${esc(v.size)}</span>` : ''}<span class="price-note">MRP inclusive of all taxes</span></div>`;

/**
 * The purchase panel. When the product can be bought: sizes, quantity, Add to
 * bag and Buy now. Otherwise: its status and a notify-me form — never a
 * price or a button that can't complete.
 */
export const buyBox = (p, { id = 'main-buy' } = {}) => {
  if (!isPurchasable(p)) {
    return `<div class="buy__panel" id="notify">
      <h2>${esc(p.statusLabel || 'Coming soon')}</h2>
      <p>Be the first to know when ${esc(p.name)} is available.</p>
      ${waitlistForm({ item: p.name, cta: 'Notify me', id: `${id}-wl` })}
    </div>`;
  }
  const variants = p.variants.filter((v) => v.price > 0);
  const v = defaultVariant(p);
  const notes = site.commerce.serviceNotes || [];
  return `<form class="buy__actions" id="${id}" data-buy>
    ${priceRow(p, v)}
    ${
      variants.length > 1
        ? `<fieldset class="chips size-chips"><legend class="visually-hidden">Size</legend>${variants
            .map((x) => `<label class="chip"><input type="radio" name="variant" value="${esc(x.id)}" ${x.id === v.id ? 'checked' : ''} ${x.available ? '' : 'disabled'}><span>${esc(x.size)}</span></label>`)
            .join('')}</fieldset>`
        : `<input type="hidden" name="variant" value="${esc(v.id)}">`
    }
    <div class="buy__row">
      ${qtyControl({ value: 1, max: bag.max(), label: p.name, attrs: 'data-qty', className: 'qty qty--lg' })}
      <button class="btn" type="submit" data-add><span>Add to bag</span><span class="price-sep">—</span><span data-btn-price>${money(v.price)}</span></button>
    </div>
    ${site.commerce.buyNowEnabled ? `<button class="btn btn--ghost btn--block" type="button" data-buy-now>Buy now</button>` : ''}
    ${notes.length ? `<ul class="service-notes">${notes.map((n) => `<li>${icon.check}<span>${esc(n.text)}</span></li>`).join('')}</ul>` : ''}
  </form>`;
};

/** Wire every buy form inside root. */
export const wireBuy = (root, p) => {
  $$('form[data-buy]', root).forEach((form) => {
    const qtyEl = $('[data-qty]', form);
    const input = $('input[type="number"]', qtyEl);
    const getQty = () => Math.min(Math.max(1, parseInt(input.value, 10) || 1), bag.max());
    const syncQty = () => {
      const q = getQty();
      input.value = q;
      $('[data-step="-1"]', qtyEl).disabled = q <= 1;
      $('[data-step="1"]', qtyEl).disabled = q >= bag.max();
    };
    qtyEl.addEventListener('click', (e) => {
      const s = e.target.closest('[data-step]');
      if (!s) return;
      input.value = getQty() + Number(s.dataset.step);
      syncQty();
    });
    input.addEventListener('change', syncQty);
    const currentVariant = () => getVariant(p, new FormData(form).get('variant')) || defaultVariant(p);
    form.addEventListener('change', (e) => {
      if (e.target.name !== 'variant') return;
      const v = currentVariant();
      $('[data-btn-price]', form).textContent = money(v.price);
      const row = form.querySelector('[data-price-row]');
      if (row) row.outerHTML = priceRow(p, v);
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      addToBag(p, currentVariant(), getQty(), $('[data-add]', form));
      input.value = 1;
      syncQty();
    });
    $('[data-buy-now]', form)?.addEventListener('click', () => {
      bag.add(p.handle, currentVariant().id, getQty());
      navigate('checkout.html');
    });
  });
};
