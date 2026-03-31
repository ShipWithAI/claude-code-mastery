---
title: 'System Control — CLAUDE.md, Settings, and Governance'
description: 'Build a security governance framework for Claude Code with CLAUDE.md policies and team safety guidelines.'
---

# Module 2.5: System Control — CLAUDE.md, Settings, and Governance

> **Estimated time**: ~45 minutes
>
> **Prerequisite**: Module 2.4 (Secret Management)
>
> **Outcome**: After this module, you will have a complete security governance system including CLAUDE.md security policies, team guidelines, and actionable checklists for safe AI-assisted development

---

## 1. WHY — Why This Matters

You've learned about threats, permissions, sandboxing, and secrets. But here's the harsh reality: knowledge without systems fails. You'll forget to check a permission prompt. A teammate will hardcode an API key. A rushed Friday deployment will skip the pre-commit hook. Security isn't about being perfect once — it's about having systems that catch you when you're tired, rushed, or distracted. This module transforms your Phase 2 knowledge into a governance framework that works even when humans are fallible. You'll leave Phase 2 not just knowing the risks, but having a complete operational system to manage them.

---

## 2. CONCEPT — Core Ideas

### CLAUDE.md as Security Policy

Most developers think of `CLAUDE.md` as a coding style guide — tabs vs spaces, naming conventions, import order. But for security-conscious teams, **`CLAUDE.md` is your AI security policy document**. It's where you codify the rules that keep your credentials safe and your systems intact.

**What security rules belong in CLAUDE.md:**

```markdown
## Security Rules (CRITICAL)

### File Access Restrictions
- NEVER read files in: ~/.ssh/, ~/.aws/, ~/.config/, ~/.env
- NEVER read .env files directly - use .env.example for reference
- NEVER traverse parent directories (../) to access files outside project

### Command Restrictions
- NEVER run rm -rf without explicit user confirmation
- NEVER run git push without showing diff first
- NEVER run curl/wget with credentials in URL
- NEVER run commands with --force flag without confirmation

### Code Generation Rules
- NEVER hardcode API keys, tokens, or secrets
- ALWAYS use environment variables: process.env.VARIABLE_NAME
- ALWAYS reference .env.example for configuration structure
- NEVER include real credential values in comments or documentation

### Git Rules
- NEVER commit .env files
- ALWAYS verify .gitignore includes secret files before committing
- NEVER force push to main/master branch
```

**⚠️ CRITICAL UNDERSTANDING:** CLAUDE.md is **ADVISORY, NOT ENFORCED**. Claude Code reads it and tries to follow it, but it's a guideline, not a guardrail. Think of it like a code review checklist — helpful, but not a compiler error. You still need the other layers (permissions, sandboxing, secret management) as actual enforcement.

That said, CLAUDE.md is incredibly powerful because:
1. **It shapes behavior proactively** — Claude Code reads it before every response
2. **It documents expectations for humans** — your team knows the rules
3. **It's version-controlled** — security policy evolves with your code
4. **It's project-specific** — different rules for production vs prototype projects

### Configuration Settings

⚠️ Needs verification — the exact configuration commands may vary by Claude Code version.

Claude Code has both global and project-level configuration:

```bash
# View current configuration
claude config show

# Set a configuration value
claude config set <key> <value>

# Reset to defaults
claude config reset
```

**Typical configuration areas:**
- **Permissions**: Default approval settings (callback to Module 2.2)
- **Model selection**: Which Claude model to use by default
- **Context**: Auto-compaction settings
- **Logging**: What gets logged and where

**Project-level vs Global:**
- **Global config**: Lives in `~/.claude/config` — affects all projects
- **Project config**: Lives in `.claude/config` in project root — overrides global
- **Use case**: Global = safe defaults, Project = exceptions for trusted repos

### Team Governance

Security doesn't scale without governance. Here's the complete stack:

**1. Shared CLAUDE.md in Version Control**
- Lives in project root
- Reviewed in pull requests like any code change
- Team agrees on rules, documents exceptions

**2. CLAUDE_PERMISSIONS.md** (from Exercise 2.2.3)
- Documents what commands are approved/denied and why
- Explains the reasoning: "We deny `docker run --privileged` because..."
- Living document that evolves with threat model

**3. Onboarding Checklist**
- New team member gets security training, not just code walkthrough
- Verifies security tooling is installed (gitleaks, sandbox, etc.)
- Pair programming session showing safe Claude Code usage

**4. Regular Security Audits**
- Weekly: Quick scans with `gitleaks detect`
- Monthly: Full review of CLAUDE.md, permission logs, incident reports
- Quarterly: Threat model update — are there new risks?

**5. Incident Response Plan**
- What to do if a secret is committed
- Who to notify if Claude Code does something unexpected
- Post-mortem template to learn from incidents

### The Complete Security Stack

This diagram shows how all five layers of Phase 2 work together as defense-in-depth:

