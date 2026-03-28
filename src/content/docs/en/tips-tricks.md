---
title: Tips & Tricks
description: Pro-tips curated from all 16 phases, troubleshooting guide, and advanced techniques
---

import { Aside, Card, CardGrid } from '@astrojs/starlight/components';

## Pro Tips from 16 Phases

### Phase 1-3: Foundation & Security

<Card title="Start Every Project Right" icon="rocket">
Run `/init` immediately in a new project. A well-crafted CLAUDE.md with the 6 essential sections (Overview, Architecture, Conventions, Commands, Constraints, Context) saves more time than any other single action.
</Card>

<Card title="The .env.example Pattern" icon="warning">
Never let Claude read `.env` directly. Create `.env.example` with placeholders and tell Claude: "Read .env.example and generate config using process.env." This simple habit prevents 100% of accidental secret exposure.
</Card>

<Card title="Permission Muscle Memory" icon="approve">
Build the habit: **Read-only commands → auto-approve. Write commands → read first. Destructive commands → always deny.** After a week, you will instinctively know what to approve and what to check.
</Card>

### Phase 4-6: Prompting & Context Mastery

<Card title="The CREF Framework" icon="pencil">
Structure every non-trivial prompt with **C**ontext, **R**eference, **E**xpectation, **F**ormat. Teams using CREF reduced code review rejection from 35% to 12%.
</Card>

<Card title="Selective Reading Saves 60% Context" icon="open-book">
Never say "read all files in src/." Instead: (1) Ask for directory structure, (2) Ask for function signatures, (3) Only then read the specific file you need. This 3-layer approach uses 60% less context.
</Card>

<Card title="The /compact Sweet Spot" icon="setting">
Compact at **50-70%** context usage, not at 90%. Early compaction preserves more useful context. Think of it like defragmenting — better done proactively than in an emergency.
</Card>

### Phase 7-8: Auto Coding & Meta-Debugging

<Card title="Always Set Boundaries for Auto Mode" icon="warning">
Before any auto-coding session, specify: ALLOWED files, FORBIDDEN files, stop conditions, and a verification command. Without boundaries, Claude may modify files you did not intend.
</Card>

<Card title="The 3-Strike Rule" icon="error">
If the same approach fails 3 times with similar results, **stop immediately**. Ask: "What are we assuming that might be wrong?" This one rule saves an average of $8 and 45 minutes per stuck session.
</Card>

### Phase 9-12: Legacy Code & Automation

<Card title="Archeology Before Surgery" icon="magnifier">
On legacy codebases, spend the first session ONLY reading — no modifications. Use the 3-layer strategy: Structure (the map) → Patterns (the routes) → Details (the streets). One team mapped a 50,000-line Java codebase in 5 days vs. estimated 3 weeks.
</Card>

<Card title="One Logical Change Per Commit" icon="list-format">
During incremental refactoring, commit after every single logical change. An 800-line legacy function refactored via 33 small commits over 4 weeks had zero production incidents. A big-bang rewrite of the same function broke payment, shipping, and audit logging.
</Card>

### Phase 13-16: Optimization & Mastery

<Card title="Model Matching Saves 68%" icon="star">
A Vietnamese startup reduced Claude costs from $1,200 to $380/month simply by matching models to task complexity. Their discovery: "Haiku could do 80% of what we were using Opus for."
</Card>

<Card title="Prompt Templates Are Multipliers" icon="document">
Create reusable templates for your most common tasks (`/screen`, `/api-call`, `/debug`). Teams report 40-60% faster task completion once their template library reaches 5-10 recipes.
</Card>

---

## Keyboard Shortcuts & Speed Tips

<CardGrid>

<Card title="Screenshot Paste Trick" icon="seti:image">
On macOS: `Cmd+Shift+Ctrl+4` to screenshot to clipboard, then `Ctrl+V` (NOT `Cmd+V`!) to paste into Claude Code. This is the fastest way to share visual context — faster than saving files and referencing paths.
</Card>

<Card title="Resume Sessions" icon="right-arrow">
`claude -c` continues your most recent conversation. `claude -r` opens a session picker. Never lose context when you close your terminal — your full conversation is preserved.
</Card>

