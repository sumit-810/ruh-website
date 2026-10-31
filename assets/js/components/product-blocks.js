import { site } from '../../../site.config.js';
import { esc, icon, money, prov, $, $$, uid } from '../lib/util.js';
import { defaultVariant, getVariant } from '../lib/catalog.js';
import { bag } from '../lib/cart.js';
import { qtyControl, addToBag } from './bag-drawer.js';

/** Price row with Indian MRP note and net quantity. */
export const priceRow = (p, v) => `
<div class="price-row" data-price-row>
  <span class="price">${money(v.price)}${v.compareAtPrice ? `<s>${money(v.compareAtPrice)}</s>` : ''}</span>
  <span class="price-note">MRP inclusive of all taxes · ${esc(v.netQuantity || v.size)}</span>
  ${prov(p.provisional?.price, 'Placeholder price')}
</div>`;

/**
 * Buy box: variant selector (only when >1 size), quantity, add to bag (price
 * in button), optional Buy now (only when a real checkout is configured).
 */
export const buyBox = (p, { idPrefix = uid('buy'), showServiceNotes = true } = {}) => {
  const v = defaultVariant(p);
  const multi = p.variants.length > 1;
  return `
<form class="buybox__form" data-buy="${esc(p.handle)}" novalidate>
  ${
    multi
      ? `<fieldset class="variant-group"><legend>Size</legend><div class="chips">${p.variants
          .map(
            (x) => `<label class="chip"><input type="radio" name="variant" value="${esc(x.id)}" ${x.id === v.id ? 'checked' : ''} ${x.available ? '' : 'disabled'}><span>${esc(x.size)}${x.available ? '' : ' — sold out'}</span></label>`
          )
          .join('')}</div></fieldset>`
      : `<input type="hidden" name="variant" value="${esc(v.id)}"><p class="size-static">Size: ${esc(v.size)}</p>`
  }
  <div class="buy-row" style="margin-top:16px">
    ${qtyControl({ value: 1, max: bag.max(), label: p.name, attrs: 'data-qty', className: 'qty qty--lg' })}
    <button class="btn" type="submit" data-add id="${idPrefix}-add" ${p.available && v.available ? '' : 'disabled'}>
      <span>${p.available && v.available ? 'Add to bag' : 'Unavailable'}</span><span class="price-sep">—</span><span data-btn-price>${money(v.price)}</span>
    </button>
  </div>
  ${
    site.commerce.buyNowEnabled && site.commerce.checkout.provider !== 'demo'
      ? `<button class="btn btn--ghost btn--block" type="button" data-buy-now style="margin-top:12px">Buy now</button>`
      : ''
  }
  ${
    showServiceNotes && site.commerce.serviceNotes?.length
      ? `<ul class="service-notes" style="margin-top:20px">${site.commerce.serviceNotes
          .map((n) => `<li>${icon.check}<span>${esc(n)}</span></li>`)
          .join('')}</ul>${prov(true, 'Placeholder promises', true)}`
      : ''
  }
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
      const row = root.querySelector('[data-price-row]');
      if (row) row.outerHTML = priceRow(p, v);
      window.dispatchEvent(new CustomEvent('variant:change', { detail: { handle: p.handle, variant: v } }));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      addToBag(p, currentVariant(), getQty(), $('[data-add]', form));
      input.value = 1;
      syncQty();
    });
  });
};

/** Scent pyramid (top / heart / base). */
export const pyramid = (p) => {
  const tiers = [
    { key: 'top', n: 'I', label: 'Top', name: 'The first impression', desc: 'Bright and brief — what you notice first.' },
    { key: 'heart', n: 'II', label: 'Heart', name: 'The character', desc: 'Emerges as the top notes lift.' },
    { key: 'base', n: 'III', label: 'Base', name: 'The trail', desc: 'Stays closest to skin, the longest.' },
  ];
  // triangle split into three bands: top band smallest
  const bands = ['M32 2 L42 16 L22 16 Z', 'M22 16 L42 16 L52 31 L12 31 Z', 'M12 31 L52 31 L62 46 L2 46 Z'];
  return `<div class="pyramid" role="list">
    ${tiers
      .map(
        (t, i) => `<div class="tier" role="listitem">
        <svg class="tier__glyph" viewBox="0 0 64 48" aria-hidden="true">${bands.map((d, k) => `<path d="${d}" class="${k === i ? 'on' : ''}"/>`).join('')}</svg>
        <div>
          <p class="tier__label"><b>${t.n}</b> ${t.label} notes · ${t.name}</p>
          <p class="tier__notes">${esc((p.notes?.[t.key] || []).join(', ') || 'To be revealed')}</p>
          <p class="tier__desc">${t.desc}</p>
        </div>
      </div>`
      )
      .join('')}
  </div>`;
};

export const factRows = (p) => `
<dl class="facts">
  ${p.family ? `<div><dt>Fragrance family</dt><dd>${esc(p.family)}</dd></div>` : ''}
  ${p.mood ? `<div><dt>Mood</dt><dd>${esc(p.mood)}</dd></div>` : ''}
  ${p.wearIt?.length ? `<div><dt>Wear it</dt><dd>${esc(p.wearIt.join(' · '))}</dd></div>` : ''}
</dl>`;

export const benefitsList = (p) => `
<ul class="benefits">
  ${(p.benefits || []).map((b) => `<li>${'<svg class="star" viewBox="0 0 10 10" aria-hidden="true"><path fill="currentColor" d="M5 0l1.2 2.1L8.5 1.5 7.9 3.8 10 5 7.9 6.2l.6 2.3-2.3-.6L5 10 3.8 7.9l-2.3.6.6-2.3L0 5l2.1-1.2-.6-2.3 2.3.6z"/></svg>'}<span><strong>${esc(b.title)}</strong>${esc(b.text)}</span></li>`).join('')}
</ul>`;
