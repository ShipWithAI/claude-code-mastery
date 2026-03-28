---
title: 'Command & Prompt Templates'
description: 'Build a reusable prompt template library for Claude Code common tasks like refactoring and debugging.'
---

# Module 15.2: Command & Prompt Templates

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 15.1 (CLAUDE.md Templates)
>
> **Outcome**: After this module, you will have a library of prompt templates for common tasks and know how to create reusable prompts.

---

## 1. WHY — Why This Matters

You do the same tasks repeatedly — code review, test generation, documentation. Each time you write the prompt from scratch. Sometimes you forget important criteria. Results vary in quality.

Prompt templates are pre-written prompts for common tasks. Write once, reuse forever. Consistent quality, nothing forgotten.

---

## 2. CONCEPT — Core Ideas

### Prompt Template Structure

```markdown
# Template: [Task Name]

## Purpose
[What this template does]

## Prompt
[The actual prompt with {{placeholders}}]

## Variables
- {{code}}: Code to analyze
- {{file}}: Target file path

## Usage
[How to invoke this template]
```

### Template Categories

| Category | Templates | Use Case |
|----------|-----------|----------|
| **Review** | Code review, PR review | Quality assurance |
| **Generate** | Tests, docs, types | Create new content |
| **Refactor** | Extract, rename, optimize | Improve existing |
| **Debug** | Error analysis, logging | Find/fix issues |
| **Explain** | Code walkthrough | Understanding |

### Template Variables

Common placeholders for flexibility:

```text
{{code}}      — Code to analyze
{{file}}      — File path
{{language}}  — Programming language
{{error}}     — Error message
{{context}}   — Additional context
{{criteria}}  — Specific requirements
```

### Template Storage

- **CLAUDE.md** — Project-specific templates
- **Personal folder** — Your reusable templates
- **Team repository** — Shared team templates

---

## 3. DEMO — Step by Step

### Template 1: Code Review

```markdown
# Template: Code Review

## Prompt
Review the following code for:

1. **Correctness**: Logic errors, edge cases, bugs
2. **Security**: Vulnerabilities, injection risks, auth issues
3. **Performance**: Inefficiencies, N+1 queries, memory leaks
4. **Maintainability**: Readability, naming, complexity
5. **Standards**: Does it follow our CLAUDE.md conventions?

Code to review:
{{code}}

Format response as:
- 🔴 Critical (must fix)
- 🟠 Important (should fix)
- 🟡 Suggestion (nice to have)
- ✅ Good practices observed

## Usage
Paste code, then use this template for structured review.
```

### Template 2: Test Generation

```markdown
# Template: Generate Tests

## Prompt
Generate comprehensive tests for:
{{code}}

Requirements:
- Use {{testFramework}} (Jest/Pytest/etc.)
- Cover happy path and edge cases
- Include error scenarios
- Mock external dependencies
- Follow AAA pattern (Arrange, Act, Assert)

Generate tests for:
1. Normal operation
2. Edge cases (empty, null, boundary)
3. Error handling
4. Integration points

## Usage
Paste function/class code to generate complete test file.
```

### Template 3: Documentation

```markdown
# Template: Generate Documentation

## Prompt
Generate documentation for:
{{code}}

Include:
1. **Overview**: What does this code do?
2. **Parameters**: All inputs with types
3. **Returns**: Output with type
4. **Examples**: 2-3 usage examples
5. **Errors**: What can be thrown?

Format: JSDoc/docstring appropriate for {{language}}

## Usage
Paste code to generate complete documentation.
```

### Template 4: Debug Helper

```markdown
# Template: Debug Analysis

## Prompt
I'm getting this error:
{{error}}

In this code:
{{code}}

Analyze:
1. What's causing this error?
2. Why is it happening?
3. How to fix it (provide code)?
4. How to prevent similar issues?

## Usage
Paste error message + code for root cause analysis.
```

### Using Templates

