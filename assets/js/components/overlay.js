import { trapFocus } from '../lib/util.js';

/**
 * Shared open/close behaviour for drawers and panels: scrim, scroll lock,
 * focus trap, Escape to close, focus restoration.
 */
let scrim;
let active = null;

// Escape closes whichever overlay is open, even if focus was lost to <body>
// (e.g. after the overlay's content re-rendered).
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && active) active.close();
});

/** Close any open drawer/panel (used when the single-file router changes page). */
export const closeActive = () => active?.close(false);

const getScrim = () => {
  if (scrim) return scrim;
  scrim = document.createElement('div');
  scrim.className = 'scrim';
  scrim.addEventListener('click', () => active?.close());
  document.body.append(scrim);
  return scrim;
};

export const makeOverlay = (el, { onOpen, onClose, initialFocus } = {}) => {
  let release = null;
  let returnTo = null;
  const api = {
    get isOpen() {
      return el.classList.contains('is-open');
    },
    open(trigger) {
      if (active && active !== api) active.close(false);
      returnTo = trigger || document.activeElement;
      el.hidden = false;
      // allow display before transition
      requestAnimationFrame(() => {
        el.classList.add('is-open');
        getScrim().classList.add('is-open');
      });
      el.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-locked');
      release = trapFocus(el);
      active = api;
      onOpen?.();
      setTimeout(() => (initialFocus?.() || el.querySelector('[data-autofocus]') || el).focus?.({ preventScroll: true }), 60);
    },
    close(restore = true) {
      if (!api.isOpen) return;
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      getScrim().classList.remove('is-open');
      document.body.classList.remove('is-locked');
      release?.();
      if (active === api) active = null;
      onClose?.();
      if (restore && returnTo?.focus) returnTo.focus({ preventScroll: true });
    },
    toggle(trigger) {
      api.isOpen ? api.close() : api.open(trigger);
    },
  };
  el.setAttribute('aria-hidden', 'true');
  return api;
};
