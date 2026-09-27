<!--
Sync Impact Report
==================
Version change: 1.1.0 → 1.2.0
Bump rationale: MINOR. Principle V's trade-dress rule is narrowed at the owner's request so
artwork may show equipment in generic paint colors (such as yellow), as long as there are no
logos, wordmarks, model numbers, or decals. The principle itself is kept, and everything that
complied before still complies, so this is not a backward-incompatible change.

Modified principles:
  - V. Original Content and Artwork Only: equipment color schemes alone no longer count as
    trade dress. Logos, wordmarks, model markings, and decals are still prohibited.

Added sections: none
Removed sections: none

Follow-up TODOs: none.

Previous amendment (1.0.0 → 1.1.0): two-tier Quality Gates; Principle VI data-only config
clarification.
-->

# Brown Co Services Website Constitution

## Core Principles

### I. Static Site Only; Phone Call Is the Sole Conversion

- The site MUST be delivered as static files (HTML, CSS, images, and minimal optional JS) that
  can be served from any static host or CDN.
- The site MUST NOT include a backend, server-side code, database, contact or quote forms,
  user accounts, logins, comments, or third-party form/chat widgets.
- The only conversion action is calling the business phone number. Every call-to-action MUST
  resolve to the tap-to-call `tel:` link; no alternative conversion paths (email capture,
  newsletter, booking tools) may be added.

**Rationale**: A static site has no attack surface, no hosting maintenance, and near-zero cost;
the customer base prefers to talk to a person on the phone.

### II. Performance First

- Every page MUST score 95 or higher on Lighthouse **Performance** in the mobile profile.
- JavaScript frameworks and libraries (React, Vue, jQuery, etc.) MUST NOT be used unless a
  written justification in the feature plan shows a requirement that plain HTML/CSS cannot meet.
  The site MUST remain fully usable with JavaScript disabled.
- All images MUST be resized to their displayed dimensions, compressed, served in a modern format
  (WebP/AVIF) with a fallback where needed, and declare explicit `width`/`height`.
- Images below the fold MUST use `loading="lazy"`; the above-the-fold hero image MUST NOT be lazy
  loaded.
- Web fonts, if any, MUST be limited and MUST NOT block rendering of the phone number.

**Rationale**: Visitors are often on weak rural cellular signals; a slow page is a lost call.

### III. Mobile-First, Tap-to-Call Always Visible

- Layouts MUST be designed for small screens first and progressively enhanced for larger ones.
- The phone number MUST be rendered as a `tel:` link (e.g., `<a href="tel:+1XXXXXXXXXX">`) with
  the number visible as text, not only as an icon.
- The phone number MUST be visible without scrolling on page load at every viewport width,
  from 320px phones through desktop, on every page.
- Tap targets MUST be at least 44×44 CSS pixels and remain legible in bright outdoor light.

**Rationale**: Most visitors are farmers on phones in the field; calling must take one tap.

### IV. Accessibility

- Markup MUST use semantic HTML (`header`, `nav`, `main`, `section`, `footer`, proper heading
  order, real links and buttons).
- All text and interactive elements MUST meet WCAG 2.1 AA contrast (4.5:1 body text, 3:1 large
  text and UI components).
- Every `<img>` MUST have an `alt` attribute: descriptive text for meaningful images, `alt=""`
  for purely decorative ones.
- Every page MUST score 95 or higher on Lighthouse **Accessibility** and be operable by keyboard
  with a visible focus indicator.

**Rationale**: Accessible sites serve every customer and are easier to read outdoors.

### V. Original Content and Artwork Only

- All copy MUST be written originally for this business; text MUST NOT be copied or closely
  paraphrased from competitors or other websites.
- Artwork, logos, and illustrations MUST NOT include trademarked logos, wordmarks, model
  numbers, decals, or other manufacturer branding.
- Equipment MAY be shown in generic paint colors, including yellow, as long as no manufacturer
  logo, wordmark, model marking, or decal appears.
- Photos MUST be owned by the business or properly licensed, with the source recorded.

**Rationale**: Protects the business from legal risk and builds a distinct, trustworthy identity.

### VI. Simple to Maintain by a Non-Coder

- Business facts — phone number, business name, service area, list of services, and photos —
  MUST each be editable in one obvious, clearly named place (e.g., a single site-content file
  plus an images folder), with no need to edit HTML structure or code.
- A data-only configuration file counts as that site-content file, even if it has a code file
  extension (e.g., `src/config/business.ts`). It must contain only plain, commented key/value
  entries and lists, plus at most a fixed line or two marked "leave alone". Logic, functions, and
  markup MUST live elsewhere.
- The phone number MUST be defined exactly once; every `tel:` link, visible number, and
  schema.org entry MUST derive from that single value.