```text
Step 1: Copy template prompt
Step 2: Replace {{placeholders}} with actual values
Step 3: Paste into Claude session
Step 4: Get consistent, structured output
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Use Existing Template

**Goal**: Experience template consistency.

**Instructions**:
1. Take the code review template above
2. Apply it to a recent piece of your code
3. Compare results vs your typical ad-hoc review prompt
4. Note the consistency differences

<details>
<summary>💡 Hint</summary>

Focus on whether the template catches things you usually forget (security? edge cases?).

</details>

<details>
<summary>✅ Solution</summary>

Template review typically finds:
- Security issues (template reminds to check)
- Edge cases (explicit in template)
- Standards violations (references CLAUDE.md)

Ad-hoc reviews often miss 1-2 categories entirely.

</details>

### Exercise 2: Create Your Own Template

**Goal**: Build a template for your workflow.

**Instructions**:
1. Identify a task you do repeatedly with Claude
2. Write the prompt you typically use
3. Formalize into template structure (Purpose, Prompt, Variables, Usage)
4. Test the template twice

<details>
<summary>💡 Hint</summary>

Good candidates: API endpoint review, component creation, migration scripts.

</details>

<details>
<summary>✅ Solution</summary>

Example: API Endpoint Template
```markdown
# Template: API Endpoint Review

## Prompt
Review this API endpoint for:
- Input validation
- Error responses (correct status codes)
- Authentication/authorization
- Rate limiting consideration
- Documentation accuracy

Code: {{code}}
```

Test on 2 endpoints, refine based on results.

</details>

### Exercise 3: Template Library

**Goal**: Build your personal template collection.

**Instructions**:
1. Create 5 templates for your common tasks
2. Store in a dedicated folder or document
3. Document when to use each
4. Test each on a real task

<details>
<summary>💡 Hint</summary>

Start with: review, test, doc, refactor, explain. These cover 80% of needs.

</details>

<details>
<summary>✅ Solution</summary>

Template library structure:
```text
~/prompt-templates/
├── code-review.md
├── test-generation.md
├── documentation.md
├── refactoring.md
├── explanation.md
└── README.md (index + usage guide)
```

Each template tested on real code before adding to library.

</details>

---

## 5. CHEAT SHEET

### Template Structure

```markdown
# Template: [Name]
## Purpose: [What it does]
## Prompt: [Actual prompt with {{variables}}]
## Variables: [List placeholders]
## Usage: [How to invoke]
```

### Essential Templates

| Template | Purpose |
|----------|---------|
| `/review` | Code review with criteria |
| `/test` | Generate test file |
| `/doc` | Generate documentation |
| `/refactor` | Refactoring suggestions |
| `/debug` | Error analysis |
| `/explain` | Code walkthrough |

### Common Variables

```text
{{code}}      — Code to analyze
{{file}}      — File path
{{language}}  — Programming language
{{error}}     — Error message
{{context}}   — Additional context
```

### Storage Locations

- CLAUDE.md (project-specific)
- Personal templates folder
- Team shared repository

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Templates too vague | Specific criteria and output format |
| Forgetting variables | Always include {{placeholders}} |
| One giant template | Focused templates per task |
| No output format | Define what good response looks like |
| Never updating | Improve templates based on results |
| Templates only in head | Write down and share |
| Ignoring project context | Templates should reference CLAUDE.md |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese fintech team did 20+ code reviews weekly. Quality varied — some developers checked security, others didn't. Some found edge cases, others missed them.

**Template Solution**:

Created `/review` template with mandatory sections:
- Security (SQL injection, XSS, auth)
- Performance (queries, memory)
- Business logic (edge cases, validation)
- Standards (team conventions)
- Test coverage (what needs tests)

**Implementation**:
- Week 1: Created standard review template
- Week 2: All reviews must use template
- Week 3: PR checklist added: "Reviewed using template"

**Results (2 months)**:
- Security findings: +200% (template reminded to check)
- Review consistency: 95% same criteria applied
- Review time: Unchanged
- Production bugs from reviewed code: -40%

**Quote**: "Templates didn't make us robots. They made sure we never forgot the important stuff. Each reviewer still adds their expertise on top."

---

> **Next**: [Module 15.3: Claude Code Skills](../03-claude-code-skills/) →
