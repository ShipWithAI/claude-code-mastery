---
title: 'Context Optimization'
description: 'Maximize Claude Code output quality per token with session planning, context priming, and compaction.'
---

# Module 5.2: Context Optimization

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 5.1 (Controlling Context)
>
> **Outcome**: After this module, you will be able to extract maximum output quality per token spent — using advanced techniques like session planning, context priming, strategic compaction, task decomposition, and the one-shot pattern for context-heavy tasks.

---

## 1. WHY — Why This Matters

You've mastered controlling context from Module 5.1. But now you hit a new problem: bigger tasks need more context, yet more context degrades Claude's response quality. You're stuck in a paradox — add more context and quality drops, add less and Claude lacks information. The real experts don't use less context — they use context SMARTER. Context optimization isn't about cutting corners. It's about spending your token budget like a strategist, not a gambler. Same input cost, 2x better results.

---

## 2. CONCEPT — Core Ideas

Context optimization is architectural thinking applied to AI conversations. Instead of dumping everything into one session and hoping for the best, you orchestrate context like a conductor orchestrates an orchestra — the right information, at the right time, in the right amount.

### The Six Optimization Techniques

**1. Session Architecture** — Structure conversations into distinct phases with clean boundaries:
- Phase 1: Understanding (read, analyze, ask questions)
- Phase 2: Planning (design, outline, decompose)
- Phase 3: Execution (implement, test, refactor)
- Phase 4: Verification (review, validate, document)

Between phases: `/compact` to compress learnings and clear noise.

**2. Context Priming** — The first prompt shapes the entire conversation. Front-load critical context:
- CLAUDE.md loads automatically (your foundation)
- First user prompt sets tone, scope, constraints
- Prime with minimal essential context, not exhaustive dumps

**3. One-Shot Pattern** — Use `claude -p "prompt"` for self-contained tasks:
- Entire task completes in single prompt/response cycle
- No conversation history pollution
- Perfect for utilities, configs, isolated components

**4. Task Decomposition** — Break monolithic work into independent chunks:
- Each sub-task gets own session or /compact cycle
- Pass results via files (not conversation memory)
- Sub-tasks can run in parallel (different terminals)

**5. Strategic /compact Timing** — Compress at optimal moments:
- ✅ After completing a sub-task
- ✅ Before starting a new phase
- ✅ When context usage hits 60%+
- ❌ NEVER mid-operation (loses working state)

**6. Context Recycling** — Save and reuse analysis artifacts:
- Export decisions/findings to files
- Store recurring context in CLAUDE.md
- Create "context snapshot" documents for complex systems

```mermaid
graph TD
    A[Big Task] --> B[Session Architecture]
    B --> C[Phase 1: Understanding]
    C --> D[/compact]
    D --> E[Phase 2: Planning]
    E --> F[Context Priming]
    F --> G[Task Decomposition]
    G --> H[Sub-task 1]
    G --> I[Sub-task 2]
    G --> J[Sub-task 3]
    H --> K[One-Shot Pattern]
    I --> L[/compact]
    J --> M[Context Recycling]
    L --> N[Phase 3: Execution]
    M --> N
    K --> N
    N --> O[/compact]
    O --> P[Phase 4: Verification]
```

---

## 3. DEMO — Step by Step

**Scenario**: Refactor authentication system from session-based to JWT (8 files: auth middleware, login/logout handlers, user model, JWT utilities, tests, config, docs).

**Step 1: Session Architecture — Plan Your Phases**

Before touching code, outline the session:

```bash
$ claude
```

First prompt:
```
I need to refactor auth from session-based to JWT. 8 files affected.

Phase plan:
1. Understanding: Analyze current auth flow (3 files)
2. Planning: Design JWT architecture, identify changes
3. Execution: Implement file by file with /compact between
4. Verification: Test suite, security review

Let's start Phase 1: analyze middleware/auth.js, handlers/login.js, models/user.js
```

Expected: Claude reads files, explains current flow, identifies dependencies.

**Step 2: Context Priming — Efficient First Prompt**

Notice the priming elements:
- Task scope (8 files, JWT migration)
- Constraint (phased approach)
- Immediate action (analyze 3 specific files)
- NO code dump, NO exhaustive requirements

This sets expectations: methodical, structured, file-focused.

**Step 3: Phase 1 Completion + Compact**

After Claude's analysis:
```
/compact
```

Expected output:
```
Context compacted. Key information preserved:
- Current auth uses Express sessions + Passport
- User passwords hashed with bcrypt
- Session stored in Redis
- 3 routes depend on session: /api/profile, /api/dashboard, /api/settings

Context usage: 15% (was 58%)
```

**Step 4: One-Shot for JWT Utility Module**

The JWT utility is self-contained. Use one-shot pattern:

```bash
$ claude -p "Create utils/jwt.js with functions: generateToken(userId, email), verifyToken(token), refreshToken(token). Use jsonwebtoken library. JWT secret from process.env.JWT_SECRET. Access token expires 15min, refresh token 7 days. Include JSDoc comments."
```

