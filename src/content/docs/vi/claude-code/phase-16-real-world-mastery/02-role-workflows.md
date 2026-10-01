---
title: 'Workflow theo Role'
description: 'Build "role kit" — một command hoặc skill, một subagent, output style nếu hợp — cho security, infra, ML, design, và legal.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 16.2: Workflow theo Role

> **Thời gian ước tính**: ~35 phút
>
> **Yêu cầu trước**: Module 16.1 (Case Studies)
>
> **Kết quả**: Sau module này, bạn có "role kit" — command hoặc skill thật, subagent, và output
> style nếu hợp — build cho role của bạn, dùng cùng pattern mà team engineering lẫn non-engineering
> nội bộ Anthropic đang dùng.

---

## 1. WHY — Tại sao cần học

Security engineer giữa incident cần trace stack trace nhanh, không cần chat chung chung.
Designer feed file Figma vào Claude Code cần autonomous build-test loop, không cần prompt một dòng.
Legal team member không có background engineering cần Claude giải thích đang làm gì, không giả
định họ đã biết sẵn. Lời khuyên chung chung ("dùng Claude Code cho role của bạn") lãng phí hai đòn
bẩy thật Claude Code cho bạn: subagent với tool và system prompt đúng, và command/skill encode task
thành `/name`, không phải đoạn văn bạn gõ lại mỗi lần.

---

## 2. CONCEPT — Khái niệm cốt lõi

### "Role kit" có bốn phần

1. **Command hoặc skill** — task lặp lại thành file thật (Module 15.2/15.3).
2. **Subagent** — `.claude/agents/<role>.md`, tool scoped, system prompt riêng (Module 7.3).
3. **Output style, nếu hợp** — `/output-style Learning` làm Claude chậm lại để giải thích từng
   bước; dùng cho reader non-engineering, không dùng cho power user muốn tốc độ.
4. **Story có số** — chứng minh đây không phải giả thuyết (§7).

### Năm kit, map theo usage pattern thật nội bộ Anthropic (S2)

| Role | Command / skill | Subagent | Output style |
|---|---|---|---|
| Security Engineer | `/triage-stacktrace` | `incident-responder` | — |
| Data/Infra Engineer | `/diagnose-outage` (feed screenshot dashboard) | `infra-debugger` | — |
| Inference/ML Engineer | `/explain-model-fn` | `ml-docs-explainer` | `Explanatory` |
| Product Designer | `/figma-to-component` (skill; nhận Figma export) | `design-loop` | — |
| Legal / non-engineering | `/prototype-tool` | không cần — command là đủ | `Learning` |

Không cái nào là built-in — chọn tên không trùng danh sách built-in (Module 15.2).

---

## 3. DEMO — Từng bước cụ thể

Build và chạy Security kit; bốn kit còn lại theo đúng pattern này.

**Bước 1: Command**
```markdown
---
description: Trace a pasted stack trace through this codebase and propose the root cause
argument-hint: [paste the stack trace after the command]
allowed-tools: Read, Grep, Glob
---
Stack trace:
$ARGUMENTS

Trace this stack trace through the codebase. Identify the exact `file:line` most likely
responsible, explain why in 2-3 sentences, and propose a minimal fix. Do not edit any files.
```
Lưu thành `.claude/commands/triage-stacktrace.md`.

**Bước 2: Subagent**
```markdown
---
name: incident-responder
description: Traces a stack trace or crash log through the codebase to find the likely root
  cause. Use during an active incident, or when triaging a bug report with an error trace.
tools: Read, Grep, Glob
model: sonnet
---
You are an incident-response specialist. Given a stack trace, trace it to the exact function and
line that introduced the bad value or bad call. Report the root-cause file:line, a one-paragraph
theory, and a minimal proposed fix. Do not speculate about files you have not read.
```
Lưu thành `.claude/agents/incident-responder.md` (docs: `code.claude.com/docs/en/sub-agents` —
`name`/`description` bắt buộc, `tools` scope nó thành read-only).

**Bước 3: Reproduce crash rồi chạy command**
```bash
node scripts/report.mjs
```
Expected output:
```text
# Output may vary
RangeError: Invalid array length
    at renderBar (file:///Users/you/cc-lab/scripts/report.mjs:4:10)
    at file:///Users/you/cc-lab/scripts/report.mjs:8:13
```

