import { site } from '../../../site.config.js';
import { esc, money, icon, setTitle, $ } from '../lib/util.js';
import { thumb } from '../lib/images.js';
import { bag } from '../lib/cart.js';
import { validate, liveValidate } from '../lib/forms.js';
import { field } from '../lib/fields.js';

const STATES = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

/**
 * Checkout.
 * - provider 'demo': a clearly labelled demo — validates details, never takes payment, never claims an order was placed.
 * - provider 'shopify': redirects to a Shopify cart permalink built from variant ids.
 * - provider 'custom': POSTs the bag + details to commerce.checkout.url, which should return { redirectUrl }.
 */
export default function checkout(main) {
  setTitle('Checkout');
  const lines = bag.lines();
  const cfg = site.commerce.checkout;

  if (cfg.provider === 'shopify' && cfg.shopifyDomain && lines.length && lines.every((l) => l.variant.shopifyVariantId)) {
    location.href = `https://${cfg.shopifyDomain}/cart/${lines.map((l) => `${l.variant.shopifyVariantId}:${l.qty}`).join(',')}`;
    return;
  }

  if (!lines.length) {
    main.innerHTML = `<section class="container empty-state"><h1 class="t-2xl">Your bag is <em>empty.</em></h1><p class="lede">Add something to your bag before checking out.</p><a class="btn" href="product.html?p=body-mist-no-01">Shop Body Mist</a></section>`;
    return;
  }

  const demo = cfg.provider === 'demo';
  const subtotal = bag.subtotal();
  main.innerHTML = `
<div class="container">
  <header class="page-hero" style="padding-bottom:32px">
    <p class="eyebrow">Checkout</p>
    <h1 class="page-hero__title">Almost <em>yours.</em></h1>
  </header>
  ${demo ? `<div class="notice" style="margin-bottom:48px" role="note">${icon.info}<span><strong>Demo checkout.</strong> Payments are not connected yet. You can review the flow, but no order will be placed, nothing will be charged and your details are not stored or sent anywhere.</span></div>` : ''}
  <div class="checkout">
    <form data-checkout novalidate>
      <fieldset>
        <legend>Contact</legend>
        <div class="form-grid form-grid--2">
          ${field('co-email', 'Email', (a) => `<input ${a} class="input" type="email" name="email" autocomplete="email" inputmode="email">`, 'required email')}
          ${field('co-phone', 'Mobile number', (a) => `<input ${a} class="input" type="tel" name="phone" autocomplete="tel" inputmode="tel" placeholder="10-digit mobile">`, 'required phoneIN')}
        </div>
      </fieldset>
      <fieldset>
        <legend>Delivery address</legend>
        <div class="form-grid form-grid--2">
          ${field('co-name', 'Full name', (a) => `<input ${a} class="input" name="name" autocomplete="name">`, 'required', { className: 'span-2' })}
          ${field('co-a1', 'Address line 1', (a) => `<input ${a} class="input" name="address1" autocomplete="address-line1">`, 'required', { className: 'span-2' })}
          ${field('co-a2', 'Address line 2 (optional)', (a) => `<input ${a} class="input" name="address2" autocomplete="address-line2">`, '', { className: 'span-2' })}
          ${field('co-city', 'City', (a) => `<input ${a} class="input" name="city" autocomplete="address-level2">`)}
          ${field('co-pin', 'PIN code', (a) => `<input ${a} class="input" name="pin" autocomplete="postal-code" inputmode="numeric" maxlength="6">`, 'required pin')}
          ${field('co-state', 'State / UT', (a) => `<select ${a} class="select input" name="state" autocomplete="address-level1"><option value="">Select</option>${STATES.map((s) => `<option>${esc(s)}</option>`).join('')}</select>`, 'required', { className: 'span-2' })}
        </div>
      </fieldset>
      <fieldset>
        <legend>Payment</legend>
        <div class="pay-placeholder">
          <strong style="color:var(--cocoa);font-weight:500">${demo ? 'Payment gateway not connected' : 'Secure payment'}</strong>
          <span>${demo ? 'When a gateway (for example Razorpay, Cashfree, PayU or Shopify Payments) is connected, customers will choose UPI, cards, net banking or wallets here.' : 'You will be redirected to our secure payment partner.'}</span>
          <div class="pay-methods">${['UPI', 'Cards', 'Net banking', 'Wallets'].map((m) => `<span class="tag tag--outline">${m}</span>`).join('')}</div>
        </div>
      </fieldset>
      <button class="btn btn--block" type="submit">${icon.lock}<span>${demo ? 'Review demo order' : `Pay ${money(subtotal)}`}</span></button>
      <p class="form-status" data-status role="status" aria-live="polite" hidden style="margin-top:16px"></p>
    </form>
    <aside class="checkout__summary" aria-label="Order summary">
      <div class="summary">
        <h2 class="t-md" style="font-size:1.5rem">Order summary</h2>
        <ul style="list-style:none;margin:0;padding:0">
          ${lines
            .map(
              (l) => `<li class="line"><div class="line__media"><img src="${thumb(l.product.images[0].key)}" alt="" width="88" height="110"></div><div><div class="line__top"><span class="line__name">${esc(l.product.name)}</span><span>${money(l.lineTotal)}</span></div><p class="line__meta">${esc(l.variant.size)} · Qty ${l.qty}</p></div></li>`
            )
            .join('')}
        </ul>
        <div class="summary__row"><span>Subtotal (MRP, incl. taxes)</span><span>${money(subtotal)}</span></div>
        <div class="summary__row"><span>Delivery</span><span>To be confirmed</span></div>
        <div class="summary__total"><span>Total</span><strong>${money(subtotal)}</strong></div>
        <p class="cart-note">Delivery charges, if any, will be shown here once shipping rates are configured.</p>
        <a class="link" href="#" data-open-bag>Edit bag</a>
      </div>
    </aside>
  </div>
</div>`;

  const form = $('[data-checkout]', main);
  const status = $('[data-status]', main);
  liveValidate(form);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    status.hidden = false;
    if (demo) {
      status.dataset.tone = 'info';
      status.textContent = 'Demo complete — your details are valid. No order has been placed and no payment was taken, because payments are not connected yet.';
      return;
    }
    if (cfg.provider === 'custom' && cfg.url) {
      try {
        const res = await fetch(cfg.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer: Object.fromEntries(new FormData(form)), lines: lines.map((l) => ({ sku: l.variant.sku || l.variant.id, qty: l.qty })) }),
        });
        const data = res.ok ? await res.json() : null;
        if (data?.redirectUrl) {
          location.href = data.redirectUrl;
          return;
        }
      } catch {
        /* fall through */
      }
      status.dataset.tone = 'error';
      status.textContent = 'We couldn’t start payment. Nothing has been charged — please try again.';
      return;
    }
    status.dataset.tone = 'error';
    status.textContent = 'Checkout is not configured. Nothing has been charged.';
  });
}
