---
title: 'Emergency Procedures'
description: 'Handle Claude Code emergencies with recovery commands, rollback procedures, and quick-action playbooks.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 8.5: Emergency Procedures

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 8.4 (Quality Assessment)
>
> **Outcome**: After this module, you will have a mental playbook for Claude Code emergencies, know recovery commands by heart, and be able to act quickly when things go wrong.

---

## 1. WHY — Why This Matters

Claude was supposed to "clean up the config files." You approved without looking carefully. Now your `.env` file is deleted, production environment variables are gone, and you're scrambling to remember what was in there.

Or: Claude modified 50 files in a "refactor" and you have no idea what actually changed.

Emergencies happen. Even with all the safeguards from earlier modules. The question is: do you have a recovery plan? The worst time to figure out emergency procedures is DURING an emergency.

---

## 2. CONCEPT — Core Ideas

### Emergency Severity Levels

| Level | Situation | Response Time | Example |
|-------|-----------|---------------|---------|
| 🔴 Critical | Production affected, data loss | Immediate | Deleted .env, broke production |
| 🟠 Major | Development blocked | Minutes | 50 files modified, can't continue |
| 🟡 Minor | Confused state, recoverable | When convenient | Context confusion, stuck loop |

### The Emergency Playbook

Memorize this sequence:

1. **STOP**: Press **Esc** immediately to interrupt the current turn. Don't let Claude continue.
2. **ASSESS**: `git status` + `git diff` — what actually changed? `Esc Esc` (or `/rewind`) also
   shows the checkpoint list, so you can see exactly which turns touched code.
3. **CONTAIN**: `git stash` for anything Bash touched. For edits the `Edit`/`Write` tools made in
   *this* session, `/rewind` → "Restore code" can undo them directly — but it cannot undo anything
   done through Bash (`rm`, `mv`, a script). See CONTAIN below.
4. **RECOVER**: Choose recovery strategy based on severity.
5. **DOCUMENT**: What went wrong? Update CLAUDE.md — or better, a `permissions.deny` rule or a
   `PreToolUse` hook — to prevent recurrence.

### Recovery Strategies

| Strategy | Command | When to Use |
|----------|---------|-------------|
| Undo an Edit/Write-tool change | `Esc Esc` → Restore code (or `/rewind`) | The bad change was made by Claude's Edit/Write tool this session |
| Discard one file | `git restore <file>` | One file is wrong (works even across sessions, if tracked) |
| Discard all changes | `git restore .` | Everything since last commit is bad |
| Hard reset | `git reset --hard HEAD` | Complete disaster recovery |
| Recover deleted commits | `git reflog` | If you reset too hard |
| Start fresh session | `/clear` | Claude context is hopelessly confused |

The older `git checkout` command still works for this, but `git restore` is the modern,
purpose-built command for "discard changes to a file" — `checkout` is overloaded (it also switches
branches), which makes it easy to fat-finger during an emergency.

### Pre-Emergency Preparation

- Commit frequently (small commits = easy recovery points)
- Use feature branches (isolate AI work)
- Backup .env and sensitive files outside git
- Know your recovery commands by heart
- Never Full Auto without git safety net

---

## 3. DEMO — Step by Step

### Scenario 0: Rewind Undoes an Edit — But Not a Bash Delete

This is a real lab session (captured 2026-09-28) with two turns: one `Edit`-tool change, then one
`Bash rm`. `Esc Esc` on an empty prompt opens the rewind menu:

```text
# Output may vary — captured live, redacted of local plugin details
Rewind

Restore the code and/or conversation to the point before…

  Append the line 'line2' to rewind-demo.txt using the Edit tool.
  rewind-demo.txt +1

  Append the line 'line3' to rewind-demo.txt using the Edit tool.
  rewind-demo.txt +1

❯ (current)

Enter to continue · Esc to cancel
```

Selecting the earlier checkpoint opens the action menu — a real capture shows **5 options plus a
scroll cue** for a turn with code changes:

```text
# Output may vary
Rewind

Confirm you want to restore to the point before you sent this message:

│ Append the line 'line3' to rewind-demo.txt using the Edit tool.
│ (12s ago)

The conversation will be forked.
The code will be restored -1 in rewind-demo.txt.

❯ 1. Restore code and conversation
  2. Restore conversation
  3. Restore code
  4. Summarize from here
↓ 5. Summarize up to here

⚠ Rewinding does not affect files edited manually or via bash.
```

