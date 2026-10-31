import { collections, products, upcoming } from '../../../site.config.js';
import { journal } from '../../../content/journal.js';

export const getProduct = (handle) => products.find((p) => p.handle === handle) || null;
export const getUpcoming = (handle) => upcoming.find((u) => u.handle === handle) || null;
export const getCollection = (handle) => collections.find((c) => c.handle === handle) || null;
export const getArticle = (slug) => journal.find((a) => a.slug === slug) || null;

export const productUrl = (p) => `product.html?p=${encodeURIComponent(p.handle)}`;
export const collectionUrl = (c) => `collection.html?c=${encodeURIComponent(c.handle || c)}`;
export const upcomingUrl = (u) => `collection.html?c=${encodeURIComponent(u.collection)}#${encodeURIComponent(u.handle)}`;
export const articleUrl = (a) => `article.html?a=${encodeURIComponent(a.slug)}`;

/** Resolve a handle that may be a product or an upcoming item (used by navigation). */
export const resolveItem = (handle) => {
  const p = getProduct(handle);
  if (p) return { type: 'product', item: p, url: productUrl(p), name: p.name, available: p.available };
  const u = getUpcoming(handle);
  if (u) return { type: 'upcoming', item: u, url: upcomingUrl(u), name: u.name, available: false };
  return null;
};

export const collectionItems = (handle) => ({
  products: products.filter((p) => p.collection === handle),
  upcoming: upcoming.filter((u) => u.collection === handle),
});

export const defaultVariant = (p) => p.variants.find((v) => v.available) || p.variants[0];
export const getVariant = (p, id) => p.variants.find((v) => v.id === id) || null;
export const fromPrice = (p) => Math.min(...p.variants.map((v) => v.price));

/** Flat search index across products, upcoming items, collections and journal. */
export const searchIndex = () => [
  ...products.map((p) => ({
    type: 'Products',
    title: p.name,
    sub: [p.scentName, p.scentDescriptor].filter(Boolean).join(' — '),
    url: productUrl(p),
    image: p.images[0]?.key,
    text: [p.name, p.scentName, p.scentDescriptor, p.shortDescription, p.family, ...Object.values(p.notes || {}).flat(), 'body mist fragrance scent perfume'].join(' '),
  })),
  ...upcoming.map((u) => ({
    type: 'Coming soon',
    title: u.name,
    sub: `Coming soon · ${getCollection(u.collection)?.name || ''}`,
    url: upcomingUrl(u),
    image: u.image,
    text: [u.name, u.format, u.intro, u.theme, getCollection(u.collection)?.name, 'coming soon'].join(' '),
  })),
  ...collections.map((c) => ({
    type: 'Collections',
    title: c.name,
    sub: c.status === 'live' ? 'Collection' : 'Coming soon',
    url: collectionUrl(c),
    image: c.image,
    text: [c.name, c.headline, c.intro].join(' '),
  })),
  ...journal.map((a) => ({
    type: 'Journal',
    title: a.title,
    sub: a.dek,
    url: articleUrl(a),
    image: a.image,
    text: [a.title, a.dek, a.category, ...a.body.map((b) => b.p || b.h || b.quote || (b.list || []).join(' '))].join(' '),
  })),
  { type: 'Pages', title: 'Our story', sub: 'Who we are and why', url: 'story.html', text: 'our story about brand name meaning philosophy' },
  { type: 'Pages', title: 'FAQs', sub: 'Questions and answers', url: 'faq.html', text: 'faq help questions delivery returns payment' },
  { type: 'Pages', title: 'Shipping & returns', sub: 'Delivery and returns', url: 'shipping-returns.html', text: 'shipping delivery returns refund cod' },
  { type: 'Pages', title: 'Contact', sub: 'Get in touch', url: 'contact.html', text: 'contact email help support' },
];

export const search = (q) => {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return searchIndex()
    .map((e) => {
      const hay = `${e.title} ${e.sub} ${e.text}`.toLowerCase();
      const title = e.title.toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (!hay.includes(t)) return null;
        score += title.includes(t) ? 3 : 1;
      }
      return { ...e, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
};
