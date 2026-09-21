#!/usr/bin/env node
// scripts/lint-course.mjs — lint course modules.
// Usage: node scripts/lint-course.mjs [--strict] [--update-baseline] [files...]
//
// Full scan (no files): every issue is printed; exit 1 only when a file has MORE
// error-level issues than scripts/lint-course.baseline.json allows (the ratchet).
// --update-baseline rewrites that file from the current counts.
// --strict: no baseline, warnings count as errors, any issue fails.
// Explicit files: any error in those files fails (local spot check).
import fs from 'node:fs';
import path from 'node:path';
import { parseDoc } from './lint-course/parse.mjs';
import { checkDoc, loadConfig } from './lint-course/checks.mjs';
import { checkPairs } from './lint-course/pairs.mjs';
import { loadBaseline, compareToBaseline, formatBaseline } from './lint-course/baseline.mjs';

const ROOT = path.resolve(new URL('..', import.meta.url).pathname);
const DOCS = 'src/content/docs';
const BASELINE = 'scripts/lint-course.baseline.json';
const config = loadConfig(path.join(ROOT, 'scripts/lint-course.config.json'));

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const updateBaseline = args.includes('--update-baseline');
// --update-baseline always records the full scan.
const explicit = updateBaseline ? [] : args.filter((a) => !a.startsWith('--'));

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
const countsByFile = {};
const report = (file, issues) => {
  countsByFile[file] ??= 0;
  for (const i of issues) {
    const level = strict && i.level === 'warn' ? 'error' : i.level;
    if (level === 'error') errors++;
    else warns++;
    if (i.level === 'error') countsByFile[file]++;
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

if (updateBaseline) {
  fs.writeFileSync(path.join(ROOT, BASELINE), formatBaseline(countsByFile));
  console.log(`baseline: wrote ${BASELINE} (${Object.values(countsByFile).filter(Boolean).length} files with errors)`);
  process.exit(0);
}

if (strict || explicit.length) {
  process.exit(errors ? 1 : 0);
}

const { regressions, improvements } = compareToBaseline(countsByFile, loadBaseline(path.join(ROOT, BASELINE)));
for (const r of regressions) console.log(`${r.file}: regression — ${r.count} errors (baseline ${r.allowed})`);
console.log(`baseline: ${regressions.length} regressions, ${improvements.length} improvements`);
if (improvements.length && !regressions.length) {
  console.log(`run: npm run lint:course -- --update-baseline`);
}
process.exit(regressions.length ? 1 : 0);
