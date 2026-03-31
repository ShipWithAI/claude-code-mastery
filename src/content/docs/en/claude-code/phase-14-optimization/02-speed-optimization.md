---
title: 'Speed Optimization'
description: 'Reduce Claude Code response time with speed optimization techniques and understand quality tradeoffs.'
---

# Module 14.2: Speed Optimization

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 14.1 (Task Optimization)
>
> **Outcome**: After this module, you will know techniques to reduce Claude Code response time, understand speed/quality tradeoffs, and optimize for different scenarios.

---

## 1. WHY — Why This Matters

You're waiting. Claude is "thinking" for 2 minutes on what should be a simple task. Or worse, it's been 5 minutes and you're not sure if it's stuck or working. Time adds up — 10 slow tasks per day × 3 extra minutes each = 30 minutes wasted daily.

Speed optimization gives you back that time. Clear prompts, clean context, right model choice — these compound into significant productivity gains.

---

## 2. CONCEPT — Core Ideas

### Speed Factors

| Factor | Slow | Fast |
|--------|------|------|
| **Prompt** | Vague, ambiguous | Clear, specific |
| **Context** | 100K tokens | 10K tokens |
| **Task** | Complex, multi-step | Focused, single |
| **Model** | Opus (smartest) | Haiku (fastest) |
| **Output** | Long explanation | Just code |

### The Speed Formula

```text
Response Time = f(Context Size, Task Complexity, Output Length, Model)

Optimize each:
- Context: /clear frequently, exclude irrelevant files
- Complexity: Break into simpler tasks (Module 14.1)
- Output: "Code only, no explanation"
- Model: Use fastest model that works
```

### Context Management for Speed

```text
Heavy context:                 Light context:
─────────────────────────────────────────────────
50 files loaded               3 relevant files
Full conversation history     Fresh session
All project documentation     Just what's needed
                    ↓                    ↓
Result: 60 sec response       Result: 10 sec response
```

### Model Selection Strategy

```text
Task Complexity → Model Choice
────────────────────────────────────────────────
Simple (format, small edit)   → Haiku (fastest)
Medium (implement feature)    → Sonnet (balanced)
Complex (architecture, debug) → Opus (smartest)
```

### Output Optimization

- **"Code only, no explanation"** — saves output generation time
- **"One file at a time"** — faster than multiple files
- **"Diff format"** — faster than full file rewrite

### Detailed Model Comparison by Task Type

Beyond general speed, different models excel at different task types:

| Task Category | Haiku | Sonnet | Opus | Recommendation |
|---------------|-------|--------|------|----------------|
| **Formatting/Linting** | Excellent | Overkill | Overkill | Haiku — speed matters most, quality sufficient |
| **Simple CRUD** | Good | Excellent | Overkill | Sonnet — needs pattern understanding |
| **Complex Feature** | Poor | Good | Excellent | Opus — requires architectural reasoning |
| **Bug Fixing** | Simple bugs | Most bugs | Complex bugs | Match model to bug complexity |
| **Code Review** | Style issues | Logic issues | Architecture issues | Match model to review depth needed |
| **Test Generation** | Basic tests | Thorough tests | Edge case tests | Sonnet for most, Opus for critical paths |
| **Documentation** | Good | Excellent | Overkill | Sonnet — needs context understanding |
| **Refactoring** | Rename/move | Restructure | Architectural | Match model to refactoring scope |

### Speed vs Quality vs Cost at a Glance

```text
         Speed                Quality              Cost
Haiku:   ██████████  10/10    ████░░░░░░  4/10     █░░░░░░░░░  1/10
Sonnet:  ██████░░░░   6/10    ████████░░  8/10     ████░░░░░░  4/10
Opus:    ███░░░░░░░   3/10    ██████████ 10/10     ████████░░  8/10
```

**Rule of thumb**: Default to **Sonnet** for daily work. Drop to **Haiku** for batch operations and simple tasks. Escalate to **Opus** only when Sonnet's output quality is insufficient for the specific task. One Vietnamese startup reduced Claude costs from $1,200 to $380/month by following this approach.

---

## 3. DEMO — Step by Step

**Scenario**: Implement utility functions (string helpers).

### Slow Approach

```text
[Session with 50K context from previous work]

You: Create utility functions for our app. We need string helpers,
date formatters, and validators. Explain each function and
add comprehensive documentation.

Claude: [Thinking... 90 seconds]
[Long response with explanations, 200+ lines]

Total time: ~3 minutes
```

### Fast Approach

```bash
$ claude
# Fresh session, clean context
```

