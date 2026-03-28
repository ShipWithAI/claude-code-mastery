---
title: 'Tối Ưu Context'
description: 'Chiến lược tối ưu context window trong Claude Code: giảm token, compact hiệu quả và tránh tràn context.'
---

# Module 5.2: Tối Ưu Context

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Module 5.1 (Kiểm soát Context)
>
> **Kết quả**: Sau module này, bạn sẽ tận dụng tối đa chất lượng output trên mỗi token — dùng kỹ thuật nâng cao: session planning, context priming, strategic compaction, task decomposition, và one-shot pattern.

---

## 1. WHY — Tại sao quan trọng

Bạn đã biết kiểm soát context từ Module 5.1. Nhưng giờ gặp vấn đề mới: task lớn cần nhiều context, nhưng nhiều context lại làm giảm chất lượng câu trả lời của Claude. Bạn mắc kẹt trong nghịch lý — thêm context thì chất lượng giảm, bớt context thì Claude thiếu thông tin. Giống như nấu ăn — cùng nguyên liệu, đầu bếp giỏi nấu ngon hơn vì biết thứ tự cho gia vị và lúc nào cho bao nhiêu. Tối ưu context không phải là cắt giảm — mà là dùng context THÔNG MINH hơn. Chi phí token giống nhau, nhưng kết quả tốt gấp đôi.

---

## 2. CONCEPT — Ý tưởng cốt lõi

Tối ưu context là tư duy kiến trúc áp dụng vào AI conversation. Thay vì đổ hết thông tin vào một session và hi vọng may mắn, bạn dàn dựng context như một nhạc trưởng điều khiển dàn nhạc — đúng thông tin, đúng thời điểm, đúng liều lượng.

### Sáu kỹ thuật tối ưu hóa

**1. Session Architecture** — Cấu trúc conversation thành các phase rõ ràng:
- Phase 1: Hiểu (đọc, phân tích, đặt câu hỏi)
- Phase 2: Lập kế hoạch (thiết kế, phác thảo, chia nhỏ)
- Phase 3: Thực thi (implement, test, refactor)
- Phase 4: Xác minh (review, validate, document)

Giữa các phase: `/compact` để nén learnings và xóa nhiễu.

**2. Context Priming** — Prompt đầu tiên định hình toàn bộ conversation. Front-load context quan trọng:
- CLAUDE.md load tự động (nền tảng của bạn)
- Prompt đầu tiên đặt tone, scope, constraints
- Prime với context thiết yếu tối thiểu, không phải dump toàn bộ

**3. One-Shot Pattern** — Dùng `claude -p "prompt"` cho task độc lập:
- Toàn bộ task hoàn thành trong một chu kỳ prompt/response
- Không làm ô nhiễm conversation history
- Hoàn hảo cho utilities, configs, isolated components

**4. Task Decomposition** — Chia công việc nguyên khối thành chunks độc lập:
- Mỗi sub-task có session riêng hoặc chu kỳ `/compact` riêng
- Truyền kết quả qua files (không qua conversation memory)
- Sub-tasks có thể chạy song song (nhiều terminal khác nhau)

**5. Strategic /compact Timing** — Nén tại thời điểm tối ưu:
- ✅ Sau khi hoàn thành một sub-task
- ✅ Trước khi bắt đầu phase mới
- ✅ Khi context usage chạm 60%+
- ❌ KHÔNG BAO GIỜ giữa chừng operation (mất working state)

**6. Context Recycling** — Lưu và tái sử dụng analysis artifacts:
- Export decisions/findings ra files
- Lưu recurring context vào CLAUDE.md
- Tạo "context snapshot" documents cho hệ thống phức tạp

