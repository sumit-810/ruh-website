import { setTitle, icon } from '../lib/util.js';

export default function notFound(main) {
  setTitle('Page not found');
  main.innerHTML = `
<section class="container empty-state">
  <p class="eyebrow eyebrow--plain">404</p>
  <h1 class="t-2xl">This page has <em>slipped away.</em></h1>
  <p class="lede">The link may be old, or the page may not exist yet.</p>
  <div class="hero__ctas" style="justify-content:center">
    <a class="btn" href="index.html">Return home</a>
    <a class="link" href="shop.html">Shop all ${icon.arrow}</a>
  </div>
</section>`;
}
