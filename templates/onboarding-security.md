# Security Onboarding Document

Source: Module 2.5 — System Control & Monitoring
Date: 2026-09-21

> ⚠️ Extracted verbatim from Module 2.5 before the Wave 1/2 rewrite. Step 5 ("Test Sandbox")
> relies on the module's `sandbox.sh`, which sets Docker `--network` to `none`; Claude Code
> needs network access to api.anthropic.com, so that recipe is being replaced — treat Step 5 as
> a placeholder until Module 2.3/2.5 are rewritten.

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
