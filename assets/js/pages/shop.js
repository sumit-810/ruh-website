import { collections, products, upcoming } from '../../../site.config.js';
import { esc, setTitle, setMeta, icon, route, setRouteParams } from '../lib/util.js';
import { productCard, upcomingCard } from '../components/cards.js';
import { reveal } from '../components/misc.js';

/** Shop all: products + upcoming items, filterable by collection and availability (synced to the URL). */
export default function shop(main) {
  setTitle('Shop all');
  setMeta('Shop Body Mist Nº 01 and discover the body, face and lip care in development.');
  const params = route.params;
  const state = { cat: params.get('cat') || 'all', avail: params.get('avail') || 'all' };

  const radio = (name, value, label, checked) =>
    `<label class="chip"><input type="radio" name="${name}" value="${esc(value)}" ${checked ? 'checked' : ''}><span>${esc(label)}</span></label>`;

  main.innerHTML = `
<div class="container">
  <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li aria-current="page">Shop</li></ol></nav>
  <header class="page-hero" style="padding-bottom:48px">
    <p class="eyebrow">Shop</p>
    <h1 class="page-hero__title">One ritual now. <em>More in the making.</em></h1>
    <p class="lede">Body Mist Nº 01 is available today. Everything else you see here is in development and can’t be ordered yet — join a list to hear first.</p>
  </header>
  <form class="filters" aria-label="Filter products" data-filters>
    <fieldset><legend>Category</legend><div class="chips">
      ${radio('cat', 'all', 'All', state.cat === 'all')}
      ${collections.map((c) => radio('cat', c.handle, c.name, state.cat === c.handle)).join('')}
    </div></fieldset>
    <fieldset><legend>Availability</legend><div class="chips">
      ${radio('avail', 'all', 'All', state.avail === 'all')}
      ${radio('avail', 'now', 'Available now', state.avail === 'now')}
      ${radio('avail', 'soon', 'Coming soon', state.avail === 'soon')}
    </div></fieldset>
    <p class="result-count" role="status" aria-live="polite" data-count></p>
  </form>
  <div class="grid-cards" data-results style="padding-bottom:var(--section)"></div>
</div>`;

  const results = main.querySelector('[data-results]');
  const count = main.querySelector('[data-count]');
  const render = () => {
    const ps = products.filter((p) => (state.cat === 'all' || p.collection === state.cat) && state.avail !== 'soon' && p.available);
    const us = upcoming.filter((u) => (state.cat === 'all' || u.collection === state.cat) && state.avail !== 'now');
    const n = ps.length + us.length;
    count.textContent = `${n} ${n === 1 ? 'item' : 'items'}${us.length ? ` · ${us.length} coming soon` : ''}`;
    results.innerHTML = n
      ? ps.map((p) => productCard(p)).join('') + us.map((u) => upcomingCard(u)).join('')
      : `<div class="empty-state" style="grid-column:1/-1"><p class="display t-lg">Nothing here yet.</p><a class="link" href="shop.html">Clear filters ${icon.arrow}</a></div>`;
    reveal(results);
  };
  main.querySelector('[data-filters]').addEventListener('change', (e) => {
    state[e.target.name] = e.target.value;
    const q = new URLSearchParams();
    if (state.cat !== 'all') q.set('cat', state.cat);
    if (state.avail !== 'all') q.set('avail', state.avail);
    setRouteParams(q);
    render();
  });
  main.querySelector('[data-filters]').addEventListener('submit', (e) => e.preventDefault());
  render();
}
