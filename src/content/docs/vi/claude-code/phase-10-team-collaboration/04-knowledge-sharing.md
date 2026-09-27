---
title: 'Chia sẻ kiến thức'
description: 'Chia sẻ kiến thức Claude Code qua file .claude/commands/ và .claude/skills/ thật, commit vào repo, thay vì thư mục docs/prompts/ không ai chạy.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 10.4: Chia sẻ kiến thức

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 10.3 (Quy trình Code Review)
>
> **Kết quả**: Sau module này, bạn share kiến thức Claude Code qua file `.claude/commands/` và
> `.claude/skills/` thật, invocable, commit vào repo, cùng lessons-learned log và cách share cả
> hai giữa nhiều repo.

---

## 1. WHY — Tại Sao Cần Hiểu

Dev A discover một prompt tiết kiệm hàng giờ, giữ riêng. Dev B struggle cùng problem nhiều ngày.
Dev C make mistake với Claude, fix xong, không nói ai. Dev D repeat cùng mistake tháng sau.

Một Google Doc chung "prompt hay" không fix được việc này — không ai nhớ nó tồn tại, và nó không
phải thứ Claude Code chạy được. Cách fix thật: biến kiến thức thành file thật — command hoặc skill
dưới version control mà ai cũng gọi bằng `/name`, và một lessons-learned log cũng thật nhưng ở lại
dạng document thường vì một bản ghi mistake không phải thứ bạn invoke.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Types of Claude Code Knowledge

| Type | Example | Nơi lưu |
|------|---------|--------------|
| Prompt | "Prompt này generate test tốt" | `.claude/commands/` hoặc `.claude/skills/` |
| Technique | "Dùng `/compact` trước refactor dài" | Team wiki/docs |
| Pattern | "Extended thinking cho quyết định architecture" | CLAUDE.md |
| Pitfall | "Đừng nhờ Claude sửa `.claude/settings.json` trực tiếp" | Lessons-learned log |
| Workaround | "Claude struggle X, do Y thay thế" | Troubleshooting guide |

### Library là file thật, không phải `docs/prompts/*.md`

`docs/prompts/testing/generate-unit-tests.md` là file Markdown không ai chạy — reader phải copy
nội dung vào chat bằng tay. Bản thật là `.claude/commands/testing/gen-unit-tests.md`, trở thành
`/testing:gen-unit-tests` ngay khi được commit (Module 15.2). Checklist lớn hơn một prompt đơn —
có supporting file riêng — thì thành skill dưới `.claude/skills/<name>/SKILL.md` thay vào đó
(Module 15.3). Cả hai đều chỉ là file trong repo: `git blame` cho thấy ai viết check nào, và sửa
checklist là một pull request bình thường.

### Chia sẻ giữa nhiều repo

`.claude/commands/` và `.claude/skills/` của một repo chỉ giúp repo đó. Để share library cho mọi
repo team sở hữu, package thành plugin và publish lên internal marketplace — xem
[Module 15.4: Hệ sinh thái cộng đồng](../../phase-15-templates-skills/04-community-ecosystem/) cho
phần marketplace, và
[Module 15.5: Phát triển Skill tùy chỉnh](../../phase-15-templates-skills/05-custom-skill-development/)
cho việc biến skill folder thành plugin.

### Lessons-learned log

```markdown
## 2026-09-28: percentOf silently returns Infinity on whole=0
**What happened**: `/pr-review` flagged it before it shipped; `divide` had the same gap already.
**Root cause**: neither function validated its second argument before dividing.
**Prevention**: `/triage-stacktrace` now exists, so the next crash traces to file:line directly.
**Updated**: added the check to `percentOf`.
```

### Sharing rituals

Weekly tip trong team channel, sprint-retro review thứ đã broke, monthly pass qua CLAUDE.md và
command library, và library walkthrough lúc onboarding. Bỏ qua việc bịa ra tip "magic prefix"
(kiểu "Think carefully about…") — extended thinking là cơ chế thật, có docs (`Option+T`, `/effort`;
[Module 6.1](../../phase-06-thinking-planning/01-think-mode/)), không phải câu chữ tự nó đổi hành vi.

---

## 3. DEMO — Từng Bước

**Scenario**: Team 6 người commit command library thay vì paste prompt vào Slack.

**Bước 1: Namespace library theo category**
```bash
mkdir -p .claude/commands/{testing,refactoring,documentation,review}
```
Tạo một command thật, `.claude/commands/testing/gen-unit-tests.md`:
```markdown
---
description: Generate node:test unit tests matching this repo's existing style
argument-hint: [file] [function-name]
allowed-tools: Read, Glob
---
Generate `node:test` unit tests for `$1` in `$0`, matching `@tests/math.test.mjs`'s style.
Cover the happy path, one edge case, and one error case. Print the code only.
```

**Bước 2: Invoke nó — đây là thứ biến nó thành library, không phải doc**
```bash
claude -p "/testing:gen-unit-tests src/math.js percentOf" --allowedTools "Read,Glob"
```
Expected output (rút gọn):
```text
# Output may vary
test('percentOf: happy path', () => assert.equal(percentOf(25, 200), 12.5));
test('percentOf: zero part', () => assert.equal(percentOf(0, 50), 0));
test('percentOf: zero whole', () => assert.equal(percentOf(5, 0), Infinity));
```