Expected: Complete jwt.js file written directly. No back-and-forth needed.

**Step 5: Task Decomposition — File by File**

Back in main session (already compacted):
```
Phase 3: Execution. Let's update files one by one.

File 1/8: Update middleware/auth.js to use JWT instead of session.
```

Claude updates file. Then:
```
/compact
```

Repeat for each file. Each `/compact` clears the previous file's details while preserving architecture decisions.

**Step 6: Context Recycling — Save Analysis**

After Phase 2 (Planning), save the architecture:
```
Save the JWT architecture design to docs/jwt-migration.md for future reference.
```

Claude creates:
```markdown
# JWT Migration Architecture

## Token Structure
- Access: 15min, payload: {userId, email, role}
- Refresh: 7 days, payload: {userId}

## Middleware Changes
- Remove passport.session()
- Add JWT verification middleware...
```

Now this context is permanent, reusable, and doesn't consume conversation tokens.

**Step 7: Final Cost Review**

After Phase 4:
```
/cost
```

Expected output:
```
Session Cost Summary:
- Input tokens: 28,450
- Output tokens: 12,300
- Total cost: $0.87
- Context efficiency: 73% (via 6 compactions)
```

Compare this to a no-optimization approach: typically 50,000+ input tokens, $1.50+, and quality degradation after file 4.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Session Architect

**Goal**: Plan and execute a context-optimized refactoring session

**Instructions**:
1. Choose a real refactoring task in your codebase (5+ files affected)
2. Write a 4-phase plan with specific `/compact` points
3. Execute Phase 1 only, using context priming in your first prompt
4. Run `/cost` after Phase 1, then after `/compact`
5. Compare token usage before/after compaction

**Expected result**:
- Phase 1 uses 40-60% context
- After `/compact`: drops to 10-20%
- Clear understanding captured in compact summary

<details>
<summary>💡 Hint</summary>

Your first prompt should include:
- Task goal (1 sentence)
- Phase plan (bullet list)
- Immediate action (read/analyze specific files)

Don't explain HOW to refactor yet — that's Phase 2.

</details>

<details>
<summary>✅ Solution</summary>

Example first prompt:
```
Refactor payment processing to support multiple gateways (Stripe, PayPal, Bank Transfer).
Currently hard-coded to Stripe in 6 files.

Phase plan:
1. Understanding: Analyze current Stripe integration
2. Planning: Design gateway abstraction layer
3. Execution: Implement abstraction + migrate Stripe + add PayPal
4. Verification: Test all gateways, update docs

Phase 1: Analyze services/stripe.js, controllers/payment.js, models/transaction.js
```

After analysis and `/compact`:
```
Context compacted. Key information preserved:
- Stripe API calls in 8 locations
- Hard-coded API keys in services/stripe.js
- Transaction model assumes Stripe's response schema
- No error handling for gateway timeouts
```

</details>

### Exercise 2: One-Shot Mastery

**Goal**: Complete 3 isolated tasks using one-shot pattern

**Instructions**:
1. Create a data validation module (`validators/order.js`) with 5 validation functions
2. Generate a test suite (`tests/validators.test.js`) with 15 test cases
3. Create a config file (`config/payment-gateways.json`) with 3 gateway configurations

Use `claude -p` for each. Time yourself — should take <5 minutes total.

**Expected result**: 3 complete files, zero conversation history, minimal tokens spent

<details>
<summary>💡 Hint</summary>

Pack EVERYTHING into the prompt:
- File purpose
- Required functions/structure
- Libraries to use
- Format/style preferences
- Edge cases to handle

</details>

<details>
<summary>✅ Solution</summary>

**Command 1**:
```bash
claude -p "Create validators/order.js with 5 functions: validateOrderId(id), validateAmount(amount), validateCurrency(code), validateItems(items), validateShippingAddress(address). Use Joi library. Export as module.exports. Include input sanitization and detailed error messages."
```

**Command 2**:
```bash
claude -p "Create tests/validators.test.js using Jest. Test all 5 validators from validators/order.js. Include: valid cases, invalid cases, edge cases (null, undefined, empty), boundary tests (min/max amounts), injection attacks. 15 total test cases minimum."
```

**Command 3**:
```bash
claude -p "Create config/payment-gateways.json with 3 gateway configs: Stripe (USD, EUR, GBP), PayPal (USD, EUR), BankTransfer (VND only). Each gateway: {name, currencies, apiEndpoint, timeout, retryAttempts, enabled}. Use realistic but fake endpoint URLs."
```

Time: ~3-4 minutes. Tokens: ~800 input, ~2500 output total (vs. 3000+ input for conversation-based approach).

</details>

---

## 5. CHEAT SHEET

