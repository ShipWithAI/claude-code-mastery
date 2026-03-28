---
title: 'n8n + SDK Orchestration'
---

# Module 12.3: n8n + SDK Orchestration

> **Estimated time**: ~40 minutes
>
> **Prerequisite**: Module 12.2 (Workflow Patterns), Module 11.2 (SDK Integration)
>
> **Outcome**: After this module, you will know how to use Claude SDK within n8n, build production-grade AI orchestration, and implement advanced features like streaming and tools.

---

## 1. WHY — Why This Matters

The Execute Command approach (`claude -p`) works but has limits: no streaming, no tool calling, string parsing instead of structured data. You're limited to basic prompts.

SDK integration gives you the FULL POWER of Claude API within n8n's visual framework. Best of both worlds: visual orchestration for workflow design, programmatic control for advanced AI features. This is how you build production-grade AI automation.

---

## 2. CONCEPT — Core Ideas

### Three Integration Levels

| Level | Method | Use Case |
|-------|--------|----------|
| Basic | Execute Command (`claude -p`) | Simple prompts, quick setup |
| Intermediate | HTTP Request (API direct) | Structured responses, no SDK |
| Advanced | Code node (SDK) | Full features, streaming, tools |

### Code Node with Anthropic SDK

```javascript
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: $env.ANTHROPIC_API_KEY
});

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: $json.prompt }]
});

return { response: response.content[0].text };
```

### HTTP Request Node (No SDK)

```json
{
  "method": "POST",
  "url": "https://api.anthropic.com/v1/messages",
  "headers": {
    "x-api-key": "={{ $env.ANTHROPIC_API_KEY }}",
    "anthropic-version": "2023-06-01",
    "content-type": "application/json"
  },
  "body": {
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "={{ $json.prompt }}"}]
  }
}
```

### Advanced SDK Features

- **Tool Use**: Let Claude call functions you define
- **System Prompts**: Set consistent behavior across calls
- **Multi-turn**: Maintain conversation context
- **Usage Tracking**: Monitor tokens for cost control

---

## 3. DEMO — Step by Step

### Demo 1: SDK in Code Node

```javascript
// n8n Code node — Full SDK usage
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });

const userPrompt = $input.first().json.prompt;

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 2048,
  system: "You are a helpful assistant. Always respond in JSON format.",
  messages: [{ role: "user", content: userPrompt }]
});

const text = response.content[0].text;
let parsed;
try {
  parsed = JSON.parse(text);
} catch (e) {
  parsed = { raw: text, parseError: true };
}

return { response: parsed, usage: response.usage };
```

### Demo 2: Tool Use in n8n

```javascript
// n8n Code node — Claude with Tools
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });

const tools = [{
  name: "search_database",
  description: "Search internal database",
  input_schema: {
    type: "object",
    properties: { query: { type: "string" } },
    required: ["query"]
  }
}];

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  tools: tools,
  messages: [{ role: "user", content: $json.prompt }]
});

const toolUse = response.content.find(c => c.type === 'tool_use');

if (toolUse) {
  return { needsTool: true, toolName: toolUse.name, toolInput: toolUse.input };
} else {
  return { needsTool: false, response: response.content[0].text };
}
```

### Demo 3: Complete Workflow

```text
[Webhook] → [Claude with Tools] → [IF: needsTool?]
                                        ↓ Yes
                                  [Switch: toolName]
                                  ├→ [DB Query] →┐
                                  └→ [API Call] ─┤
                                        ↓        │
                              [Claude: Process] ←┘
                                        ↓ No
                                    [Output]
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: SDK Basic

**Goal**: Call Claude with system prompt, return JSON.

**Instructions**:
1. Create workflow with Webhook trigger
2. Add Code node with Anthropic SDK
3. Set system prompt for JSON output
4. Test with curl

<details>
<summary>💡 Hint</summary>

Use `$env.ANTHROPIC_API_KEY` for the API key. The Code node supports `await` for async calls.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  system: "Respond only in valid JSON format.",
  messages: [{ role: "user", content: $json.prompt }]
});

return { result: JSON.parse(response.content[0].text) };
```

