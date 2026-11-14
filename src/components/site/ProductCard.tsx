import { Eye } from 'lucide-react';
import { productUrl, upcomingUrl, fromPrice, defaultVariant, getCollection, isPurchasable, statusOf } from '@/lib/catalog.js';
import { bag } from '@/lib/cart';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import GlareHover from '@/components/reactbits/GlareHover';
import { Picture } from './Picture';
import { SmartLink } from './SmartLink';
import { useUI } from './ui';

const TONES: Record<string, string> = {
  apricot: 'bg-apricot-soft',
  milk: 'bg-porcelain',
  rose: 'bg-rose-soft',
};

/**
 * One card for every item in the range. Products link to their page; the rest
 * of the range links to its collection and opens a quick view. A glass-like
 * sheen (React Bits GlareHover) passes over the image on hover.
 */
export function ProductCard({ entry, sizes = '(min-width: 1100px) 24vw, (min-width: 700px) 32vw, 72vw', className }: { entry: { kind: string; item: any }; sizes?: string; className?: string }) {
  const { setQuickView, setBagOpen } = useUI();
  const { kind, item } = entry;
  const col = getCollection(item.collection);
  const isProduct = kind === 'product';
  const url = isProduct ? productUrl(item) : upcomingUrl(item);
  const img = isProduct ? item.images[0]?.key : item.image;
  const alt = isProduct ? item.images[2]?.key : col?.image;
  const status = statusOf(item);
  const buyable = isProduct && isPurchasable(item);

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className={cn('relative aspect-[4/5] overflow-hidden rounded-2xl', TONES[col?.tone] || 'bg-sand')}>
        <GlareHover width="100%" height="100%" borderRadius="1rem" glareColor="#fffaf3" glareOpacity={0.55} glareSize={60} variant="sheen" rimGlint={false} className="!grid border-0">
          <SmartLink href={url} tabIndex={-1} aria-hidden className="absolute inset-0">
            <Picture image={img} sizes={sizes} className="absolute inset-0" imgClassName="transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-[1.04]" />
            {alt && (
              <span className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 max-md:hidden">
                <Picture image={alt} sizes={sizes} />
              </span>
            )}
          </SmartLink>
        </GlareHover>
        {isProduct && item.badge && (
          <span className="absolute top-3 left-3 z-[3] rounded-full bg-porcelain/90 px-3 py-1 text-[0.62rem] tracking-[0.16em] uppercase backdrop-blur">{item.badge}</span>
        )}
        <button
          type="button"
          onClick={() => setQuickView(item.handle)}
          className="absolute right-3 bottom-3 left-3 z-[3] flex h-10 translate-y-2 items-center justify-center gap-2 rounded-full bg-porcelain/85 text-[0.68rem] tracking-[0.16em] uppercase opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 max-md:hidden cursor-pointer"
          aria-label={`Quick view: ${item.name}`}
        >
          <Eye className="size-3.5" strokeWidth={1.4} /> Quick view
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 pt-4">
        <p className="eyebrow !text-[0.62rem]">{isProduct ? item.category : col?.name}</p>
        <h3 className="font-display text-[1.45rem] leading-tight">
          <SmartLink href={url} className="after:absolute after:inset-0 after:z-[1] md:after:hidden">
            {item.name}
          </SmartLink>
        </h3>
        <p className="text-sm text-cocoa-3">{isProduct ? item.tagline : item.line}</p>
        <div className="relative z-[2] mt-auto flex items-center justify-between pt-3">
          {buyable ? (
            <>
              <span className="text-sm">{money(fromPrice(item))}</span>
              <Button
                size="sm"
                onClick={() => {
                  if (bag.add(item.handle, defaultVariant(item).id, 1)) setBagOpen(true);
                }}
              >
                Add
              </Button>
            </>
          ) : (
            status && (
              <span className={cn('inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.14em] uppercase', isProduct ? 'text-clay' : 'text-cocoa-3')}>
                <span className={cn('size-1.5 rounded-full', isProduct ? 'bg-clay animate-pulse' : 'bg-stone')} />
                {status}
              </span>
            )
          )}
        </div>
      </div>
    </article>
  );
}
