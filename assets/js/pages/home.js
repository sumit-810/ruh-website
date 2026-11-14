import { site, content, collections } from '../../../site.config.js';
import { esc, rich, icon, setTitle, setMeta, $, $$ } from '../lib/util.js';
import { picture, artPicture } from '../lib/images.js';
import { getProduct, getCollection, productUrl, allItems, collectionItems, collectionUrl, isPurchasable, statusOf, itemUrl } from '../lib/catalog.js';
import { card } from '../components/cards.js';
import { waitlistForm, wireWaitlists } from '../components/waitlist.js';
import { wireShelf, reveal } from '../components/misc.js';
import { motionToggle } from '../lib/motion.js';
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
  const sep = '  ·  ';
  const curveText = `${[...collections.map((c) => c.short), statusOf(p) || 'Gentle Company'].join(sep)}${sep}`;

  main.innerHTML = `
<section class="hero" aria-labelledby="hero-title">
  <div class="hero__media loop" data-loop="${esc(h.hero.image)}" data-loop-tall="${esc(h.hero.imageMobile)}" data-loop-media="(min-width: 900px)">${artPicture({ wide: h.hero.image, tall: h.hero.imageMobile, media: '(min-width: 900px)', alt: h.hero.imageAlt, priority: true })}${motionToggle({ className: 'hero__toggle' })}</div>
  <div class="hero__content">
    <p class="eyebrow" style="margin:0">${esc(h.hero.eyebrow)}</p>
    <h1 class="hero__title" id="hero-title" data-blur-text>${rich(h.hero.title)}</h1>
    <p class="hero__text">${esc(h.hero.text)}</p>
    <div class="hero__ctas">
      <a class="btn" data-magnet href="${esc(h.hero.primary.href)}">${esc(h.hero.primary.label)}</a>
      <a class="link" href="${esc(h.hero.secondary.href)}">${esc(h.hero.secondary.label)} ${icon.arrow}</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="shelf-title" data-shelf>
  <div class="container">
    <div class="section-head">
      <h2 id="shelf-title" data-blur-text>${esc(h.shelf.title)}</h2>
      <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
        <div class="tabs" role="tablist" aria-label="Filter the collection">
          ${tabs.map((t, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${t.key}">${esc(t.label)}</button>`).join('')}
        </div>
        <div class="shelf__nav"><button type="button" data-shelf-prev aria-label="Previous products">${icon.arrowLeft}</button><button type="button" data-shelf-next aria-label="Next products">${icon.arrow}</button></div>
      </div>
    </div>
    <div class="shelf">
      <div class="shelf__track" data-track>${items.map((x) => `<div data-col="${x.item.collection}">${card(x)}</div>`).join('')}</div>
      <div class="shelf__edge" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <div class="shelf__progress" aria-hidden="true"><span></span></div>
    </div>
  </div>
</section>

<section class="section section--tight" aria-labelledby="cat-title">
  <div class="container">
    <div class="section-head"><h2 id="cat-title" data-blur-text>${esc(h.categories.title)}</h2>${motionToggle()}</div>
    <div class="panels">
      ${collections
        .map((c, i) => {
          const it = collectionItems(c.handle);
          const n = it.products.length + it.upcoming.length;
          const live = it.products.some(isPurchasable);
          return `<a class="panel reveal" href="${collectionUrl(c)}" data-tone="${esc(c.tone)}" style="--i:${i}">
            <span class="panel__media loop" data-loop="${esc(c.image)}">${picture(c.image, { alt: c.imageAlt, sizes: '(min-width: 900px) 50vw, 100vw' })}</span>
            <span class="panel__label" aria-hidden="true">${esc(c.short)}</span>
            <span class="panel__info"><span><strong>${esc(c.name)}</strong><small>${n} products · ${live ? 'Shop now' : it.products.length ? 'Launching soon' : 'In development'}</small></span><span class="panel__go">${icon.arrow}</span></span>
          </a>`;
        })
        .join('')}
    </div>
  </div>
</section>

<section class="section statement" aria-labelledby="intro-title">
  <div class="container statement__grid">
    <div class="statement__media media reveal">${picture(h.intro.image, { alt: h.intro.imageAlt, sizes: '(min-width: 900px) 44vw, 100vw' })}</div>
    <div class="statement__body">
      <h2 id="intro-title" data-blur-text>${rich(h.intro.title)}</h2>
      <p class="statement__text" data-scroll-reveal>${h.intro.lines.map(esc).join(' ')}</p>
      <p style="margin-top:28px"><a class="link" href="${esc(h.intro.link.href)}">${esc(h.intro.link.label)} ${icon.arrow}</a></p>
    </div>
  </div>
</section>

