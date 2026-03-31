---
title: 'Claude Code + n8n'
description: 'Trigger Claude Code from n8n workflows and build visual AI automation pipelines for development tasks.'
---

# Module 12.1: Claude Code + n8n

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Phase 11 (Automation & Headless)
>
> **Outcome**: After this module, you will understand n8n basics, know how to trigger Claude Code from n8n workflows, and be able to build visual AI automation pipelines.

---

## 1. WHY — Why This Matters

You've learned to automate Claude with GitHub Actions and scripts. But what if you need:
- Non-developers to create AI workflows?
- Visual debugging of complex pipelines?
- Quick prototyping without writing YAML?
- Integration with 400+ services without coding each one?

n8n gives you visual workflow automation. Drag, drop, connect. Claude Code becomes a node in a larger system. Perfect for teams with mixed technical skills or rapid iteration. While GitHub Actions is code-centric, n8n is visual-first — build AI pipelines without touching YAML.

---

## 2. CONCEPT — Core Ideas

### What is n8n?

n8n is an open-source workflow automation platform — think Zapier but self-hosted. Your data stays with you, and you have full control.

Key features:
- **Visual editor** with drag-and-drop workflow design
- **400+ integrations** (Slack, Google Sheets, databases, APIs)
- **Triggers**: webhooks, schedules, email, database changes
- **Can run any CLI command** — this is how we connect Claude Code

### n8n + Claude Code Architecture

```
[Trigger] → [n8n Workflow] → [Execute Claude Code] → [Process Output] → [Action]
    │             │                  │                     │              │
  Email      Visual Editor        claude -p            Parse JSON      Slack
  Webhook    Drag & Drop          Headless             Transform       Database
  Schedule                                                             Trello
```

### Key n8n Nodes for Claude Code

| Node | Purpose | Use Case |
|------|---------|----------|
| **Execute Command** | Run `claude -p` | Core Claude execution |
| **HTTP Request** | Call APIs directly | Alternative approach |
| **Code** | JavaScript processing | Parse Claude output |
| **IF** | Conditional branching | Route based on AI response |
| **Set** | Transform data | Prepare prompts |

### Installation

```bash
# Option 1: npm (recommended for development)
$ npm install -g n8n
$ n8n start

# Option 2: Docker (recommended for production)
$ docker run -it --rm -p 5678:5678 n8nio/n8n
```

Access the editor at `http://localhost:5678`.

---

## 3. DEMO — Step by Step

**Scenario**: Build a workflow where incoming emails are summarized by Claude and sent to Slack.

### Step 1: Install and start n8n

```bash
$ npm install -g n8n
$ export ANTHROPIC_API_KEY="sk-ant-api03-..."
$ n8n start
```

Expected output:
```
n8n ready on port 5678
Editor is now accessible via: http://localhost:5678
```

### Step 2: Create new workflow

1. Open `http://localhost:5678`
2. Click "New Workflow"
3. Name it "Email Summarizer"

### Step 3: Add Webhook trigger (for testing)

Add a **Webhook** node:
- Method: POST
- Path: `/email-summary`

This gives you a test URL like `http://localhost:5678/webhook/email-summary`.

### Step 4: Add Execute Command node for Claude

Add an **Execute Command** node and configure:

```json
{
  "command": "claude",
  "arguments": "-p \"Summarize this email. At the end, write URGENT: YES or URGENT: NO.\n\nSubject: {{ $json.subject }}\n\nBody: {{ $json.body }}\""
}
```

### Step 5: Parse Claude output with Code node

Add a **Code** node:

```javascript
const response = $input.first().json.stdout;
const isUrgent = response.includes('URGENT: YES');
const summary = response.replace(/URGENT: (YES|NO)/g, '').trim();

return [{
  json: {
    summary,
    isUrgent,
    originalSubject: $('Webhook').first().json.body.subject
  }
}];
```

### Step 6: Add IF node for routing

Add an **IF** node:
- Condition: `{{ $json.isUrgent }}` equals `true`
- True branch → Urgent Slack channel
- False branch → Regular Slack channel

### Step 7: Add Slack nodes

Add two **Slack** nodes:

**True branch (urgent):**
```json
{
  "channel": "#urgent",
  "text": "🚨 *Urgent Email*\n\n{{ $json.summary }}"
}
```

**False branch (regular):**
```json
{
  "channel": "#email-summaries",
  "text": "📧 *Email Summary*\n\n{{ $json.summary }}"
}
```

### Step 8: Test the workflow

```bash
$ curl -X POST http://localhost:5678/webhook/email-summary \
  -H "Content-Type: application/json" \
  -d '{"subject": "Server down!", "body": "Production server is unresponsive since 3am."}'
```

Expected: Claude summarizes, detects urgency, routes to `#urgent` channel.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Webhook to Claude

**Goal**: Create a simple webhook that accepts a prompt and returns Claude's response.

**Instructions**:
1. Create workflow with Webhook trigger
2. Add Execute Command: `claude -p "{{ $json.prompt }}"`
3. Add "Respond to Webhook" node returning the output
4. Test with curl

<details>
<summary>💡 Hint</summary>

The "Respond to Webhook" node lets you return data to the HTTP caller. Connect it after the Execute Command node.

</details>

<details>
<summary>✅ Solution</summary>

Workflow: Webhook → Execute Command → Respond to Webhook

Execute Command config:
```json
{
  "command": "claude",
  "arguments": "-p \"{{ $json.prompt }}\""
}
```

