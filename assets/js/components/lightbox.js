import { picture } from '../lib/images.js';
import { icon, $ } from '../lib/util.js';
import { makeOverlay } from './overlay.js';
import { reducedMotion } from '../lib/motion.js';

/**
 * Full-screen image viewer for product galleries.
 * Pinch, drag and double-tap on touch; wheel, drag and double-click with a
 * mouse; arrows, + / − and 0 on the keyboard. Swipe or arrow keys change the
 * image while it is not zoomed in. Written for this site; the interaction
 * model was inspired by the media viewer in Unsloth Studio (no code reused).
 */
const MIN = 1;
const MAX = 4;
let el;
let ov;
let st = null; // { images, index, onChange, s, tx, ty }

const ensure = () => {
  if (el) return;
  el = document.createElement('div');
  el.className = 'lb';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.tabIndex = -1;
  el.hidden = true;
  el.innerHTML = `
  <div class="lb__bar">
    <span class="lb__count" data-lb-count aria-live="polite"></span>
    <div class="lb__tools">
      <button class="lb__btn" type="button" data-lb-zoom="-1" aria-label="Zoom out">${icon.minus}</button>
      <button class="lb__btn" type="button" data-lb-zoom="1" aria-label="Zoom in">${icon.plus}</button>
      <button class="lb__btn" type="button" data-lb-close aria-label="Close image viewer">${icon.close}</button>
    </div>
  </div>
  <div class="lb__stage" data-lb-stage><div class="lb__frame" data-lb-frame></div></div>
  <button class="lb__nav lb__nav--prev" type="button" data-lb-step="-1" aria-label="Previous image">${icon.arrowLeft}</button>
  <button class="lb__nav lb__nav--next" type="button" data-lb-step="1" aria-label="Next image">${icon.arrow}</button>
  <p class="lb__caption" data-lb-caption></p>
  <p class="visually-hidden">Arrow keys change the image. Plus and minus zoom; zero resets.</p>`;
  document.body.append(el);
  ov = makeOverlay(el, { initialFocus: () => $('[data-lb-close]', el), onClose: () => st?.onChange?.(st.index) });
  wire();
};

const stage = () => $('[data-lb-stage]', el);
const img = () => $('[data-lb-frame] img', el);

const clamp = () => {
  const i = img();
  if (!i) return;
  const W = stage().clientWidth;
  const H = stage().clientHeight;
  const mx = Math.max(0, (i.offsetWidth * st.s - W) / 2);
  const my = Math.max(0, (i.offsetHeight * st.s - H) / 2);
  st.tx = Math.max(-mx, Math.min(mx, st.tx));
  st.ty = Math.max(-my, Math.min(my, st.ty));
};

const apply = (animate = false) => {
  const i = img();
  if (!i) return;
  clamp();
  i.style.transition = animate && !reducedMotion() ? 'transform 280ms cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none';
  i.style.transform = `translate3d(${st.tx}px, ${st.ty}px, 0) scale(${st.s})`;
  el.classList.toggle('is-zoomed', st.s > 1.01);
  $('[data-lb-zoom="-1"]', el).disabled = st.s <= MIN + 0.01;
  $('[data-lb-zoom="1"]', el).disabled = st.s >= MAX - 0.01;
};

/** Zoom to scale `s` keeping the stage point (px, py) — relative to the stage centre — fixed. */
const zoomTo = (s, px = 0, py = 0, animate = false) => {
  const s2 = Math.max(MIN, Math.min(MAX, s));
  const k = s2 / st.s;
  st.tx = px - (px - st.tx) * k;
  st.ty = py - (py - st.ty) * k;
  st.s = s2;
  if (s2 === MIN) st.tx = st.ty = 0;
  apply(animate);
};

const fromCentre = (clientX, clientY) => {
  const r = stage().getBoundingClientRect();
  return [clientX - (r.left + r.width / 2), clientY - (r.top + r.height / 2)];
};

const show = (index) => {
  const n = st.images.length;
  st.index = (index + n) % n;
  st.s = 1;
  st.tx = st.ty = 0;
  const im = st.images[st.index];
  $('[data-lb-frame]', el).innerHTML = picture(im.key, { alt: im.alt, sizes: '100vw', priority: true });
  $('[data-lb-count]', el).textContent = `${st.index + 1} / ${n}`;
  $('[data-lb-caption]', el).textContent = im.alt || '';
  el.querySelectorAll('[data-lb-step]').forEach((b) => (b.hidden = n < 2));
  const i = img();
  i.draggable = false;
  if (i.complete) apply();
  else i.addEventListener('load', () => apply(), { once: true });
};

