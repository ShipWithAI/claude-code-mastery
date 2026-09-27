---
title: 'Slash Commands'
description: 'Tìm mọi built-in slash command, viết custom command trong .claude/commands/, và biết khi nào nên nâng cấp nó thành skill.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 4.3: Slash Commands

> **Thời gian học**: ~25 phút
>
> **Yêu cầu trước**: Module 4.2 (CLAUDE.md — Bộ Nhớ Dự Án)
>
> **Kết quả**: Sau module này, bạn sẽ tìm được bất kỳ built-in command nào bằng `/`, viết được một project command trong `.claude/commands/` nhận argument và chạy trước một bước kiểm tra shell, và biết khi nào nên nâng cấp command đó thành skill.

---

## 1. WHY — Tại Sao Cần Biết

Bạn gõ `/` và cả danh sách tên trôi qua — vài cái built-in, vài cái là skill đồng nghiệp cài, vài cái là plugin bạn quên đã bật. Cần `/compact`, nhưng là `/compact` hay `/context`? Trong khi đó, team bạn cứ dán lại cùng một prompt "review diff này xem có lỗi bảo mật không" vào mỗi session. Cả hai vấn đề chung một cách giải: nắm bề mặt built-in, biến prompt lặp lại thành command cả team lấy miễn phí qua git.

---

## 2. CONCEPT — Ba Loại Lệnh `/`

Mọi thứ bắt đầu bằng `/` rơi vào một trong ba nhóm:

| Loại | Nằm ở đâu | Gọi bằng |
|---|---|---|
| **Built-in** | Đi kèm sẵn trong Claude Code | `/context`, `/compact`, `/model`, … |
| **Custom command** | `.claude/commands/<name>.md` (project, commit vào git) hoặc `~/.claude/commands/<name>.md` (cá nhân, mọi project) | `/name` |
| **Skill / plugin** | `.claude/skills/<name>/SKILL.md`; skill của plugin load thành `<plugin>:<skill>` | `/name`, hoặc Claude tự invoke |

Custom command và skill cố ý chồng nhau: "A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way." Subdirectory sẽ namespace: `.claude/commands/frontend/component.md` → `/frontend:component`. Trùng tên thì skill thắng.

### Frontmatter mà command có thể set

| Field | Ý nghĩa |
|---|---|
| `description` | Command làm gì; Claude đọc field này để quyết định có tự invoke hay không |
| `argument-hint` | Gợi ý autocomplete, ví dụ `"<issue-number>"` |
| `allowed-tools` | Pre-approve tool *chỉ cho lần invoke này*, cú pháp `Tool(pattern)` |
| `model` | Đổi model của session trong lúc command này chạy |
| `disable-model-invocation` | `true` — chỉ bạn được chạy, Claude không tự chạy được |

Bên trong body: `$ARGUMENTS` là toàn bộ text gõ sau tên command; `$0`, `$1`, `$2`… là từng phần theo vị trí. `` !`command` `` chạy một shell command trước khi prompt của bạn đến tay Claude và thay output vào chỗ đó — "a failed command aborts the entire invocation" (lệnh fail sẽ hủy toàn bộ lần invoke), nên thêm `|| true` khi bạn biết trước lệnh có thể fail. `@file` chèn nội dung file y hệt cách nó làm với local skill (theo skills.md; không có trang riêng nói về cú pháp `@file`).

### Built-in command nên thuộc lòng

| Nhóm | Các lệnh |
|---|---|
| **Session** | `/clear` (conversation mới, giữ memory) · `/compact [instructions]` (tóm tắt để giải phóng context) · `/context` (lưới màu hiển thị context đang dùng) · `/resume` (mở lại session cũ) · `/rewind` (lùi code/conversation về checkpoint) |
| **Config** | `/model` (đổi model) · `/effort` (mức reasoning low…xhigh) · `/permissions` (rule allow/ask/deny) · `/config` (theme, output style, settings) · `/memory` (sửa CLAUDE.md, bật/tắt auto memory) |
| **Extend** | `/agents` (nhờ Claude tạo/quản lý subagent, hoặc tự sửa `.claude/agents/`) · `/hooks` (xem cấu hình hook) · `/mcp` (quản lý kết nối MCP) · `/plugin` (install/enable/disable plugin) · `/skills` (liệt kê và bật/tắt hiển thị skill) |
| **Account** | `/login` (đăng nhập tài khoản Anthropic) · `/status` (version, model, account, connectivity) · `/usage` (chi phí session, giới hạn plan — `/cost` và `/stats` là alias) · `/doctor` (setup checkup, tự fix được vài lỗi) |

Skill kiểu `/deploy` là bước tiếp theo tự nhiên khi một file command lớn thêm script hỗ trợ hoặc tài liệu tham khảo mà command file không chứa được (Module 15.3).

---

## 3. DEMO — Từng Bước Thực Hành

Thư mục làm việc: `~/cc-lab`.

**Bước 1: Gõ `/` rồi gõ thêm vài chữ để filter**

