---
title: 'Slash Commands'
description: 'Sử dụng slash commands trong Claude Code: /help, /compact, /clear, /cost và các lệnh tùy chỉnh.'
---

# Module 4.3: Slash Commands

> **Thời gian học**: ~25 phút
>
> **Yêu cầu trước**: Module 4.2 (CLAUDE.md — Bộ Nhớ Dự Án)
>
> **Kết quả**: Sau module này, bạn sẽ biết mọi slash command trong Claude Code, khi nào dùng lệnh nào, và cách chúng kết hợp thành workflow hiệu quả — đặc biệt là các lệnh quản lý context rất quan trọng cho session dài.

---

## 1. WHY — Tại Sao Cần Biết

Bạn code được 45 phút trong một session refactor phức tạp. Claude bắt đầu phản hồi chậm lại. Context window đầy. Bạn cần nén lại lịch sử hội thoại để tiếp tục làm việc, nhưng lệnh là gì nhỉ? `/compact`? `/compress`? `/summarize`? Bạn gõ `/help` và giật mình nhận ra mình dùng Claude Code mấy tháng nay mà chỉ biết 2-3 lệnh. Bạn đang lái máy bay bịt mắt. Đa số developer không bao giờ học hết bộ lệnh, rồi tốn hàng giờ restart session hoặc làm việc với chất lượng kém. Module này cho bạn bức tranh toàn cảnh — mọi slash command đã xác thực, khi nào dùng, và cách chúng kết hợp thành workflow mượt mà.

---

## 2. CONCEPT — Khái Niệm Cốt Lõi

### Slash Commands Là Gì?

**Slash commands** là các lệnh built-in bắt đầu bằng `/`, dùng để điều khiển hành vi của Claude Code trong session. Khác với prompt thông thường (yêu cầu Claude làm việc gì đó), slash commands thay đổi trạng thái session, hiển thị thông tin, hoặc kích hoạt hành động system-level.

Hình dung chúng như bảng điều khiển cho AI session của bạn. Prompt thường là "cái bạn muốn xây". Slash commands là "cách bạn duy trì môi trường xây dựng".

### Phân Loại Commands

Slash commands trong Claude Code chia thành ba nhóm chính:

| Nhóm | Mục Đích | Các Lệnh |
|------|----------|----------|
| **Quản Lý Context** | Kiểm soát lịch sử hội thoại và bộ nhớ | `/compact`, `/clear`, `/context` |
| **Thông Tin** | Kiểm tra trạng thái session và chi phí | `/help`, `/cost`, `/status`, `/stats` |
| **Setup Dự Án** | Khởi tạo cấu hình riêng cho dự án | `/init`, `/memory`, `/add-dir` |
| **Model & Config** | Đổi model và cài đặt | `/model`, `/config`, `/theme`, `/statusline`, `/vim` |
| **Quản Lý Session** | Điều hướng và quản lý session | `/resume`, `/rename`, `/export`, `/copy` |
| **Chẩn Đoán** | Khắc phục sự cố và báo lỗi | `/doctor`, `/bug`, `/debug` |

### Decision Tree — Lệnh Nào Khi Nào?

Khi nào thì dùng lệnh nào? Đây là mental model:

```mermaid
graph TD
    A[Vấn đề?] --> B{Session thấy chậm?}
    A --> C{Chuyển sang topic mới?}
    A --> D{Muốn check tiền?}
    A --> E{Setup dự án mới?}
    A --> F{Quên mất có lệnh gì?}

    B -->|Có| G[/compact]
    C -->|Có, không liên quan task hiện tại| H[/clear]
    D -->|Có| I[/cost]
    E -->|Có| J[/init]
    F -->|Có| K[/help]

    G --> L[Tiếp tục làm với context được giải phóng]
    H --> M[Khởi đầu mới, mọi context bị xóa]
    I --> N[Xem usage, quyết định có cần /compact không]
    J --> O[CLAUDE.md tạo xong, configure dự án]
    K --> P[Xem tất cả lệnh có sẵn]
```

### Vòng Đời /compact (Quan Trọng Nhất)

Lệnh `/compact` là công cụ quan trọng nhất cho session dài. Đây là cách nó hoạt động:

**Nó làm gì:**
- Tóm tắt lịch sử hội thoại đến thời điểm hiện tại
- Nén những đoạn trao đổi dài dòng thành summary ngắn gọn
- Giải phóng không gian context window cho công việc mới
- Bảo toàn các quyết định quan trọng, lựa chọn kiến trúc, và code snippets then chốt

