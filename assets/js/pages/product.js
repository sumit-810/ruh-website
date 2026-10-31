import { site, upcoming } from '../../../site.config.js';
import { esc, icon, param, setTitle, setMeta, money, $ } from '../lib/util.js';
import { picture, thumb } from '../lib/images.js';
import { getProduct, getUpcoming, getCollection, collectionUrl, defaultVariant, isPurchasable, allItems } from '../lib/catalog.js';
import { recent } from '../lib/cart.js';
import { buyBox, wireBuy } from '../components/product-blocks.js';
import { card } from '../components/cards.js';
import { wireGallery, wireShelf } from '../components/misc.js';
import { wireWaitlists } from '../components/waitlist.js';
import { notesBlock } from './home.js';
import notFound from './notfound.js';

const acc = (title, body, { open = false } = {}) =>
  body ? `<details class="acc"${open ? ' open' : ''}><summary>${esc(title)}<span class="plus" aria-hidden="true"></span></summary><div class="acc__body">${body}</div></details>` : '';

/** Product information rows — only the declarations that are filled in. */
const infoRows = (p) => {
  const co = site.company;
  const c = site.contact;
  const defaults = {
    'Marketed by': co.legalName && co.registeredAddress ? `${co.legalName}, ${co.registeredAddress}` : null,
    'Customer care': [c.email, c.phone].filter(Boolean).join(' · ') || null,
  };
  const rows = Object.entries(p.productInformation || {})
    .map(([k, v]) => [k, v ?? defaults[k] ?? null])
    .filter(([, v]) => v);
  return rows.length ? `<table class="info-table"><tbody>${rows.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</tbody></table>` : '';
};

const productLd = (p) => {
  const v = defaultVariant(p);
  const buyable = isPurchasable(p);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    category: p.category,
    description: p.shortDescription,
    brand: { '@type': 'Brand', name: site.brand.name },
    ...(site.company.website ? { image: p.images.slice(0, 3).map((i) => `${site.company.website.replace(/\/$/, '')}/${thumb(i.key)}`) } : {}),
    ...(buyable
      ? {
          sku: v.sku || v.id,
          offers: {
            '@type': 'Offer',
            priceCurrency: site.locale.currency,
            price: v.price,
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: site.company.legalName || site.company.name },
          },
        }
      : {}),
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(ld);
  document.head.append(s);
};

export default function product(main) {
  const p = getProduct(param('p'));
  if (!p) return notFound(main);
  const col = getCollection(p.collection);
  const buyable = isPurchasable(p);
  const sc = p.scent || {};
  setTitle(p.name);
  setMeta(`${p.name} — ${p.shortDescription}`);
  productLd(p);
  recent.add(p.handle);

  const scentBody = sc.name || sc.family || sc.mood || sc.notes
    ? `${sc.name ? `<p><strong>${esc(sc.name)}</strong></p>` : ''}${sc.family ? `<p>Family: ${esc(sc.family)}</p>` : ''}${sc.mood ? `<p>${esc(sc.mood)}</p>` : ''}${notesBlock(p)}`
    : '';
  const details = [
    p.shortDescription && `<p>${esc(p.shortDescription)}</p>`,
    ...(p.description || []).map((t) => `<p>${esc(t)}</p>`),
    p.packagingNote && `<p class="small">${esc(p.packagingNote)}</p>`,
  ]
    .filter(Boolean)
    .join('');
  const related = [
    ...(p.pairsWith || []).map((h) => getUpcoming(h)).filter(Boolean).map((u) => ({ kind: 'upcoming', item: u })),
    ...allItems().filter((x) => x.item.handle !== p.handle && !(p.pairsWith || []).includes(x.item.handle)),
  ];

  main.innerHTML = `
<div class="container">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><a href="${collectionUrl(col)}">${esc(col.name)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(p.name)}</span></nav>
  <div class="pdp">
    <div class="gallery" aria-roledescription="carousel" aria-label="${esc(p.name)} images">
      <div class="gallery__thumbs">
        ${p.images.map((im, i) => `<button type="button" aria-label="Image ${i + 1}: ${esc(im.alt)}" aria-current="${i === 0}">${picture(im.key, { alt: '', sizes: '80px' })}</button>`).join('')}
      </div>
      <div class="gallery__main" tabindex="0" aria-label="Product images — use arrow keys to browse, click to zoom">
        ${p.images.map((im, i) => `<div class="gallery__slide${i === 0 ? ' is-on' : ''}">${picture(im.key, { alt: im.alt, sizes: '(min-width: 960px) 52vw, 100vw', priority: i === 0 })}</div>`).join('')}
        <button class="gallery__nav gallery__nav--prev" type="button" aria-label="Previous image">${icon.arrowLeft}</button>
        <button class="gallery__nav gallery__nav--next" type="button" aria-label="Next image">${icon.arrow}</button>
        <span class="gallery__count" aria-hidden="true">1 / ${p.images.length}</span>
      </div>
    </div>

    <div class="buy">
      <div class="buy__meta">
        <span class="eyebrow" style="margin:0">${esc(p.category)}</span>
        ${p.badge ? `<span class="tag tag--new">${esc(p.badge)}</span>` : ''}
      </div>
      <h1>${esc(p.name)}</h1>
      <p class="buy__tagline">${esc(p.tagline)}</p>
      ${sc.mood ? `<p class="small muted" style="margin:0">${esc(sc.mood)}</p>` : ''}
      ${buyBox(p)}
      ${
        p.highlights?.length
          ? `<div class="highlights">${p.highlights.map((h) => `<div class="highlight"><h3>${esc(h.title)}</h3><p class="small muted">${esc(h.text)}</p></div>`).join('')}</div>`
          : ''
      }
      <div class="accordion">
        ${acc('Details', details, { open: true })}
        ${acc('Scent', scentBody)}
        ${acc('How to use', p.howToUse?.length ? `<ol>${p.howToUse.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : '')}
        ${acc('Ingredients', p.ingredients ? `<p>${esc(p.ingredients)}</p>` : '')}
        ${acc('Product information', infoRows(p))}
        ${acc('Questions', (p.faqs || []).map((f) => `<p><strong>${esc(f.q)}</strong><br>${esc(f.a)}</p>`).join(''))}
      </div>
    </div>
  </div>
