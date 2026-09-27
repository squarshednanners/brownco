# Research: Terrace Contractor Marketing Site

**Feature**: 001-terrace-marketing-site | **Date**: 2026-09-25 (revised after the owner's
technical direction: Astro + Tailwind + `business.ts` + GitHub Pages)

There are no open NEEDS CLARIFICATION items. Each decision uses the format Decision / Rationale /
Alternatives considered.

---

## R1. Site generator

**Decision**: Astro (current stable), `output: 'static'`, no integrations that add client JS.
Components are `.astro` files with no hydration directives (`client:*` is not allowed; the build
check greps for it).

**Rationale**:
- The owner directed this choice.
- Astro renders to plain HTML, ships zero runtime JS by default, and imports TypeScript config
  directly into components and `<script type="application/ld+json">`.
- This satisfies Principle II (no client framework) and Principle VI (one source of facts).

**Alternatives considered**: Eleventy + YAML was the earlier draft and was replaced at the owner's
request. Hand-written HTML would duplicate facts.

## R2. Config file: `src/config/business.ts`

**Decision**:
- `business.ts` exports one plain object literal, `business`, written in simple
  `key: 'value',` form, with a comment above every field and `// TODO:` beside unconfirmed values.
- It is typed with `satisfies BusinessConfig`. The type lives in `derived.ts`, so the owner's file
  has no type syntax beyond one line.
- All computed values live in `src/config/derived.ts`, which the owner never edits:
  - phone → E.164 and `tel:` href
  - years-in-business label
  - service-area summary
  - county labels
- Services, copy, and photo entries also live in `business.ts`, so "change a service" and "change
  a photo" happen in the same file.

**Rationale**:
- The owner directed this choice.
- For a non-coder, the risk is syntax: quotes and commas. We handle it three ways:
  - one consistent quoting style
  - a README example for every common edit
  - `astro check` in CI, which reports the exact line on a typo so the deploy stops and the live
    site is untouched
- This keeps Principle VI intact.

**Alternatives considered**: YAML or JSON data files are friendlier for comments and commas, but
the owner chose `business.ts`. Splitting into `services.ts` and `photos.ts` would make it less
obvious which file to edit.

## R3. Palette as Tailwind theme tokens + contrast verification

**Decision**: In `src/styles/global.css`:

```css
@import "tailwindcss";
@theme {
  --color-soil:  #3B2A1A;  /* primary */
  --color-field: #3F6B3A;  /* secondary */
  --color-gold:  #D9A441;  /* CTA buttons ONLY */
  --color-cream: #F5F0E6;  /* background */
  --color-ink:   #1F1F1F;  /* text */
  --color-rust:  #B5541C;  /* hover / secondary accent */
  --font-display: "Barlow Condensed", "Arial Narrow", "Roboto Condensed", Arial, sans-serif;
  --font-body: "Barlow", system-ui, "Segoe UI", Roboto, Arial, sans-serif;
}
```

This yields utilities such as `bg-soil`, `text-ink`, and `bg-gold`. `bg-gold` is used only inside
`CallButton.astro`. The build check greps the components for `gold`, and any use outside
`CallButton.astro` fails the check.

Relative luminance: cream 0.874, charcoal 0.014, brown 0.027, green 0.119, gold 0.417, rust 0.162.

| Foreground on background | Ratio | Normal (4.5) | Large/UI (3.0) |
|--------------------------|-------|--------------|----------------|
| Ink on cream | 14.5 | ✅ | ✅ |
| Soil on cream / cream on soil | 12.1 | ✅ | ✅ |
| Field on cream / cream on field | 5.5 | ✅ | ✅ |
| White on field | 6.2 | ✅ | ✅ |
| Ink on gold (CTA) | 7.3 | ✅ | ✅ |
| Gold button vs soil header | 6.1 | — | ✅ |
| White on rust (CTA hover) | 4.9 | ✅ | ✅ |
| Rust on cream | 4.35 | ❌ | ✅ |
| Gold button edge vs cream | 2.0 | — | ❌ |

**Rules**:
- CTA text is ink on gold. On hover and focus it becomes white on rust.
- Rust is never used for small text on cream.
- Gold buttons on cream get a 2 px `soil` border.
- Hero text sits on a soil overlay at ≥ 80% opacity.
- Focus rings are soil on light backgrounds and **cream** on dark backgrounds (12.1:1 on soil,
  5.5:1 on field). They are never gold, because spec FR-004 reserves gold for call buttons only.

## R4. Typography

**Decision**:
- Headlines: Barlow Condensed 800. Body: Barlow 400/600.
- Self-hosted via `@fontsource`, latin subset only, WOFF2.
- The display font is preloaded. `font-display: swap`.
- Metric-adjusted local fallbacks to minimize CLS.