**Khi nào dùng:**
- Mỗi 30-40 phút trong session active
- Trước khi bắt đầu sub-task mới trong cùng dự án
- Khi bạn nhận thấy câu trả lời kém chính xác hơn hoặc chậm hơn
- Khi `/cost` cho thấy bạn sắp chạm giới hạn token

**Nó bảo toàn gì vs. tóm tắt gì:**
- ✅ Bảo toàn: Quyết định gần đây, nội dung file đang active, lựa chọn kiến trúc quan trọng
- 📝 Tóm tắt: Chi tiết implementation từng bước, giải thích dài dòng, trao đổi lặp lại
- ⚠️ Có thể mất: Wording chính xác của code snippets lúc đầu, reasoning chi tiết từ đầu session

**Pro tip:** `/compact` không phá hủy gì cả — nó giống "save and compress" hơn là "delete". Dùng thoải mái. Nhược điểm duy nhất là mất một số chi tiết nguyên văn từ lúc đầu.

### Custom Slash Commands

Claude Code hỗ trợ custom slash commands thông qua file Markdown trong thư mục `.claude/commands/`:

**Lệnh cấp project** (chia sẻ với team qua git):
```
.claude/commands/review.md     → hiển thị là /project:review
.claude/commands/test.md       → hiển thị là /project:test
```

**Lệnh toàn cục** (có sẵn trong mọi project):
```
~/.claude/commands/my-prompt.md  → hiển thị là /user:my-prompt
```

**Ví dụ:** Tạo lệnh code review tái sử dụng:

```markdown
<!-- .claude/commands/review.md -->
Review các thay đổi hiện tại với focus vào:
1. Lỗ hổng bảo mật
2. Bottleneck hiệu năng
3. Error handling đầy đủ chưa
4. Coverage test thiếu chỗ nào

Dùng coding conventions của project từ CLAUDE.md.
```

Giờ gõ `/project:review` trong bất kỳ REPL session nào để sử dụng. Custom commands cũng có thể dùng placeholder `$ARGUMENTS` để nhận tham số.

---

## 3. DEMO — Từng Bước Thực Hành

Cùng đi qua một session code dài thực tế, dùng mọi slash command đã được xác thực.

**Kịch bản:** Bạn đang xây một REST API service mới. Đây là lần đầu làm việc với project này, và bạn dự kiến session sẽ chạy 60+ phút.

---

**Bước 1: Khởi động session và check các lệnh có sẵn**

```bash
$ claude
```

Bạn đã vào session. Đầu tiên, xem có gì:

```
/help
```

Kết quả mong đợi:
```
Available commands:
  /help     - Show this help message
  /compact  - Compress conversation history to free context space
  /clear    - Clear all conversation history and start fresh
  /cost     - Show token usage and estimated cost for this session
  /init     - Initialize CLAUDE.md for current project

Type a command or describe what you want to build.
```

**Tại sao quan trọng:** Bạn giờ có tài liệu tham khảo. Bookmark trong đầu — `/help` là phao cứu sinh khi quên cú pháp.

---

**Bước 2: Khởi tạo cấu hình dự án**

Bạn đang bắt đầu với một dự án mới. Setup bộ nhớ cho dự án:

```
/init
```

Kết quả mong đợi:
```
Creating CLAUDE.md in current directory...

I've created a starter CLAUDE.md file. Let me open it so we can configure
it for your project.

[CLAUDE.md mở ra với nội dung template]

What kind of project is this? I'll help you customize the configuration.
```

**Tại sao quan trọng:** Bạn đang setup context riêng cho dự án ngay từ đầu. Claude giờ sẽ nhớ stack, conventions, và constraints của bạn qua các session.

---

**Bước 3: Làm việc 20 phút, sau đó check token usage**

Bạn đã implement xong hai API endpoints đầu tiên. Giờ check chi phí:

```
/cost
```

Kết quả mong đợi:
```
Session Token Usage:
  Input tokens:  12,847
  Output tokens:  8,392
  Total tokens:  21,239

Estimated cost: $0.18
Context window: ~21% full

💡 Tip: Context is healthy. Continue working normally.
```

**Tại sao quan trọng:** Bạn giờ biết tốc độ tiêu token. Vẫn OK để tiếp tục mà chưa cần compact.

