---
title: 'Task Optimization'
description: 'Structure tasks optimally for Claude Code with the right granularity to avoid common framing mistakes.'
---

# Module 14.1: Task Optimization

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Phase 6 (Thinking & Planning)
>
> **Outcome**: After this module, you will know how to structure tasks optimally, understand task granularity, and avoid common task-framing mistakes.

---

## 1. WHY — Why This Matters

You ask Claude to "build a complete authentication system." Thirty minutes later, you have a tangled mess that doesn't match your architecture. Or Claude gets stuck, loops, and produces nothing useful.

Same goal, different approach: "First, design the auth architecture. Then implement login. Then implement registration. Then add password reset." Each step is clear, checkable, and builds on the previous.

Task optimization isn't about Claude — it's about how YOU structure the work.

---

## 2. CONCEPT — Core Ideas

### Task Granularity Spectrum

```text
Too Large            Optimal Zone           Too Small
─────────────────────────────────────────────────────────
"Build entire app"   "Implement login"      "Add semicolon"
     ↓                     ↓                      ↓
 Overwhelms           Clear scope          Micromanagement
 Gets stuck           Checkable            Inefficient
 Poor quality         Builds momentum      Context overhead
```

### Optimal Task Characteristics

| Characteristic | Good Task | Bad Task |
|----------------|-----------|----------|
| **Scope** | Single feature/function | "Build everything" |
| **Time** | 5-20 minutes Claude time | Hours of work |
| **Output** | Verifiable deliverable | Vague "progress" |
| **Dependencies** | Clear inputs | Unclear requirements |
| **Success criteria** | Testable | Subjective |

### Task Decomposition Patterns

```text
Pattern 1: Vertical Slice
Big Feature → [Design] → [Core Logic] → [UI] → [Tests]

Pattern 2: Component-Based
System → [Component A] → [Component B] → [Integration]

Pattern 3: Iterative Refinement
V1 (Basic) → V2 (+ Feature) → V3 (+ Polish)
```

### The Checkpoint Principle

Each task should end with something you can verify. If Claude goes wrong, you catch it early. Small corrections beat major rewrites.

### Context Efficiency

Large tasks pollute context. Fresh context per task yields cleaner results. Use `/clear` or start a new session for distinct tasks.

---

## 3. DEMO — Step by Step

**Scenario**: Build a user authentication system.

### Bad Approach (One Giant Task)

```text
You: Build a complete user authentication system with login,
registration, password reset, email verification, OAuth,
session management, and role-based access control.

Claude: [Starts building... 30 minutes later]

Result:
- 2000 lines of tangled code
- Mixed patterns (some JWT, some sessions)
- Missing error handling
- Can't easily test pieces
- Doesn't match your existing architecture
```

### Good Approach (Optimized Tasks)

**Task 1: Design (5 min)**
```text
You: Design an authentication system architecture for our Express app.
Requirements: JWT-based, PostgreSQL storage, refresh tokens.
Output: Architecture diagram and file structure.

Claude: [Produces clear design]
```
✓ Checkpoint: Review design before implementation

**Task 2: Core Auth (10 min)**
```text
You: Based on this design, implement the core auth module:
- JWT token generation and verification
- Password hashing with bcrypt
Create: src/auth/tokens.ts and src/auth/passwords.ts

Claude: [Implements focused modules]
```
✓ Checkpoint: Test JWT functions work

**Task 3: Login Endpoint (10 min)**
```text
You: Implement POST /api/auth/login endpoint using the auth
modules we just created. Include validation and error handling.

Claude: [Implements clean endpoint]
```
✓ Checkpoint: Test login with curl

**Task 4: Registration (10 min)**
```text
You: Implement POST /api/auth/register following the same
patterns as login. Add email uniqueness check.

Claude: [Consistent implementation]
```
✓ Checkpoint: Test registration

### Result Comparison

| Giant Task | Optimized Tasks |
|------------|-----------------|
| 30 min, poor quality | 35 min total, high quality |
| Tangled code | Modular, consistent |
| Hard to debug | Each piece tested |
| Major refactor needed | Ready for production |
| 1 checkpoint | 4 checkpoints |

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Task Decomposition

**Goal**: Break a large feature into optimal tasks.

