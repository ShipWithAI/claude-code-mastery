---
title: 'Secret Management — Giữ Key của bạn xa khỏi Claude Code'
description: 'Bảo vệ API key, secret và thông tin nhạy cảm khỏi bị lộ qua Claude Code context window.'
---

# Module 2.4: Secret Management — Giữ Key của bạn xa khỏi Claude Code

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Module 2.3 (Sandbox Environments)
>
> **Kết quả**: Sau module này, bạn sẽ có workflow quản lý secret hoàn chỉnh để ngăn credentials leak qua Claude Code vào codebase hoặc hệ thống bên ngoài

---

## 1. WHY — Tại sao cần học cái này?

Bạn đã sandbox Claude Code trong Docker. Đã giới hạn permissions. Bạn nghĩ secrets của mình an toàn. Rồi bạn nhờ Claude "generate module tích hợp payment VNPay" và nó rất là nhiệt tình đọc file .env của bạn — giờ thì VNPay hash secret đã nằm trong context của Claude, đã được log trên servers của Anthropic, có thể đã embed vào generated code, và chỉ còn một cú git commit nữa là lên GitHub public search. Sandbox chặn được filesystem damage. Nhưng không chặn được context leak. Module này cho bạn workflow thực chiến để cắt đứt chuỗi leak secret trước khi thiệt hại xảy ra.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Chuỗi Secret Leak

Ngay cả khi sandbox hoàn hảo, secrets vẫn có thể leak qua context của Claude. Hiểu được chuỗi này giúp bạn cắt nó đúng chỗ:

```mermaid
graph LR
    A[".env file<br/>Chứa secrets"] --> B["Claude đọc file<br/>Secrets vào context"]
    B --> C["Gửi lên Anthropic API<br/>Log trên servers"]
    C --> D["Claude generate code<br/>Hardcode secrets"]
    D --> E["Git commit<br/>Secrets vào history"]
    E --> F["Push lên GitHub<br/>💀 LỘ RA CÔNG KHAI"]

    style A fill:#ffcdd2
    style F fill:#ffcdd2
```

### Bốn Lớp Phòng Thủ

Chiến lược quản lý secret của bạn cần phòng thủ theo chiều sâu. Mỗi lớp cắt chuỗi ở một điểm khác nhau:

| Lớp | Tác dụng | Cắt chuỗi tại | Công cụ ví dụ |
|-----|----------|---------------|---------------|
| **Lớp 1: Ngăn Context** | Giữ secrets hoàn toàn ngoài context của Claude | A → B | Pattern .env.example, kỷ luật prompt |
| **Lớp 2: Bảo vệ File** | Bảo vệ secret files khỏi bị đọc | A → B | File permissions, .gitignore, ⚠️ .claudeignore (cần xác minh) |
| **Lớp 3: Kỷ luật Rotation** | Giả định secrets đã lộ là đã bị compromise, rotate chúng | Sau B | AWS Secrets Manager, HashiCorp Vault |
| **Lớp 4: Phát hiện & Giám sát** | Bắt leaked secrets trước khi gây thiệt hại | D → E, E → F | gitleaks, trufflehog, git hooks |

### Lớp 1: Ngăn Context (Phòng thủ chính)

Cách phòng thủ hiệu quả nhất là giữ secrets hoàn toàn ngoài context của Claude:

**Quy tắc cứng:**
- KHÔNG BAO GIỜ paste secrets trực tiếp vào prompts của Claude Code
- KHÔNG BAO GIỜ yêu cầu Claude đọc file .env trực tiếp
- KHÔNG BAO GIỜ ghi credentials vào CLAUDE.md project notes
- Dùng placeholder variables trong prompts: "Create config using ${DATABASE_URL}" chứ không phải giá trị thật

**Pattern .env.example (Best Practice):**
Maintain hai files:
- `.env` — Chứa secrets thật, KHÔNG BAO GIỜ commit, KHÔNG BAO GIỜ để Claude đọc
- `.env.example` — Chứa tên variables với placeholder values, commit vào git, an toàn cho Claude đọc

Claude tham khảo .env.example để hiểu cấu trúc config, generate code dùng patterns `process.env.VAR_NAME`, không bao giờ thấy giá trị secret thật.

### Lớp 2: Bảo vệ File

Các barrier bổ sung để ngăn secret access ngẫu nhiên:

**.gitignore vs Claude Access:**
Phân biệt quan trọng: .gitignore ngăn git commits nhưng KHÔNG ngăn Claude Code đọc files. Claude vẫn có thể access .env ngay cả khi nó đã gitignored.

