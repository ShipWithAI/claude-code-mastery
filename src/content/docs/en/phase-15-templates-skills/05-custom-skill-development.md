---
title: 'Custom Skill Development'
description: 'Design, build, test, and distribute custom Skills to extend Claude Code for your team and community.'
---

# Module 15.5: Custom Skill Development

> **Estimated time**: ~40 minutes
>
> **Prerequisite**: Module 15.4 (Community Ecosystem)
>
> **Outcome**: After this module, you will know how to design, build, test, and distribute custom Skills for Claude Code.

---

## 1. WHY — Why This Matters

Your company uses internal tools — custom CI/CD, proprietary APIs, internal platforms. No public Skill exists. You teach Claude the same commands and workflows every session. Inconsistent results. Time wasted.

Custom Skills package your internal knowledge. Build once, use everywhere. New team members get instant access to encoded expertise. Your tribal knowledge becomes reusable infrastructure.

---

## 2. CONCEPT — Core Ideas

### Skill Architecture

⚠️ Structure may vary — verify current implementation

```text
/my-custom-skill/
├── SKILL.md           # Core knowledge & metadata
├── README.md          # User documentation
├── prompts/           # Task-specific templates
├── workflows/         # Multi-step processes
└── examples/          # Usage demonstrations
```

**SKILL.md** is the brain of your Skill. It contains:
- **Metadata**: Version, author, description
- **Capabilities**: What Claude can do with this knowledge
- **Commands**: Optional slash commands (e.g., `/deploy`)
- **Knowledge**: Domain information — CLI commands, APIs, concepts, best practices
- **Patterns**: Code examples and workflows Claude should follow

This is where you encode your team's expertise. Think of it as teaching Claude a new specialized skill it doesn't have by default.

### Skill Components

