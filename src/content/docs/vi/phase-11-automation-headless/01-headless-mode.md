---
title: 'Headless Mode'
description: 'Chạy Claude Code ở chế độ headless: tự động hóa không cần tương tác, pipe mode và scripting.'
---

# Module 11.1: Headless Mode

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Phase 10 (Team Collaboration)
>
> **Kết quả**: Sau module này, bạn sẽ hiểu headless mode căn bản, biết cách script Claude Code, và sẵn sàng cho automation nâng cao.

---

## 1. WHY — Tại Sao Điều Này Quan Trọng

Bạn muốn chạy Claude Code như một phần của script. Có thể là tự động generate test cho toàn bộ file trong thư mục. Có thể là code review tự động cho mọi PR. Có thể là batch process documentation. Nhưng Claude Code là interactive — nó chờ input của bạn, hiển thị spinner, yêu cầu approval.

Headless mode giải quyết vấn đề này: Claude thực thi, xuất kết quả, trả quyền điều khiển lại cho script của bạn. Không cần tương tác. Điều này mở ra automation: cron job, CI/CD pipeline, batch processing, và nhiều hơn nữa.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Interactive vs Headless

| Khía cạnh | Interactive | Headless |
|-----------|------------|----------|
| Khởi chạy | `claude` | `claude -p "prompt"` |
| Đầu vào | Hội thoại | Một prompt duy nhất |
| Đầu ra | Có format, spinner | Raw stdout |
| Approval | Bắt buộc | Bỏ qua hoặc tự động |
| Use case | Development | Automation |

### Flag `-p`

Flag `-p` (print) là chìa khóa của headless mode:

```bash
claude -p "Prompt của bạn ở đây"
```

- Thực thi prompt
- Xuất kết quả ra stdout
- Trả về shell khi hoàn tất
- Exit code cho biết thành công/thất bại

### Capturing Output

```bash
# Lưu vào biến
result=$(claude -p "Giải thích function này")

# Ghi vào file
claude -p "Generate README" > README.md

# Pipe sang command khác
claude -p "List issues trong code" | grep "ERROR"
```

### Phương Thức Input

```bash
# Prompt trực tiếp
claude -p "Giải thích recursion"

# Với context từ file
claude -p "Review code này: $(cat file.js)"

# Pipe từ stdin
cat file.js | claude -p "Review code này"
```

### Exit Code

- `0`: Thành công
- Non-zero: Lỗi (check stderr)
- Dùng trong script: `if claude -p "..."; then ... fi`

---

## 3. DEMO — Từng Bước

**Scenario**: Tự động hóa việc tạo documentation bằng headless Claude Code.

### Bước 1: Thực Thi Headless Cơ Bản

```bash
claude -p "2 + 2 bằng bao nhiêu?"
```

Output:
```text
4
```

Kiểm tra exit code:
```bash
echo $?
```

Output:
```text
0
```

### Bước 2: Capture Vào Biến

```bash
explanation=$(claude -p "Giải thích async/await trong một đoạn văn")
echo "$explanation"
```

Output:
```text
Async/await là tính năng JavaScript giúp code bất đồng bộ
dễ viết và dễ đọc hơn bằng cách cho phép bạn viết các thao tác
bất đồng bộ theo cú pháp trông như đồng bộ...
```

### Bước 3: Generate File Từ Output

```bash
claude -p "Generate README.md cho một TypeScript utility library" > README.md
head -5 README.md
```

Output:
```text
# TypeScript Utility Library

Một tập hợp các tiện ích TypeScript hữu ích cho các tác vụ phổ biến.

## Cài Đặt
```

### Bước 4: Xử Lý Nhiều File

```bash
#!/bin/bash
# generate-docs.sh

for file in src/*.ts; do
  echo "Đang document $file..."
  doc=$(claude -p "Generate JSDoc comment cho: $(cat "$file")")
  echo "$doc" > "docs/$(basename "$file" .ts).md"
done

echo "Documentation hoàn tất!"
```

Chạy script:
```bash
chmod +x generate-docs.sh
./generate-docs.sh
```

Output:
```text
Đang document src/utils.ts...
Đang document src/helpers.ts...
Đang document src/api.ts...
Documentation hoàn tất!
```

### Bước 5: Logic Điều Kiện Dựa Trên Output

```bash
#!/bin/bash
# check-security.sh

result=$(claude -p "Review code này để tìm lỗi bảo mật.
Output 'SAFE' nếu không có vấn đề, hoặc 'UNSAFE: [lý do]' nếu có vấn đề.
Code: $(cat "$1")")

if [[ "$result" == SAFE* ]]; then
  echo "✅ $1 passed security check"
  exit 0
else
  echo "❌ $1 failed: $result"
  exit 1
fi
```

