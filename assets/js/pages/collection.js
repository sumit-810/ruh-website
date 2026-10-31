import { collections } from '../../../site.config.js';
import { esc, icon, prov, param, setTitle, setMeta, rich } from '../lib/util.js';
import { picture } from '../lib/images.js';
import { getCollection, collectionItems, collectionUrl } from '../lib/catalog.js';
import { productCard } from '../components/cards.js';
import { waitlistForm, wireWaitlists } from '../components/waitlist.js';
import notFound from './notfound.js';

export default function collection(main) {
  const c = getCollection(param('c') || '');
  if (!c) return notFound(main);
  const { products, upcoming } = collectionItems(c.handle);
  const live = products.filter((p) => p.available);
  setTitle(c.name);
  setMeta(c.intro);

  main.innerHTML = `
<div class="container">
  <nav class="crumbs" aria-label="Breadcrumb"><ol>
    <li><a href="index.html">Home</a></li><li><a href="shop.html">Shop</a></li><li aria-current="page">${esc(c.name)}</li>
  </ol></nav>
  <header class="page-hero page-hero--split">
    <div>
      <p class="eyebrow">${esc(c.eyebrow)}</p>
      <h1 class="page-hero__title">${rich(c.headline)}</h1>
      <p class="lede" style="margin-top:24px">${esc(c.intro)} ${prov(true, 'Placeholder copy')}</p>
      <div class="status-line" style="margin-top:28px">
        ${live.length ? `<span class="tag tag--new">${live.length} available now</span>` : ''}
        <span class="tag tag--outline">${upcoming.length} in development</span>
      </div>
      <div class="hero__ctas" style="margin-top:32px">
        ${live.length ? `<a class="btn" href="#available">Shop now</a>` : ''}
        <a class="${live.length ? 'link' : 'btn'}" href="#waitlist">Notify me${live.length ? ` ${icon.arrow}` : ''}</a>
      </div>
    </div>
    <div class="media page-hero__media">${picture(c.image, { alt: c.imageAlt, sizes: '(min-width: 900px) 45vw, 100vw', priority: true })}<span class="caption">Concept forms · in development</span></div>
  </header>
</div>

${
  live.length
    ? `<section class="section section--tight section--limewash" id="available" aria-labelledby="avail-title">
  <div class="container">
    <div class="section-head"><p class="eyebrow">Available now</p><h2 class="t-xl" id="avail-title">Begin <em>here.</em></h2></div>
    <div class="grid-cards">${live.map((p) => productCard(p)).join('')}</div>
  </div>
</section>`
    : ''
}

<section class="section" aria-labelledby="dev-title">
  <div class="container">
    <div class="section-head section-head--split">
      <div><p class="eyebrow">In development</p><h2 class="t-xl" id="dev-title">What we are <em>working on.</em></h2></div>
      <p class="lede">None of these are available yet. Images show blank concept forms, not final packaging; formulas, prices and dates will be shared only once they are final.</p>
    </div>
    <div class="dev-list">
      ${upcoming
        .map(
          (u) => `<article class="dev-item reveal" id="${esc(u.handle)}">
          <div class="media ratio-45">${picture(u.image, { alt: `${u.name} — blank concept form`, sizes: '(min-width: 1000px) 24vw, (min-width: 600px) 45vw, 90vw' })}<span class="pcard__tags" style="position:absolute;left:12px;top:12px"><span class="tag tag--soon">Coming soon</span></span></div>
          <div class="meta"><span class="pcard__meta">${esc(u.format)}</span></div>
          <h3>${esc(u.name)}</h3>
          <p class="muted small">${esc(u.intro)}</p>
          <button class="link" type="button" data-notify="${esc(u.handle)}" aria-expanded="false" aria-controls="notify-${esc(u.handle)}">Notify me ${icon.arrow}</button>
          <div class="notify" id="notify-${esc(u.handle)}" hidden>${waitlistForm({ item: u.name, cta: `Notify me` })}</div>
        </article>`
        )
        .join('')}
    </div>
  </div>
</section>

<section class="section section--limewash" id="waitlist" aria-labelledby="wl-title">
  <div class="container early">
    <div>
      <p class="eyebrow">Early access</p>
      <h2 class="t-xl" id="wl-title">Be first to know when <em>${esc(c.name.toLowerCase())}</em> arrives.</h2>
      <p class="lede" style="margin-top:20px">One email when it launches — and early access before anyone else.</p>
      ${waitlistForm({ interests: collections.map((x) => x.name), preset: [c.name], cta: 'Join the list' })}
    </div>
    <div class="media early__media reveal">${picture('wall_light', { alt: 'Sunlight falling through a carved jaali screen onto a limewash wall', sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
  </div>
</section>

<section class="section section--tight" aria-label="Other collections">
  <div class="container" style="display:flex;flex-wrap:wrap;gap:16px 40px;justify-content:center">
    ${collections.filter((x) => x.handle !== c.handle).map((x) => `<a class="link" href="${collectionUrl(x)}">${esc(x.name)} ${icon.arrow}</a>`).join('')}
    <a class="link" href="shop.html">Shop all ${icon.arrow}</a>
  </div>
</section>`;

  wireWaitlists(main);
  main.querySelectorAll('[data-notify]').forEach((b) =>
    b.addEventListener('click', () => {
      const panel = document.getElementById(b.getAttribute('aria-controls'));
      const open = panel.hidden;
      panel.hidden = !open;
      b.setAttribute('aria-expanded', String(open));
      if (open) panel.querySelector('input[type="email"]').focus();
    })
  );}
