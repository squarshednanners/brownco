---

description: "Task list for the Brown Co Services terrace contractor marketing site"
---

# Tasks: Terrace Contractor Marketing Site

**Input**: Design documents from `/specs/001-terrace-marketing-site/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (business-config,
page-structure, structured-data), quickstart.md

**Tests**: The owner requested three CI checks: (1) a build check, (2) HTML validation, and (3) a
banned-word grep on `dist/`. The check scripts are built in Phase 2. Each story phase then adds its
own assertions to `scripts/check-build.mjs`. Lighthouse and viewport checks are manual (Polish
phase), per plan.md.

**Organization**: Tasks are grouped by user story (US1–US6 from spec.md) so each story can be
implemented and verified on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: The spec.md user story this task serves (US1–US6)

## Path Conventions

This is a single Astro project at the repository root (plan.md → Project Structure).

- Owner-editable: `src/config/business.ts`, `public/images/`
- Components: `src/components/`
- Scripts: `scripts/`
- Output: `dist/`

**Global rules for every task**:
- Zero client JS except the nav-toggle snippet (T034).
- No `client:*` directives.
- Every business fact is imported from `src/config/business.ts` or `src/config/derived.ts`, never
  hard-coded.
- `bg-gold` appears only in `src/components/CallButton.astro`.
- Asset URLs go through `import.meta.env.BASE_URL`.
- Copy is plain and short ("contractor over a truck tailgate"), original, and never uses retire,
  retirement, age, succession, successor, stepping down, hand over, or take over.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and tooling

- [X] T001 Initialize the Astro project at the repo root.
  - Create `package.json` with name `brown-co-services`, `"type": "module"`, and engines
    `node >=22`.
  - Install `astro`, `@astrojs/check`, `typescript`, `tailwindcss`, `@tailwindcss/vite`,
    `@astrojs/sitemap`, `@fontsource/barlow-condensed`, and `@fontsource/barlow`.
  - Install dev dependencies `sharp`, `png-to-ico`, `html-validate`, and `tsx` (so the Node
    scripts can import `src/config/business.ts` directly).
- [X] T002 Add npm scripts to `package.json`:
  - `predev` and `prebuild`: `tsx scripts/prebuild.mjs`
  - `dev`: `astro dev`
  - `build`: `astro build`
  - `preview`: `astro preview`
  - `check`: `tsx scripts/prebuild.mjs && astro check && astro build && tsx scripts/check-build.mjs`.
    The prebuild must run **before** `astro check`, because `Photo.astro` imports the git-ignored
    `src/generated/images.json`, which doesn't exist on a fresh CI checkout. Calling `astro build`
    directly (not `npm run build`) avoids running the prebuild twice.
  - `validate`: `html-validate "dist/**/*.html"`
  - `grep:banned`: `node scripts/grep-banned.mjs`
  - `test`: `npm run check && npm run validate && npm run grep:banned`
  - `todo`: `node scripts/todo.mjs`
  - `predeploy-guard`: `tsx scripts/require-site-url.mjs`. It exits 1 with the message "Set
    websiteUrl in src/config/business.ts before deploying" while `business.websiteUrl` contains
    `example.com`.
  - `deploy:netlify`: `npm run predeploy-guard && npm run build && npx netlify-cli deploy --prod --dir=dist`
  - `deploy:cloudflare`: `npm run predeploy-guard && npm run build && npx wrangler pages deploy dist --project-name=brown-co-services`
  - Create the small `scripts/require-site-url.mjs` along with these scripts. It imports
    `business` from `../src/config/business.ts`.
- [X] T003 [P] Create `astro.config.mjs` with:
  - `output: 'static'`
  - `site: process.env.SITE_URL || business.websiteUrl` (`||` so an empty string from CI counts as
    unset), importing `{ business }` from
    `./src/config/business.ts`. `websiteUrl` is the single source of the site's address, and the
    env var overrides it only for a `*.github.io` build with no custom domain.
  - `base: process.env.BASE_PATH ?? '/'`
  - `build: { inlineStylesheets: 'always' }`
  - `integrations: [sitemap()]`
  - `vite: { plugins: [tailwindcss()] }`
- [X] T004 [P] Create `tsconfig.json` extending `astro/tsconfigs/strict`, including `src/**/*` and
  `scripts/**/*`.
- [X] T005 [P] Create `.gitignore` covering:
  - `node_modules/`, `dist/`, `.astro/`
  - `src/generated/`, `public/images/_generated/`
  - `public/favicon.ico`, `public/favicon.svg`, `public/apple-touch-icon.png`,
    `public/icon-192.png`, `public/icon-512.png`, `public/site.webmanifest`,
    `public/og-image.png`
- [X] T006 [P] Create `.htmlvalidate.json` extending `html-validate:recommended`. Document any rule
  disabled for Astro output with a comment-style `"//"` key explaining why.
- [X] T007 [P] Create `netlify.toml` with `[build] command = "npm run build"`,
  `publish = "dist"`, and `[build.environment] NODE_VERSION = "22"`.
- [X] T008 [P] Create the static endpoint `src/pages/robots.txt.ts`. It exports
  `GET: APIRoute = ({ site }) => new Response(...)` returning `User-agent: *`, `Allow: /`, and
  `Sitemap: ${new URL('sitemap-index.xml', site + BASE_URL)}`, with content type `text/plain`. The
  domain comes from Astro `site`, which comes from `business.websiteUrl`. Do not hard-code it.
- [X] T009 Create the empty directory layout from plan.md with `.gitkeep` where needed:
  `src/config/`, `src/layouts/`, `src/components/`, `src/pages/`, `src/styles/`, `public/logo/`,
  `public/images/`, `scripts/placeholders/`, `.github/workflows/`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Config, design tokens, layout shell, shared components, brand assets, the image and
favicon pipeline, and the three CI checks. Every user story depends on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Config (single source of truth)

- [X] T010 Create `src/config/derived.ts`, part 1 (types). Export:
  - The `BusinessConfig` type matching data-model.md.
  - The icon union
    `type IconName = 'tile' | 'waterway' | 'pond' | 'ditch' | 'clearing' | 'grading' | 'culvert'`.
  - The pronoun union `'he' | 'she' | 'they'`.
  - The day union `'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su'`.
  - `HoursEntry` as `{ days, opens: 'HH:MM', closes: 'HH:MM', label?: string }`.
  - `PhotoSlot` with `file`, `alt`, `source`, `isPlaceholder`.
- [X] T011 Create `src/config/business.ts` exactly per `contracts/business-config.md`.
  - Header comment block, single quotes, one field per line, `// TODO:` beside every placeholder.
  - Confirmed values:
    - `name: 'Brown Co Services'`, `shortName: 'Brown Co'`, `foundedYear: 1970`
    - `city: 'Henderson'`, `state: 'IA'`, `stateName: 'Iowa'`
    - `radiusMiles: 100`
    - counties `['Mills', 'Pottawattamie', 'Montgomery', 'Fremont', 'Page', 'Cass', 'Harrison', 'Taylor']`
  - Placeholders:
    - `phone: '(712) 555-0100'`, `street: '123 Main St'`, `zip: '51541'`
    - hours Mon–Fri 07:00–18:00 and Sat 08:00–12:00
    - `ownerName: 'Owner Name'`, `founderName: 'Founder Name'`, `ownerPronoun: 'he'`,
      `founderRelation: 'dad'`, `ownerYearsLabel: '40+'`
    - `websiteUrl: 'https://www.example.com'`
    - `centerGeo: { lat: 40.99, lng: -95.45 }`
  - Flags: `foundedConfirmed`, `licensedInsured`, `weFarmHere`, `showCrewFamilyMember`, and
    `nrcsConfirmed` are all `false`.
  - Use stub `'…'` copy for the section text (final copy is written in the story phases).
  - End with `} satisfies BusinessConfig;` and one `import type { BusinessConfig } from './derived';`
    line at the top, commented "leave this line alone".
