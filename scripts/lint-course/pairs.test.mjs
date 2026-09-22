// scripts/lint-course/pairs.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPairs } from './pairs.mjs';

test('matching pairs produce no issues', () => {
  assert.deepEqual(checkPairs(['en/claude-code/phase-01-foundation/01-a.md', 'vi/claude-code/phase-01-foundation/01-a.md']), []);
});

test('missing VI counterpart is an error', () => {
  const issues = checkPairs(['en/claude-code/phase-01-foundation/01-a.md']);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].rule, 'pair-missing');
  assert.equal(issues[0].level, 'error');
});

test('same basename with different extension is a warning', () => {
  const issues = checkPairs(['en/claude-code/phase-06-thinking-planning/01-think-mode.mdx', 'vi/claude-code/phase-06-thinking-planning/01-think-mode.md']);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].rule, 'pair-extension');
  assert.equal(issues[0].level, 'warn');
});
