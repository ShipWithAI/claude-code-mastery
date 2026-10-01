---
title: 'Git Conventions'
description: 'Configure commit and PR attribution with the attribution setting, and give every feature its own worktree.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 10.2: Git Conventions

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 10.1 (Team CLAUDE.md)
>
> **Outcome**: After this module, you will know Claude Code's actual default commit/PR
> attribution, how to change or hide it with the `attribution` setting, and how to give each
> feature its own isolated worktree.

---

## 1. WHY — Why This Matters

A developer asks Claude to implement a feature. Claude makes the commit itself with `git commit`
and opens the PR with `gh pr create`. That's convenient — until legal asks "why does every commit
have a `Co-Authored-By` line naming a model?" or a teammate asks "can we turn that off for this
repo?" Git conventions for AI-assisted work aren't about writing a nicer commit message by hand —
they're about knowing exactly what Claude Code writes into your history by default, and the one
setting that changes it.

---

## 2. CONCEPT — Core Ideas

### Git as the artifact trail, not just history

Treat each unit of AI-assisted work the same way you'd treat a spec: an intent, a plan, a diff,
and a PR that a human reviews before it merges. Anthropic's own framing of this shift: "Code is no
longer the bottleneck — the human-speed steps around it are" (S3). Git conventions matter more
with AI than without it, precisely because Claude will follow them (or ignore them) consistently
across every commit — a human forgets the convention sometimes; a misconfigured Claude forgets it
every time.

### The actual default attribution (not a guess)

When Claude Code creates a commit or PR itself, it adds attribution by default. The exact,
documented defaults:

| Surface | Default text |
|---|---|
| Commit trailer | `Co-Authored-By: <model> <noreply@anthropic.com>` — `<model>` is whatever model made the commit, e.g. `Claude Sonnet 5` |
| Pull request description | `🤖 Generated with [Claude Code](https://claude.com/claude-code)` |

### `attribution` — the current setting (not `includeCoAuthoredBy`)

`includeCoAuthoredBy` is **deprecated since v2.0.62**. The current key is `attribution`, in any
settings file (user, project, or local):

```json
{
  "attribution": {
    "commit": "Generated with AI\n\nCo-Authored-By: AI <ai@example.com>",
    "pr": "",
    "sessionUrl": false
  }
}
```

- `attribution.commit` (string) — replaces the commit trailer text entirely.
- `attribution.pr` (string) — replaces the PR description text; empty string hides it.
- `attribution.sessionUrl` (boolean, default `true`) — the `Claude-Session` trailer added on cloud
  or Remote Control commits; `false` omits it.
- `attribution: false` (Claude Code **v2.1.281+**) hides all attribution at once. Earlier versions
  reject this shape and skip the whole settings file that holds it.
- Once you set `commit` or `pr` yourself, Claude Code ignores `includeCoAuthoredBy` for that
  surface and uses its own default only for whichever of the two you left unset.
- Your own CLAUDE.md/memory instructions about attribution take precedence over these two lines —
  *unless* the line is set in managed settings (Module 10.5), which always wins.

### One worktree per feature

`claude --worktree <name>` (short: `-w`) starts Claude in an isolated git worktree at
`<repo>/.claude/worktrees/<name>`, so two features never collide in the same working directory.
It also accepts a PR/MR URL or `#<number>` to branch straight from that pull request. It needs at
least one existing commit — an empty repo fails with `Failed to resolve base branch "HEAD"`.

### The atomic-commit habit still matters

None of the above changes what makes a commit reviewable: one logical change, a subject a human
wrote or approved, a body that says *why*. AI attribution documents that Claude was involved — it
doesn't replace review of *what* it did.

---

## 3. DEMO — Step by Step

**Scenario**: Claude commits a real fix in the lab, then the team changes the trailer.

**Step 1: Let Claude commit with the default trailer**

```bash
$ claude -p "Stage src/calc.js and commit it with a Conventional Commits message." \
  --permission-mode acceptEdits \
  --allowedTools "Bash(git add:*) Bash(git commit:*) Bash(git status:*) Bash(git diff:*)"
```

**Step 2: Read back the real trailer**

```bash
$ git log -1 --format="%H%n%s%n%n%b"
```
```text
# Output may vary
6135609ad9da7a45170e07ce4cac5f326a41ced4
fix(calc): guard percentOf against zero total and drop eval in runExpression

- percentOf now returns 0 when total is 0 instead of Infinity/NaN.
- runExpression no longer calls eval on user input...

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

That's the documented default, unmodified — no CLAUDE.md instruction changed it.

**Step 3: Set `attribution.commit` in the project's `.claude/settings.json`**

```bash
$ cat > .claude/settings.json <<'EOF'
{
  "attribution": {
    "commit": "Generated-by: Claude Code (lab demo)"
  }
}
EOF
```

**Step 4: Commit again — the trailer changes immediately**

```bash
$ claude -p "Stage src/calc.js and commit it: 'docs(calc): add clarifying comment'." \
  --permission-mode acceptEdits \
  --allowedTools "Bash(git add:*) Bash(git commit:*)"