---

**Bước 4: Làm thêm 20 phút nữa, chất lượng thấy giảm — nén context**

Bạn đã vào phút thứ 40. Câu trả lời thấy kém chính xác hơn chút. Check cost lại, rồi compact:

```
/cost
```

Kết quả mong đợi:
```
Session Token Usage:
  Input tokens:  38,291
  Output tokens: 24,103
  Total tokens:  62,394

Estimated cost: $0.52
Context window: ~62% full

⚠️ Consider using /compact to free context space.
```

Giờ compact:

```
/compact
```

Kết quả mong đợi:
```
Compacting conversation history...

✓ Compressed 62,394 tokens → 18,203 tokens (71% reduction)
✓ Preserved:
  - Current CLAUDE.md configuration
  - API endpoint implementations (users, products)
  - Database schema decisions
  - Error handling patterns

You can continue working. Context window freed.
```

**Tại sao quan trọng:** Bạn vừa lấy lại ~44k tokens. Bạn có thể làm thêm 30-40 phút nữa trước khi cần compact lần sau.

---

**Bước 5: Hoàn thành API, chuyển sang task hoàn toàn khác — clear context**

API xong rồi. Giờ bạn cần làm React dashboard (codebase hoàn toàn khác). Clear tất cả:

```
/clear
```

Kết quả mong đợi:
```
Are you sure you want to clear all conversation history? This cannot be undone.
Type 'yes' to confirm, or anything else to cancel.
```

```
yes
```

Kết quả mong đợi:
```
✓ Conversation history cleared.
✓ Context window reset.

Starting fresh. What would you like to work on?
```

**Tại sao quan trọng:** Bạn đã reset hoàn toàn. Không có context của API nào chảy sang công việc dashboard. Bảng trắng tinh cho cả bạn lẫn Claude.

---

## 4. PRACTICE — Tự Thử Nghiệm

### Bài Tập 1: Marathon Session

**Mục tiêu:** Trải nghiệm toàn bộ vòng đời quản lý context trong session dài.

**Hướng dẫn:**
1. Khởi động Claude session mới
2. Chọn một task phức tạp (multi-file refactoring, feature mới, bug investigation)
3. Làm việc 10 phút, chạy `/cost` — ghi lại số token
4. Làm thêm 10 phút, chạy `/cost` lại — quan sát tốc độ tăng
5. Tiếp tục làm cho đến khi `/cost` cảnh báo hoặc response thấy chậm
6. Chạy `/compact` và ghi lại mức giảm token
7. Tiếp tục làm thêm 20 phút nữa
8. Chạy `/cost` lần cuối — so sánh với số liệu trước khi compact

**Kết quả mong đợi:**
- Bạn sẽ thấy token giảm 60-80% sau `/compact`
- Response sẽ cảm thấy nhanh hơn sau khi compact
- Bạn sẽ phát triển trực giác về khi nào cần compaction (cảm giác "sluggish")

<details>
<summary>💡 Gợi Ý</summary>

Đa số developer đợi quá lâu mới compact. Nếu đang làm công việc phức tạp, hãy compact mỗi 30 phút dù response vẫn OK — đó là bảo trì phòng ngừa.

</details>

<details>
<summary>✅ Giải Pháp</summary>

Không có câu trả lời "đúng" duy nhất — mục tiêu là nội hóa nhịp điệu. Nhưng đây là pattern điển hình:

- 0-10 phút: ~8k tokens
- 10-20 phút: ~18k tokens (tốc độ tăng cao, nhiều code generation)
- 20-30 phút: ~32k tokens (ngưỡng cảnh báo context trên một số model)
- Sau `/compact`: ~12k tokens (bảo toàn công việc gần đây, tóm tắt phần khám phá đầu)
- 30-50 phút sau compact: ~28k tokens
- **Insight then chốt:** Không compact thì bạn sẽ chạm giới hạn quanh phút 35. Với compact, bạn có thể làm liên tục 60+ phút.

</details>

---

### Bài Tập 2: Fresh Start Protocol

**Mục tiêu:** Hiểu sự khác biệt giữa `/compact` (tóm tắt) và `/clear` (reset).

