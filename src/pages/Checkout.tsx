import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Lock } from 'lucide-react';
import { site } from '../../site.config.js';
import { bag, useBag } from '@/lib/cart';
import { quote } from '@/lib/pricing.js';
import { storage } from '@/lib/storage.js';
import { send, validateForm } from '@/lib/forms';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { SmartLink } from '@/components/site/SmartLink';
import { thumb } from '@/components/site/Picture';
import { useUI } from '@/components/site/ui';
import { Field } from './Field';

const STATES = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];
const RAZORPAY_JS = 'https://checkout.razorpay.com/v1/checkout.js';
const LAST_ORDER = 'gc.lastOrder.v1';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadRazorpay = () =>
  window.Razorpay
    ? Promise.resolve(window.Razorpay)
    : new Promise<any>((resolve, reject) => {
        const s = document.createElement('script');
        s.src = RAZORPAY_JS;
        s.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('razorpay-missing')));
        s.onerror = () => reject(new Error('razorpay-unreachable'));
        document.head.append(s);
      });

const postJson = async (url: string, body: unknown) => {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON (e.g. a static server answering 404) */
  }
  return { ok: res.ok, status: res.status, data };
};

function Closed({ title, text }: { title: React.ReactNode; text: string }) {
  return (
    <section className="container-x flex min-h-[60vh] max-w-2xl flex-col items-start justify-center gap-6 py-20">
      <h1 className="display-lg">{title}</h1>
      <p className="lede">{text}</p>
      <Button asChild>
        <SmartLink href="/products/body-mist-no-01">Discover Body Mist</SmartLink>
      </Button>
    </section>
  );
}

/**
 * Checkout.
 * - Online: the server prices the bag (/api/create-order), Razorpay Checkout takes payment,
 *   /api/verify-payment checks the signature before the order is confirmed.
 * - Cash on delivery (if enabled in site.shipping.cod): the order is emailed to the business via /api/contact.
 * - Only works as a checkout when site.commerce.enabled is true.
 */
