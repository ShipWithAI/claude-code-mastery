---
title: 'Chia sẻ kiến thức'
description: 'Chia sẻ kiến thức trong team qua Claude Code: tạo doc tự động, onboarding và knowledge base.'
---

# Module 10.4: Chia sẻ kiến thức

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 10.3 (Quy trình Code Review)
>
> **Kết quả**: Sau module này, bạn sẽ có system share Claude Code knowledge trong team, duy trì team prompt library, và thiết lập learning loop từ mistake.

---

## 1. WHY — Tại Sao Cần Hiểu

Dev A discover prompting technique tuyệt vời, giữ riêng. Dev B struggle cùng problem nhiều ngày. Dev C make mistake với Claude, fix xong, không nói ai. Dev D repeat cùng mistake tháng sau.

Không knowledge sharing, mỗi member learn isolated. Team skill grow chậm. Với systematic sharing, discovery của 1 người trở thành advantage của tất cả. Mistake của 1 người trở thành prevention cho tất cả.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Types of Claude Code Knowledge

| Type | Example | How to Share |
|------|---------|--------------|
| Prompt | "Prompt này generate test tốt" | Prompt library |
| Technique | "/compact trước complex task" | Team wiki/docs |
| Pattern | "Think+Plan cho architecture" | CLAUDE.md |
| Pitfall | "Đừng modify config trực tiếp" | Lessons learned log |
| Workaround | "Claude struggle X, do Y thay thế" | Troubleshooting guide |

### Team Prompt Library Structure

```text
docs/prompts/
├── testing/
│   ├── generate-unit-tests.md
│   └── generate-integration-tests.md
├── refactoring/
│   ├── extract-method.md
│   └── improve-naming.md
├── documentation/
│   ├── generate-api-docs.md
│   └── explain-code.md
└── review/
    ├── security-review.md
    └── performance-review.md
```

Mỗi prompt file include: Purpose, Prompt template, Example usage, Known limitation.

### Lessons Learned Log

Document incident để prevent repeat:

```markdown
## 2024-01-15: Database migration incident
**What happened**: Claude generate migration drop column
**Root cause**: Prompt không specify "preserve data"
**Prevention**: Add vào CLAUDE.md: "Always preserve existing data"
**Updated prompt**: [link to new migration prompt]
```

### Knowledge Sharing Ritual

- **Weekly**: "Claude Code tip of the week" trong Slack
- **Sprint retro**: "Claude Code lesson nào chúng ta học được?"
- **Monthly**: Review và update CLAUDE.md cùng team
- **Onboarding**: Prompt library walkthrough cho new member

### Flywheel Effect

Discover → Share → Team use → Team improve → Better technique → Share again → ...

Insight của 1 người accelerate tất cả. Team smart hơn cùng nhau.

---

## 3. DEMO — Từng Bước

**Scenario**: Team 6 người implement Claude Code knowledge sharing system.

### Step 1: Tạo Prompt Library Structure

```bash
mkdir -p docs/prompts/{testing,refactoring,documentation,review}
```

Output:
```text
(directories created silently)
```

Tạo prompt template:

```bash
cat > docs/prompts/testing/generate-unit-tests.md << 'EOF'
# Generate Unit Tests

## Purpose
Generate comprehensive unit test cho function hoặc module.

## Prompt
Generate unit tests cho [function/file].

Requirements:
- Cover happy path, edge case, và error condition
- Mock external dependency
- Follow naming: "should [behavior] when [condition]"
- Aim for 80% coverage

Trước khi viết, list scenario bạn sẽ cover.

## Example Usage
"Generate unit tests cho src/services/userService.ts"

## Known Limitation
- Có thể cần adjust cho complex mocking
- Verify assertion match actual behavior
EOF
```

Output:
```text
File created: docs/prompts/testing/generate-unit-tests.md
```

### Step 2: Tạo Lessons Learned Log

```bash
cat > docs/LESSONS_LEARNED.md << 'EOF'
# Claude Code Lessons Learned

## 2024-01-15: Test generation miss edge case
- **What**: Test pass nhưng không cover null input
- **Why**: Prompt không explicitly request edge case
- **Fix**: Update test prompt include edge case requirement

## 2024-01-10: Refactoring break API
- **What**: Claude rename public method, break consumer
- **Why**: Không guidance về API stability
- **Fix**: Add vào CLAUDE.md: "Maintain backward compatibility"
EOF
```

Output:
```text
File created: docs/LESSONS_LEARNED.md
```

### Step 3: Establish Sharing Ritual

