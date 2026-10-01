---
title: 'Role-Specific Workflows'
description: 'Build a role kit — one command or skill, one subagent, an output style if it fits — for security, infra, ML, design, and legal work.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 16.2: Role-Specific Workflows

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 16.1 (Case Studies)
>
> **Outcome**: After this module, you will have a "role kit" — a real command or skill, a
> subagent, and an output style where it fits — built for your own role, using the same pattern
> Anthropic's own non-engineering and engineering teams use internally.

---

## 1. WHY — Why This Matters

A security engineer mid-incident needs a fast stack-trace trace, not a generic chat. A designer
feeding Figma files into Claude Code needs an autonomous build-test loop, not a one-line prompt.
A legal team member with no engineering background needs Claude to explain what it's doing, not
assume they already know. Generic advice ("use Claude Code for your role") wastes the two real
levers Claude Code gives you: a subagent with the right tools and system prompt, and a command or
skill that encodes the task so it's a `/name` away, not a paragraph you retype.

---

## 2. CONCEPT — Core Ideas

### A "role kit" has four parts

1. **A command or skill** — the repeatable task as a real file (Module 15.2/15.3).
2. **A subagent** — `.claude/agents/<role>.md`, scoped tools, its own system prompt (Module 7.3).
3. **An output style, if it fits** — `/output-style Learning` slows Claude down to explain each
   step; use it for a non-engineering reader, not for a power user who wants speed.
4. **A story with a number** — proof this isn't a hypothetical (§7).

### Five kits, mapped to real Anthropic-internal usage patterns (S2)

| Role | Command / skill | Subagent | Output style |
|---|---|---|---|
| Security Engineer | `/triage-stacktrace` | `incident-responder` | — |
| Data/Infra Engineer | `/diagnose-outage` (feed it dashboard screenshots) | `infra-debugger` | — |
| Inference/ML Engineer | `/explain-model-fn` | `ml-docs-explainer` | `Explanatory` |
| Product Designer | `/figma-to-component` (skill; feeds Figma exports) | `design-loop` | — |
| Legal / non-engineering | `/prototype-tool` | not needed — a command is enough | `Learning` |

None of these are built-in — pick names that don't collide with the built-in list (Module 15.2).

---

## 3. DEMO — Step by Step

Build and run the Security kit; the other four follow the identical pattern.

**Step 1: The command**
```markdown
---
description: Trace a pasted stack trace through this codebase and propose the root cause
argument-hint: [paste the stack trace after the command]
allowed-tools: Read, Grep, Glob
---
Stack trace:
$ARGUMENTS

Trace this stack trace through the codebase. Identify the exact `file:line` most likely
responsible, explain why in 2-3 sentences, and propose a minimal fix. Do not edit any files.
```
Save as `.claude/commands/triage-stacktrace.md`.

**Step 2: The subagent**
```markdown
---
name: incident-responder
description: Traces a stack trace or crash log through the codebase to find the likely root
  cause. Use during an active incident, or when triaging a bug report with an error trace.
tools: Read, Grep, Glob
model: sonnet
---
You are an incident-response specialist. Given a stack trace, trace it to the exact function and
line that introduced the bad value or bad call. Report the root-cause file:line, a one-paragraph
theory, and a minimal proposed fix. Do not speculate about files you have not read.
```
Save as `.claude/agents/incident-responder.md` (docs: `code.claude.com/docs/en/sub-agents` —
`name`/`description` required, `tools` scopes it to read-only).

**Step 3: Reproduce a crash and run the command**
```bash
node scripts/report.mjs
```
Expected output:
```text
# Output may vary
RangeError: Invalid array length
    at renderBar (file:///Users/you/cc-lab/scripts/report.mjs:4:10)
    at file:///Users/you/cc-lab/scripts/report.mjs:8:13
```

