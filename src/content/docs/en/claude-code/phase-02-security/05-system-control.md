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
> **Outcome**: You can tell an advisory rule from an enforced control, build one end to end, and
> show it blocking a real violation.

---

## 1. WHY — Why This Matters

Your `CLAUDE.md` says `NEVER read .env`. Your team agreed; it is in the repo, reviewed in a pull
request. Then a build script Claude ran printed the key anyway. Nobody was careless — the rule was
never a control. Phase 2 gave you five layers; this module is the habit that makes them real:
**every rule you rely on gets a control behind it, and you watch it block something.**

---

## 2. CONCEPT — Core Ideas

### Advisory vs enforced

An **advisory** rule shapes what Claude *tries* to do: `CLAUDE.md`, prompts, skills. An
**enforced** control decides what Claude *can* do: permission rules, hooks, sandbox, managed
settings. The docs draw the line: *"Permission rules are enforced by Claude Code, not by the
model. Instructions in your prompt or `CLAUDE.md` shape what Claude tries to do, but they don't
change what Claude Code allows."* Anthropic's framing matches: a skill is *"a control, though an
advisory one"*, *"a hook is the deterministic layer behind it"* (S3).

Advisory rules still earn their place — they catch the honest mistake and record intent. They just
cannot be your only answer to "what stops this?"

### The five layers, and what each one costs you when it fails

| Layer | If it fails | Caught by |
|---|---|---|
| 2.1 Threat awareness | you don't see the risk | the permission rule |
| 2.2 Permissions | a rule's text doesn't match the command | the sandbox |
| 2.3 Sandbox | command runs outside it | secrets not on disk |
| 2.4 Secrets | a secret reaches the context | the audit |
| 2.5 System control | nobody audits | full exposure |

A disaster needs several failures at once — which is why dropping a layer because "the others
will catch it" is how teams end up with one. Anthropic contains agents at the environment layer
first, the model layer second (S13). Treat an advisory rule as the *top* of a stack.

### Humans stay accountable

Automation moves the work, not the responsibility: *"Humans remain accountable for every decision
that requires judgment."* (S3) An untested control is a decision you never made.

> `(S3)`, `(S13)`: `docs/references/anthropic-sources.md`.

---

## 3. DEMO — Step by Step

One control, end to end: **no shell command here may read `.env`.** Lab: a scratch git repo whose
`.env` holds `API_KEY=sk-FAKE-DO-NOT-USE-xxxxxxxxxxxx`.

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

Blocked: `Permission to use Bash with command cat .env has been denied.`

**Step 2: Attempt the violation another way — and watch it work**

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
itself."* The rule was real; its scope was narrower than you assumed — which you learn only by
trying.

**Step 3: Narrow the gap with a `PreToolUse` hook**

```bash
# docs: hooks#pretooluse
mkdir -p .claude/hooks && cat > .claude/hooks/block-env-reads.sh << 'EOF'
#!/usr/bin/env bash
# PreToolUse/Bash: deny any shell command that names a .env file, including
# subprocesses the Read deny rule cannot see. Fail closed if jq is missing.
command -v jq >/dev/null || { echo "block-env-reads.sh needs jq" >&2; exit 2; }
cmd=$(jq -r '.tool_input.command // empty')
cmd=${cmd//.env.example/}   # templates stay readable
cmd=${cmd//.env.sample/}
if printf '%s' "$cmd" | grep -q '\.env'; then
  echo "Blocked by project policy: this command names a .env file. Use .env.example." >&2
  exit 2
fi
exit 0
EOF
chmod +x .claude/hooks/block-env-reads.sh
```

Two details worth copying: it **fails closed** when `jq` is missing — a hook that exits 0 because
a dependency vanished has silently stopped controlling — and it strips `.env.example` before
matching, so the remediation its own message recommends still works.

Register it in the same `.claude/settings.json`, beside the `permissions` you already have:

```json
{
  "permissions": { "…as in Step 1…" },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-env-reads.sh" }
        ]
      }
    ]
  }
}
```

Keep the `permissions` block: one file, so pasting only `hooks` deletes your rules. Exit 2 blocks,
and a hook *"stops the tool call before permission rules are evaluated"* — so an allow rule cannot
override it.

**Step 4: Re-run the violation — verify the block**

```bash
# docs: hooks#pretooluse
claude -p "Run exactly this bash command and report its raw output: node -e \"console.log(require('fs').readFileSync('.env','utf8'))\"" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I couldn't run it. A PreToolUse hook in this project blocked the command before it executed, so
there is no raw output to show you. The hook returned:

PreToolUse:Bash hook error: [${CLAUDE_PROJECT_DIR}/.claude/hooks/block-env-reads.sh]: Blocked by
project policy: this command names a .env file. Use .env.example.
```

