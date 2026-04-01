---
title: 'Governance & Policy'
description: 'Create AI usage policies for Claude Code that balance team innovation with risk management.'
---

# Module 10.5: Governance & Policy

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 10.4 (Knowledge Sharing)
>
> **Outcome**: After this module, you will understand key governance areas for AI coding tools, have templates for AI usage policies, and know how to balance innovation with risk management.

---

## 1. WHY — Why This Matters

Developer sends proprietary code to AI assistant without thinking about confidentiality. Legal asks "who owns AI-generated code?" — nobody knows. Security asks "what data is being sent to external APIs?" — silence. Compliance asks "are we meeting regulatory requirements?" — blank stares.

Without governance, AI adoption creates uncertainty and risk. With clear policies, teams move FASTER because they know what's allowed. Governance isn't a brake — it's a guardrail that enables speed.

---

## 2. CONCEPT — Core Ideas

### AI Governance Areas

| Area | Key Questions | Policy Needed |
|------|--------------|---------------|
| **Access** | Who can use AI tools? | Approval process, training |
| **Scope** | What code can AI touch? | Sensitive areas, client restrictions |
| **Security** | What data goes to AI? | PII, credentials, proprietary info |
| **IP/Legal** | Who owns AI output? | Ownership, licensing, liability |
| **Quality** | What standards apply? | Review requirements, testing |
| **Compliance** | Regulatory requirements? | Industry-specific rules |

### Policy Document Structure

```markdown
# AI Coding Tools Policy

## Purpose
[Why this policy exists]

## Approved Tools
[Which AI tools are allowed]

## Usage Guidelines
[Allowed / Requires Approval / Prohibited]

## Security Requirements
[Data protection rules]

## Quality Requirements
[Review and testing standards]

## IP & Legal
[Ownership and liability]

## Compliance
[How we ensure adherence]
```

### Security Classification

| Category | Examples | Action |
|----------|----------|--------|
| Never send | Credentials, API keys, PII, production data | Absolutely prohibited |
| Be cautious | Proprietary algorithms, unreleased features | Requires approval |
| Safe | Public APIs, general patterns, open-source | Allowed |

### IP and Legal Clarity

- **Ownership**: AI-generated code is company work product
- **Liability**: Human author responsible for AI output
- **Licensing**: AI might reproduce licensed code — review
- **Attribution**: Document AI assistance in commits

---

## 3. DEMO — Step by Step

**Scenario**: Team creating AI coding tools policy.

### Step 1: Draft Policy Document

```markdown
# AI Coding Tools Policy
## Version: 1.0 | Last Updated: [Date]

## 1. Purpose
This policy governs AI coding assistants to enable productivity
while managing security and quality risks.

## 2. Approved Tools
- Claude Code (Anthropic) — approved for all development
- GitHub Copilot — approved for open-source projects only

## 3. Usage Guidelines

### Allowed
- Code generation for internal tools
- Test generation
- Documentation generation
- Refactoring assistance

### Requires Approval
- Client-facing code (notify project lead)
- Security-sensitive components (security review)
- Database schemas and migrations

### Prohibited
- Sending credentials, API keys, or secrets
- Sending PII or customer data
- Sending proprietary client code
- Using AI output without review

## 4. Security Requirements
- Never include real credentials in prompts
- Use placeholder data, not production data
- Review AI output for accidental data exposure

## 5. Quality Requirements
- All AI-generated code must pass code review
- AI-assisted PRs must be labeled with 🤖
- Author must understand and explain AI code

## 6. IP & Legal
- AI-generated code is company work product
- Human author is responsible for AI output
- Document AI assistance in commit messages

## 7. Compliance
- Policy reviewed quarterly
- Violations reported to security@company.com
```

### Step 2: Get Stakeholder Input

```text
Review policy with:
- Engineering leadership (practicality)
- Security team (risk assessment)
- Legal (IP and liability)
- Compliance (regulatory requirements)
- Dev team (usability feedback)
```

### Step 3: Communicate and Train