Gõ `/` trống mở popup ngắn, cao cố định — ở máy này mấy dòng đầu là skill riêng, nên gõ thêm vài
chữ để lọc ra built-in:

```text
# Output may vary — lọc bằng vài chữ để built-in hiện ra ngay
❯ /co
  /copy                                                  Copy Claude's last response to clipboard (or /copy N for the Nth-latest)
  /color                                                 Set the prompt bar color for this session
  /config                                                Open settings
  /compact                                               Free up context by summarizing the conversation so far
  /context                                               Visualize current context usage as a colored grid
```
Nhấn `↓` để cuộn tiếp cùng danh sách đã lọc — nó vẫn trộn built-in với bất cứ thứ gì khác trùng khớp:
```text
# Output may vary
  /code-review                                           3 free /ultrareview · Review the current diff, or a PR number/branch/path target, for correctness bugs…
  …                                                       … (đã che — skill riêng của bạn, cũng khớp "co")
```
Danh sách luôn trộn built-in với thứ bạn đã cài — nên mục cá nhân ở đây bị che bằng `…`.

**Bước 2: `/help` để tra cứu nhanh**

```text
# Output may vary
❯ /help
   Help  General   Commands   Custom commands
   Claude understands your codebase, makes edits with your permission, and executes commands.
   New here? Run /powerup to learn the features most people miss.
   Shortcuts
   ! for shell mode          double tap esc to clear input      ctrl + shift + _ to undo
   / for commands            shift + tab to auto-accept edits    ctrl + z to suspend
   @ for file paths          ctrl + o for verbose output         ctrl + v to paste images
   /btw for side question    ctrl + t to toggle tasks            opt + p to switch model
   Esc to cancel
```
Tab **Commands** liệt kê built-in; tab **Custom commands** liệt kê skill và file `.claude/commands/`, có gắn nhãn nguồn.

**Bước 3: Viết project command nhận argument và chạy trước một bước kiểm tra**

```markdown
<!-- .claude/commands/review-file.md -->
---
description: Review a file against its current git diff
argument-hint: "<path>"
allowed-tools: Read, Bash(git diff *)
---

Diff stat for context:

!`git diff --stat`

Review the file at $1. Flag bugs, missing error handling, and missing tests.
```
`allowed-tools` chỉ pre-approve khối `!`; nó không pre-approve bất cứ điều gì Claude tự quyết định làm thêm sau đó.

**Bước 4: Chạy thử**

```text
# Output may vary — chạy thật với một thay đổi một dòng chưa commit trong src/math.js
❯ /review-file src/math.js
⏺ Review: src/math.js
  What changed: you added one line, subtract(a, b), at src/math.js:3.
  Bugs
  1. divide doesn't guard against division by zero (src/math.js:2, existing
     code). divide(1, 0) returns Infinity with no error…
  Missing tests
  3. subtract (the new function) has no test…
```
Claude còn xin chạy `npm test`, nằm ngoài `Bash(git diff *)` — bằng chứng `allowed-tools` chỉ bao đúng pattern bạn liệt kê.

**Bước 5: Namespace một command trong subdirectory**

```markdown
<!-- .claude/commands/frontend/component.md -->
---
description: Scaffold a new frontend component with a matching test file
argument-hint: "<ComponentName>"
---

Create a new component named $1 under src/components/, plus a matching test file.
```

```text
# Output may vary
❯ /frontend
  /frontend:component                                    Scaffold a new frontend component with a matching test file (project)
  …                                                       (đã che — skill riêng của bạn)
```
Nhãn `(project)` xác nhận command đến từ `.claude/commands/`; subdirectory trở thành namespace.

**Bước 6: Dọn dẹp**
```bash
git -C ~/cc-lab checkout -- . && git -C ~/cc-lab clean -fd
```

---

## 4. PRACTICE — Tự Thử Nghiệm

### Bài Tập 1: `/fix-issue`

**Mục tiêu**: Viết `.claude/commands/fix-issue.md` nhận số issue và load sẵn issue.

**Hướng dẫn**: Dùng `$1` cho số issue và `` !`gh issue view $1` `` để chèn issue trước khi Claude đọc hướng dẫn.

<details>
<summary>💡 Gợi Ý</summary>
Khối `!` cần permission riêng. Pre-approve nó trong frontmatter.
</details>

<details>
<summary>✅ Giải Pháp</summary>

```markdown
---
description: Investigate and fix a GitHub issue
argument-hint: "<issue-number>"
allowed-tools: Bash(gh issue view *)
---

Issue #$1:

!`gh issue view $1`

Read the issue above, find the relevant code, and propose a fix.
```
</details>

### Bài Tập 2: Command lớn quá khổ file

**Mục tiêu**: Quyết định khi nào `.claude/commands/deploy.md` nên trở thành `.claude/skills/deploy/SKILL.md`.

**Hướng dẫn**: File command không đi kèm được script hay tài liệu riêng — skill thì được. Cần thêm file thứ hai thì chuyển sang skill (Module 15.3).

