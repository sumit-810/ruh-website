import { esc, param, setTitle, setMeta } from '../lib/util.js';
import { picture } from '../lib/images.js';
import { getCollection, allItems, isPurchasable } from '../lib/catalog.js';
import { card } from '../components/cards.js';
import { waitlistForm, wireWaitlists } from '../components/waitlist.js';
import notFound from './notfound.js';

export default function collection(main) {
  const c = getCollection(param('c'));
  if (!c) return notFound(main);
  setTitle(c.name);
  setMeta(`${c.name} from Gentle Company — ${c.intro}`);
  const items = allItems(c.handle);
  const live = items.some((x) => x.kind === 'product' && isPurchasable(x.item));
  main.innerHTML = `
<div class="container">
  <header class="col-hero">
    <div>
      <p class="eyebrow">Collection · ${items.length} products</p>
      <h1>${esc(c.headline)}</h1>
      <p>${esc(c.intro)}</p>
    </div>
    <div class="media">${picture(c.image, { alt: c.imageAlt, sizes: '(min-width: 900px) 46vw, 100vw', priority: true })}</div>
  </header>
  <div class="toolbar"><span class="toolbar__count">${live ? 'Shop now, and see what’s next' : 'Launching soon — tap any product for a closer look'}</span></div>
  <div class="grid-cards">
    ${items.map((x) => `<div id="${esc(x.item.handle)}" class="reveal">${card(x, { sizes: '(min-width: 900px) 30vw, 48vw' })}</div>`).join('')}
  </div>
</div>
<section class="section" id="waitlist" aria-labelledby="wl-title">
  <div class="container container--narrow center stack">
    <h2 id="wl-title" class="t-xl">Hear first about ${esc(c.name.toLowerCase())}.</h2>
    <div style="max-width:520px;margin-inline:auto;width:100%;text-align:left">${waitlistForm({ cta: 'Sign up', hidden: { interests: c.name } })}</div>
  </div>
</section>`;
  wireWaitlists(main);
}
