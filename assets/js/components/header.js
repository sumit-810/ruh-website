import { site, navigation, collections } from '../../../site.config.js';
import { wordmarkSvg } from '../data/brand.js';
import { esc, icon, $, $$, route } from '../lib/util.js';
import { allItems, itemUrl, statusOf, getCollection, collectionUrl } from '../lib/catalog.js';
import { picture } from '../lib/images.js';
import { bag } from '../lib/cart.js';
import { makeOverlay } from './overlay.js';

/**
 * Header: navigation left, GENTLE COMPANY wordmark centred, search (and the
 * bag, only when the shop is open) on the right. Mega panels show products as
 * images, not lists. On mobile, a drawer opens with image tiles first.
 */
let overlayOn = false;

const wordmark = () => `${wordmarkSvg}<span class="visually-hidden">${esc(site.brand.name)} — home</span>`;

const announceBar = () => {
  const a = (site.announcements || [])[0];
  if (!a) return '';
  return `<div class="announce" role="region" aria-label="Announcement">${a.href ? `<a href="${esc(a.href)}">${esc(a.text)}</a>` : esc(a.text)}</div>`;
};

const megaItem = (x) => {
  const key = x.kind === 'product' ? x.item.images[0]?.key : x.item.image;
  const status = statusOf(x.item);
  return `<a class="mega-item" href="${itemUrl(x)}">
    <span class="media">${picture(key, { alt: '', sizes: '160px' })}</span>
    <span class="mega-item__name">${esc(x.item.name)}</span>
    ${status ? `<span class="mega-item__status">${esc(status)}</span>` : ''}
  </a>`;
};

const megaPanel = (key, idx) => {
  const col = key === 'all' ? null : getCollection(key);
  const items = allItems(col ? col.handle : null).slice(0, 6);
  return `<div class="mega" id="mega-${idx}" data-mega>
    <div class="container mega__grid">
      <div class="mega__intro">
        <h2>${esc(col ? col.name : 'Shop')}</h2>
        <p>${esc(col ? col.intro : 'Body Mist Nº 01 and the range that follows.')}</p>
        <a class="link" href="${col ? collectionUrl(col) : 'shop.html'}">${col ? `All ${esc(col.short.toLowerCase())} care` : 'Shop all'} ${icon.arrow}</a>
      </div>
      <div class="mega__row">${items.map(megaItem).join('')}</div>
    </div>
  </div>`;
};

const mobileMenu = () => `
<aside class="drawer drawer--left" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1" hidden>
  <div class="drawer__head">
    <a class="wordmark" href="index.html">${wordmark()}</a>
    <button class="icon-btn" type="button" data-close aria-label="Close menu">${icon.close}</button>
  </div>
  <div class="drawer__body">
    <div class="mnav-tiles">
      <a class="mnav-tile mnav-tile--wide" href="product.html?p=body-mist-no-01">${picture('hero_wide', { alt: '', sizes: '440px' })}<span>Body Mist Nº 01</span></a>
      ${collections.map((c) => `<a class="mnav-tile" href="${collectionUrl(c)}">${picture(c.image, { alt: '', sizes: '200px' })}<span>${esc(c.name)}</span></a>`).join('')}
      <a class="mnav-tile" href="shop.html">${picture('lineup', { alt: '', sizes: '200px' })}<span>Shop all</span></a>
    </div>
    <ul class="mnav">
      <li><a href="story.html">Our Story ${icon.arrow}</a></li>
      <li><a href="journal.html">Journal ${icon.arrow}</a></li>
      <li><a href="contact.html">Contact ${icon.arrow}</a></li>
    </ul>
    <div class="mnav-foot"><a href="faq.html">FAQs</a></div>
  </div>
</aside>`;

