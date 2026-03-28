---
title: 'Tối ưu Chi phí'
description: 'Giảm chi phí sử dụng Claude Code: tiết kiệm token, chọn model phù hợp và theo dõi usage hiệu quả.'
---

# Module 14.4: Tối ưu Chi phí

> **Thời gian ước tính**: ~35 phút
>
> **Yêu cầu trước**: Module 14.3 (Tối ưu Chất lượng)
>
> **Kết quả**: Sau module này, bạn sẽ hiểu Claude Code pricing, biết track và reduce cost, và make informed model/usage decision.

---

## 1. WHY — Tại sao cần học

Cuối tháng, API bill gấp 3 lần expected. Tiền đi đâu? Hóa ra developer dùng Opus cho mọi thứ, một người khác để session chạy với huge context. Cost add up nhanh.

Cost optimization cho bạn control. Biết token đi đâu. Chọn đúng model. Tránh waste. Make Claude Code sustainable — không phải budget crisis đợi xảy ra.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Cost Formula

```text
Cost = (Input Token × Input Price) + (Output Token × Output Price)

Price vary theo model:
- Opus: Đắt nhất (complex reasoning)
- Sonnet: Trung bình (general coding)
- Haiku: Rẻ nhất (simple task)
```

### Token Economics

⚠️ Pricing thay đổi — verify rate hiện tại tại anthropic.com

| Model | Input (per 1M) | Output (per 1M) | Best For |
|-------|----------------|-----------------|----------|
| Opus | ~$15 | ~$75 | Complex architecture |
| Sonnet | ~$3 | ~$15 | Daily coding |
| Haiku | ~$0.25 | ~$1.25 | Quick task |

### Cost Driver

```text
High Cost:                    Low Cost:
─────────────────────────────────────────────────
Large context (80K+)          Fresh context
Opus cho mọi thứ              Model matching
Long output                   Concise request
Repeated similar query        Caching/reuse
Debug loop                    Get it right first time
```

### Quy tắc 80/20

80% cost thường đến từ 20% usage. Identify expensive pattern trước:
- Big context session
- Opus overuse
- Debug loop

### Cost vs Value Matrix

```text
High Value + Low Cost   → Maximize (Haiku cho simple task)
High Value + High Cost  → Justify (Opus cho architecture)
Low Value + Low Cost    → Ignore (minimal impact)
Low Value + High Cost   → Eliminate (wasteful pattern)
```

---

## 3. DEMO — Từng bước cụ thể

**Scenario**: Team đang spend $500/month muốn reduce xuống $300 mà không mất productivity.

### Bước 1: Audit Usage Hiện tại

```text
Cost Breakdown (sample month):

By Model:
- Opus:   $350 (70%) ← Red flag: overuse
- Sonnet: $120 (24%)
- Haiku:  $30 (6%)

By Activity:
- Code generation: $250
- Debugging: $150 ← Red flag: loop
- Code review: $70
- Documentation: $30
```

### Bước 2: Xác định Target Optimization

| Vấn đề | Hiện tại | Target | Action |
|--------|----------|--------|--------|
| Opus overuse | $350 | $150 | 60% task → Sonnet |
| Debug loop | $150 | $50 | Better context, ít attempt |
| Large context | - | -50% | Regular `/clear` |

### Bước 3: Thêm Cost Guideline vào CLAUDE.md

```markdown
## Cost Guideline

**Default model**: Sonnet
**Dùng Haiku cho**: formatting, simple edit, quick question
**Chỉ dùng Opus cho**: architecture decision, complex debugging

**Trước khi dùng Opus, hỏi**:
1. Đây có thực sự là complex reasoning?
2. Đã thử Sonnet chưa?
3. Value có đáng 5x cost không?

**Thói quen**:
- `/clear` giữa các task không liên quan
- "Code only" cho implementation task
```

### Bước 4: Model Selection Thực tế

```text
Task: "Fix typo trong README"
Trước: Opus ($0.50) → Sau: Haiku ($0.02)
Tiết kiệm: 96%

Task: "Implement CRUD endpoint"
Trước: Opus ($2.00) → Sau: Sonnet ($0.40)
Tiết kiệm: 80%

Task: "Design microservices architecture"
Trước: Opus ($3.00) → Sau: Opus ($3.00)
Tiết kiệm: 0% (nhưng justified — appropriate use)
```

### Bước 5: Kết quả Sau 1 Tháng

| Model | Trước | Sau | Thay đổi |
|-------|-------|-----|----------|
| Opus | $350 | $120 | -66% |
| Sonnet | $120 | $150 | +25% (shifted) |
| Haiku | $30 | $50 | +67% (shifted) |
| **Total** | **$500** | **$320** | **-36%** |

