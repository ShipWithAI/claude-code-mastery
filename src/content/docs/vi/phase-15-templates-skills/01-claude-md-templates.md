---
title: 'CLAUDE.md Templates'
description: 'Bộ sưu tập CLAUDE.md templates cho các loại dự án: frontend, backend, mobile, KMP và monorepo.'
---

# Module 15.1: CLAUDE.md Templates

> **Thời gian ước tính**: ~30 phút
>
> **Yêu cầu trước**: Phase 4 (Prompt Engineering & Memory)
>
> **Kết quả**: Sau module này, bạn sẽ có library CLAUDE.md template cho common project type và biết adapt cho specific need.

---

## 1. WHY — Tại sao cần học

Mỗi project mới, bạn start CLAUDE.md từ scratch. Pattern nào include? Mistake nào warn? Convention framework nào? Bạn mất 30 phút viết CLAUDE.md thay vì coding.

Template là pre-built CLAUDE.md cho specific project type. Start với template biết framework của bạn, customize cho project specific. 30 phút → 5 phút.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Template Structure

```markdown
# Project: [Name]

## Tech Stack
[Framework, language, tools]

## Architecture
[Folder structure, patterns]

## Conventions
[Naming, formatting, patterns]

## Quality Standards
[Testing, error handling]

## Off-Limits
[What NOT to do]

## Examples
[Code examples for key patterns]
```

### Template Category

| Category | Templates | Focus |
|----------|-----------|-------|
| **Frontend** | React, Next.js, Vue | Component pattern, state |
| **Backend** | Node/Express, FastAPI | API pattern, DB |
| **Mobile** | React Native, Flutter | Platform-specific |
| **Data** | Python/Pandas | Analysis pattern |
| **Monorepo** | Turborepo, Nx | Package structure |

### Customization Flow

```text
1. Chọn base template cho stack
2. Thêm project-specific convention
3. Thêm team preference
4. Thêm example từ codebase
5. Iterate khi project evolve
```

### Good Template Characteristic

- Specific cho framework/language
- Include common pattern với example
- Warn against anti-pattern
- Dễ customize
- Evolve với learning

---

## 3. DEMO — Từng bước cụ thể

### Template 1: Next.js 14 (App Router)

```markdown
# Project: [Your Next.js App]

## Tech Stack
- Next.js 14 với App Router
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
- 'use client' chỉ khi cần

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
- ❌ Không dùng pages/ directory
- ❌ Không dùng getServerSideProps
- ❌ Không dùng `any` type
```

### Template 2: Node.js API (Express + TypeScript)

```markdown
# Project: [Your API Name]

## Tech Stack
- Node.js 20 + Express
- TypeScript strict
- PostgreSQL + Prisma
- Zod validation

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
- ❌ Không để business logic trong routes
- ❌ Không gọi DB trực tiếp ngoài repositories
```

### Template 3: Monorepo (Turborepo / Nx)

**Root CLAUDE.md** (được load mỗi khi chạy `claude`):

```markdown
# Project: [Tên Monorepo]

## Cấu Trúc Workspace
- packages/web — Next.js frontend (React, Tailwind)
- packages/api — Express backend (REST + GraphQL)
- packages/shared — Shared types và utilities
- packages/config — Shared ESLint, TypeScript, Tailwind configs

## Quy Tắc Chung
- TypeScript strict mode trong TẤT CẢ packages
- Shared types chỉ nằm trong packages/shared — không bao giờ duplicate
- Không import trực tiếp giữa packages — dùng workspace protocol (`@repo/shared`)
- Commit format: `type(scope): message` trong đó scope = tên package
- Ví dụ: `feat(web): add dashboard page`

## Lệnh Build & Dev
- `turbo dev` — khởi động tất cả packages ở dev mode
- `turbo build` — build theo thứ tự dependency
- `turbo test` — chạy test toàn bộ packages
- `turbo lint` — lint tất cả packages

## Không Được Phép
- KHÔNG BAO GIỜ tạo circular dependencies giữa packages
- KHÔNG BAO GIỜ đặt types riêng của package vào shared/
- KHÔNG BAO GIỜ truy cập database trực tiếp ngoài packages/api
- KHÔNG BAO GIỜ sửa turbo.json pipeline mà không thảo luận với team
```

**Package-level CLAUDE.md** (`packages/web/CLAUDE.md` — lazy-load khi Claude vào thư mục này):

```markdown
# Package: web (Next.js Frontend)

## Kiến Trúc
- App Router với Server Components mặc định
- Client Components chỉ khi cần tương tác (`'use client'`)
- Import shared types: `import { User } from '@repo/shared'`

## Quy Tắc
- Styling: chỉ Tailwind CSS, không CSS modules
- State: React Server Components cho server state, Zustand cho client state
- Data fetching: Server Components fetch trực tiếp, không useEffect cho data

## File Quan Trọng
- src/app/layout.tsx — Root layout
- src/app/(dashboard)/ — Dashboard route group
- src/components/ — Shared components (PascalCase)

## Testing
- `npm test` — Jest + React Testing Library
- Test files: `*.test.tsx` cạnh component
```

