---
title: Mẹo & Thủ Thuật
description: Pro-tips từ 16 phase, hướng dẫn xử lý sự cố, và kỹ thuật nâng cao
---

import { Aside, Card, CardGrid } from '@astrojs/starlight/components';

## Pro Tips Từ 16 Phase

### Phase 1-3: Nền Tảng & Bảo Mật

<Card title="Bắt Đầu Đúng Cách Mọi Project" icon="rocket">
Chạy `/init` ngay khi vào project mới. Một CLAUDE.md với 6 phần thiết yếu (Tổng quan, Kiến trúc, Quy ước, Lệnh, Ràng buộc, Context) tiết kiệm thời gian hơn bất kỳ hành động nào khác.
</Card>

<Card title="Pattern .env.example" icon="warning">
Không bao giờ cho Claude đọc `.env` trực tiếp. Tạo `.env.example` với placeholder và nói: "Đọc .env.example rồi generate config dùng process.env." Thói quen đơn giản này ngăn 100% rủi ro lộ secret.
</Card>

<Card title="Bản Năng Phê Duyệt Quyền" icon="approve">
Xây thói quen: **Lệnh chỉ đọc → tự động duyệt. Lệnh ghi → kiểm tra trước. Lệnh phá hủy → luôn từ chối.** Sau một tuần, bạn sẽ bản năng biết nên duyệt hay kiểm tra.
</Card>

### Phase 4-6: Prompting & Làm Chủ Context

<Card title="Framework CREF" icon="pencil">
Cấu trúc mọi prompt phức tạp theo: **C**ontext (bối cảnh), **R**eference (tham chiếu), **E**xpectation (kỳ vọng), **F**ormat (định dạng). Team dùng CREF giảm tỉ lệ bị reject code review từ 35% xuống 12%.
</Card>

<Card title="Đọc Chọn Lọc Tiết Kiệm 60% Context" icon="open-book">
Đừng bao giờ nói "đọc tất cả file trong src/." Thay vào đó: (1) Hỏi cấu trúc thư mục, (2) Hỏi function signatures, (3) Chỉ đọc file cụ thể cần thiết. Chiến lược 3 lớp này dùng ít hơn 60% context.
</Card>

<Card title="Thời Điểm /compact Lý Tưởng" icon="setting">
Compact ở mức **50-70%** context, không phải 90%. Compact sớm giữ được nhiều context hữu ích hơn. Giống như defrag ổ đĩa — làm chủ động tốt hơn khi khẩn cấp.
</Card>

### Phase 7-8: Auto Coding & Meta-Debugging

<Card title="Luôn Đặt Ranh Giới Cho Auto Mode" icon="warning">
Trước mọi phiên auto-coding, chỉ rõ: file ĐƯỢC PHÉP, file CẤM, điều kiện dừng, và lệnh kiểm tra. Không có ranh giới, Claude có thể sửa file bạn không muốn.
</Card>

<Card title="Quy Tắc 3 Lần" icon="error">
Nếu cùng cách tiếp cận thất bại 3 lần với kết quả tương tự, **dừng ngay**. Hỏi: "Chúng ta đang giả định gì có thể sai?" Quy tắc này trung bình tiết kiệm $8 và 45 phút cho mỗi lần bị kẹt.
</Card>

### Phase 9-12: Legacy Code & Tự Động Hóa

<Card title="Khảo Cổ Trước Phẫu Thuật" icon="magnifier">
Với codebase cũ, phiên đầu tiên CHỈ đọc — không sửa gì. Dùng chiến lược 3 lớp: Cấu trúc (bản đồ) → Pattern (con đường) → Chi tiết (ngõ hẻm). Một team map được codebase Java 50,000 dòng trong 5 ngày so với 3 tuần dự kiến.
</Card>

<Card title="Một Thay Đổi Logic Một Commit" icon="list-format">
Khi refactor, commit sau mỗi thay đổi logic. Một function legacy 800 dòng refactor qua 33 commit nhỏ trong 4 tuần không có sự cố production nào. Cách viết lại toàn bộ cùng function đó làm hỏng payment, shipping, và audit logging.
</Card>

### Phase 13-16: Tối Ưu & Thực Chiến

<Card title="Chọn Model Đúng Tiết Kiệm 68%" icon="star">
Một startup Việt Nam giảm chi phí Claude từ $1,200 xuống $380/tháng chỉ bằng cách chọn model đúng cho task. Phát hiện: "Haiku làm được 80% những gì chúng tôi dùng Opus."
</Card>

