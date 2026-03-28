---
title: 'Data Analysis'
description: 'Use Claude Code for exploratory data analysis with prompting patterns for CSV, JSON, and SQL data.'
---

# Module 13.1: Data Analysis

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Phase 3 (Core Workflows)
>
> **Outcome**: After this module, you will know how to use Claude Code for exploratory data analysis, understand prompting patterns for data work, and be able to extract insights from various data formats.

---

## 1. WHY — Why This Matters

You have a CSV with 10,000 rows of sales data. Traditional approach: open Excel, manually create pivot tables, write formulas, make charts. Takes hours. You might miss insights.

Claude Code approach: "Analyze this sales data. Find patterns, anomalies, and give me actionable insights." Claude reads the file, writes Python scripts, generates visualizations, and explains findings — in minutes. Data analysis is where Claude Code shines for non-coding tasks.

---

## 2. CONCEPT — Core Ideas

### Claude Code as Data Analyst

```text
[Your Question] → [Claude reads data] → [Writes analysis code] → [Runs code] → [Interprets results] → [Answers question]
```

### Data Analysis Workflow

| Stage | What Claude Does | Example Prompt |
|-------|------------------|----------------|
| **Load** | Read file into memory | "Read sales.csv" |
| **Explore** | Understand structure | "What columns exist? Show sample rows" |
| **Clean** | Handle missing/bad data | "Clean this data, handle nulls" |
| **Analyze** | Find patterns | "What are the top trends?" |
| **Visualize** | Create charts | "Create a chart showing monthly trends" |
| **Insight** | Business interpretation | "What should we do based on this?" |

### Supported Data Formats

- **CSV/TSV**: `pandas.read_csv()`
- **JSON**: `pandas.read_json()` or `json` module
- **Excel**: `pandas.read_excel()` with openpyxl
- **SQL**: Database connections via SQLAlchemy
- **Log files**: Custom parsing scripts

### Analysis Types

- **Descriptive**: What happened? (sums, averages, counts)
- **Diagnostic**: Why did it happen? (correlations, drill-downs)
- **Predictive**: What might happen? (trends, forecasting)
- **Prescriptive**: What should we do? (recommendations)

---

## 3. DEMO — Step by Step

**Scenario**: Analyze e-commerce sales data (sales.csv).

### Step 1: Load and Explore

```text
You: I have sales.csv in the current directory. Read it and tell me what's
in this dataset. Show me the structure and a few sample rows.

Claude: [Runs Python code to read CSV]

Dataset Overview:
- Rows: 10,423
- Columns: 8 (order_id, date, customer_id, product, category, quantity, price, region)
- Date range: 2023-01-01 to 2023-12-31
- Regions: North, South, East, West
- Categories: Electronics, Clothing, Home, Food

Data quality: No missing values. Dates are consistent format.
```

### Step 2: Ask Specific Questions

```text
You: What is the total revenue by category? Which category performs best?

Claude: [Writes and runs pandas groupby]

Revenue by Category:
- Electronics: $2,450,000 (45%)
- Home: $1,200,000 (22%)
- Clothing: $1,050,000 (19%)
- Food: $780,000 (14%)

Electronics is the top performer, contributing nearly half of total revenue.
```

### Step 3: Find Patterns

```text
You: Find any interesting patterns or anomalies in this data.

Claude: [Runs comprehensive analysis]

Key Patterns Found:
1. Seasonality: December revenue 40% higher than average (holiday effect)
2. Regional anomaly: West has 20% lower revenue but 30% higher order count
   — suggests lower average order value
3. Product concentration: Top 10 products = 60% of revenue (risk)
4. Day-of-week: Mondays have 15% lower sales than Fridays
```

### Step 4: Visualize

```text
You: Create a visualization showing monthly revenue trend by category.

Claude: [Writes matplotlib code, saves chart]

Created: monthly_revenue_by_category.png

Key insight: Electronics dominates all months, but Clothing shows
strongest growth trajectory (up 35% from Jan to Dec).
```

### Step 5: Get Recommendations