<section class="section section--sand exp-section" aria-labelledby="exp-title">
  <div class="container exp">
    <div class="exp__side">
      <p class="eyebrow">${esc(h.experience.eyebrow)}</p>
      <h2 id="exp-title" data-blur-text>${rich(h.experience.title)}</h2>
      <ol class="exp__index" aria-label="Moments">
        ${moments.map((m, i) => `<li${i === 0 ? ' class="is-on"' : ''}><span>0${i + 1}</span>${esc(m.title)}</li>`).join('')}
      </ol>
      ${notesBlock(p)}
      <div class="hero__ctas">
        <a class="btn" href="${productUrl(p)}">${isPurchasable(p) ? 'Shop Body Mist' : 'Discover Body Mist'}</a>
        ${isPurchasable(p) ? '' : `<a class="link" href="${productUrl(p)}#notify">Notify me ${icon.arrow}</a>`}
      </div>
    </div>
    <div class="exp__stack" data-stack>
      ${moments
        .map(
          (m, i) => `<figure class="exp__card" data-stack-card data-moment-card="${i}">
        <div class="media">${picture(m.image, { alt: `${p.name}: ${m.title}`, sizes: '(min-width: 960px) 52vw, 100vw' })}</div>
        <figcaption><span>0${i + 1}</span>${esc(m.title)}</figcaption>
      </figure>`,
        )
        .join('')}
    </div>
  </div>
</section>

<div class="curve" aria-hidden="true">
  <svg class="curve__svg" viewBox="0 0 1440 150" data-curved-loop focusable="false">
    <path id="curve-path" d="M-40 36 Q 720 168 1480 36" fill="none"></path>
    <text class="curve__text"><textPath href="#curve-path" startOffset="0">${esc(curveText)}</textPath></text>
    <text class="curve__text" visibility="hidden"><tspan data-unit>${esc(curveText)}</tspan></text>
  </svg>
</div>

<section class="section" aria-labelledby="range-title">
  <div class="container">
    <div class="section-head">
      <div><h2 id="range-title" data-blur-text>${esc(h.future.title)}</h2><p>${esc(h.future.text)}</p></div>
      <div class="range-filter" role="group" aria-label="Show part of the range">
        ${tabs.map((t, i) => `<button type="button" class="pill" aria-pressed="${i === 0}" data-range-filter="${t.key}">${esc(t.label)} <span class="pill__n">${t.key === 'all' ? items.length : items.filter((x) => x.item.collection === t.key).length}</span></button>`).join('')}
      </div>
    </div>
    <div class="range reveal" data-range>
      <div class="range__img">${picture(h.future.image, { alt: h.future.imageAlt, sizes: '(min-width: 1440px) 1344px, 100vw' })}</div>
      ${hotspots
        .map((s, i) => {
          const x = items.find((it) => it.item.handle === s.handle);
          return x ? `<button class="hotspot" type="button" style="left:${s.x}%;top:${s.y}%" aria-expanded="false" aria-controls="hs-pop" data-hotspot="${i}" data-col="${x.item.collection}" aria-label="${esc(x.item.name)}"></button>` : '';
        })
        .join('')}
      <div class="hotspot-pop" id="hs-pop" hidden></div>
    </div>
    <ul class="range-chips" data-range-chips>
      ${items
        .map((x) => {
          const st = statusOf(x.item) || 'Available';
          return `<li data-col="${x.item.collection}"><a class="range-chip" href="${itemUrl(x)}" data-tone="${esc(getCollection(x.item.collection)?.tone || '')}"><i aria-hidden="true"></i><span>${esc(x.item.name)}</span><small>${esc(st)}</small></a></li>`;
        })
        .join('')}
    </ul>
  </div>
</section>

<section class="section section--tight" id="early-access" aria-labelledby="ea-title">
  <div class="container">
    <div class="early">
      <div class="early__media">${picture(h.earlyAccess.image, { alt: h.earlyAccess.imageAlt || '', sizes: '(min-width: 900px) 50vw, 100vw' })}</div>
      <div class="early__body field" data-grain-field>
        <div class="early__inner">
          <h2 id="ea-title" data-blur-text>${esc(h.earlyAccess.title)}</h2>
          <p>${esc(h.earlyAccess.text)}</p>
          ${waitlistForm({ interests: h.earlyAccess.interests, preset: ['Body Mist'], dark: true, cta: 'Sign up' })}
        </div>
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

  // range: line filter (chips + hotspots) and hotspot popovers
  const range = $('[data-range]', main);
  const pop = $('#hs-pop', range);
  let openHs = null;
  const closeHs = () => {
    pop.hidden = true;
    openHs?.setAttribute('aria-expanded', 'false');
    openHs = null;
  };
  $$('[data-range-filter]', main).forEach((b) =>
    b.addEventListener('click', () => {
      const key = b.dataset.rangeFilter;
      $$('[data-range-filter]', main).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $$('[data-range-chips] [data-col]', main).forEach((li) => (li.hidden = key !== 'all' && li.dataset.col !== key));
      $$('[data-hotspot]', range).forEach((hs) => hs.classList.toggle('is-dim', key !== 'all' && hs.dataset.col !== key));
      closeHs();
    }),
  );
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
  const outside = (e) => !e.target.closest('#hs-pop') && closeHs();
  document.addEventListener('click', outside);
  window.addEventListener('route:change', () => document.removeEventListener('click', outside), { once: true });

  // moments: the index follows the card on top of the stack
  const index = $$('.exp__index li', main);
  $('[data-stack]', main)?.addEventListener('stack:active', (e) => index.forEach((li, i) => li.classList.toggle('is-on', i === e.detail.index)));

  // early access: a gentle pull on the sign-up button
  $('#early-access button[type="submit"]', main)?.setAttribute('data-magnet', '');

  wireWaitlists(main);
  reveal(main);
}
