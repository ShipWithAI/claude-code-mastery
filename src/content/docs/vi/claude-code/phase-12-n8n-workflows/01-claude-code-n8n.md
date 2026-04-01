---
title: 'Claude Code + n8n'
description: 'Kết nối Claude Code với n8n để tạo workflow tự động hóa: trigger, xử lý và tích hợp đa hệ thống.'
---

# Module 12.1: Claude Code + n8n

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Phase 11 (Automation & Headless)
>
> **Kết quả**: Sau module này, bạn sẽ hiểu n8n basic, trigger Claude Code từ n8n workflow, và build visual AI automation pipeline.

---

## 1. WHY — Tại sao cần học

Bạn đã học automate Claude với GitHub Actions và script. Nhưng nếu cần:
- Non-developer tạo AI workflow?
- Visual debugging cho complex pipeline?
- Quick prototyping không viết YAML?
- Integration với service không muốn code API?

n8n cho bạn visual workflow automation. Drag, drop, connect. Claude Code trở thành một node trong larger system. Perfect cho team có mixed technical skill hoặc rapid iteration.

**Ví von**: n8n như "LEGO cho automation." Mỗi node là một mảnh ghép. Claude Code là mảnh ghép "bộ não AI." Kết hợp với email, Slack, database — build bất cứ robot nào bạn muốn, không cần biết code.

---

## 2. CONCEPT — Ý tưởng cốt lõi

### n8n là gì?

n8n là open-source workflow automation platform — như Zapier nhưng self-hosted. Data của bạn ở với bạn, full control.

Key feature:
- **Visual editor** drag-and-drop
- **400+ integration** (Slack, Google Sheets, database, API)
- **Trigger**: webhook, schedule, email, database change
- **Chạy CLI command** — đây là cách connect Claude Code

### n8n + Claude Code Architecture

```
[Trigger] → [n8n Workflow] → [Execute Claude Code] → [Process Output] → [Action]
    │             │                  │                     │              │
  Email      Visual Editor        claude -p            Parse JSON      Slack
  Webhook    Drag & Drop          Headless             Transform       Database
  Schedule                                                             Trello
```

### Key n8n Node cho Claude Code

| Node | Mục đích | Use Case |
|------|----------|----------|
| **Execute Command** | Run `claude -p` | Core execution |
| **HTTP Request** | Call API | Alternative |
| **Code** | JavaScript processing | Parse output |
| **IF** | Conditional branching | Route response |
| **Set** | Transform data | Prepare prompt |

### Installation

```bash
# Option 1: npm
$ npm install -g n8n
$ n8n start

# Option 2: Docker
$ docker run -it --rm -p 5678:5678 n8nio/n8n
```

Access editor tại `http://localhost:5678`.

---

## 3. DEMO — Từng bước thực hành

**Scenario**: Build workflow email đến → Claude summarize → Slack notification.

### Step 1: Install và start n8n

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

### Step 2: Tạo workflow mới

1. Mở `http://localhost:5678`
2. Click "New Workflow"
3. Đặt tên "Email Summarizer"

### Step 3: Add Webhook trigger (để test)

Add **Webhook** node:
- Method: POST
- Path: `/email-summary`

Bạn sẽ có URL như `http://localhost:5678/webhook/email-summary`.

### Step 4: Add Execute Command node cho Claude

Add **Execute Command** node và configure:

```json
{
  "command": "claude",
  "arguments": "-p \"Summarize email này. Cuối cùng viết URGENT: YES hoặc URGENT: NO.\n\nSubject: {{ $json.subject }}\n\nBody: {{ $json.body }}\""
}
```

### Step 5: Parse Claude output với Code node

Add **Code** node:

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

### Step 6: Add IF node cho routing

Add **IF** node:
- Condition: `{{ $json.isUrgent }}` equals `true`
- True branch → Urgent Slack channel
- False branch → Regular Slack channel

### Step 7: Add Slack nodes

**True branch (urgent):**
```json
{
  "channel": "#urgent",
  "text": "🚨 *Email Gấp*\n\n{{ $json.summary }}"
}
```

**False branch (regular):**
```json
{
  "channel": "#email-summaries",
  "text": "📧 *Email Summary*\n\n{{ $json.summary }}"
}
```

### Step 8: Test workflow

```bash
$ curl -X POST http://localhost:5678/webhook/email-summary \
  -H "Content-Type: application/json" \
  -d '{"subject": "Server down!", "body": "Production server không response từ 3am."}'
```

Expected: Claude summarize, detect urgent, route tới `#urgent` channel.

---

## 4. PRACTICE — Luyện tập

### Exercise 1: Webhook to Claude

**Mục tiêu**: Tạo webhook nhận prompt và trả về Claude response.

**Hướng dẫn**:
1. Tạo workflow với Webhook trigger
2. Add Execute Command: `claude -p "{{ $json.prompt }}"`
3. Add "Respond to Webhook" node trả output
4. Test với curl

<details>
<summary>💡 Hint</summary>

"Respond to Webhook" node cho phép trả data về HTTP caller. Connect sau Execute Command node.

</details>

<details>
<summary>✅ Solution</summary>

Workflow: Webhook → Execute Command → Respond to Webhook

