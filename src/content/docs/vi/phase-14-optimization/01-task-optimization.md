---
title: 'Tối ưu Task'
description: 'Tối ưu cách chia task và giao việc cho Claude Code: task decomposition, batching và prioritization.'
---

# Module 14.1: Tối ưu Task

> **Thời gian ước tính**: ~30 phút
>
> **Yêu cầu trước**: Phase 6 (Thinking & Planning)
>
> **Kết quả**: Sau module này, bạn sẽ biết structure task tối ưu, hiểu task granularity, và tránh task-framing mistake.

---

## 1. WHY — Tại sao cần học

Bạn yêu cầu Claude "build complete authentication system." Ba mươi phút sau, bạn có một mớ hỗn độn không match architecture. Hoặc Claude stuck, loop, và produce nothing useful.

Cùng mục tiêu, cách tiếp cận khác: "Đầu tiên, design auth architecture. Sau đó implement login. Rồi registration. Rồi password reset." Mỗi step clear, checkable, và build on previous.

Task optimization không phải về Claude — mà về cách BẠN structure work.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Task Granularity Spectrum

```text
Too Large            Optimal Zone           Too Small
─────────────────────────────────────────────────────────
"Build cả app"       "Implement login"      "Add semicolon"
     ↓                     ↓                      ↓
 Overwhelm            Clear scope          Micromanagement
 Stuck                Checkable            Không hiệu quả
 Poor quality         Builds momentum      Context overhead
```

### Optimal Task Characteristic

| Đặc điểm | Task Tốt | Task Xấu |
|----------|----------|----------|
| **Scope** | Single feature/function | "Build everything" |
| **Time** | 5-20 phút Claude time | Hàng giờ work |
| **Output** | Verifiable deliverable | Vague "progress" |
| **Dependencies** | Clear input | Unclear requirement |
| **Success** | Testable | Subjective |

### Task Decomposition Pattern

```text
Pattern 1: Vertical Slice
Big Feature → [Design] → [Core Logic] → [UI] → [Tests]

Pattern 2: Component-Based
System → [Component A] → [Component B] → [Integration]

Pattern 3: Iterative Refinement
V1 (Basic) → V2 (+ Feature) → V3 (+ Polish)
```

### Checkpoint Principle

Mỗi task phải end với something bạn có thể verify. Nếu Claude đi sai, bạn catch sớm. Small correction tốt hơn major rewrite.

### Context Efficiency

Large task làm context bị polluted. Fresh context per task cho cleaner result. Dùng `/clear` hoặc new session cho task mới.

---

## 3. DEMO — Từng bước cụ thể

**Scenario**: Build user authentication system.

### Bad Approach (Giant Task)

```text
Bạn: Build complete user authentication system với login,
registration, password reset, email verification, OAuth,
session management, và role-based access control.

Claude: [Bắt đầu build... 30 phút sau]

Kết quả:
- 2000 dòng code tangled
- Mixed pattern (lúc JWT, lúc session)
- Thiếu error handling
- Không test được từng phần
- Không match existing architecture
```

### Good Approach (Optimized Task)

**Task 1: Design (5 min)**
```text
Bạn: Design authentication system architecture cho Express app.
Requirements: JWT-based, PostgreSQL storage, refresh tokens.
Output: Architecture diagram và file structure.

Claude: [Produces clear design]
```
✓ Checkpoint: Review design trước khi implement

**Task 2: Core Auth (10 min)**
```text
Bạn: Dựa trên design, implement core auth module:
- JWT token generation và verification
- Password hashing với bcrypt
Create: src/auth/tokens.ts và src/auth/passwords.ts

Claude: [Implement focused module]
```
✓ Checkpoint: Test JWT function hoạt động

**Task 3: Login Endpoint (10 min)**
```text
Bạn: Implement POST /api/auth/login endpoint dùng auth module
vừa tạo. Include validation và error handling.

Claude: [Implement clean endpoint]
```
✓ Checkpoint: Test login với curl

**Task 4: Registration (10 min)**
```text
Bạn: Implement POST /api/auth/register theo pattern giống login.
Thêm email uniqueness check.

Claude: [Consistent implementation]
```
✓ Checkpoint: Test registration

### So sánh Kết quả

| Giant Task | Optimized Task |
|------------|----------------|
| 30 min, poor quality | 35 min total, high quality |
| Code tangled | Modular, consistent |
| Khó debug | Mỗi phần được test |
| Cần refactor lớn | Sẵn sàng production |
| 1 checkpoint | 4 checkpoint |

---

## 4. PRACTICE — Luyện tập

### Bài 1: Task Decomposition

**Mục tiêu**: Break large feature thành optimal task.

