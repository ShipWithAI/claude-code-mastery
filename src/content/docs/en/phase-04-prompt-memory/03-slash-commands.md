---
title: 'Slash Commands'
description: 'Learn every Claude Code slash command for context management, session control, and efficient workflows.'
---

# Module 4.3: Slash Commands

> **Estimated time**: ~25 minutes
>
> **Prerequisite**: Module 4.2 (CLAUDE.md — Project Memory)
>
> **Outcome**: After this module, you will know every slash command available in Claude Code, when to use each one, and how they fit into efficient workflows — especially context management commands that are critical for long sessions.

---

## 1. WHY — Why This Matters

You're 45 minutes into a complex refactoring session. Claude's responses are getting slower. The context window is full. You need to compress the conversation history to keep working, but what's the command? Is it `/compact`? `/compress`? `/summarize`? You type `/help` and realize you've been using Claude Code for months but only know 2-3 commands. You're flying blind through a feature-rich system. Most developers never learn the full command set and waste hours restarting sessions or working with degraded performance. This module gives you the complete picture — every verified slash command, when to use it, and how they fit together into efficient workflows.

---

## 2. CONCEPT — Core Ideas

### What Are Slash Commands?

**Slash commands** are built-in commands that start with `/` and control Claude Code's behavior during a session. Unlike your regular prompts (which ask Claude to do work), slash commands change the session state, display information, or trigger system-level actions.

Think of them as the control panel for your AI session. Regular prompts are what you want built. Slash commands are how you maintain the building environment.

### Command Categories

Claude Code's slash commands fall into three main categories:

| Category | Purpose | Commands |
|----------|---------|----------|
| **Context Management** | Control conversation history and memory | `/compact`, `/clear`, `/context` |
| **Information** | Inspect session state and costs | `/help`, `/cost`, `/status`, `/stats` |
| **Project Setup** | Initialize project-specific configuration | `/init`, `/memory`, `/add-dir` |
| **Model & Config** | Switch models and settings | `/model`, `/config`, `/theme`, `/statusline`, `/vim` |
| **Session Management** | Navigate and manage sessions | `/resume`, `/rename`, `/export`, `/copy` |
| **Diagnostics** | Troubleshoot and report issues | `/doctor`, `/bug`, `/debug` |

### The Decision Tree

When should you use each command? Here's the mental model:

```mermaid
graph TD
    A[Problem?] --> B{Session feels slow?}
    A --> C{Starting new topic?}
    A --> D{Want to check spending?}
    A --> E{New project setup?}
    A --> F{Forgot what commands exist?}

    B -->|Yes| G[/compact]
    C -->|Yes, unrelated to current work| H[/clear]
    D -->|Yes| I[/cost]
    E -->|Yes| J[/init]
    F -->|Yes| K[/help]

    G --> L[Continue working with freed context]
    H --> M[Fresh start, all context erased]
    I --> N[Review usage, decide if need /compact]
    J --> O[CLAUDE.md created, configure project]
    K --> P[See all available commands]
```

### The /compact Lifecycle (Most Important)

The `/compact` command is your most critical tool for long sessions. Here's how it works:

**What it does:**
- Summarizes the conversation history up to this point
- Compresses verbose exchanges into concise summaries
- Frees up context window space for new work
- Preserves key decisions, architectural choices, and important code snippets

**When to use it:**
- Every 30-40 minutes in active sessions
- Before starting a new sub-task within the same project
- When you notice responses becoming less precise or slower
- When `/cost` shows you're approaching token limits

**What it preserves vs. summarizes:**
- ✅ Preserves: Recent decisions, active file contents, key architectural choices
- 📝 Summarizes: Step-by-step implementation details, verbose explanations, redundant exchanges
- ⚠️ May lose: Exact wording of earlier code snippets, nuanced reasoning from early in session

**Pro tip:** `/compact` is not destructive — it's more like "save and compress" than "delete". Use it liberally. The only downside is losing some verbatim detail from earlier exchanges.

