---
title: 'Quản trị & Chính sách'
description: 'Xây dựng chính sách quản trị sử dụng Claude Code trong tổ chức: compliance, audit và access control.'
---

# Module 10.5: Quản trị & Chính sách

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 10.4 (Chia sẻ kiến thức)
>
> **Kết quả**: Sau module này, bạn sẽ hiểu governance area cho AI coding tool, có template cho AI usage policy, và biết balance innovation với risk management.

---

## 1. WHY — Tại Sao Cần Hiểu

Dev send proprietary code cho AI không nghĩ về confidentiality. Legal hỏi "ai own AI-generated code?" — không ai biết. Security hỏi "data gì đang gửi external API?" — im lặng. Compliance hỏi "regulatory requirement?" — blank stare.

Không governance, AI adoption tạo uncertainty và risk. Với clear policy, team move FASTER vì biết cái gì allowed. Governance không phải brake — là guardrail enable speed.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### AI Governance Area

| Area | Key Question | Policy Needed |
|------|--------------|---------------|
| **Access** | Ai được dùng AI tool? | Approval process, training |
| **Scope** | Code nào AI được touch? | Sensitive area, client restriction |
| **Security** | Data nào gửi cho AI? | PII, credential, proprietary |
| **IP/Legal** | Ai own AI output? | Ownership, licensing, liability |
| **Quality** | Standard nào apply? | Review requirement, testing |
| **Compliance** | Regulatory requirement? | Industry-specific rule |

### Policy Document Structure

```markdown
# AI Coding Tools Policy

## Purpose
[Tại sao policy này tồn tại]

## Approved Tools
[AI tool nào được phép]

## Usage Guidelines
[Allowed / Requires Approval / Prohibited]

## Security Requirements
[Data protection rule]

## Quality Requirements
[Review và testing standard]

## IP & Legal
[Ownership và liability]

## Compliance
[Cách ensure adherence]
```

### Security Classification

| Category | Example | Action |
|----------|---------|--------|
| Never send | Credential, API key, PII, production data | Absolutely prohibited |
| Be cautious | Proprietary algorithm, unreleased feature | Requires approval |
| Safe | Public API, general pattern, open-source | Allowed |

### IP và Legal Clarity

- **Ownership**: AI-generated code là company work product
- **Liability**: Human author responsible cho AI output
- **Licensing**: AI có thể reproduce licensed code — review cẩn thận
- **Attribution**: Document AI assistance trong commit

---

## 3. DEMO — Từng Bước

**Scenario**: Team tạo AI coding tools policy.

### Step 1: Draft Policy Document

```markdown
# AI Coding Tools Policy
## Version: 1.0 | Last Updated: [Date]

## 1. Purpose
Policy này govern AI coding assistant để enable productivity
trong khi manage security và quality risk.

## 2. Approved Tools
- Claude Code (Anthropic) — approved cho tất cả development
- GitHub Copilot — approved cho open-source project only

## 3. Usage Guidelines

### Allowed
- Code generation cho internal tool
- Test generation
- Documentation generation
- Refactoring assistance

### Requires Approval
- Client-facing code (notify project lead)
- Security-sensitive component (security review)
- Database schema và migration

### Prohibited
- Gửi credential, API key, hoặc secret
- Gửi PII hoặc customer data
- Gửi proprietary client code
- Dùng AI output không review

## 4. Security Requirements
- Never include real credential trong prompt
- Dùng placeholder data, không production data
- Review AI output cho accidental data exposure

## 5. Quality Requirements
- All AI-generated code phải pass code review
- AI-assisted PR phải label với 🤖
- Author phải hiểu và explain được AI code

## 6. IP & Legal
- AI-generated code là company work product
- Human author responsible cho AI output
- Document AI assistance trong commit message

## 7. Compliance
- Policy review quarterly
- Violation report tới security@company.com
```

### Step 2: Get Stakeholder Input

```text
Review policy với:
- Engineering leadership (practicality)
- Security team (risk assessment)
- Legal (IP và liability)
- Compliance (regulatory requirement)
- Dev team (usability feedback)
```

### Step 3: Communicate và Train

```markdown
## Rollout Checklist

- [ ] Announce policy trong all-hands meeting
- [ ] Add vào onboarding documentation
- [ ] Tạo quick-reference 1-pager
- [ ] Host Q&A session cho question
- [ ] Add vào CLAUDE.md: "Review AI_POLICY.md trước khi dùng AI tool"
```

