---
title: 'MCP — Model Context Protocol'
description: 'Add MCP servers with claude mcp add, share them through .mcp.json with ${VAR}, and control their tools with mcp__ permission rules.'
verified: 2026-09-23
claude_version: 2.1.280
---

# Module 11.5: MCP — Model Context Protocol

> **Estimated time**: ~40 minutes
>
> **Prerequisite**: Modules 11.1–11.4, especially [11.2 SDK](../02-claude-agent-sdk/) and
> [11.3 Hooks](../03-hooks-system/), plus
> [2.2 Permissions](../../phase-02-security/02-permission-system/)
>
> **Outcome**: add an MCP server at the right scope, share it through `.mcp.json` with no secret
> in the file, and allow or deny its tools with `mcp__` rules.

---

## 1. WHY — Why This Matters

Your Jira board, your read-replica, your metrics service: Claude Code reaches none of them with
`Read` and `Bash` alone. So you paste — ticket, query result, log line — and half your context
window is stale copy-paste.

MCP fixes that. It is also the first time an external system can put text into Claude's context
and pull data back out, so this module covers both halves: wiring up, and leashing.

---

## 2. CONCEPT — Core Ideas

> "MCP (Model Context Protocol) is an open-source standard for connecting AI applications to
> external systems." — modelcontextprotocol.io

A server exposes **tools** Claude calls, **resources** you reference with
`@server:protocol://path`, and **prompts** listed as `/servername:promptname (MCP)`.

```mermaid
graph LR
    A[Claude Code] -->|stdio or http| B[MCP server]
    B --> C[Jira / DB / API]
    A -.->|mcp__server__tool<br/>permission rule| A
```

**Transports.** `stdio` servers "run as local processes on your machine"; `http` is "the
recommended option for connecting to remote MCP servers"; `sse` is deprecated.

**Scopes** decide reach and storage:

| Scope | Loads in | Shared with team | Stored in |
|---|---|---|---|
| `local` (default) | Current project only | No | `~/.claude.json` |
| `project` | Current project only | Yes, via version control | `.mcp.json` in project root |
| `user` | All your projects | No | `~/.claude.json` |

`.mcp.json` is the team file, so it must never hold a secret: `${VAR}` and `${VAR:-default}`
expand inside `command`, `args`, `env`, `url` and `headers`, keeping the token in each
developer's environment. Claude Code "prompts for approval in interactive sessions before using
project-scoped servers"; `enabledMcpjsonServers` or `enableAllProjectMcpServers` stores that
answer.

**Control.** Every tool is `mcp__<server>__<tool>` — the name you put in `permissions.allow`,
`deny` or `ask`. `mcp__fs` matches the whole server. An allow glob must start with a literal
`mcp__<server>__`, so `mcp__fs__read_*` works while `"mcp__*"` is skipped with a warning; in a
*deny* list, `"mcp__*"` blocks every MCP tool.

**Cost.** Tool definitions are deferred by default: "Only tool names and server instructions load
at session start, so adding more MCP servers has minimal impact on your context window." Not
free, though: `/context` shows the real number, and Anthropic's costs guidance is to "prefer CLI
tools when available" — `gh`, `aws` and `gcloud` "don't add any per-tool listing" (S15). Build
few high-value tools, not a wall of thin ones (S9). `MAX_MCP_OUTPUT_TOKENS` caps output (default
25,000; warning above 10,000); `--strict-mcp-config` loads only what `--mcp-config` passes.

---

## 3. DEMO — Step by Step

**Step 1: Add a local stdio server** (scratch repo `~/cc-lab`)

```bash
# docs: en/mcp — claude mcp add [options] <name> -- <command> [args...]
claude mcp add --transport stdio fs -- npx -y @modelcontextprotocol/server-filesystem ~/cc-lab
```

```text
# Output may vary
Added stdio MCP server fs with command: npx -y @modelcontextprotocol/server-filesystem /Users/you/cc-lab to local config
File modified: /Users/you/.claude.json [project: /Users/you/cc-lab]
```

Everything after `--` reaches the server untouched, so its flags never collide with Claude's.

**Step 2: Check it connected**

```bash
claude mcp list
```

```text
# Output may vary
Checking MCP server health…

…
fs: npx -y @modelcontextprotocol/server-filesystem /Users/you/cc-lab - ✔ Connected
```

Statuses: `✔ Connected`, `! Needs authentication`, `✘ Failed to connect`.

**Step 3: Inspect one server** — `claude mcp get fs`

