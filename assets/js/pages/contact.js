import { site } from '../../../site.config.js';
import { esc, setTitle, setMeta, icon } from '../lib/util.js';
import { wireForm } from '../lib/forms.js';
import { field } from '../lib/fields.js';

/** Contact: a working form, plus only the business details that are confirmed. */
export default function contact(main) {
  setTitle('Contact');
  setMeta('Get in touch with Gentle Company.');
  const c = site.contact;
  const co = site.company;
  const g = c.grievanceOfficer;
  const rows = [
    c.email && `<li><span class="k">Email</span><a class="text-link" href="mailto:${esc(c.email)}">${esc(c.email)}</a></li>`,
    c.phone && `<li><span class="k">Phone</span><a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a></li>`,
    c.whatsapp && `<li><span class="k">WhatsApp</span><a href="https://wa.me/${esc(c.whatsapp)}" target="_blank" rel="noopener">Chat with us</a></li>`,
    c.hours && `<li><span class="k">Hours</span>${esc(c.hours)}</li>`,
    co.legalName && `<li><span class="k">Company</span>${esc(co.legalName)}${co.registeredAddress ? `<br>${esc(co.registeredAddress)}` : ''}</li>`,
    g &&
      `<li><span class="k">Grievance officer</span>${esc(g.name)}, ${esc(g.designation || 'Grievance Officer')}<br><a class="text-link" href="mailto:${esc(g.email)}">${esc(g.email)}</a>${g.phone ? ` · ${esc(g.phone)}` : ''}<br><span class="small muted">We acknowledge complaints within 48 hours, share a copy of your complaint as recorded, and aim to resolve it within one month.</span></li>`,
  ].filter(Boolean);
  main.innerHTML = `
<div class="container page-pad" style="padding-top:var(--s-5)">
  <header class="page-head">
    <h1 class="t-2xl">Contact</h1>
    <p class="lede" style="margin-top:12px">Questions about our products or the launch? Send us a message.</p>
  </header>
  <div class="two-col">
    <form class="form-grid form-grid--2" data-contact novalidate>
      <p class="visually-hidden" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>
      ${field('c-name', 'Name', (a) => `<input ${a} class="input" name="name" autocomplete="name">`, '')}
      ${field('c-email', 'Email', (a) => `<input ${a} class="input" name="email" type="email" autocomplete="email" inputmode="email">`, 'required email')}
      <div class="span-2">${field('c-topic', 'Topic', (a) => `<select ${a} class="select input" name="topic"><option value="">Choose a topic</option><option>Our products</option><option>The launch</option><option>Wholesale &amp; press</option><option>Something else</option></select>`, '')}</div>
      <div class="span-2">${field('c-msg', 'Message', (a) => `<textarea ${a} class="textarea" name="message" rows="6"></textarea>`, 'required')}</div>
      <div class="span-2" style="display:grid;gap:12px">
        <button class="btn" type="submit">Send message</button>
        <p class="form-status" data-status role="status" aria-live="polite" hidden></p>
      </div>
    </form>
    <div class="stack">
      ${rows.length ? `<ul class="contact-list">${rows.join('')}</ul>` : ''}
      <div class="notice">${icon.info}<span>We will never call or message you asking for a payment, an OTP or card details. If someone does, please don’t share anything.</span></div>
    </div>
  </div>
</div>`;
  wireForm(main.querySelector('[data-contact]'), { name: 'contact', success: 'Thank you — your message has been sent. We’ll reply by email.' });
}
