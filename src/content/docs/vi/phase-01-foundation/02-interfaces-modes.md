---
title: 'Giao diện & Các chế độ'
description: 'Tìm hiểu các giao diện và chế độ hoạt động của Claude Code: interactive, one-shot và pipe mode.'
---

# Module 1.2: Giao diện & Các chế độ

> **Thời gian học**: ~25 phút
>
> **Yêu cầu trước**: Module 1.1 (Cài đặt & Cấu hình)
>
> **Kết quả**: Sau module này, bạn sẽ biết chọn đúng chế độ tương tác cho mỗi
> tác vụ và kết hợp các chế độ để tạo workflow mạnh mẽ

---

## 1. WHY — Tại sao cần học cái này?

Bạn đã cài Claude Code và chạy query đầu tiên. Nhưng bạn đang dùng nó như một
chatbot — gõ từng câu hỏi một. Trong khi đó, đồng nghiệp của bạn pipe cả git
diff qua Claude và nhận tóm tắt PR tức thì. Một người khác trong team đã tích
hợp Claude vào CI pipeline, bắt bug trước khi code được merge. Sự khác biệt?
Họ hiểu ba chế độ tương tác. Biết khi nào dùng interactive session, khi nào
dùng one-shot command, khi nào dùng pipe input sẽ biến Claude Code từ một cửa
sổ chat thành công cụ tự động hóa phát triển mạnh mẽ.

---

## 2. CONCEPT — Khái niệm cốt lõi

Claude Code cung cấp ba cách tương tác khác nhau, mỗi cách được tối ưu cho
workflow khác nhau:

### Ba chế độ chính

| Chế độ | Lệnh | Phù hợp cho | Trạng thái Session |
|--------|------|-------------|-------------------|
| **REPL (Interactive)** | `claude` | Khám phá, debugging, task phức tạp nhiều bước | Conversation liên tục |
| **One-shot** | `claude -p "prompt"` | Câu hỏi nhanh, script, automation | Single request/response |
| **Pipe** | `cat file \| claude -p "prompt"` | Unix pipeline, xử lý nội dung file | Single request với stdin |

### Khác biệt chính

**REPL Mode** duy trì context conversation qua nhiều lượt. Bạn có thể tinh
chỉnh câu hỏi, tham chiếu câu trả lời trước, và dùng slash commands. Hãy nghĩ
về nó như một phiên làm việc với đồng nghiệp.

**One-shot Mode** thực thi một prompt duy nhất và thoát ngay lập tức. Không có
conversation history — mỗi lệnh độc lập. Hoàn hảo cho script và automation khi
bạn cần behavior có thể dự đoán được, không có state.

**Pipe Mode** đưa dữ liệu bên ngoài (file, output của lệnh khác) trực tiếp vào
Claude làm context. Kết hợp với one-shot mode, nó cho phép workflow kiểu Unix
mạnh mẽ — Claude trở thành một công cụ nữa trong pipeline của bạn.

### Tiếp tục Session (Session Continuation)

Claude Code lưu lại conversation của bạn. Bạn có thể resume bất kỳ session nào trước đó:

- **`claude --continue`** / **`claude -c`** — tiếp tục conversation gần nhất ngay lập tức
- **`claude --resume`** / **`claude -r`** — hiển thị danh sách session hoặc resume theo ID/tên
- **`claude --resume "auth-refactor"`** — resume session cụ thể theo tên
- **`claude -c -p "follow-up"`** — tiếp tục session cuối ở chế độ headless (tiện cho script)

Bạn không bao giờ mất context khi đóng terminal hoặc chuyển task. Session được lưu trữ liên tục qua các lần khởi động lại.

### Phím tắt REPL

Khi ở trong REPL interactive session, các phím tắt sau giúp bạn làm việc nhanh hơn:

- **Input nhiều dòng**: `\` + Enter, hoặc `Shift+Enter` (chạy `/terminal-setup` trước)
- **Huỷ generation**: `Escape`
- **Thoát**: `Ctrl+C` hoặc `/exit`
- **Dán ảnh**: `Ctrl+V` (KHÔNG PHẢI `Cmd+V` trên macOS)
- **Đổi model**: `Option+P` / `Alt+P`
- **Bật/tắt thinking**: `Option+T` / `Alt+T`

### Sơ đồ quyết định

```mermaid
graph TD
    A[Need Claude Code?] --> B{Multiple<br/>back-and-forth?}
    B -->|Yes| C[REPL Mode<br/>claude]
    B -->|No| D{Processing<br/>file/command output?}
    D -->|Yes| E[Pipe Mode<br/>cat file \| claude -p ...]
    D -->|No| F{In a script<br/>or automation?}
    F -->|Yes| G[One-shot Mode<br/>claude -p ...]
    F -->|No| H{Quick single<br/>question?}
    H -->|Yes| G
    H -->|No| C
    style C fill:#e1f5ff
    style E fill:#fff3e0
    style G fill:#e8f5e9
