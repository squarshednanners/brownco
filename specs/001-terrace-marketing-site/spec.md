# Feature Specification: Terrace Contractor Marketing Site

**Feature Branch**: `001-terrace-marketing-site`

**Created**: 2026-09-25

**Status**: Draft

**Input**: User description: "Build a single-page marketing website for Brown Co Services, a farm
terrace contractor. Terraces are the primary service, with drainage tile, waterways, ponds, and dirt
work as secondary services. The business is family-owned for two generations. The only call to
action is a phone call. The brief defines nine page sections (sticky header, hero, trust strip,
featured terraces, 'We also do' grid, How we work, About, Service area, Footer), an original SVG logo
set, a palette, typography, tone, out-of-scope items, and acceptance criteria." (The full brief was
given in the `/speckit-specify` request; its section copy, palette, and acceptance criteria are
captured below.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Farmer confirms "they build terraces" and calls (Priority: P1)

A farmer standing in a field on a phone searches for a terrace contractor, lands on the site,
sees right away that this company builds terraces and has been at it for two generations,
and taps the phone number to call.

**Why this priority**: A phone call is the only way the site makes money. Everything else
supports this one moment.

**Independent Test**: Load the page on a 360px-wide phone. Without scrolling, confirm the
terrace headline, the two-generation message, and a tap-to-call phone button are visible.
Tap the button and confirm the phone's dialer opens with the correct number.

**Acceptance Scenarios**:

1. **Given** a visitor on a 360px-wide phone, **When** the page first loads, **Then** the
   headline mentioning terraces, the subhead mentioning two generations, and a phone button are
   all visible without scrolling.
2. **Given** a visitor on any device, **When** they tap any phone number on the page, **Then**
   their device starts a call (or offers to) to the business number.
3. **Given** a visitor has scrolled to any section, **When** they want to call, **Then** a phone
   button is visible in the sticky header without scrolling back up.

---

### User Story 2 - Farmer with a specific terrace problem sees it addressed (Priority: P1)

A farmer with a blown-out terrace, an NRCS/EQIP deadline, or newly bought or rented ground with
failing terraces reads the featured terraces section. They recognize their situation, see the
specific kinds of terrace work offered, and call.

**Why this priority**: Naming the reasons people call gives them confidence that this is the right
contractor. Terraces are the headline service under Constitution Principle VIII.

**Independent Test**: Read the featured terraces section. Confirm it names all three situations,
lists all five service lines, gets more space than any other service, and ends with a way to call.

**Acceptance Scenarios**:

1. **Given** a visitor reaches the terraces section, **When** they read it, **Then** they find copy
   about (a) a terrace that blew out after heavy rain, (b) an NRCS/EQIP contract with a completion
   deadline, and (c) new or rented ground with old terraces that no longer work.
2. **Given** a visitor reads the terraces section, **When** they look at the list of services,
   **Then** all five lines appear: new terrace systems, rebuilds and repair, tile-outlet terraces,
   GPS survey/layout/staking to NRCS specifications, and channel cleanout/re-grading.

---

### User Story 3 - Landowner checks that the company is local and trustworthy (Priority: P2)

A landowner who has never heard of the company wants to know whether it serves their county,
how long it has been in business, and who runs it before they call.

**Why this priority**: Trust and locality are the questions a visitor asks next, once they know
the company builds terraces.

**Independent Test**: Confirm that the trust strip, About, Service area, and footer sections show
the years in business, the family story, the list of counties and towns served, and a
physical address. (Business hours are not shown; the owner removed them as irrelevant.)

**Acceptance Scenarios**:

1. **Given** a visitor reads the trust strip, **When** it renders, **Then** it shows 3–5 short
   facts, including "Two generations, since 1970" and the service area (within 100 miles of
   Henderson, Iowa).
2. **Given** a visitor reads About, **When** it renders, **Then** it tells the two-generation story
   in "we" voice and frames it as experience and continuity.
3. **Given** a visitor looks for their county, **When** they reach Service area, **Then** a list of
   counties and towns is shown.

---

### User Story 4 - Farmer finds a secondary service (Priority: P2)

A farmer who needs tile, a waterway, a pond, or dirt work finds it in the "We also do" grid and
calls.

**Why this priority**: Secondary services bring in real work. They sit below terraces in
importance, per Constitution Principle VIII.

**Independent Test**: Confirm the grid shows all seven services, each with an icon, a name, and one
plain sentence.

**Acceptance Scenarios**:

1. **Given** a visitor reaches "We also do", **When** it renders, **Then** it shows seven items:
   drainage tile; grassed waterways; ponds and watering holes; ditch cleaning and surface
   drainage; land clearing, tree removal, and fence-row cleanup; dirt work, grading, and site prep;
   erosion control structures, drop boxes, and culverts.