const wire = () => {
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-lb-close]')) return ov.close();
    const step = e.target.closest('[data-lb-step]');
    if (step) return show(st.index + Number(step.dataset.lbStep));
    const z = e.target.closest('[data-lb-zoom]');
    if (z) return zoomTo(Number(z.dataset.lbZoom) > 0 ? st.s * 1.6 : st.s / 1.6, 0, 0, true);
  });

  // document-level while open, so keys work even before focus has moved into the viewer
  document.addEventListener('keydown', (e) => {
    if (!st || !el.classList.contains('is-open')) return;
    const zoomed = st.s > 1.01;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const dir = e.key === 'ArrowRight' ? 1 : -1;
      if (zoomed) {
        st.tx -= dir * 80;
        apply(true);
      } else show(st.index + dir);
    } else if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && zoomed) {
      e.preventDefault();
      st.ty -= (e.key === 'ArrowDown' ? 1 : -1) * 80;
      apply(true);
    } else if (e.key === '+' || e.key === '=') {
      zoomTo(st.s * 1.6, 0, 0, true);
    } else if (e.key === '-' || e.key === '_') {
      zoomTo(st.s / 1.6, 0, 0, true);
    } else if (e.key === '0') {
      zoomTo(1, 0, 0, true);
    }
  });

  const sg = stage();
  sg.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const [px, py] = fromCentre(e.clientX, e.clientY);
      zoomTo(st.s * Math.exp(-e.deltaY * 0.0018), px, py);
    },
    { passive: false },
  );

  // pointers: drag to pan, pinch to zoom, swipe to change image, double tap to zoom
  const pts = new Map();
  let start = null; // { x, y, tx, ty, s, dist, mid }
  let lastTap = 0;
  let moved = false;
  const snapshot = () => {
    const list = [...pts.values()];
    if (list.length >= 2) {
      const [a, b] = list;
      start = { tx: st.tx, ty: st.ty, s: st.s, dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, mid: fromCentre((a.x + b.x) / 2, (a.y + b.y) / 2) };
    } else if (list.length === 1) {
      start = { x: list[0].x, y: list[0].y, tx: st.tx, ty: st.ty, s: st.s };
    }
  };
  sg.addEventListener('pointerdown', (e) => {
    if (e.button > 0) return;
    sg.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = false;
    snapshot();
  });
  sg.addEventListener('pointermove', (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const list = [...pts.values()];
    if (list.length >= 2) {
      const [a, b] = list;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const [mx, my] = start.mid;
      const s2 = Math.max(MIN, Math.min(MAX, start.s * (d / start.dist)));
      const k = s2 / start.s;
      st.s = s2;
      st.tx = mx - (mx - start.tx) * k;
      st.ty = my - (my - start.ty) * k;
      moved = true;
      apply();
    } else if (start && start.x !== undefined) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      if (st.s > 1.01) {
        st.tx = start.tx + dx;
        st.ty = start.ty + dy;
        apply();
      } else {
        img().style.transform = `translate3d(${dx * 0.6}px, 0, 0)`; // swipe preview
      }
    }
  });
  const end = (e) => {
    if (!pts.has(e.pointerId)) return;
    const wasSingle = pts.size === 1;
    pts.delete(e.pointerId);
    if (wasSingle && start && start.x !== undefined) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (st.s <= 1.01 && moved && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        show(st.index + (dx < 0 ? 1 : -1));
      } else if (!moved) {
        const now = Date.now();
        if (now - lastTap < 320) {
          const [px, py] = fromCentre(e.clientX, e.clientY);
          zoomTo(st.s > 1.01 ? 1 : 2.5, px, py, true);
          lastTap = 0;
        } else lastTap = now;
        if (st.s <= 1.01) apply();
      } else if (st.s <= 1.01) apply(true);
    }
    snapshot();
  };
  sg.addEventListener('pointerup', end);
  sg.addEventListener('pointercancel', end);
  window.addEventListener('resize', () => st && el.classList.contains('is-open') && apply());
};

/** Open the viewer. `images`: [{ key, alt }]. `onChange(index)` runs on close. */
export const openLightbox = ({ images, index = 0, title = '', trigger, onChange }) => {
  if (!images?.length) return;
  ensure();
  st = { images, index, onChange, s: 1, tx: 0, ty: 0 };
  el.setAttribute('aria-label', `${title ? `${title} — ` : ''}image viewer`);
  show(index);
  ov.open(trigger);
};

