// One shared list of words and phrases the site must never use (constitution Principle IX).
// Used by src/config/derived.ts (build-time config check) and scripts/grep-banned.mjs (dist scan).

/** The four words named in the acceptance criteria (also checked by the CI grep). */
export const ACCEPTANCE_WORDS = ['retire', 'retirement', 'age', 'succession'];

/** Close relatives of the acceptance words. */
export const EXTRA_WORDS = ['retired', 'retiring', 'aging', 'successor'];

/** Transition phrases that frame the family history as a handoff. */
export const PHRASES = [
  'stepping down',
  'step down',
  'hand over',
  'handing over',
  'take over',
  'taking over',
  'passing the torch',
];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');

/** Whole-word, case-insensitive: "drainage" and "Page County" do not match "age". */
export const bannedRegex = new RegExp(
  `\\b(${[...ACCEPTANCE_WORDS, ...EXTRA_WORDS, ...PHRASES].map(escape).join('|')})\\b`,
  'i',
);

/** Returns the first banned word/phrase found in text, or null. */
export function findBanned(text) {
  const m = bannedRegex.exec(text);
  return m ? m[1] : null;
}
