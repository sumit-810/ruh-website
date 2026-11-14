import { useEffect } from 'react';
import { useLocation } from 'react-router';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/** Lenis smooth scrolling on pointer devices (off for reduced motion and touch), synced with GSAP ScrollTrigger. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: { offset: -80 } });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return null;
}

/** On navigation: jump to the #anchor if there is one, otherwise to the top. */
export function ScrollManager() {
  const { pathname, hash, search } = useLocation();
  useEffect(() => {
    const id = hash ? decodeURIComponent(hash.slice(1)) : '';
    const el = id ? document.getElementById(id) : null;
    if (el) {
      requestAnimationFrame(() => (lenis ? lenis.scrollTo(el, { offset: -80, immediate: true }) : el.scrollIntoView({ block: 'start' })));
    } else {
      lenis ? lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0);
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [pathname, hash, search]);
  return null;
}

export const scrollToEl = (el: Element) => (lenis ? lenis.scrollTo(el as HTMLElement, { offset: -100 }) : el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