```text
# Output may vary
fs:
  Scope: Local config (private to you in this project)
  Status: ✔ Connected
  Type: stdio
  Command: npx
  Args: -y @modelcontextprotocol/server-filesystem /Users/you/cc-lab

To remove this server, run: claude mcp remove fs -s local
```

**Step 4: Share a server through `.mcp.json` — without the token.** In the repo root, commit:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
    }
  }
}
```

**Step 5: Verify the token never landed in the file**

```bash
claude mcp list | grep github
claude mcp get github
```

```text
# Output may vary
github: https://api.githubcopilot.com/mcp/ (HTTP) - ⏸ Pending approval (run `claude` to approve)
 └ [Warning] [github] mcpServers.github: Missing environment variables: GITHUB_TOKEN
github:
  Scope: Project config (shared via .mcp.json)
  Status: ⏸ Pending approval (run `claude` to approve)
  Headers:
    Authorization: Bearer ${GITHUB_TOKEN}
```

That is the proof: the header prints by name, not by value — for local, project and user scope,
all three surfaces show `${VAR}` unexpanded. Export the token and the warning goes away.

**Step 6: Approve the project server** — start `claude` in the repo

```text
# Output may vary
  New MCP server found in this project: github

  MCP servers may execute code or access system resources. All tool calls
  require approval. Learn more in the MCP documentation.

    Use this MCP server
    Use this and all future MCP servers in this project
  ❯ Continue without using this MCP server

  Enter to confirm · Esc to cancel
```

Pick option 3 for any server you have not vetted.

**Step 7: See every server with `/mcp`**

```text
# Output may vary
   Manage MCP servers
   67 servers

     Local MCPs (/Users/you/.claude.json [project: /Users/you/cc-lab])
   ❯ fs · ✔ connected · 14 tools
     …
   https://code.claude.com/docs/en/mcp for help
```

The panel also handles OAuth sign-in and per-project disable.

**Step 8: Watch a tool ask for permission**

Run `claude --permission-mode default`, then ask:
`Use the fs MCP server to read src/math.js`

```text
# Output may vary
 Tool use
   fs — Read Text File Tool: (MCP)
   path: "/Users/you/cc-lab/src/math.js"
 Do you want to proceed?
 ❯ 1. Yes
   2. Yes, and don't ask again for fs — Read Text File commands in ~/…
   3. No
 Esc to cancel · Tab to amend
```

`--permission-mode default` forces the stock behavior; on a fresh install you get the same result
without it unless `settings.json` sets `permissions.defaultMode`.

**Step 9: Pre-allow one tool, deny another** — headless runs cannot answer that prompt:

```bash
claude -p "Use the fs MCP server to read src/math.js and show me line 1." --permission-mode default
```

```text
# Output may vary
I couldn't read the file because permission to use the fs MCP server's `read_text_file` tool
hasn't been granted.
```

Add the rule to `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": ["mcp__fs__read_text_file"],
    "deny": ["mcp__fs__write_file"]
  }
}
```

Re-run the same command:

```text
# Output may vary
Line 1 of `src/math.js`, read with the fs MCP server:
export function add(a, b) { return a + b; }
```

**Step 10: Clean up**

```bash
claude mcp remove fs
claude mcp remove github -s project
```

```text
# Output may vary
Removed MCP server "fs" from local config
Removed MCP server github from project config
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Add a remote HTTP server and sign in

**Goal**: add Notion at user scope, then sign in. `claude mcp list` should move it from
`! Needs authentication` to `✔ Connected`.

<details>
<summary>💡 Hint</summary>

Remote servers take a URL, not `--`. `claude mcp login <name>` runs OAuth from a shell.

</details>

