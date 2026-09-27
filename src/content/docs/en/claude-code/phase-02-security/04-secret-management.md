---
title: 'Secret Management — Keeping Your Keys Away from Claude Code'
description: 'Prevent credential leaks in Claude Code sessions with secret management workflows and .env protection.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 2.4: Secret Management — Keeping Your Keys Away from Claude Code

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 2.3 (Sandbox Environments)
>
> **Outcome**: A complete secret management workflow that prevents credentials from leaking through
> Claude Code into your codebase or external systems

---

## 1. WHY — Why This Matters

You've sandboxed Claude Code and restricted permissions. Then you ask it to "generate the payment
module" and it reads your `.env` file — now your VNPay hash secret is in Claude's context, sent to
your model provider regardless of the sandbox, one `git commit` from GitHub's public search.
Sandboxes stop filesystem damage, not context leaks. This module breaks the leak chain first.

---

## 2. CONCEPT — Core Ideas

### The Secret Leak Chain

```mermaid
graph LR
    A[".env file<br/>Contains secrets"] --> B["Claude reads file<br/>Secrets in context"]
    B --> C["Sent to model provider<br/>Processed per data-usage terms"]
    C --> D["Claude generates code<br/>Hardcoded secrets"]
    D --> E["Git commit<br/>Secrets in history"]
    E --> F["Push to GitHub<br/>💀 PUBLIC EXPOSURE"]
    style A fill:#ffcdd2
    style F fill:#ffcdd2
```

### Four Defense Layers

| Layer | What It Does | Cuts Chain At | Example Tools |
|-------|--------------|---------------|---------------|
| **1: Context Prevention** | Keep secrets out of Claude's context | A → B | `.env.example`, prompt discipline |
| **2: File Protection** | Block secret files from being read | A → B | `permissions.deny`, `sandbox.credentials` |
| **3: Rotation Discipline** | Assume exposed secrets are compromised | After B | AWS Secrets Manager, Vault |
| **4: Detection & Monitoring** | Catch leaks before damage | D → E, E → F | gitleaks, trufflehog, git hooks |

### Layer 1: Context Prevention

**Hard rules**: never paste secrets into prompts; never ask Claude to read `.env` directly; never
put credentials in `CLAUDE.md`; use placeholders ("create config using `${DATABASE_URL}`").

**The `.env.example` pattern**: keep `.env` (real secrets, gitignored, never read by Claude) and
`.env.example` (variable names + placeholders, committed, safe for Claude to read). Claude reads the
example to learn structure, generates `process.env.VAR_NAME` code, never sees real values.

### Layer 2: File Protection

`.gitignore` prevents commits, not reads — Claude can still open a gitignored `.env`. Two blocks
stack instead, and neither is complete alone:

- **`permissions.deny`** (`.claude/settings.json`) — Claude Code has no gitignore-style ignore
  mechanism; this is the real, but partial, block:
  ```json
  { "permissions": { "deny": ["Read(./.env)", "Read(./.env.*)", "Read(~/.ssh/**)"] } }
  ```
  It covers Claude's file tools and Bash's `cat`/`head`/`tail`/`sed`/`tee` — not `grep -r pattern .`
  (reads without naming the file) or a script that opens the file itself. That gap is the blast
  radius of relying on `deny` alone.
- **`sandbox.credentials`** (Module 2.3, sandboxed Bash commands only — not Read/Edit/Write) — masks
  or denies specific files/env vars for OS-level enforcement on top of the gap above:
  ```json
  {"sandbox":{"credentials":{"files":[{"path":"./.env","mode":"deny"}]}}}
  ```

### Layer 3: Rotation Discipline

Assume anything Claude has seen is compromised:

| Priority | Secret Type | Timeframe | Why Urgent |
|----------|-------------|-----------|------------|
| 🔴 IMMEDIATE | Payment keys (VNPay, MoMo, Stripe) | Within 1 hour | Direct financial loss |
| 🔴 IMMEDIATE | Cloud credentials (AWS, GCP, Azure) | Within 1 hour | Crypto mining, exfiltration |
| 🟡 HIGH | Third-party API keys | Within 24 hours | Service abuse, quota exhaustion |
| 🟡 HIGH | Database passwords | Within 24 hours | Data breach |
| 🟢 MEDIUM | Internal service tokens | Within 1 week | Limited blast radius |

Tools: AWS Secrets Manager (auto-rotation), HashiCorp Vault (centralized), manual scripts otherwise.

### Layer 4: Detection & Monitoring