- [X] T012 Implement `src/config/derived.ts`, part 2 (computed values). Export:
  - `phoneDigits`, `phoneE164` (`'+1' + 10 digits`), `phoneHref` (`'tel:' + phoneE164`), and
    `phoneDisplay` (`'(712) 555-0100'` format).
  - `yearsInBusinessLabel` = `Math.floor((buildYear - foundedYear) / 10) * 10 + '+'`.
  - `areaSummary` = `` `within ${radiusMiles} miles of ${centerCity}` ``.
  - `geoRadiusMeters` = `Math.round(radiusMiles * 1609.34)`.
  - `countyLabels` (append " County").
  - `copyrightYear`.
  - `fill(text)`, which replaces the tokens `{phone}`, `{area}`, `{foundedYear}`,
    `{yearsInBusiness}`, `{name}`, `{shortName}`, `{ownerName}`, `{founderName}`,
    `{founderRelation}`, `{ownerYearsLabel}`, `{pron}`, `{crewFamilyMemberName}` (the full list in
    contracts/business-config.md). It throws `business.ts: unknown token {x}. Valid tokens: …` for
    anything else.
  - `pron` (`his`/`her`/`their` from `ownerPronoun`).
  - `asset(path)`, which prefixes `import.meta.env?.BASE_URL ?? '/'`. The guard lets `derived.ts`
    be imported by `tsx` scripts outside Astro.
- [X] T013 Implement build-time validation in `src/config/derived.ts`, part 3. It runs on import and
  throws plain-English errors in the form
  `business.ts → contact.phone: "712-555-01" needs 10 digits, like (712) 555-0100`:
  - **V-PHONE**: "Exactly 10 digits after stripping non-digits; must not start with 0 or 1".
  - **V-BAN**: first create `scripts/banned-words.mjs`. It exports
    `ACCEPTANCE_WORDS = ['retire', 'retirement', 'age', 'succession']`, then
    `EXTRA_WORDS = ['retired', 'retiring', 'aging', 'successor']` and
    `PHRASES = ['stepping down', 'step down', 'hand over', 'handing over', 'take over', 'taking over', 'passing the torch']`,
    plus a `bannedRegex` built from all of them with `\b` boundaries and the `i` flag.
    `derived.ts` imports it and runs a whole-word, case-insensitive scan of every string in
    `business`. `grep-banned.mjs` (T028) reuses the same module.
  - **V-TERRACE**: "terrace" appears in `hero.headline` or `hero.subhead`, and in
    `terraces.heading`.
  - **V-COUNT**: "`trustFacts` 3–5, `situations` = 3, `processSteps` = 4, `services` ≥ 1".
  - **V-URL**: `websiteUrl` "is absolute https".
  - **Length limits**:
    - `hero.headline` "≤ 70 chars"
    - `shortName` "≤ 20 chars"
    - trust fact `text` "≤ 48 chars measured after tokens are filled" (check `fill(text)`, not
      the raw string)
    - service `name` "≤ 60 chars" and `description` "One sentence, ≤ 160 chars"
    - `seo.title` "30–65 chars" and `seo.description` "70–160 chars"
    - photo `alt` "5–150 chars, required"
  - **V-TODO**: log a warning that lists every placeholder and `confirmed: false` item.

### Design tokens and layout

- [X] T014 [P] Create `src/styles/global.css`:
  - `@import "tailwindcss";`
  - `@import` for `@fontsource/barlow-condensed/latin-800.css`,
    `@fontsource/barlow/latin-400.css`, and `@fontsource/barlow/latin-600.css`
  - An `@theme` block with `--color-soil: #3B2A1A; --color-field: #3F6B3A; --color-gold: #D9A441; --color-cream: #F5F0E6; --color-ink: #1F1F1F; --color-rust: #B5541C;`
  - `--font-display: "Barlow Condensed", "Arial Narrow", "Roboto Condensed", Arial, sans-serif;`
    and `--font-body: "Barlow", system-ui, "Segoe UI", Roboto, Arial, sans-serif;`
  - Base styles: body `bg-cream text-ink font-body`, and headings in `font-display` uppercase
    tracking.
  - `:focus-visible` gets a 3px soil outline, or a 3px **cream** outline inside `.on-dark`. Never
    gold (spec FR-004: gold is for call buttons only).
  - Tap targets: every `a` and `button` in the header nav, the menu control, and the footer
    (phone and nav links) gets padding for a **minimum 44×44 CSS px** tap area
    (`min-h-11 inline-flex items-center`, with horizontal padding) (constitution Principle III).
  - `scroll-margin-top` on `section[id]` equal to the header height.
  - `scroll-behavior: smooth` only under `prefers-reduced-motion: no-preference`.
  - A `.visually-hidden` utility.
  - A skip-link style.
  - Contrast rules per research R3: rust is never used for text below 24px (or 19px bold) on
    cream.
- [X] T015 Create `src/layouts/Base.astro`. It imports `global.css`, `business`, and `derived`, and
  renders `<html lang="en">` with:
  - `<head>`: charset, viewport, `<title>{business.seo.title}</title>`, meta description, canonical
    (`new URL(import.meta.env.BASE_URL, Astro.site)`, so it uses the same `site` as the sitemap), `theme-color #3B2A1A`, and a preload for the Barlow Condensed 800
    latin WOFF2 (import the font URL via `?url`).
  - A `<slot name="head" />` for JSON-LD and meta.
  - An `<!-- Analytics placeholder: add a privacy-friendly analytics snippet here if ever needed. Not enabled. -->`
    comment.
  - `<body>` with a skip link to `#main` as the first child, then the default `<slot />`.

### Shared components

- [X] T016 [P] Create `src/components/CallButton.astro` per page-structure.md "Call button
  contract":
  - Markup: `<a class="call-btn" href={phoneHref}>` with an inline phone SVG
    (`aria-hidden="true" focusable="false"`) and a `<span>` containing
    `fill(business.hero.callLabel)` or a `label` prop.
  - Props: `size: 'sm' | 'lg'`, `onLight: boolean` (adds a 2px `border-soil`), and `compact`
    (number only, for widths below 400px).
  - Classes: `bg-gold text-ink font-display min-h-11 min-w-11`, with
    `hover:bg-rust hover:text-white focus-visible:bg-rust focus-visible:text-white`.
  - This is the ONLY file allowed to use `gold`.
- [X] T017 [P] Create `src/components/Icon.astro`. It renders an inline, original 24×24 stroke-based
  SVG by `name` prop: `phone`, `menu`, `close`, `tile`, `waterway`, `pond`, `ditch`, `clearing`,
  `grading`, `culvert`, `check`, `map-pin`.
  - `currentColor`, `aria-hidden="true"`, `focusable="false"`.
  - Simple generic shapes, no brand marks.
