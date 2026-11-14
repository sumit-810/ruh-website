import { createContext, useContext, useEffect } from 'react';
import { site } from '../../site.config.js';

/**
 * Per-page <title>, description, canonical and JSON-LD.
 * During prerendering the values are collected into a HeadCollector and
 * written into the static HTML; in the browser they update document.head.
 */
export type HeadData = { title: string; description?: string; path?: string; jsonLd?: object[]; noindex?: boolean; image?: string };
export type HeadCollector = { data?: HeadData };

export const HeadContext = createContext<HeadCollector | null>(null);

export const fullTitle = (t?: string) => (t ? `${t} — ${site.brand.name}` : `${site.brand.name} — ${site.brand.tagline}`);

const esc = (v: string) => v.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const base = () => (site.company.website ? String(site.company.website).replace(/\/$/, '') : '');

/** Serialise head data to HTML (used by the prerenderer). */
export const headToHtml = (d: HeadData) => {
  const desc = d.description || site.brand.description;
  const url = base() && d.path != null ? `${base()}${d.path}` : '';
  const image = d.image || '/assets/img/og-image.jpg';
  return [
    `<title>${esc(d.title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<meta property="og:title" content="${esc(d.title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:image" content="${esc(base() + image)}">`,
    url ? `<link rel="canonical" href="${esc(url)}"><meta property="og:url" content="${esc(url)}">` : '',
    d.noindex ? '<meta name="robots" content="noindex">' : '',
    ...(d.jsonLd || []).map((j) => `<script type="application/ld+json" data-seo>${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ]
    .filter(Boolean)
    .join('\n');
};

export function Seo({ title, description, path, jsonLd, noindex, image }: Omit<HeadData, 'title'> & { title?: string }) {
  const collector = useContext(HeadContext);
  const t = fullTitle(title);
  if (collector) collector.data = { title: t, description, path, jsonLd, noindex, image };

  useEffect(() => {
    document.title = t;
    const set = (sel: string, attr: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(sel);
      if (!el) {
        el = document.createElement('meta');
        const [k, v] = sel.replace(/^meta\[|\]$/g, '').split('=');
        el.setAttribute(k, v.replace(/"/g, ''));
        document.head.append(el);
      }
      el.setAttribute(attr, value);
    };
    const desc = description || site.brand.description;
    set('meta[name="description"]', 'content', desc);
    set('meta[property="og:title"]', 'content', t);
    set('meta[property="og:description"]', 'content', desc);
    document.head.querySelectorAll('script[data-seo]').forEach((s) => s.remove());
    (jsonLd || []).forEach((j) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.seo = '';
      s.textContent = JSON.stringify(j);
      document.head.append(s);
    });
  }, [t, description, JSON.stringify(jsonLd)]);
  return null;
}