<Card title="Template Prompt Là Bội Số" icon="document">
Tạo template tái sử dụng cho các task phổ biến (`/screen`, `/api-call`, `/debug`). Team báo cáo hoàn thành task nhanh hơn 40-60% khi thư viện template đạt 5-10 recipe.
</Card>

---

## Phím Tắt & Mẹo Tốc Độ

<CardGrid>

<Card title="Dán Screenshot Nhanh" icon="seti:image">
Trên macOS: `Cmd+Shift+Ctrl+4` chụp vào clipboard, rồi `Ctrl+V` (KHÔNG PHẢI `Cmd+V`!) để dán vào Claude Code. Đây là cách nhanh nhất để chia sẻ visual context — nhanh hơn lưu file rồi tham chiếu đường dẫn.
</Card>

<Card title="Resume Session" icon="right-arrow">
`claude -c` tiếp tục conversation gần nhất. `claude -r` mở danh sách session. Không bao giờ mất context khi đóng terminal — toàn bộ conversation được lưu lại.
</Card>

<Card title="Input Nhiều Dòng" icon="text">
Gõ `\` + Enter cho prompt nhiều dòng. Hoặc chạy `/terminal-setup` một lần để bật `Shift+Enter` cho multi-line trên iTerm2, Ghostty, Kitty, và WezTerm.
</Card>

<Card title="Chế Độ Bash" icon="seti:shell">
Thêm `!` trước lệnh để chạy trực tiếp không qua AI. `! npm test` chạy test ngay lập tức. Không cần chờ Claude xử lý.
</Card>

<Card title="Tham Chiếu File Với @" icon="document">
Gõ `@` kèm đường dẫn file để autocomplete. `@src/utils/auth.js` thêm file làm context. Nhấn `Tab` để hoàn thành đường dẫn.
</Card>

<Card title="Đổi Model Nhanh" icon="random">
`Option+P` (macOS) / `Alt+P` đổi model không cần restart. Nhảy từ Sonnet sang Opus cho reasoning phức tạp, về Haiku cho edit đơn giản — tất cả trong một session.
</Card>

<Card title="Chuyển Chế Độ Permission" icon="approve">
`Shift+Tab` chuyển giữa Normal → Auto-Accept → Plan. Cách nhanh để thay đổi mức permission mà không cần gõ lệnh.
</Card>

</CardGrid>

---

## Quản Lý Token

<Aside type="tip" title="Quy Tắc Vàng">
Cách nhanh nhất để làm việc với Claude Code là cho nó ÍT hơn — nhưng ĐÚNG thứ cần.
</Aside>

### 6 Kỹ Thuật Tiết Kiệm Token

| # | Kỹ thuật | Cách làm | Tiết kiệm |
|---|----------|----------|-----------|
| 1 | **Đọc chọn lọc** | Hỏi signatures/types trước, full file sau | -60% |
| 2 | **Lọc output** | Dùng `head -20`, `tail -50`, `grep -A 5` | -80% |
| 3 | **Compact chiến lược** | Compact ở mốc 30%, 60%, 80% | Reset về ~50% |
| 4 | **Prompt ngắn gọn** | "Fix bug saveUser" thay vì bài văn 500 từ | -50% |
| 5 | **Đọc từng phần** | "Đọc dòng 1-100 của X" cho file lớn | Chỉ đọc phần cần |
| 6 | **Tránh đọc lại** | Hỏi "Bạn còn giữ auth.ts trong context không?" | -100% chi phí trùng lặp |

### Thói Quen Theo Dõi Chi Phí

```bash
# Kiểm tra chi phí mỗi 20-30 phút
/cost

# Output mẫu:
# Input: 45,231 tokens ($0.14)
# Output: 12,847 tokens ($0.19)
# Total: 58,078 tokens ($0.33)

# Nếu context > 60%, compact chủ động
/compact
```

<Aside type="caution">
Một phiên 60 phút không theo dõi có thể tiêu tốn 200K+ token ($3-5). Kiểm tra `/cost` mỗi 20 phút thường giảm tổng chi phí 30-40%.
</Aside>

---

## Xử Lý Project Lớn

Các project Android/KMP lớn (100K+ dòng code) cần chiến lược đặc biệt để nằm trong giới hạn context.

### Chiến Lược Đọc 3 Lớp

```
Lớp 1: Cấu Trúc (Bản Đồ)
├── "Cho tôi xem cấu trúc thư mục project"
├── "Các module chính là gì?"
└── "Entry point ở đâu?"