```mermaid
graph TD
    A[Task Lớn] --> B[Session Architecture]
    B --> C[Phase 1: Hiểu]
    C --> D[/compact]
    D --> E[Phase 2: Lập kế hoạch]
    E --> F[Context Priming]
    F --> G[Task Decomposition]
    G --> H[Sub-task 1]
    G --> I[Sub-task 2]
    G --> J[Sub-task 3]
    H --> K[One-Shot Pattern]
    I --> L[/compact]
    J --> M[Context Recycling]
    L --> N[Phase 3: Thực thi]
    M --> N
    K --> N
    N --> O[/compact]
    O --> P[Phase 4: Xác minh]
```

---

## 3. DEMO — Từng bước thực hành

**Kịch bản**: Refactor hệ thống authentication từ session-based sang JWT (8 files: auth middleware, login/logout handlers, user model, JWT utilities, tests, config, docs).

**Bước 1: Session Architecture — Lập kế hoạch các Phase**

Trước khi động vào code, phác thảo session:

```bash
$ claude
```

Prompt đầu tiên:
```
Tôi cần refactor auth từ session-based sang JWT. 8 files bị ảnh hưởng.

Kế hoạch phase:
1. Hiểu: Phân tích auth flow hiện tại (3 files)
2. Lập kế hoạch: Thiết kế kiến trúc JWT, xác định thay đổi
3. Thực thi: Implement từng file với /compact ở giữa
4. Xác minh: Test suite, security review

Bắt đầu Phase 1: phân tích middleware/auth.js, handlers/login.js, models/user.js
```

Kết quả: Claude đọc files, giải thích flow hiện tại, xác định dependencies.

**Bước 2: Context Priming — Prompt đầu hiệu quả**

Chú ý các yếu tố priming:
- Task scope (8 files, JWT migration)
- Constraint (phương pháp theo phase)
- Hành động ngay lập tức (phân tích 3 files cụ thể)
- KHÔNG dump code, KHÔNG requirements đầy đủ

Điều này đặt expectations: có phương pháp, có cấu trúc, tập trung vào file.

**Bước 3: Phase 1 hoàn thành + Compact**

Sau khi Claude phân tích:
```
/compact
```

Kết quả:
```
Context compacted. Key information preserved:
- Auth hiện tại dùng Express sessions + Passport
- User passwords hash với bcrypt
- Session lưu trong Redis
- 3 routes phụ thuộc vào session: /api/profile, /api/dashboard, /api/settings

Context usage: 15% (trước đó 58%)
```

**Bước 4: One-Shot cho JWT Utility Module**

JWT utility là self-contained. Dùng one-shot pattern:

```bash
$ claude -p "Tạo utils/jwt.js với functions: generateToken(userId, email), verifyToken(token), refreshToken(token). Dùng jsonwebtoken library. JWT secret từ process.env.JWT_SECRET. Access token expires 15min, refresh token 7 days. Include JSDoc comments."
```

Kết quả: File jwt.js hoàn chỉnh được tạo trực tiếp. Không cần qua lại.

**Bước 5: Task Decomposition — Từng File**

Quay lại main session (đã compacted):
```
Phase 3: Thực thi. Cập nhật từng file.

File 1/8: Update middleware/auth.js để dùng JWT thay vì session.
```

Claude cập nhật file. Sau đó:
```
/compact
```

Lặp lại cho mỗi file. Mỗi lần `/compact` xóa chi tiết file trước đó nhưng giữ lại architecture decisions.

**Bước 6: Context Recycling — Lưu phân tích**

Sau Phase 2 (Lập kế hoạch), lưu kiến trúc:
```
Lưu thiết kế kiến trúc JWT vào docs/jwt-migration.md để tham khảo sau này.
```

Claude tạo:
```markdown
# JWT Migration Architecture

## Token Structure
- Access: 15min, payload: {userId, email, role}
- Refresh: 7 days, payload: {userId}

## Middleware Changes
- Remove passport.session()
- Add JWT verification middleware...
```

Giờ context này là permanent, tái sử dụng được, và không tiêu tốn conversation tokens.

**Bước 7: Review chi phí cuối cùng**

Sau Phase 4:
```
/cost
```

