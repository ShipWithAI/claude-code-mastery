---
title: 'Quy trình Code Review'
description: 'Quy trình code review với Claude Code: tự động review, checklist và tích hợp vào PR workflow.'
---

# Module 10.3: Quy trình Code Review

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 10.2 (Quy ước Git)
>
> **Kết quả**: Sau module này, bạn sẽ có code review protocol cho AI-generated code, biết dùng Claude assist review, và hiểu author và reviewer responsibility.

---

## 1. WHY — Tại Sao Cần Hiểu

Dev submit PR 500 dòng Claude-generated. Reviewer skim — "looks clean, AI wrote, probably fine." Ship production. Bug phát hiện 1 tuần sau: AI miss edge case implied nhưng không explicit trong requirement. Không ai catch vì cả author và reviewer assume AI thorough.

AI-generated code cần MORE scrutiny, không phải less. Module này thiết lập "trust but verify" protocol cho AI-assisted PR.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### AI Code Review Paradox

AI code thường LOOKS cleaner hơn human code. Nhưng có thể miss:
- Implicit requirement không stated trong prompt
- Context từ verbal discussion hoặc past decision
- Edge case mà "ai cũng biết" nhưng không mention
- Integration pattern từ phần khác của codebase

Reviewer guard down vì "looks professional." Đây là nguy hiểm.

### AI-Specific Review Checklist

| Check | Why | Example Issue |
|-------|-----|---------------|
| Requirement match | AI có thể misunderstand | Implement login thay vì SSO đã discuss |
| Edge case covered | AI handle explicit, miss implicit | Không null check cho optional field |
| Context awareness | AI không biết verbal decision | Dùng approach đã reject trong standup |
| Integration fit | AI thấy file, không thấy system | Pattern mới inconsistent với existing |
| Security considered | AI có thể không prioritize | SQL build với string concat |

### Author Responsibility

Khi submit AI-assisted PR:
1. **HIỂU** mọi dòng — không explain được thì không submit
2. **VERIFY** với requirement — không chỉ "nó compile"
3. **DISCLOSE** AI assistance — dùng 🤖 marker
4. **HIGHLIGHT** uncertainty — "Không chắc phần này match pattern"
5. **TEST** kỹ — không trust "I added tests"

### Reviewer Responsibility

Với AI-assisted PR:
1. **KHÔNG** assume correct — AI code có thể subtly wrong
2. **CHECK** requirement — nó có solve đúng problem không?
3. **VERIFY** pattern — có match existing codebase không?
4. **QUESTION** author — họ có explain được phần phức tạp không?
5. **TEST** edge case — AI thường miss implicit case

### Claude as Review Assistant

Dùng Claude hỗ trợ review, nhưng nhớ limit:
- "Review diff này cho security issue"
- "Edge case nào có thể miss?"
- "Có match pattern trong [file] không?"

NHƯNG: Claude review Claude có blind spot. Human judgment vẫn cần.

---

## 3. DEMO — Từng Bước

**Scenario**: Review PR cho authentication feature, generated với Claude Code.

### Step 1: Author Self-Review Trước Submit

```text
Bạn: Trước khi submit PR, review authentication implementation này.
Check:
- Security issue
- Missing edge case
- Inconsistency với auth pattern trong src/auth/

Claude: POTENTIAL ISSUES FOUND:
1. Password comparison dùng == thay vì timing-safe comparison
2. Không rate limiting cho login attempt
3. JWT expiry là 30 ngày (existing code dùng 24 giờ)
4. Missing test cho invalid token format
```

Author fix issue TRƯỚC khi submit.

### Step 2: Author Submit với Disclosure

```markdown
## PR Description

### What
Implement user authentication với JWT

### AI Assistance
🤖 Generated with Claude Code

### Areas for careful review
- Token refresh logic (line 45-67) — không chắc match pattern
- Error message format — Claude suggest, cần verify

### Author Checklist
- [x] Tôi hiểu tất cả code trong PR này
- [x] Tested locally với edge case
- [x] Verified với existing pattern
```

### Step 3: Reviewer Dùng Claude

```text
Bạn: Review auth PR diff này cho:
- Security vulnerability
- Missing edge case
- Inconsistency với src/auth/

[paste diff]

Claude: OBSERVATIONS:
- Line 34: Good - dùng bcrypt.compare
- Line 56: Question - rate limit là 100/hour, existing dùng 10/minute
- Line 78: Missing - không handle expired refresh token
```

