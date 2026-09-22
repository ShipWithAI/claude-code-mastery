# CLAUDE.md Security Example

Source: Module 2.5 — System Control & Monitoring
Date: 2026-09-21

# Banking API — Claude Code Security Policy

## Project Overview
Backend API for mobile banking application. Handles customer accounts,
transactions, and integrations with Vietnam's Napas payment network.

**Security Level**: CRITICAL — this project handles financial data and PII.

---

## Security Rules (CRITICAL)

### File Access Restrictions
- NEVER read files in: ~/.ssh/, ~/.aws/, ~/.config/, ~/.env
- NEVER read .env files directly - use .env.example for reference only
- NEVER traverse parent directories (../) to access files outside project root
- NEVER read files in /etc/, /var/, or other system directories

### Command Restrictions
- NEVER run rm -rf without explicit user confirmation showing exact path
- NEVER run git push without showing full diff first
- NEVER run curl/wget with credentials in URL (use headers or .netrc)
- NEVER run commands with --force, --no-verify, or similar danger flags
- NEVER run database migration commands in production without review
- NEVER run docker commands that expose ports externally without confirmation

### Code Generation Rules
- NEVER hardcode API keys, tokens, passwords, or secrets
- ALWAYS use environment variables: process.env.VARIABLE_NAME (Node.js)
- ALWAYS reference .env.example for configuration structure
- NEVER include real credential values in comments, logs, or error messages
- NEVER log sensitive fields (account numbers, passwords, tokens)
- ALWAYS redact PII in generated code examples

### Git Rules
- NEVER commit .env, .env.local, or any file with real credentials
- ALWAYS verify .gitignore includes secret files before first commit
- NEVER force push to main, master, or production branches
- NEVER commit database dumps or backup files
- ALWAYS use conventional commit format: type(scope): message

### Database Rules
- NEVER run DROP, TRUNCATE, or DELETE without WHERE clause
- NEVER expose database connection strings in code
- NEVER commit migration files that contain real data
- ALWAYS use parameterized queries, never string concatenation

### Audit Trail
When this CLAUDE.md is updated with new security rules, document:
- Date of change
- Rule added/modified
- Reason (incident, new threat, compliance requirement)

---

## Coding Standards
[Rest of coding standards here...]