<details>
<summary>✅ Giải Pháp</summary>
`deploy.md` cứ nói "xem checklist bên dưới" và checklist dài mãi → tách `SKILL.md` (ngắn) cộng `checklist.md` (load khi cần), vẫn gọi `/deploy` nhưng tốn ít context hơn.
</details>

### Bài Tập 3: `/compact` vs `/clear`

**Mục tiêu**: Tóm tắt vs. xóa hẳn.

**Hướng dẫn**: Implement thứ nhỏ, chạy `/compact`, hỏi "vừa build cái gì?" Rồi chạy `/clear`, hỏi lại.

**Kết quả mong đợi**: Sau `/compact`, Claude trả lời dựa trên bản tóm tắt. Sau `/clear`, Claude không biết gì — `/clear` giữ CLAUDE.md, không giữ lịch sử hội thoại.

---

## 5. CHEAT SHEET

| Lệnh | Chức Năng |
|---|---|
| `/clear` | Conversation mới, giữ CLAUDE.md |
| `/compact [instructions]` | Tóm tắt ngay, có thể kèm hướng tập trung |
| `/context [all]` | Lưới màu hiển thị context usage |
| `/resume` | Mở lại một session |
| `/branch` | Fork conversation, giữ nguyên bản gốc |
| `/rewind` | Lùi code/conversation về trước |
| `/model` | Đổi model |
| `/effort` | Đặt mức reasoning effort |
| `/permissions` | Rule allow/ask/deny |
| `/sandbox` | Bật/tắt sandbox mode (chỉ vài platform hỗ trợ) |
| `/config` | Theme, output style, settings |
| `/output-style` | Liệt kê/đổi output style |
| `/memory` | Sửa CLAUDE.md, bật/tắt auto memory |
| `/agents` | Nhờ Claude quản lý subagent, hoặc tự sửa `.claude/agents/` |
| `/hooks` | Xem cấu hình hook |
| `/mcp` | Quản lý kết nối MCP |
| `/plugin` | Install/enable/disable plugin |
| `/skills` | Liệt kê và bật/tắt skill |
| `/skill-doctor` | Báo cáo chi phí context của skill |
| `/login` / `/logout` | Tài khoản |
| `/usage` | Chi phí, giới hạn plan (`/cost`, `/stats` = alias) |
| `/status` | Version, model, connectivity |
| `/doctor` | Setup checkup, tự fix được vài lỗi |
| `/bug` / `/feedback` | Báo lỗi / gửi feedback |

**Cú pháp custom command**

| File | Gọi bằng |
|---|---|
| `.claude/commands/<name>.md` | `/name` |
| `.claude/commands/<subdir>/<name>.md` | `/subdir:name` |
| `~/.claude/commands/<name>.md` | `/name` (mọi project) |

**Shortcut liên quan**: `/` mở menu, gõ tiếp để filter · `Tab`/mũi tên để điều hướng · `!` ở đầu dòng = shell mode · `@` = autocomplete đường dẫn file · `?` khi input trống = mở panel shortcut help.

---

## 6. PITFALLS — Sai Lầm Thường Gặp

| ❌ Sai Lầm | ✅ Cách Đúng |
|---|---|
| Thêm tiền tố scope `project` / `user` + dấu hai chấm kiểu cũ vào tên command | Namespace đó đã bị bỏ. Chỉ cần `/name`, hoặc `/subdir:name` khi command nằm trong subdirectory. |
| Tự gõ tay xem `/help` hay `/usage` "chắc" in ra gì | Chạy thật trong lab của bạn rồi dán nguyên output — nó đổi theo từng version. |
| Khối `!` gọi một lệnh có thể fail hợp lệ | Thêm `\|\| true`, vì lệnh fail sẽ hủy toàn bộ lần invoke, không chỉ dòng đó. |
| Command có side effect (`/deploy`, `/commit`) mà vẫn để Claude tự invoke được | Set `disable-model-invocation: true` để chỉ bạn được chạy. |
| Dùng lại `/pr-comments` | Đã bị gỡ ở v2.1.91. Hỏi Claude trực tiếp để xem pull request comments thay vì gọi lệnh này. |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

Một team backend ở fintech Việt Nam giữ ba prompt chỉ sống trong Slack: "review diff xem có lỗi auth không," "viết changelog entry," "điều tra issue #N." Nhân viên mới không tìm ra. Team commit ba file vào `.claude/commands/`: `review-file.md`, `ship-notes.md`, `fix-issue.md`, mỗi file có `argument-hint` và một khối `!` lấy sẵn diff hoặc issue.

Kết quả: mọi người có ngay ba command giống nhau lúc vừa clone repo — không cần onboarding, không dán lại prompt. Khi `fix-issue.md` cần thêm file phụ (checklist triage), team nâng nó thành skill dưới `.claude/skills/fix-issue/`, vẫn giữ tên `/fix-issue` quen thuộc.

---

> **Tiếp theo**: [Module 4.4: Memory System](../04-memory-system/) →
