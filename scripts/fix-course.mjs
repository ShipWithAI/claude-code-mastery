#!/usr/bin/env node
// scripts/fix-course.mjs — mechanical fixes. Usage: node scripts/fix-course.mjs <fence-lang|fence-nest|replace> [files...]
import fs from 'node:fs';
import path from 'node:path';
import { fixFenceLang, fixFenceNest, applyReplacements } from './lint-course/fix.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const DOCS = 'src/content/docs';
const [cmd, ...explicit] = process.argv.slice(2);
if (!['fence-lang', 'fence-nest', 'replace'].includes(cmd)) {
  console.error('usage: fix-course.mjs <fence-lang|fence-nest|replace> [files...]');
  process.exit(2);
}

function listAll() {
  const out = [];
  for (const lang of ['en', 'vi']) {
    const base = path.join(ROOT, DOCS, lang, 'claude-code');
    for (const entry of fs.readdirSync(base)) {
      const p = path.join(base, entry);
      if (fs.statSync(p).isDirectory()) {
        for (const f of fs.readdirSync(p)) if (/\.(md|mdx)$/.test(f)) out.push(path.join(DOCS, lang, 'claude-code', entry, f));
      } else if (/\.(md|mdx)$/.test(entry)) out.push(path.join(DOCS, lang, 'claude-code', entry));
    }
  }
  return out;
}

const files = explicit.length ? explicit.map((f) => path.relative(ROOT, path.resolve(f))) : listAll();
const rules = cmd === 'replace' ? JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/course-replacements.json'), 'utf8')) : null;
let changed = 0;
for (const f of files) {
  const abs = path.join(ROOT, f);
  const before = fs.readFileSync(abs, 'utf8');
  const after =
    cmd === 'fence-lang' ? fixFenceLang(before)
    : cmd === 'fence-nest' ? fixFenceNest(before)
    : applyReplacements(before, f.replace(`${DOCS}/`, ''), rules);
  if (after !== before) {
    fs.writeFileSync(abs, after);
    changed++;
    console.log(`fixed ${f}`);
  }
}
console.log(`${changed} files changed`);