$ git log -1 --format="%s%n%n%b"
```
```text
# Output may vary
docs(calc): add clarifying comment

Generated-by: Claude Code (lab demo)
```

No `Co-Authored-By` line anymore — the project setting replaced it for every commit Claude makes
in this repo, for every developer who checks it in.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Decide your team's attribution policy

**Goal**: Pick and configure one attribution stance for your repo.

**Instructions**:
1. Decide: keep the default trailer, customize the text, or hide it (`attribution: false`,
   v2.1.281+).
2. Add the chosen `attribution` block to `.claude/settings.json` (shared) or
   `.claude/settings.local.json` (personal only).
3. Have Claude make a real commit and confirm with `git log -1`.

<details>
<summary>💡 Hint</summary>

`attribution: false` needs v2.1.281+; older Claude Code rejects the whole settings file that has
it, so check `claude --version` first.
</details>

### Exercise 2: One worktree per feature

**Goal**: Run two features in parallel without touching the same working directory.

**Instructions**:
1. `claude --worktree feature-a "implement X"`
2. `claude --worktree feature-b "implement Y"`
3. Confirm both live under `.claude/worktrees/` and neither's `git status` shows the other's files.

### Exercise 3: Atomic commit drill

**Goal**: Practice reviewable commit granularity independent of attribution.

**Instructions**:
1. Ask Claude to implement a small multi-step feature.
2. Require 3-5 atomic commits, each passing tests on its own.
3. Run `git log --oneline -10` — can you tell what happened without opening a diff?

<details>
<summary>✅ Solution</summary>

If the log reads like `feat(auth): add endpoint` / `feat(auth): add token generation` / `feat(auth):
add email send`, each one independently testable, that's atomic. If it reads `wip` / `more changes`
/ `fix`, tighten the instruction in `CLAUDE.md`: "one logical change per commit; each commit must
pass `npm test`."
</details>

---

## 5. CHEAT SHEET

| Key / Flag | Effect |
|---|---|
| `attribution.commit` | Replace the commit trailer text (default: `Co-Authored-By: <model> <noreply@anthropic.com>`) |
| `attribution.pr` | Replace the PR description text (default: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`); `""` hides it |
| `attribution.sessionUrl` | `false` omits the `Claude-Session` trailer on cloud/Remote Control commits |
| `attribution: false` | Hide all attribution at once (v2.1.281+ only) |
| `includeCoAuthoredBy` | ⚠️ Deprecated since v2.0.62 — use `attribution` |
| `claude --worktree <name>` (`-w`) | Isolated worktree at `.claude/worktrees/<name>`; accepts a PR URL or `#<number>` |
| `gh pr create` / `glab mr create` | What Claude actually calls to open a PR — links the session to it |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Assuming `includeCoAuthoredBy: false` still works on current versions | It's read for compatibility, but set `attribution.commit`/`attribution.pr` instead |
| Setting `attribution: false` and wondering why nothing changed | Requires v2.1.281+; on older versions the whole settings file that holds it is skipped |
| Expecting a CLAUDE.md instruction to remove attribution set in managed settings | Managed settings always win over your own instructions on this |
| One giant "implemented everything" commit | Require atomic commits, each passing tests, in `CLAUDE.md` |
| Two features editing the same working directory at once | `claude --worktree <name>` per feature |
| Believing attribution proves the code was reviewed | It only records that Claude wrote it — Module 10.3 covers actually reviewing it |

---

## 7. REAL CASE — Production Story

A Hanoi-based team let every developer's Claude commit and open PRs directly with the documented
default trailer. During a compliance review, security asked which commits were AI-assisted across
three repos — instead of grepping commit messages for inconsistent hand-written markers, they
grepped for the exact `Co-Authored-By: Claude` string, because every AI-made commit in every repo
used the same documented default. For one internal-tools repo where they didn't want the trailer
visible in a client-facing changelog, they set `attribution.commit` to an empty-body private note
format and `attribution.pr` to `""` in that repo's `.claude/settings.json` — a two-line change,
not a policy negotiation, because the mechanism already existed and only needed configuring.

---

> **Next**: [Module 10.3: Code Review Protocol](../03-code-review-protocol/) →
