import { content } from '../../../site.config.js';
import { esc, setTitle, icon } from '../lib/util.js';

export default function policy(main) {
  const key = document.body.dataset.policy;
  const pol = content.policies[key];
  if (!pol) return;
  setTitle(pol.title);
  main.innerHTML = `
<div class="container container--narrow" style="padding-bottom:var(--section)">
  <header class="page-hero" style="padding-bottom:32px">
    <p class="eyebrow">Policies</p>
    <h1 class="page-hero__title">${esc(pol.title)}</h1>
  </header>
  <div class="notice">${icon.info}<span><strong>Draft outline — not yet in force.</strong> ${esc(pol.intro)}</span></div>
  <div class="prose" style="margin-top:40px">
    ${pol.sections.map((s) => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join('')}
  </div>
</div>`;
}
