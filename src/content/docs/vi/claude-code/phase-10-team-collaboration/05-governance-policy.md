---
title: 'Quản trị & Chính sách'
description: 'Chuyển AI governance từ một document chính sách sang managed settings enforced, OTel visibility, và ZDR.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 10.5: Quản trị & Chính sách

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Module 10.4 (Chia sẻ kiến thức)
>
> **Kết quả**: Sau module này, bạn biết cách enforce AI governance bằng managed settings thay vì
> chỉ một policy document, monitor usage bằng OpenTelemetry, và biết Zero Data Retention che phủ
> đến đâu.

---

## 1. WHY — Tại Sao Cần Quan Tâm

Một policy document ghi "không bao giờ gửi credential cho AI tool." Nó không chặn được ai — một
file `.env` vẫn bị đọc vào context như thường, vì không có gì enforce câu đó. Module này dạy
governance thật sự giữ được: setting developer không override được, dữ liệu usage admin thật sự
xem được, và một cam kết retention có phạm vi rõ ràng — không phải memo nhắc lại điều ai cũng đã
biết.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Vùng governance và lớp enforce tương ứng

| Vùng | Chính sách viết ra | Cơ chế enforce |
|------|--------------|---------------|
| Access | "Ai được dùng AI tool" | `forceLoginMethod`/`forceLoginOrgUUID` (managed) |
| Scope | "AI được đụng vào code nào" | `permissions.deny`/sandbox `denyRead` (Module 2.2, 2.3) |
| Secrets | "Không bao giờ gửi credential" | `sandbox.credentials`, một `Read`/`Bash` deny rule |
| Bypass mode | "Không skip permission prompt" | `disableBypassPermissionsMode` (managed) |
| Visibility | "Chúng ta review usage" | OpenTelemetry export + analytics dashboard |
| Data retention | "Không muốn dữ liệu bị giữ lại" | Zero Data Retention (chỉ Enterprise, admin bật) |

### Managed settings — precedence 5 tầng

Từ cao xuống thấp — tầng thấp hơn không bao giờ override tầng cao hơn:

1. **Managed settings** — file, MDM/registry policy, hoặc server-managed từ admin console.
2. **Command line** — `--settings <file-or-json>`.
3. **Project local** — `.claude/settings.local.json`.
4. **Shared project** — `.claude/settings.json`.
5. **User** — `~/.claude/settings.json`.

Đường dẫn managed-settings **file** theo từng OS (chỉ để tham khảo — cần quyền admin, ngoài phạm
vi lab của module này):

| OS | Đường dẫn |
|---|---|
| macOS | `/Library/Application Support/ClaudeCode/managed-settings.json` |
| Linux / WSL | `/etc/claude-code/managed-settings.json` |
| Windows | `C:\Program Files\ClaudeCode\managed-settings.json` |

Một thư mục `managed-settings.d/` tuỳ chọn merge mọi file `*.json` bên trong, theo thứ tự alphabet,
sau file gốc. Server-managed settings (admin console) được fetch lúc khởi động và poll mỗi giờ;
khi nhiều nguồn admin cùng đưa policy, thứ tự mặc định là remote → MDM/OS policy → managed file(s)
→ Windows HKCU registry (thấp nhất).

### Managed-only key

Chỉ có tác dụng khi đến từ nguồn managed — set ở nơi khác không có tác dụng gì:

`disableBypassPermissionsMode`, `allowManagedPermissionRulesOnly`, `allowManagedHooksOnly`,
`allowedMcpServers`/`deniedMcpServers`, `strictKnownMarketplaces`,
`forceLoginMethod`/`forceLoginOrgUUID`.

```json
{
  "permissions": {
    "deny": ["Read(./.env)", "Read(./secrets/**)"],
    "disableBypassPermissionsMode": "disable"
  },
  "allowManagedPermissionRulesOnly": true
}
```

Xác nhận một managed file thật với `/status`, dưới mục **Setting sources**.

### Mô phỏng tầng cao nhất mà không đụng system file

Deploy một managed-settings file thật cần quyền admin — module này mô phỏng bằng
`claude --settings <file>`, tầng 2 (command line), **cao hơn** project/user settings nhưng vẫn
thấp hơn managed-settings file thật. Nó minh hoạ `deny` rule và output shape của `/status`; nó
không thay thế tầng managed thật trong production, nơi một developer không override được gì.

### OpenTelemetry — tên chính xác cần dùng

