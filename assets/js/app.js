/**
 * App bootstrap. Each HTML page is a thin shell with <body data-page="…">;
 * this file renders the shared chrome (header, footer, bag, search) and then
 * loads the matching page module from ./pages/.
 *
 * Single-file build (tools/build_single_file.mjs): everything is inlined into
 * one HTML document and pages are addressed by hash, e.g.
 * #/product.html?p=body-mist-no-01 — internal links are intercepted below.
 */
import { site } from '../../site.config.js';
import { renderHeader, setHeaderOverlay } from './components/header.js';
import { renderFooter } from './components/footer.js';
import { renderBag, addToBag } from './components/bag-drawer.js';
import { renderSearch } from './components/search.js';
import { reveal, supportButton } from './components/misc.js';
import { wireWaitlists } from './components/waitlist.js';
import { closeActive } from './components/overlay.js';
import { getProduct, getVariant, isPurchasable } from './lib/catalog.js';
import { route, navigate, SINGLE_FILE } from './lib/util.js';

const pages = {
  home: () => import('./pages/home.js'),
  shop: () => import('./pages/shop.js'),
  product: () => import('./pages/product.js'),
  collection: () => import('./pages/collection.js'),
  story: () => import('./pages/story.js'),
  journal: () => import('./pages/journal.js'),
  article: () => import('./pages/article.js'),
  contact: () => import('./pages/contact.js'),
  faq: () => import('./pages/faq.js'),
  policy: () => import('./pages/policy.js'),
  search: () => import('./pages/search.js'),
  checkout: () => import('./pages/checkout.js'),
  order: () => import('./pages/order.js'),
  notfound: () => import('./pages/notfound.js'),
};

/** File name → [page, policy] — mirrors tools/make_pages.py (single-file routing). */
const FILES = {
  'index.html': ['home'],
  'shop.html': ['shop'],
  'product.html': ['product'],
  'collection.html': ['collection'],
  'story.html': ['story'],
  'journal.html': ['journal'],
  'article.html': ['article'],
  'contact.html': ['contact'],
  'faq.html': ['faq'],
  'shipping-returns.html': ['policy', 'shipping'],
  'privacy.html': ['policy', 'privacy'],
  'terms.html': ['policy', 'terms'],
  'search.html': ['search'],
  'checkout.html': ['checkout'],
  'order.html': ['order'],
  '404.html': ['notfound'],
};

const scrollToAnchor = (id) => {
  const target = id && document.getElementById(id);
  if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  return !!target;
};

const renderPage = async () => {
  const page = document.body.dataset.page || 'notfound';
  const main = document.getElementById('main');
  document.body.classList.remove('has-sticky-bar');
  try {
    const mod = await (pages[page] || pages.notfound)();
    mod.default(main);
  } catch (err) {
    console.error(err);
    main.innerHTML = '<div class="container empty-state"><p class="lede">Something went wrong loading this page. Please refresh.</p></div>';
  }
  wireWaitlists(main);
  reveal(main);
  // content is rendered after load, so the browser can't jump to #anchors by itself
  return scrollToAnchor(route.anchor);
};

// --- single-file routing -------------------------------------------------------
const applyHashRoute = () => {
  const raw = location.hash.startsWith('#/') ? location.hash.slice(2) : 'index.html';
  const [pathAndQuery, anchor = ''] = raw.split('#');
  const [file, query = ''] = pathAndQuery.split('?');
  const [page, policy] = FILES[file] || FILES['404.html'];
  route.file = FILES[file] ? file : '404.html';
  route.params = new URLSearchParams(query);
  route.anchor = decodeURIComponent(anchor);
  document.body.dataset.page = page;
  if (policy) document.body.dataset.policy = policy;
  else delete document.body.dataset.policy;
};

const wireSingleFileRouting = () => {
  const SITE_LINK = /^([a-z0-9-]+\.html)([?#].*)?$/i;
  // capture phase, so it runs before components that also handle the click
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      const href = a.getAttribute('href');
      if (SITE_LINK.test(href)) {
        e.preventDefault();
        navigate(href);
      } else if (href.startsWith('#') && !href.startsWith('#/') && href.length > 1) {
        // same-page anchor: scroll instead of replacing the route hash
        e.preventDefault();
        const t = document.getElementById(decodeURIComponent(href.slice(1)));
        t?.scrollIntoView({ block: 'start' });
        if (t && t.tabIndex >= 0) t.focus({ preventScroll: true });
      }
    },
    true
  );
  // search forms submit to search.html
  document.addEventListener(
    'submit',
    (e) => {
      const action = e.target.getAttribute('action');
      if (!action || !SITE_LINK.test(action)) return;
      e.preventDefault();
      navigate(`${action}?${new URLSearchParams(new FormData(e.target))}`);
    },
    true
  );
  window.addEventListener('hashchange', async () => {
    closeActive();
    window.dispatchEvent(new CustomEvent('route:change'));
    applyHashRoute();
    setHeaderOverlay(document.body.dataset.page === 'home');
    const jumped = await renderPage();
    if (!jumped) window.scrollTo(0, 0);
    document.getElementById('main').focus({ preventScroll: true });
  });
};

// --- start -----------------------------------------------------------------------
const start = async () => {
  document.documentElement.lang = site.locale.lang;
  if (SINGLE_FILE) {
    applyHashRoute();
    wireSingleFileRouting();
  }

  // shared live region for screen-reader announcements
  const live = document.createElement('div');
  live.id = 'sr-live';
  live.className = 'visually-hidden';
  live.setAttribute('aria-live', 'polite');
  live.setAttribute('role', 'status');
  document.body.append(live);

  renderHeader({ overlay: document.body.dataset.page === 'home' });
  renderBag();
  renderSearch();
  supportButton();

  await renderPage();
  renderFooter(); // after the page, so the footer never paints high and then jumps
  wireWaitlists(document);

  // quick add from product cards anywhere on the page
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-quick-add]');
    if (!b) return;
    const p = getProduct(b.dataset.quickAdd);
    const v = p && getVariant(p, b.dataset.variant);
    if (p && v && isPurchasable(p)) addToBag(p, v, 1, b);
  });

  document.body.classList.add('is-ready');
};

start();
