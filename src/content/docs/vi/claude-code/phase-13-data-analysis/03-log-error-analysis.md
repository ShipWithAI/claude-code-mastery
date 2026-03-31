---
title: 'Phân tích Log & Lỗi'
description: 'Dùng Claude Code để phân tích log file, tìm root cause lỗi và tạo báo cáo incident tự động.'
---

# Module 13.3: Phân tích Log & Lỗi

> **Thời gian ước tính**: ~35 phút
>
> **Yêu cầu trước**: Module 13.1 (Phân tích Dữ liệu), Module 13.2 (Tạo Báo cáo)
>
> **Mục tiêu**: Sau module này, bạn sẽ biết phân tích log với Claude Code, nhận diện error pattern, thực hiện root cause analysis, và tạo incident report.

---

## 1. WHY — Tại sao điều này quan trọng

Production sập. Bạn có 500MB log. Đáp án nằm đâu đó trong đó. Cách truyền thống: grep "ERROR", scroll qua hàng nghìn dòng, đối chiếu timestamp thủ công. Mất hàng giờ. Rất dễ bỏ sót nguyên nhân thật sự.

Cách dùng Claude Code: "Phân tích log này. Tìm lỗi, nhận diện pattern, đề xuất root cause." Claude parse log, nhóm lỗi, tìm correlation, chỉ ra thủ phạm — trong vài phút. Phân tích log là nơi AI hỗ trợ hiệu quả cao nhất.

---

## 2. CONCEPT — Khái niệm cốt lõi

### Workflow Phân tích Log

```text
[Raw Logs] → [Parse] → [Filter] → [Pattern] → [Correlate] → [Root Cause]
    ↓          ↓         ↓          ↓           ↓            ↓
  500MB     Cấu trúc   Lỗi      Nhóm lỗi    Timeline      Đáp án
```

### Các Task Phân tích Log

| Task | Mô tả | Prompt cho Claude |
|------|-------|-------------------|
| **Parse** | Hiểu format log | "Log này format kiểu gì?" |
| **Filter** | Lọc entry liên quan | "Hiện tất cả ERROR và WARN" |
| **Count** | Phân tích tần suất | "Đếm lỗi theo từng loại" |
| **Timeline** | Pattern theo thời gian | "Lỗi bắt đầu tăng đột biến lúc nào?" |
| **Correlate** | Tìm mối liên hệ | "Điều gì xảy ra trước mỗi lỗi OOM?" |
| **Root Cause** | Xác định nguồn gốc | "Root cause có thể là gì?" |

### Format Log Phổ biến

- Application logs (timestamp, level, message)
- Access logs (Apache, Nginx)
- JSON structured logs
- Stack traces
- Syslog

### Các Loại Pattern Lỗi

- **Frequency spike**: Số lỗi tăng đột biến
- **Cascading failures**: Một lỗi kéo theo lỗi khác
- **Periodic errors**: Lỗi định kỳ (cron, scheduled tasks)
- **Resource exhaustion**: Hết memory, disk, connections
- **External dependency**: Service bên thứ ba sập

---

## 3. DEMO — Từng bước cụ thể

**Tình huống**: Production incident — API trả về 500 errors. Phân tích application.log.

### Step 1: Khám phá ban đầu

```text
Bạn: Đọc application.log (10000 dòng cuối). Format gì? Tóm tắt log levels.

Claude: [Phân tích log]

Format: JSON structured (timestamp, level, service, message, trace_id)

Tóm tắt (45 phút, 10000 entry):
- DEBUG: 4,521 (45%) | INFO: 3,892 (39%)
- WARN: 1,203 (12%) | ERROR: 384 (4%) ← Cao bất thường
```

### Step 2: Phân tích lỗi

```text
Bạn: Trích xuất tất cả ERROR entries. Nhóm theo loại/message. Hiện số lượng.

Claude: [Parse và nhóm]

Phân bố lỗi:
- "Database connection timeout" — 156 (41%)
- "Redis connection refused" — 124 (32%)
- "Null pointer in UserService" — 62 (16%)
- "Request timeout exceeded" — 42 (11%)

Nhận xét: Lỗi kết nối Database và Redis chiếm 73%.
Chỉ ra vấn đề infrastructure, không phải bug application.
```

### Step 3: Phân tích Timeline

```text
Bạn: Hiện tần suất lỗi theo thời gian, từng phút. Spike bắt đầu khi nào?

Claude: [Time-series analysis]

Timeline lỗi:
- 14:00-14:15: 2-5 lỗi/phút (baseline)
- 14:16: Nhảy lên 23 lỗi ← SPIKE BẮT ĐẦU
- 14:17-14:30: 40-60 lỗi/phút (cao)
- 14:31-14:45: 20-30 lỗi/phút (hồi phục một phần)

Spike bắt đầu chính xác lúc 14:16. Có gì đó thay đổi vào thời điểm đó.
```

### Step 4: Correlation và Root Cause

```text
Bạn: Chuyện gì xảy ra lúc 14:16? Tìm event bất thường trước spike.

Claude: [Correlation analysis]

Events 14:14-14:16:
- 14:14:32 INFO "Deployment started: api-gateway v2.3.1"
- 14:15:01 INFO "DB connection pool resize: 10 → 50"
- 14:15:45 WARN "Redis memory at 95%"

ROOT CAUSE: Deployment trigger pool resize (5x connections) → DB quá tải.
Redis đã stress → cascade failure. Khuyến nghị: Rollback deployment.
```

---

## 4. PRACTICE — Thực hành ngay

### Bài tập 1: Nhận diện Format Log

