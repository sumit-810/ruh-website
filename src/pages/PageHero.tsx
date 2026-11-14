import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { rich } from '@/lib/format';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Shared page opener: eyebrow, large display title with italic emphasis, optional lede. */
export function PageHero({ eyebrow, title, lede, children }: { eyebrow?: string; title: string; lede?: string; children?: ReactNode }) {
  return (
    <header className="pt-14 pb-10 sm:pt-20 sm:pb-14">
      {eyebrow && (
        <motion.p className="eyebrow mb-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
          {eyebrow}
        </motion.p>
      )}
      <motion.h1 className="display-xl max-w-[14ch]" initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.05, duration: 1, ease: EASE }}>
        {rich(title)}
      </motion.h1>
      {lede && (
        <motion.p className="lede mt-5" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9, ease: EASE }}>
          {lede}
        </motion.p>
      )}
      {children}
    </header>
  );
}
