# Third-party notices

The website's code was written for Gentle Company. It installs no third-party
runtime libraries. Some interaction ideas came from the open-source projects
below. This file records where they came from and the licence terms that apply.

## React Bits

Several motion effects on this site are independent vanilla-JavaScript and CSS
versions of React Bits components:

| Effect on this site | React Bits component |
|---|---|
| Blur-in headings | BlurText |
| Word-by-word brightening of the brand statement | ScrollReveal |
| Glare sweep on product images | GlareHover |
| Card tilt and spotlight | TiltedCard, SpotlightCard |
| Magnetic primary buttons | Magnet |
| Frosted shelf edge | GradualBlur |
| Stacked moments and story chapters | ScrollStack |
| Curved text line | CurvedLoop |
| Warm grain field behind early access | Grainient and Silk (concept only) |

The code lives in `assets/js/lib/motion.js` and `assets/css/main.css`. It is
used only as part of this website. It is not sold, sublicensed or distributed
as components, alone or in a bundle.

Source: https://github.com/DavidHDev/react-bits (https://reactbits.dev)

```
MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

The same restriction covers the React Bits tools (Background Studio, Texture Lab, Shape Magic, Center Stage, Sound Lab and any tools added later) and the sounds in the sound library. **You may not sell, sublicense, or redistribute the tools or the sounds themselves, or offer the tools or a substantially similar copy of them as a hosted service-whether alone, in a bundle, or as a ported version.**

What you make with the tools is yours to use. You can use exported code, images, videos, and audio files in any personal or commercial application, website, or product, including paid ones. **You may not sell or redistribute the exports on their own, either individually or as the product itself, such as a sound, texture, background, or template pack.**

## No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Unsloth Studio (inspiration only, no code)

The keyboard model of the search palette and the gesture model of the
full-screen image viewer were inspired by Unsloth Studio's command palette and
media viewer. Unsloth Studio's interface is licensed under AGPL-3.0. **No
Unsloth code was copied, adapted or included.** The palette
(`assets/js/components/search.js`) and the viewer
(`assets/js/components/lightbox.js`) were written independently for this site.

Source: https://github.com/unslothai/unsloth

## MotionSites

The layout of the "Shop by category" living panels follows the composition of
the free MotionSites "Beauty Categories" design prompt: tall panels, looping
product video, vertical labels and hover widening. No MotionSites code or
media is included. The panel videos are rendered from our own Blender scenes
(`tools/render/loops.py`).

## Fonts

Marcellus, Cormorant Garamond and Instrument Sans are licensed under the SIL
Open Font License 1.1. They are self-hosted in `assets/fonts/`.
