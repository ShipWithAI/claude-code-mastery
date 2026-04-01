---
title: 'Code Review Protocol'
description: 'Review AI-generated code effectively and use Claude Code as a code review assistant for your team.'
---

# Module 10.3: Code Review Protocol

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 10.2 (Git Conventions)
>
> **Outcome**: After this module, you will have a code review protocol that accounts for AI-generated code, know how to use Claude as a review assistant, and understand both author and reviewer responsibilities.

---

## 1. WHY — Why This Matters

Developer submits PR with 500 lines of Claude-generated code. Reviewer skims it — "looks clean, AI wrote it, probably fine." Ships to production. Bug discovered a week later: AI missed an edge case that was implied but not explicit in the requirements. Nobody caught it because both author and reviewer assumed AI was thorough.

AI-generated code requires MORE scrutiny, not less. This module establishes the "trust but verify" protocol for AI-assisted PRs.

---

## 2. CONCEPT — Core Ideas

### The AI Code Review Paradox

AI code often LOOKS cleaner than human code. But it can miss:
- Implicit requirements not stated in the prompt
- Context from verbal discussions or past decisions
- Edge cases that "everyone knows" but weren't mentioned
- Integration patterns from other parts of the codebase

Reviewers let their guard down because it "looks professional." This is dangerous.

### AI-Specific Review Checklist

| Check | Why | Example Issue |
|-------|-----|---------------|
| Requirements match | AI may misunderstand | Implemented login, not SSO as discussed |
| Edge cases covered | AI handles explicit, misses implicit | No null check for optional field |
| Context awareness | AI doesn't know verbal decisions | Used approach rejected in standup |
| Integration fit | AI sees file, not system | New pattern inconsistent with existing |
| Security considered | AI may not prioritize security | SQL built with string concat |

### Author Responsibilities

When submitting AI-assisted PR:
1. **UNDERSTAND** every line — if you can't explain it, don't submit it
2. **VERIFY** against requirements — not just "it compiles"
3. **DISCLOSE** AI assistance — use 🤖 marker
4. **HIGHLIGHT** uncertainties — "Not sure if this matches our pattern"
5. **TEST** thoroughly — don't trust "I added tests"

### Reviewer Responsibilities

For AI-assisted PR:
1. **DON'T** assume correctness — AI code can be subtly wrong
2. **CHECK** requirements — does it solve the right problem?
3. **VERIFY** patterns — does it match existing codebase?
4. **QUESTION** author — can they explain the tricky parts?
5. **TEST** edge cases — AI often misses implicit ones

### Claude as Review Assistant

Use Claude to help review, but remember limits:
- "Review this diff for security issues"
- "What edge cases might this miss?"
- "Does this match patterns in [existing file]?"

BUT: Claude reviewing Claude has blind spots. Human judgment required.

---

## 3. DEMO — Step by Step

**Scenario**: Reviewing a PR for user authentication, generated with Claude Code.

### Step 1: Author Self-Review Before Submitting

```text
You: Before I submit this PR, review the authentication implementation.
Check for:
- Security issues
- Missing edge cases
- Inconsistencies with our auth patterns in src/auth/

Claude: POTENTIAL ISSUES FOUND:
1. Password comparison uses == instead of timing-safe comparison
2. No rate limiting on login attempts
3. JWT expiry is 30 days (existing code uses 24 hours)
4. Missing test for invalid token format
```

Author fixes issues BEFORE submitting.

### Step 2: Author Submits with Disclosure

```markdown
## PR Description

### What
Implement user authentication with JWT

### AI Assistance
🤖 Generated with Claude Code

### Areas for careful review
- Token refresh logic (line 45-67) — unsure if matches our pattern
- Error message format — Claude suggested, please verify

### Author Checklist
- [x] I understand all code in this PR
- [x] Tested locally with edge cases
- [x] Verified against existing patterns
```

### Step 3: Reviewer Uses Claude

