import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDoc, countWords } from './parse.mjs';

test('frontmatter fields are parsed and skipped', () => {
  const doc = parseDoc(`---\ntitle: 'X'\ndescription: "Y"\n---\n\n# H1\n`);
  assert.equal(doc.frontmatter.fields.title, `'X'`);
  assert.equal(doc.frontmatter.fields.description, `"Y"`);
  assert.equal(doc.frontmatter.endLine, 4);
  assert.equal(doc.segments[0].type, 'text');
  assert.equal(doc.segments[0].start, 5);
});

test('fence with language and bare fence are distinguished', () => {
  const doc = parseDoc('a\n```bash\nls\n```\n\n```\nout\n```\n');
  const fences = doc.segments.filter((s) => s.type === 'fence');
  assert.equal(fences.length, 2);
  assert.equal(fences[0].lang, 'bash');
  assert.deepEqual(fences[0].lines, ['ls']);
  assert.equal(fences[0].start, 2);
  assert.equal(fences[0].end, 4);
  assert.equal(fences[1].lang, '');
});

test('inner fence with info string of same length is reported as nestedOpener (broken nesting)', () => {
  const doc = parseDoc('```markdown\n# T\n```bash\nnpm test\n```\n```\nafter\n');
  const f = doc.segments.find((s) => s.type === 'fence');
  assert.deepEqual(f.nestedOpeners, [3]);
  assert.equal(f.end, 5); // CommonMark: bare ``` on line 5 closes the outer
});

test('four-backtick outer fence legitimately contains three-backtick inner fences', () => {
  const doc = parseDoc('````markdown\n```bash\nls\n```\n````\n');
  const f = doc.segments.find((s) => s.type === 'fence');
  assert.deepEqual(f.nestedOpeners, []);
  assert.equal(f.end, 5);
  assert.equal(f.lines.length, 3);
});

test('unclosed fence is flagged', () => {
  const doc = parseDoc('```js\nlet a = 1;\n');
  const f = doc.segments.find((s) => s.type === 'fence');
  assert.equal(f.unclosed, true);
});

test('countWords ignores frontmatter and fences', () => {
  const doc = parseDoc('---\ntitle: X\n---\none two\n```bash\nthree four five\n```\nsix\n');
  assert.equal(countWords(doc), 3);
});
