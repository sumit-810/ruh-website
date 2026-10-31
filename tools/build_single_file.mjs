/**
 * Build ONE self-contained HTML file (dist/gentle-company.html) that opens by
 * double-click, without a server: CSS, fonts, all JavaScript and images are
 * inlined, and every page is reachable through hash routes
 * (#/product.html?p=body-mist-no-01 …).
 *
 *   node tools/build_single_file.mjs
 *
 * Needs Node 18+ and network access to npm the first time (runs esbuild via npx).
 * The multi-file site stays the source of truth; rebuild after editing it.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'dist');
const OUT = join(OUT_DIR, 'gentle-company.html');
const tmp = mkdtempSync(join(tmpdir(), 'single-'));

// 1. copy the sources that the bundle imports
cpSync(join(ROOT, 'assets/js'), join(tmp, 'assets/js'), { recursive: true });
cpSync(join(ROOT, 'content'), join(tmp, 'content'), { recursive: true });
cpSync(join(ROOT, 'site.config.js'), join(tmp, 'site.config.js'));

// 2. swap the image manifest for one embedded WebP per image
const manifestSrc = readFileSync(join(ROOT, 'assets/js/data/images.js'), 'utf8');
const manifest = JSON.parse(manifestSrc.slice(manifestSrc.indexOf('{'), manifestSrc.lastIndexOf('}') + 1));
const pickWidth = (key, widths) => {
  const target = key === 'hero_wide' ? 1600 : key.startsWith('up_') && !key.startsWith('up_group') ? 720 : 800;
  return widths.filter((w) => w <= target).pop() || widths[0];
};
const inline = {};
let imageBytes = 0;
for (const [key, m] of Object.entries(manifest)) {
  const w = pickWidth(key, m.widths);
  const buf = readFileSync(join(ROOT, `assets/img/${key}-${w}.webp`));
  imageBytes += buf.length;
  inline[key] = { w: m.w, h: m.h, widths: [w], alt: m.alt, src: `data:image/webp;base64,${buf.toString('base64')}` };
}
writeFileSync(join(tmp, 'assets/js/data/images.js'), `export const images = ${JSON.stringify(inline)};\n`);

// 3. bundle all modules (dynamic page imports included) into one classic script
const bundlePath = join(tmp, 'bundle.js');
execFileSync('npx', ['-y', 'esbuild@0.24.0', join(tmp, 'assets/js/app.js'), '--bundle', '--format=iife', '--minify', '--target=es2020', `--outfile=${bundlePath}`, '--log-level=warning'], { stdio: 'inherit' });
const js = readFileSync(bundlePath, 'utf8').replace(/<\/script/gi, '<\\/script');

// 4. inline fonts into the stylesheet
const css = readFileSync(join(ROOT, 'assets/css/main.css'), 'utf8').replace(/url\('\.\.\/fonts\/([^']+)'\)/g, (_, f) => {
  const p = join(ROOT, 'assets/fonts', f);
  return existsSync(p) ? `url(data:font/woff2;base64,${readFileSync(p).toString('base64')})` : `url('../fonts/${f}')`;
});

const favicon = `data:image/svg+xml;base64,${readFileSync(join(ROOT, 'assets/img/favicon.svg')).toString('base64')}`;

const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Gentle Company — Body and skin care, gently made</title>
<meta name="description" content="Gentle Company makes body and skin care for India, beginning with Body Mist Nº 01.">
<meta name="theme-color" content="#f6f1ea">
<link rel="icon" href="${favicon}">
<style>
${css}
</style>
</head>
<body data-page="home">
<a class="skip-link" href="#main">Skip to content</a>
<div id="site-header"></div>
<main id="main" tabindex="-1"></main>
<div id="site-footer"></div>
<noscript><p style="padding:24px;font-family:sans-serif">This site needs JavaScript enabled to display its content.</p></noscript>
<script>window.__SINGLE_FILE__ = true;</script>
<script>
${js}
</script>
</body>
</html>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html);
rmSync(tmp, { recursive: true, force: true });
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;
console.log(`wrote ${OUT}\n  total ${kb(Buffer.byteLength(html))} · images ${kb(imageBytes)} (before base64) · js ${kb(js.length)} · css+fonts ${kb(css.length)}`);
