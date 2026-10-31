import { site, content, collections } from '../../../site.config.js';
import { esc, rich, icon, setTitle, setMeta, $, $$ } from '../lib/util.js';
import { picture, artPicture } from '../lib/images.js';
import { getProduct, productUrl, allItems, collectionItems, collectionUrl, isPurchasable, statusOf, itemUrl } from '../lib/catalog.js';
import { card } from '../components/cards.js';
import { waitlistForm, wireWaitlists } from '../components/waitlist.js';
import { wireShelf, reveal } from '../components/misc.js';
import { hotspots } from '../data/hotspots.js';

const organizationLd = () => {
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.company.legalName || site.company.name,
    brand: { '@type': 'Brand', name: site.brand.name },
    ...(site.company.website ? { url: site.company.website, logo: `${site.company.website.replace(/\/$/, '')}/${site.brand.logoSvg}` } : {}),
    ...(site.contact.email ? { email: site.contact.email } : {}),
  });
  document.head.append(s);
};

/** Interactive notes — rendered only when the perfumer's notes are confirmed. */
export const notesBlock = (p) => {
  const n = p.scent?.notes;
  if (!n) return '';
  const row = (label, list, cls) =>
    list?.length ? `<div class="notes__row"><span>${label}</span><div class="note-chips">${list.map((x) => `<span class="note-chip ${cls}"><i></i>${esc(x)}</span>`).join('')}</div></div>` : '';
  return `<div class="notes">${row('Top', n.top, '')}${row('Heart', n.heart, 'note-chip--heart')}${row('Base', n.base, 'note-chip--base')}</div>`;
};

export default function home(main) {
  setTitle();
  setMeta(site.brand.description);
  organizationLd();
  const h = content.home;
  const p = getProduct('body-mist-no-01');
  const items = allItems();
  const tabs = [{ key: 'all', label: 'All' }, ...collections.map((c) => ({ key: c.handle, label: c.short }))];
  const moments = p.moments || [];

  main.innerHTML = `
<section class="hero" aria-labelledby="hero-title">
  <div class="hero__media">${artPicture({ wide: h.hero.image, tall: h.hero.imageMobile, media: '(min-width: 900px)', alt: h.hero.imageAlt, priority: true })}</div>
  <div class="hero__content">
    <p class="eyebrow" style="margin:0">${esc(h.hero.eyebrow)}</p>
    <h1 class="hero__title" id="hero-title">${rich(h.hero.title)}</h1>
    <p class="hero__text">${esc(h.hero.text)}</p>
    <div class="hero__ctas">
      <a class="btn" href="${esc(h.hero.primary.href)}">${esc(h.hero.primary.label)}</a>
      <a class="link" href="${esc(h.hero.secondary.href)}">${esc(h.hero.secondary.label)} ${icon.arrow}</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="shelf-title" data-shelf>
  <div class="container">
    <div class="section-head">
      <h2 id="shelf-title">${esc(h.shelf.title)}</h2>
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
        <div class="tabs" role="tablist" aria-label="Filter the collection">
          ${tabs.map((t, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${t.key}">${esc(t.label)}</button>`).join('')}
        </div>
        <div class="shelf__nav"><button type="button" data-shelf-prev aria-label="Previous products">${icon.arrowLeft}</button><button type="button" data-shelf-next aria-label="Next products">${icon.arrow}</button></div>
      </div>
    </div>
    <div class="shelf">
      <div class="shelf__track" data-track>${items.map((x) => `<div data-col="${x.item.collection}">${card(x)}</div>`).join('')}</div>
      <div class="shelf__progress" aria-hidden="true"><span></span></div>
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="cat-title">
  <div class="container">
    <div class="section-head"><h2 id="cat-title">${esc(h.categories.title)}</h2></div>
    <div class="cat-grid">
      ${collections
        .map((c) => {
          const it = collectionItems(c.handle);
          const n = it.products.length + it.upcoming.length;
          const live = it.products.some(isPurchasable);
          return `<a class="cat-tile reveal" href="${collectionUrl(c)}">${picture(c.image, { alt: c.imageAlt, sizes: '(min-width: 760px) 32vw, 100vw' })}
            <span class="cat-tile__label"><span><strong>${esc(c.name)}</strong><br><small>${n} products · ${live ? 'Shop now' : it.products.length ? 'Launching soon' : 'In development'}</small></span>${icon.arrow}</span></a>`;
        })
        .join('')}
    </div>
  </div>
</section>

<section class="section" aria-labelledby="intro-title">
  <div class="container intro">
    <div class="media reveal">${picture(h.intro.image, { alt: h.intro.imageAlt, sizes: '(min-width: 900px) 52vw, 100vw' })}</div>
    <div class="reveal">
      <h2 id="intro-title">${rich(h.intro.title)}</h2>
      <div class="intro__lines">${h.intro.lines.map((l) => `<p>${esc(l)}</p>`).join('')}</div>
      <p style="margin-top:28px"><a class="link" href="${esc(h.intro.link.href)}">${esc(h.intro.link.label)} ${icon.arrow}</a></p>
    </div>
  </div>
</section>