```text
You: Review this auth PR diff for:
- Security vulnerabilities
- Missing edge cases
- Inconsistencies with src/auth/

[paste diff]

Claude: OBSERVATIONS:
- Line 34: Good - uses bcrypt.compare
- Line 56: Question - rate limit is 100/hour, existing uses 10/minute
- Line 78: Missing - no handling for expired refresh token
```

### Step 4: Reviewer Questions Author

```text
Reviewer comment:
"Rate limit is 100/hour but existing code uses 10/minute.
Was this intentional?"

Author response:
"Good catch! That was Claude's suggestion. Should match existing. Fixed."
```

### Step 5: Final Human Review

Reviewer:
- Manually tests edge cases
- Verifies author can explain complex sections
- Approves after human judgment, not just AI review

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Pre-Submit Self-Review

**Goal**: Catch issues before submitting.

**Instructions**:
1. Create a small feature with Claude's help
2. Before submitting, ask Claude to review for issues
3. Fix what Claude finds
4. Document: what did Claude catch that you missed?

<details>
<summary>💡 Hint</summary>

Prompt: "Review this code for security issues, edge cases, and consistency with [existing file]"
</details>

### Exercise 2: AI-Aware Review

**Goal**: Practice the enhanced review checklist.

**Instructions**:
1. Review a colleague's PR (or an old PR of your own)
2. Apply the AI-specific checklist
3. Use Claude to assist
4. Compare: what did Claude catch vs. what did you catch?

### Exercise 3: Understanding Test

**Goal**: Verify author comprehension.

**Instructions**:
1. For AI-generated code, ask author to explain a complex section
2. If they can't explain it clearly, flag for revision
3. Document the exchange

<details>
<summary>✅ Solution</summary>

Rule: "If you can't explain it, don't submit it."

If author says "Claude wrote it, I'm not sure why" — that's a red flag. Code should be revised until author understands it.
</details>

---

## 5. CHEAT SHEET

### AI-Specific Review Checklist

```text
[ ] Requirements actually match (not just code quality)
[ ] Edge cases covered (implicit ones too)
[ ] Consistent with existing patterns
[ ] Security considered
[ ] Author can explain every line
```

### Author Responsibilities

1. Understand every line
2. Verify vs. requirements
3. Disclose AI assistance
4. Highlight uncertainties
5. Test thoroughly

### Reviewer Prompts

```text
"Review this diff for security issues"
"What edge cases might this miss?"
"Does this match patterns in [existing file]?"
"What would a senior dev question here?"
```

### PR Template Addition

```markdown
### AI Assistance
🤖 Generated with Claude Code: Yes/No

### Areas for careful review
- [List uncertain parts]
```

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| "AI wrote it, must be correct" | AI code needs MORE scrutiny, not less |
| Reviewing only code quality | Check: does it solve the RIGHT problem? |
| Submitting code you don't understand | Rule: explain it or don't submit it |
| Only Claude reviewing Claude | Human judgment required. AI assists, doesn't replace. |
| No disclosure of AI assistance | Always flag AI-assisted PRs with 🤖 |
| Skipping edge case testing | AI misses implicit edge cases. Test them. |
| Same review rigor as human code | AI code has different failure modes. Adapt. |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese e-commerce company, major production incident.

**What happened**:
- Developer used Claude to implement payment retry logic
- Code looked clean, passed tests
- Reviewer approved quickly — "looks professional"
- Production: race condition caused double charges
- Cost: ₫200M in refunds + customer trust damage

**Root cause**: Tests didn't cover concurrent requests. AI-generated code had subtle race condition that looked correct.

**Protocol changes implemented**:
1. AI-assisted PRs require explicit 🤖 label
2. Added AI-specific review checklist to PR template
3. Author must document "areas of uncertainty"
4. Reviewer must ask "can you explain lines X-Y?"
5. Critical paths (payment, auth) require 2 reviewers + manual edge case testing

**Result**: No AI-related incidents in 6 months since protocol adoption.

**Quote**: "AI makes code that looks right. Our job is to verify it IS right."

---

> **Next**: [Module 10.4: Knowledge Sharing](../04-knowledge-sharing/) →
