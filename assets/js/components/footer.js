import { site, navigation } from '../../../site.config.js';
import { wordmarkSvg } from '../data/brand.js';
import { esc, icon } from '../lib/util.js';

/** Compact footer: brand line, link columns, contact (only confirmed details), social. */
export const renderFooter = () => {
  const mount = document.getElementById('site-footer');
  const c = site.contact;
  const co = site.company;
  const social = Object.entries(site.social).filter(([, v]) => v);
  const contactLinks = [
    { label: 'Contact us', href: 'contact.html' },
    c.email && { label: c.email, href: `mailto:${c.email}` },
    c.phone && { label: c.phone, href: `tel:${c.phone.replace(/\s/g, '')}` },
  ].filter(Boolean);
  mount.innerHTML = `
<footer class="site-footer on-dark">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="wordmark" href="index.html">${wordmarkSvg}<span class="visually-hidden">${esc(site.brand.name)} — home</span></a>
        <p>${esc(site.brand.description)}</p>
        ${social.length ? `<div class="footer-social">${social.map(([k, v]) => `<a class="icon-btn" href="${esc(v)}" target="_blank" rel="noopener" aria-label="${esc(k)}">${icon[k] || ''}</a>`).join('')}</div>` : ''}
      </div>
      <div class="footer-cols">
        ${navigation.footer
          .map((col) => `<div><h2>${esc(col.title)}</h2><ul>${col.links.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul></div>`)
          .join('')}
        <div><h2>Help</h2><ul>${contactLinks.map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`).join('')}</ul></div>
      </div>
    </div>
    <div class="footer-mark" aria-hidden="true">${wordmarkSvg}</div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} ${esc(co.legalName || co.name)}.${co.gstin ? ` GSTIN ${esc(co.gstin)}.` : ''}</span>
      <span>Prices in ₹, inclusive of all taxes.</span>
    </div>
  </div>
</footer>`;
};
