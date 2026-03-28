---
title: 'Knowledge Sharing'
description: 'Share Claude Code knowledge across teams with prompt libraries and learning loops from mistakes.'
---

# Module 10.4: Knowledge Sharing

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 10.3 (Code Review Protocol)
>
> **Outcome**: After this module, you will have systems for sharing Claude Code knowledge across your team, maintain a team prompt library, and establish learning loops from mistakes.

---

## 1. WHY — Why This Matters

Developer A discovers an amazing prompting technique that saves hours. Keeps it to themselves. Developer B struggles with the same problem for days. Developer C makes a mistake with Claude, fixes it, tells no one. Developer D makes the same mistake a month later.

Without knowledge sharing, each team member learns in isolation. The team's collective skill grows slowly. With systematic sharing, one person's discovery becomes everyone's advantage. One person's mistake becomes everyone's prevention.

---

## 2. CONCEPT — Core Ideas

### Types of Claude Code Knowledge

| Type | Example | How to Share |
|------|---------|--------------|
| Prompts | "This prompt generates great tests" | Prompt library |
| Techniques | "Use /compact before complex tasks" | Team wiki/docs |
| Patterns | "Think+Plan for architecture decisions" | CLAUDE.md |
| Pitfalls | "Don't ask Claude to modify config directly" | Lessons learned log |
| Workarounds | "Claude struggles with X, do Y instead" | Troubleshooting guide |

### Team Prompt Library Structure

```text
docs/prompts/
├── testing/
│   ├── generate-unit-tests.md
│   └── generate-integration-tests.md
├── refactoring/
│   ├── extract-method.md
│   └── improve-naming.md
├── documentation/
│   ├── generate-api-docs.md
│   └── explain-code.md
└── review/
    ├── security-review.md
    └── performance-review.md
```

Each prompt file includes: Purpose, Prompt template, Example usage, Known limitations.

### Lessons Learned Log

Document incidents to prevent repetition:

```markdown
## 2024-01-15: Database migration incident
**What happened**: Claude generated migration that dropped column
**Root cause**: Prompt didn't specify "preserve data"
**Prevention**: Added to CLAUDE.md: "Always preserve existing data"
**Updated prompt**: [link to new migration prompt]
```

### Knowledge Sharing Rituals

- **Weekly**: "Claude Code tip of the week" in Slack
- **Sprint retro**: "What Claude Code lessons did we learn?"
- **Monthly**: Review and update CLAUDE.md as team
- **Onboarding**: Prompt library walkthrough for new members

### The Flywheel Effect

Discovery → Share → Team uses → Team improves → Better technique → Share again → ...

One person's insight accelerates everyone. The team gets smarter together.

---

## 3. DEMO — Step by Step

**Scenario**: Team of 6 implements Claude Code knowledge sharing system.

### Step 1: Create Prompt Library Structure

```bash
mkdir -p docs/prompts/{testing,refactoring,documentation,review}
```

Output:
```
(directories created silently)
```

Create a prompt template:

```bash
cat > docs/prompts/testing/generate-unit-tests.md << 'EOF'
# Generate Unit Tests

## Purpose
Generate comprehensive unit tests for a function or module.

## Prompt
Generate unit tests for [function/file].

Requirements:
- Cover happy path, edge cases, and error conditions
- Mock external dependencies
- Follow naming: "should [behavior] when [condition]"
- Aim for 80% coverage

Before writing, list scenarios you'll cover.

## Example Usage
"Generate unit tests for src/services/userService.ts"

## Known Limitations
- May need adjustment for complex mocking
- Verify assertions match actual behavior
EOF
```

Output:
```
File created: docs/prompts/testing/generate-unit-tests.md
```

### Step 2: Create Lessons Learned Log

```bash
cat > docs/LESSONS_LEARNED.md << 'EOF'
# Claude Code Lessons Learned

## 2024-01-15: Test generation missed edge case
- **What**: Tests passed but didn't cover null input
- **Why**: Prompt didn't explicitly request edge cases
- **Fix**: Updated test prompt to include edge cases requirement

## 2024-01-10: Refactoring broke API
- **What**: Claude renamed public method, broke consumers
- **Why**: No guidance about API stability
- **Fix**: Added to CLAUDE.md: "Maintain backward compatibility"
EOF
```

