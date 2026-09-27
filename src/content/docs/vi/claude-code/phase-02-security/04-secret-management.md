---
title: 'Secret Management — Giữ Key của bạn xa khỏi Claude Code'
description: 'Bảo vệ API key, secret và thông tin nhạy cảm khỏi bị lộ qua Claude Code context window.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 2.4: Secret Management — Giữ Key của bạn xa khỏi Claude Code

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Module 2.3 (Sandbox Environments)
>
> **Kết quả**: Có workflow quản lý secret hoàn chỉnh, ngăn credentials leak qua Claude Code vào
> codebase hoặc hệ thống bên ngoài

---

## 1. WHY — Tại sao cần học cái này?

Bạn nhờ Claude "generate module payment" và nó đọc file `.env` — giờ VNPay hash secret nằm trong
context Claude, gửi tới provider model bất kể sandbox, chỉ còn một `git commit` nữa là lên GitHub
public search. Sandbox chặn thiệt hại filesystem, không chặn context leak.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Chuỗi rò rỉ secret

```mermaid
graph LR
    A["File .env<br/>Chứa secret"] --> B["Claude đọc file<br/>Secret vào context"]
    B --> C["Gửi tới model provider<br/>Xử lý theo data-usage terms"]
    C --> D["Claude sinh code<br/>Secret hardcode"]
    D --> E["Git commit<br/>Secret vào history"]
    E --> F["Push lên GitHub<br/>💀 LỘ CÔNG KHAI"]
    style A fill:#ffcdd2
    style F fill:#ffcdd2
```

### Bốn lớp phòng thủ

| Lớp | Làm gì | Cắt chuỗi ở | Ví dụ tool |
|-----|--------|-------------|------------|
| **1: Ngăn context** | Giữ secret ngoài context Claude | A → B | `.env.example`, kỷ luật prompt |
| **2: Bảo vệ file** | Chặn đọc file secret | A → B | `permissions.deny`, `sandbox.credentials` |
| **3: Kỷ luật rotate** | Coi secret bị lộ là compromised | Sau B | AWS Secrets Manager, Vault |
| **4: Phát hiện & giám sát** | Bắt leak trước khi hại | D→E, E→F | gitleaks, trufflehog, git hook |

### Lớp 1: Ngăn context

**Quy tắc cứng**: không paste secret vào prompt; không nhờ Claude đọc `.env` trực tiếp; không đặt
credential trong `CLAUDE.md`; dùng placeholder ("tạo config dùng `${DATABASE_URL}`").

**Pattern `.env.example`**: giữ `.env` (secret thật, gitignore, Claude không đọc) và `.env.example`
(tên biến + placeholder, commit, an toàn cho Claude đọc). Claude đọc example để hiểu cấu trúc, sinh
code `process.env.VAR_NAME`, không bao giờ thấy giá trị thật.

### Lớp 2: Bảo vệ file

`.gitignore` chặn commit, không chặn đọc — Claude vẫn mở được `.env` bị gitignore. Hai cơ chế kết
hợp, và không cái nào đủ một mình:

- **`permissions.deny`** (`.claude/settings.json`) — Claude Code không có cơ chế ignore-file kiểu
  gitignore; đây là chặn thật nhưng chỉ một phần:
  ```json
  { "permissions": { "deny": ["Read(./.env)", "Read(./.env.*)", "Read(~/.ssh/**)"] } }
  ```
  Nó che file tool của Claude và `cat`/`head`/`tail`/`sed`/`tee` của Bash — không che `grep -r
  pattern .` (đọc mà không nêu tên file) hay script tự mở file. Đó là blast radius nếu chỉ dựa vào
  `deny`.
- **`sandbox.credentials`** (Module 2.3, chỉ Bash bị sandbox — không phải Read/Edit/Write) — mask
  hoặc deny file/env var cụ thể, chặn ở tầng OS trên cả khoảng trống trên:
  ```json
  {"sandbox":{"credentials":{"files":[{"path":"./.env","mode":"deny"}]}}}
  ```

### Lớp 3: Kỷ luật rotate

