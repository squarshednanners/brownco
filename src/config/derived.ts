// ============================================================
//  Derived values + build-time checks for business.ts.
//  The owner never needs to edit this file.
// ============================================================
import { business } from './business';
import { findBanned } from '../../scripts/banned-words.mjs';

// ---------- Types (business.ts is checked against BusinessConfig) ----------

export type IconName = 'tile' | 'waterway' | 'pond' | 'ditch' | 'clearing' | 'grading' | 'culvert';
export type Pronoun = 'he' | 'she' | 'they';

export interface PhotoSlot {
  file: string;
  alt: string;
  source: string;
  isPlaceholder: boolean;
}

export interface TitledText {
  title: string;
  text: string;
}

export interface BusinessConfig {
  name: string;
  shortName: string;
  foundedYear: number;
  foundedConfirmed: boolean;
  licensedInsured: boolean;
  websiteUrl: string;
  contact: {
    phone: string;
    street: string;
    city: string;
    state: string;
    stateName: string;
    zip: string;
  };
  serviceArea: {
    centerCity: string;
    radiusMiles: number;
    counties: string[];
    towns: string[];
    centerGeo: { lat: number; lng: number };
  };
  family: {
    ownerName: string;
    ownerPronoun: Pronoun;
    founderName: string;
    founderRelation: string;
    ownerYearsLabel: string;
    weFarmHere: boolean;
    weFarmHereText: string;
    showCrewFamilyMember: boolean;
    crewFamilyMemberName: string;
    crewFamilyMemberText: string;
    aboutParagraphs: string[];
  };
  hero: { headline: string; subhead: string; callLabel: string };
  trustFacts: { text: string; confirmed: boolean }[];
  terraces: {
    heading: string;
    intro: string;
    nrcsConfirmed: boolean;
    situations: TitledText[];
    offerings: TitledText[];
  };
  services: { name: string; description: string; icon: IconName }[];
  processSteps: { title: string; text?: string }[];
  photos: { hero: PhotoSlot; about: PhotoSlot };
  seo: { title: string; description: string };
}

// ---------- Phone ----------

export const phoneDigits = business.contact.phone.replace(/\D/g, '');
export const phoneE164 = `+1${phoneDigits}`;
export const phoneHref = `tel:${phoneE164}`;
export const phoneDisplay = `(${phoneDigits.slice(0, 3)}) ${phoneDigits.slice(3, 6)}-${phoneDigits.slice(6)}`;
/** Same number with a non-breaking space and hyphen, so it never wraps inside a link. */
export const phoneDisplayNoWrap = phoneDisplay.replace(' ', ' ').replace('-', '‑');

// ---------- Years, area, dates ----------

export const buildYear = new Date().getFullYear();
export const yearsInBusinessLabel = `${Math.floor((buildYear - business.foundedYear) / 10) * 10}+`;
export const areaSummary = `within ${business.serviceArea.radiusMiles} miles of ${business.serviceArea.centerCity}`;
export const geoRadiusMeters = Math.round(business.serviceArea.radiusMiles * 1609.34);
export const countyLabels = business.serviceArea.counties.map((c) =>
  /county$/i.test(c) ? c : `${c} County`,
);
export const copyrightYear = buildYear;

const PRONOUN_POSSESSIVE: Record<Pronoun, string> = { he: 'his', she: 'her', they: 'their' };
export const pron = PRONOUN_POSSESSIVE[business.family.ownerPronoun];

// ---------- Tokens ----------

const TOKENS: Record<string, string> = {
  phone: phoneDisplay,
  area: areaSummary,
  foundedYear: String(business.foundedYear),
  yearsInBusiness: yearsInBusinessLabel,
  name: business.name,
  shortName: business.shortName,
  ownerName: business.family.ownerName,
  founderName: business.family.founderName,
  founderRelation: business.family.founderRelation,
  ownerYearsLabel: business.family.ownerYearsLabel,
  pron,
  crewFamilyMemberName: business.family.crewFamilyMemberName,
};

/** Replaces {tokens} in a business.ts string. Unknown tokens stop the build. */
export function fill(text: string): string {
  return text.replace(/\{(\w+)\}/g, (_m, key: string) => {
    if (!(key in TOKENS)) {
      throw new Error(
        `business.ts: unknown token {${key}} in "${text}". Valid tokens: ${Object.keys(TOKENS)
          .map((k) => `{${k}}`)
          .join(', ')}`,
      );
    }
    return TOKENS[key];
  });
}

// ---------- Section navigation (header + footer) ----------

export const navLinks = [
  { href: '#terraces', label: 'Terraces' },
  { href: '#services', label: 'Services' },
  { href: '#how-we-work', label: 'How we work' },
  { href: '#about', label: 'About' },
  { href: '#service-area', label: 'Service area' },
];

// ---------- URLs ----------

