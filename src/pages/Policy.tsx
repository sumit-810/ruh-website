import { Fragment } from 'react';
import { site } from '../../site.config.js';
import { policies } from '../../content/policies.js';
import { money } from '@/lib/format';
import { Seo } from '@/lib/seo';
import { SmartLink } from '@/components/site/SmartLink';
import { PageHero } from './PageHero';

/** Values for the {{tokens}} in content/policies.js, built only from confirmed details. */
export function policyTokens(): Record<string, string> {
  const co = site.company;
  const c = site.contact;
  const g: any = c.grievanceOfficer;
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

export const fillTokens = (text: string, tokens: Record<string, string>) => text.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in tokens ? tokens[k] : m)).replace(/\s{2,}/g, ' ');

/** Text with email addresses turned into mailto links. */
const Linked = ({ text }: { text: string }) => (
  <>
    {text.split(/([\w.+-]+@[\w-]+\.[\w.-]+\w)/g).map((part, i) =>
      i % 2 ? (
        <a key={i} className="text-link" href={`mailto:${part}`}>
          {part}
        </a>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    )}
  </>
);

export default function Policy({ policy }: { policy: 'shipping' | 'privacy' | 'terms' }) {
  const pol: any = (policies as any)[policy];
  const published = (policies as any).published?.[policy];
  const t = policyTokens();
  const path = { shipping: '/shipping-returns', privacy: '/privacy', terms: '/terms' }[policy];
  return (
    <>
      <Seo title={pol.title} description={`${pol.title} — ${site.brand.name}.`} path={path} />
      <div className="container-x max-w-4xl pb-[var(--section)]">
        <PageHero eyebrow="Policies" title={pol.title} />
        <div className="prose-gc">
          {published ? (
            <>
              <p className="lede">
                <Linked text={fillTokens(pol.intro, t)} />
              </p>
              {pol.sections.map((s: any) => (
                <Fragment key={s.h}>
                  <h2>{s.h}</h2>
                  {s.p && (
                    <p>
                      <Linked text={fillTokens(s.p, t)} />
                    </p>
                  )}
                  {s.list && (
                    <ul>
                      {s.list.map((li: string) => (
                        <li key={li}>
                          <Linked text={fillTokens(li, t)} />
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.after && (
                    <p>
                      <Linked text={fillTokens(s.after, t)} />
                    </p>
                  )}
                </Fragment>
              ))}
              {(policies as any).updated && <p className="text-sm text-cocoa-3">Last updated: {(policies as any).updated}</p>}
            </>
          ) : (
            <>
              <p>Our shop is not open yet. Our {pol.title.toLowerCase()} will be published here before we take our first order.</p>
              <p>
                Questions in the meantime?{' '}
                <SmartLink href="/contact" className="text-link">
                  Contact us
                </SmartLink>
                .
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
