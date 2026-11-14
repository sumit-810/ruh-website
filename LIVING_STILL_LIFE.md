# Living Still Life: redesign notes

**Branch:** `redesign/living-still-life` (not merged; production `main` is unchanged).
**Scope:** the approved High and Medium priority items from the redesign proposal.
**Cost:** ₹0. No paid services, credits, subscriptions or dependencies. Loops and stills were rendered locally with Blender and encoded with a local ffmpeg.

The idea: keep the calm, product-first site and let it breathe. Only soft verbs are used: blur-in, brighten, glare, settle and drift. Every moving image comes from the same Blender scenes and light as the stills, so the motion looks like one brand.

## What changed, by page

### Home
| Section | Before | Now |
|---|---|---|
| Hero | Still render, static headline | **Cinemagraph**: a 10-second seamless loop. The leaf shadows sway across the whole wall behind the headline and the sunlight slowly swells and fades, like a passing cloud; the bottle, label and camera never move. The still image stays underneath and is still the LCP image. The headline resolves word by word from soft focus; the primary button has a gentle magnetic pull; a pause button sits on the image. |
| Collection shelf | Cards with a hover image | A glare sweep across the glass on hover, a ≤4° tilt and a warm spotlight that follow the pointer (mouse only), and a gradual-blur edge while there is more to scroll. |
| Shop by category | Three static tiles | **Three living panels**: tall panels with slow loops, vertical labels, and hover widening (desktop). They stack on mobile. A pause button sits in the section header. |
| Brand intro | Bottle image, title and two lines | A **new composition** (Body Butter on linen and travertine, arched window light). The statement brightens word by word as it is read. |
| Moments | Tab list and cross-fade | **Stacked cards**: four moments pin and settle as you scroll; the numbered index follows the card on top. |
| Between sections | — | A slow line of text drifting along a gentle arc (Body · Face · Lip · Launching soon). |
| What comes next | Lineup and a 14-row table | Hotspots kept; the table is replaced by **compact chips** and a **line filter** (All / Body / Face / Lip) that also filters the hotspots. |
| Early access | Bottle again, on dark | A **new composition** (one product from each line on clay plaster) and a slow warm grain field (WebGL) behind the form. |

### Product page
- **Full-screen image viewer**, opened by clicking or tapping the image, by pressing Enter, or with the expand button. It supports pinch and double-tap zoom on touch, wheel and double-click with a mouse, drag to pan, swipe or arrow keys between images, and +, − and 0 on the keyboard. It traps focus and returns focus on close; the gallery follows the image you ended on.
- **At a glance** card: category, line, status (and size once confirmed), plus a link to the rest of the line with thumbnails. It is built only from confirmed catalogue data; nothing is invented.
- Glare sweep on the main image.
- **Sticky bar:** the overlap seen in an earlier full-page capture was checked by scanning the mobile page every 80 px. The bar never covers the notify panel. The earlier capture was a full-page screenshot artefact, so no change was needed. The scan is now an automated test.

### Everywhere
- **Search palette:** ⌘K / Ctrl+K (and `/`). Before you type, it shows recently viewed products, the three lines and the main pages. Arrow keys move through results (`aria-activedescendant`), Enter opens one and Escape closes.
- **Mobile menu:** tiles and links arrive one after another.
- **Story:** chapters stack as you scroll; headings rise from behind a line mask.
- **Collections:** the hero image plays its line's loop, and cards arrive in a short stagger.

## Motion system

All effects live in `assets/js/lib/motion.js` and `assets/css/main.css` (sections 10 and 14), written for this site with no libraries.

| Guard | Effect |
|---|---|
| `prefers-reduced-motion: reduce` | Nothing moves. All text is shown at once, no video or WebGL loads, and no pause button is needed. |
| Pause button (`[data-motion-toggle]`) | Stops loops, the curved line and the grain field everywhere, and is remembered on the device (`gc.motionPaused.v1`). Meets WCAG 2.2.2. |
| Save-Data or 2G | No video or WebGL is downloaded or started; still images stay. |
| Single-file build | No video or WebGL (they cannot be inlined). |
| Off-screen | Loops pause, and the grain field and curved line stop drawing. |

