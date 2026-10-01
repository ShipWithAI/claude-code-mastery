---
title: 'Command & Prompt Templates'
description: 'Turn repeated prompts into real .claude/commands/*.md files with frontmatter, $ARGUMENTS, and pre-executed shell.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 15.2: Command & Prompt Templates

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 15.1 (CLAUDE.md Templates)
>
> **Outcome**: After this module, you will have real `.claude/commands/*.md` files — with
> frontmatter, `$ARGUMENTS`, and pre-executed shell — that you invoke as `/name`, plus a rule for
> when a one-off prompt should stay a plain prompt instead.

---

## 1. WHY — Why This Matters

You keep retyping the same review/test/doc instructions into Claude Code. A "prompt template"
that only lives as a Markdown snippet you copy-paste isn't reusable in any way Claude Code
understands — it's still hand-typed, its `{{placeholders}}` are never parsed, and nobody on your
team finds it unless you tell them where it lives. Claude Code has a real mechanism for this: a
file in `.claude/commands/` becomes an actual `/name` command with real argument substitution and
shell output injected before Claude even sees your prompt. Write the file once, commit it, and
everyone on the repo gets the same `/name`.

---

## 2. CONCEPT — Core Ideas

### Where a command file lives

| Location | Invoked as |
|---|---|
| `.claude/commands/pr-review.md` | `/pr-review` (project, commit it) |
| `~/.claude/commands/pr-review.md` | `/pr-review` (personal, every project) |
| `.claude/commands/testing/gen-unit-tests.md` | `/testing:gen-unit-tests` (namespaced) |

Docs quote (skills page): "A file at `.claude/commands/deploy.md` and a skill at
`.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way. Your existing
`.claude/commands/` files keep working." A skill (Module 15.3) adds a folder for supporting files
and finer invocation control; a single-file command is simpler when that's all you need. If a
skill and a command file share a name, the skill runs.
[Module 4.3](../../phase-04-prompt-memory/03-slash-commands/) covers the broader slash-command
mechanism — built-ins, `/help`, and session-level commands — that a command file plugs into.

### Frontmatter (command files support the same fields as skills, except `name`/`paths`)

| Field | Meaning |
|---|---|
| `description` | Shown in `/help`; what Claude uses to decide when to suggest it |
| `argument-hint` | Autocomplete hint, e.g. `[focus-area]` |
| `allowed-tools` | Tools pre-approved for this invocation, e.g. `Bash(git diff *)` |
| `model` | Override the session model for this command only |
| `disable-model-invocation` | `true` = only you can run it, never Claude on its own |

### Substitutions

- `$ARGUMENTS` — everything typed after the command name. If nothing in the body reads it, Claude
  Code appends `ARGUMENTS: <value>` to the end.
- `$0`, `$1`, … — positional arguments; `$0` is the **first** argument, not `$1`.
- `` !`git diff HEAD` `` — runs the shell command before your prompt is sent; its output replaces
  the placeholder. A failed command aborts the whole invocation — append `|| true` if that's
  expected.

### Naming rule

Don't name a custom command after a built-in. `/review` is already an alias for `/code-review`,
and `/debug` is a bundled skill — check the built-in list (`/help`, or the commands doc) before
you pick a name.

---

## 3. DEMO — Step by Step

**Step 1: Write a real review command**

```markdown
---
description: Review the current working-tree diff for correctness, security, and readability
argument-hint: [focus-area]
allowed-tools: Bash(git diff *)
---
## Diff to review
!`git diff HEAD`

## Focus area (optional)
$ARGUMENTS

Review the diff above. If a focus area was given, cover that category first, then the others.
For each finding: 🔴 Critical / 🟠 Important / 🟡 Suggestion — `file:line` — one-sentence reason.
End with ✅ Good practices observed (if any).
```
Save as `.claude/commands/pr-review.md` — docs: `code.claude.com/docs/en/skills`.

**Step 2: Write two more, same pattern**

`.claude/commands/gen-tests.md` (`argument-hint: [file]`, `allowed-tools: Read, Glob`) tells
Claude to generate `node:test` cases matching `@tests/math.test.mjs`'s style for `$ARGUMENTS`.
`.claude/commands/gen-docs.md` (`allowed-tools: Read`) generates a JSDoc block for every exported
function in `$ARGUMENTS`. Both print code only — they don't edit files.

**Step 3: Make a real diff, then invoke `/pr-review`**

```bash
# edit src/math.js to add a new function with an unguarded division
git diff --stat
```
Expected output:
```text
# Output may vary
 src/math.js | 3 +++
 1 file changed, 3 insertions(+)
