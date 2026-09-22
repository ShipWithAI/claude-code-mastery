# Templates

Reference templates extracted from the course content, ready to copy into your own project.

- `claude-md-security-example.md` — A complete, security-focused `CLAUDE.md` policy covering file access, command, code generation, git, and database rules for an AI-assisted project.
- `security-checklists.md` — Pre-session, during-session, post-session, and weekly-audit checklists plus an incident reporting runbook for safe day-to-day Claude Code usage.
- `onboarding-security.md` — A full security onboarding document for new team members joining a project that uses Claude Code.
  ⚠️ Extracted verbatim from Module 2.5 before the Wave 1/2 rewrite. Step 5 ("Test Sandbox") relies on the module's `sandbox.sh`, which sets Docker `--network` to `none`; Claude Code needs network access to api.anthropic.com, so that recipe is being replaced — treat Step 5 as a placeholder until Module 2.3/2.5 are rewritten.

More templates land here as modules are rewritten (see CLAUDE.md § Directory Layout).
