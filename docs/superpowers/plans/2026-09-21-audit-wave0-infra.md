# Audit Remediation — Wave 0 (Hạ tầng) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng lưới an toàn (lint script + CI), dọn lỗi cơ học trên 128 file module EN/VI, cập nhật CLAUDE.md/metadata/templates/registry nguồn — để Wave 1 rewrite có nền sạch và mọi PR sau đều bị chặn nếu tái phạm.

**Architecture:** Một parser CommonMark-fence dùng chung (`scripts/lint-course/parse.mjs`) cho cả lint (`checks.mjs`, `pairs.mjs`, CLI `scripts/lint-course.mjs`) và fixer (`scripts/fix-course.mjs`). Rule/blacklist/ngưỡng nằm trong `scripts/lint-course.config.json`; bảng thay thế cơ học nằm trong `scripts/course-replacements.json`. Test bằng `node --test` như `src/lib/*.test.mjs`. CI là workflow GitHub Actions mới.

**Tech Stack:** Node ≥ 20 (ESM, `node:test`, `node:assert/strict`), không thêm dependency npm. Astro 5 / Starlight 0.37 build làm smoke test.

**Spec:** `docs/superpowers/specs/2026-09-21-course-audit-remediation-design.md` (§3.1 Wave 0, §9.1 registry). Audit gốc: `docs/audit/2026-09-21-course-audit.md`.

## Global Constraints

- `npm install` luôn chạy `npm install --ignore-scripts` (hook `.claude/hooks/npm-audit-check.sh` chặn plain install).
- Không thêm dependency npm mới cho lint/fix.
- Mọi thay đổi nội dung module áp cho **cả EN và VI** trong cùng task.
- **Không** sed `Ctrl+C` → `Esc` tự động; sửa tay từng chỗ (có chỗ Ctrl+C đúng = thoát session).
- Branch từ `develop`: PR-A `feat/audit-w0-lint`, PR-C `feat/audit-w0-quickwins`, PR-B `feat/audit-w0-meta`. Merge theo thứ tự A → C → B.
- Commit message kết thúc bằng `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Số đo baseline (đo 21/09/2026 bằng parser CommonMark, không tính code block và frontmatter): 729 fence không có language (78 file); fence lồng nhau thật ở EN 2.4, 2.5, 4.2, 15.1 + VI 2.4, 2.5, 15.1 (11.2 và 14.3 dùng outer 4-backtick — hợp lệ); H2 ≠ 7 sau khi sửa fence còn EN 8.1 (`## Key Takeaways` :406) và EN/VI 2.5 (`## Phase 2 Complete` :1327); 16 file > 2200 từ; 42/128 file > 1500 từ; 12.3 EN thiếu `description`.

---

## PR-A — Lint script + CI (`feat/audit-w0-lint`)

### Task 1: Fence-aware parser

**Files:**
- Create: `scripts/lint-course/parse.mjs`
- Test: `scripts/lint-course/parse.test.mjs`
- Modify: `package.json` (script `test`)

**Interfaces:**
- Produces: `parseDoc(text: string) → { frontmatter: { fields: Record<string,string>, endLine: number }, segments: Segment[], lineCount: number }`
  - `Segment` = `{ type: 'text', start, end, lines }` | `{ type: 'fence', char: '`'|'~', len, lang, start, end, lines, nestedOpeners: number[], unclosed?: true }`
  - Mọi `start`/`end` là số dòng 1-based trong file gốc. `lines` của fence **không** gồm dòng mở/đóng.
- Produces: `countWords(doc) → number` — đếm token cách nhau bởi whitespace trong segment `text`, bỏ frontmatter và fence.

- [ ] **Step 1: Viết test parser**

```js
// scripts/lint-course/parse.test.mjs
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
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `node --test scripts/lint-course/parse.test.mjs`
Expected: FAIL — `Cannot find module './parse.mjs'`

- [ ] **Step 3: Viết parser**

```js
// scripts/lint-course/parse.mjs
// Fence-aware Markdown parser (CommonMark fenced-code rules only).
// Shared by lint-course.mjs and fix-course.mjs.

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

export function parseDoc(text) {
  const lines = text.split('\n');
  const frontmatter = { fields: {}, endLine: 0 };
  let i = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      for (const l of lines.slice(1, end)) {
        const m = l.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
        if (m) frontmatter.fields[m[1]] = m[2].trim();
      }
      frontmatter.endLine = end + 1;
      i = end + 1;
    }
  }

  const segments = [];
  let open = null;
  let textSeg = null;
  const flushText = (endLine) => {
    if (textSeg) {
      textSeg.end = endLine;
      segments.push(textSeg);
      textSeg = null;
    }
  };

  for (; i < lines.length; i++) {
    const line = lines[i];
    const n = i + 1;
    const m = line.match(FENCE_RE);
    if (open) {
      const sameChar = m && m[1][0] === open.char;
      const longEnough = m && m[1].length >= open.len;
      const info = m ? m[2].trim() : null;
      if (sameChar && longEnough && info === '') {
        open.end = n;
        segments.push(open);
        open = null;
        continue;
      }
      if (sameChar && longEnough && info !== '') open.nestedOpeners.push(n);
      open.lines.push(line);
      continue;
    }
    if (m) {
      flushText(n - 1);
      open = {
        type: 'fence',
        char: m[1][0],
        len: m[1].length,
        lang: m[2].trim().split(/\s+/)[0] || '',
        start: n,
        end: null,
        lines: [],
        nestedOpeners: [],
      };
      continue;
    }
    if (!textSeg) textSeg = { type: 'text', start: n, end: null, lines: [] };
    textSeg.lines.push(line);
  }
  flushText(lines.length);
  if (open) {
    open.unclosed = true;
    open.end = lines.length;
    segments.push(open);
  }
  return { frontmatter, segments, lineCount: lines.length };
}

export function countWords(doc) {
  let n = 0;
  for (const s of doc.segments) {
    if (s.type !== 'text') continue;
    for (const l of s.lines) n += l.split(/\s+/).filter(Boolean).length;
  }
  return n;
}
```

- [ ] **Step 4: Chạy test, xác nhận pass**

Run: `node --test scripts/lint-course/parse.test.mjs`
Expected: 6 tests pass

- [ ] **Step 5: Nối vào `npm test`**

Sửa `package.json`:
```json
"test": "node --test src/lib/*.test.mjs scripts/lint-course/*.test.mjs",
```
Run: `npm test`
Expected: tất cả test (mermaid + parse) pass

- [ ] **Step 6: Commit**

```bash
git add scripts/lint-course/parse.mjs scripts/lint-course/parse.test.mjs package.json
git commit -m "feat(lint): fence-aware markdown parser for course lint

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Per-document checks

**Files:**
- Create: `scripts/lint-course/checks.mjs`
- Create: `scripts/lint-course.config.json`
- Test: `scripts/lint-course/checks.test.mjs`

