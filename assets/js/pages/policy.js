import { site } from '../../../site.config.js';
import { policies } from '../../../content/policies.js';
import { esc, money, setTitle, setMeta } from '../lib/util.js';

/** Values for the {{tokens}} in content/policies.js, built only from confirmed details. */
export function policyTokens() {
  const co = site.company;
  const c = site.contact;
  const g = c.grievanceOfficer;
  const sh = site.shipping;
  const reg = [co.cin && `CIN: ${co.cin}.`, co.gstin && `GSTIN: ${co.gstin}.`].filter(Boolean).join(' ');
  let delivery = '';
  if (sh.flatRate === 0) delivery = 'Delivery is free on every order.';
  else if (sh.flatRate) delivery = `Delivery is ${money(sh.flatRate)} per order${sh.freeAbove ? ` and free on orders of ${money(sh.freeAbove)} or more` : ''}.`;
  const contactRoute = c.email ? `at ${c.email}` : 'through the contact page on this website';
  return {
    brand: site.brand.name,
    seller: co.legalName || co.name,
    sellerNamed: co.legalName ? `${co.legalName} ("Gentle Company", "we")` : `${co.name} ("we")`,
    address: co.registeredAddress || '',
    addressLine: co.registeredAddress ? `Registered office: ${co.registeredAddress}. ` : '',
    registration: reg,
    email: c.email || 'us through the contact page',
    contactRoute,
    grievance: g ? [`${g.name}, ${g.designation || 'Grievance Officer'}`, g.email, g.phone].filter(Boolean).join(', ') : `us ${contactRoute}`,
    deliveryCharges: delivery,
    codLine: sh.cod?.enabled ? `Cash on delivery is available on orders up to ${money(sh.cod.maxOrderValue)}.` : 'Cash on delivery is not currently available.',
  };
}

export const fillTokens = (text, tokens) => text.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m)).replace(/\s{2,}/g, ' ');

const render = (text, tokens) =>
  esc(fillTokens(text, tokens)).replace(/([\w.+-]+@[\w-]+\.[\w.-]+\w)/g, '<a class="text-link" href="mailto:$1">$1</a>');

export default function policy(main) {
  const key = document.body.dataset.policy;
  const pol = policies[key];
  if (!pol) return;
  setTitle(pol.title);
  setMeta(`${pol.title} — ${site.brand.name}.`);
  const published = policies.published?.[key];
  const t = policyTokens();
  const body = published
    ? pol.sections
        .map(
          (s) =>
            `<h2>${esc(s.h)}</h2>${s.p ? `<p>${render(s.p, t)}</p>` : ''}${
              s.list ? `<ul>${s.list.map((li) => `<li>${render(li, t)}</li>`).join('')}</ul>` : ''
            }${s.after ? `<p>${render(s.after, t)}</p>` : ''}`,
        )
        .join('')
    : `<p>Our shop is not open yet. Our ${esc(pol.title.toLowerCase())} will be published here before we take our first order.</p>
       <p>Questions in the meantime? <a class="text-link" href="contact.html">Contact us</a>.</p>`;
  main.innerHTML = `
<div class="container container--narrow page-pad">
  <header class="page-head">
    <p class="eyebrow">Policies</p>
    <h1 class="t-2xl">${esc(pol.title)}</h1>
  </header>
  <div class="prose">
    ${published ? `<p class="lede">${render(pol.intro, t)}</p>` : ''}
    ${body}
    ${published && policies.updated ? `<p class="small muted">Last updated: ${esc(policies.updated)}</p>` : ''}
  </div>
</div>`;
}
