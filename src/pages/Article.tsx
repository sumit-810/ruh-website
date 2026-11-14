import { useParams } from 'react-router';
import { motion, useScroll } from 'motion/react';
import { Info } from 'lucide-react';
import { journal } from '../../content/journal.js';
import { getArticle } from '@/lib/catalog.js';
import { rich } from '@/lib/format';
import { Seo } from '@/lib/seo';
import { Picture } from '@/components/site/Picture';
import { SmartLink } from '@/components/site/SmartLink';
import { ArrowLink } from '@/components/site/ArrowLink';
import { Reveal } from '@/components/site/Reveal';
import { JournalCard } from './Journal';
import NotFound from './NotFound';

const EASE = [0.16, 1, 0.3, 1] as const;

const Block = ({ b }: { b: any }) => {
  if (b.h) return <h2>{b.h}</h2>;
  if (b.quote) return <blockquote>{b.quote}</blockquote>;
  if (b.list) return <ul>{b.list.map((li: string) => <li key={li}>{li}</li>)}</ul>;
  return <p>{b.p}</p>;
};

export default function Article() {
  const { slug } = useParams();
  const a = getArticle(slug || '');
  const { scrollYProgress } = useScroll();
  if (!a) return <NotFound />;
  const more = journal.filter((x: any) => x.slug !== a.slug).slice(0, 2);
  return (
    <>
      <Seo
        title={a.title}
        description={a.dek}
        path={`/journal/${a.slug}`}
        jsonLd={[{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.dek, ...(a.date ? { datePublished: a.date } : {}) }]}
      />
      <motion.div className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-clay" style={{ scaleX: scrollYProgress }} aria-hidden />
      <article>
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="flex gap-2 pt-6 text-xs text-cocoa-3">
            <SmartLink href="/" className="hover:text-cocoa">Home</SmartLink>
            <span aria-hidden>/</span>
            <SmartLink href="/journal" className="hover:text-cocoa">Journal</SmartLink>
          </nav>
          <header className="mx-auto max-w-3xl py-14 text-center sm:py-20">
            <p className="eyebrow">
              {a.category} · {a.readingTime}
            </p>
            <motion.h1 className="display-xl mt-5" initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1, ease: EASE }}>
              {rich(a.title)}
            </motion.h1>
            <p className="lede mx-auto mt-6">{a.dek}</p>
          </header>
          <motion.div className="aspect-[4/5] overflow-hidden rounded-3xl bg-sand sm:aspect-[21/9]" initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: EASE }}>
            <Picture image={a.image} sizes="100vw" priority />
          </motion.div>
          <div className="prose-gc mx-auto py-[var(--section)] text-[1.075rem]">
            {a.body.map((b: any, i: number) => (
              <Block key={i} b={b} />
            ))}
            <div className="!mt-12 flex gap-3 rounded-xl bg-sand p-5 text-sm">
              <Info className="size-5 shrink-0" strokeWidth={1.3} />
              <span>Journal articles are general information, not medical advice. Always follow the directions on a product’s label.</span>
            </div>
          </div>
        </div>
      </article>
      <section className="section-y bg-porcelain" aria-labelledby="more-title">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 id="more-title" className="display-md">
              More from the <em>journal</em>
            </h2>
            <ArrowLink href="/products/body-mist-no-01">Discover Body Mist Nº 01</ArrowLink>
          </div>
          <Reveal className="grid gap-12 md:grid-cols-2" stagger={0.12}>
            {more.map((x: any) => (
              <JournalCard key={x.slug} a={x} />
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}
