import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowDown, Plus } from 'lucide-react';
import { site, content, collections } from '../../site.config.js';
import { getProduct, productUrl, allItems, collectionItems, collectionUrl, isPurchasable, statusOf, itemUrl } from '@/lib/catalog.js';
import { hotspots } from '@/data/hotspots.js';
import { images } from '@/data/images.js';
import { rich, segments } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import BlurText from '@/components/reactbits/BlurText';
import Magnet from '@/components/reactbits/Magnet';
import ScrollVelocity from '@/components/reactbits/ScrollVelocity';
import ScrollReveal from '@/components/reactbits/ScrollReveal';
import ScrollExpand from '@/components/reactbits/ScrollExpand';
import { ArtPicture, Picture } from '@/components/site/Picture';
import { ProductCard } from '@/components/site/ProductCard';
import { WaitlistForm } from '@/components/site/WaitlistForm';
import { SmartLink } from '@/components/site/SmartLink';
import { ArrowLink } from '@/components/site/ArrowLink';
import { Reveal } from '@/components/site/Reveal';
import { NotesBlock } from '@/components/site/NotesBlock';

const EASE = [0.16, 1, 0.3, 1] as const;
type Entry = { kind: string; item: any };

const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.company.legalName || site.company.name,
  brand: { '@type': 'Brand', name: site.brand.name },
  ...(site.company.website ? { url: site.company.website, logo: `${String(site.company.website).replace(/\/$/, '')}/${site.brand.logoSvg}` } : {}),
  ...(site.contact.email ? { email: site.contact.email } : {}),
});

/* 1 · Hero ------------------------------------------------------------------ */
function Hero() {
  const h = content.home.hero;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1.02, 1.14]);
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const segs = segments(h.title);
  const plainWords = segs.filter((s) => !s.em).map((s) => s.text.trim()).join(' ').split(' ').length;

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-sand" aria-labelledby="hero-title">
      <motion.div className="absolute inset-0 -z-10" style={{ scale, y }}>
        <ArtPicture wide={h.image} tall={h.imageMobile} alt={h.imageAlt} priority sizes="100vw" />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-milk/90 via-milk/10 to-transparent max-[899px]:from-milk max-[899px]:via-milk/40 lg:bg-gradient-to-r lg:from-milk/85 lg:via-milk/20 lg:to-transparent" />
      <motion.div style={{ opacity: fade }} className="container-x relative pt-32 pb-14 sm:pb-20 lg:pb-28">
        <motion.p className="eyebrow mb-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          {h.eyebrow}
        </motion.p>
        <h1 id="hero-title" className="display-xl max-w-[9.5em]" aria-label={h.title.replace(/\*/g, '')}>
          {segs.map((s, i) => (
            <BlurText
              key={i}
              as="span"
              text={s.text.trim()}
              trigger="load"
              animateBy="words"
              direction="bottom"
              delay={110}
              stepDuration={0.5}
              blur={14}
              distance={30}
              startDelay={0.15 + (s.em ? plainWords * 0.11 : 0)}
              className={cn('!inline-flex', s.em ? 'font-display italic text-clay' : '', i < segs.length - 1 && 'mr-[0.25em]')}
            />
          ))}
        </h1>
        <motion.p className="lede mt-6" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9, ease: EASE }}>
          {h.text}
        </motion.p>
        <motion.div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05, duration: 0.9, ease: EASE }}>
          <Magnet padding={60} magnetStrength={4} maxOffset={14}>
            <Button asChild size="lg">
              <SmartLink href={h.primary.href}>
                {h.primary.label} <ArrowRight strokeWidth={1.4} />
              </SmartLink>
            </Button>
          </Magnet>
          <ArrowLink href={h.secondary.href}>{h.secondary.label}</ArrowLink>
        </motion.div>
      </motion.div>
      <motion.a
        href="#collection"
        aria-label="Scroll to the collection"
        className="absolute right-[var(--gutter)] bottom-8 hidden flex-col items-center gap-3 text-[0.62rem] tracking-[0.24em] uppercase [writing-mode:vertical-rl] lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        Scroll
        <ArrowDown className="size-3.5 animate-marquee-hint [writing-mode:horizontal-tb]" strokeWidth={1.3} />
      </motion.a>
    </section>
  );
}