---

### User Story 5 - Visitor understands what happens after the call (Priority: P3)

A cautious visitor wants to know what happens after they call before they commit.

**Why this priority**: Lowers the barrier to calling but isn't needed for the core conversion.

**Independent Test**: Confirm the How we work section shows four steps in order.

**Acceptance Scenarios**:

1. **Given** a visitor reaches How we work, **When** it renders, **Then** it shows four steps in
   this order: Call us; we walk the field and pull a survey; we stake the layout; we build it and
   hand you the as-built map for your NRCS paperwork.

---

### User Story 6 - Owner updates a business detail without a developer (Priority: P2)

The owner changes the phone number, adds a county, or swaps a placeholder photo for a real one,
without any coding knowledge.

**Why this priority**: Required by Constitution Principle VI. Nearly every value is a placeholder
at launch, so the owner will need to make these edits right away.

**Independent Test**: Following the plain-language guide, a non-technical person changes the phone
number in one file. Every phone link, the visible number, and the business listing data all update.

**Acceptance Scenarios**:

1. **Given** the owner edits the phone number in the single business config file, **When** the site is
   republished, **Then** every phone instance and the structured business data show the new number.
2. **Given** the owner replaces a placeholder photo following the guide, **When** the site is
   republished, **Then** the new photo appears with its alt text.

---

### Edge Cases

- **Very narrow screens (320px)**: The phone button stays visible in the header. The logo shrinks
  or switches to the square icon instead of pushing the button off-screen.
- **Tapping on desktop**: `tel:` links still work (they open a calling app or show the choice
  dialog). The number is shown as readable text so desktop visitors can dial it by hand.
- **JavaScript disabled or failed**: All content, anchor navigation, and phone links still work.
  On mobile, the Menu control jumps to the full navigation in the footer instead of opening in
  place.
- **Slow rural connection**: The headline, subhead, and phone button render before the hero photo
  finishes loading. The layout doesn't jump when the photo arrives.
- **Placeholder values not yet filled in**: Every unconfirmed value or claim is marked with a
  visible-to-editor TODO comment. The guide lists every TODO to resolve before launch.
- **Banned-word scan false positives**: Words that merely contain "age" (drainage, acreage, page,
  manage) are allowed. The ban applies to whole words only (see Assumptions).
- **Optional third-generation line**: If this line is not confirmed, it is left out. It must
  never be worded as a handover (Constitution Principle IX).
- **Long county list**: The Service area section stays readable and doesn't push the footer phone
  number far down on mobile. It wraps into columns or an inline list.

## Requirements *(mandatory)*

### Functional Requirements

**Conversion and contact**

- **FR-001**: The site MUST be a single page. Its only call to action is calling the business phone
  number. It MUST NOT include forms, email capture, chat widgets, or user accounts.
- **FR-002**: The phone number MUST appear at least four times: header, hero, the end of the
  featured terraces section, and footer. Every instance MUST be a working tap-to-call link and
  show the number as readable text.
- **FR-003**: A phone button MUST be visible without scrolling on page load, and during scroll, at
  every viewport width from 320px to 1440px+.
- **FR-004**: Phone/call-to-action buttons MUST be the only elements that use the harvest-gold
  accent color.

**Page sections (in order)**

- **FR-005 Sticky header**: Logo on the left and a prominent phone button on the right. Anchor
  navigation links to each section. On mobile the nav collapses into a toggle, but the phone button
  stays visible. The nav MUST work without JavaScript.
- **FR-006 Hero**: A full-width photo of freshly built terraces curving across a hillside. At
  launch this is a placeholder marked with a TODO for the owner's real photo. It also has the H1
  "Terraces that hold your soil for the next generation.", the subhead "Two generations of terrace
  builders, working within 100 miles of Henderson, Iowa.", and a large "Call [PHONE]" button. The
  brief's "serving [SERVICE AREA]" is reworded because "serving within 100 miles" reads awkwardly.
  The H1, subhead, and button MUST all be visible without scrolling at 320px, 360px, 768px, and
  1440px.
- **FR-007 Trust strip**: 3–5 short facts from this set:
  - "Two generations, since 1970"
  - "50+ years building terraces"
  - "GPS-guided layout"
  - "Built to NRCS specifications"
  - "Working within 100 miles of Henderson, Iowa" (the service-area fact)

  Each fact the owner has not confirmed MUST carry a TODO comment. Each fact, with its values
  filled in, is at most 48 characters.
- **FR-008 Featured terraces**: A two-column block on wider screens that stacks on mobile. It gets
  more space than any other service section. Its copy covers the three calling situations (blown-out
  terrace after heavy rain, NRCS/EQIP deadline, new or rented ground with failed terraces) and lists
  the five service lines from User Story 2. It MUST contain the word "terrace" or "terraces" in its
  heading and body, and end with a phone button.
