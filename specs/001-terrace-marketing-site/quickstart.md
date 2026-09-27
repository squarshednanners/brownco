# Quickstart & Validation: Terrace Contractor Marketing Site

**Feature**: 001-terrace-marketing-site

This guide explains how to build and preview the site, and how to prove it meets the spec and
constitution. Details live in [data-model.md](./data-model.md) and [contracts/](./contracts/).

## Prerequisites

- Node.js 22 or newer (`node -v`)
- `npm install` (first time only)

## Build and preview

```bash
npm run dev       # prebuild (WebP + favicons) then Astro dev server at http://localhost:4321
npm run build     # prebuild, then static build to dist/
npm run preview   # serve dist/ locally
```

**Expected result**:
- The build log ends with a TODO summary of remaining placeholders and unconfirmed claims.
- `dist/` contains:
  - `index.html`
  - `logo/` with 3 SVGs
  - `images/` with the JPEGs plus `_generated/*.webp`
  - `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`
  - `site.webmanifest`, `og-image.png`, `robots.txt`, and the sitemap

## Automated checks (CI: `.github/workflows/deploy.yml`, and locally with `npm test`)

| # | Check | Command | Pass condition | Traces to |
|---|-------|---------|----------------|-----------|
| 1 | Build check | `npm run check` (prebuild → `astro check` → `astro build` → `tsx scripts/check-build.mjs`) | Types valid. Build succeeds. ≥ 4 identical `tel:` links matching the JSON-LD telephone. One H1. "terrace" in the H1/subhead and `#terraces`. Every `<img>` has `alt`. No `<form>` or hydration. Meta and OG present. JSON-LD parses. Logos and favicon set present. Gold used only in `CallButton` | FR-001/002/017/018/021–023, SC-002/009 |
| 2 | HTML validation | `npm run validate` (`html-validate "dist/**/*.html"`) | 0 errors | Const. IV/VII |
| 3 | Banned words | `npm run grep:banned` (Node: the 4 words + transition phrases + file names). CI also runs `grep -rniwEI 'retire\|retirement\|age\|succession' dist/` (`-I` skips binary files) | No matches, so the step fails only when a scan finds something | FR-015, SC-008, Const. IX |

On pull requests, the three checks run and nothing is deployed. On `main`, the GitHub Pages deploy
runs only if all three pass.

## Negative tests (confirm the safety nets)

Make each change temporarily, run the command shown, confirm it fails with a readable message, then
revert.

1. In `business.ts`, set `phone: '712-555-01'` and run `npm run build`. Expect an error naming
   `contact.phone`.
2. Set a service to `icon: 'tractor'` and run `npm run check`. `astro check` should list the valid
   icon names.
3. Delete a comma in `business.ts` and run `npm run check`. Expect an error with the line number.
4. Add "retirement" to any text and run `npm run build`. The config check should throw. If you
   bypass it, `grep:banned` fails.
5. Write "drainage" and "Page County" in text and run `npm test`. Expect it to **pass**
   (whole-word matching).

## Owner edit test (SC-007, Principle VI)

A non-technical person follows only the README:
1. Change `contact.phone` in `src/config/business.ts`, either in the GitHub web editor or locally.
2. After the deploy (or a local build), confirm every visible number, every `tel:` link, and the
   JSON-LD show the new number.
3. Target: done in under 5 minutes, touching only that file.
4. Swap a photo: drop `hero.jpg` into `public/images/` and set `photos.hero.file: 'hero.jpg'`.
   Confirm the page serves WebP with a JPEG fallback and the alt text.
5. Add and remove a service line, and confirm the grid updates.

## Manual gates (constitution v1.1.0 Quality Gates)

These are required for **layout, template, style, script, or feature changes**. Run them against
`npm run preview` (Lighthouse works on localhost) or a host preview deploy. Record the results in
the pull request **before merging to `main`**.

Content-only edits to `business.ts` or `public/images/` need only the three automated checks.

- [ ] **Lighthouse mobile** (Chrome DevTools on `npm run preview`, or PageSpeed Insights on a
  preview URL):
  Performance ≥ 95, Accessibility ≥ 95, SEO ≥ 95. (Gate 1, SC-005)
- [ ] **Viewports** 320×568, 360×640, 375×667, 768×1024, 1440×900 in DevTools device mode:
  - [ ] the header call button is visible on load and while scrolling
  - [ ] the H1, subhead, and hero call button are visible without scrolling
  - [ ] no horizontal scroll

  (Gates 2 and 8, SC-001/003/004)
- [ ] **Tap targets**: at 360px, every link and button (header nav, Menu, call buttons, footer
  links) measures at least 44×44 CSS px. (Const. III)
- [ ] **JSON-LD**: paste it into validator.schema.org. 0 errors. (Gate 4)
- [ ] **Contrast**: check the hero overlay on the real photo, the CTA states, and focus rings with a
  contrast checker. (Gate 6)
- [ ] **JS disabled**: the Menu link jumps to the footer nav, anchors work, and all content is
  visible.
- [ ] **Real phone**: tap each call button and confirm the dialer opens with the correct number.
- [ ] **Copy and artwork review**: plain tone, original text, no transition language, no
  manufacturer marks or livery on the dozers. (Gate 7, Const. V/IX)
- [ ] **TODOs**: every TODO in the build summary is resolved or knowingly accepted for launch.

## Deploy

- **GitHub Pages (default)**: In the repo Settings → Pages → Source, choose **GitHub Actions**. Push
  to `main`, and the workflow checks, builds, and deploys. For a custom domain, add it in Pages
  settings. The workflow then builds with `BASE_PATH=/`.
- **Netlify (one command)**: Run `npm run deploy:netlify`. The first run asks you to log in and pick
  or create a site. `netlify.toml` also enables auto-deploy if the repo is connected in Netlify.
- **Cloudflare Pages (one command)**: Run `npm run deploy:cloudflare`. The first run asks you to log
  in. The project name is `brown-co-services`.
- **Netlify and Cloudflare**: set `websiteUrl` in `business.ts` first. Both deploy commands refuse
  to run while it is still `https://www.example.com`.
- **CI guard check**: a direct push to `main` that touches a component should fail at the
  change-tier guard. A squash-merged PR with the same change should pass.
