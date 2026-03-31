---
title: 'Phân tích dữ liệu'
description: 'Dùng Claude Code để phân tích dữ liệu: đọc CSV/JSON, thống kê, trực quan hóa và rút ra insight.'
---

# Module 13.1: Phân tích dữ liệu

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Phase 3 (Core Workflows)
>
> **Kết quả**: Sau module này, bạn sẽ biết dùng Claude Code cho exploratory data analysis, hiểu prompting pattern cho data work, và extract insight từ various format.

---

## 1. WHY — Tại sao cần học

Bạn có CSV 10,000 dòng sales data. Cách truyền thống: mở Excel, tạo pivot table, viết formula, làm chart. Tốn hàng giờ. Không chắc có miss insight quan trọng không.

Claude Code approach: "Analyze sales data này. Tìm pattern, anomaly, và insight." Claude đọc file, viết Python script, generate visualization, explain findings — trong vài phút. Data analysis là nơi Claude Code tỏa sáng cho non-coding task.

---

## 2. CONCEPT — Ý tưởng cốt lõi

### Claude Code như Data Analyst

```text
[Câu hỏi của bạn] → [Claude đọc data] → [Viết analysis code] → [Run code] → [Interpret kết quả] → [Trả lời câu hỏi]
```

### Data Analysis Workflow

| Stage | Claude làm gì | Prompt ví dụ |
|-------|---------------|--------------|
| **Load** | Đọc file vào memory | "Read sales.csv" |
| **Explore** | Hiểu structure | "Có column nào? Show sample row" |
| **Clean** | Xử lý missing/bad data | "Clean data, handle null" |
| **Analyze** | Tìm pattern | "Top trend là gì?" |
| **Visualize** | Tạo chart | "Chart monthly trend" |
| **Insight** | Business interpretation | "Nên làm gì dựa trên này?" |

### Supported Data Format

- **CSV/TSV**: `pandas.read_csv()`
- **JSON**: `pandas.read_json()` hoặc `json` module
- **Excel**: `pandas.read_excel()` với openpyxl
- **SQL**: Database connection qua SQLAlchemy
- **Log file**: Custom parsing script

### Analysis Type

- **Descriptive**: Chuyện gì đã xảy ra? (sum, average, count)
- **Diagnostic**: Tại sao xảy ra? (correlation, drill-down)
- **Predictive**: Sẽ xảy ra gì? (trend, forecast)
- **Prescriptive**: Nên làm gì? (recommendation)

---

## 3. DEMO — Từng bước thực hành

**Scenario**: Analyze e-commerce sales data (sales.csv).

### Bước 1: Load và Explore

```text
Bạn: Tôi có sales.csv trong thư mục hiện tại. Đọc và cho biết dataset
này chứa gì. Show structure và vài sample row.

Claude: [Chạy Python code để read CSV]

Dataset Overview:
- Rows: 10,423
- Columns: 8 (order_id, date, customer_id, product, category, quantity, price, region)
- Date range: 2023-01-01 đến 2023-12-31
- Region: Bắc, Nam, Trung, Tây
- Category: Electronics, Clothing, Home, Food

Data quality: Không có missing value. Date format nhất quán.
```

### Bước 2: Hỏi câu hỏi cụ thể

```text
Bạn: Total revenue by category? Category nào perform tốt nhất?

Claude: [Viết và run pandas groupby]

Revenue by Category:
- Electronics: 2,450,000,000đ (45%)
- Home: 1,200,000,000đ (22%)
- Clothing: 1,050,000,000đ (19%)
- Food: 780,000,000đ (14%)

Electronics là top performer, chiếm gần nửa total revenue.
```

### Bước 3: Tìm Pattern

```text
Bạn: Tìm pattern hoặc anomaly thú vị trong data này.

Claude: [Chạy comprehensive analysis]

Key Pattern:
1. Seasonality: Tháng 12 revenue cao hơn 40% so với average (holiday effect)
2. Regional anomaly: Tây có revenue thấp hơn 20% nhưng order count cao hơn 30%
   — average order value thấp
3. Product concentration: Top 10 product = 60% revenue (risk)
4. Day-of-week: Thứ 2 sales thấp hơn 15% so với Thứ 6
```

### Bước 4: Visualization

```text
Bạn: Tạo visualization monthly revenue trend by category.

Claude: [Viết matplotlib code, save chart]

Đã tạo: monthly_revenue_by_category.png

Key insight: Electronics dominate mọi tháng, nhưng Clothing có growth
trajectory mạnh nhất (tăng 35% từ tháng 1 đến tháng 12).
```

### Bước 5: Recommendation

```text
Bạn: Dựa trên analysis này, 3 recommendation actionable?

Claude:
1. Investigate West region pricing — AOV thấp suggest opportunity bundling
2. Diversify product portfolio — 60% từ 10 product là risky
3. Run Monday promotion — có thể tăng 5-10% weekly revenue
```

