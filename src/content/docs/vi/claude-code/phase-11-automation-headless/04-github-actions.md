---
title: 'Tích hợp GitHub Actions'
description: 'Tích hợp Claude Code vào GitHub Actions: tự động review PR, generate code và CI/CD pipeline.'
---

# Module 11.4: Tích hợp GitHub Actions

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Module 11.1-11.3 (Headless Mode, SDK Integration, Hooks System)
>
> **Kết quả**: Sau module này, bạn sẽ có production-ready GitHub Actions workflow cho Claude Code, hiểu pattern GitHub-specific, và biết leverage GitHub ecosystem cho AI automation.

---

## 1. WHY — Tại sao cần học

Bạn đã biết chạy Claude Code headless. Bạn muốn nó tự động review PR, generate test mỗi khi có code mới. Nhưng làm sao wire vào GitHub? Event nào trigger workflow? Post comment lên PR thế nào? API key để đâu cho an toàn?

**Ví von**: GitHub Actions là "hệ thống thần kinh" của repo — phản ứng với mọi event. Claude Code là "bộ não AI" — suy nghĩ và quyết định. Kết hợp = repo tự động phản ứng thông minh với mọi thay đổi.

---

## 2. CONCEPT — Ý tưởng cốt lõi

### GitHub Actions Basics

Workflow file nằm ở `.github/workflows/*.yml`. Mỗi workflow định nghĩa **events** (khi nào chạy) và **jobs** (làm gì).

### Key Events cho Claude Code

| Event | Khi nào trigger | Dùng cho |
|-------|----------------|----------|
| `pull_request` | PR opened/updated | Code review, test generation |
| `push` | Code pushed to branch | Doc updates, lint fixes |
| `workflow_dispatch` | Manual trigger từ UI | On-demand analysis |
| `schedule` | Cron schedule | Periodic security audit |
| `issue_comment` | Comment trên PR/issue | Chatops (`/claude review`) |

### GitHub Contexts

Actions cung cấp context variables:

- `${{ github.event.pull_request.number }}` — PR number
- `${{ github.event.pull_request.head.ref }}` — Branch name
- `${{ secrets.ANTHROPIC_API_KEY }}` — Secret từ repo settings
- `${{ github.workspace }}` — Working directory

### Post Results về PR

Sau khi Claude chạy xong, bạn cần:

1. **Comment lên PR** — dùng `actions/github-script`
2. **Add label** — "needs-revision", "ai-approved"
3. **Set status check** — Pass/Fail hiển thị trên PR

### Cost Control

Claude Code tốn tiền API. Pattern kiểm soát:

- **paths filter** — chỉ chạy khi file quan trọng thay đổi
- **concurrency** — cancel workflow cũ khi có commit mới
- **file limit** — chỉ review files thay đổi, không review toàn bộ repo

---

## 3. DEMO — Từng bước thực hành

**Scenario**: TypeScript project, muốn Claude auto review mỗi PR.

### Step 1: Tạo Workflow File

Tạo `.github/workflows/claude-review.yml`:

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'src/**'
      - 'tests/**'

concurrency:
  group: claude-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Get changed files
        id: changed
        run: |
          FILES=$(git diff --name-only origin/${{ github.base_ref }}...HEAD | grep -E '\.(ts|tsx)$' | head -20)
          echo "files<<EOF" >> $GITHUB_OUTPUT
          echo "$FILES" >> $GITHUB_OUTPUT
          echo "EOF" >> $GITHUB_OUTPUT

      - name: Run Claude Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "Review these files for bugs and best practices: ${{ steps.changed.outputs.files }}" > review.txt

      - name: Post PR Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## 🤖 Claude Code Review\n\n${review}`
            });
```

### Step 2: Set Up Secret

Vào **Settings → Secrets and variables → Actions → New repository secret**:

- Name: `ANTHROPIC_API_KEY`
- Value: `sk-ant-api03-...`

### Step 3: Test với PR

```bash
$ git checkout -b test-claude-review
$ echo "const x = 1" > src/test.ts
$ git add src/test.ts
$ git commit -m "test: claude review trigger"
$ git push origin test-claude-review
```

Tạo PR trên GitHub. Sau ~30 giây, bạn sẽ thấy comment từ bot:

```
🤖 Claude Code Review

File: src/test.ts
- Variable `x` declared but never used
- Missing type annotation
- Consider `const x: number = 1`
```

### Step 4: Chatops Pattern

Tạo `.github/workflows/claude-chatops.yml`:

```yaml
name: Claude Chatops

on:
  issue_comment:
    types: [created]

