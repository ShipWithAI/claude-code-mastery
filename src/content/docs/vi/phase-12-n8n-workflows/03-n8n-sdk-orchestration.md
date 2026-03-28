---
title: 'Điều phối n8n + SDK'
description: 'Kết hợp n8n với Claude Code SDK để điều phối workflow phức tạp: multi-step automation và orchestration.'
---

# Module 12.3: Điều phối n8n + SDK

> **Thời gian học**: ~40 phút
>
> **Yêu cầu trước**: Module 12.2 (Các mẫu Workflow), Module 11.2 (Tích hợp SDK)
>
> **Kết quả**: Sau module này, bạn sẽ biết dùng Claude SDK trong n8n, build production-grade AI orchestration, và implement streaming cùng tool use.

---

## 1. WHY — Tại sao cần học

Execute Command (`claude -p`) hoạt động nhưng có giới hạn: không streaming, không tool calling, parse string thay vì structured data. Bạn bị giới hạn ở basic prompt.

SDK integration cho bạn FULL POWER của Claude API trong n8n visual framework. Best of both: visual orchestration để design workflow, programmatic control cho advanced AI feature. Đây là cách build production-grade AI automation.

---

## 2. CONCEPT — Ý tưởng cốt lõi

### Ba Integration Level

| Level | Method | Use Case |
|-------|--------|----------|
| Basic | Execute Command (`claude -p`) | Simple prompt, setup nhanh |
| Intermediate | HTTP Request (API direct) | Structured response, không cần SDK |
| Advanced | Code node (SDK) | Full feature, streaming, tool |

### Code Node với Anthropic SDK

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

### HTTP Request Node (Không SDK)

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

### Advanced SDK Feature

- **Tool Use**: Cho Claude gọi function bạn define
- **System Prompt**: Set behavior nhất quán
- **Multi-turn**: Maintain conversation context
- **Usage Tracking**: Monitor token cho cost control

---

## 3. DEMO — Từng bước thực hành

### Demo 1: SDK trong Code Node

```javascript
// n8n Code node — Full SDK usage
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });

const userPrompt = $input.first().json.prompt;

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 2048,
  system: "Bạn là assistant hữu ích. Luôn trả lời JSON format.",
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

### Demo 2: Tool Use trong n8n

```javascript
// n8n Code node — Claude với Tool
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });

const tools = [{
  name: "search_database",
  description: "Tìm kiếm database nội bộ",
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

## 4. PRACTICE — Luyện tập

### Bài 1: SDK Basic

**Mục tiêu**: Gọi Claude với system prompt, return JSON.

**Hướng dẫn**:
1. Tạo workflow với Webhook trigger
2. Add Code node với Anthropic SDK
3. Set system prompt cho JSON output
4. Test với curl

<details>
<summary>💡 Hint</summary>

Dùng `$env.ANTHROPIC_API_KEY` cho API key. Code node support `await` cho async call.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: $env.ANTHROPIC_API_KEY });

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  system: "Chỉ trả lời valid JSON format.",
  messages: [{ role: "user", content: $json.prompt }]
});

return { result: JSON.parse(response.content[0].text) };
```

</details>

### Bài 2: Tool Integration

**Mục tiêu**: Define calculator tool, cho Claude quyết định khi nào dùng.

**Hướng dẫn**:
1. Define tool với `input_schema` cho 2 số và operation
2. Claude nhận math question
3. Check nếu `tool_use` trong response
4. Execute calculation, return result

<details>
<summary>💡 Hint</summary>

Check `response.content.find(c => c.type === 'tool_use')` để detect tool call.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
const tools = [{
  name: "calculate",
  description: "Thực hiện phép tính",
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
  messages: [{ role: "user", content: "42 nhân 17 bằng mấy?" }]
});

const toolUse = response.content.find(c => c.type === 'tool_use');
if (toolUse) {
  const { a, b, operation } = toolUse.input;
  const ops = { add: a+b, subtract: a-b, multiply: a*b, divide: a/b };
  return { result: ops[operation] };
}
```

</details>

### Bài 3: Production Workflow

**Mục tiêu**: Build complete workflow với error handling.

**Hướng dẫn**:
1. Webhook → Claude analysis → Tool execution → Response
2. Add try/catch cho API error
3. Log usage tới node riêng

<details>
<summary>💡 Hint</summary>

Wrap SDK call trong try/catch. Return error object khi fail để downstream handle.

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

Connect tới IF node: `{{ $json.success }}` → true branch process, false branch log error.

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

### Với System Prompt

```javascript
system: "Bạn là JSON-only assistant.",
```

### Với Tool

```javascript
tools: [{ name: "...", description: "...", input_schema: {...} }],
```

### Chọn Integration Level

| Cần | Dùng |
|-----|------|
| Simple prompt | Execute Command |
| Không muốn SDK | HTTP Request |
| Tool, streaming | Code Node + SDK |

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| SDK không install trong n8n | `npm install @anthropic-ai/sdk` trong n8n directory |
| Synchronous code trong Code node | Luôn dùng `await`, node support async |
| Không handle tool_use response | Check `response.content` cho `type: 'tool_use'` |
| Ignore usage/token | Track `response.usage` cho cost monitoring |
| Không error handling | Try/catch với meaningful error return |
| Hardcode API key | Dùng `$env.ANTHROPIC_API_KEY` |
| SDK cho simple prompt | Execute Command cho basic, SDK cho advanced |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Công ty SaaS Việt Nam build AI customer support. Cần: intent detection, tool execution (check order, process refund, escalate), conversation history.

**Architecture**:
```text
[Chat Webhook] → [Claude with Tools] → [Switch: Tool?]
                    Tools: check_order,     ├→ [Order DB] → [Format Response]
                    process_refund,         ├→ [Human Approval] → [Refund API]
                    escalate_human,         ├→ [Create Zendesk Ticket]
                    search_kb               └→ [Vector Search] → [Answer]
```

**Tại sao SDK thay vì CLI**:
- Tool use required (Claude quyết định action)
- Token tracking cho billing
- JSON response cho structured data
- System prompt cho personality nhất quán

**Kết quả** (sau 3 tháng):
- 70% ticket auto-resolved
- Response time: 3 giây trung bình
- Human escalation: chỉ complex case
- Cost tracking: billing per conversation

**Quote**: "SDK trong n8n cho flexibility của code với visibility của visual workflow. Best of both worlds."

---

> **Phase 12 Hoàn Thành!** Bạn đã master n8n + Claude Code — từ basic workflow đến advanced SDK orchestration.
>
> **Phase Tiếp Theo**: [Phase 13: Data & Analysis](../../phase-13-data-analysis/01-data-analysis/) →
