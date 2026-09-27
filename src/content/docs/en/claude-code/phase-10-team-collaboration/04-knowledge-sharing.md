---
title: 'Knowledge Sharing'
description: 'Share Claude Code knowledge as real .claude/commands/ and .claude/skills/ files committed to the repo, not a docs/prompts/ folder nobody runs.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 10.4: Knowledge Sharing

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 10.3 (Code Review Protocol)
>
> **Outcome**: After this module, you will share Claude Code knowledge as real, invocable
> `.claude/commands/` and `.claude/skills/` files committed to the repo, plus a lessons-learned
> log and a path to share both across repos.

---

## 1. WHY — Why This Matters

Developer A discovers a prompt that saves hours, keeps it to themselves. Developer B struggles
with the same problem for days. Developer C makes a mistake with Claude, fixes it, tells no one.
Developer D repeats it a month later.

A shared Google Doc of "good prompts" doesn't fix this — nobody remembers it exists, and it isn't
something Claude Code can run. The fix is to make the knowledge a real file: a command or skill
under version control that anyone invokes with `/name`, and a lessons-learned log that's just as
real but stays a plain document because a mistake write-up isn't something you invoke.

---

## 2. CONCEPT — Core Ideas

### Types of Claude Code knowledge

| Type | Example | Where it lives |
|------|---------|--------------|
| Prompts | "This generates great tests" | `.claude/commands/` or `.claude/skills/` |
| Techniques | "Use `/compact` before a long refactor" | Team wiki/docs |
| Patterns | "Extended thinking for architecture calls" | CLAUDE.md |
| Pitfalls | "Don't ask Claude to edit `.claude/settings.json` directly" | Lessons-learned log |
| Workarounds | "Claude struggles with X, do Y instead" | Troubleshooting guide |

### The library is real files, not `docs/prompts/*.md`

`docs/prompts/testing/generate-unit-tests.md` is a Markdown file nobody runs — a reader has to
copy its contents into chat by hand. The real version is
`.claude/commands/testing/gen-unit-tests.md`, which becomes `/testing:gen-unit-tests` the moment
it's committed (Module 15.2). A checklist that has grown past a single prompt — with its own
supporting files — becomes a skill under `.claude/skills/<name>/SKILL.md` instead (Module 15.3).
Both are just files in the repo: `git blame` shows who wrote which check, and a change to the
checklist is a normal pull request.

### Sharing across repos

A single repo's `.claude/commands/` and `.claude/skills/` only help that repo. To share a library
across every repo your team owns, package it as a plugin and publish it to an internal
marketplace — see
[Module 15.4: Community Ecosystem](../../phase-15-templates-skills/04-community-ecosystem/) for
the marketplace side, and
[Module 15.5: Custom Skill Development](../../phase-15-templates-skills/05-custom-skill-development/)
for turning a skill folder into a plugin.

### Lessons-learned log

```markdown
## 2026-09-28: percentOf silently returns Infinity on whole=0
**What happened**: `/pr-review` flagged it before it shipped; `divide` had the same gap already.
**Root cause**: neither function validated its second argument before dividing.
**Prevention**: `/triage-stacktrace` now exists, so the next crash traces to file:line directly.
**Updated**: added the check to `percentOf`.
```

### Sharing rituals

Weekly tip in the team channel, sprint-retro review of what broke, monthly pass over CLAUDE.md and
the command library, and a library walkthrough during onboarding. Skip inventing a "magic prefix"
tip (like "Think carefully about…") — extended thinking is a real, documented mechanism
(`Option+T`, `/effort`; [Module 6.1](../../phase-06-thinking-planning/01-think-mode/)), not a
phrase that changes behavior on its own.

---

## 3. DEMO — Step by Step

**Scenario**: A team of six commits its command library instead of pasting prompts into Slack.

**Step 1: Namespace the library by category**
```bash
mkdir -p .claude/commands/{testing,refactoring,documentation,review}
```
Create one real command, `.claude/commands/testing/gen-unit-tests.md`:
```markdown
---
description: Generate node:test unit tests matching this repo's existing style
argument-hint: [file] [function-name]
allowed-tools: Read, Glob
---
Generate `node:test` unit tests for `$1` in `$0`, matching `@tests/math.test.mjs`'s style.
Cover the happy path, one edge case, and one error case. Print the code only.
```

**Step 2: Invoke it — this is what makes it a library, not a doc**
```bash
claude -p "/testing:gen-unit-tests src/math.js percentOf"
```
Expected output (trimmed):
```text
# Output may vary
test('percentOf: happy path', () => assert.equal(percentOf(25, 200), 12.5));
test('percentOf: zero part', () => assert.equal(percentOf(0, 50), 0));
test('percentOf: zero whole', () => assert.equal(percentOf(5, 0), Infinity));
```