/* 2 · Marquee band (React Bits ScrollVelocity) ------------------------------ */
function Band() {
  const words = [site.brand.tagline.replace(/\.$/, ''), ...collections.map((c: any) => c.name), content.home.hero.eyebrow];
  return (
    <div className="overflow-hidden border-y border-line bg-milk py-6 sm:py-8" aria-hidden>
      <ScrollVelocity
        texts={[
          <span className="flex items-center">
            {words.map((w, i) => (
              <span key={i} className="flex items-center">
                <span className={cn('font-display text-[2.4rem] leading-none sm:text-[3.6rem]', i % 2 ? 'italic text-clay' : 'text-cocoa')}>{w}</span>
                <span className="mx-8 inline-block size-2 rotate-45 bg-apricot sm:mx-12" />
              </span>
            ))}
          </span>,
        ]}
        velocity={28}
        numCopies={4}
        damping={60}
        stiffness={300}
        velocityMapping={{ input: [0, 1000], output: [0, 3] }}
        fadeEdges
        pauseOnHover
      />
    </div>
  );
}

/* 3 · Collection shelf ----------------------------------------------------- */
function Shelf() {
  const h = content.home.shelf;
  const items: Entry[] = allItems();
  const tabs = [{ key: 'all', label: 'All' }, ...collections.map((c: any) => ({ key: c.handle, label: c.short }))];
  const [tab, setTab] = useState('all');
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ w: 1, x: 0, start: true, end: false });
  const shown = items.filter((x) => tab === 'all' || x.item.collection === tab);

  const sync = () => {
    const t = track.current;
    if (!t) return;
    const max = t.scrollWidth - t.clientWidth;
    const w = max > 0 ? t.clientWidth / t.scrollWidth : 1;
    setProgress({ w, x: max > 0 ? (t.scrollLeft / max) * (1 - w) : 0, start: t.scrollLeft <= 4, end: t.scrollLeft >= max - 4 });
  };
  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [tab]);
  const step = (dir: number) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.85, behavior: 'smooth' });

  return (
    <section id="collection" className="section-y" aria-labelledby="shelf-title">
      <div className="container-x">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="eyebrow mb-3">{site.brand.name}</p>
            <h2 id="shelf-title" className="display-lg">
              {h.title}
            </h2>
          </Reveal>
          <div className="flex flex-wrap items-center gap-4">
            <div role="tablist" aria-label="Filter the collection" className="relative flex rounded-full border border-line bg-porcelain p-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn('relative z-[1] h-9 rounded-full px-4 text-[0.7rem] tracking-[0.14em] uppercase transition-colors duration-300 cursor-pointer', tab === t.key ? 'text-milk' : 'text-cocoa-2 hover:text-cocoa')}
                >
                  {tab === t.key && <motion.span layoutId="shelf-tab" className="absolute inset-0 -z-[1] rounded-full bg-cocoa" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  {t.label}
                </button>
              ))}
            </div>
            <div className="hidden gap-2 sm:flex">
              {[
                { d: -1, Icon: ArrowLeft, label: 'Previous products', off: progress.start },
                { d: 1, Icon: ArrowRight, label: 'Next products', off: progress.end },
              ].map(({ d, Icon, label, off }) => (
                <button key={d} type="button" aria-label={label} disabled={off} onClick={() => step(d)} className="inline-flex size-11 items-center justify-center rounded-full border border-stone transition hover:bg-cocoa hover:text-milk disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-cocoa cursor-pointer">
                  <Icon className="size-4" strokeWidth={1.3} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div ref={track} onScroll={sync} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] sm:gap-6 [@media(min-width:1440px)]:px-[calc((100vw-1440px)/2+var(--gutter))]">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((x, i) => (
            <motion.div
              key={x.item.handle}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, delay: Math.min(i, 6) * 0.04, ease: EASE }}
              className="w-[72vw] shrink-0 snap-start sm:w-[42vw] lg:w-[calc((min(100vw,1440px)-2*var(--gutter)-3*1.5rem)/4)]"
            >
              <ProductCard entry={x} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="container-x mt-8">
        <div className="relative h-px bg-line" aria-hidden>
          <span className="absolute inset-y-0 left-0 bg-cocoa transition-transform duration-300" style={{ width: `${progress.w * 100}%`, transform: `translateX(${(progress.x / (progress.w || 1)) * 100}%)` }} />
        </div>
        <div className="mt-6 flex justify-end">
          <ArrowLink href={h.link.href}>{h.link.label}</ArrowLink>
        </div>
      </div>
    </section>
  );
}

