/**
 * Motion system for the "Living still life" design.
 *
 * One vocabulary of soft verbs — blur-in, brighten, glare, settle, drift —
 * driven by IntersectionObserver and pointer position, never by timers alone.
 * Every effect is decorative: content is complete and readable without it.
 *
 * Guards, in order of strength:
 *  - prefers-reduced-motion: nothing moves; text and images appear as they are.
 *  - the visitor's "pause motion" choice (remembered on this device): loops,
 *    the WebGL field and the marquee stop.
 *  - Save-Data, 2G connections and the single-file build: no video or WebGL is
 *    downloaded or started; still images stay in place.
 *
 * The effects are independent implementations written for this site. Several
 * are inspired by React Bits (https://reactbits.dev, MIT + Commons Clause);
 * see THIRD_PARTY_NOTICES.md.
 */
import { storage } from './storage.js';
import { SINGLE_FILE } from './util.js';
import { loops } from '../data/loops.js';

const PAUSE_KEY = 'gc.motionPaused.v1';

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
export const saveData = () => !!navigator.connection?.saveData;
const slowNetwork = () => /(^|-)2g$/.test(navigator.connection?.effectiveType || '');
export const finePointer = () => matchMedia('(hover: hover) and (pointer: fine)').matches;

export const isPaused = () => storage.get(PAUSE_KEY, false) === true;
/** Ambient motion (loops, marquee, WebGL field) may run right now. */
export const ambientOK = () => !reducedMotion() && !isPaused();
/** Heavy media (video, WebGL) may be downloaded and started. */
export const mediaAllowed = () => !reducedMotion() && !saveData() && !slowNetwork() && !SINGLE_FILE;

export const setPaused = (paused) => {
  storage.set(PAUSE_KEY, !!paused);
  syncToggles();
  window.dispatchEvent(new CustomEvent('motion:change', { detail: { paused: !!paused } }));
};

/* ---------------------------------------------------------------------------
 * Pause control (WCAG 2.2.2): every section with ambient motion carries one.
 * All toggles share one state.
 * ------------------------------------------------------------------------- */
const PAUSE_ICON = '<svg viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4.5 3v8M9.5 3v8" stroke="currentColor" stroke-width="1.5"/></svg>';
const PLAY_ICON = '<svg viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M4.5 2.8 11 7l-6.5 4.2z" fill="currentColor"/></svg>';

export const motionToggle = ({ tone = 'light', className = '' } = {}) =>
  reducedMotion()
    ? ''
    : `<button class="motion-toggle motion-toggle--${tone} ${className}" type="button" data-motion-toggle aria-pressed="${isPaused()}"><span class="motion-toggle__icon" aria-hidden="true">${isPaused() ? PLAY_ICON : PAUSE_ICON}</span><span class="visually-hidden">Pause background motion</span></button>`;

const syncToggles = () =>
  document.querySelectorAll('[data-motion-toggle]').forEach((b) => {
    const p = isPaused();
    b.setAttribute('aria-pressed', String(p));
    b.querySelector('.motion-toggle__icon').innerHTML = p ? PLAY_ICON : PAUSE_ICON;
  });

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------- */
/** Observe elements; `cb(entry)` runs on every intersection change. Returns a disconnect function. */
export const watch = (els, cb, options = {}) => {
  const list = [].concat(els).filter(Boolean);
  if (!list.length) return () => {};
  if (!('IntersectionObserver' in window)) {
    list.forEach((target) => cb({ target, isIntersecting: true, intersectionRatio: 1 }));
    return () => {};
  }
  const io = new IntersectionObserver((entries) => entries.forEach(cb), options);
  list.forEach((el) => io.observe(el));
  return () => io.disconnect();
};

