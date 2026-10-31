import { site } from '../../../site.config.js';
import { esc, icon, prov, param, setTitle, setMeta, money, $, navigate } from '../lib/util.js';
import { picture, isRender } from '../lib/images.js';
import { getProduct, getUpcoming, getCollection, collectionUrl, defaultVariant, productUrl } from '../lib/catalog.js';
import { recent } from '../lib/cart.js';
import { priceRow, buyBox, wireBuy, pyramid, factRows, benefitsList } from '../components/product-blocks.js';
import { upcomingCard, productCard } from '../components/cards.js';
import { wireGallery } from '../components/misc.js';
import { addToBag } from '../components/bag-drawer.js';
import notFound from './notfound.js';

const acc = (title, body, { open = false, id = '' } = {}) => `
<details class="acc"${open ? ' open' : ''}${id ? ` id="${id}"` : ''}>
  <summary>${title}<span class="plus" aria-hidden="true"></span></summary>
  <div class="acc__body">${body}</div>
</details>`;

const gallery = (p) => `
<div class="gallery" aria-roledescription="carousel" aria-label="${esc(p.name)} images">
  <ul class="gallery__thumbs" aria-label="Choose image">
    ${p.images.map((im, i) => `<li><button type="button" aria-label="Show image ${i + 1} of ${p.images.length}" aria-current="${i === 0}">${picture(im.key, { alt: '', sizes: '76px' })}</button></li>`).join('')}
  </ul>
  <div class="gallery__main">
    <div class="gallery__track" tabindex="0" aria-label="Image carousel — use arrow keys to browse">
      ${p.images
        .map(
          (im, i) => `<div class="gallery__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${p.images.length}">${picture(im.key, {
            alt: im.alt,
            sizes: '(min-width: 1000px) 52vw, 100vw',
            priority: i === 0,
          })}</div>`
        )
        .join('')}
    </div>
    <button class="gallery__nav gallery__nav--prev" type="button" aria-label="Previous image">${icon.arrowLeft}</button>
    <button class="gallery__nav gallery__nav--next" type="button" aria-label="Next image">${icon.arrow}</button>
    ${p.imageDisclaimer && p.images.some((i) => isRender(i.key)) ? `<span class="caption">${esc(p.imageDisclaimer)}</span>` : ''}
  </div>
  <div class="gallery__dots">${p.images.map((_, i) => `<button type="button" aria-label="Show image ${i + 1}" aria-current="${i === 0}"></button>`).join('')}</div>
</div>`;

/** Legal Metrology declarations; marketer and customer care default to the company and contact settings. */
const productInfo = (p) => {
  const co = site.company;
  const info = { ...(p.productInformation || {}) };
  if (!info['Marketed by'] && (co.legalName || co.name)) info['Marketed by'] = [co.legalName || co.name, co.registeredAddress].filter(Boolean).join(', ') + (co.registeredAddress ? '' : ' (registered address to be added)');
  if (!info['Customer care'] && site.contact.email) info['Customer care'] = [site.contact.email, site.contact.phone].filter(Boolean).join(' · ');
  return info;
};

const infoTable = (p) => `
<dl class="info-table">
  ${Object.entries(productInfo(p))
    .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${v ? esc(v) : '<span class="pending">To be added before launch</span>'}</dd></div>`)
    .join('')}