**Instructions**:
1. Take a large feature you need to build
2. Break it into 4-6 tasks following the patterns
3. For each task, define: scope, output, success criteria
4. Estimate Claude time for each (aim for 5-15 min)

<details>
<summary>💡 Hint</summary>

Start with design, then core logic, then integration points. Each task should produce something testable.

</details>

<details>
<summary>✅ Solution</summary>

Example for "Build a REST API for blog posts":
1. Design API endpoints and data model (10 min)
2. Implement Post model and database schema (10 min)
3. Implement CRUD endpoints (15 min)
4. Add validation and error handling (10 min)
5. Write integration tests (15 min)

Each task has clear output and can be verified before moving on.

</details>

### Exercise 2: Checkpoint Design

**Goal**: Create verification points for your tasks.

**Instructions**:
1. For your decomposed tasks, identify what to verify
2. Define: What can you test after each task?
3. What would "wrong" look like at each checkpoint?

<details>
<summary>💡 Hint</summary>

Good checkpoints: "Does it compile?", "Does the test pass?", "Does curl return expected response?"

</details>

<details>
<summary>✅ Solution</summary>

For blog API tasks:
- After design: Can review and approve architecture
- After model: Can run migration, see table in DB
- After endpoints: Can curl each endpoint successfully
- After validation: Invalid input returns proper errors
- After tests: All tests pass

</details>

### Exercise 3: Granularity Calibration

**Goal**: Experience the impact of task size.

**Instructions**:
1. Pick a small feature (e.g., "add search to a list")
2. Try three approaches: one giant prompt, optimal chunks, micro-steps
3. Compare: time, quality, your mental load

<details>
<summary>💡 Hint</summary>

Micro-steps: "Add import statement", "Add function signature", "Add first line of function body"...

</details>

<details>
<summary>✅ Solution</summary>

You'll find: Giant = unpredictable quality. Micro = tedious, loses momentum. Optimal (2-3 focused tasks) = best balance of quality and efficiency.

</details>

---

## 5. CHEAT SHEET

### Optimal Task Size
- 5-20 minutes Claude time
- Single clear deliverable
- Testable output
- Fresh context

### Decomposition Patterns

| Pattern | Flow |
|---------|------|
| Vertical | Design → Core → UI → Tests |
| Component | Part A → Part B → Integrate |
| Iterative | V1 → V2 → V3 |

### Task Template

```text
Goal: [What to achieve]
Context: [Relevant existing code/decisions]
Output: [Specific deliverable]
Constraints: [Patterns to follow, things to avoid]
```

### Checkpoint Questions
- Can I verify this works?
- Does it match the design?
- Is it consistent with previous tasks?

### Red Flags (Task Too Large)
- Claude asks many clarifying questions
- Output mixes different approaches
- Takes > 20 minutes
- You can't easily test the result

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| "Build everything at once" | Decompose into 5-15 min tasks |
| Vague success criteria | Define testable output |
| No checkpoints | Verify after each task |
| Skipping design phase | Design first, implement second |
| Continuing when lost | Stop, `/clear`, restart with smaller task |
| Same context for many tasks | Fresh context per major task |
| Micro-managing every line | Trust Claude with reasonable scope |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese startup needed to build a payment integration (VNPay + MoMo). First attempt: one giant task.

**Attempt 1 (Failed)**:
```text
"Implement payment integration supporting VNPay and MoMo
with webhooks, refunds, and transaction logging."

Result: 3 hours, unusable code, mixed patterns, bugs everywhere.
```

**Attempt 2 (Optimized)**:

| Task | Time | Status |
|------|------|--------|
| Design payment architecture | 15 min | ✓ |
| Payment interface/abstract class | 10 min | ✓ |
| VNPay implementation | 20 min | ✓ |
| VNPay webhook handler | 15 min | ✓ |
| MoMo implementation | 20 min | ✓ |
| Transaction logging | 15 min | ✓ |
| Integration tests | 25 min | ✓ |

**Total**: 2 hours → Production-ready, consistent patterns, tested at each step.

**Comparison**:
- Giant task: 3 hours → unusable
- Optimized: 2 hours → production-ready

**Quote**: "The 'slow' approach of doing small tasks was actually twice as fast and 10x better quality."

---

> **Next**: [Module 14.2: Speed Optimization](../02-speed-optimization/) →
