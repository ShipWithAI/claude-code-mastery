---
title: 'CLAUDE.md Templates'
description: 'Get ready-to-use CLAUDE.md templates for common project types and adapt them for your specific stack.'
---

# Module 15.1: CLAUDE.md Templates

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Phase 4 (Prompt Engineering & Memory)
>
> **Outcome**: After this module, you will have a library of CLAUDE.md templates for common project types and know how to adapt them for your specific needs.

---

## 1. WHY — Why This Matters

Every new project, you start CLAUDE.md from scratch. What patterns should I include? What mistakes should I warn about? What conventions does this framework use? You spend 30 minutes writing CLAUDE.md when you could be coding.

Templates are pre-built CLAUDE.md files for specific project types. Start with a template that knows your framework, then customize for your project specifics. 30 minutes → 5 minutes.

---

## 2. CONCEPT — Core Ideas

### Template Structure

```markdown
# Project: [Name]

## Tech Stack
[Framework, language, tools]

## Architecture
[Folder structure, patterns]

## Conventions
[Naming, formatting, patterns to follow]

## Quality Standards
[Testing, error handling, documentation]

## Off-Limits
[What NOT to do]

## Examples
[Code examples for key patterns]
```

### Template Categories

| Category | Templates | Key Focus |
|----------|-----------|-----------|
| **Frontend** | React, Next.js, Vue | Component patterns, state, styling |
| **Backend** | Node/Express, FastAPI | API patterns, DB, auth |
| **Mobile** | React Native, Flutter | Platform-specific, navigation |
| **Data** | Python/Pandas | Analysis patterns, visualization |
| **Monorepo** | Turborepo, Nx | Package structure, shared code |

### Template Customization Flow

```text
1. Choose base template for your stack
2. Add project-specific conventions
3. Add team preferences
4. Add examples from your codebase
5. Iterate as project evolves
```

### What Makes a Good Template

- Specific to framework/language
- Includes common patterns with examples
- Warns against anti-patterns
- Easy to customize
- Evolves with learnings

---

## 3. DEMO — Step by Step

### Template 1: Next.js 14 (App Router)

```markdown
# Project: [Your Next.js App]

## Tech Stack
- Next.js 14 with App Router
- TypeScript strict mode
- Tailwind CSS
- Prisma ORM

## Architecture
src/
├── app/           # App Router pages
├── components/    # React components
├── lib/           # Utilities
└── types/         # TypeScript types

## Conventions
- Components: PascalCase (UserProfile.tsx)
- Server Components by default
- 'use client' only when needed

## Patterns

### Server Action
```typescript
'use server'
export async function createUser(formData: FormData) {
  const validated = CreateUserSchema.parse(Object.fromEntries(formData));
  return prisma.user.create({ data: validated });
}
```

## Off-Limits
- ❌ Don't use pages/ directory
- ❌ Don't use getServerSideProps
- ❌ Don't use `any` type
```

### Template 2: Node.js API (Express + TypeScript)

```markdown
# Project: [Your API Name]

## Tech Stack
- Node.js 20 + Express
- TypeScript strict
- PostgreSQL + Prisma
- Zod for validation

## Architecture
src/
├── routes/        # Express handlers
├── services/      # Business logic
├── repositories/  # Data access
└── middleware/    # Express middleware

## Patterns

### Route Handler
```typescript
router.post('/users', validate(CreateUserSchema), async (req, res, next) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});
```

### Service Pattern
```typescript
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async create(data: CreateUserDTO): Promise<User> {
    return this.repository.create(data);
  }
}
```

## Off-Limits
- ❌ No business logic in routes
- ❌ No direct DB calls outside repositories
```

### Template 3: Monorepo (Turborepo / Nx)

**Root CLAUDE.md** (loaded on every `claude` invocation):

```markdown
# Project: [Monorepo Name]

## Workspace Structure
- packages/web — Next.js frontend (React, Tailwind)
- packages/api — Express backend (REST + GraphQL)
- packages/shared — Shared types and utilities
- packages/config — Shared ESLint, TypeScript, Tailwind configs

## Global Conventions
- TypeScript strict mode in ALL packages
- Shared types live in packages/shared ONLY — never duplicate
- No cross-package direct imports — use workspace protocol (e.g., `@repo/shared`)
- Commit format: `type(scope): message` where scope = package name
- Example: `feat(web): add dashboard page`

## Build & Dev Commands
- `turbo dev` — start all packages in dev mode
- `turbo build` — build in dependency order
- `turbo test` — run tests across all packages
- `turbo lint` — lint all packages

## Off-Limits
- NEVER create circular dependencies between packages
- NEVER put package-specific types in shared/
- NEVER access database directly outside packages/api
- NEVER modify turbo.json pipeline without team discussion
```

**Package-level CLAUDE.md** (`packages/web/CLAUDE.md` — lazy-loaded when Claude enters this directory):

