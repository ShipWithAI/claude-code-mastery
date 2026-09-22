# Anthropic sources registry

Single source of truth for every "Anthropic recommends / Anthropic does X" claim in the course.
Modules cite entries by ID (e.g. `(S1)`) and link here. Update URL/date here, not in modules.
Rule: only numbers that appear verbatim on these pages may be quoted in the course.

| ID | URL | Date | Key quotes | Used by |
|---|---|---|---|---|
| S1 | https://code.claude.com/docs/en/best-practices | living (fetched 2026-09-21) | "Give Claude a check it can run: tests, a build, a screenshot to compare." · "If you can't verify it, don't ship it." · "Would removing this cause Claude to make mistakes?" · "If you've corrected Claude more than twice on the same issue… /clear and start fresh." · "Use hooks for actions that must happen every time with zero exceptions." | 3.1, 4.2, 6.2, 7.2, 8.2, 8.4, 9.3, 11.1, 11.3, 14.3 |
| S2 | https://claude.com/blog/how-anthropic-teams-use-claude-code | 2025-07-24 | "First stop for any programming task." · stack-trace analysis ~3× faster (Security) · ~80% reduction in research time (Inference) · ~20 minutes saved during outage (Data Infra) | 5.3, 9.3, 13.3, 16.2 |
| S3 | https://claude.com/blog/the-ai-native-sdlc-playbook | 2026-08-21 | "Code is no longer the bottleneck — the human-speed steps around it are." · "A skill is a control, though an advisory one." · "A hook is the deterministic layer behind it." · "The agent that wrote the code has no way to approve it." · "Humans remain accountable for every decision that requires judgment." | 1.2, 6.3, 10.2, 10.3, 11.3, 15.3, 16.1 |
| S4 | https://claude.com/blog/how-anthropic-secures-its-ai-native-software-development-lifecycle | 2026-07-21 | "Claude authors about 80% of the code merged into our codebase today." · "ship 8x as much code per quarter as they did from 2021 to 2025." · "Give every agent a single-purpose identity with the minimum permissions for its job." · "Every automated approval, tool call, and agent-to-agent message is logged… and lands in our SIEM." | 2.4, 10.5, 10.6, 11.3 |
| S5 | https://anthropic.com/engineering/building-effective-agents | 2024-12-19 | Workflows vs agents; 5 pattern: prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer; ACI design | 7.3, 7.6, 11.2, 11.5, 15.5 |
| S6 | https://anthropic.com/engineering/effective-context-engineering-for-ai-agents | 2025-09-29 | "smallest set of high-signal tokens"; compaction; structured note-taking; subagent trả về 1.000-2.000 token; just-in-time context | 3.1, 5.1, 5.2, 7.3 |
| S7 | https://claude.com/blog/building-agents-with-the-claude-agent-sdk | 2025-09-29 | Loop **gather context → take action → verify work → repeat**; verify = rules-based / visual / LLM-as-judge | 3.2, 7.2, 8.4, 9.3, 11.2, 14.3 |
| S8 | https://anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills | 2025-10-16 | Progressive disclosure 3 lớp (name+description → SKILL.md → linked files) | 4.2, 15.3 |
| S9 | https://anthropic.com/engineering/writing-tools-for-agents | 2025-09-11 | Ít tool, giá trị cao; namespace; semantic ID; response format; mô tả tool "như cho new hire" | 11.2, 11.5, 15.5 |
| S10 | https://anthropic.com/engineering/multi-agent-research-system | 2025-06-13 | Orchestrator + 3-5 subagent song song; agent ~4× token chat, multi-agent ~15×; evals từ ~20 query | 7.5, 8.4, 14.3, 14.4, 16.3 |
| S11 | https://anthropic.com/engineering/demystifying-evals-for-ai-agents | 2026-01-09 | 20-50 task thật; grader code/model/human; đọc transcript; pass@k; saturation | 8.4, 14.3, 16.3 |
| S12 | https://www.anthropic.com/engineering — "Effective harnesses for long-running agents" (2025-11-26); https://www.anthropic.com/engineering — "Harness design for long-running application development" (2026-03-24) | 2025–2026 | Initializer + coding agent; progress file; feature checklist; "unacceptable to remove or edit tests"; tách generator/evaluator ("confident praising"); context reset > compaction khi "context anxiety"; early victory declaration | 3.1, 5.1, 5.2, 7.3, 7.4, 8.1, 8.4, 9.3, 10.3, 14.3 |
| S13 | https://www.anthropic.com/engineering — "Beyond permission prompts: sandboxing" (2025-10-20); https://www.anthropic.com/engineering — "How we built Claude Code auto mode" (2026-03-25); https://www.anthropic.com/engineering — "How we contain Claude across products" (2026-05-25) | 2025–2026 | Sandbox = filesystem **và** network; 84% ít prompt hơn nội bộ; approval fatigue; classifier 2 lớp; 3 tier action; containment ở environment layer trước, model layer sau; "distrust custom components" | 2.1, 2.2, 2.3 |
| S14 | https://www.anthropic.com/engineering — "Building a C compiler with a team of parallel Claudes" (2026-02-05) | 2026 | 16 agent song song, ~2.000 session, 100K dòng, $20K; "the task verifier is nearly perfect, otherwise Claude will solve the wrong problem"; log chi tiết ra file, giữ output in-context vài dòng | 7.4, 8.1, 9.3, 11.2 |
| S15 | https://code.claude.com/docs/en/costs, https://code.claude.com/docs/en/sub-agents, https://code.claude.com/docs/en/agent-teams, https://code.claude.com/docs/en/workflows, https://code.claude.com/docs/en/checkpointing, https://code.claude.com/docs/en/security | living | Cost ladder; khi nào subagent / team / workflow; team ≈ 7× token; checkpoint không track Bash; ưu tiên CLI tool (gh/aws/gcloud) — không thêm per-tool listing | 3.2, 4.2, 5.2, 7.2, 7.5, 8.2, 8.5, 10.1, 11.5, 14.4, 15.1 |

## Excluded (no primary source)

- **Boris Cherny thread** (10-15 parallel sessions, ~80% start in plan mode) — only a third-party paraphrase exists; the primary source could not be fetched, so the course must not quote it.
- **"90% of code written by Claude"** — no primary URL found; the course must not quote it.
- **"54% of PRs get comments"** — no primary URL found; the course must not quote it.
- **"Cowork 4 engineers 10 days"** — no primary URL found; the course must not quote it.

## ⚠️ Verify on the docs page before teaching

Agent trích từ best-practices nhưng audit chưa có: `/goal`, `/verify`, `/batch`, `/btw`,
`/effort ultracode`, hook event `PostFileEdit`, `TaskCompleted`, `--teammate-mode`,
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`. Quy tắc §5 bước 1 áp dụng: chỉ dạy khi docs page
xác nhận.
