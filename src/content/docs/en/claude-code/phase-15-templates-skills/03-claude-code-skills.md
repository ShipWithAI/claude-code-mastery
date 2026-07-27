---
title: 'Claude Code Skills'
description: 'Find, install, and use Claude Code Skills to extend capabilities with reusable, shareable workflows.'
---

# Module 15.3: Claude Code Skills

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 15.2 (Command & Prompt Templates)
>
> **Outcome**: After this module, you will understand what Claude Code Skills really are, how to install them, invoke them, and share them with your team.

---

## 1. WHY — Why This Matters

You keep teaching Claude the same things in every session — your deployment workflow, your internal tool commands, your team's code review checklist. Each new session starts from zero. Results vary depending on how well you remember to include the right context.

Skills solve this by packaging reusable workflows into a folder Claude can load automatically or on demand. Install once, use everywhere. The knowledge is always there.

---

## 2. CONCEPT — Core Ideas

### What Is a Skill?

A Skill is a folder containing a `SKILL.md` file. That file tells Claude what the skill does and how to execute it. That's it — no special runtime, no CLI tool, no compilation step.

```text
my-skill/
└── SKILL.md          ← Required: YAML frontmatter + Markdown instructions
```

The `SKILL.md` has two parts:

```markdown
---
name: code-reviewer
description: Review pull requests for logic errors, security, and standards
---

# Code Reviewer

## When to use
...

## Instructions
...
```

The **frontmatter** (`---` block) controls how Claude discovers and invokes the skill. The **Markdown body** is what Claude reads and follows when the skill runs.

### How Skills Are Invoked

Skills can be invoked in two ways:

| Method | How | When to use |
|--------|-----|-------------|
| **Slash command** | User types `/skill-name` | Explicit, on-demand tasks |
| **Auto-invocation** | Claude detects context | Repetitive background workflows |

Auto-invocation is controlled by `disable-model-invocation` in the frontmatter. When `false` (default), Claude decides on its own when the skill is relevant. When `true`, only slash commands trigger it.

### Where Skills Live

```text
~/.claude/skills/      ← Personal: available across all your projects
.claude/skills/        ← Project: committed to Git, shared with team
```

### Full Skill Structure

A simple skill only needs `SKILL.md`. For complex workflows, you can add supporting files that Claude loads lazily (only when needed):

```text
my-skill/
├── SKILL.md           ← Required
├── references/        ← Extra docs, loaded on demand
│   └── best-practices.md
├── scripts/           ← Executable scripts
│   └── run.sh
└── templates/         ← File templates
    └── pr-template.md
```

---

## 3. DEMO — Step by Step

**Scenario**: Installing a community skill, then creating a custom one for your team.

### Step 1: Install a Skill (3 Ways)

**Option A — Plugin browser (easiest)**

Inside a Claude Code session:

```text
/plugin
```

This opens the plugin/skill browser. Browse, find the skill, press Enter to install. Done.

**Option B — Unzip manually**

```bash
# For personal use (all projects):
unzip code-reviewer.zip -d ~/.claude/skills/

# For project use (committed to Git):
unzip code-reviewer.zip -d .claude/skills/
```

**Option C — Settings upload**

Go to Settings → Customize → Skills → Upload ZIP. The ZIP must contain the skill folder at its root.

### Step 2: Invoke the Skill

After installing, the skill appears as a slash command matching its `name` in the frontmatter:

```text
/code-reviewer
```

Or let Claude invoke it automatically when you paste a diff or ask for a review — depending on how the skill is configured.

### Step 3: Create a Custom Skill

**Via conversation (recommended):**

Start a new Claude session and say:

```text
I want to create a skill for reviewing our internal DeployBot deployment workflow.
It should check our deployment checklist and guide the engineer step by step.
```

Claude will ask clarifying questions, generate the `SKILL.md`, and refine it based on your feedback.

**Manually:**

```bash
mkdir -p ~/.claude/skills/deploybot
```

Create `~/.claude/skills/deploybot/SKILL.md`:

```markdown
---
name: deploybot
description: Guide engineers through the DeployBot deployment workflow with safety checks
---

# DeployBot Deployment Skill

## When to use
When an engineer asks to deploy a service or mentions DeployBot.

## Pre-deployment checklist
Before running any deployment command:
- [ ] Is staging deployed and monitored for 15+ minutes?
- [ ] Are error rates normal on staging?
- [ ] Is the team notified in #deployments?

## Commands

### Deploy to staging
deploybot deploy <service> --env staging

### Deploy to production (requires 2 approvals)
deploybot deploy <service> --env prod

### Check status
deploybot status <deployment-id>

### Rollback
deploybot rollback <deployment-id>

## Common issues
- **Deployment stuck**: Check `deploybot logs <id> --follow`
- **Health check fails**: Verify service dependencies are up
- **Need rollback**: Run rollback immediately, notify team, then investigate
```

### Step 4: Verify the Skill Works

