import { esc, rich, money, icon } from '../lib/util.js';
import { picture } from '../lib/images.js';
import {
  productUrl, upcomingUrl, articleUrl, fromPrice, defaultVariant, getCollection, getProduct, getUpcoming,
  isPurchasable, statusOf,
} from '../lib/catalog.js';
import { makeOverlay } from './overlay.js';
import { waitlistForm, wireWaitlists } from './waitlist.js';

const statusTag = (label, kind) =>
  label ? `<span class="tag ${kind === 'product' ? 'tag--soon' : 'tag--dev'}">${esc(label)}</span>` : '';

/**
 * One card for every item in the range. Products link to their page;
 * the rest of the range links to its collection and opens a quick view.
 */
export const card = ({ kind, item }, { sizes = '(min-width: 1100px) 24vw, (min-width: 700px) 32vw, 72vw', feature = false } = {}) => {
  const col = getCollection(item.collection);
  const isProduct = kind === 'product';
  const url = isProduct ? productUrl(item) : upcomingUrl(item);
  const img = isProduct ? item.images[0]?.key : item.image;
  const altKey = isProduct ? item.images[2]?.key : col?.image; // second look on hover
  const status = statusOf(item);
  const buyable = isProduct && isPurchasable(item);
  return `<article class="card${feature ? ' card--feature' : ''}" data-tone="${esc(col?.tone || '')}">
  <a class="card__media" href="${url}" tabindex="-1" aria-hidden="true">
    ${picture(img, { alt: '', sizes })}
    ${altKey ? `<span class="card__alt">${picture(altKey, { alt: '', sizes })}</span>` : ''}
  </a>
  <div class="card__tags">${isProduct && item.badge ? `<span class="tag tag--new">${esc(item.badge)}</span>` : ''}</div>
  <button class="card__qv" type="button" data-quick-view="${esc(item.handle)}" aria-label="Quick view: ${esc(item.name)}">Quick view</button>
  <div class="card__body">
    <p class="card__cat">${esc(isProduct ? item.category : col?.name || '')}</p>
    <h3 class="card__name"><a href="${url}">${esc(item.name)}</a></h3>
    <p class="card__line">${esc(isProduct ? item.tagline : item.line)}</p>
    <div class="card__foot">
      ${buyable ? `<span class="card__price">${money(fromPrice(item))}</span>` : statusTag(status, kind)}
      ${
        buyable
          ? `<button class="btn btn--small" type="button" data-quick-add="${esc(item.handle)}" data-variant="${esc(defaultVariant(item).id)}">Add</button>`
          : ''
      }
    </div>
  </div>
</article>`;
};

/* ---------------------------------------------------------------------------
 * Quick view: a light dialog to explore any item without leaving the page.
 * ------------------------------------------------------------------------- */
let qv;
let qvOverlay;

const ensureQuickView = () => {
  if (qv) return;
  qv = document.createElement('div');
  qv.className = 'qv';
  qv.setAttribute('role', 'dialog');
  qv.setAttribute('aria-modal', 'true');
  qv.setAttribute('aria-labelledby', 'qv-title');
  qv.tabIndex = -1;
  qv.hidden = true;
  document.body.append(qv);
  qvOverlay = makeOverlay(qv, { initialFocus: () => qv.querySelector('[data-qv-close]') });
  qv.addEventListener('click', (e) => {
    if (e.target.closest('[data-qv-close]')) qvOverlay.close();
    const t = e.target.closest('[data-qv-thumb]');
    if (t) {
      qv.querySelectorAll('[data-qv-img]').forEach((el) => (el.hidden = el.dataset.qvImg !== t.dataset.qvThumb));
      qv.querySelectorAll('[data-qv-thumb]').forEach((b) => b.setAttribute('aria-current', String(b === t)));
    }
  });
};

export const openQuickView = (handle, trigger) => {
  ensureQuickView();
  const product = getProduct(handle);
  const item = product || getUpcoming(handle);
  if (!item) return;
  const col = getCollection(item.collection);
  const keys = product ? product.images.slice(0, 3).map((i) => i.key) : [item.image, col?.image].filter(Boolean);
  const buyable = product && isPurchasable(product);
  const url = product ? productUrl(product) : upcomingUrl(item);
  qv.innerHTML = `
  <button class="icon-btn qv__close" type="button" data-qv-close aria-label="Close">${icon.close}</button>
  <div class="qv__grid">
    <div class="qv__media">
      ${keys.map((k, i) => `<div data-qv-img="${i}" ${i ? 'hidden' : ''} style="height:100%">${picture(k, { alt: i ? '' : `${item.name}`, sizes: '(min-width: 760px) 480px, 100vw' })}</div>`).join('')}
    </div>
    <div class="qv__body">
      <p class="eyebrow" style="margin:0">${esc(product ? product.category : col?.name || '')}</p>
      <h2 id="qv-title">${esc(item.name)}</h2>
      <p class="lede" style="margin:0">${esc(product ? product.shortDescription : item.line)}</p>
      ${keys.length > 1 ? `<div class="gallery__thumbs" style="order:0">${keys.map((k, i) => `<button type="button" data-qv-thumb="${i}" aria-current="${i === 0}" aria-label="Image ${i + 1}">${picture(k, { alt: '', sizes: '64px' })}</button>`).join('')}</div>` : ''}
      ${
        buyable
          ? `<p class="price">${money(fromPrice(product))}</p>
             <button class="btn" type="button" data-quick-add="${esc(product.handle)}" data-variant="${esc(defaultVariant(product).id)}">Add to bag</button>`
          : `<div class="buy__meta">${statusTag(statusOf(item), product ? 'product' : 'upcoming')}</div>
             ${waitlistForm({ item: item.name, cta: 'Notify me', compact: true })}`
      }
      <a class="link" href="${url}">${product ? 'View full details' : `Explore ${esc(col?.name || 'the range')}`} ${icon.arrow}</a>
    </div>
  </div>`;
  wireWaitlists(qv);
  qvOverlay.open(trigger);
};

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-quick-view]');
  if (!b) return;
  e.preventDefault();
  openQuickView(b.dataset.quickView, b);
});

export const journalCard = (a) => `
<a class="jcard reveal card" href="${articleUrl(a)}" style="text-decoration:none">
  <div class="media">${picture(a.image, { alt: '', sizes: '(min-width: 900px) 30vw, 90vw' })}</div>
  <p class="article-meta">${esc(a.category)} · ${esc(a.readingTime)}</p>
  <h3 class="card__name">${rich(a.title)}</h3>
  <p class="card__line">${esc(a.dek)}</p>
</a>`;
