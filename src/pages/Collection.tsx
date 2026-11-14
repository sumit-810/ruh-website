import { useParams } from 'react-router';
import { motion } from 'motion/react';
import { getCollection, allItems, isPurchasable } from '@/lib/catalog.js';
import { Seo } from '@/lib/seo';
import { Picture } from '@/components/site/Picture';
import { ProductCard } from '@/components/site/ProductCard';
import { WaitlistForm } from '@/components/site/WaitlistForm';
import { Reveal } from '@/components/site/Reveal';
import NotFound from './NotFound';

const EASE = [0.16, 1, 0.3, 1] as const;

export default function Collection() {
  const { handle } = useParams();
  const c = getCollection(handle || '');
  if (!c) return <NotFound />;
  const items = allItems(c.handle);
  const live = items.some((x: any) => x.kind === 'product' && isPurchasable(x.item));
  return (
    <>
      <Seo title={c.name} description={`${c.name} from Gentle Company — ${c.intro}`} path={`/collections/${c.handle}`} />
      <div className="container-x">
        <header className="grid items-end gap-8 pt-10 pb-12 md:grid-cols-2 md:gap-14 md:pt-16">
          <div className="order-2 md:order-1">
            <motion.p className="eyebrow mb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
              Collection · {items.length} products
            </motion.p>
            <motion.h1 className="display-xl" initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1, ease: EASE }}>
              {c.headline}
            </motion.h1>
            <motion.p className="lede mt-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.9, ease: EASE }}>
              {c.intro}
            </motion.p>
          </div>
          <motion.div className="order-1 aspect-[4/5] overflow-hidden rounded-2xl bg-sand md:order-2 md:aspect-[5/4]" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: EASE }}>
            <Picture image={c.image} alt={c.imageAlt} sizes="(min-width: 768px) 46vw, 100vw" priority />
          </motion.div>
        </header>
        <p className="mb-8 border-y border-line py-4 text-sm text-cocoa-3">{live ? 'Shop now, and see what’s next' : 'Launching soon — tap any product for a closer look'}</p>
        <Reveal className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6" stagger={0.08}>
          {items.map((x: any) => (
            <div key={x.item.handle} id={x.item.handle} className="scroll-mt-28">
              <ProductCard entry={x} sizes="(min-width: 768px) 30vw, 48vw" />
            </div>
          ))}
        </Reveal>
      </div>
      <section id="waitlist" className="section-y" aria-labelledby="wl-title">
        <div className="container-x mx-auto max-w-xl text-center">
          <Reveal>
            <h2 id="wl-title" className="display-md mb-8">
              Hear first about <em>{c.name.toLowerCase()}.</em>
            </h2>
            <WaitlistForm cta="Sign up" hidden={{ interests: c.name }} className="text-left" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