Choosing **"Restore code"** really does revert the file — `cat rewind-demo.txt` afterward shows
`line3` gone. Now watch what happens after a `Bash rm`: the checkpoint list marks that turn
**"No code changes"**, and its action menu drops "Restore code" entirely:

```text
# Output may vary
Rewind

Confirm you want to restore to the point before you sent this message:

│ Delete throwaway.txt using rm via the Bash tool.
│ (12s ago)

The conversation will be forked.
The code will be unchanged.

❯ 1. Restore conversation
  2. Summarize from here
  3. Summarize up to here
  4. Never mind
```

**Confirmed**: after selecting any option here, `ls throwaway.txt` still returns "No such file or
directory." Rewind genuinely cannot see Bash-made changes — this is (S15), documented in
`checkpointing.md`. The only way back is git:

```bash
$ git restore throwaway.txt
$ ls throwaway.txt
throwaway.txt   # Output may vary — recovered
```

**Lesson**: `/rewind` is for what Claude's own `Edit`/`Write` tools did. For anything Claude ran
through Bash, git is the only safety net — which is why Pre-Emergency Preparation (below) matters.

### Scenario 1: Claude Deleted Important Files

**STOP** — See Claude deleting files? Press `Esc` immediately to interrupt.

**ASSESS**:
```bash
$ git status
```

Expected output:
```text
Changes not staged for commit:
  deleted:    .env
  deleted:    config/production.json
  modified:   src/config.ts
```

**CONTAIN**:
```bash
$ git stash
```

Expected output:
```text
Saved working directory and index state WIP on main: abc1234 Last commit
```

**RECOVER**:
```bash
$ git restore .
```

`git restore` prints nothing on success (verified: exit code 0, silent) — check the result
directly:

Verify recovery:
```bash
$ ls .env config/production.json
```

Expected output:
```text
.env  config/production.json
```

Files are back.

### Scenario 2: Claude Modified 50 Files

**STOP**: Press `Esc`

**ASSESS**:
```bash
$ git diff --stat
```

Expected output:
```text
 50 files changed, 2000 insertions(+), 500 deletions(-)
```

```bash
$ git diff --name-only
```

Expected output:
```text
src/api/users.ts
src/api/products.ts
... (48 more files)
```

**CONTAIN**:
```bash
$ git stash
```

**PARTIAL RECOVERY** (if some changes were good):
```bash
$ git stash pop
$ git restore src/unrelated/
$ git add src/feature/
$ git commit -m "Partial work from AI session"
```

**NUCLEAR RECOVERY** (if everything is bad):
```bash
$ git reset --hard HEAD
```

### Scenario 3: Reset Too Hard, Lost Work

```bash
$ git reflog
```

Expected output:
```text
abc1234 HEAD@{0}: reset: moving to HEAD
def5678 HEAD@{1}: commit: My work before disaster
ghi9012 HEAD@{2}: commit: Earlier work
```

Recover:
```bash
$ git reset --hard def5678
```

Your work is back.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Emergency Drill

**Goal**: Practice the full emergency playbook in a safe environment.

**Instructions**:
1. Create a test repository with some files
2. Make intentional "bad" changes (delete a file, modify several)
3. Practice: STOP → ASSESS → CONTAIN → RECOVER
4. Time yourself. Target: full recovery in under 2 minutes.

<details>
<summary>💡 Hint</summary>

Setup:
```bash
mkdir emergency-drill && cd emergency-drill
git init
echo "important" > config.txt
echo "SECRET=abc123" > .env
git add . && git commit -m "Initial"

# Simulate disaster
rm .env
echo "broken" >> config.txt
```

Now practice recovery.
</details>

### Exercise 2: Recovery Command Muscle Memory

**Goal**: Make recovery commands automatic.

Practice until you can type without thinking:
```bash
git status          # What changed?
git diff            # What exactly?
git stash           # Save state
git restore .       # Discard all
git restore <file>  # Discard one
git reset --hard HEAD  # Nuclear
git reflog          # Find lost commits
```

### Exercise 3: Post-Mortem Practice

**Goal**: Build the documentation habit.

