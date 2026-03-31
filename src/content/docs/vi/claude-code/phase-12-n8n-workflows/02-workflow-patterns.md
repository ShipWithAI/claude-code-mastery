---
title: 'Các mẫu Workflow'
description: 'Các mẫu workflow phổ biến với Claude Code và n8n: auto-deploy, monitoring và report generation.'
---

# Module 12.2: Các mẫu Workflow

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Module 12.1 (Claude Code + n8n)
>
> **Kết quả**: Sau module này, bạn sẽ biết 6 workflow pattern tái sử dụng, hiểu khi nào apply từng pattern, và combine pattern cho complex scenario.

---

## 1. WHY — Tại sao cần học

Bạn build được one-off n8n workflow. Nhưng mỗi automation mới như bắt đầu từ số 0. Approach không nhất quán, lỗi lặp lại, workflow khó maintain.

Workflow pattern là "công thức" của automation. Giống như software design pattern (Factory, Observer, Strategy), đây là proven solution cho recurring problem. Biết pattern = nhanh chóng assemble solution cho hầu hết AI automation challenge.

---

## 2. CONCEPT — Ý tưởng cốt lõi

### Pattern 1: Sequential Pipeline

```
[Input] → [Claude: Step 1] → [Claude: Step 2] → [Claude: Step 3] → [Output]
```

**Dùng khi**: Task phải theo thứ tự, mỗi step cần output của step trước.
**Ví dụ**: Extract → Analyze → Summarize → Format

### Pattern 2: Parallel Fan-Out/Fan-In

```
         ┌→ [Claude: Task A] →┐
[Input] ─┼→ [Claude: Task B] →┼→ [Merge] → [Output]
         └→ [Claude: Task C] →┘
```

**Dùng khi**: Independent task có thể chạy đồng thời.
**Ví dụ**: Analyze document cho sentiment, keyword, và entity cùng lúc.

### Pattern 3: Classification Router

```
[Input] → [Claude: Classify] → [Switch] ─→ [Handler A]
                                      ├→ [Handler B]
                                      └→ [Handler C]
```

**Dùng khi**: Input khác nhau cần processing path khác nhau.
**Ví dụ**: Route support ticket theo category (billing, technical, urgent).

### Pattern 4: Human-in-the-Loop

```
[Input] → [Claude: Draft] → [Wait for Approval] → [IF Approved] → [Execute]
                                                        ↓ No
                                               [Claude: Revise] → [Back to Wait]
```

**Dùng khi**: AI output cần human review trước khi action.
**Ví dụ**: Email draft, code change, content publishing.

### Pattern 5: Batch Processing

```
[Input List] → [Split In Batches] → [Claude: Process Each] → [Aggregate] → [Output]
```

**Dùng khi**: Process nhiều item, cần rate limiting hoặc chunking.
**Ví dụ**: Analyze 100 document, 10 cái một lần.

### Pattern 6: Error Recovery Loop

```
[Input] → [Claude: Try] → [IF Error] → [Claude: Fix] → [Retry]
                              ↓ Success
                          [Output]
```

**Dùng khi**: Claude có thể fail, cần graceful retry.
**Ví dụ**: Code generation với validation.

---

## 3. DEMO — Từng bước thực hành

### Demo 1: Sequential Pipeline — Content Creation

**Workflow**: `[Webhook] → [Research] → [Outline] → [Write] → [Edit] → [Output]`

**Research Node**: `claude -p "Tìm 5 điểm chính về: {{ $json.topic }}"`

**Outline Node**: `claude -p "Tạo outline từ các điểm:\n\n{{ $json.stdout }}"`

**Write Node**: `claude -p "Viết bài 500 từ từ outline:\n\n{{ $json.stdout }}"`

**Edit Node**: `claude -p "Edit cho clear và SEO:\n\n{{ $json.stdout }}"`

**Test**: `curl -X POST http://localhost:5678/webhook/blog -d '{"topic": "remote work"}'`

### Demo 2: Classification Router — Support Ticket

**Classify Node**: `claude -p "Classify thành billing/technical/general/urgent. Trả về CHỈ category:\n\n{{ $json.description }}"`

**Code Node (clean output)**:
```javascript
const category = $input.first().json.stdout.trim().toLowerCase();
return [{ json: { category, original: $('Webhook').first().json } }];
```

**Switch Node**: Map `billing`→0, `technical`→1, `urgent`→2, `general`→3

**Connect**: Output 0→#billing-support, 1→#engineering, 2→PagerDuty, 3→Auto-response

**Test**: `curl -X POST http://localhost:5678/webhook/ticket -d '{"description": "Payment bị fail!"}'`

### Demo 3: Batch Processing — Document Analysis

**Split In Batches**: Size 10, reset mỗi run

**Execute Command**: `claude -p "Summarize mỗi document:\n\n{{ JSON.stringify($json) }}"`

**Merge Node**: "Merge By Position" để collect tất cả output

---

## 4. PRACTICE — Luyện tập

### Bài 1: Sequential Pipeline

**Mục tiêu**: Build 3-step translation pipeline.