**File Permissions:**
Từ Module 2.1, nhớ lại rằng file permissions (chmod 600) có thể hạn chế access, nhưng cách này dễ vỡ nếu Claude chạy với user của bạn.

**⚠️ Cần xác minh — .claudeignore:**
Kiểm tra xem Claude Code có tôn trọng file .claudeignore không (tương tự .gitignore) để ngăn đọc các files cụ thể. Tính năng này có thể có hoặc không có trong phiên bản hiện tại.

### Lớp 3: Kỷ luật Secret Rotation

Giả định bất kỳ secret nào Claude đã thấy là đã bị compromise. Thiết lập mức độ ưu tiên rotation:

| Ưu tiên | Loại Secret | Thời gian Rotation | Tại sao cấp bách |
|---------|-------------|-------------------|------------------|
| 🔴 NGAY LẬP TỨC | Payment keys (VNPay, MoMo, ZaloPay) | Trong 1 giờ | Mất tiền trực tiếp, phạt pháp lý |
| 🔴 NGAY LẬP TỨC | Cloud credentials (AWS, GCP, Azure) | Trong 1 giờ | Crypto mining, data exfiltration (nhớ câu chuyện Tùng) |
| 🟡 CAO | API keys (third-party services) | Trong 24 giờ | Lạm dụng service, cạn quota |
| 🟡 CAO | Database passwords | Trong 24 giờ | Data breach, vi phạm privacy |
| 🟢 TRUNG BÌNH | Internal service tokens | Trong 1 tuần | Blast radius giới hạn trong sandbox |

**Công cụ để rotation:**
- AWS Secrets Manager — tự động rotation cho AWS credentials
- HashiCorp Vault — quản lý secret tập trung
- Manual rotation scripts — cho payment providers không có automated rotation

### Lớp 4: Phát hiện & Giám sát

Bắt secrets lọt qua các lớp khác trước khi gây thiệt hại:

**Pre-commit Hooks:**
Công cụ như gitleaks scan staged files tìm secret patterns trước khi cho phép commit. Đây là tuyến phòng thủ cuối cùng trước khi secrets vào git history.

**Git History Scanning:**
Công cụ như trufflehog scan toàn bộ git history tìm secrets bị commit nhầm. Chạy định kỳ và đặc biệt sau các đợt refactoring lớn.

**Giám sát Lạm dụng:**
- AWS billing alerts — phát hiện charges bất thường (crypto mining, data egress)
- API rate limit alerts — phát hiện credential abuse
- Failed authentication logs — phát hiện credential stuffing attempts

---

## 3. DEMO — Làm mẫu từng bước

Chúng ta sẽ setup workflow quản lý secret hoàn chỉnh cho project tích hợp payment Việt Nam.

**Bước 1: Tạo thư mục project**
```bash
mkdir payment-demo && cd payment-demo
git init
```

Kết quả mong đợi:
```
Initialized empty Git repository in /path/to/payment-demo/.git/
```

**Bước 2: Tạo .env với FAKE secrets để demo**
```bash
cat > .env << 'EOF'
# FAKE CREDENTIALS - KHÔNG DÙNG TRONG PRODUCTION
# Đây là patterns giả rõ ràng chỉ để demo
VNPAY_HASH_SECRET=sk-FAKE-DO-NOT-USE-vnpay-hash-secret-12345
VNPAY_TMN_CODE=FAKE-TMN-CODE-67890
MOMO_PARTNER_CODE=FAKE-MOMO-PARTNER-CODE-67890
MOMO_ACCESS_KEY=AKIAFAKEDONOTUSE12345
MOMO_SECRET_KEY=sk-FAKE-DO-NOT-USE-momo-secret-abcdef
ZALOPAY_APP_ID=FAKE-ZALOPAY-APP-ID-99999
DATABASE_URL=postgresql://user:FAKE-PASSWORD-DO-NOT-USE@localhost:5432/payment_db
REDIS_URL=redis://:FAKE-REDIS-PASSWORD@localhost:6379
EOF
```

Tại sao dùng patterns này: Tất cả secrets đều dùng prefixes giả rõ ràng (FAKE-, DO-NOT-USE) nên không bao giờ nhầm với credentials thật.

