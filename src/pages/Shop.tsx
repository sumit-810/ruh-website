import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { collections } from '../../site.config.js';
import { allItems } from '@/lib/catalog.js';
import { cn } from '@/lib/utils';
import { Seo } from '@/lib/seo';
import { ProductCard } from '@/components/site/ProductCard';
import { PageHero } from './PageHero';

/** Shop all: the whole range, filterable by line (synced to the URL as ?cat=). */
export default function Shop() {
  const [params, setParams] = useSearchParams();
  // the prerendered page has no query string, so read ?cat= only after hydration
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const cat = (hydrated && params.get('cat')) || 'all';
  const tabs = [{ key: 'all', label: 'All' }, ...collections.map((c: any) => ({ key: c.handle, label: c.name }))];
  const items = allItems(cat === 'all' ? null : cat);
  return (
    <>
      <Seo title="Shop all" description="Body Mist Nº 01 and the Gentle Company range: body, face and lip care." path="/shop" />
      <div className="container-x pb-[var(--section)]">
        <PageHero eyebrow={`${items.length} ${items.length === 1 ? 'product' : 'products'}`} title="Shop *all*" />
        <div role="tablist" aria-label="Filter by category" className="no-scrollbar mb-10 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === cat}
              onClick={() => setParams(t.key === 'all' ? {} : { cat: t.key }, { replace: true, preventScrollReset: true })}
              className={cn('relative h-10 shrink-0 rounded-full border px-5 text-[0.7rem] tracking-[0.14em] uppercase transition-colors cursor-pointer', t.key === cat ? 'border-cocoa text-milk' : 'border-stone hover:border-cocoa')}
            >
              {t.key === cat && <motion.span layoutId="shop-tab" className="absolute inset-0 -z-[1] rounded-full bg-cocoa" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
        <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          <AnimatePresence mode="popLayout">
            {items.map((x: any, i: number) => (
              <motion.div key={x.item.handle} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.6, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}>
                <ProductCard entry={x} sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 48vw" />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
