---
title: 'Phát triển Skill tùy chỉnh'
description: 'Hướng dẫn tạo custom skill cho Claude Code: thiết kế, implement, test và chia sẻ skill của riêng bạn.'
---

# Module 15.5: Phát triển Skill tùy chỉnh

> **Thời gian ước tính**: ~40 phút
>
> **Yêu cầu trước**: Module 15.4 (Hệ sinh thái cộng đồng)
>
> **Kết quả**: Sau module này, bạn sẽ biết design, build, test, và distribute custom Skill cho Claude Code.

---

## 1. WHY — Tại sao cần học

Công ty bạn dùng internal tool — custom CI/CD, proprietary API. Không có public Skill. Mỗi session Claude, bạn phải teach lại cùng workflow. Custom Skill package internal knowledge. Build một lần, dùng mãi. Tribal knowledge của senior available cho mọi người.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Skill Architecture

```text
/my-custom-skill/
├── SKILL.md       # Core knowledge (REQUIRED)
├── README.md      # User documentation
├── prompts/       # Task-specific template
├── workflows/     # Multi-step guide
└── examples/      # Usage demonstration
```

### SKILL.md Components

| Section | Purpose |
|---------|---------|
| Metadata | Version, author, tags |
| Capabilities | What Claude can do với Skill |
| Commands | Slash command, trigger phrase |
| Knowledge | CLI, config, best practices |
| Patterns | Code example, workflow |
| Common Issues | Error + solution |

### Development Steps

1. Identify Need → 2. Build SKILL.md → 3. Add Prompts/Examples → 4. Test → 5. Distribute → 6. Maintain

---

## 3. DEMO — Từng bước cụ thể

**Scenario thực tế:** Công ty dùng internal deployment tool "DeployBot" — custom CLI không có public doc. Team hay deploy sai env, miss approval step, forget rollback plan.

### Bước 1: Identify Need

Problem: Claude không biết DeployBot exist. Deploy workflow không consistent. New dev hay sai step.

Goal: Skill teach Claude về DeployBot + enforce best practice.

### Bước 2: Create Structure

```bash
cd ~/skills
mkdir -p company-deploybot-skill/{prompts,workflows,examples}
cd company-deploybot-skill
```

### Bước 3: Write SKILL.md

Tạo `SKILL.md` với:
- Metadata (version 1.0.0, author DevOps Team)
- Capabilities (deploy, status, rollback, approval)
- Commands (/deploy, /rollback, /deploy-status)
- Knowledge: CLI syntax (deploybot deploy/status/rollback), environments (dev/staging/prod), approval matrix, best practices (deploy staging first, wait 15 min, notify channel)
- Pre-flight checklist (staging ok? tests pass? approvals? rollback ready?)
- Common issues (approval timeout, deployment stuck)

### Bước 4: Add Prompts và Workflows

Tạo `prompts/deploy.md` template guide deployment step-by-step. Tạo `workflows/incident-response.md` cho rollback emergency.

### Bước 5: Test Skill

```text
Bạn: Load company-deploybot-skill/SKILL.md
Claude: Skill loaded.

Bạn: Deploy payment-service to production

Claude: [Using company-deploybot skill]
I'll guide you through production deployment.

**Pre-flight Checklist:**
- Staging deployed successfully?
- Monitored 15+ minutes?
- Approvals obtained (DevOps + Tech Lead)?
- Rollback plan ready?
- #deployments channel notified?

**Deployment Command:**
deploybot deploy payment-service --env prod

**Rollback Ready:**
deploybot rollback <deployment-id>
```

**Result:** Claude follow encoded workflow exactly. Consistent, safe deployment mọi lần.

---

## 4. PRACTICE — Luyện tập

### Bài 1: Identify Skill Opportunity

**Mục tiêu:** Tìm best candidate cho custom Skill trong team bạn.

**Hướng dẫn:**
1. List 5 internal tool, process, hoặc domain knowledge team dùng
2. Mỗi item: rate theo 3 tiêu chí (1-5):
   - **Complexity**: Có nhiều step/rule không?
   - **Frequency**: Dùng bao nhiêu lần/tuần?
   - **Variation**: Mọi người làm khác nhau không?
3. Calculate score = Complexity × Frequency × Variation
4. Pick item có score cao nhất

**Expected result:** Candidate rõ ràng cho Skill development.

<details>
<summary>💡 Gợi ý</summary>
Good candidate thường là: internal tool không có doc tốt, workflow có nhiều tribal knowledge, process hay bị làm sai. Example: Database migration script, compliance check, internal API auth.
</details>

<details>
<summary>✅ Giải pháp</summary>

**Example scoring:**
1. DeployBot — Complexity: 4, Frequency: 5, Variation: 5 → Score: 100
2. Database backup — Complexity: 2, Frequency: 3, Variation: 2 → Score: 12
3. Code review — Complexity: 3, Frequency: 5, Variation: 4 → Score: 60

Winner: DeployBot (score 100). Knowledge needed: CLI syntax, env setup, approval workflow, best practices, common errors.

</details>

### Bài 2: Build Minimal Skill

