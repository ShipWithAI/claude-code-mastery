---
title: 'System Control — CLAUDE.md, Settings, và Governance'
description: 'Quản lý cấu hình hệ thống Claude Code qua CLAUDE.md, settings và chính sách governance cho team.'
---

# Module 2.5: System Control — CLAUDE.md, Settings, và Governance

> **Thời gian học**: ~45 phút
>
> **Yêu cầu trước**: Module 2.4 (Secret Management)
>
> **Kết quả**: Sau module này, bạn sẽ có hệ thống governance security hoàn chỉnh bao gồm CLAUDE.md security policies, team guidelines, và actionable checklists cho safe AI-assisted development

---

## 1. WHY — Tại sao cần học cái này?

Bạn đã học về threats, permissions, sandboxing, và secrets. Nhưng đây là harsh reality: kiến thức không có hệ thống thì thất bại. Bạn sẽ quên check permission prompt. Một đồng đội sẽ hardcode API key. Một deployment Friday tối muộn sẽ skip pre-commit hook. Security không phải về việc perfect một lần — mà là về việc có hệ thống bắt lỗi cho bạn khi bạn mệt, vội, hoặc mất tập trung. Module này chuyển kiến thức Phase 2 của bạn thành governance framework hoạt động ngay cả khi con người sai lầm. Bạn sẽ rời Phase 2 không chỉ biết risks, mà có complete operational system để quản lý chúng.

---

## 2. CONCEPT — Khái niệm cốt lõi

### CLAUDE.md là Security Policy

Đa số developers nghĩ `CLAUDE.md` là coding style guide — tabs vs spaces, naming conventions, import order. Nhưng với security-conscious teams, **`CLAUDE.md` là AI security policy document**. Đây là nơi bạn codify các rules giữ credentials an toàn và systems nguyên vẹn.

**Những security rules nào thuộc về CLAUDE.md:**

```markdown
## Security Rules (CRITICAL)

### File Access Restrictions
- NEVER read files in: ~/.ssh/, ~/.aws/, ~/.config/, ~/.env
- NEVER read .env files directly - use .env.example for reference
- NEVER traverse parent directories (../) to access files outside project

### Command Restrictions
- NEVER run rm -rf without explicit user confirmation
- NEVER run git push without showing diff first
- NEVER run curl/wget with credentials in URL
- NEVER run commands with --force flag without confirmation

### Code Generation Rules
- NEVER hardcode API keys, tokens, or secrets
- ALWAYS use environment variables: process.env.VARIABLE_NAME
- ALWAYS reference .env.example for configuration structure
- NEVER include real credential values in comments or documentation

### Git Rules
- NEVER commit .env files
- ALWAYS verify .gitignore includes secret files before committing
- NEVER force push to main/master branch
```

**⚠️ HIỂU RÕ ĐIỀU NÀY:** CLAUDE.md là **ADVISORY, KHÔNG ENFORCED**. Claude Code đọc nó và cố gắng follow, nhưng đây là guideline, không phải guardrail. Hãy nghĩ nó như code review checklist — helpful, nhưng không phải compiler error. Bạn vẫn cần các layers khác (permissions, sandboxing, secret management) để thực sự enforce.

Dù vậy, CLAUDE.md cực kỳ powerful vì:
1. **Nó shape behavior proactively** — Claude Code đọc nó trước mỗi response
2. **Nó document expectations cho humans** — team bạn biết rules
3. **Nó version-controlled** — security policy evolve cùng code
4. **Nó project-specific** — rules khác nhau cho production vs prototype projects

### Configuration Settings

⚠️ Cần verification — các configuration commands cụ thể có thể khác nhau tùy Claude Code version.

Claude Code có cả global và project-level configuration:

```bash
# View current configuration
claude config show

# Set a configuration value
claude config set <key> <value>

# Reset to defaults
claude config reset
```

**Typical configuration areas:**
- **Permissions**: Default approval settings (callback to Module 2.2)
- **Model selection**: Claude model nào dùng mặc định
- **Context**: Auto-compaction settings
- **Logging**: Log gì và ở đâu

**Project-level vs Global:**
- **Global config**: Ở `~/.claude/config` — affects all projects
- **Project config**: Ở `.claude/config` trong project root — overrides global
- **Use case**: Global = safe defaults, Project = exceptions for trusted repos

### Team Governance

Security không scale nếu không có governance. Đây là complete stack:

**1. Shared CLAUDE.md in Version Control**
- Ở project root
- Reviewed trong pull requests như code thường
- Team đồng ý về rules, document exceptions

**2. CLAUDE_PERMISSIONS.md** (từ Exercise 2.2.3)
- Document những commands nào approved/denied và tại sao
- Giải thích reasoning: "Chúng ta deny `docker run --privileged` vì..."
- Living document evolve với threat model

**3. Onboarding Checklist**
- Team member mới được security training, không chỉ code walkthrough
- Verifies security tooling đã installed (gitleaks, sandbox, etc.)
- Pair programming session cho thấy safe Claude Code usage

**4. Regular Security Audits**
- Hàng tuần: Quick scans với `gitleaks detect`
- Hàng tháng: Full review of CLAUDE.md, permission logs, incident reports
- Hàng quý: Threat model update — có risks mới không?

**5. Incident Response Plan**
- Làm gì nếu secret được committed
- Notify ai nếu Claude Code làm điều gì unexpected
- Post-mortem template để học từ incidents

### Complete Security Stack

Diagram này cho thấy cả 5 layers của Phase 2 phối hợp như defense-in-depth:

```mermaid
graph TD
    ATTACK["🔴 Potential Threat<br/>Malicious prompt, accidental leak, etc."]

    L1["Layer 1: THREAT AWARENESS<br/>(Module 2.1)<br/>Biết cái gì có thể sai"]
    L2["Layer 2: PERMISSION DISCIPLINE<br/>(Module 2.2)<br/>Deny dangerous commands"]
    L3["Layer 3: SANDBOX ISOLATION<br/>(Module 2.3)<br/>Contain blast radius"]
    L4["Layer 4: SECRET MANAGEMENT<br/>(Module 2.4)<br/>Giữ credentials khỏi context"]
    L5["Layer 5: SYSTEM CONTROL<br/>(Module 2.5)<br/>Governance và auditing"]

    SAFE["✅ PROTECTED<br/>Damage prevented or contained"]

    ATTACK --> L1
    L1 -->|"Threat recognized"| L2
    L2 -->|"Permission denied"| SAFE
    L2 -->|"Permission bypassed"| L3
    L3 -->|"Contained in sandbox"| SAFE
    L3 -->|"Escaped sandbox"| L4
    L4 -->|"Secrets protected"| SAFE
    L4 -->|"Secrets exposed"| L5
    L5 -->|"Detected in audit"| SAFE

    style ATTACK fill:#ffcdd2
    style SAFE fill:#c8e6c9
    style L1 fill:#fff3e0
    style L2 fill:#fff3e0
    style L3 fill:#fff3e0
    style L4 fill:#fff3e0
    style L5 fill:#fff3e0
```

