import { site } from '../../../site.config.js';
import { esc, money, icon, setTitle, $, navigate } from '../lib/util.js';
import { thumb } from '../lib/images.js';
import { bag } from '../lib/cart.js';
import { quote } from '../lib/pricing.js';
import { validate, liveValidate, send } from '../lib/forms.js';
import { field } from '../lib/fields.js';
import { storage } from '../lib/storage.js';

const STATES = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

const RAZORPAY_JS = 'https://checkout.razorpay.com/v1/checkout.js';
const LAST_ORDER = 'gc.lastOrder.v1';

const loadRazorpay = () =>
  window.Razorpay
    ? Promise.resolve(window.Razorpay)
    : new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = RAZORPAY_JS;
        s.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('razorpay-missing')));
        s.onerror = () => reject(new Error('razorpay-unreachable'));
        document.head.append(s);
      });

const postJson = async (url, body) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON (e.g. a static server answering 404/501) */
  }
  return { ok: res.ok, status: res.status, data };
};

/** Save what the confirmation page shows, then empty the bag. */
const complete = (order) => {
  storage.set(LAST_ORDER, { ...order, placedAt: new Date().toISOString() });
  bag.clear();
  navigate(`order.html?ref=${encodeURIComponent(order.reference)}`);
};

/**
 * Checkout.
 * - 'razorpay': server prices the bag (/api/create-order), Razorpay Checkout takes payment,
 *   /api/verify-payment checks the signature before the order is confirmed.
 * - Cash on delivery (if enabled in site.shipping.cod): the order is emailed to the business via /api/contact for manual confirmation.
 * - The page is only reachable as a checkout when site.commerce.enabled is true.
 */
