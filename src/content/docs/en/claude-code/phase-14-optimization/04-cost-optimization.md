---
title: 'Cost Optimization'
description: 'Track and reduce Claude Code costs with pricing strategies, token budgeting, and model selection tips.'
---

# Module 14.4: Cost Optimization

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 14.3 (Quality Optimization)
>
> **Outcome**: After this module, you will understand Claude Code pricing, know how to track and reduce costs, and make informed model/usage decisions.

---

## 1. WHY — Why This Matters

End of month, API bill is 3x what you expected. Where did it go? Turns out, one developer was using Opus for everything, another left sessions running with huge context. Costs add up fast.

Cost optimization gives you control. Know where tokens go. Choose the right model. Avoid waste. Make Claude Code sustainable — not a budget crisis waiting to happen.

---

## 2. CONCEPT — Core Ideas

### Cost Formula

```text
Cost = (Input Tokens × Input Price) + (Output Tokens × Output Price)

Prices vary by model:
- Opus: Most expensive (complex reasoning)
- Sonnet: Mid-tier (general coding)
- Haiku: Cheapest (simple tasks)
```

### Token Economics

⚠️ Pricing changes — verify current rates at anthropic.com

| Model | Input (per 1M) | Output (per 1M) | Best For |
|-------|----------------|-----------------|----------|
| Opus | ~$15 | ~$75 | Complex architecture |
| Sonnet | ~$3 | ~$15 | Daily coding |
| Haiku | ~$0.25 | ~$1.25 | Quick tasks |

### Cost Drivers

```text
High Cost:                    Low Cost:
─────────────────────────────────────────────────
Large context (80K+)          Fresh context
Opus for everything           Model matching
Long outputs                  Concise requests
Repeated similar queries      Caching/reuse
Debugging loops               Get it right first time
```

### The 80/20 Rule

80% of cost often comes from 20% of usage. Identify the expensive patterns first:
- Big context sessions
- Opus overuse
- Debug loops

### Cost vs Value Matrix

```text
High Value + Low Cost   → Maximize (Haiku for simple tasks)
High Value + High Cost  → Justify (Opus for architecture)
Low Value + Low Cost    → Ignore (minimal impact)
Low Value + High Cost   → Eliminate (wasteful patterns)
```

---

## 3. DEMO — Step by Step

**Scenario**: Team spending $500/month wants to reduce to $300 without losing productivity.

### Step 1: Audit Current Usage

```text
Cost Breakdown (sample month):

By Model:
- Opus:   $350 (70%) ← Red flag: overuse
- Sonnet: $120 (24%)
- Haiku:  $30 (6%)

By Activity:
- Code generation: $250
- Debugging: $150 ← Red flag: loops
- Code review: $70
- Documentation: $30
```

### Step 2: Identify Optimization Targets

| Problem | Current | Target | Action |
|---------|---------|--------|--------|
| Opus overuse | $350 | $150 | 60% of tasks → Sonnet |
| Debug loops | $150 | $50 | Better context, fewer attempts |
| Large context | - | -50% | Regular `/clear` |

### Step 3: Add Cost Guidelines to CLAUDE.md

```markdown
## Cost Guidelines

**Default model**: Sonnet
**Use Haiku for**: formatting, simple edits, quick questions
**Use Opus only for**: architecture decisions, complex debugging

**Before using Opus, ask**:
1. Is this truly complex reasoning?
2. Have I tried Sonnet first?
3. Is the value worth 5x the cost?

**Habits**:
- `/clear` between unrelated tasks
- "Code only" for implementation tasks
```

### Step 4: Model Selection in Practice

```text
Task: "Fix typo in README"
Before: Opus ($0.50) → After: Haiku ($0.02)
Savings: 96%

Task: "Implement CRUD endpoint"
Before: Opus ($2.00) → After: Sonnet ($0.40)
Savings: 80%

Task: "Design microservices architecture"
Before: Opus ($3.00) → After: Opus ($3.00)
Savings: 0% (but justified — appropriate use)
```

### Step 5: Results After 1 Month

| Model | Before | After | Change |
|-------|--------|-------|--------|
| Opus | $350 | $120 | -66% |
| Sonnet | $120 | $150 | +25% (shifted) |
| Haiku | $30 | $50 | +67% (shifted) |
| **Total** | **$500** | **$320** | **-36%** |