**Mục tiêu:** Tạo working Skill prototype trong 30 phút.

**Hướng dẫn:**
1. Create folder structure
2. Write SKILL.md với metadata, 2-3 core capability, essential command, basic knowledge
3. Add 1 prompt template
4. Test với Claude session thực tế

**Expected result:** Minimal Skill load được và Claude response đúng context.

<details>
<summary>💡 Gợi ý</summary>
Start MINIMAL: focus SKILL.md core knowledge trước. Đừng làm perfect documentation — test early, iterate fast. Template: Metadata (2 phút), Capabilities (3 item, 5 phút), Commands (1-2, 3 phút), Knowledge (15 phút), Test (5 phút).
</details>

<details>
<summary>✅ Giải pháp</summary>

Tạo `SKILL.md` minimal:
- Metadata: Version 0.1.0, Backend Team
- Capabilities: Generate migration, run safely, rollback
- Commands: /migrate
- Knowledge: CLI (db-migrate create/up/down), Best practices (test dev first, backup before prod, rollback ready)
- Common Issues: Lock timeout → wait

Test: Load skill → request add column → Claude guide với command, best practice, rollback từ SKILL.md.

</details>

### Bài 3: Complete và Distribute

**Mục tiêu:** Production-ready Skill có thể share cho team.

**Hướng dẫn:**
1. Expand SKILL.md với complete command reference, common issue, pattern
2. Add 2 workflow file
3. Add 2-3 example file
4. Write README rõ ràng
5. Share với 2-3 colleague, lấy feedback
6. Iterate based on feedback

**Expected result:** Skill mà người khác dùng được mà không cần hỏi bạn.

<details>
<summary>💡 Gợi ý</summary>

Documentation test: Give Skill cho colleague chưa biết domain. Họ dùng được trong 5 phút without asking question → doc đủ. Feedback questions: Clear không? Miss gì? Example helpful? Improve thế nào?

</details>

<details>
<summary>✅ Giải pháp</summary>

Complete structure: SKILL.md (200+ lines), README, prompts/ (create-migration.md, rollback.md), workflows/ (safe-migration.md, emergency-rollback.md), examples/ (add-column.md, create-table.md, data-migration.md).

Distribution: `git init`, commit, push internal repo. Post Slack: "New Skill: Database Migration. Repo: git@github.com:company/db-migration-skill.git. Feedback welcome!"

Iterate: Missing testing workflow → add. Confusing rollback → clarify với example. Request data migration → add pattern. V2 sau 1 tuần feedback → production-ready.

</details>

---

## 5. CHEAT SHEET

### Skill Structure

```text
/my-skill/
├── SKILL.md       # Core knowledge (REQUIRED)
├── README.md      # User documentation
├── prompts/       # Task-specific template
├── workflows/     # Multi-step guide
└── examples/      # Usage demonstration
```

### SKILL.md Template

```markdown
# Skill: [Name]

## Metadata
Version, Author, Description, Tags

## Capabilities
What skill enable Claude to do

## Commands
Slash command or trigger phrase

## Knowledge
Domain info: CLI, config, concept

## Patterns
Code example, workflow

## Common Issues
Known error + solution
```

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Skill quá broad: "DevOps Skill" | Focus specific: "DeployBot Skill" |
| Không có example | Example essential — typical usage |
| Command syntax outdated | Verify CLI, sync update |
| Skill quá dài | Start minimal, expand từ usage |
| Không test với user | Test critical, catch assumption |
| Assume context | Write cho người không biết |
| Build rồi không maintain | Update khi tool evolve |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario:** E-commerce platform Việt Nam với 50 developer. Team có 5 internal system proprietary — không có public doc, tribal knowledge scattered.

**Problem:**
- Onboarding new dev = 3 tuần học quirk của mỗi system
- Senior developer interrupt liên tục với câu hỏi repeated
- Sai sót deploy, integration vì không consistent
- Knowledge loss khi senior leave

**Solution — Custom Skill Initiative:**

5 senior owner 1 Skill (4 tuần):
1. **inventory-system** — Stock management, business rule
2. **order-processor** — Order workflow, state machine
3. **payment-gateway** — VNPay/MoMo integration
4. **notification-service** — SMS/email template, rate limit
5. **analytics-dashboard** — Report generation, pipeline

**Results sau 3 tháng:**
- Onboarding: 3 tuần → 1 tuần (67% reduction)
- New dev productive từ week 2 (trước: week 4)
- Senior interrupt: -70%, saved ~8h/week aggregate
- Deploy error: -60%, integration bug: -45%
- Skill evolution: 5 skill → 12 skill (community contribute)

**Senior Quote:**
> "Custom Skill = capture 10 năm tribal knowledge vào reusable format. Junior developer giờ có senior expertise trong mỗi Claude session — như có mentor 24/7 mà không làm phiền ai."

---

> **Phase 15 Hoàn Thành!** Bạn đã master template, Skill, và ecosystem — từ consume đến create.
>
> **Next Phase:** [Phase 16: Real-World Mastery](../../phase-16-real-world-mastery/01-case-studies/) — Apply tất cả trong complete project từ đầu đến cuối.
