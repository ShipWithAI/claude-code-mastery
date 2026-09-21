// scripts/lint-course/baseline.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadBaseline, compareToBaseline, formatBaseline } from './baseline.mjs';

test('missing baseline file loads as {}', () => {
  assert.deepEqual(loadBaseline(path.join(os.tmpdir(), 'lint-course-no-such-baseline.json')), {});
});

test('existing baseline file is parsed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lint-baseline-'));
  const file = path.join(dir, 'baseline.json');
  fs.writeFileSync(file, '{ "a.md": 3 }\n');
  assert.deepEqual(loadBaseline(file), { 'a.md': 3 });
});

test('regression detected when count > allowed', () => {
  const { regressions, improvements } = compareToBaseline({ 'a.md': 5 }, { 'a.md': 3 });
  assert.deepEqual(regressions, [{ file: 'a.md', count: 5, allowed: 3 }]);
  assert.deepEqual(improvements, []);
});

test('improvement listed when count < allowed', () => {
  const { regressions, improvements } = compareToBaseline({ 'a.md': 1 }, { 'a.md': 3 });
  assert.deepEqual(regressions, []);
  assert.deepEqual(improvements, [{ file: 'a.md', count: 1, allowed: 3 }]);
});

test('equal count is neither regression nor improvement', () => {
  const { regressions, improvements } = compareToBaseline({ 'a.md': 3 }, { 'a.md': 3 });
  assert.deepEqual(regressions, []);
  assert.deepEqual(improvements, []);
});

test('file absent from baseline is allowed 0 errors', () => {
  const { regressions } = compareToBaseline({ 'new.md': 1 }, {});
  assert.deepEqual(regressions, [{ file: 'new.md', count: 1, allowed: 0 }]);
  assert.deepEqual(compareToBaseline({ 'clean.md': 0 }, {}).regressions, []);
});

test('file in baseline but absent from counts is an improvement to 0', () => {
  const { improvements } = compareToBaseline({}, { 'gone.md': 2 });
  assert.deepEqual(improvements, [{ file: 'gone.md', count: 0, allowed: 2 }]);
});

test('formatBaseline omits zero-error files and sorts keys', () => {
  const out = formatBaseline({ 'z.md': 2, 'a.md': 0, 'm.md': 1, '(pairs)': 4 });
  assert.equal(out, '{\n  "(pairs)": 4,\n  "m.md": 1,\n  "z.md": 2\n}\n');
  assert.deepEqual(Object.keys(JSON.parse(out)), ['(pairs)', 'm.md', 'z.md']);
});

test('formatBaseline round-trips through compareToBaseline with no drift', () => {
  const counts = { 'b.md': 2, 'a.md': 7, 'c.md': 0 };
  const baseline = JSON.parse(formatBaseline(counts));
  const { regressions, improvements } = compareToBaseline(counts, baseline);
  assert.deepEqual(regressions, []);
  assert.deepEqual(improvements, []);
});