- **FR-009 We also do**: A grid of the seven secondary services. Each item has an original icon, a
  name, and one plain sentence. It reflows from one column on small phones to several columns on
  wider screens.
- **FR-010 How we work**: Four numbered steps in the order given in User Story 5.
- **FR-011 About**: A two-column block with a photo placeholder, carrying a TODO for a family
  photo with a dozer or an old-versus-current equipment photo. The copy is first-person plural and
  covers: family-owned for two generations since [YEAR]; [OWNER NAME] grew up on the equipment,
  started running a dozer as a kid, and has built terraces his whole working life ([X]+ years);
  many terraces maintained today were built by [FOUNDER NAME] decades ago and we still stand behind
  them; and "we farm in this area too, so we build like it's our own ground." That last sentence
  is **shown only once the owner confirms it**. Until then it is hidden and a TODO comment is left
  in its place. The optional line "Today [OWNER NAME] works alongside [CREW MEMBER NAME], the third
  generation on the crew." MUST be off by default and turned on only through the business config
  file.
- **FR-012 Service area**: A short list of counties and towns, read from the business config file.
- **FR-013 Footer**: Logo, phone number (tap-to-call), physical address, "Licensed &
  insured", and a copyright line with the current year and the business name. "Licensed & insured"
  is **shown only once the owner confirms it**. Until then it is hidden and a TODO comment is left
  in its place.

**Content and tone**

- **FR-014**: All copy MUST be original. It MUST be direct, plain-spoken, and confident, with short
  sentences and no marketing buzzwords, written "like a contractor talking to a neighbor over a truck
  tailgate".
- **FR-015**: The site MUST NOT contain the whole words "retire", "retirement", "age", or
  "succession", or any similar transition language (stepping down, handing over, taking over). This
  applies to copy, alt text, metadata, structured data, and image file names.
- **FR-016**: Family history MUST be framed as depth of experience and continuity of service.

**Brand and visual identity**

- **FR-017 Logo set** (revised 2026-09-26: the owner supplied the final logos as PNG artwork and
  chose to use them as-is instead of SVG): the owner's design is "BROWN CO" in a heavy
  slab-serif, "SERVICES" between rust rules, and green terrace swooshes beneath. It is delivered
  in `/public/logo/` as:
  - *Full logo* (`brown-co-logo.png`): name, SERVICES line, and swooshes.
  - *Wordmark only* (`brown-co-wordmark.png`): the name and SERVICES line (cropped from the full
    logo).
  - *Compact logo* (`brown-co-compact.png`): the owner's alternate "BROWN CO" + swooshes mark, used
    in the header on small screens.
  - *Square icon* (`brown-co-icon.png`): the compact mark centered on cream.
  - Logos are served as WebP with the PNG as fallback, always on a cream background.
  - The artwork MUST NOT include any manufacturer logo, wordmark, model marking, or decal
    (constitution v1.2.0 Principle V).
- **FR-018**: A favicon set (browser tab icon, home-screen icon, and social share image) MUST be
  generated from the square icon. The social share image is generated from the full logo.
- **FR-019 Palette**: Deep soil brown #3B2A1A (primary), field green #3F6B3A (secondary), harvest
  gold #D9A441 (CTA only), warm cream #F5F0E6 (background), charcoal #1F1F1F (text), rust orange
  #B5541C (hover/secondary accent). Every text/background pairing MUST meet WCAG AA contrast.
- **FR-020 Typography**: A heavy, condensed display face with an industrial signage feel for
  headlines, and a highly legible sans-serif for body copy. Both need fallback fonts so text is
  readable before the web fonts load.

**Accessibility and SEO**

- **FR-021**: Semantic page structure with exactly one H1, logical heading order, alt text on every
  image (empty alt for decorative icons), keyboard-operable navigation, and visible focus states.
- **FR-022**: A unique page title and meta description that name the business, terraces, and the
  service area. Open Graph tags (title, description, image, URL, type, site name).
- **FR-023**: LocalBusiness (or a more specific subtype) structured data. It MUST include name,
  telephone, address, service area, and URL (no opening hours), all drawn from the same business config file as
  the visible text.

**Maintainability and deployment**

- **FR-024**: All company-specific values MUST live in one clearly named business config file. These
  are: business name, phone, address, town/state, service area, list of counties and towns, year
  founded, years of experience, owner name, founder name, optional third-generation line, and the
  confirmed/unconfirmed status of each claim. Each value MUST be defined once.
- **FR-025**: Photos MUST be replaceable by swapping a file in one clearly named images folder,
  following a plain-language guide.
- **FR-026**: A plain-language guide MUST explain how to change the phone number, edit a service,
  replace a photo, and resolve the launch TODOs.