**Bước 3: Tạo .env.example (KHÔNG có secrets, an toàn cho Claude)**
```bash
cat > .env.example << 'EOF'
# Copy file này thành .env và điền giá trị thật
# Xem docs: https://sandbox.vnpayment.vn/apis/docs/

# VNPay integration
VNPAY_HASH_SECRET=your_vnpay_hash_secret_here
VNPAY_TMN_CODE=your_vnpay_terminal_code_here

# MoMo integration (https://developers.momo.vn)
MOMO_PARTNER_CODE=your_momo_partner_code_here
MOMO_ACCESS_KEY=your_momo_access_key_here
MOMO_SECRET_KEY=your_momo_secret_key_here

# ZaloPay integration (https://docs.zalopay.vn)
ZALOPAY_APP_ID=your_zalopay_app_id_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/payment_db

# Redis cache
REDIS_URL=redis://:password@localhost:6379
EOF
```

Tại sao an toàn: Chỉ có tên variables và placeholder text. Claude có thể đọc để hiểu cấu trúc config mà không thấy secrets thật.

**Bước 4: Thêm .env vào .gitignore**
```bash
cat > .gitignore << 'EOF'
# Secret files - KHÔNG BAO GIỜ commit những file này
.env
.env.local
.env.*.local

# Dependency directories
node_modules/
vendor/

# OS files
.DS_Store
Thumbs.db
EOF
```

Tại sao quan trọng: Ngăn accidental git commits, nhưng nhớ rằng cái này KHÔNG ngăn Claude đọc các files này.

**Bước 5: Cài đặt gitleaks (pre-commit secret scanner)**

Trên macOS:
```bash
brew install gitleaks
```

Trên Linux:
```bash
# Download latest release từ GitHub
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz
tar -xzf gitleaks_8.18.1_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

Xác minh cài đặt:
```bash
gitleaks version
```

Kết quả mong đợi:
```
v8.18.1
```

**Bước 6: Tạo pre-commit hook**
```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Đang chạy gitleaks scan trên staged files..."
gitleaks protect --staged --verbose

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ PHÁT HIỆN SECRETS! Commit bị chặn."
    echo "Xóa secrets khỏi staged files và thử lại."
    exit 1
fi

echo "✅ Không phát hiện secrets. Tiến hành commit."
exit 0
EOF

chmod +x .git/hooks/pre-commit
```

Tại sao hiệu quả: gitleaks scan staged files trước khi commit, chặn commit nếu tìm thấy secrets.

**Bước 7: Test cơ chế bảo vệ (cố tình leak)**
```bash
# Tạo file chứa fake secret
echo "const apiKey = 'sk-FAKE-DO-NOT-USE-test-12345';" > leaked.js
git add leaked.js
git commit -m "test commit with secret"
```

Kết quả mong đợi:
```
Đang chạy gitleaks scan trên staged files...

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

Finding:     const apiKey = 'sk-FAKE-DO-NOT-USE-test-12345';
Secret:      sk-FAKE-DO-NOT-USE-test-12345
RuleID:      generic-api-key
Entropy:     3.891689
File:        leaked.js
Line:        1

❌ PHÁT HIỆN SECRETS! Commit bị chặn.
```

Hoàn hảo. Hook hoạt động. Giờ xóa test file:
```bash
git reset HEAD leaked.js
rm leaked.js
```

**Bước 8: Yêu cầu Claude generate config (cách AN TOÀN)**

Khởi động Claude Code trong thư mục project:
```bash
claude
```

Dùng prompt AN TOÀN này:
```
Đọc .env.example và generate TypeScript config loader có các tính năng:
1. Load tất cả environment variables trong .env.example
2. Validate các variables bắt buộc phải tồn tại
3. Cung cấp type-safe access đến config values
4. Dùng process.env để đọc giá trị thật lúc runtime

KHÔNG đọc .env trực tiếp. Chỉ dùng .env.example làm template.
```

Tại sao an toàn: Claude đọc .env.example (không có secrets), generate code dùng `process.env.VARIABLE_NAME` (runtime loading), không bao giờ thấy giá trị secret thật.

**Bước 9: Xác minh generated code KHÔNG có hardcoded secrets**
```bash
# Tìm fake secret patterns trong generated files
grep -r "FAKE" . --include="*.js" --include="*.ts" --include="*.json"
```

Kết quả mong đợi:
```
# Phải KHÔNG trả về gì nếu Claude làm đúng
# Bất kỳ kết quả nào nghĩa là secrets leak vào generated code
```

Nếu clean, bạn đã dùng Claude thành công mà không lộ secrets.

**Bước 10: Scan toàn bộ project history (audit định kỳ)**
```bash
gitleaks detect --verbose
```

Kết quả mong đợi:
```
○
│╲
│ ○
○ ░
░    gitleaks