```mermaid
graph TD
    ATTACK["🔴 Potential Threat<br/>Malicious prompt, accidental leak, etc."]

    L1["Layer 1: THREAT AWARENESS<br/>(Module 2.1)<br/>Know what can go wrong"]
    L2["Layer 2: PERMISSION DISCIPLINE<br/>(Module 2.2)<br/>Deny dangerous commands"]
    L3["Layer 3: SANDBOX ISOLATION<br/>(Module 2.3)<br/>Contain blast radius"]
    L4["Layer 4: SECRET MANAGEMENT<br/>(Module 2.4)<br/>Keep credentials out of context"]
    L5["Layer 5: SYSTEM CONTROL<br/>(Module 2.5)<br/>Governance and auditing"]

    SAFE["✅ PROTECTED<br/>Damage prevented or contained"]

    ATTACK --> L1
    L1 -->|"Threat recognized"| L2
    L2 -->|"Permission denied"| SAFE
    L2 -->|"Permission bypassed"| L3
    L3 -->|"Contained in sandbox"| SAFE
    L3 -->|"Escaped sandbox"| L4
    L4 -->|"Secrets protected"| SAFE
    L4 -->|"Secrets exposed"| L5
    L5 -->|"Detected in audit"| SAFE

    style ATTACK fill:#ffcdd2
    style SAFE fill:#c8e6c9
    style L1 fill:#fff3e0
    style L2 fill:#fff3e0
    style L3 fill:#fff3e0
    style L4 fill:#fff3e0
    style L5 fill:#fff3e0
```

**What happens when each layer fails:**

| Layer | If It Fails | Caught By |
|-------|-------------|-----------|
| Layer 1 (Awareness) | You don't recognize the risk | Permission prompt (L2) |
| Layer 2 (Permissions) | You approve dangerous command | Sandbox limits damage (L3) |
| Layer 3 (Sandbox) | Claude accesses outside sandbox | Secrets not in context (L4) |
| Layer 4 (Secrets) | Secret enters Claude's context | Audit catches it (L5) |
| Layer 5 (Governance) | No audit catches the leak | 💀 Full exposure |

The power of this model: **you need multiple failures for catastrophic damage**. Any single layer failing is uncomfortable but recoverable. Only when all five layers fail do you have full credential exposure.

### Security Checklists — Knowledge Into Habits

Checklists are how pilots prevent crashes and surgeons prevent mistakes. Here are your security checklists for Claude Code:

**Pre-Session Checklist:**
- [ ] Am I in the correct project directory?
- [ ] Is Docker sandbox running? (for sensitive projects)
- [ ] Is .env.example present and .env gitignored?
- [ ] Is gitleaks pre-commit hook active?
- [ ] Have I read CLAUDE.md security rules?

**During-Session Checklist:**
- [ ] Read every permission prompt before approving
- [ ] Never paste secrets into prompts
- [ ] Reference .env.example, never .env
- [ ] Verify paths in file operations stay within project
- [ ] Question any command I don't understand

**Post-Session Checklist:**
- [ ] Run `git status` to check for unexpected changes
- [ ] Run `gitleaks detect` on project
- [ ] Clear terminal scrollback if secrets were displayed
- [ ] Exit Docker sandbox if used
- [ ] Review any generated code for hardcoded secrets

**Weekly Audit Checklist:**
- [ ] Run full project scan: `gitleaks detect --verbose`
- [ ] Review CLAUDE.md for needed updates
- [ ] Check for new .env variables not in .env.example
- [ ] Review git history for any committed secrets
- [ ] Update team on any new security practices

Print these. Laminate them. Put them on your monitor. Security is a habit, not an event.

---

## 3. DEMO — Step by Step

Let's build a complete secure project from scratch, implementing all five layers of Phase 2.

### Step 1: Create Security-Focused CLAUDE.md

```bash
$ mkdir secure-banking-api && cd secure-banking-api
$ git init
```

Create a comprehensive `CLAUDE.md` with security as a first-class concern:

```bash
$ cat > CLAUDE.md << 'EOF'
# Banking API — Claude Code Security Policy

## Project Overview
Backend API for mobile banking application. Handles customer accounts,
transactions, and integrations with Vietnam's Napas payment network.

**Security Level**: CRITICAL — this project handles financial data and PII.

---

## Security Rules (CRITICAL)

### File Access Restrictions
- NEVER read files in: ~/.ssh/, ~/.aws/, ~/.config/, ~/.env
- NEVER read .env files directly - use .env.example for reference only
- NEVER traverse parent directories (../) to access files outside project root
- NEVER read files in /etc/, /var/, or other system directories

### Command Restrictions
- NEVER run rm -rf without explicit user confirmation showing exact path
- NEVER run git push without showing full diff first
- NEVER run curl/wget with credentials in URL (use headers or .netrc)
- NEVER run commands with --force, --no-verify, or similar danger flags
- NEVER run database migration commands in production without review
- NEVER run docker commands that expose ports externally without confirmation

### Code Generation Rules
- NEVER hardcode API keys, tokens, passwords, or secrets
- ALWAYS use environment variables: process.env.VARIABLE_NAME (Node.js)
- ALWAYS reference .env.example for configuration structure
- NEVER include real credential values in comments, logs, or error messages
- NEVER log sensitive fields (account numbers, passwords, tokens)
- ALWAYS redact PII in generated code examples

### Git Rules
- NEVER commit .env, .env.local, or any file with real credentials
- ALWAYS verify .gitignore includes secret files before first commit
- NEVER force push to main, master, or production branches
- NEVER commit database dumps or backup files
- ALWAYS use conventional commit format: type(scope): message

### Database Rules
- NEVER run DROP, TRUNCATE, or DELETE without WHERE clause
- NEVER expose database connection strings in code
- NEVER commit migration files that contain real data
- ALWAYS use parameterized queries, never string concatenation

### Audit Trail
When this CLAUDE.md is updated with new security rules, document:
- Date of change
- Rule added/modified
- Reason (incident, new threat, compliance requirement)

---

## Coding Standards
[Rest of coding standards here...]

EOF
```

**Expected result:** You now have a security policy document that Claude Code will read before every response.