```bash
claude -p "/triage-stacktrace RangeError: Invalid array length
    at renderBar (scripts/report.mjs:4:10)
    at scripts/report.mjs:8:13" --allowedTools "Read,Grep,Glob"
```
Expected output (trimmed):
```text
# Output may vary
Root cause: `src/math.js:4`, triggered by `scripts/report.mjs:7`
Why: dividing by zero doesn't throw in JavaScript — `usage` becomes `Infinity`, and
`new Array(Math.round(Infinity))` throws `RangeError: Invalid array length` two calls later.

Proposed minimal fix: add a `whole === 0` check in `percentOf`, since that's where the bad
value comes from. I didn't edit any files.
```
The same fix works via natural language — "Use the incident-responder subagent to investigate
this crash" — without typing the command; Claude names the subagent it dispatched in the
transcript row (docs: `sub-agents.md`).

For a Product Designer's kit, the same loop closes with `claude --chrome` to open the rendered
component in a real browser tab and compare it against the Figma export — confirmed on
`cli-reference.md`, not a research-preview flag.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Build your own role kit

**Goal**: Ship a command + subagent pair for your actual daily task.

**Instructions**:
1. Pick the row closest to your role (or write your own).
2. Create the command file first, test it with `/name`.
3. Create the subagent, scope `tools` to only what that task needs.
4. Decide: does a non-power-user read this output? If yes, note `/output-style Learning` for them.

<details>
<summary>💡 Hint</summary>
Start the subagent's `tools` list narrow (`Read, Grep, Glob`) — add `Edit` or `Bash` only once
you've confirmed the read-only version gives useful output.
</details>

---

## 5. CHEAT SHEET

| Role | Command / skill | Subagent | Output style | Phases |
|---|---|---|---|---|
| Security | `/triage-stacktrace` | `incident-responder` | — | 8, 13 |
| Data/Infra | `/diagnose-outage` | `infra-debugger` | — | 5, 13 |
| Inference/ML | `/explain-model-fn` | `ml-docs-explainer` | `Explanatory` | 4, 15 |
| Product Design | `/figma-to-component` | `design-loop` | — | 5, 7 |
| Legal/non-eng | `/prototype-tool` | — | `Learning` | 15, 16 |

`claude --chrome` — verify a rendered UI directly in the browser (`cli-reference.md`).
`/output-style Learning` — case-sensitive; switches per-session, not per-command.

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| One generic subagent for every role | Scope `tools` per role — a reviewer doesn't need `Edit` |
| Assuming `--chrome` exists on any install | Confirm on your `cli-reference` docs/version first |
| `Learning` output style for every session | Reserve it for onboarding or non-engineering readers — it slows Claude down to explain steps |
| Handing a non-eng teammate a bare command | Pair the command with `/output-style Learning` or a one-line explainer |
| Copying a role kit verbatim from this table | The tool names are placeholders — build the command/subagent for your actual repo and task |

---

## 7. REAL CASE — Production Story

Five real internal-usage patterns, sourced (S2, Anthropic, 07/2025):

- **Security Engineering**: "During incidents, the Security Engineering team feeds Claude Code
  stack traces and documentation to trace control flow through the codebase. Problems that
  typically take 10-15 minutes of manual scanning now resolve 3x as quickly."
- **Data Infrastructure**: when Kubernetes stopped scheduling pods, the team "fed it dashboard
  screenshots, and Claude guided them menu-by-menu through Google Cloud's UI... saving them 20
  minutes of valuable time during a system outage."
- **Inference**: team members without ML backgrounds use Claude to explain model-specific
  functions — "What normally requires an hour of Google searching now takes 10-20 minutes—an 80%
  reduction in research time."
- **Product Design**: "would feed Figma design files to Claude Code and then set up autonomous
  loops where Claude Code writes the code for the new feature, runs tests, and iterates
  continuously."
- **Legal**: "created prototype 'phone tree' systems to help team members connect with the right
  lawyer at Anthropic, demonstrating how departments can build custom tools without traditional
  development resources."

---

> **Next**: [Module 16.3: Teaching & Workshop Design](../03-teaching-workshop/) →
