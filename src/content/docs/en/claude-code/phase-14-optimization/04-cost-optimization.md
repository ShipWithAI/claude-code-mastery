---
title: 'Cost Optimization'
description: 'Real Claude Code pricing, automatic prompt caching, --max-budget-usd, and the cost ladder from keeping CLAUDE.md small to picking the right model.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 14.4: Cost Optimization

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 14.3 (Quality Optimization)
>
> **Outcome**: After this module, you can read `/usage`, cap spend with `--max-budget-usd`, keep
> prompt caching working instead of accidentally resetting it, and apply the real cost ladder
> instead of "just use a cheaper model."

---

## 1. WHY — Why This Matters

The bill is higher than expected and nobody knows why. Guessing doesn't fix it — reading where
tokens go does. Claude Code caches prompts automatically, publishes a real budget cap flag, and
Anthropic publishes real enterprise cost numbers — no made-up multiplier needed.

---

## 2. CONCEPT — Core Ideas

Anthropic's own number, not an estimate: "Across enterprise deployments, the average cost is
around $13 per developer per active day and $150-250 per developer per month, with costs
remaining below $30 per active day for 90% of users" (S15). Agent teams cost more by design —
"approximately 7x more tokens than standard sessions when teammates run in plan mode, because
each teammate maintains its own context window and runs as a separate Claude instance" (S15); a
single non-team agent already runs "~4×" a chat turn's tokens, multi-agent "~15×" (S10).

**Pricing** (per MTok, ⚠️ verify at <https://platform.claude.com/docs/en/about-claude/pricing>,
checked 2026-09-27):

| Model | Base input | 1h cache write | Cache hit | Output |
|---|---|---|---|---|
| Claude Opus 5.5 | $4 | $8 | $0.20 (0.05x) | $20 |
| Claude Opus 5 | $5 | $10 | $0.50 | $25 |
| Claude Sonnet 5 | $2 | $4 | $0.20 | $10 |
| Claude Haiku 4.5 | $1 | $2 | $0.10 | $5 |
| Claude Fable 5.1 | $10 | $20 | $0.25 (0.025x) | $50 |

No separate charge for the 1M-token window: "Claude 4.6 and later models… include the full 1M
token context window at standard pricing. (A 900k-token request is billed at the same per-token
rate as a 9k-token request.)"

**Prompt caching is automatic** — "Claude Code handles prompt caching for you, unless you disable
it." Cache lifetime defaults to **1 hour** inside a Claude subscription's plan usage, **5
minutes** on usage credits, an API key, or a cloud provider; a hit costs 0.1x base input on most
models (0.05x on Opus 5.5, 0.025x on Fable 5.1). What resets it: switching models or effort level
(except Opus 5.5/Fable 5.1 on API key or subscription), first-time fast mode in a conversation,
adding/removing an MCP server, compacting, upgrading Claude Code. What doesn't: editing files,
permission mode, output style, running skills or commands.

**Subscription vs API view.** `/usage` (aliased by `/cost` and `/stats`) shows a plan-usage view
for a subscription seat, or a Session block with a dollar `Total cost` on usage credits / an API
key. `/insights` writes an HTML report to `~/.claude/usage-data/report.html` from up to 200
recent sessions on the machine. `--max-budget-usd` (print mode only) stops spending past a dollar
figure, and "spend from subagents counts toward the cap." `opusplan` uses Opus for planning and
switches to Sonnet for execution — each switch is a model change, so it costs a cache reset too.

**Cost ladder** (S15), cheapest habits first: `/clear` between unrelated tasks · pick the model
for the job, not by default · fewer MCP servers, prefer CLI tools like `gh`/`aws`/`gcloud` ·
offload verbose work to hooks and skills · keep CLAUDE.md under 200 lines · delegate anything
verbose (test runs, log processing) to a subagent so only its summary returns to your context.

---

## 3. DEMO — Step by Step

**Step 1: Read `/usage`**

```text
# docs: en/commands — /usage (alias: /cost, /stats)
/usage
```

```text
# Output may vary — subscription plan-usage view (this account is on a Claude subscription,
# not usage credits, so no per-call dollar figure is shown here). Skill/subagent/plugin names
# below are redacted — yours will list whatever you have installed.
  Last 24h · these are independent characteristics of your usage, not a breakdown

  …% of your usage came from subagent-heavy sessions
   Each subagent runs its own requests. Be deliberate about spawning them.

  …% of your usage was at >150k context
   Longer sessions are more expensive even when cached.

  Usage credits
  Usage credits are off · /usage-credits to turn them on
```

On usage credits or an API key, this same command shows a Session block with a real
`total_cost_usd` per call instead — that's what Step 2 uses.

**Step 2: Prompt caching, measured — run the identical prompt twice**

```bash
# docs: en/prompt-caching
claude -p "Read src/math.js and list its exported function names, comma separated." \
  --allowedTools Read --output-format json
```

```text
# Output may vary
total_cost_usd: 0.2662546   cache_read_input_tokens: 53533   cache_creation_input_tokens: 31759
```

```bash
# same command, run again immediately
claude -p "Read src/math.js and list its exported function names, comma separated." \
  --allowedTools Read --output-format json
```

```text
# Output may vary
total_cost_usd: 0.0185344   cache_read_input_tokens: 85292   cache_creation_input_tokens: 0
```

The second run cost about 14x less — `cache_creation_input_tokens` dropped to 0 because the whole
prefix had already been written to cache by the first call.

**Step 3: `--max-budget-usd` actually stopping a run**

