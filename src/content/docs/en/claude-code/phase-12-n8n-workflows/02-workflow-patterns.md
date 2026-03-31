---
title: 'Workflow Patterns'
description: 'Learn 6 reusable n8n workflow patterns for Claude Code automation and combine them for complex scenarios.'
---

# Module 12.2: Workflow Patterns

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 12.1 (Claude Code + n8n)
>
> **Outcome**: After this module, you will know 6 reusable workflow patterns, understand when to apply each, and be able to combine patterns for complex scenarios.

---

## 1. WHY — Why This Matters

You can build one-off n8n workflows. But every new automation feels like starting from scratch. You end up with inconsistent approaches, repeated mistakes, and workflows that are hard to maintain.

Workflow patterns are the "recipes" of automation. Just like software design patterns (Factory, Observer, Strategy), these are proven solutions to recurring problems. Know the patterns, and you can quickly assemble solutions for most AI automation challenges. This module gives you a pattern library to draw from.

---

## 2. CONCEPT — Core Ideas

### Pattern 1: Sequential Pipeline

```
[Input] → [Claude: Step 1] → [Claude: Step 2] → [Claude: Step 3] → [Output]
```

**Use when**: Tasks must happen in order, each step needs previous output.
**Example**: Extract → Analyze → Summarize → Format

### Pattern 2: Parallel Fan-Out/Fan-In

```
         ┌→ [Claude: Task A] →┐
[Input] ─┼→ [Claude: Task B] →┼→ [Merge] → [Output]
         └→ [Claude: Task C] →┘
```

**Use when**: Independent tasks can run simultaneously.
**Example**: Analyze document for sentiment, keywords, and entities in parallel.

### Pattern 3: Classification Router

```
[Input] → [Claude: Classify] → [Switch] ─→ [Handler A]
                                       ├→ [Handler B]
                                       └→ [Handler C]
```

**Use when**: Different inputs need different processing paths.
**Example**: Route support tickets by category (billing, technical, urgent).

### Pattern 4: Human-in-the-Loop

```
[Input] → [Claude: Draft] → [Wait for Approval] → [IF Approved] → [Execute]
                                                        ↓ No
                                               [Claude: Revise] → [Back to Wait]
```

**Use when**: AI output needs human review before action.
**Example**: Email drafts, code changes, content publishing.

### Pattern 5: Batch Processing

```
[Input List] → [Split In Batches] → [Claude: Process Each] → [Aggregate] → [Output]
```

**Use when**: Processing many items, need rate limiting or chunking.
**Example**: Analyze 100 documents, 10 at a time.

### Pattern 6: Error Recovery Loop

```
[Input] → [Claude: Try] → [IF Error] → [Claude: Fix] → [Retry]
                              ↓ Success
                          [Output]
```

**Use when**: Claude might fail, need graceful retry.
**Example**: Code generation with validation.

---

## 3. DEMO — Step by Step

### Demo 1: Sequential Pipeline — Content Creation

**Workflow**: `[Webhook] → [Research] → [Outline] → [Write] → [Edit] → [Output]`

**Research Node**: `claude -p "Find 5 key points about: {{ $json.topic }}"`

**Outline Node**: `claude -p "Create blog outline:\n\n{{ $json.stdout }}"`

**Write Node**: `claude -p "Write 500-word post from outline:\n\n{{ $json.stdout }}"`

**Edit Node**: `claude -p "Edit for clarity and SEO:\n\n{{ $json.stdout }}"`

**Test**: `curl -X POST http://localhost:5678/webhook/blog -d '{"topic": "remote work"}'`

### Demo 2: Classification Router — Support Tickets

**Classify Node**: `claude -p "Classify as billing/technical/general/urgent. Return ONLY category:\n\n{{ $json.description }}"`

**Code Node (clean output)**:
```javascript
const category = $input.first().json.stdout.trim().toLowerCase();
return [{ json: { category, original: $('Webhook').first().json } }];
```

**Switch Node**: Map `billing`→0, `technical`→1, `urgent`→2, `general`→3

**Connect**: Output 0→#billing-support, 1→#engineering, 2→PagerDuty, 3→Auto-response

**Test**: `curl -X POST http://localhost:5678/webhook/ticket -d '{"description": "Payment failed!"}'`

### Demo 3: Batch Processing — Document Analysis

**Split In Batches**: Size 10, reset on each run

**Execute Command**: `claude -p "Summarize each document:\n\n{{ JSON.stringify($json) }}"`

**Merge Node**: "Merge By Position" to collect all outputs

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Sequential Pipeline

**Goal**: Build a 3-step translation pipeline.

**Instructions**:
1. Webhook receives text in any language
2. Claude #1: Detect language
3. Claude #2: Translate to English
4. Claude #3: Summarize in 1 sentence
5. Return final summary

<details>
<summary>💡 Hint</summary>

Each Execute Command output is in `$json.stdout`. Reference with `{{ $json.stdout }}` in the next node's prompt.

</details>