**Hướng dẫn**:
1. Webhook nhận text bất kỳ ngôn ngữ
2. Claude #1: Detect language
3. Claude #2: Translate sang English
4. Claude #3: Summarize 1 câu
5. Return summary

<details>
<summary>💡 Hint</summary>

Mỗi Execute Command output ở `$json.stdout`. Reference với `{{ $json.stdout }}` trong node tiếp theo.

</details>

<details>
<summary>✅ Solution</summary>

**Node 1 - Detect:** `claude -p "Language này là gì? Trả lời tên ngôn ngữ thôi:\n\n{{ $json.text }}"`

**Node 2 - Translate:** `claude -p "Translate sang English:\n\n{{ $('Webhook').first().json.body.text }}"`

**Node 3 - Summarize:** `claude -p "Summarize 1 câu:\n\n{{ $json.stdout }}"`

</details>

### Bài 2: Classification Router

**Mục tiêu**: Route message theo type khác nhau.

**Hướng dẫn**:
1. Claude classify: question, complaint, feedback, spam
2. Switch route tới 4 Slack channel khác nhau
3. Test với 10 input khác nhau

<details>
<summary>💡 Hint</summary>

Cho Claude return CHỈ category name. Dùng Code node clean/lowercase output trước Switch node.

</details>

<details>
<summary>✅ Solution</summary>

**Classify prompt:** `"Classify thành question/complaint/feedback/spam. Trả về CHỈ từ đó:\n\nMessage: {{ $json.message }}"`

**Code node:**
```javascript
return [{ json: { type: $input.first().json.stdout.trim().toLowerCase() } }];
```

**Switch rules:** Map mỗi type tới output 0-3, connect tới Slack node tương ứng.

</details>

### Bài 3: Batch Processing

**Mục tiêu**: Process 20 item theo batch 5.

**Hướng dẫn**:
1. Webhook nhận array 20 item
2. Split In Batches (size 5)
3. Claude summarize mỗi batch
4. Merge tất cả result

<details>
<summary>💡 Hint</summary>

Sau Split In Batches, workflow chạy 4 lần (20/5). Dùng Merge node cuối để collect output.

</details>

<details>
<summary>✅ Solution</summary>

**Split In Batches:** Batch Size = 5

**Execute Command:** `claude -p "Summarize các item:\n\n{{ JSON.stringify($json) }}"`

**Merge node:** Mode = "Merge By Position"

</details>

---

## 5. CHEAT SHEET

### Pattern Selection Guide

| Scenario | Pattern |
|----------|---------|
| Multi-step transformation | Sequential Pipeline |
| Independent parallel task | Fan-Out/Fan-In |
| Xử lý khác nhau theo type | Classification Router |
| Cần human approval | Human-in-the-Loop |
| Nhiều item cần process | Batch Processing |
| Có thể fail, cần retry | Error Recovery Loop |

### Key n8n Node

| Node | Mục đích |
|------|----------|
| `Split In Batches` | Chunk array thành nhóm nhỏ |
| `Merge` | Combine parallel branch |
| `Switch` | Multi-way routing (3+ path) |
| `Wait` | Pause chờ external webhook |
| `IF` | Binary branching (2 path) |

### Data Passing

```javascript
{{ $json.stdout }}                    // Claude output từ node trước
{{ $('NodeName').first().json.field }} // Field cụ thể từ node có tên
{{ JSON.stringify($json) }}            // Serialize cho Claude prompt
```

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Một Claude call khổng lồ | Chia thành sequential step với prompt rõ ràng |
| Sequential khi parallel được | Fan-out cho independent task (nhanh 3x) |
| Không human review cho risky action | Human-in-the-loop cho email, payment, publishing |
| Process 1000 item cùng lúc | Batch processing với rate limiting (10-20/batch) |
| Không error handling | Error Recovery pattern cho production |
| Hardcoded routing rule | Claude classify, Switch node route |
| Mix pattern random | Choose primary pattern, compose intentionally |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Công ty e-commerce Việt Nam process 200+ customer review mỗi ngày. Cần: analyze sentiment, extract product issue, route team phù hợp, respond.

**Problem**: Manual process tốn 4 tiếng/ngày. Response không consistent. Negative review đôi khi bị miss.

**Multi-Pattern Solution**:

```
Pattern 1: Batch Processing
└─ 200 review → batch 20

    Pattern 2: Sequential Pipeline (per review)
    └─ Analyze sentiment → Extract issue → Generate response

        Pattern 3: Classification Router
        └─ positive → Marketing | negative → Support | neutral → Product

            Pattern 4: Human-in-the-Loop
            └─ Negative review cần manager approval
```

**Result** (sau 1 tháng):
- Processing time: 4 tiếng → 30 phút
- Response consistency: 100% theo cùng format
- Escalation: Zero negative review bị miss
- Customer satisfaction: +15%

**Quote**: "Pattern cho build 2 ngày thay vì 2 tuần custom code. Team support giờ chỉ review và approve."

---

> **Tiếp theo**: [Module 12.3: Điều phối n8n + SDK](../03-n8n-sdk-orchestration/) →