export default function checkout(main) {
  setTitle('Checkout');
  const lines = bag.lines();
  const cfg = site.commerce.checkout;

  if (cfg.provider === 'shopify' && cfg.shopifyDomain && lines.length && lines.every((l) => l.variant.shopifyVariantId)) {
    location.href = `https://${cfg.shopifyDomain}/cart/${lines.map((l) => `${l.variant.shopifyVariantId}:${l.qty}`).join(',')}`;
    return;
  }

  if (!site.commerce.enabled || cfg.provider === 'demo') {
    main.innerHTML = `<section class="container empty-state"><h1 class="t-2xl">Our shop opens <em>soon.</em></h1><p class="lede">Body Mist Nº 01 is launching soon. Leave your email on the product page and we’ll write as soon as it’s available.</p><a class="btn" href="product.html?p=body-mist-no-01#notify">Get notified</a></section>`;
    return;
  }

  if (!lines.length) {
    main.innerHTML = `<section class="container empty-state"><h1 class="t-2xl">Your bag is <em>empty.</em></h1><p class="lede">Add something to your bag before checking out.</p><a class="btn" href="product.html?p=body-mist-no-01">Shop Body Mist</a></section>`;
    return;
  }

  const cod = site.shipping.cod || {};
  const plain = lines.map((l) => ({ handle: l.handle, variantId: l.variantId, qty: l.qty }));

  main.innerHTML = `
<div class="container">
  <header class="page-hero" style="padding-bottom:32px">
    <p class="eyebrow">Checkout</p>
    <h1 class="page-hero__title">Almost <em>yours.</em></h1>
  </header>
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
        <div class="chips" role="radiogroup" aria-label="Payment method" style="margin-bottom:16px">
          <label class="chip"><input type="radio" name="method" value="online" checked><span>Pay online</span></label>
          ${cod.enabled ? `<label class="chip"><input type="radio" name="method" value="cod"><span>Cash on delivery${cod.fee ? ` (+${money(cod.fee)})` : ''}</span></label>` : ''}
        </div>
        <div class="pay-placeholder">
          <strong style="color:var(--cocoa);font-weight:500">Secure payment by Razorpay</strong>
          <span>Choose UPI, cards, net banking or wallets in the next step. We never see or store your card details.</span>
          <div class="pay-methods">${['UPI', 'Cards', 'Net banking', 'Wallets'].map((m) => `<span class="tag tag--outline">${m}</span>`).join('')}</div>
        </div>
      </fieldset>
      <button class="btn btn--block" type="submit" data-pay>${icon.lock}<span data-pay-label></span></button>
      <p class="small muted" style="margin-top:12px">By placing your order you agree to our <a class="text-link" href="terms.html">terms</a> and <a class="text-link" href="shipping-returns.html">shipping &amp; returns policy</a>. Sold by ${esc(site.company.legalName || site.company.name)}.</p>
      <p class="form-status" data-status role="status" aria-live="polite" hidden style="margin-top:16px"></p>
    </form>
    <aside class="checkout__summary" aria-label="Order summary">
      <div class="summary" data-summary></div>
    </aside>
  </div>
</div>`;

  const form = $('[data-checkout]', main);
  const status = $('[data-status]', main);
  const payBtn = $('[data-pay]', main);
  const method = () => new FormData(form).get('method') || 'online';
  const say = (tone, text) => {
    status.hidden = false;
    status.dataset.tone = tone;
    status.textContent = text;
  };

  const renderSummary = () => {
    const q = quote(plain, { paymentMethod: method() });
    $('[data-summary]', main).innerHTML = `
      <h2 class="t-md" style="font-size:1.5rem">Order summary</h2>
      <ul style="list-style:none;margin:0;padding:0">
        ${lines.map((l) => `<li class="line"><div class="line__media"><img src="${thumb(l.product.images[0].key)}" alt="" width="88" height="110"></div><div><div class="line__top"><span class="line__name">${esc(l.product.name)}</span><span>${money(l.lineTotal)}</span></div><p class="line__meta">${esc(l.variant.size)} · Qty ${l.qty}</p></div></li>`).join('')}
      </ul>
      <div class="summary__row"><span>Subtotal (MRP, incl. taxes)</span><span>${money(q.subtotal)}</span></div>
      <div class="summary__row"><span>Delivery</span><span>${q.delivery ? money(q.delivery) : 'Free'}</span></div>
      ${q.codFee ? `<div class="summary__row"><span>Cash on delivery fee</span><span>${money(q.codFee)}</span></div>` : ''}
      <div class="summary__total"><span>Total</span><strong>${money(q.total)}</strong></div>
      ${q.freeDeliveryRemaining ? `<p class="cart-note">Add ${money(q.freeDeliveryRemaining)} more for free delivery.</p>` : ''}
      <a class="link" href="#" data-open-bag>Edit bag</a>`;
    $('[data-pay-label]', main).textContent = method() === 'cod' ? `Place order — ${money(q.total)}` : `Pay ${money(q.total)}`;
    return q;
  };
  form.addEventListener('change', (e) => e.target.name === 'method' && renderSummary());
  renderSummary();
  liveValidate(form);

  const customer = () => {
    const d = Object.fromEntries(new FormData(form));
    delete d.method;
    return d;
  };

  const payOnline = async () => {
    let created;
    try {
      created = await postJson('/api/create-order', { lines: plain, customer: customer() });
    } catch {
      created = { ok: false, status: 0 };
    }
    if (!created.ok) {
      const code = created.data?.error;
      if (code === 'invalid-bag') return say('error', 'Something in your bag is no longer available. Please review your bag and try again.');
      if (code === 'invalid-customer') return say('error', 'Please check your contact and delivery details and try again.');
      return say('error', 'We couldn’t start the payment. Nothing has been charged — please try again in a moment.');
    }
    let Razorpay;
    try {
      Razorpay = await loadRazorpay();
    } catch {
      return say('error', 'The payment window couldn’t load. Please check your connection and try again. Nothing has been charged.');
    }
    const o = created.data;
    const c = customer();
    const rzp = new Razorpay({
      key: o.keyId,
      order_id: o.orderId,
      amount: o.amount,
      currency: o.currency,
      name: o.merchant.name,
      description: o.merchant.description,
      prefill: { name: c.name, email: c.email, contact: c.phone },
      notes: { receipt: o.receipt },
      theme: { color: '#2e231d' },
      modal: { ondismiss: () => say('info', 'Payment window closed. Nothing has been charged — you can try again whenever you’re ready.') },
      handler: async (response) => {
        say('info', 'Confirming your payment…');
        let verified;
        try {
          verified = await postJson('/api/verify-payment', response);
        } catch {
          verified = { ok: false };
        }
        if (verified.ok && verified.data?.verified) {
          complete({ reference: verified.data.receipt || o.receipt, paymentId: response.razorpay_payment_id, method: 'online', items: o.quote.items, total: o.quote.total, delivery: o.quote.delivery, email: c.email });
        } else {
          say('error', `We received a response from the payment provider but couldn’t confirm it. Please don’t pay again — contact us with this reference: ${o.receipt}.`);
        }
      },
    });
    rzp.on('payment.failed', (r) => say('error', `Payment failed${r?.error?.description ? `: ${r.error.description}` : ''}. Nothing has been charged — please try again or use another method.`));
    rzp.open();
  };

  const placeCod = async () => {
    const q = quote(plain, { paymentMethod: 'cod' });
    if (q.errors.length) return say('error', q.errors[0]);
    const reference = `GC-COD-${Date.now().toString(36).toUpperCase()}`;
    const c = customer();
    const result = await send('cod-order', { ...c, reference, items: q.items.map((i) => `${i.name} (${i.size}) x${i.qty}`).join('; '), total: String(q.total) });
    if (result.ok) return complete({ reference, method: 'cod', items: q.items, total: q.total, delivery: q.delivery, email: c.email });
    say('error', 'We couldn’t place your order. Nothing has been charged — please try again.');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    payBtn.disabled = true;
    try {
      await (method() === 'cod' ? placeCod() : payOnline());
    } finally {
      payBtn.disabled = false;
    }
  });
}
