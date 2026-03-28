---
title: 'Sinh báo cáo'
description: 'Tự động sinh báo cáo với Claude Code: từ dữ liệu thô đến báo cáo Markdown, HTML và PDF chuyên nghiệp.'
---

# Module 13.2: Sinh báo cáo

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 13.1 (Phân tích dữ liệu)
>
> **Kết quả**: Sau module này, bạn sẽ biết generate complete report từ data, dùng template cho consistent reporting, và export various format.

---

## 1. WHY — Tại sao cần học

Analysis xong, cần share kết quả. Boss muốn PDF report. Client muốn executive summary. Team muốn detailed finding.

Copy paste response của Claude vào Word? Tedious và error-prone. Manual format chart? Phí thời gian. Claude Code có thể generate complete, formatted report — từ raw data đến polished deliverable. Một prompt: "Generate monthly sales report."

---

## 2. CONCEPT — Ý tưởng cốt lõi

### Report Generation Pipeline

```text
[Data] → [Analysis] → [Narrative] → [Format] → [Export]
   ↓          ↓           ↓           ↓          ↓
 CSV/DB    Insight     Write-up    Markdown   PDF/HTML
```

### Report Component

| Component | Mục đích | Claude làm gì |
|-----------|----------|---------------|
| **Title/Header** | Identify report | Generate với date, author |
| **Executive Summary** | Key takeaway | Synthesize finding |
| **Methodology** | Cách làm | Document approach |
| **Findings** | Chi tiết | Data + narrative |
| **Visualization** | Chart, table | Generate và embed |
| **Recommendation** | Bước tiếp | Business insight |
| **Appendix** | Supporting | Raw table, code |

### Output Format

- **Markdown**: Universal, dễ version control
- **HTML**: Rich formatting, interactive chart
- **PDF**: Professional, printable (qua pandoc)
- **DOCX**: Cho Word user (qua pandoc)

### Report Template

```markdown
# [Report Title]
**Date**: [Date] | **Author**: [Author]

## Executive Summary
[3-5 bullet key finding]

## Methodology
[Cách analysis được thực hiện]

## Key Findings
### Finding 1: [Title]
[Narrative + visualization]

## Recommendations
[Actionable next step]

## Appendix
[Supporting data]
```

---

## 3. DEMO — Từng bước thực hành

**Scenario**: Generate monthly sales report từ sales.csv.

### Bước 1: Yêu cầu Report

```text
Bạn: Generate monthly sales report tháng 12/2023 từ sales.csv.
Include:
- Executive summary (3 điểm chính)
- Revenue analysis by region và category
- Top performing product
- 2 visualization
- Recommendation

Format: Markdown. Audience: executive team.
Save to reports/thang-12-2023-sales.md
```

### Bước 2: Claude Generate Report

```text
Claude: [Analyze data, generate report]

Đã tạo: reports/thang-12-2023-sales.md

# Báo cáo Bán hàng Tháng 12/2023
**Ngày tạo**: 05/01/2024 | **Nguồn**: sales.csv (3,245 giao dịch)

## Executive Summary
- **Revenue kỷ lục**: Tháng 12 đạt 890 triệu, cao hơn 40% so với trung bình
- **Electronics thống trị**: Category chiếm 52% monthly revenue
- **Regional shift**: Khu vực Tây tăng 25% MoM, hiện là #2 market

## Revenue Analysis

### By Region
| Region | Revenue | MoM Change |
|--------|---------|------------|
| Bắc    | 320 tr  | +15%       |
| Tây    | 280 tr  | +25%       |
| Nam    | 180 tr  | +10%       |
| Đông   | 110 tr  | +5%        |

![Regional Revenue](charts/regional_revenue_dec.png)

## Recommendations
1. **Chuẩn bị tồn kho**: Tăng inventory Electronics cho Q1
2. **Focus Tây**: Allocate thêm marketing budget
3. **Product Bundling**: Laptop + Headphones bundle opportunity
```

### Bước 3: Export sang PDF

```bash
$ pandoc reports/thang-12-2023-sales.md -o reports/thang-12-2023-sales.pdf
```

### Bước 4: Iterate và Refine

```text
Bạn: Executive summary quá dài. Làm concise hơn —
mỗi điểm tối đa một dòng.

Claude: [Revise executive summary cho ngắn gọn hơn]
```

---

## 4. PRACTICE — Luyện tập

### Bài 1: Basic Report Generation

**Mục tiêu**: Generate report đơn giản từ data.