export default function Checkout() {
  const navigate = useNavigate();
  const { setBagOpen } = useUI();
  const { lines } = useBag();
  const [hydrated, setHydrated] = useState(false);
  const [method, setMethod] = useState<'online' | 'cod'>('online');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ tone: 'info' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => setHydrated(true), []);
  const cod: any = site.shipping.cod || {};

  if (!site.commerce.enabled) {
    return (
      <>
        <Seo title="Checkout" noindex path="/checkout" />
        <Closed title={<>Our shop opens <em>soon.</em></>} text="Body Mist Nº 01 is launching soon. Leave your email on the product page and we’ll write as soon as it’s available." />
      </>
    );
  }
  if (!hydrated) return <Seo title="Checkout" noindex path="/checkout" />;
  if (!lines.length) {
    return (
      <>
        <Seo title="Checkout" noindex path="/checkout" />
        <Closed title={<>Your bag is <em>empty.</em></>} text="Add something to your bag before checking out." />
      </>
    );
  }

  const plain = lines.map((l) => ({ handle: l.handle, variantId: l.variantId, qty: l.qty }));
  const q = quote(plain, { paymentMethod: method });
  const say = (tone: 'info' | 'error', text: string) => setStatus({ tone, text });
  const customer = () => {
    const d = Object.fromEntries(new FormData(formRef.current!)) as Record<string, string>;
    delete d.method;
    return d;
  };
  const complete = (order: any) => {
    storage.set(LAST_ORDER, { ...order, placedAt: new Date().toISOString() });
    bag.clear();
    navigate(`/order?ref=${encodeURIComponent(order.reference)}`);
  };

  const payOnline = async () => {
    let created: { ok: boolean; status: number; data?: any };
    try {
      created = await postJson('/api/create-order', { lines: plain, customer: customer() });
    } catch {
      created = { ok: false, status: 0 };
    }
    if (!created.ok) {
      const code = created.data?.error;
      if (code === 'invalid-bag') return say('error', 'Something in your bag is no longer available. Please review your bag and try again.');
      if (code === 'invalid-customer') return say('error', 'Please check your contact and delivery details and try again.');
      return say('error', 'We couldn’t start the payment. Nothing has been charged — please try again in a moment.');
    }
    let Razorpay: any;
    try {
      Razorpay = await loadRazorpay();
    } catch {
      return say('error', 'The payment window couldn’t load. Please check your connection and try again. Nothing has been charged.');
    }
    const o = created.data;
    const c = customer();
    const rzp = new Razorpay({
      key: o.keyId,
      order_id: o.orderId,
      amount: o.amount,
      currency: o.currency,
      name: o.merchant.name,
      description: o.merchant.description,
      prefill: { name: c.name, email: c.email, contact: c.phone },
      notes: { receipt: o.receipt },
      theme: { color: '#2e231d' },
      modal: { ondismiss: () => say('info', 'Payment window closed. Nothing has been charged — you can try again whenever you’re ready.') },
      handler: async (response: any) => {
        say('info', 'Confirming your payment…');
        let verified: { ok: boolean; data?: any };
        try {
          verified = await postJson('/api/verify-payment', response);
        } catch {
          verified = { ok: false };
        }
        if (verified.ok && verified.data?.verified) {
          complete({ reference: verified.data.receipt || o.receipt, paymentId: response.razorpay_payment_id, method: 'online', items: o.quote.items, total: o.quote.total, delivery: o.quote.delivery, email: c.email });
        } else {
          say('error', `We received a response from the payment provider but couldn’t confirm it. Please don’t pay again — contact us with this reference: ${o.receipt}.`);
        }
      },
    });
    rzp.on('payment.failed', (r: any) => say('error', `Payment failed${r?.error?.description ? `: ${r.error.description}` : ''}. Nothing has been charged — please try again or use another method.`));
    rzp.open();
  };

  const placeCod = async () => {
    const qc = quote(plain, { paymentMethod: 'cod' });
    if (qc.errors.length) return say('error', qc.errors[0]);
    const reference = `GC-COD-${Date.now().toString(36).toUpperCase()}`;
    const c = customer();
    const result = await send('cod-order', { ...c, reference, items: qc.items.map((i: any) => `${i.name} (${i.size}) x${i.qty}`).join('; '), total: String(qc.total) });
    if (result.ok) return complete({ reference, method: 'cod', items: qc.items, total: qc.total, delivery: qc.delivery, email: c.email });
    say('error', 'We couldn’t place your order. Nothing has been charged — please try again.');
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validateForm(e.currentTarget);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await (method === 'cod' ? placeCod() : payOnline());
    } finally {
      setBusy(false);
    }
  };

  const input = (name: string, props: React.InputHTMLAttributes<HTMLInputElement> & { rules?: string }) => {
    const { rules, ...rest } = props;
    return (
      <input
        id={`co-${name}`}
        name={name}
        className="field-input"
        data-validate={rules || undefined}
        aria-invalid={errors[name] ? true : undefined}
        aria-describedby={`co-${name}-err`}
        onInput={() => errors[name] && setErrors({ ...errors, [name]: '' })}
        {...rest}
      />
    );
  };

  return (
    <>
      <Seo title="Checkout" noindex path="/checkout" />
      <div className="container-x pt-12 pb-[var(--section)]">
        <p className="eyebrow">Checkout</p>
        <h1 className="display-lg mt-3 mb-10">
          Almost <em>yours.</em>
        </h1>
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <form ref={formRef} noValidate onSubmit={onSubmit} className="grid gap-10">
            <fieldset className="grid gap-4">
              <legend className="display-sm mb-4 font-display">Contact</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="co-email" label="Email" error={errors.email}>
                  {input('email', { type: 'email', autoComplete: 'email', inputMode: 'email', rules: 'required email' })}
                </Field>
                <Field id="co-phone" label="Mobile number" error={errors.phone}>
                  {input('phone', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '10-digit mobile', rules: 'required phoneIN' })}
                </Field>
              </div>
            </fieldset>
            <fieldset className="grid gap-4">
              <legend className="display-sm mb-4 font-display">Delivery address</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="co-name" label="Full name" error={errors.name} className="sm:col-span-2">
                  {input('name', { autoComplete: 'name', rules: 'required' })}
                </Field>
                <Field id="co-address1" label="Address line 1" error={errors.address1} className="sm:col-span-2">
                  {input('address1', { autoComplete: 'address-line1', rules: 'required' })}
                </Field>
                <Field id="co-address2" label="Address line 2 (optional)" className="sm:col-span-2">
                  {input('address2', { autoComplete: 'address-line2' })}
                </Field>
                <Field id="co-city" label="City" error={errors.city}>
                  {input('city', { autoComplete: 'address-level2', rules: 'required' })}
                </Field>
                <Field id="co-pin" label="PIN code" error={errors.pin}>
                  {input('pin', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6, rules: 'required pin' })}
                </Field>
                <Field id="co-state" label="State / UT" error={errors.state} className="sm:col-span-2">
                  <select id="co-state" name="state" className="field-input" autoComplete="address-level1" data-validate="required" defaultValue="" aria-invalid={errors.state ? true : undefined} aria-describedby="co-state-err">
                    <option value="">Select</option>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </fieldset>
            <fieldset className="grid gap-4">
              <legend className="display-sm mb-4 font-display">Payment</legend>
              <div role="radiogroup" aria-label="Payment method" className="flex flex-wrap gap-2">
                <label className="chip">
                  <input type="radio" name="method" value="online" checked={method === 'online'} onChange={() => setMethod('online')} className="sr-only" />
                  <span>Pay online</span>
                </label>
                {cod.enabled && (
                  <label className="chip">
                    <input type="radio" name="method" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} className="sr-only" />
                    <span>Cash on delivery{cod.fee ? ` (+${money(cod.fee)})` : ''}</span>
                  </label>
                )}
              </div>
              <div className="grid gap-2 rounded-2xl bg-sand p-5 text-sm text-cocoa-2">
                <strong className="font-medium text-cocoa">Secure payment by Razorpay</strong>
                <span>Choose UPI, cards, net banking or wallets in the next step. We never see or store your card details.</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['UPI', 'Cards', 'Net banking', 'Wallets'].map((m) => (
                    <span key={m} className="rounded-full border border-cocoa/15 px-3 py-1 text-xs">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </fieldset>
            <div className="grid gap-3">
              <Button type="submit" size="lg" disabled={busy} className="w-full">
                <Lock strokeWidth={1.4} />
                {method === 'cod' ? `Place order — ${money(q.total)}` : `Pay ${money(q.total)}`}
              </Button>
              <p className="text-xs text-cocoa-3">
                By placing your order you agree to our{' '}
                <SmartLink className="text-link" href="/terms">
                  terms
                </SmartLink>{' '}
                and{' '}
                <SmartLink className="text-link" href="/shipping-returns">
                  shipping &amp; returns policy
                </SmartLink>
                . Sold by {site.company.legalName || site.company.name}.
              </p>
              {status && (
                <p role="status" className={cn('rounded-xl px-4 py-3 text-sm', status.tone === 'error' ? 'bg-[#f6e3dc] text-error' : 'bg-sand')}>
                  {status.text}
                </p>
              )}
            </div>
          </form>
          <aside aria-label="Order summary" className="h-fit rounded-2xl bg-porcelain p-6 lg:sticky lg:top-24">
            <h2 className="display-sm mb-4">Order summary</h2>
            <ul className="divide-y divide-line">
              {lines.map((l) => (
                <li key={l.handle + l.variantId} className="grid grid-cols-[56px_1fr] gap-3 py-3">
                  <img src={thumb(l.product.images[0].key)} alt="" width={56} height={70} className="rounded-md object-cover" />
                  <div>
                    <div className="flex justify-between gap-2 text-sm">
                      <span>{l.product.name}</span>
                      <span>{money(l.lineTotal)}</span>
                    </div>
                    <p className="text-xs text-cocoa-3">{[l.variant.size, `Qty ${l.qty}`].filter(Boolean).join(' · ')}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="grid gap-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal (MRP, incl. taxes)</span>
                <span>{money(q.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{q.delivery ? money(q.delivery) : 'Free'}</span>
              </div>
              {q.codFee > 0 && (
                <div className="flex justify-between">
                  <span>Cash on delivery fee</span>
                  <span>{money(q.codFee)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between border-t border-line pt-3 text-base">
                <span>Total</span>
                <strong className="font-medium">{money(q.total)}</strong>
              </div>
              {q.freeDeliveryRemaining ? <p className="text-xs text-cocoa-3">Add {money(q.freeDeliveryRemaining)} more for free delivery.</p> : null}
              <button type="button" className="link-arrow mt-2 justify-self-start cursor-pointer" onClick={() => setBagOpen(true)}>
                Edit bag
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
