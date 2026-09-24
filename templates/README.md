# Templates

Reference templates extracted from the course content, ready to copy into your own project.

- `claude-md-security-example.md` — A complete, security-focused `CLAUDE.md` policy covering file access, command, code generation, git, and database rules for an AI-assisted project.
- `security-checklists.md` — Checklists for before, during and after a session plus a weekly audit (which now includes re-verifying that your deny rules and `PreToolUse` hooks still block), and an incident reporting runbook.
- `onboarding-security.md` — A full security onboarding document for new team members joining a project that uses Claude Code.
  ⚠️ Extracted verbatim from Module 2.5 before the Wave 1/2 rewrite. Step 5 ("Test Sandbox") relies on a `sandbox.sh` that cut the container off from the network; Claude Code needs to reach api.anthropic.com, so that recipe is gone. Module 2.5 no longer ships it, and sandboxing is now owned by Module 2.3 — treat Step 5 as a placeholder until 2.3 lands.

More templates land here as modules are rewritten (see CLAUDE.md § Directory Layout).