No leaks found
```

Chạy cái này định kỳ, đặc biệt sau những thay đổi lớn hoặc trước releases.

---

## 4. PRACTICE — Tự thực hành

### Exercise 1: Setup .env.example Pattern cho Project có sẵn

**Mục tiêu**: Chuyển đổi project hiện có đang dùng secrets sang pattern .env.example an toàn.

**Hướng dẫn**:
1. Tìm một project hiện có đang dùng file .env (hoặc tạo sample Node.js project)
2. Xác định tất cả environment variables hiện có trong .env
3. Tạo .env.example với placeholder values cho tất cả variables
4. Thêm .env vào .gitignore nếu chưa có
5. Update tài liệu để reference .env.example thay vì .env
6. Xác minh .env KHÔNG được track bởi git: `git status` phải không show .env

**Kết quả mong đợi**: Bạn có .env.example đã commit vào git, .env được ignore và an toàn, sẵn sàng cho Claude reference an toàn.

<details>
<summary>💡 Gợi ý</summary>

Để list tất cả variables trong .env:
```bash
grep -E '^[A-Z_]+=' .env | cut -d'=' -f1
```

Để generate .env.example tự động:
```bash
sed 's/=.*/=your_value_here/' .env > .env.example
```

Sau đó manually thay placeholder text bằng hints mô tả cụ thể.
</details>

<details>
<summary>✅ Giải pháp</summary>

Workflow hoàn chỉnh:

```bash
# Di chuyển đến project của bạn
cd ~/projects/my-app

# Generate .env.example từ .env (thay thế tất cả values)
sed 's/=.*/=your_value_here/' .env > .env.example

# Edit .env.example để thêm hints hữu ích
nano .env.example  # Thay generic placeholders bằng hướng dẫn cụ thể

# Ví dụ transformation:
# Trước: DATABASE_URL=your_value_here
# Sau:  DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Đảm bảo .env đã gitignored
if ! grep -q "^\.env$" .gitignore; then
    echo ".env" >> .gitignore
fi

# Xác minh .env không được track
git status | grep .env
# Phải show: nothing to commit (nếu .env đã untracked từ trước)
# Hoặc: .gitignore modified (nếu bạn vừa thêm vào)

# Commit .env.example
git add .env.example .gitignore
git commit -m "Add .env.example for safe secret management"
```

Giờ khi làm việc với Claude, luôn reference .env.example thay vì .env.
</details>

---

### Exercise 2: Cài đặt và Test Secret Detection

**Mục tiêu**: Setup gitleaks pre-commit hook và xác minh nó chặn secret commits.

**Hướng dẫn**:
1. Cài gitleaks trên hệ thống của bạn (dùng brew trên macOS, download binary trên Linux)
2. Tạo pre-commit hook trong git repository (dùng script từ DEMO bước 6)
3. Make hook executable: `chmod +x .git/hooks/pre-commit`
4. Test với cố tình leak:
   - Tạo file: `echo "password=secret123" > test.txt`
   - Thử commit: `git add test.txt && git commit -m "test"`
5. Xác minh commit bị chặn với cảnh báo gitleaks
6. Dọn dẹp: `git reset HEAD test.txt && rm test.txt`

**Kết quả mong đợi**: Commits chứa secrets bị chặn. Bạn có automated protection chống accidental secret commits.

<details>
<summary>💡 Gợi ý</summary>

Nếu gitleaks không detect test secret của bạn, thử patterns rõ ràng hơn:
- `export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE`
- `const apiKey = 'sk-test1234567890abcdef'`
- `password=supersecret123!`

gitleaks dùng entropy analysis và pattern matching. Patterns quá đơn giản có thể không trigger.
</details>

<details>
<summary>✅ Giải pháp</summary>

Setup và test hoàn chỉnh:

```bash
# Cài gitleaks
# macOS:
brew install gitleaks

# Linux:
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz
tar -xzf gitleaks_8.18.1_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/

# Xác minh
gitleaks version

# Tạo pre-commit hook trong repo của bạn
cd ~/projects/my-app
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Đang chạy gitleaks scan..."
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
    echo "❌ Phát hiện secrets! Commit bị chặn."
    exit 1
fi
echo "✅ Không phát hiện secrets."
exit 0
EOF

chmod +x .git/hooks/pre-commit

# Test với obvious secret pattern
echo "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" > leaked-secret.txt
git add leaked-secret.txt
git commit -m "test secret detection"

