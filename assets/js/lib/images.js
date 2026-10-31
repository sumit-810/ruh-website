import { images } from '../data/images.js';
import { esc } from './util.js';

/**
 * Responsive <picture> markup for a generated image key (AVIF → WebP → JPEG).
 * width/height attributes reserve space and prevent layout shift.
 *
 *   picture('pack_front', { alt: '…', sizes: '(min-width: 900px) 50vw, 100vw' })
 */
export const picture = (key, { alt = '', sizes = '100vw', priority = false, className = '' } = {}) => {
  const m = images[key];
  alt = altFor(key, alt);
  if (!m) {
    const a11y = alt ? `role="img" aria-label="${esc(alt)}"` : 'aria-hidden="true"';
    return `<div class="img-missing" ${a11y} style="aspect-ratio:4/5;background:var(--sand)"></div>`;
  }
  if (m.src) {
    // single-file build: one embedded image per key
    return `<picture${className ? ` class="${className}"` : ''}><img src="${m.src}" width="${m.w}" height="${m.h}" alt="${esc(alt)}" loading="${priority ? 'eager' : 'lazy'}" decoding="async"></picture>`;
  }
  const set = (ext) => m.widths.map((w) => `assets/img/${key}-${w}.${ext} ${w}w`).join(', ');
  const fallbackW = m.widths.find((w) => w >= 960) || m.widths[m.widths.length - 1];
  const loading = priority ? 'eager' : 'lazy';
  const fp = priority ? ' fetchpriority="high"' : '';
  return `<picture${className ? ` class="${className}"` : ''}>
<source type="image/avif" srcset="${set('avif')}" sizes="${esc(sizes)}">
<source type="image/webp" srcset="${set('webp')}" sizes="${esc(sizes)}">
<img src="assets/img/${key}-${fallbackW}.jpg" srcset="${set('jpg')}" sizes="${esc(sizes)}" width="${m.w}" height="${m.h}" alt="${esc(alt)}" loading="${loading}" decoding="async"${fp}>
</picture>`;
};

/**
 * Art-directed <picture>: `wide` from `media` upwards, `tall` below it.
 * Only the matching image is downloaded.
 */
export const artPicture = ({ wide, tall, media = '(min-width: 600px)', alt = '', sizes = '100vw', priority = false }) => {
  alt = altFor(tall, alt);
  const W = images[wide];
  const T = images[tall];
  if (!W || !T) return picture(W ? wide : tall, { alt, sizes, priority });
  if (W.src && T.src) {
    return `<picture><source media="${media}" srcset="${W.src}"><img src="${T.src}" width="${T.w}" height="${T.h}" alt="${esc(alt)}" decoding="async"></picture>`;
  }
  const set = (key, m, ext) => m.widths.map((w) => `assets/img/${key}-${w}.${ext} ${w}w`).join(', ');
  const fb = T.widths.find((w) => w >= 960) || T.widths[T.widths.length - 1];
  const sources = (key, m, mq) =>
    ['avif', 'webp', 'jpg']
      .map((ext) => `<source${mq ? ` media="${mq}"` : ''} type="image/${ext === 'jpg' ? 'jpeg' : ext}" srcset="${set(key, m, ext)}" sizes="${esc(sizes)}">`)
      .join('\n');
  return `<picture>
${sources(wide, W, media)}
${sources(tall, T, '')}
<img src="assets/img/${tall}-${fb}.jpg" width="${T.w}" height="${T.h}" alt="${esc(alt)}" loading="${priority ? 'eager' : 'lazy'}" decoding="async"${priority ? ' fetchpriority="high"' : ''}>
</picture>`;
};

/** Smallest JPEG URL — for tiny thumbnails (cart lines, search hits). */
export const thumb = (key) => {
  const m = images[key];
  if (!m) return '';
  return m.src || `assets/img/${key}-${m.widths[0]}.jpg`;
};

/** True while `key` is still a concept render (no real photo built for it yet). */
export const isRender = (key) => !!images[key] && images[key].kind !== 'photo';

/** Once a key is a real photo, drop any "Concept render: " prefix left in configured alt text. */
function altFor(key, alt) {
  return images[key]?.kind === 'photo' ? alt.replace(/^Concept render:\s*/i, '').replace(/^./, (c) => c.toUpperCase()) : alt;
}

export const defaultAlt = (key) => images[key]?.alt || '';
