---
title: Claude Code Cheat Sheet
description: Quick reference for all Claude Code commands, configurations, and best practices
---

import { Aside, Card, CardGrid } from '@astrojs/starlight/components';

## Quick Reference — All Commands

### CLI Commands (Terminal)

| Command | Purpose | Example |
|---------|---------|---------|
| `claude` | Start interactive REPL | `claude` |
| `claude -p "prompt"` | One-shot mode | `claude -p "explain this error"` |
| `claude --model sonnet` | Start with specific model | `claude --model opus` |
| `claude --version` | Check installed version | `claude --version` |
| `cat file \| claude -p "..."` | Pipe mode — feed file content | `cat log.txt \| claude -p "summarize"` |
| `claude config` | Manage configuration | `claude config` |
| `claude -c` / `claude --continue` | Continue most recent conversation | `claude -c` |
| `claude -r` / `claude --resume` | Resume specific session by ID/name | `claude -r "auth-refactor"` |
| `claude update` | Update to latest version | `claude update` |
| `claude mcp` | Configure MCP servers | `claude mcp add my-server` |
| `claude doctor` | Diagnose installation issues | `claude doctor` |
| `claude -p --output-format json` | JSON output for automation | `claude -p --output-format json "list files"` |
| `claude -p --max-turns 3` | Limit agentic turns | `claude -p --max-turns 3 "fix lint"` |
| `claude -p --max-budget-usd 5` | Set dollar spending limit | `claude -p --max-budget-usd 5 "refactor"` |
| `claude --allowedTools "Read" "Bash(git *)"` | Restrict tool access | `claude --allowedTools "Read"` |
| `claude --system-prompt "..."` | Custom system prompt | `claude --system-prompt "You are a reviewer"` |

<Aside type="tip">
Use **one-shot mode** (`-p`) for quick questions. Use **REPL mode** for multi-turn conversations and complex tasks.
</Aside>

### Slash Commands (Inside REPL)

| Command | What It Does | When to Use |
|---------|-------------|-------------|
| `/help` | List all available commands | Forgot syntax? Start here |
| `/init` | Create CLAUDE.md for project | First time in a new project |
| `/compact` | Compress conversation history | Context at 50-70% — frees 30-70% tokens |
| `/compact [focus]` | Compact with focus instruction | `/compact Preserve the auth decisions` |
| `/clear` | Erase ALL context, start fresh | Switching to unrelated project |
| `/cost` | Show token usage and estimated cost | Every 20-30 minutes to track spending |
| `/model` | Switch AI model mid-session | Change between Haiku/Sonnet/Opus |
| `/status` | Show version, model, account info | Quick session overview |
| `/context` | Visual context usage grid | See how full your context window is |
| `/memory` | Edit CLAUDE.md memory files | Update project memory without leaving session |
| `/resume` | Resume session or show picker | Return to a previous conversation |
| `/doctor` | Check installation health | Diagnose issues with your setup |
| `/terminal-setup` | Install terminal keybindings | Enable Shift+Enter for multi-line input |
| `/vim` | Enable vim mode | For vim users |
| `/bug` | Report a bug | Send bug report to Anthropic |
| `/export` | Export conversation to file | Save session for later reference |
| `/exit` or `Ctrl+C` | Exit session | Done working |