Productivity: Maintained. Quality: Maintained.

---

## 4. PRACTICE — Luyện tập

### Bài 1: Cost Audit

**Mục tiêu**: Hiểu spending pattern hiện tại.

**Hướng dẫn**:
1. Estimate Claude Code usage tuần này
2. Breakdown theo: model, task type, outcome
3. Identify: Cái gì có thể dùng model rẻ hơn?
4. Tính potential saving

<details>
<summary>💡 Gợi ý</summary>

Track 3 ngày: mỗi lần dùng Claude, note model và task type. Pattern emerge nhanh.

</details>

<details>
<summary>✅ Giải pháp</summary>

Finding phổ biến:
- 50%+ Opus usage có thể là Sonnet
- Simple question thường gửi model đắt
- Debug session tích lũy hidden cost

Potential saving typical: 30-50% chỉ với model matching.

</details>

### Bài 2: Model Matching Guide

**Mục tiêu**: Tạo quick-reference cho model selection.

**Hướng dẫn**:
1. List 10 task phổ biến bạn làm với Claude
2. Assign optimal model cho mỗi task
3. Tạo quick reference
4. Follow 1 tuần

<details>
<summary>💡 Gợi ý</summary>

Hầu hết coding task work fine với Sonnet. Reserve Opus cho true complexity.

</details>

<details>
<summary>✅ Giải pháp</summary>

Ví dụ guide:
- Haiku: typo, formatting, boilerplate, simple question
- Sonnet: feature, debugging, review, doc
- Opus: architecture, security audit, novel problem

Dán gần monitor để reference nhanh.

</details>

### Bài 3: Cost Policy

**Mục tiêu**: Viết cost guideline cho team.

**Hướng dẫn**:
1. Draft cost guideline cho CLAUDE.md
2. Define khi nào dùng model nào
3. Thêm `/clear` policy và output preference
4. Share với team nếu applicable

<details>
<summary>💡 Gợi ý</summary>

Giữ simple — 5-10 bullet max. Policy phức tạp bị ignore.

</details>

<details>
<summary>✅ Giải pháp</summary>

Xem CLAUDE.md addition ở Bước 3 trong DEMO — đó là production-ready template.

</details>

---

## 5. CHEAT SHEET

### Model Selection Guide

| Model | Cost | Dùng cho |
|-------|------|----------|
| **Haiku** | $ | Formatting, typo, simple edit, quick question |
| **Sonnet** | $$ | Feature, debugging, code review, documentation |
| **Opus** | $$$ | Architecture, complex debugging, security, novel problem |

### Cost Reduction Tactic

```text
✓ Default Sonnet, không Opus
✓ Dùng Haiku cho simple task
✓ /clear giữa project
✓ "Code only" cho implementation
✓ Fix root cause (avoid debug loop)
```

### Tracking

- Review weekly usage
- Alert khi spike bất thường
- Budget per project/developer

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Opus cho mọi thứ | Match model với task complexity |
| Never dùng Haiku | Haiku cho simple task (huge saving) |
| Không track cost | Regular audit và monitoring |
| Optimize trước khi hiểu | Audit trước, optimize sau |
| Sacrifice quality cho cost | Optimize waste, không value |
| Debug loop (5+ attempt) | Better prompt, better context |
| Ignore context size | `/clear` reduce token cost |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Startup Việt Nam, 8 developer. Claude Code bill nhảy từ $400 lên $1,200 trong 1 tháng. CEO hỏi: "Chuyện gì xảy ra?"

**Điều tra**:
- 2 developer discover Opus, dùng cho mọi thứ
- 1 developer có session chạy cả tuần (150K context)
- Debug loop trung bình 8 attempt per bug

**Kế hoạch Cost Optimization**:

| Tuần | Focus | Action |
|------|-------|--------|
| 1 | Awareness | Share pricing: "Opus gấp 5x Sonnet cost" |
| 2 | Guidelines | Model selection guide trong CLAUDE.md |
| 3 | Monitoring | Weekly cost review, breakdown per-developer |

**Kết quả (tháng sau)**:
- Cost: $1,200 → $380 (giảm 68%)
- Productivity: Unchanged
- Quality: Unchanged

**Developer quote**: "Tôi không biết Haiku có thể làm 80% việc tôi đang dùng Opus."

**CEO quote**: "Cost optimization không phải về restriction. Mà về awareness. Developer thấy số liệu, tự nhiên chọn tốt hơn."

---

> **Phase 14 Hoàn Thành!** Bạn đã học optimize Claude Code cho task efficiency, speed, quality, và cost.
>
> **Phase Tiếp Theo**: [Phase 15: Templates, Skills & Ecosystem](../../phase-15-templates-skills/01-claude-md-templates/) →
