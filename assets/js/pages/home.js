import { site, content } from '../../../site.config.js';
import { esc, rich, icon, prov, money, setTitle, setMeta } from '../lib/util.js';
import { picture, artPicture, isRender } from '../lib/images.js';
import { getProduct, productUrl, defaultVariant } from '../lib/catalog.js';
import { tile } from '../components/cards.js';
import { priceRow, buyBox, wireBuy, pyramid, factRows, benefitsList } from '../components/product-blocks.js';
import { waitlistForm, wireWaitlists } from '../components/waitlist.js';

const statement = (s) =>
  esc(s).replace(/\[img:([a-z0-9_]+)\]/g, (_, key) => `<span class="pill" aria-hidden="true">${picture(key, { alt: '', sizes: '160px' })}</span>`);

export default function home(main) {
  const h = content.home;
  const p = getProduct('body-mist-no-01');
  const v = defaultVariant(p);
  setTitle('');
  setMeta(site.brand.description);

  const heroRender = p.imageDisclaimer && (isRender(h.hero.image) || isRender(h.hero.imageMobile));
  main.innerHTML = `
<section class="hero" aria-labelledby="hero-title">
  <div class="hero__media">${artPicture({ wide: h.hero.image, tall: h.hero.imageMobile, alt: h.hero.imageAlt, priority: true })}
    ${heroRender ? `<span class="caption hero__caption">${esc(p.imageDisclaimer)}</span>` : ''}</div>
  <div class="hero__content">
    <p class="eyebrow">${esc(h.hero.eyebrow)}</p>
    <h1 class="hero__title" id="hero-title">${rich(h.hero.title)}</h1>
    <p class="hero__text">${esc(h.hero.text)}</p>
    <div class="hero__ctas">
      <a class="btn" href="${esc(h.hero.primary.href)}">${esc(h.hero.primary.label)}</a>
      <a class="link" href="${esc(h.hero.secondary.href)}">${esc(h.hero.secondary.label)} ${icon.arrow}</a>
    </div>
  </div>
  <div class="hero__meta" aria-hidden="true"><span>Nº 01 — ${esc(p.scentName || '')}</span>${heroRender ? `<span>${esc(p.imageDisclaimer)}</span>` : ''}</div>
</section>

<section class="section" aria-labelledby="intro-title">
  <div class="container">
    <p class="eyebrow" style="display:flex;justify-content:center">${esc(h.intro.eyebrow)}</p>
    <h2 class="statement reveal" id="intro-title">${statement(h.intro.statement)}</h2>
    <div class="intro-foot reveal">
      <p>${esc(h.intro.text)} ${prov(true, 'Commitments to confirm')}</p>
      <a class="link" href="${esc(h.intro.link.href)}">${esc(h.intro.link.label)} ${icon.arrow}</a>
    </div>
  </div>
</section>

<section class="section section--limewash" aria-labelledby="featured-title" id="featured">
  <div class="container feature">
    <div class="feature__gallery reveal">
      <a class="media" href="${productUrl(p)}" aria-label="View ${esc(p.name)}">${picture(p.images[1].key, { alt: p.images[1].alt, sizes: '(min-width: 900px) 30vw, 100vw' })}${p.imageDisclaimer && isRender(p.images[1].key) ? `<span class="caption">Concept render</span>` : ''}</a>
      <div class="media">${picture(p.images[0].key, { alt: p.images[0].alt, sizes: '(min-width: 900px) 25vw, 50vw' })}</div>
      <div class="media">${picture(p.images[3].key, { alt: p.images[3].alt, sizes: '(min-width: 900px) 25vw, 50vw' })}</div>
    </div>
    <div class="feature__info buybox" data-product-scope>
      <p class="eyebrow">${esc(h.featured.eyebrow)} ${prov(p.provisional?.scent, 'Placeholder scent')}</p>
      <h2 class="buybox__title" id="featured-title">${esc(p.name)}</h2>
      <p class="buybox__scent">${esc(p.scentName)} — ${esc(p.scentDescriptor)}</p>
      ${priceRow(p, v)}
      <p class="muted">${esc(p.shortDescription)}</p>
      ${factRows(p)}
      ${benefitsList(p)}
      ${prov(p.provisional?.benefits, 'Placeholder benefits — substantiate before launch', true)}
      ${buyBox(p, { idPrefix: 'feat', showServiceNotes: false })}
      <a class="link" href="${productUrl(p)}">Full details, notes & ingredients ${icon.arrow}</a>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="scent-title">
  <div class="container scent">
    <div class="media scent__media reveal">${picture(h.scent.image, { alt: h.scent.imageAlt, sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
    <div>
      <p class="eyebrow">${esc(h.scent.eyebrow)}</p>
      <h2 class="t-xl" id="scent-title">${rich(h.scent.title)}</h2>
      <p class="lede" style="margin-top:20px">${esc(h.scent.text)}</p>
      ${prov(p.provisional?.notes, 'Placeholder notes — final composition to be confirmed', true, 'margin-top:24px')}
      ${pyramid(p)}
    </div>
  </div>
</section>

<section class="section section--limewash" aria-labelledby="ritual-title">
  <div class="container">
    <div class="section-head section-head--split">
      <div><p class="eyebrow">${esc(h.ritual.eyebrow)}</p><h2 class="t-xl" id="ritual-title">${rich(h.ritual.title)}</h2></div>
      <p class="lede">${prov(p.provisional?.howToUse, 'Usage guidance to confirm')} A body mist is made to be returned to. These are the moments we designed it for.</p>
    </div>
    <ol class="ritual" style="list-style:none;margin:0;padding:0">
      ${h.ritual.steps
        .map(
          (s, i) => `<li class="step reveal reveal-d${i % 3}">
          <div class="media">${picture(s.image, { alt: '', sizes: '(min-width: 900px) 23vw, 78vw' })}</div>
          <span class="step__n">0${i + 1}</span>
          <h3 class="step__t">${esc(s.title)}</h3>
          <p class="step__p">${esc(s.text)}</p>
        </li>`
        )
        .join('')}
    </ol>
  </div>
</section>

<section class="section" aria-labelledby="future-title">
  <div class="container">
    <div class="section-head section-head--split">
      <div><p class="eyebrow">${esc(h.future.eyebrow)}</p><h2 class="t-xl" id="future-title">${rich(h.future.title)}</h2></div>
      <p class="lede">${esc(h.future.text)}</p>
    </div>
    <div class="future-grid">${h.future.tiles.map((t) => tile(t)).join('')}</div>
  </div>
</section>

<section class="section section--limewash" aria-labelledby="philo-title">
  <div class="container philo">
    <div class="media philo__media reveal">${picture(h.philosophy.image, { alt: h.philosophy.imageAlt, sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
    <div>
      <p class="eyebrow">${esc(h.philosophy.eyebrow)}</p>
      <h2 class="t-xl" id="philo-title">${rich(h.philosophy.title)}</h2>
      ${prov(true, 'Commitments to confirm', true, 'margin-top:20px')}
      <div class="pillars">
        ${h.philosophy.pillars
          .map((x, i) => `<div class="pillar reveal reveal-d${i % 2}"><span class="pillar__n">0${i + 1}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`)
          .join('')}
      </div>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="early-title" id="early-access">
  <div class="container early">
    <div>
      <p class="eyebrow">${esc(h.earlyAccess.eyebrow)}</p>
      <h2 class="t-xl" id="early-title">${rich(h.earlyAccess.title)}</h2>
      <p class="lede" style="margin-top:20px">${esc(h.earlyAccess.text)}</p>
      ${waitlistForm({ interests: h.earlyAccess.interests, cta: 'Join the list' })}
    </div>
    <div class="media early__media reveal">${picture(h.earlyAccess.image, { alt: 'Sunlight falling through a carved jaali screen onto a limewash wall', sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
  </div>
</section>

<section class="section section--tight section--limewash" aria-labelledby="social-title">
  <div class="container">
    <div class="section-head section-head--split" style="margin-bottom:32px">
      <div><p class="eyebrow">${esc(h.social.eyebrow)}</p><h2 class="t-lg" id="social-title">${esc(h.social.title)}</h2></div>
      <p class="lede" style="justify-self:end">${
        site.social.instagram && site.social.handle
          ? `<a class="link" href="${esc(site.social.instagram)}" target="_blank" rel="noopener">Follow ${esc(site.social.handle)} ${icon.arrow}</a>`
          : '<span class="small muted">Our social channels will open at launch.</span>'
      }</p>
    </div>
    <div class="social-grid">
      ${h.social.images.map((k) => `<div class="media reveal">${picture(k, { alt: '', sizes: '(min-width: 900px) 16vw, 33vw' })}</div>`).join('')}
    </div>
  </div>
</section>`;

  wireBuy(main, p);
  wireWaitlists(main);
  organizationLd();
}

/** Structured data: GentleCare as the organisation behind the Rūh brand. */
const organizationLd = () => {
  if (document.getElementById('ld-org')) return;
  const co = site.company;
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.id = 'ld-org';
  s.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: co.legalName || co.name,
    ...(co.website ? { url: co.website } : {}),
    brand: { '@type': 'Brand', name: site.brand.name, slogan: site.brand.tagline },
    ...(site.contact.email ? { contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: site.contact.email, areaServed: 'IN' } } : {}),
  });
  document.head.append(s);
};