</dl>`;

export default function product(main) {
  const p = getProduct(param('p') || '');
  if (!p) {
    // an upcoming item linked as a product? send to its preview
    const u = getUpcoming(param('p') || '');
    if (u) {
      navigate(`${collectionUrl(u.collection)}#${u.handle}`, { replace: true });
      return;
    }
    return notFound(main);
  }
  const v = defaultVariant(p);
  const col = getCollection(p.collection);
  setTitle(`${p.name}${p.scentName ? ` — ${p.scentName}` : ''}`);
  setMeta(p.shortDescription);
  recent.add(p.handle);

  const pairs = (p.pairsWith || []).map(getUpcoming).filter(Boolean);
  const viewed = recent.list(p.handle).map(getProduct).filter(Boolean);

  main.innerHTML = `
<div class="container">
  <nav class="crumbs" aria-label="Breadcrumb"><ol>
    <li><a href="index.html">Home</a></li>
    ${col ? `<li><a href="${collectionUrl(col)}">${esc(col.name)}</a></li>` : ''}
    <li aria-current="page">${esc(p.name)}</li>
  </ol></nav>

  <div class="pdp">
    ${gallery(p)}
    <div class="pdp__info buybox" data-product-scope>
      <p class="eyebrow">${esc(p.family || col?.name || '')} ${prov(p.provisional?.scent, 'Placeholder scent')}</p>
      <h1 class="buybox__title">${esc(p.name)}</h1>
      ${p.scentName ? `<p class="buybox__scent">${esc(p.scentName)} — ${esc(p.scentDescriptor)}</p>` : ''}
      ${priceRow(p, v)}
      <p class="muted">${esc(p.shortDescription)}</p>
      <div id="main-buy">${buyBox(p, { idPrefix: 'pdp' })}</div>
      ${factRows(p)}
      ${site.shipping.flatRate && site.shipping.freeAbove ? `<p class="small muted">Free delivery on orders over ${money(site.shipping.freeAbove)}.</p>` : ''}
    </div>
  </div>
</div>

<section class="section section--limewash" aria-labelledby="notes-title">
  <div class="container scent">
    <div class="media scent__media reveal">${picture('mist', { alt: 'A fine mist leaving the bottle in warm, patterned light', sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
    <div>
      <p class="eyebrow">The composition</p>
      <h2 class="t-xl" id="notes-title">How it <em>unfolds</em></h2>
      ${prov(p.provisional?.notes, 'Placeholder notes — final composition to be confirmed', true, 'margin-top:24px')}
      ${pyramid(p)}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="details-title">
  <div class="container details">
    <div class="media details__media reveal">${picture('ritual_ledge', { alt: 'The bottle on a travertine ledge beside folded linen in patterned sunlight', sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
    <div>
      <p class="eyebrow">The details</p>
      <h2 class="t-xl" id="details-title" style="margin-bottom:32px">Everything you <em>should know</em></h2>
      <div class="accordion">
        ${acc(`Description ${prov(p.provisional?.description)}`, p.description.map((t) => `<p>${esc(t)}</p>`).join(''), { open: true })}
        ${acc(`Key features ${prov(p.provisional?.benefits)}`, benefitsList(p))}
        ${acc(
          `Ingredients ${prov(p.provisional?.ingredients)}`,
          `${p.ingredients ? `<p>${esc(p.ingredients)}</p>` : '<p><em>The full ingredient list (INCI) will be published here from the final, approved formulation.</em></p>'}<p class="small">${esc(p.ingredientsNote || '')}</p>`,
          { id: 'ingredients' }
        )}
        ${acc(`How to use ${prov(p.provisional?.howToUse)}`, `<ol>${(p.howToUse || []).map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`)}
        ${acc(`Product information ${prov(p.provisional?.information)}`, infoTable(p))}
        ${acc('Delivery & returns', `<p>Delivery options, timelines and our returns policy will be confirmed before launch. <a class="text-link" href="shipping-returns.html">Shipping & returns</a>.</p>`)}
      </div>
    </div>
  </div>
</section>

<section class="section section--limewash" aria-labelledby="faq-title">
  <div class="container container--narrow">
    <p class="eyebrow">Questions</p>
    <h2 class="t-xl" id="faq-title" style="margin-bottom:32px">Asked, <em>answered.</em></h2>
    <div class="accordion">
      ${(p.faqs || []).map((f) => `<details class="acc acc--faq"><summary>${esc(f.q)}<span class="plus" aria-hidden="true"></span></summary><div class="acc__body"><p>${esc(f.a)}</p></div></details>`).join('')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="reviews-title" id="reviews">
  <div class="container container--narrow">
    <h2 class="visually-hidden" id="reviews-title">Reviews</h2>
    ${
      p.reviews?.length
        ? '' /* render real reviews here, or mount a reviews app widget */
        : `<div class="reviews-empty">
        <p class="eyebrow eyebrow--plain">Reviews</p>
        <p class="display">No reviews yet.</p>
        <p>${esc(p.name)} is new. Reviews from verified customers will appear here after launch — we will never publish invented or incentivised-without-disclosure reviews.</p>
      </div>`
    }
  </div>
</section>

${
  pairs.length
    ? `<section class="section section--limewash" aria-labelledby="pairs-title">
  <div class="container">
    <div class="section-head section-head--split">
      <div><p class="eyebrow">Complete the ritual</p><h2 class="t-xl" id="pairs-title">Made to sit <em>alongside it.</em></h2></div>
      <p class="lede">The body care that follows Nº 01 is in development. Join the list on any item to hear first.</p>
    </div>
    <div class="card-row">${pairs.map((u) => upcomingCard(u)).join('')}</div>
  </div>
</section>`
    : ''
}

${
  viewed.length
    ? `<section class="section" aria-labelledby="recent-title"><div class="container">
  <h2 class="t-lg" id="recent-title" style="margin-bottom:32px">Recently viewed</h2>
  <div class="card-row">${viewed.map((x) => productCard(x)).join('')}</div>
</div></section>`
    : ''
}

<div class="sticky-bar" id="sticky-bar" aria-hidden="true">
  <div class="sticky-bar__inner">
    <div class="sticky-bar__media">${picture(p.images[0].key, { alt: '', sizes: '44px' })}</div>
    <div class="sticky-bar__text"><span class="sticky-bar__name">${esc(p.name)}</span><span class="sticky-bar__price" data-sticky-price>${money(v.price)} · ${esc(v.size)}</span></div>
    <button class="btn" type="button" data-sticky-add tabindex="-1" ${p.available ? '' : 'disabled'}>Add to bag <span class="price-sep">—</span> <span data-sticky-btn-price>${money(v.price)}</span></button>
  </div>
</div>`;

  wireBuy(main, p);
  wireGallery(main);
  wireSticky(main, p);
  jsonLd(p, v);
}