```bash
# docs: en/cli-reference — --max-budget-usd (print mode only)
claude -p "Read src/math.js and tests/math.test.mjs. Then write a detailed 400-word code review." \
  --allowedTools Read --max-budget-usd 0.05 --output-format json
```

```text
# Output may vary
"terminal_reason":"budget_exhausted","subtype":"error_max_budget_usd",
"errors":["Reached maximum budget ($0.05)"],"total_cost_usd":0.2527206
```

The call that was already in flight finished before the cap took effect, so the actual spend
landed above the cap — `--max-budget-usd` stops the *next* call, not the current one mid-request.
Set it well under what you can tolerate, not exactly at your limit.

**Step 4: `opusplan` and `/insights`**

```text
/model opusplan
```

```text
# Output may vary
⎿  Set model to Opus in plan mode, else Sonnet and saved as your default for new sessions
```

```text
# docs: en/costs — /insights
/insights
```

```text
# Output may vary
⏺ Your shareable insights report is ready:
```

Confirmed on disk at `~/.claude/usage-data/report.html` — the report itself is personal usage
data, so this module doesn't paste its contents.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Find your own cache resets

**Goal**: Catch yourself resetting the cache without meaning to.

**Instructions**:
1. Run the same prompt twice in a row and note the cost drop (Step 2).
2. Switch models with `/model`, then run it a third time.
3. Compare `cache_creation_input_tokens` on the third run to the second.

<details>
<summary>💡 Hint</summary>

Switching effort level resets the cache too, except on Opus 5.5 or Fable 5.1 on an API key or a
subscription.

</details>

<details>
<summary>✅ Solution</summary>

A model switch shows `cache_creation_input_tokens` back near its first-run value — the whole
prefix had to be rewritten, at 2x the base input price for a 1-hour cache.

</details>

### Exercise 2: Set a budget cap that actually fits

**Goal**: Use `--max-budget-usd` without being surprised by an overshoot.

**Instructions**:
1. Estimate a task's likely cost from a similar prior run's `total_cost_usd`.
2. Set `--max-budget-usd` at roughly half that estimate.
3. Run it and read `errors` if it stops early.

<details>
<summary>💡 Hint</summary>

The cap can't interrupt a call already in progress — budget for the size of a single turn, not
just the total.

</details>

<details>
<summary>✅ Solution</summary>

A cap set too close to the expected total gets tripped by normal variance. Half your estimate
leaves room for one expensive turn before the cap engages.

</details>

### Exercise 3: Walk your own cost ladder

**Goal**: Apply the S15 ladder to one real project.

**Instructions**:
1. Count your CLAUDE.md's lines. Over 200? Move detail into a skill.
2. List your connected MCP servers. Any replaceable by a CLI tool?
3. Find one verbose task (test runs, log tailing) you could delegate to a subagent.

<details>
<summary>💡 Hint</summary>

`/context` shows what's actually loaded — MCP server definitions included — before you guess at
what to trim.

</details>

<details>
<summary>✅ Solution</summary>

The ladder is ordered by effort-to-impact: `/clear` and model choice cost nothing to try first;
restructuring CLAUDE.md and MCP servers takes longer but compounds across every session after.

</details>

---

## 5. CHEAT SHEET

| Command / Flag | Effect |
|---|---|
| `/usage` (alias `/cost`, `/stats`) | Plan-usage view (subscription) or Session $ block (credits/API) |
| `/insights` | HTML report at `~/.claude/usage-data/report.html`, up to 200 sessions |
| `--max-budget-usd <n>` | Stops the *next* API call once spend passes `<n>` (print mode) |
| `--output-format json` → `.total_cost_usd` | Real per-call dollar cost |
| `/model opusplan` | Opus to plan, Sonnet to execute — each switch resets the cache |
| `DISABLE_PROMPT_CACHING` / `_HAIKU` / `_SONNET` / `_OPUS` / `_FABLE` | Turn caching off per model |
| `CLAUDE_CODE_PROMPT_CACHE_TTL` (`5m`\|`1h`) | Override the default cache lifetime |

⚠️ Pricing table above: verify at the pricing URL before quoting a number in a proposal or invoice.

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Quoting 2024-era prices ("Opus $15/$75", "Haiku $0.25/$1.25") | Current prices are lower and change — always cite the ⚠️ table above with its checked date |
| "The 1M context window costs extra" | 4.6+ models bill the full window at standard per-token rates — no surcharge |
| Switching model or effort mid-session to "try something" | Both reset prompt caching (with a narrow Opus 5.5/Fable 5.1 exception) — a full-price rewrite, not free |
| Setting `--max-budget-usd` at exactly your limit | The call in flight can finish over the cap — budget below your real ceiling |
| "Think step by step" to make Opus reason harder before spending more | Extended thinking is already on by default (Module 6.1); the phrase doesn't add budget or reduce cost |

---

## 7. REAL CASE — Production Story

**Scenario**: A remote Vietnamese team ran Claude Code inside CI for routine PR checks, with no
visibility into what a typical run cost until the monthly invoice arrived.

**Problem**: Nobody could tell, from inside a given CI run, whether it was on track or already
over what that job type usually cost.

**Solution**: `--max-budget-usd` on every CI invocation, set from that job type's own recent
`total_cost_usd` history, plus a weekly `/insights` report reviewed by whoever owned the CI
pipeline that month.

**Result**: A run that goes unusually expensive now stops itself and reports why, instead of
surfacing three weeks later on an invoice with no context attached.

---

> **Phase 14 Complete!** You've learned to optimize Claude Code for task efficiency, speed,
> quality, and cost.
>
> **Next Phase**:
> [Phase 15: Templates, Skills & Ecosystem](../../phase-15-templates-skills/01-claude-md-templates/) →
