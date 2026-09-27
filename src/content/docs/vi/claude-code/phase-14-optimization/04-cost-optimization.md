---
title: 'Tối ưu Chi phí'
description: 'Giá thật của Claude Code, prompt caching tự động, --max-budget-usd, và cost ladder từ CLAUDE.md gọn tới chọn đúng model.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 14.4: Tối ưu Chi phí

> **Thời gian ước tính**: ~35 phút
>
> **Yêu cầu trước**: Module 14.3 (Tối ưu Chất lượng)
>
> **Kết quả**: Sau module này, bạn đọc được `/usage`, giới hạn spend bằng `--max-budget-usd`, giữ
> prompt caching hoạt động thay vì vô tình reset nó, và áp dụng cost ladder thật thay vì "cứ đổi
> model rẻ hơn".

---

## 1. WHY — Tại sao cần học

Hóa đơn cao hơn dự kiến và không ai biết chính xác vì sao. Đoán mò không sửa được — đọc xem token
thực sự đi đâu mới sửa được. Claude Code cache prompt tự động, có flag budget cap thật, và
Anthropic công bố số cost enterprise thật — không cần bịa ra hệ số nhân nào để chứng minh luận
điểm.

---

## 2. CONCEPT — Khái niệm cốt lõi

Số của chính Anthropic, không phải ước tính: "Across enterprise deployments, the average cost is
around $13 per developer per active day and $150-250 per developer per month, with costs
remaining below $30 per active day for 90% of users" (S15). Agent team tốn hơn theo thiết kế —
"approximately 7x more tokens than standard sessions when teammates run in plan mode, because each
teammate maintains its own context window and runs as a separate Claude instance" (S15); một agent
đơn (không phải team) đã chạy "~4×" token của một chat turn, multi-agent "~15×" (S10).

**Giá** (per MTok, ⚠️ verify tại <https://platform.claude.com/docs/en/about-claude/pricing>, kiểm
tra ngày 2026-09-27):

| Model | Base input | 1h cache write | Cache hit | Output |
|---|---|---|---|---|
| Claude Opus 5.5 | $4 | $8 | $0.20 (0.05x) | $20 |
| Claude Opus 5 | $5 | $10 | $0.50 | $25 |
| Claude Sonnet 5 | $2 | $4 | $0.20 | $10 |
| Claude Haiku 4.5 | $1 | $2 | $0.10 | $5 |
| Claude Fable 5.1 | $10 | $20 | $0.25 (0.025x) | $50 |

Không phụ phí riêng cho context window 1M: "Claude 4.6 and later models… include the full 1M
token context window at standard pricing. (A 900k-token request is billed at the same per-token
rate as a 9k-token request.)"

**Prompt caching tự động** — "Claude Code handles prompt caching for you, unless you disable it."
Cache mặc định sống **1 giờ** trong plan usage của Claude subscription, **5 phút** trên usage
credits, API key, hoặc cloud provider; một hit tốn 0.1x base input trên hầu hết model (0.05x trên
Opus 5.5, 0.025x trên Fable 5.1). Cái làm reset: đổi model hoặc effort level (trừ Opus 5.5/Fable
5.1 trên API key hoặc subscription), lần đầu bật fast mode trong conversation, thêm/bỏ MCP server,
compact, upgrade Claude Code. Cái không làm reset: sửa file, đổi permission mode, đổi output
style, chạy skill hoặc command.

**Góc nhìn subscription vs API.** `/usage` (alias `/cost` và `/stats`) hiện view plan-usage cho
seat subscription, hoặc Session block với `Total cost` bằng đô trên usage credits / API key.
`/insights` viết report HTML vào `~/.claude/usage-data/report.html` từ tối đa 200 session gần
nhất trên máy. `--max-budget-usd` (chỉ print mode) dừng chi tiêu qua một mốc đô, và "spend from
subagents counts toward the cap." `opusplan` dùng Opus để plan, đổi sang Sonnet để thực thi — mỗi
lần đổi là một model switch, nên cũng tốn một lần reset cache.

**Cost ladder** (S15), thói quen rẻ nhất trước: `/clear` giữa các task không liên quan · chọn
model theo việc, không mặc định · ít MCP server hơn, ưu tiên CLI tool như `gh`/`aws`/`gcloud` ·
đẩy việc verbose sang hook và skill · giữ CLAUDE.md dưới 200 dòng · giao việc verbose (chạy test,
xử lý log) cho subagent để chỉ tóm tắt của nó quay lại context bạn.