/* 4 · Statement (React Bits ScrollReveal) ---------------------------------- */
function Statement() {
  const i = content.home.intro;
  return (
    <section className="section-y bg-porcelain" aria-label="About Gentle Company">
      <div className="container-x grid gap-8 lg:grid-cols-[180px_1fr]">
        <p className="eyebrow pt-3">Our approach</p>
        <ScrollReveal
          baseOpacity={0.12}
          enableBlur
          blurStrength={6}
          baseRotation={0}
          splitBy="words"
          effect="fade"
          containerClassName="max-w-5xl font-display"
          textClassName="display-lg leading-[1.08] text-cocoa"
          wordAnimationEnd="bottom center"
        >
          {i.lines.join(' ')}
        </ScrollReveal>
      </div>
    </section>
  );
}

/* 5 · Image that opens to full bleed as you scroll (React Bits ScrollExpand) */
function Expand() {
  const i = content.home.intro;
  const m = (images as any)[i.image];
  const srcSet = m ? m.widths.map((w: number) => `/assets/img/${i.image}-${w}.webp ${w}w`).join(', ') : undefined;
  const src = m ? `/assets/img/${i.image}-${m.widths[m.widths.length - 1]}.jpg` : '';
  return (
    <section aria-labelledby="intro-title" className="relative bg-porcelain">
      <h2 id="intro-title" className="sr-only">
        {i.title.replace(/\*/g, '')}
      </h2>
      <div>
        <ScrollExpand
          useWindowScroll
          src={src}
          srcSet={srcSet}
          sizes="100vw"
          alt={i.imageAlt}
          startWidth={46}
          startHeight={56}
          startRadius={28}
          endRadius={0}
          mediaZoom={1.25}
          scrollDistance={1}
          holdDistance={0.25}
          overlayScrim={0.5}
        >
          <div className="flex flex-col items-center gap-6 text-white">
            <p className="eyebrow !text-white/80">{site.brand.name}</p>
            <p className="max-w-[16ch] font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[1]">{rich(i.title)}</p>
            <Button asChild variant="light">
              <SmartLink href={i.link.href}>
                {i.link.label} <ArrowRight strokeWidth={1.4} />
              </SmartLink>
            </Button>
          </div>
        </ScrollExpand>
      </div>
    </section>
  );
}