# Phải thấy gitleaks chặn commit
# Output bao gồm: "Secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# Dọn dẹp
git reset HEAD leaked-secret.txt
rm leaked-secret.txt

# Xác minh hook hoạt động với commits bình thường
echo "# README" > README.md
git add README.md
git commit -m "add readme"
# Phải thành công với "✅ Không phát hiện secrets."
```

Giờ mọi commit đều được tự động scan. Secrets không thể vào git history mà không bypass tường minh.
</details>

---

### Exercise 3: Audit Project History tìm Secrets

**Mục tiêu**: Scan toàn bộ git history của project hiện có tìm secrets bị commit nhầm, tạo rotation plan nếu tìm thấy.

**Hướng dẫn**:
1. Chọn một project thật (của bạn hoặc test repo)
2. Chạy full history scan: `gitleaks detect --verbose`
3. Nếu tìm thấy secrets:
   - List từng secret với: type, location (commit hash, file, line)
   - Phân loại theo rotation priority (🔴 NGAY LẬP TỨC, 🟡 CAO, 🟢 TRUNG BÌNH)
   - Tạo rotation plan với timeline
   - Dùng `git filter-branch` hoặc BFG Repo-Cleaner để xóa khỏi history (nâng cao)
4. Nếu không tìm thấy secrets: Document kết quả audit clean với ngày tháng

**Kết quả mong đợi**: Báo cáo audit hoàn chỉnh với action plan cho bất kỳ exposed secrets nào.

<details>
<summary>💡 Gợi ý</summary>

Để scan chỉ specific directories:
```bash
gitleaks detect --source=./src --verbose
```

Để generate report file:
```bash
gitleaks detect --report-format=json --report-path=gitleaks-report.json
```

Để scan nhanh hơn (bỏ qua large binary files):
```bash
gitleaks detect --verbose --no-git
```
</details>

<details>
<summary>✅ Giải pháp</summary>

Workflow audit hoàn chỉnh:

```bash
# Di chuyển đến project
cd ~/projects/production-app

# Chạy full history scan
gitleaks detect --verbose --report-format=json --report-path=audit-report.json

# Nếu tìm thấy secrets, review report
cat audit-report.json | jq '.[] | {file: .File, secret: .Secret, commit: .Commit}'

# Ví dụ phân tích output:
# Finding 1: AWS key trong config/aws.json (commit abc123)
# Finding 2: Database password trong docker-compose.yml (commit def456)
# Finding 3: API key trong README.md (commit ghi789)

# Tạo rotation plan
cat > SECRET_ROTATION_PLAN.md << 'EOF'
# Secret Rotation Plan - 2024-01-15

## Findings

### 🔴 NGAY LẬP TỨC (rotate trong 1 giờ)
- [ ] AWS_ACCESS_KEY_ID (commit abc123, config/aws.json)
  - Hành động: Generate key mới trong AWS Console
  - Update: Tất cả deployment configs, CI/CD secrets
  - Xác minh: Deploy test environment với key mới
  - Thu hồi: Old key sau khi xác minh

### 🟡 CAO (rotate trong 24 giờ)
- [ ] DATABASE_PASSWORD (commit def456, docker-compose.yml)
  - Hành động: Update password trong PostgreSQL
  - Update: Tất cả service configs, developer .env files
  - Xác minh: Tất cả services reconnect thành công

### 🟢 TRUNG BÌNH (rotate trong 1 tuần)
- [ ] THIRD_PARTY_API_KEY (commit ghi789, README.md)
  - Hành động: Regenerate trong provider dashboard
  - Update: Configuration files
  - Xác minh: API calls vẫn hoạt động

## Git History Cleanup

Sau khi rotate tất cả secrets, xóa khỏi git history:

```bash
# Dùng BFG Repo-Cleaner (khuyến nghị)
bfg --replace-text secrets.txt repo.git

# HOẶC dùng git filter-branch (chậm hơn)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch config/aws.json' \
  --prune-empty --tag-name-filter cat -- --all
```

⚠️ CẢNH BÁO: History rewrite buộc force pushes đến tất cả collaborators.
Phối hợp với team trước khi thực thi.
EOF

# Nếu không tìm thấy secrets, document clean audit
cat > SECURITY_AUDIT_CLEAN.md << 'EOF'
# Security Audit - 2024-01-15

## Kết quả Scan
- Tool: gitleaks v8.18.1
- Phạm vi: Full git history (512 commits, 3 năm)
- Kết quả: ✅ Không phát hiện secrets

## Patterns đã Scan
- AWS credentials
- API keys (generic patterns)
- Private keys (RSA, SSH)
- Database passwords
- OAuth tokens
- JWT secrets

