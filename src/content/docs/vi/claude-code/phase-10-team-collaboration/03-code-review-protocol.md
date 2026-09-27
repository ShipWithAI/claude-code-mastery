---
title: 'Code Review Protocol'
description: 'Dùng /code-review và /security-review như một reviewer fresh-context, và giữ human gate ở mọi lần merge.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 10.3: Code Review Protocol

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 10.2 (Quy ước Git)
>
> **Kết quả**: Sau module này, bạn hiểu tại sao agent viết code không thể tự duyệt code đó, biết
> chạy `/code-review` và `/security-review` như một check độc lập, và biết con người còn phải xác
> nhận gì trước khi merge.

---

## 1. WHY — Tại Sao Cần Quan Tâm

Dev nộp PR với 400 dòng code Claude viết. Reviewer lướt qua — "clean, AI viết, chắc ổn" — rồi
approve. Một tuần sau, bug lộ ra: một edge case ngầm hiểu trong requirement nhưng chưa bao giờ nói
rõ trong prompt. Không ai bắt được, vì cả author lẫn reviewer đều tin rằng chính session viết code
sẽ tự bắt được lỗi của mình. Anthropic nói thẳng vấn đề gốc: "the agent that wrote the code has no
way to approve it" (S3). Module này xây một check thứ hai, độc lập, vào quy trình.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Tại sao Claude của chính author không thể làm reviewer

Context đã viết code mang cùng giả định, cùng điểm mù, và thiên hướng tự khen mình làm tốt —
nghiên cứu harness của Anthropic gọi đây là "confident praising": một
generator tự chấm điểm mình có xu hướng báo cáo thành công quá mức (S12). Cách sửa mang tính cấu
trúc, không phải prompt hay hơn: reviewer cần một **fresh context** chưa từng thấy plan, chỉ thấy
diff.

### `/code-review` và `/security-review`

| Command | Kiểm tra gì | Ghi chú |
|---|---|---|
| `/code-review` (alias `/review`) | Bug correctness trong diff hiện tại, một PR, một branch, hoặc một path | Truyền `ultra` (tức `/code-review ultra`) để chạy deep multi-agent review trong cloud sandbox — không có `claude ultrareview` như một CLI command riêng |
| `/security-review` | Lỗ hổng bảo mật trong thay đổi trên branch hiện tại | Diff so với `origin/HEAD` — cần remote `origin` đã cấu hình, nếu không `git diff` bên dưới fail và toàn bộ review abort |

Cả hai command tự spawn reviewer subagent read-only riêng, không tái dùng context của session đã
viết code — DEMO bên dưới cho thấy `/security-review` gọi thẳng hai background agent (một
identifier và một false-positive filter) với finding và confidence score riêng.

### Confidence threshold là lựa chọn thiết kế, không phải bug

`/security-review` không báo cáo mọi issue có thể có — nó filter theo confidence, và một
vulnerability thật có thể rơi ngay dưới ngưỡng nếu chưa có gì trong repo gọi tới function nguy
hiểm đó. Đó là trade-off có chủ đích để giảm noise, không phải bằng chứng tool đã bỏ sót gì — coi
finding "dưới ngưỡng" là danh sách cần theo dõi, không phải giấy chứng nhận sạch.

### Human gate ở mọi lần chuyển giao artifact

Trách nhiệm author và reviewer không đổi chỉ vì máy viết diff:

- **Author**: hiểu từng dòng đủ để giải thích được; công khai Claude đã viết; nêu rõ phần chưa chắc
  chắn.
- **Reviewer**: đừng để "trông chuyên nghiệp" thay thế việc kiểm tra nó giải quyết đúng vấn đề,
  khớp pattern hiện có, và xử lý edge case chưa ai viết ra.

`/code-review` và `/security-review` là input cho human judgment đó, không thay thế nó — và CI có
thể chạy `claude-code-action` trên mọi PR để đảm bảo input luôn tồn tại kể cả khi con người quên
yêu cầu (Module 11.4).

---

## 3. DEMO — Từng Bước

**Kịch bản**: một diff nhỏ thêm `src/calc.js` với hai issue thật — chia cho 0 và một lệnh `eval()`
— cả hai review command đều chạy trên diff đó.

**Bước 1: `/code-review` trên diff chưa commit**

```text
> /code-review
```
```text
# Output may vary
- src/calc.js:7 — Security: eval() runs user input, so a crafted expression can execute any code.
- src/calc.js:2 — Correctness: percentOf returns Infinity or NaN when total is 0.
```

**Bước 2: `/security-review` trên cùng branch**

```text
> /security-review
```
```text
# Output may vary
⏺ Agent(Identify vulns in calc.js)     ⎿ Backgrounded agent
⏺ Agent "Identify vulns in calc.js" finished · 40s
⏺ Agent(FP-filter eval finding)        ⎿ Backgrounded agent
⏺ Agent "FP-filter eval finding" finished · 37s

Security Review: src/calc.js
No findings reached the reporting threshold of confidence 8 or higher.

Below the threshold
eval code injection in src/calc.js:7 (runExpression)
- Confidence: 7/10 — excluded because nothing in the repo calls runExpression yet, so there's
  no confirmed path from untrusted input to this line.
- Risk if a future caller passes untrusted input: full remote code execution.
- Recommendation: replace eval with a restricted parser.
```

Hai subagent độc lập, read-only (identify → filter false positives) tạo ra kết quả này, không phải
session đáng lẽ sẽ viết fix.