const BASE: string = (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/';

/** Prefixes a public-folder path with the site base (works under a GitHub Pages subpath). */
export function asset(path: string): string {
  return `${BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/** The one resolved site root URL (with trailing slash), used by canonical, OG, and JSON-LD. */
export function siteRoot(site: URL | undefined): URL {
  return new URL(BASE, site ?? business.websiteUrl);
}

// ---------- Build-time validation (runs once on import) ----------

function fail(path: string, message: string): never {
  throw new Error(`business.ts → ${path}: ${message}`);
}

function walkStrings(value: unknown, path: string, visit: (s: string, p: string) => void) {
  if (typeof value === 'string') visit(value, path);
  else if (Array.isArray(value)) value.forEach((v, i) => walkStrings(v, `${path}[${i}]`, visit));
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) walkStrings(v, path ? `${path}.${k}` : k, visit);
}

function checkLength(path: string, text: string, min: number, max: number) {
  if (text.length < min || text.length > max) {
    fail(path, `"${text}" is ${text.length} characters; it needs to be ${min}–${max}.`);
  }
}

function validate(b: BusinessConfig) {
  // V-PHONE
  if (phoneDigits.length !== 10 || /^[01]/.test(phoneDigits)) {
    fail('contact.phone', `"${b.contact.phone}" needs 10 digits, like (712) 555-0100`);
  }

  // V-BAN (whole words; "drainage" and "Page County" are fine)
  walkStrings(b, '', (s, p) => {
    const hit = findBanned(s);
    if (hit) fail(p, `"${s}" uses "${hit}". Please reword (see README: words we never use).`);
  });

  // V-TERRACE
  if (!/terrace/i.test(b.hero.headline + ' ' + b.hero.subhead)) {
    fail('hero.headline', 'the headline or subhead must mention terraces.');
  }
  if (!/terrace/i.test(b.terraces.heading)) {
    fail('terraces.heading', 'the terraces heading must contain the word "terrace".');
  }

  // V-COUNT
  if (b.trustFacts.length < 3 || b.trustFacts.length > 5)
    fail('trustFacts', `needs 3 to 5 facts (found ${b.trustFacts.length}).`);
  if (b.terraces.situations.length !== 3)
    fail('terraces.situations', `needs exactly 3 situations (found ${b.terraces.situations.length}).`);
  if (b.terraces.offerings.length < 5)
    fail('terraces.offerings', `needs at least 5 offerings (found ${b.terraces.offerings.length}).`);
  if (b.processSteps.length !== 4)
    fail('processSteps', `needs exactly 4 steps (found ${b.processSteps.length}).`);
  if (b.services.length < 1) fail('services', 'needs at least one service.');

  // V-URL
  if (!/^https:\/\/[^\s/]+\.[^\s/]+/.test(b.websiteUrl))
    fail('websiteUrl', `"${b.websiteUrl}" must be a full https:// address.`);

  // V-LEN (token-bearing strings are measured after fill())
  checkLength('hero.headline', b.hero.headline, 10, 70);
  checkLength('shortName', b.shortName, 2, 20);
  b.trustFacts.forEach((f, i) => checkLength(`trustFacts[${i}].text`, fill(f.text), 3, 48));
  b.services.forEach((s, i) => {
    checkLength(`services[${i}].name`, s.name, 2, 60);
    checkLength(`services[${i}].description`, s.description, 10, 160);
  });
  checkLength('seo.title', fill(b.seo.title), 30, 65);
  checkLength('seo.description', fill(b.seo.description), 70, 160);
  for (const key of ['hero', 'about'] as const) {
    checkLength(`photos.${key}.alt`, b.photos[key].alt, 5, 150);
    if (!b.photos[key].source.trim()) fail(`photos.${key}.source`, 'say who owns or licensed this photo.');
  }

  // Every token in every string must be known (throws with the valid list).
  walkStrings(b, '', (s) => void fill(s));
}

validate(business);

// ---------- V-TODO: remaining launch items (warning only) ----------

export function launchTodos(b: BusinessConfig = business): string[] {
  const todos: string[] = [];
  if (b.contact.phone.includes('555-01')) todos.push('contact.phone is a placeholder');
  if (b.contact.street === '123 Main St') todos.push('contact.street is a placeholder');
  if (b.websiteUrl.includes('example.com')) todos.push('websiteUrl is a placeholder');
  if (b.family.ownerName === 'Owner Name') todos.push('family.ownerName is a placeholder');
  if (b.family.founderName === 'Founder Name') todos.push('family.founderName is a placeholder');
  if (!b.foundedConfirmed) todos.push('foundedYear not confirmed');
  if (!b.licensedInsured) todos.push('licensedInsured not confirmed (line hidden)');
  if (!b.family.weFarmHere) todos.push('weFarmHere not confirmed (sentence hidden)');
  if (!b.terraces.nrcsConfirmed) todos.push('NRCS/EQIP claims not confirmed');
  b.trustFacts.forEach((f) => !f.confirmed && todos.push(`trust fact not confirmed: "${fill(f.text)}"`));
  for (const key of ['hero', 'about'] as const)
    if (b.photos[key].isPlaceholder) todos.push(`photos.${key} is a placeholder image`);
  return todos;
}

const todos = launchTodos();
if (todos.length) {
  console.warn(`\n[business.ts] ${todos.length} launch TODO(s) remain:\n  - ${todos.join('\n  - ')}\n`);
}