/** Wrap each word of an element's text in a span, keeping inline markup such as <em>. */
export const splitWords = (el, className) => {
  if (el.dataset.split) return [...el.querySelectorAll(`.${className}`)];
  const words = [];
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = child.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(document.createTextNode(part));
          const span = document.createElement('span');
          span.className = className;
          span.textContent = part;
          span.style.setProperty('--i', String(words.length));
          words.push(span);
          frag.append(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  el.dataset.split = '1';
  return words;
};

const onRouteChange = (fn) => window.addEventListener('route:change', fn, { once: true });

/* ---------------------------------------------------------------------------
 * Blur text: words resolve from soft focus, one after another.
 * ------------------------------------------------------------------------- */
export const blurText = (root = document) => {
  const els = [...root.querySelectorAll('[data-blur-text]:not(.is-in)')];
  els.forEach((el) => {
    splitWords(el, 'bt-w');
    el.classList.add('bt');
  });
  if (reducedMotion()) return els.forEach((el) => el.classList.add('is-in'));
  const stop = watch(
    els,
    (e) => {
      if (!e.isIntersecting) return;
      // two frames so the initial (blurred) state is painted before the transition starts
      requestAnimationFrame(() => requestAnimationFrame(() => e.target.classList.add('is-in')));
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  onRouteChange(stop);
};

/* ---------------------------------------------------------------------------
 * Mask text: each word rises from behind its own line mask.
 * ------------------------------------------------------------------------- */
export const maskText = (root = document) => {
  const els = [...root.querySelectorAll('[data-mask-text]:not(.is-in)')];
  els.forEach((el) => {
    if (!el.dataset.split) {
      splitWords(el, 'mt-i').forEach((w) => {
        const outer = document.createElement('span');
        outer.className = 'mt-w';
        w.replaceWith(outer);
        outer.append(w);
      });
    }
    el.classList.add('mt');
  });
  if (reducedMotion()) return els.forEach((el) => el.classList.add('is-in'));
  const stop = watch(
    els,
    (e) => e.isIntersecting && requestAnimationFrame(() => requestAnimationFrame(() => e.target.classList.add('is-in'))),
    { rootMargin: '0px 0px -10% 0px' },
  );
  onRouteChange(stop);
};

/* ---------------------------------------------------------------------------
 * Scroll reveal: words brighten as the passage moves up the screen.
 * The dim colour still passes WCAG AA for large text.
 * ------------------------------------------------------------------------- */
export const scrollReveal = (root = document) => {
  [...root.querySelectorAll('[data-scroll-reveal]')].forEach((el) => {
    const words = splitWords(el, 'sr-w');
    el.classList.add('sr');
    if (reducedMotion()) return words.forEach((w) => w.classList.add('is-lit'));
    let lit = -1;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.9 - r.top) / (r.height + vh * 0.45)));
      const n = Math.round(p * words.length);
      if (n === lit) return;
      lit = n;
      words.forEach((w, i) => w.classList.toggle('is-lit', i < n));
    };
    const onScroll = () => (raf ||= requestAnimationFrame(update));
    let listening = false;
    const stop = watch(el, (e) => {
      if (e.isIntersecting && !listening) {
        window.addEventListener('scroll', onScroll, { passive: true });
        listening = true;
        update();
      } else if (!e.isIntersecting && listening) {
        window.removeEventListener('scroll', onScroll);
        listening = false;
        update();
      }
    });
    onRouteChange(() => {
      stop();
      window.removeEventListener('scroll', onScroll);
    });
  });
};

/* ---------------------------------------------------------------------------
 * Scroll stack: cards pin one after another (CSS sticky) and the ones beneath
 * settle back slightly as the next card covers them.
 * ------------------------------------------------------------------------- */
export const scrollStack = (root = document) => {
  [...root.querySelectorAll('[data-stack]')].forEach((stack) => {
    const cards = [...stack.querySelectorAll('[data-stack-card]')];
    cards.forEach((c, i) => c.style.setProperty('--i', String(i)));
    if (reducedMotion() || cards.length < 2) return;
    let raf = 0;
    let active = -1;
    const update = () => {
      raf = 0;
      let top = 0;
      cards.forEach((card, i) => {
        const a = card.getBoundingClientRect();
        if (a.top <= parseFloat(getComputedStyle(card).top) + 4) top = i;
        const next = cards[i + 1];
        if (!next) return;
        const b = next.getBoundingClientRect();
        const cover = Math.min(1, Math.max(0, (a.bottom - b.top) / a.height));
        card.style.setProperty('--cover', cover.toFixed(3));
      });
      if (top !== active) {
        active = top;
        stack.dispatchEvent(new CustomEvent('stack:active', { detail: { index: top } }));
      }
    };
    const onScroll = () => (raf ||= requestAnimationFrame(update));
    let listening = false;
    const stop = watch(stack, (e) => {
      if (e.isIntersecting === listening) return;
      listening = e.isIntersecting;
      window[listening ? 'addEventListener' : 'removeEventListener']('scroll', onScroll, { passive: true });
      update();
    });
    onRouteChange(() => {
      stop();
      window.removeEventListener('scroll', onScroll);
    });
  });
};

/* ---------------------------------------------------------------------------
 * Pointer effects (fine pointers only): tilt + spotlight on product media,
 * and a gentle magnetic pull on primary buttons. Delegated, so cards rendered
 * later (filters, related products, quick view) are covered too.
 * ------------------------------------------------------------------------- */
