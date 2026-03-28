---
title: 'MCP — Model Context Protocol'
description: 'Connect Claude Code to MCP servers to extend capabilities with external tools and data sources.'
---

# Module 11.5: MCP — Model Context Protocol

> **Estimated time**: ~40 minutes
>
> **Prerequisite**: Modules 11.1-11.4 (Headless Mode, SDK, Hooks, GitHub Actions)
>
> **Outcome**: After this module, you will understand MCP architecture, connect Claude Code to MCP servers, and extend Claude's capabilities with external tools.

---

## 1. WHY — Why This Matters

Claude Code is powerful but isolated. It reads files and runs shell commands. But what if you need Claude to query your production database? Search your company wiki? Check Jira tickets? Pull metrics from monitoring? Out of the box, Claude can't do any of this.

MCP (Model Context Protocol) changes everything. It's a standardized protocol that lets Claude Code connect to ANY external system — databases, APIs, monitoring tools, whatever you need. One protocol, infinite possibilities. This is how Claude becomes a true team member with system access.

---

## 2. CONCEPT — Core Ideas

### MCP Architecture

```
Claude Code (Client) ←→ MCP Server ←→ External System
```

Claude requests data or actions → MCP Server translates and executes → External system responds → Server formats response → Claude uses it.

### Core Concepts

| Concept | What It Is | Example |
|---------|-----------|---------|
| **Server** | Exposes capabilities via MCP | PostgreSQL MCP server |
| **Client** | Consumes capabilities | Claude Code session |
| **Tools** | Functions Claude can call | `query_database(sql)` |
| **Resources** | Data Claude can read | Database schemas, files |

### Official MCP Servers

- `@modelcontextprotocol/server-postgres` — PostgreSQL access
- `@modelcontextprotocol/server-sqlite` — SQLite databases
- `@modelcontextprotocol/server-filesystem` — Enhanced file operations
- `@modelcontextprotocol/server-github` — GitHub API integration

### Browser & Debugging MCP Servers

Beyond database and API access, MCP unlocks powerful browser-based debugging workflows:

| Server | Purpose | What Claude Gets |
|--------|---------|-----------------|
| **Playwright MCP** | Browser automation | Navigate pages, fill forms, click buttons, take screenshots |
| **Chrome DevTools MCP** | Live browser debugging | Console logs, network requests, DOM inspection |

#### Playwright MCP in Action

With Playwright MCP connected, Claude can control a real browser. Instead of you describing a bug, Claude navigates to the page, fills in the form, clicks submit, and sees the error itself. This is transformative for:

- **E2E test writing**: Claude runs the test while writing it, catching failures immediately
- **Visual regression**: Claude screenshots before/after changes to verify UI didn't break
- **Form debugging**: Claude fills complex multi-step forms to reproduce user-reported bugs

#### Chrome DevTools MCP in Action

Chrome DevTools MCP gives Claude direct access to your browser's developer tools. Claude sees console errors, network failures, and DOM structure without you copy-pasting anything. Practical uses:

- **Console error debugging**: Claude reads the error stack trace directly from browser console
- **Network inspection**: Claude sees failed API calls, their request/response payloads, and status codes
- **Performance profiling**: Claude analyzes slow page loads by examining network waterfall

### Project-Level MCP Configuration (.mcp.json)

Instead of configuring MCP servers globally, you can commit project-specific MCP configuration:

