#!/usr/bin/env node
/**
 * Ensures every var(--token) in src/ resolves via DS dist + Udun eds-*-compat.css.
 * Exits 1 and lists gaps when tokens are missing (post eds-website sync).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const edsRoot = path.resolve(
  process.env.EDS_WEBSITE_DIR || path.join(root, '../eds-website'),
);

function walkSourceFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walkSourceFiles(full, out);
      continue;
    }
    if (full.endsWith('.css') || full.endsWith('.vue')) out.push(full);
  }
  return out;
}

const srcDir = path.join(root, 'src');
const srcFiles = walkSourceFiles(srcDir);

const used = new Set();
const re = /var\((--[a-zA-Z0-9-]+)\)/g;
for (const file of srcFiles) {
  const content = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = re.exec(content))) used.add(m[1]);
}

const defSources = [
  path.join(edsRoot, 'packages/components/dist/index.css'),
  path.join(edsRoot, 'packages/tokens/dist/css/index.css'),
  path.join(root, 'src/styles/eds-ds-compat.css'),
  path.join(root, 'src/styles/eds-scale-compat.css'),
  path.join(root, 'src/styles/eds-typography-compat.css'),
  path.join(root, 'src/styles/eds-color-compat.css'),
  path.join(root, 'src/styles/fonts.css'),
  path.join(root, 'src/styles/global.css'),
];

const defs = new Set();
for (const file of defSources) {
  if (!fs.existsSync(file)) {
    console.error(`Missing definition source: ${file}`);
    process.exit(1);
  }
  const content = fs.readFileSync(file, 'utf8');
  for (const m of content.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) defs.add(m[1]);
}

const localOnly =
  /^--(site-|invite-|showcase-|page-|home-|bubble-|reveal-|text-link-icon-mask|download-)/;
const missing = [...used].filter((v) => !defs.has(v) && !localOnly.test(v)).sort();

if (missing.length) {
  console.error('Undefined CSS variables used in src/:');
  for (const v of missing) console.error(`  ${v}`);
  process.exit(1);
}

console.log(`OK: ${used.size} variables referenced in src/ are covered by DS + compat.`);