Tokens: `--ease`, `--ease-out`, `--t-fast`, `--t-med`, `--t-slow`, `--t-reveal`, `--stagger`. The scroll-reveal resting colour `--sr-dim` (#8f7e72) is 3.5:1 on the page background, which is AA for large text.

## Assets

Browsers download one format per loop (WebM where supported, otherwise MP4).

| File | What | WebM | MP4 |
|---|---|---|---|
| `assets/img/loops/hero_wide.*` | Hero loop, desktop (1280×720, 10 s) | 164 KB | 591 KB |
| `assets/img/loops/hero_portrait.*` | Hero loop, mobile (576×720, 10 s) | 146 KB | 336 KB |
| `assets/img/loops/family_body.*` | Body panel and collection hero (576×720) | 65 KB | 162 KB |
| `assets/img/loops/family_face.*` | Face panel and collection hero | 51 KB | 142 KB |
| `assets/img/loops/family_lip.*` | Lip panel and collection hero | 48 KB | 157 KB |
| `assets/img/intro_still-*` | Brand intro composition (AVIF/WebP/JPEG, 480–1280 px) | | |
| `assets/img/trio_still-*` | Early-access composition (AVIF/WebP/JPEG, 480–1280 px) | | |

The loop seam was measured frame by frame: the jump from the last frame to the first is no bigger than an ordinary frame step (hero: 0.93 against a 1.04 maximum).

Loops sit under `assets/img/`, so the existing cache headers in `vercel.json` apply without any configuration change. To re-render, see the README's **Images → Loops** section.

## Fixed after review

- **The hero video covered the headline on desktop.** Once the loop faded in, it was painted above the headline, text and buttons, so the left side of the hero looked blank. Loop frames now isolate their own layering (`.loop { isolation: isolate }`). A new test makes the video hit-testable for a moment and checks what is really on top; it fails on the old layering and passes on the new.
- **The hero motion was too faint to notice.** The hero loops were re-rendered with about twice the sway (`tools/render/loops.py`: amplitude 0.05, rotation 2.2°) and a ±12% swell in sunlight. The category panels keep their quieter drift.

## Testing

Every suite was run on 14 Nov 2026 against the output of the Vercel build command (`node tools/build_public.mjs` → `public/`, served locally), except `motion.mjs`, which uses the fixture page from the project root. No real payment and no real email: the Razorpay gateway and the Brevo endpoint are mocked or absent.

| Suite | Result |
|---|---|
| `qa/interactions.mjs` | **80/80**. All the earlier journeys, plus: hero loop plays and pauses and never covers the headline, blur-in headline, living panels widen, brand statement brightens, stacked moments with the index following, range filter, viewer (open at the current image, keys, zoom, drag, Escape and focus return, axe on the open viewer), At a glance, search palette (Ctrl+K, nothing pre-selected, arrows, Enter, axe on the open palette), mobile menu stagger, sticky bar never covers the notify panel (full-page scan), touch tap and double-tap zoom, reduced motion (no video or WebGL, all text visible), Save-Data (nothing heavy downloaded), axe WCAG A/AA on six templates |
| `qa/motion.mjs` | **49/49**. Each effect alone, with and without reduced motion |
| `qa/functions.test.mjs` | **14/14** (Razorpay order and verification, Brevo subscribe and contact) |
| `qa/checkout.mjs` | **12/12** (Razorpay flow end to end, gateway mocked) |
| `qa/smoke.mjs` | **0 issues**: 20 pages × 1440 / 820 / 390 px, with no console errors, failed requests, broken images or overflow |
| `qa/brand-audit.mjs` | **Clean** |
| `qa/single-file.mjs` | **27/27** |

**Performance**, measured on the same machine as production `main` (local server, unthrottled; bytes up to network idle):

| Page | Production `main` | This branch | Loops (after load) |
|---|---|---|---|
| Home, mobile | 397 KB · LCP 140 ms · CLS 0.000 | 427 KB · LCP 188 ms · CLS 0.001 | 146 KB |
| Home, desktop | 448 KB · LCP 168 ms · CLS 0.000 | 477 KB · LCP 248 ms · CLS 0.001 | 164 KB |
| Product, mobile | 366 KB · LCP 124 ms · CLS 0.000 | 414 KB · LCP 132 ms · CLS 0.000 | — |
| Product, desktop | 426 KB · LCP 232 ms · CLS 0.000 | 475 KB · LCP 204 ms · CLS 0.000 | — |
| Face collection, mobile | 294 KB · LCP 120 ms · CLS 0.000 | 338 KB · LCP 124 ms · CLS 0.000 | 51 KB |
| Face collection, desktop | 322 KB · LCP 160 ms · CLS 0.000 | 367 KB · LCP 148 ms · CLS 0.000 | 51 KB |

The loops download only after the page's load event, when the browser is idle. The home CLS of 0.001 is a 2–4 px move of the hero text when the web font arrives; the "good" threshold is 0.1.

## Known limitations

- **Loop sharpness.** The panel and mobile hero loops are 576×720, so on large or high-density screens they are a little softer than the still images beneath them. The labels stay legible. Higher-resolution loops are possible, but they cost about 4× the render time.
- **Lip Balm label.** On the trio still, the lip balm's label wraps around a very narrow stick, so only part of the wordmark faces the camera. This is the same as in the existing lineup image.
- **`qa/states.mjs` was already broken.** It still targets selectors from the site's first version (`[data-mega="0"]`, `#featured`, `.pcard`) and fails on production `main` too. It is not part of the test table above.
- **The header scrolls away.** `.site-header` is `position: sticky`, but its wrapper `#site-header` is only as tall as the header itself, so it never sticks. Production behaves the same way. This was left as is so that current behaviour is preserved.
- **No live Vercel preview was tested from here.** The build command was run and its output tested locally.

## What did not change

- Framework and architecture: plain HTML, CSS and ES modules, configured from `site.config.js`.
- `vercel.json`, `tools/build_public.mjs`, `api/*`, `server/*`, environment variables and dependencies.
- Razorpay checkout, Brevo forms and every existing user journey. The shop-closed and shop-open flows are covered by the same tests as before.

## Credits and licences

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
- **React Bits:** concepts for several effects, used under MIT + Commons Clause, with the notice kept.
- **Unsloth Studio:** interaction ideas only, no AGPL code.
- **MotionSites:** the free "Beauty Categories" composition.
