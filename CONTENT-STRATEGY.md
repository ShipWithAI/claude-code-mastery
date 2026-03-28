# ShipWithAI Content Strategy & Agent Team

## CONTENT TAXONOMY

Mỗi bài viết trên ShipWithAI thuộc 1 trong 8 content types. Phân loại dựa trên MỤC ĐÍCH chính của bài, không phải topic.

### 1. TUTORIAL (How-to / Hướng dẫn)
- **Mục đích**: Dạy 1 kỹ năng cụ thể, step-by-step
- **Format**: Problem → Solution → Steps → Result
- **Ví dụ**: "Claude Code Hooks Guide", "Context Window Guide"
- **Đặc điểm**: Có code blocks, numbered steps, expected output
- **Publish tại**: `/blog`
- **Tag bắt buộc**: `tutorial`
- **Frontmatter**: `category: tutorial`

### 2. OPINION (Nhận định / Contrarian Take)
- **Mục đích**: Đưa ra góc nhìn riêng, phản biện, thought leadership
- **Format**: Popular belief → Counter-argument → Evidence → Conclusion
- **Ví dụ**: "AI Won't End the World", "Why Everyone Is Wrong About..."
- **Đặc điểm**: Có thesis statement rõ ràng, dẫn chứng, tone mạnh
- **Publish tại**: `/blog`
- **Tag bắt buộc**: `opinion`
- **Frontmatter**: `category: opinion`

### 3. COMPARISON (So sánh)
- **Mục đích**: So sánh tools/approaches, giúp reader chọn
- **Format**: Criteria → Tool A vs B vs C → Verdict
- **Ví dụ**: "Claude Code vs Cursor vs Copilot"
- **Đặc điểm**: Có bảng so sánh, scoring, "Winner for X use case"
- **Publish tại**: `/blog`
- **Tag bắt buộc**: `comparison`
- **Frontmatter**: `category: comparison`

### 4. LISTICLE (Danh sách / Tips dài)
- **Mục đích**: Tổng hợp nhiều tips/mistakes/practices thành 1 bài
- **Format**: Intro → Item 1...N → Summary
- **Ví dụ**: "5 Claude Code Mistakes", "10 Things I Wish I Knew"
- **Đặc điểm**: Title có số, mỗi item độc lập, dễ scan
- **Publish tại**: `/blog`
- **Tag bắt buộc**: `listicle`
- **Frontmatter**: `category: listicle`

### 5. CASE STUDY (Câu chuyện thực)
- **Mục đích**: Kể lại 1 trải nghiệm thực, có số liệu cụ thể
- **Format**: Context → Challenge → Solution → Metrics/Result
- **Ví dụ**: "How I Shipped a Feature in 2 Hours", "Refactoring 50K Lines"
- **Đặc điểm**: Có timeline, before/after, số liệu cụ thể
- **Publish tại**: `/showcase`
- **Tag bắt buộc**: `case-study`
- **Frontmatter**: `category: case-study`

### 6. NEWS & ANALYSIS (Tin tức & Phân tích)
- **Mục đích**: Phân tích tính năng mới, update, industry trends
- **Format**: What happened → Why it matters → What to do
- **Ví dụ**: "Claude Code 2.0: What Changed", "Anthropic MCP Explained"
- **Đặc điểm**: Timely, có link source, phân tích impact
- **Publish tại**: `/blog`
- **Tag bắt buộc**: `news`
- **Frontmatter**: `category: news`

### 7. TIP (Mẹo nhanh)
- **Mục đích**: 1 trick cụ thể, đọc trong 2 phút
- **Format**: Problem (1 câu) → Solution (code/command) → Why it works
- **Ví dụ**: "Structure CLAUDE.md with 6 Sections", "Skip AI, Run Shell"
- **Đặc điểm**: Ngắn (200-400 từ), có code snippet, actionable ngay
- **Publish tại**: `/tips`
- **Tag bắt buộc**: `tip`

### 8. PROMPT RECIPE (Công thức prompt)
- **Mục đích**: Cung cấp prompt template copy-paste ready
- **Format**: Use case → Prompt → Expected result → Variations
- **Ví dụ**: "Legacy Code Untangler", "Surgical Code Review"
- **Đặc điểm**: Có prompt block, category, difficulty level
- **Publish tại**: `/prompts`
- **Tag bắt buộc**: `prompt-recipe`

---

## CLASSIFICATION RULES

Khi phân loại 1 bài viết, hỏi theo thứ tự:

1. Bài này có phải prompt template không? → **PROMPT RECIPE** → `/prompts`
2. Bài này có phải 1 trick ngắn dưới 400 từ không? → **TIP** → `/tips`
3. Bài này kể lại trải nghiệm thực với số liệu không? → **CASE STUDY** → `/showcase`
4. Bài này phân tích tin tức/update mới không? → **NEWS & ANALYSIS** → `/blog`
5. Title có chứa số (5 tips, 10 ways, 7 mistakes)? → **LISTICLE** → `/blog`
6. Bài này so sánh 2+ tools/approaches? → **COMPARISON** → `/blog`
7. Bài này đưa ra quan điểm cá nhân, phản biện? → **OPINION** → `/blog`
8. Bài này dạy step-by-step? → **TUTORIAL** → `/blog`

---

## AGENT TEAM STRUCTURE

Khi được yêu cầu tạo content, Claude Code agents work as a 5-agent team:

### Agent 1: Content Strategist
**Agent file**: `.claude/agents/content-strategist.md`
**Role**: Decides what to write, when, for whom
**Tools**: Read, Glob, Grep (read-only)

