import { content, products } from '../../../site.config.js';
import { esc, setTitle, setMeta, icon } from '../lib/util.js';

const item = (f) => `<details class="acc acc--faq"><summary>${esc(f.q)}<span class="plus" aria-hidden="true"></span></summary><div class="acc__body"><p>${esc(f.a)}</p></div></details>`;

export default function faq(main) {
  setTitle('FAQs');
  setMeta('Answers about our products, orders, delivery and returns.');
  const groups = [...content.faqs, ...products.map((p) => ({ group: p.name, items: p.faqs || [] }))].filter((g) => g.items.length);
  main.innerHTML = `
<div class="container container--narrow" style="padding-bottom:var(--section)">
  <header class="page-hero" style="padding-bottom:32px">
    <p class="eyebrow">Help</p>
    <h1 class="page-hero__title">Questions, <em>answered.</em></h1>
    <p class="lede">Where an answer depends on details we are still confirming, we say so plainly rather than guess.</p>
  </header>
  ${groups
    .map(
      (g, i) => `<section aria-labelledby="faq-${i}" style="margin-top:48px">
    <h2 class="t-lg" id="faq-${i}" style="margin-bottom:16px">${esc(g.group)}</h2>
    <div class="accordion">${g.items.map(item).join('')}</div>
  </section>`
    )
    .join('')}
  <p style="margin-top:64px"><a class="link" href="contact.html">Still have a question? Contact us ${icon.arrow}</a></p>
</div>`;
}