</details>

### Exercise 2: Tool Integration

**Goal**: Define a calculator tool, let Claude decide when to use it.

**Instructions**:
1. Define tool with `input_schema` for two numbers and operation
2. Claude receives math question
3. Check if `tool_use` in response
4. Execute calculation, return result

<details>
<summary>💡 Hint</summary>

Check `response.content.find(c => c.type === 'tool_use')` to detect tool calls.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
const tools = [{
  name: "calculate",
  description: "Perform math calculation",
  input_schema: {
    type: "object",
    properties: {
      a: { type: "number" },
      b: { type: "number" },
      operation: { type: "string", enum: ["add", "subtract", "multiply", "divide"] }
    },
    required: ["a", "b", "operation"]
  }
}];

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  tools: tools,
  messages: [{ role: "user", content: "What is 42 times 17?" }]
});

const toolUse = response.content.find(c => c.type === 'tool_use');
if (toolUse) {
  const { a, b, operation } = toolUse.input;
  const ops = { add: a+b, subtract: a-b, multiply: a*b, divide: a/b };
  return { result: ops[operation] };
}
```

</details>

### Exercise 3: Production Workflow

**Goal**: Build complete workflow with error handling.

**Instructions**:
1. Webhook → Claude analysis → Tool execution → Response
2. Add try/catch for API errors
3. Log usage to separate node

<details>
<summary>💡 Hint</summary>

Wrap SDK calls in try/catch. Return error object on failure for downstream handling.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
try {
  const response = await client.messages.create({...});
  return { success: true, data: response.content[0].text, usage: response.usage };
} catch (error) {
  return { success: false, error: error.message };
}
```

Connect to IF node: `{{ $json.success }}` → true branch processes, false branch logs error.

</details>

---

## 5. CHEAT SHEET

### Code Node Setup

```javascript
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });
```

### Basic Call

```javascript
const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  messages: [{ role: "user", content: prompt }]
});
return { text: response.content[0].text };
```

### With System Prompt

```javascript
system: "You are a JSON-only assistant.",
```

### With Tools

```javascript
tools: [{ name: "...", description: "...", input_schema: {...} }],
```

### Integration Selection

| Need | Use |
|------|-----|
| Simple prompt | Execute Command |
| No SDK dependency | HTTP Request |
| Tools, streaming | Code Node + SDK |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| SDK not in n8n environment | `npm install @anthropic-ai/sdk` in n8n's directory |
| Synchronous code in Code node | Always use `await`, node supports async |
| Not handling tool_use response | Check `response.content` for `type: 'tool_use'` |
| Ignoring usage/tokens | Track `response.usage` for cost monitoring |
| No error handling | Try/catch with meaningful error returns |
| Hardcoded API key | Use `$env.ANTHROPIC_API_KEY` |
| SDK for simple prompts | Use Execute Command for basic cases |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese SaaS company building AI customer support. Need: intent detection, tool execution (check order, process refund, escalate), conversation history.

**Architecture**:
```text
[Chat Webhook] → [Claude with Tools] → [Switch: Tool?]
                    Tools: check_order,     ├→ [Order DB] → [Format Response]
                    process_refund,         ├→ [Human Approval] → [Refund API]
                    escalate_human,         ├→ [Create Zendesk Ticket]
                    search_kb               └→ [Vector Search] → [Answer]
```

**Why SDK over CLI**:
- Tool use required (Claude decides action)
- Token tracking for billing
- JSON responses for structured data
- System prompt for consistent personality

**Results** (after 3 months):
- 70% tickets auto-resolved
- Response time: 3 seconds average
- Human escalation: complex cases only
- Cost tracking: per-conversation billing

**Quote**: "SDK in n8n gave us code flexibility with visual workflow visibility. Best of both worlds."

---

> **Phase 12 Complete!** You've mastered n8n + Claude Code integration — from basic workflows to advanced SDK orchestration.
>
> **Next Phase**: [Phase 13: Data & Analysis](../../phase-13-data-analysis/01-data-analysis/) →
