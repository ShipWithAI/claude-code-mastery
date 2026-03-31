---
title: 'Quy ước Git'
description: 'Thiết lập quy ước Git khi làm việc với Claude Code: commit message, branch naming và merge strategy.'
---

# Module 10.2: Quy ước Git

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 10.1 (CLAUDE.md cho Team)
>
> **Kết quả**: Sau module này, bạn sẽ có git convention work cho AI-assisted development, biết train Claude follow chúng, và hiểu best practice cho commit attribution.

---

## 1. WHY — Tại Sao Cần Hiểu

Dev dùng Claude implement feature. Claude commit 1 cục với message "implemented feature." PR reviewer không hiểu change gì. Dev khác thì Claude commit verbose như tiểu thuyết. Git history vô dụng cho debug.

Git convention tồn tại cho human. Khi AI generate commit, convention quan trọng HƠN — vì AI consistently follow (hoặc consistently ignore). Module này làm Claude trở thành good git citizen.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Commit Message Convention

```text
<type>(<scope>): <short description>

[optional body: what and why]

🤖 Generated with Claude Code
```

**Types**: feat, fix, refactor, docs, test, chore

### Commit Granularity Rules

| Rule | Good | Bad |
|------|------|-----|
| Atomic commit | One logical change per commit | "implemented everything" |
| Reviewable size | 50-200 lines per commit | 2000-line commit |
| Builds pass | Each commit compile/pass test | Broken intermediate commit |

### Branch Naming

```text
<type>/<ticket>-<short-description>

feat/PROJ-123-user-auth
fix/PROJ-456-login-validation
refactor/PROJ-789-payment-service
```

### AI Attribution

1. **Footer marker**: `🤖 AI-assisted` trong commit message (recommended)
2. **Co-author**: `Co-authored-by: Claude <noreply@anthropic.com>`
3. **Branch suffix**: `-ai-assisted`
4. **PR label**: Add "AI-assisted" label

Footer marker là cách ít intrusive nhất, informative nhất.

---

## 3. DEMO — Từng Bước

**Scenario**: Team adopt Conventional Commits với AI attribution.

### Step 1: Add Git Convention vào CLAUDE.md

```markdown
## Git Conventions

### Commit Message Format
<type>(<scope>): <short description>

[body: explain what and why, not how]

🤖 Generated with Claude Code

### Types
- feat: New feature
- fix: Bug fix
- refactor: Code change không fix cũng không add
- docs: Documentation only
- test: Adding test
- chore: Maintenance

### Rules
- Subject line: max 50 character, imperative mood
- Body: wrap at 72 character
- One logical change per commit
- Each commit phải pass: npm test && npm run lint
```

### Step 2: Train Claude với Example

```text
Bạn: Tôi đã add git convention vào CLAUDE.md. Practice thử.
Tôi vừa add input validation vào login form.
Generate commit theo convention.

Claude: Đây là commit theo convention của team:

git commit -m "feat(auth): add input validation to login form

Add email format validation
Add password strength requirements
Display inline error messages

🤖 Generated with Claude Code"
```

### Step 3: Multi-Commit Workflow

```text
Bạn: Implement user registration với email verification.
Break thành atomic commit theo granularity rule.

Claude: Tôi sẽ implement trong 4 atomic commit:
1. feat(auth): add user registration endpoint
2. feat(auth): add email verification token generation
3. feat(auth): add verification email sending
4. feat(auth): add email verification confirmation endpoint

Mỗi commit independently testable. Proceed?
```

### Step 4: Verify trong Git Log

```bash
$ git log --oneline -5
```

Output:
```text
abc1234 feat(auth): add email verification confirmation endpoint
def5678 feat(auth): add verification email sending
ghi9012 feat(auth): add email verification token generation
jkl3456 feat(auth): add user registration endpoint
mno7890 docs: update CLAUDE.md with git conventions
```

---

## 4. PRACTICE — Tự Thực Hành

### Bài 1: Convention Setup

**Goal**: Configure git convention cho team.

**Instructions**:
1. Add git convention section vào CLAUDE.md
2. Include: message format, types, granularity rule
3. Include AI attribution approach
4. Test với small change

<details>
<summary>💡 Hint</summary>

```markdown
## Git Conventions
- Format: type(scope): description
- Types: feat, fix, refactor, docs, test, chore
- Max 50 char subject line
- Add 🤖 AI-assisted footer
```
</details>

### Bài 2: Atomic Commit Drill

**Goal**: Practice proper commit granularity.

**Instructions**:
1. Ask Claude implement medium feature
2. Require break thành 3-5 atomic commit
3. Review each commit: Truly atomic? Pass test alone?
4. Iterate CLAUDE.md nếu Claude's granularity sai

### Bài 3: History Readability

**Goal**: Validate convention work.

**Instructions**:
1. Sau 1 ngày dùng Claude, run `git log --online -20`
2. Có thể hiểu chuyện gì xảy ra từ message alone?
3. Nếu không, thiếu gì? Update CLAUDE.md.

<details>
<summary>✅ Solution</summary>

Good git log:
```text
abc1234 feat(cart): add quantity validation
def5678 fix(cart): handle empty cart checkout
ghi9012 refactor(cart): extract price calculation
jkl3456 test(cart): add unit tests for CartService
```

Bad git log:
```text
abc1234 updates
def5678 WIP
ghi9012 fixed stuff
jkl3456 implemented feature
```

Nếu log giống bad example, add rule cụ thể hơn vào CLAUDE.md.
</details>

---

## 5. CHEAT SHEET

### Commit Message Format

```text
<type>(<scope>): <description>

[body]

🤖 Generated with Claude Code
```

### Types

feat | fix | refactor | docs | test | chore

### Granularity Rules

- One logical change per commit
- 50-200 lines per commit
- Each commit pass test

### Branch Naming

```text
<type>/<ticket>-<description>
feat/PROJ-123-user-auth
```

### CLAUDE.md Git Section

```markdown
## Git Conventions
- Format: type(scope): description
- Max 50 char subject
- Add 🤖 AI-assisted footer
- Atomic commit, each pass test
```

### Quick Prompt

- "Commit theo convention của team"
- "Break thành atomic commit"
- "Commit type phù hợp cho change này?"

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Đúng Cách |
|-----------|-------------|
| "Just commit" không format | Explicit format trong CLAUDE.md |
| Giant commit ("implemented feature") | Require atomic commit |
| Không AI attribution | Footer marker: 🤖 AI-assisted |
| Commit broken code | Rule: each commit pass test |
| Message vague | Require body explain why |
| Inconsistent giữa team member | Same CLAUDE.md = same convention |
| Obsess perfect commit | Good enough OK. Squash trong PR nếu cần. |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Scenario**: Team Việt Nam, 8 developer, heavy Claude Code usage. Git history unusable:
- "fixed stuff"
- "WIP"
- 500-line commit không description
- Không thể hiểu feature evolution

**Solution: Git convention trong CLAUDE.md**

Added:
- Conventional Commits format
- 🤖 footer cho AI-generated code
- Atomic commit requirement
- Pre-commit hook: reject commit không đúng format

**Result sau 2 tuần**:
- `git log` readable
- Code review time: giảm 30% (reviewer hiểu commit intent)
- Debug easier (có thể bisect với meaningful commit)
- New dev hiểu history không cần hỏi

**Unexpected benefit**: AI attribution giúp identify pattern — "AI-generated commit có fewer bug nhưng sometimes miss edge case" — trở thành learning cho team.

---

> **Tiếp theo**: [Module 10.3: Quy trình Code Review](../03-code-review-protocol/) →