<details>
<summary>✅ Solution</summary>

**Node 1 - Detect:**
```json
{ "command": "claude", "arguments": "-p \"What language is this? Reply with language name only:\n\n{{ $json.text }}\"" }
```

**Node 2 - Translate:**
```json
{ "command": "claude", "arguments": "-p \"Translate to English:\n\n{{ $('Webhook').first().json.body.text }}\"" }
```

**Node 3 - Summarize:**
```json
{ "command": "claude", "arguments": "-p \"Summarize in one sentence:\n\n{{ $json.stdout }}\"" }
```

</details>

### Exercise 2: Classification Router

**Goal**: Route messages to different channels based on type.

**Instructions**:
1. Claude classifies input as: question, complaint, feedback, spam
2. Switch routes to 4 different Slack channels
3. Test with 10 different inputs

<details>
<summary>💡 Hint</summary>

Make Claude return ONLY the category name. Use a Code node to clean/lowercase the output before the Switch node.

</details>

<details>
<summary>✅ Solution</summary>

**Classify prompt:**
```
"Classify as exactly one of: question, complaint, feedback, spam. Return ONLY the word.\n\nMessage: {{ $json.message }}"
```

**Code node:**
```javascript
return [{ json: { type: $input.first().json.stdout.trim().toLowerCase() } }];
```

**Switch rules:** Map each type to output 0-3, connect to respective Slack nodes.

</details>

### Exercise 3: Batch Processing

**Goal**: Process 20 items in batches of 5.

**Instructions**:
1. Webhook receives array of 20 items
2. Split In Batches (size 5)
3. Claude summarizes each batch
4. Merge all results

<details>
<summary>💡 Hint</summary>

After Split In Batches, the workflow runs 4 times (20/5). Use Merge node at the end to collect all outputs.

</details>

<details>
<summary>✅ Solution</summary>

**Split In Batches:** Batch Size = 5

**Execute Command:**
```json
{ "command": "claude", "arguments": "-p \"Summarize these items:\n\n{{ JSON.stringify($json) }}\"" }
```

**Merge node:** Mode = "Merge By Position"

</details>

---

## 5. CHEAT SHEET

### Pattern Selection Guide

| Scenario | Pattern |
|----------|---------|
| Multi-step transformation | Sequential Pipeline |
| Independent parallel tasks | Fan-Out/Fan-In |
| Different handling per type | Classification Router |
| Need human approval | Human-in-the-Loop |
| Many items to process | Batch Processing |
| Might fail, need retry | Error Recovery Loop |

### Key n8n Nodes

| Node | Purpose |
|------|---------|
| `Split In Batches` | Chunk arrays into smaller groups |
| `Merge` | Combine parallel branches |
| `Switch` | Multi-way routing (3+ paths) |
| `Wait` | Pause for external webhook |
| `IF` | Binary branching (2 paths) |

### Data Passing

```javascript
{{ $json.stdout }}                    // Claude output from previous node
{{ $('NodeName').first().json.field }} // Specific field from named node
{{ $items() }}                         // All items in current batch
{{ JSON.stringify($json) }}            // Serialize for Claude prompt
```

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| One giant Claude call | Break into sequential steps with clear prompts |
| Sequential when parallel possible | Fan-out for independent tasks (3x faster) |
| No human review for risky actions | Human-in-the-loop for emails, payments, publishing |
| Processing 1000 items at once | Batch processing with rate limiting (10-20 per batch) |
| No error handling | Error Recovery pattern for production workflows |
| Hardcoded routing rules | Let Claude classify, Switch node routes |
| Mixing patterns randomly | Choose primary pattern, compose intentionally |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese e-commerce company processes 200+ customer reviews daily. Need to: analyze sentiment, extract product issues, route to right team, respond appropriately.

**Problem**: Manual processing took 4 hours daily. Responses were inconsistent. Negative reviews sometimes missed.

**Multi-Pattern Solution**:

```
Pattern 1: Batch Processing
└─ 200 reviews → batches of 20

    Pattern 2: Sequential Pipeline (per review)
    └─ Analyze sentiment → Extract issues → Generate response

        Pattern 3: Classification Router
        └─ positive → Marketing | negative → Support | neutral → Product

            Pattern 4: Human-in-the-Loop
            └─ Negative reviews need manager approval
```

**Implementation**:
- Database trigger fetches new reviews every hour
- Batch processing handles volume without rate limits
- Sequential pipeline extracts structured data
- Router sends to appropriate team's Slack
- Human approval required for negative responses

**Results** (after 1 month):
- Processing time: 4 hours → 30 minutes
- Response consistency: 100% follow same format
- Escalation: Zero negative reviews missed
- Customer satisfaction: +15% (faster, better responses)

**Quote**: "Patterns let us build in 2 days what would have taken 2 weeks of custom coding. Now our support team just reviews and approves."

---

> **Next**: [Module 12.3: n8n + SDK Orchestration](../03-n8n-sdk-orchestration/) →
