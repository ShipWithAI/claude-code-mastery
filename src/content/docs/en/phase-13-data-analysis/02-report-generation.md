---
title: 'Report Generation'
description: 'Generate complete data reports with Claude Code using templates and export to multiple formats.'
---

# Module 13.2: Report Generation

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Module 13.1 (Data Analysis)
>
> **Outcome**: After this module, you will know how to generate complete reports from data, use templates for consistent reporting, and export to various formats.

---

## 1. WHY — Why This Matters

You've done great analysis with Claude Code. Now you need to share it. The boss wants a PDF report. The client wants an executive summary. The team wants detailed findings.

Copying and pasting Claude's responses into Word? Tedious and error-prone. Manually formatting charts? Time waster. Claude Code can generate complete, formatted reports — from raw data to polished deliverable. One prompt: "Generate a monthly sales report."

---

## 2. CONCEPT — Core Ideas

### Report Generation Pipeline

```text
[Data] → [Analysis] → [Narrative] → [Format] → [Export]
   ↓          ↓           ↓           ↓          ↓
 CSV/DB    Insights    Write-up    Markdown   PDF/HTML
```

### Report Components

| Component | Purpose | Claude's Role |
|-----------|---------|---------------|
| **Title/Header** | Identify report | Generate with date, author |
| **Executive Summary** | Key takeaways | Synthesize findings |
| **Methodology** | How analysis was done | Document approach |
| **Findings** | Detailed results | Data + narrative |
| **Visualizations** | Charts, tables | Generate and embed |
| **Recommendations** | Next steps | Business insights |
| **Appendix** | Supporting data | Raw tables, code |

### Output Formats

- **Markdown**: Universal, version control friendly
- **HTML**: Rich formatting, interactive charts
- **PDF**: Professional, printable (via pandoc)
- **DOCX**: For Word users (via pandoc)

### Report Template

```markdown
# [Report Title]
**Date**: [Date] | **Author**: [Author]

## Executive Summary
[3-5 bullet key findings]

## Methodology
[How analysis was performed]

## Key Findings
### Finding 1: [Title]
[Narrative + visualization]

## Recommendations
[Actionable next steps]

## Appendix
[Supporting data]
```

---

## 3. DEMO — Step by Step

**Scenario**: Generate monthly sales report from sales.csv.

### Step 1: Request Report

```text
You: Generate a monthly sales report for December 2023 from sales.csv.
Include:
- Executive summary (3 key points)
- Revenue analysis by region and category
- Top performing products
- 2 visualizations
- Recommendations

Format as Markdown. Audience: executive team.
Save to reports/december-2023-sales.md
```

### Step 2: Claude Generates Report

```text
Claude: [Analyzes data, generates report]

Created: reports/december-2023-sales.md

# Monthly Sales Report: December 2023
**Generated**: 2024-01-05 | **Data Source**: sales.csv (3,245 transactions)

## Executive Summary
- **Record Revenue**: December achieved $890K, 40% above monthly average
- **Electronics Dominance**: Category drove 52% of monthly revenue
- **Regional Shift**: West region grew 25% MoM, now #2 market

## Revenue Analysis

### By Region
| Region | Revenue | MoM Change |
|--------|---------|------------|
| North  | $320K   | +15%       |
| West   | $280K   | +25%       |
| South  | $180K   | +10%       |
| East   | $110K   | +5%        |

![Regional Revenue](charts/regional_revenue_dec.png)

## Recommendations
1. **Stock Preparation**: Increase Electronics inventory for Q1
2. **West Region Focus**: Allocate more marketing budget
3. **Product Bundling**: Laptop + Headphones bundle opportunity
```

### Step 3: Export to PDF

```bash
$ pandoc reports/december-2023-sales.md -o reports/december-2023-sales.pdf
```

### Step 4: Iterate and Refine

