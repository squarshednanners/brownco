# Implementation Plan: Terrace Contractor Marketing Site

**Branch**: `001-terrace-marketing-site` | **Date**: 2026-09-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-terrace-marketing-site/spec.md`, plus the
owner's technical direction given in `/speckit-plan`:
- Astro with zero client-side JavaScript, except a tiny nav toggle
- Tailwind with the palette as theme tokens
- All company details in `src/config/business.ts`
- Hand-authored SVG logos
- `/public/images/placeholder-*.jpg` rendered through `<picture>` with WebP
- Favicons generated from the icon SVG
- A README
- GitHub Pages as the default deploy
- CI with three checks: build check, HTML validation, and a banned-word grep

## Summary

We are building a single-page static marketing site for Brown Co Services, a two-generation terrace
contractor in Henderson, Iowa, serving everything within 100 miles.

- **Build**: Astro renders the page to plain HTML at build time. The only client JavaScript is an
  inline nav-toggle snippet of about 0.5 KB. Tailwind CSS v4 supplies the styling, and the brief's
  palette is defined as `@theme` tokens.
- **Single source of facts**: Every business fact and every piece of copy lives in
  `src/config/business.ts`. Every component imports from it, and so do the meta tags and the
  JSON-LD.
- **Images**: A small prebuild script (`sharp`) creates WebP sizes and dimensions for every JPEG in
  `public/images/`. It also generates the favicon set from `public/logo/brown-co-icon.svg`.
- **Deploy**: GitHub Actions builds, validates, and deploys to GitHub Pages by default. The README
  gives one-command deploys for Netlify and Cloudflare Pages.

## Technical Context

**Language/Version**: TypeScript 5 (config and components), Astro components, HTML5, CSS via
Tailwind v4; Node.js 22+ for the build only

**Primary Dependencies**:
- `astro` (current stable, 5.x or later): static output, zero JS by default
- `tailwindcss` v4 + `@tailwindcss/vite`: CSS-first `@theme` tokens
- `@fontsource/barlow-condensed` (800) and `@fontsource/barlow` (400/600): self-hosted fonts
- `sharp`: WebP variants, favicons, and the OG image, generated in a prebuild script
- `png-to-ico`: legacy favicon
- `html-validate`: CI validation
- `tsx`: lets the Node scripts (`prebuild.mjs`, `check-build.mjs`) `import { business }` from
  `src/config/business.ts` directly, so nothing parses the config with regexes

**Storage**: N/A. Facts are in `src/config/business.ts` and photos are in `public/images/`.

**Testing** (CI, as directed):
1. **Build check**: the prebuild (which generates `src/generated/images.json`, so it must run
   first on a fresh checkout), then `astro check` (type-checks `business.ts`, so a typo fails with
   a line number), then `astro build`. A short `scripts/check-build.mjs` then confirms the required output
   exists and asserts the countable acceptance criteria: ≥ 4 matching `tel:` links, exactly one H1,
   "terrace" in the H1/subhead and `#terraces`, `alt` on every image, JSON-LD parses, and logo and
   favicon files are present.
2. **HTML validation**: `html-validate "dist/**/*.html"`.
3. **Banned-word grep**:
   `grep -rniwEI 'retire|retirement|age|succession' dist/` fails the job on any match.
   - `-w` means "drainage" and "Page County" pass.
   - `-I` skips binary files, so WebP, PNG, and WOFF2 bytes can't cause false failures.
   - CI also runs `npm run grep:banned`, a Node scan with the same word list plus transition
     phrases and file names. Both read one shared list, `scripts/banned-words.mjs`.

Lighthouse and viewport checks are **manual pre-launch gates** in quickstart.md (see Constitution
Check, Quality Gates).

**Target Platform**: Static hosting (GitHub Pages default; Netlify and Cloudflare Pages supported).
Browsers: current evergreen mobile and desktop browsers, including iOS Safari.

**Project Type**: Static website (single page)

**Performance Goals**: Lighthouse mobile ≥ 95 for Performance, Accessibility, and SEO. LCP < 2.5 s
on slow 4G. CLS < 0.05. TBT ≈ 0.

