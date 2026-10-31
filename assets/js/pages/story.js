import { content } from '../../../site.config.js';
import { esc, rich, icon, setTitle, setMeta } from '../lib/util.js';
import { picture } from '../lib/images.js';
import { waitlistForm, wireWaitlists } from '../components/waitlist.js';

/** Our Story: one image-led opener and three short chapters. */
export default function story(main) {
  const s = content.story;
  setTitle('Our Story');
  setMeta(s.hero.text);
  main.innerHTML = `
<div class="container page-pad" style="padding-top:var(--s-5)">
  <section class="story-hero">
    <div class="media">${picture(s.hero.image, { alt: 'The Gentle Company range on a long travertine shelf', sizes: '(min-width: 1440px) 1344px, 100vw', priority: true })}</div>
  </section>
  <div class="story-hero__text">
    <h1>${rich(s.hero.title)}</h1>
    <p class="lede">${esc(s.hero.text)}</p>
  </div>
  <div class="stack-lg" style="margin-top:var(--section)">
    ${s.chapters
      .map(
        (c) => `<section class="chapter reveal">
      <div class="media">${picture(c.image, { alt: '', sizes: '(min-width: 900px) 46vw, 100vw' })}</div>
      <div><h2>${esc(c.title)}</h2><p>${esc(c.text)}</p></div>
    </section>`,
      )
      .join('')}
  </div>
  <section class="section center stack" style="max-width:560px;margin-inline:auto">
    <h2 class="t-xl">Be first to know.</h2>
    <div style="text-align:left">${waitlistForm({ cta: 'Sign up' })}</div>
    <p><a class="link" href="product.html?p=body-mist-no-01">Discover Body Mist Nº 01 ${icon.arrow}</a></p>
  </section>
</div>`;
  wireWaitlists(main);
}
