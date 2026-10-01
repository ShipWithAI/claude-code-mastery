# CLAUDE.md prune exercise — full material

Source: Module 4.2 — CLAUDE.md — Project Memory, Exercise 1 (audit W2-3).
Loaded into every session, so every line here is a permanent context-window tax. Apply the
prune test from `docs/references/anthropic-sources.md` (S1): *"Would removing this cause Claude
to make mistakes?"* If not, cut it.

---

## Before — 120-line bloated `CLAUDE.md` (starting point for Exercise 1)

```markdown
# CLAUDE.md

## About This Project

Welcome! This is the CLAUDE.md file for our project. CLAUDE.md is a special file that
Claude Code reads automatically. It's a great way to give Claude context about your
codebase so you don't have to repeat yourself every session. This file was created by
the team to help onboard both humans and AI. We update it whenever something changes,
so please keep it current!

## Tech Stack

We use Node.js, which is a JavaScript runtime built on Chrome's V8 engine. Node.js lets
you run JavaScript outside the browser. We also use Express, a minimal and flexible
Node.js web application framework. Our database is PostgreSQL, a powerful, open source
object-relational database system with over 35 years of active development. We use
Prisma as our ORM (Object-Relational Mapper), which lets us interact with the database
using JavaScript/TypeScript objects instead of raw SQL.

## Coding Style

- Use camelCase for variable and function names. This is a JavaScript convention.
- Use PascalCase for class names. This is also a JavaScript convention.
- Always use semicolons at the end of statements, because that's good practice.
- Prefer `const` over `let`, and never use `var`, because `var` has function scope
  which can cause bugs, while `const` and `let` have block scope.
- Write comments for complex logic so other developers can understand it.
- Keep functions small and focused on a single responsibility (Single Responsibility
  Principle from SOLID).
- Use async/await instead of raw Promise chains, because it reads more like synchronous
  code and is easier to follow.
- Indent with 2 spaces, not tabs, per the team's `.prettierrc`.

## Directory Structure

- `src/` — all source code lives here
- `src/routes/` — Express route handlers
- `src/services/` — business logic
- `src/repositories/` — database access code
- `tests/` — all test files
- `docs/` — project documentation
- `scripts/` — one-off utility scripts
- `.github/` — GitHub Actions workflows

## How to Run Tests

To run the test suite, use `npm test`. This runs Jest, which is a JavaScript testing
framework maintained by Meta. Jest is popular because of its zero-config setup and
built-in mocking. You can also run `npm run test:watch` to run tests in watch mode,
which re-runs tests automatically when files change — this is useful during active
development so you get instant feedback.

## Git Workflow

We use conventional commits: `type(scope): message`, e.g. `feat(auth): add login flow`.
Common types are `feat`, `fix`, `docs`, `refactor`, `test`, `chore`. Always write a
clear commit message that explains *why*, not just *what*. Open a pull request against
`develop`, never push directly to `main`. Someone else on the team should review your
PR before merging. Squash commits when merging to keep history clean.

## About Express

Express is the most popular Node.js web framework. It was created by TJ Holowaychuk
and is now maintained by the OpenJS Foundation. It provides a thin layer of
fundamental web application features, without obscuring Node.js features. Express
supports middleware, which are functions that have access to the request and response
objects. Middleware can execute code, modify request/response objects, end the
request-response cycle, and call the next middleware in the stack.

## About PostgreSQL

PostgreSQL, often just called Postgres, is an object-relational database that has been
in active development for over three decades. It's known for reliability, feature
robustness, and performance. Postgres supports both SQL (relational) and JSON
(non-relational) querying. It's ACID-compliant and supports complex queries, foreign
keys, triggers, updatable views, and transactional integrity.

## Deployment

We deploy on Railway. Railway is a deployment platform that lets you provision
infrastructure, develop with that infrastructure locally, and deploy it. Pushing to
`main` triggers an automatic deploy via a GitHub Actions workflow.

## Constraints

- Do not use `any` type in TypeScript files.
- Do not commit `.env` files — they contain secrets.
- Do not skip code review.
- Do not force-push to shared branches.
- Do not use `console.log` in production code — use the `logger` module instead.

## Context

- The team is distributed across three time zones, so prefer async communication
  (written PR descriptions, Slack threads) over requiring live meetings.
- We migrated from TypeORM to Prisma in Q3 2024 after a migration tool bug caused a
  schema drift incident. Prisma's explicit migration review step prevents a repeat.
- Redis cache keys must include the API version prefix (e.g. `v1:task:123`) — this
  was a real production incident where a version bump served stale cached data for
  two hours to a subset of users.

## A Note on AI Coding Assistants

We believe AI coding assistants like Claude Code are a huge productivity boost for
software teams. Studies show that AI pair programming can meaningfully reduce time
spent on boilerplate and repetitive tasks, letting engineers focus on architecture and
hard problems. We encourage every team member to experiment with Claude Code and share
tips in the `#ai-tools` Slack channel.
```

**Why this is bloated (120 lines)**: most of it explains things Claude Code already knows (what
Express is, what `const` vs `let` means, what conventional commits are) or things a human reads
once and never needs repeated (the "About This Project" preamble, the AI-tools pep talk). None of
it would make Claude write wrong code if deleted — it fails the S1 prune test line by line.

---

## After — pruned 45-line `CLAUDE.md` + 2 rule files (Exercise 1 solution)

`./CLAUDE.md` (28 lines):

```markdown
# CLAUDE.md

## Stack
Node.js 20, Express 4, PostgreSQL 16 via Prisma 5. Deploy: push to `main` → Railway.

## Structure
`src/routes/` → `src/services/` → `src/repositories/` → DB. Never skip a layer.

## Commands
- `npm test` — Jest, single run
- `npm run test:watch` — watch mode

## Git
Conventional commits (`type(scope): message`). PRs into `develop`, never push `main`
directly. Squash-merge.

## Constraints
- No `any` in TypeScript.
- Never commit `.env`.
- No `console.log` in production code — use `logger`.

## Context
- Prisma replaced TypeORM in Q3 2024 (TypeORM migration bug caused schema drift).
- Redis keys need the API version prefix (`v1:task:123`) — a version bump without it
  served stale cache for 2 hours in prod.

@docs/architecture.md
```

`.claude/rules/style.md` (9 lines, loads only when a matching file is opened):

```markdown
---
paths: ["src/**/*.ts", "src/**/*.tsx"]
---

# TypeScript style

- camelCase functions/variables, PascalCase classes, 2-space indent (`.prettierrc`).
- `const`/`let` only, never `var`. `async`/`await`, not raw `.then()` chains.
```

`.claude/rules/tests.md` (8 lines, loads only when a matching file is opened):

```markdown
---
paths: ["tests/**"]
---

# Test conventions

- Jest; one `test()` per behavior, named after the behavior.
```

**What changed**: the tech-explainer prose, the "About Express/About PostgreSQL" sections, and
the AI pep talk are gone (none survive the S1 prune test). What stayed either prevents a mistake
(constraints, gotchas) or answers something Claude can't infer by reading the code (the layering
rule, the deploy trigger). The style and test conventions moved to `.claude/rules/*.md` with
`paths:` so they load only when Claude actually opens a matching file, instead of taxing every
session.