Chạy script:
```bash
./check-security.sh src/app.js
```

Output (trường hợp an toàn):
```text
✅ src/app.js passed security check
```

Output (trường hợp có vấn đề):
```text
❌ src/app.js failed: UNSAFE: SQL injection vulnerability detected
```

### Bước 6: Xử Lý Lỗi

```bash
if ! output=$(claude -p "Generate test cho $(cat file.js)" 2>&1); then
  echo "Lỗi: $output"
  exit 1
fi
echo "$output" > tests.js
```

### Bước 7: JSON Output cho Xử Lý Có Cấu Trúc

```bash
# Lấy output JSON có cấu trúc
result=$(claude -p --output-format json "Liệt kê 3 file source chính")
echo "$result" | jq '.result'

# Stream JSON cho xử lý real-time
claude -p --output-format stream-json "Fix tất cả lint error" | \
  while read -r line; do
    type=$(echo "$line" | jq -r '.type')
    echo "Event: $type"
  done
```

### Bước 8: Giới Hạn Turns và Budget

```bash
# Giới hạn 3 lượt agentic (ngăn automation chạy quá mức)
claude -p --max-turns 3 "Fix test failing trong auth.test.ts"

# Đặt giới hạn chi $2
claude -p --max-budget-usd 2 "Refactor module utils"

# Chỉ cho phép tool read-only
claude -p --allowedTools "Read" "Bash(git log *)" "Bash(git diff *)" \
  "Review codebase này tìm vấn đề bảo mật"
```

---

## 4. PRACTICE — Thực Hành

### Bài Tập 1: Lệnh Headless Đầu Tiên

**Mục tiêu**: Thực thi lệnh Claude headless đầu tiên của bạn.

**Hướng dẫn**:
1. Chạy: `claude -p "Nói xin chào"`
2. Capture vào biến: `greeting=$(claude -p "Nói xin chào")`
3. Echo biến: `echo "$greeting"`
4. Kiểm tra exit code: `echo $?`

<details>
<summary>💡 Gợi Ý</summary>

Output sẽ là một lời chào đơn giản. Exit code 0 nghĩa là thành công.
</details>

<details>
<summary>✅ Giải Pháp</summary>

```bash
claude -p "Nói xin chào"
# Output: Xin chào!

greeting=$(claude -p "Nói xin chào")
echo "$greeting"
# Output: Xin chào!

echo $?
# Output: 0 (thành công)
```
</details>

### Bài Tập 2: Generate File

**Mục tiêu**: Generate code vào file.

**Hướng dẫn**:
1. Generate function: `claude -p "Viết JavaScript function để viết hoa chữ cái đầu" > capitalize.js`
2. Verify: `cat capitalize.js`
3. Chạy: `node -e "$(cat capitalize.js); console.log(capitalize('hello'))"`

<details>
<summary>💡 Gợi Ý</summary>

Dùng redirect `>` để ghi output vào file. Dùng `$(cat file)` để đọc nội dung file làm input.
</details>

<details>
<summary>✅ Giải Pháp</summary>

```bash
claude -p "Viết JavaScript function tên capitalize nhận string và return với chữ cái đầu viết hoa" > capitalize.js
cat capitalize.js
node -e "$(cat capitalize.js); console.log(capitalize('hello'))"
# Output: Hello
```
</details>

### Bài Tập 3: Batch Processing Script

**Mục tiêu**: Xử lý nhiều file bằng script.

**Hướng dẫn**:
1. Tạo 3 file code nhỏ trong test directory
2. Viết bash script loop qua các file
3. Với mỗi file, generate mô tả một dòng
4. Output tất cả mô tả vào summary.txt

<details>
<summary>💡 Gợi Ý</summary>

Dùng `for file in directory/*.js` để loop. Dùng `>>` để append vào summary file thay vì overwrite.
</details>

<details>
<summary>✅ Giải Pháp</summary>

```bash
# Tạo test file
mkdir -p test-batch
echo "function add(a, b) { return a + b; }" > test-batch/math.js
echo "const API_URL = 'https://api.example.com';" > test-batch/config.js
echo "class User { constructor(name) { this.name = name; } }" > test-batch/user.js

# Batch processing script (lưu thành batch-describe.sh)
#!/bin/bash
for file in test-batch/*.js; do
  name=$(basename "$file")
  desc=$(claude -p "Mô tả trong một dòng: $(cat "$file")")
  echo "$name: $desc" >> test-batch/summary.txt
done

# Chạy và verify
chmod +x batch-describe.sh
./batch-describe.sh
cat test-batch/summary.txt
```
</details>

---

## 5. CHEAT SHEET

### Headless Cơ Bản

