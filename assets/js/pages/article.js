import { journal } from '../../../content/journal.js';
import { esc, rich, icon, param, setTitle, setMeta } from '../lib/util.js';
import { picture } from '../lib/images.js';
import { getArticle } from '../lib/catalog.js';
import { journalCard } from '../components/cards.js';
import notFound from './notfound.js';

const block = (b) => {
  if (b.h) return `<h2>${esc(b.h)}</h2>`;
  if (b.quote) return `<blockquote>${esc(b.quote)}</blockquote>`;
  if (b.list) return `<ul>${b.list.map((li) => `<li>${esc(li)}</li>`).join('')}</ul>`;
  return `<p>${esc(b.p)}</p>`;
};

export default function article(main) {
  const a = getArticle(param('a') || '');
  if (!a) return notFound(main);
  setTitle(a.title);
  setMeta(a.dek);
  const more = journal.filter((x) => x.slug !== a.slug).slice(0, 2);
  main.innerHTML = `
<article>
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="index.html">Home</a></li><li><a href="journal.html">Journal</a></li><li aria-current="page">${esc(a.title)}</li></ol></nav>
    <header class="article-hero">
      <div class="container--narrow" style="margin:0 auto;width:100%;display:grid;gap:20px">
        <p class="article-meta"><span>${esc(a.category)}</span><span>${esc(a.readingTime)}</span></p>
        <h1 class="t-2xl">${rich(a.title)}</h1>
        <p class="lede">${esc(a.dek)}</p>
      </div>
      <div class="media">${picture(a.image, { alt: '', sizes: '100vw', priority: true })}</div>
    </header>
  </div>
  <div class="container container--narrow section">
    <div class="prose" style="margin:0 auto">${a.body.map(block).join('')}</div>
    <div class="notice" style="margin-top:48px">${icon.info}<span>Journal articles are general information, not medical advice. Always follow the directions on a product’s label.</span></div>
  </div>
</article>
<section class="section section--limewash" aria-labelledby="more-title">
  <div class="container">
    <div class="section-head section-head--split"><h2 class="t-xl" id="more-title">More from the <em>journal</em></h2><p class="lede"><a class="link" href="product.html?p=body-mist-no-01">Discover Body Mist Nº 01 ${icon.arrow}</a></p></div>
    <div class="grid-cards grid-cards--2">${more.map(journalCard).join('')}</div>
  </div>
</section>`;
}
