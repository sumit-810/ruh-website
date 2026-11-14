import { useSyncExternalStore } from 'react';
import { site } from '../../site.config.js';
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

type RawLine = { handle: string; variantId: string; qty: number };
export type BagLine = RawLine & { product: any; variant: any; lineTotal: number };

const listeners = new Set<() => void>();
let version = 0;

const read = (): RawLine[] => {
  const raw = storage.get(KEY, []);
  return Array.isArray(raw) ? raw : [];
};
const emit = () => {
  version++;
  listeners.forEach((l) => l());
};
const write = (lines: RawLine[]) => {
  storage.set(KEY, lines);
  emit();
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => e.key === KEY && emit());
}

export const bag = {
  lines(): BagLine[] {
    return read()
      .map((l) => {
        const product = getProduct(l.handle);
        const variant = product && getVariant(product, l.variantId);
        if (!product || !variant || !product.available || !variant.available) return null;
        const qty = Math.min(Math.max(1, parseInt(String(l.qty), 10) || 1), max());
        return { ...l, qty, product, variant, lineTotal: qty * variant.price };
      })
      .filter(Boolean) as BagLine[];
  },
  count() {
    return this.lines().reduce((n, l) => n + l.qty, 0);
  },
  subtotal() {
    return this.lines().reduce((n, l) => n + l.lineTotal, 0);
  },
  add(handle: string, variantId: string, qty = 1) {
    const product = getProduct(handle);
    const variant = product && getVariant(product, variantId);
    if (!product?.available || !variant?.available) return false;
    const lines = read();
    const found = lines.find((l) => l.handle === handle && l.variantId === variantId);
    if (found) found.qty = Math.min((parseInt(String(found.qty), 10) || 0) + qty, max());
    else lines.push({ handle, variantId, qty: Math.min(qty, max()) });
    write(lines);
    return true;
  },
  setQty(handle: string, variantId: string, qty: number) {
    let lines = read();
    if (qty <= 0) lines = lines.filter((l) => !(l.handle === handle && l.variantId === variantId));
    else lines.forEach((l) => l.handle === handle && l.variantId === variantId && (l.qty = Math.min(qty, max())));
    write(lines);
  },
  remove(handle: string, variantId: string) {
    this.setQty(handle, variantId, 0);
  },
  clear() {
    write([]);
  },
  max,
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** Re-render when the bag changes. Server render and first paint always see an empty bag. */
export const useBagVersion = () =>
  useSyncExternalStore(
    subscribe,
    () => version,
    () => -1,
  );

export const useBag = () => {
  const v = useBagVersion();
  const hydrated = v >= 0;
  return {
    lines: hydrated ? bag.lines() : [],
    count: hydrated ? bag.count() : 0,
    subtotal: hydrated ? bag.subtotal() : 0,
  };
};

// --- recently viewed ---------------------------------------------------------
const RV = 'gc.recent.v1';
export const recent = {
  add(handle: string) {
    const list = (storage.get(RV, []) as string[]).filter((h) => h !== handle);
    list.unshift(handle);
    storage.set(RV, list.slice(0, 8));
  },
};