- [X] T018 [P] Create `src/components/Photo.astro`. Props: `photo: PhotoSlot` (not `slot`, which Astro reserves for named slots), `sizes: string`,
  `eager?: boolean`, `class?: string`.
  - Reads `src/generated/images.json` to get the intrinsic `width`, `height`, and the WebP variant
    list for `slot.file`.
  - Renders `<picture>` with `<source type="image/webp" srcset="…480w, …960w, …1600w" sizes>` and
    `<img src={asset('images/'+file)} width height alt={slot.alt} decoding="async">`.
  - Uses `loading="lazy"` unless `eager`. When `eager`, uses `loading="eager"` and
    `fetchpriority="high"`.
  - When `slot.isPlaceholder`, emits
    `<!-- TODO: replace placeholder photo "{file}" with the owner's real photo (see README) -->`.
- [X] T019 [P] Create `src/components/TodoNote.astro`. It emits
  `<Fragment set:html={'<!-- TODO: confirm with owner: ' + text + ' -->'} />` when `confirmed` is
  false, and nothing otherwise.

### Brand assets (FR-017, FR-018, research R6)

- [X] T020 [P] Hand-author `public/logo/brown-co-icon.svg`: a square 512×512 viewBox.
  - A rounded-square cream field with 4 parallel, gently curving contour strokes that read as
    terraces following a hillside. Strokes are `#3B2A1A`, and the second stroke is `#3F6B3A`.
  - Stroke widths chosen so the lines stay distinct at 32px.
  - Include `<title>Brown Co Services</title>`. No `<text>` and no raster images.
- [X] T021 [P] Hand-author `public/logo/brown-co-wordmark.svg`.
  - "BROWN CO" as outlined paths in heavy condensed letterforms (Barlow Condensed Black/ExtraBold
    shapes, OFL), with "SERVICES" letter-spaced beneath as outlined paths.
  - Fill `#3B2A1A`. `<title>Brown Co Services</title>`. No `<text>` elements.
- [X] T022 Hand-author `public/logo/brown-co-logo.svg` (depends on T020 and T021).
  - Place the wordmark paths from T021 in the center.
  - Draw two mirrored, generic bulldozer silhouettes (track frame with idlers and rollers, engine
    hood, open ROPS canopy, straight blade on push arms) on the left and right. The blades face
    OUTWARD.
  - Put 3–4 contour lines from T020 beneath the group as a hillside base.
  - Fills are `#3B2A1A` and `#1F1F1F` only. No yellow-and-black livery, manufacturer logos,
    wordmarks, or model numbers.
  - Include `<title>`. Size it to stay legible at a 160px width.
- [X] T023 [P] Create original placeholder art in `scripts/placeholders/placeholder-hero.svg`
  (freshly built terraces curving across a green hillside at golden hour, in palette colors) and
  `scripts/placeholders/placeholder-about.svg` (a generic dozer shaping a terrace, in soil and field
  colors).
  - Render each to `public/images/placeholder-hero.jpg` (1600×1000) and
    `public/images/placeholder-about.jpg` (1200×900) with a one-off `sharp` command documented at
    the top of each SVG.
  - Commit the JPEGs.

### Image and favicon pipeline (research R7, R8)

- [X] T024 Create `scripts/prebuild.mjs` (runs before dev and build). It has three jobs.
  - **(a) Photos**: For every `.jpg`, `.jpeg`, or `.png` in `public/images/` (skip `_generated/`):
    - Write WebP variants at 480, 960, and 1600 px wide (never upscaled, quality 72) to
      `public/images/_generated/{name}-{w}.webp`.
    - Write `src/generated/images.json` mapping each file to `{ width, height, webp: [{ src, w }] }`.
  - **(b) Favicons**: From `public/logo/brown-co-icon.svg`, write `public/favicon.svg` (a copy),
    `public/apple-touch-icon.png` (180), `public/icon-192.png`, `public/icon-512.png`, and
    `public/favicon.ico` (32, via `png-to-ico`).
    - Write `public/site.webmanifest` with `name`, `short_name`, `theme_color #3B2A1A`,
      `background_color #F5F0E6`, and the icons. Take `name` and `shortName` from
      `import { business } from '../src/config/business.ts'`. The script runs under `tsx`. Do not
      use regex parsing.
  - **(c) OG image**: Write `public/og-image.png` (1200×630): `brown-co-logo.svg` centered on
    `#F5F0E6`, with the contour lines along the bottom.
  - **V-PHOTO**: Fail with `business.ts → photos.hero.file: "x.jpg" not found in public/images/`
    if a referenced photo is missing. Read `business.photos.*.file` from the imported config.
- [X] T025 Wire favicons and the manifest into `src/layouts/Base.astro` `<head>`:
  `link rel=icon` for `favicon.ico` (sizes 32x32) and `favicon.svg` (type `image/svg+xml`), plus
  `apple-touch-icon` and `manifest`, all via `asset()`.

### Page shell and CI checks

- [X] T026 Create `src/pages/index.astro`: use `Base`, and render `<main id="main">` with commented
  slots for the sections in contract order: header (outside main), hero, trust, terraces,
  services, how-we-work, about, service-area, footer (outside main).
- [X] T027 [P] Create `scripts/check-build.mjs`, a skeleton that reads `dist/index.html` and runs
  named assertions. On failure it prints `✗ <assertion>: <detail>` and exits 1. On success it prints
  `✓` per assertion. Base assertions:
  - `dist/index.html` exists.
  - No `<form`, `<input`, `<textarea`, `<iframe`, or `astro-island`.
  - No `<script src=`.
  - Exactly one inline executable `<script>` (the nav toggle, added in T034), and it is ≤ 1024
    bytes. JSON-LD `<script type="application/ld+json">` doesn't count toward this. Until T034 is
    done, the assertion allows zero.
  - Every `<img>` has non-empty `width` and `height` attributes (constitution Principle II,
    gate 5).
  - `gold` appears in no `src/components/*.astro` other than `CallButton.astro`, and in
    `src/styles/global.css` only on the `--color-gold` token definition line (scan the source).

  Export an `assert(name, fn)` pattern so story phases can append assertions.
- [X] T028 [P] Create `scripts/grep-banned.mjs`, a Node equivalent of the owner-specified check. It:
  - Walks `dist/` and reads text files only (`.html .css .js .svg .xml .txt .webmanifest .json`).
    Binary files are never scanned.
  - Applies `bannedRegex` from `scripts/banned-words.mjs` (T013): the 4 acceptance words plus the
    extra words and transition phrases, so hard-coded component text is covered too.
  - Also checks every file name.
  - Prints each hit as `file:line: text` and exits 1 on any hit.

  The Node version exists because Windows dev machines lack grep. CI runs both this and the literal
  `grep -I` command (T029).
