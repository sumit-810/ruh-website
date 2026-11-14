import { useState, type FormEvent } from 'react';
import { ShieldAlert } from 'lucide-react';
import { site } from '../../site.config.js';
import { failureMessage, formToObject, send, validateForm } from '@/lib/forms';
import { Seo } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/site/Reveal';
import { PageHero } from './PageHero';
import { Field } from './Field';

/** Contact: a working form, plus only the business details that are confirmed. */
export default function Contact() {
  const c: any = site.contact;
  const co: any = site.company;
  const g = c.grievanceOfficer;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = [
    c.email && { k: 'Email', v: <a className="text-link" href={`mailto:${c.email}`}>{c.email}</a> },
    c.phone && { k: 'Phone', v: <a href={`tel:${c.phone.replace(/\s/g, '')}`}>{c.phone}</a> },
    c.whatsapp && { k: 'WhatsApp', v: <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener">Chat with us</a> },
    c.hours && { k: 'Hours', v: c.hours },
    co.legalName && { k: 'Company', v: <>{co.legalName}{co.registeredAddress && <><br />{co.registeredAddress}</>}</> },
    g && { k: 'Grievance officer', v: <>{g.name}, {g.designation || 'Grievance Officer'}<br /><a className="text-link" href={`mailto:${g.email}`}>{g.email}</a>{g.phone ? ` · ${g.phone}` : ''}</> },
  ].filter(Boolean) as { k: string; v: React.ReactNode }[];

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const data = formToObject(form);
    if (data['bot-field']) return;
    setBusy(true);
    const r = await send('contact', data);
    setBusy(false);
    if (r.ok) {
      setStatus({ tone: 'success', text: 'Thank you — your message has been sent. We’ll reply by email.' });
      form.reset();
    } else setStatus({ tone: 'error', text: failureMessage(r.reason) });
  };
  const clear = (name: string) => errors[name] && setErrors({ ...errors, [name]: '' });

  return (
    <>
      <Seo title="Contact" description="Get in touch with Gentle Company." path="/contact" />
      <div className="container-x pb-[var(--section)]">
        <PageHero eyebrow="Contact" title="Say *hello.*" lede="Questions about our products or the launch? Send us a message." />
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <Reveal>
            <form className="grid gap-5 sm:grid-cols-2" noValidate onSubmit={onSubmit}>
              <p className="sr-only" aria-hidden="true">
                <label>
                  Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
                </label>
              </p>
              <Field id="c-name" label="Name">
                <input id="c-name" name="name" autoComplete="name" className="field-input" />
              </Field>
              <Field id="c-email" label="Email" error={errors.email}>
                <input id="c-email" name="email" type="email" autoComplete="email" inputMode="email" className="field-input" data-validate="required email" aria-invalid={errors.email ? true : undefined} aria-describedby="c-email-err" onInput={() => clear('email')} />
              </Field>
              <Field id="c-topic" label="Topic" className="sm:col-span-2">
                <select id="c-topic" name="topic" className="field-input" defaultValue="">
                  <option value="">Choose a topic</option>
                  <option>Our products</option>
                  <option>The launch</option>
                  <option>Wholesale &amp; press</option>
                  <option>Something else</option>
                </select>
              </Field>
              <Field id="c-msg" label="Message" error={errors.message} className="sm:col-span-2">
                <textarea id="c-msg" name="message" rows={6} className="field-input" data-validate="required" aria-invalid={errors.message ? true : undefined} aria-describedby="c-msg-err" onInput={() => clear('message')} />
              </Field>
              <div className="grid gap-4 sm:col-span-2">
                <Button type="submit" disabled={busy} className="justify-self-start">
                  {busy ? 'Sending…' : 'Send message'}
                </Button>
                {status && (
                  <p role="status" className={cn('rounded-xl px-4 py-3 text-sm', status.tone === 'success' ? 'bg-[#e6ede3] text-success' : 'bg-[#f6e3dc] text-error')}>
                    {status.text}
                  </p>
                )}
              </div>
            </form>
          </Reveal>
          <Reveal className="grid content-start gap-8" delay={0.1}>
            {rows.length > 0 && (
              <ul className="grid gap-5 border-t border-line pt-6">
                {rows.map((r) => (
                  <li key={r.k} className="grid gap-1">
                    <span className="eyebrow">{r.k}</span>
                    <span>{r.v}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-3 rounded-2xl bg-sand p-5 text-sm text-cocoa-2">
              <ShieldAlert className="size-5 shrink-0" strokeWidth={1.3} />
              <span>We will never call or message you asking for a payment, an OTP or card details. If someone does, please don’t share anything.</span>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}
