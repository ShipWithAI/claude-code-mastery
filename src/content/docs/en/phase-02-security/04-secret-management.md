---
title: 'Secret Management — Keeping Your Keys Away from Claude Code'
description: 'Prevent credential leaks in Claude Code sessions with secret management workflows and .env protection.'
---

# Module 2.4: Secret Management — Keeping Your Keys Away from Claude Code

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 2.3 (Sandbox Environments)
>
> **Outcome**: After this module, you will have a complete secret management workflow that prevents credentials from leaking through Claude Code into your codebase or external systems

---

## 1. WHY — Why This Matters

You've sandboxed Claude Code in Docker. You've restricted permissions. You think your secrets are safe. Then you ask Claude to "generate the payment integration module" and it helpfully reads your .env file — now your VNPay hash secret is in Claude's context, logged on Anthropic's servers, potentially embedded in generated code, and one git commit away from GitHub's public search. Sandboxes stop filesystem damage. They don't stop context leaks. This module gives you the practical workflows to break the secret leak chain before damage happens.

---

## 2. CONCEPT — Core Ideas

### The Secret Leak Chain

Even with perfect sandboxing, secrets can leak through Claude's context. Understanding the chain helps you cut it at the right points:

```mermaid
graph LR
    A[".env file<br/>Contains secrets"] --> B["Claude reads file<br/>Secrets in context"]
    B --> C["Sent to Anthropic API<br/>Logged on servers"]
    C --> D["Claude generates code<br/>Hardcoded secrets"]
    D --> E["Git commit<br/>Secrets in history"]
    E --> F["Push to GitHub<br/>💀 PUBLIC EXPOSURE"]

    style A fill:#ffcdd2
    style F fill:#ffcdd2
```

### Four Defense Layers

Your secret management strategy needs defense in depth. Each layer cuts the chain at a different point:

| Layer | What It Does | Cuts Chain At | Example Tools |
|-------|--------------|---------------|---------------|
| **Layer 1: Context Prevention** | Keep secrets out of Claude's context entirely | A → B | .env.example pattern, prompt discipline |
| **Layer 2: File Protection** | Protect secret files from being read | A → B | File permissions, .gitignore, ⚠️ .claudeignore (needs verification) |
| **Layer 3: Rotation Discipline** | Assume exposed secrets are compromised, rotate them | After B | AWS Secrets Manager, HashiCorp Vault |
| **Layer 4: Detection & Monitoring** | Catch leaked secrets before they cause damage | D → E, E → F | gitleaks, trufflehog, git hooks |

### Layer 1: Context Prevention (Primary Defense)

The most effective defense is keeping secrets out of Claude's context in the first place:

**Hard Rules:**
- NEVER paste secrets directly into Claude Code prompts
- NEVER ask Claude to read .env files directly
- NEVER include credentials in CLAUDE.md project notes
- Use placeholder variables in prompts: "Create config using ${DATABASE_URL}" not actual value

**The .env.example Pattern (Best Practice):**
Maintain two files:
- `.env` — Contains real secrets, NEVER committed, NEVER read by Claude
- `.env.example` — Contains variable names with placeholder values, committed to git, safe for Claude to read

Claude references .env.example to understand configuration structure, generates code using `process.env.VAR_NAME` patterns, never sees actual secret values.

### Layer 2: File Protection

Additional barriers to prevent accidental secret access:

**.gitignore vs Claude Access:**
Critical distinction: .gitignore prevents git commits but does NOT prevent Claude Code from reading files. Claude can still access .env even if it's gitignored.

**File Permissions:**
From Module 2.1, recall that file permissions (chmod 600) can restrict access, but this is brittle if Claude runs as your user.

**⚠️ Needs verification — .claudeignore:**
Check if Claude Code respects a .claudeignore file (similar to .gitignore) that prevents reading specific files. This feature may or may not exist in current versions.

### Layer 3: Secret Rotation Discipline

Assume any secret Claude has seen is compromised. Establish rotation priorities:

| Priority | Secret Type | Rotation Timeframe | Why Urgent |
|----------|-------------|-------------------|------------|
| 🔴 IMMEDIATE | Payment keys (VNPay, MoMo, Stripe) | Within 1 hour | Direct financial loss, regulatory penalties |
| 🔴 IMMEDIATE | Cloud credentials (AWS, GCP, Azure) | Within 1 hour | Crypto mining, data exfiltration (recall Tùng's story) |
| 🟡 HIGH | API keys (third-party services) | Within 24 hours | Service abuse, quota exhaustion |
| 🟡 HIGH | Database passwords | Within 24 hours | Data breach, privacy violations |
| 🟢 MEDIUM | Internal service tokens | Within 1 week | Limited blast radius in sandboxed environments |

**Tools for rotation:**
- AWS Secrets Manager — automatic rotation for AWS credentials
- HashiCorp Vault — centralized secret management
- Manual rotation scripts — for payment providers without automated rotation

### Layer 4: Detection & Monitoring

Catch secrets that slip through other layers before they cause damage:

**Pre-commit Hooks:**
Tools like gitleaks scan staged files for secret patterns before allowing commits. This is your last line of defense before secrets enter git history.

**Git History Scanning:**
Tools like trufflehog scan entire git history for accidentally committed secrets. Run periodically and especially after large refactoring.

**Monitoring for Abuse:**
- AWS billing alerts — detect unexpected charges (crypto mining, data egress)
- API rate limit alerts — detect credential abuse
- Failed authentication logs — detect credential stuffing attempts

---

## 3. DEMO — Step by Step

We'll set up a complete secret management workflow for a Vietnamese payment integration project.

**Step 1: Create project directory**
```bash
mkdir payment-demo && cd payment-demo
git init
```

Expected output:
```
Initialized empty Git repository in /path/to/payment-demo/.git/
```

**Step 2: Create .env with FAKE secrets for demonstration**
```bash
cat > .env << 'EOF'
# FAKE CREDENTIALS - DO NOT USE IN PRODUCTION
# These are obviously fake patterns for demonstration only
VNPAY_HASH_SECRET=sk-FAKE-DO-NOT-USE-vnpay-hash-secret-12345
VNPAY_TMN_CODE=FAKE-TMN-CODE-67890
MOMO_PARTNER_CODE=FAKE-MOMO-PARTNER-CODE-67890
MOMO_ACCESS_KEY=AKIAFAKEDONOTUSE12345
MOMO_SECRET_KEY=sk-FAKE-DO-NOT-USE-momo-secret-abcdef
DATABASE_URL=postgresql://user:FAKE-PASSWORD-DO-NOT-USE@localhost:5432/payment_db
REDIS_URL=redis://:FAKE-REDIS-PASSWORD@localhost:6379
EOF
```

Why these patterns: All secrets use obviously fake prefixes (FAKE-, DO-NOT-USE) so they can never be mistaken for real credentials.

**Step 3: Create .env.example (NO secrets, safe for Claude)**
```bash
cat > .env.example << 'EOF'
# Copy this to .env and fill in real values
# See docs: https://sandbox.vnpayment.vn/apis/docs/
VNPAY_HASH_SECRET=your_vnpay_hash_secret_here
VNPAY_TMN_CODE=your_vnpay_terminal_code_here

# MoMo integration (https://developers.momo.vn)
MOMO_PARTNER_CODE=your_momo_partner_code_here
MOMO_ACCESS_KEY=your_momo_access_key_here
MOMO_SECRET_KEY=your_momo_secret_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/payment_db

# Redis cache
REDIS_URL=redis://:password@localhost:6379
EOF
```

Why safe: Only variable names and placeholder text. Claude can read this to understand configuration structure without seeing real secrets.

**Step 4: Add .env to .gitignore**
```bash
cat > .gitignore << 'EOF'
# Secret files - NEVER commit these
.env
.env.local
.env.*.local

# Dependency directories
node_modules/
vendor/

# OS files
.DS_Store
Thumbs.db
EOF
```

Why important: Prevents accidental git commits, but remember this does NOT prevent Claude from reading these files.

**Step 5: Install gitleaks (pre-commit secret scanner)**

On macOS:
```bash
brew install gitleaks
```

On Linux:
```bash
# Download latest release from GitHub
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz
tar -xzf gitleaks_8.18.1_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

Verify installation:
```bash
gitleaks version
```

Expected output:
```
v8.18.1
```

**Step 6: Create pre-commit hook**
```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running gitleaks scan on staged files..."
gitleaks protect --staged --verbose

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ SECRETS DETECTED! Commit blocked."
    echo "Remove secrets from staged files and try again."
    exit 1
fi

echo "✅ No secrets detected. Proceeding with commit."
exit 0
EOF

chmod +x .git/hooks/pre-commit
```

Why this works: gitleaks scans staged files before commit, blocks commit if secrets found.

**Step 7: Test the protection (intentional leak)**
```bash
# Create a file with a fake secret
echo "const apiKey = 'sk-FAKE-DO-NOT-USE-test-12345';" > leaked.js
git add leaked.js
git commit -m "test commit with secret"
```

Expected output:
```
Running gitleaks scan on staged files...

    ○
    │╲
    │ ○
    ○ ░
    ░    gitleaks

Finding:     const apiKey = 'sk-FAKE-DO-NOT-USE-test-12345';
Secret:      sk-FAKE-DO-NOT-USE-test-12345
RuleID:      generic-api-key
Entropy:     3.891689
File:        leaked.js
Line:        1

❌ SECRETS DETECTED! Commit blocked.
```

Perfect. The hook works. Now remove the test file:
```bash
git reset HEAD leaked.js
rm leaked.js
```

**Step 8: Ask Claude to generate config (SAFE way)**

Start Claude Code in the project directory:
```bash
claude
```

Use this SAFE prompt:
```
Read .env.example and generate a TypeScript config loader that:
1. Loads all environment variables shown in .env.example
2. Validates required variables exist
3. Provides type-safe access to config values
4. Uses process.env to read actual values at runtime

Do NOT read .env directly. Only use .env.example as the template.
```

Why safe: Claude reads .env.example (which has no secrets), generates code that uses `process.env.VARIABLE_NAME` (runtime loading), never sees actual secret values.

**Step 9: Verify generated code has NO hardcoded secrets**
```bash
# Search for the fake secret patterns in generated files
grep -r "FAKE" . --include="*.js" --include="*.ts" --include="*.json"
```

Expected output:
```
# Should return NOTHING if Claude followed instructions correctly
# Any matches mean secrets leaked into generated code
```

If clean, you've successfully used Claude without exposing secrets.

**Step 10: Scan entire project history (periodic audit)**
```bash
gitleaks detect --verbose
```

Expected output:
```
○
│╲
│ ○
○ ░
░    gitleaks

No leaks found
```

Run this periodically, especially after large changes or before releases.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Set Up .env.example Pattern for Existing Project

**Goal**: Convert an existing project with secrets to use the safe .env.example pattern.

**Instructions**:
1. Find an existing project that uses a .env file (or create a sample Node.js project)
2. Identify all environment variables currently in .env
3. Create .env.example with placeholder values for all variables
4. Add .env to .gitignore if not already there
5. Update any documentation to reference .env.example instead of .env
6. Verify .env is NOT tracked by git: `git status` should not show .env

**Expected result**: You have .env.example committed to git, .env ignored and safe, ready for Claude to reference safely.

<details>
<summary>💡 Hint</summary>

To list all variables in .env:
```bash
grep -E '^[A-Z_]+=' .env | cut -d'=' -f1
```

To generate .env.example automatically:
```bash
sed 's/=.*/=your_value_here/' .env > .env.example
```

Then manually replace placeholder text with descriptive hints.
</details>

<details>
<summary>✅ Solution</summary>

Complete workflow:

```bash
# Navigate to your project
cd ~/projects/my-app

# Generate .env.example from .env (replace all values)
sed 's/=.*/=your_value_here/' .env > .env.example

# Edit .env.example to add helpful hints
nano .env.example  # Replace generic placeholders with specific instructions

# Example transformation:
# Before: DATABASE_URL=your_value_here
# After:  DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Ensure .env is gitignored
if ! grep -q "^\.env$" .gitignore; then
    echo ".env" >> .gitignore
fi

# Verify .env is not tracked
git status | grep .env
# Should show: nothing to commit (if .env was already untracked)
# Or: .gitignore modified (if you just added it)

# Commit .env.example
git add .env.example .gitignore
git commit -m "Add .env.example for safe secret management"
```

Now when working with Claude, always reference .env.example instead of .env.
</details>

---

### Exercise 2: Install and Test Secret Detection

**Goal**: Set up gitleaks pre-commit hook and verify it blocks secret commits.

**Instructions**:
1. Install gitleaks on your system (use brew on macOS, download binary on Linux)
2. Create pre-commit hook in a git repository (use the script from DEMO step 6)
3. Make hook executable: `chmod +x .git/hooks/pre-commit`
4. Test with intentional leak:
   - Create file: `echo "password=secret123" > test.txt`
   - Try to commit: `git add test.txt && git commit -m "test"`
5. Verify commit is blocked with gitleaks warning
6. Clean up: `git reset HEAD test.txt && rm test.txt`

**Expected result**: Commits with secrets are blocked. You have automated protection against accidental secret commits.

<details>
<summary>💡 Hint</summary>

If gitleaks doesn't detect your test secret, try more obvious patterns:
- `export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE`
- `const apiKey = 'sk-test1234567890abcdef'`
- `password=supersecret123!`

gitleaks uses entropy analysis and pattern matching. Very simple patterns might not trigger.
</details>

<details>
<summary>✅ Solution</summary>

Complete setup and test:

```bash
# Install gitleaks
# macOS:
brew install gitleaks

# Linux:
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.1/gitleaks_8.18.1_linux_x64.tar.gz
tar -xzf gitleaks_8.18.1_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/

# Verify
gitleaks version

# Create pre-commit hook in your repo
cd ~/projects/my-app
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running gitleaks scan..."
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
    echo "❌ Secrets detected! Commit blocked."
    exit 1
fi
echo "✅ No secrets detected."
exit 0
EOF

chmod +x .git/hooks/pre-commit

# Test with obvious secret pattern
echo "AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" > leaked-secret.txt
git add leaked-secret.txt
git commit -m "test secret detection"

# Should see gitleaks block the commit
# Output includes: "Secret: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# Clean up
git reset HEAD leaked-secret.txt
rm leaked-secret.txt

# Verify hook works on normal commits
echo "# README" > README.md
git add README.md
git commit -m "add readme"
# Should succeed with "✅ No secrets detected."
```

Now every commit is automatically scanned. Secrets cannot enter git history without explicit bypass.
</details>

---

### Exercise 3: Audit Project History for Secrets

**Goal**: Scan an existing project's entire git history for accidentally committed secrets, create rotation plan if any found.

**Instructions**:
1. Choose a real project (your own or a test repo)
2. Run full history scan: `gitleaks detect --verbose`
3. If secrets found:
   - List each secret with: type, location (commit hash, file, line)
   - Classify by rotation priority (🔴 IMMEDIATE, 🟡 HIGH, 🟢 MEDIUM)
   - Create rotation plan with timeline
   - Use `git filter-branch` or BFG Repo-Cleaner to remove from history (advanced)
4. If no secrets found: Document the clean audit result with date

**Expected result**: Complete audit report with action plan for any exposed secrets.

<details>
<summary>💡 Hint</summary>

To scan specific directories only:
```bash
gitleaks detect --source=./src --verbose
```

To generate a report file:
```bash
gitleaks detect --report-format=json --report-path=gitleaks-report.json
```

To scan faster (skip large binary files):
```bash
gitleaks detect --verbose --no-git
```
</details>

<details>
<summary>✅ Solution</summary>

Complete audit workflow:

```bash
# Navigate to project
cd ~/projects/production-app

# Run full history scan
gitleaks detect --verbose --report-format=json --report-path=audit-report.json

# If secrets found, review report
cat audit-report.json | jq '.[] | {file: .File, secret: .Secret, commit: .Commit}'

# Example output analysis:
# Finding 1: AWS key in config/aws.json (commit abc123)
# Finding 2: Database password in docker-compose.yml (commit def456)
# Finding 3: API key in README.md (commit ghi789)

# Create rotation plan
cat > SECRET_ROTATION_PLAN.md << 'EOF'
# Secret Rotation Plan - 2024-01-15

## Findings

### 🔴 IMMEDIATE (rotate within 1 hour)
- [ ] AWS_ACCESS_KEY_ID (commit abc123, config/aws.json)
  - Action: Generate new key in AWS Console
  - Update: All deployment configs, CI/CD secrets
  - Verify: Deploy test environment with new key
  - Revoke: Old key after verification

### 🟡 HIGH (rotate within 24 hours)
- [ ] DATABASE_PASSWORD (commit def456, docker-compose.yml)
  - Action: Update password in PostgreSQL
  - Update: All service configs, developer .env files
  - Verify: All services reconnect successfully

### 🟢 MEDIUM (rotate within 1 week)
- [ ] THIRD_PARTY_API_KEY (commit ghi789, README.md)
  - Action: Regenerate in provider dashboard
  - Update: Configuration files
  - Verify: API calls still work

## Git History Cleanup

After rotating all secrets, remove from git history:

```bash
# Using BFG Repo-Cleaner (recommended)
bfg --replace-text secrets.txt repo.git

# OR using git filter-branch (slower)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch config/aws.json' \
  --prune-empty --tag-name-filter cat -- --all
```

⚠️ WARNING: History rewrite forces pushes to all collaborators.
Coordinate with team before executing.
EOF

# If no secrets found, document clean audit
cat > SECURITY_AUDIT_CLEAN.md << 'EOF'
# Security Audit - 2024-01-15

## Scan Results
- Tool: gitleaks v8.18.1
- Scope: Full git history (512 commits, 3 years)
- Result: ✅ No secrets detected

## Scanned Patterns
- AWS credentials
- API keys (generic patterns)
- Private keys (RSA, SSH)
- Database passwords
- OAuth tokens
- JWT secrets

Next audit: 2024-04-15 (quarterly schedule)
EOF
```

This creates a documented audit trail for compliance and security reviews.
</details>

---

## 5. CHEAT SHEET

### Safe vs Unsafe Prompts

| ❌ Unsafe | ✅ Safe | Why |
|-----------|---------|-----|
| "Read .env and generate config" | "Read .env.example and generate config using process.env" | Keeps secrets out of Claude's context |
| Paste API key in prompt: `VNPAY_HASH_SECRET=sk-abc123` | Reference by variable: "Use ${VNPAY_HASH_SECRET} from environment" | Secrets never enter context |
| "Debug this code: `const key = 'sk-abc123'`" | "Debug this code: `const key = process.env.API_KEY`" | Share code structure, not values |
| Store credentials in CLAUDE.md notes | Store only variable names and documentation links | CLAUDE.md is context, not vault |

### Secret Storage Patterns

| Pattern | Safety | When to Use |
|---------|--------|-------------|
| `.env` file (gitignored, not read by Claude) | ✅ SAFE | Local development, never share |
| `.env.example` (committed, safe for Claude) | ✅ SAFE | Configuration templates, documentation |
| Hardcoded in code | ❌ NEVER | Not even "temporarily" |
| CLAUDE.md project notes | ❌ NEVER | Claude reads this, becomes context |
| Terminal history | ⚠️ RISKY | History survives sessions, use `HISTCONTROL=ignorespace` |
| CI/CD secrets (GitHub Secrets, GitLab Variables) | ✅ SAFE | Production deployments |
| Secret management systems (Vault, AWS Secrets Manager) | ✅ BEST | Enterprise, automated rotation |

### Rotation Priority Reference

| Priority | Secret Type | Timeframe | Action |
|----------|-------------|-----------|--------|
| 🔴 IMMEDIATE | Payment provider keys (VNPay, MoMo, Stripe) | 1 hour | Regenerate in provider dashboard, update all configs |
| 🔴 IMMEDIATE | Cloud credentials (AWS, GCP, Azure) | 1 hour | Rotate via cloud console, update IAM/service accounts |
| 🟡 HIGH | Third-party API keys | 24 hours | Regenerate in provider settings |
| 🟡 HIGH | Database passwords | 24 hours | Update via DB admin, restart services |
| 🟢 MEDIUM | Internal service tokens | 1 week | Regenerate, coordinate with team |
| 🟢 MEDIUM | Development tokens | 1 week | Rotate during regular maintenance |

### Detection Tools Quick Reference

| Tool | Purpose | Command | When to Run |
|------|---------|---------|-------------|
| **gitleaks** | Pre-commit scanning | `gitleaks protect --staged` | Every commit (via hook) |
| **gitleaks** | Full history audit | `gitleaks detect --verbose` | Monthly, before releases |
| **trufflehog** | Deep history scan | `trufflehog git file://.` | Quarterly, after incidents |
| **git-secrets** | AWS-focused scanning | `git secrets --scan` | AWS projects only |
| **detect-secrets** | Baseline tracking | `detect-secrets scan` | CI/CD pipeline |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach | Why It Matters |
|-----------|---------------------|----------------|
| Thinking .gitignore protects from Claude | Use .env.example pattern + never prompt Claude to read .env | .gitignore only prevents git commits, not file reading. Claude can still access gitignored files. |
| Rotating only the leaked key | Rotate ALL keys in the same system or with similar access | If one key leaked, assume compromise chain: if AWS key exposed, attacker may have accessed other keys stored in same system. |
| Using real secrets in docker-compose.yml | Use environment variable references: `${DATABASE_URL}` | docker-compose.yml is often committed to git. Even if gitignored, Claude may read it for context. |
| Storing secrets in CLAUDE.md for "memory" | Store only variable names and links to secret docs | CLAUDE.md is loaded into context every session. Anything in it is sent to Anthropic API. |
| Trusting Claude's "I won't remember this" | Assume everything Claude sees is logged | AI systems log prompts and responses for training and debugging. Never rely on "temporary" context. |
| Forgetting terminal scrollback captures secrets | Clear scrollback after working with secrets: `clear && printf '\033[2J\033[3J\033[1;1H'` | Terminal scrollback is searchable text. Screen sharing or screenshots can leak secrets from history. |
| Running `git add -A` without checking staged files | Always run `git status` before `git add`, or stage files explicitly | Easy to accidentally stage .env if it was created after .gitignore was committed. |
| Storing secrets in browser password manager | Use dedicated secret manager (1Password, Bitwarden) with separate vault for dev secrets | Browser password managers sync across devices, may appear in search suggestions, easier to accidentally paste. |

---

## 7. REAL CASE — Production Story

**Scenario**: Susan is a senior mobile developer at a fintech startup in Saigon. She's building a Kotlin Multiplatform expense tracking app that integrates with VNPay and MoMo for payment processing. The app needs to handle sensitive payment credentials for both test and production environments.

**Problem**: Susan stores the configuration in .env at project root:

```bash
# .env (gitignored but readable by Claude)
VNPAY_HASH_SECRET=sk-REAL-vnpay-production-hash-a8f9e2b1c4d5
VNPAY_TMN_CODE=REALVNPAY12345
MOMO_PARTNER_CODE=MOMO_REAL_PARTNER_XYZ789
MOMO_ACCESS_KEY=AKIAREALMOMOKEY123456
MOMO_SECRET_KEY=sk-REAL-momo-secret-production-x1y2z3
```

She asks Claude Code: "Generate the PaymentConfigLoader.kt class that loads VNPay and MoMo configuration from environment variables."

Claude helpfully reads the .env file to "understand the configuration structure" and generates:

```kotlin
// PaymentConfigLoader.kt - GENERATED BY CLAUDE CODE
object PaymentConfigLoader {
    val vnpayConfig = VNPayConfig(
        hashSecret = "sk-REAL-vnpay-production-hash-a8f9e2b1c4d5", // ❌ LEAKED!
        tmnCode = "REALVNPAY12345" // ❌ LEAKED!
    )

    val momoConfig = MoMoConfig(
        partnerCode = "MOMO_REAL_PARTNER_XYZ789", // ❌ LEAKED!
        accessKey = "AKIAREALMOMOKEY123456", // ❌ LEAKED!
        secretKey = "sk-REAL-momo-secret-production-x1y2z3" // ❌ LEAKED!
    )
}
```

Susan catches this during code review before committing. But what if she hadn't? The production payment credentials would have been:
1. Hardcoded in Kotlin source
2. Committed to git history
3. Pushed to GitHub
4. Potentially exposed in pull request diffs
5. Searchable by GitHub's code search (if repo goes public)

Even worse: the secrets are now in Claude's context, logged on Anthropic's servers, potentially used in model training data.

**Solution**: The .env.example workflow prevents this entirely.

Susan implements the four-layer defense:

**Layer 1 - Context Prevention:**
```bash
# .env.example (SAFE - committed to git, Claude can read)
# VNPay configuration (https://sandbox.vnpayment.vn/apis/docs/)
VNPAY_HASH_SECRET=your_vnpay_hash_secret_here
VNPAY_TMN_CODE=your_vnpay_terminal_code_here

# MoMo configuration (https://developers.momo.vn)
MOMO_PARTNER_CODE=your_momo_partner_code_here
MOMO_ACCESS_KEY=your_momo_access_key_here
MOMO_SECRET_KEY=your_momo_secret_key_here
```

**Layer 2 - File Protection:**
```bash
# .gitignore
.env
.env.local
.env.production
*.local
```

**Layer 3 - Detection Hook:**
```bash
# .git/hooks/pre-commit
#!/bin/bash
gitleaks protect --staged --verbose
```

**Layer 4 - Safe Prompt:**
New Claude Code prompt:
```
Read .env.example and generate PaymentConfigLoader.kt that:
1. Loads each environment variable using System.getenv()
2. Throws descriptive error if required variable is missing
3. Provides type-safe access to all config values
4. Supports both production and test environments

Do NOT read .env directly. Only use .env.example as the template for variable names.
```

**Generated code (SAFE):**
```kotlin
// PaymentConfigLoader.kt - SAFE VERSION
object PaymentConfigLoader {
    private fun requireEnv(key: String): String {
        return System.getenv(key)
            ?: throw IllegalStateException("Missing required environment variable: $key")
    }

    val vnpayConfig by lazy {
        VNPayConfig(
            hashSecret = requireEnv("VNPAY_HASH_SECRET"),
            tmnCode = requireEnv("VNPAY_TMN_CODE")
        )
    }

    val momoConfig by lazy {
        MoMoConfig(
            partnerCode = requireEnv("MOMO_PARTNER_CODE"),
            accessKey = requireEnv("MOMO_ACCESS_KEY"),
            secretKey = requireEnv("MOMO_SECRET_KEY")
        )
    }
}
```

**Result**:
- No secrets in Claude's context
- No secrets in generated code
- No secrets in git history
- Secrets loaded at runtime from environment
- Clear error messages if secrets are missing
- Safe to commit, safe to share in PR reviews

Susan's payment integration is secure. She can work with Claude Code without fear of credential leaks.

Susan's payment integration is secure. She can work with Claude Code without fear of credential leaks.

**Bonus**: When the team needs to rotate VNPay credentials (quarterly security requirement), they only need to update the .env file and restart the service. No code changes, no git commits, no Claude involvement.

---

> **Next**: [Module 2.5: System Control & Monitoring](../05-system-control/) →