### Step 4: Reviewer Hỏi Author

```text
Reviewer comment:
"Rate limit là 100/hour nhưng existing code dùng 10/minute.
Intentional không?"

Author response:
"Good catch! Đó là Claude suggest. Nên match existing. Fixed."
```

### Step 5: Final Human Review

Reviewer:
- Manually test edge case
- Verify author explain được complex section
- Approve sau human judgment, không chỉ AI review

---

## 4. PRACTICE — Tự Thực Hành

### Bài 1: Pre-Submit Self-Review

**Goal**: Catch issue trước submit.

**Instructions**:
1. Tạo small feature với Claude
2. Trước submit, ask Claude review for issue
3. Fix những gì Claude tìm được
4. Document: Claude caught gì mà bạn miss?

<details>
<summary>💡 Hint</summary>

Prompt: "Review code này cho security issue, edge case, và consistency với [existing file]"
</details>

### Bài 2: AI-Aware Review

**Goal**: Practice enhanced review checklist.

**Instructions**:
1. Review PR của colleague (hoặc old PR của bạn)
2. Apply AI-specific checklist
3. Dùng Claude assist
4. Compare: Claude catch gì vs. bạn catch gì?

### Bài 3: Understanding Test

**Goal**: Verify author comprehension.

**Instructions**:
1. Với AI-generated code, ask author explain complex section
2. Nếu không explain rõ được, flag for revision
3. Document exchange

<details>
<summary>✅ Solution</summary>

Rule: "Không explain được thì không submit."

Nếu author nói "Claude viết, tôi không chắc tại sao" — đó là red flag. Code cần revise cho đến khi author hiểu.
</details>

---

## 5. CHEAT SHEET

### AI-Specific Review Checklist

```text
[ ] Requirement actually match (không chỉ code quality)
[ ] Edge case covered (implicit case too)
[ ] Consistent với existing pattern
[ ] Security considered
[ ] Author explain được mọi dòng
```

### Author Responsibility

1. Hiểu mọi dòng
2. Verify vs. requirement
3. Disclose AI assistance
4. Highlight uncertainty
5. Test thoroughly

### Reviewer Prompt cho Claude

```text
"Review diff này cho security issue"
"Edge case nào có thể miss?"
"Có match pattern trong [existing file] không?"
"Senior dev sẽ question gì ở đây?"
```

### PR Template Addition

```markdown
### AI Assistance
🤖 Generated with Claude Code: Yes/No

### Areas for careful review
- [List uncertain part]
```

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Đúng Cách |
|-----------|-------------|
| "AI viết chắc đúng" | AI code cần MORE scrutiny, không phải less |
| Review chỉ code quality | Check: nó có solve đúng PROBLEM không? |
| Submit code không hiểu | Rule: explain được hoặc không submit |
| Chỉ Claude review Claude | Human judgment required. AI assist, không replace. |
| Không disclose AI | Always flag AI-assisted PR với 🤖 |
| Skip edge case test | AI miss implicit edge case. Test chúng. |
| Same rigor như human code | AI code có different failure mode. Adapt review. |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Scenario**: E-commerce Việt Nam, major production incident.

**Chuyện xảy ra**:
- Dev dùng Claude implement payment retry logic
- Code clean, test pass
- Reviewer approve nhanh — "looks professional"
- Production: race condition gây double charge
- Cost: ₫200M refund + customer trust damage

**Root cause**: Test không cover concurrent request. AI-generated code có race condition subtle mà trông đúng.

**Protocol change sau đó**:
1. AI-assisted PR cần explicit 🤖 label
2. Thêm AI-specific review checklist vào PR template
3. Author phải document "area of uncertainty"
4. Reviewer phải ask "explain lines X-Y được không?"
5. Critical path (payment, auth) cần 2 reviewer + manual edge case test

**Result**: 0 AI-related incident trong 6 tháng sau khi adopt protocol.

**Quote**: "AI làm code trông đúng. Job của chúng ta là verify nó THẬT SỰ đúng."

---

> **Tiếp theo**: [Module 10.4: Chia sẻ kiến thức](../04-knowledge-sharing/) →
