import { collections } from '../../../site.config.js';
import { esc, icon, $, $$, debounce } from '../lib/util.js';
import { search, getProduct, productUrl, collectionUrl } from '../lib/catalog.js';
import { recent } from '../lib/cart.js';
import { thumb } from '../lib/images.js';
import { makeOverlay } from './overlay.js';

const hit = (h, opt) => {
  const src = h.image ? thumb(h.image) : '';
  return `<a class="search-hit" href="${esc(h.url)}"${opt ? ` role="option" id="${opt}" aria-selected="false" tabindex="-1"` : ''}>
          <span class="search-hit__media">${src ? `<img src="${src}" alt="" width="56" height="70" loading="lazy">` : ''}</span>
          <span><span class="search-hit__t">${esc(h.title)}</span><br><span class="search-hit__s">${esc(h.sub || '')}</span></span>
          <span aria-hidden="true">${icon.arrow}</span>
        </a>`;
};

const groupsMarkup = (groups, { limit, palette }) => {
  let n = 0;
  return Object.entries(groups)
    .map(([type, list]) => {
      const gid = `sg-${type.toLowerCase().replace(/[^a-z]+/g, '-')}`;
      const items = list.slice(0, limit).map((h) => hit(h, palette ? `sopt-${n++}` : null)).join('');
      return palette
        ? `<div class="search-group" role="group" aria-label="${esc(type)}"><div class="search-group__label" aria-hidden="true">${esc(type)} · ${list.length}</div>${items}</div>`
        : `<section class="search-group" aria-label="${esc(type)}"><h3 id="${gid}">${esc(type)} <span aria-hidden="true">· ${list.length}</span></h3>${items}</section>`;
    })
    .join('');
};

/** Results grouped by type. `palette: true` renders listbox options for the keyboard palette. */
export const resultsMarkup = (q, hits, { limit = 6, palette = false } = {}) => {
  if (!q.trim()) return '';
  if (!hits.length) return `<p class="muted">No results for “${esc(q)}”. Try “mist”, “body” or “coming soon”.</p>`;
  const groups = {};
  hits.forEach((h) => (groups[h.type] ||= []).push(h));
  return groupsMarkup(groups, { limit, palette });
};

/** Before typing: recently viewed products, the three lines and the main pages. */
const startMarkup = () => {
  const groups = {};
  const rv = recent.list().map(getProduct).filter(Boolean).slice(0, 3);
  if (rv.length) groups['Recently viewed'] = rv.map((p) => ({ title: p.name, sub: p.category, url: productUrl(p), image: p.images[0]?.key }));
  groups.Collections = collections.map((c) => ({ title: c.name, sub: c.intro, url: collectionUrl(c), image: c.image }));
  groups['Go to'] = [
    { title: 'Shop all', sub: 'The whole range', url: 'shop.html', image: 'lineup' },
    { title: 'Our story', sub: 'About Gentle Company', url: 'story.html' },
    { title: 'FAQs', sub: 'Questions and answers', url: 'faq.html' },
    { title: 'Contact', sub: 'Get in touch', url: 'contact.html' },
  ];
  return groupsMarkup(groups, { limit: 6, palette: true });
};

/**
 * Search palette: opens with the search icon, "/" or ⌘K / Ctrl+K. Arrow keys
 * move through results and Enter opens the highlighted one; with nothing
 * highlighted, Enter shows the full results page. Escape closes. Keyboard model
 * inspired by command palettes such as Unsloth Studio's; written for this site.
 */
