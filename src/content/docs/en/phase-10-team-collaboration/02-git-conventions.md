---
title: 'Git Conventions'
description: 'Establish git conventions for AI-assisted development with Claude Code commit attribution best practices.'
---

# Module 10.2: Git Conventions

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 10.1 (Team CLAUDE.md)
>
> **Outcome**: After this module, you will have git conventions that work for AI-assisted development, know how to train Claude to follow them, and understand best practices for commit attribution.

---

## 1. WHY — Why This Matters

Developer uses Claude Code to implement a feature. Claude makes 1 giant commit with message "implemented feature." PR reviewer can't understand what changed or why. Another developer's Claude commits are verbose novels. Git history is useless for debugging.

Git conventions exist for humans. When AI generates commits, those conventions matter MORE — because AI will consistently follow them (or consistently ignore them). This module makes Claude a good git citizen.

---

## 2. CONCEPT — Core Ideas

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
| Atomic commits | One logical change per commit | "implemented everything" |
| Reviewable size | 50-200 lines per commit | 2000-line commit |
| Builds pass | Each commit compiles/passes tests | Broken intermediate commits |

### Branch Naming

```text
<type>/<ticket>-<short-description>

feat/PROJ-123-user-auth
fix/PROJ-456-login-validation
refactor/PROJ-789-payment-service
```

### AI Attribution Approaches

1. **Footer marker**: `🤖 AI-assisted` in commit message (recommended)
2. **Co-author**: `Co-authored-by: Claude <noreply@anthropic.com>`
3. **Branch suffix**: `-ai-assisted`
4. **PR label**: Add "AI-assisted" label

Footer marker is least intrusive, most informative.

---

## 3. DEMO — Step by Step

**Scenario**: Team adopts Conventional Commits with AI attribution.

### Step 1: Add Git Conventions to CLAUDE.md

```markdown
## Git Conventions

### Commit Message Format
<type>(<scope>): <short description>

[body: explain what and why, not how]

🤖 Generated with Claude Code

### Types
- feat: New feature
- fix: Bug fix
- refactor: Code change that neither fixes nor adds
- docs: Documentation only
- test: Adding tests
- chore: Maintenance

### Rules
- Subject line: max 50 characters, imperative mood
- Body: wrap at 72 characters
- One logical change per commit
- Each commit must pass: npm test && npm run lint
```

### Step 2: Train Claude with Example

```text
You: I've added git conventions to CLAUDE.md. Let's practice.
I just added input validation to the login form.
Generate the appropriate commit.

Claude: Here's the commit following our conventions:

git commit -m "feat(auth): add input validation to login form

Add email format validation
Add password strength requirements
Display inline error messages

🤖 Generated with Claude Code"
```

### Step 3: Multi-Commit Workflow

```text
You: Implement user registration with email verification.
Break this into appropriate commits following our granularity rules.

Claude: I'll implement this in 4 atomic commits:
1. feat(auth): add user registration endpoint
2. feat(auth): add email verification token generation
3. feat(auth): add verification email sending
4. feat(auth): add email verification confirmation endpoint

Each commit will be independently testable. Shall I proceed?
```

### Step 4: Verify in Git Log

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

## 4. PRACTICE — Try It Yourself

### Exercise 1: Convention Setup

**Goal**: Configure git conventions for your team.

**Instructions**:
1. Add git convention section to your CLAUDE.md
2. Include: message format, types, granularity rules
3. Include AI attribution approach
4. Test with a small change

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

### Exercise 2: Atomic Commit Drill

**Goal**: Practice proper commit granularity.

**Instructions**:
1. Ask Claude to implement a medium feature
2. Require it to break into 3-5 atomic commits
3. Review each commit: Is it truly atomic? Does it pass tests alone?
4. Iterate on CLAUDE.md if Claude's granularity is off

### Exercise 3: History Readability

**Goal**: Validate your conventions work.

**Instructions**:
1. After using Claude for a day, run `git log --oneline -20`
2. Can you understand what happened from messages alone?
3. If not, what's missing? Update CLAUDE.md.

<details>
<summary>✅ Solution</summary>

Good git log output:
```text
abc1234 feat(cart): add quantity validation
def5678 fix(cart): handle empty cart checkout
ghi9012 refactor(cart): extract price calculation
jkl3456 test(cart): add unit tests for CartService
```

Bad git log output:
```text
abc1234 updates
def5678 WIP
ghi9012 fixed stuff
jkl3456 implemented feature
```

If your log looks like the bad example, add more specific rules to CLAUDE.md.
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
- Each commit passes tests

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
- Atomic commits, each passes tests
```

### Quick Prompts

- "Commit this following our conventions"
- "Break this into atomic commits"
- "What's the appropriate commit type?"

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| "Just commit it" with no format | Explicit format in CLAUDE.md |
| Giant commits ("implemented feature") | Require atomic commits |
| No AI attribution | Footer marker: 🤖 AI-assisted |
| Committing broken code | Rule: each commit must pass tests |
| Vague commit messages | Require body explaining why |
| Inconsistent between team members | Same CLAUDE.md = same conventions |
| Obsessing over perfect commits | Good enough is fine. Squash in PR if needed. |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese dev team, 8 developers, heavy Claude Code usage. Git history became unusable:
- "fixed stuff"
- "WIP"
- 500-line commits with no description
- No way to understand feature evolution

**Solution: Git conventions in CLAUDE.md**

Added:
- Conventional Commits format
- 🤖 footer for AI-generated code
- Atomic commit requirement
- Pre-commit hook: rejects commits without proper format

**Results after 2 weeks**:
- `git log` became readable
- Code review time: -30% (reviewers understood commit intent)
- Debugging easier (could bisect with meaningful commits)
- New devs understood feature history without asking

**Unexpected benefit**: AI attribution helped identify patterns — "AI-generated commits have fewer bugs but sometimes miss edge cases" became a learning for the team.

---

> **Next**: [Module 10.3: Code Review Protocol](../03-code-review-protocol/) →