export const renderHeader = ({ overlay = false } = {}) => {
  overlayOn = overlay;
  const mount = document.getElementById('site-header');
  const nav = navigation.primary;
  const shop = site.commerce.enabled;
  mount.innerHTML = `
${announceBar()}
<header class="site-header${overlay ? ' site-header--overlay' : ''}" id="header">
  <div class="container header-bar">
    <div class="header-left">
      <button class="icon-btn menu-btn" type="button" aria-label="Menu" aria-controls="mobile-menu" aria-expanded="false" data-open-menu>${icon.menu}</button>
      <nav class="nav-primary" aria-label="Main">
        <ul>
          ${nav
            .map((n, i) =>
              n.mega
                ? `<li><a href="${esc(n.href)}" data-mega-trigger="mega-${i}" aria-expanded="false" aria-controls="mega-${i}"${route.file === n.href ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`
                : `<li><a href="${esc(n.href)}"${route.file === n.href ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`,
            )
            .join('')}
        </ul>
      </nav>
    </div>
    <a class="wordmark" href="index.html">${wordmark()}</a>
    <div class="header-actions">
      <button class="icon-btn" type="button" aria-label="Search" data-open-search aria-controls="search-panel" aria-expanded="false">${icon.search}</button>
      ${
        shop
          ? `<button class="icon-btn" type="button" data-open-bag aria-controls="bag-drawer" aria-expanded="false">${icon.bag}<span class="visually-hidden">Bag, </span><span class="bag-count" data-bag-count aria-hidden="true"></span><span class="visually-hidden" data-bag-count-sr>0 items</span></button>`
          : ''
      }
    </div>
  </div>
  ${nav.map((n, i) => (n.mega ? megaPanel(n.mega, i) : '')).join('')}
</header>
${mobileMenu()}`;
  wireScroll();
  wireMega(mount);
  wireMobile(mount);
  if (shop) {
    updateCount();
    window.addEventListener('bag:change', updateCount);
  }
};

const updateCount = () => {
  const n = bag.count();
  $$('[data-bag-count]').forEach((el) => (el.textContent = n ? String(n) : ''));
  $$('[data-bag-count-sr]').forEach((el) => (el.textContent = `${n} ${n === 1 ? 'item' : 'items'}`));
};

const wireScroll = () => {
  const header = document.getElementById('header');
  const sync = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  sync();
  window.addEventListener('scroll', sync, { passive: true });
};

export const setHeaderOverlay = (on) => {
  overlayOn = on;
  document.getElementById('header')?.classList.toggle('site-header--overlay', on);
};

const wireMega = (root) => {
  const header = $('#header', root);
  let openId = null;
  let timer;
  const close = () => {
    if (!openId) return;
    $(`#${openId}`, root)?.classList.remove('is-open');
    $(`[data-mega-trigger="${openId}"]`, root)?.setAttribute('aria-expanded', 'false');
    header.classList.remove('is-open');
    openId = null;
  };
  const open = (id) => {
    if (openId === id) return;
    close();
    $(`#${id}`, root).classList.add('is-open');
    $(`[data-mega-trigger="${id}"]`, root).setAttribute('aria-expanded', 'true');
    header.classList.add('is-open');
    openId = id;
  };
  $$('[data-mega-trigger]', root).forEach((t) => {
    t.addEventListener('mouseenter', () => {
      clearTimeout(timer);
      timer = setTimeout(() => open(t.dataset.megaTrigger), 90);
    });
    t.addEventListener('focus', () => open(t.dataset.megaTrigger));
  });
  header.addEventListener('mouseleave', () => {
    clearTimeout(timer);
    timer = setTimeout(close, 160);
  });
  $$('[data-mega]', root).forEach((m) => m.addEventListener('mouseenter', () => clearTimeout(timer)));
  // leaving the nav by keyboard closes the panel
  header.addEventListener('focusout', (e) => {
    if (!header.contains(e.relatedTarget)) close();
  });
  document.addEventListener('keydown', (e) => e.key === 'Escape' && close());
  // links without a mega trigger close an open panel on hover
  $$('.nav-primary a:not([data-mega-trigger]), .wordmark', root).forEach((a) => a.addEventListener('mouseenter', () => setTimeout(close, 60)));
};

const wireMobile = (root) => {
  const drawer = $('#mobile-menu', root);
  const toggle = $('[data-open-menu]', root);
  const ov = makeOverlay(drawer, {
    onOpen: () => toggle.setAttribute('aria-expanded', 'true'),
    onClose: () => toggle.setAttribute('aria-expanded', 'false'),
    initialFocus: () => $('[data-close]', drawer),
  });
  toggle.addEventListener('click', () => ov.open(toggle));
  $('[data-close]', drawer).addEventListener('click', () => ov.close());
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('a')) ov.close(false);
  });
};