```bash
claude -p "/triage-stacktrace RangeError: Invalid array length
    at renderBar (scripts/report.mjs:4:10)
    at scripts/report.mjs:8:13" --allowedTools "Read,Grep,Glob"
```
Expected output (rút gọn):
```text
# Output may vary
Root cause: `src/math.js:4`, triggered by `scripts/report.mjs:7`
Why: dividing by zero doesn't throw in JavaScript — `usage` becomes `Infinity`, and
`new Array(Math.round(Infinity))` throws `RangeError: Invalid array length` two calls later.

Proposed minimal fix: add a `whole === 0` check in `percentOf`, since that's where the bad
value comes from. I didn't edit any files.
```
Cách này cũng chạy được qua natural language — "Use the incident-responder subagent to
investigate this crash" — không cần gõ command; Claude ghi tên subagent đã dispatch trong
transcript row (docs: `sub-agents.md`).

Với kit của Product Designer, loop tương tự đóng lại bằng `claude --chrome` để mở component vừa
render trong browser thật, so sánh với Figma export — confirmed trên `cli-reference.md`, không
phải research-preview flag.

---

## 4. PRACTICE — Luyện tập

### Bài 1: Build role kit của bạn

**Mục tiêu**: Ship cặp command + subagent cho task hàng ngày thật của bạn.

**Hướng dẫn**:
1. Chọn row gần role của bạn nhất (hoặc viết row riêng).
2. Tạo command file trước, test bằng `/name`.
3. Tạo subagent, scope `tools` chỉ đúng thứ task đó cần.
4. Quyết định: non-power-user có đọc output này không? Nếu có, ghi chú `/output-style Learning`
   cho họ.

<details>
<summary>💡 Gợi ý</summary>
Bắt đầu `tools` của subagent hẹp (`Read, Grep, Glob`) — chỉ thêm `Edit` hoặc `Bash` khi đã confirm
bản read-only cho output hữu ích.
</details>

---

## 5. CHEAT SHEET

| Role | Command / skill | Subagent | Output style | Phase |
|---|---|---|---|---|
| Security | `/triage-stacktrace` | `incident-responder` | — | 8, 13 |
| Data/Infra | `/diagnose-outage` | `infra-debugger` | — | 5, 13 |
| Inference/ML | `/explain-model-fn` | `ml-docs-explainer` | `Explanatory` | 4, 15 |
| Product Design | `/figma-to-component` | `design-loop` | — | 5, 7 |
| Legal/non-eng | `/prototype-tool` | — | `Learning` | 15, 16 |

`claude --chrome` — verify UI render trực tiếp trong browser (`cli-reference.md`).
`/output-style Learning` — case-sensitive; đổi theo session, không theo command.

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|---|---|
| Một subagent chung chung cho mọi role | Scope `tools` theo role — reviewer không cần `Edit` |
| Giả định `--chrome` có sẵn ở mọi bản cài | Confirm trên `cli-reference` docs/version trước |
| `Learning` output style cho mọi session | Dành cho onboarding hoặc reader non-engineering — nó làm Claude chậm lại để giải thích |
| Đưa command trơn cho đồng nghiệp non-eng | Kèm `/output-style Learning` hoặc giải thích một dòng |
| Copy role kit nguyên văn từ bảng này | Tên tool chỉ là placeholder — build command/subagent cho repo và task thật của bạn |

---

## 7. REAL CASE — Câu chuyện thực tế

Năm usage pattern nội bộ thật, có nguồn (S2, Anthropic, 07/2025):

- **Security Engineering**: "During incidents, the Security Engineering team feeds Claude Code
  stack traces and documentation to trace control flow through the codebase. Problems that
  typically take 10-15 minutes of manual scanning now resolve 3x as quickly."
- **Data Infrastructure**: khi Kubernetes ngừng schedule pod, team "fed it dashboard
  screenshots, and Claude guided them menu-by-menu through Google Cloud's UI... saving them 20
  minutes of valuable time during a system outage."
- **Inference**: team member không có ML background dùng Claude giải thích model-specific
  function — "What normally requires an hour of Google searching now takes 10-20 minutes—an 80%
  reduction in research time."
- **Product Design**: "would feed Figma design files to Claude Code and then set up autonomous
  loops where Claude Code writes the code for the new feature, runs tests, and iterates
  continuously."
- **Legal**: "created prototype 'phone tree' systems to help team members connect with the right
  lawyer at Anthropic, demonstrating how departments can build custom tools without traditional
  development resources."

---

> **Tiếp theo**: [Module 16.3: Thiết kế Workshop](../03-teaching-workshop/) →