### Agent 2: Blog Writer (EN + VI)
**Agent file**: `.claude/agents/blog-writer.md`
**Role**: Writes all content types in both English and Vietnamese
**Tools**: Read, Glob, Grep, Edit, Write, Bash

### Agent 3: Course Writer
**Agent file**: `.claude/agents/course-writer.md`
**Role**: Writes course modules following 7-block structure
**Tools**: Read, Glob, Grep, Edit, Write, Bash

### Agent 4: SEO Optimizer
**Agent file**: `.claude/agents/seo-optimizer.md`
**Role**: Optimizes content for search and social sharing
**Tools**: Read, Glob, Grep (read-only)

### Agent 5: Quality Reviewer
**Agent file**: `.claude/agents/reviewer.md`
**Role**: Reviews content before publish
**Tools**: Read, Glob, Grep, Bash (read-only)

---

## EXISTING CONTENT CLASSIFICATION

### Blog Posts (`src/content/blog/`)
| File | Category |
|------|----------|
| `claude-code-hooks-guide.md` | tutorial |
| `claude-code-context-window-guide.md` | tutorial |
| `claude-code-for-code-review.md` | tutorial |
| `claude-code-legacy-refactoring.md` | tutorial |
| `think-plan-execute-pattern.md` | tutorial |
| `claude-code-vs-cursor-vs-copilot.md` | comparison |
| `ai-wont-end-the-world.md` | opinion |
| `5-claude-code-mistakes.md` | listicle |
| `why-claude-md-matters.md` | opinion |
| `claude-code-cost-optimization.md` | tutorial |
| `claude-code-rm-security.md` | tutorial |
| `claude-code-security-real-projects.md` | case-study |

### Tips (`src/content/tips/`)
| File | Notes |
|------|-------|
| `claude-md-six-sections.md` | Config tip |
| `compact-context-when-slow.md` | Performance tip |
| `skip-ai-run-shell.md` | Workflow tip |

### Prompts (`src/content/prompts/`)
| File | Notes |
|------|-------|
| `legacy-code-untangler.md` | Refactoring prompt |
| `surgical-code-review.md` | Review prompt |

### Showcase (`src/content/showcase/`)
| File | Notes |
|------|-------|
| `devmetrics-dashboard.md` | Dashboard case study |

---

## CONTENT GAPS

### Priority: HIGH
1. **TIPS** — Only 3 exist. Need 15-20 for a full /tips page
2. **PROMPT RECIPES** — Only 2 exist. Need 10-15 for common use cases
3. **CASE STUDIES** — Only 1 showcase. Need 3-5 real stories

### Priority: MEDIUM
4. **COMPARISON** — Only 1 post. Add: CC vs Windsurf, CC vs Aider
5. **NEWS & ANALYSIS** — Zero posts. Write when new features release

### Suggested Next Content

**Tips** (30 min each):
- "Use /compact Before Long Tasks"
- "Pin CLAUDE.md in Every Repo"
- "Read Error Messages First, Don't Guess"
- "Use Think Mode for Architecture Decisions"
- "Chain Commands with && for Atomic Operations"
- "Always Set Token Budget Alerts"
- "Use .claudeignore for Large Repos"
- "Prefix Prompts with Role for Better Output"
- "Use Plan Mode Before Refactoring"
- "Snapshot Before Risky Changes"

**Prompt Recipes** (30 min each):
- "Bug Detective" — Analyze error, find root cause
- "Test Generator" — Generate unit tests
- "API Doc Writer" — Generate API docs
- "Performance Profiler" — Find bottlenecks
- "Migration Planner" — Plan tech stack migration
- "Security Auditor" — Scan for vulnerabilities
- "Commit Message Crafter" — Conventional commits
- "README Generator" — Create README from codebase

**Blog Posts** (2-3 hours each):
- [COMPARISON] "Claude Code vs Windsurf"
- [COMPARISON] "Claude Code vs Aider"
- [TUTORIAL] "Build a REST API in 30 Minutes with Claude Code"
- [TUTORIAL] "Claude Code + GitHub Actions CI/CD Pipeline"
- [LISTICLE] "7 Claude Code Workflows That Save 10 Hours/Week"
- [OPINION] "Why Most AI Coding Tutorials Are Garbage"

---

## CONTENT CALENDAR TEMPLATE

| Week | Mon (EN) | Tue (VI) | Wed | Thu (EN) | Fri (VI) |
|------|----------|----------|-----|----------|----------|
| 1 | Blog: Tutorial | Blog: Tutorial (VI) | 2 Tips (EN+VI) | Prompt Recipe | Prompt Recipe (VI) |
| 2 | Blog: Opinion | Blog: Opinion (VI) | 2 Tips (EN+VI) | Prompt Recipe | Prompt Recipe (VI) |
| 3 | Blog: Comparison | Blog: Comparison (VI) | 2 Tips (EN+VI) | Showcase | Showcase (VI) |
| 4 | Blog: Listicle | Blog: Listicle (VI) | 2 Tips (EN+VI) | Prompt Recipe | Prompt Recipe (VI) |

**Monthly output**: 4 blog + 8 tips + 4-6 prompt recipes + 1 showcase = ~17-18 pieces

---

## TAG TAXONOMY

```
# Topics
claude-code, ai, automation, security, prompt-engineering,
hooks, mcp, context-window, refactoring, legacy-code,
testing, code-review, git, devops, kmp, android

# Content types
tutorial, opinion, comparison, listicle, case-study,
news, tip, prompt-recipe, best-practices

# Meta
beginner, intermediate, advanced, vietnamese, english
```