Same command, same key, different outcome. **This output is the deliverable**, not the config.

Now verify what people assume. Re-run it with `--permission-mode acceptEdits` — blocked there
too. Then check the remediation is really open:

```bash
claude -p "Run exactly this bash command and report its raw output: cat .env.example" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I ran the command. Raw output:

API_KEY=your_api_key_here
```

**What this hook still does not stop.** It reads command *text*, like the deny rule it backs up,
so a computed path (`f=.en; cat ".${f}v"`) walks past it, and a harmless
`git commit -m "document .env vars"` is blocked by mistake. The layer that ignores what the
command *says* is the sandbox ([Module 2.3](../03-sandbox/)). Also: `disableAllHooks` turns hooks
off, and a project's `"disableAllHooks": false` overrides a `true` in your user settings — the
repo, not you, has the last word on whether your hooks run.

**Step 5: Audit, then make it a habit**

`/permissions` → the **Deny** tab shows what is loaded and where each rule came from.

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
you still trust it.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Convert one advisory rule

**Goal**: give the scariest `NEVER …` line in your `CLAUDE.md` a control.

**Instructions**: write the deny rule; run the violating command and confirm the block; find one
spelling of the command the rule misses; close that with a `PreToolUse` hook; re-run.
**First**: the step that *succeeds* prints the file into the transcript. Work on a scratch clone,
or put a dummy value in `.env`. Never test this against a live credential.

**Expected result**: a transcript where the violation is refused, plus a note of what is still
uncovered.

<details>
<summary>💡 Hint</summary>

Rules match command *text*. How else could it be written? `/usr/bin/x`, `sh -c '…'`,
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
          "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-env-reads.sh" } ] }
    ]
  }
}
```

Keep the `CLAUDE.md` line: it tells teammates *why* the control exists. Start from
[`templates/claude-md-security-example.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/claude-md-security-example.md).

</details>

---

### Exercise 2: Audit a repo in ten minutes

**Goal**: score a repo on the five layers and write down what is advisory-only.

**Instructions**: per layer, name the control and the command proving it works; mark any layer
whose only evidence is a `CLAUDE.md` sentence **unverified**.

**Expected result**: a table where every "protected" row cites a command you ran.

<details>
<summary>✅ Solution</summary>

A row is green only when you can paste the refusal. To onboard a teammate, hand them
[`templates/onboarding-security.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/onboarding-security.md)
— but skip its Step 5 entirely: the `sandbox.sh` it runs no longer ships, and Module 2.3 replaces
it.

</details>

---

## 5. CHEAT SHEET

| Control | Enforced? |
|---|---|
| `CLAUDE.md` rule | No — advisory |
| `permissions.deny` | Yes, on matching command text and paths |
| `PreToolUse` hook, exit 2 | Yes, before permission rules — but still command text |
| Sandbox (`/sandbox`, `sandbox.enabled`) | Yes, at the OS level (Module 2.3) |
| `{"permissions": {"disableBypassPermissionsMode": "disable"}}` | Yes, from any settings file — managed for a fleet, your own to lock yourself out |

| Verify | How |
|---|---|
| what rules are loaded | `/permissions` |
| a deny rule holds | re-run the violating command, read the refusal |
| a hook fires | re-run it, look for `PreToolUse:Bash hook error:` |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Treating `CLAUDE.md` as enforcement | Advisory. Pair every `NEVER` with a deny rule or hook |
| Shipping a control you never triggered | Run the violation; keep the refusal in the PR |
| One deny rule and calling the path closed | Try other spellings; a subprocess needs a hook |
| Governance nobody can finish | Daily checklist under two minutes; automate the rest |
| Auditing once, at setup | Re-run the violation weekly; controls rot silently |
| Copying another team's policy verbatim | Their threat model is not yours; start from the template |

---

## 7. REAL CASE — Production Story

**Scenario**: Khoa leads five developers in Da Nang building a logistics SaaS. Claude Code made
them faster — and brought three incidents in three months: a test Stripe key committed to git and
found two weeks later; an `rm -rf` approved without reading, which took out a project directory;
and a `cat .env` during a screen-shared demo that put production credentials in front of twelve
people.

**Problem**: after the third, Khoa found their `CLAUDE.md` already forbade all three. The rules
existed; nothing enforced them.

**Solution**: in one weekend each rule got a control — `permissions.deny` for `.env` and force
pushes, a `PreToolUse` hook for the spellings the rules missed, gitleaks in `pre-commit`, a
two-minute checklist. Nothing was signed off until someone watched it refuse a real command.

**Result**: no incidents in the next three months. What mattered was the rule that a control
counts only once the team has seen it block something — so a customer's due-diligence question
became a two-minute demo.

---

> **Next**: [Module 3.1: Reading & Understanding Codebases](../../phase-03-core-workflows/01-reading-codebases/) →