<Aside type="caution">
`/compact` preserves task context while freeing space. `/clear` erases everything. Prefer `/compact` during active work.
</Aside>

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Escape` | Cancel current generation |
| `Escape` × 2 | Rewind — show message selector to undo |
| `Ctrl+C` | Interrupt / exit |
| `Ctrl+V` | Paste image from clipboard (macOS: `Ctrl+V`, NOT `Cmd+V`) |
| `Ctrl+G` | Open prompt in external editor (`$EDITOR`) |
| `Ctrl+L` | Clear terminal screen |
| `Ctrl+O` | Toggle verbose output |
| `Shift+Tab` | Cycle permission modes (Normal → Auto-Accept → Plan) |
| `Option+T` / `Alt+T` | Toggle extended thinking |
| `Option+P` / `Alt+P` | Switch model |
| `Tab` | Accept prompt suggestion |
| `Up` / `Down` | Navigate prompt history |

<Aside type="tip">
Run `/terminal-setup` first to enable `Shift+Enter` for multi-line input in supported terminals (iTerm2, Ghostty, Kitty, WezTerm).
</Aside>

### Input Shortcuts

| Method | How |
|--------|-----|
| Multi-line input | `\` + Enter, or `Shift+Enter` (after `/terminal-setup`) |
| Bash mode | `! npm test` — run shell commands without AI interpretation |
| File reference | `@src/utils/auth.js` — autocomplete with `Tab` |
| Paste image | `Ctrl+V` (clipboard screenshot) |

### Mode Selection Guide

| Scenario | Mode | Command |
|----------|------|---------|
| Multi-turn debugging | REPL | `claude` |
| Quick question | One-shot | `claude -p "..."` |
| Review a diff | Pipe | `git diff \| claude -p "review"` |
| Process a log file | Pipe | `cat errors.log \| claude -p "analyze"` |
| CI/CD integration | One-shot | Script with `-p` flag |
| Learning / exploring | REPL | `claude` |

### Model Selection

| Model | Cost | Best For |
|-------|------|----------|
| **Haiku** | $ | Formatting, typos, simple edits, quick answers |
| **Sonnet** | $$ | Features, debugging, code review, documentation |
| **Opus** | $$$ | Architecture, complex debugging, security, novel problems |

<Aside type="tip">
Default to **Sonnet** for most tasks. Use **Haiku** for simple edits. Reserve **Opus** for complex architecture and reasoning.
</Aside>

---

## Best Practices for CLAUDE.md

### The 6 Essential Sections

Every project CLAUDE.md should include these sections:

```markdown
# Project: [Name]

## 1. Project Overview
Tech stack: Node.js 20, Express, PostgreSQL, Redis
Architecture: Monorepo with packages/ directory

## 2. Architecture Rules
- Routes → Services → Repositories → Database
- All business logic in services, never in routes
- Shared types in packages/shared/

## 3. Coding Conventions
- Files: kebab-case (user-service.ts)
- Classes: PascalCase (UserService)
- Functions: camelCase (getUserById)
- Error handling: Promise<Result<T, AppError>>
- Imports: Absolute via @/ prefix

## 4. Commands
npm run dev          # Start dev server (port 3000)
npm test             # Run all tests
npm run lint         # ESLint + Prettier check
npm run db:migrate   # Run database migrations

## 5. Constraints (DO NOT)
- Do NOT use `any` type — always define proper types
- Do NOT install dependencies without asking first
- Do NOT put business logic in route handlers
- Do NOT commit .env files
- Do NOT modify database schema without migration

## 6. Context (Tribal Knowledge)
- Redis keys MUST include version prefix: v1:user:123
- JWT expires in 15 min, refresh token in 7 days
- Legacy /api/v1 routes maintained for mobile app compatibility
- Payment gateway sandbox mode uses TEST_ prefix keys
```

### CLAUDE.md Size Guide

| Size | Tokens | Quality |
|------|--------|---------|
| 300-500 words | ~400-650 | Minimal — misses edge cases |
| **500-800 words** | **~650-1000** | **Sweet spot for most projects** |
| 800-1200 words | ~1000-1500 | Comprehensive — large projects |
| 1200+ words | 1500+ | Too large — diminishing returns |

<Aside type="caution">
Keep CLAUDE.md under 1000 words. Every token spent on project memory is a token NOT available for your actual work.
</Aside>

### File Hierarchy

| Location | Scope | Priority |
|----------|-------|----------|
| `~/.claude/CLAUDE.md` | Global (all projects) | Lowest |
| `./CLAUDE.md` | Project root | **Main — use this** |
| `./src/CLAUDE.md` | Directory-level | Highest (overrides root) |

---

## File Patterns Guide

### .gitignore — Protect Secrets

```bash
# Secrets — NEVER commit
.env
.env.local
.env.*.local