**Mục tiêu**: Luyện nhận diện các format log khác nhau.

**Hướng dẫn**:
1. Tìm sample logs (Apache, JSON, syslog)
2. Yêu cầu Claude nhận diện format và cách parse

<details>
<summary>💡 Gợi ý</summary>

Format phổ biến: Apache access logs, JSON structured, syslog, custom application logs. Mỗi loại có pattern đặc trưng riêng.

</details>

<details>
<summary>✅ Giải pháp</summary>

```text
Prompt: "Đọc [file log]. Đây là format gì?
Hiện cấu trúc và đề xuất cách parse."

Claude sẽ nhận diện:
- Delimiter-based (space, tab, pipe)
- JSON structured
- Regex-parseable patterns
- Timestamp formats
```

</details>

### Bài tập 2: Tìm Error Pattern

**Mục tiêu**: Nhóm và phân tích lỗi.

**Hướng dẫn**:
1. Dùng file log có nhiều loại lỗi
2. Yêu cầu Claude nhóm, đếm, và phân tích timeline

<details>
<summary>💡 Gợi ý</summary>

Hỏi: "Trích ERROR entries, nhóm theo message, đếm số lượng mỗi loại, rồi hiện tần suất theo thời gian."

</details>

<details>
<summary>✅ Giải pháp</summary>

```text
Các prompt theo thứ tự:
1. "Trích tất cả ERROR từ [log]. Nhóm theo error message."
2. "Đếm từng loại lỗi. Loại nào nhiều nhất?"
3. "Hiện tần suất lỗi theo thời gian. Có spike không?"
4. "Pattern này gợi ý điều gì? (spike, cascade, periodic, resource)"
```

</details>

### Bài tập 3: Điều tra Incident

**Mục tiêu**: Root cause analysis hoàn chỉnh.

**Hướng dẫn**:
1. Tạo log mô phỏng có "vấn đề" cài sẵn
2. Yêu cầu Claude tìm root cause và tạo incident report

<details>
<summary>💡 Gợi ý</summary>

Cài một nguyên nhân cụ thể (ví dụ: deployment, config change) vào log. Xem Claude có tìm ra không.

</details>

<details>
<summary>✅ Giải pháp</summary>

```text
Prompt điều tra đầy đủ:
"Phân tích [log]. Tìm tất cả lỗi, xác định khi nào chúng bắt đầu tăng đột biến,
tìm các event xảy ra trước spike, và xác định root cause khả năng cao.
Tạo incident report."
```

</details>

---

## 5. CHEAT SHEET

### Workflow Phân tích

```text
Parse → Filter → Count → Timeline → Correlate → Root Cause
```

### Prompt Chính

| Giai đoạn | Prompt |
|-----------|--------|
| Khám phá | "Format gì? Tóm tắt log levels." |
| Focus lỗi | "Tất cả ERROR nhóm theo loại, kèm số lượng." |
| Timeline | "Tần suất lỗi theo thời gian. Spike bắt đầu khi nào?" |
| Correlation | "Điều gì xảy ra trước mỗi [lỗi]?" |
| Root cause | "Dựa trên này, root cause khả năng cao là gì?" |

### Các Loại Error Pattern

- Frequency spike (tăng đột ngột)
- Cascading failure (phản ứng dây chuyền)
- Periodic (định kỳ/cron)
- Resource exhaustion (hết memory, disk)
- External dependency (bên thứ ba)

### Yêu cầu Output

- "Tạo incident report"
- "Tạo timeline visualization"
- "Tóm tắt cho stakeholders non-technical"

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai lầm | ✅ Cách đúng |
|---|---|
| Phân tích toàn bộ file log (quá lớn) | Bắt đầu với tail, entry gần đây, hoặc khoảng thời gian |
| Chỉ focus vào ERROR level | WARN thường xuất hiện trước ERROR, check cả hai |
| Bỏ qua timestamp | Timeline rất quan trọng cho correlation |
| Bỏ qua trace ID | Dùng trace_id để theo dõi flow của request |
| Cho rằng lỗi đầu tiên là root cause | Tìm điều gì xảy ra TRƯỚC các lỗi |
| Không cung cấp context về hệ thống | Nói với Claude về kiến trúc của bạn |
| Dừng ở triệu chứng | Hỏi "tại sao" liên tục đến khi ra root cause |

---

## 7. REAL CASE — Câu chuyện thực tế

**Tình huống**: Fintech Việt Nam, incident nửa đêm. Payment service lỗi. Kỹ sư on-call có 3 giờ log.

**Điều tra với Claude Code (15 phút)**:

**Bước 1**: "Phân tích payment-service.log. Phân bố lỗi."
→ 89% lỗi là "Circuit breaker open: bank-api"

**Bước 2**: "Spike bắt đầu khi nào? Có gì trước đó?"
→ Spike 23:47. Lúc 23:45: "Bank API response: 15000ms" (bình thường: 200ms)

**Bước 3**: "Vấn đề của ta hay ngân hàng?"
→ Bank API latency spike → circuit breaker kích hoạt. Hệ thống ta hoạt động đúng.

**Kết quả**: Xác nhận ngân hàng bảo trì quá giờ. Incident report sẵn sàng cho standup sáng.

**Quote**: "2 giờ grep và scroll, Claude làm 15 phút. Tìm ra external dependency issue tôi có thể bỏ sót."

---

> **Phase 13 hoàn thành!** Bạn giờ có data superpowers — từ phân tích đến báo cáo đến điều tra log.
>
> **Tiếp theo**: [Phase 14: Tối ưu hóa](../../phase-14-optimization/01-task-optimization/) →
