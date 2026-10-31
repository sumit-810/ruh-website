import { site, content } from '../../../site.config.js';
import { esc, rich, icon, prov, setTitle, setMeta } from '../lib/util.js';
import { picture } from '../lib/images.js';

export default function story(main) {
  const s = content.story;
  setTitle('Our story');
  setMeta(s.hero.text);
  const note = s.founderNote;
  main.innerHTML = `
<div class="container">
  <header class="page-hero page-hero--split">
    <div>
      <p class="eyebrow">${esc(s.hero.eyebrow)}</p>
      <h1 class="page-hero__title">${rich(s.hero.title)}</h1>
      <p class="lede" style="margin-top:24px">${esc(s.hero.text)} ${prov(true, 'Placeholder copy')}</p>
    </div>
    <div class="media page-hero__media">${picture(s.hero.image, { alt: 'The bottle standing in an arched limewash niche, lit through a jaali screen', sizes: '(min-width: 900px) 45vw, 100vw', priority: true })}</div>
  </header>
</div>
<section class="section section--limewash">
  <div class="container">
    ${s.chapters
      .map(
        (c) => `<article class="chapter">
      <div class="media chapter__media reveal">${picture(c.image, { alt: '', sizes: '(min-width: 900px) 45vw, 100vw' })}</div>
      <div class="reveal">
        <p class="eyebrow">${esc(c.eyebrow)}</p>
        <h2>${rich(c.title)}</h2>
        ${c.text.map((t) => `<p>${esc(t)}</p>`).join('')}
      </div>
    </article>`
      )
      .join('')}
  </div>
</section>
<section class="section">
  <div class="container container--narrow">
    ${
      note.text
        ? `<figure class="center" style="margin:0"><p class="eyebrow" style="justify-content:center">${esc(note.eyebrow)}</p><blockquote class="statement" style="max-width:none">${esc(note.text)}</blockquote>${note.signature ? `<figcaption class="caps muted" style="margin-top:24px">${esc(note.signature)}</figcaption>` : ''}</figure>`
        : site.previewMode
          ? `<div class="note-card"><p class="eyebrow eyebrow--plain">${esc(note.eyebrow)}</p><p class="display t-lg">A letter from the founders will live here.</p><p class="muted small">Placeholder — add the founders’ own words in <code>content.story.founderNote</code>. This block is hidden on the live site until text is added.</p></div>`
          : ''
    }
    <div class="center" style="margin-top:64px;display:grid;gap:20px;justify-items:center">
      <p class="lede">${esc(site.brand.nameMeaning)}</p>
      <div class="hero__ctas" style="justify-content:center"><a class="btn" href="product.html?p=body-mist-no-01">Discover Body Mist Nº 01</a><a class="link" href="journal.html">Read the journal ${icon.arrow}</a></div>
    </div>
  </div>
</section>`;
}
