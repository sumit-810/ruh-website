import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { search } from '@/lib/catalog.js';
import { Seo } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { SmartLink } from '@/components/site/SmartLink';
import { thumb } from '@/components/site/Picture';
import { PageHero } from './PageHero';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  // results depend on the query string, which the prerendered page doesn't have
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const q = (ready && params.get('q')) || '';
  const [value, setValue] = useState('');
  useEffect(() => setValue(q), [q]);
  const hits: any[] = q ? search(q).slice(0, 50) : [];
  return (
    <>
      <Seo title={q ? `Search: ${q}` : 'Search'} noindex path="/search" />
      <div className="container-x max-w-4xl pb-[var(--section)]">
        <PageHero eyebrow="Search" title="Find *your way.*">
          <form
            role="search"
            className="mt-8 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setParams(value ? { q: value } : {});
            }}
          >
            <label htmlFor="sp-q" className="sr-only">
              Search the site
            </label>
            <input id="sp-q" type="search" name="q" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Search products and the journal" className="field-input" />
            <Button type="submit">Search</Button>
          </form>
        </PageHero>
        <div aria-live="polite">
          {!q && <p className="text-cocoa-3">Try “mist”, “body care” or “coming soon”.</p>}
          {ready && q && !hits.length && <p className="text-cocoa-3">Nothing found for “{q}”.</p>}
          {hits.length > 0 && (
            <>
              <p className="mb-4 text-sm text-cocoa-3">
                {hits.length} {hits.length === 1 ? 'result' : 'results'} for “{q}”
              </p>
              <ul className="divide-y divide-line border-y border-line">
                {hits.map((h) => (
                  <li key={h.url + h.title}>
                    <SmartLink href={h.url} className="group flex items-center gap-4 py-4">
                      {h.image ? <img src={thumb(h.image)} alt="" width={48} height={60} className="h-[60px] w-12 rounded-md object-cover" /> : <span className="h-[60px] w-12 rounded-md bg-sand" />}
                      <span className="grid">
                        <span className="eyebrow !text-[0.6rem]">{h.type}</span>
                        <span className="font-display text-xl group-hover:text-clay">{h.title}</span>
                        <span className="text-xs text-cocoa-3">{h.sub}</span>
                      </span>
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
}