<Card title="Multi-line Input" icon="text">
Type `\` + Enter for multi-line prompts. Or run `/terminal-setup` once to enable `Shift+Enter` for multi-line in iTerm2, Ghostty, Kitty, and WezTerm.
</Card>

<Card title="Bash Mode" icon="seti:shell">
Prefix any command with `!` to run it directly without AI interpretation. `! npm test` runs your tests instantly. No waiting for Claude to process.
</Card>

<Card title="File References with @" icon="document">
Type `@` followed by a file path for autocomplete. `@src/utils/auth.js` adds the file as context. Press `Tab` to autocomplete paths.
</Card>

<Card title="Quick Model Switch" icon="random">
`Option+P` (macOS) / `Alt+P` switches model without restarting. Jump from Sonnet to Opus for complex reasoning, back to Haiku for simple edits — all within one session.
</Card>

<Card title="Permission Mode Cycling" icon="approve">
`Shift+Tab` cycles between Normal → Auto-Accept → Plan modes. Quick way to change permission level without typing commands.
</Card>

</CardGrid>

---

## Token Management

<Aside type="tip" title="The Golden Rule">
The fastest way to work with Claude Code is to give it LESS — but the RIGHT less.
</Aside>

### 6 Token-Saving Techniques

| # | Technique | How | Savings |
|---|-----------|-----|---------|
| 1 | **Selective reading** | Ask for signatures/types first, full files later | -60% |
| 2 | **Filtered output** | Use `head -20`, `tail -50`, `grep -A 5` | -80% |
| 3 | **Strategic /compact** | Compact at 30%, 60%, 80% markers | Resets to ~50% |
| 4 | **Prompt brevity** | "Fix bug in saveUser" not a 500-word essay | -50% |
| 5 | **File chunking** | "Read lines 1-100 of X" for large files | Read only needed parts |
| 6 | **Avoid re-reads** | Ask "Do you still have auth.ts in context?" | -100% duplicate cost |

### Cost Awareness Habits

```bash
# Check cost every 20-30 minutes
/cost

# Sample output:
# Input: 45,231 tokens ($0.14)
# Output: 12,847 tokens ($0.19)
# Total: 58,078 tokens ($0.33)

# If context > 60%, compact proactively
/compact
```

<Aside type="caution">
A 60-minute unmonitored session can consume 200K+ tokens ($3-5). Checking `/cost` every 20 minutes typically reduces total spend by 30-40%.
</Aside>

---

## Handling Large Projects

Large Android/KMP projects (100K+ lines) require special strategies to stay within context limits.

### The 3-Layer Reading Strategy

```
Layer 1: Structure (The Map)
├── "Show me the project directory structure"
├── "What are the main modules?"
└── "Where are the entry points?"

Layer 2: Patterns (The Routes)
├── "What architecture pattern is used?"
├── "Show me the dependency graph between modules"
└── "How does data flow from API to UI?"

Layer 3: Details (The Streets)
├── "Read src/auth/LoginViewModel.kt"
├── "Trace the payment flow from button click to API call"
└── "What happens when the token expires?"
```

### Mobile/Android-Specific Tips

<Card title="CLAUDE.md for Android Projects" icon="setting">
Include: Clean Architecture layers, MVVM conventions, Compose vs XML preference, module boundaries, Gradle commands (`./gradlew assembleDebug`, `./gradlew test`), and ProGuard rules to never modify.
</Card>

<Card title="KMP Shared Module Strategy" icon="list-format">
For Kotlin Multiplatform, tell Claude which code is shared (`commonMain`) vs platform-specific (`androidMain`, `iosMain`). Without this, Claude may write platform-specific code in shared modules.
</Card>

### Batch Processing for Large Refactoring

```
Phase 1: Map (1 session)
"Identify all files using deprecated API X"

Phase 2: Plan (1 session)
"Create a migration plan — which files first, which have dependencies"

