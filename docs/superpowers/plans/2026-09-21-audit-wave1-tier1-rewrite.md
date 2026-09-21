# Audit Remediation — Wave 1 (Tier 1 Rewrite) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Viết lại 7 nhóm module đang dạy hệ thống không tồn tại hoặc phủ nhận feature native (audit §4A, §9 Tier 1) — Hooks, Agent SDK, Skills/Plugins, Phase 7 multi-agent, Think/Plan, Permissions/System Control, MCP — thành nội dung khớp Claude Code v2.1.278, EN + VI, mỗi module có output từ session thật và lồng practice của Anthropic theo spec §9.3.

**Architecture:** Mỗi task = một PR độc lập (EN + VI cùng PR). Quy trình cố định 8 bước (fetch docs → draft EN → chạy lab → paste output → draft VI → lint/build → reviewer subagent đối chiếu docs → PR). Một lab project dùng chung (`~/cc-lab`) tạo ở Task 0. Registry `docs/references/anthropic-sources.md` (Wave 0) là nguồn duy nhất cho mọi trích dẫn Anthropic.

**Tech Stack:** Claude Code v2.1.278 (đã login trên máy dev), Node 22, `gh`, `jq`, Astro/Starlight build, `npm run lint:course` (Wave 0).

**Spec:** `docs/superpowers/specs/2026-09-21-course-audit-remediation-design.md` §3.2 (W1-1…W1-7), §4 (Definition of Done), §5 (quy trình), §9.3 (mapping Anthropic). Audit: `docs/audit/2026-09-21-course-audit.md` §4A, §6, Phụ lục A.

## Global Constraints

- **Điều kiện tiên quyết**: Wave 0 đã merge (lint script, registry, CLAUDE.md mới, templates/).
- Mỗi module EN 800–1500 từ (không tính code), VI được +10%; tuyệt đối ≤ 2200. Lint `words-max` là warn nhưng module Wave 1 **phải** ≤ 1500 (DoD spec §4).
- Frontmatter bắt buộc: `title`, `description`, `verified: 2026-MM-DD`, `claude_version: 2.1.278` (lấy từ `claude --version` ngày viết; nếu đã lên version mới, dùng version mới và ghi vào PR).
- Mọi lệnh/flag/key/event phải có trong docs page được fetch ở bước 1 của task. Không có → không dạy, hoặc `⚠️ Needs verification` kèm lý do. Đặc biệt các mục spec §9.1 liệt kê "cần verify tận trang": `/goal`, `/verify`, `/batch`, `/btw`, `PostFileEdit`, `TaskCompleted`, `--teammate-mode`, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`, hook type `http`/`mcp_tool`, `--advisor`.
- Mọi "Expected output" chạy thật trong `~/cc-lab`, dán nguyên (rút gọn bằng `…` được), kèm dòng `# Output may vary` ở đầu block.
- Mọi `claude -p` ghi file/chạy lệnh phải có `--permission-mode acceptEdits` hoặc `--allowedTools "…"`. `--dangerously-skip-permissions` chỉ xuất hiện kèm câu "only inside a sandbox/container".
- Esc = interrupt; Ctrl+C ×2 = exit. `/context` = occupancy; `/cost` = spend.
- Trích dẫn Anthropic: dạng `(S1)` + link `docs/references/anthropic-sources.md`; số liệu nguyên văn + ngày.
- Không nhân vật "Susan". REAL CASE giữ case sẵn có nếu audit ghi "Giữ".
- Blacklist lint phải về 0 error cho file của task. Sau Wave 1, `npm run lint:course` toàn repo phải **0 error** (các blacklist còn lại đều thuộc file Wave 1).
- Branch `feat/audit-w1-<slug>` từ `develop`; commit trailer `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`; PR body kết thúc `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- Reviewer subagent ≠ writer. Reviewer verdict phải kèm URL docs page cho mỗi lệnh được xác nhận; verdict không có URL = chưa verify.

---

## Quy trình chung cho mỗi task rewrite (tham chiếu từ Task 1–7)

Mỗi task dưới đây liệt kê **nội dung riêng**; các bước cơ học giống nhau được viết đầy đủ ở đây và task chỉ gọi tên bước.

**Bước A — Fetch docs.** Với mỗi URL trong "Docs" của task: WebFetch (hoặc agent `claude-code-guide`) với prompt *"List every command, flag, setting key, file path, frontmatter field, event name and their exact syntax on this page; quote the sentence that defines each."* Lưu kết quả vào `docs/superpowers/plans/wave1-notes/<task>.md` (gitignored — thêm dòng `docs/superpowers/plans/wave1-notes/` vào `.gitignore` ở Task 0). Chỉ dùng syntax có trong notes này.

**Bước B — Draft EN.** Viết theo template CLAUDE.md, 7 block, contract nội dung của task. Mỗi lệnh trong DEMO có comment `# docs: <page slug>`. Chưa điền output.

**Bước C — Chạy lab.** `cd ~/cc-lab`, chạy từng lệnh DEMO đúng thứ tự. Với lệnh interactive (slash command, Shift+Tab), mở `claude` và ghi lại màn hình bằng copy text (không screenshot). Dán output vào block ` ```text ` ngay dưới lệnh, dòng đầu `# Output may vary`. Nếu lệnh lỗi → sửa DEMO, không sửa output.

**Bước D — Draft VI.** File VI cùng đường dẫn/extension. Parallel authoring: giữ cấu trúc 7 block và cùng số exercise; thuật ngữ EN; quote Anthropic dịch + nguyên văn EN trong ngoặc nếu <15 từ. Output block dùng chung output EN (không dịch output).

**Bước E — Lint + build.**
```bash
npm run lint:course src/content/docs/en/claude-code/<path> src/content/docs/vi/claude-code/<path>
npm run build 2>&1 | tail -3
```
Expected: 0 error cho 2 file; build xanh. Word count: `node -e "import('./scripts/lint-course/parse.mjs').then(m=>{const fs=require('fs');for(const f of process.argv.slice(1))console.log(f,m.countWords(m.parseDoc(fs.readFileSync(f,'utf8'))))})" <en> <vi>` → EN ≤ 1500.

**Bước F — Reviewer subagent.** Dispatch `oh-my-claudecode:code-reviewer` (model opus) với prompt:
> Review `<en path>` and `<vi path>` for technical accuracy against Claude Code docs. For EVERY command, flag, slash command, settings key, file path, frontmatter field, hook event and environment variable in the files: fetch the relevant page under https://code.claude.com/docs/en/ and report `OK <url>` or `WRONG <url> <what docs say>` or `NOT FOUND`. Also check: every `claude -p` that writes files has a permission flag; no `Ctrl+C` described as interrupt; every `(S<n>)` citation matches `docs/references/anthropic-sources.md` and the quoted number is verbatim; EN and VI cover the same commands and exercises. Do not rewrite the module; return a table.