**Hướng dẫn:**
1. Khởi động session, implement một feature nhỏ (ví dụ: validation function)
2. Chạy `/compact`
3. Hỏi Claude "Chúng ta vừa build cái gì?" — ghi lại câu trả lời
4. Giờ chạy `/clear` và confirm
5. Hỏi Claude "Chúng ta vừa build cái gì?" lần nữa

**Kết quả mong đợi:**
- Sau `/compact`: Claude nhớ validation function (đã tóm tắt)
- Sau `/clear`: Claude không biết gì, context reset hoàn toàn

<details>
<summary>💡 Gợi Ý</summary>

Dùng `/compact` khi chuyển sub-task trong cùng dự án. Dùng `/clear` chỉ khi chuyển sang dự án hoàn toàn không liên quan hoặc khi muốn xóa bỏ toàn bộ context trước đó (hiếm).

</details>

<details>
<summary>✅ Giải Pháp</summary>

**Sau /compact:**
```
Bạn: Chúng ta vừa build cái gì?

Claude: Chúng ta đã implement email validation function với regex pattern matching,
custom error messages, và xử lý edge cases cho plus-addressing và
internationalized domains.
```

**Sau /clear:**
```
Bạn: Chúng ta vừa build cái gì?

Claude: Tôi không có context về những gì chúng ta build trước đó. Lịch sử hội thoại
đã bị xóa. Bạn muốn làm việc gì?
```

Điều này chứng minh `/compact` là lossy summarization, trong khi `/clear` là total amnesia.

</details>

---

## 5. CHEAT SHEET

### Tất Cả Lệnh Đã Xác Thực

#### Context & Memory

| Lệnh | Chức Năng | Khi Nào Dùng |
|------|-----------|--------------|
| `/help` | Liệt kê tất cả slash commands | Khi quên cú pháp |
| `/compact` | Nén lịch sử hội thoại | Mỗi 30-40 phút, hoặc khi response giảm chất lượng |
| `/compact [focus]` | Compact với hướng dẫn giữ lại context cụ thể | `/compact Giữ lại quyết định auth và danh sách API` |
| `/clear` | Xóa TOÀN BỘ lịch sử hội thoại | Chuyển sang dự án không liên quan |
| `/cost` | Hiển thị token usage và chi phí ước tính | Mỗi 20-30 phút để track chi tiêu |
| `/init` | Khởi tạo CLAUDE.md cho dự án | Lần đầu làm dự án mới |
| `/memory` | Sửa file CLAUDE.md | Cập nhật project memory giữa session |
| `/context` | Hiển thị lưới context usage | Xem context window còn bao nhiêu |
| `/add-dir` | Thêm thư mục vào working context | Mở rộng phạm vi file Claude nhìn thấy |

#### Model & Cấu Hình

| Lệnh | Chức Năng | Khi Nào Dùng |
|------|-----------|--------------|
| `/model` | Đổi AI model; dùng mũi tên để chỉnh effort | Chuyển giữa Haiku/Sonnet/Opus giữa session |
| `/config` | Mở giao diện cài đặt | Chỉnh cài đặt session hoặc global |
| `/permissions` | Xem/cập nhật quyền tool | Kiểm tra hoặc thay đổi tool được phép |
| `/theme` | Đổi color theme | Tuỳ chỉnh giao diện |
| `/statusline` | Cấu hình status line UI | Tuỳ chỉnh thanh trạng thái dưới cùng |
| `/vim` | Bật/cấu hình vim mode | Dành cho người dùng vim |
| `/terminal-setup` | Cài keybinding cho terminal | Bật Shift+Enter cho input nhiều dòng |

#### Quản Lý Session

| Lệnh | Chức Năng | Khi Nào Dùng |
|------|-----------|--------------|
| `/resume` | Resume session hoặc hiện danh sách | Quay lại conversation trước |
| `/rename <name>` | Đổi tên session hiện tại | Đặt tên có ý nghĩa cho session quan trọng |
| `/rewind` | Rewind conversation/thay đổi code | Undo message gần đây |
| `/export [file]` | Xuất conversation ra file/clipboard | Lưu session để tham khảo |
| `/copy` | Copy response cuối của assistant | Copy nhanh ra clipboard |
| `/tasks` | Liệt kê/quản lý background tasks | Theo dõi các thao tác song song |
| `/todos` | Liệt kê TODO items hiện tại | Kiểm tra mục đang chờ |

#### Chẩn Đoán

