import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Menu, Search, ShoppingBag, X, ArrowRight } from 'lucide-react';
import { site, navigation, collections } from '../../../site.config.js';
import { allItems, itemUrl, statusOf, getCollection, collectionUrl } from '@/lib/catalog.js';
import { useBag } from '@/lib/cart';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Picture } from './Picture';
import { SmartLink } from './SmartLink';
import { Wordmark } from './Wordmark';
import { ArrowLink } from './ArrowLink';
import { useUI } from './ui';

/**
 * Header: navigation left, GENTLE COMPANY wordmark centred, search (and the
 * bag, only when the shop is open) on the right. Transparent over the home
 * hero, frosted once you scroll. Mega panels show products as images.
 */
type Item = { kind: string; item: any };

function MegaPanel({ mega, onNavigate }: { mega: string; onNavigate: () => void }) {
  const col = mega === 'all' ? null : getCollection(mega);
  const items: Item[] = allItems(col ? col.handle : null).slice(0, 6);
  return (
    <div className="container-x grid gap-10 py-10 lg:grid-cols-[260px_1fr]">
      <div className="flex flex-col gap-3">
        <h2 className="display-sm">{col ? col.name : 'Shop'}</h2>
        <p className="text-sm text-cocoa-2">{col ? col.intro : 'Body Mist Nº 01 and the range that follows.'}</p>
        <ArrowLink href={col ? collectionUrl(col) : '/shop'} className="mt-2 self-start" onClick={onNavigate}>
          {col ? `All ${col.short.toLowerCase()} care` : 'Shop all'}
        </ArrowLink>
      </div>
      <div className="grid grid-cols-6 gap-4">
        {items.map((x, i) => {
          const key = x.kind === 'product' ? x.item.images[0]?.key : x.item.image;
          const status = statusOf(x.item);
          return (
            <motion.div key={x.item.handle} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <SmartLink href={itemUrl(x)} onClick={onNavigate} className="group block">
                <span className="block aspect-[4/5] overflow-hidden rounded-xl bg-sand">
                  <Picture image={key} sizes="180px" imgClassName="transition-transform duration-700 ease-out group-hover:scale-105" />
                </span>
                <span className="mt-3 block text-sm">{x.item.name}</span>
                {status && <span className="block text-xs text-cocoa-3">{status}</span>}
              </SmartLink>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function Header({ overlay }: { overlay: boolean }) {
  const { setSearchOpen, setBagOpen } = useUI();
  const { count } = useBag();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const location = useLocation();
  const shop = site.commerce.enabled;
  const announce = (site.announcements || [])[0];

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 12);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, []);
  useEffect(() => {
    setMega(null);
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMega(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const clear = overlay && !scrolled && !mega;
  const openMega = (key: string) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMega(key), 90);
  };
  const closeMega = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMega(null), 160);
  };

  const iconBtn = 'inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-cocoa/5 cursor-pointer';

  return (
    <>
      {announce && (
        <div className="relative z-50 flex min-h-[var(--announce-h)] items-center justify-center bg-cocoa px-4 py-2 text-center text-[0.62rem] tracking-[0.1em] sm:text-[0.68rem] sm:tracking-[0.14em] text-on-dark uppercase" role="region" aria-label="Announcement">
          {announce.href ? (
            <SmartLink href={announce.href} className="hover:underline underline-offset-4">
              {announce.text}
            </SmartLink>
          ) : (
            announce.text
          )}
        </div>
      )}
      <header
        className={cn(
          'sticky top-0 z-40 transition-[background-color,color,box-shadow,backdrop-filter] duration-500',
          overlay && '-mb-[var(--header-h)]',
          clear ? 'bg-transparent text-cocoa' : 'bg-milk/80 text-cocoa shadow-[0_1px_0_var(--line)] backdrop-blur-xl',
        )}
        onMouseLeave={closeMega}
      >
        <div className="container-x grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center">
            <button type="button" className={cn(iconBtn, '-ml-2.5 lg:hidden')} aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
              <Menu className="size-5" strokeWidth={1.3} />
            </button>
            <nav aria-label="Main" className="hidden lg:block">
              <ul className="flex items-center gap-7">
                {navigation.primary.map((n: any) => (
                  <li key={n.href}>
                    <SmartLink
                      href={n.href}
                      className={cn(
                        'relative py-2 text-[0.72rem] tracking-[0.16em] uppercase after:absolute after:inset-x-0 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100',
                        (location.pathname === n.href || mega === n.mega) && 'after:scale-x-100',
                      )}
                      aria-current={location.pathname === n.href ? 'page' : undefined}
                      aria-expanded={n.mega ? mega === n.mega : undefined}
                      onMouseEnter={() => (n.mega ? openMega(n.mega) : closeMega())}
                      onFocus={() => n.mega && setMega(n.mega)}
                    >
                      {n.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <SmartLink href="/" className="block h-[13px] sm:h-[15px]" onMouseEnter={closeMega}>
            <Wordmark className="h-full" />
            <span className="sr-only">{site.brand.name} — home</span>
          </SmartLink>
          <div className="flex items-center justify-end gap-1">
            <button type="button" className={cn(iconBtn, 'group gap-2 sm:w-auto sm:px-3')} aria-label="Search" onClick={() => setSearchOpen(true)}>
              <Search className="size-[18px]" strokeWidth={1.3} />
              <kbd className="hidden rounded border border-current/20 px-1.5 text-[0.65rem] tracking-wider opacity-60 sm:inline">⌘K</kbd>
            </button>
            {shop && (
              <button type="button" className={cn(iconBtn, 'relative -mr-2.5')} onClick={() => setBagOpen(true)}>
                <ShoppingBag className="size-[18px]" strokeWidth={1.3} />
                <span className="sr-only">Bag, {count} {count === 1 ? 'item' : 'items'}</span>
                {count > 0 && (
                  <span aria-hidden className="absolute top-1.5 right-1 flex size-4 items-center justify-center rounded-full bg-clay text-[0.6rem] text-white">
                    {count}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {mega && (
            <motion.div
              key="mega"
              className="absolute inset-x-0 top-full hidden overflow-hidden border-t border-line bg-milk/95 shadow-[0_30px_60px_-30px_rgb(42_32_27/0.25)] backdrop-blur-xl lg:block"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => clearTimeout(timer.current)}
            >
              <MegaPanel key={mega} mega={mega} onNavigate={() => setMega(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-full gap-0 border-none bg-milk p-0 sm:max-w-md">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
          <div className="flex h-16 items-center justify-between px-5">
            <SmartLink href="/" className="block h-[13px]" onClick={() => setMenuOpen(false)}>
              <Wordmark className="h-full" />
              <span className="sr-only">{site.brand.name} — home</span>
            </SmartLink>
            <button type="button" className={iconBtn} aria-label="Close menu" onClick={() => setMenuOpen(false)}>
              <X className="size-5" strokeWidth={1.3} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-10">
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/products/body-mist-no-01', image: 'hero_wide', label: 'Body Mist Nº 01', wide: true },
                ...collections.map((c: any) => ({ href: collectionUrl(c), image: c.image, label: c.name, wide: false })),
                { href: '/shop', image: 'lineup', label: 'Shop all', wide: false },
              ].map((t, i) => (
                <motion.div
                  key={t.href}
                  className={cn(t.wide && 'col-span-2')}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SmartLink href={t.href} onClick={() => setMenuOpen(false)} className="relative block overflow-hidden rounded-xl">
                    <span className={cn('block', t.wide ? 'aspect-[16/9]' : 'aspect-square')}>
                      <Picture image={t.image} sizes="(min-width: 448px) 220px, 50vw" />
                    </span>
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cocoa/55 to-transparent p-3 pt-10 font-display text-xl text-white">{t.label}</span>
                  </SmartLink>
                </motion.div>
              ))}
            </div>
            <ul className="mt-6 divide-y divide-line border-y border-line">
              {[
                { href: '/story', label: 'Our Story' },
                { href: '/journal', label: 'Journal' },
                { href: '/contact', label: 'Contact' },
                { href: '/faq', label: 'FAQs' },
              ].map((l) => (
                <li key={l.href}>
                  <SmartLink href={l.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-4 font-display text-2xl">
                    {l.label}
                    <ArrowRight className="size-4" strokeWidth={1.3} />
                  </SmartLink>
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