- The repository MUST include a plain-language guide explaining how to change the phone number,
  add/remove a service, and replace a photo.
- Any build step MUST be a single documented command, or be absent entirely.

**Rationale**: The owner must be able to keep the site current without hiring a developer.

### VII. Basic Local SEO

- Every page MUST have a unique, descriptive `<title>` and `<meta name="description">`.
- Every page MUST have exactly one `<h1>`.
- The home page MUST include valid `LocalBusiness` (or a more specific subtype) schema.org
  JSON-LD containing name, telephone, service area, and URL, consistent with visible content.
- Every page MUST include Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`,
  `og:type`).

**Rationale**: Local farmers search for contractors by service and county; basic SEO puts the
business in front of them.

### VIII. Terraces and Family Heritage Above the Fold

- Terrace construction MUST be presented as the headline service: it MUST appear in the home
  page `<h1>` or immediately adjacent hero copy, and be listed first among services.
- The two-generation family history MUST be the core trust message and MUST appear above the
  fold on the home page on every viewport, alongside the phone number.
- Secondary services MUST NOT displace terraces or the family message from the above-the-fold area.

**Rationale**: These are the two facts most likely to convert a visitor into a caller.

### IX. Experience and Continuity Framing (NON-NEGOTIABLE)

- Site content — copy, headings, alt text, metadata, schema.org data, file names visible to
  users, and image captions — MUST NOT mention age, retirement, succession, handing over,
  stepping down, or any similar transition language.
- Family history MUST be framed as depth of experience, craftsmanship passed down, and
  continuity of service.

**Rationale**: Customers must read the business as stable and enduring, not in transition.

## Technical and Content Constraints

- **Stack**: Plain HTML5 and CSS; JavaScript only for progressive enhancement and only when
  justified under Principle II. A simple static site generator is permitted only if it serves
  Principle VI (single content file) and runs with one documented command.
- **Business name**: The full name "Brown Co Services" MUST be used in the `<title>` of the
  home page, the schema.org `name`, `og:site_name`, and the footer. "Brown Co" is an acceptable
  short form in headings and body copy. The name MUST be defined once in the site-content file
  (Principle VI).
- **Hosting**: Any static host; no server runtime, serverless functions, or database services.
- **Third-party scripts**: Analytics, tracking pixels, chat widgets, and embedded maps MUST NOT be
  added unless they preserve Lighthouse 95+ and are justified in the feature plan.
- **Content review**: All copy written or changed as part of a layout or feature change MUST be
  reviewed against Principles V and IX before publishing. The owner's own content-only edits are
  covered by the automated language scan (gate 7, automated part).

## Quality Gates and Review

Changes fall into two tiers, and the tier decides which gates must pass before publishing.

- **Content-only changes** touch only the site-content file and/or the images folder, for example
  the owner updating the phone number, a service, or a photo. The automated gates MUST pass
  before publishing, and the build pipeline MUST enforce this by refusing to deploy on failure.
  The automated gates are:
  - the build check, covering the countable parts of gates 3 and 5 and the phone-number
    consistency part of gate 4
  - HTML validation (gate 3)
  - the banned-language scan (the automated part of gate 7)
- **Layout, template, style, script, or feature changes** (any other file) MUST go through a pull
  request. All gates below MUST pass and be recorded in the pull request before it is merged to
  the branch that publishes.

Gates:

1. Lighthouse mobile: Performance ≥ 95 and Accessibility ≥ 95 on every changed page.
2. Phone number visible without scrolling and tappable as `tel:` at 320px, 375px, 768px, and
   desktop widths.
3. HTML validates; exactly one `<h1>` per page; title, meta description, and Open Graph tags present.
4. JSON-LD passes a schema.org validator and matches the single-source phone number.
5. Every image has `alt`, explicit dimensions, and optimized format; below-fold images are lazy.
6. Contrast checks meet WCAG AA.
7. Content scan finds no age/retirement/succession language, no copied text, and no trademarked
   artwork.
8. Terraces and the family-heritage message are above the fold on the home page.

## Governance

- This constitution supersedes all other project practices. Specs, plans, and tasks MUST cite
  and comply with it; any deviation MUST be justified in the plan's complexity/justification
  section and approved by the project owner.
- **Amendments**: Proposed changes MUST be documented with rationale, reviewed by the project
  owner, and recorded with an updated version and amendment date.
- **Versioning**: Semantic versioning — MAJOR for removing or redefining a principle, MINOR for
  adding a principle/section or materially expanding guidance, PATCH for clarifications and
  wording fixes.
- **Compliance review**: Every feature plan MUST include a constitution check, and the Quality
  Gates above MUST be verified before release according to the change tier.

**Version**: 1.2.0 | **Ratified**: 2026-09-25 | **Last Amended**: 2026-09-26