---

## 4. PRACTICE — Luyện tập

### Bài 1: Explore Any Dataset

**Mục tiêu**: Practice exploration workflow.

**Hướng dẫn**:
1. Download public CSV (Kaggle, government open data)
2. Yêu cầu Claude describe structure
3. Hỏi 5 câu hỏi cụ thể về data
4. Request anomaly detection

<details>
<summary>💡 Hint</summary>

Bắt đầu với "Read [filename] và describe structure, data type, và quality issue."

</details>

<details>
<summary>✅ Solution</summary>

```text
Prompt sequence:
1. "Read data.csv và describe structure"
2. "Distribution của [column] như thế nào?"
3. "[Metric] by [dimension] là bao nhiêu?"
4. "Correlation giữa các column?"
5. "Identify outlier hoặc anomaly"
```

</details>

### Bài 2: Business Question Analysis

**Mục tiêu**: Để Claude tự chọn analysis approach.

**Hướng dẫn**:
1. Dùng bất kỳ sales/transaction data
2. Hỏi: "Customer nào nên focus cho retention?"
3. Để Claude tự chọn methodology
4. Review và critique approach

<details>
<summary>💡 Hint</summary>

Claude thường dùng RFM (Recency, Frequency, Monetary) analysis hoặc cohort analysis cho customer retention question.

</details>

<details>
<summary>✅ Solution</summary>

Claude typically respond với:
- RFM segmentation để identify high-value at-risk customer
- Cohort analysis để spot retention trend
- Churn prediction dựa trên activity pattern

Review: Check methodology có match business context không.

</details>

### Bài 3: Full Analysis Pipeline

**Mục tiêu**: Complete end-to-end analysis.

**Hướng dẫn**:
1. Load data và explore structure
2. Yêu cầu Claude clean issue found
3. Analyze top 3 trend
4. Generate 3 visualization
5. Get actionable recommendation

<details>
<summary>💡 Hint</summary>

Dùng explicit prompt cho mỗi stage. Đừng combine quá nhiều request trong một prompt.

</details>

<details>
<summary>✅ Solution</summary>

Sequential prompt:
1. "Read [file], describe structure và data quality"
2. "Clean: handle missing value, fix data type"
3. "Top 3 trend trong data này?"
4. "Tạo: bar chart [metric], line chart [trend], scatter [correlation]"
5. "Dựa trên analysis, 3 recommendation actionable"

</details>

---

## 5. CHEAT SHEET

### Analysis Workflow

```text
Load → Explore → Clean → Analyze → Visualize → Insight
```

### Prompting Pattern

| Pattern | Prompt Template |
|---------|-----------------|
| Exploration | "Read [file] và describe structure" |
| Specific question | "[Metric] by [dimension] là bao nhiêu?" |
| Pattern finding | "Tìm top pattern hoặc anomaly" |
| Visualization | "Tạo [chart type] showing [metric] over [dimension]" |
| Recommendation | "Dựa trên analysis, nên làm gì?" |

### Supported Format

CSV, JSON, Excel, SQL database, log file

### Analysis Type

| Type | Question |
|------|----------|
| Descriptive | Chuyện gì đã xảy ra? |
| Diagnostic | Tại sao xảy ra? |
| Predictive | Sẽ xảy ra gì? |
| Prescriptive | Nên làm gì? |

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Prompt mơ hồ ("analyze data này") | Câu hỏi cụ thể ("Revenue by region?") |
| Skip exploration | Luôn bắt đầu "describe structure" |
| Assume data clean | Hỏi data quality, missing value trước |
| Không verify code của Claude | Review analysis methodology |
| Accept kết quả đầu tiên | Follow-up question, drill deeper |
| File khổng lồ overwhelm context | Sample trước, sau đó full analysis |
| Không visualization | Chart reveal pattern mà số không thể |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Startup e-commerce Việt Nam có 6 tháng transaction data. Founder muốn insight nhưng không có data analyst. Thuê consultant thì đắt và chậm.

**Claude Code Approach**:

**Session 1** (30 phút): "Read transactions.csv, describe data, find top pattern"
- Phát hiện: 80% revenue từ 15% customer
- Tìm thấy: Product bundle correlation cao

**Session 2** (20 phút): "Customer nào at risk of churning?"
- Claude tự build RFM analysis
- Identify 200 high-value customer với declining activity

**Session 3** (15 phút): "Tạo customer segment visualization"
- Generate scatter plot of customer segment
- Visual rõ ràng VIP vs at-risk customer

**Kết quả**:
- 1 giờ total analysis (vs 1 tuần với consultant)
- Actionable segment cho marketing campaign
- Campaign ₫50M target at-risk customer → 40% retained

**Quote**: "Claude Code như có data scientist làm việc ở conversation speed."

---

> **Tiếp theo**: [Module 13.2: Sinh báo cáo](../02-report-generation/) →
