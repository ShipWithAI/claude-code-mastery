---
title: 'Templates lệnh & prompt'
description: 'Bộ templates prompt và lệnh tái sử dụng cho Claude Code: code review, debugging và feature development.'
---

# Module 15.2: Templates lệnh & prompt

> **Thời gian ước tính**: ~30 phút
>
> **Yêu cầu trước**: Module 15.1 (CLAUDE.md Templates)
>
> **Kết quả**: Sau module này, bạn sẽ có library prompt template cho common task và biết create reusable prompt.

---

## 1. WHY — Tại sao cần học

Bạn làm same task lặp đi lặp lại — code review, test generation, documentation. Mỗi lần viết prompt từ đầu. Có khi quên criteria quan trọng. Result quality vary.

Prompt template là pre-written prompt cho common task. Write once, reuse forever. Consistent quality, nothing forgotten.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Prompt Template Structure

```markdown
# Template: [Task Name]

## Purpose
[Template làm gì]

## Prompt
[Actual prompt với {{placeholder}}]

## Variables
- {{code}}: Code cần analyze
- {{file}}: Target file path

## Usage
[Cách sử dụng template]
```

### Template Category

| Category | Templates | Use Case |
|----------|-----------|----------|
| **Review** | Code review, PR review | Quality assurance |
| **Generate** | Tests, docs, types | Tạo content mới |
| **Refactor** | Extract, rename, optimize | Improve existing |
| **Debug** | Error analysis, logging | Find/fix issue |
| **Explain** | Code walkthrough | Understanding |

### Template Variable

Placeholder phổ biến cho flexibility:

```text
{{code}}      — Code cần analyze
{{file}}      — File path
{{language}}  — Programming language
{{error}}     — Error message
{{context}}   — Additional context
{{criteria}}  — Specific requirement
```

### Template Storage

- **CLAUDE.md** — Project-specific template
- **Personal folder** — Reusable template cá nhân
- **Team repository** — Shared team template

---

## 3. DEMO — Từng bước cụ thể

### Template 1: Code Review

```markdown
# Template: Code Review

## Prompt
Review code sau cho:

1. **Correctness**: Logic error, edge case, bug
2. **Security**: Vulnerability, injection risk, auth issue
3. **Performance**: Inefficiency, N+1 query, memory leak
4. **Maintainability**: Readability, naming, complexity
5. **Standards**: Follow convention trong CLAUDE.md không?

Code cần review:
{{code}}

Format response:
- 🔴 Critical (phải fix)
- 🟠 Important (nên fix)
- 🟡 Suggestion (nice to have)
- ✅ Good practice observed

## Usage
Paste code, dùng template cho structured review.
```

### Template 2: Test Generation

```markdown
# Template: Generate Tests

## Prompt
Generate comprehensive test cho:
{{code}}

Requirement:
- Dùng {{testFramework}} (Jest/Pytest/etc.)
- Cover happy path và edge case
- Include error scenario
- Mock external dependency
- Follow AAA pattern (Arrange, Act, Assert)

Generate test cho:
1. Normal operation
2. Edge case (empty, null, boundary)
3. Error handling
4. Integration point

## Usage
Paste function/class code để generate complete test file.
```

### Template 3: Documentation

```markdown
# Template: Generate Documentation

## Prompt
Generate documentation cho:
{{code}}

Include:
1. **Overview**: Code này làm gì?
2. **Parameters**: Tất cả input với type
3. **Returns**: Output với type
4. **Examples**: 2-3 usage example
5. **Errors**: Có thể throw gì?

Format: JSDoc/docstring phù hợp với {{language}}

## Usage
Paste code để generate complete documentation.
```

### Template 4: Debug Helper

```markdown
# Template: Debug Analysis

## Prompt
Tôi gặp error này:
{{error}}

Trong code này:
{{code}}

Analyze:
1. Cái gì gây error này?
2. Tại sao nó xảy ra?
3. Fix thế nào (provide code)?
4. Cách prevent similar issue?

## Usage
Paste error message + code cho root cause analysis.
```

### Sử dụng Template

```text
Bước 1: Copy template prompt
Bước 2: Replace {{placeholder}} với value thực tế
Bước 3: Paste vào Claude session
Bước 4: Get consistent, structured output
```

---

## 4. PRACTICE — Luyện tập

### Bài 1: Dùng Template có sẵn

**Mục tiêu**: Trải nghiệm template consistency.