Sửa mọi `WRONG`/`NOT FOUND`. Lặp F cho tới khi bảng không còn `WRONG`.

**Bước G — Commit + PR.**
```bash
git add src/content/docs/en/claude-code/<path> src/content/docs/vi/claude-code/<path>
git commit -m "rewrite(<module>): <one line> (audit W1-<n>)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git push -u origin feat/audit-w1-<slug>
gh pr create --base develop --title "rewrite(<module>): … (audit W1-<n>)" --body "<docs pages checked; audit rows closed; lint/build result; reviewer table summary>

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

---

### Task 0: Lab project + notes dir

**Files:**
- Create: `~/cc-lab/` (ngoài repo), `.gitignore` (repo) thêm `docs/superpowers/plans/wave1-notes/`

- [ ] **Step 1: Tạo lab**

```bash
mkdir -p ~/cc-lab && cd ~/cc-lab && git init -q
npm init -y >/dev/null
mkdir -p src tests .claude
cat > src/math.js <<'EOF'
export function add(a, b) { return a + b; }
export function divide(a, b) { return a / b; }
EOF
cat > tests/math.test.mjs <<'EOF'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { add } from '../src/math.js';
test('add', () => assert.equal(add(1, 2), 3));
EOF
cat > .env <<'EOF'
API_KEY=sk-FAKE-DO-NOT-USE-xxxxxxxxxxxx
EOF
printf ".env\nnode_modules\n" > .gitignore
node -e "const p=require('./package.json');p.type='module';p.scripts.test='node --test tests/';require('fs').writeFileSync('package.json',JSON.stringify(p,null,2))"
git add -A && git commit -qm "lab: initial" && claude --version
```
Expected: `2.1.278 (Claude Code)` (hoặc mới hơn — ghi lại).

- [ ] **Step 2: Kiểm tra login và permission baseline**

```bash
cd ~/cc-lab && claude -p "Reply with exactly: LAB OK" --output-format json | jq -r '.result'
claude -p "Create a file hello.txt containing hi" 2>&1 | tail -3
```
Expected: `LAB OK`; lệnh thứ hai **không** tạo file (headless không có prompt → bị deny hoặc Claude báo không có quyền). Ghi lại thông điệp thật — dùng làm output cho 7.x/11.x ("headless = pre-authorize or denied").

- [ ] **Step 3: gitignore notes + commit repo**

```bash
cd /Users/luatnq/workspace/shipwithai/claude-code-mastery
echo "docs/superpowers/plans/wave1-notes/" >> .gitignore && mkdir -p docs/superpowers/plans/wave1-notes
git add .gitignore && git commit -m "chore: ignore wave1 docs notes

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 1 (W1-1): Module 11.3 Hooks — viết lại 100%

**Files:**
- Rewrite: `src/content/docs/en/claude-code/phase-11-automation-headless/03-hooks-system.md`
- Rewrite: `src/content/docs/vi/claude-code/phase-11-automation-headless/03-hooks-system.md`
- Branch: `feat/audit-w1-hooks`

**Docs (Bước A):** `https://code.claude.com/docs/en/hooks`, `https://code.claude.com/docs/en/hooks-guide` (nếu tồn tại; 404 → bỏ), `https://code.claude.com/docs/en/settings` (mục `hooks`, `disableAllHooks`).

**Audit rows đóng:** §4A dòng 11.3; §5.2 Hooks 🔴; §6 Phase 11 dòng 11.3; §9 Tier 1 #1. Blacklist phải hết: `pre-file-write|post-…`, `.claude/hooks.json`.

**Contract nội dung EN:**

- Frontmatter: `title: 'Hooks System'`, `description` mới, `verified`, `claude_version`.
- Metadata: ~30 phút; Prerequisite Module 2.2 (permissions) — **không** phải 11.2; Outcome: "configure `PreToolUse`/`PostToolUse`/`Stop` hooks in `settings.json`, read the JSON payload on stdin, and block or annotate an action with exit code 2 / JSON output".
- **WHY**: giữ 3 nhu cầu cũ (audit, chặn `.env`, notify) + câu neo (S1): *"Use hooks for actions that must happen every time with zero exceptions"* và (S3): *"A skill is a control, though an advisory one… A hook is the deterministic layer behind it."* Nối với 2.5 thesis "CLAUDE.md is advisory".
- **CONCEPT**: (1) hooks sống trong `settings.json` (user/project/local — precedence theo docs/settings), không có file riêng; (2) cấu trúc `hooks.<Event>[].{matcher, hooks[].{type, command, timeout}}`; (3) bảng event **chỉ gồm event có trên docs page** — tối thiểu `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `UserPromptSubmit`, `SessionStart`, `SessionEnd`, `Stop`, `SubagentStart`, `SubagentStop`, `Notification`, `PreCompact`; event khác chỉ thêm nếu page liệt kê; (4) payload JSON qua **stdin** (`session_id`, `cwd`, `hook_event_name`, `tool_name`, `tool_input`, `tool_response` cho Post…) — liệt kê đúng field theo page; (5) output: exit 0 = tiếp tục, **exit 2 = block** (stderr gửi cho Claude), exit khác = lỗi không block; hoặc stdout JSON `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny|allow|ask", "permissionDecisionReason": "…"}}`, `updatedInput`, `additionalContext`, `continue`, `systemMessage` — đúng tên field theo page; (6) matcher là regex trên tool name (`Edit|Write`, `Bash`, `mcp__.*`); (7) hook types `command` / `prompt` / `agent` (mô tả 1 câu mỗi loại; `http`/`mcp_tool` chỉ nếu page có). Mermaid: `User prompt → PreToolUse hook → tool → PostToolUse hook → … → Stop hook`.
- **DEMO** (chạy thật trong `~/cc-lab`):
  1. `cat .claude/settings.json` ban đầu (không có) → tạo file với hook `PostToolUse` matcher `Edit|Write` chạy `jq -r '.tool_input.file_path' >> .claude/hook-log.txt`. Lưu ý dùng `jq` (kiểm tra `which jq`).
  2. Chạy `claude -p "Add a subtract function to src/math.js" --permission-mode acceptEdits` → `cat .claude/hook-log.txt` thấy đường dẫn.
  3. Thêm hook `PreToolUse` matcher `Edit|Write|Read` với script `.claude/hooks/protect-env.sh`:
     ```bash
     #!/usr/bin/env bash
     # Block any tool call touching .env files. Exit 2 = block, stderr goes to Claude.
     path=$(jq -r '.tool_input.file_path // .tool_input.path // empty')
     if [[ "$path" == *".env"* ]]; then
       echo "Blocked by hook: $path is a secrets file. Use .env.example instead." >&2
       exit 2
     fi
     exit 0
     ```
     `chmod +x`, rồi `claude -p "Read .env and tell me the API_KEY" --allowedTools "Read"` → output cho thấy bị chặn + Claude giải thích.
  4. `PreToolUse` matcher `Bash` với JSON output `permissionDecision: "deny"` khi `tool_input.command` khớp `git push --force` — chạy `claude -p "Run: git push --force origin main" --allowedTools "Bash"` → bị deny với reason.
  5. `Stop` hook chạy `npm test` và exit 2 nếu fail (giải thích: Stop hook exit 2 buộc Claude tiếp tục sửa; ghi rõ giới hạn theo docs nếu page nêu, ví dụ số lần block liên tiếp).
  6. `/hooks` trong session interactive: mô tả màn hình (copy text), nói rõ nó chỉ hiển thị/sửa config.
  7. Kiểm tra: `claude --debug` hoặc log — chỉ dạy nếu page nêu cách xem hook chạy; nếu không, dùng file log của hook như bước 2.