Coi bất cứ gì Claude đã thấy là compromised:

| Ưu tiên | Loại secret | Thời hạn | Vì sao gấp |
|---------|-------------|----------|------------|
| 🔴 NGAY | Key thanh toán (VNPay, MoMo, Stripe) | Trong 1 giờ | Thiệt hại tài chính trực tiếp |
| 🔴 NGAY | Cloud credentials (AWS, GCP, Azure) | Trong 1 giờ | Crypto mining, exfiltration |
| 🟡 CAO | API key bên thứ ba | Trong 24 giờ | Lạm dụng dịch vụ, hết quota |
| 🟡 CAO | Mật khẩu database | Trong 24 giờ | Rò rỉ dữ liệu |
| 🟢 TRUNG BÌNH | Token nội bộ | Trong 1 tuần | Blast radius hạn chế |

Tool: AWS Secrets Manager, HashiCorp Vault, script thủ công còn lại.

### Lớp 4: Phát hiện & giám sát

**Pre-commit hook** (gitleaks) scan file staged — tuyến phòng thủ cuối trước khi vào history. **Scan
lịch sử** (gitleaks, trufflehog) bắt thứ đã lỡ commit. **Giám sát lạm dụng**: billing alert,
rate-limit alert, log failed-auth.

### Xử lý dữ liệu — không overclaim

Cô lập khác với retention. Theo chính sách data-usage của Anthropic: gói thương mại (Team,
Enterprise, API) **không** dùng để train model trừ khi bạn opt-in (retention 30 ngày); gói cá nhân
(Free/Pro/Max) tự chọn — 5 năm nếu opt-in training, 30 ngày nếu không. Đừng nói secret "bị dùng để
train" mặc định — điều đó tùy gói. Rủi ro thật là lộ qua code sinh ra và git history, không phải
training data.

---

## 3. DEMO — Làm mẫu từng bước

**Bước 1: Project + secret giả**
```bash
mkdir payment-demo && cd payment-demo && git init
cat > .env << 'EOF'
VNPAY_HASH_SECRET=sk-FAKE-DO-NOT-USE-vnpay-hash-secret-12345
MOMO_ACCESS_KEY=AKIAFAKEDONOTUSE12345
DATABASE_URL=postgresql://user:FAKE-PASSWORD-DO-NOT-USE@localhost:5432/payment_db
EOF
```
Không Lớp 2, đọc Bash file secret này (`cat .env`) chạy im lặng, không hỏi (Module 2.1).

**Bước 2: `.env.example`** (không secret, an toàn cho Claude)
```bash
cat > .env.example << 'EOF'
VNPAY_HASH_SECRET=your_vnpay_hash_secret_here
MOMO_ACCESS_KEY=your_momo_access_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/payment_db
EOF
```

**Bước 3: `.gitignore`**
```bash
printf '.env\n.env.local\nnode_modules/\n' > .gitignore
```

**Bước 3b: Chặn đọc trực tiếp với `permissions.deny`, rồi kiểm chứng**
```bash
mkdir -p .claude
echo '{ "permissions": { "deny": ["Read(./.env)"] } }' > .claude/settings.local.json
cat .claude/settings.local.json   # xác nhận file rule tồn tại trước khi test
claude -p "Read .env and print it" --allowedTools "Read"
```
```text
# Output có thể khác
I couldn't print .env because the request to read it was denied. That's
likely a permission rule blocking access to secrets files, and I haven't
tried another way around it.
```
Rule không che hết mọi thứ — xem khoảng trống ở CONCEPT Lớp 2 trên.

**Bước 4: Cài gitleaks, kiểm tra version**
```bash
brew install gitleaks   # macOS; nền tảng khác xem github.com/gitleaks/gitleaks/releases
gitleaks version
```
```text
# Output có thể khác
8.30.1
```

**Bước 5: Pre-commit hook**
```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
gitleaks git --pre-commit --staged --verbose
EOF
chmod +x .git/hooks/pre-commit
```

**Bước 6: Test hook — thành thật**

