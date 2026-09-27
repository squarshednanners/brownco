# Contract: `src/config/business.ts` (owner-facing config)

This is the only file the owner edits. Every component, the meta tags, and the JSON-LD import it.
Field rules are in [data-model.md](../data-model.md).

**Compatibility**: Renaming or removing a key is a breaking change. It requires updating the
README, `derived.ts`, and every component in the same change. Adding optional keys is fine.

**Style rules that keep it non-coder friendly**:
- Single quotes everywhere.
- One field per line.
- A comment above each section.
- `// TODO:` beside every unconfirmed value.
- No functions, imports, or logic, except the one `satisfies` line at the bottom.

```ts
// ============================================================
//  BROWN CO SERVICES — WEBSITE DETAILS
//  This is the only file you need to edit.
//  Change the text between the 'single quotes'. Keep the quotes and the comma at the end.
//  Lines starting with // are notes to you; the website ignores them.
// ============================================================

export const business = {
  // ---- Company ----
  name: 'Brown Co Services',
  shortName: 'Brown Co',
  foundedYear: 1970,
  foundedConfirmed: false,       // TODO: confirm exact founding year, then change to true
  licensedInsured: false,        // TODO: change to true to show "Licensed & insured"
  websiteUrl: 'https://www.example.com', // TODO: your real web address (used for search listings, sitemap, robots.txt)

  // ---- Phone & address ----
  contact: {
    phone: '(712) 555-0100',     // TODO: your real number. Change it HERE ONLY — it updates everywhere.
    street: '123 Main St',       // TODO
    city: 'Henderson',
    state: 'IA',
    stateName: 'Iowa',
    zip: '51541',                // TODO: confirm
  },

  // ---- Where we work ----
  serviceArea: {
    centerCity: 'Henderson, Iowa',
    radiusMiles: 100,
    counties: ['Mills', 'Pottawattamie', 'Montgomery', 'Fremont', 'Page', 'Cass', 'Harrison', 'Taylor'],
    towns: [],                   // optional, e.g. ['Red Oak', 'Glenwood']
    centerGeo: { lat: 40.99, lng: -95.45 }, // TODO: verify map coordinates
  },

  // ---- Family ----
  family: {
    ownerName: 'Owner Name',     // TODO
    ownerPronoun: 'he',          // TODO: 'he', 'she', or 'they'
    founderName: 'Founder Name', // TODO
    founderRelation: 'dad',      // TODO
    ownerYearsLabel: '40+',      // TODO: owner's years building terraces
    weFarmHere: false,           // TODO: true if "We farm in this area too" is accurate
    showCrewFamilyMember: false, // optional third-generation line; leave false unless true
    crewFamilyMemberName: '',
    aboutParagraphs: ['…'],      // written during implementation
  },

  // ---- Top of the page ----
  hero: {
    headline: 'Terraces that hold your soil for the next generation.',
    subhead: 'Two generations of terrace builders, working {area}.',
    callLabel: 'Call {phone}',
  },

  trustFacts: [
    { text: 'Two generations, since {foundedYear}', confirmed: false },
    { text: '{yearsInBusiness} years building terraces', confirmed: false },
    { text: 'GPS-guided layout', confirmed: false },
    { text: 'Built to NRCS specifications', confirmed: false },
    { text: 'Working {area}', confirmed: true },   // max 48 characters once filled in
  ],

  // ---- Terraces (main service) ----
  terraces: {
    heading: 'Terrace construction and repair',
    intro: '…',
    nrcsConfirmed: false,        // TODO: confirm NRCS spec work and EQIP eligibility
    situations: [
      { title: 'A terrace blew out', text: '…' },
      { title: 'An NRCS or EQIP deadline', text: '…' },
      { title: 'New ground, old terraces', text: '…' },
    ],
    offerings: [
      { title: 'New terrace systems', text: 'Broad-base, narrow-base, and grass-backed. Parallel and tile-outlet layouts.' },
      { title: 'Rebuilds and repair', text: '…' },
      { title: 'Tile-outlet terraces', text: '…' },
      { title: 'GPS survey, layout, and staking', text: '…' },
      { title: 'Channel cleanout and re-grading', text: '…' },
    ],
  },

  // ---- "We also do" ----
  // To add a service, copy one line and change it. To remove one, delete its line.
  // icon must be one of: tile, waterway, pond, ditch, clearing, grading, culvert
  services: [
    { name: 'Drainage tile', description: '…', icon: 'tile' },
    { name: 'Grassed waterways', description: '…', icon: 'waterway' },
    { name: 'Ponds and watering holes', description: '…', icon: 'pond' },
    { name: 'Ditch cleaning and surface drainage', description: '…', icon: 'ditch' },
    { name: 'Land clearing and fence rows', description: '…', icon: 'clearing' },
    { name: 'Dirt work and site prep', description: '…', icon: 'grading' },
    { name: 'Erosion control and culverts', description: '…', icon: 'culvert' },
  ],

  processSteps: [
    { title: 'Call us', text: '…' },
    { title: 'We walk the field', text: '…' },
    { title: 'We stake the layout', text: '…' },
    { title: 'We build it', text: '…and give you the as-built map for your NRCS paperwork.' },
  ],

  // ---- Photos (files go in public/images/) ----
  photos: {
    hero: {
      file: 'placeholder-hero.jpg',  // TODO: replace with your photo of new terraces on a hillside
      alt: 'Freshly built terraces curving across a green hillside',
      source: 'Original illustration',
      isPlaceholder: true,
    },
    about: {
      file: 'construction-scene.png', // owner-supplied illustration (wide banner at the top of About)
      alt: 'Illustration of a bulldozer finishing a new farm pond while a crew and an excavator work the field behind it',
      source: 'Created in-house for Brown Co Services (AI-assisted illustration)',
      isPlaceholder: false,
    },
  },

  // ---- Search engines ----
  seo: {
    title: 'Terrace Construction & Repair | Brown Co Services | Henderson, IA',
    description: 'Terrace building, repair, and dirt work within 100 miles of Henderson, Iowa. Two generations of experience. Call today.',
  },
} satisfies BusinessConfig; // (leave this line alone)
```

