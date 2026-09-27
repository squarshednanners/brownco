import type { BusinessConfig } from './derived'; // (leave this line alone)

// ============================================================
//  BROWN CO SERVICES — WEBSITE DETAILS
//  This is the only file you need to edit.
//  Change the text between the 'single quotes'. Keep the quotes and the comma at the end.
//  Lines starting with // are notes to you; the website ignores them.
//  Words in {curly braces} are filled in automatically — for example {phone} becomes your number.
// ============================================================

export const business = {
  // ---- Company ----
  name: 'Brown Co Services',
  shortName: 'Brown Co',
  foundedYear: 1968,
  foundedConfirmed: true, // TODO: confirm the exact founding year, then change to true
  licensedInsured: false, // TODO: change to true to show "Licensed & insured" in the footer
  websiteUrl: 'https://browncoservices.com', // TODO: your real web address (used for search listings, sitemap, robots.txt)

  // ---- Phone & address ----
  contact: {
    phone: '(712) 621-2513', // TODO: your real number. Change it HERE ONLY — it updates everywhere.
    street: '702 Maple St.', // TODO: your real street address
    city: 'Henderson',
    state: 'IA',
    stateName: 'Iowa',
    zip: '51541', // TODO: confirm ZIP code
  },

  // ---- Where we work ----
  serviceArea: {
    centerCity: 'Henderson, Iowa',
    radiusMiles: 100,
    counties: ['Mills', 'Pottawattamie', 'Montgomery', 'Fremont', 'Page', 'Cass', 'Harrison', 'Taylor'],
    towns: [], // optional, e.g. ['Red Oak', 'Glenwood']
    centerGeo: { lat: 40.99, lng: -95.45 }, // TODO: verify map coordinates for Henderson
  },

  // ---- Family ----
  family: {
    ownerName: 'Steve Brown', // TODO
    ownerPronoun: 'he', // TODO: 'he', 'she', or 'they'
    founderName: 'Bud Brown', // TODO
    founderRelation: 'dad', // TODO
    ownerYearsLabel: '40+', // TODO: how many years has the owner built terraces?
    weFarmHere: false, // TODO: change to true if the sentence below is accurate
    weFarmHereText: "We farm in this area too, so we build like it's our own ground.",
    showCrewFamilyMember: false, // optional third-generation line; leave false unless true
    crewFamilyMemberName: '',
    crewFamilyMemberText: 'Today {ownerName} works alongside {crewFamilyMemberName}, the third generation on the crew.',
    aboutParagraphs: [
      'Brown Co Services has been family-owned and operated for two generations, since {foundedYear}. Terraces have always been the heart of the work.',
      '{ownerName} grew up on the equipment. {ownerName} started running a dozer for {pron} {founderRelation} as a kid and has built terraces {pron} whole working life, {ownerYearsLabel} years of it.',
      'A lot of the terraces we maintain today were built by {founderName} decades ago. We still stand behind every one of them.',
    ],
  },

  // ---- Top of the page ----
  hero: {
    headline: 'Terraces that hold your soil for the next generation.',
    subhead: 'Two generations of terrace builders, working {area}.',
    callLabel: 'Call {phone}',
  },

  // Short facts in the green strip under the top photo (3 to 5, max 48 characters each)
  trustFacts: [
    { text: 'Two generations, since {foundedYear}', confirmed: false },
    { text: '{yearsInBusiness} years building terraces', confirmed: false },
    { text: 'GPS-guided layout', confirmed: false },
    { text: 'Built to NRCS specifications', confirmed: false },
    { text: 'Working {area}', confirmed: true },
  ],

  // ---- Terraces (main service) ----
  terraces: {
    heading: 'Terrace construction and repair',
    intro: "Terraces are most of what we do. If your ground is washing, we'll fix it, whether that means a whole new system or one bad spot.",
    nrcsConfirmed: false, // TODO: confirm NRCS spec work and EQIP eligibility, then change to true
    situations: [
      {
        title: 'A terrace blew out',
        text: "One hard rain and the water found the low spot. Now there's a gully running downhill, and every storm makes it worse. Call before the next one. We'll rebuild the break and find out why it went.",
      },
      {
        title: 'An NRCS or EQIP deadline',
        text: "You signed the contract and the clock is running. We build to NRCS specifications and know what the paperwork needs. We'll get it staked, built, and mapped on time.",
      },
      {
        title: 'New ground, old terraces',
        text: "You just bought or rented a farm, and the terraces are worn down, silted in, or laid out for equipment nobody runs anymore. We'll walk it with you and tell you straight what to keep, fix, or rebuild.",
      },
    ],
    offerings: [
      { title: 'New terrace systems', text: 'Broad-base, narrow-base, and grass-backed. Parallel and tile-outlet layouts.' },
      { title: 'Rebuilds and repair', text: 'Blown-out, silted-in, or overtopped terraces put back to spec.' },
      { title: 'Tile-outlet terraces', text: 'Underground outlets carry the water away, so you can farm right through them.' },
      { title: 'GPS survey, layout, and staking', text: 'Built to NRCS specifications and eligible for EQIP cost-share where it applies.' },
      { title: 'Channel cleanout and re-grading', text: 'We clean out silted channels and re-grade them so they carry water again.' },
    ],
  },

  // ---- "We also do" ----
  // To add a service, copy one line and change it. To remove one, delete its line.
  // icon must be one of: tile, waterway, pond, ditch, clearing, grading, culvert
  services: [
    { name: 'Drainage tile', description: 'New tile and repairs to the tile you have, so wet spots dry out and you get in the field sooner.', icon: 'tile' },
    { name: 'Grassed waterways', description: 'Shaped and seeded waterways that carry water off the field without cutting a ditch.', icon: 'waterway' },
    { name: 'Ponds and watering holes', description: 'Livestock ponds and watering holes, dug and built to hold water.', icon: 'pond' },
    { name: 'Ditch cleaning and surface drainage', description: 'We clean out ditches and grade surface drains so water goes where it should.', icon: 'ditch' },
    { name: 'Land clearing and fence rows', description: 'Tree removal, brush clearing, and fence-row cleanup to open up more ground.', icon: 'clearing' },
    { name: 'Dirt work and site prep', description: 'Grading and site prep for bins, buildings, and lots.', icon: 'grading' },
    { name: 'Erosion control and culverts', description: 'Drop boxes, culverts, and other structures that stop washouts where they start.', icon: 'culvert' },
  ],

  // ---- How we work (exactly 4 steps) ----
  processSteps: [
    { title: 'Call us', text: "Tell us what's going on. We'll set a time to come out." },
    { title: 'We walk the field', text: 'We look at the ground with you and pull a survey.' },
    { title: 'We stake the layout', text: 'We mark where every terrace goes, so you can see it before we build.' },
    { title: 'We build it', text: 'We build it right and give you the as-built map for your NRCS paperwork.' },
  ],

  // ---- Photos (files go in public/images/) ----
  photos: {
    hero: {
      file: 'placeholder-hero.jpg', // TODO: replace with your photo of new terraces on a hillside
      alt: 'Freshly built terraces curving across a green hillside',
      source: 'Original illustration',
      isPlaceholder: true,
    },
    about: {
      file: 'construction-scene.png',
      alt: 'Illustration of a bulldozer finishing a new farm pond while a crew and an excavator work the field behind it',
      source: 'Created in-house for Brown Co Services (AI-assisted illustration)',
      isPlaceholder: false,
    },
  },

  // ---- Search engines ----
  seo: {
    title: 'Terrace Construction & Repair | {name} | Henderson, IA',
    description: 'Terrace building, repair, and dirt work {area}. Two generations of experience. Call today.',
  },
} satisfies BusinessConfig; // (leave this line alone)
