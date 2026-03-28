---
title: 'Tech Debt Analysis'
description: 'Analyze and prioritize tech debt with Claude Code to create actionable improvement roadmaps.'
---

# Module 9.4: Tech Debt Analysis

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 9.3 (Legacy Test Generation)
>
> **Outcome**: After this module, you will have a framework for analyzing tech debt with Claude, know how to prioritize debt repayment, and be able to create actionable improvement roadmaps for legacy codebases.

---

## 1. WHY — Why This Matters

Your legacy codebase has problems everywhere. Outdated dependencies. Inconsistent patterns. Copy-pasted code. Magic numbers. No types. Where do you even start? You could refactor for years and never finish.

The answer isn't "fix everything." The answer is "fix the RIGHT things." Tech debt analysis helps you identify which debt is actively hurting you (pay now), which is future risk (pay later), and which is acceptable (live with it). Claude can analyze faster than you — but needs a framework.

---

## 2. CONCEPT — Core Ideas

### What is Tech Debt?

Technical debt is code or architecture choices that trade short-term speed for long-term cost. Not all debt is bad — sometimes it's the right trade-off. The problem is UNMANAGED debt that compounds over time.

### Tech Debt Categories

| Category | Examples | Impact |
|----------|----------|--------|
| **Code Quality** | Long functions, deep nesting, unclear naming | Maintenance cost |
| **Architecture** | Tight coupling, wrong patterns, scalability limits | Feature development blocked |
| **Dependencies** | Outdated packages, security vulnerabilities | Security/compatibility risk |
| **Testing** | Low coverage, flaky tests, no tests | Regression risk |
| **Documentation** | Missing docs, outdated docs, no onboarding | Knowledge silos |
| **Patterns** | Inconsistent styles, multiple ways to do same thing | Cognitive load |

### The Prioritization Matrix

|  | Low Effort | High Effort |
|--|-----------|-------------|
| **High Impact** | 🔥 Do NOW | 📅 Plan carefully |
| **Low Impact** | ✅ Quick wins | ❄️ Maybe never |

### The Interest Rate Concept

- **High-interest debt**: Gets worse over time (security vulnerabilities, broken tests) → Pay first
- **Low-interest debt**: Static cost (code style, naming) → Pay when convenient

---

## 3. DEMO — Step by Step

**Scenario**: Analyze a legacy e-commerce backend for tech debt prioritization.

### Step 1: Initial Scan

```text
You: Analyze src/ for technical debt. Give me a high-level inventory.
Categorize by: Code Quality, Architecture, Dependencies, Testing,
Documentation, Patterns.

Claude:
CODE QUALITY:
- paymentService.js: 800-line file, functions > 100 lines
- Multiple files with deep nesting (4-5 levels)

ARCHITECTURE:
- Circular dependency: orderService ↔ inventoryService
- Direct database access in route handlers

DEPENDENCIES:
- Express 3.x (current: 4.x, security advisories)
- lodash 3.x (known vulnerabilities)

TESTING:
- Overall coverage: 23%
- Payment and order logic: 5% coverage

DOCUMENTATION:
- README last updated 3 years ago
- No API documentation

PATTERNS:
- Mix of callbacks and promises
- 3 different validation approaches
```

### Step 2: Prioritize with Claude

```text
You: Rank the top 5 debt items by Impact and Effort (S/M/L/XL).

Claude:
1. lodash vulnerability — Impact: HIGH, Effort: S → DO NOW
2. Express 3.x upgrade — Impact: HIGH, Effort: M → PLAN
3. Payment test coverage — Impact: HIGH, Effort: L → PLAN
4. Circular dependency — Impact: MEDIUM, Effort: M → LATER
5. Inconsistent async — Impact: MEDIUM, Effort: L → LATER
```

### Step 3: Create Roadmap

```text
You: Create a 3-sprint roadmap for the top items.

Claude:
Sprint 1 (Quick Wins):
- Upgrade lodash (2 hours)
- Add basic tests to payment flow (1 day)

Sprint 2 (Critical Upgrade):
- Express 3 → 4 migration (3 days)
- Add tests for affected routes (2 days)

Sprint 3 (Architecture):
- Resolve circular dependency (2 days)
- Increase order test coverage to 50% (2 days)
```

### Step 4: Document Decisions

```text
You: Create TECH_DEBT.md with inventory, roadmap, and accepted debt.

Claude: [Creates documentation file]
```