- [X] T029 [P] Create `.github/workflows/deploy.yml`:
  - Triggers: `push: branches: [main]`, `pull_request: branches: [main]`, and
    `workflow_dispatch`. Pull requests run the checks only (constitution v1.1.0 two-tier rule).
  - Permissions: `contents: read`, `pull-requests: read` (for the tier guard), `pages: write`,
    `id-token: write`.
  - Concurrency is set per job, so a PR check can never cancel a deploy:
    - Job `build`: `concurrency: { group: build-${{ github.ref }}, cancel-in-progress: true }`.
    - Job `deploy`: `concurrency: { group: pages-deploy, cancel-in-progress: false }`, following
      GitHub's Pages guidance.
  - **Job `build`** steps:
    1. `actions/checkout` with `fetch-depth: 0`, so the whole push range can be diffed.
    2. **Change-tier guard** (constitution v1.1.0). Runs only when
       `github.event_name == 'push' && github.ref == 'refs/heads/main'`.
       - **Changed files**: list them across the **entire push** with
         `git diff --name-only ${{ github.event.before }} ${{ github.sha }}`.
         - If `before` is all zeros (branch creation), print a notice and skip the guard.
         - If the diff command fails (for example after a force-push), fail closed with a clear
           message.
       - **PR check**: find out whether the pushed commit came from a merged PR with
         `gh api repos/${{ github.repository }}/commits/${{ github.sha }}/pulls --jq '[.[] | select(.merged_at != null)] | length'`,
         using env `GH_TOKEN: ${{ github.token }}`. This works for merge commits, **squash
         merges, and rebase merges**, unlike a parent-count check.
       - If any changed path is outside `src/config/business.ts` and `public/images/**` **and**
         the commit is not from a merged PR, fail with: "Layout/feature changes must be merged
         through a pull request with the manual gates recorded (constitution Quality Gates)."
       - Content-only direct commits pass, and commits from merged PRs pass.
       - The README (T051) also documents enabling "Require a pull request before merging" as an
         optional stricter setup, where the owner edits via a quick PR in the GitHub web UI.
    3. `actions/setup-node` (node 22, cache npm).
    4. `actions/configure-pages` (id `pages`), **only on push to `main` or `workflow_dispatch`**.
       Pull requests skip it, so PR checks work before Pages is enabled and from forks.
    5. `npm ci`.
    6. **Build check**: `npm run check`.
       - On a deploy run: env `SITE_URL: ${{ steps.pages.outputs.origin }}` and
         `BASE_PATH: ${{ steps.pages.outputs.base_path }}/`.
       - On a PR: `SITE_URL` is unset (so `websiteUrl` is used) and `BASE_PATH: /`.

       Write both as `${{ steps.pages.outputs.origin || '' }}` and
       `${{ steps.pages.outputs.base_path && format('{0}/', steps.pages.outputs.base_path) || '/' }}`.
       `astro.config.mjs` treats an empty `SITE_URL` as unset.
    7. **HTML validation**: `npm run validate`.
    8. **Banned words**: first `npm run grep:banned`, then
       `if grep -rniwEI 'retire|retirement|age|succession' dist/; then echo "Banned word found"; exit 1; fi`.
       `-I` skips binary files such as images and fonts, which would otherwise cause random false
       failures.
    9. `actions/upload-pages-artifact` with `path: dist`, only
       `if: github.event_name != 'pull_request'`.
  - **Job `deploy`**: `needs: build`,
    `if: github.ref == 'refs/heads/main' && github.event_name != 'pull_request'`, environment
    `github-pages`, runs `actions/deploy-pages`.
- [X] T030 [P] Create `scripts/todo.mjs`. It prints every line containing `TODO` in
  `src/config/business.ts` and every `confirmed: false`, `Confirmed: false`, or
  `isPlaceholder: true` entry, with line numbers.

**Checkpoint**: `npm run check`, `npm run validate`, and `npm run grep:banned` all pass on the empty
shell page. The logos and favicon set exist in `dist/`.

---

## Phase 3: User Story 1 - Farmer confirms "they build terraces" and calls (Priority: P1) 🎯 MVP

**Goal**: On any phone, the visitor sees the terrace headline, the two-generation subhead, and a
tap-to-call button without scrolling, and can call from anywhere on the page.

**Independent Test**: At 360×640, load the page. The H1, subhead, and a call button are visible
without scrolling. The header call button stays visible while scrolling. Tapping it opens the
dialer with the configured number.

- [X] T031 [P] [US1] Create `src/components/Header.astro`, a sticky `<header id="top">` with
  `bg-soil text-cream on-dark`:
  - A one-row flex layout.
  - A logo link to `#top`: `<img src={asset('logo/brown-co-logo.svg')} alt={business.name} width height>`
    at ≥400px, with `width`/`height` matching the SVG viewBox aspect ratio at its rendered size.
    Below 400px, show `brown-co-icon.svg` (with `width="40" height="40"`) plus
    `business.shortName` text.
  - `<nav id="site-nav" aria-label="Main">` with links to `#terraces`, `#services`, `#how-we-work`,
    `#about`, `#service-area`. Inline at ≥1024px, and hidden below 1024px unless the header has
    `data-open`.
  - Below 1024px, a menu control rendered as
    `<a href="#site-nav-footer" class="menu-toggle">Menu</a>`.
  - `<CallButton size="sm" />` on the right, which switches to `compact` below 400px (number with
    icon, no "Call" word).
  - Nav links and the menu control each have a tap area of at least 44×44 CSS px (constitution
    Principle III).
  - The header height must keep the H1 above the fold at 320×568 (target ≤ 64px).
- [X] T032 [P] [US1] Create `src/components/Hero.astro`, `<section id="hero">`:
  - `<Photo photo={business.photos.hero} eager sizes="100vw">` as the full-width background layer,
    with a `bg-soil/80` overlay behind the text block (research R3: ≥ 80% opacity).
  - `<h1>` = `business.hero.headline`, the page's ONLY h1, in `font-display` uppercase at about
    `text-4xl` on mobile, up to `text-7xl`.
  - `<p class="subhead">` = `fill(business.hero.subhead)`.
  - `<CallButton size="lg" />`.
  - Mobile layout keeps the H1, subhead, and button inside the first viewport at 320×568, 360×640, 375×667,
    768×1024, and 1440×900.
- [X] T033 [US1] Add `Header` and `Hero` to `src/pages/index.astro` in contract order.
- [X] T034 [US1] Add the inline nav-toggle script to `src/layouts/Base.astro` as
  `<script is:inline>`, minified, ≤ 1 KB, no dependencies.
  - Place it as the **last child of `<body>`**, after the header and footer markup, so
    `.menu-toggle` and `#site-nav` exist when it runs. Never put it in `<head>`.
  - The replacement button gets the same classes and size as the link, so swapping them causes no
    layout shift.

  The script:
  - Replaces `.menu-toggle` with `<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>`.
  - Toggles `data-open` on the header and syncs `aria-expanded`.
  - Closes on nav-link click and on Escape, and returns focus to the button.

  Without JS, the link jumps to the footer nav (built in T044, verified in T060).
- [X] T035 [US1] Append US1 assertions to `scripts/check-build.mjs`:
  - Exactly one `<h1>`.
  - The h1 or `.subhead` text matches `/terrace/i`.
  - ≥ 2 `a[href^="tel:"]` so far, all with an identical href equal to `tel:+1` + 10 digits.
  - Every tel link's visible text contains the display number.
  - The hero `<img>` has `fetchpriority="high"` and is not `loading="lazy"`.
  - Every `<img>` has an `alt` attribute.
  - The header contains `nav#site-nav`.