**Constraints**:
- No backend, forms, analytics, or third-party scripts.
- Client JS is limited to one inline nav snippet of 1 KB or less, and the page is fully usable
  without it.
- Budget:
  - HTML + CSS ≤ 40 KB gzip
  - Fonts ≤ 60 KB
  - Hero WebP ≤ 120 KB at mobile width
- The phone button, H1, and subhead are visible without scrolling at 320–1440 px.

**Scale/Scope**: 1 page, 9 sections, 3 logo SVGs, about 10 inline icons, 2 photo slots, 1 config
file.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | How the design satisfies it | Status |
|---|-----------|-----------------------------|--------|
| I | Static only; call is sole conversion | `output: 'static'`. No forms, endpoints, or SSR adapter. Every CTA is a `tel:` link built from `business.ts`. | ✅ |
| II | Performance first | Astro ships 0 KB JS by default. The only script is the inline nav toggle (≤ 1 KB, justified below). Tailwind purges to used classes only. Self-hosted subset fonts with `font-display: swap`. `<picture>` with WebP and a JPEG fallback, explicit dimensions, lazy below the fold. The hero is eager with `fetchpriority="high"` (constitution overrides "lazy everywhere"). | ✅ (see Complexity) |
| III | Mobile-first, tap-to-call visible | Mobile-first Tailwind (base = phone). Sticky header with a gold `tel:` button showing the number at every width. 44 px targets. | ✅ |
| IV | Accessibility | Semantic landmarks, one H1, `alt` required by the config type, visible focus, AA palette pairings (research R3). The nav toggle uses `aria-expanded`/`aria-controls`, and without JS the menu falls back to a link to the footer nav. | ✅ |
| V | Original content/artwork | Hand-authored SVG logo, dozers, and icons. Placeholder JPEGs are rendered from original SVG illustrations. Every photo entry has a required `source` field. | ✅ |
| VI | Simple to maintain | One obvious file: `src/config/business.ts`, a plain commented object. It is data-only, as constitution v1.1.0 Principle VI allows. Each value is defined once. Helpers such as the `tel:` format live in a separate file the owner never touches. README covers the phone, photos, services, and deploy. Build is one command. | ✅ (note in R2) |
| VII | Local SEO | Title and description, one H1, `GeneralContractor` JSON-LD imported from `business.ts`, full Open Graph, canonical, `@astrojs/sitemap`, robots.txt. | ✅ |
| VIII | Terraces + family above the fold | Hero H1 names terraces. Subhead carries "Two generations". Terraces is the first and largest service section. | ✅ |
| IX | Continuity framing | The CI grep fails the build on the acceptance-criteria words. The config also rejects wider transition phrases at build (research R11). The optional crew line is off by default. | ✅ |
| QG | Quality Gates (constitution v1.1.0 two-tier rule) | **Content-only changes** (`business.ts`, `public/images/`): the three automated CI checks gate every deploy, and a failure stops the deploy. **Layout/feature changes** (any other file): work happens on a branch, and a pull request must pass CI and record all 8 gates before merging to `main`. The manual gates are Lighthouse, viewports, the schema validator, contrast, above-the-fold, and copy review (quickstart.md). CI runs on PRs without deploying, and deploys only from `main`. The first merge to `main` happens only after Phase 9, so the site is never published without JSON-LD and Open Graph. | ✅ |

**Post-design re-check (after Phase 1)**: ✅ Still passing. The contracts add no runtime
dependencies, no third-party services, and no second source of facts.

## Project Structure

### Documentation (this feature)

```text
specs/001-terrace-marketing-site/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── business-config.md    # Owner-facing contract for src/config/business.ts
│   ├── page-structure.md     # DOM/section contract
│   └── structured-data.md    # JSON-LD + meta mapping
├── checklists/requirements.md
└── tasks.md                  # /speckit-tasks (not created here)
```

### Source Code (repository root)