**Điều gì xảy ra khi mỗi layer fail:**

| Layer | Nếu nó Fail | Bị Bắt Bởi |
|-------|-------------|-----------|
| Layer 1 (Awareness) | Bạn không nhận ra risk | Permission prompt (L2) |
| Layer 2 (Permissions) | Bạn approve dangerous command | Sandbox limits damage (L3) |
| Layer 3 (Sandbox) | Claude access outside sandbox | Secrets không trong context (L4) |
| Layer 4 (Secrets) | Secret vào Claude's context | Audit catches it (L5) |
| Layer 5 (Governance) | Không audit nào catch leak | 💀 Full exposure |

Sức mạnh của model này: **bạn cần multiple failures cho catastrophic damage**. Bất kỳ single layer nào fail thì uncomfortable nhưng recoverable. Chỉ khi cả 5 layers fail thì bạn mới có full credential exposure.

### Security Checklists — Kiến Thức Thành Thói Quen

Checklists là cách pilots ngăn crashes và surgeons ngăn mistakes. Đây là security checklists cho Claude Code:

**Pre-Session Checklist:**
- [ ] Tôi có đúng project directory không?
- [ ] Docker sandbox đang chạy không? (cho sensitive projects)
- [ ] .env.example có và .env gitignored chưa?
- [ ] gitleaks pre-commit hook active chưa?
- [ ] Tôi đã đọc CLAUDE.md security rules chưa?

**During-Session Checklist:**
- [ ] Đọc mọi permission prompt trước khi approve
- [ ] Không bao giờ paste secrets vào prompts
- [ ] Reference .env.example, không bao giờ .env
- [ ] Verify paths trong file operations ở trong project
- [ ] Hỏi lại bất kỳ command nào tôi không hiểu

**Post-Session Checklist:**
- [ ] Run `git status` để check unexpected changes
- [ ] Run `gitleaks detect` trên project
- [ ] Clear terminal scrollback nếu secrets được displayed
- [ ] Exit Docker sandbox nếu dùng
- [ ] Review generated code tìm hardcoded secrets

**Weekly Audit Checklist:**
- [ ] Run full project scan: `gitleaks detect --verbose`
- [ ] Review CLAUDE.md cho needed updates
- [ ] Check .env variables mới chưa có trong .env.example
- [ ] Review git history tìm committed secrets
- [ ] Update team về new security practices

In ra. Plastic hóa. Dán lên màn hình. Security là habit, không phải event.

---

## 3. DEMO — Làm mẫu từng bước

Hãy build một complete secure project từ đầu, implement cả 5 layers của Phase 2.

### Step 1: Tạo Security-Focused CLAUDE.md

```bash
$ mkdir secure-banking-api && cd secure-banking-api
$ git init
```

Tạo comprehensive `CLAUDE.md` với security là first-class concern:

```bash
$ cat > CLAUDE.md << 'EOF'
# Banking API — Claude Code Security Policy

## Project Overview
Backend API cho ứng dụng mobile banking. Xử lý customer accounts,
transactions, và integrations với Napas payment network của Vietnam.

**Security Level**: CRITICAL — project này handle financial data và PII.

---

## Security Rules (CRITICAL)

### File Access Restrictions
- NEVER read files in: ~/.ssh/, ~/.aws/, ~/.config/, ~/.env
- NEVER read .env files directly - use .env.example for reference only
- NEVER traverse parent directories (../) to access files outside project root
- NEVER read files in /etc/, /var/, or other system directories

### Command Restrictions
- NEVER run rm -rf without explicit user confirmation showing exact path
- NEVER run git push without showing full diff first
- NEVER run curl/wget with credentials in URL (use headers or .netrc)
- NEVER run commands with --force, --no-verify, or similar danger flags
- NEVER run database migration commands in production without review
- NEVER run docker commands that expose ports externally without confirmation

### Code Generation Rules
- NEVER hardcode API keys, tokens, passwords, or secrets
- ALWAYS use environment variables: process.env.VARIABLE_NAME (Node.js)
- ALWAYS reference .env.example for configuration structure
- NEVER include real credential values in comments, logs, or error messages
- NEVER log sensitive fields (account numbers, passwords, tokens)
- ALWAYS redact PII in generated code examples

### Git Rules
- NEVER commit .env, .env.local, or any file with real credentials
- ALWAYS verify .gitignore includes secret files before first commit
- NEVER force push to main, master, or production branches
- NEVER commit database dumps or backup files
- ALWAYS use conventional commit format: type(scope): message

### Database Rules
- NEVER run DROP, TRUNCATE, or DELETE without WHERE clause
- NEVER expose database connection strings in code
- NEVER commit migration files that contain real data
- ALWAYS use parameterized queries, never string concatenation

### Vietnamese Payment Integration Rules
- NEVER hardcode VNPay hash secret or merchant ID
- NEVER hardcode MoMo API key or partner code
- NEVER hardcode ZaloPay app ID or key
- ALWAYS reference .env.example for payment credentials structure

### Audit Trail
When this CLAUDE.md is updated with new security rules, document:
- Date of change
- Rule added/modified
- Reason (incident, new threat, compliance requirement)

---

## Coding Standards
[Rest of coding standards here...]

EOF
```

**Expected result:** Bạn giờ có security policy document mà Claude Code sẽ đọc trước mỗi response.

**Tại sao quan trọng:** Điều này proactively shapes Claude's behavior. Nó sẽ không perfect, nhưng dramatically giảm risky suggestions.

### Step 2: Set Up Secret Management (Layer 4)