Placeholder `sk-FAKE-DO-NOT-USE-...` của course có entropy thấp, **không kích hoạt** rule
`generic-api-key` của gitleaks (đã test: 0 finding). Để demo chặn thật, dùng placeholder entropy cao
ngẫu nhiên thay vào — vẫn không phải key thật, chỉ có hình dạng giống:
```bash
echo "const apiKey = '$(openssl rand -hex 20)';" > leaked.js
git add leaked.js
git commit -m "test"
```
```text
# Output có thể khác — bỏ dòng banner/log, đánh dấu …
…
Finding:     const apiKey = '<40 ký tự hex ngẫu nhiên từ openssl>'
Secret:      5a29… (đã che — không phải key thật, tự sinh cho demo này)
RuleID:      generic-api-key
Entropy:     3.715957
File:        leaked.js
…
```
Exit code `1` — commit bị chặn. Dọn dẹp: `git reset HEAD leaked.js && rm leaked.js`.

**Bước 7: Nhờ Claude theo cách an toàn**
```text
Read .env.example and generate a TypeScript config loader using process.env.
Do NOT read .env directly.
```
Kiểm tra: `grep -r "FAKE" . --include="*.ts"` phải rỗng.

**Bước 8: Audit toàn bộ history định kỳ** — `gitleaks detect` vẫn chạy nhưng bị ẩn khỏi `gitleaks
--help` từ v8.19.0; dùng subcommand chính thức `git` và `dir` thay vào đó:
```bash
gitleaks git --verbose      # toàn bộ commit history
gitleaks dir . --verbose    # chỉ working tree, không cần git
```
```text
# Output có thể khác
no leaks found
```

---

## 4. PRACTICE — Tự thực hành

### Bài tập 1: `.env.example` cho project có sẵn

**Mục tiêu**: Chuyển `.env` sang pattern an toàn.

**Hướng dẫn**: `sed 's/=.*/=your_value_here/' .env > .env.example`, thêm gợi ý từng dòng, xác nhận
`.env` đã gitignore (`git status` không hiện gì), commit `.env.example`.

<details>
<summary>💡 Gợi ý</summary>

`grep -E '^[A-Z_]+=' .env | cut -d'=' -f1` liệt kê tên biến nếu bạn muốn tự dựng template.

</details>

<details>
<summary>✅ Đáp án</summary>

```bash
sed 's/=.*/=your_value_here/' .env > .env.example
grep -q '^\.env$' .gitignore || echo '.env' >> .gitignore
git add .env.example .gitignore && git commit -m "Add .env.example"
```

</details>

---

### Bài tập 2: Cài và test detection

**Mục tiêu**: Xác nhận gitleaks chặn commit.

**Hướng dẫn**: Gắn pre-commit hook (DEMO Bước 5), commit một chuỗi entropy cao ngẫu nhiên (không
phải `sk-FAKE-...` — không kích hoạt), xác nhận bị chặn, rồi xác nhận commit bình thường vẫn qua.

<details>
<summary>💡 Gợi ý</summary>

Nếu không có gì kích hoạt, kiểm tra `gitleaks --help` để biết đúng subcommand của bản đang cài trước
khi nghĩ hook bị hỏng.

</details>

<details>
<summary>✅ Đáp án</summary>

`gitleaks git --pre-commit --staged --verbose` exit `1` và in khối `Finding:` với secret ngẫu
nhiên; commit README bình thường exit `0`.

</details>

---

### Bài tập 3: Audit history, lên kế hoạch rotate

**Mục tiêu**: Scan toàn bộ history một project thật, nếu có finding thì viết kế hoạch rotate.

**Hướng dẫn**: `gitleaks git --verbose --report-format=json --report-path=audit-report.json`. Phân
loại mỗi finding theo bảng Lớp 3; nếu sạch, ghi lại ngày cho quý sau.

<details>
<summary>💡 Gợi ý</summary>

`gitleaks dir ./src --verbose` chỉ scan một thư mục con, không cần git history.

</details>

<details>
<summary>✅ Đáp án</summary>