**Why it matters:** This proactively shapes Claude's behavior. It won't be perfect, but it dramatically reduces risky suggestions.

### Step 2: Set Up Secret Management (Layer 4)

```bash
$ cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/banking_dev
DB_POOL_SIZE=10

# Authentication
JWT_SECRET=your-256-bit-secret-here
JWT_EXPIRY=3600

# Napas Integration (Vietnam payment network)
NAPAS_API_KEY=your_napas_api_key
NAPAS_MERCHANT_ID=your_merchant_id
NAPAS_ENDPOINT=https://sandbox.napas.com.vn/api/v2

# AWS (for document storage)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=banking-documents-dev

# Monitoring
SENTRY_DSN=https://public@sentry.io/project-id
LOG_LEVEL=debug
EOF
```

```bash
$ cat > .gitignore << 'EOF'
# Environment files - NEVER COMMIT THESE
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/

# Build output
dist/
build/

# Database
*.db
*.sqlite
database/backups/

# Logs
logs/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
EOF
```

**Expected result:**
```
$ git status
On branch main

No commits yet

Untracked files:
  .env.example
  .gitignore
  CLAUDE.md
```

**.env is NOT listed** — that's correct. It will be gitignored when created.

### Step 3: Install Pre-Commit Hook (Layer 4)

```bash
$ mkdir -p .git/hooks

$ cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Running gitleaks secret scan..."

# Run gitleaks on staged files only
gitleaks protect --staged --verbose

EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ COMMIT BLOCKED: Secrets detected in staged files"
  echo ""
  echo "What to do:"
  echo "1. Remove the secret from the file"
  echo "2. Add it to .env.example as a placeholder"
  echo "3. Document it in .env.example comments"
  echo "4. Re-stage and commit"
  echo ""
  echo "To bypass this check (DANGEROUS): git commit --no-verify"
  exit 1
fi

echo "✅ No secrets detected"
exit 0
EOF

$ chmod +x .git/hooks/pre-commit
```

**Test it:**
```bash
$ echo "AWS_KEY=AKIAIOSFODNN7EXAMPLE" > test-secret.txt
$ git add test-secret.txt
$ git commit -m "test"
```

**Expected output:**
```
🔍 Running gitleaks secret scan...

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

Finding:     AWS_KEY=AKIAIOSFODNN7EXAMPLE
Secret:      AKIAIOSFODNN7EXAMPLE
File:        test-secret.txt
Line:        1

❌ COMMIT BLOCKED: Secrets detected in staged files
```

**Why it matters:** This is your last line of defense before secrets enter version control.

### Step 4: Create Sandbox Script (Layer 3)

```bash
$ cat > sandbox.sh << 'EOF'
#!/bin/bash

# Banking API Sandbox — isolated Claude Code environment
# Network disabled, memory limited, filesystem restricted

CONTAINER_NAME="banking-api-sandbox"
PROJECT_DIR="$(pwd)"

echo "🔐 Starting secure sandbox for banking API..."
echo "   Network: DISABLED"
echo "   Memory: 4GB limit"
echo "   Filesystem: Read-only except /workspace"

docker run -it --rm \
  --name "$CONTAINER_NAME" \
  -v "$PROJECT_DIR":/workspace \
  -w /workspace \
  --network=none \
  --memory=4g \
  --cpus=2 \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=1g \
  -e PS1="\[\e[31m\][SANDBOX]\[\e[0m\] \w $ " \
  node:20-alpine \
  sh

echo "🔓 Exited sandbox"
EOF

$ chmod +x sandbox.sh
```

**Why it matters:** For sensitive projects, this contains any accidental damage to the sandbox environment.

### Step 5: Create Team Onboarding Document

```bash
$ cat > SECURITY_ONBOARDING.md << 'EOF'
# Banking API — Security Onboarding for Claude Code

Welcome to the team! Before you start using Claude Code on this project,
complete this security checklist.

## Prerequisites (Install These First)

- [ ] Claude Code CLI installed
- [ ] Docker Desktop installed and running
- [ ] gitleaks installed: `brew install gitleaks`
- [ ] Git configured with your work email

## Setup Steps

### 1. Clone and Verify
```bash
git clone <repo-url>
cd secure-banking-api
git status  # Should show clean working tree
```

### 2. Read Security Documentation
- [ ] Read CLAUDE.md security rules (5 minutes)
- [ ] Read this entire document (10 minutes)
- [ ] Understand the 5-layer security model (Module 2.5)

### 3. Set Up Local Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env with real credentials (get from team lead)
# NEVER commit this file
nano .env

# Verify .env is gitignored
git status  # Should NOT show .env as untracked
```

### 4. Test Pre-Commit Hook
```bash
# This should PASS
echo "test" > test.txt
git add test.txt
git commit -m "test: verify pre-commit hook"

# This should FAIL
echo "PASSWORD=secret123" > test-secret.txt
git add test-secret.txt
git commit -m "test: this should be blocked"
# Expected: Commit blocked by gitleaks

# Clean up test
git reset HEAD
rm test.txt test-secret.txt
```

### 5. Test Sandbox (Required for Production Work)
```bash
./sandbox.sh
# You should see: [SANDBOX] /workspace $
# Try: ping google.com
# Expected: Network unreachable
# Exit sandbox: exit
```

### 6. Practice Safe Claude Code Session

Start Claude Code and test with a safe task:

```bash
claude
```

In the Claude Code session:
- Prompt: "Show me the structure of .env.example without reading .env"
- Verify: Claude reads .env.example, NOT .env
- Prompt: "Add a new endpoint for account balance"
- Verify: Check permission prompts before approving
- When asked to run commands, read them carefully

