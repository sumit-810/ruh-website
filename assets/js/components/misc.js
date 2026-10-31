import { site } from '../../../site.config.js';
import { $, $$ } from '../lib/util.js';

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Fade-and-rise on scroll. Elements are visible immediately if IO is missing. */
export const reveal = (root = document) => {
  const els = $$('.reveal:not(.is-in)', root);
  if (!('IntersectionObserver' in window) || reduced()) {
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
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
  );
  els.forEach((el) => io.observe(el));
};

/**
 * Product gallery: cross-fading slides, thumbnails, arrows, swipe, keyboard,
 * and hover/click zoom (desktop) that follows the pointer.
 */
export const wireGallery = (root) => {
  const main = $('.gallery__main', root);
  if (!main) return;
  const slides = $$('.gallery__slide', main);
  const thumbs = $$('.gallery__thumbs button', root);
  const count = $('.gallery__count', root);
  let index = 0;
  const go = (i) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, k) => {
      s.classList.toggle('is-on', k === index);
      s.setAttribute('aria-hidden', String(k !== index));
    });
    thumbs.forEach((t, k) => t.setAttribute('aria-current', String(k === index)));
    if (count) count.textContent = `${index + 1} / ${slides.length}`;
    main.classList.remove('is-zoom');
  };
  thumbs.forEach((t, k) => t.addEventListener('click', () => go(k)));
  $('.gallery__nav--prev', root)?.addEventListener('click', () => go(index - 1));
  $('.gallery__nav--next', root)?.addEventListener('click', () => go(index + 1));
  main.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  });
  // swipe
  let x0 = null;
  main.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
  main.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });
  // zoom (pointer devices)
  if (matchMedia('(hover: hover)').matches) {
    main.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      main.classList.toggle('is-zoom');
      move(e);
    });
    const move = (e) => {
      if (!main.classList.contains('is-zoom')) return;
      const r = main.getBoundingClientRect();
      const img = $('.gallery__slide.is-on img', main);
      if (img) img.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
    };
    main.addEventListener('mousemove', move);
    main.addEventListener('mouseleave', () => main.classList.remove('is-zoom'));
  }
  go(0);
};

/** Horizontal shelf: arrows + progress bar for a scroll-snap track. */
export const wireShelf = (root) => {
  const track = $('.shelf__track', root);
  if (!track) return;
  const prev = $('[data-shelf-prev]', root);
  const next = $('[data-shelf-next]', root);
  const bar = $('.shelf__progress span', root);
  const step = () => track.clientWidth * 0.9;
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth;
    if (prev) prev.disabled = track.scrollLeft <= 4;
    if (next) next.disabled = track.scrollLeft >= max - 4;
    if (bar) {
      const w = max > 0 ? track.clientWidth / track.scrollWidth : 1;
      bar.style.width = `${w * 100}%`;
      bar.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * ((1 - w) / w) * 100 : 0}%)`;
    }
  };
  prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduced() ? 'auto' : 'smooth' }));
  next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduced() ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  window.addEventListener('resize', sync);
  sync();
  return sync;
};

/** WhatsApp click-to-chat — only rendered when site.contact.whatsapp is set. */
export const supportButton = () => {
  const n = String(site.contact.whatsapp || '').replace(/\D/g, '');
  if (!n) return;
  const a = document.createElement('a');
  a.className = 'support-fab';
  a.href = `https://wa.me/${n}?text=${encodeURIComponent(`Hi ${site.brand.name}, I have a question.`)}`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Chat with us on WhatsApp (opens in a new tab)');
  a.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" d="M4 20l1.2-3.6A8 8 0 1 1 8 19z"/></svg>`;
  document.body.append(a);
};