```text
You: The executive summary is too long. Make it more concise —
each point should be one line max.

Claude: [Revises executive summary to be more concise]
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Basic Report Generation

**Goal**: Generate a simple report from data.

**Instructions**:
1. Use any CSV dataset
2. Ask Claude to generate report with: summary, 3 findings, 1 chart
3. Save as Markdown
4. Review the structure

<details>
<summary>💡 Hint</summary>

Specify audience and format explicitly: "Format as Markdown. Audience: executive."

</details>

<details>
<summary>✅ Solution</summary>

```text
Prompt: "Generate a summary report from data.csv.
Include: executive summary (3 bullets), 3 key findings with one chart,
recommendations. Format: Markdown. Audience: executive.
Save to: reports/summary.md"
```

</details>

### Exercise 2: Templated Reporting

**Goal**: Use consistent templates across reports.

**Instructions**:
1. Add a report template to CLAUDE.md
2. Ask Claude to generate report following template
3. Generate same report type for different data
4. Compare consistency

<details>
<summary>💡 Hint</summary>

Add template to CLAUDE.md: "Standard reports include: summary, methodology, findings, recommendations, appendix."

</details>

<details>
<summary>✅ Solution</summary>

CLAUDE.md addition:
```markdown
## Report Template
All reports must include:
1. Executive Summary (3-5 bullets)
2. Methodology (1 paragraph)
3. Key Findings (with visualizations)
4. Recommendations (numbered list)
5. Appendix (raw data reference)
```

Prompt: "Generate a report from [data] using our standard template."

</details>

### Exercise 3: Multi-Format Export

**Goal**: Export report to multiple formats.

**Instructions**:
1. Generate report in Markdown
2. Convert to HTML using pandoc
3. Convert to PDF using pandoc
4. Compare readability

<details>
<summary>💡 Hint</summary>

Use pandoc: `pandoc input.md -o output.pdf` and `pandoc input.md -o output.html`

</details>

<details>
<summary>✅ Solution</summary>

```bash
# Generate Markdown first (via Claude)
# Then convert:
pandoc report.md -o report.html
pandoc report.md -o report.pdf
pandoc report.md -o report.docx
```

</details>

---

## 5. CHEAT SHEET

### Report Prompt Template

```text
"Generate a [type] report from [data].
Include: [components]
Format: [Markdown/HTML]
Audience: [technical/executive]
Save to: [path]"
```

### Standard Components

- Executive Summary
- Methodology
- Key Findings (with visuals)
- Recommendations
- Appendix

### Export Commands

```bash
# Markdown to PDF
pandoc report.md -o report.pdf

# Markdown to HTML
pandoc report.md -o report.html

# Markdown to DOCX
pandoc report.md -o report.docx
```

### Audience Adaptation

| Audience | Focus |
|----------|-------|
| Executive | High-level, business impact |
| Technical | Detailed methodology, code |
| General | Plain language, more context |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| No clear audience | Specify "audience: executive" or "technical" |
| Missing structure | Use template or specify components |
| Charts not saved | Ask Claude to save charts to files, then embed |
| Too much detail in summary | "Executive summary: 3 bullets, one line each" |
| No export format specified | "Format as Markdown" or "Generate HTML" |
| One giant prompt | Iterate: generate, review, refine |
| Forgetting appendix | Include raw data for reference |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese logistics company needed weekly performance reports for 12 regional managers. Manual process: analyst spent 2 days per week creating 12 reports.

**Claude Code Solution**:

CLAUDE.md template defined standard report structure: KPI summary, delivery performance, cost analysis, issues & recommendations.

**Implementation**:

```bash
for region in north south east west; do
  claude -p "Generate weekly report for $region from data/${region}.csv
  using our standard template. Save to reports/${region}-week-42.md"
  pandoc reports/${region}-week-42.md -o reports/${region}-week-42.pdf
done
```

**Results**:
- 2 days manual → 30 minutes automated
- Consistent format across all 12 regions
- Managers get reports Monday 8am instead of Wednesday
- Analyst now does strategic work instead of copy-paste

**Quote**: "Report generation was our analyst's least favorite task. Now Claude does it while she focuses on insights that matter."

---

> **Next**: [Module 13.3: Log & Error Analysis](../03-log-error-analysis/) →