```markdown
# Team Slack: #claude-code-tips

**Weekly Tip (Jan 22)**
🧠 Tip: Dùng "Think carefully about..." prefix cho complex decision.

Example: "Think carefully about trade-off giữa caching strategy.
Consider memory usage và invalidation complexity."

Điều này activate Claude reasoning cho better architectural decision!

Shared by: @dev-a
Added to: docs/prompts/architecture/think-carefully.md
```

### Step 4: Onboarding New Team Member

```markdown
## Claude Code Onboarding Checklist

- [ ] Read CLAUDE.md (team convention)
- [ ] Review docs/prompts/ (prompt library)
- [ ] Read LESSONS_LEARNED.md (past mistake)
- [ ] Shadow team member dùng Claude Code 1 ngày
- [ ] First PR với Claude, flag for mentorship review
```

---

## 4. PRACTICE — Tự Thực Hành

### Bài 1: Build Prompt Library

**Goal**: Tạo reusable prompt template.

**Instructions**:
1. Identify 3 task bạn frequently dùng Claude
2. Write prompt template cho mỗi task
3. Test và refine
4. Document với purpose, example, và limitation
5. Share với team

<details>
<summary>💡 Hint</summary>

Start với task repetitive nhất. Bạn luôn nói gì với Claude? Đó là first prompt template.
</details>

### Bài 2: Lessons Learned Retrospective

**Goal**: Document mistake để prevent repeat.

**Instructions**:
1. Nghĩ về Claude Code mistake bạn (hoặc team) đã make
2. Document: What happened? Why? How to prevent?
3. Update CLAUDE.md nếu relevant
4. Share trong team channel

<details>
<summary>💡 Hint</summary>

Template: "Ngày [date], tôi/team [mô tả mistake]. Root cause là [nguyên nhân]. Để prevent, chúng ta nên [action]."
</details>

### Bài 3: Tip Sharing Practice

**Goal**: Share knowledge với team.

**Instructions**:
1. Discover hoặc invent Claude Code technique
2. Write 3 câu với example
3. Post lên team channel
4. Add vào prompt library nếu valuable

<details>
<summary>✅ Solution</summary>

Example tip: "Khi Claude response quá generic, add 'Be specific và dùng concrete example từ codebase của chúng ta.' Điều này ground Claude trong actual code thay vì generic pattern."
</details>

---

## 5. CHEAT SHEET

### Prompt Library Structure

```text
docs/prompts/[category]/[task].md
- Purpose
- Prompt template
- Example usage
- Limitation
```

### Lessons Learned Template

```markdown
## [Date]: [Title]
- **What happened**:
- **Root cause**:
- **Prevention**:
- **Updates made**:
```

### Sharing Ritual

| Khi nào | Làm gì |
|---------|--------|
| Weekly | Tip trong Slack |
| Sprint | Retro discussion |
| Monthly | CLAUDE.md review |
| Onboarding | Library walkthrough |

### Knowledge Type → Destination

| Type | Destination |
|------|-------------|
| Prompt | Library |
| Technique | Wiki |
| Pattern | CLAUDE.md |
| Pitfall | Lessons learned |
| Workaround | Troubleshooting guide |

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Đúng Cách |
|-----------|-------------|
| Knowledge trong head individual | Systematic capture và sharing |
| Prompt library không organize | Clear category, consistent format |
| Lesson learned nhưng không act | Update CLAUDE.md với mỗi lesson |
| Sharing overload (quá nhiều noise) | Curate: weekly highlight, không daily dump |
| Onboarding ignore Claude Code | Explicit Claude Code section trong onboarding |
| Chỉ share success | Mistake MORE valuable để share |
| Static documentation | Living doc: review và update regular |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Scenario**: Startup Việt Nam, 12 developer, adopt Claude Code. 3 tháng đầu: chaotic. Same mistake repeat. Một số dev có secret "super prompt" không share.

**Knowledge sharing implementation**:

- **Tháng 4**: Tạo `docs/prompts/` với 10 prompt từ best practice
- **Tháng 5**: Add `#claude-tips` Slack channel. Rule: 1 tip/tuần minimum
- **Tháng 6**: Start LESSONS_LEARNED.md sau incident (tương tự 1 cái đã xảy ra tháng 2)

**Result sau 6 tháng**:
- Prompt library: 47 prompt, organized by category
- Lessons learned: 23 incident documented
- CLAUDE.md: Update 34 lần based on learning
- New dev onboarding: 3 ngày → 1 ngày (họ đọc doc)
- Repeated mistake: gần 0

**Team quote**: "Prompt library giá trị hơn skill của single developer. Đó là collective intelligence của chúng ta."

---

> **Tiếp theo**: [Module 10.5: Quản trị & Chính sách](../05-governance-policy/) →
