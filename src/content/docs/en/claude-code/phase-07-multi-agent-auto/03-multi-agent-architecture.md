---
title: 'Multi-Agent Architecture'
description: 'Map the orchestrator, pipeline and specialist patterns onto native subagents and experimental agent teams.'
verified: 2026-09-22
claude_version: 2.1.278
---

# Module 7.3: Multi-Agent Architecture

> **Estimated time**: ~40 minutes
>
> **Prerequisite**: Module 7.2 (Full Auto Workflow)
>
> **Outcome**: After this module, you will be able to define a **subagent** in
> `.claude/agents/<name>.md`, invoke it by name, run several in parallel, and decide when an
> **agent team** earns its token cost.

---

## 1. WHY — Why This Matters

By hour three of a big feature, Claude is quoting decisions you reverted and the context is full
of test output nobody will read again. The fix isn't a bigger window, it's more windows:
**subagents** run in their own context and hand back a summary; **agent teams** are separate
sessions with a shared task list and messaging.

---

## 2. CONCEPT — Core Ideas

### Workflows vs agents (S5)

Anthropic separates *workflows* (code decides what runs next) from *agents* (the model does). Its
five building blocks map onto our three patterns:

| Course pattern | Anthropic pattern | Claude Code mechanism |
|---|---|---|
| **Orchestrator-Worker** | orchestrator-workers / parallelization | Parallel subagents, each returning a summary |
| **Pipeline** | prompt chaining | Chained subagents ("use A, then use B on A's output"); at scale, Dynamic Workflows, covered later |
| **Specialist Team** | evaluator-optimizer | Agent team: named teammates messaging each other, claiming tasks |

```mermaid
graph TD
    M[Main session] -->|Agent tool| S1["Subagent A<br/>own context, own tools"]
    M -->|Agent tool| S2["Subagent B"]
    S1 -->|summary ~1-2K tokens| M
    S2 -->|summary| M
    M -.->|CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1| T["Team lead"]
    T --> A["@reviewer"]
    T --> B["@tester"]
    A <-->|SendMessage| B
    A --> L[(Shared task list)]
    B --> L
```

A subagent should return roughly **1,000–2,000 tokens** (S6), not its transcript — that is how
delegation protects the main context.

### Subagents

A subagent is a Markdown file with YAML frontmatter; the body is its system prompt. It lives in
`.claude/agents/` (project), `~/.claude/agents/` (all projects), or `--agents '{…}'` (one
session). Only `name` and `description` are required.

| Field | Purpose |
|---|---|
| `name`, `description` | Identity; `description` tells Claude when to delegate |
| `tools` | `Read, Grep, Bash` or a YAML list; omitted, it inherits every tool available to subagents |
| `model` | `sonnet`, `opus`, `haiku`, `fable`, a full ID, or `inherit` |
| `permissionMode` | Applies when the main session is `default`, `dontAsk` or `plan`; ignored under `acceptEdits`/`auto`/`bypass` |
| `maxTurns` | Stops the subagent; its output is marked partial |
| `skills`, `memory`, `isolation: worktree` | Preloaded skills; memory (`user`/`project`/`local`); own git worktree |