# Dependencies
node_modules/
vendor/
.venv/

# Build output
dist/
build/
.next/

# OS files
.DS_Store
Thumbs.db
```

### .env.example Pattern — Safe for Claude

```bash
# .env.example — committed to git, safe for Claude to read
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://:password@localhost:6379
API_KEY=your_api_key_here
STRIPE_KEY=sk_test_placeholder

# .env — real secrets, gitignored, NEVER read by Claude
# DATABASE_URL=postgresql://realuser:s3cr3t@prod.db:5432/prod
```

<Aside type="danger">
**Never** let Claude read your `.env` file directly. Always use `.env.example` with placeholder values. If secrets are accidentally exposed, rotate them immediately.
</Aside>

### Permission Quick Reference

| Command Category | Action |
|-----------------|--------|
| `ls`, `pwd`, `cat`, `head`, `tail` | Approve freely — read-only |
| `grep`, `find` | Approve freely — search only |
| `git status`, `git log`, `git diff` | Approve freely — read-only git |
| `git commit -m "..."` | Review message, then approve |
| `npm install <package>` | Verify package name first |
| File writes in `src/` | Verify path and content |
| `rm`, `git push --force` | **Always deny** unless intentional |
| `curl`, `wget` | **Always deny** — data exfiltration risk |
| Operations on `~/.ssh/`, `~/.aws/` | **Always deny** — sensitive directories |

### Secret Scanner Setup (Gitleaks)

```bash
# Install
brew install gitleaks

# Add pre-commit hook
cat > .git/hooks/pre-commit << 'HOOK'
#!/bin/bash
gitleaks protect --staged --verbose
if [ $? -ne 0 ]; then
    echo "SECRETS DETECTED! Commit blocked."
    exit 1
fi
echo "No secrets detected."
exit 0
HOOK
chmod +x .git/hooks/pre-commit
```

---

## Context Management

### Token Cost Estimates

| Content Type | Tokens per 1000 chars |
|--------------|----------------------|
| English prose | ~250 |
| Source code | ~400 |
| JSON data | ~400 |
| Small file (<5KB) | 1,000-2,000 total |
| Medium file (5-20KB) | 2,000-5,000 total |
| Large file (>50KB) | 10,000+ total |

### Context Health Monitor

| Level | Quality | Action |
|-------|---------|--------|
| 0-50% | Excellent | Continue working |
| 50-70% | Good | Plan to `/compact` soon |
| 70-85% | Degrading | Run `/compact` now |
| 85-95% | Poor | Must compact or clear |
| 95%+ | Unreliable | `/clear` and restart |

### Power Combos

| Combo | Workflow | When |
|-------|----------|------|
| `/cost` → `/compact` | Check → compress | Routine maintenance (every 30 min) |
| `/clear` → `/init` | Reset → configure | Starting new project |
| `/compact` → work → `/cost` | Compress → continue → verify | Long sessions |

---

## Workflow Quick Starts

### New Project Setup
```bash
cd my-project
claude               # Start session
/init                # Create CLAUDE.md
# Edit CLAUDE.md with 6 sections above
/cost                # Check baseline usage
```

### Long Session Protocol
```bash
# Every 20-30 minutes:
/cost                # Check context level

# At 50-70% context:
/compact             # Free space, keep task context

# Switching to unrelated task:
/clear               # Full reset
```

### Safe Code Review
```bash
git diff main | claude -p "Review this diff for bugs, security issues, and style"
```

### Context-Efficient Exploration
```bash
# Step 1: Overview first
"Show me the directory structure of src/"

# Step 2: Targeted reading
"Show me function signatures in src/auth/"

# Step 3: Deep dive only where needed
"Read src/auth/login.ts — I need to understand the token flow"
```
