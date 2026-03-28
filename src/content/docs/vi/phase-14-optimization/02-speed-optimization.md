---
title: 'Tối ưu Tốc độ'
description: 'Tăng tốc độ làm việc với Claude Code: parallel execution, caching context và giảm latency.'
---

# Module 14.2: Tối ưu Tốc độ

> **Thời gian ước tính**: ~30 phút
>
> **Yêu cầu trước**: Module 14.1 (Tối ưu Task)
>
> **Kết quả**: Sau module này, bạn sẽ biết kỹ thuật reduce response time, hiểu speed/quality tradeoff, và optimize cho different scenario.

---

## 1. WHY — Tại sao cần học

Bạn đang chờ. Claude "thinking" 2 phút cho một simple task. Hoặc tệ hơn, 5 phút rồi không biết nó stuck hay đang working. Time cộng dồn — 10 slow task/ngày × 3 phút extra = 30 phút wasted mỗi ngày.

Speed optimization trả lại thời gian đó. Clear prompt, clean context, right model choice — những thứ này compound thành significant productivity gain.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Speed Factor

| Factor | Chậm | Nhanh |
|--------|------|-------|
| **Prompt** | Vague, mơ hồ | Clear, specific |
| **Context** | 100K token | 10K token |
| **Task** | Complex, multi-step | Focused, single |
| **Model** | Opus (smartest) | Haiku (fastest) |
| **Output** | Long explanation | Just code |

### Speed Formula

```text
Response Time = f(Context Size, Task Complexity, Output Length, Model)

Optimize từng factor:
- Context: /clear thường xuyên, loại file không liên quan
- Complexity: Break thành task đơn giản hơn (Module 14.1)
- Output: "Code only, no explanation"
- Model: Dùng model nhanh nhất mà vẫn work
```

### Context Management cho Speed

```text
Heavy context:                 Light context:
─────────────────────────────────────────────────
50 file loaded                3 file liên quan
Full conversation history     Fresh session
All project documentation     Chỉ những gì cần
                    ↓                    ↓
Result: 60 sec response       Result: 10 sec response
```

### Model Selection Strategy

```text
Task Complexity → Model Choice
────────────────────────────────────────────────
Simple (format, small edit)   → Haiku (fastest)
Medium (implement feature)    → Sonnet (balanced)
Complex (architecture, debug) → Opus (smartest)
```

### Output Optimization

- **"Code only, no explanation"** — tiết kiệm output generation time
- **"One file at a time"** — nhanh hơn multiple file
- **"Diff format"** — nhanh hơn full file rewrite

### So Sánh Model Chi Tiết Theo Loại Tác Vụ

Ngoài tốc độ chung, mỗi model có thế mạnh ở các loại tác vụ khác nhau:

| Loại Tác Vụ | Haiku | Sonnet | Opus | Khuyến Nghị |
|-------------|-------|--------|------|-------------|
| **Formatting/Linting** | Xuất sắc | Quá mức | Quá mức | Haiku — tốc độ quan trọng nhất, chất lượng đủ |
| **Simple CRUD** | Tốt | Xuất sắc | Quá mức | Sonnet — cần hiểu pattern |
| **Tính năng phức tạp** | Kém | Tốt | Xuất sắc | Opus — cần suy luận kiến trúc |
| **Sửa Bug** | Bug đơn giản | Hầu hết bug | Bug phức tạp | Khớp model với độ phức tạp bug |
| **Code Review** | Vấn đề style | Vấn đề logic | Vấn đề kiến trúc | Khớp model với độ sâu review |
| **Viết Test** | Test cơ bản | Test kỹ lưỡng | Test edge case | Sonnet cho hầu hết, Opus cho critical paths |
| **Documentation** | Tốt | Xuất sắc | Quá mức | Sonnet — cần hiểu context |
| **Refactoring** | Đổi tên/di chuyển | Tái cấu trúc | Kiến trúc | Khớp model với phạm vi refactoring |

### Tốc Độ vs Chất Lượng vs Chi Phí

```text
         Tốc độ               Chất lượng           Chi phí
Haiku:   ██████████  10/10    ████░░░░░░  4/10     █░░░░░░░░░  1/10
Sonnet:  ██████░░░░   6/10    ████████░░  8/10     ████░░░░░░  4/10
Opus:    ███░░░░░░░   3/10    ██████████ 10/10     ████████░░  8/10
```

**Quy tắc**: Mặc định dùng **Sonnet** cho công việc hàng ngày. Chuyển sang **Haiku** cho batch operations và tác vụ đơn giản. Nâng lên **Opus** chỉ khi chất lượng output của Sonnet không đủ cho tác vụ cụ thể. Một startup Việt Nam đã giảm chi phí Claude từ $1,200 xuống $380/tháng bằng cách áp dụng cách tiếp cận này.

---

## 3. DEMO — Từng bước cụ thể

**Scenario**: Implement utility function (string helper).

### Slow Approach

```text
[Session với 50K context từ work trước]

Bạn: Tạo utility function cho app. Cần string helper,
date formatter, và validator. Explain mỗi function và
thêm comprehensive documentation.

Claude: [Thinking... 90 giây]
[Response dài với explanation, 200+ dòng]

Total time: ~3 phút
```

### Fast Approach

```bash
$ claude
# Fresh session, clean context
```

