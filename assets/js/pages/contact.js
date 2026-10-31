import { site } from '../../../site.config.js';
import { esc, prov, setTitle, setMeta, icon } from '../lib/util.js';
import { wireForm } from '../lib/forms.js';
import { field } from '../lib/fields.js';

export default function contact(main) {
  setTitle('Contact');
  setMeta('Get in touch with us.');
  const c = site.contact;
  const co = site.company;
  const g = c.grievanceOfficer;
  // required details that aren't set yet: labelled in preview, plainly marked otherwise
  const pending = (what) => `<span class="muted">${esc(what)} — to be added before launch.</span>`;
  main.innerHTML = `
<div class="container">
  <header class="page-hero" style="padding-bottom:48px">
    <p class="eyebrow">Contact</p>
    <h1 class="page-hero__title">We’d love to <em>hear from you.</em></h1>
  </header>
  <div class="two-col" style="padding-bottom:var(--section)">
    <div>
      <ul class="contact-list">
        <li><span class="k">Customer care</span>${c.email ? `<a class="text-link" href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : pending('Customer care email')}</li>
        ${c.phone ? `<li><span class="k">Phone</span><a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a></li>` : ''}
        ${c.whatsapp ? `<li><span class="k">WhatsApp</span><a href="https://wa.me/${esc(c.whatsapp)}" target="_blank" rel="noopener">Chat with us</a></li>` : ''}
        ${c.hours ? `<li><span class="k">Hours</span>${esc(c.hours)} ${prov(true)}</li>` : ''}
        ${c.responseTime ? `<li><span class="k">Response time</span>${esc(c.responseTime)} ${prov(true)}</li>` : ''}
        <li><span class="k">Seller</span>${esc(co.legalName || co.name)}${co.legalName ? '' : ` ${prov(true, 'Registered name to add')}`}<br>${co.registeredAddress ? esc(co.registeredAddress) : pending('Registered office address')}</li>
        <li><span class="k">Grievance officer</span>${
          g
            ? `${esc(g.name)}, ${esc(g.designation || 'Grievance Officer')}<br><a class="text-link" href="mailto:${esc(g.email)}">${esc(g.email)}</a>${g.phone ? ` · ${esc(g.phone)}` : ''}<br><span class="small muted">We acknowledge complaints within 48 hours, share a copy of your complaint as recorded, and aim to resolve it within one month.</span>`
            : pending('Grievance officer name, designation and contact details')
        }</li>
      </ul>
      <div class="notice" style="margin-top:32px">${icon.info}<span>We will never call or message you asking for payment, an OTP or card details. If someone does, please don’t share anything and let us know.</span></div>
    </div>
    <form class="form-grid form-grid--2" data-contact novalidate>
      <p class="visually-hidden" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
      ${field('c-name', 'Name', (a) => `<input ${a} class="input" name="name" autocomplete="name">`)}
      ${field('c-email', 'Email', (a) => `<input ${a} class="input" name="email" type="email" autocomplete="email" inputmode="email">`, 'required email')}
      <div class="span-2">${field('c-topic', 'Topic', (a) => `<select ${a} class="select input" name="topic"><option value="">Choose a topic</option><option>An order</option><option>Our products</option><option>Wholesale &amp; press</option><option>Something else</option></select>`)}</div>
      <div class="span-2">${field('c-msg', 'Message', (a) => `<textarea ${a} class="textarea" name="message" rows="6"></textarea>`)}</div>
      <div class="span-2" style="display:grid;gap:12px">
        <button class="btn" type="submit">Send message</button>
        <p class="form-status" data-status role="status" aria-live="polite" hidden></p>
      </div>
    </form>
  </div>
</div>`;
  wireForm(main.querySelector('[data-contact]'), { name: 'contact', success: 'Thank you — your message has been sent. We’ll reply by email.' });
}
