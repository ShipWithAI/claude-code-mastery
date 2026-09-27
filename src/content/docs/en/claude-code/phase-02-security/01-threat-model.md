---
title: 'Threat Model — Understanding What Claude Code Can Access'
description: 'Understand what Claude Code can access on your system, recognize attack scenarios, and assess your risk exposure.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 2.1: Threat Model — Understanding What Claude Code Can Access

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 1.3 (Context Window Basics)
>
> **Outcome**: Understand what Claude Code can access, recognize real attack scenarios, and assess
> your own risk exposure

---

## 1. WHY — Why This Matters

Claude Code runs shell commands **as your user account**. If your terminal can delete files or read
`~/.ssh/id_rsa`, so can Claude Code — that's the design, not a bug. The same power that refactors
your codebase can also accidentally (or maliciously) leak AWS credentials, commit secrets to a
public repo, or run a destructive command. Before using it for anything real, know what's at risk.

---

## 2. CONCEPT — Core Ideas

### The Fundamental Truth

**Claude Code runs commands with YOUR user permissions.** No sandbox by default (Module 2.3 covers
the opt-in one) — a Bash command it runs is identical to typing it: read, write, delete, execute,
network, anything your user can do.

### Files at Risk (Assume Claude Code CAN Access These)

| Location | What's There | Risk Level |
|----------|--------------|------------|
| `~/.ssh/` | SSH private keys | **CRITICAL** — full server access |
| `~/.aws/` | AWS credentials | **CRITICAL** — cloud account takeover |
| `~/.env`, `.env` | API keys, secrets | **CRITICAL** — service access |
| `~/.netrc` | Plain-text credentials | **CRITICAL** — auth bypass |
| Browser profiles | Cookies, saved passwords | **CRITICAL** — session hijacking |
| `~/.gnupg/` | GPG private keys | **CRITICAL** — signing keys |
| `~/.gitconfig`, `~/.npmrc` | Git/npm tokens | **HIGH** — repo/publish access |
| `~/.*_history` | Command history | **MEDIUM** — may contain secrets |

### The Access Rings Model

```mermaid
graph TD
    subgraph OUTER["SYSTEM (Dangerous)"]
        subgraph MIDDLE["HOME DIRECTORY (Risky)"]
            subgraph INNER["PROJECT (Intended)"]
                A["Your project files<br/>src/, package.json, etc."]
            end
            B["~/.ssh/, ~/.aws/<br/>~/.env, ~/.config/"]
        end
        C["/etc/, /var/<br/>System files"]
    end
    style INNER fill:#c8e6c9,stroke:#2e7d32
    style MIDDLE fill:#fff3e0,stroke:#ef6c00
    style OUTER fill:#ffcdd2,stroke:#c62828
```

**INNER (green)**: your project, where Claude should operate. **MIDDLE (orange)**: your home
directory — reachable, holds secrets. **OUTER (red)**: system files, OS-protected unless root.

### Bash-Tool vs. File-Tool Access

Two gates, two tools:

- **File tools (Read/Grep/Glob) — VERIFIED**: no prompt inside your working directory (the same
  boundary that limits writes: "Claude has access to files in the directory where you launched
  it" by default). Outside it, Claude Code "asks you before reading paths outside this boundary."
  Tested live: reading `~/.zshrc` was refused — "permission to access files outside the project
  directory ... hasn't been granted."
- **Bash tool — VERIFIED, and this is the surprise**: "Claude Code recognizes a built-in set of
  Bash commands as read-only and runs them without a permission prompt **in every mode**" — `ls`,
  `cat`, `head`, `tail`, `grep`, `find`, read-only `git`, and more — "except for a path that
  `permissions.blockReadsOutsideWorkingDirectories` fences." That default applies **outside** your
  working directory too: `cat ~/.ssh/id_rsa` via Bash is not fenced unless you turn that setting on
  or add a `deny`/`ask` rule for it yourself.
- Tested live: `cat sample.env` inside cwd ran silently, as documented. `ls -la ~/.ssh` outside cwd
  was **also** refused — this environment's own configuration (`blockReadsOutsideWorkingDirectories`
  or org policy), not the documented default. Verify your own install (Exercise 2).