**Checkpoint**: The MVP is callable. Run `npm test`. Manually check 320/360/375/768/1440 in DevTools
(`npm run preview`) for above-the-fold visibility and the sticky call button. Demo it locally or
from a PR preview. **Do not merge to `main` yet.** The first publish waits for Phase 9, so the
live site always has JSON-LD and Open Graph (constitution Principle VII).

---

## Phase 4: User Story 2 - Farmer with a specific terrace problem sees it addressed (Priority: P1)

**Goal**: The featured terraces section names the three calling situations and the five service
lines, gets the most space of any service, and ends with a call button.

**Independent Test**: Read `#terraces`. It has three situations, five offerings, "terrace" in the
heading and body, and a call button. It is the tallest service section at ≥ 768px.

- [X] T036 [US2] Write the final terraces copy in `src/config/business.ts`:
  - `terraces.heading` must contain "terrace" (for example, 'Terrace construction and repair').
  - `terraces.intro` is 1–2 short sentences.
  - `terraces.situations` is exactly 3, titled 'A terrace blew out', 'An NRCS or EQIP deadline',
    and 'New ground, old terraces', each with 2–3 plain sentences written like a contractor
    talking to a neighbor.
  - `terraces.offerings` has ≥ 5 items:
    - New terrace systems: broad-base, narrow-base, grass-backed; parallel and tile-outlet layouts
    - Rebuilds and repair of blown-out, silted-in, or overtopped terraces
    - Tile-outlet terraces with underground outlets so you can farm through them
    - GPS survey, layout, and staking, built to NRCS specifications and eligible for EQIP
      cost-share where applicable
    - Terrace channel cleanout and re-grading

  All copy is original, and there are no buzzwords.
- [X] T037 [P] [US2] Create `src/components/Terraces.astro`, `<section id="terraces">`:
  - `<h2>` = `terraces.heading`, and the intro paragraph.
  - The situations as 3 `<article>` blocks with `<h3>`.
  - The offerings as a `<ul>` with check icons.
  - `<TodoNote confirmed={business.terraces.nrcsConfirmed} text="NRCS specifications and EQIP eligibility" />`
    beside the NRCS offering.
  - Two columns at ≥ 768px (situations left, offerings right), stacked on mobile.
  - A generous vertical padding so it is the largest service block.
  - Ends with `<CallButton size="lg" onLight />`.
- [X] T038 [US2] Add `Terraces` to `src/pages/index.astro` after the trust strip slot.
- [X] T039 [US2] Append US2 assertions to `scripts/check-build.mjs`:
  - `section#terraces` exists.
  - Its `h2` matches `/terrace/i`.
  - It has exactly 3 `h3` situation headings.
  - Its offerings `ul` has ≥ 5 `li`.
  - It contains ≥ 1 `a[href^="tel:"]`.
  - The page-wide tel count is now ≥ 3.

**Checkpoint**: US1 and US2 together form the core pitch.

---

## Phase 5: User Story 3 - Landowner checks that the company is local and trustworthy (Priority: P2)

**Goal**: The trust strip, About, Service area, and footer establish years in business, the family
story, the counties served, the address, and hours, framed as experience and continuity.

**Independent Test**: The trust strip shows 3–5 facts, including "Two generations, since 1970" and
"Working within 100 miles of Henderson, Iowa". About tells the story in "we" voice. Service area
lists the 8 counties. The footer shows the phone, address, hours, and copyright.

- [X] T040 [US3] Write the final trust and About copy in `src/config/business.ts`:
  - `trustFacts` stays at 5 entries per data-model.md.
  - `family.aboutParagraphs` is first-person plural and uses tokens, covering:
    - family-owned and operated for two generations since `{foundedYear}`
    - `{ownerName}` grew up on the equipment, started running a dozer for `{pron} {founderRelation}`
      as a kid, and has built terraces `{pron}` whole working life (`{ownerYearsLabel}` years)
    - many terraces we maintain today were built by `{founderName}` decades ago, and we still stand
      behind them
    - "We farm in this area too, so we build like it's our own ground." (rendered only when
      `weFarmHere`)
  - The tokens `{pron}`, `{founderRelation}`, and `{ownerYearsLabel}` are already supported by
    `fill()` (T012).
  - Framing is experience and continuity only. Never use transition wording.
- [X] T041 [P] [US3] Create `src/components/TrustStrip.astro`, `<section id="trust" class="bg-field text-white on-dark">`:
  - `<h2 class="visually-hidden">Why farmers call us</h2>`.
  - A `<ul>` of `trustFacts`, each rendered via `fill()` with a check icon and
    `<TodoNote confirmed text>`.
  - A single row at ≥ 1100px, a 2-column wrap on mobile.
  - White on field green is 6.2:1.
- [X] T042 [P] [US3] Create `src/components/About.astro`, `<section id="about">`:
  - `<h2>`, then two columns at ≥ 768px: `<Photo photo={business.photos.about} sizes="(min-width: 768px) 50vw, 100vw">`
    (lazy) and the paragraphs from `family.aboutParagraphs` via `fill()`.
  - Add the optional line `Today {ownerName} works alongside {crewFamilyMemberName}, the third generation on the crew.`
    ONLY when `family.showCrewFamilyMember` is true.
  - Add `TodoNote` entries for the owner name, founder name, and pronoun while they are
    placeholders.
  - When `family.weFarmHere` is false, hide the "We farm in this area too" sentence and emit
    `<TodoNote confirmed={false} text="we farm in this area too">` in its place (spec FR-011).
- [X] T043 [P] [US3] Create `src/components/ServiceArea.astro`, `<section id="service-area">`:
  - `<h2>`, then a sentence built with `fill()`, for example "We work {area}, including these
    counties:".
  - A `<ul>` of `countyLabels`, laid out as CSS columns: 2 on mobile, 4 at ≥ 768px.
  - Optional `towns` list.
  - Ends with `<CallButton onLight />`.
- [X] T044 [P] [US3] Create `src/components/Footer.astro`, `<footer id="contact" class="bg-soil text-cream on-dark">`:
  - The wordmark `<img src={asset('logo/brown-co-wordmark.svg')} alt={business.name} width height loading="lazy">`,
    with explicit `width`/`height` matching the SVG viewBox aspect ratio.
  - `<nav id="site-nav-footer" aria-label="Footer">` with the same 5 section links (the no-JS
    menu target).
  - A phone `<a href={phoneHref}>{phoneDisplay}</a>`, styled as a link, not gold.
  - The footer phone link and footer nav links each have a tap area of at least 44×44 CSS px. Use
    stacked links with padding, not a dense inline row.
  - `<address>` with street, city, state, and zip.
  - Hours rendered from `contact.hours` (`label` overrides).
  - "Licensed & insured" only when `licensedInsured`, otherwise
    `<TodoNote confirmed={false} text="licensed & insured">`.
  - `© {copyrightYear} {business.name}`.
- [X] T045 [US3] Add `TrustStrip` (after Hero), `About`, `ServiceArea`, and `Footer` to
  `src/pages/index.astro` in contract order.