**Bước 3: Con người đọc cả hai, quyết định đáng để fix ngay**

Finding `eval()` xuất hiện ở cả hai lần chạy — một lần vượt threshold ở `/code-review`, một lần
dưới threshold ở `/security-review` kèm lý do rõ ràng. Reviewer coi cả hai cùng nhau là "fix trước
khi merge," không phải "một tool nói ổn là xong."

**Bước 4: Fix, theo đúng quy ước git ở Module 10.2**

Chính fix và commit trailer của nó là DEMO ở Module 10.2 — cùng diff, cùng repo, tiếp nối đúng
finding này.

---

## 4. PRACTICE — Tự Thực Hành

### Exercise 1: Chạy cả hai review trên branch của bạn

**Goal**: Thấy finding thật trên code thật, không phải code lab.

**Instructions**:
1. Trên một branch có diff thật, chạy `/code-review`.
2. Chạy `/security-review`. Nếu lỗi ở `origin/HEAD`, thêm hoặc fetch remote trước — bản thân lỗi
   đó cũng đáng biết trước khi bạn dựa vào command này trong CI.
3. Với mỗi finding, quyết định: fix ngay, theo dõi, hay bỏ qua — và nói rõ lý do.

<details>
<summary>💡 Hint</summary>

`/security-review` cần `origin/HEAD` resolve được. Repo clone bình thường đã có sẵn; repo lab tạo
từ đầu có thể cần `git remote add origin <url>` trước.
</details>

### Exercise 2: Đọc đúng một finding dưới ngưỡng

**Goal**: Luyện coi finding bị filter là "theo dõi," không phải "bỏ qua."

**Instructions**:
1. Lấy ví dụ `eval()` từ DEMO (hoặc một finding confidence thấp tương tự của bạn).
2. Viết một câu: điều gì sẽ nâng confidence của nó lên (vd "có caller mới truyền input từ user").
3. Thêm code comment hoặc issue link điều kiện đó với finding gốc.

### Exercise 3: Giải thích được hoặc đừng nộp

**Goal**: Xác nhận author hiểu code, độc lập với mọi review tool.

**Instructions**: Với một PR Claude viết, yêu cầu author giải thích miệng phần khó nhất. Nếu không
giải thích được, đó là flag cần sửa lại bất kể `/code-review` báo gì.

<details>
<summary>✅ Solution</summary>

"Claude viết, tôi không chắc sao nó chạy" tự nó đã là red flag — `/code-review` pass không thay thế
được việc author hiểu code.
</details>

---

## 5. CHEAT SHEET

| Command | Phạm vi | Ghi chú |
|---|---|---|
| `/code-review` (alias `/review`) | Diff hiện tại, một PR, một branch, hoặc một path | `/code-review ultra` = deep cloud multi-agent review |
| `/security-review` | Diff so với `origin/HEAD` trên branch hiện tại | Cần remote `origin` resolve được |
| `claude-code-action` trên PR | Review enforced bởi CI, mọi PR | Module 11.4 |
| `/pr-comments` | ❌ Đã bị xoá ở v2.1.91 | Nhờ Claude xem PR comment trực tiếp thay vào |

### Human gate checklist

```text
[ ] Author giải thích được từng dòng
[ ] Requirement thật sự khớp, không chỉ "compile được"
[ ] Finding /code-review và /security-review đã triage (fix / theo dõi / bỏ qua + lý do)
[ ] Edge case ngầm hiểu nhưng chưa nói rõ trong prompt đã được xử lý
[ ] Khớp pattern hiện có trong codebase
```

---

## 6. PITFALLS — Sai Lầm Thường Gặp

| ❌ Sai | ✅ Đúng |
|-----------|---------------------|
| Cùng session vừa viết vừa duyệt code | Reviewer cần fresh context — `/code-review`/`/security-review` hoặc con người, không bao giờ là session đã viết |
| "AI viết, chắc ổn" | Code AI cần soi KỸ hơn, không phải ít hơn — trông sạch vẫn có thể thiếu requirement ngầm |
| Coi finding dưới ngưỡng là "không có vấn đề" | Đó là confidence filter, không phải giấy chứng nhận sạch — theo dõi nó |
| Tưởng `/security-review` luôn chạy được | Nó fail hẳn nếu `origin/HEAD` không resolve — kiểm tra remote trước |
| Tưởng `claude ultrareview` là một CLI command | Đó là `/code-review ultra`, không phải subcommand riêng |
| Dựa vào `/pr-comments` | Đã bị xoá ở v2.1.91 — nhờ Claude trực tiếp, hoặc dùng `--from-pr` |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

Logic retry thanh toán do Claude viết ở một công ty e-commerce pass test và được approve nhanh
"trông chuyên nghiệp." Trên production, race condition khi nhiều request đồng thời gây double
charge — test chưa bao giờ mô phỏng request đồng thời, và lần approve nhanh của reviewer chưa bao
giờ hỏi "nếu cái này chạy hai lần cùng lúc thì sao?" Cách team sửa không phải prompt thông minh
hơn: mà là bắt buộc output của `/code-review` và `/security-review` phải đính kèm mọi PR đụng
payment, cộng một reviewer thứ hai riêng cho thư mục đó, để việc lướt nhanh không còn là check duy
nhất trước khi merge.

---

> **Next**: [Module 10.4: Knowledge Sharing](../04-knowledge-sharing/) →
