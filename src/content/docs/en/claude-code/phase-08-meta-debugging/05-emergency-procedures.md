---
title: 'Emergency Procedures'
description: 'Handle Claude Code emergencies with recovery commands, rollback procedures, and quick-action playbooks.'
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

1. **STOP**: Ctrl+C immediately. Don't let Claude continue.
2. **ASSESS**: `git status` + `git diff` — what actually changed?
3. **CONTAIN**: `git stash` — save current state before recovering
4. **RECOVER**: Choose recovery strategy based on severity
5. **DOCUMENT**: What went wrong? Update CLAUDE.md to prevent recurrence.

### Recovery Strategies

| Strategy | Command | When to Use |
|----------|---------|-------------|
| Discard one file | `git checkout <file>` | One file is wrong |
| Discard all changes | `git checkout .` | Everything since last commit is bad |
| Hard reset | `git reset --hard HEAD` | Complete disaster recovery |
| Recover deleted commits | `git reflog` | If you reset too hard |
| Start fresh session | `/clear` | Claude context is hopelessly confused |

### Pre-Emergency Preparation

- Commit frequently (small commits = easy recovery points)
- Use feature branches (isolate AI work)
- Backup .env and sensitive files outside git
- Know your recovery commands by heart
- Never Full Auto without git safety net

---

## 3. DEMO — Step by Step

### Scenario 1: Claude Deleted Important Files

**STOP** — See Claude deleting files? Press `Ctrl+C` immediately.

**ASSESS**:
```bash
$ git status
```

Expected output:
```
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
```
Saved working directory and index state WIP on main: abc1234 Last commit
```

**RECOVER**:
```bash
$ git checkout .
```

Expected output:
```
Updated 3 paths from the index
```

Verify recovery:
```bash
$ ls .env config/production.json
```

Expected output:
```
.env  config/production.json
```

Files are back.

### Scenario 2: Claude Modified 50 Files

**STOP**: Ctrl+C

**ASSESS**:
```bash
$ git diff --stat
```

Expected output:
```
 50 files changed, 2000 insertions(+), 500 deletions(-)
```

```bash
$ git diff --name-only
```

Expected output:
```
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
$ git checkout src/unrelated/
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
```
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
git checkout .      # Discard all
git checkout <file> # Discard one
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
3. Draft a CLAUDE.md addition to prevent recurrence

<details>
<summary>✅ Solution</summary>

Example post-mortem:

**What happened**: Claude deleted .env while "cleaning up config"

**Why**: Vague prompt ("clean up") + approved without reviewing

**Prevention**: Add to CLAUDE.md:
```
## Dangerous Operations
NEVER delete without explicit approval:
- .env files
- config/*.json
- Migration files
```
</details>

---

## 5. CHEAT SHEET

### Emergency Playbook

1. 🛑 **STOP**: Ctrl+C
2. 🔍 **ASSESS**: `git status` + `git diff`
3. 📦 **CONTAIN**: `git stash`
4. 🔧 **RECOVER**: See commands below
5. 📝 **DOCUMENT**: Update CLAUDE.md

### Recovery Commands

```bash
# See damage
git status && git diff --stat

# Save mess before recovering
git stash

# Undo one file
git checkout path/to/file

# Undo everything
git checkout .

# Nuclear reset
git reset --hard HEAD

# Recover from bad reset
git reflog
git reset --hard <commit-hash>
```

### Prevention Checklist

- [ ] Commit before AI sessions
- [ ] Use feature branches
- [ ] Never Full Auto without git branch
- [ ] Backup .env files separately

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Panicking and running commands randomly | Follow playbook: STOP → ASSESS → CONTAIN → RECOVER |
| `git reset --hard` as first response | Assess first. Sometimes partial recovery is better. |
| Forgetting `git stash` before recovery | Always stash first. You might need to inspect the bad state. |
| Not knowing reflog exists | `git reflog` can recover almost anything. Learn it. |
| Same emergency twice | Document and update CLAUDE.md after every emergency |
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
1. STOP: Ctrl+C (or just don't approve the deletion)
2. ASSESS: `git diff --stat` would have shown migration deletions
3. CONTAIN: `git stash`
4. RECOVER: `git checkout db/migrations/`
5. DOCUMENT: Add to CLAUDE.md: "NEVER delete migration files without explicit approval"

**Lesson learned**: "2 minutes of emergency procedure saves 4 hours of panic. We now have emergency commands printed and taped to monitors."

---

> **Phase 8 Complete!** You can now debug Claude itself — detecting hallucinations, breaking loops, fixing context confusion, assessing quality, and recovering from emergencies.
>
> **Next Phase**: [Phase 9: Legacy Code & Brownfield](../../phase-09-legacy-brownfield/01-archeology-mode/) — Apply Claude Code to existing codebases.
