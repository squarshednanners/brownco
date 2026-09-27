# Data Model: Terrace Contractor Marketing Site

**Feature**: 001-terrace-marketing-site | **Date**: 2026-09-25

There is no database. The "data" is one owner-edited file, `src/config/business.ts`, a plain
commented object. Two things check it:
- `astro check` checks the types.
- `src/config/derived.ts` runs language and count checks at build time (research R2, R11).

The exact file the owner sees is in [contracts/business-config.md](./contracts/business-config.md).
Field names below match `business.ts` (camelCase).

## Entity overview

```text
business.ts  (export const business = { … })
├── name, shortName, foundedYear, …  (BusinessProfile)    1
├── contact        (Contact)                               1
├── serviceArea    (ServiceArea)                           1
├── family         (FamilyStory)                           1
├── hero           (HeroContent)                           1
├── trustFacts     (TrustFact)                             3–5
├── terraces       (FeaturedService)                       1
├── services       (Service)                               1–12  (7 at launch)
├── processSteps   (ProcessStep)                           exactly 4
├── photos         (PhotoSlot)                             hero, about
└── seo            (SeoSettings)                           1
```

Every string passes the **language rule** (V-BAN).

## BusinessProfile (top-level fields)

| Field | Type | Required | Value / placeholder | Rules |
|-------|------|----------|---------------------|-------|
| `name` | string | ✅ | `'Brown Co Services'` | Used in the title, footer, JSON-LD, `og:site_name` |
| `shortName` | string | ✅ | `'Brown Co'` | ≤ 20 chars. Used in headings and the small-screen header |
| `foundedYear` | number | ✅ | `1970` | 1900 ≤ year ≤ current year |
| `foundedConfirmed` | boolean | ✅ | `false` | When false, a TODO comment is emitted beside "since 1970" |
| `licensedInsured` | boolean | ✅ | `false` | When false, the footer line is hidden and a TODO is emitted |
| `websiteUrl` | string (URL) | ✅ | `'https://www.example.com'` (TODO) | Absolute https URL. **The single source of the site's address.** `astro.config.mjs` uses it as `site`, which feeds the canonical, `og:url`, JSON-LD `url`, the sitemap, and the generated `robots.txt`. The `SITE_URL` env var may override it only for GitHub Pages builds before a custom domain exists |

**Derived** (`derived.ts`):
- `yearsInBusinessLabel`: `floor((buildYear − foundedYear) / 10) * 10 + '+'`, which gives `'50+'`.
- `copyrightYear`: the build year.

## Contact (`contact`)

| Field | Type | Required | Value / placeholder | Rules |
|-------|------|----------|---------------------|-------|
| `phone` | string | ✅ | `'(712) 555-0100'` (TODO) | Exactly 10 digits after stripping non-digits; must not start with 0 or 1. **The only place the number is written** |
| `street` | string | ✅ | `'123 Main St'` (TODO) | |
| `city` | string | ✅ | `'Henderson'` | Confirmed |
| `state` | string | ✅ | `'IA'` | 2-letter code |
| `stateName` | string | ✅ | `'Iowa'` | |
| `zip` | string | ✅ | `'51541'` (TODO confirm) | 5 digits |

**Derived**: `phoneE164` (`'+17125550100'`), `phoneHref` (`'tel:+17125550100'`), and
`phoneDisplay` (`'(712) 555-0100'`).

## ServiceArea (`serviceArea`)

| Field | Type | Required | Value | Rules |
|-------|------|----------|-------|-------|
| `centerCity` | string | ✅ | `'Henderson, Iowa'` | Confirmed |
| `radiusMiles` | number | ✅ | `100` | Confirmed. 1–500 |
| `counties` | string[] | ✅ | Mills, Pottawattamie, Montgomery, Fremont, Page, Cass, Harrison, Taylor | Confirmed. ≥ 1. Displayed with a " County" suffix |
| `towns` | string[] | ❌ | `[]` | Optional |
| `centerGeo` | `{ lat, lng }` | ✅ | `{ lat: 40.99, lng: -95.45 }` (TODO verify) | Used for JSON-LD `geo` and `GeoCircle` |

**Derived**: `areaSummary` = `'within 100 miles of Henderson, Iowa'`. `geoRadiusMeters` =
`160934`.

## FamilyStory (`family`)

| Field | Type | Required | Placeholder | Rules |
|-------|------|----------|-------------|-------|
| `ownerName` | string | ✅ | `'Owner Name'` (TODO) | |
| `ownerPronoun` | `'he'`/`'she'`/`'they'` | ✅ | `'he'` (TODO confirm) | Drives his/her/their in the About copy |
| `founderName` | string | ✅ | `'Founder Name'` (TODO) | |
| `founderRelation` | string | ✅ | `'dad'` (TODO confirm) | |
| `ownerYearsLabel` | string | ✅ | `'40+'` (TODO) | Owner's personal years building terraces |
| `weFarmHere` | boolean | ✅ | `false` (TODO) | When true, shows "We farm in this area too…" |
| `showCrewFamilyMember` | boolean | ✅ | `false` | Optional third-generation line. Off by default |
| `crewFamilyMemberName` | string | if above true | `''` | |
| `aboutParagraphs` | string[] | ✅ | Written during implementation | First-person plural. Supports tokens (see contract) |