<details>
<summary>✅ Solution</summary>

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp --scope user
claude mcp login notion
claude mcp list | grep notion
```

Undo with `claude mcp logout notion`, then `claude mcp remove notion -s user`, which also
deletes the stored tokens.

</details>

### Exercise 2: Ship a team `.mcp.json`

**Goal**: a teammate clones the repo and gets the server with no prompt and no secret. Add a
project-scoped server whose token comes from `${VAR}`, then pre-approve it by name;
`claude mcp get <name>` should show `Scope: Project config (shared via .mcp.json)` and the header
unexpanded.

<details>
<summary>💡 Hint</summary>

`claude mcp add --scope project` writes `.mcp.json`; approval lives in a settings file.

</details>

<details>
<summary>✅ Solution</summary>

`.claude/settings.json`, committed:

```json
{ "enabledMcpjsonServers": ["github"] }
```

`enableAllProjectMcpServers: true` is the blunter version. Both keys are ignored from the shared
project file until the teammate accepts the workspace trust dialog — a cloned repo cannot approve
its own servers.

</details>

### Exercise 3: Take away the write tools

**Goal**: let Claude read through the `fs` server but never write. Add a deny rule, restart, then
ask Claude to create a file through the server; the write must be refused although the server
still offers the tool.

<details>
<summary>💡 Hint</summary>

Deny beats allow. Deny rules accept a glob in the tool-name position.

</details>

<details>
<summary>✅ Solution</summary>

```json
{
  "permissions": {
    "allow": ["mcp__fs__read_text_file"],
    "deny": ["mcp__fs__write_file", "mcp__fs__edit_file"]
  }
}
```

Verify in `/permissions`. A tool matched by a bare-name glob deny rule is dropped from Claude's
context entirely.

</details>

---

## 5. CHEAT SHEET

| Command | Description |
|---|---|
| `claude mcp add [-e K=V] --transport stdio <n> -- <cmd>` | Local process |
| `claude mcp add --transport http <n> <url>` | Remote server |
| `claude mcp add … --scope project\|user\|local` | Where it is stored |
| `claude mcp add-json <n> '<json>'` | From JSON |
| `claude mcp list` / `get <n>` / `remove <n> [-s <scope>]` | Inspect, remove |
| `claude mcp login <n>` / `logout <n>` | OAuth from shell |
| `/mcp` | Status, auth, disable |
| `@server:protocol://path` | Resource |
| `/mcp__server__prompt arg1 arg2` | Server prompt |

| Key / variable | Effect |
|---|---|
| `permissions.allow: ["mcp__fs__read_text_file"]` | Pre-approve a tool |
| `permissions.deny: ["mcp__*"]` | Block every MCP tool |
| `enabledMcpjsonServers` / `enableAllProjectMcpServers` | Approve `.mcp.json` servers |
| `disabledMcpjsonServers` | Reject one, any file |
| `allowedMcpServers` (managed settings) | Admin allowlist |
| `MAX_MCP_OUTPUT_TOKENS` | Output cap; default 25,000 |
| `--strict-mcp-config` | Only `--mcp-config` servers |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Editing the Claude Desktop app's JSON config and expecting Claude Code to read it | Different product, different file: use `claude mcp add`, or `claude mcp add-from-claude-desktop` |
| `npm i -g @modelcontextprotocol/server-sqlite` — SQLite, PostgreSQL and GitHub reference servers are archived | Pick a maintained one; the docs' database example is `claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "…"`, read-only user |
| `"Authorization": "Bearer ghp_FAKE-DO-NOT-USE-xxxx"` committed in `.mcp.json` | `"Bearer ${GITHUB_TOKEN}"`, verified with `claude mcp get <name>`: it must print the variable name |
| "Claude never sees raw credentials — the server holds them" | Tool **output** lands in context: a tool returning a row with an API key just put that key in your transcript. Deny tools that reach secrets |
| Adding ten servers and assuming they are free | Definitions are deferred, but names and instructions still load. Check `/context`, disable unused ones in `/mcp`, prefer `gh`/`aws` (S15) |
| Trusting a server because it is popular | One that fetches external content can inject instructions into your session ([Module 2.1](../../phase-02-security/01-threat-model/)). Read the source, pin the version |

---

## 7. REAL CASE — Production Story

**Scenario**: A Ho Chi Minh City fintech team ran every incident the same way — one engineer in
Jira, one in the read-replica, one in the logs — then pasted fragments into Claude Code.

**Problem**: Someone pasted a query result that still held a partner API key. Nothing leaked, but
the review that followed banned ad-hoc pasting.

**Solution**: Two project-scoped servers in a committed `.mcp.json` — internal Jira and a
read-only Postgres user — authenticated through `${JIRA_TOKEN}` and `${PG_DSN}` from each
developer's environment, never the file. The repo's `.claude/settings.json` carries
`enabledMcpjsonServers`, an allow list naming the read tools, and a `deny` for the write side.
Rotating a token is an env change, not a commit.

**Result**: Reviewers diff one file to see which tools the agent can call, and "what can Claude
touch in production?" now has a list for an answer.

---

> **Phase 11 Complete!** You've mastered automation — from headless scripts to MCP integrations.
>
> **Next Phase**: [Phase 12: n8n & Workflows](../../phase-12-n8n-workflows/01-claude-code-n8n/) →
