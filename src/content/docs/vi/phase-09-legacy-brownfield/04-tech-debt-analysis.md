---
title: 'Phân tích Tech Debt'
description: 'Phân tích và ưu tiên tech debt với Claude Code: phát hiện code smell, đo lường và lập kế hoạch trả nợ.'
---

# Module 9.4: Phân tích Tech Debt

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 9.3 (Sinh test Legacy)
>
> **Kết quả**: Sau module này, bạn sẽ có framework analyze tech debt với Claude, biết prioritize debt repayment, và tạo được actionable improvement roadmap cho legacy codebase.

---

## 1. WHY — Tại Sao Cần Hiểu

Legacy codebase có problem khắp nơi. Outdated dependency. Inconsistent pattern. Copy-paste code. Magic number. No type. Start từ đâu? Refactor cả năm không xong.

Answer không phải "fix everything." Answer là "fix RIGHT thing." Tech debt analysis giúp identify debt nào đang hurt bạn (pay now), nào là future risk (pay later), nào acceptable (live with it). Claude analyze nhanh hơn bạn — nhưng cần framework.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Tech Debt Là Gì?

Technical debt là code/architecture choice trade short-term speed cho long-term cost. Không phải debt nào cũng bad — đôi khi là trade-off đúng. Problem là UNMANAGED debt compound theo thời gian.

### Tech Debt Category

| Category | Example | Impact |
|----------|---------|--------|
| **Code Quality** | Long function, deep nesting, unclear naming | Maintenance cost |
| **Architecture** | Tight coupling, wrong pattern, scalability limit | Feature blocked |
| **Dependencies** | Outdated package, security vulnerability | Security risk |
| **Testing** | Low coverage, flaky test, no test | Regression risk |
| **Documentation** | Missing doc, outdated doc | Knowledge silo |
| **Patterns** | Inconsistent style, multiple cách làm cùng việc | Cognitive load |

### Prioritization Matrix

|  | Low Effort | High Effort |
|--|-----------|-------------|
| **High Impact** | 🔥 Làm NGAY | 📅 Plan carefully |
| **Low Impact** | ✅ Quick win | ❄️ Maybe never |

### Interest Rate Concept

- **High-interest debt**: Worse over time (security vulnerability, broken test) → Pay first
- **Low-interest debt**: Static cost (code style, naming) → Pay when convenient

---

## 3. DEMO — Từng Bước

**Scenario**: Analyze legacy e-commerce backend để prioritize tech debt.

### Step 1: Initial Scan

```text
Bạn: Analyze src/ cho technical debt. Cho inventory high-level.
Categorize theo: Code Quality, Architecture, Dependencies, Testing,
Documentation, Patterns.

Claude:
CODE QUALITY:
- paymentService.js: 800 dòng, function > 100 dòng
- Nhiều file deep nesting (4-5 level)

ARCHITECTURE:
- Circular dependency: orderService ↔ inventoryService
- Direct database access trong route handler

DEPENDENCIES:
- Express 3.x (hiện tại: 4.x, có security advisory)
- lodash 3.x (known vulnerability)

TESTING:
- Overall coverage: 23%
- Payment và order logic: 5% coverage

DOCUMENTATION:
- README update 3 năm trước
- Không có API documentation

PATTERNS:
- Mix callback và promise
- 3 cách validation khác nhau
```

### Step 2: Prioritize với Claude

```text
Bạn: Rank top 5 debt item theo Impact và Effort (S/M/L/XL).

Claude:
1. lodash vulnerability — Impact: HIGH, Effort: S → LÀM NGAY
2. Express 3.x upgrade — Impact: HIGH, Effort: M → PLAN
3. Payment test coverage — Impact: HIGH, Effort: L → PLAN
4. Circular dependency — Impact: MEDIUM, Effort: M → LATER
5. Inconsistent async — Impact: MEDIUM, Effort: L → LATER
```

### Step 3: Create Roadmap

```text
Bạn: Tạo 3-sprint roadmap cho top item.

Claude:
Sprint 1 (Quick Win):
- Upgrade lodash (2 giờ)
- Add basic test cho payment flow (1 ngày)

Sprint 2 (Critical Upgrade):
- Express 3 → 4 migration (3 ngày)
- Add test cho affected route (2 ngày)

Sprint 3 (Architecture):
- Resolve circular dependency (2 ngày)
- Increase order test coverage lên 50% (2 ngày)
```

### Step 4: Document Decision

```text
Bạn: Tạo TECH_DEBT.md với inventory, roadmap, và accepted debt.

Claude: [Tạo documentation file]
```

Check outdated dependency:

```bash
$ npm outdated
```

Output:
```text
Package  Current  Wanted  Latest
lodash   3.10.1   3.10.1  4.17.21
express  3.21.2   3.21.2  4.18.2
```

---

## 4. PRACTICE — Tự Thực Hành

### Bài 1: Debt Inventory

**Goal**: Tạo categorized tech debt inventory.

**Instructions**:
1. Pick module/directory trong project nào đó
2. Ask Claude analyze cho tech debt
3. Tạo categorized inventory
4. Estimate effort (S/M/L/XL) cho mỗi item

<details>
<summary>💡 Hint</summary>

```text
"Analyze [directory] cho technical debt.
Categorize theo: Code Quality, Architecture, Dependencies, Testing.
Mỗi item, estimate effort: S/M/L/XL."
```
</details>

### Bài 2: Prioritization Matrix

**Goal**: Practice impact vs effort prioritization.

**Instructions**:
1. Lấy inventory từ Bài 1
2. Plot item lên Impact vs Effort matrix
3. Identify: Làm Ngay / Plan / Later / Never
4. Ask Claude validate prioritization của bạn

### Bài 3: Sprint Planning

**Goal**: Tạo actionable roadmap.

**Instructions**:
1. Lấy prioritized list
2. Tạo 3-sprint roadmap
3. Ensure Sprint 1 có quick win (motivation!)
4. Ensure critical item được plan, không chỉ list

<details>
<summary>✅ Solution</summary>

Roadmap structure:
- Sprint 1: Quick win (S effort, high impact) — build momentum
- Sprint 2: Critical item (M effort, high impact) — address risk
- Sprint 3: Architecture improvement (L effort) — long-term health
- Document accepted debt — thing bạn CHOOSE không fix
</details>

---

## 5. CHEAT SHEET

### Debt Category

Code Quality | Architecture | Dependencies | Testing | Documentation | Patterns

### Prioritization Matrix

|  | Low Effort | High Effort |
|--|-----------|-------------|
| High Impact | 🔥 NGAY | 📅 Plan |
| Low Impact | ✅ Quick win | ❄️ Maybe never |

### Analysis Prompt

```text
"Analyze [scope] cho tech debt. Categorize và prioritize."
"Top 5 improvement, rank theo impact và effort?"
"Nếu chỉ fix được 3 thứ, fix gì và tại sao?"
"Tạo debt repayment roadmap cho 3 sprint."
```

### Interest Rate Rule

| Type | Example | Action |
|------|---------|--------|
| High interest | Security, broken test | Pay now |
| Low interest | Style, naming | Pay when convenient |

### Documentation

Tạo `TECH_DEBT.md`: Inventory + Roadmap + Accepted Debt

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Đúng Cách |
|-----------|-------------|
| Cố fix all debt | Prioritize. Some debt acceptable. |
| Chỉ nhìn code quality | Include architecture, dependency, testing, doc. |
| List không có effort estimate | Can't prioritize không có effort. |
| Ignore "interest rate" | Security và broken test compound. Fix first. |
| Start với big refactor | Quick win trước. Build momentum. |
| Không document decision | TECH_DEBT.md: what, why, when. |
| Analyze entire codebase cùng lúc | Start high-traffic area. Iterate. |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Scenario**: Startup Việt Nam, 4 năm codebase, 5 developer. "Everything needs fixing" paralysis — không ai biết start từ đâu.

**Claude-assisted debt analysis (2 ngày)**:

Ngày 1 — Inventory:
- Scan 200 file với Claude
- Found: 47 code quality issue, 12 architecture debt, 8 outdated dependency (3 có CVE), 15% test coverage

Ngày 2 — Prioritization:
- Claude rank theo impact/effort
- Top 3: Security vulnerability (S effort, critical), missing auth test (M effort, high risk), circular dependency order module (L effort, blocking feature)

**Roadmap created**:
- Sprint 1: Security fix + auth test
- Sprint 2: Untangle order module
- Sprint 3: Increase coverage lên 40%

**Accepted Debt** (documented):
- Inconsistent naming convention (low impact, mất months để fix)
- Old util function (working, not worth changing)

**Result**: Team có clear direction. Sprint 1 xong trong 1 tuần. Morale improve — "Making progress thay vì drowning."

---

> **Phase 9 Hoàn Thành!** Bạn đã có thể work với legacy codebase — explore, refactor safe, add test, prioritize improvement.
>
> **Phase Tiếp Theo**: [Phase 10: Làm việc nhóm](../../phase-10-team-collaboration/01-team-claude-md/) — Dùng Claude Code trong team.