## HeroContent (`hero`)

| Field | Type | Default | Rules |
|-------|------|---------|-------|
| `headline` | string | `'Terraces that hold your soil for the next generation.'` | Must contain "terrace". ≤ 70 chars |
| `subhead` | string | `'Two generations of terrace builders, working {area}.'` | `{area}` → `areaSummary` ("within 100 miles of Henderson, Iowa"). Must read naturally with `areaSummary` |
| `callLabel` | string | `'Call {phone}'` | Must contain `{phone}` |

## TrustFact (`trustFacts[]`)

`{ text: string, confirmed: boolean }`. Tokens are allowed in `text`. The length limit is
**≤ 48 chars measured after tokens are filled**, and the check runs on the output of `fill()`.
Count: 3–5. When
`confirmed: false`, a `<!-- TODO: confirm with owner: … -->` comment is emitted.

Launch set:

| Text | Confirmed |
|------|-----------|
| "Two generations, since {foundedYear}" | false |
| "{yearsInBusiness} years building terraces" | false |
| "GPS-guided layout" | false |
| "Built to NRCS specifications" | false |
| "Working {area}" (fills to 43 chars) | true |

## FeaturedService (`terraces`)

| Field | Type | Rules |
|-------|------|-------|
| `heading` | string | Must contain "terrace" |
| `intro` | string | 1–2 short sentences |
| `situations` | `{ title, text }[]` | Exactly 3: blown-out terrace; NRCS/EQIP deadline; new or rented ground |
| `offerings` | `{ title, text }[]` | ≥ 5 (spec FR-008 lines) |
| `nrcsConfirmed` | boolean | False emits a TODO beside the NRCS/EQIP claims |

## Service (`services[]`)

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | ≤ 60 chars |
| `description` | string | One sentence, ≤ 160 chars |
| `icon` | `'tile'`/`'waterway'`/`'pond'`/`'ditch'`/`'clearing'`/`'grading'`/`'culvert'` | The type union is exported from `derived.ts`, so a wrong name fails `astro check` and lists the valid names |

Adding or removing a service means adding or deleting one `{ … },` line.

## ProcessStep (`processSteps[]`)

`{ title: string, text?: string }`. There are exactly 4 steps, in order: Call us → We walk the
field and pull a survey → We stake the layout → We build it and give you the as-built map for your
NRCS paperwork. Use "give you", never "hand over", which is a V-BAN phrase.

## PhotoSlot (`photos.hero`, `photos.about`)

| Field | Type | Rules |
|-------|------|-------|
| `file` | string | File name inside `public/images/`. `.jpg`, `.jpeg`, or `.png`. It must exist. Current values: `'placeholder-hero.jpg'` (placeholder) and `'construction-scene.png'` (owner-supplied). The prebuild step generates WebP variants |
| `alt` | string | 5–150 chars, required |
| `source` | string | Who owns or licensed it (Principle V). Launch value: `'Original illustration'` |
| `isPlaceholder` | boolean | True emits a TODO comment for the owner's real photo |

## SeoSettings (`seo`)

| Field | Rules |
|-------|-------|
| `title` | 30–65 chars. Default `'Terrace Construction & Repair \| Brown Co Services \| Henderson, IA'` |
| `description` | 70–160 chars. Must mention terraces and the service area |

## Validation rules

| ID | Rule | Where |
|----|------|-------|
| V-TYPE | Required fields, types, and enums (icon names, pronoun, days) | `astro check` (CI build check) |
| V-PHONE | `contact.phone` has 10 digits and a valid first digit | `derived.ts` (throws at build) |
| V-BAN | No whole-word, case-insensitive match of retire, retired, retirement, retiring, age, aging, succession, successor, or the phrases stepping down, step down, hand over, handing over, take over, taking over, passing the torch | `derived.ts` over the config. The CI grep over `dist/` covers the four acceptance-criteria words |
| V-TERRACE | "terrace" appears in the hero headline or subhead and in `terraces.heading` | `derived.ts`, re-checked in `check-build.mjs` |
| V-PHOTO | The photo file exists in `public/images/` with `alt` and `source` | `prebuild.mjs`, which imports `business.ts` directly via `tsx` (no regex parsing) |
| V-COUNT | `trustFacts` 3–5, `situations` = 3, `processSteps` = 4, `services` ≥ 1 | `derived.ts` |
| V-URL | `websiteUrl` is absolute https | `derived.ts` |
| V-LEN | The length limits in the tables above are errors. Limits on token-bearing strings (trust facts, subhead) are measured after `fill()` | `derived.ts` |
| V-TODO (warning) | Lists remaining placeholders and `confirmed: false` items in the build log | `derived.ts` |

Error format: `business.ts → contact.phone: "712-555-01" needs 10 digits, like (712) 555-0100`.

## State: placeholder → confirmed

Each confirmable value moves one way, from placeholder or unconfirmed to confirmed. The owner edits
the value and/or flips its flag to `true`, and the TODO comment disappears on the next build.
