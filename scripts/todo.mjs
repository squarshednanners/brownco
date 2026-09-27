// Prints what is still left to confirm before launch (see README "Before launch").
import { readFileSync } from 'node:fs';

const FILE = 'src/config/business.ts';
const lines = readFileSync(FILE, 'utf8').split('\n');
const found = lines
  .map((line, i) => ({ line: line.trim(), n: i + 1 }))
  .filter(({ line }) => /TODO|confirmed: false|isPlaceholder: true/.test(line));

if (!found.length) {
  console.log('Nothing left to confirm. Ready to launch.');
} else {
  console.log(`${found.length} item(s) left in ${FILE}:\n`);
  for (const { n, line } of found) console.log(`  line ${String(n).padStart(3)}: ${line}`);
}