jobs:
  chatops:
    if: startsWith(github.event.comment.body, '/claude')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Parse and run command
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          COMMAND="${{ github.event.comment.body }}"
          CMD="${COMMAND#/claude }"
          claude -p "$CMD" > response.txt

      - name: Reply
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const response = fs.readFileSync('response.txt', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `### 🤖 Claude Response\n\n${response}`
            });
```

User comment `/claude explain src/auth.ts` → workflow chạy và reply.

---

## 4. PRACTICE — Luyện tập

### Exercise 1: Basic PR Review

**Mục tiêu**: Tạo workflow tự động review PR.

**Hướng dẫn**:
1. Tạo `.github/workflows/claude-review.yml`
2. Trigger on `pull_request` cho `src/**`
3. Set `ANTHROPIC_API_KEY` secret
4. Post kết quả lên PR comment

**Kết quả mong đợi**: Mỗi PR có comment từ Claude bot.

<details>
<summary>💡 Hint</summary>

Dùng `paths: ['src/**']` để filter. Dùng `actions/github-script@v7` để post comment.

</details>

<details>
<summary>✅ Solution</summary>

Dùng YAML từ DEMO Step 1. Thay đổi `paths` phù hợp với project của bạn.

</details>

### Exercise 2: Cost Control với Filters

**Mục tiêu**: Chỉ chạy review khi files quan trọng thay đổi, cancel workflow cũ khi có commit mới.

**Hướng dẫn**:
1. Thêm `paths` filter cho `src/**`, `lib/**`
2. Thêm `paths-ignore` cho `*.md`
3. Thêm `concurrency` với `cancel-in-progress: true`

<details>
<summary>✅ Solution</summary>

```yaml
on:
  pull_request:
    paths:
      - 'src/**'
      - 'lib/**'
    paths-ignore:
      - '**/*.md'

concurrency:
  group: review-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

</details>

### Exercise 3: Chatops Commands

**Mục tiêu**: Cho phép user comment `/claude review` hoặc `/claude explain`.

<details>
<summary>💡 Hint</summary>

Dùng `on: issue_comment`, check `startsWith(github.event.comment.body, '/claude')`.

</details>

<details>
<summary>✅ Solution</summary>

Dùng YAML từ DEMO Step 4. Parse command với `${COMMAND#/claude }` để lấy phần sau prefix.

</details>

---

## 5. CHEAT SHEET

### Common Events

```yaml
on:
  pull_request:
    types: [opened, synchronize]
  push:
    branches: [main]
  workflow_dispatch:
  issue_comment:
    types: [created]
```

### GitHub Contexts

| Context | Ví dụ | Dùng cho |
|---------|-------|----------|
| `github.event.pull_request.number` | `42` | PR number |
| `github.base_ref` | `main` | Target branch |
| `secrets.ANTHROPIC_API_KEY` | `sk-ant-...` | API key |

### Post PR Comment

```yaml
- uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: 'Your message here'
      });
```

### Cost Control

```yaml
paths: ['src/**']
paths-ignore: ['**/*.md']
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Hardcode API key trong workflow | Dùng `${{ secrets.ANTHROPIC_API_KEY }}` |
| Dùng `pull_request_target` không hiểu rõ | Dùng `pull_request` (an toàn hơn) |
| Không set `concurrency` | Thêm `cancel-in-progress: true` |
| Review toàn bộ repo mỗi PR | Dùng `paths` filter, limit files |
| Workflow trigger chính nó (infinite loop) | Commit với `[skip ci]` |
| Echo secret ra log để debug | NEVER echo secrets |
| Diff quá lớn làm Claude timeout | Filter files, limit 20 files/run |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Open-source framework Zalo Mini App (TypeScript), 20+ contributors. Maintainer overwhelmed — 15 PR/week, mỗi PR cần 30 phút review.

**Problem**: Quality không đều. Một số PR thiếu test, không follow convention. Maintainer burnout.

**Solution**: Implement 3 workflows:

1. **claude-review.yml** — Auto review mỗi PR, check convention
2. **claude-tests.yml** — Generate test khi PR có label `needs-tests`
3. **claude-docs.yml** — Update docs khi merge vào main

**Results** (sau 3 tháng):

- **Review time**: 30 phút → 15 phút/PR (-50%)
- **PR quality**: 60% PR approve ngay lần đầu (trước: 25%)
- **Test coverage**: 55% → 80% (+25%)

**Quote từ maintainer**: "GitHub Actions + Claude = maintainer không bao giờ ngủ. Tôi giờ chỉ review AI suggestions thay vì review từng dòng code."

---

> **Tiếp theo**: [Module 11.5: MCP — Model Context Protocol](../05-mcp/) →