- On v2.1.283+, the interactive starting mode is **auto** — a classifier reviews each action, so
  outcomes vary by judgment call, not just settings.json.
- **Sandbox (Module 2.3)** only constrains Bash ("applies only to Bash, PowerShell, and Monitor
  commands") — Read/Edit/Write stay governed by the permission system, not the sandbox.

**RECOMMENDED**: set `permissions.blockReadsOutsideWorkingDirectories` (or a `deny` rule) to fence
Bash reads by directory — it's opt-in, not automatic. Module 2.2 covers the full rule system.

### Attack Vectors

- **Accidental exposure**: Claude reads `.env` to "understand config" and echoes values into
  generated code; a misread path turns into `rm -rf`.
- **Prompt injection beyond typed text**: a file can hide instructions. It also arrives via
  **WebFetch** ("uses a separate context window to avoid injecting potentially malicious prompts" —
  real mitigation, not immunity for what it returns), **MCP servers/hooks** (whatever access you
  granted, no extra prompt), and **plugins/skills** (run with your session's tools).
- **Supply chain**: a hallucinated package name (`react-uils` vs `react-utils`) could be squatted.
- **Headless `-p` in an unfamiliar repo (Δ12)**: "a `-p` session runs the hooks in a project's
  `.claude/settings.json` and connects the servers in its `.mcp.json`, even in a folder you've
  never trusted" — right after cloning, before review.

Anthropic's containment model agrees: environment controls come first, model behavior second (S13).

### Blast Radius Analysis

| Scenario | Blast Radius | Recovery |
|----------|--------------|----------|
| Project directory only | Project files | Low — restore from git |
| Home directory, full access | All personal files, secrets | **HIGH** — rotate everything |
| Network access + secrets exposed | Accounts compromised | **CRITICAL** — assume breach |
| Devcontainer, no host mounts | Container data only | Low — rebuild |
| Devcontainer with `~/.claude` reachable | Same as home directory | **HIGH** |

---

## 3. DEMO — Step by Step

**Step 1: Bash, inside cwd**

```bash
$ claude -p "Run: cat sample.env"
```
```text
# Output may vary
`sample.env` contains one line:
test content
```
Zero prompt — the read-only allowlist doesn't distinguish `sample.env` from any other file.

**Step 2: Read tool, outside cwd**

```bash
$ claude -p "Use the Read tool to read ~/.zshrc"
```
```text
# Output may vary
I couldn't read ~/.zshrc because permission to access files outside the project
directory (/Users/<you>/cc-lab) hasn't been granted. ... Add a rule or start
with --add-dir ~.
```

**Step 3**: `claude -p "Run: ls -la ~/.ssh"` — Bash, outside cwd. Per docs this should run
**without** a prompt — it was refused in this account, meaning a local
`blockReadsOutsideWorkingDirectories`/deny rule fences it (CONCEPT). Check your own settings.

**Step 4**: `git status --porcelain` and `cat .gitignore` — is `.env` present but **not** ignored?

**Step 5**: `/exit` and reflect.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Audit Your Sensitive Files

**Goal**: Inventory files with secrets (run yourself, not through Claude Code), rate each:

```bash
$ ls -la ~/.ssh/ ~/.aws/ ~/.config/
$ cat ~/.netrc 2>/dev/null; cat ~/.npmrc 2>/dev/null; cat ~/.gitconfig
$ find ~ -maxdepth 3 \( -name ".env" -o -name "credentials*" \) 2>/dev/null
```

<details>
<summary>💡 Hint</summary>

Don't forget `~/.docker/config.json`, `~/.kube/config`, browser profile directories.

</details>

<details>
<summary>✅ Solution</summary>

```text
CRITICAL: ~/.ssh/id_rsa, ~/.aws/credentials, ~/.env (STRIPE_SECRET_KEY=sk-FAKE-DO-NOT-USE-xxxxxxxxxxxx)
HIGH: ~/.npmrc, ~/.gitconfig
MEDIUM: ~/.bash_history
```

</details>

---

### Exercise 2: Test the Bash-vs-File Boundary Yourself

**Goal**: Repeat DEMO Steps 1-3 in your project; record prompt / silent allow / silent deny.

<details>
<summary>💡 Hint</summary>

A silent allow on a credentials path means: add `permissions.deny` for it (Exercise 3).

</details>

<details>
<summary>✅ Solution</summary>

Compare against CONCEPT's table: a match confirms the documented default; a mismatch means a local
`blockReadsOutsideWorkingDirectories` or policy is fencing it.

</details>

---

### Exercise 3: Create Protection Measures

**Goal**: `permissions.deny` is the real mechanism — `.gitignore` isn't.

**Instructions**:
1. Add to `~/.claude/settings.json` (user-level, every project):
```json
{ "permissions": { "deny": ["Read(~/.ssh/**)", "Read(~/.aws/**)", "Read(./.env)", "Read(**/*.pem)"] } }
```
2. Ask Claude to read a denied path — must be **blocked**, not just prompted.
3. Never start Claude Code in `~`; use a devcontainer for untrusted work.

<details>
<summary>💡 Hint</summary>

`chmod 600` still lets your user — and Claude Code — read the file. Not real protection.

</details>

<details>
<summary>✅ Solution</summary>

`permissions.deny` covers Claude's file tools and Bash's `cat`/`head`/`tail`/`sed`/`tee` — not
`grep -r pattern .` or a script that opens the file itself. That's the blast radius of relying on
it alone. For OS-level enforcement, add the sandbox's `denyRead`/`sandbox.credentials` (Module 2.3).

</details>

---

## 5. CHEAT SHEET

| Path | Action |
|------|--------|
| `~/.ssh/`, `~/.aws/` | `permissions.deny`, never let Claude read |
| `~/.env`, `.env` | Keep out of context (Module 2.4) |
| `~/.gitconfig`, `~/.npmrc` | Review for embedded credentials |

### Permission Response Guide

| Claude Wants To Run | Your Response |
|---------------------|---------------|
| `cat ~/.ssh/*`, `cat ~/.aws/*` | **DENY** |
| `rm -rf` anything | Read carefully |
| `curl`, `wget`, `git push` | Check the target/staged files |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|-------------------|
| Assuming Claude Code is sandboxed by default | Full access to anything your terminal reaches. |
| Assuming the Read-tool cwd boundary also fences Bash | It doesn't — read-only Bash runs outside cwd too unless `blockReadsOutsideWorkingDirectories` is set. |
| Trusting Claude's judgment on what's "safe" | `cat config.json` looks innocent but can expose secrets. |
| Thinking `.gitignore` protects you from Claude | It only affects git; Claude can still read and echo those files. |
| Assuming `permissions.deny` blocks every read path | It misses `grep -r` and scripts that open files themselves — add the sandbox too. |
| Ignoring prompt injection outside typed text | A fetched page, MCP server, or plugin can steer Claude with no typing. |
| Running `claude -p` in a repo you just cloned | Runs its hooks and `.mcp.json` with no trust dialog. |

---

## 7. REAL CASE — Production Story

**Scenario**: Lan, a backend developer in Ho Chi Minh City, asked Claude to scaffold a Docker
Compose config. Her ungitignored `.env` held credentials shaped like these fakes:

```text
DATABASE_URL=postgres://admin:FAKE-PASSWORD-123@db.example.com:5432/prod
AWS_ACCESS_KEY_ID=AKIAFAKEDONOTUSE12345
```

Claude read `.env` directly and hardcoded the values into the generated file. Lan skimmed it,
thought it "looked correct," and pushed to a repo she thought was private — it wasn't. Scanners
found the AWS key in 8 minutes; crypto miners in 20. By morning: **$2,847** in EC2 charges.

**Prevention**: `.env` in `.gitignore`; never let Claude read `.env` directly — describe variable
names instead (Module 2.4); grep generated files for `sk-`/`AKIA` before commit; set billing alerts.

Lan rotated every credential and now treats Module 2.4's workflow as non-negotiable.

---

> **Next**: [Module 2.2: Permission System Deep Dive](../02-permission-system/) →