---

## 3. DEMO — Từng bước cụ thể

**Bước 1: Đọc `/usage`**

```text
# docs: en/commands — /usage (alias: /cost, /stats)
/usage
```

```text
# Output may vary — view plan-usage của subscription (account này dùng Claude subscription,
# không phải usage credits, nên không hiện số đô mỗi call ở đây). Tên skill/subagent/plugin
# bên dưới đã redact — của bạn sẽ liệt kê thứ bạn cài.
  Last 24h · these are independent characteristics of your usage, not a breakdown

  …% of your usage came from subagent-heavy sessions
   Each subagent runs its own requests. Be deliberate about spawning them.

  …% of your usage was at >150k context
   Longer sessions are more expensive even when cached.

  Usage credits
  Usage credits are off · /usage-credits to turn them on
```

Trên usage credits hoặc API key, đúng lệnh này hiện Session block với `total_cost_usd` thật mỗi
call thay vào đó — đó là cái Bước 2 dùng.

**Bước 2: Prompt caching, đo thật — chạy cùng prompt hai lần**

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
# cùng lệnh, chạy lại ngay
claude -p "Read src/math.js and list its exported function names, comma separated." \
  --allowedTools Read --output-format json
```

```text
# Output may vary
total_cost_usd: 0.0185344   cache_read_input_tokens: 85292   cache_creation_input_tokens: 0
```

Lần thứ hai rẻ hơn khoảng 14 lần — `cache_creation_input_tokens` về 0 vì toàn bộ prefix đã được
ghi vào cache từ lần gọi đầu.

**Bước 3: `--max-budget-usd` thực sự dừng một run**

```bash
# docs: en/cli-reference — --max-budget-usd (chỉ print mode)
claude -p "Read src/math.js and tests/math.test.mjs. Then write a detailed 400-word code review." \
  --allowedTools Read --max-budget-usd 0.05 --output-format json