Phase 3: Execute (N sessions, batched)
"Migrate files 1-10 from the plan. Test after each file."
/compact
"Migrate files 11-20..."
```

<Aside type="tip">
For projects with 200+ files to refactor, use 6 batches with explicit boundaries. One team completed a TypeScript migration of 200+ files in 6 hours using this approach vs. a failed single-session attempt.
</Aside>

---

## Combining Claude with n8n & External Tools

### Integration Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Sequential Pipeline** | Multi-step transformation | Email → Extract data → Generate report |
| **Fan-Out/Fan-In** | Parallel independent tasks | Analyze 10 PRs simultaneously |
| **Classification Router** | Different handling per type | Bug vs feature vs question triage |
| **Human-in-the-Loop** | Need approval | Code review with human sign-off |
| **Batch Processing** | Many items | Process 200+ customer reviews |

### n8n + Claude Code Setup Tips

<Card title="Always Use Full Path" icon="warning">
In n8n Execute Command nodes, use `/usr/local/bin/claude` instead of just `claude`. The n8n process may not have your shell PATH.
</Card>

<Card title="Set Timeouts" icon="setting">
Always set timeout in Execute Command nodes to 60000ms or more. Claude Code operations can take 30-60 seconds, especially for code generation tasks.
</Card>

<Card title="Prepare Prompts in Set Nodes" icon="pencil">
For complex prompts with quotes and special characters, build the prompt string in a Set node first, then pass it to the Execute Command. This prevents quote-breaking issues.
</Card>

### Real-World n8n Workflows

- **Marketing agency**: 50+ daily email briefs auto-processed — 2 hours reduced to 5 minutes
- **Customer reviews**: 200+ reviews analyzed with batch + sequential + router — 4 hours to 30 minutes
- **Code deployment**: PR merged → auto-generate changelog → notify Slack → update docs

<Aside type="tip">
Start with the simplest workflow (Sequential Pipeline) and add complexity only when needed. Most automation needs are solved by just 2-3 connected nodes.
</Aside>

---

## Troubleshooting AI Hallucinations

### Red Flags Checklist

Watch for these signs that Claude may be hallucinating:

| Red Flag | Example | What to Do |
|----------|---------|------------|
| Generic descriptive names | `awesome-validator`, `fast-json-loader` | Verify package exists: `npm view <name>` |
| No source links provided | "Use the X library" with no URL | Ask: "Link me to the GitHub repo" |
| Version number claims | "Added in v3.2.1" | Check official changelog |
| Suspiciously perfect match | Exactly the API you need, no trade-offs | Too good? Verify independently |
| Mixed syntax styles | React class + hooks in same component | Ask Claude to pick one approach |
| Confident but wrong | "This is the standard way to..." | Confidence does not equal accuracy |

<Aside type="danger" title="The #1 Rule">
**Never use Claude to verify Claude.** Don't ask "Does package X exist?" — run `npm view X` yourself. External verification is the only reliable check.
</Aside>

### Verification Commands

| What to Verify | Command | Source |
|----------------|---------|--------|
| npm package exists | `npm view <package>` | npmjs.com |
| Python package exists | `pip show <package>` | pypi.org |
| CLI flag exists | `command --help` | Official docs |
| File path exists | `ls -la <path>` | Your system |
| API endpoint works | `curl -I <url>` | Live server |

### The Intervention Escalation Ladder

When Claude gets stuck in a loop or produces incorrect output:

| Step | Action | Prompt |
|------|--------|--------|
| 1. **Redirect** | Change approach | "Stop. Try a completely different approach." |
| 2. **Inform** | Provide missing context | "You might be missing: the API returns XML, not JSON." |
| 3. **Decompose** | Break into smaller parts | "Forget the full solution. Just solve the auth part first." |
| 4. **Refresh** | Clear stale context | `/compact` |
| 5. **Reset** | Start fresh | `/clear` |
| 6. **Human** | Take over | You write the code manually |

### Common Hallucination Scenarios

<Card title="The Phantom Package" icon="error">
Claude suggests `npm install super-fast-orm`. You install it. It does not exist. **Prevention**: Always `npm view <package>` before installing.
</Card>

<Card title="The Invented API Field" icon="error">
Claude uses `response.auto_confirm` in payment integration. The field does not exist in the API. One fintech team lost 2 days debugging this in staging. **Prevention**: Cross-reference every API field with official docs.
</Card>

<Card title="The Deprecated Method" icon="error">
Claude uses `componentWillMount` in React. It was deprecated years ago. **Prevention**: If Claude suggests any lifecycle method, verify it against current React docs.
</Card>

<Card title="The Confident Wrong Answer" icon="error">
Claude says "PostgreSQL supports `UPSERT` natively since version 9.0." Actually, it was version 9.5. Small detail, big consequences if you target older versions. **Prevention**: Always verify version-specific claims.
</Card>

### Adding Verification to CLAUDE.md

Add this section to your CLAUDE.md to reduce hallucinations:

```markdown
## Verification Rules
- NEVER suggest packages without confirming they exist on npm/pypi
- ALWAYS provide GitHub or docs URLs for third-party libraries
- If unsure about an API, say "needs verification" instead of guessing
- When suggesting version-specific features, cite the changelog
```

<Aside type="tip">
Teams that added verification rules to their CLAUDE.md reported 70% fewer hallucination-related debugging sessions. It takes 30 seconds to add, saves hours of frustration.
</Aside>