export const renderSearch = () => {
  const el = document.createElement('div');
  el.innerHTML = `<div class="search-panel" id="search-panel" role="dialog" aria-modal="true" aria-label="Search" tabindex="-1" hidden>
    <div class="container">
      <form class="search-panel__bar" role="search" action="search.html">
        ${icon.search}
        <label class="visually-hidden" for="search-input">Search the site</label>
        <input class="search-panel__input" id="search-input" name="q" type="search" placeholder="Search" autocomplete="off" data-autofocus
          role="combobox" aria-expanded="true" aria-controls="search-list" aria-autocomplete="list" aria-activedescendant="">
        <kbd class="search-panel__kbd" aria-hidden="true">Esc</kbd>
        <button class="icon-btn" type="button" data-close aria-label="Close search">${icon.close}</button>
      </form>
      <div class="search-results">
        <div class="search-suggest" data-suggest>
          <span class="caps muted" style="width:100%;margin-bottom:4px">Popular</span>
          ${['Body mist', 'Body care', 'Face care', 'Coming soon', 'Ritual'].map((s) => `<button type="button" class="tag tag--outline" style="height:34px;cursor:pointer" data-term="${esc(s)}">${esc(s)}</button>`).join('')}
        </div>
        <div id="search-list" class="search-list" role="listbox" aria-label="Results"></div>
        <p class="visually-hidden" id="search-live" aria-live="polite"></p>
        <p class="search-panel__hint" aria-hidden="true"><kbd>↑</kbd><kbd>↓</kbd> to move <kbd>Enter</kbd> to open <kbd>Esc</kbd> to close</p>
      </div>
    </div>
  </div>`;
  const panel = el.firstElementChild;
  document.body.append(panel);
  const input = $('#search-input', panel);
  const list = $('#search-list', panel);
  const live = $('#search-live', panel);
  const suggest = $('[data-suggest]', panel);
  let active = -1;
  const options = () => $$('[role="option"]', list);
  const setActive = (i) => {
    const opts = options();
    if (!opts.length) {
      active = -1;
      input.setAttribute('aria-activedescendant', '');
      return;
    }
    active = (i + opts.length) % opts.length;
    opts.forEach((o, k) => {
      o.setAttribute('aria-selected', String(k === active));
      o.classList.toggle('is-active', k === active);
    });
    input.setAttribute('aria-activedescendant', opts[active].id);
    opts[active].scrollIntoView({ block: 'nearest' });
  };
  const run = () => {
    const q = input.value;
    const hits = q.trim() ? search(q) : [];
    list.innerHTML = q.trim() ? resultsMarkup(q, hits, { palette: true }) : startMarkup();
    suggest.hidden = !!q.trim();
    live.textContent = q.trim() ? (hits.length ? `${hits.length} results` : 'No results') : '';
    // nothing is highlighted until an arrow key is used, so Enter still submits to the results page
    active = -1;
    input.setAttribute('aria-activedescendant', '');
  };
  const ov = makeOverlay(panel, {
    onOpen: () => {
      $$('[data-open-search]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
      run();
    },
    onClose: () => $$('[data-open-search]').forEach((b) => b.setAttribute('aria-expanded', 'false')),
    initialFocus: () => input,
  });
  input.addEventListener('input', debounce(run, 120));
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(active < 0 ? (e.key === 'ArrowDown' ? 0 : -1) : active + (e.key === 'ArrowDown' ? 1 : -1));
    } else if (e.key === 'Home' && active >= 0) {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End' && active >= 0) {
      e.preventDefault();
      setActive(options().length - 1);
    } else if (e.key === 'Enter' && active >= 0) {
      const opt = options()[active];
      if (opt) {
        e.preventDefault();
        opt.click();
      }
    }
  });
  list.addEventListener('mousemove', (e) => {
    const o = e.target.closest('[role="option"]');
    if (o) setActive(options().indexOf(o));
  });
  list.addEventListener('click', (e) => e.target.closest('a') && ov.close(false));
  $('[data-close]', panel).addEventListener('click', () => ov.close());
  suggest.addEventListener('click', (e) => {
    const t = e.target.closest('[data-term]');
    if (!t) return;
    input.value = t.dataset.term;
    run();
    input.focus();
  });
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-open-search]');
    if (t) ov.open(t);
  });
  document.addEventListener('keydown', (e) => {
    const typing = /input|textarea|select/i.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      ov.toggle();
    } else if (e.key === '/' && !typing) {
      e.preventDefault();
      ov.open();
    }
  });
};
