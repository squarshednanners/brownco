// Post-build assertions on dist/ — part of the CI "build check" (run via tsx after astro build).
// Each assertion prints ✓ or ✗; any failure exits 1.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'node-html-parser';
import { business } from '../src/config/business.ts';
import { phoneDisplay, phoneE164 } from '../src/config/derived.ts';

const DIST = 'dist';
const htmlPath = join(DIST, 'index.html');
let failures = 0;

function assert(name, fn) {
  try {
    const detail = fn();
    if (detail === true || detail === undefined) console.log(`✓ ${name}`);
    else throw new Error(String(detail));
  } catch (err) {
    failures++;
    console.log(`✗ ${name}: ${err.message}`);
  }
}

if (!existsSync(htmlPath)) {
  console.log(`✗ dist/index.html exists: run astro build first`);
  process.exit(1);
}
const raw = readFileSync(htmlPath, 'utf8');
const doc = parse(raw, { comment: true });
const $ = (sel) => doc.querySelectorAll(sel);
// Normalize non-breaking hyphens/spaces (used in phone numbers) before comparing text.
const text = (el) => el.textContent.replace(/‑/g, '-').replace(/\s+/g, ' ').trim();

// ---------- Base (static site, JS budget, gold only on CTAs) ----------
assert('dist/index.html exists', () => true);
assert('no forms, inputs, iframes, or hydration islands', () => {
  const bad = ['<form', '<input', '<textarea', '<iframe', 'astro-island'].filter((t) => raw.includes(t));
  return bad.length === 0 || `found ${bad.join(', ')}`;
});
assert('no external <script src>', () => $('script[src]').length === 0 || 'external script found');
assert('exactly one inline executable <script>, ≤ 1024 bytes', () => {
  const scripts = $('script').filter((s) => s.getAttribute('type') !== 'application/ld+json');
  if (scripts.length !== 1) return `found ${scripts.length}`;
  const size = Buffer.byteLength(scripts[0].innerHTML);
  return size <= 1024 || `nav script is ${size} bytes`;
});
assert('every <img> has alt, width, and height', () => {
  const bad = $('img').filter((i) => !i.hasAttribute('alt') || !i.getAttribute('width') || !i.getAttribute('height'));
  return bad.length === 0 || `missing on: ${bad.map((i) => i.getAttribute('src')).join(', ')}`;
});
assert('gold used only in CallButton.astro (and its token)', () => {
  const offenders = readdirSync('src/components')
    .filter((f) => f.endsWith('.astro') && f !== 'CallButton.astro')
    .filter((f) => /gold/.test(readFileSync(join('src/components', f), 'utf8')));
  const css = readFileSync('src/styles/global.css', 'utf8')
    .split('\n')
    .filter((l) => /gold/i.test(l) && !/--color-gold:/.test(l) && !/call buttons ONLY/.test(l));
  if (css.length) offenders.push(`global.css: ${css.join(' | ').trim()}`);
  return offenders.length === 0 || offenders.join(', ');
});

// ---------- US1: see terraces and call ----------
const tels = $('a[href^="tel:"]');
assert('exactly one <h1>', () => $('h1').length === 1 || `found ${$('h1').length}`);
assert('"terrace" in the H1 or hero subhead', () =>
  /terrace/i.test(text($('h1')[0] ?? doc) + ' ' + text($('.subhead')[0] ?? doc)) || 'not found');
assert('all tel: links identical and equal to the configured number', () => {
  const hrefs = [...new Set(tels.map((a) => a.getAttribute('href')))];
  return (hrefs.length === 1 && hrefs[0] === `tel:${phoneE164}`) || `hrefs: ${hrefs.join(', ')}`;
});
assert('every tel: link shows the display number', () => {
  const bad = tels.filter((a) => !text(a).includes(phoneDisplay));
  return bad.length === 0 || `${bad.length} link(s) without "${phoneDisplay}"`;
});
assert('hero image is eager with fetchpriority=high', () => {
  const img = doc.querySelector('#hero img');
  if (!img) return 'no hero img';
  return (img.getAttribute('fetchpriority') === 'high' && img.getAttribute('loading') !== 'lazy') || 'hero is lazy';
});
assert('header has nav#site-nav', () => !!doc.querySelector('header nav#site-nav') || 'missing');

// ---------- US2: featured terraces ----------
const terr = doc.querySelector('section#terraces');
assert('section#terraces exists with a "terrace" h2', () =>
  (!!terr && /terrace/i.test(text(terr.querySelector('h2') ?? terr))) || 'missing');
assert('#terraces has 3 situation h3s and ≥ 5 offerings', () => {
  if (!terr) return 'missing';
  const h3 = terr.querySelectorAll('.situation h3').length;
  const li = terr.querySelectorAll('.offerings li').length;
  return (h3 === 3 && li >= 5) || `situations=${h3}, offerings=${li}`;
});
assert('#terraces contains a call button', () => (terr?.querySelectorAll('a[href^="tel:"]').length ?? 0) >= 1 || 'none');

