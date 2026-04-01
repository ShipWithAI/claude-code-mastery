# Contributing to Claude Code Mastery

Thanks for helping make this course better! Here's how to contribute.

All PRs should target the **`develop`** branch. The `main` branch is reserved for production deployments only.

## Quick Fixes

Typos, grammar, broken links? Just open a PR directly — no issue needed.

## New Content

Before writing a new module:

1. Check if the topic is already covered in an existing module
2. Follow the **7-block structure** every module uses:
   - **WHY** — Real pain point, motivation
   - **CONCEPT** — Core mental model + diagram
   - **DEMO** — Step-by-step walkthrough (copy-paste ready)
   - **PRACTICE** — Hands-on exercises with solutions
   - **CHEAT SHEET** — Quick reference table
   - **PITFALLS** — Common mistakes (wrong vs right)
   - **REAL CASE** — Production scenario
3. Read [`CLAUDE.md`](./CLAUDE.md) for full writing guidelines and the module template

Content lives in `src/content/docs/en/claude-code/` (English) and `src/content/docs/vi/claude-code/` (Vietnamese).

## Vietnamese Translation

- Vietnamese content goes in `src/content/docs/vi/`, mirroring the English structure
- It's a **natural rewrite**, not a word-for-word translation
- Technical terms stay in English (e.g., "context window", "token", "hook")

## Reporting Issues

Use [GitHub Issues](https://github.com/ShipWithAI/claude-code-mastery/issues) to report:

- Incorrect or outdated commands
- Missing topics you'd like covered
- Broken links or build issues

## Code of Conduct

Be respectful, constructive, and welcoming. We're all here to learn and build better software together. Harassment, discrimination, or disruptive behavior won't be tolerated.

---

Questions? Reach out on [Telegram](https://t.me/ShipWithAI) or [Twitter](https://x.com/shipwithaiio).
