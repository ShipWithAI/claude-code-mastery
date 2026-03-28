---
title: 'Claude Code Skills'
description: 'Find, install, and use Claude Code Skills to extend capabilities with community-built enhancements.'
---

# Module 15.3: Claude Code Skills

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 15.2 (Command & Prompt Templates)
>
> **Outcome**: After this module, you will understand Claude Code Skills, know how to find and install them, and be able to use Skills to extend Claude's capabilities.

---

## 1. WHY — Why This Matters

You want Claude to work with Kubernetes, Terraform, or a specific framework. Claude has general knowledge, but not the specialized commands, best practices, and workflows for your tool. You end up teaching Claude the same things repeatedly.

Skills package this knowledge. Install a skill, and Claude immediately knows the patterns, best practices, and workflows. No repeated teaching.

---

## 2. CONCEPT — Core Ideas

### What is a Skill?

```text
Skill = Knowledge + Tools + Workflows

- Knowledge: Domain-specific information
- Tools: Commands and integrations
- Workflows: Step-by-step processes
```

### Skill Types

| Type | Source | Examples |
|------|--------|----------|
| **Official** | Anthropic | Core development skills |
| **Community** | Open source | Framework-specific skills |
| **Custom** | You/team | Company-specific skills |

### Skill Components

```text
⚠️ Structure may vary — verify current implementation

/skill-name/
├── SKILL.md          # Skill documentation
├── prompts/          # Prompt templates
├── tools/            # Tool definitions
├── workflows/        # Multi-step workflows
└── examples/         # Usage examples
```

### How Skills Extend Claude

```text
Without Skill:
You: "Create a Kubernetes deployment"
Claude: [Generic YAML, might miss best practices]

With Kubernetes Skill:
You: "Create a Kubernetes deployment"
Claude: [Production-ready YAML with health checks,
         resource limits, proper labels]
```

### Skill Discovery

- Official skill repository
- Community skill registries
- GitHub search for Claude Code skills
- Team internal skill libraries

---

## 3. DEMO — Step by Step

**Scenario**: Using skills to improve Claude's domain knowledge.

### Step 1: Explore Available Skills

```bash
# ⚠️ Commands may vary — verify current implementation

$ claude skill list --available

Official Skills:
- docker: Docker container management
- kubernetes: Kubernetes orchestration
- terraform: Infrastructure as Code

Community Skills:
- nextjs: Next.js development patterns
- prisma: Prisma ORM workflows
```

### Step 2: Install a Skill

```bash
# ⚠️ Verify current implementation

$ claude skill install kubernetes

Installing kubernetes skill...
✓ Downloaded skill package
✓ Registered tools
✓ Loaded prompts

Kubernetes skill installed.
```

### Step 3: Use Skill in Session

```text
You: Create a production-ready deployment for a Node.js app
with 3 replicas.

Claude: [Using kubernetes skill]

I'll create a production-ready deployment:
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-app
  labels:
    app: nodejs-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nodejs-app
  template:
    spec:
      containers:
      - name: nodejs-app
        image: your-registry/nodejs-app:latest
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
```

**Skill ensured**:
- Resource limits (prevent runaway containers)
- Health probes (automatic restart on failure)
- Proper labels (for service discovery)

### Step 4: Skill-Specific Commands

```text
You: /k8s-debug my-pod is in CrashLoopBackOff

Claude: [Skill-guided debugging]

Kubernetes debugging workflow:
1. Check pod status: kubectl describe pod my-pod
2. Check logs: kubectl logs my-pod --previous
3. Common causes:
   - Application error (check logs)
   - Missing config/secrets
   - Resource limits too low
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Explore Available Skills

**Goal**: Discover what skills exist.

**Instructions**:
1. List available official skills
2. Read documentation for 2-3 skills
3. Identify which would help your current project

<details>
<summary>💡 Hint</summary>

Focus on skills matching your tech stack: cloud provider, framework, database.

</details>

<details>
<summary>✅ Solution</summary>

Useful skills by role:
- **Backend**: kubernetes, docker, database skills
- **Frontend**: nextjs, react, tailwind skills
- **DevOps**: terraform, aws/gcp, ci-cd skills
- **Data**: python, pandas, jupyter skills

Pick 1-2 most relevant to your daily work.

</details>

### Exercise 2: Install and Use a Skill

**Goal**: Experience skill-enhanced Claude output.

**Instructions**:
1. Install a skill relevant to your project
2. Ask Claude a domain-specific question
3. Compare output quality with/without skill

<details>
<summary>💡 Hint</summary>

Try the same prompt before and after installing the skill to see the difference.

</details>

<details>
<summary>✅ Solution</summary>

Example comparison:
- **Without skill**: Generic code, missing best practices
- **With skill**: Production-ready code, includes error handling, follows conventions

The skill provides domain expertise Claude wouldn't have otherwise.

</details>

### Exercise 3: Evaluate Skill Quality

**Goal**: Learn to assess community skills.

**Instructions**:
1. Find a community skill for your tech stack
2. Test on 3 different tasks
3. Evaluate: documentation, accuracy, maintenance

<details>
<summary>💡 Hint</summary>

Check: last updated, GitHub stars, issues/responses, example quality.

</details>

<details>
<summary>✅ Solution</summary>

Quality checklist:
- [ ] Clear documentation with examples
- [ ] Updated within last 6 months
- [ ] Responsive maintainer
- [ ] Accurate output on your tests

Don't install skills that fail multiple checks.

</details>

---

## 5. CHEAT SHEET

### Skill Commands

```bash
# ⚠️ Verify current implementation

claude skill list             # List installed
claude skill list --available # List all available
claude skill install [name]   # Install skill
claude skill remove [name]    # Remove skill
claude skill info [name]      # Skill details
```

### Popular Skill Categories

| Category | Examples |
|----------|----------|
| **Cloud** | AWS, GCP, Azure |
| **DevOps** | Kubernetes, Docker, Terraform |
| **Databases** | PostgreSQL, MongoDB, Redis |
| **Frameworks** | Next.js, Django, FastAPI |
| **Tools** | Git, CI/CD, Testing |

### Skill Quality Checklist

- [ ] Clear documentation
- [ ] Real code examples
- [ ] Active maintenance
- [ ] Positive community feedback

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Installing every skill | Only install what you need |
| Trusting skill blindly | Review skill output critically |
| Using outdated skills | Check version and maintenance |
| Ignoring skill conflicts | Be aware of skill interactions |
| Not reading skill docs | Understand capabilities first |
| Ignoring skill commands | Learn the shortcuts |
| Requiring skills | Skills enhance, shouldn't be required |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese fintech migrating to Kubernetes. Team had limited K8s experience. Claude helped but output was generic, missing production patterns.

**Skill Solution**:

Installed kubernetes skill that provided:
- Production-ready manifest templates
- Security best practices (RBAC, NetworkPolicies)
- Debugging workflows
- Scaling patterns

**Team Workflow**:
1. "Create deployment for payment-service"
2. Claude uses skill → production-ready YAML
3. Team reviews (learning while doing)
4. Deploys with confidence

**Results (2 months)**:
- Manifest quality: Generic → Production-ready
- Security issues: 8 → 1 (skill enforced best practices)
- Time to deploy: -40% (less back-and-forth fixing)
- Team learning: Accelerated (skill explains patterns)

**Quote**: "The skill was like having a Kubernetes expert pair programming with us. We got production-ready output while learning best practices."

---

> **Next**: [Module 15.4: Community Ecosystem](../04-community-ecosystem/) →