Kết quả:
```
Session Cost Summary:
- Input tokens: 28,450
- Output tokens: 12,300
- Total cost: $0.87
- Context efficiency: 73% (qua 6 compactions)
```

So sánh với approach không tối ưu: thường >50,000 input tokens, $1.50+, và chất lượng giảm sau file 4.

---

## 4. PRACTICE — Thực hành

### Bài tập 1: Session Architect

**Mục tiêu**: Lập kế hoạch và thực thi một session refactoring tối ưu context

**Hướng dẫn**:
1. Chọn một task refactoring thực trong codebase của bạn (5+ files bị ảnh hưởng)
2. Viết kế hoạch 4 phase với các điểm `/compact` cụ thể
3. Chỉ thực thi Phase 1, dùng context priming trong prompt đầu tiên
4. Chạy `/cost` sau Phase 1, sau đó sau `/compact`
5. So sánh token usage trước/sau compaction

**Kết quả mong đợi**:
- Phase 1 dùng 40-60% context
- Sau `/compact`: giảm xuống 10-20%
- Hiểu biết rõ ràng được capture trong compact summary

<details>
<summary>💡 Gợi ý</summary>

Prompt đầu tiên nên bao gồm:
- Mục tiêu task (1 câu)
- Kế hoạch phase (bullet list)
- Hành động ngay lập tức (đọc/phân tích files cụ thể)

Đừng giải thích CÁCH refactor — đó là Phase 2.

</details>

<details>
<summary>✅ Lời giải</summary>

Ví dụ prompt đầu tiên:
```
Refactor payment processing để hỗ trợ nhiều gateway (Stripe, PayPal, Chuyển khoản ngân hàng).
Hiện tại hard-coded Stripe trong 6 files.

Kế hoạch phase:
1. Hiểu: Phân tích Stripe integration hiện tại
2. Lập kế hoạch: Thiết kế gateway abstraction layer
3. Thực thi: Implement abstraction + migrate Stripe + thêm PayPal
4. Xác minh: Test tất cả gateways, update docs

Phase 1: Phân tích services/stripe.js, controllers/payment.js, models/transaction.js
```

Sau phân tích và `/compact`:
```
Context compacted. Key information preserved:
- Stripe API calls ở 8 locations
- Hard-coded API keys trong services/stripe.js
- Transaction model giả định Stripe's response schema
- Không có error handling cho gateway timeouts
```

</details>

### Bài tập 2: One-Shot Mastery

**Mục tiêu**: Hoàn thành 3 tasks độc lập dùng one-shot pattern

**Hướng dẫn**:
1. Tạo data validation module (`validators/order.js`) với 5 validation functions
2. Generate test suite (`tests/validators.test.js`) với 15 test cases
3. Tạo config file (`config/payment-gateways.json`) với 3 gateway configurations

Dùng `claude -p` cho mỗi cái. Đo thời gian — nên mất <5 phút tổng cộng.

**Kết quả mong đợi**: 3 files hoàn chỉnh, zero conversation history, tốn tối thiểu tokens

<details>
<summary>💡 Gợi ý</summary>

Nhồi MỌI THỨ vào prompt:
- Mục đích file
- Functions/structure cần thiết
- Libraries sử dụng
- Format/style preferences
- Edge cases cần xử lý

</details>

<details>
<summary>✅ Lời giải</summary>

**Lệnh 1**:
```bash
claude -p "Tạo validators/order.js với 5 functions: validateOrderId(id), validateAmount(amount), validateCurrency(code), validateItems(items), validateShippingAddress(address). Dùng Joi library. Export module.exports. Include input sanitization và detailed error messages."
```

**Lệnh 2**:
```bash
claude -p "Tạo tests/validators.test.js dùng Jest. Test tất cả 5 validators từ validators/order.js. Include: valid cases, invalid cases, edge cases (null, undefined, empty), boundary tests (min/max amounts), injection attacks. Tối thiểu 15 test cases."
```