```

```text
# Output may vary
"terminal_reason":"budget_exhausted","subtype":"error_max_budget_usd",
"errors":["Reached maximum budget ($0.05)"],"total_cost_usd":0.2527206
```

Call đang chạy hoàn tất trước khi cap có hiệu lực, nên spend thật vượt cap —
`--max-budget-usd` dừng call *tiếp theo*, không phải call đang chạy. Đặt nó thấp hơn hẳn mức bạn
chịu được, không đặt đúng bằng giới hạn.

**Bước 4: `opusplan` và `/insights`**

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

Xác nhận thật trên đĩa tại `~/.claude/usage-data/report.html` — bản thân report là dữ liệu usage
cá nhân, nên module này không dán nội dung của nó.

---

## 4. PRACTICE — Luyện tập

### Bài 1: Tự bắt lỗi reset cache của bạn

**Mục tiêu**: Nhận ra khi nào bạn vô tình reset cache.

**Hướng dẫn**:
1. Chạy cùng prompt hai lần liên tiếp, ghi lại cost giảm (Bước 2).
2. Đổi model bằng `/model`, rồi chạy lần thứ ba.
3. So sánh `cache_creation_input_tokens` lần ba với lần hai.

<details>
<summary>💡 Gợi ý</summary>

Đổi effort level cũng reset cache, trừ Opus 5.5 hoặc Fable 5.1 trên API key hoặc subscription.

</details>

<details>
<summary>✅ Giải pháp</summary>

Đổi model làm `cache_creation_input_tokens` quay lại gần giá trị lần đầu — toàn bộ prefix phải
viết lại, ở giá 2x base input cho cache 1 giờ.

</details>

### Bài 2: Đặt budget cap vừa vặn

**Mục tiêu**: Dùng `--max-budget-usd` mà không bị bất ngờ vì vượt mức.

**Hướng dẫn**:
1. Ước lượng cost của task từ `total_cost_usd` của một run tương tự trước đó.
2. Đặt `--max-budget-usd` ở khoảng nửa ước lượng đó.
3. Chạy và đọc `errors` nếu nó dừng sớm.

<details>
<summary>💡 Gợi ý</summary>

Cap không thể ngắt một call đang chạy — hãy tính theo kích thước một turn, không chỉ tổng.

</details>

<details>
<summary>✅ Giải pháp</summary>

Cap đặt quá sát tổng dự kiến dễ bị nhiễu bình thường kích hoạt. Nửa ước lượng để lại chỗ cho một
turn đắt trước khi cap can thiệp.

</details>

### Bài 3: Đi qua cost ladder trên project của bạn

**Mục tiêu**: Áp dụng ladder S15 vào một project thật.

**Hướng dẫn**:
1. Đếm số dòng CLAUDE.md. Trên 200? Chuyển chi tiết sang skill.
2. Liệt kê MCP server đang kết nối. Cái nào thay được bằng CLI tool?
3. Tìm một task verbose (chạy test, tail log) có thể giao cho subagent.

<details>
<summary>💡 Gợi ý</summary>

`/context` hiện thứ thực sự đang load — gồm cả định nghĩa MCP server — trước khi bạn đoán mò cái
cần cắt.

</details>

<details>
<summary>✅ Giải pháp</summary>

Ladder xếp theo tỉ lệ công sức/hiệu quả: `/clear` và chọn model không tốn gì để thử trước; tái
cấu trúc CLAUDE.md và MCP server tốn thời gian hơn nhưng cộng dồn qua mọi session sau.

</details>

---

## 5. CHEAT SHEET

| Lệnh / Flag | Tác dụng |
|---|---|
| `/usage` (alias `/cost`, `/stats`) | View plan-usage (subscription) hoặc Session block $ (credits/API) |
| `/insights` | Report HTML tại `~/.claude/usage-data/report.html`, tối đa 200 session |
| `--max-budget-usd <n>` | Dừng call *tiếp theo* khi spend vượt `<n>` (print mode) |
| `--output-format json` → `.total_cost_usd` | Cost thật bằng đô mỗi call |
| `/model opusplan` | Opus để plan, Sonnet để thực thi — mỗi lần đổi reset cache |
| `DISABLE_PROMPT_CACHING` / `_HAIKU` / `_SONNET` / `_OPUS` / `_FABLE` | Tắt caching theo từng model |
| `CLAUDE_CODE_PROMPT_CACHE_TTL` (`5m`\|`1h`) | Override thời gian sống mặc định của cache |

⚠️ Bảng giá trên: verify tại URL pricing trước khi trích số vào proposal hay hóa đơn.

---

## 6. PITFALLS — Sai lầm thường gặp

| ❌ Sai | ✅ Đúng |
|---|---|
| Trích giá thời 2024 ("Opus $15/$75", "Haiku $0.25/$1.25") | Giá hiện tại thấp hơn và thay đổi — luôn trích bảng ⚠️ trên với ngày kiểm tra |
| "Context window 1M tốn thêm phí" | Model 4.6+ tính cả cửa sổ đó theo giá per-token chuẩn — không phụ phí |
| Đổi model hoặc effort giữa session để "thử" | Cả hai reset prompt caching (trừ ngoại lệ hẹp Opus 5.5/Fable 5.1) — viết lại full giá, không miễn phí |
| Đặt `--max-budget-usd` đúng bằng giới hạn | Call đang chạy có thể xong vượt cap — đặt dưới mức trần thật |
| Bảo Claude reason từng bước để Opus suy luận kỹ hơn trước khi tốn thêm | Extended thinking đã bật mặc định (Module 6.1); câu đó không thêm ngân sách hay giảm cost |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Một team remote Việt Nam chạy Claude Code trong CI cho các check PR thường xuyên,
không có cách nào biết một run điển hình tốn bao nhiêu cho tới khi hóa đơn tháng về.

**Vấn đề**: Không ai biết, ngay trong một run CI đang chạy, liệu nó có đang đi đúng hướng hay đã
vượt mức thường thấy của loại job đó.

**Giải pháp**: `--max-budget-usd` trên mọi lần gọi CI, đặt từ lịch sử `total_cost_usd` gần nhất
của loại job đó, cộng một report `/insights` hàng tuần do người phụ trách pipeline CI tháng đó
xem lại.

**Kết quả**: Một run đắt bất thường giờ tự dừng và báo lý do, thay vì lộ ra ba tuần sau trên hóa
đơn không kèm ngữ cảnh nào.

---

> **Hoàn thành Phase 14!** Bạn đã học tối ưu Claude Code cho hiệu quả task, tốc độ, chất lượng,
> và chi phí.
>
> **Phase Tiếp Theo**:
> [Phase 15: Templates, Skills & Ecosystem](../../phase-15-templates-skills/01-claude-md-templates/) →
