import { site } from '../../../site.config.js';
import { $, $$ } from '../lib/util.js';

/** Fade-and-rise on scroll. Elements are visible immediately if IO is missing. */
export const reveal = (root = document) => {
  const els = $$('.reveal:not(.is-in)', root);
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  els.forEach((el) => io.observe(el));
};

/** Small floating "Preview" badge explaining provisional content. */
export const previewBadge = () => {
  if (!site.previewMode) return;
  const btn = document.createElement('button');
  btn.className = 'preview-badge';
  btn.type = 'button';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'preview-panel');
  btn.textContent = 'Preview build';
  const panel = document.createElement('div');
  panel.className = 'preview-panel';
  panel.id = 'preview-panel';
  panel.hidden = true;
  panel.innerHTML = `<h2>Preview build</h2>
    <p>This site is a pre-launch build. The brand name, prices, scent notes, product claims, policies and promises marked <span class="prov" style="margin:0">Placeholder</span> are provisional and must be confirmed before launch.</p>
    <p>Product images are concept renders, not final packaging. Checkout is a demo and forms are not connected.</p>
    <p class="small">Edit everything in <code>site.config.js</code>; set <code>previewMode: false</code> at launch.</p>`;
  document.body.append(btn, panel);
  btn.addEventListener('click', () => {
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });
};

/** Swipe/scroll gallery with thumbnails, dots and prev/next. */
export const wireGallery = (root) => {
  const track = $('.gallery__track', root);
  if (!track) return;
  const slides = $$('.gallery__slide', track);
  const thumbs = $$('.gallery__thumbs button', root);
  const dots = $$('.gallery__dots button', root);
  let index = 0;
  const go = (i, smooth = true) => {
    index = (i + slides.length) % slides.length;
    track.scrollTo({ left: slides[index].offsetLeft - track.offsetLeft, behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto' });
    mark();
  };
  const mark = () => {
    thumbs.forEach((t, k) => t.setAttribute('aria-current', String(k === index)));
    dots.forEach((t, k) => t.setAttribute('aria-current', String(k === index)));
    slides.forEach((s, k) => s.setAttribute('aria-hidden', String(k !== index)));
  };
  thumbs.forEach((t, k) => t.addEventListener('click', () => go(k)));
  dots.forEach((t, k) => t.addEventListener('click', () => go(k)));
  $('.gallery__nav--prev', root)?.addEventListener('click', () => go(index - 1));
  $('.gallery__nav--next', root)?.addEventListener('click', () => go(index + 1));
  let raf;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== index) {
        index = i;
        mark();
      }
    });
  });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  });
  mark();
};
