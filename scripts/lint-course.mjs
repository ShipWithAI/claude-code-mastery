#!/usr/bin/env node
// scripts/lint-course.mjs — lint course modules. Usage: node scripts/lint-course.mjs [--strict] [files...]
import fs from 'node:fs';
import path from 'node:path';
import { parseDoc } from './lint-course/parse.mjs';
import { checkDoc, loadConfig } from './lint-course/checks.mjs';
import { checkPairs } from './lint-course/pairs.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const DOCS = 'src/content/docs';
const config = loadConfig(path.join(ROOT, 'scripts/lint-course.config.json'));

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const explicit = args.filter((a) => !a.startsWith('--'));

function listModules() {
  const out = [];
  for (const lang of ['en', 'vi']) {
    const base = path.join(ROOT, DOCS, lang, 'claude-code');
    for (const phase of fs.readdirSync(base)) {
      if (!phase.startsWith('phase-')) continue;
      for (const f of fs.readdirSync(path.join(base, phase))) {
        if (/\.(md|mdx)$/.test(f)) out.push(path.join(DOCS, lang, 'claude-code', phase, f));
      }
    }
  }
  return out;
}

const moduleFiles = listModules();
const files = explicit.length ? explicit.map((f) => path.relative(ROOT, path.resolve(f))) : [...moduleFiles, ...config.extraFiles];
const moduleSet = new Set(moduleFiles);

let errors = 0;
let warns = 0;
const report = (file, issues) => {
  for (const i of issues) {
    const level = strict && i.level === 'warn' ? 'error' : i.level;
    if (level === 'error') errors++;
    else warns++;
    console.log(`${file}:${i.line}: ${level} [${i.rule}] ${i.message}`);
  }
};

for (const f of files) {
  const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const rel = f.replace(`${DOCS}/`, '');
  report(f, checkDoc(parseDoc(text), { relPath: rel, config, isModule: moduleSet.has(f) }));
}
if (!explicit.length) {
  report('(pairs)', checkPairs(moduleFiles.map((f) => f.replace(`${DOCS}/`, ''))));
}

console.log(`\n${files.length} files, ${errors} errors, ${warns} warnings`);
process.exit(errors ? 1 : 0);
