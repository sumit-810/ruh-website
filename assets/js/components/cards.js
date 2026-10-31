import { esc, icon, money, rich } from '../lib/util.js';
import { picture } from '../lib/images.js';
import { productUrl, upcomingUrl, articleUrl, fromPrice, defaultVariant, getCollection } from '../lib/catalog.js';

/** Card for a purchasable product, with optional quick add. */
export const productCard = (p, { sizes = '(min-width: 1000px) 30vw, (min-width: 600px) 45vw, 90vw', quickAdd = true } = {}) => {
  const v = defaultVariant(p);
  const second = p.images[1];
  return `<article class="pcard reveal">
    <div class="pcard__media">
      ${picture(p.images[0].key, { alt: p.images[0].alt, sizes })}
      ${second ? picture(second.key, { alt: '', sizes }) : ''}
      <div class="pcard__tags">${p.badge ? `<span class="tag tag--new">${esc(p.badge)}</span>` : ''}</div>
      ${
        quickAdd && p.available && p.variants.length === 1
          ? `<div class="pcard__quick"><button class="btn" type="button" data-quick-add="${esc(p.handle)}" data-variant="${esc(v.id)}">Add to bag <span class="price-sep">—</span> ${money(v.price)}</button></div>`
          : ''
      }
    </div>
    <div class="pcard__body">
      <div class="pcard__row">
        <h3 class="pcard__name"><a href="${productUrl(p)}" style="text-decoration:none">${esc(p.name)}</a></h3>
        <span class="pcard__price">${p.variants.length > 1 ? 'From ' : ''}${money(fromPrice(p))}</span>
      </div>
      <p class="pcard__desc">${esc(p.scentName ? `${p.scentName} — ${p.scentDescriptor}` : p.scentDescriptor || '')}</p>
      <p class="pcard__meta">${esc(v.size)}</p>
    </div>
  </article>`;
};

/** Card for an upcoming (not purchasable) item. */
export const upcomingCard = (u, { sizes = '(min-width: 1000px) 24vw, (min-width: 600px) 45vw, 90vw', notify = true } = {}) => `
<article class="pcard pcard--soon reveal">
  <div class="pcard__media">
    ${picture(u.image, { alt: `${u.name} — concept form, coming soon`, sizes })}
    <div class="pcard__tags"><span class="tag tag--soon">Coming soon</span></div>
  </div>
  <div class="pcard__body">
    <h3 class="pcard__name"><a href="${upcomingUrl(u)}" style="text-decoration:none">${esc(u.name)}</a></h3>
    <p class="pcard__desc">${esc(u.intro)}</p>
    <p class="pcard__meta">${esc(getCollection(u.collection)?.name || '')} · In development</p>
    ${notify ? `<a class="link pcard__notify" href="${upcomingUrl(u)}">Notify me ${icon.arrow}</a>` : ''}
  </div>
</article>`;

/** Editorial tile used for "what comes next". */
export const tile = (t, { soon = true, sizes = '(min-width: 900px) 30vw, 48vw' } = {}) => `
<a class="tile reveal" href="${esc(t.href)}">
  <div class="media">${picture(t.image, { alt: '', sizes })}</div>
  ${soon ? '<span class="tag tag--soon">Coming soon</span>' : ''}
  <span class="tile__label">
    <span><span class="tile__name">${esc(t.label)}</span>${t.note ? `<span class="tile__note">${esc(t.note)}</span>` : ''}</span>
    <span class="tile__arrow" aria-hidden="true">${icon.arrow}</span>
  </span>
</a>`;

export const journalCard = (a) => `
<a class="jcard reveal" href="${articleUrl(a)}">
  <div class="media">${picture(a.image, { alt: '', sizes: '(min-width: 900px) 30vw, 90vw' })}</div>
  <p class="article-meta"><span>${esc(a.category)}</span><span>${esc(a.readingTime)}</span></p>
  <h3>${rich(a.title)}</h3>
  <p>${esc(a.dek)}</p>
</a>`;
