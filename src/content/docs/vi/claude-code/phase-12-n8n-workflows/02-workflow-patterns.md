---
title: 'Các mẫu Workflow'
description: 'Năm mẫu n8n tái sử dụng để gọi agent-service: fan-out, merge, gộp kết quả, error recovery và human approval.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 12.2: Các mẫu Workflow

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Module 12.1 (Claude Code + n8n)
>
> **Kết quả**: Sau module này, bạn sẽ biết năm mẫu tái sử dụng để gọi `agent-service` từ n8n, và
> ghép được chúng cho workflow xử lý batch, error-recovery, và cần approval.

---

## 1. WHY — Tại sao cần học

Một node HTTP Request gọi `agent-service` chỉ là demo. Workflow thật cần xử lý nhiều item, sống
sót qua một call trả về câu từ chối thay vì câu trả lời, và đôi khi phải dừng chờ người duyệt
trước khi làm gì rủi ro. Không có pattern để dựa vào, mỗi workflow lại tự bịa ra cách riêng —
không nhất quán, và thường không có error handling cho tới khi vỡ trận ở production.

---

## 2. CONCEPT — Ý tưởng cốt lõi

Cả năm pattern đều dựng trên cùng kiến trúc ở Module 12.1: **HTTP Request node →
`agent-service` → JSON result**. Cái thay đổi là những gì bao quanh call đó.

### Pattern 1: Sequential Pipeline

```text
[Webhook] → [HTTP Request: agent-service] → [Code: reshape] → [HTTP Request: agent-service] → [Output]
```
**Dùng khi** mỗi step cần output của step trước. **Ví dụ**: extract dữ liệu có cấu trúc, rồi draft
response từ đó, trong hai prompt riêng (hai call riêng giữ mỗi prompt tập trung và mỗi
`total_cost_usd` nhìn thấy được).

### Pattern 2: Fan-Out / Fan-In với Loop Over Items