- **PRACTICE**: Ex1 = `PostToolUse` chạy `npx prettier --write "$file"` cho `Edit|Write` (S1 ví dụ "eslint after every file edit"); Ex2 = chặn `rm -rf`/`git push --force`/ghi vào `.env` bằng một script; Ex3 = `SessionEnd`/`Stop` gửi notification (`osascript` trên macOS hoặc `curl` webhook với URL giả `https://hooks.example.com/…` — **không** URL Slack thật). Mỗi Ex có ✅ Solution.
- **CHEAT SHEET**: bảng event → khi nào chạy → có block được không (Pre: có; Post: có theo docs — audit ghi "Post-hooks can't block" là sai, ghi đúng theo page); bảng exit code; bảng field JSON output.
- **PITFALLS**: ❌ `.claude/hooks.json` → ✅ `settings.json`; ❌ đọc `$1`/`CLAUDE_FILE_PATH` → ✅ stdin JSON + `jq`; ❌ exit 1 để block → ✅ exit 2; ❌ hook không có `timeout` chạy lệnh chậm → ✅ đặt `timeout`; ❌ hook script chưa `chmod +x`; ❌ tin hook như bảo mật tuyệt đối → ✅ hook cũng là code chạy với quyền của bạn — review hook của repo lạ trước khi mở (docs mục security của hooks); ❌ `disableAllHooks` bật mà quên.
- **REAL CASE**: giữ tinh thần case cũ (nếu có) nhưng tái dựng quanh 3 hook thật; thêm 2 câu (S4): Anthropic dùng hook làm gate — *"Every automated approval, tool call… is logged"* (log hook → SIEM). Không số liệu ngoài registry.
- Cross-ref: 2.2 (permissions), 2.5 (advisory vs enforced), 15.3 (skills), 8.4 (hooks-as-quality-gate).

**VI (Bước D):** cùng contract; REAL CASE có thể đổi bối cảnh sang team VN (fintech) nhưng cùng 3 hook.

- [ ] **Step 1:** Bước A — fetch 3 URL, lưu notes. Ghi rõ danh sách event và field JSON có trên page.
- [ ] **Step 2:** Bước B — draft EN theo contract (≤1500 từ).
- [ ] **Step 3:** Bước C — chạy DEMO 1-6 trong `~/cc-lab`; dán output. Sau khi xong, `git -C ~/cc-lab checkout -- . && rm -f ~/cc-lab/.claude/hook-log.txt` để lab sạch cho task sau (giữ `.claude/settings.json` mẫu trong module, xóa khỏi lab).
- [ ] **Step 4:** Bước D — VI.
- [ ] **Step 5:** Bước E — lint/build; xác nhận `grep -c "pre-file-write\|hooks.json" <en> <vi>` = 0.
- [ ] **Step 6:** Bước F — reviewer; sửa.
- [ ] **Step 7:** Bước G — commit/PR `feat/audit-w1-hooks`.

---

### Task 2 (W1-2): Module 11.2 Claude Agent SDK — rebuild

**Files:**
- Rewrite: `src/content/docs/en/claude-code/phase-11-automation-headless/02-claude-code-sdk.mdx` → đổi tên `02-claude-agent-sdk.mdx`
- Rewrite: `src/content/docs/vi/claude-code/phase-11-automation-headless/02-claude-code-sdk.md` → `02-claude-agent-sdk.mdx` (thống nhất extension)
- Modify: mọi link nội bộ tới `02-claude-code-sdk` (`grep -rn "02-claude-code-sdk" src/ COURSE-INDEX.md SUMMARY.md`)
- Modify: `astro.config.mjs` — thêm redirect `/en/claude-code/phase-11-automation-headless/02-claude-code-sdk/` → `…/02-claude-agent-sdk/` (và `/vi/…`) qua `redirects` của Astro
- Branch: `feat/audit-w1-agent-sdk`

**Docs:** `https://code.claude.com/docs/en/agent-sdk` (+ các sub-page overview/typescript/python nếu page điều hướng), `https://code.claude.com/docs/en/headless` (fallback subprocess), `https://code.claude.com/docs/en/cli-reference` (`--output-format`, `--json-schema`).

**Audit rows đóng:** §4A dòng 11.2; §5.7 Agent SDK 🔴; §4D "shell injection 11.2"; §9 #2. Blacklist hết: `from '@anthropic-ai/claude-code'`, `claude-opus-4`.

**Contract EN:**
- Title `Claude Agent SDK`; Prerequisite 11.1; Outcome: "run an agent from TypeScript or Python with `query()`, restrict tools/permissions, add an in-process MCP tool, and fall back to `claude -p --output-format json` safely".
- **WHY**: khi nào SDK thay vì `claude -p` (loop nhiều turn, tool tuỳ biến, hooks trong code, nhúng vào service). Nêu rõ SDK đổi tên 09/2025 từ "Claude Code SDK" → **Claude Agent SDK**; phân biệt với Managed Agents (Claude Platform) 1 câu.
- **CONCEPT**: loop (S7) *gather context → take action → verify work → repeat*; SDK = cùng engine Claude Code (tools, permissions, CLAUDE.md qua `settingSources`, hooks, subagents) trong process của bạn. Diagram: `your app → query() → agent loop (tools: Read/Edit/Bash/MCP) → messages stream`. Options bảng: `allowedTools`, `permissionMode`, `systemPrompt`, `mcpServers`, `hooks`, `agents`, `settingSources`, `maxTurns` — **chỉ tên option có trên page**, với kiểu dữ liệu.
- **DEMO** (lab `~/cc-lab/sdk-demo`, chạy thật):
  1. `npm i @anthropic-ai/claude-agent-sdk` (ghi version cài được vào output).
  2. `query()` TS tối thiểu: prompt "List the exported functions in src/math.js", `options: { allowedTools: ['Read', 'Glob'], permissionMode: 'default', maxTurns: 3 }`; stream message, in `result`.
  3. Cùng script nhưng `allowedTools: ['Read','Edit']`, `permissionMode: 'acceptEdits'` → thêm hàm → `git diff`.
  4. In-process tool với `tool()` + `createSdkMcpServer()` (ví dụ `get_build_status` trả JSON cố định) — chỉ nếu page có đúng API này; nếu tên khác, dùng tên trên page.
  5. Python: `pip install claude-agent-sdk`, `query()` async tương đương bước 2 (chạy thật với `python3 -m venv`).
  6. Fallback subprocess **an toàn**: `execFileSync('claude', ['-p', prompt, '--output-format', 'json', '--allowedTools', 'Read'])` + `--json-schema` để parse chắc chắn — đối lập với `execSync(\`claude -p "${prompt}"\`)` (shell injection).
