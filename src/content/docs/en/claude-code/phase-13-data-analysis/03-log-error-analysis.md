---
title: 'Log & Error Analysis'
description: 'Analyze log files with Claude Code to identify error patterns, perform root cause analysis, and generate reports.'
---

# Module 13.3: Log & Error Analysis

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 13.1 (Data Analysis), Module 13.2 (Report Generation)
>
> **Outcome**: After this module, you will know how to analyze log files with Claude Code, identify error patterns, perform root cause analysis, and generate incident reports.

---

## 1. WHY — Why This Matters

Production is down. You have 500MB of logs. Somewhere in there is the answer. Traditional approach: grep for "ERROR", scroll through thousands of lines, correlate timestamps manually. Takes hours. You might miss the real cause.

Claude Code approach: "Analyze these logs. Find all errors, identify patterns, suggest root cause." Claude parses the logs, groups errors, finds correlations, and pinpoints the culprit — in minutes. Log analysis is where AI assistance provides the highest leverage.

---

## 2. CONCEPT — Core Ideas

### Log Analysis Workflow

```text
[Raw Logs] → [Parse] → [Filter] → [Pattern] → [Correlate] → [Root Cause]
    ↓          ↓         ↓          ↓           ↓            ↓
  500MB     Structure   Errors    Groups     Timeline      Answer
```

### Log Analysis Tasks

| Task | Description | Claude Prompt |
|------|-------------|---------------|
| **Parse** | Understand log format | "What format are these logs?" |
| **Filter** | Extract relevant entries | "Show all ERROR and WARN entries" |
| **Count** | Frequency analysis | "Count errors by type" |
| **Timeline** | Temporal patterns | "When did errors start spiking?" |
| **Correlate** | Find relationships | "What happens before each OOM error?" |
| **Root Cause** | Identify source | "What's the likely root cause?" |

### Common Log Formats

- Application logs (timestamp, level, message)
- Access logs (Apache, Nginx)
- JSON structured logs
- Stack traces
- Syslog

### Error Pattern Types

- **Frequency spike**: Sudden increase in error rate
- **Cascading failures**: One error triggers others
- **Periodic errors**: Cron-related, scheduled tasks
- **Resource exhaustion**: Memory, disk, connections
- **External dependency**: Third-party service failures

---

## 3. DEMO — Step by Step

**Scenario**: Production incident — API returning 500 errors. Analyze application.log.

### Step 1: Initial Exploration

```text
You: Read application.log (last 10000 lines). What's the log format?
Give me a summary: total entries, log levels distribution, time range.

Claude: [Reads and analyzes log]

Log Format: JSON structured
- timestamp: ISO 8601
- level: DEBUG, INFO, WARN, ERROR
- service: api-gateway
- message: free text
- trace_id: UUID (for correlation)

Summary (last 10000 entries):
- Time range: 2024-01-15 14:00 to 14:45 (45 minutes)
- DEBUG: 4,521 (45%)
- INFO: 3,892 (39%)
- WARN: 1,203 (12%)
- ERROR: 384 (4%) ← Elevated, normal is <1%
```

### Step 2: Error Analysis

```text
You: Extract all ERROR entries. Group by error type/message. Show count.

Claude: [Parses and groups]

Error Distribution:
- "Database connection timeout" — 156 (41%)
- "Redis connection refused" — 124 (32%)
- "Null pointer in UserService" — 62 (16%)
- "Request timeout exceeded" — 42 (11%)

Observation: Database and Redis connection errors dominate (73%).
Suggests infrastructure issue, not application bug.
```

### Step 3: Timeline Analysis

```text
You: Show error frequency over time, minute by minute. When did spike start?

Claude: [Time-series analysis]

Error Timeline:
- 14:00-14:15: 2-5 errors/minute (baseline)
- 14:16: Jump to 23 errors ← SPIKE START
- 14:17-14:30: 40-60 errors/minute (elevated)
- 14:31-14:45: 20-30 errors/minute (partial recovery)

Spike began at exactly 14:16. Something changed at that moment.
```

### Step 4: Correlation and Root Cause

