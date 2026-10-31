import { esc, icon, $, $$, debounce } from '../lib/util.js';
import { search } from '../lib/catalog.js';
import { thumb } from '../lib/images.js';
import { makeOverlay } from './overlay.js';

export const resultsMarkup = (q, hits, { limit = 6 } = {}) => {
  if (!q.trim()) return '';
  if (!hits.length)
    return `<p class="muted">No results for “${esc(q)}”. Try “mist”, “body” or “coming soon”.</p>`;
  const groups = {};
  hits.forEach((h) => (groups[h.type] ||= []).push(h));
  return Object.entries(groups)
    .map(
      ([type, list]) => `<section class="search-group" aria-label="${esc(type)}">
      <h3>${esc(type)} <span aria-hidden="true">· ${list.length}</span></h3>
      ${list
        .slice(0, limit)
        .map((h) => ({ ...h, src: h.image ? thumb(h.image) : '' }))
        .map(
          (h) => `<a class="search-hit" href="${esc(h.url)}">
          <span class="search-hit__media">${h.src ? `<img src="${h.src}" alt="" width="56" height="70" loading="lazy">` : ''}</span>
          <span><span class="search-hit__t">${esc(h.title)}</span><br><span class="search-hit__s">${esc(h.sub || '')}</span></span>
          <span aria-hidden="true">${icon.arrow}</span>
        </a>`
        )
        .join('')}
    </section>`
    )
    .join('');
};

export const renderSearch = () => {
  const el = document.createElement('div');
  el.innerHTML = `<div class="search-panel" id="search-panel" role="dialog" aria-modal="true" aria-label="Search" tabindex="-1" hidden>
    <div class="container">
      <form class="search-panel__bar" role="search" action="search.html">
        ${icon.search}
        <label class="visually-hidden" for="search-input">Search the site</label>
        <input class="search-panel__input" id="search-input" name="q" type="search" placeholder="Search" autocomplete="off" data-autofocus aria-controls="search-live">
        <button class="icon-btn" type="button" data-close aria-label="Close search">${icon.close}</button>
      </form>
      <div class="search-results">
        <div class="search-suggest" data-suggest>
          <span class="caps muted" style="width:100%;margin-bottom:4px">Popular</span>
          ${['Body mist', 'Body care', 'Face care', 'Coming soon', 'Ritual'].map((s) => `<button type="button" class="tag tag--outline" style="height:34px;cursor:pointer" data-term="${esc(s)}">${esc(s)}</button>`).join('')}
        </div>
        <div id="search-live" aria-live="polite"></div>
      </div>
    </div>
  </div>`;
  const panel = el.firstElementChild;
  document.body.append(panel);
  const input = $('#search-input', panel);
  const live = $('#search-live', panel);
  const suggest = $('[data-suggest]', panel);
  const ov = makeOverlay(panel, {
    onOpen: () => $$('[data-open-search]').forEach((b) => b.setAttribute('aria-expanded', 'true')),
    onClose: () => $$('[data-open-search]').forEach((b) => b.setAttribute('aria-expanded', 'false')),
    initialFocus: () => input,
  });
  const run = () => {
    const q = input.value;
    live.innerHTML = resultsMarkup(q, search(q));
    suggest.hidden = !!q.trim();
  };
  input.addEventListener('input', debounce(run, 120));
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
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault();
      ov.open();
    }
  });
};