/* 6 · Shop by category ---------------------------------------------------- */
function Categories() {
  return (
    <section className="section-y" aria-labelledby="cat-title">
      <div className="container-x">
        <Reveal className="mb-10">
          <h2 id="cat-title" className="display-lg">
            {content.home.categories.title}
          </h2>
        </Reveal>
        <Reveal className="grid gap-4 md:grid-cols-3 md:gap-6" stagger={0.12} distance={50}>
          {collections.map((c: any) => {
            const it = collectionItems(c.handle);
            const n = it.products.length + it.upcoming.length;
            const live = it.products.some(isPurchasable);
            return (
              <SmartLink key={c.handle} href={collectionUrl(c)} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-sand">
                <Picture image={c.image} alt={c.imageAlt} sizes="(min-width: 768px) 32vw, 100vw" className="absolute inset-0" imgClassName="transition-transform duration-[1.6s] ease-[var(--ease-out)] group-hover:scale-[1.06]" />
                <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-4 rounded-xl bg-porcelain/80 p-4 backdrop-blur-md transition-colors duration-500 group-hover:bg-porcelain">
                  <span>
                    <span className="block font-display text-2xl leading-tight">{c.name}</span>
                    <span className="block text-xs text-cocoa-3">
                      {n} products · {live ? 'Shop now' : it.products.length ? 'Launching soon' : 'In development'}
                    </span>
                  </span>
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-cocoa/20 transition-all duration-500 group-hover:bg-cocoa group-hover:text-milk">
                    <ArrowRight className="size-4 transition-transform duration-500 group-hover:-rotate-45" strokeWidth={1.3} />
                  </span>
                </span>
              </SmartLink>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

/* 7 · Body Mist experience: moments with story-style progress ------------- */
function Experience() {
  const p = getProduct('body-mist-no-01');
  const e = content.home.experience;
  const moments: { title: string; image: string }[] = p?.moments || [];
  const [cur, setCur] = useState(0);
  const [auto, setAuto] = useState(true);
  const DURATION = 4800;
  useEffect(() => {
    if (!auto || moments.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => setCur((c) => (c + 1) % moments.length), DURATION);
    return () => clearTimeout(t);
  }, [cur, auto, moments.length]);
  if (!p || !moments.length) return null;
  const buyable = isPurchasable(p);

  return (
    <section className="section-y bg-sand" aria-labelledby="exp-title">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-oat lg:aspect-[5/6]">
          <AnimatePresence initial={false}>
            <motion.div
              key={cur}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0.6 } }}
              transition={{ duration: 1.2, ease: EASE }}
            >
              <Picture image={moments[cur].image} alt={`${p.name}: ${moments[cur].title}`} sizes="(min-width: 1024px) 56vw, 100vw" />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-4 top-4 flex gap-1.5" aria-hidden>
            {moments.map((_, i) => (
              <span key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/40">
                <span
                  key={`${cur}-${auto}`}
                  className="block h-full bg-white"
                  style={{
                    width: i < cur ? '100%' : i > cur ? '0%' : auto ? undefined : '100%',
                    animation: i === cur && auto ? `grow ${DURATION}ms linear forwards` : undefined,
                  }}
                />
              </span>
            ))}
          </div>
        </div>
        <div>
          <Reveal>
            <p className="eyebrow mb-4">{e.eyebrow}</p>
            <h2 id="exp-title" className="display-lg">
              {rich(e.title)}
            </h2>
          </Reveal>
          <div role="tablist" aria-label="Moments" className="mt-10 border-t border-cocoa/10">
            {moments.map((m, i) => (
              <button
                key={m.title}
                type="button"
                role="tab"
                aria-selected={i === cur}
                onClick={() => {
                  setAuto(false);
                  setCur(i);
                }}
                className={cn('group flex w-full items-baseline gap-5 border-b border-cocoa/10 py-4 text-left transition-colors cursor-pointer', i === cur ? 'text-cocoa' : 'text-cocoa-3 hover:text-cocoa')}
              >
                <span className="text-xs tabular-nums">0{i + 1}</span>
                <span className={cn('font-display text-2xl transition-transform duration-500 sm:text-3xl', i === cur && 'translate-x-2 italic')}>{m.title}</span>
              </button>
            ))}
          </div>
          <NotesBlock product={p} className="mt-8" />
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Button asChild>
              <SmartLink href={productUrl(p)}>{buyable ? 'Shop Body Mist' : 'Discover Body Mist'}</SmartLink>
            </Button>
            {!buyable && <ArrowLink href={`${productUrl(p)}#notify`}>Notify me</ArrowLink>}
          </div>
        </div>
      </div>
      <style>{'@keyframes grow{from{width:0}to{width:100%}}'}</style>
    </section>
  );
}

/* 8 · What comes next: the range on one shelf with hotspots --------------- */
function Range() {
  const f = content.home.future;
  const items: Entry[] = allItems();
  const [open, setOpen] = useState<number | null>(null);
  const rangeRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => !rangeRef.current?.contains(e.target as Node) && setOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  const spots = useMemo(() => hotspots.map((s: any) => ({ ...s, entry: items.find((it) => it.item.handle === s.handle) })).filter((s: any) => s.entry), [items]);
  const active = open !== null ? spots[open] : null;

  return (
    <section className="section-y" aria-labelledby="range-title">
      <div className="container-x">
        <Reveal className="mb-10 max-w-xl">
          <h2 id="range-title" className="display-lg">
            {f.title}
          </h2>
          <p className="lede mt-4">{f.text}</p>
        </Reveal>
        <Reveal distance={60}>
          <div ref={rangeRef} className="relative overflow-hidden rounded-2xl bg-sand">
            <Picture image={f.image} alt={f.imageAlt} sizes="(min-width: 1440px) 1344px, 100vw" />
            {spots.map((s: any, i: number) => (
              <button
                key={s.handle}
                type="button"
                aria-label={s.entry.item.name}
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
                className={cn(
                  'absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/80 bg-white/40 backdrop-blur-sm transition-transform hover:scale-125 max-sm:size-4 cursor-pointer',
                  open === i ? 'scale-125 bg-white' : 'animate-hotspot',
                )}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                <Plus className={cn('size-3 text-cocoa transition-transform max-sm:size-2', open === i && 'rotate-45')} strokeWidth={1.6} />
              </button>
            ))}
            <AnimatePresence>
              {active && (
                <motion.div
                  key={active.handle}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="absolute z-10 w-56 -translate-x-1/2 rounded-xl bg-porcelain/95 p-4 text-left shadow-[0_20px_50px_-20px_rgb(42_32_27/0.45)] backdrop-blur max-sm:!top-auto max-sm:bottom-3 max-sm:!left-1/2"
                  style={{ left: `${Math.min(84, Math.max(16, active.x))}%`, top: `calc(${active.y}% + 22px)` }}
                >
                  <strong className="block font-display text-xl font-normal">{active.entry.item.name}</strong>
                  <span className="text-xs text-cocoa-3">{statusOf(active.entry.item) || 'Available'}</span>
                  <SmartLink href={itemUrl(active.entry)} className="mt-2 flex items-center gap-1.5 text-[0.68rem] tracking-[0.14em] uppercase">
                    {active.entry.kind === 'product' ? 'View product' : 'See the collection'} <ArrowRight className="size-3" />
                  </SmartLink>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
        <ul className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((x) => (
            <li key={x.item.handle} className="border-b border-line">
              <SmartLink href={itemUrl(x)} className="group flex items-center justify-between py-3 text-sm">
                <span className="transition-transform duration-500 group-hover:translate-x-1">{x.item.name}</span>
                <span className="text-xs text-cocoa-3">{statusOf(x.item) || 'Available'}</span>
              </SmartLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* 9 · Early access -------------------------------------------------------- */
function EarlyAccess() {
  const ea = content.home.earlyAccess;
  return (
    <section id="early-access" className="pb-[var(--section)]" aria-labelledby="ea-title">
      <div className="container-x">
        <Reveal distance={60}>
          <div className="grain relative grid overflow-hidden rounded-3xl bg-kohl text-on-dark md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto">
              <Picture image={ea.image} sizes="(min-width: 768px) 50vw, 100vw" className="absolute inset-0" />
            </div>
            <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-16">
              <h2 id="ea-title" className="display-lg">
                {rich(ea.title)}
              </h2>
              <p className="text-on-dark-2">{ea.text}</p>
              <WaitlistForm interests={ea.interests} preset={['Body Mist']} dark cta="Sign up" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Seo path="/" description={site.brand.description} jsonLd={[organizationLd()]} />
      <Hero />
      <Band />
      <Shelf />
      <Statement />
      <Expand />
      <Categories />
      <Experience />
      <Range />
      <EarlyAccess />
    </>
  );
}