```bash
claude -p "prompt"                    # Thực thi và output
result=$(claude -p "prompt")          # Capture vào biến
claude -p "prompt" > file.txt         # Output vào file
claude -p "prompt" | grep "pattern"   # Pipe sang command
```

### Với File Input

```bash
claude -p "Review: $(cat file.js)"    # Inline nội dung file
```

### Trong Script

```bash
# Xử lý lỗi
if ! result=$(claude -p "..."); then
  echo "Failed"
  exit 1
fi

# Loop processing
for f in *.js; do
  claude -p "Document: $(cat "$f")" > "${f%.js}.md"
done
```

### Exit Code

| Code | Ý Nghĩa |
|------|---------|
| 0 | Thành công |
| Non-zero | Lỗi |

### Tất Cả Flag Quan Trọng

#### Flag Cốt Lõi

| Flag | Mục Đích | Ví Dụ |
|------|---------|-------|
| `-p "prompt"` | Thực thi headless (bắt buộc) | `claude -p "giải thích"` |
| `--output-format json` | Output JSON có cấu trúc | `claude -p --output-format json "list files"` |
| `--output-format stream-json` | Streaming JSON events | Cho pipeline xử lý real-time |
| `--verbose` | Hiện chi tiết tool usage | `claude -p --verbose "fix lint"` |
| `--help` | Hiện tất cả option | `claude --help` |

#### Giới Hạn & An Toàn

| Flag | Mục Đích | Ví Dụ |
|------|---------|-------|
| `--max-turns N` | Giới hạn lượt agentic | `claude -p --max-turns 3 "fix test"` |
| `--max-budget-usd N` | Giới hạn chi phí (USD) | `claude -p --max-budget-usd 5 "refactor auth"` |
| `--allowedTools "Tool1" "Tool2"` | Whitelist tool cụ thể | `claude -p --allowedTools "Read" "Bash(git *)"` |
| `--disallowedTools "Tool"` | Blacklist tool cụ thể | `claude -p --disallowedTools "Edit"` |
| `--dangerously-skip-permissions` | Bỏ qua mọi permission prompt (CI) | Chỉ dùng trong CI/CD tin cậy |

#### Model & Prompt

| Flag | Mục Đích | Ví Dụ |
|------|---------|-------|
| `--model <name>` | Chọn model cụ thể | `claude -p --model sonnet "query"` |
| `--system-prompt "text"` | Thay thế hoàn toàn system prompt | `claude -p --system-prompt "Bạn là reviewer"` |
| `--append-system-prompt "text"` | Thêm vào system prompt mặc định | `claude -p --append-system-prompt "Dùng TypeScript"` |

#### Session

| Flag | Mục Đích | Ví Dụ |
|------|---------|-------|
| `--continue` / `-c` | Tiếp tục session cuối | `claude -c -p "check type xong chưa"` |
| `--resume <id>` / `-r` | Resume session cụ thể | `claude -r "auth-work" -p "status?"` |

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Cách Đúng |
|-----------|--------------|
| Mong đợi tính năng interactive | Headless là one-shot. Không có conversation. |
| Prompt dài trực tiếp trong command | Dùng biến hoặc file cho prompt dài |
| Bỏ qua exit code | Luôn check exit code trong script |
| Không escape ký tự đặc biệt | Quote biến: `"$(cat file)"` |
| Giả định hành vi giống interactive | Test headless riêng. Output format khác. |
| Không xử lý lỗi | Capture stderr, check exit code |
| Overload với file khổng lồ | Context limit vẫn áp dụng. Chia nhỏ file lớn. |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Scenario**: Một startup Việt Nam cần tạo API documentation cho 50+ endpoint. Quy trình thủ công mất 2 ngày cho mỗi lần update documentation.

**Giải pháp với headless mode**:

```bash
#!/bin/bash
# generate-api-docs.sh

for endpoint in src/routes/*.ts; do
  name=$(basename "$endpoint" .ts)
  echo "Đang document $name..."

  claude -p "Generate OpenAPI documentation cho endpoint này:
$(cat "$endpoint")

Output ở định dạng YAML." > "docs/api/$name.yaml"
done

# Gộp tất cả YAML file
claude -p "Gộp các OpenAPI spec này thành một:
$(cat docs/api/*.yaml)" > docs/openapi.yaml

echo "API documentation đã được tạo!"
```

**Kết quả**:
- 2 ngày thủ công → 15 phút tự động
- Chạy hàng đêm qua cron job
- Documentation luôn up-to-date
- Chỉ cần human review khi cần thiết

**Quote**: "Headless mode đã biến Claude từ chat buddy thành documentation factory."

---

> **Phase Tiếp Theo**: [Module 11.2: SDK Integration](../02-claude-code-sdk/) →
