// scripts/lint-course/baseline.mjs — per-file error-count ratchet.
// The baseline records how many `error`-level issues each file had when it was last
// updated; CI fails only when a file exceeds its recorded count.
import fs from 'node:fs';

export function loadBaseline(path) {
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

// countsByFile: { [file]: errorCount } for the current run (files with 0 may be present or absent).
// Files absent from the baseline are allowed 0 errors.
export function compareToBaseline(countsByFile, baseline) {
  const regressions = [];
  const improvements = [];
  const files = new Set([...Object.keys(countsByFile), ...Object.keys(baseline)]);
  for (const file of [...files].sort()) {
    const count = countsByFile[file] ?? 0;
    const allowed = baseline[file] ?? 0;
    if (count > allowed) regressions.push({ file, count, allowed });
    else if (count < allowed) improvements.push({ file, count, allowed });
  }
  return { regressions, improvements };
}

export function formatBaseline(countsByFile) {
  const out = {};
  for (const file of Object.keys(countsByFile).sort()) {
    if (countsByFile[file] > 0) out[file] = countsByFile[file];
  }
  return `${JSON.stringify(out, null, 2)}\n`;
}
