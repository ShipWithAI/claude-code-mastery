# Claude Code Mastery — Course Index

## About This Course

This is a comprehensive **16-phase, 64-module** course on mastering Claude Code (Anthropic's CLI coding agent). Available in **English** and **Vietnamese**.

When using this course as an AI knowledge base, **READ THIS FILE FIRST** to understand the structure, then reference specific lessons based on the user's question.

## Giới Thiệu

Đây là course toàn diện gồm **16 phases, 64 modules** về cách làm chủ Claude Code. Có cả bản **Tiếng Anh** và **Tiếng Việt**.

Khi dùng course này làm AI knowledge base, **HÃY ĐỌC FILE NÀY TRƯỚC** để hiểu cấu trúc, sau đó tham chiếu lessons cụ thể theo câu hỏi.

---

## How to Use This Index / Cách Dùng

- Each phase below lists its modules and key topics
- Mỗi phase bên dưới liệt kê modules và chủ đề chính
- Use this to find the RIGHT lesson for any question about Claude Code
- Dùng file này để tìm ĐÚNG lesson cho mọi câu hỏi về Claude Code
- Always cite the specific lesson number when answering
- Luôn trích dẫn số lesson cụ thể khi trả lời

## File Structure / Cấu Trúc File

```
src/content/docs/
├── en/phase-XX-name/       ← English lessons
│   ├── 01-module-name.md
│   └── ...
└── vi/phase-XX-name/       ← Vietnamese lessons
    ├── 01-module-name.md
    └── ...
```

- English lessons: `src/content/docs/en/phase-XX-name/XX-module.md`
- Vietnamese lessons: `src/content/docs/vi/phase-XX-name/XX-module.md`
- Content is the same in both languages — use whichever matches the user's language
- Some modules use `.mdx` extension for interactive components

---

## Course Map / Bản Đồ Course

### Phase 1: Foundation / Nền Tảng (`phase-01-foundation/`)

**EN:** `src/content/docs/en/phase-01-foundation/`
**VI:** `src/content/docs/vi/phase-01-foundation/`

- **Module 1.1 — Installation & Configuration** (`01-installation.md`)
  EN: Install Claude Code CLI, configure API keys, authenticate, and run your first command.
  VI: Cài đặt Claude Code CLI, cấu hình API key và thiết lập môi trường phát triển cho dự án đầu tiên.

- **Module 1.2 — Interfaces & Modes** (`02-interfaces-modes.md`)
  EN: Master Claude Code interactive, one-shot, and pipe modes to choose the right interface for any task.
  VI: Tìm hiểu các giao diện và chế độ hoạt động của Claude Code: interactive, one-shot và pipe mode.

- **Module 1.3 — Context Window Basics** (`03-context-basics.md`)
  EN: Understand Claude Code context windows, track token usage, and manage context limits effectively.
  VI: Hiểu cách context window hoạt động trong Claude Code, giới hạn token và chiến lược quản lý context.

---

### Phase 2: Security & Sandboxing / Bảo Mật (`phase-02-security/`)

**EN:** `src/content/docs/en/phase-02-security/`
**VI:** `src/content/docs/vi/phase-02-security/`

- **Module 2.1 — Threat Model** (`01-threat-model.md`)
  EN: Understand what Claude Code can access on your system, recognize attack scenarios, and assess your risk exposure.
  VI: Hiểu mô hình mối đe dọa, quyền truy cập hệ thống và rủi ro bảo mật khi sử dụng Claude Code.

- **Module 2.2 — Permission System Deep Dive** (`02-permission-system.md`)
  EN: Configure Claude Code permission levels, understand safety prompts, and set appropriate approval policies.
  VI: Phân tích chi tiết hệ thống permission của Claude Code: allow, deny và cấu hình quyền cho từng tool.

- **Module 2.3 — Sandbox Environments** (`03-sandbox.md`)
  EN: Run Claude Code in isolated Docker containers to limit blast radius and contain mistakes safely.
  VI: Thiết lập môi trường sandbox với Docker và container để giới hạn phạm vi ảnh hưởng của Claude Code.

- **Module 2.4 — Secret Management** (`04-secret-management.md`)
  EN: Prevent credential leaks in Claude Code sessions with secret management workflows and .env protection.
  VI: Bảo vệ API key, secret và thông tin nhạy cảm khỏi bị lộ qua Claude Code context window.

- **Module 2.5 — System Control** (`05-system-control.md`)
  EN: Build a security governance framework for Claude Code with CLAUDE.md policies and team safety guidelines.
  VI: Quản lý cấu hình hệ thống Claude Code qua CLAUDE.md, settings và chính sách governance cho team.

---

### Phase 3: Core Workflows / Quy trình Cốt lõi (`phase-03-core-workflows/`)

**EN:** `src/content/docs/en/phase-03-core-workflows/`
**VI:** `src/content/docs/vi/phase-03-core-workflows/`

- **Module 3.1 — Reading & Understanding Codebases** (`01-reading-codebases.md`)
  EN: Use Claude Code to rapidly understand unfamiliar codebases, map architecture, and identify key patterns.
  VI: Dùng Claude Code để đọc, hiểu và điều hướng codebase lớn với chiến lược 3 lớp hiệu quả.

- **Module 3.2 — Writing & Editing Code** (`02-writing-code.mdx`)
  EN: Write and edit code with Claude Code that matches your project conventions, patterns, and style.
  VI: Hướng dẫn viết code mới và sửa code hiện có với Claude Code: từ tạo file đến refactor phức tạp.

- **Module 3.3 — Git Integration** (`03-git-integration.md`)
  EN: Streamline your Git workflow with Claude Code for commits, merge conflicts, diffs, and PR management.
  VI: Tích hợp Claude Code với Git: tạo commit, quản lý branch, resolve conflict và tự động hóa git workflow.

- **Module 3.4 — Terminal & Shell Operations** (`04-terminal-shell.md`)
  EN: Execute, monitor, and chain terminal commands through Claude Code for intelligent shell automation.
  VI: Sử dụng Claude Code để chạy lệnh terminal, quản lý shell và tự động hóa tác vụ command-line.

---

### Phase 4: Prompt Engineering & Memory / Kỹ thuật Prompt & Bộ nhớ (`phase-04-prompt-memory/`)

**EN:** `src/content/docs/en/phase-04-prompt-memory/`
**VI:** `src/content/docs/vi/phase-04-prompt-memory/`

- **Module 4.1 — Prompting Techniques** (`01-prompting-techniques.md`)
  EN: Master prompt engineering for Claude Code with context, constraints, references, and iterative refinement.
  VI: Nắm vững kỹ thuật viết prompt hiệu quả cho Claude Code: từ cơ bản đến nâng cao với ví dụ thực tế.

- **Module 4.2 — CLAUDE.md — Project Memory** (`02-claude-md.md`)
  EN: Write a CLAUDE.md file that gives Claude Code deep knowledge of your project architecture and conventions.
  VI: Tạo và tối ưu file CLAUDE.md để Claude Code ghi nhớ quy tắc, kiến trúc và convention của dự án.

- **Module 4.3 — Slash Commands** (`03-slash-commands.md`)
  EN: Learn every Claude Code slash command for context management, session control, and efficient workflows.
  VI: Sử dụng slash commands trong Claude Code: /help, /compact, /clear, /cost và các lệnh tùy chỉnh.

- **Module 4.4 — Memory System** (`04-memory-system.md`)
  EN: Understand Claude Code memory architecture and design workflows for knowledge persistence across sessions.
  VI: Tìm hiểu hệ thống memory của Claude Code: cách lưu trữ, truy xuất và duy trì context qua các session.

---

### Phase 5: Context Mastery / Làm chủ Context (`phase-05-context-mastery/`)

**EN:** `src/content/docs/en/phase-05-context-mastery/`
**VI:** `src/content/docs/vi/phase-05-context-mastery/`

- **Module 5.1 — Controlling Context** (`01-controlling-context.md`)
  EN: Control what enters Claude Code context window and maintain high-quality output in long sessions.
  VI: Kiểm soát context window trong Claude Code: thêm, loại bỏ và ưu tiên thông tin để tối đa hiệu quả.

- **Module 5.2 — Context Optimization** (`02-context-optimization.md`)
  EN: Maximize Claude Code output quality per token with session planning, context priming, and compaction.
  VI: Chiến lược tối ưu context window trong Claude Code: giảm token, compact hiệu quả và tránh tràn context.

- **Module 5.3 — Image & Visual Context** (`03-image-context.md`)
  EN: Use screenshots, UI mockups, and diagrams as visual context in Claude Code for precise responses.
  VI: Sử dụng hình ảnh, screenshot và diagram làm context cho Claude Code để phân tích UI và thiết kế.

---

### Phase 6: Thinking & Planning Modes / Chế độ Suy nghĩ & Lên kế hoạch (`phase-06-thinking-planning/`)

**EN:** `src/content/docs/en/phase-06-thinking-planning/`
**VI:** `src/content/docs/vi/phase-06-thinking-planning/`

- **Module 6.1 — Think Mode (Extended Thinking)** (`01-think-mode.mdx` / VI: `01-think-mode.md`)
  EN: Activate Claude Code extended thinking for deeper reasoning on complex debugging and architecture tasks.
  VI: Kích hoạt Think Mode trong Claude Code để giải quyết bài toán phức tạp với extended thinking.

- **Module 6.2 — Plan Mode** (`02-plan-mode.md`)
  EN: Use Claude Code Plan Mode to create execution plans before coding, with step-by-step checkpoints.
  VI: Dùng Plan Mode trong Claude Code để lập kế hoạch trước khi code, phân tích và thiết kế giải pháp.

- **Module 6.3 — Think + Plan Combo** (`03-think-plan-combo.md`)
  EN: Combine Think and Plan modes in Claude Code for the most powerful workflow on complex software tasks.
  VI: Kết hợp Think Mode và Plan Mode trong Claude Code để xử lý task phức tạp với chiến lược tối ưu.

---

### Phase 7: Multi-Agent & Full Auto / Đa tác tử & Tự động hoàn toàn (`phase-07-multi-agent-auto/`)

**EN:** `src/content/docs/en/phase-07-multi-agent-auto/`
**VI:** `src/content/docs/vi/phase-07-multi-agent-auto/`

- **Module 7.1 — Auto Coding Levels** (`01-auto-coding-levels.md`)
  EN: Understand Claude Code automation levels from manual to full auto and configure each for your risk tolerance.
  VI: Tìm hiểu các cấp độ tự động hóa coding trong Claude Code: từ suggest đến full auto mode.

- **Module 7.2 — Full Auto Workflow** (`02-full-auto-workflow.md`)
  EN: Run Claude Code in Full Auto mode safely with pre-flight checks, guardrails, and post-execution verification.
  VI: Thiết lập và vận hành quy trình full auto coding với Claude Code cho các task end-to-end.

- **Module 7.3 — Multi-Agent Architecture** (`03-multi-agent-architecture.md`)
  EN: Learn multi-agent patterns for Claude Code orchestration using one-shot mode and bash scripting.
  VI: Hiểu kiến trúc multi-agent trong Claude Code: orchestrator, sub-agent và mô hình phân công task.

- **Module 7.4 — Agentic Loop Patterns** (`04-agentic-loops.md`)
  EN: Recognize agentic loop patterns in Claude Code, prompt for specific behaviors, and break unproductive loops.
  VI: Các mẫu agentic loop trong Claude Code: vòng lặp tự sửa lỗi, verify-and-retry và iterative coding.

- **Module 7.5 — Orchestration Tools** (`05-orchestration-tools.md`)
  EN: Explore Claude Code orchestration tools, write multi-agent coordination scripts, and scale automation.
  VI: Công cụ điều phối multi-agent trong Claude Code: Task tool, background agent và coordination patterns.

---

### Phase 8: Meta-Debugging / Debug AI (`phase-08-meta-debugging/`)

**EN:** `src/content/docs/en/phase-08-meta-debugging/`
**VI:** `src/content/docs/vi/phase-08-meta-debugging/`

- **Module 8.1 — Hallucination Detection & Prevention** (`01-hallucination-detection.mdx`)
  EN: Detect and prevent AI hallucinations in Claude Code output to protect your projects from incorrect code.
  VI: Nhận diện và phòng tránh hallucination trong Claude Code: API giả, lệnh không tồn tại và cách xác minh.

- **Module 8.2 — Loop Detection & Breaking** (`02-loop-detection.md`)
  EN: Recognize stuck loop patterns in Claude Code and apply intervention strategies without losing progress.
  VI: Phát hiện khi Claude Code bị kẹt vòng lặp vô hạn và kỹ thuật phá loop để tiếp tục làm việc.

- **Module 8.3 — Context Confusion** (`03-context-confusion.md`)
  EN: Recognize context confusion symptoms in Claude Code and use /compact and /clear to restore clarity.
  VI: Xử lý khi Claude Code bị lẫn context: triệu chứng, nguyên nhân và cách reset để phục hồi độ chính xác.

- **Module 8.4 — Quality Assessment** (`04-quality-assessment.md`)
  EN: Systematically assess Claude Code output quality with acceptance checklists and improvement strategies.
  VI: Đánh giá chất lượng output của Claude Code: tiêu chí kiểm tra, scoring và khi nào cần can thiệp.

- **Module 8.5 — Emergency Procedures** (`05-emergency-procedures.md`)
  EN: Handle Claude Code emergencies with recovery commands, rollback procedures, and quick-action playbooks.
  VI: Quy trình xử lý khẩn cấp khi Claude Code gây lỗi nghiêm trọng: rollback, recover và damage control.

---

### Phase 9: Legacy Code & Brownfield / Code cũ & Dự án Brownfield (`phase-09-legacy-brownfield/`)

**EN:** `src/content/docs/en/phase-09-legacy-brownfield/`
**VI:** `src/content/docs/vi/phase-09-legacy-brownfield/`

- **Module 9.1 — Archeology Mode** (`01-archeology-mode.md`)
  EN: Excavate legacy codebases with Claude Code using systematic exploration and mental model building.
  VI: Dùng Claude Code để khám phá và hiểu legacy codebase: phân tích kiến trúc, dependency và business logic.

- **Module 9.2 — Incremental Refactoring** (`02-incremental-refactoring.md`)
  EN: Refactor legacy code safely with Claude Code using the incremental refactor-test-commit workflow.
  VI: Chiến lược refactoring an toàn với Claude Code: thay đổi từng bước nhỏ, giữ hệ thống luôn chạy được.

- **Module 9.3 — Legacy Test Generation** (`03-legacy-test-generation.md`)
  EN: Generate characterization tests for legacy code with Claude Code before refactoring safely.
  VI: Dùng Claude Code để tạo test cho legacy code chưa có test: characterization test và safety net testing.

- **Module 9.4 — Tech Debt Analysis** (`04-tech-debt-analysis.md`)
  EN: Analyze and prioritize tech debt with Claude Code to create actionable improvement roadmaps.
  VI: Phân tích và ưu tiên tech debt với Claude Code: phát hiện code smell, đo lường và lập kế hoạch trả nợ.

---

### Phase 10: Team Collaboration / Cộng tác Team (`phase-10-team-collaboration/`)

**EN:** `src/content/docs/en/phase-10-team-collaboration/`
**VI:** `src/content/docs/vi/phase-10-team-collaboration/`

- **Module 10.1 — Team CLAUDE.md** (`01-team-claude-md.md`)
  EN: Create and maintain a shared CLAUDE.md for consistent Claude Code behavior across your entire team.
  VI: Thiết lập CLAUDE.md dùng chung cho team: chuẩn hóa convention, chia sẻ context và đồng bộ quy tắc.

- **Module 10.2 — Git Conventions** (`02-git-conventions.md`)
  EN: Establish git conventions for AI-assisted development with Claude Code commit attribution best practices.
  VI: Thiết lập quy ước Git khi làm việc với Claude Code: commit message, branch naming và merge strategy.

- **Module 10.3 — Code Review Protocol** (`03-code-review-protocol.md`)
  EN: Review AI-generated code effectively and use Claude Code as a code review assistant for your team.
  VI: Quy trình code review với Claude Code: tự động review, checklist và tích hợp vào PR workflow.

- **Module 10.4 — Knowledge Sharing** (`04-knowledge-sharing.md`)
  EN: Share Claude Code knowledge across teams with prompt libraries and learning loops from mistakes.
  VI: Chia sẻ kiến thức trong team qua Claude Code: tạo doc tự động, onboarding và knowledge base.

- **Module 10.5 — Governance & Policy** (`05-governance-policy.md`)
  EN: Create AI usage policies for Claude Code that balance team innovation with risk management.
  VI: Xây dựng chính sách quản trị sử dụng Claude Code trong tổ chức: compliance, audit và access control.

---

### Phase 11: Automation & Headless / Tự động hóa (`phase-11-automation-headless/`)

**EN:** `src/content/docs/en/phase-11-automation-headless/`
**VI:** `src/content/docs/vi/phase-11-automation-headless/`

- **Module 11.1 — Headless Mode** (`01-headless-mode.md`)
  EN: Run Claude Code in headless mode for scripted automation, batch processing, and CI/CD pipelines.
  VI: Chạy Claude Code ở chế độ headless: tự động hóa không cần tương tác, pipe mode và scripting.

- **Module 11.2 — SDK Integration** (EN: `02-claude-code-sdk.mdx` / VI: `02-claude-code-sdk.md`)
  EN: Integrate Claude Code into Node.js and Python applications via SDK or subprocess for programmatic use.
  VI: Tích hợp Claude Code SDK vào ứng dụng: TypeScript/Python API, streaming và programmatic access.

- **Module 11.3 — Hooks System** (`03-hooks-system.md`)
  EN: Implement Claude Code hooks for custom pre/post-action workflows, validation, and automation triggers.
  VI: Cấu hình hooks trong Claude Code: pre/post command hooks, notification và custom automation triggers.

- **Module 11.4 — GitHub Actions Integration** (`04-github-actions.md`)
  EN: Build production-ready GitHub Actions workflows with Claude Code for automated PR reviews and CI tasks.
  VI: Tích hợp Claude Code vào GitHub Actions: tự động review PR, generate code và CI/CD pipeline.

- **Module 11.5 — MCP (Model Context Protocol)** (`05-mcp.md`)
  EN: Connect Claude Code to MCP servers to extend capabilities with external tools and data sources.
  VI: Tìm hiểu Model Context Protocol (MCP) trong Claude Code: kết nối external tools, database và API.

---

### Phase 12: n8n & Workflow Integration / Tích hợp n8n (`phase-12-n8n-workflows/`)

**EN:** `src/content/docs/en/phase-12-n8n-workflows/`
**VI:** `src/content/docs/vi/phase-12-n8n-workflows/`

- **Module 12.1 — Claude Code + n8n** (`01-claude-code-n8n.md`)
  EN: Trigger Claude Code from n8n workflows and build visual AI automation pipelines for development tasks.
  VI: Kết nối Claude Code với n8n để tạo workflow tự động hóa: trigger, xử lý và tích hợp đa hệ thống.

- **Module 12.2 — Workflow Patterns** (`02-workflow-patterns.md`)
  EN: Learn 6 reusable n8n workflow patterns for Claude Code automation and combine them for complex scenarios.
  VI: Các mẫu workflow phổ biến với Claude Code và n8n: auto-deploy, monitoring và report generation.

- **Module 12.3 — n8n + SDK Orchestration** (`03-n8n-sdk-orchestration.md`)
  EN: Combine n8n with Claude Code SDK for advanced multi-step orchestration and complex automation pipelines.
  VI: Kết hợp n8n với Claude Code SDK để điều phối workflow phức tạp: multi-step automation và orchestration.

---

### Phase 13: Data & Analysis / Dữ liệu & Phân tích (`phase-13-data-analysis/`)

**EN:** `src/content/docs/en/phase-13-data-analysis/`
**VI:** `src/content/docs/vi/phase-13-data-analysis/`

- **Module 13.1 — Data Analysis** (`01-data-analysis.md`)
  EN: Use Claude Code for exploratory data analysis with prompting patterns for CSV, JSON, and SQL data.
  VI: Dùng Claude Code để phân tích dữ liệu: đọc CSV/JSON, thống kê, trực quan hóa và rút ra insight.

- **Module 13.2 — Report Generation** (`02-report-generation.md`)
  EN: Generate complete data reports with Claude Code using templates and export to multiple formats.
  VI: Tự động sinh báo cáo với Claude Code: từ dữ liệu thô đến báo cáo Markdown, HTML và PDF chuyên nghiệp.

- **Module 13.3 — Log & Error Analysis** (`03-log-error-analysis.md`)
  EN: Analyze log files with Claude Code to identify error patterns, perform root cause analysis, and generate reports.
  VI: Dùng Claude Code để phân tích log file, tìm root cause lỗi và tạo báo cáo incident tự động.

---

### Phase 14: Optimization & Performance / Tối ưu hóa (`phase-14-optimization/`)

**EN:** `src/content/docs/en/phase-14-optimization/`
**VI:** `src/content/docs/vi/phase-14-optimization/`

- **Module 14.1 — Task Optimization** (`01-task-optimization.md`)
  EN: Structure tasks optimally for Claude Code with the right granularity to avoid common framing mistakes.
  VI: Tối ưu cách chia task và giao việc cho Claude Code: task decomposition, batching và prioritization.

- **Module 14.2 — Speed Optimization** (`02-speed-optimization.md`)
  EN: Reduce Claude Code response time with speed optimization techniques and understand quality tradeoffs.
  VI: Tăng tốc độ làm việc với Claude Code: parallel execution, caching context và giảm latency.

- **Module 14.3 — Quality Optimization** (`03-quality-optimization.mdx`)
  EN: Improve Claude Code output quality with configuration techniques and quality/speed tradeoff strategies.
  VI: Nâng cao chất lượng output của Claude Code: prompt engineering nâng cao, verification và iteration.

- **Module 14.4 — Cost Optimization** (`04-cost-optimization.md`)
  EN: Track and reduce Claude Code costs with pricing strategies, token budgeting, and model selection tips.
  VI: Giảm chi phí sử dụng Claude Code: tiết kiệm token, chọn model phù hợp và theo dõi usage hiệu quả.

---

### Phase 15: Templates, Skills & Ecosystem / Templates & Hệ sinh thái (`phase-15-templates-skills/`)

**EN:** `src/content/docs/en/phase-15-templates-skills/`
**VI:** `src/content/docs/vi/phase-15-templates-skills/`

- **Module 15.1 — CLAUDE.md Templates** (`01-claude-md-templates.md`)
  EN: Get ready-to-use CLAUDE.md templates for common project types and adapt them for your specific stack.
  VI: Bộ sưu tập CLAUDE.md templates cho các loại dự án: frontend, backend, mobile, KMP và monorepo.

- **Module 15.2 — Command & Prompt Templates** (`02-command-prompt-templates.md`)
  EN: Build a reusable prompt template library for Claude Code common tasks like refactoring and debugging.
  VI: Bộ templates prompt và lệnh tái sử dụng cho Claude Code: code review, debugging và feature development.

- **Module 15.3 — Claude Code Skills** (`03-claude-code-skills.md`)
  EN: Find, install, and use Claude Code Skills to extend capabilities with community-built enhancements.
  VI: Tìm hiểu Claude Code Skills: custom slash commands, automated workflows và reusable skill patterns.

- **Module 15.4 — Community Ecosystem** (`04-community-ecosystem.md`)
  EN: Discover Claude Code community resources, evaluate third-party tools, and contribute to the ecosystem.
  VI: Khám phá hệ sinh thái Claude Code: community tools, extensions, shared skills và best practices.

- **Module 15.5 — Custom Skill Development** (`05-custom-skill-development.md`)
  EN: Design, build, test, and distribute custom Skills to extend Claude Code for your team and community.
  VI: Hướng dẫn tạo custom skill cho Claude Code: thiết kế, implement, test và chia sẻ skill của riêng bạn.

---

### Phase 16: Real-World Mastery / Thực chiến (`phase-16-real-world-mastery/`)

**EN:** `src/content/docs/en/phase-16-real-world-mastery/`
**VI:** `src/content/docs/vi/phase-16-real-world-mastery/`

- **Module 16.1 — Case Studies** (`01-case-studies.md`)
  EN: Real-world Claude Code case studies showing successful implementations across diverse project types.
  VI: Case studies thực tế sử dụng Claude Code trong production: bài học, kết quả và chiến lược áp dụng.

- **Module 16.2 — Role-Specific Workflows** (`02-role-workflows.md`)
  EN: Customize Claude Code workflows for your specific role: frontend, backend, mobile, DevOps, or lead.
  VI: Workflow Claude Code tối ưu cho từng vai trò: frontend, backend, mobile, DevOps và tech lead.

- **Module 16.3 — Teaching & Workshop Design** (`03-teaching-workshop.md`)
  EN: Design and deliver Claude Code training workshops for teams with proven curriculum and exercises.
  VI: Hướng dẫn thiết kế workshop dạy Claude Code: cấu trúc buổi học, bài tập thực hành và tài liệu đi kèm.

---

## Quick Reference / Tra Cứu Nhanh

### Common Questions → Lessons / Câu hỏi thường gặp → Bài học

**Getting Started / Bắt đầu:**

1. "How to install Claude Code?" / "Cài đặt Claude Code thế nào?"
   → **Module 1.1** — Installation & Configuration

2. "What are the different modes?" / "Claude Code có những chế độ nào?"
   → **Module 1.2** — Interfaces & Modes

3. "What is the context window?" / "Context window là gì?"
   → **Module 1.3** — Context Window Basics

**Security / Bảo mật:**

4. "Is Claude Code safe to use?" / "Dùng Claude Code có an toàn không?"
   → **Module 2.1** — Threat Model + **Module 2.2** — Permission System

5. "How to protect my API keys?" / "Bảo vệ API key thế nào?"
   → **Module 2.4** — Secret Management

6. "How to run Claude Code in a sandbox?" / "Chạy Claude Code trong sandbox?"
   → **Module 2.3** — Sandbox Environments

**Writing Code / Viết code:**

7. "How to read a large codebase?" / "Đọc codebase lớn thế nào?"
   → **Module 3.1** — Reading & Understanding Codebases

8. "How to write code with Claude Code?" / "Viết code bằng Claude Code?"
   → **Module 3.2** — Writing & Editing Code

9. "How to use Claude Code with Git?" / "Dùng Claude Code với Git?"
   → **Module 3.3** — Git Integration

**Prompting / Prompt:**

10. "How to write better prompts?" / "Viết prompt tốt hơn thế nào?"
    → **Module 4.1** — Prompting Techniques

11. "What is CLAUDE.md?" / "CLAUDE.md là gì?"
    → **Module 4.2** — CLAUDE.md — Project Memory

12. "What slash commands are available?" / "Có những slash command nào?"
    → **Module 4.3** — Slash Commands

**Context / Context:**

13. "How to handle large codebases in context?" / "Xử lý codebase lớn trong context?"
    → **Module 5.1** — Controlling Context + **Module 5.2** — Context Optimization

14. "Can Claude Code understand images?" / "Claude Code có hiểu hình ảnh không?"
    → **Module 5.3** — Image & Visual Context

**Advanced Modes / Chế độ nâng cao:**

15. "What is Think Mode?" / "Think Mode là gì?"
    → **Module 6.1** — Think Mode (Extended Thinking)

16. "How to use Plan Mode?" / "Dùng Plan Mode thế nào?"
    → **Module 6.2** — Plan Mode

17. "How to use multi-agent?" / "Dùng multi-agent ra sao?"
    → **Module 7.3** — Multi-Agent Architecture + **Module 7.5** — Orchestration Tools

18. "How to run full auto mode safely?" / "Chạy full auto mode an toàn?"
    → **Module 7.1** — Auto Coding Levels + **Module 7.2** — Full Auto Workflow

**Debugging AI / Debug AI:**

19. "How to detect hallucinations?" / "Phát hiện hallucination thế nào?"
    → **Module 8.1** — Hallucination Detection & Prevention

20. "Claude Code is stuck in a loop?" / "Claude Code bị kẹt vòng lặp?"
    → **Module 8.2** — Loop Detection & Breaking

21. "Claude Code output quality is degrading?" / "Chất lượng output đang giảm?"
    → **Module 8.3** — Context Confusion + **Module 8.4** — Quality Assessment

22. "Something went terribly wrong!" / "Có sự cố nghiêm trọng!"
    → **Module 8.5** — Emergency Procedures

**Legacy & Team / Code cũ & Team:**

23. "How to use Claude Code on legacy code?" / "Dùng Claude Code cho code cũ?"
    → **Module 9.1** — Archeology Mode + **Module 9.2** — Incremental Refactoring

24. "How to set up Claude Code for a team?" / "Setup Claude Code cho team?"
    → **Module 10.1** — Team CLAUDE.md + **Module 10.5** — Governance & Policy

25. "How to review AI-generated code?" / "Review code do AI tạo ra thế nào?"
    → **Module 10.3** — Code Review Protocol

**Automation / Tự động hóa:**

26. "How to automate Claude Code in CI/CD?" / "Tự động hóa Claude Code trong CI/CD?"
    → **Module 11.1** — Headless Mode + **Module 11.4** — GitHub Actions

27. "What is MCP?" / "MCP là gì?"
    → **Module 11.5** — MCP (Model Context Protocol)

28. "How to use Claude Code SDK?" / "Dùng Claude Code SDK thế nào?"
    → **Module 11.2** — SDK Integration

29. "How to connect Claude Code with n8n?" / "Kết nối Claude Code với n8n?"
    → **Module 12.1** — Claude Code + n8n

**Optimization / Tối ưu:**

30. "How to reduce Claude Code costs?" / "Giảm chi phí Claude Code?"
    → **Module 14.4** — Cost Optimization

31. "How to make Claude Code faster?" / "Làm Claude Code nhanh hơn?"
    → **Module 14.2** — Speed Optimization

32. "How to improve output quality?" / "Cải thiện chất lượng output?"
    → **Module 14.3** — Quality Optimization

**Templates & Skills:**

33. "Any CLAUDE.md templates?" / "Có template CLAUDE.md sẵn không?"
    → **Module 15.1** — CLAUDE.md Templates

34. "How to create custom Skills?" / "Tạo custom Skill thế nào?"
    → **Module 15.5** — Custom Skill Development

35. "What tools does the community offer?" / "Cộng đồng có những tool nào?"
    → **Module 15.4** — Community Ecosystem

---

## Module Count Summary / Tổng kết

| Phase | EN Title | VI Title | Modules |
|-------|----------|----------|---------|
| 1 | Foundation | Nền Tảng | 3 |
| 2 | Security & Sandboxing | Bảo Mật | 5 |
| 3 | Core Workflows | Quy trình Cốt lõi | 4 |
| 4 | Prompt Engineering & Memory | Kỹ thuật Prompt & Bộ nhớ | 4 |
| 5 | Context Mastery | Làm chủ Context | 3 |
| 6 | Thinking & Planning | Suy nghĩ & Lên kế hoạch | 3 |
| 7 | Multi-Agent & Full Auto | Đa tác tử & Tự động | 5 |
| 8 | Meta-Debugging | Debug AI | 5 |
| 9 | Legacy & Brownfield | Code cũ & Brownfield | 4 |
| 10 | Team Collaboration | Cộng tác Team | 5 |
| 11 | Automation & Headless | Tự động hóa | 5 |
| 12 | n8n Workflows | Tích hợp n8n | 3 |
| 13 | Data & Analysis | Dữ liệu & Phân tích | 3 |
| 14 | Optimization | Tối ưu hóa | 4 |
| 15 | Templates & Skills | Templates & Hệ sinh thái | 5 |
| 16 | Real-World Mastery | Thực chiến | 3 |
| **Total** | | | **64** |
