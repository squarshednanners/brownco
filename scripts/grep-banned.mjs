// Scans dist/ for words and phrases the site must never use (constitution Principle IX).
// Node version of the CI grep so it also works on Windows. Text files and file names only;
// binary files (images, fonts) are never scanned.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { bannedRegex } from './banned-words.mjs';

const DIST = 'dist';
const TEXT = new Set(['.html', '.css', '.js', '.svg', '.xml', '.txt', '.webmanifest', '.json']);
const hits = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (bannedRegex.test(name)) hits.push(`${path}: file name`);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (TEXT.has(extname(name).toLowerCase())) {
      readFileSync(path, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          const m = bannedRegex.exec(line);
          if (m) hits.push(`${path}:${i + 1}: "${m[1]}" … ${line.trim().slice(0, 120)}`);
        });
    }
  }
}

walk(DIST);
if (hits.length) {
  console.log(`Banned language found (${hits.length}):\n  ${hits.join('\n  ')}`);
  process.exit(1);
}
console.log('No banned words or phrases in dist/.');