```

```bash
claude -p "/pr-review security" --allowedTools "Read,Bash(git diff *)"
```
Expected output (trimmed):
```text
# Output may vary
**Security**
- 🟠 Important — `src/math.js:3` — `percentOf` doesn't check its inputs. JavaScript silently
  converts types, so bad values pass through without an error…

**Correctness**
- 🟠 Important — `src/math.js:4` — When `whole === 0`, the function returns `Infinity` … instead
  of failing clearly. The existing `divide` at `src/math.js:2` has the same gap.

✅ Good practices observed
- It's a pure function with no side effects, so it's easy to test.
```
No permission prompt appeared: `git diff` is a read-only Bash form and `Read` needs no approval
in the working directory, so this runs the same way in CI as it does on your laptop.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Invoke and compare

**Goal**: See what a real command file catches that a copy-pasted prompt doesn't.

**Instructions**:
1. Create `.claude/commands/pr-review.md` from Step 1.
2. Make a small change in your repo, run `/pr-review`, then `/pr-review security`.
3. Compare: did the focus argument change which findings came first?

<details>
<summary>💡 Hint</summary>
`$ARGUMENTS` only changes the "Focus area" section — the diff injection via `!` runs identically
either way.
</details>

### Exercise 2: Namespaced command with positional arguments

**Goal**: Build a command that takes two separate arguments.

**Instructions**:
1. Create `.claude/commands/testing/gen-unit-tests.md` with `argument-hint: [file] [function-name]`
   and a body that reads `$0` (file) and `$1` (function name) separately.
2. Run `/testing:gen-unit-tests src/math.js percentOf`.
3. Confirm the command name is namespaced (`/testing:gen-unit-tests`, not `/gen-unit-tests`).

<details>
<summary>✅ Solution</summary>

```markdown
---
description: Generate node:test unit tests matching this repo's existing style
argument-hint: [file] [function-name]
allowed-tools: Read, Glob
---
Generate `node:test` unit tests for `$1` in `$0`, matching `@tests/math.test.mjs`'s style.
Cover the happy path, one edge case, and one error case. Print the code only.
```
A subdirectory under `.claude/commands/` always becomes the `/subdir:name` prefix — that's how
Claude Code namespaces commands, not a naming convention you choose yourself.
</details>

---

## 5. CHEAT SHEET

| Frontmatter field | Purpose |
|---|---|
| `description` | Listed in `/help`; drives auto-suggestion |
| `argument-hint` | Autocomplete hint |
| `allowed-tools` | Pre-approve tools for this invocation |
| `model` | Override model for this command |
| `disable-model-invocation` | `true` = user-only, never auto-triggered |

| Substitution | Meaning |
|---|---|
| `$ARGUMENTS` | Everything after the command name |
| `$0`, `$1`, … | Positional arguments (0-indexed) |
| `` !`cmd` `` | Runs before the prompt; output replaces the placeholder |

| Location | Scope |
|---|---|
| `.claude/commands/<name>.md` | Project, commit it |
| `~/.claude/commands/<name>.md` | Personal, every project |
| `.claude/commands/<subdir>/<name>.md` | Namespaced `/subdir:name` |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| `docs/prompt-templates.md` nobody runs | A real `.claude/commands/<name>.md` invoked as `/name` |
| `{{placeholder}}` syntax (never parsed) | `$ARGUMENTS` or `$0`/`$1` — the only substitutions Claude Code reads |
| Naming a command `/review` or `/debug` | Check the built-in list first; the skill wins on a name clash |
| `!`command`` with no `\|\| true` on an expected failure | Command aborts entirely — Claude never sees the rest of the file |
| One giant do-everything command | One focused command per task; a genuine one-off (paste this exact error) stays a plain prompt |
| No `allowed-tools` on a read-only command | Add it so the command runs unattended in `-p` and CI, not just interactively |

---

## 7. REAL CASE — Production Story

**Scenario**: A small team kept a shared Google Doc of "good Claude Code prompts." Whoever
remembered the doc existed used it; new hires didn't know to look.

**Fix**: They committed `.claude/commands/pr-review.md`, `gen-tests.md`, and `gen-docs.md` to the
repo. Every reviewer now runs the identical `/pr-review` checklist — the criteria live in a file
under version control, not in one person's head. When someone wants to improve the checklist, they
open a pull request against `pr-review.md` like any other change, and the diff shows exactly what
the review criteria used to be.

**Result**: The prompt library stopped being tribal knowledge. It's reviewable, diffable, and
`git blame` shows who added which check and why.

---

> **Next**: [Module 15.3: Claude Code Skills](../03-claude-code-skills/) →