- **FR-027**: The published output MUST be a folder of static files that deploys to Netlify,
  Cloudflare Pages, or GitHub Pages as-is, with no server runtime.
- **FR-028**: Analytics MUST NOT be included. A placeholder comment marks where analytics could be
  added later.

### Key Entities

- **Business profile**: The single source of truth for company facts. It holds the name, phone,
  address, town/state, service area description, list of counties and towns, year founded, years
  of experience, owner and founder names, the optional third-generation line (on/off), and
  licensed/insured status.
- **Service**: A name, one-sentence description, and icon. Terraces are one featured service with
  extended copy and five sub-lines; the seven secondary services use the short form.
- **Trust fact**: A short label plus a confirmed/unconfirmed flag (unconfirmed facts carry a TODO).
- **Photo slot**: An image file, alt text, and a placeholder/TODO note (hero, About).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a 360px phone, a first-time visitor can find and tap the phone number within 5
  seconds of the page loading, without scrolling.
- **SC-002**: 100% of phone number instances (at least 4) start a call to the correct number when
  tapped.
- **SC-003**: The terrace headline and two-generation subhead are fully visible without scrolling at
  360px, 768px, and 1440px widths.
- **SC-004**: The page shows no horizontal scrolling, overlapping, or clipped content at 320px,
  360px, 768px, and 1440px widths.
- **SC-005**: The page scores 95 or higher in automated mobile audits for Performance,
  Accessibility, and SEO.
- **SC-006**: On a simulated slow mobile connection, the headline and phone button are readable
  within 2.5 seconds.
- **SC-007**: A person with no coding background can change the phone number site-wide in under 5
  minutes by editing one file, following the guide.
- **SC-008**: A whole-word scan of the published output finds zero occurrences of "retire",
  "retirement", "age", or "succession".
- **SC-009**: 100% of images have alt text, and 100% of text/background color pairs meet WCAG AA
  contrast.
- **SC-010**: The published folder deploys successfully to at least one of Netlify, Cloudflare
  Pages, or GitHub Pages without any build step on the host.

## Assumptions

- **Business name** is "Brown Co Services" (confirmed). "Brown Co" may be used as a short form in
  headings and body copy.
- **Location** is Henderson, Iowa (Mills County, southwest Iowa), as confirmed by the owner. The
  service area is **within 100 miles of Henderson, Iowa** (confirmed by the owner).
- **Year founded** is about 1970 (owner's estimate). The site shows "since 1970" and "50+ years",
  with a TODO to confirm the exact year. "50+" stays accurate within a few years either way.
- **Counties** (confirmed by the owner): Mills, Pottawattamie, Montgomery, Fremont, Page, Cass,
  Harrison, Taylor. These are presented as the core counties "including" the wider 100-mile radius.
  The radius also reaches into Nebraska and Missouri, and more counties or towns can be added in the
  business config file later.
- All other bracketed values (phone, owner name, founder name, owner's personal years of experience,
  address) are unknown at build time. They launch as clearly marked placeholders in the
  business config file, each with a TODO, and are not treated as blockers.
- **Unconfirmed claims** are handled in one of two ways until the owner confirms them:
  - Shown with a TODO comment beside them: "GPS-guided layout", "Built to NRCS specifications",
    EQIP eligibility, "since 1970", "[X]+ years". These are central to the brief's layout.
  - Hidden entirely, with a TODO comment in their place: "Licensed & insured" and "We farm in this
    area too". An unverified legal or personal claim is riskier than leaving it out.
- **Business config file**: the one file the owner edits to change business facts, copy,
  services, and photo references. It is the "single site-content file" named in constitution
  Principle VI.
- **Banned words** are matched as whole words, case-insensitive. Substrings inside legitimate words
  such as "drainage", "acreage", "page", or "manage" do not violate FR-015. The word "generation"
  and phrases like "next generation" are allowed because they describe continuity.
- **Optional third-generation line** is excluded by default. If turned on, it is worded as the
  family working together (continuity), never as a handover.
- **Owner pronouns** in the About copy follow the owner's brief ("his dad", "his working life") and
  should be confirmed with the owner.
- **Hero and About photos** start as original placeholder images (for example, a stylized
  illustration of terraces on a hillside), not stock photos of other companies' work.
- **Icons** for the "We also do" grid are original, simple line or solid icons in the brand palette.
- **Fonts** may be self-hosted or loaded from a font service, as long as the performance targets are
  met and the phone number is never hidden while fonts load.
- **Section order** follows the brief. Anchor navigation covers at least Terraces, Services, How we
  work, About, and Service area.
- **Out of scope**: forms, blog, photo gallery (possible later), careers page, extra pages, CMS,
  live analytics, and online booking.
