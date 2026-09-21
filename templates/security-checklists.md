# Security Checklists

Source: Module 2.5 — System Control & Monitoring
Date: 2026-09-21

Checklists are how pilots prevent crashes and surgeons prevent mistakes. Here are your security checklists for Claude Code:

**Pre-Session Checklist:**
- [ ] Am I in the correct project directory?
- [ ] Is Docker sandbox running? (for sensitive projects)
- [ ] Is .env.example present and .env gitignored?
- [ ] Is gitleaks pre-commit hook active?
- [ ] Have I read CLAUDE.md security rules?

**During-Session Checklist:**
- [ ] Read every permission prompt before approving
- [ ] Never paste secrets into prompts
- [ ] Reference .env.example, never .env
- [ ] Verify paths in file operations stay within project
- [ ] Question any command I don't understand

**Post-Session Checklist:**
- [ ] Run `git status` to check for unexpected changes
- [ ] Run `gitleaks detect` on project
- [ ] Clear terminal scrollback if secrets were displayed
- [ ] Exit Docker sandbox if used
- [ ] Review any generated code for hardcoded secrets

**Weekly Audit Checklist:**
- [ ] Run full project scan: `gitleaks detect --verbose`
- [ ] Review CLAUDE.md for needed updates
- [ ] Check for new .env variables not in .env.example
- [ ] Review git history for any committed secrets
- [ ] Update team on any new security practices

Print these. Laminate them. Put them on your monitor. Security is a habit, not an event.

## Incident Reporting

If something goes wrong:

1. **Secret committed to git**:
   - STOP immediately
   - Notify team lead on Slack: #engineering-incidents
   - Do NOT push
   - Follow runbook: docs/runbooks/secret-leak-response.md

2. **Claude suggests dangerous command**:
   - DENY the command
   - Document in #engineering-ai channel
   - Propose CLAUDE.md update

3. **Unexpected file access**:
   - Check what file was accessed: review Claude's response
   - If sensitive file: treat as potential leak
   - Document and discuss with team
