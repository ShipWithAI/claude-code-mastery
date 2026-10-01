---
title: 'Workflow Patterns'
description: 'Five reusable n8n patterns for calling an Agent SDK service: fan-out, merge, aggregation, error recovery, and human approval.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 12.2: Workflow Patterns

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 12.1 (Claude Code + n8n)
>
> **Outcome**: After this module, you will know five reusable patterns for calling the
> `agent-service` from n8n, and be able to combine them for batch, error-recovery, and
> approval-gated workflows.

---

## 1. WHY — Why This Matters

One HTTP Request node calling `agent-service` is a demo. Real workflows need to process many
items, survive a call that comes back with a refusal instead of an answer, and sometimes stop for
a human before doing anything risky. Without a pattern to reach for, every workflow reinvents its
own — inconsistently, and usually without error handling until something breaks in production.

---

## 2. CONCEPT — Core Ideas

All five patterns build on the same architecture from Module 12.1: **HTTP Request node →
`agent-service` → JSON result**. What changes is what surrounds that call.

### Pattern 1: Sequential Pipeline

```text
[Webhook] → [HTTP Request: agent-service] → [Code: reshape] → [HTTP Request: agent-service] → [Output]
```
**Use when** each step needs the previous step's answer. **Example**: extract structured data,
then draft a response from it, in two separate prompts (two separate calls keep each prompt
focused and each `total_cost_usd` visible).

### Pattern 2: Fan-Out / Fan-In with Loop Over Items

```text
[Webhook: items[]] → [Loop Over Items] → [HTTP Request: agent-service] → [Merge] → [Output]
```
**Use when** you have a list and want to call the service once per item instead of stuffing the
whole list into one prompt. The **Loop Over Items** node (`n8n-nodes-base.splitInBatches` — the
current UI name is "Loop Over Items"; older docs and node internals still say "Split in Batches")
takes a **Batch Size**; set it to `1` to process items one at a time, or higher to send small
groups per call. Docs: "The Loop Over Items node helps you loop through data when needed... with
each iteration, returns a predefined amount of data through the loop output."

### Pattern 3: Merge by Position

```text
[Loop Over Items] → [HTTP Request: agent-service] → [Merge: Combine → Position] → [Code: $input.all()]
```
**Use when** you fanned work out per item and need the per-item results lined back up in order.
The **Merge** node's **Combine** mode has a **Combine By** option named **Position** (docs: "the
item at index 0 in Input 1 merges with the item at index 0 in Input 2, and so on") — not two
separate inputs in this case, but the accumulated loop output paired back with the original items.
A following **Code** node reads everything with `$input.all()` — "All input items in current
node" — to build the final list.

### Pattern 4: Error Recovery

```text
[HTTP Request: agent-service] → [Code: check result] → [IF: refused or errored?] → [HTTP Request: retry with a stricter prompt]
                                                              ↓ no
                                                          [Output]
```
**Use when** the service call might come back with a refusal in plain text rather than an HTTP
error — the Agent SDK still reports `subtype: "success"` when Claude simply declines a request in
words, so an IF node checking only the HTTP status code will miss it. Check the `result` string
itself in a Code node first.

### Pattern 5: Human-in-the-Loop

```text
[HTTP Request: agent-service (draft)] → [Wait] → [IF: approved?] → [HTTP Request: agent-service (apply)]
                                                        ↓ no
                                                    [Output: rejected]
```
**Use when** the agent's answer should not act on its own — a drafted reply, a proposed change.
The **Wait** node ("Wait before continue with execution") pauses the workflow until a webhook call
resumes it, giving a person time to approve or reject in between.

---

## 3. DEMO — Step by Step

These patterns configure nodes around the same HTTP Request → `agent-service` call already proven
working end-to-end in Module 12.1's Step 6 — the JSON in and out is identical, so the walkthrough
below is configuration, not a second live run of the same call.

**Fan-out (Pattern 2)**: add a **Loop Over Items** node between the trigger and the HTTP Request
node. Open it and set **Batch Size** to `1`. Each iteration sends one item's worth of `$json` into
the same `{"prompt": "{{ $json.body.prompt }}"}` body shown in 12.1.