`'…'` marks copy that is written during implementation and then lives in this file.

The `BusinessConfig` type is imported at the top of the file from `./derived` via a single
`import type` line, which is marked "leave alone".

## Tokens

These tokens can be used in any string: `{phone}`, `{area}`, `{foundedYear}`, `{yearsInBusiness}`,
`{name}`, `{shortName}`, `{ownerName}`, `{founderName}`, `{founderRelation}`, `{ownerYearsLabel}`,
`{pron}` (his/her/their, from `ownerPronoun`), `{crewFamilyMemberName}`. `derived.ts` replaces
them. An unknown
token throws at build and lists the valid ones.

## Consumers (every place a fact appears)

| Fact | Imported by |
|------|-------------|
| `contact.phone` | `CallButton.astro` (header, hero, terraces, service area), `Footer.astro`, `JsonLd.astro` |
| `name` / `shortName` | `Base.astro` (title, `og:site_name`), `Header.astro`, `Footer.astro`, `JsonLd.astro`, `prebuild.mjs` (manifest, imported via `tsx`) |
| `websiteUrl` | `astro.config.mjs` (`site`), which feeds the canonical, `og:url`, JSON-LD, sitemap, and `src/pages/robots.txt.ts` |
| `serviceArea` | `Hero.astro` (subhead), `TrustStrip.astro`, `ServiceArea.astro`, `JsonLd.astro`, `seo.description` via tokens |
| `foundedYear` | `TrustStrip.astro`, `About.astro`, `JsonLd.astro` (`foundingDate`) |
| `contact.*` address | `Footer.astro`, `JsonLd.astro` |
| `photos.*` | `Hero.astro`, `About.astro` via `Photo.astro`, and `prebuild.mjs` (WebP) |
