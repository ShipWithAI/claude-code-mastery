# Báo cáo Audit Course "Claude Code Mastery" — 21/09/2026

> **Phạm vi**: 64 module EN (`src/content/docs/en/claude-code/`), spot-check 64 module VI,
> cheat-sheet, tips-tricks, index, README, CLAUDE.md, COURSE-INDEX.
> **Đối chiếu với**: docs chính thức tại `code.claude.com/docs` (fetch ngày 21/09/2026,
> Claude Code v2.1.278), CHANGELOG, Agent SDK repos.
> **Phương pháp**: 1 agent inventory docs chính thức + 3 agent đọc toàn văn từng nhóm phase
> + kiểm tra trực tiếp bằng grep/sed trên repo. Mọi trích dẫn dạng `module:line` là số dòng
> trong file EN trừ khi ghi rõ VI.
> **Quy ước độ tin cậy**: các claim "feature X tồn tại" lấy từ docs chính thức; các mục
> đánh dấu ⚠️ cần verify lại một lần nữa trước khi đưa vào module (giá model, hook events
> mở rộng, tên slash command ít phổ biến).

---

## Mục lục

1. [Tóm tắt điều hành](#1-tóm-tắt-điều-hành)
2. [Hiện trạng course](#2-hiện-trạng-course)
3. [Ưu điểm cần giữ](#3-ưu-điểm-cần-giữ)
4. [Nhược điểm — 5 nhóm](#4-nhược-điểm--5-nhóm)
5. [Gap matrix: docs chính thức vs course](#5-gap-matrix-docs-chính-thức-vs-course)
6. [Đánh giá chi tiết theo phase](#6-đánh-giá-chi-tiết-theo-phase)
7. [Vấn đề xuyên suốt (cross-cutting)](#7-vấn-đề-xuyên-suốt-cross-cutting)
8. [Đồng bộ EN/VI](#8-đồng-bộ-envi)
9. [Roadmap sửa chữa](#9-roadmap-sửa-chữa)
10. [Phụ lục A — Inventory docs chính thức 09/2026](#phụ-lục-a--inventory-docs-chính-thức-092026)
11. [Phụ lục B — Danh sách quick-win cơ học](#phụ-lục-b--danh-sách-quick-win-cơ-học)

---

## 1. Tóm tắt điều hành

| Tiêu chí | Điểm | Nhận xét |
|---|---|---|
| Cấu trúc & sư phạm | ⭐⭐⭐⭐½ | 7-block giữ trên 64/64 module; WHY, REAL CASE nhiều chỗ xuất sắc |
| Độ chính xác kỹ thuật | ⭐⭐ | ~5 module dạy hệ thống **bịa hoàn toàn** (Hooks, SDK, Skills, MCP config, allowlist); ~15 module dạy mental model lỗi thời |
| Độ phủ so với docs 2026 | ⭐⭐ | Course viết cho Claude Code ~2025 (npm, chưa có subagents/plugins/hooks thật). Thiếu ~3 phase nội dung |
| Đồng bộ EN/VI | ⭐⭐⭐⭐ | 64/64 VI tồn tại, cấu trúc khớp; ~6 module diverge |
| Tuân thủ CLAUDE.md của course | ⭐⭐ | 55/64 vượt 1500 từ; ~25 fence lồng nhau vỡ; ~50 code block thiếu language; metadata "55 vs 64 modules" |

**Kết luận**: Khung course (curriculum 16 phase, giọng văn, case VN, kỷ luật 7-block) là tài sản
thật và hiếm. Nhưng lớp "mechanics" — lệnh, flag, file config, event, output — hiện lệch nghiêm
trọng so với sản phẩm. Một senior dev mở Claude Code 2026 sẽ gặp lỗi ngay từ Module 1.1
(install), 2.2 (permissions), 6.2 (plan mode), 11.3 (hooks). Đây là rủi ro uy tín lớn nhất,
đặc biệt khi course tự định vị "professional-grade, technical accuracy is critical".

**Ba con số đáng nhớ**:
- **0 file** nhắc đến subagents, `.claude/agents`, agent teams, plugins/marketplace, worktrees,
  Agent SDK, Bedrock/Vertex, OpenTelemetry.
- **~40 demo `claude -p` ghi file** sẽ bị permission-deny như đang viết (thiếu
  `--permission-mode` / `--allowedTools`).
- **28 marker "⚠️ Needs verification"** — tất cả đều đã có đáp án trong docs, chưa ai resolve.

---

## 2. Hiện trạng course

```
src/content/docs/{en,vi}/claude-code/
├── index.mdx, cheat-sheet.mdx, tips-tricks.mdx
└── phase-01 … phase-16/   (64 module)
EN: 128.134 từ | VI: 138.780 từ | 99 commit | commit cuối 19/09/2026
```

- Site Astro/Starlight (không phải layout `en/`, `vi/` ở root như CLAUDE.md mô tả).
- Word count EN theo module: min 964 (16.2), max 6.894 (2.5), median ~1.600. Chỉ **9/64** trong
  khoảng 800-1500 của guideline.
- 4 file `.mdx` (3.2, 6.1, 8.1, 11.2, 14.3) ở EN; VI lệch extension ở 6.1 và 11.2.
- `templates/` không tồn tại (CLAUDE.md và module 2.5 đều tham chiếu).
- README badge "version 1.0", nói "55+ modules"; index.mdx/COURSE-INDEX nói "64 modules".

---

## 3. Ưu điểm cần giữ

1. **Curriculum và thứ tự phase hợp lý** — Foundation → Security → Workflows → Prompt/Memory →
   Context → Thinking → Multi-agent → Meta-debugging → Legacy → Team → Automation → … Không
   course công khai nào có Phase 8 (Meta-Debugging) và Phase 9 (Legacy) chất lượng như vậy.
2. **Mental model không phụ thuộc phiên bản** — vẫn đúng 100%, chỉ cần re-platform lên feature
   native:
   - 3-layer codebase reading (3.1), memory-allocator model & quality-vs-context curve (5.1)
   - Think-vs-act matrix (6.1), PCE loop + decomposition (6.2), mode-decision matrix (6.3)
   - Orchestrator / pipeline / specialist patterns (7.3), RTAV loop + healthy-vs-stuck signals (7.4)
   - 3-strike rule, confusion/loop/hallucination taxonomy (8.x), STOP→ASSESS→CONTAIN→RECOVER (8.5)
   - Five-layer excavation (9.1), risk-level refactor table + strangler fig (9.2), "fix the TEST
     not the code" (9.3), Impact×Effort debt matrix (9.4)
   - Author/reviewer protocol (10.3), timeline/correlation RCA (13.3), granularity spectrum (14.1)
3. **Security posture đúng** — "CLAUDE.md is advisory, not enforced" (2.5), leak chain + 4 layer
   (2.4), files-at-risk/blast-radius (2.1), "read the full command" discipline (2.2). Tone thẳng.
4. **REAL CASE có chất Việt Nam** — kubectl 2AM (3.4), SBV/VND fintech (6.x), VNPay
   hallucination (VI 8.1), Khoa Đà Nẵng (2.5), 4-client freelancer (4.4).
5. **Kỷ luật ⚠️ Needs verification** — tác giả thành thật khi không chắc; là nền tốt để resolve.
6. **VI là parallel authoring thật** — VI 1.3 thêm "tiếng Việt tốn token hơn", VI 8.1 dùng case
   VNPay, VI 5.3 restructure REAL CASE theo Bối cảnh/Trước/Sau/Bài học.
7. **Một số section vẫn chính xác** — 1.2 session resume (`--continue`/`--resume`), 11.1 bảng
   flag headless, cheat-sheet keyboard shortcuts (Esc Esc, Ctrl+V, Ctrl+O, Shift+Tab, Option+T),
   10.1 lazy-load monorepo CLAUDE.md, 15.1 monorepo template, 11.4 GHA cost-control patterns.

---

## 4. Nhược điểm — 5 nhóm

### 4A. Nội dung **bịa** (không tồn tại, trình bày như thật)

| Module | Bịa gì | Thực tế 2026 |
|---|---|---|
| **11.3 Hooks** `:32-67` | Events `pre-file-write`, `post-file-write`, `pre-command`, `post-command`, `pre-session`, `post-session`; file `.claude/hooks.json` dạng flat map; args `$1`, env `CLAUDE_FILE_PATH`/`CLAUDE_ACTION`; "exit 1 = block" | `settings.json` → `hooks.<Event>[].{matcher, hooks[].{type, command, timeout}}`; events `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `UserPromptSubmit`, `SessionStart`, `SessionEnd`, `Stop`, `SubagentStart/Stop`, `Notification`, `PreCompact` (+ nhiều event mới ⚠️); JSON qua **stdin** (`tool_name`, `tool_input`, `cwd`, `session_id`…); **exit 2** mới block; hook types `command`/`prompt`/`agent` (+ `http`, `mcp_tool` ⚠️) |
| **11.2 SDK** `:22,40,82-93,661` | "Until an official SDK exists"; `import { ClaudeCode } from '@anthropic-ai/claude-code'` + `new ClaudeCode().execute()`; wrapper `execSync(\`claude -p "${prompt}"\`)` | **Claude Agent SDK** (đổi tên 09/2025): `npm i @anthropic-ai/claude-agent-sdk`, `pip install claude-agent-sdk`; `query({ prompt, options: { allowedTools, permissionMode, systemPrompt, mcpServers, hooks, agents, settingSources, maxTurns } })`, `ClaudeSDKClient`, `tool()` + `createSdkMcpServer()` |
| **15.3 Skills** `:47-55,88,105,279-283` | `claude skill list --available`, `claude skill install kubernetes`, `remove/info`; cấu trúc `prompts/ tools/ workflows/ examples/`; `/k8s-debug` | `.claude/skills/<name>/SKILL.md` (project) / `~/.claude/skills/` (user) / plugin; YAML frontmatter `name`, `description`, `allowed-tools`, `disable-model-invocation`, `argument-hint`, `model`, `context` ⚠️; gọi `/name` hoặc auto-trigger theo description; `/skills`, `/skill-doctor`, `claude plugin eval` |
| **15.5 Custom Skills** `:30-37,92-159` | SKILL.md viết prose `## Metadata / ## Capabilities / ## Commands — /deploy` | YAML frontmatter; supporting `scripts/`, `references/`; đóng gói plugin `.claude-plugin/plugin.json`; không hạn chế `allowed-tools` cho deploy skill = lỗi bảo mật |
| **15.4 Ecosystem** `:93-95,136,173-175,317` | Repo + star count bịa ("k8s-claude-template 250 stars"); `claude skill install kubernetes-production` | Official plugin marketplace, `anthropics/skills`, `awesome-claude-code`, `/plugin marketplace add owner/repo`, `/plugin install name@marketplace` |
| **11.5 MCP** `:118-134,149,159-181` | Sửa `~/Library/Application Support/Claude/claude_desktop_config.json` (file của Claude **Desktop**); `npm i -g @modelcontextprotocol/server-sqlite` (không có trên npm); "Restart Claude Code" | `claude mcp add --transport http\|stdio <name> …`, `--scope local\|project\|user`, `-e KEY=val`, `claude mcp list\|get\|remove\|add-json`; `.mcp.json` với `${VAR}`; `/mcp` (status + OAuth). `server-sqlite/postgres/github` đã archive 2025 |
| **2.2 Permissions** `:83-101,264-313` | `{"allowlist": ["ls", "cat", …]}`; nút "[Approve Once] [Approve Always] [Deny]" | `{"permissions": {"allow": ["Bash(git status:*)"], "deny": ["Read(./.env)", "Bash(git push --force:*)"], "ask": [...]}}` trong `.claude/settings.json` / `.local.json` / `~/.claude/settings.json`; `/permissions`; prompt thật: "1. Yes / 2. Yes, don't ask again for… / 3. No, tell Claude what to do differently" |
| **2.2/2.5/4.4** `2.2:198, 2.5:64-90,612-629,1112-1121, 4.4:60,286,320-325` | `claude config show`, `claude config set model claude-3-5-sonnet-20241022`, `claude config reset`; `~/.claude/config`, `.claude/config`, `~/.claude/config.json` | `claude config get/set/list` là legacy; `show`/`reset` không tồn tại. File thật: `~/.claude/settings.json`, `.claude/settings.json`, `.claude/settings.local.json`, `~/.claude.json`, managed `managed-settings.json` |
| **2.1/2.4** `2.1:357-376, 2.4:47,78-79` | `.claudeignore` "may exist" | Chưa từng tồn tại → `permissions.deny: ["Read(./.env)", "Read(~/.ssh/**)"]` |
| **6.2 Plan Mode** `:30` | *"It's not a toggle or built-in command — it's a workflow discipline you enforce through prompts"* | Native: Shift+Tab (cycle modes), `--permission-mode plan`, `permissions.defaultMode: "plan"`, EnterPlanMode/ExitPlanMode, plan file, alias `opusplan` |
| **6.1 Think Mode** `:36-43,424-432` | Thang "think about this first / think step by step / think carefully" = Level 1-3; "A dedicated /think command may exist"; `ultrathink` gắn nhãn "community term — verify" | Ngược lại: `ultrathink` là keyword thật; giờ có `/effort low\|medium\|high\|xhigh\|max`, `--effort`, `effortLevel` setting, thinking toggle (Option+T), `MAX_THINKING_TOKENS`, Ctrl+O xem thinking |
| **Fake output** `1.3:119-209, 4.3:143-277, 5.1:93-197, 5.2:131-201, 5.3:246-252, 8.3:122-128, tips:128-131` | `/cost` in "Context usage: 73%" / "Images: 2,768 tokens" / "Output tokens (thinking)"; `/compact` in "Reduced from 62,847 to 38,492"; `/clear` hỏi "Type 'yes' to confirm"; `/help` 5 command | `/cost` chỉ in Total cost / duration (API, wall) / code changes / per-model; **`/context`** mới hiện composition; `/clear` không confirm |
| **3.4 Background** `:99-111,180-185,379` | UI "⏳ Running in background: npm install…"; bare `&`; `ps aux \| grep` | `run_in_background`, **Ctrl+B**, `/tasks` (`/bashes`), BashOutput |
| **VI 7.1** `vi:220,243,351` | `claude --plan refactor.md`, `claude --auto --plan add-logging.md` | Không tồn tại (VI tự thêm, EN không có) |
| **11.4 GHA** `:104,116,202,297-306` | DIY `npm i -g` + `claude -p` + `github-script`; `COMMAND="${{ github.event.comment.body }}"` trong `run:` (**script injection** → lộ `ANTHROPIC_API_KEY`); `paths` + `paths-ignore` cùng event (invalid) | `anthropics/claude-code-action@v1` (`prompt:`, `claude_args:`, `@claude` mention), `/install-github-app`; pass input qua `env:` |
| **1.3** `:477` | `/read path/to/file` | `@path/to/file` (Phase 1-4 không dạy `@` ở đâu cả) |
| **4.3** `:91-119` | `/project:review`, `/user:my-prompt` | Namespace đã bỏ 2025; `/review` (project) — commands ↔ skills hợp nhất |
| **8.1** `:326` | "Claude can't browse the web in real-time" | WebFetch/WebSearch tồn tại; Claude Code tự chạy `npm view` được |
| **2.5** `:1320-1323` | "templates available in course repository" | `templates/` không tồn tại |

### 4B. Mental model **lỗi thời** (đúng 2024-2025, sai 2026)

| Chủ đề | Course đang dạy | Thực tế |
|---|---|---|
| **Install (1.1)** | `npm install -g @anthropic-ai/claude-code` là primary, Node 18+; `brew install claude-code` ⚠️ | Native installer: `curl -fsSL https://claude.ai/install.sh \| bash`, `irm https://claude.ai/install.ps1 \| iex`; `brew install --cask claude-code`; `winget install Anthropic.ClaudeCode`; npm là legacy. Thiếu `/login`, subscription vs API key vs Bedrock/Vertex, `claude doctor`, `claude update` |
| **Memory (4.4, 1.3)** | "Session chết khi exit; chỉ CLAUDE.md persist; conversation history: Unknown" | Transcript persist (`--continue`, `--resume`, `/resume`, `/rewind`); **auto memory** (`/memory`); `CLAUDE.local.md`; `.claude/rules/*.md` với `paths:`; `@imports`; `AGENTS.md` (v2.1.278). 1.2 dạy đúng `--resume` → course tự mâu thuẫn |
| **Multi-agent (Phase 7)** | `claude -p "task" > out.md &` + bash + file trên disk; "No shared memory"; "90% teams never need beyond bash" | Native subagents `.claude/agents/*.md` (frontmatter `name/description/tools/model/permissionMode/isolation`), `/agents`, Agent tool + `subagent_type`, built-in Explore/Plan/general-purpose; agent teams (TeamCreate/TaskCreate/SendMessage); background agents (`--bg`, `claude agents/attach/logs/stop`); `--worktree`; Dynamic Workflows (`agent()/pipeline()/parallel()`); Agent SDK |
| **Headless ghi file** (5.2, 7.3, 7.5, 11.1, 12.1, 13.2, 14.2) | `claude -p "Create utils/jwt.js"` | Headless không có prompt permission → Edit/Write/Bash **bị deny**. Cần `--permission-mode acceptEdits`, `--allowedTools "Edit,Write"`, hoặc `--dangerously-skip-permissions` trong sandbox. Hầu hết demo "parallel agents" **không chạy được** như viết |
| **Emergency stop** (7.2, 7.4, 8.2, 8.5, 1.1, cheat-sheet) | "Ctrl+C — stops execution immediately" | **Esc** interrupt turn, giữ session; Ctrl+C ×2 (hoặc Ctrl+D) **thoát session**. Người học follow 8.5 sẽ mất session cần cho bước ASSESS |
| **Sandbox (2.3, 2.5)** | Docker `--network=none` cho mọi recipe | Claude Code phải reach `api.anthropic.com` → DEMO không bao giờ chạy `claude` trong container. Thực tế: egress allowlist (devcontainer chính thức + `init-firewall.sh`), built-in sandbox (`/sandbox`, `sandbox.network.allowedDomains`, bubblewrap/seatbelt), Claude Code on the web |
| **Permission modes (2.2, 7.1)** | 3 "levels" tự đặt; prompt `[y]/[a]/[n]` | 7 modes: `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions` (+`manual` alias); Shift+Tab cycle; `--permission-mode`; `defaultMode`; managed `disableBypassPermissionsMode` |
| **Context gauge (1.3, 5.x, 4.3, tips, cheat-sheet)** | "Check `/cost` để xem context đầy bao nhiêu"; "compact mỗi 30-40 phút" | `/cost` = billed tokens, không phải occupancy; `/context` + statusline %; **auto-compact** mặc định bật; `/compact <instructions>` để giữ focus |
| **Token math (1.3)** | "1 token ≈ 4 chars ≈ 2 words"; "prose ~250 tokens/1000 words"; "200K context" | ≈0.75 words/token; ~1.300 tokens/1000 words; 1M context `[1m]` cho Sonnet/Opus hiện tại |
| **CLAUDE.md hierarchy (4.2, cheat-sheet)** | "File cụ thể hơn override root"; subdir "⚠️ verify" | Các file **concatenate**; subdir CLAUDE.md load on-demand khi đọc file bên dưới; thiếu managed tier `/etc/claude-code/CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, `@imports`, `.claude/rules/` |
| **Slash commands (4.3, 15.2, 16.2)** | Paste-in `{{code}}` templates; `/review`, `/component` "templates" không định nghĩa cách tạo | `.claude/commands/*.md` hoặc `.claude/skills/*/SKILL.md` với `$ARGUMENTS`/`$1`, `` !`cmd` ``, `@file`, frontmatter |
| **Pricing (14.4)** ⚠️ | Opus $15/$75, Haiku $0.25/$1.25, "Opus 5× Sonnet" | Opus 4.5+ $5/$25; Haiku 4.5 $1/$5 ($0.25 là Haiku **3**); ratio ~1.7×; **prompt caching** không được nhắc; thiếu subscription limits, `/usage`, `/stats`, `/insights`, `--max-budget-usd`, 1M premium |
| **Speed/Quality (14.2, 14.3)** | "Opus chậm/đắt, dùng Sonnet"; "think step by step" | `/fast`, `/effort`, thinking mặc định bật; hooks-as-quality-gate (`PostToolUse` lint, `Stop` gating tests); review subagents; `.claude/rules/` |
| **Git (3.3, 10.2)** | Claude là "advisor"; dạy tự thêm `Co-Authored-By` bằng convention | Claude Code tự `git commit`/`gh pr create`; mặc định đã thêm `Co-Authored-By: Claude`; setting `includeCoAuthoredBy` / `attribution` ⚠️ |
| **Model IDs** | `claude-3-5-sonnet-20241022` (2.5), `claude-sonnet-4-20250514` ×7 (12.3), `claude-opus-4` (11.2) | Opus 5 / Sonnet 5 / Haiku 4.5 / Fable 5.1; alias `opus`, `sonnet`, `haiku`, `opusplan` |
| **Data handling (2.3, 2.4)** | "logged on Anthropic's servers, potentially used in model training" | API/commercial data không dùng train mặc định; overclaim làm giảm uy tín security |
| **gitleaks (2.4, 2.5)** | v8.18.1, `gitleaks protect --staged`, `detect --no-git`; `git filter-branch` | `gitleaks git --pre-commit --staged`, `gitleaks dir`; `git filter-repo` |
| **n8n (12.2)** | `Split In Batches`, `Merge By Position`, `{{ $items() }}` | "Loop Over Items", Merge "Combine → Position"; `$input.all()` |

### 4C. Feature docs chính thức **chưa có** trong course

→ Xem [§5 Gap matrix](#5-gap-matrix-docs-chính-thức-vs-course).

### 4D. Chất lượng & tuân thủ CLAUDE.md của chính course

| Vấn đề | Chi tiết |
|---|---|
| **Độ dài** | Guideline 800-1500; thực tế 55/64 vượt. 2.5 = 6.894 từ (~60% in lặp 3 document ở DEMO, PRACTICE, REAL CASE); 2.4 = 3.846; 4.2 = 3.440 (in cùng CLAUDE.md mẫu 2 lần ~900 từ); 3.4 = 3.270; 11.2 = 2.710 |
| **Fence lồng nhau vỡ** | ```` ```bash ```` mở bên trong ```` ```markdown ```` đang mở → renderer đóng fence ngoài, nửa block thành prose. EN: 2.4:566; 2.5: 481,493,506,524,536,874,886,891,896,901; 4.2: 176,323,433. VI: 2.4:572; 2.5 (10 chỗ). Hệ quả: `grep '^## '` đếm 32 H2 ở 2.5 |
| **`##` trong code block** | 5.2, 6.2, 6.3, 7.3, 7.5, 8.5 — vi phạm "H2 = 7 block only" về mặt text |
| **H2 thứ 8 thật** | 8.1 `## Key Takeaways` (:406); 2.5 `## Phase 2 Complete — Your Security Graduation` (:1327) |
| **Code block thiếu language** | ~50 (12.2: 8, 11.5: 6, 11.3: 5, 11.4: 4, 10.4: 3, 15.1: 3…) |
| **Dòng >100 ký tự** | Mọi file 9-37 dòng (ảnh hưởng PDF build) |
| **Số liệu bịa như fact** | tips: "35%→12%", "$8 and 45 minutes", "40-60% faster", "200+ files in 6 hours"; "$1,200→$380" lặp 3 lần (14.2:100, 14.4:300, tips:60); 2.5 "40% productivity boost"; 4.1:358-366 metrics table; 5.2 REAL CASE "Consistency 95% vs 60%, zero overflow vs 23"; 15.4 star counts |
| **Filler / rác biên tập** | "Susan" là nhân vật chính 9/16 REAL CASE Phase 1-4 (1.1, 1.3, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 4.4) ở công ty khác nhau; 2.4:88 "recall Tùng's story" (nhân vật đã đổi tên); 2.1:403 còn "Wait — that's wrong. `chmod 600`…" tự sửa chưa xóa; 3.1:6-9 HTML comment "Approved by architect review 2026-02-01"; 2.4:790-792 câu lặp nguyên văn; 11.4:129,177 "Automated by Claude Code v11.4" (số module rò thành version) |
| **Metadata mâu thuẫn** | README/CLAUDE.md/16.1/16.3 "55 modules" vs index.mdx/COURSE-INDEX "64"; README badge v1.0; hero `houston.webp` mặc định Starlight; 12.3 thiếu `description:` frontmatter |
| **CLAUDE.md của course stale** | "Commands That Need Verification" liệt kê `/status`, `/model`, `brew --cask`, native installer — tất cả đã tồn tại. Directory layout mô tả (`en/`, `vi/` root, `assets/`, `cheatsheets/`, `templates/`, `scripts/build-*.sh`) không khớp repo thật |
| **Phase 12 lệch chủ đề** | 12.3 hoàn toàn là Messages API trong n8n Code node (không phải Claude Code); 12.1/12.2 là n8n catalog chung; bỏ qua n8n native Anthropic/AI Agent nodes |
| **Phase 13 không có lệnh thật** | Toàn transcript giả lập; không có gì Claude-Code-specific (`--add-dir`, Read offset/limit, Bash truncation ~30K, image feedback loop, document skills) |
| **Vấn đề bảo mật trong chính nội dung** | 11.2 `execSync` shell injection (:51,162,424,704); 11.4 script injection (:116,202); 11.5 hard-code `"GITHUB_TOKEN": "ghp_…"` trong file được bảo commit (:302-314,392); 15.5 deploy skill không có `allowed-tools` |
| **Leak môi trường tác giả** | 2.2:35 `lsp_diagnostics` là MCP tool của oh-my-claudecode, không phải built-in |
| **REAL CASE generic** | 1.1, 3.3 (quote bịa), 16.1 ("100% real examples" nhưng không attribution) |

### 4E. Đồng bộ EN/VI

→ Xem [§8](#8-đồng-bộ-envi).

---

## 5. Gap matrix: docs chính thức vs course

Ký hiệu: ❌ = 0 file nhắc; ⚠️ = nhắc thoáng qua (≤2 file, không dạy); ✅ = có dạy; 🔴 = dạy sai.

### 5.1 Agents & Orchestration

| Feature (docs) | Course | Ghi chú |
|---|---|---|
| Subagents `.claude/agents/*.md`, frontmatter, `/agents`, `--agent`, `--agents` JSON | ❌ | Phase 7 nên là nơi dạy |
| Built-in agents Explore / Plan / general-purpose | ❌ | 3.1, 5.1 nên dùng Explore cho context isolation |
| Agent tool, `subagent_type`, spawn depth, resume via SendMessage | ❌ | |
| Agent teams (TeamCreate/TaskCreate/SendMessage), cross-session messaging | ❌ | |
| Background agents `--bg`, `claude agents/attach/logs/stop/rm/respawn`, agent view | ❌ | |
| Dynamic Workflows `agent()/pipeline()/parallel()/phase()`, `/workflows`, `ultracode`, `workflowSizeGuideline` | ❌ | |
| `--worktree`/`-w`, EnterWorktree, `isolation: worktree` | ❌ | 3.3, 7.x, 9.2, 14.2 |
| Subagent prompt-cache sharing | ❌ | 14.4 |

### 5.2 Extensibility

| Feature | Course | Ghi chú |
|---|---|---|
| Hooks: events thật, JSON stdin, exit 2, `permissionDecision`, `updatedInput`, `additionalContext`, matchers, `timeout`, `disableAllHooks` | 🔴 | 11.3 bịa toàn bộ |
| Hook types `prompt`, `agent` (+ `http`, `mcp_tool` ⚠️) | ❌ | |
| `/hooks` UI | ⚠️ | |
| Skills `.claude/skills/<name>/SKILL.md` + frontmatter, `/skills`, `/skill-doctor` | 🔴 | 15.3/15.5 bịa |
| Commands `.claude/commands/*.md`, `$ARGUMENTS`/`$1`, `` !`cmd` ``, `@file`, frontmatter | ❌ | 4.3, 15.2 |
| Plugins `.claude-plugin/plugin.json`, marketplaces, `/plugin`, `claude plugin install/eval/validate`, `enabledPlugins`, `--plugin-dir` | ❌ | 15.4 |
| Output styles `/output-style`, `outputStyle` | ⚠️ | |
| Statusline `/statusline`, keybindings `~/.claude/keybindings.json`, `/vim`, `/terminal-setup` | ⚠️ | |
| Channels (webhook/Telegram/Discord → session) ⚠️ | ❌ | |

### 5.3 Session & Context

| Feature | Course | Ghi chú |
|---|---|---|
| `/rewind`, Esc Esc, checkpoint (100 snapshots, restore code/conversation) | ⚠️ | 1 dòng cheat-sheet; 7.2/7.4/8.2/8.5/9.2 cần |
| Ctrl+B background tasks, `/tasks`/`/bashes`, `run_in_background`, Bash timeout 2/10 phút | ⚠️ | 3.4 dạy sai |
| `/context` | ⚠️ | Chỉ cheat-sheet; 1.3/5.x/8.3 cần |
| `/compact <instructions>`, auto-compact, `--autocompact`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` | ❌ | 5.2, 8.3 |
| `@file`/`@dir`, `@server:resource` | ❌ | Phase 1-4 không dạy `@` |
| `--resume`/`--continue`/`--fork-session`/`--session-id`/`-n`, `/rename`, `/branch` ⚠️, `/recap` ⚠️ | ⚠️ | 1.2 đúng một phần |
| Esc interrupt vs Ctrl+C exit | 🔴 | |
| `--from-pr`, `/export` | ⚠️ | |

### 5.4 Permissions, Settings, Sandbox

| Feature | Course | Ghi chú |
|---|---|---|
| `permissions.allow/deny/ask` + rule syntax `Bash(git status:*)`, `Read(./.env)`, `Edit\|Write` | 🔴 | 2.2 bịa `allowlist` |
| 7 permission modes, Shift+Tab, `--permission-mode`, `defaultMode` | ❌ | |
| `auto` mode + classifier, per-command domain allowlist | ❌ | |
| Settings precedence: managed > `--settings` > `.local.json` > `.claude/settings.json` > `~/.claude/settings.json` | ❌ | |
| `managed-settings.json` (macOS/Linux/Windows path), `disableBypassPermissionsMode`, `allowedMcpServers`, `strictKnownMarketplaces`, `allowManagedHooksOnly` ⚠️ | ❌ | 10.5 |
| `/permissions`, `/config`, `/sandbox` | ⚠️ | |
| Built-in sandbox (bubblewrap/seatbelt, `sandbox.*`, network allowlist) | ❌ | 2.3 |
| Devcontainer chính thức + `init-firewall.sh` | ⚠️ | |
| `additionalDirectories`, `/add-dir`, `--add-dir` | ⚠️ | |
| `apiKeyHelper`, `env`, `cleanupPeriodDays`, `includeCoAuthoredBy` | ❌ | |
| Bash-tool vs file-tool access (cwd restriction, Read không prompt) | ❌ | Nền tảng threat model 2.1 |
| Prompt injection qua MCP/WebFetch/plugins | ❌ | 2.1 |

### 5.5 Model & Performance

| Feature | Course | Ghi chú |
|---|---|---|
| `/model`, alias `opus/sonnet/haiku/opusplan`, `ANTHROPIC_MODEL`, `--fallback-model` | ⚠️ | |
| `/effort`, `--effort`, `effortLevel` | ❌ | 6.1, 14.x |
| `/fast` | ⚠️ | |
| Thinking toggle, `MAX_THINKING_TOKENS`, Ctrl+O | ❌ | |
| 1M context `[1m]` | ❌ | |
| Prompt caching | ⚠️ | 14.4 không nhắc |
| `--advisor` ⚠️ | ❌ | |

### 5.6 Interfaces

| Feature | Course |
|---|---|
| Desktop app (macOS/Windows/Linux beta), scheduled tasks, `/desktop` | ❌ |
| VS Code extension (inline diff, plan review, agent map, hooks UI), JetBrains | ⚠️ (2 file) |
| Claude Code on the web (claude.ai/code), `--cloud`, `/cloud`, mobile | ❌ |
| Remote Control `--remote-control`, `/remote-control`, `/teleport` | ❌ |
| Claude in Chrome `--chrome` | ⚠️ |
| Slack (`/install-slack-app`, Claude Tag) | ❌ (11 file "Slack" đều là webhook notification) |

### 5.7 Automation & Headless

| Feature | Course | Ghi chú |
|---|---|---|
| Agent SDK (TS/Python) | 🔴 | 11.2 |
| `--output-format json\|stream-json`, `--input-format stream-json`, `--include-partial-messages` | ⚠️ | 11.1 có một phần |
| `--json-schema` structured output | ❌ | 11.1 Step 5 đang parse string |
| `--bare`, `--agents`, `--append-system-prompt`, `--mcp-config`, `--tools`, `--setting-sources`, `--max-budget-usd` | ⚠️ | |
| `claude setup-token`, `CLAUDE_CODE_OAUTH_TOKEN` | ❌ | 11.1, 12.1 |
| `claude-code-action@v1`, `/install-github-app`, `/pr-comments` | ❌ | 11.4 |
| GitLab CI/CD | ⚠️ | |
| `/loop`, `/schedule` (cloud routines), Desktop scheduled tasks | ⚠️ | |
| `claude ultrareview`, `/code-review`, `/security-review` | ⚠️ | 10.3 |

### 5.8 Memory

| Feature | Course |
|---|---|
| Auto memory, `/memory`, `#` quick-add | ⚠️ |
| `.claude/rules/*.md` với `paths:` glob | ⚠️ (1 dòng) |
| `@imports` trong CLAUDE.md | ❌ |
| `CLAUDE.local.md` | ⚠️ |
| Managed/enterprise CLAUDE.md | ❌ |
| `AGENTS.md` (v2.1.278) | ❌ |
| Subdir CLAUDE.md lazy-load | ⚠️ ("needs verification") |

### 5.9 MCP

| Feature | Course |
|---|---|
| `claude mcp add` + transports + scopes | 🔴 |
| OAuth (`/mcp`, `claude mcp login`) | ❌ |
| `.mcp.json` với `${VAR}`, `enabledMcpjsonServers`, `enableAllProjectMcpServers` | ⚠️ |
| Permission `mcp__server__tool`, `--strict-mcp-config` | ❌ |
| `@server:resource`, MCP prompts `/mcp__server__prompt` | ❌ |
| `MAX_MCP_OUTPUT_TOKENS`, deferred tool loading | ❌ |
| `claude mcp serve`, plugin-bundled MCP | ❌ |

### 5.10 Enterprise & Observability

| Feature | Course |
|---|---|
| Amazon Bedrock / Google Vertex / Microsoft Foundry env vars | ❌ |
| LLM gateway, `claude gateway`, self-hosted runner | ❌ |
| OpenTelemetry (`CLAUDE_CODE_ENABLE_TELEMETRY`), analytics dashboard | ❌ |
| Zero data retention, data usage policy | ❌ |
| `/usage`, `/stats`, `/insights`, usage limits, `autoContinueAtUsageLimit` | ⚠️ |
| Managed Agents (Claude Platform) — phân biệt với Agent SDK | ❌ |
| Env vars reference (`BASH_DEFAULT_TIMEOUT_MS`, `CLAUDE_CODE_MAX_OUTPUT_TOKENS`, `DISABLE_TELEMETRY`…) | ⚠️ |

### 5.11 Document skills

| Feature | Course |
|---|---|
| Bundled `docx/pptx/xlsx/pdf` skills (`anthropics/skills`) | ❌ (13.2 nên có) |

**Tổng kết gap**: course thiếu tương đương **3 phase nội dung mới** (Agents/Teams/Workflows;
Plugins/Skills/Hooks thật; Interfaces/Enterprise) và **~60% surface của CLI/slash commands
hiện tại**.

---

## 6. Đánh giá chi tiết theo phase

### Bảng điểm tổng

| Phase | Điểm | Nhận xét |
|---|---|---|
| 1 Foundation | C | Install stale; token math sai ~5×; `/cost` làm context gauge; "session chết khi exit" |
| 2 Security | C+ | Prose tốt nhất, posture đúng; nhưng chưa dạy **một** enforced control; `--network=none` không chạy; `.claudeignore` bịa; 2.5 phình 4.6× |
| 3 Core Workflows | B | Ít stale nhất; thiếu `@file`, Explore, Ctrl+B; 3.4 tự mâu thuẫn `cd` |
| 4 Prompt & Memory | C- | 4.3 fake output nhiều nhất; 4.4 core model sai; 4.2 in đôi + hierarchy sai |
| 5 Context | C+ | Mental model tốt; mechanics sai (`/cost` vs `/context`, không `/compact <focus>`, auto-compact) |
| 6 Thinking/Plan | **D** | 6.2 phủ nhận plan mode native; 6.1 thang thinking bịa |
| 7 Multi-agent | **D** | Kiến trúc 2024; 0% native subagents/teams; demo permission-deny |
| 8 Meta-debugging | B+ | Khái niệm mạnh nhất; thiếu `/rewind`, Esc; 8.1 sai "không có web" |
| 9 Legacy | **A-** | Sạch nhất; 1 bug `npm test`, 1 ví dụ Express cũ |
| 10 Team | C | Governance trên giấy; không managed settings/deny rules |
| 11 Automation | **F** | 11.2/11.3/11.5 bịa hệ thống; 11.4 script injection; 11.1 demo không chạy |
| 12 n8n | D | Không thực sự về Claude Code |
| 13 Data | B- | Không sai, nhưng không Claude-Code-specific |
| 14 Optimization | C | Giá stale; thiếu caching/fast/effort/hooks-as-gate |
| 15 Skills | **F** | Skill system bịa; không plugin/marketplace |
| 16 Mastery | C | Generic; "55 modules" sai; slash templates không định nghĩa |
| Cheat sheet / Tips / Index | C | Shortcut đúng; thiếu ~20 command/flag; stats bịa; `/cost` sai vai |

### Phase 1 — Foundation

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 1.1 Installation | OK | 1.535 | 9 | npm-first; `brew install claude-code` thiếu `--cask`; không `/login`, subscription vs API, `claude doctor/update`, Windows, IDE/desktop/web; `:296` "Exit: Ctrl+C"; `:300-302` `/status`, `/model` "may or may not exist" | Trình tự install→auth→verify; ⚠️ flags thành thật |
| 1.2 Interfaces | OK | 2.326 | 6 | `:363,385-402` pipe/`-p` gắn ⚠️ dù là core; `:72-77` `Option+P`/`Option+T` unverified; "Interfaces" nhưng chỉ CLI; thiếu `--output-format json`, `--max-turns`, `--allowedTools`, `--permission-mode` | Session resume đúng; decision flowchart; KMP case |
| 1.3 Context | OK | 2.659 | 9 | `:52-57,452-458` token math sai; `:119-209` fake `/cost`; `:464` "`/cost` > 80%" bất khả; `:477` `/read`; `:481` "REPL context dies"; 3 exercise lặp | WHY tốt; compact-vs-clear |

**Ưu tiên**: install section 1.1; số liệu 1.3 + `/context` + auto-compact + bỏ "session chết".

### Phase 2 — Security

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 2.1 Threat Model | OK | 2.999 | 7 | `:115-135` permission system "may exist"; `:214` "no prompt = no protection"; `:357-376` `.claudeignore`; `:396-407` "Wait — that's wrong"; không phân biệt Bash-tool vs file-tool access; thiếu prompt injection MCP/WebFetch/plugins | Access rings; blast-radius; files-at-risk; fake-key discipline |
| 2.2 Permissions | OK | 2.947 | 10 (24 ⚠️) | `:83-101,264-313` `allowlist` bịa; `:196-200` `claude config show`; `:35` `lsp_diagnostics` (OMC leak); `:40-58` 3 levels thay vì 7 modes; không PreToolUse hook; Ex 3 solution nên là deny list | "Read the full command"; approval fatigue; force-push case |
| 2.3 Sandbox | OK | 2.961 | 7 | `:165-171,470` `--network=none`; `:120-122,303-317` container không có Claude Code; `:495` REAL CASE mâu thuẫn cwd restriction; `:498` "logged to Anthropic"; thiếu built-in sandbox, devcontainer, web | Docker flag-by-flag; mount table; verification steps |
| 2.4 Secrets | OK | 3.846 | 8 | `:47,78-79` `.claudeignore`; gitleaks v8.18.1 + `protect --staged` deprecated; `:493,571` `filter-branch`; `:566` fence vỡ; `:790-792` câu lặp; `:88` "Tùng"; `:660,709` training overclaim | **Module tốt nhất Phase 2**: leak chain, 4 layer, `.env.example`, hook gitleaks chạy được, rotation table |
| 2.5 System Control | ❌ H2 thứ 8; 10 fence vỡ | **6.894** | 12 | `:64-90,612-629,1112-1121` `claude config` + model 3.5; `:441-452` sandbox.sh `node:20-alpine` không Claude + `--network=none`; `:673-681` prompt "Read file .env Allow?" (Read không prompt); `:1320-1323` templates không tồn tại; ~60% duplication | Thesis "advisory not enforced"; 5-layer failure table; checklists; case Khoa Đà Nẵng |

**Ưu tiên**: viết lại 2.2 CONCEPT quanh rules/modes/hooks; thay `--network=none` bằng egress
allowlist + built-in sandbox; cắt 2.5 60% và ship templates.

### Phase 3 — Core Workflows

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 3.1 Reading | OK (+HTML comment `:6-9`) | 2.861 | 4 | Không `@file`/`@dir`, Explore subagent, `/init`, `--add-dir`; `:292` Fastify "tap" (v5 dùng `node:test`); output Claude bịa không label | **3-layer strategy** là framing tốt nhất Phase 3-4 |
| 3.2 Writing (.mdx) | OK | 1.946 | 4 | Không Edit/Write diff view, `acceptEdits`, `/rewind`, plan mode; "context sandwich" trùng 4.1 CREF; `:238` CSRF cho token-less API | Demo gọn; self-review step |
| 3.3 Git | OK | 2.036 | 5 | Claude là "advisor" — thực tế tự commit/PR; co-author trailer; thiếu `/pr-comments`, `/install-github-app`, worktrees; `:365` squash không interactive | Atomic commits; CLAUDE.md convention hook |
| 3.4 Terminal | OK | 3.270 | 8 | `:54` vs `:571` mâu thuẫn `cd` persist; `:99-111` fake background UI; bare `&`; `:239` `--only=production`; `:424` `node:18`; `:588-596` `docker-compose` v1; thiếu Bash timeout, Ctrl+B, `/tasks`, `Bash(...)` rules | **REAL CASE kubectl 2AM tốt nhất Phase 1-4**; operator cheat sheet |

### Phase 4 — Prompt & Memory

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 4.1 Prompting | OK | 1.911 | 3 | Không `@file`; `:344` "prompt English not Vietnamese" không có căn cứ; `:358-366` metrics bịa; thiếu plan mode, thinking, image, `#` | CREF framework; upgrade exercise |
| 4.2 CLAUDE.md | OK; 3 fence vỡ | 3.440 | 9 | `:36-55,529-535` hierarchy sai ("override") + thiếu managed/`.claude/CLAUDE.md`/`CLAUDE.local.md`/`@imports`/`.claude/rules/`; `:84-94,385` `claude -p "…/init"`; `:96-374` in file 2 lần | 6-section template; tribal-knowledge section; token budget |
| 4.3 Slash Commands | OK | 2.684 | 11 | `:143-277` fake output 5 command; `:91-119` `/project:` stale; "every command" nhưng thiếu `/agents /hooks /mcp /plugin /login /usage /sandbox /output-style`; không shortcuts; `:78-82,445` "compact mỗi 30-40 phút" | Cheat-sheet names ~90% đúng; compact-vs-clear exercise |
| 4.4 Memory | OK | 2.293 | 8 | `:64,200-205,334` "stateless between sessions" sai; `:59,287` mâu thuẫn 1.2; `:60,286,320-325` `claude config`, `config.json`; `:147-156` `ls ~/.claude/` output sai; `:159-165` "hỏi Claude có memory không" không phải evidence | Global vs project split; "brain vs scratch paper" |

### Phase 5 — Context Mastery

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 5.1 Controlling | OK | 1.881 | 5 | `:93-197` mọi `/cost` output bịa (cần `/context`); `:28` "100K-200K"; `:188-190` fake compact output; PRACTICE số bịa; dạy "read signatures manually" thay vì Explore | Memory-allocator model; quality-vs-context curve |
| 5.2 Optimization | `##` trong fence | 2.249 | 4 | `:145` `claude -p "Create utils/jwt.js"` bị deny; `:131-137,201` fake output; không `/compact <instructions>`; `:55` "NEVER compact mid-op" quá đà; REAL CASE metrics bịa | 4-phase session; context recycling |
| 5.3 Image | OK | 2.686 | 4 | `:250` fake image tokens; `:432` "4K = 3000+ tokens" (ảnh downscale); không Claude tự screenshot (Chrome/Playwright MCP); `:60-67` terminal table unverified; padding lặp 4 chỗ | `:42` Ctrl+V-not-Cmd+V; text-for-code/images-for-layout |

### Phase 6 — Thinking & Planning

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 6.1 Think | OK | 2.636 | 6 | `:36-41,424-430` thang thinking bịa; `:432` `ultrathink` "community term"; `:43` "/think may exist"; không `/effort`, toggle, `MAX_THINKING_TOKENS`; `:261-266` fake thinking tokens | Think-vs-act matrix; SBV/VND case |
| 6.2 Plan | `##` trong fence | 1.870 | 3 | `:30` **"not a toggle or built-in"** — sai hoàn toàn; `:63-75` "Do NOT write code" thừa; `:369` `/compact` giữa plan/execute | PCE loop; decomposition; "challenge the plan" |
| 6.3 Combo | `##` trong fence ×2 | 1.894 | 2 | Kế thừa lỗi 6.1/6.2; `:342` "compact giữa Think và Plan" sai (thinking không carry) | Mode-decision matrix |

### Phase 7 — Multi-Agent & Full Auto

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 7.1 Levels | OK | 1.690 | 6 | `:127-137,249-253` prompt `[y]/[a]/[n]` bịa; không Shift+Tab, 7 modes, `permissions.*`, `/permissions`, sandbox; `:162` `--dangerously-skip-permissions` "⚠️" (là thật) | Risk×familiarity matrix; "Full Auto only after Think+Plan" |
| 7.2 Full Auto | OK | 1.437 | 4 | `:121-125` boundary bằng "pleading" thay vì `permissions.deny`/hook/sandbox/worktree; `:116` "verify flag" rồi không show flag; `:238` Ctrl+C; không `/rewind`, `--max-turns` | PREPARE→EXECUTE→MONITOR→VERIFY; `git diff [forbidden]` |
| 7.3 Architecture | `##` trong fence | 1.728 | 7 | **Toàn module pre-native**: 0 subagents/agents/teams/worktree/Workflow; `:152-198` `claude -p` ghi file bị deny; `:131` `--output-format json` "⚠️" (là thật); `:140` "No shared memory" sai; `:38-66` diagram kiến trúc nội bộ bịa | 3 pattern map 1:1 lên native |
| 7.4 Loops | OK | 2.266 | 2 | `:86,391` Ctrl+C; không `--max-turns`, Stop hook, `/loop`, `/rewind` | RTAV; healthy-vs-stuck; **REAL CASE tốt nhất phase** |
| 7.5 Tools | `##` trong fence ×3 | 2.679 | 6 | `:32,54` "Claude Code SDK" (→ Agent SDK); ladder bỏ subagents/teams/Workflow; "90% bash đủ" sai; `:589-613` GHA `checkout@v3`/`upload-artifact@v3` retired, không install Claude, không API key; aggregator writes bị deny | 3-layer diagram; bash retry đúng |

### Phase 8 — Meta-Debugging

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 8.1 Hallucination | ❌ H2 thứ 8 `:406` | 2.363 | 4 | `:326` "can't browse web"; `:35` `Array.findLast()` là thật (ES2023); Ex 3 không solution; `:291` `go get -u` (nên `go list -m`) | `npm view` → E404 demo thật; `auto_confirm` case |
| 8.2 Loop | OK | 1.756 | 2 | `:276` Ctrl+C; `:80-87` ladder thiếu `/rewind`, `/compact <focus>` | 3-strike; "ask for ANALYSIS"; expired-vs-invalid case |
| 8.3 Confusion | OK | 1.609 | 2 | `:122-128` fake compact; không show `/compact focus on…`, `/context`, `/rewind`; Ex 1-2 không solution | Confusion/hallucination/loop table |
| 8.4 Quality | OK | 1.509 | 1 | Không PostToolUse hooks, review subagents, claude-code-action | Quick Scan; Good-Enough matrix |
| 8.5 Emergency | `##` trong fence | 1.329 | 4 | **`/rewind` vắng mặt**; Ctrl+C ×5; `:249-256,331` CLAUDE.md "NEVER delete" như prevention (advisory); `git checkout <file>` → `git restore` | STOP→ASSESS→CONTAIN→RECOVER; reflog |

### Phase 9 — Legacy & Brownfield

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 9.1 Archeology | OK | 1.486 | 1 | Không `/init`, `@dir/`, Explore | 5-layer excavation; "Claude didn't write a line" case |
| 9.2 Refactoring | OK | 1.302 | 0 | Thiếu `/rewind`, worktrees, PostToolUse test hook | Risk table; strangler fig |
| 9.3 Tests | OK | 1.347 | 1 | `:100` `npm test file.js` → `npm test -- file.js` | "Fix the TEST not the code" |
| 9.4 Debt | OK | 1.322 | 2 | `:76,141-142` Express 3.x/4.18.2 stale (5 stable từ 2024); không `npm audit`, `--output-format json` | Impact×Effort; interest rate |

### Phase 10 — Team Collaboration

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 10.1 Team CLAUDE.md | OK | 1.626 | 3 | Không managed tier, `.claude/rules/` `paths:`, `@imports`, `#`, `/memory`, `/init` | Lazy-load monorepo diagram đúng; `CLAUDE.local.md` |
| 10.2 Git Conventions | OK | 1.138 | 2 | `:33,59,81` dạy tự thêm attribution (Claude Code đã mặc định; `includeCoAuthoredBy` ⚠️); không `--worktree` | Atomic-commit drill |
| 10.3 Code Review | OK | 1.351 | 1 | Không claude-code-action, `/code-review`, `/security-review`, `/pr-comments`, review subagents | Author/reviewer protocol |
| 10.4 Knowledge | OK; 3 fence không lang | 1.285 | 1 | `docs/prompts/*.md` reinvent `.claude/commands/` + skills + plugins; `:161` "Think carefully prefix" | Lessons-learned template |
| 10.5 Governance | OK | 1.364 | 4 | **0 enforcement**: không managed-settings, precedence, `permissions.deny`, `disableBypassPermissionsMode`, `allowedMcpServers`, OTel, ZDR | Security classification table |

### Phase 11 — Automation & Headless (rủi ro cao nhất)

| Module | Cấu trúc | Từ | Issue | Top vấn đề | Giữ |
|---|---|---|---|---|---|
| 11.1 Headless | OK | 1.628 | 6 | `:146,204,215` + Step 4/5 edit file không permission flag; `:30,33` "Approval: Skipped or auto" (thực ra denied); `:376` `claude -r "auth-work"` ⚠️; thiếu `--json-schema`, `--input-format stream-json`, `--bare`, `--agents`, `setup-token`, stream-json event types | Bảng flag phần lớn đúng |
| 11.2 SDK (.mdx) | OK | 2.710 | 5 | **"No official SDK exists"** sai >1 năm; `:82-93` API bịa; `:51,162,424,704` shell injection; `:89` `claude-opus-4`; `:710` `JSON.parse` free text | Retry/concurrency exercise là Node hygiene ổn |
| 11.3 Hooks | OK | 1.881 | 8 | **Event model bịa toàn bộ** (xem §4A); `:203-215` fake hook output; `:30,383-386` "Post-hooks can't block" sai | 3 use-case (audit, protect .env, notify) đúng hướng — map lên `PostToolUse(Write\|Edit)`, `PreToolUse` exit 2, `Stop`/`SessionEnd` |
| 11.4 GHA | OK; 4 fence không lang | 1.740 | 5 | Không official action; `:116,202` script injection; `:297-306` `paths`+`paths-ignore` invalid; `:129,177` "v11.4"; `:165` "8s" bịa; không `permissions:`, OAuth token, `--max-turns` | GHA cost-control patterns |
| 11.5 MCP | OK; 6 fence không lang | 1.903 | 8 | Desktop config; `server-sqlite` npm không có; `:45-48,350-357` server archived "Official"; `:138` "never sees raw credentials"; `:302-314,392` hard-code token + commit; thiếu OAuth, scopes, `mcp__` perms, `@server:resource`, `MAX_MCP_OUTPUT_TOKENS` | `.mcp.json` section; token-budget warning; Playwright/DevTools MCP |

### Phase 12 — n8n

| Module | Cấu trúc | Từ | Issue | Top vấn đề |
|---|---|---|---|---|
| 12.1 | OK | 1.578 | 5 | `:68` image `n8nio/n8n` không có `claude`; Execute Command bị disable trên n8n Cloud; không permission flags/OAuth token; `:378` `/usr/local/bin/claude` (native = `~/.local/bin`); `:114` vs `:131` `$json.subject` inconsistent; "400+ integrations" stale |
| 12.2 | OK; 8 fence không lang | 1.379 | 2 | Node names cũ; generic n8n catalog |
| 12.3 | ❌ thiếu `description:` | 1.294 | 5 | **Không về Claude Code** (Messages API); `:36` `require()` cần `NODE_FUNCTION_ALLOW_EXTERNAL`; `claude-sonnet-4-20250514` ×7; bỏ qua n8n native Anthropic/AI Agent nodes |

### Phase 13 — Data & Analysis

Cả 3 module (1.367 / 1.188 / 1.431 từ) cấu trúc hoàn hảo, không có lệnh bịa — vì gần như không có
lệnh; toàn transcript giả lập. Không lệch chủ đề nhưng không có gì Claude-Code-specific.
- 13.1: thiếu `--add-dir`, Read `offset/limit`, Bash truncation ~30K, image feedback loop (Claude
  xem PNG tự sinh), NotebookEdit.
- 13.2: nên dạy official document skills (docx/pptx/xlsx/pdf); REAL CASE `:313-317` `claude -p …
  Save to reports/` thiếu permission flag.
- 13.3: nên dạy `tail -n 10000 app.log | claude -p`, `--output-format json`, Ctrl+B.

### Phase 14 — Optimization

| Module | Cấu trúc | Từ | Issue | Top vấn đề |
|---|---|---|---|---|
| 14.1 Task | OK | 1.367 | 1 | Không plan mode, `/rewind`, TodoWrite, subagents |
| 14.2 Speed | OK | 1.455 | 5 | `:93-98` model scores bịa; "Opus slow" stale; không `/fast`, `/effort`, Ctrl+B, subagents, `--worktree`; `:172-180` `claude -p … &` ×3 bị deny + race git; `:199` `/cost` làm gauge |
| 14.3 Quality (.mdx) | OK | 1.336 | 2 | `:64-66,259` "think step by step"; không hooks-as-gate, `.claude/rules/`, reviewer subagent, output styles |
| 14.4 Cost | OK | 1.295 | 6 | `:41-45` giá stale ⚠️; `:295` "Opus 5× Sonnet"; **không prompt caching**; không subscription, `/usage`, `/stats`, `/insights`, `--max-budget-usd`, OTel, 1M premium, `opusplan` |

### Phase 15 — Templates, Skills & Ecosystem

| Module | Cấu trúc | Từ | Issue | Top vấn đề |
|---|---|---|---|---|
| 15.1 Templates | OK; 3 fence | 1.590 | 1 | "Next.js 14" dated; không `@import`, `.claude/rules/` `paths:` |
| 15.2 Commands | OK | 1.266 | 2 | Tên "Command Templates" nhưng dạy paste-in `{{code}}`; `:309-314` `/review /test /doc…` không bao giờ tạo |
| 15.3 Skills | OK | 1.172 | 6 | **Skill system bịa** (§4A); `:107-112` fake installer output; `:72` → `anthropics/skills` |
| 15.4 Ecosystem | OK | 1.413 | 3 | Không official marketplace, `anthropics/skills`, `awesome-claude-code`; repo/star bịa; `claude skill install` |
| 15.5 Custom | OK | 1.496 | 5 | SKILL.md prose; không `.claude/skills/`; không `/skill-doctor`, `claude plugin eval`, plugin packaging; deploy skill không `allowed-tools` |

### Phase 16 — Real-World Mastery

| Module | Cấu trúc | Từ | Issue | Top vấn đề |
|---|---|---|---|---|
| 16.1 Cases | OK | 1.273 | 1 | Không attribution; `:198,202` "55 modules… 100% real examples" (repo 64; Phase 11/15 không real) |
| 16.2 Roles | OK | 964 | 1 | `/component /api /review /arch /terraform…` không cách tạo; thiếu per-role subagents, output styles, `--chrome` |
| 16.3 Teaching | OK | 967 | 1 | Generic; `:218` "55 modules"; thiếu logistics (`claude doctor`, `--worktree` per attendee, `--permission-mode` cho demo, cost/attendee) |

### Cheat sheet / Tips / Index

- **cheat-sheet.mdx** (1.807 từ): đúng — CLI rows, slash commands, shortcuts (Esc Esc, Ctrl+V,
  Ctrl+G, Ctrl+O, Shift+Tab, Option+T, Option+P), `!`, `@`. Sai — `:43,288,308` `/cost` "check
  context level"; `:175-179` hierarchy "overrides"; `:103-111` model tiers stale; `:226-237`
  permission table không cơ chế; `:54` Ctrl+C; `:239-257` gitleaks là git thuần. Thiếu ~30 slash
  (`/rewind /agents /plugin /mcp /hooks /permissions /statusline /fast /effort /usage /stats
  /insights /rename /add-dir /login /code-review /pr-comments /output-style /remote-control
  /skills /skill-doctor /tasks /sandbox…`), ~25 flag (`--permission-mode --worktree --agents
  --bare --json-schema --input-format --append-system-prompt --mcp-config --add-dir --session-id
  --fork-session --fallback-model --effort --chrome…`), shortcuts Ctrl+B, Ctrl+R, Ctrl+T, `#`.
- **tips-tricks.mdx** (2.028 từ): stats bịa `:26,44,64,138,192,308`; fake `/cost` `:128-131`;
  `:117` "30/60/80%" mâu thuẫn `:34` "50-70%"; `:120` "hỏi Claude còn auth.ts không" → `/context`;
  thiếu Ctrl+B, `/rewind`, `--worktree`, subagents, `/effort`, `/fast`, `#`, auto-compact,
  `/insights`; n8n section `:197-231` lặp Phase 12.
- **index.mdx**: `:6,23` "64 Modules" vs "55" nơi khác; `:8` `houston.webp`.

---

## 7. Vấn đề xuyên suốt (cross-cutting)

| # | Vấn đề | Ảnh hưởng | Module |
|---|---|---|---|
| X1 | `/cost` dùng làm context gauge; `/context` không được dạy | Người học không bao giờ thấy composition thật | 1.3, 4.3, 5.1-5.3, 8.3, 14.2, tips, cheat-sheet |
| X2 | `claude -p` ghi file không permission flag | ~40 demo không chạy | 5.2, 7.3, 7.5, 11.1, 12.1, 13.2, 14.2 |
| X3 | Ctrl+C = emergency stop | Mất session | 1.1, 7.2, 7.4, 8.2, 8.5, cheat-sheet |
| X4 | `/rewind` không được dạy | Bỏ lỡ undo native | 3.2, 7.2, 7.4, 8.2, 8.5, 9.2, 14.1 |
| X5 | `/compact <instructions>` + auto-compact không được dạy | Lời khuyên "compact mỗi 30 phút" lỗi thời | 1.3, 4.3, 5.2, 8.3 |
| X6 | `@file` không được dạy ở đâu | Mechanism tham chiếu cơ bản nhất vắng mặt | 1.3, 3.1, 4.1, 4.3 |
| X7 | Enforcement chỉ bằng CLAUDE.md/prompt "pleading" | Vi phạm rule "enforced vs recommended" của chính course | 2.5, 7.2, 8.5, 10.5 |
| X8 | Subagents/teams vắng mặt hoàn toàn | Phase 7 + 3.1, 5.1, 10.3, 14.x lỗi thời | toàn course |
| X9 | `claude config show/reset`, `~/.claude/config.json` | Lệnh/file không tồn tại | 1.1, 2.2, 2.5, 4.4 |
| X10 | Fence lồng nhau vỡ (EN 14, VI 11) | Render sai, PDF build sai | 2.4, 2.5, 4.2 |
| X11 | "Susan" ×9, "Tùng", "Wait — that's wrong", HTML comment | Đọc như filler | Phase 1-4 |
| X12 | Overclaim data logging/training | Uy tín security | 2.3, 2.4 |
| X13 | Không phân biệt Bash-tool vs file-tool access | Threat model thiếu nền | 2.1-2.3 |
| X14 | Templates hứa nhưng không tồn tại | Link chết | 2.5, CLAUDE.md |
| X15 | "55 vs 64 modules" | Metadata mâu thuẫn | README, CLAUDE.md, index, 16.1, 16.3 |
| X16 | Số liệu hiệu suất bịa | Uy tín | 14.2, 14.4, tips, 2.5, 4.1, 5.2 |

---

## 8. Đồng bộ EN/VI

**Tổng quan**: 64/64 VI tồn tại; 7 block H2 khớp 1:1 ở tất cả; metadata đầy đủ. Mọi lỗi kỹ
thuật EN được sao chép sang VI. Đây là điểm tốt (không cần đối chiếu cấu trúc lại) và cũng là
điểm cần lưu ý (sửa EN xong phải sửa VI song song).

| Module | Divergence |
|---|---|
| **VI 7.1** | Thêm demo plan-file với flags bịa `claude --plan`, `--auto --plan` (`:220,243,351`); 2.673 vs 1.690 từ |
| **VI 7.3** | 3.696 vs 1.728 từ (2.1×); thêm "Agent Lifecycle" (`:558`), "Debugging Multi-Agent" (`:569`), REAL CASE dài hơn — bản edit khác, không phải parallel |
| **VI 7.4** | 4.178 vs 2.266 (1.8×); thêm "Termination Condition Checklist"; padding |
| **VI 8.1** | 1.356 vs 2.363 (0.57×); mất Risk Levels, mermaid, "Most Dangerous Type", Key Takeaways, solution Ex 2-3 (`<details>` 2 vs 5); REAL CASE khác (VNPay `vnpay-nodejs`/`buildPaymentUrl` — **hay hơn EN**); ~30 vs ~35 phút. Đề xuất: cắt EN về cỡ VI, thống nhất case VNPay |
| **VI 4.2** | Bản rút gọn 2.094 vs 3.440 (tốt — tránh fence vỡ) nhưng **Ex 2 không có ✅ Solution** (`:319-338`) |
| **VI 11.2** | Bản cũ hơn EN: 1.470 vs 2.710; `require()`; `:78` "Claude Code chưa có official SDK"; extension `.md` vs EN `.mdx` |
| **VI 11.3** | Cùng model bịa; `:152` `cat > ../hooks.json` ghi ngoài `.claude/`, mâu thuẫn `:366` |
| **VI 6.1** | Cùng thang bịa + thêm cột cost bịa `:324` "ultrathink 4-5x" |
| **VI 6.2** | Cùng premise sai `:30` |
| **VI 7.2** | `<details>` 3 vs EN 4; boundary đặt trong CLAUDE.md (EN trong prompt) — cả hai advisory |
| **VI 1.3** | Thêm H3 "Tiếng Việt tốn nhiều token hơn" — **giữ** |
| **VI 5.3** | REAL CASE restructure Bối cảnh/Trước/Sau/Bài học; H3 19 vs 16 — tương đương |
| **VI 3.3, 4.1** | DEMO steps là H3 (EN dùng bold) — cosmetic, nên unify |
| **VI 2.4, 2.5** | Cùng fence vỡ (2.4:572; 2.5 ×10) |
| Extension | EN `.mdx` / VI `.md` ở 6.1 và 11.2 |
| Phase 8.2-8.5, 9, 10, 12, 13, 14, 16, extras | Khớp 1:1, ±5-7% từ |

---

## 9. Roadmap sửa chữa

### Tier 1 — Rewrite (uy tín đang chảy máu)

| # | Module | Việc cần làm |
|---|---|---|
| 1 | **11.3 Hooks** | Viết lại 100%: `settings.json` `hooks`, events thật, matcher, JSON stdin (`jq -r '.tool_input.file_path'`), exit 2, `permissionDecision`/`updatedInput`/`additionalContext`, hook types `command/prompt/agent`, `/hooks` UI, security của hooks. 3 exercise map: `PostToolUse(Write\|Edit)` lint → `PreToolUse` block `.env`/`git push --force` → `Stop`/`SessionEnd` notify |
| 2 | **11.2 SDK** | Rebuild trên Claude Agent SDK TS + Python (`query()`, `ClaudeSDKClient`, options, in-process MCP `tool()`, hooks, agents, `settingSources`); giữ 1 section subprocess fallback dùng `execFileSync` + `--output-format json` + `--json-schema` |
| 3 | **15.3 + 15.5** (+ skills phần 15.4, 4.3, 10.4, 15.2) | Skills/commands hợp nhất: `SKILL.md` frontmatter, `/name`, auto-trigger, `$ARGUMENTS`, `` !`cmd` ``, `allowed-tools`; plugins `.claude-plugin/plugin.json`, marketplace, `/plugin`, `claude plugin eval`, `/skill-doctor` |
| 4 | **Phase 7** | Re-platform 3 pattern: orchestrator-worker = parallel subagents; pipeline = Workflow/chained subagents; specialist = agent teams. Dạy `.claude/agents/*.md`, `/agents`, Explore/Plan built-in, `--bg`, `--worktree`, `--max-turns`, Stop hooks. Thêm permission flags cho mọi `claude -p` còn giữ |
| 5 | **6.1 + 6.2 (+6.3)** | Plan mode native (Shift+Tab, `--permission-mode plan`, plan file, `opusplan`); `/effort`, thinking toggle, `ultrathink`, `MAX_THINKING_TOKENS`, Ctrl+O |
| 6 | **2.2 (+2.5)** | `permissions.allow/deny/ask` + syntax, 7 modes + Shift+Tab, precedence, `/permissions`, `PreToolUse` hook làm enforcement, managed `disableBypassPermissionsMode`. Cắt 2.5 về ≤1.500 từ, đẩy 3 document ra `templates/`, dạy ít nhất 1 enforced control thật |
| 7 | **11.5 MCP** | `claude mcp add` + transports + scopes; `.mcp.json` `${VAR}`; `/mcp` + OAuth; `mcp__server__tool` perms; `@server:resource`; `MAX_MCP_OUTPUT_TOKENS`; bỏ server archived; sửa "never sees credentials" |

### Tier 2 — Update lớn

| # | Module | Việc |
|---|---|---|
| 8 | 1.1 | Native installer 3 OS, `--cask`, `winget`, `/login`, subscription vs API vs Bedrock/Vertex, `claude doctor/update`, IDE/desktop/web |
| 9 | 1.3 | Token math; `/context`; auto-compact; `/compact <focus>`; 1M; bỏ "session chết"; baseline context cost |
| 10 | 4.4 | Transcript persist + `/resume`/`/rewind`; auto memory `/memory`; `CLAUDE.local.md`; `.claude/rules/`; `@imports`; `AGENTS.md`; layout `~/.claude/` thật |
| 11 | 4.2 | Hierarchy đúng (concatenate, managed, `.claude/CLAUDE.md`, local, imports, rules, lazy subdir); dedupe; fix 3 fence |
| 12 | 4.3 | Regenerate output từ session thật; danh sách command 2026; frontmatter/`$1`/`!`/`@`; shortcuts |
| 13 | 11.4 | `claude-code-action@v1` + `/install-github-app`; fix injection (env:); fix `paths`; GitLab note; `permissions:`, OAuth token, `--max-turns` |
| 14 | 11.1 | Section "non-interactive = pre-authorize or denied"; `--json-schema`; `--input-format stream-json`; `--bare`; `--agents`; `setup-token`; stream-json events |
| 15 | 14.4 | Giá hiện tại (⚠️ verify khi viết); prompt caching; subscription limits; `/usage /stats /insights`; `--max-budget-usd`; OTel; 1M premium; `opusplan` |
| 16 | 14.2 / 14.3 | `/fast`, `/effort`, thinking mặc định; hooks-as-gate; reviewer subagents; plan mode; `--worktree`; Ctrl+B |
| 17 | 2.3 | Bỏ `--network=none`; egress allowlist + devcontainer chính thức; built-in sandbox; auth vào container; web |
| 18 | 10.5 (+10.1-10.4) | Managed settings + precedence + deny rules + MCP allowlist + OTel + ZDR; `.claude/rules/` `paths:`; `@imports`; attribution setting; `/code-review`, claude-code-action |
| 19 | 3.3 / 3.4 | Claude tự commit/PR, co-author, `/pr-comments`, worktrees; fix `cd` mâu thuẫn; `run_in_background`/Ctrl+B/`/tasks`; Bash timeout |
| 20 | Cheat sheet + tips | Bổ sung ~30 slash / ~25 flag / shortcuts; `/cost`→`/context`; hierarchy; xóa stats bịa; sửa mâu thuẫn compact threshold |
| 21 | 8.x | `/rewind` + Esc vào 8.2/8.5; `/compact <focus>` + `/context` vào 8.3; sửa 8.1 web claim + bỏ H2 thứ 8; hooks/subagents vào 8.4 |
| 22 | 15.2 / 16.2 | Định nghĩa slash "templates" thành `.claude/commands/` hoặc skills thật |

### Tier 3 — Nội dung mới (thiếu hẳn)

| # | Đề xuất |
|---|---|
| 23 | **Module/Phase "Interfaces"**: Desktop app, VS Code/JetBrains, Claude Code on the web, Remote Control/`/teleport`, mobile, `--chrome`, Slack |
| 24 | **Module/Phase "Enterprise & Observability"**: Bedrock/Vertex/Foundry, LLM gateway, managed settings, OpenTelemetry, analytics, ZDR, self-hosted runner |
| 25 | **Module "Plugins & Marketplace"** (có thể gộp vào 15.4 rewrite) |
| 26 | **Module "Dynamic Workflows"** (Phase 7 hoặc 11): `agent()/pipeline()/parallel()`, `/workflows`, resume, size guideline |
| 27 | **Module "Document Skills"** trong Phase 13: docx/pptx/xlsx/pdf |
| 28 | **Quyết định Phase 12 (n8n)**: cắt, hoặc rebuild thành "n8n → Claude Agent SDK service" + n8n native Anthropic nodes |

### Tier 4 — Cơ học (script hoá được)

→ Xem [Phụ lục B](#phụ-lục-b--danh-sách-quick-win-cơ-học).

### Đề xuất quy trình

1. **Chốt baseline**: ghi rõ "Course verified against Claude Code vX.Y.Z (date)" ở README và
   frontmatter mỗi module; thêm field `verified: 2026-09-xx` để track staleness.
2. **Resolve 28 ⚠️ markers** trước — mỗi marker giờ đã có đáp án trong docs.
3. **Regenerate mọi "Expected output" từ session thật** — không viết tay output nữa.
4. **Cập nhật CLAUDE.md của course**: layout thật, danh sách "Commands Known to Exist" 2026,
   thêm rule "mọi `claude -p` ghi file phải có permission flag", "Esc ≠ Ctrl+C".
5. **Sửa EN → VI song song** cho từng module (VI hiện copy nguyên lỗi EN).
6. **Thêm CI check**: script đếm H2 (phải = 7), fence balance, fence language, line width, word
   count, và grep blacklist (`claude config show`, `.claudeignore`, `/read `, `/project:`,
   `pre-file-write`, `claude skill install`, `claude_desktop_config`, `--network=none`).

---

## Phụ lục A — Inventory docs chính thức 09/2026

Tóm tắt từ `code.claude.com/docs` (v2.1.278, 19/09/2026). Chi tiết đầy đủ nên đọc trực tiếp:
`/docs/en/cli-reference`, `/docs/en/settings`, `/docs/en/hooks`, `/docs/en/sub-agents`,
`/docs/en/skills`, `/docs/en/mcp`, `/docs/en/memory`, `/docs/en/workflows`,
`/docs/en/agent-sdk`, `/docs/en/env-vars`, `/docs/en/changelog`, `/docs/llms.txt`.

**Install**: `curl -fsSL https://claude.ai/install.sh | bash` · `irm https://claude.ai/install.ps1 | iex`
· `brew install --cask claude-code` · `winget install Anthropic.ClaudeCode` · apt/dnf/apk ·
`claude update`.

**CLI subcommands**: `claude`, `claude -p`, `-c`, `-r`, `update`, `doctor`, `mcp`, `plugin`,
`agents`, `attach/logs/stop/rm/respawn <id>`, `auth login/logout/status`, `setup-token`,
`remote-control`, `gateway`, `self-hosted-runner`, `auto-mode defaults/reset`, `daemon`,
`project purge`, `ultrareview`.

**Flags chính**: `-p/--print`, `-c`, `-r`, `-n/--name`, `--fork-session`, `--bg`, `--cloud`,
`--remote-control`, `--model`, `--effort`, `--fallback-model`, `--advisor` ⚠️, `--autocompact`,
`--permission-mode`, `--dangerously-skip-permissions`, `--allowedTools`, `--disallowedTools`,
`--permission-prompt-tool`, `--append-system-prompt(-file)`, `--system-prompt`, `--add-dir`,
`--settings`, `--plugin-dir`, `--mcp-config`, `--strict-mcp-config`, `--agent`, `--agents`,
`--input-format`, `--output-format`, `--json-schema`, `--max-turns`, `--max-budget-usd`,
`--no-session-persistence`, `--include-partial-messages`, `--debug`, `--verbose`, `--chrome`,
`--ide`, `--worktree/-w`, `--bare`, `--safe-mode`, `--from-pr`, `--betas`.

**Slash commands**: `/help /clear /compact /cost /model /effort /permissions /config /status
/doctor /memory /hooks /agents /mcp /plugin /rewind /resume /branch /rename /export /add-dir
/context /review /code-review /security-review /pr-comments /release-notes /todos /tasks
/bashes /loop /schedule /insights /usage /stats /vim /terminal-setup /output-style /statusline
/fast /voice /skills /skill-doctor /install-slack-app /install-github-app /workflows
/deep-research /desktop /remote-control /cloud /teleport /recap /sandbox /login /logout /bug
/init` (một số ít phổ biến ⚠️ verify tên chính xác).

**Shortcuts**: Esc (interrupt), Esc Esc (rewind), Shift+Tab (mode cycle), Ctrl+B (background),
Ctrl+O (thinking), Ctrl+R (history), Ctrl+T (todos), Ctrl+V (paste image), Ctrl+G, Ctrl+S,
Ctrl+Enter, Option+T (thinking toggle), Option+P (model), `!` (bash), `@` (file/resource),
`#` (memory), `?`.

**Permission modes**: `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`
(`manual` = alias `default`).

**Settings precedence**: managed (`managed-settings.json` / MDM / console) > `--settings` >
`.claude/settings.local.json` > `.claude/settings.json` > `~/.claude/settings.json`.

**Settings keys**: `permissions{allow,deny,ask,defaultMode,additionalDirectories,
disableBypassPermissionsMode}`, `model`, `effortLevel`, `env`, `hooks`, `statusLine`,
`outputStyle`, `sandbox`, `includeCoAuthoredBy`, `enabledPlugins`, `extraKnownMarketplaces`,
`apiKeyHelper`, `cleanupPeriodDays`, `enabledMcpjsonServers`, `allowedMcpServers`,
`workflowSizeGuideline`, `subagentPromptCacheTtl`, `autoContinueAtUsageLimit`,
`disableAllHooks`, `alwaysThinkingEnabled` ⚠️.

**Hooks**: events core `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`,
`UserPromptSubmit`, `SessionStart`, `SessionEnd`, `Stop`, `SubagentStart`, `SubagentStop`,
`Notification`, `PreCompact`; docs liệt kê thêm nhiều event mới (`ConfigChange`,
`WorktreeCreate/Remove`, `TaskCompleted`, `Elicitation`, `PostCompact`, `FileChanged`…) ⚠️
verify từng cái. Types: `command`, `prompt`, `agent` (+ `http`, `mcp_tool` ⚠️). Stdin JSON;
stdout JSON (`hookSpecificOutput.permissionDecision`, `updatedInput`, `additionalContext`,
`decision`, `continue`, `systemMessage`); exit 2 = block.

**Subagents**: `.claude/agents/*.md`, `~/.claude/agents/`, plugin; frontmatter `name`,
`description`, `tools`, `model`, `permissionMode`, `skills`, `memory`, `isolation`,
`maxTurns`; built-in Explore/Plan/general-purpose; spawn depth 3; `--agent`, `--agents`.

**Skills**: `.claude/skills/<name>/SKILL.md`, `~/.claude/skills/`; frontmatter `name`,
`description`, `allowed-tools`, `disable-model-invocation`, `user-invocable`, `argument-hint`,
`model`, `context` ⚠️; `$ARGUMENTS`; `` !`cmd` ``; `.claude/commands/` vẫn hỗ trợ.

**Plugins**: `.claude-plugin/plugin.json` (skills/agents/commands/hooks/.mcp.json),
`.claude-plugin/marketplace.json`, `/plugin marketplace add`, `/plugin install`,
`claude plugin install|list|enable|disable|validate|eval`, `--plugin-dir`.

**MCP**: `claude mcp add --transport http|stdio|sse(deprecated) --scope local|project|user
-e -H`, `add-json`, `list|get|remove|login|logout|serve`, `.mcp.json` `${VAR}`/`${VAR:-default}`,
`/mcp` OAuth, `mcp__server__tool`, `@server:resource`, `/mcp__server__prompt`,
`MAX_MCP_OUTPUT_TOKENS` (25k).

**Memory**: managed CLAUDE.md > `CLAUDE.md`/`.claude/CLAUDE.md` > `CLAUDE.local.md`;
`.claude/rules/*.md` (`paths:`); `@imports`; auto memory + `/memory`; `#` quick-add;
`AGENTS.md` (v2.1.278); subdir lazy-load.

**Models**: Opus 5, Sonnet 5, Haiku 4.5, Fable 5.1; alias `opus/sonnet/haiku/opusplan`;
`ANTHROPIC_MODEL`, `ANTHROPIC_DEFAULT_*_MODEL`; effort `low/medium/high/xhigh/max` (+
`ultracode`); `/fast`; 1M `[1m]`.

**Agent SDK**: `@anthropic-ai/claude-agent-sdk` (npm), `claude-agent-sdk` (PyPI); `query()`,
`ClaudeSDKClient`, `ClaudeAgentOptions`, `tool()`, `createSdkMcpServer()`.

**Automation**: Dynamic Workflows (`agent/pipeline/parallel/phase`, `/workflows`, `ultracode`),
`/loop`, `/schedule` (cloud routines), Desktop scheduled tasks, channels, `claude-code-action@v1`,
GitLab CI/CD.

**Enterprise**: Bedrock (`CLAUDE_CODE_USE_BEDROCK`, `ANTHROPIC_BEDROCK_*`), Vertex
(`ANTHROPIC_VERTEX_*`), Foundry (`ANTHROPIC_FOUNDRY_*`), gateway, OTel
(`CLAUDE_CODE_ENABLE_TELEMETRY`), ZDR, analytics, self-hosted runner.

**Env vars đáng dạy**: `ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_MODEL`,
`CLAUDE_CODE_OAUTH_TOKEN`, `BASH_DEFAULT_TIMEOUT_MS` (120000), `BASH_MAX_TIMEOUT_MS` (600000),
`BASH_MAX_OUTPUT_LENGTH` (30000), `MAX_THINKING_TOKENS`, `MAX_MCP_OUTPUT_TOKENS`,
`CLAUDE_CODE_MAX_OUTPUT_TOKENS`, `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`, `DISABLE_TELEMETRY`,
`DISABLE_ERROR_REPORTING`, `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`, `CLAUDE_PROJECT_DIR`
(trong hook), `CLAUDECODE`.

**Changelog 2026 nổi bật**: AGENTS.md (2.1.278), server-side auto-mode classifier, `/recap`,
`claude plugin eval` + `/output-style` (2.1.269), VS Code agent map + hooks/permission dialogs +
memory UI, workflow pause/resume at usage limit (2.1.271+), fast mode trong cloud, per-command
domain allowlist, Ctrl+Enter send-now (2.1.275).

---

## Phụ lục B — Danh sách quick-win cơ học

Có thể làm bằng script/sed, không cần viết lại nội dung:

1. Fix 14 nested fence EN (2.4:566; 2.5: 481,493,506,524,536,874,886,891,896,901; 4.2:
   176,323,433) + 11 VI (2.4:572; 2.5 ×10).
2. Thêm language cho ~50 fence trống (12.2 ×8, 11.5 ×6, 11.3 ×5, 11.4 ×4, 10.4 ×3, 15.1 ×3…).
3. Xóa H2 thứ 8: 8.1:406 `## Key Takeaways`; 2.5:1327 `## Phase 2 Complete`.
4. Xóa/sửa `##` trong code block: 5.2, 6.2, 6.3, 7.3, 7.5, 8.5 (đổi thành `###` hoặc bỏ `#`).
5. Grep-replace toàn course (EN+VI):
   - `claude config show|reset` → xóa / `~/.claude/settings.json`
   - `~/.claude/config.json`, `.claude/config` → `settings.json`
   - `.claudeignore` → `permissions.deny`
   - `/read path` → `@path`
   - `/project:`, `/user:` → bare name
   - `claude-3-5-sonnet-20241022`, `claude-sonnet-4-20250514`, `claude-opus-4` → alias hiện tại
   - `brew install claude-code` → `brew install --cask claude-code`
   - `gitleaks protect --staged` → `gitleaks git --pre-commit --staged`; `detect --no-git` → `dir`
   - `git filter-branch` → `git filter-repo`
   - `docker-compose` → `docker compose`; `node:18` → `node:22`; `--only=production` → `--omit=dev`
   - `npm test file.js` → `npm test -- file.js` (9.3:100)
   - `/usr/local/bin/claude` → `~/.local/bin/claude`
   - "Ctrl+C" trong ngữ cảnh interrupt → "Esc"
   - `Split In Batches` → `Loop Over Items`
6. Xóa rác biên tập: 2.1:403 "Wait — that's wrong"; 3.1:6-9 HTML comment; 2.4:790-792 câu lặp;
   2.4:88 "Tùng"; 11.4:129,177 "v11.4".
7. Unify "55" → "64 modules" ở README, CLAUDE.md, 16.1:198,202, 16.3:218.
8. Thay `houston.webp`; README badge version.
9. Thêm `description:` cho 12.3.
10. Đổi extension VI 6.1, 11.2 → `.mdx` (hoặc EN → `.md`) cho khớp.
11. Tạo `templates/claude-md-security-example.md`, `security-checklists.md`,
    `onboarding-security.md` (lấy từ 2.5) hoặc xóa lời hứa 2.5:1320-1323.
12. Thêm solution: VI 4.2 Ex 2; EN 8.1 Ex 3; EN 8.3 Ex 1-2; VI 8.1 Ex 2-3.
13. Xóa VI 7.1 flags `--plan`, `--auto` (`:220,243,351`).
14. Wrap dòng >100 ký tự (mọi file 9-37 dòng).
15. Cập nhật CLAUDE.md của course: directory layout thật; "Commands Known to Exist" 2026; bỏ
    `/status`, `/model`, `brew --cask`, native installer khỏi "Need Verification".
16. Thêm script `scripts/lint-course.sh`: đếm H2 = 7, fence balance, fence lang, width,
    word count, grep blacklist các pattern ở mục 5.

---

*Báo cáo được tạo ngày 21/09/2026. Số dòng trích dẫn có thể lệch ±3 sau khi sửa fence.*