### Custom Slash Commands

Claude Code supports custom slash commands via Markdown files in the `.claude/commands/` directory:

**Project-level commands** (shared with team via git):
```
.claude/commands/review.md     → appears as /project:review
.claude/commands/test.md       → appears as /project:test
```

**Global commands** (available in all projects):
```
~/.claude/commands/my-prompt.md  → appears as /user:my-prompt
```

**Example:** Create a reusable code review command:

```markdown
<!-- .claude/commands/review.md -->
Review the current changes with focus on:
1. Security vulnerabilities
2. Performance bottlenecks
3. Error handling completeness
4. Test coverage gaps

Use the project's coding conventions from CLAUDE.md.
```

Now type `/project:review` in any REPL session to invoke it. Custom commands can also use the `$ARGUMENTS` placeholder to accept parameters.

---

## 3. DEMO — Step by Step

Let's walk through a realistic long coding session using every verified slash command.

**Scenario:** You're building a new REST API service. This is your first time working on this project, and you expect the session to run 60+ minutes.

---

**Step 1: Start session and check available commands**

```bash
$ claude
```

You're in the session. First, see what's available:

```
/help
```

Expected output:
```
Available commands:
  /help     - Show this help message
  /compact  - Compress conversation history to free context space
  /clear    - Clear all conversation history and start fresh
  /cost     - Show token usage and estimated cost for this session
  /init     - Initialize CLAUDE.md for current project

Type a command or describe what you want to build.
```

**Why this matters:** You now have a reference. Bookmark this mentally — `/help` is your lifeline when you forget syntax.

---

**Step 2: Initialize project configuration**

You're starting fresh on a new project. Set up project memory:

```
/init
```

Expected output:
```
Creating CLAUDE.md in current directory...

I've created a starter CLAUDE.md file. Let me open it so we can configure
it for your project.

[CLAUDE.md opens with template content]

What kind of project is this? I'll help you customize the configuration.
```

**Why this matters:** You're setting up project-specific context early. Claude will now remember your stack, conventions, and constraints across sessions.

---

**Step 3: Work for 20 minutes, then check token usage**

You've implemented the first two API endpoints. Time to check cost:

```
/cost
```

Expected output:
```
Session Token Usage:
  Input tokens:  12,847
  Output tokens:  8,392
  Total tokens:  21,239

Estimated cost: $0.18
Context window: ~21% full

💡 Tip: Context is healthy. Continue working normally.
```

**Why this matters:** You now know your burn rate. You're fine to continue without compacting yet.

---

**Step 4: Work another 20 minutes, quality feels degraded — compress context**

You're 40 minutes in. Responses feel slightly less precise. Check cost again, then compact:

```
/cost
```

Expected output:
```
Session Token Usage:
  Input tokens:  38,291
  Output tokens: 24,103
  Total tokens:  62,394

Estimated cost: $0.52
Context window: ~62% full

⚠️ Consider using /compact to free context space.
```

Now compact:

```
/compact
```

Expected output:
```
Compacting conversation history...

✓ Compressed 62,394 tokens → 18,203 tokens (71% reduction)
✓ Preserved:
  - Current CLAUDE.md configuration
  - API endpoint implementations (users, products)
  - Database schema decisions
  - Error handling patterns

You can continue working. Context window freed.
```

**Why this matters:** You just got ~44k tokens back. You can work another 30-40 minutes before needing to compact again.

---

**Step 5: Finish API work, switch to completely different task — clear context**

The API is done. Now you need to work on a React dashboard (totally different codebase). Clear everything:

```
/clear
```

Expected output:
```
Are you sure you want to clear all conversation history? This cannot be undone.
Type 'yes' to confirm, or anything else to cancel.
```

```
yes
```

Expected output:
```
✓ Conversation history cleared.
✓ Context window reset.

Starting fresh. What would you like to work on?
```