<section class="section section--sand" aria-labelledby="exp-title">
  <div class="container exp">
    <div class="exp__stage" data-stage>
      ${moments.map((m, i) => `<div class="exp__slide${i === 0 ? ' is-on' : ''}" data-slide="${i}">${picture(m.image, { alt: `${p.name}: ${m.title}`, sizes: '(min-width: 960px) 56vw, 100vw' })}</div>`).join('')}
    </div>
    <div class="exp__side">
      <p class="eyebrow">${esc(h.experience.eyebrow)}</p>
      <h2 id="exp-title">${rich(h.experience.title)}</h2>
      <div class="moments" role="tablist" aria-label="Moments">
        ${moments.map((m, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-moment="${i}"><span>0${i + 1}</span><span>${esc(m.title)}</span></button>`).join('')}
      </div>
      ${notesBlock(p)}
      <div class="hero__ctas">
        <a class="btn" href="${productUrl(p)}">${isPurchasable(p) ? 'Shop Body Mist' : 'Discover Body Mist'}</a>
        ${isPurchasable(p) ? '' : `<a class="link" href="${productUrl(p)}#notify">Notify me ${icon.arrow}</a>`}
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="range-title">
  <div class="container">
    <div class="section-head"><div><h2 id="range-title">${esc(h.future.title)}</h2><p>${esc(h.future.text)}</p></div></div>
    <div class="range reveal" data-range>
      <div class="range__img">${picture(h.future.image, { alt: h.future.imageAlt, sizes: '(min-width: 1440px) 1344px, 100vw' })}</div>
      ${hotspots
        .map((s, i) => {
          const x = items.find((it) => it.item.handle === s.handle);
          return x ? `<button class="hotspot" type="button" style="left:${s.x}%;top:${s.y}%" aria-expanded="false" aria-controls="hs-pop" data-hotspot="${i}" aria-label="${esc(x.item.name)}"></button>` : '';
        })
        .join('')}
      <div class="hotspot-pop" id="hs-pop" hidden></div>
    </div>
    <ul class="range-list">
      ${items.map((x) => `<li><a href="${itemUrl(x)}"><span>${esc(x.item.name)}</span><span>${esc(statusOf(x.item) || 'Available')}</span></a></li>`).join('')}
    </ul>
  </div>
</section>

<section class="section section--tight" id="early-access" aria-labelledby="ea-title">
  <div class="container">
    <div class="early">
      <div class="early__media">${picture(h.earlyAccess.image, { alt: '', sizes: '(min-width: 900px) 50vw, 100vw' })}</div>
      <div class="early__body">
        <h2 id="ea-title">${esc(h.earlyAccess.title)}</h2>
        <p>${esc(h.earlyAccess.text)}</p>
        ${waitlistForm({ interests: h.earlyAccess.interests, preset: ['Body Mist'], dark: true, cta: 'Sign up' })}
      </div>
    </div>
  </div>
</section>`;

  // collection shelf: tabs filter, arrows scroll
  const shelf = $('[data-shelf]', main);
  const sync = wireShelf(shelf);
  $$('[data-tab]', shelf).forEach((t) =>
    t.addEventListener('click', () => {
      $$('[data-tab]', shelf).forEach((b) => b.setAttribute('aria-selected', String(b === t)));
      $$('[data-col]', shelf).forEach((el) => (el.hidden = t.dataset.tab !== 'all' && el.dataset.col !== t.dataset.tab));
      $('[data-track]', shelf).scrollTo({ left: 0 });
      sync?.();
    }),
  );

  // moments switcher (auto-advances until the visitor chooses)
  const slides = $$('[data-slide]', main);
  const btns = $$('[data-moment]', main);
  let cur = 0;
  let auto;
  const show = (i) => {
    cur = i;
    slides.forEach((s, k) => s.classList.toggle('is-on', k === i));
    btns.forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
  };
  btns.forEach((b, k) =>
    b.addEventListener('click', () => {
      clearInterval(auto);
      show(k);
    }),
  );
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && slides.length > 1) auto = setInterval(() => show((cur + 1) % slides.length), 4200);
  window.addEventListener('route:change', () => clearInterval(auto), { once: true });

  // range hotspots
  const range = $('[data-range]', main);
  const pop = $('#hs-pop', range);
  let openHs = null;
  const closeHs = () => {
    pop.hidden = true;
    openHs?.setAttribute('aria-expanded', 'false');
    openHs = null;
  };
  $$('[data-hotspot]', range).forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (openHs === b) return closeHs();
      closeHs();
      const s = hotspots[Number(b.dataset.hotspot)];
      const x = items.find((it) => it.item.handle === s.handle);
      pop.innerHTML = `<strong>${esc(x.item.name)}</strong><span class="muted">${esc(statusOf(x.item) || 'Available')}</span><br><a href="${itemUrl(x)}">${x.kind === 'product' ? 'View product' : 'See the collection'} →</a>`;
      pop.style.left = `${Math.min(88, Math.max(12, s.x))}%`;
      pop.style.top = `${s.y}%`;
      pop.hidden = false;
      b.setAttribute('aria-expanded', 'true');
      openHs = b;
    }),
  );
  document.addEventListener('click', (e) => !e.target.closest('#hs-pop') && closeHs());
  wireWaitlists(main);
  reveal(main);
}