**Interfaces:**
- Consumes: `parseDoc`, `countWords` từ Task 1.
- Produces: `checkDoc(doc, { relPath, config, isModule }) → Issue[]` với `Issue = { level: 'error'|'warn', rule: string, line: number, message: string }`.
- Produces: `loadConfig(path) → config` (đọc JSON, compile `blacklist[].pattern` thành RegExp).
- Config shape (file `scripts/lint-course.config.json`):

```json
{
  "moduleGlob": "src/content/docs/{en,vi}/claude-code/phase-*/*.{md,mdx}",
  "extraFiles": [
    "src/content/docs/en/claude-code/cheat-sheet.mdx",
    "src/content/docs/vi/claude-code/cheat-sheet.mdx",
    "src/content/docs/en/claude-code/tips-tricks.mdx",
    "src/content/docs/vi/claude-code/tips-tricks.mdx"
  ],
  "h2Count": 7,
  "words": { "warn": 1500, "max": 2200, "maxLevel": "warn" },
  "lineWidth": { "limit": 100, "level": "warn" },
  "frontmatter": {
    "required": ["title", "description"],
    "recommended": ["verified", "claude_version"],
    "recommendedLevel": "warn"
  },
  "markdownLangs": ["markdown", "md", "mdx"],
  "blacklist": [
    { "pattern": "claude config (show|reset)", "level": "error", "note": "không tồn tại; dùng ~/.claude/settings.json" },
    { "pattern": "\\.claudeignore", "level": "error", "note": "chưa từng tồn tại; dùng permissions.deny" },
    { "pattern": "(^|[^\\w/])/read \\S", "level": "error", "note": "dùng @path" },
    { "pattern": "/(project|user):[a-z]", "level": "error", "note": "namespace đã bỏ; dùng /name" },
    { "pattern": "pre-file-write|post-file-write|pre-command|post-command|pre-session|post-session", "level": "error", "note": "hook events bịa; xem docs/en/hooks" },
    { "pattern": "\\.claude/hooks\\.json", "level": "error", "note": "hooks nằm trong settings.json" },
    { "pattern": "claude skill (install|list|remove|info)", "level": "error", "note": "không tồn tại; skills = .claude/skills/<name>/SKILL.md" },
    { "pattern": "claude_desktop_config", "level": "error", "note": "file của Claude Desktop, không phải Claude Code" },
    { "pattern": "--network[= ]none", "level": "error", "note": "Claude Code cần reach api.anthropic.com" },
    { "pattern": "claude-3-5-sonnet|claude-sonnet-4-2025|claude-opus-4\\b", "level": "error", "note": "model ID cũ; dùng alias opus/sonnet/haiku" },
    { "pattern": "from ['\"]@anthropic-ai/claude-code['\"]", "level": "error", "note": "SDK là @anthropic-ai/claude-agent-sdk" },
    { "pattern": "Split In Batches", "level": "error", "note": "n8n node nay là Loop Over Items" },
    { "pattern": "gitleaks protect", "level": "error", "note": "gitleaks git --pre-commit --staged" },
    { "pattern": "git filter-branch", "level": "error", "note": "git filter-repo" },
    { "pattern": "/usr/local/bin/claude", "level": "error", "note": "native installer: ~/.local/bin/claude" },
    { "pattern": "Ctrl\\+C.{0,40}(stop|interrupt|emergency|dừng|ngắt)", "level": "warn", "note": "Esc = interrupt; Ctrl+C ×2 = thoát — đọc ngữ cảnh" }
  ]
}
```

- [ ] **Step 1: Viết test checks**

```js
// scripts/lint-course/checks.test.mjs
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

test('line-width warns on long prose lines but ignores fences, tables and URLs', () => {
  const long = 'x'.repeat(120);
  const issues = run(`# T\n\n${seven}\n\n${long}\n| ${long} |\nhttps://example.com/${long}\n\`\`\`text\n${long}\n\`\`\`\n`);
  assert.equal(issues.filter((i) => i.rule === 'line-width').length, 1);
});

test('non-module files skip h2-count and word rules', () => {
  const issues = run(`# Cheat sheet\n\n## A\n## B\n`, { isModule: false });
  assert.ok(!rules(issues).includes('h2-count'));
});
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `node --test scripts/lint-course/checks.test.mjs`
Expected: FAIL — `Cannot find module './checks.mjs'`

- [ ] **Step 3: Tạo config JSON** (nội dung ở phần Interfaces) tại `scripts/lint-course.config.json`.

- [ ] **Step 4: Viết checks**

