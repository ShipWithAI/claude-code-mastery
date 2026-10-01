---
title: 'Templates lệnh & prompt'
description: 'Biến prompt lặp lại thành file .claude/commands/*.md thật, có frontmatter, $ARGUMENTS, và shell pre-executed.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 15.2: Templates lệnh & prompt

> **Thời gian ước tính**: ~30 phút
>
> **Yêu cầu trước**: Module 15.1 (CLAUDE.md Templates)
>
> **Kết quả**: Sau module này, bạn có file `.claude/commands/*.md` thật — có frontmatter,
> `$ARGUMENTS`, và shell pre-executed — gọi được bằng `/name`, cùng quy tắc khi nào một prompt
> one-off nên ở lại dạng prompt thường thay vì thành command file.

---

## 1. WHY — Tại sao cần học

Bạn cứ gõ lại đúng instruction review/test/doc mỗi lần dùng Claude Code. Một "prompt template"
chỉ tồn tại dưới dạng đoạn Markdown copy-paste thì không reusable theo nghĩa Claude Code hiểu —
vẫn phải gõ tay, `{{placeholder}}` không ai parse, đồng nghiệp không tìm ra trừ khi bạn chỉ chỗ.
Claude Code có cơ chế thật cho việc này: file trong `.claude/commands/` trở thành command `/name`
thật, có argument substitution thật và shell output được inject trước khi Claude thấy prompt.
Viết file một lần, commit, cả repo có cùng `/name`.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Command file nằm ở đâu

| Location | Gọi bằng |
|---|---|
| `.claude/commands/pr-review.md` | `/pr-review` (project, commit vào git) |
| `~/.claude/commands/pr-review.md` | `/pr-review` (personal, mọi project) |
| `.claude/commands/testing/gen-unit-tests.md` | `/testing:gen-unit-tests` (namespaced) |

Docs quote (trang skills): "A file at `.claude/commands/deploy.md` and a skill at
`.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way. Your existing
`.claude/commands/` files keep working." Skill (Module 15.3) thêm folder cho supporting file và
control invocation chi tiết hơn; command file một file đơn giản hơn khi bạn chỉ cần vậy. Nếu skill
và command file trùng tên, skill chạy. [Module 4.3](../../phase-04-prompt-memory/03-slash-commands/)
cover cơ chế slash-command rộng hơn — built-in, `/help`, và command ở session-level — mà command
file này plug vào.

### Frontmatter (command file support cùng field với skill, trừ `name`/`paths`)

| Field | Ý nghĩa |
|---|---|
| `description` | Hiện trong `/help`; Claude dùng để quyết định khi nào gợi ý |
| `argument-hint` | Hint autocomplete, ví dụ `[focus-area]` |
| `allowed-tools` | Tool pre-approve cho lần gọi này, ví dụ `Bash(git diff *)` |
| `model` | Override model chỉ cho command này |
| `disable-model-invocation` | `true` = chỉ bạn gọi được, Claude không tự chạy |

### Substitution

- `$ARGUMENTS` — toàn bộ text sau tên command. Nếu body không đọc nó, Claude Code append
  `ARGUMENTS: <value>` vào cuối.
- `$0`, `$1`, … — positional argument; `$0` là argument **đầu tiên**, không phải `$1`.
- `` !`git diff HEAD` `` — chạy shell command trước khi prompt được gửi; output thay placeholder.
  Command fail thì abort toàn bộ invocation — thêm `|| true` nếu fail là expected.

### Quy tắc đặt tên

Đừng đặt tên command trùng built-in. `/review` đã là alias của `/code-review`, `/debug` đã là
bundled skill — check danh sách built-in (`/help`, hoặc docs commands) trước khi chọn tên.

---

## 3. DEMO — Từng bước cụ thể

**Bước 1: Viết command review thật**

```markdown
---
description: Review the current working-tree diff for correctness, security, and readability
argument-hint: [focus-area]
allowed-tools: Bash(git diff *)
---
## Diff to review
!`git diff HEAD`

## Focus area (optional)
$ARGUMENTS

Review the diff above. If a focus area was given, cover that category first, then the others.
For each finding: 🔴 Critical / 🟠 Important / 🟡 Suggestion — `file:line` — one-sentence reason.
End with ✅ Good practices observed (if any).
```
Lưu thành `.claude/commands/pr-review.md` — docs: `code.claude.com/docs/en/skills`.

**Bước 2: Viết thêm hai command, cùng pattern**

`.claude/commands/gen-tests.md` (`argument-hint: [file]`, `allowed-tools: Read, Glob`) yêu cầu
Claude generate `node:test` case theo style của `@tests/math.test.mjs` cho `$ARGUMENTS`.
`.claude/commands/gen-docs.md` (`allowed-tools: Read`) generate JSDoc block cho mỗi exported
function trong `$ARGUMENTS`. Cả hai chỉ print code, không edit file.

**Bước 3: Tạo diff thật, rồi gọi `/pr-review`**

```bash
# sửa src/math.js, thêm function mới chia không guard
git diff --stat
```
Expected output:
```text
# Output may vary
 src/math.js | 3 +++
 1 file changed, 3 insertions(+)