**Điểm mấu chốt**: Root CLAUDE.md được load ngay khi bắt đầu session. Các CLAUDE.md cấp package chỉ load khi Claude điều hướng vào thư mục package đó. Điều này giữ context gọn nhẹ — Claude chỉ biết về package bạn đang làm việc, cộng với các quy tắc chung.

### Sử dụng Template

```text
Bước 1: Copy template vào project root thành CLAUDE.md
Bước 2: Update Tech Stack với version thực tế
Bước 3: Adjust Architecture theo folder structure
Bước 4: Thêm project-specific convention
Bước 5: Include real code example từ codebase
```

---

## 4. PRACTICE — Luyện tập

### Bài 1: Template Selection

**Mục tiêu**: Chọn và customize template cho project.

**Hướng dẫn**:
1. Identify project type phổ biến nhất của bạn
2. Select template phù hợp từ module này
3. List 5 customization bạn cần
4. Apply những customization đó

<details>
<summary>💡 Gợi ý</summary>

Start với template gần nhất, đừng build từ scratch. Even 70% match tiết kiệm significant time.

</details>

<details>
<summary>✅ Giải pháp</summary>

Ví dụ cho Next.js e-commerce:
1. Start với Next.js 14 template
2. Customization cần:
   - Thêm Stripe integration pattern
   - Thêm cart state management
   - Thêm product schema example
   - Thêm checkout flow convention
   - Thêm inventory handling rule

</details>

### Bài 2: Template Library

**Mục tiêu**: Build personal template library.

**Hướng dẫn**:
1. Tạo template cho 3 project type bạn hay dùng
2. Store trong personal templates folder
3. Include: structure, convention, example, off-limits
4. Test mỗi template trên real project

<details>
<summary>💡 Gợi ý</summary>

Good candidate: stack dùng nhiều nhất, team standard setup, side project template.

</details>

<details>
<summary>✅ Giải pháp</summary>

Template library structure:
```text
~/claude-templates/
├── nextjs-app.md
├── express-api.md
├── react-native.md
└── README.md (cách sử dụng)
```

Mỗi template được test bằng cách start real project với nó.

</details>

### Bài 3: Template Sharing

**Mục tiêu**: Tạo template shareable với team.

**Hướng dẫn**:
1. Lấy template hoạt động tốt nhất của bạn
2. Remove project-specific detail
3. Thêm documentation cho customization point
4. Share với team để lấy feedback

<details>
<summary>💡 Gợi ý</summary>

Mark customization point với [CUSTOMIZE] placeholder.

</details>

<details>
<summary>✅ Giải pháp</summary>

Shareable template có:
- `[PROJECT_NAME]` placeholder trong title
- `[YOUR_CONVENTIONS]` marker cho team-specific rule
- Comment giải thích tại sao mỗi section quan trọng
- Example generic nhưng realistic

</details>

---

## 5. CHEAT SHEET

### Template Structure

```markdown
# Project: [Name]
## Tech Stack
## Architecture
## Conventions
## Patterns (với examples)
## Off-Limits
## Quality Standards
```

### Essential Section

| Section | Purpose |
|---------|---------|
| Tech Stack | Tool/framework/version |
| Architecture | Folder structure |
| Conventions | Naming, pattern |
| Examples | Real code snippet |
| Off-Limits | Anti-pattern tránh |

### Template Source

- Official framework documentation
- Popular open-source project
- Team's best existing project
- Community CLAUDE.md repository

### Customization Priority

1. Update tech stack version
2. Match folder structure
3. Thêm team convention
4. Include your code example
5. Thêm project-specific off-limits

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Generic template cho mọi project | Stack-specific template |
| Không có code example | Example essential cho Claude |
| Template không bao giờ update | Evolve với project learning |
| Quá nhiều chi tiết | Focus vào cái Claude cần |
| Thiếu off-limits | Prevent mistake explicitly |
| Copy không customize | Luôn adapt cho project |
| Chỉ có rule, không có lý do | Explain reasoning cho complex rule |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Agency Việt Nam làm 10+ Next.js project/năm. Mỗi developer viết CLAUDE.md riêng — inconsistent quality, missed pattern, repeated mistake.

**Solution: Template Library**

```text
/templates
├── nextjs-app-router.md      # Standard Next.js 14
├── nextjs-ecommerce.md       # E-commerce specific
├── nodejs-api.md             # Backend API
├── react-native-app.md       # Mobile
└── monorepo-turborepo.md     # Monorepo project
```

**Implementation**:
- Tuần 1: Collect best practice từ senior developer
- Tuần 2: Create 5 core template với real example
- Tuần 3: Train team về template usage
- Tuần 4: Feedback loop cho continuous improvement

**Kết quả**:
- Setup project mới: 2 giờ → 15 phút
- Claude output consistency: dramatically improved
- Junior developer match senior pattern
- Template improved monthly từ team feedback

**Quote**: "Template không phải về lazy. Về encode best practice để mọi project start ở highest standard của team."

---

> **Tiếp theo**: [Module 15.2: Templates lệnh & prompt](../02-command-prompt-templates/) →