Exit Claude Code: `/exit`

### 7. Pair Programming Session

Schedule a 1-hour session with a senior team member to:
- [ ] Review a real pull request together
- [ ] Practice using Claude Code on an actual task
- [ ] Discuss security scenarios: "What if Claude suggests reading .env?"

## Daily Workflow Checklists

Print these and keep them visible:

**Before Starting Claude Code:**
- [ ] Correct project directory?
- [ ] Using sandbox for sensitive work?
- [ ] CLAUDE.md security rules fresh in mind?

**During Claude Code Session:**
- [ ] Read every permission prompt
- [ ] Never paste secrets in prompts
- [ ] Question unexpected commands

**After Session:**
- [ ] `git status` — any unexpected changes?
- [ ] `gitleaks detect` — any secrets leaked?
- [ ] Code review own changes before committing

## Incident Reporting

If something goes wrong:

1. **Secret committed to git**:
   - STOP immediately
   - Notify team lead on Slack: #engineering-incidents
   - Do NOT push
   - Follow runbook: docs/runbooks/secret-leak-response.md

2. **Claude suggests dangerous command**:
   - DENY the command
   - Document in #engineering-ai channel
   - Propose CLAUDE.md update

3. **Unexpected file access**:
   - Check what file was accessed: review Claude's response
   - If sensitive file: treat as potential leak
   - Document and discuss with team

## Resources

- Phase 2 Security Modules: [link to course]
- CLAUDE.md: [link to file]
- Slack: #engineering-ai for questions
- Team Lead: Khoa (@khoa-nguyen)

**Estimated total time**: 1 hour setup + 1 hour pair programming

By completing this onboarding, you're not just learning tools — you're joining
our security culture. Every engineer is a security engineer.

EOF
```

**Expected result:** New team members have a clear, checkable path to safe Claude Code usage.

### Step 6: Configure Claude Code (⚠️ Needs verification)

```bash
# Set project-level configuration
$ claude config set model claude-3-5-sonnet-20241022
$ claude config set auto-compact true
$ claude config set log-level info
```

**Expected output:**
```
Configuration updated:
  model: claude-3-5-sonnet-20241022
  auto-compact: true
  log-level: info

Config saved to: .claude/config
```

**Why it matters:** Project-specific settings ensure consistency across team members.

### Step 7: Run a Secure Claude Code Session

Now let's walk through a complete secure session:

```bash
# PRE-SESSION CHECKLIST
$ pwd
/Users/you/projects/secure-banking-api  ✓

$ docker ps | grep sandbox
# (empty if not using sandbox for this task)  ✓

$ ls .env.example .gitignore
.env.example  .gitignore  ✓

$ .git/hooks/pre-commit --help 2>&1 | grep gitleaks
# (shows gitleaks is in hook)  ✓

$ cat CLAUDE.md | head -20
# Banking API — Claude Code Security Policy  ✓
```

All checks pass. Start Claude Code:

```bash
$ claude
```

**Safe prompts during session:**
- ✅ "Add password hashing to user registration using bcrypt"
- ✅ "Show me how .env.example is structured"
- ✅ "Create a test for the transaction endpoint"

**Dangerous prompts to AVOID:**
- ❌ "Show me the database connection string" (might read .env)
- ❌ "What's in my AWS config?" (accessing ~/.aws/)
- ❌ "Delete all test files" (could be interpreted as rm -rf)

**During session:** Read EVERY permission prompt. Example:

```
Claude Code wants to:
  Read file: .env

Allow? [y/N]
```

**Correct response:** `N` — this violates CLAUDE.md rules. Tell Claude:
"No, please reference .env.example instead, not .env"

**End session:**
```
/exit
```

**POST-SESSION CHECKLIST:**

```bash
$ git status
# Review any changes

$ gitleaks detect
# ✅ No leaks detected

$ history | tail -20
# Review commands run
# If any secrets visible: clear && history -c
```

### Step 8: Weekly Security Audit

Every Monday morning:

```bash
$ gitleaks detect --verbose
INFO[2024-01-15] scanning repository
INFO[2024-01-15] 127 commits scanned
INFO[2024-01-15] no leaks found
```

```bash
$ git log --all --grep="password\|secret\|key" --oneline
# Check if any commit messages mention secrets
```

```bash
$ diff .env.example .env | grep "^>"
# Lists variables in .env that aren't documented in .env.example
# Add them to .env.example (with placeholder values)
```

```bash
$ cat CLAUDE.md
# Review: Are the security rules still relevant?
# Has the threat model changed?
```

**Document findings** in team wiki or Slack #engineering-ai channel.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Write Security-Focused CLAUDE.md

**Goal**: Create a `CLAUDE.md` with comprehensive security rules for YOUR actual project.

**Instructions**:
1. Identify your project's most sensitive assets (database, API keys, user data, etc.)
2. List the top 5 dangerous commands for your tech stack
3. Document code generation rules specific to your framework
4. Write git rules appropriate to your team's workflow
5. Add an audit trail section

**Expected result**: A `CLAUDE.md` file that addresses YOUR project's specific security risks, not generic ones.

<details>
<summary>💡 Hint</summary>

Start by asking: "What's the worst thing that could happen if Claude Code went rogue in this project?"

For a Django project: exposing SECRET_KEY, running migrations on production, deleting media files
For a React app: leaking API keys in bundled code, exposing .env in source maps
For a mobile app: hardcoding signing keys, exposing backend endpoints

Work backwards from those scenarios to create preventive rules.

</details>

<details>
<summary>✅ Solution Template</summary>

```markdown
# [Project Name] — Claude Code Security Policy