### Step 4: Enforce và Iterate

```markdown
## Enforcement Mechanism

- PR template include: "AI tool used? Policy followed?"
- Monthly review incident
- Quarterly policy update based on learning
- Anonymous feedback channel cho improvement
```

---

## 4. PRACTICE — Tự Thực Hành

### Bài 1: Policy Audit

**Goal**: Assess organization's AI governance.

**Instructions**:
1. Organization có AI tools policy chưa?
2. Nếu có: Read nó. Practical không? Missing gì?
3. Nếu không: Draft dùng template above
4. Identify gap hoặc overly restrictive area

<details>
<summary>💡 Hint</summary>

Start với: Purpose, Approved Tools, Prohibited Actions, Security Requirements. Add section khác as needed.
</details>

### Bài 2: Security Checklist

**Goal**: Tạo personal safeguard.

**Instructions**:
1. Review AI interaction tuần qua
2. Có gửi gì không nên gửi cho AI không?
3. Tạo pre-prompt checklist: "Trước khi gửi cho AI, verify: ..."

<details>
<summary>✅ Solution</summary>

Pre-prompt checklist:
- [ ] Không credential hoặc API key
- [ ] Không PII hoặc customer data
- [ ] Không proprietary client code
- [ ] Dùng placeholder data, không production
</details>

### Bài 3: Stakeholder Simulation

**Goal**: Practice defend AI policy.

**Instructions**:
1. Role-play present AI policy cho skeptical stakeholder
2. Practice trả lời: "Nếu AI leak code?" "Ai liable?"
3. Document answer cho real conversation

<details>
<summary>💡 Hint</summary>

Key answer: Ownership = company. Liability = human author. Security = policy define boundary. Quality = standard review apply.
</details>

---

## 5. CHEAT SHEET

### Policy 7 Section

1. Purpose
2. Approved Tools
3. Usage Guidelines (Allowed/Approval/Prohibited)
4. Security Requirements
5. Quality Requirements
6. IP & Legal
7. Compliance

### Never Send cho AI

```text
❌ Credential, API key
❌ PII, customer data
❌ Proprietary client code
❌ Production database content
```

### Quick Reference Question

| Question | Action |
|----------|--------|
| Data này sensitive? | Không gửi |
| Đây là client code? | Check policy |
| Explain được AI code này không? | Nếu không, không submit |
| PR này AI-assisted? | Label 🤖 |

### Stakeholder FAQ

| Question | Answer |
|----------|--------|
| Ai own AI code? | Company (work product) |
| Ai liable? | Human author |
| Secure không? | Policy define boundary |
| Quality assured? | Standard review apply |

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Đúng Cách |
|-----------|-------------|
| No policy (anything goes) | Clear guideline enable faster adoption |
| Over-restrictive (không ai dùng AI) | Balance security với productivity |
| Policy không training | Communicate, train, answer question |
| Policy không enforcement | PR check, periodic audit |
| Static policy (không update) | Quarterly review và update |
| Policy chỉ từ legal/security | Include developer input cho practicality |
| Unclear ownership | Human author own AI output |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Scenario**: Fintech Việt Nam, 50 developer. Trước policy: một số dev send customer transaction data cho AI để "test." Dev khác accidentally include API key trong prompt. Near-miss security incident.

**Policy implementation**:

- **Tuần 1**: Security team draft policy với dev input
- **Tuần 2**: Legal review IP và liability section
- **Tuần 3**: All-hands presentation, Q&A session
- **Tuần 4**: Policy enforce, PR template update

**Policy highlight**:
- Approved: Claude Code với company account
- Prohibited: customer data, financial credential
- Required: AI-assisted PR label, security review cho payment code

**Result sau 3 tháng**:
- Zero security incident related AI
- AI adoption increase 40% (dev biết cái gì allowed)
- Audit found 100% compliance với labeling requirement
- Policy update 2 lần based on team feedback

**Quote**: "Policy không slow down. Speed up vì stop second-guessing what's allowed."

---

> **Phase 10 Hoàn Thành!** Bạn đã có framework đầy đủ cho team collaboration với Claude Code — từ shared convention đến governance.
>
> **Phase Tiếp Theo**: [Phase 11: Automation & Headless](../../phase-11-automation-headless/01-headless-mode/) — Chạy Claude Code không cần human interaction.
