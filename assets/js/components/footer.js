import { site, navigation } from '../../../site.config.js';
import { esc, icon, prov } from '../lib/util.js';
import { waitlistForm } from './waitlist.js';

const socialLinks = () =>
  ['instagram', 'pinterest', 'youtube', 'linkedin']
    .filter((k) => site.social[k])
    .map((k) => `<a href="${esc(site.social[k])}" rel="noopener" target="_blank" aria-label="${k[0].toUpperCase() + k.slice(1)} (opens in a new tab)">${icon[k]}</a>`)
    .join('');

export const renderFooter = () => {
  const mount = document.getElementById('site-footer');
  if (!mount) return;
  const year = new Date().getFullYear();
  const promises = site.servicePromises || [];
  mount.innerHTML = `
${
  promises.length
    ? `<section class="service-band" aria-label="Our promises">
  <div class="container">
    <div class="service-band__grid">
      ${promises.map((s) => `<div class="service">${icon[s.icon] || icon.check}<div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></div>`).join('')}
    </div>
    ${promises.some((s) => s.provisional) ? `<div style="padding-bottom:20px">${prov(true, 'Placeholder promises — confirm before launch', true)}</div>` : ''}
  </div>
</section>`
    : ''
}
<footer class="footer on-dark">
  <div class="container">
    <div class="footer__top">
      <div class="footer__news">
        <h2>Letters from the studio</h2>
        <p>Launch news, early access and the occasional note on scent and skin.</p>
        ${waitlistForm({ dark: true, cta: 'Subscribe', compact: true })}
      </div>
      <nav class="footer__cols" aria-label="Footer">
        ${navigation.footer
          .map(
            (g) => `<div><h3>${esc(g.title)}</h3><ul>${g.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul></div>`
          )
          .join('')}
      </nav>
    </div>
    <div class="footer__bottom">
      <span>© ${year} ${esc(site.brand.legalName || site.brand.name)}. All rights reserved.${site.contact.email ? ` · <a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a>` : ''}</span>
      ${socialLinks() ? `<div class="footer__social">${socialLinks()}</div>` : ''}
      <span>Prices in ₹, inclusive of all taxes.</span>
    </div>
  </div>
  <p class="footer__mark" aria-hidden="true" data-mark="${esc(site.brand.wordmark)}"></p>
</footer>`;
};