Built-ins: **Explore** (read-only search), **Plan** (plan-mode research), **general-purpose**
(everything). `/agents` prints a reminder, not a wizard. Invoke by name (*"Use the test-writer
subagent to …"*) or force it with `@"test-writer (agent)"`. A subagent starts fresh: system
prompt, task message, CLAUDE.md, git status — not your conversation.

### Agent teams

⚠️ **Experimental, disabled by default.** Enable with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
in your environment or the `env` block of `settings.json`; interactive sessions only. Per the
docs, a team beats subagents for *research and review*, *new modules or features*, *debugging
with competing hypotheses*, *cross-layer coordination* — and doesn't for *"sequential tasks,
same-file edits, or work with many dependencies"*, where *"a single session or subagents are more
effective."*

Cost decides. The costs page puts a team at *"approximately 7x more tokens than standard
sessions when teammates run in plan mode"* (S15); Anthropic's research system measured
multi-agent runs at ~15× a chat (S10). A teammate is a whole extra session: start with 3–5, one
file set each, shut them down when done.

> `(S5)`, `(S6)`, `(S10)`, `(S15)`: `docs/references/anthropic-sources.md`.

---

## 3. DEMO — Step by Step

Run in `~/cc-lab`; captures are trimmed.

**Step 1: Define a project subagent**

```bash
# docs: sub-agents#write-subagent-files
mkdir -p .claude/agents && cat > .claude/agents/test-writer.md << 'EOF'
---
name: test-writer
description: Writes node:test unit tests for a given source file. Use when asked to add or extend tests.
tools: Read, Write, Bash
model: sonnet
---
You are a test writer. Read the source file you are given, write or extend
tests in tests/ using node:test and node:assert/strict, run `npm test`, and
report only the test names and the pass/fail counts.
EOF
```

Why: `tools` is the fence: no `Edit`, no `WebFetch`.

**Step 2: Invoke it by name (Orchestrator-Worker, one worker)**

```bash
# docs: sub-agents#invoke-subagents-explicitly
claude --permission-mode acceptEdits
```

Prompt: `Use the test-writer subagent to add three tests for src/math.js`

```text
# Output may vary
⏺ test-writer(Add three tests for math.js)
  ⎿  Backgrounded agent (↓ to manage · ctrl+o to expand)
⏺ The test-writer subagent is running. It's extending tests/math.test.mjs with three new tests …
✻ Waiting for 1 background agent to finish
 Bash command · from the test-writer agent
   npm test -- tests/math.test.mjs 2>&1 | tail -30
 Do you want to proceed?
 ❯ 1. Yes
   2. Yes, and don’t ask again for: npm test *
   3. Yes, and switch to auto mode · auto mode handles these prompts for you
   4. No
⏺ Agent "Add three tests for math.js" finished · 37s
```

The row `test-writer(…)` proves delegation; its Bash prompt surfaces in *your* session, named.
`acceptEdits` covers the subagent's `Write`, not its `npm test`. Afterwards:

```bash
git diff --stat && npm test 2>&1 | grep -E '^# (pass|fail)'
```

```text
# Output may vary
 tests/math.test.mjs | 5 ++++-
 1 file changed, 4 insertions(+), 1 deletion(-)
# pass 4
# fail 0
```

**Step 3: `/agents` — a reminder, not a list**

```text
# Output may vary
❯ /agents
  ⎿  The /agents wizard has been removed.
     Ask Claude to create or update subagents for you (e.g. "create a code-reviewer subagent that ..."),
     or edit the files directly:
       • .claude/agents/       (this project)
       • ~/.claude/agents/     (all projects)
```

`/tasks` lists running and finished subagents.

**Step 4: Two subagents in parallel (Orchestrator-Worker)**

```bash
# docs: sub-agents#run-parallel-research
claude --permission-mode default
```

Prompt: `Use two subagents in parallel: one lists every exported function in src/, the other
lists every TODO comment in the repo. Report both lists.`

The session is in `default`, so expect prompts: a background subagent reaching for Bash surfaces
its request in *your* session, named.

```text
# Output may vary
⏺ 2 background agents launched (↓ to manage)
   ├ List exported functions in src/
   └ List TODO comments in repo
✻ Waiting for 2 background agents to finish
⏺ Agent "List exported functions in src/" finished · 1m 1s
  The first subagent finished: src/ has two exported functions, both in src/math.js. …
```

Both launched as background Explore agents. The first returned its summary: two lines, not a file
listing. The second never finished — its `grep` needed an approval in the main session. Approve,
switch mode, or pre-approve with `permissions.allow`.

**Step 5: An agent team (Specialist Team)**

Teams are enabled here via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in `~/.claude/settings.json`.

```bash
# docs: agent-teams#start-your-first-agent-team
claude --permission-mode default
```

Prompt: `Spawn two teammates named reviewer and tester. reviewer reads src/math.js and lists 3
edge cases; tester reads tests/math.test.mjs and lists 3 missing tests. Each reports back in
bullets, then ask both to shut down and summarize.`

```text
# Output may vary
⏺ 2 background agents launched (↓ to manage)
   ├ @reviewer
   └ @tester
› Message from @reviewer (ctrl+o to expand)
⏺ Teammate @reviewer finished
› Message from @tester (ctrl+o to expand)
⏺ Both reports are in. Sending shutdown requests to both.
⏺ Shutdown requests sent to both teammates. Here's the summary:
  reviewer — 3 edge cases in src/math.js
  - divide by zero — divide(1, 0) → Infinity, divide(-1, 0) → -Infinity, divide(0, 0) → NaN; …
  tester — 3 missing tests in tests/math.test.mjs
  - divide happy path — divide is exported but never imported or tested at all …
  Overlap worth acting on: both flagged divide(x, 0) … No files were modified by either teammate.
```

Teammates answer to `@reviewer`/`@tester`, message the lead, and exit on a shutdown request.
Clean up with `rm -rf .claude/agents && git checkout -- tests`.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: A read-only reviewer

**Goal**: Define `security-reviewer` that can look but never edit.
**Instructions**: create `.claude/agents/security-reviewer.md` with `tools: Read, Grep, Glob` and
`model: sonnet`, then ask `Use the security-reviewer subagent to review src/`.
**Expected result**: findings listed; `git status` unchanged.

<details>
<summary>✅ Solution</summary>

```markdown
---
name: security-reviewer
description: Read-only security review of source files. Use before merging.
tools: Read, Grep, Glob
model: sonnet
---
Review the files you are given for injection, secrets and unsafe defaults.
Report each finding as: severity, file:line, one-sentence fix. Never edit files.
```

Without `Edit`/`Write` in `tools` the agent cannot change anything — a fence, not a request.
</details>

### Exercise 2: Orchestrator with JSON summaries

**Goal**: Three subagents, one merged report.
**Instructions**: prompt `Use three subagents in parallel — exports, TODOs, test names. Each must
return a JSON object {"area": …, "items": […]} and nothing else. Merge them into one JSON array.`
Confirm three short objects came back, not transcripts.

<details>
<summary>✅ Solution</summary>
The subagent's *report* enters your context; a strict shape keeps it near the 1–2K target (S6).
</details>

### Exercise 3: Writer / Reviewer in two sessions (S1)

**Goal**: A review with fresh context, unbiased by the code it wrote.
**Instructions**:
1. Session A: `claude --permission-mode acceptEdits` →
   `Implement a clamp(x, lo, hi) function in src/math.js`.
2. Session B: `claude --worktree review --permission-mode default` → `Review the clamp
   implementation in @src/math.js. Look for edge cases and consistency with existing functions.`
3. Paste B's findings into A: `Here's the review feedback: […]. Address these issues.`

<details>
<summary>✅ Solution</summary>
B never saw A's reasoning, so it reviews the code, not the intent. `--worktree` lets B run tests
without disturbing A's tree.
</details>

---

## 5. CHEAT SHEET

| Command / Feature | Description | Example |
|---|---|---|
| `.claude/agents/<name>.md` · `~/.claude/agents/` | Project / personal subagent | `name`, `description`, `tools`, `model` |
| `--agents '{…}'` | Session-only subagents, as JSON | `claude --agents '{"reviewer": {"description": …, "prompt": …}}'` |
| `Use the <name> subagent to …` | Delegation, Claude's choice | — |
| `@"<name> (agent)"` | Force that subagent | `@"test-writer (agent)" cover src/math.js` |
| `--agent <name>` | Session runs as that subagent | `claude --agent security-reviewer` |
| Explore / Plan / general-purpose | Built-ins: read-only / plan research / everything | `Agent(Explore)` denies one |
| `/tasks` | Background work, running and done | — |
| `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` | Enable teams (experimental) | `env` in settings.json |
| `Spawn N teammates …` | Start a team; name them for `@name` | — |
| `Ask the <name> teammate to shut down` | Graceful teammate exit | — |
| `--teammate-mode` | `in-process` (default), `auto`, `tmux`, `iterm2` | split panes need tmux |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Bash loops of `claude -p` writing files, no permission flag | Native subagents, or `-p` with `--permission-mode acceptEdits` / `--allowedTools` |
| Treating agents as sealed boxes that only talk via files | Subagents return a summary; teammates share a task list and message each other |
| A team for a sequential, same-file change | Single session or chained subagents; each teammate costs a session's worth of tokens |
| Subagents that return whole transcripts | Ask for a short, structured report (~1–2K tokens) |
| `permissionMode: bypassPermissions` in a subagent | Ignored unless the main session bypasses; use `tools` as the fence |
| Two teammates editing one file | Give each its own files; the docs are blunt that sharing one leads to overwrites |

---

## 7. REAL CASE — Production Story

**Scenario**: A Vietnamese fintech team building payment reconciliation across six services and
two third-party APIs.

**Problem**: One long session degraded after three days: contracts drifted and tests referenced
endpoints that no longer existed.

**Solution**: The lead wrote `integration-contract.md` in a plan-mode session, then, with agent
teams enabled, spawned six teammates named after the services — each a `tools`-restricted
subagent definition with the contract as its spawn prompt — plus a read-only `contract-tester`.
Past the 3–5 starting band deliberately: one teammate per service boundary, no two sharing a
file. Review ran in a fresh `--worktree` session (Writer/Reviewer).

**Result**: The reconciliation layer shipped in a day with zero API mismatches. The seven agent
files stayed in `.claude/agents/` and now run as plain subagents when a team isn't worth it.

---

> **Next**: [Module 7.4: Agentic Loop Patterns](../04-agentic-loops/) →
