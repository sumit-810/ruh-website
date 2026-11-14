import { ArrowRight, Lock } from 'lucide-react';
import { site } from '../../../site.config.js';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { bag, useBag } from '@/lib/cart';
import { productUrl } from '@/lib/catalog.js';
import { quote } from '@/lib/pricing.js';
import { money } from '@/lib/format';
import { QtyControl } from './QtyControl';
import { SmartLink } from './SmartLink';
import { thumb } from './Picture';
import { useUI } from './ui';

/** Bag drawer — only mounted when the shop is open (site.commerce.enabled). */
export function BagSheet() {
  const { bagOpen, setBagOpen } = useUI();
  const { lines, count, subtotal } = useBag();
  const close = () => setBagOpen(false);
  const { freeAbove, flatRate } = site.shipping;
  const q = quote(lines.map((l) => ({ handle: l.handle, variantId: l.variantId, qty: l.qty })));
  const pct = freeAbove ? Math.min(100, Math.round((q.subtotal / freeAbove) * 100)) : 0;

  return (
    <Sheet open={bagOpen} onOpenChange={setBagOpen}>
      <SheetContent side="right" className="w-full gap-0 border-line bg-milk p-0 sm:max-w-md">
        <div className="border-b border-line px-6 py-5">
          <SheetTitle className="font-display text-3xl font-normal">
            Your bag <span className="text-base text-cocoa-3">({count})</span>
          </SheetTitle>
          <SheetDescription className="sr-only">Items in your bag</SheetDescription>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!lines.length ? (
            <div className="flex flex-col items-start gap-4 py-10">
              <p className="font-display text-3xl">Your bag is empty.</p>
              <p className="text-sm text-cocoa-3">Begin with our first ritual.</p>
              <Button asChild>
                <SmartLink href="/products/body-mist-no-01" onClick={close}>
                  Shop Body Mist
                </SmartLink>
              </Button>
            </div>
          ) : (
            <>
              {flatRate && freeAbove ? (
                <div className="mb-5 rounded-xl bg-sand p-4 text-sm" role="status">
                  {(q.freeDeliveryRemaining ?? 0) > 0 ? `You are ${money(q.freeDeliveryRemaining)} away from free delivery.` : 'Your order qualifies for free delivery.'}
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-oat">
                    <span className="block h-full rounded-full bg-cocoa transition-[width] duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ) : null}
              <ul className="divide-y divide-line">
                {lines.map((l) => (
                  <li key={l.handle + l.variantId} className="grid grid-cols-[72px_1fr] gap-4 py-4">
                    <SmartLink href={productUrl(l.product)} onClick={close} tabIndex={-1} aria-hidden>
                      <img src={thumb(l.product.images[0]?.key)} alt="" width={72} height={90} className="rounded-lg object-cover" />
                    </SmartLink>
                    <div className="grid gap-1">
                      <div className="flex justify-between gap-3">
                        <SmartLink href={productUrl(l.product)} onClick={close} className="font-display text-xl leading-tight">
                          {l.product.name}
                        </SmartLink>
                        <span className="text-sm">{money(l.lineTotal)}</span>
                      </div>
                      <p className="text-xs text-cocoa-3">{[l.product.category, l.variant.size].filter(Boolean).join(' · ')}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <QtyControl value={l.qty} max={bag.max()} label={l.product.name} onChange={(v) => bag.setQty(l.handle, l.variantId, v)} />
                        <button type="button" className="text-xs text-cocoa-3 underline underline-offset-2 cursor-pointer" onClick={() => bag.remove(l.handle, l.variantId)}>
                          Remove<span className="sr-only"> {l.product.name}</span>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        {lines.length > 0 && (
          <div className="grid gap-3 border-t border-line px-6 py-5">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong className="font-medium">{money(subtotal)}</strong>
            </div>
            <p className="text-xs text-cocoa-3">Prices are MRP, inclusive of all taxes. {flatRate ? 'Delivery is calculated at checkout.' : 'Free delivery.'}</p>
            <Button asChild size="lg" className="w-full">
              <SmartLink href="/checkout" onClick={close}>
                <Lock strokeWidth={1.4} /> Checkout <ArrowRight strokeWidth={1.4} />
              </SmartLink>
            </Button>
            <p className="text-center text-xs text-cocoa-3">Secure payment by Razorpay · UPI, cards, net banking, wallets</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
