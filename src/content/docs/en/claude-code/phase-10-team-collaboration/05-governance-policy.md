---
title: 'Governance & Policy'
description: 'Move AI governance from a policy document to enforced managed settings, OTel visibility, and ZDR.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 10.5: Governance & Policy

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 10.4 (Knowledge Sharing)
>
> **Outcome**: After this module, you will know how to enforce AI governance with managed
> settings instead of a policy document alone, monitor usage with OpenTelemetry, and know what
> Zero Data Retention does and doesn't cover.

---

## 1. WHY — Why This Matters

A policy document says "never send credentials to AI tools." It doesn't stop anyone — a `.env`
file gets read into context anyway, because nothing enforces the sentence. This module covers
governance that holds: settings a developer can't override, usage data an admin can actually see,
and a data-retention guarantee with a precise scope — not a memo restating what everyone already
knew.

---

## 2. CONCEPT — Core Ideas

### Governance areas and their enforcement layer

| Area | Written policy | Enforced mechanism |
|------|--------------|---------------|
| Access | "Who can use AI tools" | `forceLoginMethod`/`forceLoginOrgUUID` (managed) |
| Scope | "What code can AI touch" | `permissions.deny`/sandbox `denyRead` (Module 2.2, 2.3) |
| Secrets | "Never send credentials" | `sandbox.credentials`, a `Read`/`Bash` deny rule |
| Bypass mode | "Don't skip permission prompts" | `disableBypassPermissionsMode` (managed) |
| Visibility | "We review usage" | OpenTelemetry export + the analytics dashboard |
| Data retention | "We don't want data kept" | Zero Data Retention (Enterprise only, admin-enabled) |

### Managed settings — five-tier precedence

Highest to lowest — nothing lower overrides a higher tier:

1. **Managed settings** — file, MDM/registry policy, or server-managed from the admin console.
2. **Command line** — `--settings <file-or-json>`.
3. **Project local** — `.claude/settings.local.json`.
4. **Shared project** — `.claude/settings.json`.
5. **User** — `~/.claude/settings.json`.