**Hướng dẫn**:
1. Lấy code review template ở trên
2. Apply vào một piece of code gần đây
3. So sánh result với ad-hoc review prompt thông thường
4. Note sự khác biệt về consistency

<details>
<summary>💡 Gợi ý</summary>

Focus vào template có catch những thứ bạn thường quên không (security? edge case?).

</details>

<details>
<summary>✅ Giải pháp</summary>

Template review thường tìm được:
- Security issue (template nhắc check)
- Edge case (explicit trong template)
- Standard violation (reference CLAUDE.md)

Ad-hoc review thường miss 1-2 category hoàn toàn.

</details>

### Bài 2: Tạo Template riêng

**Mục tiêu**: Build template cho workflow của bạn.

**Hướng dẫn**:
1. Identify một task bạn làm repeated với Claude
2. Viết prompt bạn thường dùng
3. Formalize thành template structure (Purpose, Prompt, Variables, Usage)
4. Test template hai lần

<details>
<summary>💡 Gợi ý</summary>

Good candidate: API endpoint review, component creation, migration script.

</details>

<details>
<summary>✅ Giải pháp</summary>

Ví dụ: API Endpoint Template
```markdown
# Template: API Endpoint Review

## Prompt
Review API endpoint này cho:
- Input validation
- Error response (correct status code)
- Authentication/authorization
- Rate limiting consideration
- Documentation accuracy

Code: {{code}}
```

Test trên 2 endpoint, refine dựa trên result.

</details>

### Bài 3: Template Library

**Mục tiêu**: Build personal template collection.

**Hướng dẫn**:
1. Tạo 5 template cho common task của bạn
2. Store trong dedicated folder
3. Document khi nào dùng mỗi template
4. Test mỗi template trên real task

<details>
<summary>💡 Gợi ý</summary>

Start với: review, test, doc, refactor, explain. Cover 80% nhu cầu.

</details>

<details>
<summary>✅ Giải pháp</summary>

Template library structure:
```text
~/prompt-templates/
├── code-review.md
├── test-generation.md
├── documentation.md
├── refactoring.md
├── explanation.md
└── README.md (index + usage guide)
```

Mỗi template được test trên real code trước khi add vào library.

</details>

---

## 5. CHEAT SHEET

### Template Structure

```markdown
# Template: [Name]
## Purpose: [Làm gì]
## Prompt: [Actual prompt với {{variable}}]
## Variables: [List placeholder]
## Usage: [Cách invoke]
```

### Essential Template

| Template | Purpose |
|----------|---------|
| `/review` | Code review với criteria |
| `/test` | Generate test file |
| `/doc` | Generate documentation |
| `/refactor` | Refactoring suggestion |
| `/debug` | Error analysis |
| `/explain` | Code walkthrough |

### Common Variable

```text
{{code}}      — Code cần analyze
{{file}}      — File path
{{language}}  — Programming language
{{error}}     — Error message
{{context}}   — Additional context
```

### Storage Location

- CLAUDE.md (project-specific)
- Personal templates folder
- Team shared repository

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Template quá vague | Specific criteria và output format |
| Quên variable | Luôn include {{placeholder}} |
| Một template khổng lồ | Focused template per task |
| Không define output | Define good response trông như thế nào |
| Không bao giờ update | Improve template dựa trên result |
| Template chỉ trong đầu | Write down và share |
| Ignore project context | Template reference CLAUDE.md |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Team fintech Việt Nam làm 20+ code review/tuần. Quality vary — some developer check security, some không. Some tìm edge case, some miss.

**Template Solution**:

Tạo `/review` template với mandatory section:
- Security (SQL injection, XSS, auth)
- Performance (query, memory)
- Business logic (edge case, validation)
- Standards (team convention)
- Test coverage (cần test gì)

**Implementation**:
- Tuần 1: Tạo standard review template
- Tuần 2: All review phải dùng template
- Tuần 3: PR checklist thêm: "Reviewed using template"

**Kết quả (2 tháng)**:
- Security finding: +200% (template nhắc check)
- Review consistency: 95% same criteria
- Review time: Unchanged
- Production bug từ reviewed code: -40%

**Quote**: "Template không biến chúng tôi thành robot. Nó đảm bảo không quên stuff quan trọng. Mỗi reviewer vẫn add expertise riêng trên đó."

---

> **Tiếp theo**: [Module 15.3: Claude Code Skills](../03-claude-code-skills/) →
