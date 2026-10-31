import { journal } from '../../../content/journal.js';
import { esc, rich, icon, setTitle, setMeta } from '../lib/util.js';
import { picture } from '../lib/images.js';
import { articleUrl } from '../lib/catalog.js';
import { journalCard } from '../components/cards.js';

export default function journalPage(main) {
  setTitle('Journal');
  setMeta('Notes on scent, skin and the rituals in between.');
  const [first, ...rest] = journal;
  main.innerHTML = `
<div class="container">
  <header class="page-hero" style="padding-bottom:48px">
    <p class="eyebrow">Journal</p>
    <h1 class="page-hero__title">Notes on scent, <em>skin and ritual.</em></h1>
  </header>
  ${
    first
      ? `<a class="jfeature reveal" href="${articleUrl(first)}">
    <div class="media">${picture(first.image, { alt: '', sizes: '(min-width: 900px) 55vw, 100vw', priority: true })}</div>
    <div>
      <p class="article-meta"><span>${esc(first.category)}</span><span>${esc(first.readingTime)}</span></p>
      <h2 style="margin-top:16px">${rich(first.title)}</h2>
      <p class="lede">${esc(first.dek)}</p>
      <span class="link" style="margin-top:24px">Read ${icon.arrow}</span>
    </div>
  </a>`
      : ''
  }
  <div class="grid-cards grid-cards--2" style="padding-block:var(--section)">${rest.map(journalCard).join('')}</div>
</div>`;
}