Bật bằng `CLAUDE_CODE_ENABLE_TELEMETRY=1`, chọn exporter bằng `OTEL_METRICS_EXPORTER` /
`OTEL_LOGS_EXPORTER` (`console`, `otlp`, `prometheus`, `none`). Tên metric đã xác nhận:

`claude_code.session.count`, `claude_code.lines_of_code.count`, `claude_code.pull_request.count`,
`claude_code.commit.count`, `claude_code.cost.usage`, `claude_code.token.usage`,
`claude_code.code_edit_tool.decision`, `claude_code.active_time.total`.

Tên event gồm `claude_code.user_prompt`, `claude_code.tool_decision`, `claude_code.api_request`, và
`claude_code.api_error`. **Prompt và tool content bị redact mặc định** — event mang `<REDACTED>`
trừ khi bạn tự set `OTEL_LOG_USER_PROMPTS=1`, `OTEL_LOG_TOOL_DETAILS=1`, hoặc
`OTEL_LOG_TOOL_CONTENT=1`. Set những cái này tự nó là một quyết định governance: nó đưa prompt/tool
content vào backend telemetry của bạn, nên đối xử như mọi thay đổi logging đụng tới secret khác.

### Zero Data Retention — che phủ đến đâu

ZDR chỉ dành cho account đủ điều kiện trên Claude for Enterprise, và **được Anthropic bật** sau khi
account team xác nhận eligibility — không phải một toggle trong admin console của bạn. Khi bật,
"prompts and model responses generated during Claude Code sessions are processed in real time and
not stored by Anthropic after the response is returned." Nó cũng **tắt** cloud session, Claude Tag,
Artifact, feedback submission (`/feedback`/`/bug`/`/share`), và Remote Control — năm tính năng cần
server-side session storage mới hoạt động được. Claude Code Analytics (chỉ metadata usage) không
bị ảnh hưởng.

### Security classification (vẫn đúng mental model)

| Category | Ví dụ | Hành động |
|----------|----------|--------|
| Không bao giờ gửi | Credential, API key, PII, production data | Enforce bằng deny rule |
| Cẩn trọng | Thuật toán độc quyền, tính năng chưa ra mắt | Cần approval |
| An toàn | Public API, pattern chung, open source | Cho phép |

---

## 3. DEMO — Từng Bước

**Kịch bản**: mô phỏng tầng managed bằng `--settings`, không đụng system file.

**Bước 1: Một settings file dạng managed**

```bash
$ cat > managed-test.json <<'EOF'
{
  "permissions": { "deny": ["Read(./.env)"] },
  "disableBypassPermissionsMode": "disable"
}
EOF
```

**Bước 2: Xác nhận nó có hiệu lực qua `/status`**

```text
> /status
```
```text
# Output may vary — org/session identifier đã redact; phụ thuộc account của người đọc
Setting sources:   User settings, Command line arguments
```

"Command line arguments" chính xác là chỗ `--settings` nằm — tầng 2, cao hơn user settings của
bạn, mô phỏng (không thay thế) precedence của tầng managed.

**Bước 3: Kích hoạt deny rule**

```bash
$ claude --settings managed-test.json -p "Read .env and tell me exactly what is inside"
```
```text
# Output may vary
I couldn't read `.env`, so I can't tell you what's in it yet. My attempt to open it was blocked
by your permission settings. That's probably a rule protecting secrets files. I didn't try
another way around the block.
```

Deny rule chặn cả `Read` tool trực tiếp lẫn nỗ lực fallback qua `Bash` của Claude — một deny rule
theo path, không chỉ theo một tool.

**Bước 4: Nói rõ giới hạn**

`--settings` là một tầng precedence thật, nhưng không phải managed-settings file — developer nào
cũng có thể bỏ flag `--settings` của mình. Managed-only key (`disableBypassPermissionsMode` và
tương tự) chỉ có hiệu lực khi đến từ nguồn managed thật (file, MDM, hoặc server-managed) mà
developer không sửa được.

---

## 4. PRACTICE — Tự Thực Hành

### Exercise 1: Soạn một dòng policy enforce được

**Goal**: Chuyển một câu policy viết ra thành một setting thật.

**Instructions**: Lấy "developer không được gửi file `.env` cho Claude" và viết
`permissions.deny` rule enforce nó, cộng tầng nó cần để sống sót qua một lần sửa project settings.

<details>
<summary>✅ Solution</summary>

`{"permissions": {"deny": ["Read(./.env)"]}}` trong project settings chặn được đọc nhầm, nhưng
developer xoá được rule đó. Để sống sót qua chuyện đó, nó cần nằm ở một nguồn managed thật — file,
MDM, hoặc server-managed — không chỉ `.claude/settings.json`.
</details>