| Component | Purpose | When to Include |
|-----------|---------|-----------------|
| **SKILL.md** | Core knowledge | Always — this is mandatory |
| **README.md** | User documentation | Always — explains how to use the Skill |
| **workflows/** | Multi-step processes | For complex procedures |
| **examples/** | Usage demonstrations | Always — show real scenarios |
| **prompts/** | Task-specific templates | Optional — for advanced use |

### Development Workflow

1. **Identify need** → What Claude doesn't do well (internal tools, tribal knowledge)
2. **Create structure** → Folders and SKILL.md
3. **Write knowledge** → Commands, patterns, best practices
4. **Add examples** → Real scenarios with expected results
5. **Test thoroughly** → Load into Claude, ask questions, verify responses
6. **Distribute** → Share with team via internal repo
7. **Maintain** → Assign owner, update when tools change

---

## 3. DEMO — Step by Step

**Scenario**: Create a Skill for your company's internal deployment system "DeployBot".

### Step 1: Identify the Need

```text
Problem: Claude doesn't know DeployBot (internal tool)
Goal: Teach Claude DeployBot CLI + best practices
```

### Step 2: Create Skill Structure

```bash
mkdir -p company-deploybot-skill/{prompts,workflows,examples}
cd company-deploybot-skill
```

### Step 3: Write SKILL.md

Create `SKILL.md`:

```markdown
# Skill: Company DeployBot

## Metadata
- Version: 1.0.0
- Author: DevOps Team
- Description: Internal deployment system workflows and best practices

## Capabilities
- DeployBot CLI commands and usage
- Deployment best practices and safety checks
- Rollback procedures and emergency protocols

## Commands
- /deploy: Guide through deployment with safety checks
- /rollback: Emergency rollback procedure

## Knowledge

### DeployBot CLI Basics
deploybot deploy <service> --env <environment>
deploybot status <deployment-id>
deploybot rollback <deployment-id>
deploybot logs <deployment-id> --follow

### Environments
- **dev**: Auto-deploy on merge to develop
- **staging**: Manual approval, auto-tests run
- **prod**: Requires 2 approvals (dev + ops), manual tests

### Best Practices

1. **Always deploy to staging first**
   - Run full test suite
   - Monitor for 15+ minutes
   - Check error rates and latency

2. **Production deployment checklist**
   - [ ] Staging deployment successful
   - [ ] Monitoring configured
   - [ ] Rollback plan ready
   - [ ] Team notified in #deployments

3. **Post-deployment monitoring**
   - Watch error rates for 30 minutes
   - Check key metrics: latency, throughput
   - Verify database migrations completed

### Common Issues
- **Deployment stuck**: Check `deploybot logs <id>`
- **Health check fails**: Verify service dependencies
- **Rollback needed**: Use `deploybot rollback <id>` immediately

## Patterns

### Safe Deployment Pattern
# Step 1: Deploy to staging
deploybot deploy payment-service --env staging

# Step 2: Monitor (wait 15 min)
deploybot status <deployment-id>

# Step 3: Deploy to production
deploybot deploy payment-service --env prod

# Step 4: Monitor production
watch -n 10 'deploybot status <prod-deployment-id>'
```

This SKILL.md now encodes your entire deployment workflow. Claude knows your internal tool, your best practices, and your troubleshooting procedures.

### Step 4: Test the Skill

⚠️ Testing method depends on how skills are loaded in your Claude Code version

Start Claude Code session and test:

```text
You: Deploy payment-service to production

Claude: [Using company-deploybot skill]

Pre-flight Check:
✓ Staging deployed? ✓ Monitored 15+ min? ✓ No critical errors?

Commands:
  deploybot deploy payment-service --env prod
  deploybot status <deployment-id>

Rollback ready: deploybot rollback <deployment-id>

Proceed?
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Identify Skill Opportunity

**Goal**: Find the best candidate for a custom Skill in your work.

**Instructions**:
1. List 3 internal tools your team uses
2. For each: What does Claude not know about it?
3. Pick the highest-impact candidate
4. Write down: What knowledge would the Skill need?

<details>
<summary>💡 Hint</summary>

Good candidates: complex workflows you repeat, tribal knowledge, custom tools.

</details>

<details>
<summary>✅ Solution</summary>

Pick: Internal CI. Knowledge needed: stages, approval flows, common failures, log interpretation.

</details>

### Exercise 2: Build Basic Skill

**Goal**: Create a minimal working Skill for your chosen tool.

**Instructions**:
1. Create skill folder structure
2. Write SKILL.md with metadata, capabilities, core knowledge
3. Add one example in `examples/`
4. Test with Claude (load SKILL.md content)

<details>
<summary>💡 Hint</summary>

Start minimal: focus on core knowledge, test early, iterate based on Claude's mistakes.

</details>

<details>
<summary>✅ Solution</summary>

```bash
mkdir -p my-ci-skill/{examples}
```

SKILL.md: metadata, 2-3 capabilities, commands (lint/test/build), common failures.
Example: fix-failing-ci.md showing problem → solution → result.
Test by asking Claude about CI failures.

</details>

### Exercise 3: Complete and Share

**Goal**: Make skill production-ready for team use.

**Instructions**:
1. Add workflow document + 2 more examples
2. Write clear README (what it does, how to use, commands)
3. Share with colleague for feedback
4. Iterate

<details>
<summary>💡 Hint</summary>

README should pass "3-minute test" — can someone understand it quickly?

</details>

<details>
<summary>✅ Solution</summary>

Add workflows/ (troubleshooting guide), more examples/ (test failure, deploy staging).
README: Quick start with example questions, available commands, how to update.
Share via internal repo/Slack. Gather feedback, iterate.

</details>

---

## 5. CHEAT SHEET

### Skill Structure

```text
/my-skill/
├── SKILL.md       # Core knowledge & metadata
├── README.md      # User documentation
├── prompts/       # Task-specific templates
├── workflows/     # Multi-step guides
└── examples/      # Real usage demonstrations
```

### SKILL.md Template

```markdown
# Skill: [Name]

## Metadata
- Version: X.Y.Z
- Author: [Your name/team]
- Description: [What this skill does]

## Capabilities
- [What Claude can do with this knowledge]

## Commands
- /command-name: Description

## Knowledge
[Domain information, CLI commands, API patterns, concepts]

## Patterns
[Code examples, best practices, workflows]
```

### Quick Development Process

1. **Identify need** → Find what you teach Claude repeatedly
2. **Create structure** → `mkdir my-skill/{prompts,workflows,examples}`
3. **Write SKILL.md** → Encode commands, patterns, best practices
4. **Add examples** → Real scenarios with expected results
5. **Test** → Load in Claude, verify responses use your knowledge
6. **Document** → Clear README for team members
7. **Distribute** → Internal repo or team channel
8. **Maintain** → Update when tools change

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Skill too broad ("DevOps Skill") | Focus on specific domain (e.g., "DeployBot Skill") |
| No examples | Examples are essential — they show expected usage |
| Outdated commands | Keep synced with tool updates, document version requirements |
| No testing with real scenarios | Test every capability with actual use cases |
| Missing edge cases | Include error handling and "what if it fails" scenarios |
| Poor documentation | Write README for beginners |
| Never updating | Assign owner, schedule reviews |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese e-commerce company (300 developers) with 5 internal systems. Tribal knowledge lived in senior developers' heads. Onboarding took 3 weeks.

**Problem**: Senior developers spent 30% of time answering repeated questions. Documentation was outdated.

**Solution**: Created 5 Skills over 6 weeks (inventory-system, order-processor, payment-gateway, notification-service, analytics-dashboard). Each captured commands, best practices, common errors, troubleshooting workflows.

**Results (3 months)**:
- Onboarding time: 3 weeks → 1 week (67% reduction)
- Repeated questions: -70%
- Senior dev interruptions: -50%
- New hire productivity: 2x faster to first PR
- Knowledge retention: 90% of tribal knowledge captured

**Quote**: "Every developer now has a senior engineer's expertise in their Claude session. Like having a mentor 24/7."

**ROI**: ~120 hours to build. Positive ROI within first month.

---

> **Phase 15 Complete!** You've mastered templates, Skills, and the community ecosystem. You can now package and share expertise effectively.
>
> **Next Phase**: [Phase 16: Real-World Mastery](../../phase-16-real-world-mastery/01-case-studies/) — Apply everything in real-world projects.