```json
{
  "mcpServers": {
    "project-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./data/dev.db"]
    },
    "project-memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Benefits of .mcp.json**:
- **Team-shared**: Everyone gets the same MCP servers when they clone the repo
- **Project-specific**: Different projects use different servers without conflicts
- **Version-controlled**: MCP config evolves with your codebase
- **No global pollution**: Personal global config stays clean

Place `.mcp.json` at your project root. Claude Code reads it automatically when you start a session in that directory.

### MCP Token Budget Warning

⚠️ **Critical performance consideration**: Every MCP server's tool descriptions consume context tokens. These tokens are loaded into Claude's context window at the start of every session.

**Rule of thumb**: If your MCP servers collectively use more than **20,000 tokens** of context for tool descriptions, you are significantly reducing Claude's working memory for actual coding tasks.

| MCP Servers Connected | Approx. Token Overhead | Impact |
|----------------------|------------------------|--------|
| 1-2 servers | ~2,000-5,000 tokens | Negligible |
| 3-5 servers | ~8,000-15,000 tokens | Noticeable on complex tasks |
| 6+ servers | ~20,000+ tokens | Severe — Claude forgets context faster |

**Best practice**: Only enable MCP servers you actively need for the current project. Disable the rest. A lean MCP setup means more context for Claude to reason about your code.

### Configuration Format

⚠️ Verify exact path for your platform:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name", "--option", "value"]
    }
  }
}
```

Config location:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Security Model

MCP servers run locally on your machine. Credentials stay on your machine. Claude sends requests, the server executes them, responses go back. Claude never sees raw credentials.

---

## 3. DEMO — Step by Step

**Scenario**: Connect Claude Code to a SQLite database to analyze application data.

### Step 1: Install the SQLite MCP server

```bash
$ npm install -g @modelcontextprotocol/server-sqlite
```

Expected output:
```
added 42 packages in 3s
```

### Step 2: Configure the MCP server

Edit your Claude config file:

```bash
$ code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Add this configuration:

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "--db-path",
        "/Users/yourname/projects/app/data/app.db"
      ]
    }
  }
}
```

### Step 3: Restart Claude Code

The MCP server initializes on startup. Close and reopen Claude Code.

### Step 4: Verify MCP connection

```
You: What MCP servers are available?

Claude: I have access to the following MCP servers:
- sqlite: SQLite database at /Users/yourname/projects/app/data/app.db
  Tools: query, list_tables, describe_table
```

### Step 5: Explore database schema

```
You: List all tables in the database

Claude: [calls sqlite.list_tables tool]

The database contains 5 tables:
- users (1,247 rows)
- orders (8,932 rows)
- products (156 rows)
- sessions (3,891 rows)
- audit_log (45,223 rows)
```

### Step 6: Query and analyze

```
You: What percentage of orders are abandoned?

Claude: [calls sqlite.query tool]

Query: SELECT status, COUNT(*) FROM orders GROUP BY status

Results:
- completed: 7,123 (79.7%)
- abandoned: 1,456 (16.3%)
- pending: 353 (4.0%)

16.3% abandoned is higher than the 10-12% e-commerce average.
Consider implementing cart recovery emails.
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Database Explorer

**Goal**: Set up SQLite MCP and explore a sample database.

**Instructions**:
1. Create a sample SQLite database with at least 2 tables
2. Configure the SQLite MCP server
3. Ask Claude to list tables and describe schemas
4. Ask Claude to identify potential optimizations

**Expected result**: Claude queries the database and suggests improvements.

<details>
<summary>💡 Hint</summary>

Use `sqlite3 sample.db` to create tables. Make sure the config path is absolute.

</details>

<details>
<summary>✅ Solution</summary>

```bash
# Create sample database
$ sqlite3 ~/sample.db << EOF
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER, title TEXT);
INSERT INTO users VALUES (1, 'Alice', 'alice@example.com');
INSERT INTO posts VALUES (1, 1, 'Hello World');
EOF
```

Config:
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "/Users/yourname/sample.db"]
    }
  }
}
```

Ask Claude: "List tables, describe the posts table, show all posts with user names"

</details>

### Exercise 2: GitHub Integration

**Goal**: Connect Claude to GitHub MCP server.

**Instructions**:
1. Install `@modelcontextprotocol/server-github`
2. Generate a GitHub personal access token
3. Configure the GitHub MCP server
4. Ask Claude to list open issues in a repository

<details>
<summary>💡 Hint</summary>

Use `"env": {"GITHUB_TOKEN": "..."}` in the server config for the token.

</details>

<details>
<summary>✅ Solution</summary>

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

