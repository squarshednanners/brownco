# Contract: Page structure (DOM)

The built `dist/index.html` MUST satisfy this contract. `scripts/check-build.mjs` asserts the
countable items in CI. The viewport guarantees are verified manually before launch (quickstart.md). Section IDs are stable anchor targets. Changing an ID is a breaking
change because external links and the nav depend on it.

## Document

- `<html lang="en">`, `<meta charset="utf-8">`,
  `<meta name="viewport" content="width=device-width, initial-scale=1">`
- `<head>` contains, in order:
  1. title
  2. meta description
  3. canonical
  4. theme-color
  5. preload for the headline font
  6. inline `<style>`
  7. Open Graph/Twitter meta
  8. icons/manifest
  9. JSON-LD
  10. the analytics placeholder comment
- Every `<img>` has `alt`, `width`, and `height` attributes, including the SVG logo images in the
  header and footer (constitution Principle II, gate 5).
- No `<form>`, `<input>`, `<textarea>`, `<iframe>`, external `<script src>`, or Astro hydration
  output (`astro-island`). Exactly one inline `<script>` of 1 KB or less: the nav toggle.

## Landmarks and sections (in order)

| # | Element | `id` | Required content |
|---|---------|------|------------------|
| 0 | `<a class="skip-link" href="#main">` | — | First focusable element |
| 1 | `<header>` (sticky) | `top` | Logo link to `#top` (with `alt`/`<title>` = business name). `<nav id="site-nav" aria-label="Main">` with links to `#terraces`, `#services`, `#how-we-work`, `#about`, `#service-area`. Below 768 px there is a menu control: without JS it is `<a href="#site-nav-footer">Menu</a>`, and the inline script turns it into `<button aria-expanded aria-controls="site-nav">`. **Call button** (CTA-1) |
| — | `<main>` | `main` | Wraps sections 2–8 |
| 2 | `<section>` hero | `hero` | Hero `<picture>`/`<img>` (eager, `fetchpriority="high"`). **The page's only `<h1>`** = `hero.headline`. `<p class="subhead">` = `hero.subhead`. **Call button** (CTA-2) |
| 3 | `<section>` trust strip | `trust` | `<ul>` of 3–5 `<li>` facts. Heading is visually hidden (`<h2 class="visually-hidden">`) |
| 4 | `<section>` featured terraces | `terraces` | `<h2>` containing "terrace". 3 situation blocks (`<h3>`). An offerings `<ul>` with ≥ 5 items. **Call button** (CTA-3) |
| 5 | `<section>` we also do | `services` | `<h2>`. `<ul>` grid of service items. Each has an inline SVG icon (`aria-hidden="true"`), `<h3>` name, and `<p>` sentence |
| 6 | `<section>` how we work | `how-we-work` | `<h2>`. `<ol>` with exactly 4 `<li>` steps |
| 7 | `<section>` about | `about` | `<h2>`. Photo `<img loading="lazy">` with `alt`. First-person-plural paragraphs |
| 8 | `<section>` service area | `service-area` | `<h2>`. Radius summary sentence. `<ul>` of counties (and towns if any). **Call button** (CTA-4, optional but recommended) |
| 9 | `<footer>` | `contact` | Logo. `<nav id="site-nav-footer" aria-label="Footer">` with the same section links (no-JS menu target). **Phone `tel:` link** (CTA-5). `<address>` with street/city/state/zip. "Licensed & insured" when confirmed. © year + business name |

## Call button contract (every CTA)

```html
<a class="call-btn" href="tel:+17125550100">
  <svg aria-hidden="true" focusable="false">…phone icon…</svg>
  <span>Call (712) 555-0100</span>
</a>
```

- The `href` is always `tel:` plus the E.164 number derived from `contact.phone`.
- The visible text always includes the full display number. Icon-only buttons are not allowed.
- Minimum size is 44×44 CSS px.
- The CTA is the only element styled with gold `#D9A441`. Hover and focus change it to rust
  `#B5541C` with white text.
- The page has at least 4 `tel:` links (header, hero, terraces, footer). All must have an identical
  `href`.

## Responsive/visibility guarantees

| Viewport | Guarantee |
|----------|-----------|
| 320×568, 360×640, 375×667, 768×1024, 1440×900 | The header call button's bounding box is fully inside the viewport at load and after scrolling to every section |
| Same | The H1, `.subhead`, and hero call button are fully inside the first viewport (y + height ≤ viewport height) |
| Same | `document.documentElement.scrollWidth ≤ clientWidth` (no horizontal scroll) |
| < 400 px | Header shows the square icon plus the short name. The call button text may shorten to the number alone ("(712) 555-0100"), still with the phone icon |
| < 1024 px | Nav collapses behind the menu control (JS toggle; without JS it links to the footer nav). Terraces and About stack to one column below 768 px |
| ≥ 1024 px (nav), ≥ 768 px (columns) | Nav is inline from 1024 px (logo + 5 links + call button need that width). Terraces and About use two columns from 768 px. The terraces section is the tallest service section |

## Headings

Exactly one `<h1>`. Every section has one `<h2>`, visually hidden in the trust strip. `<h3>` is used
only inside sections. No heading levels are skipped.

## Language rule

CI runs `grep -rniwEI 'retire|retirement|age|succession' dist/` and it must find nothing. The `-I`
flag skips binary files (images, fonts), so random byte sequences can't cause false failures. That
covers every text file in `dist/`: HTML, attributes, comments, SVG `<title>`, the manifest, and
CSS. `npm run grep:banned` also scans the wider transition-phrase list and file names.