```markdown
# Package: web (Next.js Frontend)

## Architecture
- App Router with Server Components by default
- Client Components only when interactivity needed (`'use client'`)
- Import shared types: `import { User } from '@repo/shared'`

## Conventions
- Styling: Tailwind CSS only, no CSS modules
- State: React Server Components for server state, Zustand for client state
- Data fetching: Server Components fetch directly, no useEffect for data

## Key Files
- src/app/layout.tsx — Root layout
- src/app/(dashboard)/ — Dashboard route group
- src/components/ — Shared components (PascalCase)

## Testing
- `npm test` — Jest + React Testing Library
- Test files: `*.test.tsx` next to component
```

**Key insight**: The root CLAUDE.md loads immediately on every session. Package-level CLAUDE.md files only load when Claude navigates into that package directory. This keeps context lean — Claude only knows about the package you're working in, plus the global rules.

### Using a Template

```text
Step 1: Copy template to your project root as CLAUDE.md
Step 2: Update Tech Stack with your actual versions
Step 3: Adjust Architecture to match your folder structure
Step 4: Add project-specific conventions
Step 5: Include real code examples from your codebase
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Template Selection

**Goal**: Choose and customize a template for your project.

**Instructions**:
1. Identify your most common project type
2. Select the matching template from this module
3. List 5 customizations you need
4. Apply those customizations

<details>
<summary>💡 Hint</summary>

Start with the closest template, don't build from scratch. Even 70% match saves significant time.

</details>

<details>
<summary>✅ Solution</summary>

Example for a Next.js e-commerce project:
1. Start with Next.js 14 template
2. Customizations needed:
   - Add Stripe integration patterns
   - Add cart state management
   - Add product schema examples
   - Add checkout flow conventions
   - Add inventory handling rules

</details>

### Exercise 2: Template Library

**Goal**: Build your personal template library.

**Instructions**:
1. Create templates for 3 project types you frequently use
2. Store in a personal templates folder or repository
3. Include: structure, conventions, examples, off-limits
4. Test each on a real project

<details>
<summary>💡 Hint</summary>

Good candidates: your most-used stack, your team's standard setup, your side project template.

</details>

<details>
<summary>✅ Solution</summary>

Template library structure:
```text
~/claude-templates/
├── nextjs-app.md
├── express-api.md
├── react-native.md
└── README.md (how to use)
```

Each template tested by starting a real project with it.

</details>

### Exercise 3: Template Sharing

**Goal**: Make a template shareable with your team.

**Instructions**:
1. Take your best-working template
2. Remove project-specific details
3. Add documentation for customization points
4. Share with team for feedback

<details>
<summary>💡 Hint</summary>

Mark customization points with [CUSTOMIZE] placeholders.

</details>

<details>
<summary>✅ Solution</summary>

Shareable template has:
- `[PROJECT_NAME]` placeholder in title
- `[YOUR_CONVENTIONS]` markers for team-specific rules
- Comments explaining why each section matters
- Examples that are generic but realistic

</details>

---

## 5. CHEAT SHEET

### Template Structure

```markdown
# Project: [Name]
## Tech Stack
## Architecture
## Conventions
## Patterns (with examples)
## Off-Limits
## Quality Standards
```

### Essential Sections

| Section | Purpose |
|---------|---------|
| Tech Stack | What tools/frameworks/versions |
| Architecture | Folder structure |
| Conventions | Naming, patterns |
| Examples | Real code snippets |
| Off-Limits | Anti-patterns to avoid |

### Template Sources

- Official framework documentation
- Popular open-source projects
- Your team's best existing projects
- Community CLAUDE.md repositories

### Customization Priority

1. Update tech stack versions
2. Match your folder structure
3. Add team conventions
4. Include your code examples
5. Add project-specific off-limits

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Generic template for all projects | Stack-specific templates |
| No code examples | Examples are essential for Claude |
| Template never updated | Evolve with project learnings |
| Too much detail | Focus on what Claude needs |
| Missing off-limits | Prevent mistakes explicitly |
| Copy without customizing | Always adapt to your project |
| Only rules, no reasoning | Explain why for complex rules |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese development agency works on 10+ Next.js projects per year. Each developer wrote their own CLAUDE.md — inconsistent quality, missed patterns, repeated mistakes.

**Solution: Template Library**

```text
/templates
├── nextjs-app-router.md      # Standard Next.js 14
├── nextjs-ecommerce.md       # E-commerce specific
├── nodejs-api.md             # Backend API
├── react-native-app.md       # Mobile
└── monorepo-turborepo.md     # Monorepo projects
```

**Implementation**:
- Week 1: Collected best practices from senior developers
- Week 2: Created 5 core templates with real examples
- Week 3: Trained team on template usage
- Week 4: Feedback loop for continuous improvement

**Results**:
- New project setup: 2 hours → 15 minutes
- Claude output consistency: dramatically improved
- Junior developers match senior patterns
- Templates improved monthly from team feedback

**Quote**: "Templates aren't about being lazy. They're about encoding our best practices so every project starts at our highest standard."

---

> **Next**: [Module 15.2: Command & Prompt Templates](../02-command-prompt-templates/) →