Audit tiếp theo: 2024-04-15 (theo lịch hàng quý)
EOF
```

Điều này tạo audit trail có document cho compliance và security reviews.
</details>

---

## 5. CHEAT SHEET

### Prompts An toàn vs Không an toàn

| ❌ Không an toàn | ✅ An toàn | Tại sao |
|-----------------|-----------|---------|
| "Đọc .env và generate config" | "Đọc .env.example và generate config dùng process.env" | Giữ secrets ngoài context của Claude |
| Paste API key vào prompt: `VNPAY_HASH_SECRET=sk-abc123` | Reference bằng variable: "Dùng ${VNPAY_HASH_SECRET} từ environment" | Secrets không bao giờ vào context |
| "Debug code này: `const key = 'sk-abc123'`" | "Debug code này: `const key = process.env.API_KEY`" | Share code structure, không phải values |
| Lưu credentials trong CLAUDE.md notes | Chỉ lưu tên variables và documentation links | CLAUDE.md là context, không phải vault |

### Secret Storage Patterns

| Pattern | Độ an toàn | Khi nào dùng |
|---------|-----------|-------------|
| `.env` file (gitignored, không để Claude đọc) | ✅ AN TOÀN | Local development, không bao giờ share |
| `.env.example` (committed, an toàn cho Claude) | ✅ AN TOÀN | Configuration templates, documentation |
| Hardcoded trong code | ❌ KHÔNG BAO GIỜ | Ngay cả "tạm thời" cũng không |
| CLAUDE.md project notes | ❌ KHÔNG BAO GIỜ | Claude đọc cái này, thành context |
| Terminal history | ⚠️ RỦI RO | History tồn tại qua sessions, dùng `HISTCONTROL=ignorespace` |
| CI/CD secrets (GitHub Secrets, GitLab Variables) | ✅ AN TOÀN | Production deployments |
| Secret management systems (Vault, AWS Secrets Manager) | ✅ TỐT NHẤT | Enterprise, automated rotation |

### Rotation Priority Reference

| Ưu tiên | Loại Secret | Thời gian | Hành động |
|---------|------------|-----------|-----------|
| 🔴 NGAY LẬP TỨC | Payment provider keys (VNPay, MoMo, ZaloPay) | 1 giờ | Regenerate trong provider dashboard, update tất cả configs |
| 🔴 NGAY LẬP TỨC | Cloud credentials (AWS, GCP, Azure) | 1 giờ | Rotate qua cloud console, update IAM/service accounts |
| 🟡 CAO | Third-party API keys | 24 giờ | Regenerate trong provider settings |
| 🟡 CAO | Database passwords | 24 giờ | Update qua DB admin, restart services |
| 🟢 TRUNG BÌNH | Internal service tokens | 1 tuần | Regenerate, phối hợp với team |
| 🟢 TRUNG BÌNH | Development tokens | 1 tuần | Rotate trong regular maintenance |

### Detection Tools Quick Reference

| Tool | Mục đích | Command | Khi nào chạy |
|------|---------|---------|--------------|
| **gitleaks** | Pre-commit scanning | `gitleaks protect --staged` | Mỗi commit (qua hook) |
| **gitleaks** | Full history audit | `gitleaks detect --verbose` | Hàng tháng, trước releases |
| **trufflehog** | Deep history scan | `trufflehog git file://.` | Hàng quý, sau incidents |
| **git-secrets** | AWS-focused scanning | `git secrets --scan` | Chỉ AWS projects |
| **detect-secrets** | Baseline tracking | `detect-secrets scan` | CI/CD pipeline |

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Lỗi | ✅ Cách đúng | Tại sao quan trọng |
|--------|-------------|-------------------|
| Nghĩ .gitignore bảo vệ khỏi Claude | Dùng pattern .env.example + không bao giờ prompt Claude đọc .env | .gitignore chỉ ngăn git commits, không ngăn file reading. Claude vẫn có thể access gitignored files. |
| Chỉ rotate leaked key | Rotate TẤT CẢ keys trong cùng hệ thống hoặc có similar access | Nếu một key leak, giả định compromise chain: nếu AWS key lộ, attacker có thể đã access các keys khác lưu trong cùng hệ thống. |
| Dùng real secrets trong docker-compose.yml | Dùng environment variable references: `${DATABASE_URL}` | docker-compose.yml thường được commit vào git. Ngay cả khi gitignored, Claude có thể đọc để lấy context. |
| Lưu secrets trong CLAUDE.md cho "memory" | Chỉ lưu tên variables và links đến secret docs | CLAUDE.md được load vào context mỗi session. Bất cứ gì trong đó đều gửi lên Anthropic API. |
| Tin câu "I won't remember this" của Claude | Giả định mọi thứ Claude thấy đều được log | AI systems log prompts và responses cho training và debugging. Không bao giờ dựa vào "temporary" context. |
| Quên terminal scrollback capture secrets | Clear scrollback sau khi làm việc với secrets: `clear && printf '\033[2J\033[3J\033[1;1H'` | Terminal scrollback là searchable text. Screen sharing hoặc screenshots có thể leak secrets từ history. |
| Chạy `git add -A` mà không check staged files | Luôn chạy `git status` trước `git add`, hoặc stage files tường minh | Dễ accidentally stage .env nếu nó được tạo sau khi .gitignore đã commit. |
| Lưu secrets trong browser password manager | Dùng dedicated secret manager (1Password, Bitwarden) với vault riêng cho dev secrets | Browser password managers sync qua devices, có thể xuất hiện trong search suggestions, dễ accidentally paste hơn. |
| Chia sẻ .env qua Zalo hoặc Facebook Messenger cho "onboarding nhanh" | Dùng password manager (1Password, Bitwarden) có tính năng secure sharing, hoặc thiết lập vault riêng | File .env gửi qua chat tồn tại trên nhiều thiết bị (điện thoại, máy tính, cloud backup của chat app) — mỗi bản copy là một điểm leak tiềm năng. |
| Startup Việt Nam hay skip secret rotation vì "chưa có thời gian" | Đặt calendar reminder rotate secret mỗi quý. Với AI coding tools như Claude Code, bất kỳ secret nào Claude đã "thấy" đều có thể đã bị log | "Chưa có thời gian" là quả bom hẹn giờ — nhớ Tùng trong Module 2.1 mất $2,847 vì không rotate AWS key? |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Nam là senior mobile developer tại fintech startup Sài Gòn (kiểu Mangala hoặc Momo). Anh ấy đang build expense tracking app tích hợp VNPay, MoMo, và ZaloPay cho payment processing. App cần handle sensitive payment credentials cho cả test và production environments.