```js
// scripts/lint-course/checks.mjs
import fs from 'node:fs';
import { countWords } from './parse.mjs';

const SHELL_LANGS = new Set(['bash', 'sh', 'shell', 'zsh']);

export function loadConfig(path) {
  const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
  cfg.blacklist = cfg.blacklist.map((b) => ({ ...b, re: new RegExp(b.pattern) }));
  return cfg;
}

export function checkDoc(doc, { relPath, config, isModule }) {
  const issues = [];
  const push = (level, rule, line, message) => issues.push({ level, rule, line, message });
  const mdLangs = new Set(config.markdownLangs);

  // frontmatter
  for (const k of config.frontmatter.required) {
    if (!(k in doc.frontmatter.fields)) push('error', 'frontmatter-required', 1, `thiếu frontmatter \`${k}\``);
  }
  for (const k of config.frontmatter.recommended) {
    if (!(k in doc.frontmatter.fields))
      push(config.frontmatter.recommendedLevel, 'frontmatter-recommended', 1, `thiếu frontmatter \`${k}\``);
  }

  let h2 = 0;
  for (const s of doc.segments) {
    if (s.type === 'fence') {
      if (s.unclosed) push('error', 'fence-unclosed', s.start, 'fence mở nhưng không đóng');
      if (!s.lang) push('error', 'fence-lang', s.start, 'fence thiếu language (dùng `text` cho output)');
      for (const n of s.nestedOpeners)
        push('error', 'fence-nested', n, `fence mở bên trong fence mở ở dòng ${s.start} — nâng fence ngoài lên 4 backtick`);
      if (!mdLangs.has(s.lang)) {
        // `## ` inside a shell heredoc (cat > CLAUDE.md <<'EOF' … EOF) is legitimate content.
        let heredocEnd = null;
        s.lines.forEach((l, i) => {
          if (heredocEnd) {
            if (l.trim() === heredocEnd) heredocEnd = null;
            return;
          }
          const hd = SHELL_LANGS.has(s.lang) && l.match(/<<-?\s*['"]?([A-Za-z_]\w*)['"]?/);
          if (hd) { heredocEnd = hd[1]; return; }
          if (/^## /.test(l)) push('error', 'hash-in-fence', s.start + 1 + i, 'dòng `## ` trong code block không phải markdown (relabel fence thành `markdown` nếu nội dung là markdown)');
        });
      }
      s.lines.forEach((l, i) => checkBlacklist(l, s.start + 1 + i));
      continue;
    }
    s.lines.forEach((l, i) => {
      const line = s.start + i;
      if (/^## /.test(l)) h2++;
      checkBlacklist(l, line);
      if (
        l.length > config.lineWidth.limit &&
        !l.trimStart().startsWith('|') &&
        !/https?:\/\/\S{40,}/.test(l)
      ) {
        push(config.lineWidth.level, 'line-width', line, `${l.length} ký tự (> ${config.lineWidth.limit})`);
      }
    });
  }

  function checkBlacklist(l, line) {
    for (const b of config.blacklist) {
      if (b.re.test(l)) push(b.level, 'blacklist', line, `\`${b.pattern}\` — ${b.note}`);
    }
  }

  if (isModule) {
    if (h2 !== config.h2Count) push('error', 'h2-count', 1, `có ${h2} H2, cần đúng ${config.h2Count}`);
    const words = countWords(doc);
    if (words > config.words.max) push(config.words.maxLevel, 'words-max', 1, `${words} từ (> ${config.words.max})`);
    else if (words > config.words.warn) push('warn', 'words-warn', 1, `${words} từ (> ${config.words.warn})`);
  }

  return issues;
}
```

- [ ] **Step 5: Chạy test, xác nhận pass**

Run: `node --test scripts/lint-course/checks.test.mjs`
Expected: 12 tests pass

- [ ] **Step 6: Commit**

```bash
git add scripts/lint-course/checks.mjs scripts/lint-course/checks.test.mjs scripts/lint-course.config.json
git commit -m "feat(lint): per-document checks (H2, fences, blacklist, words, frontmatter)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: EN/VI pair check + CLI + npm script

**Files:**
- Create: `scripts/lint-course/pairs.mjs`
- Create: `scripts/lint-course.mjs`
- Test: `scripts/lint-course/pairs.test.mjs`
- Modify: `package.json` (script `lint:course`)

**Interfaces:**
- Produces: `checkPairs(relPaths: string[]) → Issue[]` — mỗi `en/claude-code/phase-X/NN-slug.(md|mdx)` phải có `vi/claude-code/phase-X/NN-slug.(md|mdx)` và ngược lại. Thiếu = `error` rule `pair-missing`; cùng basename khác extension = `warn` rule `pair-extension`.
- Produces: CLI `node scripts/lint-course.mjs [--strict] [paths...]`. Exit 1 nếu có `error`; `--strict` nâng `warn` thành `error`. Không có `paths` → quét `moduleGlob` + `extraFiles`.

- [ ] **Step 1: Viết test pairs**

```js
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
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `node --test scripts/lint-course/pairs.test.mjs`
Expected: FAIL — module not found

- [ ] **Step 3: Viết pairs.mjs**

```js
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
```

- [ ] **Step 4: Chạy test pairs, xác nhận pass**

Run: `node --test scripts/lint-course/pairs.test.mjs`
Expected: 3 pass

- [ ] **Step 5: Viết CLI**

```js
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
```

- [ ] **Step 6: Thêm npm script**

`package.json`:
```json
"lint:course": "node scripts/lint-course.mjs",
"lint:course:strict": "node scripts/lint-course.mjs --strict",
```

- [ ] **Step 7: Chạy lint trên repo hiện tại, ghi baseline**

Run: `npm run lint:course > /tmp/lint-baseline.txt; tail -1 /tmp/lint-baseline.txt`
Expected (đo 21/09/2026): 132 files, ~1051 errors, ~1913 warnings — fence-lang 733, blacklist 204 (gồm warn Ctrl+C), hash-in-fence ~60, fence-nested 26, words-max 16, h2-count 8, frontmatter-required 1; exit 1. Số chính xác ghi vào PR description làm baseline.

- [ ] **Step 8: Commit**

```bash
git add scripts/lint-course/pairs.mjs scripts/lint-course/pairs.test.mjs scripts/lint-course.mjs package.json
git commit -m "feat(lint): EN/VI pair check and lint-course CLI

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Fixer script (fence-lang, fence-nest, replace)

**Files:**
- Create: `scripts/fix-course.mjs`
- Create: `scripts/course-replacements.json`
- Test: `scripts/lint-course/fix.test.mjs`
- Create: `scripts/lint-course/fix.mjs`

**Interfaces:**
- Consumes: `parseDoc` (Task 1).
- Produces: `fixFenceLang(text) → text` — mọi fence mở không có info string → thêm `text` (giữ indent, giữ ký tự fence).
- Produces: `fixFenceNest(text) → text` — với mỗi fence có `nestedOpeners`, tìm dòng đóng **theo ý tác giả** bằng stack (opener có info = push, bare = pop; stack về 0 → đó là dòng đóng ngoài), rồi nâng dòng mở và dòng đóng đó lên `len + 1` backtick (tối thiểu 4).
- Produces: `applyReplacements(text, relPath, rules) → text` với `rules = [{ from, to, regex?: true, flags?: 'g', files?: RegExp-string }]`.
- CLI: `node scripts/fix-course.mjs <fence-lang|fence-nest|replace> [files...]` — không có files → quét như lint.

- [ ] **Step 1: Viết test fixer**

```js
// scripts/lint-course/fix.test.mjs
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
```

- [ ] **Step 2: Chạy test, xác nhận fail**

Run: `node --test scripts/lint-course/fix.test.mjs`
Expected: FAIL — module not found

- [ ] **Step 3: Viết fix.mjs**

```js
// scripts/lint-course/fix.mjs
import { parseDoc } from './parse.mjs';

const FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;

export function fixFenceLang(text) {
  const lines = text.split('\n');
  const doc = parseDoc(text);
  for (const s of doc.segments) {
    if (s.type !== 'fence' || s.lang || s.unclosed) continue;
    const m = lines[s.start - 1].match(FENCE_RE);
    lines[s.start - 1] = `${m[1]}${m[2]}text`;
  }
  return lines.join('\n');
}

export function fixFenceNest(text) {
  // One broken outer fence mis-segments everything after it, so fix the first
  // one, re-parse, and repeat until the document has no nested openers.
  let out = text;
  for (let pass = 0; pass < 50; pass++) {
    const next = fixFirstNestedFence(out);
    if (next === out) break;
    out = next;
  }
  return out;
}

function fixFirstNestedFence(text) {
  const lines = text.split('\n');
  const doc = parseDoc(text);
  for (const s of doc.segments) {
    if (s.type !== 'fence' || !s.nestedOpeners.length) continue;
    // Walk from the outer opener; treat fence lines the way the author meant them.
    let depth = 0;
    let maxInner = s.len;
    let closeLine = null;
    for (let i = s.start - 1; i < lines.length; i++) {
      const m = lines[i].match(FENCE_RE);
      if (!m) continue;
      const info = m[3].trim();
      if (info) {
        depth++;
        if (i !== s.start - 1) maxInner = Math.max(maxInner, m[2].length);
      } else {
        depth--;
        if (depth === 0) { closeLine = i; break; }
      }
    }
    if (closeLine === null) continue;
    const newLen = Math.max(4, maxInner + 1);
    const fence = s.char.repeat(newLen);
    const open = lines[s.start - 1].match(FENCE_RE);
    lines[s.start - 1] = `${open[1]}${fence}${open[3]}`;
    const close = lines[closeLine].match(FENCE_RE);
    lines[closeLine] = `${close[1]}${fence}`;
    return lines.join('\n');
  }
  return text;
}

export function applyReplacements(text, relPath, rules) {
  let out = text;
  for (const r of rules) {
    if (r.files && !new RegExp(r.files).test(relPath)) continue;
    const re = r.regex ? new RegExp(r.from, r.flags ?? 'g') : new RegExp(r.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), r.flags ?? 'g');
    out = out.replace(re, r.to);
  }
  return out;
}
```

- [ ] **Step 4: Chạy test, xác nhận pass**

Run: `node --test scripts/lint-course/fix.test.mjs`
Expected: 5 pass

- [ ] **Step 5: Viết CLI fix-course.mjs**

```js
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
```

- [ ] **Step 6: Tạo bảng thay thế** `scripts/course-replacements.json` (theo audit Phụ lục B.5; **không** có Ctrl+C):

```json
[
  { "from": "brew install claude-code", "to": "brew install --cask claude-code" },
  { "from": "claude-3-5-sonnet-20241022", "to": "sonnet" },
  { "from": "claude-sonnet-4-20250514", "to": "sonnet" },
  { "from": "claude-opus-4-20250514", "to": "opus" },
  { "from": "\"claude-opus-4\"", "to": "\"opus\"" },
  { "from": "gitleaks protect --staged", "to": "gitleaks git --pre-commit --staged" },
  { "from": "gitleaks detect --no-git", "to": "gitleaks dir" },
  { "from": "git filter-branch", "to": "git filter-repo" },
  { "from": "docker-compose ", "to": "docker compose " },
  { "from": "node:18(-alpine|-slim)?\\b", "to": "node:22$1", "regex": true },
  { "from": "npm ci --only=production", "to": "npm ci --omit=dev" },
  { "from": "npm install --only=production", "to": "npm install --omit=dev" },
  { "from": "npm test src/utils/date.test.js", "to": "npm test -- src/utils/date.test.js", "files": "phase-09" },
  { "from": "/usr/local/bin/claude", "to": "~/.local/bin/claude" },
  { "from": "Split In Batches", "to": "Loop Over Items" },
  { "from": "Merge By Position", "to": "Merge (Combine → Position)" },
  { "from": "/read ", "to": "@", "files": "phase-01-foundation/03-context-basics" },
  { "from": "/project:review", "to": "/review" },
  { "from": "/user:my-prompt", "to": "/my-prompt" },
  { "from": "\\.claudeignore", "to": "`permissions.deny` in `.claude/settings.json`", "regex": true, "files": "phase-02-security/(01-threat-model|04-secret-management)" }
]
```

Ghi chú: rule `.claudeignore` thay thế chuỗi chứ không sửa ngữ nghĩa câu — Task 7 sẽ đọc lại 2.1:357-377 và 2.4:47,78 để câu còn đúng. Rule `npm test` cần kiểm tra chuỗi thật ở 9.3:100 trước khi chạy (audit ghi `npm test file.js`; sửa `from` cho khớp).

- [ ] **Step 7: Chạy fixer ở chế độ thử trên một file rồi revert**

Run:
```bash
node scripts/fix-course.mjs fence-nest src/content/docs/en/claude-code/phase-15-templates-skills/01-claude-md-templates.md
node scripts/lint-course.mjs src/content/docs/en/claude-code/phase-15-templates-skills/01-claude-md-templates.md | grep -c fence-nested
git checkout src/content/docs/en/claude-code/phase-15-templates-skills/01-claude-md-templates.md
```
Expected: `fixed …`, rồi `0`, rồi file về nguyên trạng. (Thay đổi nội dung thật thuộc PR-C.)

- [ ] **Step 8: Commit**

```bash
git add scripts/fix-course.mjs scripts/lint-course/fix.mjs scripts/lint-course/fix.test.mjs scripts/course-replacements.json
git commit -m "feat(lint): fix-course script (fence-lang, fence-nest, replace)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: CI workflow + PR-A

**Files:**
- Create: `.github/workflows/lint-course.yml`

- [ ] **Step 1: Viết workflow**

```yaml
# .github/workflows/lint-course.yml
name: lint-course
on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci --ignore-scripts
      - run: npm test
      - run: npm run lint:course
      - run: npm run build
```

- [ ] **Step 2: Kiểm tra workflow syntax local**

Run: `npx --yes @action-validator/cli .github/workflows/lint-course.yml || node -e "require('js-yaml')" 2>/dev/null || python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/lint-course.yml')); print('yaml ok')"`
Expected: `yaml ok` (hoặc validator pass).

- [ ] **Step 3: Commit, push, mở PR-A**

```bash
git add .github/workflows/lint-course.yml
git commit -m "ci: lint-course workflow (test + lint + build)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git push -u origin feat/audit-w0-lint
gh pr create --base develop --title "feat(lint): course lint/fix scripts + CI (audit wave 0)" --body "$(cat <<'EOF'
## Summary
- `scripts/lint-course.mjs` + config: H2=7, fence lang/nested/unclosed, `##` in non-markdown fence, blacklist (audit §4A patterns), word thresholds, frontmatter, EN/VI pairs
- `scripts/fix-course.mjs`: fence-lang, fence-nest, replace (table in `scripts/course-replacements.json`)
- `.github/workflows/lint-course.yml`: test + lint + build on PR/push

Baseline on develop: <paste tail -1 of lint output>

Spec: docs/superpowers/specs/2026-09-21-course-audit-remediation-design.md §3.1 W0-A

⚠️ CI lint sẽ **đỏ** cho tới khi PR-C (quick-wins) merge. Merge PR-A trước, PR-C ngay sau.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## PR-C — Quick-win cơ học (`feat/audit-w0-quickwins`, tạo từ `develop` sau khi PR-A merge)

### Task 6: Sửa fence lồng nhau + thêm language + H2 thứ 8

**Files:**
- Modify (script): tất cả `src/content/docs/{en,vi}/claude-code/**/*.{md,mdx}`
- Modify (tay): `src/content/docs/en/claude-code/phase-08-meta-debugging/01-hallucination-detection.mdx:406`, `src/content/docs/{en,vi}/claude-code/phase-02-security/05-system-control.md:~1327`

- [ ] **Step 1: Chạy fence-nest trước (thứ tự quan trọng — fence-lang chạy trước sẽ gắn `text` vào dòng đóng bị hiểu nhầm là mở)**

Run: `node scripts/fix-course.mjs fence-nest && npm run lint:course | grep -c fence-nested`
Expected: `fixed` cho EN 2.4, 2.5, 4.2, 15.1 và VI 2.4, 2.5, 15.1; đếm `0`.

- [ ] **Step 2: Review diff fence-nest bằng mắt + sửa tay 4.2 EN**

Run: `git diff --stat && git diff | grep '^[-+]\s*`\{3,4\}' | head -40`
Expected: chỉ các dòng fence đổi từ 3 → 4 backtick, theo cặp mở/đóng. Nếu một cặp lệch (mở đổi, đóng không), sửa tay dòng đóng.

Fixer **không** xử lý được `en/…/phase-04-prompt-memory/02-claude-md.md` (còn 4 `fence-nested` ở ~292/374/422/451): ở đó fence trong là **bare** ```` ``` ```` (tree, output) nằm trong ```` ```markdown ````, nên không có info string để đoán cấu trúc. Sửa tay: với mỗi block ```` ```markdown ```` chứa fence con — đổi dòng mở/đóng ngoài thành ```` ```` ````, đổi mọi fence con bare thành ```` ```text ```` (hoặc `bash`/`json` theo nội dung). Kiểm tra: `node scripts/lint-course.mjs src/content/docs/en/claude-code/phase-04-prompt-memory/02-claude-md.md | grep -E "fence-nested|h2-count"` → không còn (H2 sẽ về 7 vì `## 4. PRACTICE` :~378 hết bị nuốt).

- [ ] **Step 3: Commit**

```bash
git add -A src/content/docs && git commit -m "fix(content): upgrade nested outer fences to 4 backticks (audit X10)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 4: Chạy fence-lang**

Run: `node scripts/fix-course.mjs fence-lang && npm run lint:course | grep -c fence-lang`
Expected: ~78 file fixed; đếm `0`.

- [ ] **Step 5: Spot-check 5 fence vừa gắn `text` có phải output thật không**

Run: `git diff -U1 | grep -B1 -A2 '^+```text' | head -60`
Expected: nội dung là output/transcript/tree. Nếu gặp block rõ ràng là bash (bắt đầu `$ ` hoặc lệnh) hay json (bắt đầu `{`), đổi tay sang `bash`/`json`. Không cần hoàn hảo — Wave 1/2 rewrite sẽ soát lại từng module.

- [ ] **Step 6: Commit**

```bash
git add -A src/content/docs && git commit -m "fix(content): add language to 729 bare code fences

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 7: Sửa H2 thứ 8**

- `en/…/phase-08-meta-debugging/01-hallucination-detection.mdx:406`: `## Key Takeaways` → `### Key Takeaways`.
- `en/…/phase-02-security/05-system-control.md:1327` và bản VI (grep `^## Phase 2`): `## Phase 2 Complete — …` → `### Phase 2 Complete — …`.

Run: `npm run lint:course | grep h2-count`
Expected: không còn dòng nào (2.4/4.2/15.1 tự hết sau Step 1).

- [ ] **Step 8: Sửa `##` trong fence không phải markdown**

Run: `npm run lint:course | grep hash-in-fence`
Với mỗi dòng báo: mở file, xem fence chứa nó.
- Nếu fence là `bash`/`sh` và dòng là comment → đổi `## x` thành `# x`.
- Nếu fence là `text` nhưng nội dung là markdown (report, CLAUDE.md mẫu, plan, lessons-learned) → đổi lang fence thành `markdown`. Còn ~25 chỗ sau Step 1-4 (2.5, 4.2, 10.4, 2.4, 13.2, 6.2, 6.3, 8.5, 11.1, 11.4 — EN và VI).
- Nếu fence là `yaml`/`json` có `##` (hiếm) → `#`.
- Heredoc bash (`cat > FILE <<'EOF' … EOF`) đã được lint bỏ qua — không cần sửa.

Run lại: `npm run lint:course | grep -c hash-in-fence` → Expected: `0`.

- [ ] **Step 9: Commit**

```bash
git add -A src/content/docs && git commit -m "fix(content): remove 8th H2 and ## inside non-markdown fences

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Grep-replace + sửa tay theo ngữ cảnh

**Files:**
- Modify (script): toàn bộ module EN/VI qua `scripts/course-replacements.json`
- Modify (tay): `en,vi/…/phase-02-security/01-threat-model.md:~357-377`, `…/04-secret-management.md:~47,78`, `…/phase-02-security/05-system-control.md:~1116-1118` (VI ~1128), `…/phase-04-prompt-memory/03-slash-commands.md:~91-119`, `…/phase-09-legacy-brownfield/03-legacy-test-generation.md:~100`

- [ ] **Step 1: Kiểm tra các `from` hiếm trước khi chạy**

Run:
```bash
grep -rn "npm test src\|npm test [a-z].*\.js" src/content/docs/*/claude-code/phase-09-legacy-brownfield/03-*.md | head
grep -rn "claude-opus-4\b" src/content/docs/*/claude-code | head
```
Sửa `from` trong `scripts/course-replacements.json` cho khớp chuỗi thật (ví dụ 9.3 có thể là `npm test src/utils/date.test.js` hoặc tên khác).

- [ ] **Step 2: Chạy replace**

Run: `node scripts/fix-course.mjs replace && git diff --stat | tail -1`
Expected: ~30-40 file thay đổi.

- [ ] **Step 3: Review diff toàn bộ**

Run: `git diff | grep '^[-+][^-+]' | less` — đọc từng cặp `-`/`+`. Revert bằng tay bất kỳ chỗ nào thay thế làm câu sai nghĩa (đặc biệt rule `.claudeignore` và `/read `).

- [ ] **Step 4: Sửa tay `claude config show|reset` (2.5 EN ~1116-1118, VI ~1128-1130)**

Thay đoạn `claude config show` / `claude config reset` bằng:
```bash
cat ~/.claude/settings.json          # user settings
cat .claude/settings.json            # project settings (committed)
cat .claude/settings.local.json      # project-local (gitignored)
```
và câu giải thích: "There is no `claude config show`; settings are plain JSON files (see `/docs/en/settings`)." VI tương đương.

- [ ] **Step 5: Sửa tay `.claudeignore` (2.1 ~357-377, 2.4 ~47,78 — EN và VI)**

Sau replace, câu có dạng "`permissions.deny` in `.claude/settings.json` may exist…". Viết lại 2-4 câu mỗi chỗ: file `.claudeignore` **chưa từng tồn tại**; cơ chế thật là
```json
{ "permissions": { "deny": ["Read(./.env)", "Read(./.env.*)", "Read(~/.ssh/**)"] } }
```
trong `.claude/settings.json`. Giữ ⚠️ nếu đoạn xung quanh còn nói "may exist".

- [ ] **Step 6: Sửa tay `/project:` (4.3 ~91-119)**: xóa đoạn giải thích namespace `/project:` và `/user:`; thay bằng một câu: project commands ở `.claude/commands/<name>.md` gọi bằng `/<name>`; user commands ở `~/.claude/commands/`. (Chi tiết đầy đủ là việc của Wave 2 W2-4.)

- [ ] **Step 7: Lint + build**

Run: `npm run lint:course | grep -E "blacklist.*error" | grep -v "Ctrl" ; npm run build 2>&1 | tail -3`
Expected: chỉ còn blacklist error thuộc Wave 1 (`pre-file-write`… 11.3, `claude skill install` 15.x, `claude_desktop_config` 11.5, `--network=none` 2.3/2.5, `@anthropic-ai/claude-code` 11.2). Build xanh.

- [ ] **Step 8: Commit**

```bash
git add -A src/content/docs scripts/course-replacements.json
git commit -m "fix(content): mechanical replacements (model ids, brew --cask, gitleaks, filter-repo, n8n nodes, @path)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Sửa Ctrl+C theo ngữ cảnh + rác biên tập + VI 7.1 flags bịa

**Files:**
- Modify: mọi file lint báo `blacklist … Ctrl+C` (EN+VI 1.1, 7.2, 7.4, 8.2, 8.5, cheat-sheet) — sửa tay
- Modify: `en/…/phase-02-security/01-threat-model.md:~396-407`, `en,vi/…/phase-03-core-workflows/01-reading-codebases.md:6-9`, `en/…/phase-02-security/04-secret-management.md:88,~790-792`, `en/…/phase-11-automation-headless/04-github-actions.md:129,177`, `vi/…/phase-07-multi-agent-auto/01-auto-coding-levels.md:220,243,351`

- [ ] **Step 1: Liệt kê Ctrl+C**

Run: `npm run lint:course | grep "Ctrl"` — mở từng chỗ. Quy tắc:
- Ngữ cảnh "dừng Claude đang làm dở / emergency / interrupt" → đổi thành **Esc** ("Press **Esc** to interrupt the current turn — your session and context stay intact").
- Ngữ cảnh "thoát Claude Code" → giữ, viết rõ "**Ctrl+C twice** (or **Ctrl+D**) exits the session".
- Cheat-sheet: một dòng cho Esc (interrupt), một dòng cho Ctrl+C ×2 (exit).
Sửa cả EN và VI (VI dùng "nhấn **Esc** để ngắt turn hiện tại").

- [ ] **Step 2: Xóa rác biên tập**
- 2.1 EN ~396-407: xóa đoạn "Wait — that's wrong. `chmod 600`…" và giữ phiên bản đúng (`chmod 600` = owner rw; Claude chạy dưới user của bạn nên **vẫn đọc được** — permission file không bảo vệ khỏi Claude Code; chỉ `permissions.deny` mới chặn). Kiểm tra VI có đoạn tương tự không.
- 3.1 EN và VI dòng 6-9: xóa HTML comment `<!-- Note: This module exceeds… -->`.
- 2.4 EN :88 "recall Tùng's story" → "recall the leaked-key story in Module 2.1" (kiểm tra tên nhân vật thật ở 2.1 và dùng đúng tên); ~790-792 xóa câu lặp nguyên văn (grep câu trùng: `awk 'seen[$0]++' file`).
- 11.4 EN :129,177 `*Automated by Claude Code v11.4*` → `*Automated by Claude Code*`; VI tương tự.

- [ ] **Step 3: VI 7.1 — xóa demo flag bịa**

`vi/…/phase-07-multi-agent-auto/01-auto-coding-levels.md` :220, :243, :351: xóa các dòng `claude --plan …`, `claude --auto --plan …` và câu mô tả đi kèm; thay bằng cách EN đang dùng ở cùng vị trí (đọc EN 7.1 đoạn tương ứng, viết lại VI song song). Nếu EN cũng không có demo tại đó → xóa hẳn khối VI.

Run: `grep -n "\-\-plan\|--auto" src/content/docs/vi/claude-code/phase-07-multi-agent-auto/01-auto-coding-levels.md`
Expected: không có kết quả.

- [ ] **Step 4: Lint, build, commit**

Run: `npm run lint:course | grep -c "Ctrl"` → Expected: `0`. `npm run build` xanh.
```bash
git add -A src/content/docs
git commit -m "fix(content): Esc vs Ctrl+C, remove editorial leftovers, drop invented VI 7.1 flags

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Solution còn thiếu, `description` 12.3, hero image, "55 modules" trong 16.x

**Files:**
- Modify: `vi/…/phase-04-prompt-memory/02-claude-md.md` (Ex 2), `en/…/phase-08-meta-debugging/01-hallucination-detection.mdx` (Ex 3), `en/…/phase-08-meta-debugging/03-context-confusion.md` (Ex 1-2), `vi/…/phase-08-meta-debugging/01-hallucination-detection.mdx` (Ex 2-3)
- Modify: `en/…/phase-12-n8n-workflows/03-n8n-sdk-orchestration.md` (frontmatter)
- Modify: `src/content/docs/{en,vi}/claude-code/index.mdx:8`
- Modify: `en,vi/…/phase-16-real-world-mastery/01-case-studies.md:~198,202`, `…/03-teaching-workshop.md:~218`

- [ ] **Step 1: Thêm `<details><summary>✅ Solution</summary>` cho 5 exercise**

Với mỗi exercise thiếu solution: đọc Goal/Instructions/Expected result của exercise, viết solution 5-15 dòng **theo đúng những gì exercise yêu cầu** (không thêm lệnh mới; nếu exercise yêu cầu lệnh mà audit đánh dấu sai — ví dụ `/cost` làm gauge — dùng `/context` và ghi chú "see Module 5.1"). Format:

```markdown
<details>
<summary>✅ Solution</summary>

1. …
2. …

**Why it works**: …
</details>
```

- [ ] **Step 2: `description` cho 12.3**

Thêm vào frontmatter EN 12.3 (đối chiếu VI 12.3 để giống cấu trúc):
```yaml
description: 'Orchestrate Claude from n8n Code nodes and hand off to Claude Code headless for repo-aware tasks.'
```
(Wave 2 W2-15 sẽ rebuild 12.3; description tạm phải đúng với nội dung hiện tại.)

- [ ] **Step 3: Hero image**

`src/content/docs/{en,vi}/claude-code/index.mdx:8`: bỏ khối `image:` (2 dòng `image:` + `file:`) để Starlight splash dùng layout không ảnh; xóa `src/assets/houston.webp`. Run `npm run build` → xanh, `npm run preview` mở `/en/claude-code/` xem hero còn đẹp; nếu xấu, thay bằng `public/og-image.png` (`file: ../../../../../public/og-image.png` không hợp lệ — copy sang `src/assets/hero.png` rồi trỏ `file: ../../../../assets/hero.png`).

- [ ] **Step 4: "55" → "64"**

Run: `grep -rn "55" src/content/docs/*/claude-code/phase-16-real-world-mastery/ | grep -i "module"` — sửa từng chỗ thành 64. Ở 16.1 ~198,202 câu "100% real examples": đổi thành "drawn from real projects and Anthropic's published case studies" (16.1 sẽ rewrite ở Wave 2; đây chỉ bỏ claim sai).

- [ ] **Step 5: Lint, build, commit, PR-C**

Run: `npm run lint:course; npm run build 2>&1 | tail -3`
Expected: lint chỉ còn errors thuộc Wave 1 (blacklist 11.2/11.3/11.5/15.x/2.3/2.5, `frontmatter-recommended` là warn). Ghi số vào PR.

```bash
git add -A src/content/docs src/assets
git commit -m "fix(content): missing solutions, 12.3 description, hero image, 64-module count

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git push -u origin feat/audit-w0-quickwins
gh pr create --base develop --title "fix(content): audit wave 0 mechanical quick-wins (EN+VI)" --body "$(cat <<'EOF'
## Summary
Audit Phụ lục B mục 1-13 (trừ 7-8 thuộc PR-B): nested fences → 4 backticks, 729 bare fences → `text`, 8th H2, `##` in fences, replacement table, Esc vs Ctrl+C by hand, editorial leftovers, VI 7.1 invented flags, 5 missing solutions, 12.3 description, hero image, 64-module count in 16.x.

Lint after: <paste tail -1>. Remaining errors are Wave 1 rewrites (11.2/11.3/11.5/15.x/2.3/2.5).

Spec §3.1 W0-C.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## PR-B — CLAUDE.md, templates, registry, metadata (`feat/audit-w0-meta`, tạo sau khi PR-C merge)

### Task 10: `templates/` từ 2.5

**Files:**
- Create: `templates/README.md`, `templates/claude-md-security-example.md`, `templates/security-checklists.md`, `templates/onboarding-security.md`
- Modify: `src/content/docs/{en,vi}/claude-code/phase-02-security/05-system-control.md` (đoạn ~1320-1323 "templates available in course repository")

- [ ] **Step 1: Tìm 3 document trong 2.5**

Run: `grep -n "^#\|^````\?markdown" src/content/docs/en/claude-code/phase-02-security/05-system-control.md | sed -n 1,80p` — xác định 3 khối: CLAUDE.md security example (DEMO), security checklists (PRACTICE/CHEAT SHEET), onboarding doc (REAL CASE). Audit ghi 3 khối này lặp ~60% module.

- [ ] **Step 2: Tạo file**

Copy **một** bản đầy đủ nhất của mỗi khối (nội dung bên trong fence, không kèm fence) vào file tương ứng dưới `templates/`, thêm header 3 dòng: tiêu đề, "Source: Module 2.5", ngày. `templates/README.md` liệt kê 3 file + 1 câu mô tả mỗi file, và ghi "More templates land here as modules are rewritten (see CLAUDE.md § Directory Layout)".

- [ ] **Step 3: Sửa link trong 2.5**

EN ~1320-1323 và VI tương ứng: thay "templates available in course repository" bằng link tuyệt đối GitHub: `https://github.com/ShipWithAI/claude-code-mastery/tree/develop/templates` (kiểm tra remote bằng `git remote -v`; nếu repo khác, dùng URL đúng). **Chưa** cắt các bản lặp trong 2.5 — đó là W1-6.

- [ ] **Step 4: Commit**

```bash
git add templates src/content/docs
git commit -m "docs(templates): extract security templates from Module 2.5

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Registry nguồn Anthropic

**Files:**
- Create: `docs/references/anthropic-sources.md`

- [ ] **Step 1: Viết registry** — bảng từ spec §9.1 (S1–S15), mỗi entry: ID, URL, ngày, 3-5 quote ngắn nguyên văn EN, "Dùng cho module". Thêm phần đầu:

```markdown
# Anthropic sources registry

Single source of truth for every "Anthropic recommends / Anthropic does X" claim in the course.
Modules cite entries by ID (e.g. `(S1)`) and link here. Update URL/date here, not in modules.
Rule: only numbers that appear verbatim on these pages may be quoted in the course.

| ID | URL | Date | Key quotes | Used by |
|---|---|---|---|---|
| S1 | https://code.claude.com/docs/en/best-practices | living (fetched 2026-09-21) | "Give Claude a check it can run: tests, a build, a screenshot to compare." · "If you can't verify it, don't ship it." · "Would removing this cause Claude to make mistakes?" · "If you've corrected Claude more than twice on the same issue… /clear and start fresh." | 3.1, 4.2, 6.2, 7.2, 8.2, 8.4, 9.3, 11.1, 14.3 |
| S2 | https://claude.com/blog/how-anthropic-teams-use-claude-code | 2025-07-24 | "First stop for any programming task." · stack-trace analysis ~3× faster (Security) · ~80% reduction in research time (Inference) · ~20 minutes saved during outage (Data Infra) | 5.3, 9.3, 13.3, 16.2 |
| S3 | https://claude.com/blog/the-ai-native-sdlc-playbook | 2026-08-21 | "Code is no longer the bottleneck — the human-speed steps around it are." · "A skill is a control, though an advisory one." · "A hook is the deterministic layer behind it." · "The agent that wrote the code has no way to approve it." · "Humans remain accountable for every decision that requires judgment." | 1.2, 6.3, 10.2, 10.3, 11.3, 15.3, 16.1 |
| S4 | https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle | 2026-07-21 | "Claude authors about 80% of the code merged into our codebase today." · "ship 8x as much code per quarter as they did from 2021 to 2025." · "Give every agent a single-purpose identity with the minimum permissions for its job." · "Every automated approval, tool call, and agent-to-agent message is logged… and lands in our SIEM." | 2.4, 10.5, 10.6 |
```
…tiếp S5–S15 với quote lấy từ spec §9.1 (copy nguyên văn, không viết lại). Cuối file: mục "Excluded (no primary source)" liệt kê Boris Cherny thread, "90% code", "54% PR", "Cowork 4 engineers 10 days".

- [ ] **Step 2: Commit**

```bash
git add docs/references/anthropic-sources.md
git commit -m "docs(references): Anthropic sources registry for course citations

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: CLAUDE.md + CLAUDE.vi.md của course

**Files:**
- Modify: `CLAUDE.md` (dòng 18-67 layout, 20 và 71 "55", 248-283 accuracy rules, 201-247 writing rules, 87-199 template frontmatter)
- Modify: `CLAUDE.vi.md` song song

- [ ] **Step 1: COURSE STRUCTURE + Directory Layout** (`CLAUDE.md:18-67`)

Thay khối cây thư mục bằng cây thật:
```
claude-code-mastery/
├── CLAUDE.md / CLAUDE.vi.md      ← project rules (EN / VI)
├── README.md, SUMMARY.md, COURSE-INDEX.md, CONTRIBUTING.md
├── astro.config.mjs               ← Starlight site (sidebar autogenerated per phase dir)
├── src/content/docs/
│   ├── en/claude-code/            ← index.mdx, cheat-sheet.mdx, tips-tricks.mdx, phase-01…16/
│   └── vi/claude-code/            ← identical structure, parallel authoring
├── templates/                     ← CLAUDE.md templates, checklists (linked from modules)
├── scripts/
│   ├── lint-course.mjs            ← npm run lint:course (H2=7, fences, blacklist, words, pairs)
│   ├── fix-course.mjs             ← mechanical fixes (fence-lang, fence-nest, replace)
│   ├── lint-course.config.json, course-replacements.json
│   └── check-design-tokens.sh, sync-design-tokens.sh
├── docs/
│   ├── audit/                     ← course audits (2026-09-21-course-audit.md)
│   ├── references/                ← anthropic-sources.md (citation registry)
│   └── superpowers/{specs,plans}/ ← design specs & implementation plans
└── .github/workflows/lint-course.yml
```
"55 Modules" → "64 Modules" ở dòng 20 và 71. Xóa mục "Build commands" cũ (`./scripts/build-pdf.sh …`) trong `## COMMANDS FOR CLAUDE CODE`, thay bằng:
```bash
npm run dev            # local site
npm run build          # must pass before PR
npm run lint:course    # must pass (errors) before PR; warnings tracked per wave
npm test               # unit tests (lint parser + mermaid styles)
```

- [ ] **Step 2: MODULE TEMPLATE frontmatter** — trên `# Module X.Y` trong template thêm:
```yaml
---
title: '[Module Title]'
description: '[One sentence]'
verified: YYYY-MM-DD          # date the commands/outputs were last run against Claude Code
claude_version: X.Y.Z         # output of `claude --version` on that date
---
```

- [ ] **Step 3: WRITING RULES → thêm mục "Seven principles (audit 2026-09)"** — copy 7 nguyên tắc từ spec §2 (dịch sang EN cho CLAUDE.md, giữ VI cho CLAUDE.vi.md), mỗi nguyên tắc 1-2 dòng. Thêm dòng: "When claiming 'Anthropic recommends/does X', cite `docs/references/anthropic-sources.md` by ID."

- [ ] **Step 4: TECHNICAL ACCURACY RULES** — xóa hai mục "Commands Known to Exist" và "Commands That Need Verification" (`CLAUDE.md:266-283`); thay bằng:
```markdown
### Source of truth
- Official docs: https://code.claude.com/docs (fetch the page; do not rely on memory).
- Inventory snapshot used by the 2026-09 audit: `docs/audit/2026-09-21-course-audit.md` Appendix A.
- Every command/flag/setting key in a module must be traceable to a docs page named in the PR.
  If it isn't, mark it `⚠️ Needs verification`.
- Every `claude -p` that edits files or runs commands must carry `--permission-mode` or
  `--allowedTools`; headless runs are denied otherwise.
- `Esc` interrupts the turn (session kept). `Ctrl+C` twice exits. `/context` shows context
  occupancy; `/cost` shows spend.
```

- [ ] **Step 5: QUALITY CHECKLIST** — thêm 4 dòng: `verified`/`claude_version` có; `npm run lint:course` không error; mọi `claude -p` ghi file có permission flag; practice Anthropic (nếu có) cite registry ID.

- [ ] **Step 6: CLAUDE.vi.md** — áp cùng thay đổi bằng tiếng Việt (giữ lệnh/thuật ngữ EN). Diff hai file bằng `diff <(grep -c '' CLAUDE.md) <(grep -c '' CLAUDE.vi.md)` chỉ để đảm bảo độ dài tương đương ±15%.

- [ ] **Step 7: Commit**

```bash
git add CLAUDE.md CLAUDE.vi.md
git commit -m "docs(claude-md): real repo layout, 64 modules, seven principles, source-of-truth rules

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: README/metadata baseline + version + PR-B

**Files:**
- Modify: `README.md:15,80` và badge version; `package.json` version; `CONTRIBUTING.md` (thêm lint)

- [ ] **Step 1: README**
- Dòng 15: `**16 Phases · 64 Modules · English + Tiếng Việt**` (bỏ "136 Lessons" nếu không đếm được — grep `Lessons` để xem có nguồn; nếu không, xóa).
- Dòng 80: "55+ in-depth modules" → "64 in-depth modules".
- Badge version `1.0` → `1.1.1`.
- Ngay dưới badges thêm: `> Verified against **Claude Code v2.1.278** (2026-09). Mechanics (commands, flags, config files) are checked against https://code.claude.com/docs; see docs/audit/ for the latest audit.`

- [ ] **Step 2: CONTRIBUTING.md** — trong "New Content" thêm bullet: "Run `npm run lint:course` and `npm run build` before opening a PR; both run in CI."

- [ ] **Step 3: `package.json`** `"version": "1.1.1"`.

- [ ] **Step 4: Lint, build, commit, PR-B**

```bash
npm run lint:course | tail -1; npm run build 2>&1 | tail -2
git add README.md CONTRIBUTING.md package.json
git commit -m "chore: v1.1.1 — audit wave 0 baseline (verified against Claude Code v2.1.278)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git push -u origin feat/audit-w0-meta
gh pr create --base develop --title "docs: audit wave 0 — CLAUDE.md, templates, sources registry, v1.1.1" --body "$(cat <<'EOF'
## Summary
- `templates/` extracted from Module 2.5 (spec W0-D)
- `docs/references/anthropic-sources.md` citation registry (spec W0-F / §9.1)
- CLAUDE.md + CLAUDE.vi.md: real layout, 64 modules, seven principles, source-of-truth rules (W0-B)
- README baseline line, version 1.1.1 (W0-E)

After merge: tag v1.1.1 from main per release flow.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Release v1.1.1** (sau khi PR-B merge): `git checkout main && git merge --no-ff develop && git tag v1.1.1 && git push origin main --tags && git checkout develop && git merge main && git push` — theo flow commit `7d6cb25`. Chỉ làm khi tác giả xác nhận.

---

## Self-review (đã chạy khi viết plan)

- Spec §3.1 W0-A → Task 1-5 (parser, checks, pairs/CLI, fixer, CI). Rule "`##` trong code block" tinh chỉnh: chỉ fail trong fence không phải markdown. Rule EN/VI extension hạ thành warn. Word max = warn (config `maxLevel`) đến hết Wave 2.
- W0-B → Task 12. W0-C mục 1-6, 9-12 → Task 6-9; mục 7-8 → Task 9 (16.x, hero) và Task 13 (README). W0-D → Task 10. W0-E → Task 13. W0-F → Task 11.
- Không placeholder: mọi step có lệnh/nội dung cụ thể; các chỗ "số dòng ~" là do audit ±3 và đã kèm lệnh grep để định vị.
- Tên hàm nhất quán: `parseDoc`, `countWords`, `checkDoc`, `loadConfig`, `checkPairs`, `fixFenceLang`, `fixFenceNest`, `applyReplacements`.