```bash
$ cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/banking_dev
DB_POOL_SIZE=10

# Authentication
JWT_SECRET=your-256-bit-secret-here
JWT_EXPIRY=3600

# VNPay Integration (Vietnam payment gateway)
VNPAY_TMN_CODE=your_vnpay_terminal_code
VNPAY_HASH_SECRET=your_vnpay_hash_secret
VNPAY_ENDPOINT=https://sandbox.vnpayment.vn/paymentv2

# MoMo Integration (Vietnam e-wallet)
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn

# AWS (for document storage)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=banking-documents-dev

# Monitoring
SENTRY_DSN=https://public@sentry.io/project-id
LOG_LEVEL=debug
EOF
```

```bash
$ cat > .gitignore << 'EOF'
# Environment files - NEVER COMMIT THESE
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/

# Build output
dist/
build/

# Database
*.db
*.sqlite
database/backups/

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF
```

**Expected result:**
```
$ git status
On branch main

No commits yet

Untracked files:
  .env.example
  .gitignore
  CLAUDE.md
```

**.env KHÔNG được listed** — đó là đúng. Nó sẽ bị gitignored khi được tạo.

### Step 3: Install Pre-Commit Hook (Layer 4)

```bash
$ mkdir -p .git/hooks

$ cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Đang chạy gitleaks secret scan..."

# Run gitleaks on staged files only
gitleaks protect --staged --verbose

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ COMMIT BỊ CHẶN: Secrets detected in staged files"
  echo ""
  echo "Làm gì tiếp:"
  echo "1. Remove secret khỏi file"
  echo "2. Add vào .env.example như placeholder"
  echo "3. Document trong .env.example comments"
  echo "4. Re-stage và commit"
  echo ""
  echo "Để bypass check này (NGUY HIỂM): git commit --no-verify"
  exit 1
fi

echo "✅ Không phát hiện secrets"
exit 0
EOF

$ chmod +x .git/hooks/pre-commit
```

**Test nó:**
```bash
$ echo "AWS_KEY=AKIAIOSFODNN7EXAMPLE" > test-secret.txt
$ git add test-secret.txt
$ git commit -m "test"
```

**Expected output:**
```
🔍 Đang chạy gitleaks secret scan...

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

Finding:     AWS_KEY=AKIAIOSFODNN7EXAMPLE
Secret:      AKIAIOSFODNN7EXAMPLE
File:        test-secret.txt
Line:        1

❌ COMMIT BỊ CHẶN: Secrets detected in staged files
```

**Tại sao quan trọng:** Đây là last line of defense trước khi secrets vào version control.

### Step 4: Tạo Sandbox Script (Layer 3)

```bash
$ cat > sandbox.sh << 'EOF'
#!/bin/bash

# Banking API Sandbox — isolated Claude Code environment
# Network disabled, memory limited, filesystem restricted

CONTAINER_NAME="banking-api-sandbox"
PROJECT_DIR="$(pwd)"

echo "🔐 Đang khởi động secure sandbox cho banking API..."
echo "   Network: TẮT"
echo "   Memory: Giới hạn 4GB"
echo "   Filesystem: Read-only ngoại trừ /workspace"

docker run -it --rm \
  --name "$CONTAINER_NAME" \
  -v "$PROJECT_DIR":/workspace \
  -w /workspace \
  --network=none \
  --memory=4g \
  --cpus=2 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=1g \
  -e PS1="\[\e[31m\][SANDBOX]\[\e[0m\] \w $ " \
  node:20-alpine \
  sh

echo "🔓 Đã thoát sandbox"
EOF

$ chmod +x sandbox.sh
```

**Tại sao quan trọng:** Cho sensitive projects, điều này contain bất kỳ accidental damage nào trong sandbox environment.

### Step 5: Tạo Team Onboarding Document

```bash
$ cat > SECURITY_ONBOARDING.md << 'EOF'
# Banking API — Security Onboarding cho Claude Code

Chào mừng vào team! Trước khi bắt đầu dùng Claude Code trên project này,
hoàn thành security checklist sau.

## Prerequisites (Install những thứ này trước)

- [ ] Claude Code CLI đã installed
- [ ] Docker Desktop đã installed và running
- [ ] gitleaks đã installed: `brew install gitleaks`
- [ ] Git configured với work email của bạn

## Các Bước Setup

### 1. Clone và Verify
```bash
git clone <repo-url>
cd secure-banking-api
git status  # Phải show clean working tree
```

### 2. Đọc Security Documentation
- [ ] Đọc CLAUDE.md security rules (5 phút)
- [ ] Đọc toàn bộ document này (10 phút)
- [ ] Hiểu 5-layer security model (Module 2.5)

### 3. Set Up Local Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env với real credentials (lấy từ team lead)
# KHÔNG BAO GIỜ commit file này
nano .env

# Verify .env đã gitignored
git status  # KHÔNG nên show .env as untracked
```

### 4. Test Pre-Commit Hook
```bash
# Cái này phải PASS
echo "test" > test.txt
git add test.txt
git commit -m "test: verify pre-commit hook"

# Cái này phải FAIL
echo "PASSWORD=secret123" > test-secret.txt
git add test-secret.txt
git commit -m "test: this should be blocked"
# Expected: Commit bị blocked bởi gitleaks

# Clean up test
git reset HEAD
rm test.txt test-secret.txt
```

### 5. Test Sandbox (Bắt buộc cho Production Work)
```bash
./sandbox.sh
# Bạn phải thấy: [SANDBOX] /workspace $
# Thử: ping google.com
# Expected: Network unreachable
# Thoát sandbox: exit
```

### 6. Practice Safe Claude Code Session

Start Claude Code và test với safe task:

```bash
claude
```

Trong Claude Code session:
- Prompt: "Cho tôi xem structure của .env.example mà không đọc .env"
- Verify: Claude đọc .env.example, KHÔNG phải .env
- Prompt: "Thêm endpoint mới cho account balance"
- Verify: Check permission prompts trước khi approve
- Khi được yêu cầu run commands, đọc kỹ

Thoát Claude Code: `/exit`

### 7. Pair Programming Session

Schedule 1-hour session với senior team member để:
- [ ] Review một real pull request cùng nhau
- [ ] Practice dùng Claude Code trên actual task
- [ ] Discuss security scenarios: "Nếu Claude suggest đọc .env thì sao?"

## Daily Workflow Checklists

In ra và để visible:

**Trước Khi Start Claude Code:**
- [ ] Đúng project directory?
- [ ] Dùng sandbox cho sensitive work?
- [ ] CLAUDE.md security rules đã đọc lại chưa?

**Trong Claude Code Session:**
- [ ] Đọc mọi permission prompt
- [ ] Không paste secrets trong prompts
- [ ] Hỏi lại unexpected commands

**Sau Session:**
- [ ] `git status` — có unexpected changes không?
- [ ] `gitleaks detect` — có secrets leak không?
- [ ] Code review own changes trước khi commit

## Báo Cáo Sự Cố (Incident Reporting)

Nếu có gì sai:

1. **Secret committed vào git**:
   - DỪNG ngay lập tức
   - Notify team lead trên Slack: #engineering-incidents
   - KHÔNG push
   - Follow runbook: docs/runbooks/secret-leak-response.md

2. **Claude suggest dangerous command**:
   - DENY command đó
   - Document trong #engineering-ai channel
   - Propose CLAUDE.md update

3. **Unexpected file access**:
   - Check file nào được accessed: review Claude's response
   - Nếu sensitive file: treat như potential leak
   - Document và discuss với team

## Resources

- Phase 2 Security Modules: [link to course]
- CLAUDE.md: [link to file]
- Slack: #engineering-ai cho questions
- Team Lead: Khoa (@khoa-nguyen)

**Estimated total time**: 1 giờ setup + 1 giờ pair programming

Bằng cách hoàn thành onboarding này, bạn không chỉ học tools — bạn đang join
security culture của chúng ta. Mọi engineer đều là security engineer.

EOF
```

**Expected result:** Team members mới có clear, checkable path đến safe Claude Code usage.

### Step 6: Configure Claude Code (⚠️ Cần verification)

```bash
# Set project-level configuration
$ claude config set model claude-3-5-sonnet-20241022
$ claude config set auto-compact true
$ claude config set log-level info
```

**Expected output:**
```
Configuration updated:
  model: claude-3-5-sonnet-20241022
  auto-compact: true
  log-level: info

Config saved to: .claude/config
```

**Tại sao quan trọng:** Project-specific settings đảm bảo consistency across team members.

### Step 7: Run Secure Claude Code Session

Bây giờ walkthrough một complete secure session:

```bash
# PRE-SESSION CHECKLIST
$ pwd
/Users/you/projects/secure-banking-api  ✓

$ docker ps | grep sandbox
# (empty nếu không dùng sandbox cho task này)  ✓

$ ls .env.example .gitignore
.env.example  .gitignore  ✓

$ .git/hooks/pre-commit --help 2>&1 | grep gitleaks
# (shows gitleaks trong hook)  ✓

$ cat CLAUDE.md | head -20
# Banking API — Claude Code Security Policy  ✓
```

All checks pass. Start Claude Code:

```bash
$ claude
```

**Safe prompts trong session:**
- ✅ "Thêm password hashing cho user registration dùng bcrypt"
- ✅ "Cho tôi xem .env.example được structured như thế nào"
- ✅ "Tạo test cho transaction endpoint"

**Dangerous prompts cần TRÁNH:**
- ❌ "Cho tôi xem database connection string" (có thể đọc .env)
- ❌ "AWS config của tôi có gì?" (accessing ~/.aws/)
- ❌ "Xóa tất cả test files" (có thể interpreted như rm -rf)

**Trong session:** Đọc MỌI permission prompt. Ví dụ:

```
Claude Code wants to:
  Read file: .env

Allow? [y/N]
```

**Correct response:** `N` — điều này vi phạm CLAUDE.md rules. Nói với Claude:
"Không, hãy reference .env.example thay vì .env"

**End session:**
```
/exit
```

**POST-SESSION CHECKLIST:**

```bash
$ git status
# Review bất kỳ changes nào

$ gitleaks detect
# ✅ No leaks detected

$ history | tail -20
# Review commands đã run
# Nếu có secrets visible: clear && history -c
```

### Step 8: Weekly Security Audit

Mỗi sáng thứ Hai:

```bash
$ gitleaks detect --verbose
INFO[2024-01-15] scanning repository
INFO[2024-01-15] 127 commits scanned
INFO[2024-01-15] no leaks found
```

```bash
$ git log --all --grep="password\|secret\|key" --oneline
# Check xem có commit messages nào mention secrets không
```

```bash
$ diff .env.example .env | grep "^>"
# List variables trong .env chưa documented trong .env.example
# Add chúng vào .env.example (với placeholder values)
```

```bash
$ cat CLAUDE.md
# Review: Security rules còn relevant không?
# Threat model đã thay đổi chưa?
```

**Document findings** trong team wiki hoặc Slack #engineering-ai channel.

---

## 4. PRACTICE — Tự thực hành

### Exercise 1: Viết Security-Focused CLAUDE.md

**Mục tiêu**: Tạo `CLAUDE.md` với comprehensive security rules cho project THỰC TẾ của BẠN.

**Hướng dẫn**:
1. Identify sensitive assets nhất của project (database, API keys, user data, etc.)
2. List top 5 dangerous commands cho tech stack của bạn
3. Document code generation rules specific cho framework của bạn
4. Viết git rules phù hợp với team's workflow
5. Thêm audit trail section

**Expected result**: File `CLAUDE.md` address specific security risks của PROJECT BẠN, không phải generic ones.

<details>
<summary>💡 Gợi ý</summary>

Bắt đầu bằng câu hỏi: "Điều tồi tệ nhất có thể xảy ra nếu Claude Code mất kiểm soát trong project này là gì?"

Cho Django project: exposing SECRET_KEY, chạy migrations trên production, xóa media files
Cho React app: leak API keys trong bundled code, expose .env trong source maps
Cho mobile app: hardcode signing keys, expose backend endpoints

Làm ngược lại từ những scenarios đó để tạo preventive rules.

</details>

<details>
<summary>✅ Solution Template</summary>

```markdown
# [Project Name] — Claude Code Security Policy

## Project Overview
[1-2 câu: project này làm gì và cái gì at risk]

**Security Level**: [CRITICAL/HIGH/MEDIUM/LOW]

---

## Security Rules (CRITICAL)

### File Access Restrictions
- NEVER read files in: [list sensitive directories]
- NEVER read [.env / .secrets / etc.] files directly
- NEVER traverse outside project root
- [Add project-specific restrictions]