let pointerWired = false;
export const wirePointerEffects = () => {
  if (pointerWired) return;
  pointerWired = true;
  let tiltEl = null;
  let magnetEl = null;
  let raf = 0;
  let last = null;
  const resetTilt = () => {
    if (!tiltEl) return;
    tiltEl.classList.remove('is-tilting');
    tiltEl.style.removeProperty('--rx');
    tiltEl.style.removeProperty('--ry');
    tiltEl = null;
  };
  const resetMagnet = () => {
    if (!magnetEl) return;
    magnetEl.style.removeProperty('--mgx');
    magnetEl.style.removeProperty('--mgy');
    magnetEl = null;
  };
  const frame = () => {
    raf = 0;
    const e = last;
    if (!e) return;
    const t = e.target.closest?.('[data-tilt]');
    if (t !== tiltEl) resetTilt();
    if (t) {
      const r = t.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const max = Number(t.dataset.tilt) || 4;
      t.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      t.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      t.style.setProperty('--rx', `${((0.5 - y) * max).toFixed(2)}deg`);
      t.style.setProperty('--ry', `${((x - 0.5) * max).toFixed(2)}deg`);
      t.classList.add('is-tilting');
      tiltEl = t;
    }
    const m = e.target.closest?.('[data-magnet]');
    if (m !== magnetEl) resetMagnet();
    if (m) {
      const r = m.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      m.style.setProperty('--mgx', `${Math.max(-6, Math.min(6, dx * 0.18)).toFixed(1)}px`);
      m.style.setProperty('--mgy', `${Math.max(-4, Math.min(4, dy * 0.25)).toFixed(1)}px`);
      magnetEl = m;
    }
  };
  document.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse' || reducedMotion() || !finePointer()) return;
      last = e;
      raf ||= requestAnimationFrame(frame);
    },
    { passive: true },
  );
  document.addEventListener('pointerleave', () => {
    resetTilt();
    resetMagnet();
  });
  window.addEventListener('route:change', () => {
    tiltEl = null;
    magnetEl = null;
  });
};

/* ---------------------------------------------------------------------------
 * Living loops: short seamless videos rendered from our own Blender scenes.
 * The still image is always underneath; the video fades in once it plays,
 * plays only while visible, and never loads when media is not allowed.
 * ------------------------------------------------------------------------- */
const loopVideo = (name) => {
  const v = document.createElement('video');
  v.className = 'loop__video';
  v.muted = true;
  v.defaultMuted = true;
  v.loop = true;
  v.playsInline = true;
  v.setAttribute('muted', '');
  v.setAttribute('playsinline', '');
  v.setAttribute('aria-hidden', 'true');
  v.setAttribute('tabindex', '-1');
  v.setAttribute('disablepictureinpicture', '');
  v.setAttribute('disableremoteplayback', '');
  v.preload = 'auto';
  const meta = loops[name];
  (meta.formats || ['mp4']).forEach((ext) => {
    const s = document.createElement('source');
    s.src = `assets/img/loops/${name}.${ext}`;
    s.type = `video/${ext}`;
    v.append(s);
  });
  return v;
};

export const wireLoops = (root = document) => {
  const hosts = [...root.querySelectorAll('[data-loop]')].filter((h) => !h.dataset.loopWired);
  if (!hosts.length || !mediaAllowed()) return;
  const state = new Map();
  const play = (h) => {
    const s = state.get(h);
    if (!s?.video || !s.visible || !ambientOK()) return;
    s.video.play().catch(() => {});
  };
  const pause = (h) => state.get(h)?.video?.pause();
  const ensure = (h) => {
    const s = state.get(h);
    if (s.video !== undefined) return;
    const tall = h.dataset.loopTall;
    const name = tall && !matchMedia(h.dataset.loopMedia || '(min-width: 900px)').matches ? tall : h.dataset.loop;
    if (!loops[name]) {
      s.video = null;
      return;
    }
    const v = loopVideo(name);
    v.addEventListener('playing', () => h.classList.add('is-playing'), { once: true });
    v.addEventListener('error', () => v.remove(), true);
    h.append(v);
    s.video = v;
  };
  hosts.forEach((h) => {
    h.dataset.loopWired = '1';
    state.set(h, { visible: false, video: undefined });
  });
  // start downloading a little before the loop scrolls into view
  const stopNear = watch(
    hosts,
    (e) => {
      if (!e.isIntersecting) return;
      ensure(e.target);
      play(e.target);
    },
    { rootMargin: '300px 0px' },
  );
  const stopVisible = watch(hosts, (e) => {
    const s = state.get(e.target);
    s.visible = e.isIntersecting;
    if (s.visible) {
      ensure(e.target);
      play(e.target);
    } else pause(e.target);
  });
  const onMotion = () => hosts.forEach((h) => (ambientOK() ? play(h) : pause(h)));
  window.addEventListener('motion:change', onMotion);
  onRouteChange(() => {
    stopNear();
    stopVisible();
    window.removeEventListener('motion:change', onMotion);
    hosts.forEach(pause);
  });
};

/* ---------------------------------------------------------------------------
 * Curved loop: a slow line of text drifting along a gentle arc.
 * ------------------------------------------------------------------------- */