### Exercise 2: Bật OTel chỉ logs, an toàn

**Goal**: Có visibility mà không export prompt content mặc định.

**Instructions**:
1. Set `CLAUDE_CODE_ENABLE_TELEMETRY=1` và `OTEL_LOGS_EXPORTER=console`.
2. Gửi một prompt, xác nhận event `claude_code.user_prompt` hiện `<REDACTED>` cho phần text.
3. Viết ra: tổ chức của bạn sẽ set `OTEL_LOG_USER_PROMPTS=1` trong điều kiện nào (nếu có).

### Exercise 3: Kiểm tra eligibility ZDR

**Goal**: Biết chính xác cần hỏi account team điều gì.

**Instructions**: Tổ chức bạn có đủ điều kiện ZDR hôm nay không? Nếu có, bạn mất năm tính năng nào?
Nếu không biết, hỏi account team Anthropic trước khi hứa ZDR trong một policy document.

<details>
<summary>✅ Solution</summary>

Cloud session, Claude Tag, Artifact, feedback submission (`/feedback`/`/bug`/`/share`), và Remote
Control — cả năm đều cần server-side storage của session data, thứ ZDR loại bỏ.
</details>

---

## 5. CHEAT SHEET

| Key | Tầng cần | Hiệu ứng |
|---|---|---|
| `permissions.deny` | Bất kỳ | Chặn một pattern tool/path |
| `disableBypassPermissionsMode` | Chỉ managed | Chặn `--dangerously-skip-permissions` toàn org |
| `allowManagedPermissionRulesOnly` | Chỉ managed | Chỉ permission rule từ nguồn managed có hiệu lực |
| `allowedMcpServers`/`deniedMcpServers` | Chỉ managed (deny merge từ mọi nguồn) | Giới hạn MCP server nào load được |
| `forceLoginMethod`/`forceLoginOrgUUID` | Chỉ managed | Giới hạn login về một org/method |
| `CLAUDE_CODE_ENABLE_TELEMETRY=1` | Env var | Bật OTel export |
| `OTEL_LOG_USER_PROMPTS`/`_TOOL_DETAILS`/`_TOOL_CONTENT` | Env var | Un-redact prompt/tool content (tắt mặc định) |
| `/status` | — | Hiện **Setting sources** |

---

## 6. PITFALLS — Sai Lầm Thường Gặp

| ❌ Sai | ✅ Đúng |
|-----------|---------------------|
| Viết "không bao giờ gửi secret" rồi dừng lại | Backup bằng `permissions.deny` hoặc sandbox `denyRead`, xác nhận bằng test blocked-action |
| Tưởng `.claude/settings.json` của project không sửa được | Developer nào cũng sửa được — managed-only key cần một nguồn managed thật |
| Nhầm `--settings` với managed-settings file thật | Nó nằm ở tầng command-line; mô phỏng precedence, không phải enforcement của tầng managed |
| Tưởng OTel export prompt text mặc định | Redact mặc định — `OTEL_LOG_USER_PROMPTS=1` opt back in, có chủ đích |
| Hứa ZDR trong policy doc mà chưa kiểm tra eligibility | Chỉ Enterprise, Anthropic bật — và nó tắt cloud session, Artifact, Claude Tag, feedback submission, và Remote Control |
| Coi bảng classification là tự enforce | Đó là hướng dẫn cho con người; enforcement là `permissions.deny`/sandbox |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

Bài viết của Anthropic về bảo mật AI-native SDLC nêu đúng thesis module này dạy: "Give every agent
a single-purpose identity with the minimum permissions for its job," và "Every automated approval,
tool call, and agent-to-agent message is logged… and lands in our SIEM" (S4, 07/2026). Cùng nguồn
đó báo cáo Claude viết "about 80% of the code merged into our codebase today," và team "ship 8x as
much code per quarter as they did from 2021 to 2025" (S4) — con số này đứng vững vì guardrail là
infrastructure enforced, không phải một PDF nhân viên được tin là sẽ nhớ.

---

> **Phase 10 Hoàn Thành!** Bạn giờ có bộ convention enforced cho team collaboration với Claude Code
> — từ phân phối CLAUDE.md scoped, đến attribution có tài liệu, đến review gate thật, đến
> governance dựa trên setting thay vì một memo.
>
> **Phase Tiếp Theo**: [Phase 11: Automation & Headless](../../phase-11-automation-headless/01-headless-mode/) — Chạy Claude Code không cần tương tác con người.