**Hướng dẫn**:
1. Lấy một large feature bạn cần build
2. Break thành 4-6 task theo pattern
3. Cho mỗi task, define: scope, output, success criteria
4. Estimate Claude time (aim 5-15 min)

<details>
<summary>💡 Gợi ý</summary>

Bắt đầu với design, rồi core logic, rồi integration point. Mỗi task phải produce something testable.

</details>

<details>
<summary>✅ Giải pháp</summary>

Ví dụ cho "Build REST API cho blog posts":
1. Design API endpoint và data model (10 min)
2. Implement Post model và database schema (10 min)
3. Implement CRUD endpoint (15 min)
4. Add validation và error handling (10 min)
5. Write integration test (15 min)

Mỗi task có clear output và verify được trước khi tiếp.

</details>

### Bài 2: Checkpoint Design

**Mục tiêu**: Tạo verification point cho task.

**Hướng dẫn**:
1. Cho các task đã decompose, identify cần verify gì
2. Define: Test/check gì sau mỗi task?
3. "Wrong" trông như thế nào ở mỗi checkpoint?

<details>
<summary>💡 Gợi ý</summary>

Good checkpoint: "Build pass không?", "Test pass không?", "curl return expected response không?"

</details>

<details>
<summary>✅ Giải pháp</summary>

Cho blog API task:
- Sau design: Review và approve architecture
- Sau model: Run migration, thấy table trong DB
- Sau endpoint: curl mỗi endpoint thành công
- Sau validation: Invalid input return proper error
- Sau test: Tất cả test pass

</details>

### Bài 3: Granularity Calibration

**Mục tiêu**: Trải nghiệm impact của task size.

**Hướng dẫn**:
1. Pick một small feature (ví dụ: "add search to list")
2. Thử 3 approach: one giant, optimal chunk, micro-step
3. Compare: time, quality, mental load của bạn

<details>
<summary>💡 Gợi ý</summary>

Micro-step: "Add import", "Add function signature", "Add dòng đầu tiên"...

</details>

<details>
<summary>✅ Giải pháp</summary>

Bạn sẽ thấy: Giant = quality unpredictable. Micro = tedious, mất momentum. Optimal (2-3 focused task) = best balance.

</details>

---

## 5. CHEAT SHEET

### Optimal Task Size
- 5-20 phút Claude time
- Single clear deliverable
- Testable output
- Fresh context

### Decomposition Pattern

| Pattern | Flow |
|---------|------|
| Vertical | Design → Core → UI → Tests |
| Component | Part A → Part B → Integrate |
| Iterative | V1 → V2 → V3 |

### Task Template

```text
Goal: [Đạt được gì]
Context: [Code/decision liên quan]
Output: [Deliverable cụ thể]
Constraints: [Pattern follow, thing avoid]
```

### Checkpoint Question
- Có thể verify nó hoạt động không?
- Có match design không?
- Có consistent với task trước không?

### Red Flag (Task Too Large)
- Claude hỏi nhiều clarifying question
- Output mix different approach
- Tốn > 20 phút
- Không dễ test result

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| "Build everything at once" | Decompose thành task 5-15 min |
| Vague success criteria | Define testable output |
| Không có checkpoint | Verify sau mỗi task |
| Skip design phase | Design trước, implement sau |
| Tiếp tục khi lost | Stop, `/clear`, restart với smaller task |
| Cùng context cho nhiều task | Fresh context per major task |
| Micro-manage từng dòng | Trust Claude với reasonable scope |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Startup Việt Nam cần build payment integration (VNPay + MoMo). Lần đầu: one giant task.

**Lần 1 (Thất bại)**:
```text
"Implement payment integration supporting VNPay và MoMo
với webhook, refund, và transaction logging."

Kết quả: 3 giờ, code không dùng được, mixed pattern, bug khắp nơi.
```

**Lần 2 (Optimized)**:

| Task | Time | Status |
|------|------|--------|
| Design payment architecture | 15 min | ✓ |
| Payment interface/abstract class | 10 min | ✓ |
| VNPay implementation | 20 min | ✓ |
| VNPay webhook handler | 15 min | ✓ |
| MoMo implementation | 20 min | ✓ |
| Transaction logging | 15 min | ✓ |
| Integration test | 25 min | ✓ |

**Total**: 2 giờ → Production-ready, consistent pattern, tested từng step.

**So sánh**:
- Giant task: 3 giờ → không dùng được
- Optimized: 2 giờ → production-ready

**Quote**: "Approach 'chậm' làm task nhỏ actually nhanh gấp đôi và quality gấp 10 lần."

---

> **Tiếp theo**: [Module 14.2: Tối ưu Tốc độ](../02-speed-optimization/) →