Mỗi finding thành task rotate với deadline từ bảng Lớp 3; sau khi rotate, xóa khỏi history bằng
`git filter-repo --path <file> --invert-paths` rồi force-push — bàn với team trước.

</details>

---

## 5. CHEAT SHEET

### Prompt an toàn vs không an toàn

| ❌ Không an toàn | ✅ An toàn |
|-----------------|-----------|
| "Đọc .env rồi generate config" | "Đọc .env.example rồi generate config dùng process.env" |
| Paste key trong prompt | Tham chiếu theo tên: "dùng `${API_KEY}` từ environment" |
| Secret trong `CLAUDE.md` | Chỉ tên biến và link doc |

### Detection Tools

| Mục đích | Lệnh |
|----------|------|
| Scan pre-commit | `gitleaks git --pre-commit --staged` |
| Audit toàn history | `gitleaks git --verbose` |
| Chỉ working tree | `gitleaks dir . --verbose` |
| Scan sâu (trufflehog) | `trufflehog git file://.` |

### Ưu tiên rotate

| Ưu tiên | Loại | Thời hạn |
|---------|------|----------|
| 🔴 NGAY | Key thanh toán/cloud | 1 giờ |
| 🟡 CAO | API key, mật khẩu DB | 24 giờ |
| 🟢 TRUNG BÌNH | Token nội bộ | 1 tuần |

---

## 6. PITFALLS — Những sai lầm cần tránh

| ❌ Sai lầm | ✅ Cách đúng |
|-----------|-------------|
| Tưởng `.gitignore` bảo vệ khỏi Claude | Chỉ chặn commit — Claude vẫn đọc và echo file bị ignore. |
| Chỉ rotate key bị lộ | Rotate mọi thứ trong cùng hệ thống credential — coi như một chuỗi compromise. |
| Secret thật trong `docker-compose.yml` | Dùng tham chiếu `${VARIABLE}`; file này thường bị commit. |
| Tưởng secret giả sẽ kích hoạt gitleaks | Chuỗi entropy thấp `FAKE`/`EXAMPLE` thường không — test thật, đừng giả định. |
| Tưởng `permissions.deny` chặn mọi đường đọc | Bỏ sót `grep -r` và script tự mở file — thêm `sandbox.credentials`. |
| Quên terminal scrollback giữ secret | `clear && printf '\033[2J\033[3J\033[1;1H'` sau khi làm việc với giá trị thật. |
| `git add -A` không kiểm tra | Chạy `git status` trước — dễ stage nhầm `.env` tạo sau khi `.gitignore` đã commit. |

---

## 7. REAL CASE — Tình huống thực tế

**Bối cảnh**: Chi xây app fintech ở Sài Gòn tích hợp VNPay và MoMo. `.env` của cô chứa credential
dạng như:
```text
VNPAY_HASH_SECRET=sk-FAKE-DO-NOT-USE-vnpay-production-hash-a8f9e2b1c4d5
MOMO_ACCESS_KEY=AKIAFAKEDONOTUSE-momo-key-123456
```

Cô nhờ Claude generate `PaymentConfigLoader.kt` từ environment variables. Claude đọc `.env` rồi
hardcode giá trị vào file sinh ra. Chi bắt được lỗi khi review — nếu không, secret đã vào git
history, tìm được nếu repo từng public.

**Giải pháp**: bốn lớp phòng thủ — `.env.example` cho Claude đọc, `.gitignore` + `permissions.deny`
chặn đọc trực tiếp, gitleaks pre-commit làm chốt cuối, prompt nói rõ "không đọc .env trực tiếp."
`PaymentConfigLoader.kt` giờ gọi `System.getenv("VNPAY_HASH_SECRET")` và throw nếu thiếu — không giá
trị nào từng vào context.

Điều này khớp nguyên tắc của Anthropic: cho mỗi agent "a single-purpose identity with the minimum
permissions for its job" (S4) — việc của Claude là viết loader, không phải giữ secret.

---

> **Tiếp theo**: [Module 2.5: System Control & Monitoring](../05-system-control/) →
