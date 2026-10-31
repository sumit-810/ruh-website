import { collections } from '../../../site.config.js';
import { esc, setTitle, setMeta, route, setRouteParams, $, $$ } from '../lib/util.js';
import { allItems } from '../lib/catalog.js';
import { card } from '../components/cards.js';
import { reveal } from '../components/misc.js';

/** Shop all: the whole range as image cards, filterable by line (synced to the URL). */
export default function shop(main) {
  setTitle('Shop all');
  setMeta('Body Mist Nº 01 and the Gentle Company range: body, face and lip care.');
  let cat = route.params.get('cat') || 'all';
  const tabs = [{ key: 'all', label: 'All' }, ...collections.map((c) => ({ key: c.handle, label: c.name }))];
  main.innerHTML = `
<div class="container page-pad" style="padding-top:var(--s-5)">
  <header class="section-head" style="margin-bottom:var(--s-5)">
    <div><h1 class="t-2xl">Shop all</h1><p data-count></p></div>
  </header>
  <div class="tabs" role="tablist" aria-label="Filter by category" style="margin-bottom:var(--s-6)">
    ${tabs.map((t) => `<button type="button" role="tab" data-cat="${t.key}" aria-selected="${t.key === cat}">${esc(t.label)}</button>`).join('')}
  </div>
  <div class="grid-cards grid-cards--4" data-results></div>
</div>`;
  const results = $('[data-results]', main);
  const count = $('[data-count]', main);
  const render = () => {
    const items = allItems(cat === 'all' ? null : cat);
    count.textContent = `${items.length} ${items.length === 1 ? 'product' : 'products'}`;
    results.innerHTML = items.map((x) => `<div class="reveal">${card(x, { sizes: '(min-width: 1200px) 23vw, (min-width: 900px) 31vw, 48vw' })}</div>`).join('');
    reveal(results);
  };
  $$('[data-cat]', main).forEach((b) =>
    b.addEventListener('click', () => {
      cat = b.dataset.cat;
      $$('[data-cat]', main).forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      const q = new URLSearchParams();
      if (cat !== 'all') q.set('cat', cat);
      setRouteParams(q);
      render();
    }),
  );
  render();
}