**Problem**: Nam lưu configuration trong .env ở project root:

```bash
# .env (gitignored nhưng Claude đọc được)
VNPAY_HASH_SECRET=sk-REAL-vnpay-production-hash-a8f9e2b1c4d5
VNPAY_TMN_CODE=REALVNPAY12345
MOMO_PARTNER_CODE=MOMO_REAL_PARTNER_XYZ789
MOMO_ACCESS_KEY=AKIAREALMOMOKEY123456
MOMO_SECRET_KEY=sk-REAL-momo-secret-production-x1y2z3
ZALOPAY_APP_ID=REALZALOPAY67890
VIETCOMBANK_API_KEY=VCB-REAL-API-KEY-abcdef
```

Anh ấy hỏi Claude Code: "Generate class PaymentConfigLoader.kt load VNPay, MoMo, ZaloPay configuration từ environment variables."

Claude nhiệt tình đọc file .env để "hiểu cấu trúc config" và generate:

```kotlin
// PaymentConfigLoader.kt - GENERATED BY CLAUDE CODE
object PaymentConfigLoader {
    val vnpayConfig = VNPayConfig(
        hashSecret = "sk-REAL-vnpay-production-hash-a8f9e2b1c4d5", // ❌ LEAK!
        tmnCode = "REALVNPAY12345" // ❌ LEAK!
    )

    val momoConfig = MoMoConfig(
        partnerCode = "MOMO_REAL_PARTNER_XYZ789", // ❌ LEAK!
        accessKey = "AKIAREALMOMOKEY123456", // ❌ LEAK!
        secretKey = "sk-REAL-momo-secret-production-x1y2z3" // ❌ LEAK!
    )

    val zalopayConfig = ZaloPayConfig(
        appId = "REALZALOPAY67890" // ❌ LEAK!
    )
}
```

May mắn Nam catch trong code review trước khi commit. Nhưng nếu không thì sao? Production payment credentials sẽ đã:
1. Hardcoded trong Kotlin source
2. Committed vào git history
3. Pushed lên GitHub
4. Potentially exposed trong pull request diffs
5. Searchable bởi GitHub's code search (nếu repo goes public)

Tệ hơn nữa: secrets giờ đã nằm trong context của Claude, logged trên servers của Anthropic, potentially used trong model training data.