**Step 3: Write the lessons-learned entry, then commit both**
```bash
git add .claude/commands .claude/agents docs/LESSONS_LEARNED.md
git commit -m "team: add pr-review/gen-tests/gen-docs, triage-stacktrace + incident-responder, lessons log"
```
Expected output:
```text
# Output may vary
 .claude/agents/incident-responder.md       | 12 ++++++++++++
 .claude/commands/gen-docs.md               |  8 ++++++++
 .claude/commands/gen-tests.md              | 11 +++++++++++
 .claude/commands/pr-review.md              | 16 ++++++++++++++++
 .claude/commands/testing/gen-unit-tests.md | 11 +++++++++++
 .claude/commands/triage-stacktrace.md      | 11 +++++++++++
 docs/LESSONS_LEARNED.md                    |  8 ++++++++
 7 files changed, 77 insertions(+)
```

**Step 4: Onboarding checklist**
```markdown
- [ ] Read CLAUDE.md (team conventions)
- [ ] Run `/help` to see the team's custom commands
- [ ] Read docs/LESSONS_LEARNED.md
- [ ] Shadow a teammate using Claude Code for one real task
- [ ] First PR with Claude, flagged for mentorship review
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Turn a repeated prompt into a committed command

**Goal**: Move one prompt you retype often into the library.

**Instructions**:
1. Pick your most-repeated Claude Code request.
2. Write it as `.claude/commands/<category>/<name>.md` with frontmatter.
3. Invoke it once with `/category:name`, confirm the output.
4. Commit it.

<details>
<summary>💡 Hint</summary>
If the prompt is a genuine one-off (a specific error you're pasting once), it doesn't belong in
the library — see Module 15.2's naming rule.
</details>

### Exercise 2: Write a lessons-learned entry

**Goal**: Document a real mistake so it isn't repeated.

**Instructions**:
1. Pick a real Claude Code mistake (yours or your team's).
2. Fill in: What happened? Root cause? Prevention? What got updated?
3. If the fix is a new command or a CLAUDE.md line, link it from the entry.

<details>
<summary>✅ Solution</summary>

```markdown
## 2026-09-20: Migration script dropped a column
**What happened**: Claude generated a migration that dropped an unused-looking column still read
by a reporting job.
**Root cause**: the prompt didn't say "preserve existing data."
**Prevention**: added "Always preserve existing data unless asked to remove it" to CLAUDE.md.
**Updated**: `.claude/commands/db/migration.md` now includes that line by default.
```
</details>

---

## 5. CHEAT SHEET

| Knowledge type | Real destination |
|------|-------------|
| Prompt worth reusing | `.claude/commands/<category>/<name>.md` |
| Checklist with supporting files | `.claude/skills/<name>/SKILL.md` |
| Pattern for every session | CLAUDE.md |
| Mistake worth preventing | `docs/LESSONS_LEARNED.md` |
| Library shared across repos | Plugin + internal marketplace (15.4, 15.5) |

### Sharing rituals

| When | What |
|------|------|
| Weekly | One tip in the team channel |
| Sprint retro | What broke, what got added to the library |
| Monthly | Review CLAUDE.md and the command library together |
| Onboarding | `/help`, `LESSONS_LEARNED.md`, shadow a teammate |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| `docs/prompts/*.md` nobody runs | `.claude/commands/` or `.claude/skills/` — real, invocable, versioned |
| "Think carefully about…" as a magic prefix | Extended thinking is a real mechanism (`/effort`, `Option+T`) — Module 6.1 |
| Knowledge stays in individual heads | A command file anyone can `git blame` |
| Lessons learned but nobody updates CLAUDE.md or a command | Every entry ends with a concrete file change |
| Sharing overload (daily noise) | One curated tip a week, not a dump |
| Library only helps this one repo | Package it as a plugin for cross-repo sharing (15.4/15.5) |

---

## 7. REAL CASE — Production Story

**Scenario**: A 12-person startup adopted Claude Code. The first few months were chaotic — the
same mistakes came back, and a couple of developers kept their best prompts to themselves instead
of sharing them.

**Fix**: They moved their prompt notes into `.claude/commands/`, organized by category, and
started `docs/LESSONS_LEARNED.md` after an incident that looked exactly like one from a few weeks
earlier. Both files live in the same repo as the code, so they show up in the same pull requests
and the same `git log`.

**Result**: New hires read `docs/LESSONS_LEARNED.md` and run `/help` on day one instead of asking
around for "the good prompts." The team lead's comment: "the library isn't a side document anymore
— it's just part of the codebase, so it gets maintained like the codebase."

---

> **Next**: [Module 10.5: Governance & Policy](../05-governance-policy/) →
