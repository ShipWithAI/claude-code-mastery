---
title: 'Slash Commands'
description: 'Find any built-in slash command, write a custom command in .claude/commands/, and know when to promote it to a skill.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 4.3: Slash Commands

> **Estimated time**: ~25 minutes
>
> **Prerequisite**: Module 4.2 (CLAUDE.md — Project Memory)
>
> **Outcome**: After this module, you will be able to find any built-in command with `/`, write a project command in `.claude/commands/` that takes arguments and pre-runs a shell check, and know when to promote that command to a skill.

---

## 1. WHY — Why This Matters

You type `/` and a wall of names scrolls past — some built-in, some skills a teammate installed, some plugins you forgot you enabled. You need `/compact`, but is it `/compact` or `/context`? Meanwhile your team keeps pasting the same "review this diff for security issues" prompt into every session. Both problems share one fix: know the built-in command surface, and turn repeated prompts into commands your whole team gets for free from git.

---

## 2. CONCEPT — Three Kinds of `/`

Everything that starts with `/` falls into one of three buckets:

| Kind | Where it lives | Invoked as |
|---|---|---|
| **Built-in** | Shipped with Claude Code | `/context`, `/compact`, `/model`, … |
| **Custom command** | `.claude/commands/<name>.md` (project, committed) or `~/.claude/commands/<name>.md` (personal, all projects) | `/name` |
| **Skill / plugin** | `.claude/skills/<name>/SKILL.md`; plugin skills load as `<plugin>:<skill>` | `/name`, or Claude auto-invokes it |

Custom commands and skills overlap on purpose: "A file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way." A subdirectory namespaces it: `.claude/commands/frontend/component.md` becomes `/frontend:component`. A skill wins a same-name collision.

### Frontmatter a command can set

| Field | Meaning |
|---|---|
| `description` | What it does; Claude reads this to decide when to invoke it itself |
| `argument-hint` | Autocomplete hint, e.g. `"<issue-number>"` |
| `allowed-tools` | Pre-approve tools for *this invocation only*, `Tool(pattern)` syntax |
| `model` | Override the session model while this command runs |
| `disable-model-invocation` | `true` — only you can run it, never Claude on its own |

Inside the body: `$ARGUMENTS` is everything typed after the command name; `$0`, `$1`, `$2`… are positional pieces. `` !`command` `` runs a shell command before your prompt reaches Claude and substitutes its output — "a failed command aborts the entire invocation," so append `|| true` when failure is expected. `@file` attaches a file's contents the same way it does for a local skill (per skills.md; no dedicated `@file` syntax page exists).

### Built-in commands worth knowing by heart