- **PRACTICE**: Ex1 = script review diff `git diff main` bằng SDK, `allowedTools: ['Read','Bash(git diff *)']` (nếu syntax `Bash(...)` trong allowedTools có trên page; nếu không, `['Read']` + truyền diff trong prompt); Ex2 = giữ bài retry/concurrency cũ (Node hygiene ổn — audit "Giữ") nhưng trên `query()`; Ex3 = structured output với `--json-schema` qua subprocess.
- **CHEAT SHEET**: TS vs Python API tương đương; option table; subprocess flags.
- **PITFALLS**: ❌ `execSync` string → ✅ `execFileSync` array; ❌ `JSON.parse` free text → ✅ `--output-format json` / `--json-schema`; ❌ `permissionMode: 'bypassPermissions'` trong server → ✅ allowlist tool hẹp + sandbox; ❌ quên `maxTurns` → loop vô hạn tốn tiền; ❌ model ID cứng → ✅ alias; ❌ nhầm Agent SDK với Messages API (12.3).
- **REAL CASE**: (S9) *ít tool, mô tả tool "như cho new hire"*; (S14) C-compiler: log chi tiết ra file, giữ output in-context vài dòng — 2 câu. Case chính: service nội bộ review PR (VN team) — không số liệu bịa.
- Weave (S9, S7).

- [ ] **Step 1:** Bước A (3 URL + sub-page).
- [ ] **Step 2:** Đổi tên file EN/VI (`git mv`), cập nhật link nội bộ, thêm 2 entry vào `redirects` sẵn có ở `astro.config.mjs:87` (`'/en/claude-code/phase-11-automation-headless/02-claude-code-sdk/': '/en/claude-code/phase-11-automation-headless/02-claude-agent-sdk/'` và bản `/vi/…`), `npm run build` xanh.
- [ ] **Step 3:** Bước B.
- [ ] **Step 4:** Bước C trong `~/cc-lab/sdk-demo` (npm + venv). Ghi version SDK vào frontmatter comment hoặc câu đầu DEMO.
- [ ] **Step 5:** Bước D (VI `.mdx` — kiểm tra không có `{{`/`<` lạ; build).
- [ ] **Step 6:** Bước E; `grep -c "@anthropic-ai/claude-code'" <en> <vi>` = 0; `grep -c execSync <en> <vi>` chỉ còn trong PITFALLS (đánh dấu ❌).
- [ ] **Step 7:** Bước F.
- [ ] **Step 8:** Bước G `feat/audit-w1-agent-sdk`.

---

### Task 3 (W1-3): Modules 15.3 + 15.5 + 15.4 — Skills, Custom Skills, Plugins/Ecosystem

**Files:**
- Rewrite: `en,vi/…/phase-15-templates-skills/03-claude-code-skills.md`
- Rewrite: `en,vi/…/phase-15-templates-skills/05-custom-skill-development.md`
- Rewrite: `en,vi/…/phase-15-templates-skills/04-community-ecosystem.md`
- Branch: `feat/audit-w1-skills-plugins`

**Docs:** `https://code.claude.com/docs/en/skills`, `https://code.claude.com/docs/en/plugins`, `https://code.claude.com/docs/en/plugin-marketplaces` (nếu có), `https://code.claude.com/docs/en/slash-commands` (commands ↔ skills), `https://github.com/anthropics/skills` (README), `https://github.com/anthropics/claude-code` (README mục plugins nếu có).

**Audit rows đóng:** §4A 15.3/15.5/15.4; §5.2 Skills 🔴, Commands ❌, Plugins ❌; §9 #3. Blacklist hết: `claude skill (install|list|remove|info)`.

**Contract 15.3 (Skills):**
- Outcome: "create a project skill in `.claude/skills/<name>/SKILL.md`, invoke it with `/<name>` or let Claude auto-apply it, and inspect skills with `/skills`".
- CONCEPT: (S8) progressive disclosure 3 lớp — name+description luôn trong context → SKILL.md khi liên quan → `references/`/`scripts/` khi cần. Vị trí: `.claude/skills/` (project), `~/.claude/skills/` (user), plugin. Frontmatter **theo page**: `name`, `description`, `allowed-tools`, `disable-model-invocation`, `user-invocable`, `argument-hint`, `model`, (`context` ⚠️ nếu page có). `$ARGUMENTS`/`$1`, `` !`cmd` ``, `@file`. Quan hệ với `.claude/commands/*.md` (vẫn hỗ trợ; skill là superset).
- DEMO (lab): tạo `.claude/skills/test-file/SKILL.md` với `description: "Write a node:test file for a given source file"`, `argument-hint: "<path>"`, `allowed-tools: Read, Write`; gọi `/test-file src/math.js` trong session; xem `/skills` (copy text); thử auto-trigger bằng prompt "add tests for src/math.js"; `/skill-doctor` nếu page có.
- PRACTICE: Ex1 skill `changelog` với `disable-model-invocation: true` (side effect); Ex2 skill có `references/style.md`; Ex3 chuyển một `.claude/commands/review.md` thành skill.
- PITFALLS: ❌ `claude skill install` → ✅ copy thư mục / plugin; ❌ description mơ hồ → không auto-trigger (S9 "describe like to a new hire"); ❌ skill deploy không `allowed-tools`; ❌ nhét mọi thứ vào CLAUDE.md thay vì skill (S15 costs: giữ CLAUDE.md < 200 dòng, chuyển instruction chuyên biệt sang skills).
- REAL CASE: (S4) *"guidelines are encoded in CLAUDE.md files and references to org-wide skills"* — Anthropic dùng skill để đưa security guideline vào code lúc sinh; case VN team làm skill `vn-payment-rules`.

**Contract 15.5 (Custom Skill Development):**
- Từ 15.3 lên: cấu trúc `SKILL.md` + `scripts/` + `references/`; viết `description` để trigger đúng; test skill bằng `claude plugin eval` / `/skill-doctor` (chỉ nếu page có; nếu không, test bằng 3 prompt thật và ghi kết quả); đóng gói thành plugin `.claude-plugin/plugin.json` (skills/agents/commands/hooks/.mcp.json); `claude plugin validate`.
- DEMO chạy thật: tạo plugin `cc-lab-plugin` với 1 skill + 1 hook, `claude --plugin-dir ./cc-lab-plugin`, `/plugin` xem list.
- Deploy-skill ví dụ **phải** có `allowed-tools` hẹp + `disable-model-invocation: true`.
- PITFALLS: bảo mật skill của bên thứ ba (skill = prompt + script chạy quyền của bạn); `user-invocable: false` cho skill nội bộ.

