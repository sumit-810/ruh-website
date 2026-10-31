import { site } from '../../../site.config.js';
import { storage } from './storage.js';
import { getProduct, getVariant } from './catalog.js';

/**
 * Bag store. Persists { handle, variantId, qty } lines in localStorage and
 * always re-reads prices from the catalogue, so editing a price in
 * site.config.js updates existing bags too. Lines whose product/variant no
 * longer exists, or is no longer available, are dropped.
 */
const KEY = 'gc.bag.v1';
const max = () => site.commerce.maxQuantityPerItem || 10;

const read = () => {
  const raw = storage.get(KEY, []);
  return Array.isArray(raw) ? raw : [];
};

const write = (lines) => {
  storage.set(KEY, lines);
  window.dispatchEvent(new CustomEvent('bag:change', { detail: { lines } }));
};

export const bag = {
  lines() {
    return read()
      .map((l) => {
        const product = getProduct(l.handle);
        const variant = product && getVariant(product, l.variantId);
        if (!product || !variant || !product.available || !variant.available) return null;
        const qty = Math.min(Math.max(1, parseInt(l.qty, 10) || 1), max());
        return { ...l, qty, product, variant, lineTotal: qty * variant.price };
      })
      .filter(Boolean);
  },
  count() {
    return this.lines().reduce((n, l) => n + l.qty, 0);
  },
  subtotal() {
    return this.lines().reduce((n, l) => n + l.lineTotal, 0);
  },
  add(handle, variantId, qty = 1) {
    const product = getProduct(handle);
    const variant = product && getVariant(product, variantId);
    if (!product?.available || !variant?.available) return false;
    const lines = read();
    const found = lines.find((l) => l.handle === handle && l.variantId === variantId);
    if (found) found.qty = Math.min((parseInt(found.qty, 10) || 0) + qty, max());
    else lines.push({ handle, variantId, qty: Math.min(qty, max()) });
    write(lines);
    return true;
  },
  setQty(handle, variantId, qty) {
    let lines = read();
    if (qty <= 0) lines = lines.filter((l) => !(l.handle === handle && l.variantId === variantId));
    else lines.forEach((l) => l.handle === handle && l.variantId === variantId && (l.qty = Math.min(qty, max())));
    write(lines);
  },
  remove(handle, variantId) {
    this.setQty(handle, variantId, 0);
  },
  clear() {
    write([]);
  },
  max,
};

// keep tabs in sync
window.addEventListener('storage', (e) => {
  if (e.key === KEY) window.dispatchEvent(new CustomEvent('bag:change', { detail: { lines: read() } }));
});

// --- recently viewed ---------------------------------------------------------
const RV = 'gc.recent.v1';
export const recent = {
  add(handle) {
    const list = storage.get(RV, []).filter((h) => h !== handle);
    list.unshift(handle);
    storage.set(RV, list.slice(0, 8));
  },
  list(exclude) {
    return storage.get(RV, []).filter((h) => h !== exclude && getProduct(h));
  },
};