```text
[Webhook: items[]] → [Loop Over Items] → [HTTP Request: agent-service] → [Merge] → [Output]
```
**Dùng khi** bạn có một list và muốn gọi service một lần mỗi item, thay vì nhồi cả list vào một
prompt. Node **Loop Over Items** (`n8n-nodes-base.splitInBatches` — tên hiện tại trên UI là "Loop
Over Items"; docs cũ và tên node bên trong vẫn ghi "Split in Batches") nhận một **Batch Size**;
set `1` để xử lý từng item một, hoặc cao hơn để gửi nhóm nhỏ mỗi call. Docs: "The Loop Over Items
node helps you loop through data when needed... with each iteration, returns a predefined amount
of data through the loop output."

### Pattern 3: Merge theo Position

```text
[Loop Over Items] → [HTTP Request: agent-service] → [Merge: Combine → Position] → [Code: $input.all()]
```
**Dùng khi** bạn fan-out theo item và cần ghép lại kết quả từng item đúng thứ tự. Mode **Combine**
của node **Merge** có option **Combine By** tên **Position** (docs: "the item at index 0 in Input
1 merges with the item at index 0 in Input 2, and so on") — ở đây không phải hai input riêng, mà
là output tích lũy của loop ghép lại với item gốc. Một node **Code** theo sau đọc mọi thứ bằng
`$input.all()` — "All input items in current node" — để dựng list kết quả cuối cùng.

### Pattern 4: Error Recovery

```text
[HTTP Request: agent-service] → [Code: check result] → [IF: refused or errored?] → [HTTP Request: retry với prompt chặt hơn]
                                                              ↓ no
                                                          [Output]
```
**Dùng khi** call tới service có thể trả về câu từ chối bằng text thuần thay vì lỗi HTTP — Agent
SDK vẫn báo `subtype: "success"` khi Claude chỉ đơn giản từ chối request bằng lời, nên một node IF
chỉ check HTTP status sẽ bỏ sót. Check chuỗi `result` trước, trong một node Code.

### Pattern 5: Human-in-the-Loop

```text
[HTTP Request: agent-service (draft)] → [Wait] → [IF: approved?] → [HTTP Request: agent-service (apply)]
                                                        ↓ no
                                                    [Output: rejected]
```
**Dùng khi** câu trả lời của agent không nên tự hành động — một draft reply, một thay đổi được đề
xuất. Node **Wait** ("Wait before continue with execution") tạm dừng workflow tới khi một webhook
call resume nó, cho người đủ thời gian approve hoặc reject ở giữa.

---

## 3. DEMO — Từng bước thực hành

Các pattern dưới đây cấu hình node xoay quanh cùng call HTTP Request → `agent-service` đã chạy
thật thành công end-to-end ở Bước 6, Module 12.1 — JSON vào/ra giống hệt, nên phần dưới đây là
cấu hình, không phải chạy lại lần hai cùng một call.

**Fan-out (Pattern 2)**: thêm node **Loop Over Items** giữa trigger và node HTTP Request. Mở nó,
set **Batch Size** = `1`. Mỗi iteration gửi `$json` của một item vào cùng body
`{"prompt": "{{ $json.body.prompt }}"}` như ở 12.1.

**Merge theo position (Pattern 3)**: sau HTTP Request node của loop, thêm node **Merge**, set
**Mode** = `Combine`, set **Combine By** = `Position`. Nối output "done" của loop vào input thứ
hai của Merge node để các iteration không cặp đôi không bị âm thầm bỏ (option "Include Any
Unpaired Items" kiểm soát việc này; mặc định tắt).

**Gộp kết quả với Code node (Pattern 3, tiếp)**:
```javascript
// docs: https://docs.n8n.io/build/work-with-data/transform-data/expression-reference/nodeinputdata
const items = $input.all();
return items.map(item => ({ json: { result: item.json.result } }));
```

**Error recovery (Pattern 4)** — một câu từ chối thật lấy từ `agent-service` đang chạy, dùng prompt
yêu cầu một tool ngoài `allowedTools`:
```bash
curl -s localhost:8787/run -H 'content-type: application/json' \
  -d '{"prompt":"Create a new file named notes.txt in this repo with the text hello."}'
```
Expected output:
```text
# Output may vary
{"result":"I don't have permission to create new files in this environment. The file creation was blocked by the system's permission settings.\n\nWould you like me to try a different approach, or do you need to adjust the permissions to allow file creation?","session_id":"bba6f51b-8d1d-4406-a967-49f59b6b33fc","total_cost_usd":0.0558}
```
Chú ý: call HTTP vẫn trả `200` với JSON body trông bình thường — câu từ chối nằm bên trong
`result`. Node Code trong nhánh error-recovery nên check chữ như "don't have permission" (hoặc
tốt hơn, yêu cầu agent luôn prefix lỗi bằng một token cố định để match) trước khi quyết định có
retry không.

**Human approval (Pattern 5)**: sau node HTTP Request "draft", thêm node **Wait** cấu hình resume
qua một webhook call; gửi draft lên Slack kèm link approve/reject bấm vào webhook resume đó, rồi
branch theo response trước khi call `agent-service` thứ hai chạy.

---

## 4. PRACTICE — Luyện tập

### Bài 1: Batch năm item

**Mục tiêu**: Xử lý năm prompt từng cái một thay vì gộp vào một prompt to.

**Hướng dẫn**:
1. Cho Webhook nhận body JSON có array `prompts` gồm năm câu hỏi ngắn.
2. **Loop Over Items** Batch Size `1`, rồi cùng node HTTP Request → `agent-service` ở 12.1.
3. **Merge** (Combine → Position), rồi node Code với `$input.all()` để gộp năm kết quả thành một
   array.

**Kết quả mong đợi**: Output cuối là array năm object `{result, session_id, total_cost_usd}`, mỗi
cái một prompt, đúng thứ tự ban đầu.

<details>
<summary>💡 Hint</summary>
Output không-"done" của loop nối vào node HTTP Request; output "done" của nó là cái bạn nối vào
input thứ hai của node Merge.
</details>

<details>
<summary>✅ Solution</summary>
Webhook → Loop Over Items → HTTP Request (agent-service) → quay lại Loop Over Items → (khi done) →
Merge (Combine, Position) → Code (`$input.all()`) → Respond to Webhook.
</details>

### Bài 2: Detect từ chối mà không đoán mò cách diễn đạt tiếng Anh

**Mục tiêu**: Làm node IF trong error-recovery đáng tin cậy hơn là match chuỗi "don't have
permission".

**Hướng dẫn**:
1. Đổi template prompt để kết thúc bằng: `If you cannot complete this, respond with exactly the
   single word REFUSED and nothing else.`
2. Chạy lại curl ở Bài 2 của 12.1 với request ngoài `allowedTools`.
3. Branch node IF theo `{{ $json.result.trim() === 'REFUSED' }}` thay vì match substring.

<details>
<summary>💡 Hint</summary>
Một sentinel token cố định trong prompt đáng tin cậy hơn nhiều so với match theo cách diễn đạt
ngôn ngữ tự nhiên của model, qua nhiều ngôn ngữ và văn phong khác nhau.
</details>

<details>
<summary>✅ Solution</summary>
Đây chính là ý tưởng Module 12.3 đẩy xa hơn với structured output: thay vì parse văn xuôi, yêu
cầu (hoặc cấu hình) một format bạn check được chính xác.
</details>

---

## 5. CHEAT SHEET

| Pattern | Node chính |
|---|---|
| Sequential Pipeline | Hai node HTTP Request, node sau đọc `result` của node trước |
| Fan-Out / Fan-In | **Loop Over Items** (Batch Size) → HTTP Request |
| Merge theo Position | **Merge** → Mode: Combine → Combine By: **Position** |
| Gộp kết quả | Code node: `$input.all()` |
| Error Recovery | Code node check text `result` → IF → retry HTTP Request |
| Human-in-the-Loop | Node **Wait** (resume qua webhook) → IF: approved? |

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|---|---|
| Gọi node bằng tên batching cũ trước khi đổi tên | Tên hiện tại trên UI là **Loop Over Items** |
| Chỉ check HTTP status để bắt lỗi | Service vẫn trả `200` khi từ chối — check text `result` hoặc sentinel token |
| Nhồi 100 item vào một prompt | **Loop Over Items** với Batch Size nhỏ, mỗi call `agent-service` xử lý một item hoặc nhóm nhỏ |
| Merge mà không check unpaired item | Xem lại "Include Any Unpaired Items" trên node Merge trước khi giả định không mất gì |
| Để agent hành động trước khi người xem draft | Chèn node **Wait** cho bất cứ gì publish, tốn tiền, hoặc xóa |
| Dùng `$items()` từ n8n bản cũ | Expression hiện tại là `$input.all()` trong node Code |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Một team e-commerce Việt Nam nhận 200+ review khách hàng mỗi ngày, muốn triage từng
cái: sentiment, product issue, và một reply đề xuất route tới đúng team.

**Problem**: Một prompt khổng lồ cho cả batch review khó debug — một review tệ trong batch 20 cái
làm output của cả call khó đoán, và không có cách retry riêng đúng review làm model bối rối.

**Solution**: **Loop Over Items** Batch Size `1` gửi một review mỗi call `agent-service`. **Merge
(Combine → Position)** ghép kết quả từng review lại đúng với ID review gốc. Nhánh error-recovery
check mỗi kết quả có sentinel `REFUSED` không và retry với prompt đơn giản hơn. Kết quả sentiment
âm route qua node **Wait** chờ manager approve trước khi reply được gửi.

**Result**: Mỗi review retry độc lập được, một review bị kẹt không còn chặn cả batch, và bước
manager approval nghĩa là không auto-reply nào tới tay khách hàng đang giận mà chưa ai xem qua.

---

> **Tiếp theo**: [Module 12.3: Điều phối n8n + SDK](../03-n8n-sdk-orchestration/) →
