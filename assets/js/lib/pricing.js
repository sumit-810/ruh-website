import { site } from '../../../site.config.js';
import { getProduct, getVariant } from './catalog.js';

/**
 * Order pricing shared by the bag, the checkout page and the payment server
 * (netlify/functions/create-order.mjs), so the amount charged always matches
 * what the customer saw. Prices come from the catalogue only — never from the
 * browser. All amounts in ₹ (MRP, inclusive of taxes).
 *
 *   quote([{ handle, variantId, qty }], { paymentMethod: 'online' | 'cod' })
 */
export const deliveryFor = (subtotal) => {
  const { flatRate, freeAbove } = site.shipping;
  if (!flatRate) return 0;
  if (freeAbove && subtotal >= freeAbove) return 0;
  return flatRate;
};

export const quote = (lines, { paymentMethod = 'online' } = {}) => {
  const max = site.commerce.maxQuantityPerItem || 10;
  const items = [];
  const errors = [];
  for (const line of Array.isArray(lines) ? lines : []) {
    const product = getProduct(line?.handle);
    const variant = product && getVariant(product, line?.variantId);
    const qty = Number.parseInt(line?.qty, 10);
    if (!product || !variant) {
      errors.push(`Unknown item: ${line?.handle}/${line?.variantId}`);
      continue;
    }
    if (!product.available || !variant.available) {
      errors.push(`${product.name} is not available`);
      continue;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > max) {
      errors.push(`Invalid quantity for ${product.name}`);
      continue;
    }
    items.push({ handle: product.handle, variantId: variant.id, name: product.name, size: variant.size, sku: variant.sku || variant.id, unitPrice: variant.price, qty, lineTotal: variant.price * qty });
  }
  if (!items.length && !errors.length) errors.push('The bag is empty');
  const subtotal = items.reduce((n, i) => n + i.lineTotal, 0);
  const delivery = deliveryFor(subtotal);
  const cod = site.shipping.cod || {};
  const codFee = paymentMethod === 'cod' ? cod.fee || 0 : 0;
  if (paymentMethod === 'cod') {
    if (!cod.enabled) errors.push('Cash on delivery is not available');
    else if (cod.maxOrderValue && subtotal > cod.maxOrderValue) errors.push(`Cash on delivery is available on orders up to ₹${cod.maxOrderValue}`);
  }
  const { freeAbove, flatRate } = site.shipping;
  return {
    items,
    subtotal,
    delivery,
    codFee,
    total: subtotal + delivery + codFee,
    currency: site.locale.currency,
    freeDeliveryRemaining: flatRate && freeAbove ? Math.max(0, freeAbove - subtotal) : null,
    errors,
  };
};
