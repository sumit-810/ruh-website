import { esc, param, setTitle } from '../lib/util.js';
import { search } from '../lib/catalog.js';
import { resultsMarkup } from '../components/search.js';

export default function searchPage(main) {
  const q = param('q') || '';
  setTitle(q ? `Search: ${q}` : 'Search');
  main.innerHTML = `
<div class="container container--narrow" style="padding-bottom:var(--section)">
  <header class="page-hero" style="padding-bottom:24px">
    <p class="eyebrow">Search</p>
    <form role="search" action="search.html" class="inline-form" style="max-width:640px">
      <label class="visually-hidden" for="sp-q">Search the site</label>
      <input class="input" id="sp-q" type="search" name="q" value="${esc(q)}" placeholder="Search products, rituals, journal">
      <button class="btn" type="submit">Search</button>
    </form>
  </header>
  <div class="search-results" aria-live="polite">${q ? resultsMarkup(q, search(q), { limit: 50 }) : '<p class="muted">Try “mist”, “body care” or “coming soon”.</p>'}</div>
</div>`;
}