**Lệnh 3**:
```bash
claude -p "Tạo config/payment-gateways.json với 3 gateway configs: Stripe (USD, EUR, GBP), PayPal (USD, EUR), BankTransfer (VND only). Mỗi gateway: {name, currencies, apiEndpoint, timeout, retryAttempts, enabled}. Dùng endpoint URLs giả nhưng realistic."
```

Thời gian: ~3-4 phút. Tokens: ~800 input, ~2500 output tổng (vs. 3000+ input cho conversation-based approach).

</details>

---

## 5. CHEAT SHEET

| Kỹ thuật | Khi nào dùng | Cách làm | Context tiết kiệm |
|----------|--------------|----------|-------------------|
| **Session Architecture** | Multi-phase tasks (5+ steps) | Lập kế hoạch 4 phases: Hiểu → Lập kế hoạch → Thực thi → Xác minh | 30-50% nhờ cấu trúc |
| **Context Priming** | Đầu mỗi session | Prompt đầu: scope + constraints + hành động ngay (không dump code) | 20-30% ở prompt đầu |
| **One-Shot Pattern** | Isolated components, configs, utils | `claude -p "prompt đầy đủ"` — nhồi mọi thứ vào một request | 60-80% (không có history) |
| **Task Decomposition** | 5+ files, thay đổi độc lập | Chia thành sub-tasks, truyền kết quả qua files không qua conversation | 40-60% mỗi sub-task |
| **Strategic /compact** | Sau sub-tasks, trước phase mới, tại 60%+ usage | `/compact` tại phase boundaries, KHÔNG BAO GIỜ mid-operation | 50-70% mỗi lần compact |
| **Context Recycling** | Architecture decisions, recurring context | Lưu phân tích ra files, update CLAUDE.md, tạo context snapshots | 30-50% khi tái sử dụng |

### Template Session Phase

```
Phase 1: Hiểu
- Đọc files liên quan (tối đa 3-5)
- Đặt câu hỏi làm rõ
- Document trạng thái hiện tại
→ /compact

Phase 2: Lập kế hoạch
- Thiết kế kiến trúc solution
- Xác định files bị ảnh hưởng
- Định nghĩa success criteria
→ /compact

Phase 3: Thực thi
- Implement changes (một file một lần)
- /compact sau mỗi sub-task
- Test từng bước

Phase 4: Xác minh
- Chạy full test suite
- Review changes
- Update documentation
→ /compact (tùy chọn, để session summary)
```

### Template One-Shot Prompt

```bash
claude -p "Tạo [FILE_PATH] để [MỤC ĐÍCH CHÍNH].

Requirements:
- [Req 1]
- [Req 2]
- [Req 3]

Technical constraints:
- Dùng [LIBRARY/FRAMEWORK]
- Follow [STYLE/PATTERN]
- Include [ERROR_HANDLING/EDGE_CASES]

Format: [EXPORT_STYLE, COMMENTS, v.v.]"
```

### Flowchart quyết định /compact

```
Task hoàn thành hoặc tại phase boundary?
  CÓ → /compact
  KHÔNG ↓

Context usage > 60%?
  CÓ → /compact
  KHÔNG ↓

Sắp chuyển sang sub-task không liên quan?
  CÓ → /compact
  KHÔNG ↓

Tiếp tục mà không compact
```

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai lầm | ✅ Cách đúng |
|------------|--------------|
| Nhảy vào coding ngay lập tức mà không lập kế hoạch phases | Luôn bắt đầu với session architecture. 60 giây lập kế hoạch tiết kiệm 20 phút context thrashing. |
| Chạy toàn bộ refactoring (20 files) trong một session dài | Decompose thành sub-tasks. One-shot cho pieces độc lập. /compact giữa các logical chunks. Multi-file changes = multi-phase session. |
| `/compact` giữa chừng khi đang implement một function phức tạp | Chỉ compact tại natural boundaries: sau khi hoàn thành sub-task, trước khi bắt đầu phase mới, không bao giờ mid-operation. |
| Không bao giờ dùng one-shot mode, luôn dùng interactive | Nếu task là self-contained (config, utility, test file), dùng `claude -p`. Không có conversation overhead. Nhanh gấp 3 lần. |
| Re-analyze cùng code files mỗi session | Context recycling: lưu phân tích vào docs/, update CLAUDE.md với architecture decisions. Tái sử dụng, đừng derive lại. |
| Tối ưu context trước khi hiểu vấn đề | Session đầu tiên: hiểu sâu (dùng 80% context nếu cần). SAU ĐÓ tối ưu trong các sessions tiếp theo. Premature optimization lãng phí thời gian. |

