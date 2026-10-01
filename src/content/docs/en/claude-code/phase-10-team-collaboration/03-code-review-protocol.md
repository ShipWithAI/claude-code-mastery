---
title: 'Code Review Protocol'
description: 'Use /code-review and /security-review as a fresh-context reviewer, and keep a human gate on every merge.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 10.3: Code Review Protocol

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 10.2 (Git Conventions)
>
> **Outcome**: After this module, you will know why the agent that wrote code can't approve it,
> how to run `/code-review` and `/security-review` as an independent check, and what a human must
> still verify before merge.

---

## 1. WHY — Why This Matters

A developer submits a PR with 400 lines of Claude-generated code. The reviewer skims it — "looks
clean, AI wrote it, probably fine" — and approves. A week later, a bug surfaces: an edge case that
was implied by the requirements but never stated in the prompt. Nobody caught it, because both
author and reviewer assumed the same session that wrote the code would also have caught its own
mistake. Anthropic states the underlying problem directly: "the agent that wrote the code has no
way to approve it" (S3). This module is about building a second, independent check into the loop.

---

## 2. CONCEPT — Core Ideas

### Why the author's own Claude can't be the reviewer

The context that wrote the code carries the same assumptions, the same blind spots, and often a
documented bias toward telling you it did well — Anthropic's own agent-harness research calls this
"confident praising": a generator that also grades its own work tends to over-report success
(S12). The fix is structural, not a better prompt: the reviewer needs a **fresh context** that
never saw the plan, only the diff.

### `/code-review` and `/security-review`

| Command | What it checks | Notes |
|---|---|---|
| `/code-review` (alias `/review`) | Correctness bugs in the current diff, a PR, a branch, or a path | Pass `ultra` (i.e. `/code-review ultra`) to run a deep multi-agent review in a cloud sandbox — there is no separate `claude ultrareview` CLI command |
| `/security-review` | Security vulnerabilities in the changes on your current branch | Diffs against `origin/HEAD` — needs a configured `origin` remote, or the underlying `git diff` fails and the whole review aborts |

Both commands spawn their own read-only reviewer subagents rather than reusing the authoring
session's context — the DEMO below shows `/security-review` literally naming two background
agents (an identifier and a false-positive filter) with their own findings and confidence scores.

### Confidence thresholds are a design choice, not a bug

`/security-review` doesn't report every possible issue — it filters by confidence, and a real
vulnerability can fall just under the bar if nothing in the repo currently calls the vulnerable
function. That's a deliberate trade-off against noise, not proof the tool missed something; treat
"below threshold" findings as a to-track list, not a clean bill of health.

### Human gate at every artifact handoff

Author and reviewer responsibilities don't change because a machine wrote the diff:

- **Author**: understand every line well enough to explain it; disclose that Claude wrote it;
  flag uncertain sections explicitly.
- **Reviewer**: don't let "it looks professional" substitute for checking it solves the *right*
  problem, matches existing patterns, and handles the edge cases nobody wrote down.

`/code-review` and `/security-review` are inputs to that human judgment, not a replacement for it
— and CI can run `claude-code-action` on every PR to guarantee the input exists even if a human
forgets to ask for it (Module 11.4).

---

## 3. DEMO — Step by Step

**Scenario**: a small diff adds `src/calc.js` with two real issues — a division-by-zero and an
`eval()` call — and both review commands are run against it.

**Step 1: `/code-review` on the uncommitted diff**

```text
> /code-review
```
```text
# Output may vary
- src/calc.js:7 — Security: eval() runs user input, so a crafted expression can execute any code.
- src/calc.js:2 — Correctness: percentOf returns Infinity or NaN when total is 0.
```

**Step 2: `/security-review` on the same branch**

```text
> /security-review
```
```text
# Output may vary
⏺ Agent(Identify vulns in calc.js)     ⎿ Backgrounded agent
⏺ Agent "Identify vulns in calc.js" finished · 40s
⏺ Agent(FP-filter eval finding)        ⎿ Backgrounded agent
⏺ Agent "FP-filter eval finding" finished · 37s

Security Review: src/calc.js
No findings reached the reporting threshold of confidence 8 or higher.

Below the threshold
eval code injection in src/calc.js:7 (runExpression)
- Confidence: 7/10 — excluded because nothing in the repo calls runExpression yet, so there's
  no confirmed path from untrusted input to this line.
- Risk if a future caller passes untrusted input: full remote code execution.
- Recommendation: replace eval with a restricted parser.
```