```markdown
## Rollout Checklist

- [ ] Announce policy in all-hands meeting
- [ ] Add to onboarding documentation
- [ ] Create quick-reference 1-pager
- [ ] Host Q&A session for questions
- [ ] Add to CLAUDE.md: "Review AI_POLICY.md before using AI tools"
```

### Step 4: Enforce and Iterate

```markdown
## Enforcement Mechanisms

- PR template includes: "AI tools used? Policy followed?"
- Monthly review of any incidents
- Quarterly policy update based on learnings
- Anonymous feedback channel for improvements
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Policy Audit

**Goal**: Assess your organization's AI governance.

**Instructions**:
1. Does your organization have an AI tools policy?
2. If yes: Read it. Is it practical? What's missing?
3. If no: Draft one using the template above
4. Identify gaps or overly restrictive areas

<details>
<summary>💡 Hint</summary>

Start with: Purpose, Approved Tools, Prohibited Actions, Security Requirements. Add other sections as needed.
</details>

### Exercise 2: Security Checklist

**Goal**: Create personal safeguards.

**Instructions**:
1. Review your last week of AI interactions
2. Did you send anything that shouldn't go to AI?
3. Create a pre-prompt checklist: "Before sending to AI, verify: ..."

<details>
<summary>✅ Solution</summary>

Pre-prompt checklist:
- [ ] No credentials or API keys
- [ ] No PII or customer data
- [ ] No proprietary client code
- [ ] Using placeholder data, not production
</details>

### Exercise 3: Stakeholder Simulation

**Goal**: Practice defending your AI policy.

**Instructions**:
1. Role-play presenting AI policy to skeptical stakeholder
2. Practice answering: "What if AI leaks our code?" "Who's liable?"
3. Document answers for real conversations

---

## 5. CHEAT SHEET

### Policy Sections

1. Purpose
2. Approved Tools
3. Usage Guidelines (Allowed/Approval/Prohibited)
4. Security Requirements
5. Quality Requirements
6. IP & Legal
7. Compliance

### Never Send to AI

```text
❌ Credentials, API keys
❌ PII, customer data
❌ Proprietary client code
❌ Production database contents
```

### Quick Reference Questions

| Question | Action |
|----------|--------|
| Is this data sensitive? | Don't send |
| Is this client code? | Check policy |
| Can I explain this AI code? | If no, don't submit |
| Is this PR AI-assisted? | Label it 🤖 |

### Stakeholder FAQ

| Question | Answer |
|----------|--------|
| Who owns AI code? | Company (work product) |
| Who's liable? | Human author |
| Is it secure? | Policy defines boundaries |
| Quality assured? | Standard review applies |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| No policy (anything goes) | Clear guidelines enable faster adoption |
| Over-restrictive (no one uses AI) | Balance security with productivity |
| Policy without training | Communicate, train, answer questions |
| Policy without enforcement | PR checks, periodic audits |
| Static policy (never updated) | Quarterly review and update |
| Policy only from legal/security | Include developer input for practicality |
| Unclear ownership | Human author owns AI output |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese fintech company, 50 developers. Before policy: some devs sent customer transaction data to AI for "testing." One dev accidentally included API key in prompt. Near-miss security incident.

**Policy implementation**:

- **Week 1**: Security team drafted policy with dev input
- **Week 2**: Legal reviewed IP and liability sections
- **Week 3**: All-hands presentation, Q&A session
- **Week 4**: Policy enforced, PR template updated

**Policy highlights**:
- Approved: Claude Code with company account
- Prohibited: customer data, financial credentials
- Required: AI-assisted PR label, security review for payment code

**Results after 3 months**:
- Zero security incidents related to AI
- AI adoption increased 40% (devs knew what was allowed)
- Audit found 100% compliance with labeling requirement
- Policy updated twice based on team feedback

**Quote**: "The policy didn't slow us down. It sped us up because we stopped second-guessing what's allowed."

---

> **Phase 10 Complete!** You now have a complete framework for team collaboration with Claude Code — from shared conventions to governance.
>
> **Next Phase**: [Phase 11: Automation & Headless](../../phase-11-automation-headless/01-headless-mode/) — Run Claude Code without human interaction.