### Command Restrictions
- NEVER run [framework-specific dangerous commands]
- NEVER run git push without [your workflow requirement]
- NEVER run [database commands] without [safety check]
- [Add build tool restrictions]

### Code Generation Rules
- NEVER hardcode [types of secrets project bạn dùng]
- ALWAYS use [your env variable pattern]
- ALWAYS reference [your config file pattern]
- NEVER log [PII fields specific cho domain của bạn]
- [Add framework-specific rules]

### Git Rules
- NEVER commit [your secret file patterns]
- ALWAYS verify [your gitignore requirements]
- NEVER force push to [your protected branches]
- [Add team-specific git conventions]

### [Domain-Specific Rules]
[ví dụ: "Database Rules" cho backend, "Build Rules" cho mobile, etc.]

### Audit Trail
| Date | Rule Changed | Reason |
|------|--------------|--------|
| 2024-01-15 | Initial security policy | Adopting Claude Code |

---

## [Rest of your CLAUDE.md: coding standards, architecture, etc.]
```

**Validation**:
- [ ] File access section mentions DIRECTORIES NHẠY CẢM CỦA BẠN
- [ ] Command restrictions include DANGEROUS COMMANDS CỦA FRAMEWORK BẠN
- [ ] Code generation rules match PATTERNS CỦA PROJECT BẠN
- [ ] Git rules reflect WORKFLOW CỦA TEAM BẠN
- [ ] Bạn đã add domain-specific rules (database, mobile, etc.)

</details>

---

### Exercise 2: Tạo Team Onboarding Guide

**Mục tiêu**: Viết complete onboarding document cho team member mới dùng Claude Code trên project của bạn.

**Hướng dẫn**:
1. List tất cả prerequisite tools (Claude Code, language runtimes, secret scanners, etc.)
2. Viết step-by-step setup instructions
3. Include "test your setup" section với commands để verify everything works
4. Add daily workflow checklists
5. Document incident reporting process

**Expected result**: Markdown file bạn có thể đưa cho new hire ngày đầu, và họ có thể self-onboard đến safe Claude Code usage trong dưới 2 giờ.

<details>
<summary>💡 Gợi ý</summary>

Walkthrough onboarding process NHƯ THỂ bạn là new hire:
- Clone fresh copy của repo vào directory mới
- Follow own instructions của bạn
- Note mỗi lần bạn phải figure out cái gì chưa documented
- Add những missing steps đó

Onboarding docs tốt nhất được viết bởi người vừa mới đi qua onboarding.

</details>

<details>
<summary>✅ Solution Template</summary>

```markdown
# [Project Name] — Claude Code Security Onboarding

Chào mừng! Guide này sẽ setup bạn cho safe AI-assisted development.

## Prerequisites (Install Những Thứ Này Trước)

**Bắt buộc:**
- [ ] Claude Code: [installation link]
- [ ] [Your language runtime, ví dụ: Node 20+]
- [ ] [Secret scanner, ví dụ: gitleaks]
- [ ] [Container runtime nếu dùng sandbox, ví dụ: Docker]