```

---

## 3. DEMO — Làm mẫu từng bước

### Chế độ 1: REPL (Interactive) Mode

**Bước 1: Bắt đầu interactive session**

```bash
$ claude
```

Bạn vào REPL của Claude Code. Prompt thay đổi để cho biết bạn đang trong
session.

**Bước 2: Có conversation nhiều lượt**

```
> Cách tốt nhất để handle error trong TypeScript là gì?

Claude giải thích try/catch, Result type, error boundary, v.v.

> Cho mình ví dụ cụ thể với async/await được không?

Claude xây dựng trên câu trả lời trước với code cụ thể.

> Giờ refactor cái đó sang dùng Result type

Claude refactor ví dụ trước, duy trì context.
```

**Bước 3: Dùng slash commands**

```
/help
```

Output hiển thị các lệnh có sẵn:
```
# Output có thể khác
Available commands:
  /help     - Show this help
  /clear    - Clear conversation
  /compact  - Compress context
  /cost     - Show token usage
  /init     - Initialize CLAUDE.md
  ...
```

**Bước 4: Resume session trước đó**

```bash
# Tiếp tục session gần nhất
$ claude --continue

# Hiện danh sách session để chọn
$ claude --resume

# Resume session cụ thể theo tên
$ claude --resume "auth-refactor"
```

Khi bạn đóng terminal giữa chừng, toàn bộ conversation được lưu lại. Không cần giải thích lại context.

**Khi nào dùng REPL mode:**
- Khám phá codebase mới
- Debug issue phức tạp
- Phát triển iterative khi bạn cần tinh chỉnh approach
- Learning session khi bạn muốn hỏi follow-up

---

### Chế độ 2: One-shot Mode

**Bước 1: Chạy single query**

```bash
$ claude -p "Sự khác biệt giữa let và const trong JavaScript là gì?"
```

Output mong đợi:
```
# Output có thể khác
Trong JavaScript, `let` và `const` đều khai báo biến block-scoped, nhưng:

- `const` không thể reassign sau khi khởi tạo
- `let` có thể reassign

Dùng `const` mặc định, `let` khi cần reassign.
```

Lệnh thoát ngay sau response.

**Bước 2: Dùng trong script**

Tạo script đơn giản sử dụng Claude:

```bash
#!/bin/bash
# quick-explain.sh
claude -p "Giải thích error này trong một câu: $1"
```

Cách dùng:
```bash
$ ./quick-explain.sh "TypeError: Cannot read property 'map' of undefined"
```

**Bước 3: Kết hợp với tính năng shell**

```bash
# Lưu output ra file
$ claude -p "Viết README template cho TypeScript project" > README.md
```

**Khi nào dùng one-shot mode:**
- Câu hỏi nhanh không cần follow-up
- Shell script và automation
- CI/CD pipeline
- Generate file hoặc code snippet programmatically

---

### Chế độ 3: Pipe Mode

Pipe mode đưa stdin vào Claude làm context. Kết hợp với `-p`, nó tạo ra workflow kiểu Unix mạnh mẽ.

**Bước 1: Pipe nội dung file**

```bash
$ cat src/utils.ts | claude -p "Review code này tìm bug tiềm ẩn"
```

**Bước 2: Pipe output của lệnh**

```bash
$ git diff HEAD~1 | claude -p "Tóm tắt những thay đổi này"
```

Output mong đợi:
```
# Output có thể khác
Diff này cho thấy:
1. Thêm error handling cho function fetchUser
2. Cập nhật return type từ Promise<User> sang Promise<User | null>
3. Thêm test case mới cho scenario null
```

**Bước 3: Chain với tool khác**

```bash
$ git log --oneline -10 | claude -p "Commit nào trong số này là bug fix?"
```

**Khi nào dùng pipe mode:**
- Code review (pipe diff hoặc file)
- Log analysis (pipe error log)
- Batch processing nhiều file
- Tích hợp Claude vào Unix pipeline

---

## 4. PRACTICE — Tự thực hành

### Bài tập 1: Thành thạo REPL Mode

**Mục tiêu**: Dùng REPL mode cho conversation debugging iterative.

**Hướng dẫn**:
1. Bắt đầu Claude Code session với `claude`
2. Mô tả bug: "Mình có function trả về tổng của array, nhưng nó trả về NaN
   với empty array"
3. Hỏi Claude cách fix
4. Hỏi follow-up: "Làm sao thêm TypeScript type vào cái này?"
5. Chạy `/cost` để xem token usage
6. Thoát với `/exit` hoặc Ctrl+C

**Kết quả mong đợi**: Bạn có conversation nhiều lượt mà mỗi response xây dựng
trên context trước, và thấy tổng token cost.

<details>
<summary>💡 Gợi ý</summary>

Khác biệt chính với one-shot mode là Claude nhớ message trước của bạn. Bạn có
thể nói "cái function đó" mà không cần giải thích lại function nào.

</details>

<details>
<summary>✅ Đáp án</summary>

```bash
$ claude

