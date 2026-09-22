---
title: 'System Control — Advisory Rules vs Enforced Controls'
description: 'Turn a CLAUDE.md security rule into one enforced control — deny rule plus PreToolUse hook — and verify it blocks.'
verified: 2026-09-23
claude_version: 2.1.280
---

# Module 2.5: System Control — Advisory Rules vs Enforced Controls

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 2.4 (Secret Management)
>
> **Outcome**: You can tell an advisory rule from an enforced control, build one enforced control
> end to end, and show it blocking a real violation.

---

## 1. WHY — Why This Matters

Your `CLAUDE.md` says `NEVER read .env`. Your team agreed. It is in the repo, reviewed in a pull
request. Then a build script Claude ran printed the key anyway. Nobody was careless — the rule was
never a control. Phase 2 gave you five layers; this module is the one habit that makes them real:
**every rule you rely on gets a control behind it, and you watch the control block something.**

---

## 2. CONCEPT — Core Ideas

### Advisory vs enforced

An **advisory** rule shapes what Claude *tries* to do: `CLAUDE.md`, prompts, skills. An
**enforced** control decides what Claude *can* do, regardless of the model: permission rules,
hooks, sandbox, managed settings. The docs draw the line: *"Permission rules are enforced by
Claude Code, not by the model. Instructions in your prompt or `CLAUDE.md` shape what Claude tries
to do, but they don't change what Claude Code allows."* Anthropic's own framing is the same — a
skill is *"a control, though an advisory one"*, while *"a hook is the deterministic layer behind
it"* (S3).

Advisory rules are still worth writing. They catch the honest mistake and document intent. They
just cannot be your only answer to "what stops this?"

### The five layers, and what each one costs you when it fails

| Layer | Module | If it fails | Caught by |
|---|---|---|---|
| 1 Threat awareness | 2.1 | you don't see the risk | the permission rule |
| 2 Permissions | 2.2 | a rule's text doesn't match the command | the sandbox |
| 3 Sandbox | 2.3 | command runs outside the sandbox | secrets not on disk |
| 4 Secrets | 2.4 | a secret reaches the context | the audit |
| 5 System control | 2.5 | nobody audits | full exposure |

You need several failures at once for a disaster — which is exactly why removing a layer because
"the others will catch it" is how teams end up with one. Anthropic contains agents at the
environment layer first and the model layer second (S13); do the same, and treat every advisory
rule as the *top* of a stack, not the whole stack.

### Humans stay accountable

Automation moves the work, not the responsibility: *"Humans remain accountable for every decision
that requires judgment."* (S3) A control you never tested is a decision you have not made.

> `(S3)`, `(S13)`: `docs/references/anthropic-sources.md`.

---

## 3. DEMO — Step by Step

One control, end to end: **no shell command in this project may read `.env`.** Lab: a scratch git
repo whose `.env` holds `API_KEY=sk-FAKE-DO-NOT-USE-xxxxxxxxxxxx`.

**Step 1: The enforced layer — a deny rule**

```bash
# docs: permissions#read-and-edit
mkdir -p .claude && cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": ["Bash(npm test:*)", "Read"],
    "deny": ["Read(./.env)", "Bash(git push --force:*)"]
  }
}
EOF
claude -p "Run exactly this bash command and report its raw output: cat .env" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I couldn't run `cat .env` because the permission system blocked it, so there's no output to
report. I didn't try reading the file another way.
```

Blocked — the tool result reads
`Permission to use Bash with command cat .env has been denied.`

**Step 2: Attempt the violation another way — and watch it succeed**

```bash
# docs: permissions#read-and-edit
claude -p "Run exactly this bash command and report its raw output: node -e \"console.log(require('fs').readFileSync('.env','utf8'))\"" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I ran the command and it printed this:

API_KEY=sk-FAKE-DO-NOT-USE-xxxxxxxxxxxx
```

That is your blast radius, and the docs predict it: Read deny rules *"don't apply to … arbitrary
subprocesses that read or write files indirectly, like a Python or Node script that opens files
itself."* The rule was real. Its scope was narrower than you assumed — which you only learn by
trying.

**Step 3: Close the gap with a `PreToolUse` hook**

```bash
# docs: hooks#pretooluse
mkdir -p .claude/hooks && cat > .claude/hooks/block-env-reads.sh << 'EOF'
#!/usr/bin/env bash
# PreToolUse/Bash: deny any shell command whose text mentions .env,
# including subprocesses the Read deny rule cannot see.
cmd=$(jq -r '.tool_input.command // empty')
if printf '%s' "$cmd" | grep -q '\.env'; then
  echo "Blocked by project policy: no shell command may touch .env. Use .env.example." >&2
  exit 2
fi
exit 0
EOF
chmod +x .claude/hooks/block-env-reads.sh
```

Register it in the same `.claude/settings.json`, beside `permissions`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/block-env-reads.sh" }
        ]
      }
    ]
  }
}
```

Exit 2 is the blocking code, and a hook *"stops the tool call before permission rules are
evaluated"* — so it holds in every permission mode.

**Step 4: Re-run the violation — verify the block**

```bash
# docs: hooks#pretooluse
claude -p "Run exactly this bash command and report its raw output: node -e \"console.log(require('fs').readFileSync('.env','utf8'))\"" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I didn't get any output. The project's hook (`.claude/hooks/block-env-reads.sh`) blocked the
command before it ran and returned this error:

PreToolUse:Bash hook error: [$CLAUDE_PROJECT_DIR/.claude/hooks/block-env-reads.sh]: Blocked by
project policy: no shell command may touch .env. Use .env.example.
```

Same command, same key, different outcome. **This output is the deliverable** — not the config.

**Step 5: Audit, then make it a habit**

`/permissions` → the **Deny** tab shows what is loaded and which file each rule came from:

```text
# Output may vary
   Permissions  Recently denied   Allow   Ask   Deny   Auto mode   Workspace

   Claude Code will always reject requests to use denied tools.

     1. Add a new rule…
     2. Bash(git push --force:*)
     3. Read(./.env)

   ←/→ to switch · ↓ to select · Esc to cancel
```

Then run the checklists you keep beside the keyboard — before, during, after a session, and
weekly — from
[`templates/security-checklists.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/security-checklists.md).
Add one weekly line: **re-run Step 4.** A control that stops blocking is worse than none, because
you are still trusting it.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Convert one advisory rule

**Goal**: take the scariest `NEVER …` line in your `CLAUDE.md` and give it a control.

**Instructions**: write the deny rule; run the violating command and confirm the block; find one
spelling of the command the rule misses; close that with a `PreToolUse` hook; re-run.

**Expected result**: a transcript where the violation is refused, and a note of what is still not
covered.

<details>
<summary>💡 Hint</summary>

Rules match the command *text*. Ask: how else could this be written? `/usr/bin/x`, `sh -c '…'`,
`git -C . …`, a script that opens the file itself.

</details>

<details>
<summary>✅ Solution</summary>

```json
{
  "permissions": { "deny": ["Read(./.env)", "Bash(git push --force:*)"] },
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash",
        "hooks": [ { "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/block-env-reads.sh" } ] }
    ]
  }
}
```

Keep the `CLAUDE.md` line too: it tells teammates *why* the control exists. Start from
[`templates/claude-md-security-example.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/claude-md-security-example.md).

</details>

---

### Exercise 2: Audit a repo in ten minutes

**Goal**: score one repo on the five layers and write down what is advisory-only.

**Instructions**: for each layer, name the control and the command that proves it works; mark any
layer whose only evidence is a `CLAUDE.md` sentence as **unverified**.

**Expected result**: a short table where every "protected" row cites a command you ran.

<details>
<summary>✅ Solution</summary>

A row is only green when you can paste the refusal. For onboarding a teammate into this, hand them
[`templates/onboarding-security.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/onboarding-security.md)
— its sandbox step is superseded by Module 2.3, which owns sandboxing.

</details>

---

## 5. CHEAT SHEET

| Control | Where | Enforced? |
|---|---|---|
| `CLAUDE.md` rule | repo root | No — advisory |
| `permissions.deny` | `.claude/settings.json` | Yes, on matching command text and paths |
| `PreToolUse` hook, exit 2 | `.claude/settings.json` + script | Yes, before permission rules |
| Sandbox | `/sandbox`, `sandbox.enabled` | Yes, at the OS level (Module 2.3) |
| `disableBypassPermissionsMode` | managed settings | Yes, fleet-wide |

| Verify | Command |
|---|---|
| what rules are loaded | `/permissions` |
| a deny rule holds | re-run the violating command, read the refusal |
| a hook fires | re-run it, look for `PreToolUse:Bash hook error:` |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Treating `CLAUDE.md` as enforcement | It is advisory. Pair every `NEVER` with a deny rule or hook |
| Shipping a control you never triggered | Run the violation once; keep the refusal in the PR |
| One deny rule and calling the path closed | Try the other spellings; a subprocess needs a hook |
| Governance nobody can finish | Keep the daily checklist under two minutes; automate the rest |
| Auditing once, at setup | Re-run the violation weekly; controls rot silently |
| Copying another team's policy verbatim | Their threat model is not yours. Start from the template, then cut |

---

## 7. REAL CASE — Production Story

**Scenario**: Khoa leads five developers in Da Nang building a logistics SaaS. They adopted Claude
Code and shipped faster. In three months they also had three incidents: a test Stripe key
committed to git and found two weeks later; an `rm -rf` approved without reading, which took out a
project directory; and a `cat .env` during a screen-shared demo that exposed production
credentials to twelve people.

**Problem**: after the third, Khoa found their `CLAUDE.md` already forbade all three. The rules
existed. Nothing enforced them.

**Solution**: one weekend, each rule got a control — `permissions.deny` for `.env` and force
pushes, a `PreToolUse` hook for the spellings the rules missed, gitleaks in `pre-commit`, and a
two-minute checklist. Every control was signed off only after someone watched it refuse a real
command.

**Result**: no further incidents in the following three months. The change that mattered was not
the config; it was the rule that a control counts only once the team has seen it block something.
A customer's due-diligence question — "how do you stop AI tools touching our data?" — became a
two-minute demo instead of a paragraph of policy.

---

> **Next**: [Module 3.1: Reading & Understanding Codebases](../../phase-03-core-workflows/01-reading-codebases/) →