**Bước 3: Viết lessons-learned entry, rồi commit cả hai**
```bash
git add .claude/commands .claude/agents docs/LESSONS_LEARNED.md
git commit -m "team: add pr-review/gen-tests/gen-docs, triage-stacktrace + incident-responder, lessons log"
```
Expected output:
```text
# Output may vary
 .claude/agents/incident-responder.md       | 12 ++++++++++++
 .claude/commands/gen-docs.md               |  8 ++++++++
 .claude/commands/gen-tests.md              | 11 +++++++++++
 .claude/commands/pr-review.md              | 16 ++++++++++++++++
 .claude/commands/testing/gen-unit-tests.md | 11 +++++++++++
 .claude/commands/triage-stacktrace.md      | 11 +++++++++++
 docs/LESSONS_LEARNED.md                    |  8 ++++++++
 7 files changed, 77 insertions(+)
```

**Bước 4: Onboarding checklist**
```markdown
- [ ] Read CLAUDE.md (team conventions)
- [ ] Run `/help` để xem custom command của team
- [ ] Read docs/LESSONS_LEARNED.md
- [ ] Shadow một teammate dùng Claude Code cho một task thật
- [ ] First PR với Claude, flag cho mentorship review
```

---

## 4. PRACTICE — Tự Thực Hành

### Bài 1: Biến prompt hay lặp lại thành command commit

**Goal**: Move một prompt bạn gõ lại nhiều nhất vào library.

**Instructions**:
1. Chọn Claude Code request bạn lặp lại nhiều nhất.
2. Viết thành `.claude/commands/<category>/<name>.md` với frontmatter.
3. Invoke một lần bằng `/category:name`, confirm output.
4. Commit nó.

<details>
<summary>💡 Hint</summary>
Nếu prompt là one-off thật (một error cụ thể bạn chỉ paste một lần), nó không thuộc library — xem
quy tắc đặt tên ở Module 15.2.
</details>

### Bài 2: Viết lessons-learned entry

**Goal**: Document một mistake thật để không lặp lại.

**Instructions**:
1. Chọn một Claude Code mistake thật (của bạn hoặc team).
2. Điền: What happened? Root cause? Prevention? Cái gì được update?
3. Nếu fix là command mới hoặc dòng CLAUDE.md, link nó từ entry.

<details>
<summary>✅ Giải pháp</summary>

```markdown
## 2026-09-20: Migration script dropped a column
**What happened**: Claude generated a migration that dropped an unused-looking column still read
by a reporting job.
**Root cause**: the prompt didn't say "preserve existing data."
**Prevention**: added "Always preserve existing data unless asked to remove it" to CLAUDE.md.
**Updated**: `.claude/commands/db/migration.md` now includes that line by default.
```
</details>

---

## 5. CHEAT SHEET

| Knowledge type | Đích thật |
|------|-------------|
| Prompt đáng reuse | `.claude/commands/<category>/<name>.md` |
| Checklist có supporting file | `.claude/skills/<name>/SKILL.md` |
| Pattern cho mọi session | CLAUDE.md |
| Mistake đáng prevent | `docs/LESSONS_LEARNED.md` |
| Library share giữa nhiều repo | Plugin + internal marketplace (15.4, 15.5) |

### Sharing Ritual

| Khi nào | Làm gì |
|------|--------|
| Weekly | Một tip trong team channel |
| Sprint retro | Cái gì broke, cái gì được thêm vào library |
| Monthly | Review CLAUDE.md và command library cùng nhau |
| Onboarding | `/help`, `LESSONS_LEARNED.md`, shadow teammate |

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Đúng Cách |
|-----------|-------------|
| `docs/prompts/*.md` không ai chạy | `.claude/commands/` hoặc `.claude/skills/` — thật, invocable, versioned |
| "Think carefully about…" như magic prefix | Extended thinking là cơ chế thật (`/effort`, `Option+T`) — Module 6.1 |
| Knowledge ở lại trong đầu individual | Command file mà ai cũng `git blame` được |
| Lesson learned nhưng không update CLAUDE.md hay command | Mỗi entry kết thúc bằng một thay đổi file cụ thể |
| Sharing overload (noise hàng ngày) | Một tip curated mỗi tuần, không phải dump |
| Library chỉ giúp một repo | Package thành plugin để share giữa nhiều repo (15.4/15.5) |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Scenario**: Startup 12 người adopt Claude Code. Vài tháng đầu chaotic — cùng mistake quay lại, và
vài dev giữ prompt hay nhất cho riêng mình thay vì share.

**Fix**: Họ move prompt notes vào `.claude/commands/`, organize theo category, và start
`docs/LESSONS_LEARNED.md` sau một incident giống hệt cái xảy ra vài tuần trước đó. Cả hai file nằm
cùng repo với code, nên xuất hiện trong cùng pull request và cùng `git log`.

**Result**: New hire đọc `docs/LESSONS_LEARNED.md` và chạy `/help` ngày đầu tiên thay vì hỏi vòng
quanh "prompt hay ở đâu". Comment của team lead: "library không còn là document phụ nữa — nó là
một phần codebase, nên được maintain như codebase."

---

> **Tiếp theo**: [Module 10.5: Quản trị & Chính sách](../05-governance-policy/) →