export const curvedLoop = (root = document) => {
  [...root.querySelectorAll('[data-curved-loop]')].forEach((svg) => {
    const path = svg.querySelector('path');
    const text = svg.querySelector('textPath');
    const unit = svg.querySelector('[data-unit]');
    if (!path || !text || !unit) return;
    const unitLen = unit.getComputedTextLength();
    if (!unitLen) return;
    const reps = Math.ceil(path.getTotalLength() / unitLen) + 2;
    text.textContent = Array(reps).fill(unit.textContent).join('');
    let offset = -unitLen;
    let raf = 0;
    let lastT = 0;
    let visible = false;
    const tick = (t) => {
      raf = 0;
      if (!visible || !ambientOK()) return;
      const dt = lastT ? Math.min(64, t - lastT) : 16;
      lastT = t;
      offset += dt * 0.03; // px per ms
      if (offset >= 0) offset -= unitLen;
      text.setAttribute('startOffset', offset.toFixed(1));
      raf = requestAnimationFrame(tick);
    };
    text.setAttribute('startOffset', String(offset));
    const start = () => {
      lastT = 0;
      if (!raf && visible && ambientOK()) raf = requestAnimationFrame(tick);
    };
    const stop = watch(svg, (e) => {
      visible = e.isIntersecting;
      start();
    });
    window.addEventListener('motion:change', start);
    onRouteChange(() => {
      stop();
      window.removeEventListener('motion:change', start);
      cancelAnimationFrame(raf);
    });
  });
};

/* ---------------------------------------------------------------------------
 * Grain field: a slow, low-contrast warm field painted with WebGL behind the
 * early-access panel. Low resolution, capped frame rate, paused off-screen.
 * The CSS gradient underneath is the fallback.
 * ------------------------------------------------------------------------- */
const FIELD_VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FIELD_FS = `precision mediump float;
uniform vec2 r;uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.)*1.6;
float a=n(q+vec2(t*.035,t*.02));float b=n(q*1.7-vec2(t*.025,-t*.03)+a);
float silk=smoothstep(.25,.95,b*.7+a*.5);
float glow=silk*(1.-uv.y*.55)*smoothstep(1.15,.2,distance(uv,vec2(.15,.05)))
          +silk*.6*smoothstep(.9,.1,distance(uv,vec2(.95,.95)));
vec3 base=vec3(.129,.098,.082);vec3 warm=vec3(.36,.23,.17);
vec3 c=mix(base,warm,clamp(glow,0.,1.)*.55);
c+=(h(gl_FragCoord.xy+fract(t))-.5)*.035;
gl_FragColor=vec4(c,1.);}`;

export const grainField = (root = document) => {
  [...root.querySelectorAll('[data-grain-field]')].forEach((host) => {
    if (!mediaAllowed() || host.dataset.fieldWired) return;
    host.dataset.fieldWired = '1';
    const canvas = document.createElement('canvas');
    canvas.className = 'field__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = sh(gl.VERTEX_SHADER, FIELD_VS);
    const fs = sh(gl.FRAGMENT_SHADER, FIELD_FS);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, 'r');
    const uT = gl.getUniformLocation(prog, 't');
    host.prepend(canvas);
    const SCALE = 0.35; // render small; the field is soft anyway
    const resize = () => {
      const w = Math.max(1, Math.round(host.clientWidth * SCALE));
      const h = Math.max(1, Math.round(host.clientHeight * SCALE));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };
    let visible = false;
    let raf = 0;
    let last = 0;
    let time = Math.random() * 100;
    const draw = (now) => {
      raf = 0;
      if (!visible) return;
      if (now - last >= 1000 / 24) {
        if (ambientOK()) time += (now - (last || now)) / 1000;
        last = now;
        resize();
        gl.uniform2f(uR, canvas.width, canvas.height);
        gl.uniform1f(uT, time);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        host.classList.add('is-live');
      }
      if (ambientOK()) raf = requestAnimationFrame(draw);
    };
    const kick = () => {
      last = 0;
      if (!raf && visible) raf = requestAnimationFrame(draw);
    };
    const stop = watch(host, (e) => {
      visible = e.isIntersecting;
      kick();
    });
    window.addEventListener('motion:change', kick);
    window.addEventListener('resize', kick);
    onRouteChange(() => {
      stop();
      cancelAnimationFrame(raf);
      window.removeEventListener('motion:change', kick);
      window.removeEventListener('resize', kick);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    });
  });
};

/** Wire every motion effect found inside `root`. */
export const wireMotion = (root = document) => {
  blurText(root);
  maskText(root);
  scrollReveal(root);
  scrollStack(root);
  wireLoops(root);
  curvedLoop(root);
  grainField(root);
};

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-motion-toggle]');
  if (b) setPaused(!isPaused());
});