// ---------- US3: trust, about, service area, footer ----------
assert('#trust has 3–5 facts including "since 1970"', () => {
  const li = $('#trust li');
  return (li.length >= 3 && li.length <= 5 && li.some((l) => /since \d{4}/.test(text(l)))) || `found ${li.length}`;
});
assert('#about exists with an h2', () => !!doc.querySelector('#about h2') || 'missing');
assert('#service-area lists every county', () => {
  const li = $('#service-area li').map(text);
  const missing = business.serviceArea.counties.filter((c) => !li.some((l) => l.startsWith(c)));
  return missing.length === 0 || `missing: ${missing.join(', ')}`;
});
assert('footer has address, tel link, and footer nav', () =>
  (!!doc.querySelector('footer address') && !!doc.querySelector('footer a[href^="tel:"]') && !!doc.querySelector('nav#site-nav-footer')) ||
  'missing part');
assert('at least 4 tel: links (acceptance criterion)', () => tels.length >= 4 || `found ${tels.length}`);
assert('copyright names the business', () => text(doc.querySelector('footer') ?? doc).includes(`© `) && text(doc.querySelector('footer')).includes(business.name) || 'missing');

// ---------- US4: we also do ----------
assert('#services has one item per configured service, each with icon + h3', () => {
  const li = $('#services li');
  if (li.length !== business.services.length) return `found ${li.length}, expected ${business.services.length}`;
  const bad = li.filter((l) => !l.querySelector('svg[aria-hidden="true"]') || !l.querySelector('h3'));
  return bad.length === 0 || `${bad.length} item(s) missing icon or h3`;
});
assert('#terraces comes before #services', () => raw.indexOf('id="terraces"') < raw.indexOf('id="services"') || 'wrong order');

// ---------- US5: how we work ----------
assert('#how-we-work has exactly 4 steps', () => $('#how-we-work ol > li').length === 4 || `found ${$('#how-we-work ol > li').length}`);

// ---------- US6: single source + images ----------
const ld = $('script[type="application/ld+json"]');
let ldData = null;
assert('JSON-LD parses as GeneralContractor', () => {
  if (ld.length !== 1) return `found ${ld.length} JSON-LD blocks`;
  ldData = JSON.parse(ld[0].innerHTML);
  return ldData['@type'] === 'GeneralContractor' || `type ${ldData['@type']}`;
});
assert('JSON-LD telephone matches tel: links', () => ldData?.telephone === phoneE164 || `got ${ldData?.telephone}`);
assert('JSON-LD areaServed includes a 100-mile GeoCircle', () =>
  (ldData?.areaServed ?? []).some((a) => a['@type'] === 'GeoCircle' && Number(a.geoRadius) === 160934) || 'missing');
assert('WebP variants exist for each photo', () => {
  const gen = readdirSync(join(DIST, 'images', '_generated'));
  const missing = Object.values(business.photos).filter((p) => !gen.some((g) => g.startsWith(p.file.replace(/\.\w+$/, '-'))));
  return missing.length === 0 || `missing for ${missing.map((p) => p.file).join(', ')}`;
});
assert('every <picture> has a WebP source', () => {
  const bad = $('picture').filter((p) => !p.querySelector('source[type="image/webp"][srcset]'));
  return bad.length === 0 || `${bad.length} picture(s) without WebP`;
});
assert('below-the-fold images are lazy', () => {
  const bad = $('img').filter((i) => !i.closest('#hero') && !i.closest('header') && i.getAttribute('loading') !== 'lazy');
  return bad.length === 0 || `not lazy: ${bad.map((i) => i.getAttribute('src')).join(', ')}`;
});

// ---------- SEO + brand assets ----------
assert('title, description, canonical, and Open Graph present', () => {
  const need = ['title', 'meta[name="description"]', 'link[rel="canonical"]', ...['og:title', 'og:description', 'og:image', 'og:url', 'og:type'].map((p) => `meta[property="${p}"]`)];
  const missing = need.filter((s) => {
    const el = doc.querySelector(s);
    return !el || !(el.getAttribute('content') ?? el.getAttribute('href') ?? el.textContent).trim();
  });
  return missing.length === 0 || `missing: ${missing.join(', ')}`;
});
assert('logo files in dist/logo/', () => {
  const need = ['brown-co-logo.png', 'brown-co-wordmark.png', 'brown-co-compact.png', 'brown-co-icon.png'];
  const missing = need.filter((f) => !existsSync(join(DIST, 'logo', f)));
  return missing.length === 0 || `missing ${missing.join(', ')}`;
});
assert('favicon set, manifest, og-image, and sitemap present', () => {
  const need = ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'site.webmanifest', 'og-image.png', 'sitemap-index.xml', 'robots.txt'];
  const missing = need.filter((f) => !existsSync(join(DIST, f)));
  return missing.length === 0 || `missing ${missing.join(', ')}`;
});

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll build checks passed.');
process.exit(failures ? 1 : 0);