- [X] T046 [US3] Append US3 assertions to `scripts/check-build.mjs`:
  - `#trust li` count is 3–5, and the text includes "since 1970".
  - `#about` exists with an `h2`.
  - `#service-area li` count ≥ 8, including "Mills County".
  - `footer address` exists.
  - `footer a[href^="tel:"]` exists.
  - `nav#site-nav-footer` exists.
  - Page-wide tel links are **≥ 4**, all identical (acceptance criterion).
  - The copyright contains `Brown Co Services`.

**Checkpoint**: The trust story is complete, and the "≥ 4 tel links" acceptance criterion passes.

---

## Phase 6: User Story 4 - Farmer finds a secondary service (Priority: P2)

**Goal**: The "We also do" grid shows the seven secondary services, each with an icon, a name, and
one plain sentence.

**Independent Test**: `#services` shows 7 items, each with an icon, an `h3`, and one sentence. The
grid reflows from 1 column to 3–4 columns.

- [X] T047 [US4] Write the final `services` entries in `src/config/business.ts`:
  - 7 items, each with a `name` "≤ 60 chars", a `description` that is "One sentence, ≤ 160 chars",
    and an `icon` from `tile | waterway | pond | ditch | clearing | grading | culvert`.
  - The services:
    - Drainage tile installation and repair
    - Grassed waterways
    - Ponds and watering holes
    - Ditch cleaning and surface drainage
    - Land clearing, tree removal, fence-row cleanup
    - Dirt work, grading, and site prep for bins, buildings, and lots
    - Erosion control structures, drop boxes, culverts
  - Add the comment above the list explaining how to add or remove a line.
- [X] T048 [P] [US4] Create `src/components/Services.astro`, `<section id="services">`:
  - `<h2>We also do</h2>`.
  - A `<ul>` grid: 1 column below 480px, 2 columns at ≥ 480px, 3 at ≥ 768px, 4 at ≥ 1100px.
  - Each `<li>` has `<Icon name={s.icon}>` in field green, `<h3>{s.name}</h3>`, and
    `<p>{s.description}</p>`.
  - Visually smaller than `#terraces` (tighter padding, no CTA required).
- [X] T049 [US4] Add `Services` to `src/pages/index.astro` after `Terraces`.
- [X] T050 [US4] Append US4 assertions to `scripts/check-build.mjs`: `#services li` count equals
  `business.services.length` (7), each has an `svg[aria-hidden="true"]` and an `h3`, and
  `#terraces` comes before `#services` in document order.

---

## Phase 7: User Story 6 - Owner updates a business detail without a developer (Priority: P2)

**Goal**: A non-coder can change the phone number, swap a photo, or add or remove a service by
editing `src/config/business.ts` or `public/images/` and following the README. Deploys are one
command.

**Independent Test**: Following only README.md, change the phone number in `business.ts` and
rebuild. Every visible number, every `tel:` link, and the JSON-LD show the new number (under 5
minutes).

- [X] T051 [US6] Create `README.md` in plain language. It covers:
  - (1) **What this is**: two sentences.
  - (2) **The one file you edit**: `src/config/business.ts`, with quote and comma rules and a
    before/after example.
  - (3) **Change the phone number**: the exact line, noting that it updates the header, hero,
    terraces, service area, footer, and search listing.
  - (4) **Swap a photo**:
    - Drop a JPEG into `public/images/`, set `photos.hero.file` or `photos.about.file`, and update
      `alt` and `source`.
    - Recommended size is ≥ 1600px wide for the hero.
    - WebP versions are made automatically.
  - (5) **Add or remove a service**: copy or delete one `{ … },` line, with the icon list.
  - (6) **Editing on GitHub.com**: pencil icon → commit → the site redeploys in about 2 minutes.
    If a check fails, the old site stays up. How to read the error message.
  - (7) **Deploy**:
    - GitHub Pages is the default (Settings → Pages → Source: GitHub Actions; custom domain notes).
    - One command for Netlify: `npm run deploy:netlify`.
    - One command for Cloudflare Pages: `npm run deploy:cloudflare`.
    - Prerequisites: Node 22 and `npm install`.
    - **Which changes deploy directly**: edits to `business.ts` and `public/images/` publish
      straight from `main` once the checks pass. Any other change must come through a pull request.
      The workflow blocks direct pushes that touch other files (T029 step 2).
    - **Set `websiteUrl` before deploying to Netlify or Cloudflare.** Those deploys don't get a site
      address from CI. If `websiteUrl` is left as `https://www.example.com`, the canonical tag and
      search listing point to the wrong site. The `deploy:netlify` and `deploy:cloudflare` scripts
      refuse to run while it is still the placeholder (see T002).
    - Optional stricter setup: enable "Require a pull request before merging" on `main`, and the
      owner makes edits as quick PRs from the GitHub web editor.
  - (8) **Before launch checklist**: every TODO from `npm run todo` (phone, address, ZIP, hours,
    owner, founder, pronoun, owner's years, website URL, coordinates, founding year, licensed and
    insured, NRCS/EQIP, GPS, we-farm-here, real photos).
  - (9) **Checks that run on every change**: build check, HTML validation, banned-word check. Also
    what "banned words" means and why.
- [X] T052 [US6] Append US6 assertions to `scripts/check-build.mjs`:
  - The JSON-LD `telephone` equals the E.164 number in every `tel:` href.
  - Every visible phone text equals `phoneDisplay`. `check-build.mjs` runs under `tsx`, so it
    imports `{ business }` from `../src/config/business.ts` and `{ phoneDisplay, phoneE164 }` from
    `../src/config/derived.ts` directly. Do not use regex parsing.
  - `dist/images/_generated/` contains WebP files for each referenced photo.
  - Every `<picture>` has a `<source type="image/webp">` with a non-empty `srcset`.
  - Every `<img>` other than the hero and the header logo has `loading="lazy"` (constitution gate
    5).
- [X] T053 [US6] Run the negative tests from quickstart.md "Negative tests" 1–5 and confirm each
  error message names the field in plain English. Adjust the messages in `src/config/derived.ts` and
  `scripts/prebuild.mjs` if they don't.

  Then run the quickstart.md "Owner edit test" (SC-007). A person who hasn't seen the code follows
  only `README.md`:
  1. Change the phone number.
  2. Swap a photo.
  3. Add and remove a service.

  Time the phone change (target: under 5 minutes). Record the result, and any README wording that
  caused hesitation, in the PR. Fix the README.

---

## Phase 8: User Story 5 - Visitor understands what happens after the call (Priority: P3)

**Goal**: A four-step "How we work" section.

**Independent Test**: `#how-we-work` shows an `<ol>` with exactly 4 steps in the specified order.

- [X] T054 [US5] Write the final `processSteps` in `src/config/business.ts`. There are exactly 4, in
  this order:
  1. 'Call us'
  2. 'We walk the field' (and pull a survey)
  3. 'We stake the layout'
  4. 'We build it' (…and give you the as-built map for your NRCS paperwork)

  Each has one plain sentence. Use "give you", never "hand over".
- [X] T055 [P] [US5] Create `src/components/Process.astro`, `<section id="how-we-work">`:
  - `<h2>How we work</h2>`.
  - An `<ol>` of 4 `<li>`, each with a large display-font step number, a `<h3>` title, and a
    `<p>`.
  - Horizontal with connecting rule lines at ≥ 768px (rust decorative lines allowed), vertical on
    mobile.