**Pre-commit hooks** (gitleaks) scan staged files — last line of defense before history. **History
scanning** (gitleaks, trufflehog) catches what's already committed. **Abuse monitoring**: billing
alerts, rate-limit alerts, failed-auth logs.

### Data Handling — No Overclaim

Isolation is not retention. Per Anthropic's data-usage policy: commercial plans (Team, Enterprise,
API) are **not** used to train models unless you opt in (30-day retention); consumer plans
(Free/Pro/Max) choose — 5 years if opted in, 30 days if not. Don't claim secrets are "used for
training" by default — that's plan-dependent. The real risk is exposure via generated code and git
history, not training data.

---

## 3. DEMO — Step by Step

**Step 1: Project + fake secrets**
```bash
mkdir payment-demo && cd payment-demo && git init
cat > .env << 'EOF'
VNPAY_HASH_SECRET=sk-FAKE-DO-NOT-USE-vnpay-hash-secret-12345
MOMO_ACCESS_KEY=AKIAFAKEDONOTUSE12345
DATABASE_URL=postgresql://user:FAKE-PASSWORD-DO-NOT-USE@localhost:5432/payment_db
EOF
```

**Step 2: `.env.example`** (no secrets, safe for Claude)
```bash
cat > .env.example << 'EOF'
VNPAY_HASH_SECRET=your_vnpay_hash_secret_here
MOMO_ACCESS_KEY=your_momo_access_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/payment_db
EOF
```

**Step 3: `.gitignore`**
```bash
printf '.env\n.env.local\nnode_modules/\n' > .gitignore
```

**Step 3b: Block direct reads with `permissions.deny`, then verify it**
```bash
echo '{ "permissions": { "deny": ["Read(./.env)"] } }' > .claude/settings.local.json
claude -p "Read .env and print it" --allowedTools "Read"
```
```text
# Output may vary
I couldn't read .env because your Claude Code permission settings block
access to that path. I didn't try other ways in, like cat through Bash,
since that would get around the rule.
```
The rule doesn't cover everything — see the CONCEPT Layer 2 gap above.

**Step 4: Install gitleaks and check the version**
```bash
brew install gitleaks   # macOS; see github.com/gitleaks/gitleaks/releases for other platforms
gitleaks version
```
```text
# Output may vary
8.30.1
```

**Step 5: Pre-commit hook**
```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
gitleaks git --pre-commit --staged --verbose
EOF
chmod +x .git/hooks/pre-commit
```

**Step 6: Test the hook — honestly**

This course's `sk-FAKE-DO-NOT-USE-...` placeholders are low-entropy and **don't trigger** gitleaks'
`generic-api-key` rule (tested: zero findings). For a real block, use a random high-entropy
placeholder instead — not a real key, just shaped like one:
```bash
echo "const apiKey = '$(openssl rand -hex 20)';" > leaked.js
git add leaked.js
git commit -m "test"
```
```text
# Output may vary — banner/log lines omitted with …
…
Finding:     const apiKey = '<40 random hex chars from openssl>'
Secret:      5a29… (redacted — not a real key, generated locally for this demo)
RuleID:      generic-api-key
Entropy:     3.715957
File:        leaked.js
…
```
Exit code `1` — the commit is blocked. Clean up: `git reset HEAD leaked.js && rm leaked.js`.

**Step 7: Ask Claude the safe way**
```text
Read .env.example and generate a TypeScript config loader using process.env.
Do NOT read .env directly.
```
Verify: `grep -r "FAKE" . --include="*.ts"` should return nothing.