**Why this matters:** You've completely reset. No API context will bleed into your dashboard work. Clean mental slate for both you and Claude.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Session Marathon

**Goal:** Experience the full lifecycle of context management in a long session.

**Instructions:**
1. Start a new Claude session
2. Pick a meaty task (multi-file refactoring, new feature, bug investigation)
3. Work for 10 minutes, then run `/cost` — note the token count
4. Work another 10 minutes, run `/cost` again — observe growth rate
5. Continue working until `/cost` warns you or responses feel slower
6. Run `/compact` and note the token reduction
7. Continue working for another 20 minutes
8. Run `/cost` one final time — compare to pre-compact numbers

**Expected result:**
- You should see token reduction of 60-80% after `/compact`
- Responses should feel crisper after compacting
- You should develop an intuition for when compaction is needed (the "sluggish" feeling)

<details>
<summary>💡 Hint</summary>

Most developers wait too long to compact. If you're doing complex work, compact every 30 minutes even if responses still feel OK — it's preventative maintenance.

</details>

<details>
<summary>✅ Solution</summary>

There's no single "correct" answer here — the goal is to internalize the rhythm. But here's a typical pattern:

- 0-10 min: ~8k tokens
- 10-20 min: ~18k tokens (growth rate high, lots of code generation)
- 20-30 min: ~32k tokens (context warning threshold on some models)
- After `/compact`: ~12k tokens (preserves recent work, summarizes early exploration)
- 30-50 min post-compact: ~28k tokens
- **Key insight:** Without compacting, you'd have hit limits around 35 minutes. With compacting, you can work 60+ minutes continuously.

</details>

---

### Exercise 2: Fresh Start Protocol

**Goal:** Understand the difference between `/compact` (summarize) and `/clear` (reset).

**Instructions:**
1. Start a session, implement a small feature (e.g., validation function)
2. Run `/compact`
3. Ask Claude "What did we just build?" — note the response
4. Now run `/clear` and confirm
5. Ask Claude "What did we just build?" again

**Expected result:**
- After `/compact`: Claude remembers the validation function (summarized)
- After `/clear`: Claude has no idea, context fully reset

<details>
<summary>💡 Hint</summary>

Use `/compact` when switching sub-tasks within the same project. Use `/clear` only when switching to a completely unrelated project or when you want to eliminate all prior context (rare).

</details>

<details>
<summary>✅ Solution</summary>

**After /compact:**
```
You: What did we just build?

Claude: We implemented an email validation function with regex pattern matching,
custom error messages, and edge case handling for plus-addressing and
internationalized domains.
```

**After /clear:**
```
You: What did we just build?

Claude: I don't have any context about what we built previously. The conversation
history was cleared. What would you like to work on?
```

This demonstrates that `/compact` is lossy summarization, while `/clear` is total amnesia.

</details>

---

## 5. CHEAT SHEET

### All Verified Commands

#### Context & Memory

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `/help` | List all available slash commands | When you forget syntax |
| `/compact` | Compress conversation history | Every 30-40 min, or when responses degrade |
| `/compact [focus]` | Compact with instruction to preserve specific context | `/compact Preserve the auth decisions and API list` |
| `/clear` | Erase ALL conversation history | Switching to unrelated project |
| `/cost` | Show token usage and estimated cost | Every 20-30 min to track spending |
| `/init` | Initialize CLAUDE.md for project | First time on a new project |
| `/memory` | Edit CLAUDE.md memory files | Update project memory mid-session |
| `/context` | Show visual context usage grid | See exactly how full your context window is |
| `/add-dir` | Add directories to working context | Expand the files Claude can see |

#### Model & Configuration

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `/model` | Switch AI model; use arrows to adjust effort | Change between Haiku/Sonnet/Opus mid-session |
| `/config` | Open settings interface | Adjust session or global settings |
| `/permissions` | View/update tool permissions | Check or change what tools are allowed |
| `/theme` | Change color theme | Customize appearance |
| `/statusline` | Configure status line UI | Customize bottom status bar |
| `/vim` | Enable/configure vim mode | For vim users |
| `/terminal-setup` | Install terminal keybindings | Enable Shift+Enter for multi-line input |