</div>

${
  p.moments?.length
    ? `<section class="section" aria-labelledby="moments-title">
  <div class="container">
    <div class="section-head"><h2 id="moments-title">In the everyday</h2></div>
    <div class="strip">${p.moments.map((m) => `<figure><div class="media">${picture(m.image, { alt: `${p.name}: ${m.title}`, sizes: '(min-width: 900px) 25vw, 70vw' })}</div><figcaption>${esc(m.title)}</figcaption></figure>`).join('')}</div>
  </div>
</section>`
    : ''
}

<section class="section section--sand" aria-labelledby="related-title" data-shelf>
  <div class="container">
    <div class="section-head">
      <div><h2 id="related-title">Discover the range</h2><p>Made to sit alongside ${esc(p.name)}.</p></div>
      <div class="shelf__nav"><button type="button" data-shelf-prev aria-label="Previous products">${icon.arrowLeft}</button><button type="button" data-shelf-next aria-label="Next products">${icon.arrow}</button></div>
    </div>
    <div class="shelf"><div class="shelf__track">${related.map((x) => `<div>${card(x)}</div>`).join('')}</div><div class="shelf__progress" aria-hidden="true"><span></span></div></div>
  </div>
</section>

<div class="sticky-bar" data-sticky aria-hidden="true">
  <div class="sticky-bar__info">
    ${thumb(p.images[0].key) ? `<img src="${thumb(p.images[0].key)}" alt="" width="44" height="55">` : ""}
    <div style="min-width:0"><p class="sticky-bar__name" style="margin:0">${esc(p.name)}</p><p class="sticky-bar__sub" style="margin:0">${buyable ? money(defaultVariant(p).price) : esc(p.statusLabel || 'Coming soon')}</p></div>
  </div>
  ${buyable ? `<button class="btn btn--small" type="button" data-sticky-add tabindex="-1">Add to bag</button>` : `<a class="btn btn--small" href="#notify" tabindex="-1" data-sticky-notify>Notify me</a>`}
</div>`;

  wireGallery(main);
  wireBuy(main, p);
  wireShelf($('[data-shelf]', main));
  wireWaitlists(main);

  // sticky mobile bar: shown once the main action has scrolled out of view
  const bar = $('[data-sticky]', main);
  const target = $('#main-buy, #notify', main);
  document.body.classList.add('has-sticky-bar');
  const sync = () => {
    const r = target.getBoundingClientRect();
    const on = r.bottom < 0;
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', String(!on));
    bar.querySelectorAll('a,button').forEach((el) => (el.tabIndex = on ? 0 : -1));
  };
  window.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('route:change', () => window.removeEventListener('scroll', sync), { once: true });
  sync();
  $('[data-sticky-add]', bar)?.addEventListener('click', () => $('#main-buy [data-add]', main)?.click());
  $('[data-sticky-notify]', bar)?.addEventListener('click', (e) => {
    e.preventDefault();
    target.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    setTimeout(() => $('input[type="email"]', target)?.focus({ preventScroll: true }), 400);
  });
}
