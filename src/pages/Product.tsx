import { useEffect, useRef, useState, type FormEvent, type CSSProperties } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { site } from '../../site.config.js';
import { getProduct, getUpcoming, getCollection, collectionUrl, defaultVariant, getVariant, isPurchasable, allItems } from '@/lib/catalog.js';
import { bag, recent } from '@/lib/cart';
import { money } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Picture, thumb } from '@/components/site/Picture';
import { ProductCard } from '@/components/site/ProductCard';
import { WaitlistForm } from '@/components/site/WaitlistForm';
import { QtyControl } from '@/components/site/QtyControl';
import { SmartLink } from '@/components/site/SmartLink';
import { NotesBlock } from '@/components/site/NotesBlock';
import { Reveal } from '@/components/site/Reveal';
import { useUI } from '@/components/site/ui';
import { scrollToEl } from '@/components/site/SmoothScroll';
import NotFound from './NotFound';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Gallery: cross-fading slides, thumbnails, arrows, swipe, keyboard, and pointer-following zoom. */
function Gallery({ p }: { p: any }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const x0 = useRef<number | null>(null);
  const n = p.images.length;
  const go = (k: number) => {
    setZoom(null);
    setI((k + n) % n);
  };
  return (
    <div className="flex min-w-0 flex-col-reverse gap-3 lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:grid lg:grid-cols-[76px_1fr] lg:gap-4" aria-roledescription="carousel" aria-label={`${p.name} images`}>
      <div className="no-scrollbar flex min-w-0 gap-2 overflow-x-auto lg:flex-col">
        {p.images.map((im: any, k: number) => (
          <button
            key={im.key}
            type="button"
            onClick={() => go(k)}
            aria-label={`Image ${k + 1}: ${im.alt}`}
            aria-current={k === i}
            className={cn('aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-lg border transition-all lg:w-full cursor-pointer', k === i ? 'border-cocoa' : 'border-transparent opacity-60 hover:opacity-100')}
          >
            <Picture image={im.key} sizes="80px" />
          </button>
        ))}
      </div>
      <div
        className={cn('group relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand', zoom ? 'cursor-zoom-out' : 'md:cursor-zoom-in')}
        tabIndex={0}
        aria-label="Product images — use arrow keys to browse, click to zoom"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(i + 1);
          if (e.key === 'ArrowLeft') go(i - 1);
        }}
        onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (x0.current === null) return;
          const dx = e.changedTouches[0].clientX - x0.current;
          if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
          x0.current = null;
        }}
        onClick={(e) => {
          if (!window.matchMedia('(hover: hover)').matches || (e.target as HTMLElement).closest('button')) return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom(zoom ? null : { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseMove={(e) => {
          if (!zoom) return;
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={i}
            className={cn('absolute inset-0', zoom && '[&_img]:scale-[2]')}
            style={{ '--zx': `${zoom?.x ?? 50}%`, '--zy': `${zoom?.y ?? 50}%` } as CSSProperties}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <Picture image={p.images[i].key} alt={p.images[i].alt} sizes="(min-width: 1024px) 52vw, 100vw" priority={i === 0} imgClassName="origin-[var(--zx)_var(--zy)] transition-transform duration-500" />
          </motion.div>
        </AnimatePresence>
        {[
          { d: -1, Icon: ArrowLeft, label: 'Previous image', pos: 'left-3' },
          { d: 1, Icon: ArrowRight, label: 'Next image', pos: 'right-3' },
        ].map(({ d, Icon, label, pos }) => (
          <button key={d} type="button" aria-label={label} onClick={() => go(i + d)} className={cn('absolute top-1/2 z-10 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-porcelain/80 opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100 cursor-pointer', pos)}>
            <Icon className="size-4" strokeWidth={1.3} />
          </button>
        ))}
        <span className="absolute right-4 bottom-4 z-10 rounded-full bg-porcelain/80 px-3 py-1 text-xs tabular-nums backdrop-blur" aria-hidden>
          {i + 1} / {n}
        </span>
      </div>
    </div>
  );
}

function BuyBox({ p }: { p: any }) {
  const { setBagOpen } = useUI();
  const navigate = useNavigate();
  const [variantId, setVariantId] = useState(defaultVariant(p).id);
  const [qty, setQty] = useState(1);
  const v = getVariant(p, variantId) || defaultVariant(p);

  if (!isPurchasable(p)) {
    return (
      <div id="notify" className="grid gap-4 rounded-2xl border border-line bg-porcelain p-6 sm:p-8">
        <span className="inline-flex items-center gap-2 text-[0.68rem] tracking-[0.16em] text-clay uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-clay" />
          {p.statusLabel || 'Coming soon'}
        </span>
        <h2 className="display-sm">Be the first to know.</h2>
        <p className="text-sm text-cocoa-2">We’ll write to you as soon as {p.name} is available.</p>
        <WaitlistForm item={p.name} cta="Notify me" />
      </div>
    );
  }
  const variants = p.variants.filter((x: any) => x.price > 0);
  const notes: { text: string }[] = site.commerce.serviceNotes || [];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (bag.add(p.handle, v.id, qty)) {
      setQty(1);
      setBagOpen(true);
    }
  };
  return (
    <form id="main-buy" className="grid gap-5" onSubmit={submit}>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-2xl">{money(v.price)}</span>
        {v.size && <span className="text-cocoa-3">{v.size}</span>}
        <span className="text-xs text-cocoa-3">MRP inclusive of all taxes</span>
      </div>
      {variants.length > 1 && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Size</legend>
          {variants.map((x: any) => (
            <label key={x.id} className="chip">
              <input type="radio" name="variant" value={x.id} checked={x.id === v.id} disabled={!x.available} onChange={() => setVariantId(x.id)} className="sr-only" />
              <span>{x.size}</span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="flex gap-3">
        <QtyControl value={qty} onChange={setQty} max={bag.max()} label={p.name} large />
        <Button type="submit" size="default" className="flex-1">
          Add to bag — {money(v.price * qty)}
        </Button>
      </div>
      {site.commerce.buyNowEnabled && (
        <Button
          type="button"
          variant="outline"
          className="w-full border-cocoa bg-transparent"
          onClick={() => {
            bag.add(p.handle, v.id, qty);
            navigate('/checkout');
          }}
        >
          Buy now
        </Button>
      )}
      {notes.length > 0 && (
        <ul className="grid gap-2 text-sm text-cocoa-2">
          {notes.map((n) => (
            <li key={n.text} className="flex items-center gap-2">
              <Check className="size-4" strokeWidth={1.4} /> {n.text}
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

const productLd = (p: any) => {
  const v = defaultVariant(p);
  const base = site.company.website ? String(site.company.website).replace(/\/$/, '') : '';
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    category: p.category,
    description: p.shortDescription,
    brand: { '@type': 'Brand', name: site.brand.name },
    ...(base ? { image: p.images.slice(0, 3).map((i: any) => `${base}${thumb(i.key)}`) } : {}),
    ...(isPurchasable(p)
      ? {
          sku: v.sku || v.id,
          offers: { '@type': 'Offer', priceCurrency: site.locale.currency, price: v.price, availability: 'https://schema.org/InStock', seller: { '@type': 'Organization', name: site.company.legalName || site.company.name } },
        }
      : {}),
  };
};

/** Product information rows — only the declarations that are filled in. */
const infoRows = (p: any): [string, string][] => {
  const co = site.company;
  const c = site.contact;
  const defaults: Record<string, string | null> = {
    'Marketed by': co.legalName && co.registeredAddress ? `${co.legalName}, ${co.registeredAddress}` : null,
    'Customer care': [c.email, c.phone].filter(Boolean).join(' · ') || null,
  };
  return Object.entries(p.productInformation || {})
    .map(([k, v]) => [k, (v as string) ?? defaults[k] ?? null] as [string, string | null])
    .filter(([, v]) => v) as [string, string][];
};

export default function Product() {
  const { handle } = useParams();
  const p = getProduct(handle || '');
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    if (!p) return;
    recent.add(p.handle);
    const sync = () => {
      const t = document.getElementById('main-buy') || document.getElementById('notify');
      setStuck(!!t && t.getBoundingClientRect().bottom < 0);
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, [p]);
  if (!p) return <NotFound />;

  const col = getCollection(p.collection);
  const buyable = isPurchasable(p);
  const sc = p.scent || {};
  const rows = infoRows(p);
  const related = [
    ...(p.pairsWith || []).map((h: string) => getUpcoming(h)).filter(Boolean).map((u: any) => ({ kind: 'upcoming', item: u })),
    ...allItems().filter((x: any) => x.item.handle !== p.handle && !(p.pairsWith || []).includes(x.item.handle)),
  ];
  const sections = [
    { id: 'details', title: 'Details', body: [p.shortDescription, ...(p.description || [])].filter(Boolean).length ? (
      <>
        {[p.shortDescription, ...(p.description || [])].filter(Boolean).map((t: string) => <p key={t}>{t}</p>)}
        {p.packagingNote && <p className="text-xs text-cocoa-3">{p.packagingNote}</p>}
      </>
    ) : null },
    { id: 'scent', title: 'Scent', body: sc.name || sc.family || sc.mood || sc.notes ? (
      <>
        {sc.name && <p className="font-medium">{sc.name}</p>}
        {sc.family && <p>Family: {sc.family}</p>}
        {sc.mood && <p>{sc.mood}</p>}
        <NotesBlock product={p} />
      </>
    ) : null },
    { id: 'how', title: 'How to use', body: p.howToUse?.length ? <ol className="list-decimal pl-5">{p.howToUse.map((s: string) => <li key={s}>{s}</li>)}</ol> : null },
    { id: 'ingredients', title: 'Ingredients', body: p.ingredients ? <p>{p.ingredients}</p> : null },
    { id: 'info', title: 'Product information', body: rows.length ? (
      <table className="w-full text-left"><tbody>{rows.map(([k, v]) => <tr key={k} className="border-b border-line last:border-0"><th scope="row" className="py-2 pr-4 font-normal text-cocoa-3">{k}</th><td className="py-2">{v}</td></tr>)}</tbody></table>
    ) : null },
    { id: 'faq', title: 'Questions', body: p.faqs?.length ? p.faqs.map((f: any) => <p key={f.q}><strong className="font-medium">{f.q}</strong><br />{f.a}</p>) : null },
  ].filter((s) => s.body);

  return (
    <>
      <Seo title={p.name} description={`${p.name} — ${p.shortDescription}`} path={`/products/${p.handle}`} jsonLd={[productLd(p)]} />
      <div className="container-x pt-6 pb-[var(--section)]">
        <nav aria-label="Breadcrumb" className="mb-6 flex gap-2 text-xs text-cocoa-3">
          <SmartLink href="/" className="hover:text-cocoa">Home</SmartLink>
          <span aria-hidden>/</span>
          <SmartLink href={collectionUrl(col)} className="hover:text-cocoa">{col.name}</SmartLink>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-cocoa">{p.name}</span>
        </nav>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <Gallery p={p} />
          <div className="flex flex-col gap-7 lg:pt-6">
            <motion.div className="grid gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE }}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="eyebrow">{p.category}</span>
                {p.badge && <span className="rounded-full bg-apricot-soft px-3 py-1 text-[0.62rem] tracking-[0.16em] uppercase">{p.badge}</span>}
              </div>
              <h1 className="display-lg">{p.name}</h1>
              <p className="lede">{p.tagline}</p>
              {sc.mood && <p className="text-sm text-cocoa-3">{sc.mood}</p>}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.9, ease: EASE }}>
              <BuyBox p={p} />
            </motion.div>
            {p.highlights?.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {p.highlights.map((h: any) => (
                  <div key={h.title} className="rounded-xl bg-sand p-4">
                    <h3 className="font-sans text-sm font-medium">{h.title}</h3>
                    <p className="mt-1 text-sm text-cocoa-3">{h.text}</p>
                  </div>
                ))}
              </div>
            )}
            <Accordion type="multiple" defaultValue={['details']} className="border-t border-line">
              {sections.map((s) => (
                <AccordionItem key={s.id} value={s.id} className="border-line">
                  <AccordionTrigger className="py-5 font-display text-xl font-normal hover:no-underline cursor-pointer">{s.title}</AccordionTrigger>
                  <AccordionContent className="grid gap-3 text-[0.95rem] text-cocoa-2">{s.body}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>

      {p.moments?.length > 0 && (
        <section className="pb-[var(--section)]" aria-labelledby="moments-title">
          <div className="container-x">
            <Reveal className="mb-8">
              <h2 id="moments-title" className="display-md">In the <em>everyday</em></h2>
            </Reveal>
            <Reveal className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-4 overflow-x-auto px-[var(--gutter)] md:mx-0 md:grid md:grid-cols-4 md:px-0" stagger={0.1}>
              {p.moments.map((m: any) => (
                <figure key={m.title} className="w-[70vw] shrink-0 snap-start md:w-auto">
                  <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
                    <Picture image={m.image} alt={`${p.name}: ${m.title}`} sizes="(min-width: 768px) 25vw, 70vw" imgClassName="transition-transform duration-[1.4s] hover:scale-105" />
                  </div>
                  <figcaption className="mt-3 font-display text-lg">{m.title}</figcaption>
                </figure>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      <section className="section-y bg-sand" aria-labelledby="related-title">
        <div className="container-x">
          <Reveal className="mb-8">
            <h2 id="related-title" className="display-md">Discover the range</h2>
            <p className="mt-2 text-cocoa-3">Made to sit alongside {p.name}.</p>
          </Reveal>
        </div>
        <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-[var(--gutter)] sm:gap-6 [@media(min-width:1440px)]:px-[calc((100vw-1440px)/2+var(--gutter))]">
          {related.map((x: any) => (
            <div key={x.item.handle} className="w-[64vw] shrink-0 snap-start sm:w-[34vw] lg:w-[22vw] lg:max-w-[320px]">
              <ProductCard entry={x} />
            </div>
          ))}
        </div>
      </section>

      <div
        className={cn('fixed inset-x-0 bottom-0 z-30 border-t border-line bg-milk/90 backdrop-blur-xl transition-transform duration-500 lg:hidden', stuck ? 'translate-y-0' : 'translate-y-full')}
        aria-hidden={!stuck}
      >
        <div className="container-x flex items-center gap-3 py-3">
          <img src={thumb(p.images[0].key)} alt="" width={40} height={50} className="h-[50px] w-10 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg leading-tight">{p.name}</p>
            <p className="text-xs text-cocoa-3">{buyable ? money(defaultVariant(p).price) : p.statusLabel || 'Coming soon'}</p>
          </div>
          {buyable ? (
            <Button size="sm" tabIndex={stuck ? 0 : -1} onClick={() => (document.querySelector('#main-buy button[type=submit]') as HTMLButtonElement)?.click()}>
              Add to bag
            </Button>
          ) : (
            <Button
              size="sm"
              tabIndex={stuck ? 0 : -1}
              onClick={() => {
                const t = document.getElementById('notify');
                if (!t) return;
                scrollToEl(t);
                setTimeout(() => t.querySelector<HTMLInputElement>('input[type=email]')?.focus({ preventScroll: true }), 700);
              }}
            >
              Notify me
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
