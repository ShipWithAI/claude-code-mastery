import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDoc } from './parse.mjs';
import { checkDoc, loadConfig } from './checks.mjs';

const config = loadConfig(new URL('../lint-course.config.json', import.meta.url).pathname);
const seven = Array.from({ length: 7 }, (_, i) => `## ${i + 1}. Block`).join('\n\n');
const fm = `---\ntitle: T\ndescription: D\nverified: 2026-09-21\nclaude_version: 2.1.278\n---\n`;
const run = (body, opts = {}) =>
  checkDoc(parseDoc(fm + body), { relPath: 'en/claude-code/phase-01-foundation/01-x.md', config, isModule: true, ...opts });
const rules = (issues) => issues.map((i) => i.rule);

test('clean module has no issues', () => {
  assert.deepEqual(run(`# T\n\n${seven}\n`), []);
});

test('h2-count fires when not exactly 7', () => {
  const issues = run(`# T\n\n${seven}\n\n## 8. Extra\n`);
  assert.ok(issues.some((i) => i.rule === 'h2-count' && i.level === 'error' && /8/.test(i.message)));
});

test('h2 inside a fence is not counted, but ## inside non-markdown fence is an error', () => {
  const issues = run(`# T\n\n${seven}\n\n\`\`\`bash\n## comment\n\`\`\`\n`);
  assert.ok(!rules(issues).includes('h2-count'));
  assert.ok(issues.some((i) => i.rule === 'hash-in-fence' && i.line === 24));
});

test('## inside a bash heredoc is allowed', () => {
  const issues = run(`# T\n\n${seven}\n\n\`\`\`bash\ncat > CLAUDE.md <<'EOF'\n## Rules\nEOF\n## comment\n\`\`\`\n`);
  assert.equal(issues.filter((i) => i.rule === 'hash-in-fence').length, 1);
});

test('## inside markdown fence is allowed', () => {
  const issues = run(`# T\n\n${seven}\n\n\`\`\`markdown\n## Section\n\`\`\`\n`);
  assert.ok(!rules(issues).includes('hash-in-fence'));
});

test('fence-lang and fence-nested and fence-unclosed', () => {
  const issues = run(`# T\n\n${seven}\n\n\`\`\`\nout\n\`\`\`\n\n\`\`\`markdown\n\`\`\`bash\nls\n\`\`\`\n\`\`\`\n\n\`\`\`js\nx\n`);
  assert.ok(rules(issues).includes('fence-lang'));
  assert.ok(rules(issues).includes('fence-nested'));
  assert.ok(rules(issues).includes('fence-unclosed'));
});

test('blacklist patterns fire with configured level', () => {
  const issues = run(`# T\n\n${seven}\n\nEdit .claudeignore now. Press Ctrl+C to stop it.\n`);
  const bl = issues.filter((i) => i.rule === 'blacklist');
  assert.equal(bl.filter((i) => i.level === 'error').length, 1);
  assert.equal(bl.filter((i) => i.level === 'warn').length, 1);
});

test('blacklist is also checked inside fences', () => {
  const issues = run(`# T\n\n${seven}\n\n\`\`\`bash\nclaude config show\n\`\`\`\n`);
  assert.ok(issues.some((i) => i.rule === 'blacklist' && i.level === 'error'));
});

test('word thresholds: warn over 1500, maxLevel over 2200', () => {
  const words = (n) => Array(n).fill('w').join(' ');
  assert.ok(run(`# T\n\n${seven}\n\n${words(1600)}\n`).some((i) => i.rule === 'words-warn'));
  const over = run(`# T\n\n${seven}\n\n${words(2300)}\n`);
  assert.ok(over.some((i) => i.rule === 'words-max' && i.level === 'warn'));
});

test('frontmatter: missing description is error, missing verified is warn', () => {
  const doc = parseDoc(`---\ntitle: T\n---\n# T\n\n${seven}\n`);
  const issues = checkDoc(doc, { relPath: 'x.md', config, isModule: true });
  assert.ok(issues.some((i) => i.rule === 'frontmatter-required' && i.level === 'error'));
  assert.ok(issues.some((i) => i.rule === 'frontmatter-recommended' && i.level === 'warn'));
});

test('frontmatter checks are skipped when checkFrontmatter is false (templates/)', () => {
  const doc = parseDoc(`# T\n\nuse \`.claudeignore\`\n`);
  const issues = checkDoc(doc, { relPath: 'templates/x.md', config, isModule: false, checkFrontmatter: false });
  assert.ok(!issues.some((i) => i.rule.startsWith('frontmatter-')));
  assert.ok(issues.some((i) => i.rule === 'blacklist' && i.level === 'error'));
});

test('line-width warns on long prose lines but ignores fences, tables and URLs', () => {
  const long = 'x'.repeat(120);
  const issues = run(`# T\n\n${seven}\n\n${long}\n| ${long} |\nhttps://example.com/${long}\n\`\`\`text\n${long}\n\`\`\`\n`);
  assert.equal(issues.filter((i) => i.rule === 'line-width').length, 1);
});

test('non-module files skip h2-count and word rules', () => {
  const issues = run(`# Cheat sheet\n\n## A\n## B\n`, { isModule: false });
  assert.ok(!rules(issues).includes('h2-count'));
});