```text
You: Based on this analysis, what are 3 actionable recommendations?

Claude:
1. Investigate West region pricing — lower AOV suggests bundling opportunity
2. Diversify product portfolio — 60% from 10 products is risky
3. Run Monday promotions — could add 5-10% weekly revenue
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Explore Any Dataset

**Goal**: Practice the exploration workflow.

**Instructions**:
1. Download a public CSV (Kaggle, government open data)
2. Ask Claude to read and describe the structure
3. Ask 5 specific questions about the data
4. Request anomaly detection

<details>
<summary>💡 Hint</summary>

Start with "Read [filename] and describe the structure, data types, and any quality issues."

</details>

<details>
<summary>✅ Solution</summary>

```text
Prompt sequence:
1. "Read data.csv and describe structure"
2. "What is the distribution of [column]?"
3. "What is [metric] by [dimension]?"
4. "Find correlations between columns"
5. "Identify any outliers or anomalies"
```

</details>

### Exercise 2: Business Question Analysis

**Goal**: Let Claude determine the analysis approach.

**Instructions**:
1. Use any sales or transaction data
2. Ask: "Which customers should we focus on for retention?"
3. Let Claude choose the methodology
4. Review and critique the approach

<details>
<summary>💡 Hint</summary>

Claude will likely use RFM (Recency, Frequency, Monetary) analysis or cohort analysis for customer retention questions.

</details>

<details>
<summary>✅ Solution</summary>

Claude typically responds with:
- RFM segmentation to identify high-value at-risk customers
- Cohort analysis to spot retention trends
- Churn prediction based on activity patterns

Review: Check if the methodology matches your business context.

</details>

### Exercise 3: Full Analysis Pipeline

**Goal**: Complete end-to-end analysis.

**Instructions**:
1. Load data and explore structure
2. Ask Claude to clean any issues found
3. Analyze for top 3 trends
4. Generate 3 visualizations
5. Get actionable recommendations

<details>
<summary>💡 Hint</summary>

Use explicit prompts for each stage. Don't combine too many requests in one prompt.

</details>

<details>
<summary>✅ Solution</summary>

Sequential prompts:
1. "Read [file], describe structure and data quality"
2. "Clean: handle missing values, fix data types"
3. "What are the top 3 trends in this data?"
4. "Create: bar chart of [metric], line chart of [trend], scatter of [correlation]"
5. "Based on this analysis, give 3 actionable recommendations"

</details>

---

## 5. CHEAT SHEET

### Analysis Workflow

```text
Load → Explore → Clean → Analyze → Visualize → Insight
```

### Prompting Patterns

| Pattern | Prompt Template |
|---------|-----------------|
| Exploration | "Read [file] and describe the structure" |
| Specific question | "What is [metric] by [dimension]?" |
| Pattern finding | "Find top patterns or anomalies" |
| Visualization | "Create a [chart type] showing [metric] over [dimension]" |
| Recommendation | "Based on this analysis, what should we do?" |

### Supported Formats

CSV, JSON, Excel, SQL databases, log files

### Analysis Types

| Type | Question |
|------|----------|
| Descriptive | What happened? |
| Diagnostic | Why did it happen? |
| Predictive | What will happen? |
| Prescriptive | What should we do? |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Vague prompts ("analyze this data") | Specific questions ("What is revenue by region?") |
| Skipping exploration | Always start with "describe the structure" |
| Assuming data is clean | Ask about data quality, missing values first |
| Not verifying Claude's code | Review the analysis methodology |
| Accepting first result | Ask follow-up questions, drill deeper |
| Huge files overwhelming context | Sample first, then full analysis |
| No visualization | Charts reveal patterns numbers don't |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese e-commerce startup had 6 months of transaction data. Founder wanted insights but had no data analyst. Traditional option: hire consultant (expensive, slow).

**Claude Code Approach**:

**Session 1** (30 min): "Read transactions.csv, describe data, find top patterns"
- Discovered: 80% revenue from 15% of customers
- Found: Specific product bundles with high correlation

**Session 2** (20 min): "Which customers are at risk of churning?"
- Claude built RFM analysis automatically
- Identified 200 high-value customers with declining activity

**Session 3** (15 min): "Create customer segment visualization"
- Generated scatter plot of customer segments
- Clear visual of VIP vs at-risk customers

**Results**:
- 1 hour total analysis time (vs 1 week with consultant)
- Actionable segments for marketing campaign
- ₫50M campaign targeted at at-risk customers → 40% retained

**Quote**: "Claude Code is like having a data scientist who works at conversation speed."

---

> **Next**: [Module 13.2: Report Generation](../02-report-generation/) →