```text
You: What happened at 14:16? Look for unusual entries in the 2 minutes
before the spike. What's the likely root cause?

Claude: [Correlation analysis]

Events at 14:14-14:16:
- 14:14:32 INFO "Deployment started: api-gateway v2.3.1"
- 14:15:01 INFO "Database connection pool resize: 10 → 50"
- 14:15:45 WARN "Redis memory usage at 95%"
- 14:16:02 ERROR "Database connection timeout" (first of spike)

ROOT CAUSE ANALYSIS:
Primary: Deployment at 14:14 triggered connection pool resize.
The 5x increase in DB connections overwhelmed the database.
Secondary: Redis was already stressed (95% memory).
Cascade: DB timeout → retry → more connections → Redis overflow

Recommendation: Roll back deployment, investigate pool settings.
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Log Format Recognition

**Goal**: Practice identifying different log formats.

**Instructions**:
1. Find or create sample logs (different formats)
2. Ask Claude to identify the format
3. Ask for parsing strategy for each format

<details>
<summary>💡 Hint</summary>

Common formats: Apache access logs, JSON structured, syslog, custom application logs. Each has distinct patterns.

</details>

<details>
<summary>✅ Solution</summary>

```text
Prompt: "Read [log file]. What format is this?
Show the structure and suggest a parsing approach."

Claude will identify:
- Delimiter-based (space, tab, pipe)
- JSON structured
- Regex-parseable patterns
- Timestamp formats
```

</details>

### Exercise 2: Error Pattern Finding

**Goal**: Group and analyze errors.

**Instructions**:
1. Use a log file with multiple error types
2. Ask Claude to group and count errors
3. Ask for timeline analysis
4. Identify the dominant pattern

<details>
<summary>💡 Hint</summary>

Ask: "Extract ERROR entries, group by message, show count for each, then show frequency over time."

</details>

<details>
<summary>✅ Solution</summary>

```text
Prompts in sequence:
1. "Extract all ERROR entries from [log]. Group by error message."
2. "Count each error type. Which is most frequent?"
3. "Show error frequency over time. Any spikes?"
4. "What pattern does this suggest? (spike, cascade, periodic, resource)"
```

</details>

### Exercise 3: Incident Investigation

**Goal**: Complete root cause analysis.

**Instructions**:
1. Create logs with a simulated "problem"
2. Ask Claude to find root cause
3. Request an incident report
4. Compare Claude's finding with actual cause

<details>
<summary>💡 Hint</summary>

Plant a specific cause (e.g., deployment, config change) in the logs. See if Claude finds it.

</details>

<details>
<summary>✅ Solution</summary>

```text
Full investigation prompt:
"Analyze [log]. Find all errors, identify when they started spiking,
look for events that preceded the spike, and determine the likely
root cause. Generate an incident report."
```

</details>

---

## 5. CHEAT SHEET

### Analysis Workflow

```text
Parse → Filter → Count → Timeline → Correlate → Root Cause
```

### Key Prompts

| Stage | Prompt |
|-------|--------|
| Exploration | "What format? Summary of log levels." |
| Error focus | "All ERRORs grouped by type, with counts." |
| Timeline | "Error frequency over time. When did spike start?" |
| Correlation | "What happens before each [error]?" |
| Root cause | "Based on this, what's the likely root cause?" |

### Error Pattern Types

- Frequency spike (sudden increase)
- Cascading failure (chain reaction)
- Periodic (scheduled/cron)
- Resource exhaustion (memory, disk)
- External dependency (third-party)

### Output Requests

- "Generate incident report"
- "Create timeline visualization"
- "Summarize for non-technical stakeholders"

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Analyzing full log file (too large) | Start with tail, recent entries, or time range |
| Focusing only on ERROR level | WARN often precedes ERROR, check both |
| Ignoring timestamps | Timeline is crucial for correlation |
| Missing trace IDs | Use trace_id to follow request flow |
| Assuming first error is root cause | Look for what PRECEDES errors |
| No context about system | Tell Claude about your architecture |
| Stopping at symptoms | Ask "why" repeatedly until root cause |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese fintech, midnight production incident. Payment service returning errors. On-call engineer had 3 hours of logs, panicking.

**Claude Code Investigation (15 minutes)**:

**Step 1**: "Analyze payment-service.log. Summary and error distribution."
→ Found: 89% of errors were "Circuit breaker open: bank-api"

**Step 2**: "When did circuit breaker errors start? What happened before?"
→ Spike at 23:47. At 23:45: "Bank API response time: 15000ms" (normal: 200ms)

**Step 3**: "Is this our issue or bank's issue?"
→ Analysis: Bank API latency spike caused our circuit breaker to trip. Our system behaved correctly. Bank API is the root cause.

**Step 4**: "Generate incident report for stakeholders."
→ Complete report with timeline, analysis, and recommendation

**Resolution**:
- Confirmed with bank: their maintenance window overran
- Our circuit breaker worked as designed
- Incident report ready for morning standup

**Quote**: "What would have taken 2 hours of grep and scrolling, Claude did in 15 minutes. And it found the external dependency issue I might have missed."

---

> **Phase 13 Complete!** You now have data superpowers — from analysis to reports to log investigation.
>
> **Next Phase**: [Phase 14: Optimization](../../phase-14-optimization/01-task-optimization/) →