Ask Claude: "List open issues in myorg/myrepo"

</details>

### Exercise 3: Multi-Server Workflow

**Goal**: Use multiple MCP servers together.

**Instructions**:
1. Configure both SQLite and GitHub MCP servers
2. Ask Claude to correlate data across both sources
3. Observe how Claude uses both servers

<details>
<summary>💡 Hint</summary>

Frame questions so Claude needs both sources. Example: "What issues relate to products in our database?"

</details>

---

## 5. CHEAT SHEET

### MCP Architecture

```
┌─────────────┐           ┌─────────────┐           ┌──────────────┐
│ Claude Code │  Request  │ MCP Server  │  Execute  │ External Sys │
│  (Client)   │ ────────> │  (Adapter)  │ ────────> │ (DB/API/etc) │
│             │ <──────── │             │ <──────── │              │
└─────────────┘  Response └─────────────┘  Result   └──────────────┘
```

### Official MCP Servers

| Server | Purpose |
|--------|---------|
| `server-postgres` | PostgreSQL database |
| `server-sqlite` | SQLite database |
| `server-filesystem` | Enhanced file ops |
| `server-github` | GitHub API |

### Config Template

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name", "--option", "value"],
      "env": {
        "SECRET_KEY": "value"
      }
    }
  }
}
```

### Security Checklist

- ✅ Use read-only credentials
- ✅ Point to replicas, not production
- ✅ Review server code before installing
- ✅ Use environment variables for secrets

### Browser MCP Servers

| Server | Purpose | Claude Gets |
|--------|---------|-------------|
| Playwright MCP | Browser automation | Navigate, click, fill, screenshot |
| Chrome DevTools MCP | Live debugging | Console logs, network, DOM |

### Project MCP Config (.mcp.json)

```json
// Place at project root, commit to git
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name", "--option", "value"]
    }
  }
}
```

### MCP Token Budget

| Servers | Token Cost | Recommendation |
|---------|-----------|----------------|
| 1-2 | ~2-5K | ✅ Safe |
| 3-5 | ~8-15K | ⚠️ Monitor context usage |
| 6+ | ~20K+ | ❌ Disable unused servers |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Exposing production write credentials | Use read-only replicas or read-only users |
| Installing unknown MCP servers | Only use official servers or audit code first |
| Hardcoding secrets in config | Use environment variables: `"env": {"KEY": "value"}` |
| No access logging | Enable query logging on database side |
| Mixing dev and prod credentials | Maintain separate config files per environment |
| Not understanding Claude's actions | Review the SQL/API calls before trusting results |
| Assuming MCP is sandboxed | MCP servers have full access to what you configure |

---

## 7. REAL CASE — Production Story

**Scenario**: A Vietnamese fintech company needed faster production debugging. Database was large, logs scattered, debugging required manual SQL + log searches + code reviews.

**Problem**: Average incident resolution: 4 hours. Engineers spent most time gathering data, not analyzing.

**Solution**: Deployed three MCP servers:
1. **PostgreSQL MCP** (read-only replica): Claude queries production data
2. **Custom Monitoring MCP**: Tools like `get_error_logs(service, time_range)`
3. **GitHub MCP**: Code context for recent changes

**Workflow**: Developer asks "Why are payments timing out?"

Claude:
1. Calls `get_error_logs("payment-service", "1h")` → finds timeout pattern
2. Queries database → finds spike in pending transactions
3. Searches GitHub → finds recent change to locking logic
4. Provides: root cause, proof, fix (rollback commit)

**Result**:
- Resolution time: 4 hours → **1.2 hours** (-70%)
- Engineers analyze instead of gathering data
- Full context without write access

**Quote**: "MCP turned Claude from 'smart assistant' into 'team member with system access.'"

---

> **Phase 11 Complete!** You've mastered automation — from headless scripts to MCP integrations.
>
> **Next Phase**: [Phase 12: n8n & Workflows](../../phase-12-n8n-workflows/01-claude-code-n8n/) →