- [X] T056 [US5] Add `Process` to `src/pages/index.astro` after `Services`, and append an
  assertion to `scripts/check-build.mjs` that `#how-we-work ol > li` count is exactly 4.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: SEO and structured data (FR-022/023, Principle VII), final quality gates, launch
readiness.

- [X] T057 [P] Create `src/components/JsonLd.astro` per `contracts/structured-data.md`. It builds a
  `GeneralContractor` object entirely from `business` and `derived`, with these fields:
  - `@id`, `name`, `alternateName`, `url`, `telephone: phoneE164`, `foundingDate`, `logo`, `image`,
    `description`
  - `address` as a `PostalAddress` with `addressCountry` `US`
  - `geo`
  - `areaServed`: a `GeoCircle` with `geoRadius: geoRadiusMeters`, plus one `AdministrativeArea`
    per county, named `"{County} County, Iowa"`
  - `openingHoursSpecification`, mapping day codes to schema.org day names
  - `hasOfferCatalog`, with an offer per terrace offering and service

  All URLs (`@id`, `url`, `logo`, `image`) are built from the resolved
  `site = new URL(import.meta.env.BASE_URL, Astro.site)`, **not** from `business.websiteUrl`.
  Export a `siteUrl()` helper from `src/config/derived.ts`, or compute it in `Base.astro` and pass it
  down, so the canonical tag, Open Graph, and JSON-LD share one value
  (contracts/structured-data.md).

  Render it as `<script type="application/ld+json" is:inline set:html={JSON.stringify(data)} />`
  in the Base `head` slot.
- [X] T058 [P] Create `src/components/Meta.astro` for Open Graph and Twitter tags:
  - `og:type website`
  - `og:site_name`, `og:title`, `og:description`, `og:url`
  - `og:image` as the absolute `og-image.png` URL, plus `og:image:width 1200`,
    `og:image:height 630`, and `og:image:alt`
  - `og:locale en_US`
  - `twitter:card summary_large_image`

  Text values come from `business`. `og:url` and `og:image` use the same resolved `site` value as
  the canonical tag and JSON-LD (T057), never `business.websiteUrl` directly. Render it in the Base
  `head` slot.
- [X] T059 Wire `JsonLd` and `Meta` into `src/pages/index.astro` (`slot="head"`). Append
  assertions to `scripts/check-build.mjs`:
  - The JSON-LD parses and has `@type` `GeneralContractor`.
  - Its telephone matches the tel hrefs.
  - `areaServed` includes a `GeoCircle` with `geoRadius` `"160934"` or `160934`.
  - Title, meta description, canonical, and all 5 core `og:*` tags are present and non-empty.
  - `dist/logo/` has the 3 SVGs.
  - `dist/` has `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`,
    `icon-512.png`, `site.webmanifest`, and `og-image.png`.
  - A sitemap file exists.
- [X] T060 Verify the no-JS path. With JS disabled in DevTools, the "Menu" link jumps to
  `#site-nav-footer`, all anchors land below the sticky header (`scroll-margin-top`), and all
  content is visible. Fix `src/components/Header.astro` or `src/styles/global.css` if not.
- [X] T061 Performance pass:
  - Confirm the inline CSS is ≤ 15 KB and the total HTML+CSS is ≤ 40 KB gzip.
  - Fonts: only 3 latin WOFF2 files load, and the display font is preloaded.
  - The hero WebP is ≤ 120 KB at 960w. Lower the quality in `scripts/prebuild.mjs` if needed.
  - No layout shift from fonts or images.

  Record the numbers in the PR.
- [ ] T062 Run the full CI locally with `npm test` (build check, HTML validation, banned words) and
  fix any failures. Push the feature branch and open a pull request to `main`. Confirm the workflow
  runs all three checks on the PR and does **not** deploy. The PR run skips `configure-pages`, so
  this works before Pages is enabled.

  **Before merging** (in T064), enable **Settings → Pages → Source: GitHub Actions** so the first
  `main` run can configure and deploy Pages.
- [ ] T063 Run the manual gates from quickstart.md against `npm run preview`, or a host preview
  deploy built with the GitHub Pages `BASE_PATH`. Record the results in the pull request
  **before merging** (constitution v1.1.0, layout/feature tier):
  - Lighthouse mobile Performance, Accessibility, and SEO are each ≥ 95.
  - Viewports 320×568, 360×640, 375×667, 768×1024, 1440×900: header call button visible on load and while
    scrolling, H1, subhead, and hero CTA visible without scrolling, and no horizontal scroll.
  - validator.schema.org reports 0 errors.
  - LCP ≤ 2.5 s in the Lighthouse mobile run: the headline and phone button are readable quickly
    on slow mobile (SC-006).
  - Contrast spot-checks pass, including cream focus rings on the dark bands.
  - At 360px, every link and button measures at least 44×44 CSS px in DevTools (constitution
    Principle III).
  - Tapping each call button on a real phone opens the dialer with the correct number.
- [ ] T064 Copy and artwork review against constitution Principles V and IX:
  - All copy is original and plain-spoken with no buzzwords.
  - No transition language.
  - The dozers have no manufacturer marks or yellow-and-black livery.
  - The family story is framed as experience and continuity.

  Record the review in the pull request. Then run `npm run todo` and hand the owner the remaining
  TODO list (README "Before launch").

  **Only after T063 and this review are recorded**, and with Pages enabled (see T062): merge the
  pull request to `main`. Confirm the change-tier guard passes for the PR merge, and confirm
  `.github/workflows/deploy.yml` deploys to GitHub Pages with correct asset paths under the base
  path. This is the site's first publish.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all stories.
  - T010 → T011 → T012 → T013 (same file chain in `derived.ts`/`business.ts`). T013 also creates
    `scripts/banned-words.mjs`, and T028 depends on it.
  - T003 imports `business.ts`, so it must run after T011, or be written first and verified once
    T011 exists.
  - T020 + T021 → T022.
  - T023 → T024 → T025.
- **US1 (Phase 3)**: After Foundational. This is the MVP.
- **US2 (Phase 4)**: After Foundational. Independent of US1 except for the shared `index.astro`
  edit (T038 after T033).
- **US3 (Phase 5)**: After Foundational. T046's "≥ 4 tel" assertion assumes the US1 header and hero
  CTAs exist. If US3 is built alone, the count comes from the service area and footer plus US1.
- **US4 (Phase 6)**: After Foundational. T050's order assertion needs US2's `#terraces`.
- **US6 (Phase 7)**: After US1 and US3, because the README and phone-consistency checks reference
  the header, hero, and footer instances.
- **US5 (Phase 8)**: After Foundational. Independent.
- **Polish (Phase 9)**: After all desired stories.

### Shared-file serialization

- `src/config/business.ts` is edited by T011, T036, T040, T047, and T054. These run sequentially.
- `src/pages/index.astro` is edited by T026, T033, T038, T045, T049, T056, and T059. These run
  sequentially.
- `scripts/check-build.mjs` is edited by T027, T035, T039, T046, T050, T052, T056, and T059. These
  run sequentially.
- `src/layouts/Base.astro` is edited by T015, T025, and T034. These run sequentially.

