import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { content } from '../../site.config.js';
import { rich } from '@/lib/format';
import { Seo } from '@/lib/seo';
import { Picture } from '@/components/site/Picture';
import { WaitlistForm } from '@/components/site/WaitlistForm';
import { ArrowLink } from '@/components/site/ArrowLink';
import { Reveal } from '@/components/site/Reveal';
import ScrollReveal from '@/components/reactbits/ScrollReveal';

const EASE = [0.16, 1, 0.3, 1] as const;

function Chapter({ c, i }: { c: any; i: number }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  return (
    <section ref={ref} className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
      <div className={`aspect-[4/5] overflow-hidden rounded-2xl bg-sand ${i % 2 ? 'md:order-2' : ''}`}>
        <motion.div style={{ y, scale: 1.18 }} className="h-full">
          <Picture image={c.image} sizes="(min-width: 768px) 46vw, 100vw" />
        </motion.div>
      </div>
      <Reveal>
        <p className="eyebrow mb-4">Chapter 0{i + 1}</p>
        <h2 className="display-md">{c.title}</h2>
        <p className="lede mt-5">{c.text}</p>
      </Reveal>
    </section>
  );
}

/** Our Story: an image-led opener, a scroll-revealed statement and three short chapters. */
export default function Story() {
  const s = content.story;
  return (
    <>
      <Seo title="Our Story" description={s.hero.text} path="/story" />
      <div className="container-x pt-8">
        <motion.div className="aspect-[4/5] overflow-hidden rounded-3xl bg-sand sm:aspect-[21/9]" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, ease: EASE }}>
          <Picture image={s.hero.image} alt="The Gentle Company range on a long travertine shelf" sizes="(min-width: 1440px) 1344px, 100vw" priority />
        </motion.div>
        <header className="mx-auto max-w-4xl py-16 text-center sm:py-24">
          <motion.h1 className="display-xl" initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.2, duration: 1.1, ease: EASE }}>
            {rich(s.hero.title)}
          </motion.h1>
        </header>
        <ScrollReveal baseOpacity={0.12} enableBlur blurStrength={5} baseRotation={0} splitBy="words" effect="fade" containerClassName="mx-auto max-w-4xl text-center font-display" textClassName="display-md leading-[1.2] text-cocoa" wordAnimationEnd="bottom center">
          {s.hero.text}
        </ScrollReveal>
        <div className="grid gap-[var(--section)] py-[var(--section)]">
          {s.chapters.map((c: any, i: number) => (
            <Chapter key={c.title} c={c} i={i} />
          ))}
        </div>
        <section className="mx-auto max-w-xl pb-[var(--section)] text-center">
          <Reveal>
            <h2 className="display-md mb-8">Be first to know.</h2>
            <WaitlistForm cta="Sign up" className="text-left" />
            <ArrowLink href="/products/body-mist-no-01" className="mt-8">
              Discover Body Mist Nº 01
            </ArrowLink>
          </Reveal>
        </section>
      </div>
    </>
  );
}