**Rationale**: Barlow's shapes come from highway and industrial signage, which matches "industrial
signage feel". The condensed width fits a three-line H1 at 320 px. It is OFL-licensed, so it can be
outlined in the logo. Self-hosting avoids a third-party round trip on rural networks.

**Alternatives considered**: Oswald (more generic), Bebas Neue (caps only, one weight), Google
Fonts CDN (extra connection).

## R5. Mobile nav toggle (the one allowed script)

**Decision**:
- **Markup**: The header holds the logo, a menu control, and the call button. Below 768 px, the
  menu control is initially rendered as `<a href="#site-nav-footer" class="menu-link">Menu</a>`, a
  plain link to the full nav list in the footer.
- **Inline script** (in `Base.astro`, `is:inline`, ≤ 1 KB, no dependencies):
  1. Replaces the link's behavior with a `<button aria-expanded="false" aria-controls="site-nav">`.
  2. Toggles a `data-open` attribute on the header nav.
  3. Closes the menu on link tap and on Escape.
- **Desktop (≥ 768 px)**: Links are inline and the script is irrelevant.
- **Sticky header**: Anchors use `scroll-margin-top` equal to the header height.
- **Smooth scrolling**: Enabled only under `prefers-reduced-motion: no-preference`.

**Rationale**:
- The owner requested a tiny toggle.
- Progressive enhancement keeps the page fully usable with JS off (constitution Principle II).
- The collapsed nav keeps the sticky header to one row, protecting the above-the-fold space at
  320×568.

**Alternatives considered**: `details/summary` (the earlier draft) works without JS, but the owner
chose a button toggle. A JS-only hamburger was rejected because it breaks without JS.

## R6. Logo (hand-authored SVG)

**Decision**: Three files in `public/logo/`, hand-authored. There are no raster images and no
`<text>` elements; lettering is outlined paths. Each file has a `<title>`.

- **Contour mark**: 4 parallel, gently curving strokes that read as terraces following a hillside.
  They sit inside a rounded square for `brown-co-icon.svg`. Colors are soil, with one field-green
  stroke. A simplified 3-stroke variant is used for 16/32 px favicons.
- **Wordmark**: "BROWN CO" in heavy condensed letterforms, based on Barlow Condensed Black and
  outlined, with "SERVICES" letter-spaced beneath.
- **Dozers**: Original, generic silhouettes with a track frame, idlers, hood, ROPS canopy, and a
  straight blade on push arms. They are mirrored so the blades face outward. They are soil or ink
  only; no yellow-and-black livery, no manufacturer marks, no model numbers.
- **Full logo**: Dozer, wordmark, dozer, with the contour lines as a hillside base beneath.
- **Header use**: The full logo at ≥ 400 px. Below that, the icon plus the short name. The call
  button always has priority for space.

**Rationale**: The owner directed hand-authored SVG. Outlined lettering renders identically in
browsers and in `sharp` (for the favicon and OG image). This satisfies Principle V.

## R7. Favicon set from the icon SVG

**Decision**: `scripts/prebuild.mjs` (run by the `predev` and `prebuild` npm hooks) uses `sharp` on
`public/logo/brown-co-icon.svg` to write these into `public/` (git-ignored):
- `favicon.svg` (simplified mark)
- `favicon.ico` (32 px, via `png-to-ico`)
- `apple-touch-icon.png` (180)
- `icon-192.png`, `icon-512.png`
- `site.webmanifest`
- `og-image.png` (1200×630: the full logo on cream)

**Rationale**: This meets the "favicon set generated from the icon" criterion, and the set is
always in sync.

## R8. Photos: `/public/images/placeholder-*.jpg` → `<picture>` with WebP

**Decision**:
- **Placeholders**: `placeholder-hero.jpg` and `placeholder-about.jpg`, rendered once from original
  SVG illustrations (kept in `scripts/placeholders/`) and committed. Each reference in
  `business.ts` and in the component carries a `TODO` comment.
- **Prebuild step**: For every `.jpg`/`.jpeg`/`.png` in `public/images/`, `prebuild.mjs` writes
  WebP variants at 480, 960, and 1600 px (never upscaled) to `public/images/_generated/`. It also
  records the intrinsic width and height in `src/generated/images.json`.
- **`Photo.astro`** renders:

  ```html
  <picture>
    <source type="image/webp" srcset="…480.webp 480w, …960.webp 960w, …1600.webp 1600w" sizes="…">
    <img src="/images/placeholder-hero.jpg" width="…" height="…" alt="…"
         loading="lazy" decoding="async">
  </picture>
  ```

  - `loading="lazy"` is the default.
  - The hero passes `eager` and gets `loading="eager"` and `fetchpriority="high"`.
