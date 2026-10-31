import { setTitle, icon } from '../lib/util.js';

export default function account(main) {
  setTitle('Account');
  main.innerHTML = `
<section class="container empty-state">
  <p class="eyebrow eyebrow--plain">Account</p>
  <h1 class="t-2xl">Accounts open <em>at launch.</em></h1>
  <p class="lede">Order history, saved addresses and early-access perks will live here once our store connects to its commerce platform. You don’t need an account to order.</p>
  <div class="hero__ctas" style="justify-content:center">
    <a class="btn" href="product.html?p=body-mist-no-01">Shop Body Mist</a>
    <a class="link" href="contact.html">Need help with an order? ${icon.arrow}</a>
  </div>
</section>`;
}