| Group | Commands |
|---|---|
| **Session** | `/clear` (fresh conversation, keeps memory) · `/compact [instructions]` (summarize to free context) · `/context` (colored grid of what's using space) · `/resume` (reopen a past session) · `/rewind` (roll code/conversation back to a checkpoint) |
| **Config** | `/model` (switch model) · `/effort` (low…xhigh reasoning) · `/permissions` (allow/ask/deny rules) · `/config` (theme, output style, settings) · `/memory` (edit CLAUDE.md, toggle auto memory) |
| **Extend** | `/agents` (ask Claude to create/manage subagents, or edit `.claude/agents/` yourself) · `/hooks` (view hook config) · `/mcp` (MCP server connections) · `/plugin` (install/enable/disable plugins) · `/skills` (list and toggle skill visibility) |
| **Account** | `/login` (sign in to your Anthropic account) · `/status` (version, model, account, connectivity) · `/usage` (session cost, plan limits — `/cost` and `/stats` are aliases) · `/doctor` (setup checkup, can fix issues) |

Skills like `/deploy` are a natural next step once a command file grows a supporting script or reference doc commands can't hold (Module 15.3).

---

## 3. DEMO — Step by Step

Working directory: `~/cc-lab`.

**Step 1: Type `/` then a few letters to filter**

Bare `/` opens a short, fixed-height popup — here its first rows were the author's own skills, so
type a few letters to narrow it to built-ins:

```text
# Output may vary — narrowed with a letter filter so built-ins surface immediately
❯ /co
  /copy                                                  Copy Claude's last response to clipboard (or /copy N for the Nth-latest)
  /color                                                 Set the prompt bar color for this session
  /config                                                Open settings
  /compact                                               Free up context by summarizing the conversation so far
  /context                                               Visualize current context usage as a colored grid
```
Press `↓` to keep scrolling the same filtered list — it mixes built-ins with whatever else matches:
```text
# Output may vary
  /code-review                                           3 free /ultrareview · Review the current diff, or a PR number/branch/path target, for correctness bugs…
  …                                                       … (redacted — your own installed skill, also matched "co")
```
The list always blends built-ins with whatever the reader has installed — hence the `…` redaction.

**Step 2: `/help` for the quick reference**

```text
# Output may vary
❯ /help
   Help  General   Commands   Custom commands
   Claude understands your codebase, makes edits with your permission, and executes commands.
   New here? Run /powerup to learn the features most people miss.
   Shortcuts
   ! for shell mode          double tap esc to clear input      ctrl + shift + _ to undo
   / for commands            shift + tab to auto-accept edits    ctrl + z to suspend
   @ for file paths          ctrl + o for verbose output         ctrl + v to paste images
   /btw for side question    ctrl + t to toggle tasks            opt + p to switch model
   Esc to cancel
```
**Commands** lists every built-in; **Custom commands** lists skills and `.claude/commands/` files, tagged with source.

**Step 3: Write a project command with an argument and a pre-run check**

```markdown
<!-- .claude/commands/review-file.md -->
---
description: Review a file against its current git diff
argument-hint: "<path>"
allowed-tools: Read, Bash(git diff *)
---

Diff stat for context:

!`git diff --stat`

Review the file at $1. Flag bugs, missing error handling, and missing tests.
```
`allowed-tools` pre-approves the `!` block; it does not pre-approve anything Claude decides to do afterward.

**Step 4: Run it**

```text
# Output may vary — real run against a one-line uncommitted change to src/math.js
❯ /review-file src/math.js
⏺ Review: src/math.js
  What changed: you added one line, subtract(a, b), at src/math.js:3.
  Bugs
  1. divide doesn't guard against division by zero (src/math.js:2, existing
     code). divide(1, 0) returns Infinity with no error…
  Missing tests
  3. subtract (the new function) has no test…
```
Claude also asked to run `npm test`, outside `Bash(git diff *)` — proof `allowed-tools` covers exactly the pattern listed, nothing more.

**Step 5: Namespace a command in a subdirectory**

```markdown
<!-- .claude/commands/frontend/component.md -->
---
description: Scaffold a new frontend component with a matching test file
argument-hint: "<ComponentName>"
---

Create a new component named $1 under src/components/, plus a matching test file.
```

```text
# Output may vary
❯ /frontend
  /frontend:component                                    Scaffold a new frontend component with a matching test file (project)
  …                                                       (redacted — your own installed skill)
```
The `(project)` tag confirms it came from `.claude/commands/`; the subdirectory became the namespace.

**Step 6: Clean up**
```bash
git -C ~/cc-lab checkout -- . && git -C ~/cc-lab clean -fd
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: `/fix-issue`

**Goal**: Write `.claude/commands/fix-issue.md` that takes an issue number and pre-loads the issue.

**Instructions**: Use `$1` for the number and `` !`gh issue view $1` `` to inject it before Claude reads your instructions.

<details>
<summary>💡 Hint</summary>
The `!` block needs its own permission. Pre-approve it in frontmatter.
</details>

<details>
<summary>✅ Solution</summary>

```markdown
---
description: Investigate and fix a GitHub issue
argument-hint: "<issue-number>"
allowed-tools: Bash(gh issue view *)
---

Issue #$1:

!`gh issue view $1`

Read the issue above, find the relevant code, and propose a fix.
```
</details>

### Exercise 2: Command outgrows its file

**Goal**: Decide when `.claude/commands/deploy.md` should become `.claude/skills/deploy/SKILL.md` instead.

**Instructions**: A command file can't ship a supporting script or reference doc — a skill directory can. Once it needs a second file, move it. See Module 15.3 for the skill directory layout.

<details>
<summary>✅ Solution</summary>
If `deploy.md` starts saying "see the checklist below" and that checklist keeps growing, split into `SKILL.md` (short) plus `checklist.md` (loaded only when needed) — same `/deploy`, lower context cost.
</details>

### Exercise 3: `/compact` vs `/clear`

**Goal**: Confirm summarizing vs. erasing.

**Instructions**: Implement something small, run `/compact`, ask "what did we just build?" Then run `/clear` and ask again.

**Expected result**: After `/compact`, Claude answers from the summary. After `/clear`, Claude has nothing — `/clear` starts a new conversation while keeping project memory (CLAUDE.md), not the conversation history.

---

## 5. CHEAT SHEET

| Command | Purpose |
|---|---|
| `/clear` | New conversation, keeps CLAUDE.md |
| `/compact [instructions]` | Summarize now, optionally with a focus |
| `/context [all]` | Colored grid of context usage |
| `/resume` | Reopen a session |
| `/branch` | Fork the conversation, keep the original |
| `/rewind` | Roll code/conversation back |
| `/model` | Switch model |
| `/effort` | Set reasoning effort |
| `/permissions` | Allow/ask/deny rules |
| `/sandbox` | Toggle sandbox mode (supported platforms only) |
| `/config` | Theme, output style, settings |
| `/output-style` | List/switch output styles |
| `/memory` | Edit CLAUDE.md, toggle auto memory |
| `/agents` | Ask Claude to manage subagents, or edit `.claude/agents/` |
| `/hooks` | View hook config |
| `/mcp` | Manage MCP connections |
| `/plugin` | Install/enable/disable plugins |
| `/skills` | List and toggle skills |
| `/skill-doctor` | Skill context-cost report |
| `/login` / `/logout` | Account |
| `/usage` | Cost, plan limits (`/cost`, `/stats` = aliases) |
| `/status` | Version, model, connectivity |
| `/doctor` | Setup checkup, can fix issues |
| `/bug` / `/feedback` | Report a bug / send feedback |

**Custom command syntax**

| File | Invoked as |
|---|---|
| `.claude/commands/<name>.md` | `/name` |
| `.claude/commands/<subdir>/<name>.md` | `/subdir:name` |
| `~/.claude/commands/<name>.md` | `/name` (every project) |

**Related shortcuts**: `/` opens the menu, keep typing to filter · `Tab`/arrows navigate · `!` at line start = shell mode · `@` = file-path autocomplete · `?` on empty input = shortcut help panel.

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Prefixing a command name with the old `project` / `user` scope + colon namespace | That namespace is gone. It's just `/name`, or `/subdir:name` when the command lives in a subdirectory. |
| Hand-typing what `/help` or `/usage` "probably" prints | Run it for real in your lab and paste the actual output — it changes across versions. |
| A `!` block with a command that can legitimately fail | Append `\|\| true`, since a failed command aborts the whole invocation, not just that line. |
| A command with side effects (`/deploy`, `/commit`) left invocable by Claude itself | Set `disable-model-invocation: true` so only you can trigger it. |
| Reaching for `/pr-comments` | Removed in v2.1.91. Ask Claude directly to view pull request comments instead. |

---

## 7. REAL CASE — Production Story

A backend team at a Vietnamese fintech kept three prompts alive only in Slack: "review this diff for auth bugs," "draft the changelog entry," "investigate issue #N." New hires never found them. The team committed three files to `.claude/commands/`: `review-file.md`, `ship-notes.md`, `fix-issue.md`, each with an `argument-hint` and a pre-run `!` block pulling the relevant diff or issue.

Result: every teammate got the same three commands the moment they cloned the repo — no onboarding doc, no copy-pasted prompt. When `fix-issue.md` grew a second file (a triage checklist), the team promoted it to a skill under `.claude/skills/fix-issue/`, keeping the `/fix-issue` name their muscle memory already knew.

---

> **Next**: [Module 4.4: Memory System](../04-memory-system/) →