Lớp 2: Pattern (Con Đường)
├── "Architecture pattern nào đang dùng?"
├── "Cho tôi xem dependency graph giữa các module"
└── "Data flow từ API đến UI như thế nào?"

Lớp 3: Chi Tiết (Ngõ Hẻm)
├── "Đọc src/auth/LoginViewModel.kt"
├── "Trace luồng payment từ click button đến API call"
└── "Điều gì xảy ra khi token hết hạn?"
```

### Mẹo Riêng Cho Android/Mobile

<Card title="CLAUDE.md cho Project Android" icon="setting">
Cần có: Các layer Clean Architecture, quy ước MVVM, Compose hay XML, ranh giới module, lệnh Gradle (`./gradlew assembleDebug`, `./gradlew test`), và ProGuard rules không được sửa.
</Card>

<Card title="Chiến Lược Module Chung KMP" icon="list-format">
Với Kotlin Multiplatform, nói rõ cho Claude code nào là shared (`commonMain`) vs platform-specific (`androidMain`, `iosMain`). Không nói rõ, Claude có thể viết code platform-specific trong shared module.
</Card>

### Xử Lý Hàng Loạt Cho Refactoring Lớn

```
Phase 1: Khảo sát (1 phiên)
"Liệt kê tất cả file dùng deprecated API X"

Phase 2: Lập kế hoạch (1 phiên)
"Tạo kế hoạch migration — file nào trước, file nào phụ thuộc"