**Expanded Context**: Nếu Nam làm cho công ty outsourcing (như TechViet Solutions trong Module 2.3), secret của client A có thể leak khi làm việc với client B — chính xác vấn đề mà sandbox giải quyết, nhưng sandbox không chặn context leak. Đây là lý do tại sao quản lý secret cần riêng một bộ phòng thủ ngoài sandbox.

Nhớ lại Nam trong Module 2.1 mất $2,847 vì AWS key leak? Đó là blast radius của cloud credentials. Payment credentials thì còn tệ hơn — liên quan đến tiền thật, compliance, và pháp lý.

**Solution**: Workflow .env.example ngăn chặn hoàn toàn tình huống này.

Nam implement four-layer defense:

**Lớp 1 - Ngăn Context:**
```bash
# .env.example (AN TOÀN - committed vào git, Claude đọc được)
# VNPay configuration (https://sandbox.vnpayment.vn/apis/docs/)
VNPAY_HASH_SECRET=your_vnpay_hash_secret_here
VNPAY_TMN_CODE=your_vnpay_terminal_code_here

# MoMo configuration (https://developers.momo.vn)
MOMO_PARTNER_CODE=your_momo_partner_code_here
MOMO_ACCESS_KEY=your_momo_access_key_here
MOMO_SECRET_KEY=your_momo_secret_key_here

# ZaloPay configuration (https://docs.zalopay.vn)
ZALOPAY_APP_ID=your_zalopay_app_id_here

# Vietcombank integration (https://developer.vietcombank.com.vn)
VIETCOMBANK_API_KEY=your_vietcombank_api_key_here
```

**Lớp 2 - Bảo vệ File:**
```bash
# .gitignore
.env
.env.local
.env.production
*.local
```

**Lớp 3 - Detection Hook:**
```bash
# .git/hooks/pre-commit
#!/bin/bash
gitleaks protect --staged --verbose
```

**Lớp 4 - Prompt An toàn:**
Prompt Claude Code mới:
```
Đọc .env.example và generate PaymentConfigLoader.kt với các tính năng:
1. Load mỗi environment variable dùng System.getenv()
2. Throw descriptive error nếu required variable missing
3. Cung cấp type-safe access đến tất cả config values
4. Support cả production và test environments

KHÔNG đọc .env trực tiếp. Chỉ dùng .env.example làm template cho variable names.
```

**Generated code (AN TOÀN):**
```kotlin
// PaymentConfigLoader.kt - PHIÊN BẢN AN TOÀN
object PaymentConfigLoader {
    private fun requireEnv(key: String): String {
        return System.getenv(key)
            ?: throw IllegalStateException("Thiếu environment variable bắt buộc: $key")
    }

    val vnpayConfig by lazy {
        VNPayConfig(
            hashSecret = requireEnv("VNPAY_HASH_SECRET"),
            tmnCode = requireEnv("VNPAY_TMN_CODE")
        )
    }

    val momoConfig by lazy {
        MoMoConfig(
            partnerCode = requireEnv("MOMO_PARTNER_CODE"),
            accessKey = requireEnv("MOMO_ACCESS_KEY"),
            secretKey = requireEnv("MOMO_SECRET_KEY")
        )
    }

    val zalopayConfig by lazy {
        ZaloPayConfig(
            appId = requireEnv("ZALOPAY_APP_ID")
        )
    }

    val vietcombankConfig by lazy {
        VietcombankConfig(
            apiKey = requireEnv("VIETCOMBANK_API_KEY")
        )
    }
}
```

**Kết quả**:
- Không có secrets trong context của Claude
- Không có secrets trong generated code
- Không có secrets trong git history
- Secrets được load lúc runtime từ environment
- Error messages rõ ràng nếu secrets thiếu
- An toàn để commit, an toàn để share trong PR reviews

Payment integration của Nam giờ đã secure. Anh ấy có thể làm việc với Claude Code mà không sợ credential leaks.

**Bonus**: Khi team cần rotate VNPay credentials (quarterly security requirement), họ chỉ cần update file .env và restart service. Không thay đổi code, không git commits, không liên quan đến Claude.

**Lesson Learned**: Secret management không phải là feature "nice to have" — nó là foundation của security strategy khi dùng AI coding tools. Giống như sandbox (Module 2.3) bảo vệ filesystem, .env.example pattern bảo vệ secrets khỏi context leak. Hai cơ chế này bổ trợ nhau, không thay thế nhau.

---

> **Next**: [Module 2.5: System Control & Monitoring](../05-system-control/) →
