// scripts/lint-course/pairs.mjs
const KEY_RE = /^(en|vi)\/(claude-code\/phase-[^/]+\/[^/]+?)\.(md|mdx)$/;

export function checkPairs(relPaths) {
  const byKey = new Map();
  for (const p of relPaths) {
    const m = p.match(KEY_RE);
    if (!m) continue;
    const entry = byKey.get(m[2]) ?? {};
    entry[m[1]] = m[3];
    byKey.set(m[2], entry);
  }
  const issues = [];
  for (const [key, e] of byKey) {
    if (!e.en || !e.vi) {
      const missing = e.en ? 'vi' : 'en';
      issues.push({ level: 'error', rule: 'pair-missing', line: 1, message: `${key}: thiếu bản ${missing}` });
    } else if (e.en !== e.vi) {
      issues.push({ level: 'warn', rule: 'pair-extension', line: 1, message: `${key}: en .${e.en} vs vi .${e.vi}` });
    }
  }
  return issues;
}