```text
Bạn: Tạo src/utils/strings.ts với các function:
- capitalize(str): Viết hoa chữ đầu
- slugify(str): Convert thành URL slug
- truncate(str, len): Cắt ngắn với ellipsis

Code only, no explanation.

Claude: [Thinking... 15 giây]
```

```typescript
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '...' : str;
}
```

**Total time: ~20 giây**

### So sánh Tốc độ

| Metric | Slow | Fast |
|--------|------|------|
| Time | 3 phút | 20 giây |
| Speedup | - | **9x nhanh hơn** |

**Thay đổi gì**:
- Fresh context (không 50K baggage)
- Specific scope (một file, ba function)
- "Code only" (không explanation overhead)
- Clear requirement (exact function signature)

### Parallel Execution

```bash
# Chạy 3 task độc lập cùng lúc
claude -p "Tạo src/utils/strings.ts: capitalize, slugify" &
claude -p "Tạo src/utils/dates.ts: formatDate, parseDate" &
claude -p "Tạo src/utils/validators.ts: isEmail, isURL" &
wait

# Total: ~25 giây (thay vì 75 giây sequential)
```

---

## 4. PRACTICE — Luyện tập

### Bài 1: Context Diet

**Mục tiêu**: Trải nghiệm impact của context size.

**Hướng dẫn**:
1. Note context size hiện tại
2. Dùng `/clear` và reload chỉ file essential
3. Chạy cùng task
4. So sánh response time

<details>
<summary>💡 Gợi ý</summary>

Lệnh `/cost` hiện token usage. So sánh trước và sau `/clear`.

</details>

<details>
<summary>✅ Giải pháp</summary>

Kết quả typical:
- Heavy context (50K token): 45-90 giây response
- Light context (5K token): 10-20 giây response
- Speedup: 3-5x nhanh hơn với clean context

</details>

### Bài 2: Output Trimming

**Mục tiêu**: Đo impact của output length.

**Hướng dẫn**:
1. Yêu cầu Claude implement với full explanation
2. Bấm giờ
3. Yêu cầu cùng thứ với "code only, no explanation"
4. So sánh time

<details>
<summary>💡 Gợi ý</summary>

Output generation tốn time. Less output = faster response.

</details>

<details>
<summary>✅ Giải pháp</summary>

Kết quả typical:
- Với explanation: 30-60 giây, 100+ dòng output
- Code only: 10-20 giây, 20 dòng output
- Speedup: 2-3x nhanh hơn

</details>

### Bài 3: Model Comparison

**Mục tiêu**: Hiểu model speed/quality tradeoff.

**Hướng dẫn**:
1. Pick một medium-complexity task
2. Thử với different model nếu available
3. So sánh: time, quality, appropriateness

<details>
<summary>💡 Gợi ý</summary>

Haiku nhanh nhất nhưng có thể miss nuance. Opus smart nhất nhưng chậm. Sonnet balance cả hai.

</details>

<details>
<summary>✅ Giải pháp</summary>

Cho simple formatting: Haiku (fast, sufficient quality)
Cho feature implementation: Sonnet (balanced)
Cho complex debugging: Opus (worth the wait)

Match model với task complexity.

</details>

---

## 5. CHEAT SHEET

### Speed Technique

```text
# Fresh context
/clear

# Minimal output
"Code only, no explanation"
"Just the function, no tests"
"Diff format only"

# Focused scope
"Only modify [file]"
"Just the [component]"
```

### Model Selection

| Task Type | Model | Vì sao |
|-----------|-------|--------|
| Simple edit | Haiku | Fastest |
| Feature | Sonnet | Balanced |
| Complex debug | Opus | Smartest |

### Parallel Execution

```bash
claude -p "task 1" &
claude -p "task 2" &
wait
```

### Context Management

- `/clear` giữa các task không liên quan
- Load chỉ file đang work
- Exclude node_modules, build artifact

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Never clear context | `/clear` cho fresh start |
| Always dùng Opus | Match model với task complexity |
| Ask explanation không đọc | "Code only" cho speed |
| Load entire codebase | Load chỉ relevant file |
| Sequential khi có thể parallel | Use multiple session |
| Optimize quá sớm | Working first, speed sau |
| Sacrifice quality cho speed | Speed maintain quality |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Agency Việt Nam, developer complain Claude "quá chậm" — 2-3 phút response time làm unusable cho quick task.

**Audit Finding**:
- Average context: 80K token (tích lũy nhiều ngày)
- Ask explanation mọi task
- Dùng Opus cho simple formatting
- Never dùng `/clear`

**Speed Optimization Protocol**:

| Thay đổi | Trước | Sau |
|----------|-------|-----|
| Daily fresh session | Never | Mỗi sáng |
| Context clearing | Never | Giữa project |
| Output style | Với explanation | Code only (default) |
| Model matching | Always Opus | Task-appropriate |

**Kết quả**:
- Average response: 2.5 phút → 30 giây (5x nhanh hơn)
- Developer satisfaction: "Claude feels snappy now"
- No quality reduction

**Quote**: "Chúng tôi bắt Claude mang ba lô 80K token đi khắp nơi. Không lạ nó chậm. Đi nhẹ thay đổi mọi thứ."

---

> **Tiếp theo**: [Module 14.3: Tối ưu Chất lượng](../03-quality-optimization/) →