**Hướng dẫn**:
1. Dùng bất kỳ CSV dataset
2. Yêu cầu Claude generate report: summary, 3 finding, 1 chart
3. Save dạng Markdown
4. Review structure

<details>
<summary>💡 Hint</summary>

Specify audience và format rõ ràng: "Format as Markdown. Audience: executive."

</details>

<details>
<summary>✅ Solution</summary>

```text
Prompt: "Generate summary report từ data.csv.
Include: executive summary (3 bullet), 3 key finding với một chart,
recommendation. Format: Markdown. Audience: executive.
Save to: reports/summary.md"
```

</details>

### Bài 2: Templated Reporting

**Mục tiêu**: Dùng template consistent cho nhiều report.

**Hướng dẫn**:
1. Thêm report template vào CLAUDE.md
2. Yêu cầu Claude generate report theo template
3. Generate cùng loại report cho data khác
4. So sánh consistency

<details>
<summary>💡 Hint</summary>

Thêm vào CLAUDE.md: "Standard report include: summary, methodology, findings, recommendations, appendix."

</details>

<details>
<summary>✅ Solution</summary>

CLAUDE.md addition:
```markdown
## Report Template
Tất cả report phải include:
1. Executive Summary (3-5 bullet)
2. Methodology (1 paragraph)
3. Key Findings (với visualization)
4. Recommendations (numbered list)
5. Appendix (raw data reference)
```

Prompt: "Generate report từ [data] theo standard template của chúng ta."

</details>

### Bài 3: Multi-Format Export

**Mục tiêu**: Export report sang nhiều format.

**Hướng dẫn**:
1. Generate report dạng Markdown
2. Convert sang HTML với pandoc
3. Convert sang PDF với pandoc
4. So sánh readability

<details>
<summary>💡 Hint</summary>

Dùng pandoc: `pandoc input.md -o output.pdf` và `pandoc input.md -o output.html`

</details>

<details>
<summary>✅ Solution</summary>

```bash
# Generate Markdown trước (qua Claude)
# Sau đó convert:
pandoc report.md -o report.html
pandoc report.md -o report.pdf
pandoc report.md -o report.docx
```

</details>

---

## 5. CHEAT SHEET

### Report Prompt Template

```text
"Generate [type] report từ [data].
Include: [component]
Format: [Markdown/HTML]
Audience: [technical/executive]
Save to: [path]"
```

### Standard Component

- Executive Summary
- Methodology
- Key Findings (với visual)
- Recommendations
- Appendix

### Export Command

```bash
# Markdown sang PDF
pandoc report.md -o report.pdf

# Markdown sang HTML
pandoc report.md -o report.html

# Markdown sang DOCX
pandoc report.md -o report.docx
```

### Audience Adaptation

| Audience | Focus |
|----------|-------|
| Executive | High-level, business impact |
| Technical | Chi tiết methodology, code |
| General | Plain language, nhiều context |

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Không rõ audience | Specify "audience: executive" hoặc "technical" |
| Thiếu structure | Dùng template hoặc specify component |
| Chart không save | Yêu cầu Claude save chart ra file, rồi embed |
| Summary quá chi tiết | "Executive summary: 3 bullet, mỗi bullet một dòng" |
| Không specify format | "Format as Markdown" hoặc "Generate HTML" |
| Một prompt khổng lồ | Iterate: generate, review, refine |
| Quên appendix | Include raw data cho reference |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Công ty logistics Việt Nam cần weekly performance report cho 12 regional manager. Manual process: analyst tốn 2 ngày/tuần tạo 12 report.

**Claude Code Solution**:

CLAUDE.md template define standard structure: KPI summary, delivery performance, cost analysis, issues & recommendations.

**Implementation**:

```bash
for region in bac nam dong tay; do
  claude -p "Generate weekly report cho $region từ data/${region}.csv
  theo standard template. Save to reports/${region}-tuan-42.md"
  pandoc reports/${region}-tuan-42.md -o reports/${region}-tuan-42.pdf
done
```

**Kết quả**:
- 2 ngày manual → 30 phút automated
- Format nhất quán across 12 vùng
- Manager nhận report Monday 8am thay vì Wednesday
- Analyst giờ làm strategic work thay vì copy-paste

**Quote**: "Report generation là task analyst ghét nhất. Giờ Claude làm, cô ấy focus vào insight quan trọng."

---

> **Tiếp theo**: [Module 13.3: Phân tích Log & Lỗi](../03-log-error-analysis/) →
