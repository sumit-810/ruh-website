import { site } from '../../../site.config.js';
import { policies } from '../../../content/policies.js';
import { esc, money, setTitle, setMeta, icon } from '../lib/util.js';

/** Values that fill the {{tokens}} in content/policies.js. Missing details become [bracketed] to-dos. */
export function policyTokens() {
  const co = site.company;
  const c = site.contact;
  const g = c.grievanceOfficer;
  const sh = site.shipping;
  const reg = [co.cin && `CIN: ${co.cin}.`, co.gstin && `GSTIN: ${co.gstin}.`].filter(Boolean).join(' ');
  let delivery;
  if (sh.flatRate == null) delivery = '[Delivery charges — e.g. ₹X per order, free above ₹Y.]';
  else if (sh.flatRate === 0) delivery = 'Delivery is free on every order.';
  else delivery = `Delivery is ${money(sh.flatRate)} per order${sh.freeAbove ? ` and free on orders of ${money(sh.freeAbove)} or more` : ''}.`;
  const cod = sh.cod?.enabled
    ? `Cash on delivery is available on orders up to ${money(sh.cod.maxOrderValue)}${sh.cod.fee ? `, with a ${money(sh.cod.fee)} handling fee` : ''}; we contact you to confirm a cash-on-delivery order before it ships.`
    : 'Cash on delivery is not currently available.';
  return {
    brand: site.brand.name,
    seller: co.legalName || '[GentleCare’s registered legal name]',
    address: co.registeredAddress || '[registered office address]',
    registration: reg || '[CIN and GSTIN.]',
    email: c.email || '[customer care email]',
    grievance: g
      ? [`${g.name}, ${g.designation || 'Grievance Officer'}`, g.email, g.phone].filter(Boolean).join(', ')
      : '[Grievance Officer name, designation, email and phone]',
    deliveryCharges: delivery,
    codLine: cod,
  };
}

export const fillTokens = (text, tokens) => text.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m));

/** Escape, then highlight [to-dos] and link email addresses. */
const render = (text, tokens) =>
  esc(fillTokens(text, tokens))
    .replace(/\[([^\]]+)\]/g, '<mark class="tbd" title="To be confirmed before launch">$1</mark>')
    .replace(/([\w.+-]+@[\w-]+\.[\w.-]+\w)/g, '<a class="text-link" href="mailto:$1">$1</a>');

export default function policy(main) {
  const key = document.body.dataset.policy;
  const pol = policies[key];
  if (!pol) return;
  setTitle(pol.title);
  setMeta(`${pol.title} for ${site.brand.name} by ${site.company.name}.`);
  const t = policyTokens();
  const body = pol.sections
    .map(
      (s) =>
        `<h2>${esc(s.h)}</h2>${s.p ? `<p>${render(s.p, t)}</p>` : ''}${
          s.list ? `<ul>${s.list.map((li) => `<li>${render(li, t)}</li>`).join('')}</ul>` : ''
        }${s.after ? `<p>${render(s.after, t)}</p>` : ''}`,
    )
    .join('');
  const draft = site.previewMode || !policies.updated || body.includes('class="tbd"');
  main.innerHTML = `
<div class="container container--narrow" style="padding-bottom:var(--section)">
  <header class="page-hero" style="padding-bottom:32px">
    <p class="eyebrow">Policies</p>
    <h1 class="page-hero__title">${esc(pol.title)}</h1>
  </header>
  ${
    draft
      ? `<div class="notice">${icon.info}<span><strong>Draft — not yet in force.</strong> Highlighted items are business details still to be confirmed, and this text will be reviewed before launch.</span></div>`
      : ''
  }
  <div class="prose" style="margin-top:40px">
    <p class="lede">${render(pol.intro, t)}</p>
    ${body}
    ${policies.updated ? `<p class="small muted" style="margin-top:48px">Last updated: ${esc(policies.updated)}</p>` : ''}
  </div>
</div>`;
}
