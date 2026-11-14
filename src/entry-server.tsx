import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import App, { ROUTES } from './App';
import { HeadContext, headToHtml, fullTitle, type HeadCollector } from './lib/seo';
import { products, collections } from '../site.config.js';
import { journal } from '../content/journal.js';

/** Every URL to prerender into static HTML at build time. */
export const routes = () => [
  ...ROUTES,
  ...products.map((p: any) => `/products/${p.handle}`),
  ...collections.map((c: any) => `/collections/${c.handle}`),
  ...journal.map((a: any) => `/journal/${a.slug}`),
  '/404',
];

/** Source file of the lazy page chunk a URL needs (for <link rel="modulepreload">). */
export const pageModule = (url: string) => {
  const map: [RegExp, string][] = [
    [/^\/shop$/, 'Shop'],
    [/^\/collections\//, 'Collection'],
    [/^\/products\//, 'Product'],
    [/^\/story$/, 'Story'],
    [/^\/journal$/, 'Journal'],
    [/^\/journal\//, 'Article'],
    [/^\/contact$/, 'Contact'],
    [/^\/faq$/, 'Faq'],
    [/^\/(shipping-returns|privacy|terms)$/, 'Policy'],
    [/^\/search$/, 'Search'],
    [/^\/checkout$/, 'Checkout'],
    [/^\/order$/, 'Order'],
  ];
  const hit = map.find(([re]) => re.test(url));
  return hit ? `src/pages/${hit[1]}.tsx` : null;
};

/** Render a URL to HTML, waiting for lazy pages to load (React 19 static prerender). */
export async function render(url: string) {
  const collector: HeadCollector = {};
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <HeadContext.Provider value={collector}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
  );
  let html = '';
  for await (const chunk of prelude) html += chunk;
  return { html, head: headToHtml(collector.data || { title: fullTitle() }) };
}