Check outdated dependencies:

```bash
$ npm outdated
```

Output:
```text
Package  Current  Wanted  Latest
lodash   3.10.1   3.10.1  4.17.21
express  3.21.2   3.21.2  4.18.2
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Debt Inventory

**Goal**: Create a categorized tech debt inventory.

**Instructions**:
1. Pick a module/directory in any project
2. Ask Claude to analyze for tech debt
3. Create a categorized inventory
4. Estimate effort (S/M/L/XL) for each item

<details>
<summary>💡 Hint</summary>

```text
"Analyze [directory] for technical debt.
Categorize by: Code Quality, Architecture, Dependencies, Testing.
For each item, estimate effort: S/M/L/XL."
```
</details>

### Exercise 2: Prioritization Matrix

**Goal**: Practice impact vs. effort prioritization.

**Instructions**:
1. Take your inventory from Exercise 1
2. Plot items on the Impact vs. Effort matrix
3. Identify: Do Now / Plan / Later / Never
4. Ask Claude to validate your prioritization

### Exercise 3: Sprint Planning

**Goal**: Create an actionable roadmap.

**Instructions**:
1. Take your prioritized list
2. Create a 3-sprint roadmap
3. Ensure Sprint 1 has quick wins (motivation!)
4. Ensure critical items are planned, not just listed

<details>
<summary>✅ Solution</summary>

Roadmap structure:
- Sprint 1: Quick wins (S effort, high impact) — build momentum
- Sprint 2: Critical items (M effort, high impact) — address risks
- Sprint 3: Architecture improvements (L effort) — long-term health
- Document accepted debt — things you're choosing NOT to fix
</details>

---

## 5. CHEAT SHEET

### Debt Categories

Code Quality | Architecture | Dependencies | Testing | Documentation | Patterns

### Prioritization Matrix

|  | Low Effort | High Effort |
|--|-----------|-------------|
| High Impact | 🔥 NOW | 📅 Plan |
| Low Impact | ✅ Quick win | ❄️ Maybe never |

### Analysis Prompts

```text
"Analyze [scope] for tech debt. Categorize and prioritize."
"Top 5 improvements, ranked by impact and effort?"
"If I could only fix 3 things, what and why?"
"Create a debt repayment roadmap for 3 sprints."
```

### Interest Rate Rule

| Type | Examples | Action |
|------|----------|--------|
| High interest | Security, broken tests | Pay now |
| Low interest | Style, naming | Pay when convenient |

### Documentation

Create `TECH_DEBT.md`: Inventory + Roadmap + Accepted Debt

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Trying to fix all debt | Prioritize. Some debt is acceptable. |
| Only looking at code quality | Include architecture, dependencies, testing, docs. |
| Listing debt without effort estimates | Impact without effort = can't prioritize. |
| Ignoring "interest rate" | Security and broken tests compound. Fix first. |
| Starting with big refactors | Start with quick wins. Build momentum. |
| No documentation of decisions | TECH_DEBT.md: what, why, when. |
| Analyzing entire codebase at once | Start with high-traffic areas. Iterate. |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese startup, 4-year-old codebase, team of 5 developers. "Everything needs fixing" paralysis — nobody knew where to start.

**Claude-assisted debt analysis (2 days)**:

Day 1 — Inventory:
- Scanned 200 files with Claude
- Found: 47 code quality issues, 12 architecture debts, 8 outdated dependencies (3 with CVEs), 15% test coverage

Day 2 — Prioritization:
- Claude ranked by impact/effort
- Top 3: Security vulnerabilities (S effort, critical), missing auth tests (M effort, high risk), circular dependencies (L effort, blocking features)

**Roadmap created**:
- Sprint 1: Security fixes + auth tests
- Sprint 2: Untangle order module
- Sprint 3: Increase coverage to 40%

**Accepted Debt** (documented):
- Inconsistent naming conventions (low impact, would take months)
- Old util functions (working, not worth changing)

**Result**: Team had clear direction. First sprint completed in 1 week. Morale improved — "We're making progress instead of drowning."

---

> **Phase 9 Complete!** You can now work effectively with legacy codebases — exploring, refactoring safely, adding tests, and prioritizing improvements.
>
> **Next Phase**: [Phase 10: Team Collaboration](../../phase-10-team-collaboration/01-team-claude-md/) — Use Claude Code in team settings.