**Contract 15.4 (Ecosystem):**
- Official plugin marketplace (`/plugin marketplace add <owner/repo>`, `/plugin install <name>@<marketplace>` — syntax theo page), `anthropics/skills`, `awesome-claude-code` (link, **không** star count), cách đánh giá plugin (đọc hooks + `.mcp.json` trước khi cài; `strictKnownMarketplaces`/`allowedMcpServers` cho team — chỉ nếu settings page có). Bỏ mọi repo/star bịa.
- DEMO: `/plugin marketplace add anthropics/claude-code` (hoặc marketplace mặc định theo page) → `/plugin install <một plugin có thật trên page>` → `/plugin` list. Nếu cần network/OAuth, ghi output thật.

- [ ] **Step 1:** Bước A (6 URL).
- [ ] **Step 2:** Bước B cho 15.3 → 15.5 → 15.4 (thứ tự phụ thuộc).
- [ ] **Step 3:** Bước C trong `~/cc-lab` (skills, plugin dir, marketplace). Dọn lab sau: `rm -rf ~/cc-lab/.claude/skills ~/cc-lab/cc-lab-plugin`.
- [ ] **Step 4:** Bước D ×3.
- [ ] **Step 5:** Bước E ×3; `grep -c "claude skill " <6 files>` = 0; `grep -ci "stars" <15.4 en/vi>` = 0.
- [ ] **Step 6:** Bước F (một reviewer cho 6 file).
- [ ] **Step 7:** Bước G `feat/audit-w1-skills-plugins` (1 PR, 3 commit — mỗi module một commit).

---

### Task 4 (W1-4): Phase 7 (7.1–7.5) — re-platform lên subagents / teams / background agents

**Files:**
- Rewrite: `en,vi/…/phase-07-multi-agent-auto/01-auto-coding-levels.md`, `02-full-auto-workflow.md`, `03-multi-agent-architecture.md`, `04-agentic-loops.md`, `05-orchestration-tools.md`
- Branch: `feat/audit-w1-phase7`

**Docs:** `https://code.claude.com/docs/en/permissions` (7 modes), `https://code.claude.com/docs/en/sub-agents`, `https://code.claude.com/docs/en/agent-teams`, `https://code.claude.com/docs/en/common-workflows` (worktrees, plan mode), `https://code.claude.com/docs/en/cli-reference` (`--bg`, `--worktree`, `--max-turns`, `--agents`, `claude agents`), `https://code.claude.com/docs/en/checkpointing`, `https://code.claude.com/docs/en/workflows` (chỉ để pointer tới 7.6 Wave 3), `https://code.claude.com/docs/en/costs` (mục agent teams).

**Audit rows đóng:** §4A dòng VI 7.1; §4B "Multi-agent (Phase 7)", "Headless ghi file", "Emergency stop", "Permission modes"; §5.1 toàn bảng (trừ Dynamic Workflows → 7.6); §6 Phase 7 (5 dòng); §9 #4.

**Contract chung Phase 7:** giữ 3 framework có tên: Risk×Familiarity matrix (7.1), PREPARE→EXECUTE→MONITOR→VERIFY (7.2), 3 pattern orchestrator/pipeline/specialist (7.3), RTAV + healthy-vs-stuck (7.4), 3-layer ladder (7.5). Mọi `claude -p` còn giữ có `--permission-mode acceptEdits` hoặc `--allowedTools`. Không "Ctrl+C". Không "No shared memory" (subagent trả summary; team có shared task list + messaging).

