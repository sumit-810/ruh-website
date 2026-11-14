import { useEffect, useState } from 'react';
import { getProduct, getUpcoming, getCollection, productUrl, upcomingUrl, isPurchasable, fromPrice, defaultVariant, statusOf } from '@/lib/catalog.js';
import { bag } from '@/lib/cart';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Picture } from './Picture';
import { WaitlistForm } from './WaitlistForm';
import { ArrowLink } from './ArrowLink';
import { useUI } from './ui';

/** Quick view: explore any item without leaving the page. */
export function QuickView() {
  const { quickView, setQuickView, setBagOpen } = useUI();
  const [active, setActive] = useState(0);
  useEffect(() => setActive(0), [quickView]);
  const product = quickView ? getProduct(quickView) : null;
  const item = product || (quickView ? getUpcoming(quickView) : null);
  const col = item ? getCollection(item.collection) : null;
  const keys: string[] = product ? product.images.slice(0, 3).map((i: any) => i.key) : item ? [item.image, col?.image].filter(Boolean) : [];
  const buyable = product && isPurchasable(product);
  const status = item ? statusOf(item) : null;

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && setQuickView(null)}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-y-auto rounded-2xl border-none bg-porcelain p-0 sm:max-w-4xl">
        {item && (
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/5] bg-sand md:aspect-auto md:min-h-[520px]">
              {keys.map((k, i) => (
                <div key={k} className={cn('absolute inset-0 transition-opacity duration-500', i === active ? 'opacity-100' : 'opacity-0')}>
                  <Picture image={k} alt={i === 0 ? item.name : ''} sizes="(min-width: 768px) 448px, 100vw" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-5 p-7 md:p-10">
              <p className="eyebrow">{product ? product.category : col?.name}</p>
              <DialogTitle className="display-md font-display font-normal">{item.name}</DialogTitle>
              <DialogDescription className="lede">{product ? product.shortDescription : item.line}</DialogDescription>
              {keys.length > 1 && (
                <div className="flex gap-2">
                  {keys.map((k, i) => (
                    <button key={k} type="button" onClick={() => setActive(i)} aria-label={`Image ${i + 1}`} aria-current={i === active} className={cn('h-16 w-13 overflow-hidden rounded-lg border transition cursor-pointer', i === active ? 'border-cocoa' : 'border-transparent opacity-70')}>
                      <Picture image={k} sizes="64px" />
                    </button>
                  ))}
                </div>
              )}
              {buyable ? (
                <>
                  <p className="text-xl">{money(fromPrice(product))}</p>
                  <Button
                    onClick={() => {
                      if (bag.add(product.handle, defaultVariant(product).id, 1)) {
                        setQuickView(null);
                        setBagOpen(true);
                      }
                    }}
                  >
                    Add to bag
                  </Button>
                </>
              ) : (
                <>
                  {status && <span className="text-[0.65rem] tracking-[0.14em] text-clay uppercase">{status}</span>}
                  <WaitlistForm item={item.name} cta="Notify me" compact />
                </>
              )}
              <ArrowLink href={product ? productUrl(product) : upcomingUrl(item)} className="mt-auto self-start" onClick={() => setQuickView(null)}>
                {product ? 'View full details' : `Explore ${col?.name || 'the range'}`}
              </ArrowLink>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