```text
README.md                        # Change phone · swap photos · add/remove service · deploy
astro.config.mjs                 # static output; site = business.websiteUrl (env SITE_URL may override); base from env; sitemap; tailwind
package.json                     # dev, build, check, validate, grep:banned, deploy:netlify, deploy:cloudflare
tsconfig.json
src/
├── config/
│   ├── business.ts              # ★ THE file to edit: all facts, copy, services, photos
│   └── derived.ts               # Helpers (phone → tel:/E.164, years label, area summary). Owner never edits
├── layouts/Base.astro           # <head>: meta, OG, canonical, favicons, JSON-LD, inline nav script
├── components/
│   ├── Header.astro  Hero.astro  TrustStrip.astro  Terraces.astro  Services.astro
│   ├── Process.astro  About.astro  ServiceArea.astro  Footer.astro
│   ├── CallButton.astro         # The only gold element; renders tel: link from business.ts
│   ├── Photo.astro              # <picture>: WebP srcset + JPEG fallback, width/height, lazy/eager
│   ├── Icon.astro               # Inline original SVG icons by name
│   └── JsonLd.astro             # GeneralContractor JSON-LD from business.ts
├── pages/
│   ├── index.astro              # Composes the sections in order
│   └── robots.txt.ts            # Static endpoint: robots.txt generated from Astro `site`
├── styles/global.css            # @import "tailwindcss"; @theme palette + font tokens; base styles
└── generated/images.json        # Written by prebuild: dimensions + WebP variants (git-ignored)
public/
├── logo/
│   ├── brown-co-logo.svg        # Full: mirrored dozers + wordmark + contour lines
│   ├── brown-co-wordmark.svg    # Wordmark only
│   └── brown-co-icon.svg        # Square contour-line icon (favicon/social source)
├── images/
│   ├── placeholder-hero.jpg     # TODO: owner photo of new terraces on a hillside
│   ├── placeholder-about.jpg    # TODO: family with a dozer / old vs. new equipment
│   └── _generated/              # WebP variants from prebuild (git-ignored)
└── (favicon.ico, favicon.svg, apple-touch-icon.png, icon-192/512.png,
     site.webmanifest, og-image.png: written by prebuild, git-ignored)
scripts/
├── prebuild.mjs                 # Runs before dev/build: images → WebP + manifest; icon → favicon set + OG image
├── placeholders/                # Original SVG art the placeholder JPEGs were rendered from
├── check-build.mjs              # Post-build assertions (part of the "build check")
├── banned-words.mjs             # Shared word + phrase list for derived.ts and grep-banned.mjs
├── require-site-url.mjs         # Blocks Netlify/Cloudflare deploys while websiteUrl is the placeholder
└── grep-banned.mjs              # Node banned-language scan (text files + file names)
.htmlvalidate.json
.github/workflows/deploy.yml     # PR: check → validate → grep (no deploy). main: same, then deploy Pages
netlify.toml                     # build/publish settings for Netlify
```

**Structure Decision**: This is a single Astro project. The only file the owner edits is
`src/config/business.ts`, and photos go in `public/images/`. The owner's direction set both paths.
Everything else lives behind them. Logos live in `public/logo/` as the acceptance criteria require.

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|------|------------|--------------------------------------|
| Astro (build framework) | The owner chose it. Principle II restricts *client* frameworks, and Astro ships 0 KB of runtime JS. It lets one TypeScript config feed every component and the JSON-LD. | Hand-written HTML would duplicate the phone number six or more times, violating Principle VI. |
| Inline nav-toggle script (≤ 1 KB) | The owner requested it. It collapses the mobile nav so the sticky header stays one row, which keeps the H1 and subhead above the fold at 320×568. | A CSS-only `details` menu was proposed in the earlier draft. The owner prefers a button toggle. Without JS, the menu button is a plain link to the footer nav, so the site stays usable. |
| Prebuild image script (`sharp`) | Files in `public/` are not processed by Astro's image pipeline, but the owner wants photos in `public/images/` delivered as WebP. | Moving photos to `src/assets/` would allow Astro's `<Picture>`, but it contradicts the requested location and makes photo swaps less obvious. |