```text
You: /deploybot
Claude: Running DeployBot Deployment Skill...

Pre-deployment checklist:
- [ ] Staging deployed and monitored 15+ min?
- [ ] Error rates normal on staging?
- [ ] Team notified in #deployments?

Which service are you deploying?
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Explore What's Available

**Goal**: Find a skill relevant to your work.

**Instructions**:
1. Open a Claude Code session and type `/plugin`
2. Browse available skills
3. Install one that matches your tech stack
4. Invoke it with `/skill-name` and test a real task

<details>
<summary>💡 Hint</summary>

If the plugin browser is empty, search GitHub for skills: `claude code skill site:github.com`. Many developers publish skills as public repos.

</details>

<details>
<summary>✅ Solution</summary>

Good skill candidates by role:
- **Backend**: database migration skill, API documentation skill
- **Frontend**: component generator skill, accessibility checker skill
- **DevOps**: deployment workflow skill, incident response skill
- **Data**: data profiling skill, notebook formatter skill

Install the closest match, test it, adapt the `SKILL.md` if needed.

</details>

### Exercise 2: Create Your First Skill

**Goal**: Package knowledge you currently repeat every session.

**Instructions**:
1. Identify something you explain to Claude repeatedly (a tool, a workflow, a checklist)
2. Create a skill folder in `~/.claude/skills/`
3. Write `SKILL.md` with frontmatter + instructions
4. Invoke the skill and verify Claude follows it correctly

<details>
<summary>💡 Hint</summary>

Start with the smallest useful unit. A skill that does one thing well beats a skill that tries to do everything.

</details>

<details>
<summary>✅ Solution</summary>

Minimal working `SKILL.md`:

```markdown
---
name: my-workflow
description: Guides my team's standard PR review process
---

# PR Review Workflow

## Steps
1. Check for missing tests
2. Check for security issues (SQL injection, exposed secrets)
3. Check naming conventions match our CLAUDE.md
4. Leave inline comments using GitHub review format
```

Test by typing `/my-workflow` in a session, then asking Claude to review a diff.

</details>

### Exercise 3: Share a Skill with Your Team

**Goal**: Make a skill available to everyone on the project.

**Instructions**:
1. Move your skill from `~/.claude/skills/` to `.claude/skills/` in your project repo
2. Commit and push it
3. Have a teammate pull and test `/skill-name`

<details>
<summary>💡 Hint</summary>

Skills in `.claude/skills/` are automatically available to anyone who clones the repo. No setup needed — just `git pull`.

</details>

<details>
<summary>✅ Solution</summary>

```bash
cp -r ~/.claude/skills/my-workflow .claude/skills/
git add .claude/skills/
git commit -m "feat: add PR review workflow skill"
git push
```

Teammates get the skill after `git pull`. They can invoke it with `/my-workflow` immediately.

</details>

---

## 5. CHEAT SHEET

### Skill Structure

```text
~/.claude/skills/my-skill/   ← Personal (all projects)
.claude/skills/my-skill/     ← Project (committed to Git)
├── SKILL.md                 ← Required
├── references/              ← Optional: extra docs
├── scripts/                 ← Optional: helper scripts
└── templates/               ← Optional: file templates
```

### SKILL.md Frontmatter

```yaml
---
name: skill-name                     # Slash command name: /skill-name
description: When Claude should use this skill (one sentence)
disable-model-invocation: false      # true = only manual /slash, false = auto-detect
allowed-tools: Read, Grep, Glob      # Optional: restrict tool access
---
```

### Install Methods

| Method | Command |
|--------|---------|
| Plugin browser | Type `/plugin` in session |
| Manual unzip | `unzip skill.zip -d ~/.claude/skills/` |
| Settings UI | Settings → Customize → Skills → Upload ZIP |
| Git (team) | Commit `.claude/skills/` to repo |

### Sharing Scope

| Scope | Location | Available to |
|-------|----------|--------------|
| Personal | `~/.claude/skills/` | You, all projects |
| Project | `.claude/skills/` | Everyone who clones the repo |
| Organization | Admin panel upload | All org members |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Looking for `claude skill install` CLI | Skills are installed by unzipping or using `/plugin` browser — no CLI install command exists |
| One giant skill for everything | One skill per workflow — small, focused, testable |
| No description in frontmatter | Write a clear one-sentence description so Claude knows when to auto-invoke |
| Hardcoding secrets in SKILL.md | Use environment variables or secret managers instead |
| Never updating the skill | Assign an owner; update when workflows change |
| Skipping examples in SKILL.md | Include real input/output examples — Claude uses them to calibrate |
| Personal skill when team needs it | Put team skills in `.claude/skills/` and commit to Git |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese fintech team, 8 engineers, migrating to Kubernetes. Claude kept generating generic manifests — missing RBAC, no resource limits, wrong namespace conventions.

**The fix**: One engineer built a `k8s-deploy` skill encoding the team's production standards.

`SKILL.md` included:
- Required labels and annotations for their monitoring stack
- Resource limit templates based on service tier (small/medium/large)
- RBAC role templates for their namespace structure
- A deployment checklist: staging first, 15-minute soak, then prod

**Result after 6 weeks**:
- Every `kubectl apply` Claude generated followed production standards
- Security audit findings dropped from 8 to 1 (RBAC was auto-included)
- New engineers onboarded to K8s conventions in 1 day instead of 1 week
- Skill took 3 hours to write; team estimated it saved 40+ hours over 6 weeks

**Quote**: "We stopped teaching Claude our conventions. We packaged them once, and now every session starts with a senior engineer's knowledge already loaded."

---

> **Next**: [Module 15.4: Community Ecosystem](../04-community-ecosystem/) →