Productivity: Maintained. Quality: Maintained.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Cost Audit

**Goal**: Understand your current spending patterns.

**Instructions**:
1. Estimate your Claude Code usage this week
2. Break down by: model, task type, outcome
3. Identify: What could have used a cheaper model?
4. Calculate potential savings

<details>
<summary>💡 Hint</summary>

Track for 3 days: every time you use Claude, note the model and task type. Patterns emerge quickly.

</details>

<details>
<summary>✅ Solution</summary>

Common findings:
- 50%+ of Opus usage could be Sonnet
- Simple questions often sent to expensive models
- Debug sessions accumulate hidden costs

Typical savings potential: 30-50% with model matching alone.

</details>

### Exercise 2: Model Matching Guide

**Goal**: Create a personal quick-reference for model selection.

**Instructions**:
1. List 10 common tasks you do with Claude
2. Assign optimal model to each
3. Create a quick reference
4. Follow it for one week

<details>
<summary>💡 Hint</summary>

Most coding tasks work fine with Sonnet. Reserve Opus for true complexity.

</details>

<details>
<summary>✅ Solution</summary>

Example guide:
- Haiku: typos, formatting, boilerplate, simple questions
- Sonnet: features, debugging, review, docs
- Opus: architecture, security audit, novel problems

Post near your monitor for quick reference.

</details>

### Exercise 3: Cost Policy

**Goal**: Write cost guidelines for your team.

**Instructions**:
1. Draft cost guidelines for CLAUDE.md
2. Define when to use each model
3. Add `/clear` policy and output preferences
4. Share with team if applicable

<details>
<summary>💡 Hint</summary>

Keep it simple — 5-10 bullet points max. Complex policies get ignored.

</details>

<details>
<summary>✅ Solution</summary>

See the CLAUDE.md addition in Step 3 of the DEMO section — that's a production-ready template.

</details>

---

## 5. CHEAT SHEET

### Model Selection Guide

| Model | Cost | Use For |
|-------|------|---------|
| **Haiku** | $ | Formatting, typos, simple edits, quick questions |
| **Sonnet** | $$ | Features, debugging, code review, documentation |
| **Opus** | $$$ | Architecture, complex debugging, security, novel problems |

### Cost Reduction Tactics

```text
✓ Default to Sonnet, not Opus
✓ Use Haiku for simple tasks
✓ /clear between projects
✓ "Code only" for implementations
✓ Fix root cause (avoid debug loops)
```

### Tracking

- Review weekly usage
- Alert on unusual spikes
- Budget per project/developer

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Opus for everything | Match model to task complexity |
| Never using Haiku | Haiku for simple tasks (huge savings) |
| Not tracking costs | Regular audits and monitoring |
| Optimizing before understanding | Audit first, then optimize |
| Sacrificing quality for cost | Optimize waste, not value |
| Debug loops (5+ attempts) | Better prompt, better context |
| Ignoring context size | `/clear` reduces token cost |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese startup, 8 developers. Claude Code bill jumped from $400 to $1,200 in one month. CEO asked: "What happened?"

**Investigation**:
- 2 developers discovered Opus, used it for everything
- One developer had week-long session (150K context)
- Debug loops averaging 8 attempts per bug

**Cost Optimization Plan**:

| Week | Focus | Action |
|------|-------|--------|
| 1 | Awareness | Shared pricing: "Opus is 5x Sonnet cost" |
| 2 | Guidelines | Model selection guide in CLAUDE.md |
| 3 | Monitoring | Weekly cost review, per-developer breakdown |

**Results (next month)**:
- Cost: $1,200 → $380 (68% reduction)
- Productivity: Unchanged
- Quality: Unchanged

**Developer quote**: "I didn't realize Haiku could do 80% of what I was using Opus for."

**CEO quote**: "Cost optimization wasn't about restriction. It was about awareness. Once developers saw the numbers, they naturally made better choices."

---

> **Phase 14 Complete!** You've learned to optimize Claude Code for task efficiency, speed, quality, and cost.
>
> **Next Phase**: [Phase 15: Templates, Skills & Ecosystem](../../phase-15-templates-skills/01-claude-md-templates/) →