## Project Overview
[1-2 sentences: what this project does and what's at risk]

**Security Level**: [CRITICAL/HIGH/MEDIUM/LOW]

---

## Security Rules (CRITICAL)

### File Access Restrictions
- NEVER read files in: [list sensitive directories]
- NEVER read [.env / .secrets / etc.] files directly
- NEVER traverse outside project root
- [Add project-specific restrictions]

### Command Restrictions
- NEVER run [framework-specific dangerous commands]
- NEVER run git push without [your workflow requirement]
- NEVER run [database commands] without [safety check]
- [Add build tool restrictions]

### Code Generation Rules
- NEVER hardcode [types of secrets your project uses]
- ALWAYS use [your env variable pattern]
- ALWAYS reference [your config file pattern]
- NEVER log [PII fields specific to your domain]
- [Add framework-specific rules]

### Git Rules
- NEVER commit [your secret file patterns]
- ALWAYS verify [your gitignore requirements]
- NEVER force push to [your protected branches]
- [Add team-specific git conventions]

### [Domain-Specific Rules]
[e.g., "Database Rules" for backend, "Build Rules" for mobile, etc.]

### Audit Trail
| Date | Rule Changed | Reason |
|------|--------------|--------|
| 2024-01-15 | Initial security policy | Adopting Claude Code |

---

## [Rest of your CLAUDE.md: coding standards, architecture, etc.]
```

**Validation**:
- [ ] File access section mentions YOUR sensitive directories
- [ ] Command restrictions include YOUR framework's dangerous commands
- [ ] Code generation rules match YOUR project's patterns
- [ ] Git rules reflect YOUR team's workflow
- [ ] You added domain-specific rules (database, mobile, etc.)

</details>

---

### Exercise 2: Create Team Onboarding Guide

**Goal**: Write a complete onboarding document for a new team member using Claude Code on your project.

**Instructions**:
1. List all prerequisite tools (Claude Code, language runtimes, secret scanners, etc.)
2. Write step-by-step setup instructions
3. Include a "test your setup" section with commands to verify everything works
4. Add the daily workflow checklists
5. Document incident reporting process

**Expected result**: A markdown file that you could hand to a new hire on day one, and they could self-onboard to safe Claude Code usage in under 2 hours.

<details>
<summary>💡 Hint</summary>

Walk through the onboarding process yourself AS IF you were a new hire:
- Clone a fresh copy of the repo to a new directory
- Follow your own instructions
- Note every time you had to figure something out that wasn't documented
- Add those missing steps

The best onboarding docs are written by people who just went through onboarding.

</details>

<details>
<summary>✅ Solution Template</summary>

```markdown
# [Project Name] — Claude Code Security Onboarding

Welcome! This guide will get you set up for safe AI-assisted development.

## Prerequisites (Install These First)

**Required:**
- [ ] Claude Code: [installation link]
- [ ] [Your language runtime, e.g., Node 20+]
- [ ] [Secret scanner, e.g., gitleaks]
- [ ] [Container runtime if using sandbox, e.g., Docker]

**Optional:**
- [ ] [Your team's other tools]

## Setup Steps

### 1. Clone and Verify
```bash
git clone [your-repo-url]
cd [project-name]
[verification commands]
```

### 2. Read Security Documentation (15 minutes)
- [ ] CLAUDE.md security rules
- [ ] This onboarding document
- [ ] [Your team's security policy]

### 3. Set Up Local Environment
```bash
[Your specific environment setup]
```

### 4. Test Pre-Commit Hook
```bash
[Commands to verify secret scanning works]
```

### 5. Test Sandbox (if applicable)
```bash
[Sandbox verification steps]
```

### 6. Practice Safe Claude Code Session
```bash
[Example safe prompts for your project]
```

### 7. Pair Programming Session
Schedule with: [team member name/role]
Duration: 1 hour
Topics to cover:
- [ ] Real PR review
- [ ] Claude Code on actual task
- [ ] Security scenario discussion

## Daily Workflow Checklists

[Copy the checklists from Demo Step 5, customized for your project]

## Incident Reporting

If something goes wrong:

1. **Secret committed**: [Your process]
2. **Dangerous command suggested**: [Your process]
3. **Unexpected behavior**: [Your process]

**Contacts:**
- Team Lead: [Name/Slack]
- Security Contact: [Name/Slack]
- Incident Channel: [Slack channel]

## Resources

- CLAUDE.md: [link]
- Security Runbooks: [link]
- Team Wiki: [link]
- Questions: [Slack channel]

**Estimated time**: [Your estimate]
```

**Validation**:
- [ ] New hire can complete without asking questions
- [ ] Every tool installation is documented
- [ ] Test steps verify security measures are working
- [ ] Contact information is current
- [ ] Checklists are printed/printable

</details>

---

### Exercise 3: Run Security Audit

**Goal**: Audit your current project's Claude Code security posture and create a remediation plan.

**Instructions**:
1. Use the audit checklist below to evaluate your project
2. Document findings: what's working, what's missing
3. Prioritize remediations: critical, high, medium, low
4. Create action items with owners and deadlines
5. Schedule recurring audits

**Audit Checklist:**

**Layer 1: Threat Awareness**
- [ ] Team has completed Phase 2 training
- [ ] Threat model documented
- [ ] Incident history reviewed

**Layer 2: Permission Discipline**
- [ ] Team knows how to read permission prompts
- [ ] Dangerous commands documented
- [ ] Permission decisions are consistent

**Layer 3: Sandbox Isolation**
- [ ] Sandbox script exists (if needed)
- [ ] Team knows when to use sandbox
- [ ] Sandbox tested and working

**Layer 4: Secret Management**
- [ ] .env.example exists and is complete
- [ ] .env is gitignored
- [ ] Pre-commit hook active
- [ ] No secrets in git history

**Layer 5: System Control**
- [ ] CLAUDE.md has security rules
- [ ] Team onboarding document exists
- [ ] Daily checklists available
- [ ] Audit schedule defined

**Expected result**: A scored assessment (e.g., "12/16 checks passing") and a prioritized list of fixes.

<details>
<summary>💡 Hint</summary>

Be brutally honest. The goal is to find gaps, not to score well.

For each failing check, ask:
1. What's the risk if we don't fix this?
2. How long would it take to fix?
3. Who should own the fix?

Use this formula to prioritize:
**Priority = Risk × Likelihood ÷ Effort**

High-risk, high-likelihood, low-effort fixes go first.

</details>

<details>
<summary>✅ Solution Template</summary>

```markdown
# Claude Code Security Audit — [Project Name]
**Date**: [Date]
**Auditor**: [Your name]
**Next Audit**: [Date + 1 month]

## Score: X / 16 checks passing

## Findings by Layer

### Layer 1: Threat Awareness
- [x] Team has completed Phase 2 training
- [ ] Threat model documented — **MISSING**
- [x] Incident history reviewed

**Risk**: MEDIUM — team knows threats but hasn't documented them formally

### Layer 2: Permission Discipline
- [x] Team knows how to read permission prompts
- [ ] Dangerous commands documented — **INCOMPLETE** (only has git commands)
- [x] Permission decisions are consistent

**Risk**: LOW — team is practicing permission discipline

### Layer 3: Sandbox Isolation
- [ ] Sandbox script exists — **MISSING**
- [ ] Team knows when to use sandbox — **N/A** (no script yet)
- [ ] Sandbox tested — **N/A**

**Risk**: HIGH for production work — no containment if something goes wrong

### Layer 4: Secret Management
- [x] .env.example exists and is complete
- [x] .env is gitignored
- [ ] Pre-commit hook active — **BROKEN** (gitleaks not installed on 2 dev machines)
- [x] No secrets in git history

**Risk**: HIGH — pre-commit hook inconsistency

### Layer 5: System Control
- [ ] CLAUDE.md has security rules — **INCOMPLETE** (has coding style but no security section)
- [ ] Team onboarding document exists — **MISSING**
- [ ] Daily checklists available — **MISSING**
- [ ] Audit schedule defined — **THIS IS THE FIRST ONE**

**Risk**: MEDIUM — no systematic governance

## Prioritized Remediation Plan

| Priority | Item | Owner | Deadline | Effort |
|----------|------|-------|----------|--------|
| CRITICAL | Fix pre-commit hook on all dev machines | DevOps | This week | 2 hours |
| HIGH | Create sandbox script for production | Security | 2 weeks | 4 hours |
| HIGH | Add security rules to CLAUDE.md | Team Lead | This week | 1 hour |
| MEDIUM | Write onboarding document | Team Lead | 1 month | 3 hours |
| MEDIUM | Document threat model | Security | 1 month | 2 hours |
| LOW | Create daily checklists | Team Lead | 1 month | 1 hour |
| LOW | Complete dangerous commands list | Team | 1 month | 1 hour |

## Action Items

- [ ] @devops: Verify gitleaks on all machines by [date]
- [ ] @security: Draft sandbox script by [date]
- [ ] @team-lead: Add security section to CLAUDE.md by [date]
- [ ] @team-lead: Schedule monthly audits in team calendar

## Notes

[Any additional observations, patterns, or concerns]

## Next Audit

**Scheduled**: [Date]
**Focus**: Verify critical/high items are complete
```

**Validation**:
- [ ] Every failing check has a remediation plan
- [ ] Priorities are based on risk, not convenience
- [ ] Owners are assigned (not just "team")
- [ ] Deadlines are realistic
- [ ] Next audit is scheduled

</details>

---

## 5. CHEAT SHEET

### CLAUDE.md Security Rules Quick Reference

| Rule Category | Example Rule | Why It Matters |
|---------------|--------------|----------------|
| **File Access** | Never read `~/.ssh`, `~/.aws`, `.env` | Prevents credential exposure |
| **Commands** | Never `rm -rf` without confirmation | Prevents accidental deletion |
| **Code Gen** | Always use `${VAR}`, never hardcode | Keeps secrets out of source |
| **Git** | Never push without showing diff | Catches accidental commits |
| **Database** | Never `DELETE` without `WHERE` | Prevents data loss |

### Configuration Commands (⚠️ Needs verification)

| Command | Purpose | Scope |
|---------|---------|-------|
| `claude config show` | View current settings | Global or project |
| `claude config set key value` | Change setting | Global or project |
| `claude config reset` | Restore defaults | Global or project |

**Project config**: Lives in `.claude/config` (overrides global)
**Global config**: Lives in `~/.claude/config` (default for all projects)

### Phase 2 Security Stack Summary

| Layer | Module | Key Protection | What Happens If It Fails |
|-------|--------|----------------|--------------------------|
| **1** | 2.1 Threat Model | Know what's at risk | You don't recognize danger → Permission catches it |
| **2** | 2.2 Permissions | Deny dangerous commands | You approve bad command → Sandbox contains it |
| **3** | 2.3 Sandbox | Contain blast radius | Sandbox escaped → Secrets still protected |
| **4** | 2.4 Secrets | Protect credentials | Secret exposed → Audit catches it |
| **5** | 2.5 Governance | Audit and improve | No audit → 💀 Full exposure |

### Essential Checklists

**Pre-Session (2 minutes):**
- [ ] Correct directory?
- [ ] Sandbox running? (if sensitive)
- [ ] .env.example exists?
- [ ] Pre-commit hook active?
- [ ] Security rules fresh in mind?

**During-Session:**
- [ ] Read every permission prompt
- [ ] Never paste secrets
- [ ] Reference .env.example, not .env
- [ ] Verify file paths stay in project
- [ ] Question unknown commands

**Post-Session (2 minutes):**
- [ ] `git status` — unexpected changes?
- [ ] `gitleaks detect` — any leaks?
- [ ] Clear terminal if secrets displayed
- [ ] Exit sandbox
- [ ] Review generated code for hardcoded secrets

**Weekly Audit (15 minutes):**
- [ ] `gitleaks detect --verbose`
- [ ] Review CLAUDE.md updates needed
- [ ] Check new .env variables documented
- [ ] Review git history for secrets
- [ ] Update team on new practices

### Quick Command Reference

```bash
# Secret scanning
gitleaks detect                    # Scan entire repo
gitleaks protect --staged          # Scan staged files only
gitleaks detect --verbose          # Detailed output

# Environment verification
diff .env.example .env | grep "^>" # Find undocumented variables
git status                         # Check working tree
git log --grep="secret\|password"  # Search commit messages

# Sandbox
./sandbox.sh                       # Start isolated environment
docker ps | grep sandbox           # Verify sandbox running
```

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach | Why It Matters |
|-----------|-------------------|----------------|
| Treating CLAUDE.md as enforced rules | Remember it's ADVISORY — Claude may not always follow it | CLAUDE.md shapes behavior but isn't a compiler. You still need permission discipline and sandboxing. |
| Setting up security once, never auditing | Schedule recurring audits (weekly quick, monthly deep) | Security degrades over time: new secrets added, .gitignore outdated, team forgets practices. |
| Creating governance so heavy nobody follows it | Make checklists fast (<2 min) and automate what you can | If security is painful, people work around it. Make it easy to do the right thing. |
| No incident response plan | Document BEFORE an incident: who to notify, what to do, how to learn from it | In a crisis, you won't think clearly. A runbook keeps you calm and effective. |
| Thinking one layer is enough | Implement defense-in-depth: all 5 layers working together | Any single layer can fail. Security is about surviving multiple failures. |
| CLAUDE.md that never evolves | Review and update CLAUDE.md quarterly or after incidents | Your threat model changes: new APIs, new secrets, new team members, new risks. |
| Team member skips onboarding | Make security onboarding MANDATORY, with verification steps | One uninformed developer can compromise the entire project. |
| Copying someone else's CLAUDE.md verbatim | Customize security rules to YOUR project's specific risks | Generic rules don't address your specific threats (e.g., mobile app vs backend API). |
| Relying on memory for daily security | Print checklists, make them visible, make them habitual | Humans are forgetful under pressure. Checklists are external memory. |
| Approving permission prompts without reading | Pause, read the FULL command, question anything unclear | That 2-second pause is your last chance to prevent damage. Respect it. |

---

## 7. REAL CASE — Production Story

**Scenario**: Khoa Nguyen is team lead for a 5-developer startup in Da Nang, Vietnam, building a SaaS platform for logistics companies. They adopted Claude Code 6 months ago to move faster. Initial results were amazing — 40% productivity boost, faster feature delivery, happier developers.

**Problem**: But in the first 3 months, three security incidents occurred:

1. **Month 1**: Junior developer committed a test Stripe API key to git. Found 2 weeks later during code review. Had to rotate the key, audit all transactions, notify customers. 8 hours of team time lost.

2. **Month 2**: Claude Code suggested `rm -rf node_modules/*` to fix a dependency issue. Developer approved without reading carefully. The `*` was actually `* /` (extra space) — deleted the entire project directory. Luckily had recent backup, but lost 3 hours of work.

3. **Month 3**: During a demo, screen-sharing developer ran `cat .env` to debug an issue. Accidentally exposed production database credentials to 12 people in the meeting. Had to rotate all credentials immediately, redeploy entire stack. 6 hours of team time, 2 hours of downtime.

**The Wake-Up Call**: After the third incident, Khoa realized: "We're moving fast, but we're also creating risks we've never had before. Claude Code is powerful, but we're using it like a toy."

**Implementation**: Khoa spent a weekend implementing the complete Phase 2 security stack:

**Layer 1 (Threat Awareness):**
- Documented threat model: what could go wrong, what's at risk
- Ran team workshop: "Understanding AI-Assisted Development Risks" (2 hours)
- Created incident playbook with concrete scenarios

**Layer 2 (Permission Discipline):**
- Added permission training to onboarding
- Created `CLAUDE_PERMISSIONS.md` documenting approved/denied commands
- Team agreement: "When in doubt, deny and ask"

**Layer 3 (Sandbox Isolation):**
- Created `sandbox.sh` script for production work
- Team rule: "Touching production config? Use sandbox."
- Tested disaster scenarios in sandbox (safe failure)

**Layer 4 (Secret Management):**
- Created `.env.example` for all 3 projects
- Installed gitleaks pre-commit hook on all dev machines
- Verified hook with test commits (caught 2 historical secrets!)
- Created pattern: never reference .env in prompts, only .env.example

**Layer 5 (System Control):**
```markdown
# CLAUDE.md (excerpt from their actual file)

## Security Rules (CRITICAL)

⚠️ This project handles customer logistics data and payment processing.
ALL developers must follow these rules when using Claude Code.

### File Access Restrictions
- NEVER read .env files (use .env.example for reference)
- NEVER read ~/.aws/ (AWS credentials)
- NEVER traverse outside /logistics-platform directory

### Command Restrictions
- NEVER run rm -rf without showing Khoa the exact command first
- NEVER run git push to production without code review approval
- NEVER run database migrations on production without backup verification
- NEVER run docker commands that expose ports publicly

### Code Generation Rules
- NEVER hardcode API keys (Stripe, Google Maps, SendGrid)
- NEVER hardcode database credentials
- ALWAYS use process.env.VARIABLE_NAME for all config
- NEVER log customer PII (names, addresses, phone numbers)

### Git Rules
- NEVER commit .env, .env.production, or .env.local
- NEVER force push to main or production branches
- NEVER commit database dumps or backup files

### Incident Response
If Claude suggests violating these rules:
1. DENY the action
2. Screenshot the suggestion
3. Post in #engineering-security Slack channel
4. We'll update CLAUDE.md to prevent future occurrences

Last updated: 2024-01-15 (after incident #3)
```

**The Onboarding Document** they created includes:
- 30-minute security training (mandatory)
- Hands-on verification: "Try to commit a secret. It should be blocked."
- Pair programming first week: senior dev watches Claude Code usage
- Signed acknowledgment: "I understand the security rules"

**Team Checklists** (printed, laminated, on every desk):
```markdown
☑️ BEFORE Claude Code:
- Correct directory?
- Sandbox for production?
- Read CLAUDE.md today?

☑️ DURING Claude Code:
- Read every permission prompt
- Never paste secrets
- Question weird commands

☑️ AFTER Claude Code:
- git status clean?
- gitleaks clean?
- Clear terminal?
```

**Weekly Security Ritual** (every Monday, 15 minutes):
1. Run `gitleaks detect --verbose` on all 3 projects
2. Review CLAUDE.md — needs updates?
3. Check .env.example — complete?
4. Share learnings in team standup

**Result** (3 months after implementing security stack):

- ✅ **Zero security incidents** — the stack works
- ✅ **Velocity increased** — developers feel confident, not anxious
- ✅ **Onboarding faster** — new hire productive in 1 day instead of 1 week
- ✅ **Team culture shift** — security is everyone's job, not just Khoa's
- ✅ **Customer trust** — can demonstrate security practices in sales calls

**The Unexpected Benefit**: One customer asked during due diligence: "How do you ensure AI tools don't expose our data?" Khoa walked them through the 5-layer security model, showed CLAUDE.md, demonstrated the pre-commit hook. Customer was so impressed they signed a larger contract — security became a competitive advantage.

**Khoa's Advice**: "The first 3 months were chaotic — we were learning security by suffering through incidents. After implementing the Phase 2 stack, we learned security by preventing incidents. That shift changed everything. The time investment (maybe 16 hours total) paid back in the first month. Now it's just part of how we work."

**Their Actual CLAUDE.md and Checklists**: Available in the course repository as reference templates:
- `templates/claude-md-security-example.md`
- `templates/security-checklists.md`
- `templates/onboarding-security.md`

---

## Phase 2 Complete — Your Security Graduation

Congratulations! You've completed Phase 2: Security & Sandboxing. You now have a complete, operational security toolkit:

**What You've Built:**
- ✅ **Threat Model** (Module 2.1) — You know what can go wrong
- ✅ **Permission Discipline** (Module 2.2) — You can recognize and deny danger
- ✅ **Sandbox Isolation** (Module 2.3) — You can contain blast radius
- ✅ **Secret Management** (Module 2.4) — You can protect credentials
- ✅ **System Control** (Module 2.5) — You have governance and auditing

**The 5-Layer Defense**:
Every layer is a safety net. Any single failure is uncomfortable but survivable. Only when all five fail do you have catastrophic exposure. You've built a system that protects you even when you're tired, rushed, or distracted.

**What's Different Now**:
- Before Phase 2: "I hope nothing goes wrong"
- After Phase 2: "I have a system to catch things when they go wrong"

**Your Security Posture**:
| If you completed... | Your security level |
|---------------------|---------------------|
| Just read the modules | **Aware** — you know the risks |
| Did all the demos | **Equipped** — you have the tools |
| Did all the exercises | **Operational** — you have a working system |
| Deployed at work | **Mature** — your team has a security culture |

**The Habit That Matters Most**: Weekly audits. Everything else can slip, but if you audit weekly, you'll catch problems before they become incidents.

**Next Steps**:
1. If you skipped exercises, go back and do Exercise 3 (Security Audit) — it's the most valuable
2. Print the checklists and put them where you'll see them
3. Schedule your first weekly audit (15 minutes, every Monday)
4. If you have a team, schedule security onboarding for everyone

---

**What's Next**: In Phase 3 (Core Workflows), we'll shift from defense to offense: mastering prompt engineering to get the most out of Claude Code **while staying within the safety boundaries you've established**. You'll learn how to read codebases, write code, integrate with git, and operate the terminal — all with Claude as your pair programmer. The security foundation you've built makes everything else safer and more powerful.

---

> **Next**: [Module 3.1: Reading & Understanding Codebases](../../phase-03-core-workflows/01-reading-codebases/) →

