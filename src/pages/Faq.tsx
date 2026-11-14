import { content, products } from '../../site.config.js';
import { Seo } from '@/lib/seo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLink } from '@/components/site/ArrowLink';
import { Reveal } from '@/components/site/Reveal';
import { PageHero } from './PageHero';

export default function Faq() {
  const groups = [...content.faqs, ...products.map((p: any) => ({ group: p.name, items: p.faqs || [] }))].filter((g: any) => g.items.length);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: groups.flatMap((g: any) => g.items.map((f: any) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))),
  };
  return (
    <>
      <Seo title="FAQs" description="Answers about our products, orders, delivery and returns." path="/faq" jsonLd={[ld]} />
      <div className="container-x pb-[var(--section)]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <PageHero eyebrow="Help" title="Questions, *answered.*" lede="Answers about our products and orders." />
            <ArrowLink href="/contact">Still have a question? Contact us</ArrowLink>
          </div>
          <div className="lg:pt-24">
            {groups.map((g: any, i: number) => (
              <Reveal key={g.group} className="mb-14">
                <h2 className="display-sm mb-4" id={`faq-${i}`}>
                  {g.group}
                </h2>
                <Accordion type="single" collapsible className="border-t border-line">
                  {g.items.map((f: any) => (
                    <AccordionItem key={f.q} value={f.q} className="border-line">
                      <AccordionTrigger className="py-5 font-sans text-base font-normal hover:no-underline cursor-pointer">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-[0.95rem] text-cocoa-2">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