### Within each story

Copy in `business.ts` → component ([P] with other components) → wire into `index.astro` → append
check assertions → `npm test`.

## Parallel Opportunities

- **Setup**: T003–T008 in parallel after T001–T002.
- **Foundational**: T014, T016, T017, T018, T019, T020, T021, T023, T027, T028, T029, and T030 in
  parallel once T011 exists (components import types from `derived.ts`).
- **Across stories**: Once Foundational is done, these components can all be built in parallel,
  since they are separate files: T031, T032, T037, T041, T042, T043, T044, T048, T055, T057, T058.

## Parallel Example: User Story 3

```text
Task: "Create src/components/TrustStrip.astro …"   (T041)
Task: "Create src/components/About.astro …"        (T042)
Task: "Create src/components/ServiceArea.astro …"  (T043)
Task: "Create src/components/Footer.astro …"       (T044)
# then sequentially: T045 (index.astro) → T046 (check-build.mjs)
```

## Parallel Example: Foundational brand assets

```text
Task: "Hand-author public/logo/brown-co-icon.svg …"      (T020)
Task: "Hand-author public/logo/brown-co-wordmark.svg …"  (T021)
Task: "Create placeholder art in scripts/placeholders/ …" (T023)
# then: T022 (full logo) and T024 (prebuild pipeline)
```

---

## Implementation Strategy

### MVP first (User Story 1)

1. Phase 1 Setup → Phase 2 Foundational. The CI checks pass on the shell.
2. Phase 3 (US1): header + hero + sticky call button.
3. **Stop and validate**: `npm test`, then a DevTools check at 4 viewports and a real-phone tap
   test on `npm run preview` or a PR preview. This is a demo, not a publish. Nothing merges to
   `main`, which deploys, until Phase 9, because Principle VII requires JSON-LD and Open Graph on
   every published page.

### Incremental delivery

1. + US2 (featured terraces): the core pitch is complete.
2. + US3 (trust strip, About, Service area, Footer): the "≥ 4 tel links" acceptance criterion
   passes.
3. + US4 (We also do).
4. + US6 (README, consistency checks): the owner can maintain it.
5. + US5 (How we work).
6. Polish: JSON-LD, OG, performance, the manual Lighthouse and viewport gates, and the copy and
   artwork review, all recorded in the PR. Then merge to `main`, which is the first publish.

### After launch (constitution v1.1.0 two-tier rule)

- **Owner content edits** (`business.ts`, `public/images/`) can be committed straight to `main`.
  The three automated checks gate the deploy.
- **Any other change** goes through a PR, with the manual gates recorded before merging.

---

## Notes

- [P] means different files with no dependency on incomplete tasks.
- Commit after each task or checkpoint. Keep `npm test` green at every checkpoint.
- Any new copy must pass V-BAN (T013) and the CI grep (T029).
- Never hard-code a phone number, name, or county in a component. Import it.

---

## Implementation Status (2026-09-25)

**T001–T061 complete.** `npm test` passes locally (build check: 33/33 assertions, HTML
validation: 0 errors, banned-word scan: clean; the literal CI `grep -rniwEI` is also clean).

**T062 — partially done.** `npm test` passes locally. **Blocked:** the project folder is not a git
repository yet, so there is no branch, pull request, or CI run. Next: `git init`, push to GitHub,
open a PR, confirm the workflow runs the three checks without deploying.

**T063 — mostly verified locally (against `npm run preview`):**
- ✅ Lighthouse mobile (3 runs, headless Edge): Performance 100, Accessibility 100, SEO 100,
  Best Practices 100; LCP 1.4 s, CLS 0, TBT 0 ms.
- ✅ Viewports 320×568, 360×640, 375×667, 768×1024, 1440×900 (Playwright + Edge emulation):
  header call button visible on load and at every section; H1, subhead, and hero call button above
  the fold; no horizontal scroll; every link/button ≥ 44×44 px.
- ✅ No-JS: Menu links to the footer nav; anchors land below the sticky header. With JS: button
  toggles `aria-expanded`, closes on Escape (focus returns) and on link tap.
- ✅ Contrast: palette pairings per research R3; cream focus rings on dark bands.
- ⏳ **Pending (needs a person/network):** paste the JSON-LD into validator.schema.org; tap each
  call button on a real phone.

**T064 — copy/artwork review done by the implementer; owner sign-off and merge pending.**
All copy was written originally in a plain, short-sentence style; no transition language (config
check + dist scan); dozers are generic silhouettes in soil/ink with no marks or livery; family
story framed as experience and continuity. `npm run todo` lists 15 launch items for the owner.
Merge to `main` (first publish) waits for T062/T063 and Pages being enabled.

**Measured budgets (T061):** HTML + inline CSS 12.4 KB gzip (budget 40 KB ✅); inline CSS 26.5 KB
raw / 5.8 KB gzip (raw target 15 KB ⚠️ over — Tailwind preflight + three `@font-face` blocks;
Lighthouse unaffected); nav script 702 bytes (≤ 1 KB ✅); fonts 3 × WOFF2 = 67 KB (budget 60 KB
⚠️ slightly over); hero WebP 10 KB at 960 w (≤ 120 KB ✅).

**Deviations recorded in docs:** nav goes inline at 1024 px, not 768 px (contract updated);
`Photo.astro` takes a `photo` prop, not `slot` (Astro reserves `slot`); TypeScript pinned to 6.x
because `@astrojs/check` does not support TypeScript 7 yet; `business.ts` gained two optional text
fields (`weFarmHereText`, `crewFamilyMemberText`) so those sentences are owner-editable.

### Update 2026-09-26: owner logos, About illustration, hours removed

- **Logos**: replaced the generated SVG set with the owner's PNG artwork, used as supplied (owner
  decision): `brown-co-logo.png` (full), `brown-co-wordmark.png` (cropped text), `brown-co-compact.png`
  (alternate mark, small-screen header), `brown-co-icon.png` (compact mark centered on cream;
  favicon source). Served as WebP with a PNG fallback via `Logo.astro`. The favicon set and
  og-image are now generated from the PNGs. Spec FR-017/FR-018 revised. Known trade-off: the source
  PNGs are small (430×280 and 270×270), so the 512 px app icon and og-image are upscaled.
- **About**: the owner's `construction-scene.png` (955×225, created in-house, AI-assisted) is now a
  full-width banner at the top of About, and the About placeholder has been removed.
- **Constitution v1.2.0**: Principle V now allows generic equipment paint colors (the yellow
  machines in the illustration), but still bans logos, wordmarks, model markings, and decals. The
  illustration was checked with no visible markings; there is a faint AI-generated scribble on the
  dozer's side panel that is not a readable brand.
- **Hours removed** (owner: irrelevant): footer column, `contact.hours`, JSON-LD
  `openingHoursSpecification`, derived helpers, README, spec FR-013/FR-023, data model, and
  contracts.
- **Owner edits preserved**: phone (712) 621-2513, street 702 Maple St., owner Steve Brown,
  founder Bud Brown.
- **Re-verified**: `npm test` passes (build check, HTML validation, banned words); viewports at 5
  sizes pass; Lighthouse mobile Performance 98, Accessibility 100, SEO 100, Best Practices 100
  (LCP 1.5 s, CLS 0).