- **Photo swap**: The owner drops `hero.jpg` into `public/images/` and changes one line in
  `business.ts`. WebP variants regenerate automatically on the next build.
- **Paths**: All asset paths go through `import.meta.env.BASE_URL` so they work under a GitHub
  Pages project subpath.

**Rationale**:
- The owner directed the location and format.
- Astro does not optimize `public/` files, so a small prebuild step fills that gap without moving
  the photos.
- The constitution requires that the hero not be lazy, so it is the one explicit exception.

**Alternatives considered**: Astro `<Picture>` from `src/assets/` would contradict the requested
path. Committing WebP files by hand gets out of sync after a photo swap.

## R9. CSS delivery

**Decision**:
- Tailwind v4 via `@tailwindcss/vite`. Only used classes are emitted.
- Astro's `build.inlineStylesheets: 'always'` inlines the resulting CSS (target ≤ 15 KB), so there
  is no render-blocking stylesheet request.

**Rationale**: For a single page visited once, inlining is the biggest Lighthouse win.

## R10. Structured data

**Decision**:
- `JsonLd.astro` builds a `GeneralContractor` object (a LocalBusiness subtype) entirely from
  `business.ts` and `derived.ts`, then serializes it with `JSON.stringify` into
  `<script type="application/ld+json" is:inline set:html={…}>`.
- `areaServed` includes a `GeoCircle` of 100 miles (160934 m) around Henderson, IA, plus the eight
  counties as `AdministrativeArea`.
- The mapping is in contracts/structured-data.md.

**Rationale**: This is the most specific accurate type. Importing from the config keeps a single
source for the phone number and the name (owner direction, Principle VII).

## R11. Language safeguards

**Decision**: There are two layers.

1. **CI grep (owner-specified, authoritative)**:
   `grep -rniwEI 'retire|retirement|age|succession' dist/`. The job fails if anything is found.
   - `-w` means whole-word matching, so "drainage", "acreage", "page", and "Page County" pass.
   - `-I` skips binary files. Without it, grep also scans WebP, PNG, ICO, and WOFF2 bytes. With
     1–2 MB of binaries, a chance byte sequence like `age` between two non-letter bytes is likely,
     and it would fail CI for no real reason.
   - `npm run grep:banned` (Node, for Windows as well) scans text files and file names for the same
     four words **plus** the transition phrases. That covers hard-coded component text too.
   - Both checks import one list, `scripts/banned-words.mjs`, and `derived.ts` uses it as well, so
     the lists can't drift apart.
2. **Config check (extra, cheap)**: `derived.ts` runs a whole-word scan over every string in
   `business` at build time. It covers the four words plus retired, retiring, successor, stepping
   down, hand over, take over, and passing the torch. On a match it throws a plain message such as
   `business.ts: "…" uses the word "successor", please reword`.

   The optional third-generation fields are named `crewFamilyMember*` so that no key uses
   transition language.

**Rationale**: The grep enforces the acceptance criterion exactly as written. The config check
catches wider transition language (constitution Principle IX) before it reaches `dist/`.

## R12. Tests (owner-specified scope)

**Decision**: CI runs exactly three checks, in `.github/workflows/deploy.yml` and locally via
`npm test`. Deploy only happens if all three pass.

1. **Build check**: `astro check`, then `astro build`, then `node scripts/check-build.mjs`. The
   script asserts:
   - ≥ 4 `tel:` links, all with the same href, matching the JSON-LD `telephone`
   - exactly one `<h1>`
   - "terrace" in the H1/subhead and in `#terraces`
   - every `<img>` has `alt`
   - no `<form>` and no `client:` hydration output
   - title, description, and `og:*` tags present
   - the JSON-LD parses
   - `dist/logo/` contains the 3 SVGs
   - the favicon set is present
2. **HTML validation**: `npx html-validate "dist/**/*.html"` with `html-validate:recommended`.
   Rules that conflict with Astro output, if any, are documented in `.htmlvalidate.json`.
3. **Banned-word grep**: as in R11.

Lighthouse ≥ 95, viewport visibility at 320/360/375/768/1440 (375 is required by constitution gate 2), the schema validator, contrast
spot-checks, and copy review are **manual gates**. Under constitution v1.1.0 they are required for
layout and feature changes, and recorded in the pull request before merging to `main`. The owner's
content-only edits are gated by the three automated checks alone. The manual gates can be
automated later with Lighthouse CI and Playwright if desired.

**Scripts read the config by import, not regex**: `prebuild.mjs` and `check-build.mjs` run under
`tsx` and `import { business } from '../src/config/business.ts'`. This works because
`business.ts` only has an `import type` line, which is erased at runtime.

`derived.ts` guards `import.meta.env?.BASE_URL ?? '/'` so it can be imported outside Astro.

