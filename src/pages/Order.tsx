import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Info } from 'lucide-react';
import { site } from '../../site.config.js';
import { storage } from '@/lib/storage.js';
import { money } from '@/lib/format';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { SmartLink } from '@/components/site/SmartLink';
import { ArrowLink } from '@/components/site/ArrowLink';

/** Order confirmation, shown after a verified online payment or a placed cash-on-delivery order. */
export default function Order() {
  const [params] = useSearchParams();
  const ref = params.get('ref');
  const [o, setO] = useState<any>(undefined);
  useEffect(() => setO(storage.get('gc.lastOrder.v1')), []);
  if (o === undefined) return <Seo title="Order confirmed" noindex />;
  if (!o || o.reference !== ref) {
    return (
      <>
        <Seo title="Order details" noindex />
        <section className="container-x flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-6 py-20">
          <h1 className="display-lg">
            Order <em>details</em>
          </h1>
          <p className="lede">We can’t show this order on this device. If you placed an order, your reference is in the confirmation from our payment partner — contact us and we’ll help.</p>
          <Button asChild>
            <SmartLink href="/contact">Contact us</SmartLink>
          </Button>
        </section>
      </>
    );
  }
  const cod = o.method === 'cod';
  const care = site.contact.email;
  return (
    <>
      <Seo title="Order confirmed" noindex />
      <section className="container-x max-w-2xl py-20">
        <p className="eyebrow">{cod ? 'Order placed' : 'Payment received'}</p>
        <h1 className="display-lg mt-4">
          Thank you. <em>{cod ? 'Your order is placed.' : 'Your order is confirmed.'}</em>
        </h1>
        <p className="lede mt-5">
          Your reference is <strong className="font-medium">{o.reference}</strong>. Please keep it for any questions about this order.
        </p>
        <div className="mt-10 rounded-2xl bg-porcelain p-6">
          <ul className="divide-y divide-line">
            {o.items.map((i: any) => (
              <li key={i.sku + i.name} className="flex justify-between py-3 text-sm">
                <span>
                  {i.name} · {i.size} × {i.qty}
                </span>
                <span>{money(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-line py-3 text-sm">
            <span>Delivery</span>
            <span>{o.delivery ? money(o.delivery) : 'Free'}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-4">
            <span>{cod ? 'To pay on delivery' : 'Paid'}</span>
            <strong className="font-medium">{money(o.total)}</strong>
          </div>
          {o.paymentId && <p className="mt-3 text-xs text-cocoa-3">Payment ID: {o.paymentId}</p>}
        </div>
        <div className="mt-8 flex gap-3 rounded-xl bg-sand p-5 text-sm">
          <Info className="size-5 shrink-0" strokeWidth={1.3} />
          <span>
            {cod ? 'We’ll contact you to confirm your cash-on-delivery order before it ships.' : 'Your payment has been verified.'} {o.email ? `We’ll write to ${o.email} with delivery updates.` : ''}
            {care && (
              <>
                {' '}
                Questions?{' '}
                <a className="text-link" href={`mailto:${care}`}>
                  {care}
                </a>
                .
              </>
            )}
          </span>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <Button asChild>
            <SmartLink href="/">Back to home</SmartLink>
          </Button>
          <ArrowLink href="/journal">How to wear a body mist</ArrowLink>
        </div>
      </section>
    </>
  );
}