| Technique | When to Use | How | Context Savings |
|-----------|-------------|-----|-----------------|
| **Session Architecture** | Multi-phase tasks (5+ steps) | Plan 4 phases: Understand → Plan → Execute → Verify | 30-50% via structure |
| **Context Priming** | Start of every session | First prompt: scope + constraints + immediate action (no code dumps) | 20-30% on first prompt |
| **One-Shot Pattern** | Isolated components, configs, utils | `claude -p "complete prompt"` — pack everything into single request | 60-80% (no history) |
| **Task Decomposition** | 5+ files, independent changes | Break into sub-tasks, pass results via files not conversation | 40-60% per sub-task |
| **Strategic /compact** | After sub-tasks, before new phase, at 60%+ usage | `/compact` at phase boundaries, NEVER mid-operation | 50-70% per compact |
| **Context Recycling** | Architecture decisions, recurring context | Save analysis to files, update CLAUDE.md, create context snapshots | 30-50% on reuse |

### Session Phase Template

```
Phase 1: Understanding
- Read relevant files (3-5 max)
- Ask clarifying questions
- Document current state
→ /compact

Phase 2: Planning
- Design solution architecture
- Identify affected files
- Define success criteria
→ /compact

Phase 3: Execution
- Implement changes (1 file at a time)
- /compact after each sub-task
- Test incrementally

Phase 4: Verification
- Run full test suite
- Review changes
- Update documentation
→ /compact (optional, for session summary)
```

### One-Shot Prompt Template

```bash
claude -p "Create [FILE_PATH] that [PRIMARY_PURPOSE].

Requirements:
- [Req 1]
- [Req 2]
- [Req 3]

Technical constraints:
- Use [LIBRARY/FRAMEWORK]
- Follow [STYLE/PATTERN]
- Include [ERROR_HANDLING/EDGE_CASES]

Format: [EXPORT_STYLE, COMMENTS, ETC]"
```

### /compact Decision Flowchart

```
Is task complete or at phase boundary?
  YES → /compact
  NO ↓

Is context usage > 60%?
  YES → /compact
  NO ↓

Are you about to switch to unrelated sub-task?
  YES → /compact
  NO ↓

Continue without compacting
```

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Jump into coding immediately without planning phases | Always start with session architecture. 60 seconds of planning saves 20 minutes of context thrashing. |
| Run entire refactoring (20 files) in one long session | Decompose into sub-tasks. One-shot for isolated pieces. /compact between logical chunks. Multi-file changes = multi-phase session. |
| `/compact` in middle of implementing a complex function | Only compact at natural boundaries: after completing a sub-task, before starting a new phase, never mid-operation. |
| Never use one-shot mode, always interactive | If task is self-contained (config, utility, test file), use `claude -p`. No conversation overhead. 3x faster. |
| Re-analyze same code files every session | Context recycling: save analysis to docs/, update CLAUDE.md with architecture decisions. Reuse, don't re-derive. |
| Optimize context before understanding the problem | First session: understand deeply (use 80% context if needed). THEN optimize in subsequent sessions. Premature optimization wastes time. |

---

## 7. REAL CASE — Production Story

**Scenario**: Monolith-to-microservices migration for e-commerce platform. 200+ files, 15 planned services (Auth, Product, Order, Payment, Inventory, Notification, Analytics, etc.).

**Problem**: Initial approach used single long session per service. By file 6-7, Claude started:
- Repeating previous suggestions
- Forgetting earlier architectural decisions
- Mixing patterns from different services
- Context usage spiked to 95%, quality dropped

**Solution**: Applied all 6 optimization techniques:

1. **Session Architecture**: Each service = 4-phase session
   - Phase 1: Analyze monolith code for this domain
   - Phase 2: Design service API + data model
   - Phase 3: Extract and refactor code
   - Phase 4: Integration tests + docs

2. **Context Priming**: First prompt for each service:
   ```
   Extracting [SERVICE_NAME] service. Monolith files: [3-5 key files].
   Target: Standalone service with REST API, own DB, async events.
   Phase 1: Analyze domain logic in monolith.
   ```

3. **One-Shot Pattern**: Used for each service's:
   - Dockerfile (standardized)
   - API client library
   - Config files (package.json, .env.example, etc.)

4. **Task Decomposition**: Each service broken into:
   - Domain model extraction
   - Route handlers
   - Data access layer
   - Event publishers/subscribers
   - Tests (unit, integration)

   Each = separate sub-task with `/compact` between.

5. **Strategic /compact**: Automatic compaction:
   - After each Phase 1, 2, 3
   - After every 2-3 files in Phase 3
   - Before switching services

6. **Context Recycling**: Created `docs/microservices-architecture.md` in session 1, updated after each service design. Became the "source of truth" — every session loaded this first (via CLAUDE.md reference).

**Result**:
- 15 services extracted in 3 weeks (original estimate: 6 weeks)
- Token usage: 45% reduction (avg 35K tokens/service vs. 65K before)
- Consistency: 95% (vs. 60% — pattern drift eliminated)
- Zero context overflow incidents (vs. 23 in initial attempt)
- Cost: $87 total vs. projected $180+

**Key insight**: The most expensive token is the one that generates wrong code. Context optimization isn't about saving pennies on API calls — it's about maintaining quality at scale. When Claude has clean, relevant context, first-try accuracy goes from 70% to 95%. That's where the real savings live.

---

> **Next**: [Module 5.3: Image & Visual Context](../03-image-context/) →