**Instructions**:
1. Simulate an emergency (Exercise 1)
2. After recovery, write a brief post-mortem:
   - What happened?
   - Why did it happen?
   - How to prevent next time?
3. Draft an **enforced** prevention, not a CLAUDE.md wish

<details>
<summary>✅ Solution</summary>

Example post-mortem:

**What happened**: Claude deleted `.env` while "cleaning up config."

**Why**: Vague prompt ("clean up") + approved without reviewing.

**Prevention that's actually enforced** — a CLAUDE.md line like "NEVER delete .env" is advisory;
Claude can still miss it under a vague prompt. Two mechanisms that can't be skipped:

`.claude/settings.json`:
```json
{ "permissions": { "deny": ["Bash(rm *.env)", "Bash(rm config/*.json)"] } }
```

Or a `PreToolUse` hook that blocks the specific paths outright (Module 11.3):
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Deletion of .env/config files requires human action, not Claude."
  }
}
```

Both work "even in `bypassPermissions` mode" — a hook that denies overrides Full Auto.
</details>

---

## 5. CHEAT SHEET

### Emergency Playbook

1. 🛑 **STOP**: Press `Esc`
2. 🔍 **ASSESS**: `git status` + `git diff`, `Esc Esc`/`/rewind` to see checkpoints
3. 📦 **CONTAIN**: `git stash` (Bash changes); `/rewind` → Restore code (Edit/Write changes only)
4. 🔧 **RECOVER**: See commands below
5. 📝 **DOCUMENT**: `permissions.deny` or a `PreToolUse` hook — enforced, not a CLAUDE.md note

### Recovery Commands

```bash
# See damage
git status && git diff --stat

# Save mess before recovering
git stash

# Undo one file
git restore path/to/file

# Undo everything
git restore .

# Nuclear reset
git reset --hard HEAD

# Recover from bad reset
git reflog
git reset --hard <commit-hash>
```

`/rewind` (or `Esc Esc`) → "Restore code" undoes Edit/Write-tool changes in the current session.
It cannot undo anything done via Bash — for that, git is the only recovery path.

### Prevention Checklist

- [ ] Commit before AI sessions
- [ ] Use feature branches
- [ ] Never Full Auto without git branch
- [ ] Backup .env files separately
- [ ] Deny dangerous commands with `permissions.deny` or a `PreToolUse` hook — not just a CLAUDE.md note

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Panicking and running commands randomly | Follow playbook: STOP → ASSESS → CONTAIN → RECOVER |
| `git reset --hard` as first response | Assess first. Sometimes partial recovery is better. |
| Forgetting `git stash` before recovery | Always stash first. You might need to inspect the bad state. |
| Not knowing reflog exists | `git reflog` can recover almost anything. Learn it. |
| Same emergency twice | A CLAUDE.md note is advisory and can be missed; add `permissions.deny` or a hook for the specific dangerous action |
| No commits before AI sessions | Clean commit = clean recovery point. Non-negotiable. |
| Keeping .env only in working directory | Backup sensitive files outside git separately |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese startup, Friday 6pm. Dev was rushing to finish a feature, used Full Auto to "clean up and refactor." Went to get coffee. Came back to find Claude had deleted 3 migration files it considered "outdated" and modified the database schema.

**Panic response (wrong)**:
- Tried to recreate migration files from memory
- Ran migrations on staging — broke everything
- Spent 4 hours trying to recover database

**What should have happened**:
1. STOP: Press `Esc` (or just don't approve the deletion)
2. ASSESS: `git diff --stat` would have shown migration deletions
3. CONTAIN: `git stash`
4. RECOVER: `git restore db/migrations/`
5. DOCUMENT: `permissions.deny: ["Bash(rm db/migrations/*)"]` — enforced, not a CLAUDE.md note

**Lesson learned**: "2 minutes of emergency procedure saves 4 hours of panic. We now have emergency commands printed and taped to monitors."

---

> **Phase 8 Complete!** You can now debug Claude itself — detecting hallucinations, breaking loops, fixing context confusion, assessing quality, and recovering from emergencies.
>
> **Next Phase**: [Phase 9: Legacy Code & Brownfield](../../phase-09-legacy-brownfield/01-archeology-mode/) — Apply Claude Code to existing codebases.