Phase 3: Thực hiện (N phiên, theo batch)
"Migrate file 1-10 theo kế hoạch. Test sau mỗi file."
/compact
"Migrate file 11-20..."
```

<Aside type="tip">
Với project 200+ file cần refactor, chia thành 6 batch với ranh giới rõ ràng. Một team hoàn thành TypeScript migration 200+ file trong 6 giờ bằng cách này, so với lần thử single-session thất bại.
</Aside>

---

## Kết Hợp Claude Với n8n & Công Cụ Bên Ngoài

### Các Pattern Tích Hợp

| Pattern | Use Case | Ví dụ |
|---------|----------|-------|
| **Sequential Pipeline** | Chuyển đổi nhiều bước | Email → Trích dữ liệu → Tạo báo cáo |
| **Fan-Out/Fan-In** | Task song song độc lập | Phân tích 10 PR cùng lúc |
| **Classification Router** | Xử lý khác nhau theo loại | Phân loại bug vs feature vs question |
| **Human-in-the-Loop** | Cần phê duyệt | Code review có người duyệt |
| **Batch Processing** | Nhiều item | Xử lý 200+ đánh giá khách hàng |

### Mẹo Setup n8n + Claude Code

<Card title="Luôn Dùng Đường Dẫn Đầy Đủ" icon="warning">
Trong node Execute Command của n8n, dùng `/usr/local/bin/claude` thay vì chỉ `claude`. Process n8n có thể không có PATH của shell bạn.
</Card>

<Card title="Đặt Timeout" icon="setting">
Luôn set timeout trong Execute Command node là 60000ms trở lên. Thao tác Claude Code có thể mất 30-60 giây, đặc biệt với task sinh code.
</Card>

<Card title="Chuẩn Bị Prompt Trong Set Node" icon="pencil">
Với prompt phức tạp có dấu ngoặc và ký tự đặc biệt, build chuỗi prompt trong Set node trước, rồi truyền vào Execute Command. Tránh lỗi do dấu ngoặc.
</Card>

### Workflow n8n Thực Tế

- **Agency marketing**: 50+ brief email/ngày tự xử lý — 2 giờ giảm xuống 5 phút
- **Đánh giá khách hàng**: 200+ review phân tích bằng batch + sequential + router — 4 giờ xuống 30 phút
- **Deploy code**: PR merged → auto tạo changelog → thông báo Slack → cập nhật docs

<Aside type="tip">
Bắt đầu với workflow đơn giản nhất (Sequential Pipeline) rồi thêm phức tạp khi cần. Hầu hết nhu cầu tự động hóa chỉ cần 2-3 node kết nối.
</Aside>

---

## Xử Lý Sự Cố AI Hallucination

### Checklist Dấu Hiệu Cảnh Báo

Chú ý các dấu hiệu Claude có thể hallucinate:

| Dấu hiệu | Ví dụ | Cách xử lý |
|-----------|-------|------------|
| Tên quá generic | `awesome-validator`, `fast-json-loader` | Kiểm tra package: `npm view <tên>` |
| Không có link nguồn | "Dùng thư viện X" mà không có URL | Hỏi: "Cho tôi link GitHub repo" |
| Claim số version | "Thêm vào từ v3.2.1" | Kiểm tra changelog chính thức |
| Match quá hoàn hảo | Đúng API bạn cần, không có trade-off | Quá tốt? Kiểm tra độc lập |
| Style code lẫn lộn | React class + hooks trong cùng component | Yêu cầu Claude chọn một |
| Tự tin nhưng sai | "Đây là cách chuẩn để..." | Tự tin khác chính xác |

<Aside type="danger" title="Quy Tắc Số 1">
**Không bao giờ dùng Claude để verify Claude.** Đừng hỏi "Package X có tồn tại không?" — tự chạy `npm view X`. Verification bên ngoài là cách kiểm tra đáng tin duy nhất.
</Aside>

### Lệnh Kiểm Tra

| Cần verify | Lệnh | Nguồn |
|-----------|------|-------|
| npm package tồn tại | `npm view <package>` | npmjs.com |
| Python package tồn tại | `pip show <package>` | pypi.org |
| CLI flag tồn tại | `command --help` | Docs chính thức |
| Đường dẫn file tồn tại | `ls -la <path>` | Hệ thống |
| API endpoint hoạt động | `curl -I <url>` | Server live |

### Thang Leo Thang Can Thiệp

Khi Claude bị kẹt trong loop hoặc cho kết quả sai:

| Bước | Hành động | Prompt |
|------|----------|--------|
| 1. **Chuyển hướng** | Đổi cách tiếp cận | "Dừng lại. Thử cách hoàn toàn khác." |
| 2. **Cung cấp thông tin** | Bổ sung context | "Bạn có thể thiếu: API trả về XML, không phải JSON." |
| 3. **Phân tách** | Chia nhỏ bài toán | "Quên giải pháp tổng thể. Chỉ giải phần auth trước." |
| 4. **Làm mới** | Dọn context cũ | `/compact` |
| 5. **Reset** | Bắt đầu lại | `/clear` |
| 6. **Tự làm** | Bạn code | Viết code bằng tay |

### Tình Huống Hallucination Thường Gặp

<Card title="Package Ma" icon="error">
Claude gợi ý `npm install super-fast-orm`. Bạn cài. Nó không tồn tại. **Phòng tránh**: Luôn `npm view <package>` trước khi cài.
</Card>

<Card title="API Field Bịa Đặt" icon="error">
Claude dùng `response.auto_confirm` trong tích hợp thanh toán. Field này không tồn tại trong API. Một team fintech mất 2 ngày debug trong staging. **Phòng tránh**: Đối chiếu mọi API field với docs chính thức.
</Card>

<Card title="Method Đã Deprecated" icon="error">
Claude dùng `componentWillMount` trong React. Method này deprecated từ lâu. **Phòng tránh**: Verify lifecycle method với React docs hiện tại.
</Card>

<Card title="Trả Lời Sai Nhưng Tự Tin" icon="error">
Claude nói "PostgreSQL hỗ trợ `UPSERT` từ version 9.0." Thực tế là version 9.5. Chi tiết nhỏ, hậu quả lớn nếu target version cũ. **Phòng tránh**: Luôn verify claim liên quan đến version.
</Card>

### Thêm Verification Vào CLAUDE.md

Thêm phần này vào CLAUDE.md để giảm hallucination:

```markdown
## Quy Tắc Verification
- KHÔNG BAO GIỜ gợi ý package mà chưa xác nhận tồn tại trên npm/pypi
- LUÔN cung cấp URL GitHub hoặc docs cho thư viện bên thứ 3
- Nếu không chắc về API, nói "cần verification" thay vì đoán
- Khi gợi ý feature theo version, trích dẫn changelog
```

<Aside type="tip">
Team thêm quy tắc verification vào CLAUDE.md báo cáo giảm 70% phiên debug do hallucination. Mất 30 giây để thêm, tiết kiệm hàng giờ bực bội.
</Aside>