> Mình có function trả về tổng của array, nhưng nó trả về NaN với empty array

# Claude giải thích issue (có thể là reduce không có initial value)

> Làm sao thêm TypeScript type vào cái này?

# Claude thêm typing đúng vào solution trước

/cost
# Hiển thị token dùng trong toàn bộ conversation

/exit
```

</details>

---

### Bài tập 2: Thành thạo One-shot Mode

**Mục tiêu**: Dùng one-shot mode trong shell workflow thực tế.

**Hướng dẫn**:
1. Dùng `claude -p` để hỏi: "Flag -r trong lệnh rm làm gì?"
2. Xác minh lệnh thoát ngay (bạn quay lại shell prompt)
3. Tạo shell alias đơn giản:
   `alias explain='claude -p "Giải thích lệnh này:"'`
4. Test: `explain "tar -xzf archive.tar.gz"`

**Kết quả mong đợi**: Mỗi lệnh trả về response và thoát. Alias giúp bạn dễ
dàng lấy giải thích nhanh.

<details>
<summary>💡 Gợi ý</summary>

Alias hoạt động vì one-shot mode thoát sau mỗi response. Nếu nó mở interactive
session, alias sẽ để bạn kẹt trong Claude session.

</details>

<details>
<summary>✅ Đáp án</summary>

```bash
$ claude -p "Flag -r trong lệnh rm làm gì?"
# Output giải thích recursive deletion
# Bạn ngay lập tức quay lại shell prompt

$ alias explain='claude -p "Giải thích lệnh này:"'
$ explain "tar -xzf archive.tar.gz"
# Output giải thích: extract, gzip, file flag
```

</details>

---

### Bài tập 3: Thành thạo Pipe Mode ⚠️

**Mục tiêu**: Dùng pipe mode để phân tích code hoặc diff.

**Hướng dẫn**:
1. Navigate đến project có git history
2. Chạy: `git diff HEAD~1 | claude -p "Commit này thay đổi gì?"`
3. Thử với file: `cat package.json | claude -p "Project này dùng dependency
   nào?"`
4. Thử nghiệm các combination khác

**Kết quả mong đợi**: Claude phân tích nội dung được pipe và response dựa trên
context đó.

⚠️ Nếu syntax pipe không hoạt động, kiểm tra `claude --help` để biết cách dùng
đúng.

<details>
<summary>💡 Gợi ý</summary>

Nội dung pipe trở thành context cho prompt của bạn. Bạn không cần paste nội
dung file — pipe operator xử lý việc đó.

</details>

<details>
<summary>✅ Đáp án</summary>

```bash
$ cd my-project
$ git diff HEAD~1 | claude -p "Commit này thay đổi gì?"
# Claude tóm tắt diff

$ cat package.json | claude -p "Project này dùng dependency nào?"
# Claude liệt kê và giải thích ngắn gọn mỗi dependency
```

⚠️ Syntax có thể khác theo version. Nếu không hoạt động, thử:
```bash
$ claude -p "Thay đổi gì?" < <(git diff HEAD~1)
```

</details>

---

## 5. CHEAT SHEET — Bảng tra cứu nhanh