/** Show the sticky purchase bar once the main add-to-bag button scrolls out of view. */
const wireSticky = (main, p) => {
  const bar = $('#sticky-bar', main);
  const target = $('#main-buy [data-add]', main);
  const footer = document.getElementById('site-footer');
  if (!bar || !target) return;
  let variant = defaultVariant(p);
  let raf = 0;
  // A scroll check (not IntersectionObserver) so fast flings and anchor jumps
  // that skip straight past the button are still caught.
  const compact = window.matchMedia('(max-width: 999px)');
  const sync = () => {
    raf = 0;
    const r = target.getBoundingClientRect();
    // phones/tablets: show whenever the main button is off-screen (it starts below the fold);
    // desktop: only once the visitor has scrolled past it
    const offscreen = compact.matches ? r.bottom < 0 || r.top > window.innerHeight : r.bottom < 0;
    const nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
    const on = offscreen && !nearFooter;
    if (on === bar.classList.contains('is-on')) return;
    bar.classList.toggle('is-on', on);
    bar.setAttribute('aria-hidden', String(!on));
    bar.querySelector('[data-sticky-add]').tabIndex = on ? 0 : -1;
    document.body.classList.toggle('has-sticky-bar', on);
  };
  const schedule = () => raf || (raf = requestAnimationFrame(sync));
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  sync();
  window.addEventListener('variant:change', (e) => {
    if (e.detail.handle !== p.handle) return;
    variant = e.detail.variant;
    $('[data-sticky-price]', bar).textContent = `${money(variant.price)} · ${variant.size}`;
    $('[data-sticky-btn-price]', bar).textContent = money(variant.price);
  });
  $('[data-sticky-add]', bar).addEventListener('click', (e) => addToBag(p, variant, 1, e.currentTarget));
};

/** Structured data for search engines (price shown only as offered). */
const jsonLd = (p, v) => {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.shortDescription,
    brand: { '@type': 'Brand', name: site.brand.name },
    manufacturer: { '@type': 'Organization', name: site.company.legalName || site.company.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: site.locale.currency,
      price: v.price,
      availability: v.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: location.href,
      seller: { '@type': 'Organization', name: site.company.legalName || site.company.name },
    },
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(data);
  document.head.append(s);
};