**Rationale**: This is the owner's requested scope. The constitution's gates are still verified,
partly by hand, and recorded before launch.

## R13. Deployment

**Decision**:
- **Default: GitHub Pages via Actions** (`.github/workflows/deploy.yml`). The workflow runs on push
  to `main` and on manual dispatch:
  1. checkout
  2. setup-node 22 with npm cache
  3. `npm ci`
  4. build check
  5. html-validate
  6. banned-word grep
  7. `actions/upload-pages-artifact` (dist)
  8. `actions/deploy-pages`

  Permissions are `contents: read`, `pull-requests: read`, `pages: write`, and `id-token: write`.

  Concurrency is set per job. Build uses `build-${{ github.ref }}` with cancel-in-progress. Deploy
  uses `pages-deploy` **without** cancel-in-progress, so a PR check can never cancel a deploy that
  is running. `configure-pages` runs only on `main` and manual runs, so PR checks work before Pages
  is enabled and from forks.
- **Triggers**: The same workflow runs on `pull_request` with the three checks only, and never
  deploys from a PR. Deploy jobs run only on `main`. This matches the constitution v1.1.0 two-tier
  rule: layout and feature work is merged through PRs after the manual gates are recorded.
- **Tier guard**: On a push to `main`, a CI step diffs the **whole push**
  (`github.event.before..github.sha`, not just the last commit). It fails the run if any changed
  file is outside `src/config/business.ts` and `public/images/**` and the pushed commit is not
  associated with a merged PR.
  - The PR association comes from the GitHub API (`commits/{sha}/pulls`), which recognizes merge,
    squash, and rebase merges alike. A parent-count check would wrongly block squash and rebase
    merges.
  - Branch creation (`before` = all zeros) is skipped. A diff failure (for example after a
    force-push) fails closed.
  - This makes the two-tier rule enforced, not just a matter of team discipline. Branch protection
    is documented as an optional stricter setup.
- **Site URL and base path**: `astro.config.mjs` sets `site` from `business.websiteUrl`, the single
  source. The `SITE_URL` env var overrides it only while the site lives on a `*.github.io` address
  with no custom domain yet. `BASE_PATH` comes from `actions/configure-pages`, and with a custom
  domain it is `/`.
  - The canonical, `og:url`, JSON-LD `url`, the sitemap, and `robots.txt` (generated by
    `src/pages/robots.txt.ts`) all derive from Astro's `site`, so they can't disagree.
- **Netlify**: `npm run deploy:netlify` runs a guard, then
  `npm run build && npx netlify-cli deploy --prod --dir=dist`. The first run prompts to log in and
  link a site. `netlify.toml` also supports Git-connected auto-deploys.
- **Cloudflare Pages**: `npm run deploy:cloudflare` runs a guard, then
  `npm run build && npx wrangler pages deploy dist --project-name=brown-co-services`. The first run
  prompts to log in.
- **Guard for both**: `scripts/require-site-url.mjs` refuses to deploy while `websiteUrl` is still
  `example.com`. These hosts get no `SITE_URL` from CI, so a placeholder would make the canonical
  tag and search listing point to the wrong site.

**Rationale**: GitHub Pages is the owner's default, and the other two hosts are one command each as
requested. The output is plain static files, so there is no runtime step.

## R14. Placeholder values and TODOs

**Confirmed values**:
- Name: Brown Co Services
- Town: Henderson, IA
- Service area: within 100 miles of Henderson
- Counties: Mills, Pottawattamie, Montgomery, Fremont, Page, Cass, Harrison, Taylor
- Founded: about 1970. It shows as "since 1970" with a TODO to confirm the exact year.

**Placeholders** (each has a `// TODO:` in `business.ts`):
- Phone `(712) 555-0100` (fictional 555-01xx range)
- Street address `123 Main St`
- ZIP `51541` (confirm)
- Hours
- Owner and founder names, and the owner's pronoun
- The owner's personal years
- `websiteUrl`
- The Henderson coordinates (approximate)

**Claim flags** (default `false`): licensed and insured, NRCS specifications and EQIP, GPS layout,
we farm here. When a flag is false, the component emits `<!-- TODO: confirm with owner … -->`, and
it hides the claim where the brief allows (the "Licensed & insured" line and "We farm here").

**"50+ years"**: Derived from 1970, rounded down to the nearest 10.

**Hero subhead**: The brief's "…serving [SERVICE AREA]" becomes "Two generations of terrace
builders, working within 100 miles of Henderson, Iowa." The service-area trust fact is
"Working within 100 miles of Henderson, Iowa" (43 characters). Trust-fact length is checked after
tokens are filled, with a limit of 48 characters.

The README has a "Before launch" checklist listing every TODO. `npm run todo` greps for them.