**Step 8: Periodic full-history audit** — `gitleaks detect` still runs but has been hidden from
`gitleaks --help` since v8.19.0; use the documented subcommands instead, `git` and `dir`:
```bash
gitleaks git --verbose      # full commit history
gitleaks dir . --verbose    # working tree only, no git needed
```
```text
# Output may vary
no leaks found
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: `.env.example` for an Existing Project

**Goal**: Convert `.env` to the safe pattern.

**Instructions**: `sed 's/=.*/=your_value_here/' .env > .env.example`, add hints, confirm `.env` is
gitignored, commit `.env.example`.

<details>
<summary>💡 Hint</summary>

`grep -E '^[A-Z_]+=' .env | cut -d'=' -f1` lists just the variable names if you want to build the
template manually.

</details>

<details>
<summary>✅ Solution</summary>

```bash
sed 's/=.*/=your_value_here/' .env > .env.example
grep -q '^\.env$' .gitignore || echo '.env' >> .gitignore
git add .env.example .gitignore && git commit -m "Add .env.example"
```

</details>

---

### Exercise 2: Install and Test Detection

**Goal**: Verify gitleaks blocks a commit.

**Instructions**: Wire the pre-commit hook (DEMO Step 5), commit a random high-entropy string (not
`sk-FAKE-...` — won't fire), confirm it's blocked, then confirm a normal commit succeeds.

<details>
<summary>💡 Hint</summary>

If nothing fires, check `gitleaks --help` for your installed version's exact subcommands before
assuming the hook is broken.

</details>

<details>
<summary>✅ Solution</summary>

`gitleaks git --pre-commit --staged --verbose` exits `1` and prints a `Finding:` block on the random
secret; a plain README commit exits `0`.

</details>

---

### Exercise 3: Audit History, Plan Rotation

**Goal**: Scan a real project's full history and, if anything turns up, write a rotation plan.

**Instructions**: `gitleaks git --verbose --report-format=json --report-path=audit-report.json`.
Classify each finding by the rotation table (Layer 3); if clean, record the date for next quarter.

<details>
<summary>💡 Hint</summary>

`gitleaks dir ./src --verbose` scans a subdirectory only, without needing git history.

</details>

<details>
<summary>✅ Solution</summary>

A finding becomes a rotation task per the Layer 3 table; after rotating, strip it from history with
`git filter-repo --path <file> --invert-paths` and force-push — coordinate with your team first.

</details>

---

## 5. CHEAT SHEET

### Safe vs Unsafe Prompts

| ❌ Unsafe | ✅ Safe |
|-----------|---------|
| "Read .env and generate config" | "Read .env.example and generate config using process.env" |
| Paste a key in the prompt | Reference by name: "use `${API_KEY}` from environment" |
| Secrets in `CLAUDE.md` | Variable names and doc links only |

### Detection Tools

| Purpose | Command |
|---------|---------|
| Pre-commit scan | `gitleaks git --pre-commit --staged` |
| Full history audit | `gitleaks git --verbose` |
| Working tree only | `gitleaks dir . --verbose` |
| Deep history (trufflehog) | `trufflehog git file://.` |

### Rotation Priority

| Priority | Type | Timeframe |
|----------|------|-----------|
| 🔴 IMMEDIATE | Payment/cloud keys | 1 hour |
| 🟡 HIGH | API keys, DB passwords | 24 hours |
| 🟢 MEDIUM | Internal tokens | 1 week |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Thinking `.gitignore` protects you from Claude | It only stops commits — Claude can still read and echo those files. |
| Rotating only the leaked key | Rotate everything in the same credential system — assume compromise. |
| Real secrets in `docker-compose.yml` | Use `${VARIABLE}` references; the file is often committed too. |
| Assuming your fake secret triggers gitleaks | Low-entropy `FAKE`/`EXAMPLE` strings often don't — test with a real scan. |
| Assuming `permissions.deny` blocks every read | It misses `grep -r` and scripts that open the file — add `sandbox.credentials`. |
| `git add -A` without checking | Run `git status` first — easy to stage a `.env` made after `.gitignore`. |

---

## 7. REAL CASE — Production Story

**Scenario**: Chi, a mobile developer at a fintech startup in Saigon, builds a Kotlin Multiplatform
app integrating VNPay and MoMo. Her `.env` holds credentials shaped like:
```text
VNPAY_HASH_SECRET=sk-FAKE-DO-NOT-USE-vnpay-production-hash-a8f9e2b1c4d5
MOMO_ACCESS_KEY=AKIAFAKEDONOTUSE-momo-key-123456
```

She asks Claude to generate `PaymentConfigLoader.kt` from environment variables. Claude reads `.env`
"to understand structure" and hardcodes the values into the generated file. Chi catches it in
review — otherwise the secrets would be in git history and a PR diff, searchable if the repo went
public.

**Solution**: four-layer defense — `.env.example` for Claude to read, `.gitignore` +
`permissions.deny` to block direct reads, gitleaks pre-commit as a last check, and a prompt saying
"do NOT read .env directly." `PaymentConfigLoader.kt` now calls `System.getenv("VNPAY_HASH_SECRET")`
and throws if missing — no value ever entered context.

This mirrors Anthropic's principle for agents with real access: give every agent "a single-purpose
identity with the minimum permissions for its job" (S4) — Claude's job is writing the loader, not
holding secrets.

---

> **Next**: [Module 2.5: System Control & Monitoring](../05-system-control/) →