```text
You: Create src/utils/strings.ts with these functions:
- capitalize(str): Capitalize first letter
- slugify(str): Convert to URL slug
- truncate(str, len): Truncate with ellipsis

Code only, no explanation.

Claude: [Thinking... 15 seconds]
```

```typescript
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '...' : str;
}
```

**Total time: ~20 seconds**

### Speed Comparison

| Metric | Slow | Fast |
|--------|------|------|
| Time | 3 minutes | 20 seconds |
| Speedup | - | **9x faster** |

**What changed**:
- Fresh context (no 50K baggage)
- Specific scope (one file, three functions)
- "Code only" (no explanation overhead)
- Clear requirements (exact function signatures)

### Parallel Execution

```bash
# Run three independent tasks simultaneously
claude -p "Create src/utils/strings.ts: capitalize, slugify" &
claude -p "Create src/utils/dates.ts: formatDate, parseDate" &
claude -p "Create src/utils/validators.ts: isEmail, isURL" &
wait

# Total: ~25 seconds (instead of 75 seconds sequential)
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Context Diet

**Goal**: Experience the impact of context size.

**Instructions**:
1. Note your current context size
2. Use `/clear` and reload only essential files
3. Run the same task
4. Compare response times

<details>
<summary>💡 Hint</summary>

The `/cost` command shows token usage. Compare before and after `/clear`.

</details>

<details>
<summary>✅ Solution</summary>

Typical results:
- Heavy context (50K tokens): 45-90 second responses
- Light context (5K tokens): 10-20 second responses
- Speedup: 3-5x faster with clean context

</details>

### Exercise 2: Output Trimming

**Goal**: Measure the impact of output length.

**Instructions**:
1. Ask Claude to implement something with full explanation
2. Time it
3. Ask the same thing with "code only, no explanation"
4. Compare times

<details>
<summary>💡 Hint</summary>

Output generation takes time. Less output = faster response.

</details>

<details>
<summary>✅ Solution</summary>

Typical results:
- With explanation: 30-60 seconds, 100+ lines output
- Code only: 10-20 seconds, 20 lines output
- Speedup: 2-3x faster

</details>

### Exercise 3: Model Comparison

**Goal**: Understand model speed/quality tradeoffs.

**Instructions**:
1. Pick a medium-complexity task
2. Try with different models if available
3. Compare: time, quality, appropriateness

<details>
<summary>💡 Hint</summary>

Haiku is fastest but may miss nuance. Opus is smartest but slower. Sonnet balances both.

</details>

<details>
<summary>✅ Solution</summary>

For simple formatting: Haiku (fast, sufficient quality)
For feature implementation: Sonnet (balanced)
For complex debugging: Opus (worth the wait)

Match model to task complexity.

</details>

---

## 5. CHEAT SHEET

### Speed Techniques

```text
# Fresh context
/clear

# Minimal output
"Code only, no explanation"
"Just the function, no tests"
"Diff format only"

# Focused scope
"Only modify [file]"
"Just the [component]"
```

### Model Selection

| Task Type | Model | Why |
|-----------|-------|-----|
| Simple edits | Haiku | Fastest |
| Features | Sonnet | Balanced |
| Complex debug | Opus | Smartest |

### Parallel Execution

```bash
claude -p "task 1" &
claude -p "task 2" &
wait
```

### Context Management

- `/clear` between unrelated tasks
- Load only files you're working on
- Exclude node_modules, build artifacts

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Never clearing context | `/clear` for fresh starts |
| Always using Opus | Match model to task complexity |
| Asking for explanations you won't read | "Code only" for speed |
| Loading entire codebase | Load only relevant files |
| Sequential tasks that could be parallel | Use multiple sessions |
| Optimizing prematurely | Get it working first, then speed up |
| Sacrificing quality for speed | Speed should maintain quality |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese agency had developers complaining Claude was "too slow" — 2-3 minute response times making it unusable for quick tasks.

**Audit Findings**:
- Average context: 80K tokens (accumulated over days)
- Asking for explanations on every task
- Using Opus for simple formatting
- Never using `/clear`

**Speed Optimization Protocol**:

| Change | Before | After |
|--------|--------|-------|
| Daily fresh session | Never | Every morning |
| Context clearing | Never | Between projects |
| Output style | With explanation | Code only (default) |
| Model matching | Always Opus | Task-appropriate |

**Results**:
- Average response: 2.5 min → 30 sec (5x faster)
- Developer satisfaction: "Claude feels snappy now"
- No quality reduction

**Quote**: "We were making Claude carry an 80K token backpack everywhere. No wonder it was slow. Traveling light made all the difference."

---

> **Next**: [Module 14.3: Quality Optimization](../03-quality-optimization/) →