**7.1 Auto Coding Levels:**
- CONCEPT: 7 permission modes theo page (`default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, alias `manual`) map lên 3 "level" của course (Level 1 = default/plan, Level 2 = acceptEdits/auto, Level 3 = bypassPermissions trong sandbox). Shift+Tab cycle; `--permission-mode`; `permissions.defaultMode`. (S13) auto mode = classifier 2 lớp, 84% ít prompt nội bộ, còn 17% false-negative → không phải bypass.
- DEMO: `claude` → Shift+Tab xem mode indicator (copy text); `claude --permission-mode plan -p "…"`; `.claude/settings.json` `"permissions": {"defaultMode": "acceptEdits"}`; prompt thật khi Claude xin quyền (3 lựa chọn "Yes / Yes, don't ask again for … / No, tell Claude what to do differently" — copy nguyên văn từ session). `--dangerously-skip-permissions` là thật (bỏ ⚠️) + câu sandbox.
- PITFALLS: ❌ `[y]/[a]/[n]` prompt (không tồn tại); ❌ bypass ngoài sandbox; ❌ auto mode = "an toàn tuyệt đối".

**7.2 Full Auto Workflow:**
- PREPARE: boundary bằng `permissions.deny` + `PreToolUse` hook (11.3) + `--worktree` + `--max-turns`, **không** bằng câu "please don't touch X" (advisory). (S1) "Let Claude interview you" → SPEC.md → fresh session; *"Time spent making the spec precise pays off more than time spent watching the implementation."*
- MONITOR: Esc để ngắt; `/rewind` (Esc Esc) để quay checkpoint — ghi giới hạn checkpoint không track Bash (S15).
- VERIFY: (S1) *"Give Claude a check it can run"*; `git diff [forbidden paths]` giữ.
- DEMO: `claude --worktree auto-demo --permission-mode acceptEdits` với task nhỏ; `settings.json` deny `Edit(./src/legacy/**)`; thử vi phạm → bị chặn; `/rewind` menu (copy text).

**7.3 Multi-Agent Architecture:**
- CONCEPT: (S5) workflows vs agents; map 3 pattern course ↔ 5 pattern Anthropic: orchestrator-worker ↔ orchestrator-workers (parallel subagents); pipeline ↔ prompt chaining (chained subagents; pointer 7.6 Dynamic Workflows); specialist ↔ evaluator-optimizer / agent teams. Bỏ diagram "kiến trúc nội bộ" bịa; thay bằng diagram: main session → Agent tool → subagent (own context, returns summary ~1-2K tokens (S6)) / team (shared tasks + messages).
- Subagent file `.claude/agents/<name>.md` với frontmatter **theo page**: `name`, `description`, `tools`, `model`, `permissionMode`, (`skills`, `memory`, `isolation`, `maxTurns` nếu page có). Built-in Explore/Plan/general-purpose. `/agents`. Gọi bằng "Use the <name> subagent to …" hoặc `@"<name> (agent)"` nếu page nêu.
- Agent teams: enable theo page (env/setting **đúng tên trên page**; spec ghi ⚠️ `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`), khi nào dùng team vs subagent (page: research/review song song, module tách rời, competing hypotheses; **không** cho sequential/same-file). Chi phí (S15/S10): team ~7× token, multi-agent ~15× chat.
- DEMO: tạo `.claude/agents/test-writer.md` (`tools: Read, Write, Bash`, `model: sonnet`), prompt "Use the test-writer subagent to add tests for src/math.js"; `/agents` list; 2 subagent song song ("use two subagents: one lists exports, one lists TODOs"); nếu teams bật được trên máy → demo spawn 2 teammate, ngược lại mô tả theo page + ⚠️ "experimental, disabled by default".
- PRACTICE: Ex1 subagent `security-reviewer` read-only (`tools: Read, Grep, Glob`); Ex2 orchestrator dùng 3 subagent trả JSON summary; Ex3 (S1) Writer/Reviewer: session A implement, session B (`--worktree`) review với fresh context.

**7.4 Agentic Loops:**
- RTAV giữ; healthy-vs-stuck thêm signals từ (S12): "early victory declaration", "premature completion", "unacceptable to remove or edit tests"; (S14) *"the task verifier is nearly perfect, otherwise Claude will solve the wrong problem"*.
- Mechanics: `--max-turns`, `Stop` hook chạy test (11.3), `/loop` (chỉ nếu page có), Esc, `/rewind`. Bỏ Ctrl+C.
- DEMO: `claude -p "Make npm test pass" --permission-mode acceptEdits --max-turns 5 --output-format json` với test cố tình fail; đọc `num_turns`/`result` trong JSON (field theo page); Stop hook exit 2 khi test fail → thấy Claude tiếp tục.
- REAL CASE: giữ case cũ (audit "REAL CASE tốt nhất phase").

**7.5 Orchestration Tools:**
- Ladder mới: bash `-p` fan-out (S1: `for file in $(cat files.txt); do claude -p "…" --allowedTools "Edit,Bash(git commit *)"; done`, thử 2-3 file trước) → subagents → agent teams → background agents (`claude --bg`, `claude agents`, `claude attach|logs|stop <id>` — syntax theo cli-reference) → Dynamic Workflows (pointer 7.6) → Agent SDK (11.2). Bỏ "90% bash đủ".
- Sửa GHA snippet: `actions/checkout@v4`, `upload-artifact@v4`, dùng `anthropics/claude-code-action@v1` (pointer 11.4 Wave 2) — hoặc bỏ GHA khỏi 7.5 nếu vượt 1500 từ.
- DEMO: fan-out 3 file với `-p` + `--allowedTools`; `claude --bg -p "…"` rồi `claude agents` + `claude logs <id>` (nếu có trên page).
- CHEAT SHEET: bảng "khi nào dùng gì" (S15 sub-agents/agent-teams/workflows "when to use").

- [ ] **Step 1:** Bước A (8 URL). Ghi rõ: tên env/setting bật teams; frontmatter subagent; syntax `claude agents`; field JSON output `-p`.
- [ ] **Step 2:** Bước B cho 7.1 → 7.2 → 7.3 → 7.4 → 7.5 (mỗi ≤1500 từ).
- [ ] **Step 3:** Bước C — lab: `.claude/agents/`, worktree, `--max-turns`, Stop hook, `--bg`. Dọn: `git -C ~/cc-lab worktree prune`, xóa `.claude/agents`, reset settings.
- [ ] **Step 4:** Bước D ×5 — VI 7.1/7.3/7.4 viết lại **song song EN mới** (bỏ "Agent Lifecycle", "Debugging Multi-Agent", "Termination Checklist" trừ khi đưa vào EN).
- [ ] **Step 5:** Bước E ×5; `grep -c "Ctrl+C" <10 files>` chỉ ở ngữ cảnh exit; `grep -n "claude -p" <10 files>` mỗi dòng có `--permission-mode` hoặc `--allowedTools`.
- [ ] **Step 6:** Bước F (reviewer cho 10 file; có thể chia 2 reviewer).
- [ ] **Step 7:** Bước G `feat/audit-w1-phase7` — 5 commit, 1 PR.

---

### Task 5 (W1-5): Modules 6.1 + 6.2 + 6.3 — Thinking & Plan Mode native

**Files:**
- Rewrite: `en/…/phase-06-thinking-planning/01-think-mode.mdx`, `vi/…/01-think-mode.md` → `01-think-mode.mdx`
- Rewrite: `en,vi/…/02-plan-mode.md`, `03-think-plan-combo.md`
- Branch: `feat/audit-w1-think-plan`

**Docs:** `https://code.claude.com/docs/en/common-workflows` (plan mode, extended thinking), `https://code.claude.com/docs/en/best-practices` (Explore→Plan→Implement→Commit; "let Claude interview you"), `https://code.claude.com/docs/en/cli-reference` (`--effort`, `--permission-mode plan`), `https://code.claude.com/docs/en/settings` (`effortLevel`, `permissions.defaultMode`, `alwaysThinkingEnabled` ⚠️), `https://code.claude.com/docs/en/interactive-mode` (shortcuts Shift+Tab, Option+T, Ctrl+O, Ctrl+G nếu có), `https://code.claude.com/docs/en/model-config` (`opusplan`).

**Audit rows đóng:** §4A 6.2, 6.1; §5.5 `/effort`, thinking toggle; §6 Phase 6 (D → A); §9 #5.

**Contract 6.1 Think Mode:**
- CONCEPT: thinking mặc định bật (theo page); toggle Option+T; xem thinking Ctrl+O (nếu page có); `ultrathink` là keyword thật (bỏ "community term"); `/effort low|medium|high|xhigh|max` + `--effort` + `effortLevel` (giá trị theo page — nếu page không có `xhigh`/`max`, bỏ); `MAX_THINKING_TOKENS`. **Xóa** thang "think about this / think step by step / think carefully = Level 1-3" và "/think may exist". Giữ Think-vs-act matrix (đổi trục "level" thành effort).
- DEMO: `/effort` trong session (copy text); `claude --effort high -p "…" --output-format json` so với `low` — so **độ dài/nội dung** output, **không** bịa token count; Option+T toggle (copy text indicator); Ctrl+O.
- PITFALLS: ❌ "add 'think step by step' để bật thinking" → ✅ thinking đã bật, dùng `/effort`; ❌ fake "thinking tokens: 2,768"; ❌ compact giữa think và act (thinking không carry qua compact — nói đúng theo page hoặc bỏ claim).
- REAL CASE: giữ SBV/VND.

**Contract 6.2 Plan Mode:**
- CONCEPT: **native** — Shift+Tab cycle tới `plan`, `claude --permission-mode plan`, `permissions.defaultMode: "plan"`; trong plan mode Claude chỉ đọc/khám phá, đề xuất plan, bạn duyệt rồi thoát plan mode để thực thi; plan file/`Ctrl+G` mở plan trong editor (nếu page có); alias `opusplan` (plan bằng Opus, thực thi bằng Sonnet — theo page). PCE loop giữ tên, map: Plan = plan mode; Challenge = "review the plan, what could go wrong?"; Execute = thoát plan mode. (S1) *"If you could describe the diff in one sentence, skip the plan."* (S3) Design → `spec.md`: "let Claude interview you" → SPEC.md → fresh session.
- DEMO: `claude --permission-mode plan` → prompt "Add input validation to divide() in src/math.js" → copy plan text → duyệt → Shift+Tab → thực thi → `git diff`. `/rewind` nếu plan sai. Bỏ `:63-75` "Do NOT write code" (thừa) và `:369` compact giữa plan/execute.
- PRACTICE: Ex1 plan mode cho refactor 3 file; Ex2 interview → SPEC.md → session mới; Ex3 challenge-the-plan giữ.

**Contract 6.3 Combo:**
- Mode-decision matrix giữ, các ô trỏ tới feature thật: effort × plan mode × permission mode. (S1) "Use plan mode when: uncertain approach / multi-file / unfamiliar code; skip when scope is a one-sentence fix". Sửa `:342` compact-giữa-Think-và-Plan.

- [ ] **Step 1:** Bước A (6 URL). Ghi giá trị `/effort` thật, tên shortcut thật.
- [ ] **Step 2:** `git mv` VI 6.1 → `.mdx`; build.
- [ ] **Step 3:** Bước B ×3.
- [ ] **Step 4:** Bước C (plan mode, effort, toggle — interactive; copy text).
- [ ] **Step 5:** Bước D ×3 (VI 6.1 bỏ cột "ultrathink 4-5x cost" bịa).
- [ ] **Step 6:** Bước E; `grep -ci "not a toggle\|may exist\|community term" <6 files>` = 0.
- [ ] **Step 7:** Bước F.
- [ ] **Step 8:** Bước G `feat/audit-w1-think-plan`.

---

### Task 6 (W1-6): Modules 2.2 + 2.5 — Permissions thật, System Control cắt 60%

**Files:**
- Rewrite: `en,vi/…/phase-02-security/02-permission-system.md`
- Rewrite: `en,vi/…/phase-02-security/05-system-control.md` (3.989 → ≤1.500 từ EN)
- Modify: `templates/*.md` (Wave 0 đã tách; cập nhật nếu nội dung đổi)
- Branch: `feat/audit-w1-permissions`

**Docs:** `https://code.claude.com/docs/en/permissions`, `https://code.claude.com/docs/en/settings` (precedence, `permissions.*`, managed settings path, `disableBypassPermissionsMode`), `https://code.claude.com/docs/en/security`, `https://code.claude.com/docs/en/sandboxing` (chỉ pointer tới 2.3 Wave 2), `https://code.claude.com/docs/en/hooks` (PreToolUse làm enforcement — đã có 11.3).

**Audit rows đóng:** §4A 2.2 allowlist, `claude config`, prompt `[Approve…]`; §5.4 `permissions.allow/deny/ask` 🔴, 7 modes, precedence, `/permissions`; §4D 2.5 dài + lặp + fence; §9 #6. Blacklist hết: `--network[= ]none` trong 2.5, `claude config`.

**Contract 2.2 Permission System:**
- CONCEPT: rule syntax **theo page**: `Bash(git status:*)`, `Bash(npm run *)`, `Read(./.env)`, `Read(~/.ssh/**)`, `Edit`, `Write`, `WebFetch(domain:…)`, `mcp__server__tool`; ba danh sách `allow` / `deny` / `ask`; nơi đặt và precedence (managed > `--settings` > `.claude/settings.local.json` > `.claude/settings.json` > `~/.claude/settings.json` — xác nhận trên page); 7 modes + Shift+Tab; `/permissions` UI; prompt thật 3 lựa chọn; "Read the full command" giữ; approval fatigue giữ + (S13) 84% ít prompt với sandbox, classifier auto mode 2 lớp. Bash-tool vs file-tool: Read không prompt trong cwd (theo page security) → threat model. Xóa `lsp_diagnostics` (OMC). Enforcement ladder: `deny` rule → `PreToolUse` hook → sandbox → managed settings `disableBypassPermissionsMode`.
- DEMO (lab): `.claude/settings.json` với `allow: ["Bash(npm test:*)", "Read"]`, `deny: ["Read(./.env)", "Bash(git push --force:*)"]`; `claude -p "cat .env" --allowedTools Bash` → bị deny (output thật); `claude -p "run npm test"` → không hỏi; `/permissions` (copy text); prompt thật khi chạy lệnh ngoài allowlist; `claude --permission-mode acceptEdits`; kiểm tra precedence bằng `.local.json` đè `deny`.
- PRACTICE: Ex1 viết allow/deny cho project KMP/Node; Ex2 chuyển "Level 2" thành `defaultMode: acceptEdits` + deny; Ex3 (audit) solution là **deny list**, không phải "hỏi Claude có đọc được không".
- PITFALLS: ❌ `{"allowlist": [...]}`; ❌ `claude config set`; ❌ tin CLAUDE.md "NEVER read .env" → ✅ `deny`; ❌ `bypassPermissions` ngoài container; ❌ allow `Bash(*)`.
- REAL CASE: giữ force-push case, thêm cách deny rule sẽ chặn nó.

**Contract 2.5 System Control:**
- Cắt về ≤1500: giữ thesis "advisory, not enforced", 5-layer failure table, checklists rút gọn (link `templates/`), case Khoa Đà Nẵng. **Xóa** 3 document lặp (đã ở `templates/`), `claude config`, sandbox.sh `--network=none`, prompt "Read .env Allow?", "40% productivity boost". Dạy **một** enforced control end-to-end: `deny` + `PreToolUse` hook + verify (chạy lệnh vi phạm → thấy chặn). (S3) "Humans remain accountable for every decision that requires judgment." (S13) containment ở environment layer trước.
- DEMO: 5 bước: settings deny → hook → thử vi phạm → `/permissions` audit → checklist hàng ngày (link templates).
- H2 = 7; bỏ "Phase 2 Complete" H2 (Wave 0 đã hạ H3; có thể xóa hẳn).

- [ ] **Step 1:** Bước A (5 URL). Ghi rule syntax + precedence nguyên văn.
- [ ] **Step 2:** Bước B 2.2 rồi 2.5.
- [ ] **Step 3:** Bước C (deny/allow/precedence/`/permissions`).
- [ ] **Step 4:** Bước D ×2 (VI 2.5 từ 4.242 → ≤1.650).
- [ ] **Step 5:** Bước E; word count 2.5 EN ≤1500; `grep -c "allowlist\|claude config\|network=none\|lsp_diagnostics" <4 files>` = 0.
- [ ] **Step 6:** Bước F (yêu cầu reviewer thêm mục "security overclaim check": không câu nào nói "Claude cannot X" trừ khi page nói).
- [ ] **Step 7:** Bước G `feat/audit-w1-permissions`.

---

### Task 7 (W1-7): Module 11.5 MCP

**Files:**
- Rewrite: `en,vi/…/phase-11-automation-headless/05-mcp.md`
- Branch: `feat/audit-w1-mcp`

**Docs:** `https://code.claude.com/docs/en/mcp`, `https://code.claude.com/docs/en/settings` (`enabledMcpjsonServers`, `enableAllProjectMcpServers`, `allowedMcpServers`), `https://code.claude.com/docs/en/permissions` (`mcp__server__tool`), `https://modelcontextprotocol.io/` (định nghĩa 1 câu), `https://github.com/modelcontextprotocol/servers` (trạng thái server archived).

**Audit rows đóng:** §4A 11.5; §5.9 toàn bảng; §4D hard-code token; §9 #7. Blacklist hết: `claude_desktop_config`.

**Contract EN:**
- CONCEPT: MCP = tool/resource/prompt qua transport `stdio`/`http` (`sse` deprecated nếu page nói); scope `local`/`project`/`user`; `.mcp.json` (project, commit được) với `${VAR}`/`${VAR:-default}`; `/mcp` = status + OAuth; permission `mcp__<server>__<tool>`; `@server:resource`; `/mcp__server__prompt`; `MAX_MCP_OUTPUT_TOKENS`; `--strict-mcp-config`; deferred tool loading (nếu page). (S15 costs) "prefer CLI tools (gh, aws) over MCP when a CLI exists"; (S9) ít tool giá trị cao.
- DEMO (lab): `claude mcp add --transport stdio fs -- npx -y @modelcontextprotocol/server-filesystem ~/cc-lab` (kiểm tra package còn tồn tại; nếu archived, dùng server khác trên page docs — ví dụ http server trên page); `claude mcp list`, `claude mcp get fs`; `.mcp.json` với `${GITHUB_TOKEN}` (giá trị **không** trong file); `/mcp` (copy text); gọi tool trong session → prompt permission `mcp__fs__read_file`; allow rule trong settings; `claude mcp remove fs`. Playwright/DevTools MCP giữ như ví dụ (audit "Giữ") nếu package trên page.
- PRACTICE: Ex1 add http server có OAuth (theo ví dụ trên page, ví dụ `claude mcp add --transport http notion https://mcp.notion.com/mcp` từ S1) → `/mcp` login; Ex2 `.mcp.json` team + `enabledMcpjsonServers`; Ex3 giới hạn tool bằng deny `mcp__fs__write_file`.
- PITFALLS: ❌ sửa `claude_desktop_config.json`; ❌ `npm i -g @modelcontextprotocol/server-sqlite` (không có/archived); ❌ hard-code `ghp_…` trong `.mcp.json` commit → ✅ `${GITHUB_TOKEN}`; ❌ "Claude never sees raw credentials" → ✅ tool output có thể chứa credential, deny/filter; ❌ cài 10 server = 10× tool description trong context (`/context` xem); ❌ prompt injection qua tool output (2.1 Wave 2).
- REAL CASE: case VN: MCP tới Jira/DB nội bộ với scope project + `${VAR}` — không số liệu.

- [ ] **Step 1:** Bước A (5 URL). Ghi syntax `claude mcp add` nguyên văn, danh sách setting keys.
- [ ] **Step 2:** Bước B.
- [ ] **Step 3:** Bước C (mcp add/list/get/remove, `/mcp`, `.mcp.json`). Dọn: `claude mcp remove` mọi server thêm vào, xóa `~/cc-lab/.mcp.json`.
- [ ] **Step 4:** Bước D.
- [ ] **Step 5:** Bước E; `grep -c "claude_desktop_config\|server-sqlite\|ghp_" <en> <vi>` = 0 (trừ dòng ❌ trong PITFALLS — nếu giữ ví dụ sai để minh hoạ, viết `ghp_FAKE…`).
- [ ] **Step 6:** Bước F.
- [ ] **Step 7:** Bước G `feat/audit-w1-mcp`.

---

### Task 8: Đóng Wave 1 — lint toàn repo, release v1.2

**Files:**
- Modify: `package.json` version, `README.md` baseline line, `docs/audit/2026-09-21-course-audit.md` (thêm mục "Status" đầu file)

- [ ] **Step 1:** Sau khi 7 PR merge vào `develop`: `git checkout develop && git pull && npm run lint:course | tail -1`
Expected: `… 0 errors, N warnings` (warnings: line-width, words-warn, frontmatter-recommended của module chưa rewrite).

- [ ] **Step 2:** Bật fail cho `frontmatter-recommended`? **Chưa** — giữ warn tới hết Wave 2 (spec §3.1).

- [ ] **Step 3:** Thêm vào đầu `docs/audit/2026-09-21-course-audit.md` (sau blockquote):
```markdown
> **Status 2026-MM-DD**: Wave 0 (v1.1.1) và Wave 1 (v1.2) đã merge — §4A dòng 11.3, 11.2, 15.3/15.5/15.4, 11.5, 2.2, 6.1/6.2, VI 7.1 và §9 Tier 1 #1–7 đã đóng. Số dòng trích dẫn trong báo cáo này không còn khớp cho các module đã rewrite.
```

- [ ] **Step 4:** `package.json` → `1.2.0`; README baseline: "Verified against Claude Code v2.1.278 (2026-09) — Tier 1 modules rewritten; see docs/audit/".

- [ ] **Step 5:** Commit + PR `chore: v1.2.0 — audit wave 1 complete`; sau merge, release theo flow main/develop (như Wave 0 Task 13 Step 5). Chỉ tag khi tác giả xác nhận.

- [ ] **Step 6:** Mở plan Wave 2: tạo `docs/superpowers/plans/2026-<date>-audit-wave2-tier2-update.md` bằng skill writing-plans từ spec §3.3 — **fetch lại docs** trước vì có thể đã đổi.

---

## Self-review

- Spec §3.2 W1-1…W1-7 → Task 1–7, mỗi task có docs page, contract theo block, DEMO chạy thật, PRACTICE có solution, PITFALLS ❌/✅, REAL CASE, weave §9.3 (S1, S3, S4, S5, S6, S7, S8, S9, S12, S13, S14, S15 đều được gọi ở đúng module theo bảng mapping).
- Spec §4 DoD → Global Constraints + Bước E/F. Spec §5 → "Quy trình chung" A–G. Spec §6 git → Bước G + Task 8.
- Không placeholder: mỗi DEMO liệt kê lệnh cụ thể; những chỗ phụ thuộc docs (tên event mới, `/loop`, `Ctrl+G`, `claude agents` syntax, enable teams) đều ghi "chỉ nếu page có" + tên đã biết từ audit Phụ lục A để tra.
- Tên nhất quán: lab `~/cc-lab`; notes `docs/superpowers/plans/wave1-notes/`; branch `feat/audit-w1-*`; registry ID `(S<n>)`.
- Rủi ro đã xử lý: 11.2 đổi slug → redirect Astro; VI 6.1/11.2 đổi `.mdx` → build check; Task 4 lớn nhất (10 file) → 5 commit, reviewer chia đôi được.