Two independent, read-only subagents (identify → filter false positives) produced this, not the
session that would have written the fix.

**Step 3: A human reads both, decides it's worth fixing now**

The `eval()` finding appeared in both runs — once above threshold in `/code-review`, once below
threshold in `/security-review` with an explicit reason. A human reviewer treats the two together
as "fix before merge," not "one tool said it's fine."

**Step 4: Fix, following Module 10.2's git conventions**

The actual fix and its commit trailer are the DEMO in Module 10.2 — same diff, same repo,
continuing this exact finding.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Run both reviews on your own branch

**Goal**: See real findings on real code, not lab code.

**Instructions**:
1. On a branch with an actual diff, run `/code-review`.
2. Run `/security-review`. If it errors on `origin/HEAD`, add or fetch a remote first — that
   failure is itself worth knowing about before you rely on the command in CI.
3. For each finding, decide: fix now, track, or dismiss — and say why.

<details>
<summary>💡 Hint</summary>

`/security-review` needs `origin/HEAD` to resolve. In a repo cloned normally this already works;
a from-scratch lab repo may need `git remote add origin <url>` first.
</details>

### Exercise 2: Read a below-threshold finding correctly

**Goal**: Practice treating a filtered finding as "track," not "ignore."

**Instructions**:
1. Take the `eval()` example from the DEMO (or a similar low-confidence finding of your own).
2. Write one sentence on what would raise its confidence (e.g. "a new caller passes user input").
3. Add a code comment or issue linking that condition to the original finding.

### Exercise 3: Explain-it-or-don't-submit-it

**Goal**: Verify author comprehension, independent of any review tool.

**Instructions**: For a Claude-authored PR, ask the author to explain the trickiest section out
loud. If they can't, that's a revision flag regardless of what `/code-review` reported.

<details>
<summary>✅ Solution</summary>

"Claude wrote it, I'm not sure why it works" is a red flag on its own — a passing `/code-review`
doesn't substitute for author comprehension.
</details>

---

## 5. CHEAT SHEET

| Command | Scope | Notes |
|---|---|---|
| `/code-review` (alias `/review`) | Current diff, a PR, a branch, or a path | `/code-review ultra` = deep cloud multi-agent review |
| `/security-review` | Diff against `origin/HEAD` on current branch | Needs a resolvable `origin` remote |
| `claude-code-action` on PRs | CI-enforced review, every PR | Module 11.4 |
| `/pr-comments` | ❌ Removed in v2.1.91 | Ask Claude directly to view PR comments instead |

### Human gate checklist

```text
[ ] Author can explain every line
[ ] Requirements actually match, not just "compiles"
[ ] /code-review and /security-review findings triaged (fix / track / dismiss + why)
[ ] Edge cases implied but not stated in the prompt are covered
[ ] Matches existing patterns in the codebase
```

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Same session writes and approves the code | Reviewer needs a fresh context — `/code-review`/`/security-review` or a human, never the authoring session |
| "AI wrote it, must be fine" | AI code needs MORE scrutiny, not less — it looks clean and can still miss implicit requirements |
| Treating a below-threshold finding as "no issue" | It's a confidence filter, not a clean bill of health — track it |
| Assuming `/security-review` always runs | It fails outright if `origin/HEAD` doesn't resolve — verify the remote first |
| Expecting `claude ultrareview` as a CLI command | It's `/code-review ultra`, not a standalone subcommand |
| Relying on `/pr-comments` | Removed in v2.1.91 — ask Claude directly, or use `--from-pr` |

---

## 7. REAL CASE — Production Story

An e-commerce team's payment-retry logic, written by Claude, passed its tests and got a fast
"looks professional" approval. In production, a race condition under concurrent requests caused
duplicate charges — the tests never simulated concurrent requests, and the reviewer's fast
approval never asked "what happens if this runs twice at once?" The team's fix wasn't a smarter
prompt: it was requiring `/code-review` and `/security-review` output attached to every
payment-path PR, plus a second human reviewer for that directory specifically, so a fast skim
could no longer be the only check before merge.

---

> **Next**: [Module 10.4: Knowledge Sharing](../04-knowledge-sharing/) →
