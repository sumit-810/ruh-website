import { site } from '../../../site.config.js';
import { esc, money, icon, param, setTitle } from '../lib/util.js';
import { storage } from '../lib/storage.js';

/** Order confirmation, shown after a verified online payment or a placed cash-on-delivery order. */
export default function order(main) {
  setTitle('Order confirmed');
  const ref = param('ref');
  const o = storage.get('ruh.lastOrder.v1');
  if (!o || o.reference !== ref) {
    main.innerHTML = `<section class="container empty-state">
      <h1 class="t-2xl">Order <em>details</em></h1>
      <p class="lede">We can’t show this order on this device. If you placed an order, your reference is in the confirmation from our payment partner — contact us and we’ll help.</p>
      <a class="btn" href="contact.html">Contact us</a></section>`;
    return;
  }
  const cod = o.method === 'cod';
  const care = site.contact.email;
  main.innerHTML = `
<section class="container container--narrow" style="padding-block:var(--s-8) var(--section)">
  <p class="eyebrow">${cod ? 'Order placed' : 'Payment received'}</p>
  <h1 class="t-2xl">Thank you. <em>${cod ? 'Your order is placed.' : 'Your order is confirmed.'}</em></h1>
  <p class="lede" style="margin-top:20px">Your reference is <strong>${esc(o.reference)}</strong>. Please keep it for any questions about this order.</p>
  <div class="summary" style="margin-top:40px">
    <ul style="list-style:none;margin:0;padding:0">
      ${o.items.map((i) => `<li class="summary__row"><span>${esc(i.name)} · ${esc(i.size)} × ${i.qty}</span><span>${money(i.lineTotal)}</span></li>`).join('')}
    </ul>
    <div class="summary__row"><span>Delivery</span><span>${o.delivery ? money(o.delivery) : 'Free'}</span></div>
    <div class="summary__total"><span>${cod ? 'To pay on delivery' : 'Paid'}</span><strong>${money(o.total)}</strong></div>
    ${o.paymentId ? `<p class="cart-note">Payment ID: ${esc(o.paymentId)}</p>` : ''}
  </div>
  <div class="notice" style="margin-top:32px">${icon.info}<span>${
    cod
      ? 'We’ll contact you to confirm your cash-on-delivery order before it ships.'
      : 'Your payment has been verified.'
  } ${o.email ? `We’ll write to ${esc(o.email)} with delivery updates.` : ''}${care ? ` Questions? <a class="text-link" href="mailto:${esc(care)}">${esc(care)}</a>.` : ''}</span></div>
  <div class="hero__ctas" style="margin-top:40px"><a class="btn" href="index.html">Back to home</a><a class="link" href="journal.html">How to wear a body mist ${icon.arrow}</a></div>
</section>`;
}