---

## 7. REAL CASE — Câu chuyện thực tế

**Kịch bản**: Migration monolith-to-microservices cho nền tảng thương mại điện tử. 200+ files, 15 services được lập kế hoạch (Auth, Product, Order, Payment, Inventory, Notification, Analytics, v.v.).

**Vấn đề**: Approach ban đầu dùng single long session cho mỗi service. Đến file 6-7, Claude bắt đầu:
- Lặp lại suggestions trước đó
- Quên architectural decisions trước đó
- Trộn lẫn patterns từ các services khác nhau
- Context usage tăng vọt lên 95%, chất lượng giảm

**Giải pháp**: Áp dụng cả 6 kỹ thuật tối ưu:

1. **Session Architecture**: Mỗi service = session 4-phase
   - Phase 1: Phân tích monolith code cho domain này
   - Phase 2: Thiết kế service API + data model
   - Phase 3: Extract và refactor code
   - Phase 4: Integration tests + docs

2. **Context Priming**: Prompt đầu tiên cho mỗi service:
   ```
   Extracting [SERVICE_NAME] service. Monolith files: [3-5 key files].
   Target: Standalone service với REST API, own DB, async events.
   Phase 1: Phân tích domain logic trong monolith.
   ```

3. **One-Shot Pattern**: Dùng cho mỗi service:
   - Dockerfile (standardized)
   - API client library
   - Config files (package.json, .env.example, v.v.)

4. **Task Decomposition**: Mỗi service được chia thành:
   - Domain model extraction
   - Route handlers
   - Data access layer
   - Event publishers/subscribers
   - Tests (unit, integration)

   Mỗi cái = sub-task riêng với `/compact` ở giữa.

5. **Strategic /compact**: Compaction tự động:
   - Sau mỗi Phase 1, 2, 3
   - Sau mỗi 2-3 files trong Phase 3
   - Trước khi chuyển services

6. **Context Recycling**: Tạo `docs/microservices-architecture.md` trong session 1, update sau mỗi service design. Trở thành "source of truth" — mọi session load đầu tiên (qua CLAUDE.md reference).

**Kết quả**:
- 15 services extracted trong 3 tuần (ước tính ban đầu: 6 tuần)
- Token usage: giảm 45% (trung bình 35K tokens/service vs. 65K trước đó)
- Consistency: 95% (vs. 60% — pattern drift bị loại bỏ)
- Zero context overflow incidents (vs. 23 lần trong attempt ban đầu)
- Chi phí: $87 tổng vs. dự kiến $180+

**Insight quan trọng**: Token đắt nhất là token tạo ra code sai. Tối ưu context không phải là tiết kiệm vài xu API calls — mà là duy trì chất lượng ở quy mô lớn. Khi Claude có clean, relevant context, first-try accuracy tăng từ 70% lên 95%. Đó là nơi có lợi nhuận thực sự. Pattern này đặc biệt hiệu quả cho dự án chuyển đổi lớn mà công ty Việt Nam thường gặp — từ monolith legacy sang kiến trúc hiện đại, nơi mà consistency và quality là quyết định thành bại.

---

> **Tiếp theo**: [Module 5.3: Context Hình ảnh & Visual](../03-image-context/) →