Output:
```
File created: docs/LESSONS_LEARNED.md
```

### Step 3: Establish Sharing Rituals

```markdown
# Team Slack: #claude-code-tips

**Weekly Tip (Jan 22)**
🧠 Tip: Use "Think carefully about..." prefix for complex decisions.

Example: "Think carefully about the trade-offs between caching
strategies. Consider memory usage and invalidation complexity."

This activates Claude's reasoning for better architectural decisions!

Shared by: @dev-a
Added to: docs/prompts/architecture/think-carefully.md
```

### Step 4: Onboarding New Team Member

```markdown
## Claude Code Onboarding Checklist

- [ ] Read CLAUDE.md (team conventions)
- [ ] Review docs/prompts/ (prompt library)
- [ ] Read LESSONS_LEARNED.md (past mistakes)
- [ ] Shadow team member using Claude Code for 1 day
- [ ] First PR with Claude, flagged for mentorship review
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Build Your Prompt Library

**Goal**: Create reusable prompt templates.

**Instructions**:
1. Identify 3 tasks you frequently use Claude for
2. Write a prompt template for each
3. Test and refine
4. Document with purpose, example, and limitations
5. Share with team

<details>
<summary>💡 Hint</summary>

Start with your most repetitive task. What do you always tell Claude? That's your first prompt template.
</details>

### Exercise 2: Lessons Learned Retrospective

**Goal**: Document a mistake to prevent repetition.

**Instructions**:
1. Think of a Claude Code mistake you (or team) made
2. Document: What happened? Why? How to prevent?
3. Update CLAUDE.md if relevant
4. Share in team channel

### Exercise 3: Tip Sharing Practice

**Goal**: Share knowledge with team.

**Instructions**:
1. Discover or invent a Claude Code technique
2. Write it up in 3 sentences with example
3. Post to team channel
4. Add to prompt library if valuable

<details>
<summary>✅ Solution</summary>

Example tip: "When Claude's response is too generic, add 'Be specific and use concrete examples from our codebase.' This grounds Claude in your actual code instead of generic patterns."
</details>

---

## 5. CHEAT SHEET

### Prompt Library Structure

```text
docs/prompts/[category]/[task].md
- Purpose
- Prompt template
- Example usage
- Limitations
```

### Lessons Learned Template

```markdown
## [Date]: [Title]
- **What happened**:
- **Root cause**:
- **Prevention**:
- **Updates made**:
```

### Sharing Rituals

| When | What |
|------|------|
| Weekly | Tip in Slack |
| Sprint | Retro discussion |
| Monthly | CLAUDE.md review |
| Onboarding | Library walkthrough |

### Knowledge Types → Destinations

| Type | Destination |
|------|-------------|
| Prompts | Library |
| Techniques | Wiki |
| Patterns | CLAUDE.md |
| Pitfalls | Lessons learned |
| Workarounds | Troubleshooting guide |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Knowledge stays in individual heads | Systematic capture and sharing |
| Prompt library with no organization | Clear categories, consistent format |
| Lessons learned but not acted on | Update CLAUDE.md with every lesson |
| Sharing overload (too much noise) | Curate: weekly highlight, not daily dump |
| Onboarding ignores Claude Code | Explicit Claude Code section in onboarding |
| Only sharing successes | Mistakes are MORE valuable to share |
| Static documentation | Living docs: review and update regularly |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese startup, 12 developers, adopted Claude Code. First 3 months: chaotic. Same mistakes repeated. Some devs had secret "super prompts" they didn't share.

**Knowledge sharing implementation**:

- **Month 4**: Created `docs/prompts/` with initial 10 prompts from best practices
- **Month 5**: Added `#claude-tips` Slack channel. Rule: one tip per week minimum
- **Month 6**: Started LESSONS_LEARNED.md after incident (similar to one from month 2)

**Results after 6 months**:
- Prompt library: 47 prompts, organized by category
- Lessons learned: 23 documented incidents
- CLAUDE.md: Updated 34 times based on learnings
- New dev onboarding: 3 days → 1 day (they read the docs)
- Repeated mistakes: Near zero

**Team quote**: "The prompt library is worth more than any single developer's skill. It's our collective intelligence."

---

> **Next**: [Module 10.5: Governance & Policy](../05-governance-policy/) →