```

```bash
claude -p "/pr-review security" --allowedTools "Read,Bash(git diff *)"
```
Expected output (rút gọn):
```text
# Output may vary
**Security**
- 🟠 Important — `src/math.js:3` — `percentOf` doesn't check its inputs. JavaScript silently
  converts types, so bad values pass through without an error…

**Correctness**
- 🟠 Important — `src/math.js:4` — When `whole === 0`, the function returns `Infinity` … instead
  of failing clearly. The existing `divide` at `src/math.js:2` has the same gap.

✅ Good practices observed
- It's a pure function with no side effects, so it's easy to test.
```
Không có permission prompt nào hiện ra: `git diff` là Bash form read-only và `Read` không cần
approval trong working directory, nên chạy y hệt trên CI như trên laptop.

---

## 4. PRACTICE — Luyện tập

### Bài 1: Gọi thử và so sánh

**Mục tiêu**: Thấy command file thật catch được gì mà prompt copy-paste không catch.

**Hướng dẫn**:
1. Tạo `.claude/commands/pr-review.md` từ Bước 1.
2. Sửa nhỏ trong repo, chạy `/pr-review`, rồi `/pr-review security`.
3. So sánh: argument focus có đổi thứ tự finding không?

<details>
<summary>💡 Gợi ý</summary>
`$ARGUMENTS` chỉ đổi phần "Focus area" — phần diff inject qua `!` chạy giống hệt cả hai lần.
</details>

### Bài 2: Command namespaced với positional argument

**Mục tiêu**: Build command nhận hai argument riêng biệt.

**Hướng dẫn**:
1. Tạo `.claude/commands/testing/gen-unit-tests.md` với `argument-hint: [file] [function-name]`
   và body đọc `$0` (file) và `$1` (function name) riêng.
2. Chạy `/testing:gen-unit-tests src/math.js percentOf`.
3. Xác nhận tên command bị namespace (`/testing:gen-unit-tests`, không phải `/gen-unit-tests`).

<details>
<summary>✅ Giải pháp</summary>

```markdown
---
description: Generate node:test unit tests matching this repo's existing style
argument-hint: [file] [function-name]
allowed-tools: Read, Glob
---
Generate `node:test` unit tests for `$1` in `$0`, matching `@tests/math.test.mjs`'s style.
Cover the happy path, one edge case, and one error case. Print the code only.
```
Subdirectory dưới `.claude/commands/` luôn thành prefix `/subdir:name` — đó là cách Claude Code
namespace command, không phải convention bạn tự chọn.
</details>

---

## 5. CHEAT SHEET

| Frontmatter field | Mục đích |
|---|---|
| `description` | Liệt kê trong `/help`; drive auto-suggestion |
| `argument-hint` | Hint autocomplete |
| `allowed-tools` | Pre-approve tool cho invocation này |
| `model` | Override model cho command này |
| `disable-model-invocation` | `true` = chỉ user gọi được, không auto-trigger |

| Substitution | Ý nghĩa |
|---|---|
| `$ARGUMENTS` | Toàn bộ text sau tên command |
| `$0`, `$1`, … | Positional argument (0-indexed) |
| `` !`cmd` `` | Chạy trước prompt; output thay placeholder |

| Location | Scope |
|---|---|
| `.claude/commands/<name>.md` | Project, commit vào git |
| `~/.claude/commands/<name>.md` | Personal, mọi project |
| `.claude/commands/<subdir>/<name>.md` | Namespaced `/subdir:name` |

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|---|---|
| `docs/prompt-templates.md` không ai chạy | File `.claude/commands/<name>.md` thật, gọi bằng `/name` |
| Syntax `{{placeholder}}` (không bao giờ được parse) | `$ARGUMENTS` hoặc `$0`/`$1` — substitution duy nhất Claude Code đọc |
| Đặt tên command `/review` hay `/debug` | Check danh sách built-in trước; skill thắng khi trùng tên |
| `!`command`` không có `\|\| true` khi fail là expected | Command abort hoàn toàn — Claude không thấy phần còn lại của file |
| Một command khổng lồ làm mọi thứ | Mỗi command một task; one-off thật (dán đúng error này) ở lại dạng prompt thường |
| Command read-only không có `allowed-tools` | Thêm vào để command chạy unattended trong `-p` và CI, không chỉ interactive |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Một team nhỏ giữ Google Doc chung "prompt Claude Code hay". Ai nhớ doc tồn tại thì
dùng; new hire không biết mà tìm.

**Fix**: Họ commit `.claude/commands/pr-review.md`, `gen-tests.md`, và `gen-docs.md` vào repo. Mọi
reviewer giờ chạy đúng một checklist `/pr-review` — criteria nằm trong file version control, không
nằm trong đầu một người. Khi ai muốn cải thiện checklist, họ mở pull request vào `pr-review.md`
như mọi thay đổi khác, và diff cho thấy chính xác criteria cũ là gì.

**Result**: Prompt library không còn là tribal knowledge. Nó reviewable, diffable, và `git blame`
cho thấy ai thêm check nào và vì sao.

---

> **Tiếp theo**: [Module 15.3: Claude Code Skills](../03-claude-code-skills/) →
