import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fixFenceLang, fixFenceNest, applyReplacements } from './fix.mjs';
import { parseDoc } from './parse.mjs';

test('fixFenceLang adds text to bare openers only', () => {
  const out = fixFenceLang('a\n```\nout\n```\n\n```bash\nls\n```\n  ```\n  x\n  ```\n');
  assert.equal(out, 'a\n```text\nout\n```\n\n```bash\nls\n```\n  ```text\n  x\n  ```\n');
});

test('fixFenceNest upgrades intended outer fence to 4 backticks', () => {
  const input = '```markdown\n# T\n```bash\nnpm test\n```\n\n```json\n{}\n```\n```\nafter\n';
  const out = fixFenceNest(input);
  assert.equal(out, '````markdown\n# T\n```bash\nnpm test\n```\n\n```json\n{}\n```\n````\nafter\n');
  const f = parseDoc(out).segments.find((s) => s.type === 'fence');
  assert.deepEqual(f.nestedOpeners, []);
  assert.equal(f.end, 10);
});

test('fixFenceNest repairs every broken outer fence in a document', () => {
  const one = '```markdown\n```bash\nls\n```\n```\n';
  const out = fixFenceNest(`${one}\ntext\n${one}`);
  const fences = parseDoc(out).segments.filter((s) => s.type === 'fence');
  assert.equal(fences.length, 2);
  assert.ok(fences.every((f) => f.len === 4 && f.nestedOpeners.length === 0));
});

test('fixFenceNest is idempotent on clean input', () => {
  const clean = '````markdown\n```bash\nls\n```\n````\n';
  assert.equal(fixFenceNest(clean), clean);
});

test('applyReplacements honours regex, flags and file filter', () => {
  const rules = [
    { from: 'brew install claude-code', to: 'brew install --cask claude-code' },
    { from: 'node:1[68]\\b', to: 'node:22', regex: true, flags: 'g' },
    { from: 'only-in-phase-12', to: 'X', files: 'phase-12' },
  ];
  assert.equal(applyReplacements('brew install claude-code; node:18 node:16', 'en/x/phase-01/a.md', rules), 'brew install --cask claude-code; node:22 node:22');
  assert.equal(applyReplacements('only-in-phase-12', 'en/x/phase-01/a.md', rules), 'only-in-phase-12');
  assert.equal(applyReplacements('only-in-phase-12', 'en/x/phase-12/a.md', rules), 'X');
});