**Merge by position (Pattern 3)**: after the loop's HTTP Request node, add a **Merge** node, set
**Mode** to `Combine`, and set **Combine By** to `Position`. Connect the loop's own "done" output
into the Merge node's second input so unpaired iterations aren't silently dropped (the "Include
Any Unpaired Items" option controls that; it's off by default).

**Aggregate with Code node (Pattern 3, continued)**:
```javascript
// docs: https://docs.n8n.io/build/work-with-data/transform-data/expression-reference/nodeinputdata
const items = $input.all();
return items.map(item => ({ json: { result: item.json.result } }));
```

**Error recovery (Pattern 4)** — a real refusal captured from the running `agent-service`, using a
prompt that asks for a tool outside `allowedTools`:
```bash
curl -s localhost:8787/run -H 'content-type: application/json' \
  -d '{"prompt":"Create a new file named notes.txt in this repo with the text hello."}'
```
Expected output:
```text
# Output may vary
{"result":"I don't have permission to create new files in this environment. The file creation was blocked by the system's permission settings.\n\nWould you like me to try a different approach, or do you need to adjust the permissions to allow file creation?","session_id":"bba6f51b-8d1d-4406-a967-49f59b6b33fc","total_cost_usd":0.0558}
```
Note the HTTP call still returned `200` with a normal-looking JSON body — the refusal lives inside
`result`. The Code node in an error-recovery branch should check for language like "don't have
permission" (or, better, ask the agent to prefix failures with a fixed token you can match on)
before deciding whether to retry.

**Human approval (Pattern 5)**: after the "draft" HTTP Request node, add a **Wait** node
configured to resume on a webhook call; send the draft to Slack with an approve/reject link that
hits that resume webhook, then branch on the response before the second `agent-service` call runs.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Batch of five

**Goal**: Process five prompts one at a time instead of one big prompt.

**Instructions**:
1. Feed a Webhook a JSON body with a `prompts` array of five short questions.
2. **Loop Over Items** with Batch Size `1`, then the same HTTP Request → `agent-service` node from
   12.1.
3. **Merge** (Combine → Position), then a Code node with `$input.all()` to collect the five
   results into one array.

**Expected result**: The final output is an array of five `{result, session_id, total_cost_usd}`
objects, one per prompt, in the original order.

<details>
<summary>💡 Hint</summary>
The loop's non-"done" output feeds the HTTP Request node; its "done" output is what you connect
into the Merge node's second input.
</details>

<details>
<summary>✅ Solution</summary>
Webhook → Loop Over Items → HTTP Request (agent-service) → back into Loop Over Items → (on done) →
Merge (Combine, Position) → Code (`$input.all()`) → Respond to Webhook.
</details>

### Exercise 2: Detect a refusal without guessing at English phrasing

**Goal**: Make the error-recovery IF node reliable instead of string-matching "don't have
permission".

**Instructions**:
1. Change the prompt template to end with: `If you cannot complete this, respond with exactly the
   single word REFUSED and nothing else.`
2. Re-run the Exercise 2 curl from 12.1 with a request outside `allowedTools`.
3. Branch the IF node on `{{ $json.result.trim() === 'REFUSED' }}` instead of a substring match.

<details>
<summary>💡 Hint</summary>
A fixed sentinel token in the prompt is far more reliable across languages and phrasings than
matching on the model's natural-language wording.
</details>

<details>
<summary>✅ Solution</summary>
This is the same idea Module 12.3 takes further with structured output: instead of parsing prose,
ask for (or configure) a format you can check exactly.
</details>

---

## 5. CHEAT SHEET

| Pattern | Key node(s) |
|---|---|
| Sequential Pipeline | Two HTTP Request nodes, second reads the first's `result` |
| Fan-Out / Fan-In | **Loop Over Items** (Batch Size) → HTTP Request |
| Merge by Position | **Merge** → Mode: Combine → Combine By: **Position** |
| Aggregate | Code node: `$input.all()` |
| Error Recovery | Code node checks `result` text → IF → retry HTTP Request |
| Human-in-the-Loop | **Wait** node (resumes on webhook) → IF: approved? |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Calling the node by its pre-rename batching name | Current UI name is **Loop Over Items** |
| Checking only HTTP status for errors | The service returns `200` even on a refusal — check `result` text or a sentinel token |
| Sending 100 items in one prompt | **Loop Over Items** with a small Batch Size, one `agent-service` call per item or small group |
| Merging without checking unpaired items | Review "Include Any Unpaired Items" on the Merge node before assuming nothing was dropped |
| Letting the agent act before a human sees the draft | Insert a **Wait** node for anything that publishes, spends, or deletes |
| Using `$items()` from old n8n versions | Current expression is `$input.all()` inside a Code node |

---

## 7. REAL CASE — Production Story

**Scenario**: A Vietnamese e-commerce team gets 200+ customer reviews a day and wants each one
triaged: sentiment, product issue, and a suggested reply routed to the right team.

**Problem**: A single giant prompt per batch of reviews was slow to debug — one bad review in a
batch of twenty made the whole call's output unpredictable, and there was no way to retry just the
one review that confused the model.

**Solution**: **Loop Over Items** with Batch Size `1` sends one review per `agent-service` call.
**Merge (Combine → Position)** lines the per-review results back up with the original review IDs.
An error-recovery branch checks each result for a `REFUSED` sentinel and retries with a simplified
prompt. Negative-sentiment results route through a **Wait** node for manager approval before a
reply goes out.

**Result**: Each review is independently retryable, a stuck review no longer blocks the batch, and
the manager approval step means no auto-reply reaches an angry customer unreviewed.

---

> **Next**: [Module 12.3: n8n + SDK Orchestration](../03-n8n-sdk-orchestration/) →