Execute Command:
```json
{
  "command": "claude",
  "arguments": "-p \"{{ $json.prompt }}\""
}
```

Respond to Webhook:
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
  -d '{"prompt": "2+2 bằng mấy?"}'
```

</details>

### Exercise 2: Scheduled Daily Analysis

**Mục tiêu**: Mỗi ngày 9am, fetch webpage và Claude analyze.

**Hướng dẫn**:
1. Schedule Trigger: daily 9:00
2. HTTP Request: fetch URL
3. Execute Command: Claude analyze
4. Send email với analysis

<details>
<summary>💡 Hint</summary>

Schedule Trigger dùng cron `0 9 * * *`. HTTP Request node fetch bất kỳ URL.

</details>

<details>
<summary>✅ Solution</summary>

Workflow: Schedule → HTTP Request → Execute Command → Send Email

Schedule: `0 9 * * *` (9am daily)

Execute Command:
```json
{
  "command": "claude",
  "arguments": "-p \"Summarize top 5 stories từ page này:\n\n{{ $json.data }}\""
}
```

</details>

### Exercise 3: Multi-Step Pipeline

**Mục tiêu**: Chain nhiều Claude call: analyze → suggest → format.

**Hướng dẫn**:
1. Webhook input với raw text
2. Claude #1: Analyze sentiment
3. Claude #2: Suggest action
4. Claude #3: Format bullet points
5. Return final output

<details>
<summary>💡 Hint</summary>

Mỗi Execute Command output thành input cho node tiếp. Reference với `$('NodeName').first().json.stdout`.

</details>

<details>
<summary>✅ Solution</summary>

Workflow: Webhook → Execute Command (Analyze) → Execute Command (Suggest) → Execute Command (Format) → Respond to Webhook

**Node 1 - Analyze:**
```json
{
  "command": "claude",
  "arguments": "-p \"Analyze text này cho sentiment và key point:\n\n{{ $json.text }}\""
}
```

**Node 2 - Suggest:**
```json
{
  "command": "claude",
  "arguments": "-p \"Dựa trên analysis này, suggest 3 action:\n\n{{ $('Execute Command').first().json.stdout }}\""
}
```

**Node 3 - Format:**
```json
{
  "command": "claude",
  "arguments": "-p \"Format suggestions thành bullet points:\n\n{{ $('Execute Command1').first().json.stdout }}\""
}
```

Test:
```bash
curl -X POST http://localhost:5678/webhook/pipeline \
  -H "Content-Type: application/json" \
  -d '{"text": "Khách hàng phàn nàn về delivery chậm."}'
```

</details>

---

## 5. CHEAT SHEET

### Quick Start

```bash
npm install -g n8n
export ANTHROPIC_API_KEY="sk-ant-..."
n8n start
# Mở http://localhost:5678
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

### Common Trigger

| Trigger | Use Case |
|---------|----------|
| Webhook | External event, API call |
| Schedule | Cron-based, daily/hourly |
| Email (IMAP) | Incoming email |
| Database | Row change |

### Data Reference

```javascript
{{ $json.field }}                    // Node hiện tại
{{ $('NodeName').first().json.field }}  // Node khác
{{ $input.first().json.stdout }}     // Trong Code node
```

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Claude CLI không trong PATH của n8n | Dùng full path: `/usr/local/bin/claude` |
| API key không available | Set `ANTHROPIC_API_KEY` trước khi start n8n |
| Không timeout cho Claude call | Set timeout trong Execute Command (60000ms+) |
| Quote làm hỏng prompt | Dùng Set node prepare prompt phức tạp |
| Ignore Claude error | Check `exitCode` và `stderr` trong output |
| Prompt quá dài trong command line | Ghi temp file, pass file path |
| Không error handling | Add Error Trigger node bắt failure |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Marketing agency Việt Nam nhận 50+ client brief mỗi ngày qua email. Manual process tốn 2 giờ mỗi sáng.

**Problem**: Brief đến với format khác nhau. Staff phải đọc từng cái, extract requirement, log spreadsheet, tạo project card, notify team. Error-prone và chậm.

**n8n + Claude Solution**:

```
[Email Trigger] → [Claude: Extract] → [Claude: Suggest] → [Google Sheets]
                                                              ↓
                                          [Slack] ← [Trello: Create Card]
```

**Implementation**:
1. Email đến với client brief
2. Claude extract: tên client, deadline, requirement, budget
3. Claude suggest: team assignment, approach, timeline
4. Auto-log vào Google Sheets
5. Tạo Trello card với all detail
6. Notify Slack channel phù hợp

**Result** (sau 2 tháng):
- Process time: 2 giờ → 5 phút (chỉ review)
- Zero brief miss
- Format extract consistent
- Marketing manager tự modify workflow — không cần engineering

**Quote**: "n8n cho marketing manager build AI automation không cần hỏi engineering. Cô ấy just drag and drop. Từ 'anh ơi build cho em' thành 'em build xong rồi.'"

**Cost**: n8n free (self-hosted). Claude API: ~$30/tháng cho 50 brief/ngày.

---

> **Tiếp theo**: [Module 12.2: Các mẫu Workflow](../02-workflow-patterns/) →