| Lệnh | Chức Năng | Khi Nào Dùng |
|------|-----------|--------------|
| `/status` | Hiện version, model, thông tin tài khoản | Xem tổng quan session nhanh |
| `/stats` | Hiện usage hàng ngày và streaks | Theo dõi năng suất |
| `/doctor` | Kiểm tra sức khoẻ cài đặt | Chẩn đoán vấn đề setup |
| `/bug` | Báo lỗi | Gửi feedback cho Anthropic |
| `/debug` | Khắc phục sự cố session với debug log | Điều tra vấn đề session |

### Combo Mạnh

Kết hợp lệnh cho workflow mạnh mẽ:

| Combo | Workflow | Use Case |
|-------|----------|----------|
| `/cost` → `/compact` | Check token usage, sau đó nén nếu cần | Bảo trì phòng ngừa mỗi 30 phút |
| `/clear` → `/init` → làm việc | Reset hoàn toàn, config dự án mới, bắt đầu fresh | Chuyển dự án giữa ngày |
| `/compact` → tiếp tục → `/cost` | Compact, làm tiếp, verify token giảm | Session dài (60+ phút) |
| `/help` → thử lệnh → `/cost` | Học lệnh mới, test nó, check impact | Chế độ thử nghiệm |

---

## 6. PITFALLS — Sai Lầm Thường Gặp

| ❌ Sai Lầm | ✅ Cách Đúng |
|------------|--------------|
| Dùng `/clear` khi định dùng `/compact` — mất toàn bộ context khi chỉ cần nén | Dùng `/clear` CHỈ cho dự án mới không liên quan. Dùng `/compact` cho sub-tasks cùng dự án. |
| Không bao giờ compact cho đến khi context 100% đầy và response chậm | Compact chủ động mỗi 30-40 phút. Nó miễn phí, nhanh, và ngăn chặn suy giảm. |
| Không bao giờ check `/cost` cho đến cuối session | Chạy `/cost` mỗi 20-30 phút. Phát triển trực giác về tốc độ tiêu token. Bắt pattern tốn kém sớm. |
| Cho rằng `/compact` giữ nguyên văn code từ 30 phút trước | `/compact` tóm tắt. Nếu cần code chính xác, lưu vào file hoặc CLAUDE.md trước khi compact. |
| Dùng `/clear` cho mọi sub-task (ví dụ: sau mỗi function implement) | `/clear` phá hủy context. Chỉ dùng khi chuyển sang dự án HOÀN TOÀN khác. Cho sub-tasks, cứ tiếp tục hoặc dùng `/compact`. |
| Bỏ qua `/init` cho dự án mới, rồi thắc mắc sao Claude quên stack qua các session | Luôn `/init` với dự án mới. CLAUDE.md là bộ nhớ persistent. Slash commands là bộ nhớ session. |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Kịch bản:** Một senior backend engineer ở một fintech startup Việt Nam đang refactor payment microservice — 8 giờ làm việc chạm vào 30+ files từ authentication, transaction processing, đến reconciliation logic.

**Vấn đề:** Trước khi học slash commands, workflow của anh ấy rất khốc liệt: làm 45 phút, nhận thấy response giảm chất lượng, restart Claude hoàn toàn, giải thích lại context mất 10 phút, làm thêm 45 phút, lặp lại. Bốn lần restart cưỡng bức mỗi ngày. Anh ước tính mất 90 phút mỗi ngày chỉ để reset context.

**Giải pháp:** Sau module này, anh implement kỷ luật slash command:
- `/init` lúc bắt đầu dự án (CLAUDE.md capture kiến trúc service)
- `/cost` mỗi 20 phút (đặt timer)
- `/compact` mỗi 40 phút hoặc khi `/cost` hiển thị >50% context usage
- `/clear` chỉ khi chuyển sang service khác

**Kết quả:**
- Zero lần restart cưỡng bức trong session 8 giờ
- Token usage giảm 30% (compact giải phóng không gian, không có giải thích lại thừa)
- Cải thiện chất lượng chủ quan: "Responses giữ được sắc sảo cả ngày. Sự khác biệt giữa chạy nước rút có nghỉ ngơi vs. chạy đến khi ngã."

Team của anh giờ đưa kỷ luật slash command vào tài liệu onboarding: "Nếu không dùng `/compact` mỗi 30 phút, là bạn đang làm sai."

---

> **Tiếp theo**: [Module 4.4: Memory System](../04-memory-system/) →