The managed-settings **file** paths per OS (reference only — needs admin rights, out of scope for
this module's lab):

| OS | Path |
|---|---|
| macOS | `/Library/Application Support/ClaudeCode/managed-settings.json` |
| Linux / WSL | `/etc/claude-code/managed-settings.json` |
| Windows | `C:\Program Files\ClaudeCode\managed-settings.json` |

An optional `managed-settings.d/` directory merges every `*.json` inside it, alphabetically, after
the base file. Server-managed settings are fetched at startup and polled hourly; across multiple
admin sources, default order is remote → MDM/OS policy → managed file(s) → Windows HKCU registry.

### Managed-only keys

Only take effect from a managed source — setting them anywhere else does nothing:

`disableBypassPermissionsMode`, `allowManagedPermissionRulesOnly`, `allowManagedHooksOnly`,
`allowedMcpServers`/`deniedMcpServers`, `strictKnownMarketplaces`,
`forceLoginMethod`/`forceLoginOrgUUID`.

```json
{
  "permissions": {
    "deny": ["Read(./.env)", "Read(./secrets/**)"],
    "disableBypassPermissionsMode": "disable"
  },
  "allowManagedPermissionRulesOnly": true
}
```

Verify a real managed file with `/status` under **Setting sources**.

### Simulating the top tier without touching system files

Deploying a real managed-settings file needs admin rights — this module simulates it with
`claude --settings <file>`, tier 2 (command line), **above** project/user settings but still below
a real managed-settings file. It demonstrates a `deny` rule and `/status`'s output shape; it does
not replace the real managed tier in production, where a developer can't override it at all.

### OpenTelemetry — names to actually use

Enable with `CLAUDE_CODE_ENABLE_TELEMETRY=1`, pick exporters with `OTEL_METRICS_EXPORTER` /
`OTEL_LOGS_EXPORTER` (`console`, `otlp`, `prometheus`, `none`). Confirmed metric names:

`claude_code.session.count`, `claude_code.lines_of_code.count`, `claude_code.pull_request.count`,
`claude_code.commit.count`, `claude_code.cost.usage`, `claude_code.token.usage`,
`claude_code.code_edit_tool.decision`, `claude_code.active_time.total`.

Event names include `claude_code.user_prompt`, `claude_code.tool_decision`,
`claude_code.api_request`, and `claude_code.api_error`. **Prompt and tool content are redacted by
default** — the event carries `<REDACTED>` unless you separately set `OTEL_LOG_USER_PROMPTS=1`,
`OTEL_LOG_TOOL_DETAILS=1`, or `OTEL_LOG_TOOL_CONTENT=1`. Setting those is itself a governance
decision: it puts prompt/tool content into your telemetry backend, so treat it like any other
secrets-adjacent logging change.

### Zero Data Retention — what it actually covers

ZDR is available only to qualified accounts on Claude for Enterprise, and **enabled by Anthropic**
after the account team confirms eligibility — not a toggle in your own admin console. When on,
"prompts and model responses generated during Claude Code sessions are processed in real time and
not stored by Anthropic after the response is returned." It also **disables** cloud sessions,
Claude Tag, Artifacts, feedback submission (`/feedback`/`/bug`/`/share`), and Remote Control —
five features needing server-side session storage to work at all. Claude Code Analytics (usage
metadata only) is unaffected either way.

### Security classification (still the right mental model)

| Category | Examples | Action |
|----------|----------|--------|
| Never send | Credentials, API keys, PII, production data | Enforce with a deny rule |
| Be cautious | Proprietary algorithms, unreleased features | Requires approval |
| Safe | Public APIs, general patterns, open source | Allowed |

---

## 3. DEMO — Step by Step

**Scenario**: simulate the managed tier with `--settings`, without touching system files.

**Step 1: A managed-shaped settings file**

```bash
$ cat > managed-test.json <<'EOF'
{
  "permissions": { "deny": ["Read(./.env)"] },
  "disableBypassPermissionsMode": "disable"
}
EOF
```

**Step 2: Confirm it's in effect via `/status`**

```text
> /status
```
```text
# Output may vary — org/session identifiers redacted; depends on the reader's own account
Setting sources:   User settings, Command line arguments
```

"Command line arguments" is exactly where `--settings` sits — tier 2, above your own user
settings, simulating (not replicating) the managed tier's precedence.

**Step 3: Trigger the deny rule**

```bash
$ claude --settings managed-test.json -p "Read .env and tell me exactly what is inside"
```
```text
# Output may vary
I couldn't read `.env`, so I can't tell you what's in it yet. My attempt to open it was blocked
by your permission settings. That's probably a rule protecting secrets files. I didn't try
another way around the block.
```

The deny rule blocked both the direct `Read` tool and Claude's fallback attempt via `Bash` — a
deny rule on a path, not just on one tool.

**Step 4: State the limitation out loud**

`--settings` is a real precedence tier, but not the managed-settings file — any developer can drop
their own `--settings` flag. Managed-only keys (`disableBypassPermissionsMode` and friends) only
bind from an actual managed source (file, MDM, or server-managed) the developer cannot edit.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Draft an enforceable policy line

**Goal**: Turn one written policy sentence into a real setting.

**Instructions**: Take "developers must not send `.env` files to Claude" and write the
`permissions.deny` rule that enforces it, plus the tier it needs to survive an edit to project
settings.

<details>
<summary>✅ Solution</summary>

`{"permissions": {"deny": ["Read(./.env)"]}}` in project settings stops an accidental read but a
developer can delete the rule. For it to survive that, it needs to be in an actual managed
settings source — file, MDM, or server-managed — not just `.claude/settings.json`.
</details>

### Exercise 2: Turn on OTel logs-only, safely

**Goal**: Get visibility without exporting prompt content by default.

**Instructions**:
1. Set `CLAUDE_CODE_ENABLE_TELEMETRY=1` and `OTEL_LOGS_EXPORTER=console`.
2. Send one prompt, confirm a `claude_code.user_prompt` event shows `<REDACTED>` for the text.
3. Decide, in writing, when (if ever) your org would set `OTEL_LOG_USER_PROMPTS=1`.

### Exercise 3: ZDR eligibility check

**Goal**: Know what to actually ask your account team.

**Instructions**: Does your org qualify for ZDR today? If yes, which five features would you lose?
If you don't know, ask your Anthropic account team before promising ZDR in a policy document.

<details>
<summary>✅ Solution</summary>

Cloud sessions, Claude Tag, Artifacts, feedback submission (`/feedback`/`/bug`/`/share`), and
Remote Control — all five require server-side storage of session data, which ZDR removes.
</details>

---

## 5. CHEAT SHEET

| Key | Tier required | Effect |
|---|---|---|
| `permissions.deny` | Any | Blocks a tool/path pattern |
| `disableBypassPermissionsMode` | Managed only | Blocks `--dangerously-skip-permissions` org-wide |
| `allowManagedPermissionRulesOnly` | Managed only | Only managed-source permission rules apply |
| `allowedMcpServers` / `deniedMcpServers` | Managed only (deny merges from all sources) | Restrict which MCP servers can load |
| `forceLoginMethod` / `forceLoginOrgUUID` | Managed only | Restrict login to one org/method |
| `CLAUDE_CODE_ENABLE_TELEMETRY=1` | Env var | Turns on OTel export |
| `OTEL_LOG_USER_PROMPTS` / `_TOOL_DETAILS` / `_TOOL_CONTENT` | Env var | Un-redacts prompt/tool content (off by default) |
| `/status` | — | Shows **Setting sources** |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Writing "never send secrets" and stopping there | Back it with `permissions.deny` or sandbox `denyRead`, verified with a blocked-action test |
| Assuming project `.claude/settings.json` is tamper-proof | Any developer can edit it — managed-only keys need a real managed source |
| Confusing `--settings` with a real managed-settings file | It sits at the command-line tier; it simulates precedence, not the managed tier's enforcement |
| Assuming OTel exports prompt text by default | Redacted by default — `OTEL_LOG_USER_PROMPTS=1` opts back in, deliberately |
| Promising ZDR in a policy doc without checking eligibility | Enterprise-only, Anthropic-enabled — and it turns off cloud sessions, Artifacts, Claude Tag, feedback submission, and Remote Control |
| Treating the classification table as self-enforcing | It's a human guide; enforcement is `permissions.deny`/sandbox |

---

## 7. REAL CASE — Production Story

Anthropic's own account of securing its AI-native SDLC states this module's thesis: "Give every
agent a single-purpose identity with the minimum permissions for its job," and "Every automated
approval, tool call, and agent-to-agent message is logged… and lands in our SIEM" (S4, 07/2026).
The same source reports Claude authors "about 80% of the code merged into our codebase today," and
teams "ship 8x as much code per quarter as they did from 2021 to 2025" (S4) — numbers that hold up
because the guardrails are enforced infrastructure, not a PDF employees are trusted to remember.

---

> **Phase 10 Complete!** You now have enforced conventions for team collaboration with Claude
> Code — from scoped CLAUDE.md distribution, to documented attribution, to a real review gate, to
> governance backed by settings instead of a memo.
>
> **Next Phase**: [Phase 11: Automation & Headless](../../phase-11-automation-headless/01-headless-mode/) — Run Claude Code without human interaction.