#### Session Management

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `/resume` | Resume session or show picker | Return to a previous conversation |
| `/rename <name>` | Rename current session | Give meaningful names to important sessions |
| `/rewind` | Rewind conversation/code changes | Undo recent messages |
| `/export [file]` | Export conversation to file/clipboard | Save session for documentation |
| `/copy` | Copy last assistant response | Quick copy to clipboard |
| `/tasks` | List/manage background tasks | Monitor parallel operations |
| `/todos` | List current TODO items | Check pending items |

#### Diagnostics

| Command | What It Does | When to Use |
|---------|--------------|-------------|
| `/status` | Show version, model, account info | Quick session overview |
| `/stats` | Show daily usage and streaks | Track your productivity |
| `/doctor` | Check installation health | Diagnose setup issues |
| `/bug` | Report a bug | Send feedback to Anthropic |
| `/debug` | Troubleshoot session with debug log | Investigate session problems |

### Pro Combos

Combine commands for powerful workflows:

| Combo | Workflow | Use Case |
|-------|----------|----------|
| `/cost` → `/compact` | Check token usage, then compress if needed | Preventative maintenance every 30 min |
| `/clear` → `/init` → work | Full reset, configure new project, start fresh | Switching projects mid-day |
| `/compact` → continue → `/cost` | Compact, work more, verify token reduction | Long sessions (60+ min) |
| `/help` → try command → `/cost` | Learn new command, test it, check impact | Experimentation mode |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Using `/clear` when you meant `/compact` — losing all context when you just needed compression | Use `/clear` ONLY for unrelated new projects. Use `/compact` for same-project sub-tasks. |
| Never compacting until context is 100% full and responses are slow | Compact proactively every 30-40 min. It's free, fast, and prevents degradation. |
| Never checking `/cost` until the end of session | Run `/cost` every 20-30 min. Develop intuition for token burn rate. Catch expensive patterns early. |
| Assuming `/compact` keeps verbatim code from 30 minutes ago | `/compact` summarizes. If you need exact code, save it to a file or CLAUDE.md before compacting. |
| Using `/clear` for every sub-task (e.g., after implementing each function) | `/clear` destroys context. Only use it when switching to a COMPLETELY different project. For sub-tasks, just continue or use `/compact`. |
| Ignoring `/init` for new projects, then wondering why Claude forgets your stack across sessions | Always `/init` on new projects. CLAUDE.md is persistent memory. Slash commands are session memory. |

---

## 7. REAL CASE — Production Story

**Scenario:** A senior backend engineer at a Vietnamese fintech startup was refactoring a payment microservice — 8 hours of work touching 30+ files across authentication, transaction processing, and reconciliation logic.

**Problem:** Before learning slash commands, his workflow was brutal: work for 45 minutes, notice degraded responses, restart Claude entirely, re-explain context for 10 minutes, work another 45 minutes, repeat. Four forced restarts per day. He estimated he lost 90 minutes daily just to context resets.

**Solution:** After this module, he implemented a slash command discipline:
- `/init` at project start (CLAUDE.md captured service architecture)
- `/cost` every 20 minutes (set a timer)
- `/compact` every 40 minutes or when `/cost` showed >50% context usage
- `/clear` only when switching to a different service

**Result:**
- Zero forced restarts in an 8-hour session
- Token usage dropped 30% (compacting freed space, no redundant re-explanations)
- Subjective quality improvement: "Responses stayed sharp all day. The difference between sprinting with rest stops vs. running until you collapse."

His team now includes slash command discipline in their onboarding docs: "If you're not using `/compact` every 30 minutes, you're doing it wrong."

---

> **Next**: [Module 4.4: Memory System](../04-memory-system/) →
