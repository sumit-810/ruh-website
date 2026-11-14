import { ArrowRight } from 'lucide-react';
import { journal } from '../../content/journal.js';
import { articleUrl } from '@/lib/catalog.js';
import { rich } from '@/lib/format';
import { Seo } from '@/lib/seo';
import { Picture } from '@/components/site/Picture';
import { SmartLink } from '@/components/site/SmartLink';
import { Reveal } from '@/components/site/Reveal';
import { PageHero } from './PageHero';

export function JournalCard({ a }: { a: any }) {
  return (
    <SmartLink href={articleUrl(a)} className="group block">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
        <Picture image={a.image} sizes="(min-width: 768px) 45vw, 90vw" imgClassName="transition-transform duration-[1.4s] ease-[var(--ease-out)] group-hover:scale-105" />
      </div>
      <p className="eyebrow mt-5">
        {a.category} · {a.readingTime}
      </p>
      <h3 className="display-sm mt-2 transition-colors group-hover:text-clay">{rich(a.title)}</h3>
      <p className="mt-2 text-sm text-cocoa-3">{a.dek}</p>
    </SmartLink>
  );
}

export default function Journal() {
  const [first, ...rest] = journal;
  return (
    <>
      <Seo title="Journal" description="Notes on scent, skin and the rituals in between." path="/journal" />
      <div className="container-x pb-[var(--section)]">
        <PageHero eyebrow="Journal" title="Notes on scent, *skin and ritual.*" />
        {first && (
          <Reveal>
            <SmartLink href={articleUrl(first)} className="group grid items-center gap-8 md:grid-cols-[1.3fr_1fr] md:gap-14">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
                <Picture image={first.image} sizes="(min-width: 768px) 55vw, 100vw" priority imgClassName="transition-transform duration-[1.4s] group-hover:scale-105" />
              </div>
              <div>
                <p className="eyebrow">
                  {first.category} · {first.readingTime}
                </p>
                <h2 className="display-md mt-4">{rich(first.title)}</h2>
                <p className="lede mt-4">{first.dek}</p>
                <span className="link-arrow mt-6">
                  Read <ArrowRight className="size-3.5" strokeWidth={1.4} />
                </span>
              </div>
            </SmartLink>
          </Reveal>
        )}
        <Reveal className="mt-[var(--section)] grid gap-12 md:grid-cols-2" stagger={0.12}>
          {rest.map((a: any) => (
            <JournalCard key={a.slug} a={a} />
          ))}
        </Reveal>
      </div>
    </>
  );
}