**Tùy chọn:**
- [ ] [Your team's other tools]

## Các Bước Setup

### 1. Clone và Verify
```bash
git clone [your-repo-url]
cd [project-name]
[verification commands]
```

### 2. Đọc Security Documentation (15 phút)
- [ ] CLAUDE.md security rules
- [ ] Onboarding document này
- [ ] [Your team's security policy]

### 3. Set Up Local Environment
```bash
[Your specific environment setup]
```

### 4. Test Pre-Commit Hook
```bash
[Commands để verify secret scanning hoạt động]
```

### 5. Test Sandbox (nếu applicable)
```bash
[Sandbox verification steps]
```

### 6. Practice Safe Claude Code Session
```bash
[Example safe prompts cho project của bạn]
```

### 7. Pair Programming Session
Schedule với: [team member name/role]
Duration: 1 giờ
Topics to cover:
- [ ] Real PR review
- [ ] Claude Code trên actual task
- [ ] Security scenario discussion

## Daily Workflow Checklists

[Copy checklists từ Demo Step 5, customized cho project của bạn]

## Báo Cáo Sự Cố

Nếu có gì sai:

1. **Secret committed**: [Your process]
2. **Dangerous command suggested**: [Your process]
3. **Unexpected behavior**: [Your process]

**Contacts:**
- Team Lead: [Name/Slack]
- Security Contact: [Name/Slack]
- Incident Channel: [Slack channel]

## Resources

- CLAUDE.md: [link]
- Security Runbooks: [link]
- Team Wiki: [link]
- Questions: [Slack channel]

**Estimated time**: [Your estimate]
```

**Validation**:
- [ ] New hire có thể complete mà không cần hỏi questions
- [ ] Mọi tool installation đều documented
- [ ] Test steps verify security measures đang hoạt động
- [ ] Contact information current
- [ ] Checklists có thể printed/printable

</details>

---

### Exercise 3: Run Security Audit

**Mục tiêu**: Audit current project's Claude Code security posture và tạo remediation plan.

**Hướng dẫn**:
1. Dùng audit checklist dưới đây để evaluate project
2. Document findings: cái gì đang work, cái gì missing
3. Prioritize remediations: critical, high, medium, low
4. Tạo action items với owners và deadlines
5. Schedule recurring audits

**Audit Checklist:**

**Layer 1: Threat Awareness**
- [ ] Team đã complete Phase 2 training
- [ ] Threat model đã documented
- [ ] Incident history đã reviewed

**Layer 2: Permission Discipline**
- [ ] Team biết cách đọc permission prompts
- [ ] Dangerous commands đã documented
- [ ] Permission decisions consistent

**Layer 3: Sandbox Isolation**
- [ ] Sandbox script tồn tại (nếu cần)
- [ ] Team biết khi nào dùng sandbox
- [ ] Sandbox đã tested và working

**Layer 4: Secret Management**
- [ ] .env.example tồn tại và complete
- [ ] .env đã gitignored
- [ ] Pre-commit hook active
- [ ] Không có secrets trong git history

**Layer 5: System Control**
- [ ] CLAUDE.md có security rules
- [ ] Team onboarding document tồn tại
- [ ] Daily checklists available
- [ ] Audit schedule đã defined

**Expected result**: Scored assessment (ví dụ: "12/16 checks passing") và prioritized list của fixes.

<details>
<summary>💡 Gợi ý</summary>

Hãy brutally honest. Goal là tìm gaps, không phải score well.

Cho mỗi failing check, hỏi:
1. Risk là gì nếu không fix?
2. Mất bao lâu để fix?
3. Ai nên own fix?

Dùng formula này để prioritize:
**Priority = Risk × Likelihood ÷ Effort**

High-risk, high-likelihood, low-effort fixes đi trước.

</details>

<details>
<summary>✅ Solution Template</summary>

```markdown
# Claude Code Security Audit — [Project Name]
**Date**: [Date]
**Auditor**: [Tên bạn]
**Next Audit**: [Date + 1 tháng]

## Score: X / 16 checks passing

## Findings by Layer

### Layer 1: Threat Awareness
- [x] Team đã complete Phase 2 training
- [ ] Threat model documented — **THIẾU**
- [x] Incident history reviewed

**Risk**: MEDIUM — team biết threats nhưng chưa document formally

### Layer 2: Permission Discipline
- [x] Team biết đọc permission prompts
- [ ] Dangerous commands documented — **CHƯA ĐỦ** (chỉ có git commands)
- [x] Permission decisions consistent

**Risk**: LOW — team đang practice permission discipline

### Layer 3: Sandbox Isolation
- [ ] Sandbox script tồn tại — **THIẾU**
- [ ] Team biết khi nào dùng sandbox — **N/A** (chưa có script)
- [ ] Sandbox tested — **N/A**

**Risk**: HIGH cho production work — không có containment nếu có gì sai

### Layer 4: Secret Management
- [x] .env.example tồn tại và complete
- [x] .env đã gitignored
- [ ] Pre-commit hook active — **BROKEN** (gitleaks chưa install trên 2 dev machines)
- [x] Không có secrets trong git history

**Risk**: HIGH — pre-commit hook inconsistency

### Layer 5: System Control
- [ ] CLAUDE.md có security rules — **CHƯA ĐỦ** (có coding style nhưng không có security section)
- [ ] Team onboarding document tồn tại — **THIẾU**
- [ ] Daily checklists available — **THIẾU**
- [ ] Audit schedule defined — **ĐÂY LÀ CÁI ĐẦU TIÊN**

**Risk**: MEDIUM — không có systematic governance

## Prioritized Remediation Plan

| Priority | Item | Owner | Deadline | Effort |
|----------|------|-------|----------|--------|
| CRITICAL | Fix pre-commit hook trên all dev machines | DevOps | Tuần này | 2 giờ |
| HIGH | Tạo sandbox script cho production | Security | 2 tuần | 4 giờ |
| HIGH | Add security rules vào CLAUDE.md | Team Lead | Tuần này | 1 giờ |
| MEDIUM | Viết onboarding document | Team Lead | 1 tháng | 3 giờ |
| MEDIUM | Document threat model | Security | 1 tháng | 2 giờ |
| LOW | Tạo daily checklists | Team Lead | 1 tháng | 1 giờ |
| LOW | Complete dangerous commands list | Team | 1 tháng | 1 giờ |

## Action Items

- [ ] @devops: Verify gitleaks trên all machines by [date]
- [ ] @security: Draft sandbox script by [date]
- [ ] @team-lead: Add security section vào CLAUDE.md by [date]
- [ ] @team-lead: Schedule monthly audits trong team calendar

## Notes

[Any additional observations, patterns, hoặc concerns]

## Next Audit

**Scheduled**: [Date]
**Focus**: Verify critical/high items đã complete
```

**Validation**:
- [ ] Mọi failing check có remediation plan
- [ ] Priorities dựa trên risk, không phải convenience
- [ ] Owners đã assigned (không chỉ "team")
- [ ] Deadlines realistic
- [ ] Next audit đã scheduled

</details>

---

## 5. CHEAT SHEET

### CLAUDE.md Security Rules Quick Reference

| Rule Category | Example Rule | Tại Sao Quan Trọng |
|---------------|--------------|-------------------|
| **File Access** | Never read `~/.ssh`, `~/.aws`, `.env` | Ngăn credential exposure |
| **Commands** | Never `rm -rf` without confirmation | Ngăn accidental deletion |
| **Code Gen** | Always use `${VAR}`, never hardcode | Giữ secrets khỏi source |
| **Git** | Never push without showing diff | Catches accidental commits |
| **Database** | Never `DELETE` without `WHERE` | Ngăn data loss |

### Configuration Commands (⚠️ Cần verification)

| Command | Mục Đích | Scope |
|---------|---------|-------|
| `claude config show` | View current settings | Global hoặc project |
| `claude config set key value` | Change setting | Global hoặc project |
| `claude config reset` | Restore defaults | Global hoặc project |

**Project config**: Ở `.claude/config` (overrides global)
**Global config**: Ở `~/.claude/config` (default cho all projects)

### Phase 2 Security Stack Summary

| Layer | Module | Key Protection | Điều Gì Xảy Ra Nếu Nó Fail |
|-------|--------|----------------|---------------------------|
| **1** | 2.1 Threat Model | Biết cái gì at risk | Bạn không nhận ra danger → Permission catches it |
| **2** | 2.2 Permissions | Deny dangerous commands | Bạn approve bad command → Sandbox contains it |
| **3** | 2.3 Sandbox | Contain blast radius | Sandbox escaped → Secrets vẫn protected |
| **4** | 2.4 Secrets | Protect credentials | Secret exposed → Audit catches it |
| **5** | 2.5 Governance | Audit và improve | Không audit → 💀 Full exposure |

### Essential Checklists

**Pre-Session (2 phút):**
- [ ] Đúng directory?
- [ ] Sandbox running? (nếu sensitive)
- [ ] .env.example tồn tại?
- [ ] Pre-commit hook active?
- [ ] Security rules fresh trong đầu?

**During-Session:**
- [ ] Đọc mọi permission prompt
- [ ] Không paste secrets
- [ ] Reference .env.example, không .env
- [ ] Verify file paths ở trong project
- [ ] Hỏi lại unknown commands

**Post-Session (2 phút):**
- [ ] `git status` — unexpected changes?
- [ ] `gitleaks detect` — có leaks không?
- [ ] Clear terminal nếu secrets displayed
- [ ] Exit sandbox
- [ ] Review generated code tìm hardcoded secrets

**Weekly Audit (15 phút):**
- [ ] `gitleaks detect --verbose`
- [ ] Review CLAUDE.md updates needed
- [ ] Check new .env variables documented
- [ ] Review git history tìm secrets
- [ ] Update team về new practices

### Quick Command Reference

```bash
# Secret scanning
gitleaks detect                    # Scan entire repo
gitleaks protect --staged          # Scan staged files only
gitleaks detect --verbose          # Detailed output

# Environment verification
diff .env.example .env | grep "^>" # Tìm undocumented variables
git status                         # Check working tree
git log --grep="secret\|password"  # Search commit messages

# Sandbox
./sandbox.sh                       # Start isolated environment
docker ps | grep sandbox           # Verify sandbox running
```

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai lầm | ✅ Cách đúng | Tại sao quan trọng |
|-----------|-------------|-------------------|
| Treat CLAUDE.md như enforced rules | Nhớ rằng nó ADVISORY — Claude có thể không luôn follow | CLAUDE.md shapes behavior nhưng không phải compiler. Bạn vẫn cần permission discipline và sandboxing. |
| Setup security một lần, không bao giờ audit | Schedule recurring audits (weekly quick, monthly deep) | Security degrades theo thời gian: secrets mới added, .gitignore outdated, team quên practices. |
| Tạo governance quá nặng không ai follow | Make checklists nhanh (<2 phút) và automate những gì có thể | Nếu security painful, người ta work around nó. Make it easy để làm đúng. |
| Không có incident response plan | Document TRƯỚC incident: notify ai, làm gì, học gì từ nó | Trong crisis, bạn sẽ không think clearly. Runbook giữ bạn calm và effective. |
| Nghĩ một layer là đủ | Implement defense-in-depth: cả 5 layers work together | Bất kỳ single layer nào có thể fail. Security là về surviving multiple failures. |
| CLAUDE.md không bao giờ evolve | Review và update CLAUDE.md quarterly hoặc sau incidents | Threat model của bạn thay đổi: APIs mới, secrets mới, team members mới, risks mới. |
| Team member skip onboarding | Make security onboarding BẮT BUỘC, với verification steps | Một developer uninformed có thể compromise toàn bộ project. |
| Copy CLAUDE.md của người khác verbatim | Customize security rules cho specific risks CỦA PROJECT BẠN | Generic rules không address specific threats của bạn (ví dụ: mobile app vs backend API). |
| Dựa vào memory cho daily security | Print checklists, make them visible, make them habitual | Humans forgetful dưới pressure. Checklists là external memory. |
| Approve permission prompts mà không đọc | Pause, đọc FULL command, hỏi lại anything unclear | 2-second pause đó là last chance để ngăn damage. Respect nó. |
| Dựa vào văn hóa "anh em tin nhau" thay vì formal governance | Thiết lập governance bằng văn bản, enforce qua automation | AI tools không hiểu social trust. Claude Code không biết "anh Nam bảo em cứ push thẳng" — nó chỉ biết rules trong CLAUDE.md. Formal governance bảo vệ cả người được tin lẫn người tin. |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Khoa Nguyễn là team lead cho startup 5 developers tại Đà Nẵng, build SaaS platform cho logistics companies. Họ adopt Claude Code 6 tháng trước để move nhanh hơn. Kết quả ban đầu amazing — 40% productivity boost, faster feature delivery, developers hạnh phúc hơn.

**Problem**: Nhưng trong 3 tháng đầu, ba security incidents xảy ra:

1. **Tháng 1**: Junior developer commit test Stripe API key vào git. Phát hiện 2 tuần sau trong code review. Phải rotate key, audit all transactions, notify customers. Mất 8 giờ team time.

2. **Tháng 2**: Claude Code suggest `rm -rf node_modules/*` để fix dependency issue. Developer approve mà không đọc kỹ. Cái `*` thực ra là `* /` (thừa space) — xóa toàn bộ project directory. May có recent backup, nhưng mất 3 giờ work.

3. **Tháng 3**: Trong demo, screen-sharing developer chạy `cat .env` để debug issue. Vô tình expose production database credentials cho 12 người trong meeting. Phải rotate tất cả credentials ngay, redeploy entire stack. 6 giờ team time, 2 giờ downtime.

**The Wake-Up Call**: Sau incident thứ ba, Khoa nhận ra: "Chúng ta đang move nhanh, nhưng cũng tạo ra risks chưa từng có. Claude Code powerful, nhưng chúng ta đang dùng nó như đồ chơi."

**Implementation**: Khoa dành một weekend implement complete Phase 2 security stack:

**Layer 1 (Threat Awareness):**
- Documented threat model: cái gì có thể sai, cái gì at risk
- Chạy team workshop: "Hiểu AI-Assisted Development Risks" (2 giờ)
- Tạo incident playbook với concrete scenarios

**Layer 2 (Permission Discipline):**
- Added permission training vào onboarding
- Tạo `CLAUDE_PERMISSIONS.md` documenting approved/denied commands
- Team agreement: "Khi nghi ngờ, deny và hỏi"

**Layer 3 (Sandbox Isolation):**
- Tạo `sandbox.sh` script cho production work
- Team rule: "Chạm production config? Dùng sandbox."
- Tested disaster scenarios trong sandbox (safe failure)

**Layer 4 (Secret Management):**
- Tạo `.env.example` cho cả 3 projects
- Installed gitleaks pre-commit hook trên all dev machines
- Verified hook với test commits (caught 2 historical secrets!)
- Tạo pattern: không bao giờ reference .env trong prompts, chỉ .env.example

**Layer 5 (System Control):**
```markdown
# CLAUDE.md (excerpt từ file thực tế của họ)

## Security Rules (CRITICAL)

⚠️ Project này xử lý customer logistics data và payment processing.
MỌI developers phải follow rules này khi dùng Claude Code.

### File Access Restrictions
- NEVER read .env files (dùng .env.example for reference)
- NEVER read ~/.aws/ (AWS credentials)
- NEVER traverse outside /logistics-platform directory

### Command Restrictions
- NEVER run rm -rf without showing Khoa exact command trước
- NEVER run git push to production without code review approval
- NEVER run database migrations on production without backup verification
- NEVER run docker commands that expose ports publicly

### Code Generation Rules
- NEVER hardcode API keys (Stripe, Google Maps, SendGrid)
- NEVER hardcode database credentials
- ALWAYS use process.env.VARIABLE_NAME for all config
- NEVER log customer PII (names, addresses, phone numbers)

### Git Rules
- NEVER commit .env, .env.production, or .env.local
- NEVER force push to main or production branches
- NEVER commit database dumps or backup files

### Vietnamese Payment Integration Rules
- NEVER hardcode VNPay terminal code or hash secret
- NEVER hardcode MoMo partner code or access key
- NEVER hardcode ZaloPay app ID or secret key
- ALWAYS verify payment credentials trong .env.example

### Incident Response
Nếu Claude suggest vi phạm rules này:
1. DENY action
2. Screenshot suggestion
3. Post trong #engineering-security Slack channel
4. Chúng ta sẽ update CLAUDE.md để ngăn future occurrences

Last updated: 2024-01-15 (sau incident #3)
```

**The Onboarding Document** họ tạo includes:
- 30-minute security training (bắt buộc)
- Hands-on verification: "Thử commit secret. Nó phải bị blocked."
- Pair programming tuần đầu: senior dev watches Claude Code usage
- Signed acknowledgment: "Tôi hiểu security rules"

**Team Checklists** (printed, laminated, trên mỗi desk):
```markdown
☑️ TRƯỚC Claude Code:
- Đúng directory?
- Sandbox cho production?
- Đọc CLAUDE.md hôm nay?

☑️ TRONG Claude Code:
- Đọc mọi permission prompt
- Không paste secrets
- Hỏi lại weird commands

☑️ SAU Claude Code:
- git status clean?
- gitleaks clean?
- Clear terminal?
```

**Weekly Security Ritual** (mỗi thứ Hai, 15 phút):
1. Run `gitleaks detect --verbose` trên cả 3 projects
2. Review CLAUDE.md — cần updates không?
3. Check .env.example — complete chưa?
4. Share learnings trong team standup

**Result** (3 tháng sau khi implement security stack):

- ✅ **Zero security incidents** — stack hoạt động
- ✅ **Velocity tăng** — developers cảm thấy confident, không anxious
- ✅ **Onboarding nhanh hơn** — new hire productive trong 1 ngày thay vì 1 tuần
- ✅ **Team culture shift** — security là job của mọi người, không chỉ Khoa
- ✅ **Customer trust** — có thể demonstrate security practices trong sales calls

**The Unexpected Benefit**: Một customer hỏi trong due diligence: "Làm sao bạn đảm bảo AI tools không expose data của chúng tôi?" Khoa walked họ qua 5-layer security model, showed CLAUDE.md, demonstrated pre-commit hook. Customer impressed đến mức sign larger contract — security trở thành competitive advantage.

**Khoa's Advice**: "3 tháng đầu chaotic — chúng tôi học security bằng cách suffer qua incidents. Sau khi implement Phase 2 stack, chúng tôi học security bằng cách ngăn incidents. Sự chuyển đổi đó thay đổi mọi thứ. Time investment (khoảng 16 giờ total) pay back trong tháng đầu. Giờ nó chỉ là part of cách chúng tôi làm việc."

**Callbacks to Phase 2 Stories**:
- "Nhớ Nam mất $2,847 AWS vì không biết blast radius? (Module 2.1)"
- "Nhớ Nam bị force-push vì skip permissions? (Module 2.2)"
- "Nhớ Nam ở TechViet đọc client B's .env? (Module 2.3)"
- "Nhớ Nam suýt leak VNPay hash secret? (Module 2.4)"

Khoa's team implement tất cả lessons đó vào single system. Đây là sức mạnh của defense-in-depth.

**Their Actual CLAUDE.md and Checklists**: Available trong course repository như reference templates:
- `templates/claude-md-security-example.md`
- `templates/security-checklists.md`
- `templates/onboarding-security.md`

---

## Phase 2 Hoàn Tất — Security Graduation Của Bạn

Chúc mừng! Bạn đã hoàn thành Phase 2: Security & Sandboxing. Bạn giờ có complete, operational security toolkit:

**Những Gì Bạn Đã Build:**
- ✅ **Threat Model** (Module 2.1) — Bạn biết cái gì có thể sai
- ✅ **Permission Discipline** (Module 2.2) — Bạn có thể nhận ra và deny danger
- ✅ **Sandbox Isolation** (Module 2.3) — Bạn có thể contain blast radius
- ✅ **Secret Management** (Module 2.4) — Bạn có thể protect credentials
- ✅ **System Control** (Module 2.5) — Bạn có governance và auditing

**The 5-Layer Defense**:
Mỗi layer là safety net. Bất kỳ single failure nào uncomfortable nhưng survivable. Chỉ khi cả năm fail thì bạn mới có catastrophic exposure. Bạn đã build system bảo vệ bạn ngay cả khi bạn mệt, vội, hoặc mất tập trung.

**Điều Gì Khác Giờ**:
- Trước Phase 2: "Tôi hy vọng không có gì sai"
- Sau Phase 2: "Tôi có system để catch things khi chúng sai"

**Your Security Posture**:
| Nếu bạn completed... | Security level của bạn |
|---------------------|---------------------|
| Chỉ đọc modules | **Aware** — bạn biết risks |
| Làm tất cả demos | **Equipped** — bạn có tools |
| Làm tất cả exercises | **Operational** — bạn có working system |
| Deployed at work | **Mature** — team bạn có security culture |

**The Habit Quan Trọng Nhất**: Weekly audits. Mọi thứ khác có thể slip, nhưng nếu bạn audit weekly, bạn sẽ catch problems trước khi chúng become incidents.

**Next Steps**:
1. Nếu bạn skip exercises, quay lại và làm Exercise 3 (Security Audit) — nó valuable nhất
2. Print checklists và để nơi bạn sẽ thấy chúng
3. Schedule first weekly audit (15 phút, mỗi thứ Hai)
4. Nếu bạn có team, schedule security onboarding cho mọi người

---

**What's Next**: Trong Phase 3 (Core Workflows), chúng ta sẽ chuyển từ defense sang offense: mastering prompt engineering để get the most từ Claude Code **trong khi stay trong safety boundaries bạn đã thiết lập**. Bạn sẽ học cách đọc codebases, viết code, integrate với git, và operate terminal — tất cả với Claude như pair programmer của bạn. Security foundation bạn đã build makes mọi thứ khác safer và powerful hơn.

---

> **Next**: [Module 3.1: Reading & Understanding Codebases](../../phase-03-core-workflows/01-reading-codebases/) →