| Tác vụ | Lệnh | Ghi chú |
|--------|------|---------|
| **Bắt đầu interactive session** | `claude` | Multi-turn, có slash commands |
| **One-shot query** | `claude -p "prompt"` | Single response, thoát ngay |
| **Pipe file vào Claude** | `cat file \| claude -p "prompt"` | ⚠️ Xác minh syntax |
| **Pipe output lệnh** | `cmd \| claude -p "prompt"` | ⚠️ Xác minh syntax |
| **Lưu output ra file** | `claude -p "..." > file.md` | ⚠️ Xác minh behavior |
| **Xem help trong session** | `/help` | Liệt kê lệnh có sẵn |
| **Xóa conversation** | `/clear` | Reset context trong REPL |
| **Nén context** | `/compact` | Giảm token usage |
| **Xem token usage** | `/cost` | Hiển thị usage cho session |
| **Thoát REPL** | `/exit` hoặc Ctrl+C | Kết thúc interactive session |

### Tham chiếu nhanh chọn chế độ

| Tình huống | Chế độ | Lý do |
|------------|--------|-------|
| "Giúp mình debug cái này" | REPL | Cần trao đổi qua lại |
| "X nghĩa là gì?" | One-shot | Trả lời nhanh, không follow-up |
| "Review diff này" | Pipe | Nội dung external làm input |
| "Giải thích log này" | Pipe | Nội dung external làm input |
| Tích hợp CI/CD | One-shot | Stateless, scriptable |
| Học/khám phá | REPL | Conversation iterative |
| Resume session cuối | `claude -c` | Tiếp tục từ nơi dừng lại |
| Resume session cụ thể | `claude -r "name"` | Chọn session theo tên |
| Resume + headless | `claude -c -p "query"` | Follow-up ở chế độ script |

---

## 6. PITFALLS — Những sai lầm cần tránh

| ❌ Sai lầm | ✅ Cách đúng |
|-----------|-------------|
| Dùng REPL cho câu hỏi one-off đơn giản | Dùng `claude -p "câu hỏi"` cho câu trả lời nhanh — nhanh hơn và không cần thoát session. |
| Quên flag `-p` trong script | Không có `-p`, `claude` vào interactive mode và script treo chờ input. Luôn dùng `-p` trong automation. |
| Pipe file khổng lồ không nghĩ đến token limit | File lớn tiêu tốn nhiều token. Chỉ pipe phần liên quan: `head -100 file \| claude -p "..."` hoặc dùng range dòng cụ thể. |
| Không check `/cost` trong session dài | REPL session tích lũy token. Chạy `/cost` định kỳ để tránh bill bất ngờ. |
| Mong đợi pipe mode duy trì state | Mỗi lệnh pipe là độc lập. Cho phân tích nhiều bước, dùng REPL mode thay thế. |

---

## 7. REAL CASE — Tình huống thực tế

**Bối cảnh**: Huy, mobile developer tại một công ty e-commerce Việt Nam, làm
việc trên dự án Kotlin Multiplatform (KMP). Team chia sẻ business logic giữa
app Android và iOS qua shared module. Trước khi submit PR, Huy cần code review
nhanh, nhưng senior reviewer thường bận họp — đặc biệt là khi reviewer làm việc
remote từ Singapore, lệch múi giờ 1 tiếng.

**Vấn đề**: Huy vừa hoàn thành refactoring lớn cho shared networking module.
Anh ấy muốn review sơ bộ trước khi review chính thức để bắt issue rõ ràng sớm.
Diff có hơn 400 dòng trải qua nhiều file.

**Giải pháp**: Huy dùng pipe mode để nhận feedback tức thì:

```bash
# Review toàn bộ diff
$ git diff main...feature/network-refactor | claude -p "Review thay đổi KMP
code này. Focus vào: 1) Kotlin idiom 2) Coroutine usage 3) Error handling
4) Vấn đề tương thích iOS/Android"
```

Với file cụ thể, anh ấy dùng review có target:

```bash
# Review chỉ shared module
$ git diff main -- shared/src/commonMain/kotlin/network/ | claude -p \
  "Check Kotlin networking code này tìm coroutine scope issue"
```

**Kết quả**: Claude phát hiện ba issue trước khi PR được tạo:
1. Thiếu `supervisorScope` có thể crash iOS app nếu child coroutine fail
2. Chuỗi `if-else` không idiomatic nên là `when` expression
3. Memory leak tiềm ẩn từ `HttpClient` không được đóng

Huy fix các issue này trong 10 phút. Khi senior reviewer (đang ở Singapore)
online vào sáng hôm sau và xem PR, code đã sạch. Review chính thức mất 5 phút
thay vì 30 phút như thường lệ. Giờ Huy chạy `git diff | claude -p "review"`
trước mỗi PR — nó đã thành một phần workflow của anh ấy, như chạy test vậy.

---

> **Tiếp theo**: [Module 1.3: Context Window cơ bản](../03-context-basics/) →