Respond to Webhook config:
```json
{
  "respondWith": "json",
  "responseBody": "={{ $json.stdout }}"
}
```

Test:
```bash
curl -X POST http://localhost:5678/webhook/xxx \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is 2+2?"}'
```

</details>

### Exercise 2: Scheduled Daily Analysis

**Goal**: Every day at 9am, fetch a webpage and have Claude analyze it.

**Instructions**:
1. Schedule Trigger: daily at 9:00
2. HTTP Request: fetch a news page or API
3. Execute Command: Claude analyzes content
4. Send email with analysis

<details>
<summary>💡 Hint</summary>

Use the Schedule Trigger node with cron expression `0 9 * * *`. The HTTP Request node can fetch any URL.

</details>

<details>
<summary>✅ Solution</summary>

Workflow: Schedule → HTTP Request → Execute Command → Send Email

Schedule: `0 9 * * *` (9am daily)

HTTP Request: `https://news.ycombinator.com/`

Execute Command:
```json
{
  "command": "claude",
  "arguments": "-p \"Summarize the top 5 stories from this page:\n\n{{ $json.data }}\""
}
```

</details>

### Exercise 3: Multi-Step Pipeline

**Goal**: Chain multiple Claude calls: analyze → suggest → format.

**Instructions**:
1. Webhook input with raw text
2. Claude #1: Analyze sentiment and key points
3. Claude #2: Suggest actions based on analysis
4. Claude #3: Format as bullet points
5. Return final output

<details>
<summary>💡 Hint</summary>

Each Execute Command node's output becomes input for the next. Reference previous outputs with `$('NodeName').first().json.stdout`.

</details>

<details>
<summary>✅ Solution</summary>

Workflow: Webhook → Execute Command (Analyze) → Execute Command (Suggest) → Execute Command (Format) → Respond to Webhook

**Node 1 - Analyze:**
```json
{
  "command": "claude",
  "arguments": "-p \"Analyze this text for sentiment and key points:\n\n{{ $json.text }}\""
}
```

**Node 2 - Suggest (reference Node 1):**
```json
{
  "command": "claude",
  "arguments": "-p \"Based on this analysis, suggest 3 actions:\n\n{{ $('Execute Command').first().json.stdout }}\""
}
```

**Node 3 - Format (reference Node 2):**
```json
{
  "command": "claude",
  "arguments": "-p \"Format these suggestions as bullet points:\n\n{{ $('Execute Command1').first().json.stdout }}\""
}
```

Test:
```bash
curl -X POST http://localhost:5678/webhook/pipeline \
  -H "Content-Type: application/json" \
  -d '{"text": "Customer complained about slow delivery times."}'
```

</details>

---

## 5. CHEAT SHEET

### Quick Start

```bash
npm install -g n8n
export ANTHROPIC_API_KEY="sk-ant-..."
n8n start
# Open http://localhost:5678
```

### Execute Command Node

```json
{
  "command": "claude",
  "arguments": "-p \"{{ $json.prompt }}\""
}
```

### Parse Output (Code Node)

```javascript
const output = $input.first().json.stdout;
return [{ json: { result: output } }];
```

### Common Triggers

| Trigger | Use Case |
|---------|----------|
| Webhook | External events, API calls |
| Schedule | Cron-based, daily/hourly |
| Email (IMAP) | Incoming emails |
| Database | Row changes |

### Data References

```javascript
{{ $json.field }}                    // Current node
{{ $('NodeName').first().json.field }}  // Other node
{{ $input.first().json.stdout }}     // In Code node
```

### Useful Nodes

| Node | Purpose |
|------|---------|
| Set | Prepare/transform data |
| IF | Conditional routing |
| Switch | Multi-way routing |
| Merge | Combine branches |
| Error Trigger | Handle failures |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Claude CLI not in n8n's PATH | Use full path: `/usr/local/bin/claude` |
| API key not available | Set `ANTHROPIC_API_KEY` before starting n8n |
| No timeout on Claude calls | Set timeout in Execute Command (60000ms+) |
| Quotes breaking prompts | Use Set node to prepare complex prompts |
| Ignoring Claude errors | Check `exitCode` and `stderr` in output |
| Huge prompts in command line | Write to temp file, pass file path |
| No error handling | Add Error Trigger node to catch failures |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese marketing agency receives 50+ client briefs daily via email. Manual processing took 2 hours every morning.

**Problem**: Briefs arrived in different formats. Staff had to read each one, extract requirements, log to spreadsheet, create project cards, and notify teams. Error-prone and slow.

**n8n + Claude Solution**:

```
[Email Trigger] → [Claude: Extract] → [Claude: Suggest] → [Google Sheets]
                                                              ↓
                                          [Slack] ← [Trello: Create Card]
```

**Implementation**:
1. Email arrives with client brief
2. Claude extracts: client name, deadline, requirements, budget
3. Claude suggests: team assignment, approach, timeline
4. Auto-logs to Google Sheets
5. Creates Trello card with all details
6. Notifies appropriate Slack channel

**Results** (after 2 months):
- Processing time: 2 hours → 5 minutes (just review)
- Zero missed briefs
- Consistent data extraction format
- Marketing manager modifies workflow herself — no engineering needed

**Quote**: "n8n let our marketing manager build AI automation without asking engineering. She just drags and drops. We went from 'can you build this?' to 'I already built it.'"

**Cost**: n8n is free (self-hosted). Claude API: ~$30/month for 50 briefs/day.

---

> **Next**: [Module 12.2: Workflow Patterns](../02-workflow-patterns/) →
