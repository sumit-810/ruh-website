import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { site, navigation } from '../../../site.config.js';
import { SmartLink } from './SmartLink';
import { Wordmark } from './Wordmark';

/** Line icons for social links (lucide no longer ships brand marks). */
const SOCIAL_PATHS: Record<string, string> = {
  instagram: 'M7.5 3.5h9a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17 7v.01',
  youtube: 'M5.5 5.5h13a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-13a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3zM10 9.5v5l4.5-2.5z',
  pinterest: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM11 8.5c3-1 5 .5 5 3 0 2.5-1.6 4-3.3 4-1 0-1.6-.6-1.6-.6L9.5 21',
  linkedin: 'M5.5 3.5h13a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2zM8 10.5v6M8 7.5v.01M11.5 16.5v-6M11.5 13c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v3.5',
};

/** Footer: brand line, link columns, confirmed contact details only, social links once set, and a large wordmark that rises in. */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const y = useTransform(scrollYProgress, [0, 1], ['35%', '0%']);
  const opacity = useTransform(scrollYProgress, [0.2, 1], [0, 1]);
  const c = site.contact;
  const co = site.company;
  const social = Object.entries(site.social).filter(([, v]) => v) as [string, string][];
  const help = [
    { label: 'Contact us', href: '/contact' },
    c.email && { label: c.email, href: `mailto:${c.email}` },
    c.phone && { label: c.phone, href: `tel:${String(c.phone).replace(/\s/g, '')}` },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <footer ref={ref} className="relative overflow-hidden bg-kohl text-on-dark">
      <div className="container-x pt-20 pb-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="flex max-w-sm flex-col gap-5">
            <SmartLink href="/" className="block h-[14px] text-on-dark">
              <Wordmark className="h-full" />
              <span className="sr-only">{site.brand.name} — home</span>
            </SmartLink>
            <p className="text-sm text-on-dark-2">{site.brand.description}</p>
            {social.length > 0 && (
              <div className="flex gap-2">
                {social.map(([k, v]) => {
                  return (
                    <a key={k} href={v} target="_blank" rel="noopener" aria-label={k} className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 transition hover:bg-white/10">
                      {SOCIAL_PATHS[k] ? (
                        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d={SOCIAL_PATHS[k]} />
                        </svg>
                      ) : (
                        k
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            {[...navigation.footer, { title: 'Help', links: help }].map((col: any) => (
              <div key={col.title}>
                <h2 className="mb-4 font-sans text-[0.68rem] tracking-[0.2em] text-on-dark-2 uppercase">{col.title}</h2>
                <ul className="grid gap-2.5 text-sm">
                  {col.links.map((l: any) => (
                    <li key={l.href}>
                      <SmartLink href={l.href} className="transition-colors hover:text-white">
                        {l.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <motion.div style={{ y, opacity }} className="mt-20 text-on-dark/90" aria-hidden>
          <Wordmark className="w-full [&_svg]:!h-auto [&_svg]:!w-full" />
        </motion.div>
        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-on-dark-2 sm:flex-row">
          <span>
            © {new Date().getFullYear()} {co.legalName || co.name}.{co.gstin ? ` GSTIN ${co.gstin}.` : ''}
          </span>
          <span>Prices in ₹, inclusive of all taxes.</span>
        </div>
      </div>
    </footer>
  );
}
