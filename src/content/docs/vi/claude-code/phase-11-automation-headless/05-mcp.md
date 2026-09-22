---
title: 'MCP — Model Context Protocol'
description: 'Thêm MCP server bằng claude mcp add, chia sẻ qua .mcp.json với ${VAR}, và kiểm soát tool bằng permission rule mcp__.'
verified: 2026-09-23
claude_version: 2.1.280
---

# Module 11.5: MCP — Model Context Protocol

> **Thời lượng**: ~40 phút
>
> **Yêu cầu trước**: Module 11.1–11.4, đặc biệt [11.2 SDK](../02-claude-agent-sdk/) và
> [11.3 Hooks](../03-hooks-system/), cùng
> [2.2 Permissions](../../phase-02-security/02-permission-system/)
>
> **Kết quả**: thêm MCP server đúng scope, chia sẻ qua `.mcp.json` mà không để secret trong file,
> và allow/deny tool của nó bằng rule `mcp__`.

---

## 1. WHY — Tại Sao Quan Trọng

Jira board, read-replica, service metrics nội bộ: chỉ với `Read` và `Bash`, Claude Code không
chạm tới cái nào. Thế là bạn paste — ticket, kết quả query, dòng log — và nửa context window
thành đống copy-paste đã cũ.

MCP giải quyết chuyện đó. Nó cũng là lần đầu hệ thống bên ngoài được đưa text vào context của
Claude và kéo dữ liệu ra, nên module này dạy cả hai nửa: đấu nối, và giữ dây xích.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

> "MCP (Model Context Protocol) là một open-source standard để kết nối AI application với hệ
> thống bên ngoài." ("MCP … is an open-source standard for connecting AI applications to external
> systems." — modelcontextprotocol.io)

Một server expose **tools** để Claude gọi, **resources** bạn tham chiếu bằng
`@server:protocol://path`, và **prompts** hiện ra dưới dạng `/servername:promptname (MCP)`.

```mermaid
graph LR
    A[Claude Code] -->|stdio or http| B[MCP server]
    B --> C[Jira / DB / API]
    A -.->|mcp__server__tool<br/>permission rule| A
```

**Transport.** Server `stdio` "run as local processes on your machine"; `http` là "the
recommended option for connecting to remote MCP servers"; `sse` đã deprecated.

**Scope** quyết định phạm vi và nơi lưu:

| Scope | Nạp ở đâu | Chia sẻ với team | Lưu tại |
|---|---|---|---|
| `local` (mặc định) | Chỉ project hiện tại | Không | `~/.claude.json` |
| `project` | Chỉ project hiện tại | Có, qua version control | `.mcp.json` ở gốc project |
| `user` | Mọi project của bạn | Không | `~/.claude.json` |

`.mcp.json` là file của cả team nên tuyệt đối không chứa secret: `${VAR}` và `${VAR:-default}`
được expand trong `command`, `args`, `env`, `url` và `headers`, giữ token trong environment của
từng người. Claude Code "prompts for approval in interactive sessions before using project-scoped
servers"; `enabledMcpjsonServers` hoặc `enableAllProjectMcpServers` lưu câu trả lời đó.

**Kiểm soát.** Mỗi tool là `mcp__<server>__<tool>` — chính tên bạn đặt vào `permissions.allow`,
`deny` hoặc `ask`. `mcp__fs` khớp toàn bộ server. Glob trong allow phải bắt đầu bằng tiền tố
`mcp__<server>__`, nên `mcp__fs__read_*` chạy được còn `"mcp__*"` bị bỏ qua kèm warning; trong
danh sách *deny*, `"mcp__*"` chặn mọi MCP tool.

**Chi phí.** Tool definition mặc định được defer: "Only tool names and server instructions load at
session start, so adding more MCP servers has minimal impact on your context window." Nhưng không
miễn phí: `/context` cho con số thật, và khuyến nghị costs của Anthropic là "prefer CLI tools when
available" — `gh`, `aws`, `gcloud` "don't add any per-tool listing" (S15). Hãy làm ít tool giá trị
cao thay vì một bức tường tool mỏng (S9). `MAX_MCP_OUTPUT_TOKENS` chặn output (mặc định 25.000;
cảnh báo từ 10.000); `--strict-mcp-config` chỉ nạp server từ `--mcp-config`.

---

## 3. DEMO — Từng Bước

**Bước 1: Thêm stdio server local** (repo nháp `~/cc-lab`)

```bash
# docs: en/mcp — claude mcp add [options] <name> -- <command> [args...]
claude mcp add --transport stdio fs -- npx -y @modelcontextprotocol/server-filesystem ~/cc-lab
```

```text
# Output may vary
Added stdio MCP server fs with command: npx -y @modelcontextprotocol/server-filesystem /Users/you/cc-lab to local config
File modified: /Users/you/.claude.json [project: /Users/you/cc-lab]
```

Mọi thứ sau `--` được chuyển nguyên vẹn cho server, nên flag hai bên không đụng nhau.

**Bước 2: Kiểm tra đã kết nối**

```bash
claude mcp list
```

```text
# Output may vary
Checking MCP server health…

…
fs: npx -y @modelcontextprotocol/server-filesystem /Users/you/cc-lab - ✔ Connected
```

Status: `✔ Connected`, `! Needs authentication`, `✘ Failed to connect`.

**Bước 3: Xem chi tiết một server** — `claude mcp get fs`

```text
# Output may vary
fs:
  Scope: Local config (private to you in this project)
  Status: ✔ Connected
  Type: stdio
  Command: npx
  Args: -y @modelcontextprotocol/server-filesystem /Users/you/cc-lab

To remove this server, run: claude mcp remove fs -s local
```

**Bước 4: Chia sẻ server qua `.mcp.json` — không kèm token.** Ở gốc repo, commit:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": { "Authorization": "Bearer ${GITHUB_TOKEN}" }
    }
  }
}
```

**Bước 5: Chứng minh token không nằm trong file**

```bash
claude mcp list | grep github
claude mcp get github
```

```text
# Output may vary
github: https://api.githubcopilot.com/mcp/ (HTTP) - ⏸ Pending approval (run `claude` to approve)
 └ [Warning] [github] mcpServers.github: Missing environment variables: GITHUB_TOKEN
github:
  Scope: Project config (shared via .mcp.json)
  Status: ⏸ Pending approval (run `claude` to approve)
  Headers:
    Authorization: Bearer ${GITHUB_TOKEN}
```

Đó là bằng chứng: header in ra theo tên biến, không phải giá trị — với local, project và user
scope, cả ba bề mặt đều hiện `${VAR}` chưa expand. Export token thật là warning biến mất.

**Bước 6: Duyệt project server** — chạy `claude` trong repo

```text
# Output may vary
  New MCP server found in this project: github

  MCP servers may execute code or access system resources. All tool calls
  require approval. Learn more in the MCP documentation.

    Use this MCP server
    Use this and all future MCP servers in this project
  ❯ Continue without using this MCP server

  Enter to confirm · Esc to cancel
```

Chọn option 3 cho server nào bạn chưa đọc source.

**Bước 7: Xem toàn bộ server bằng `/mcp`**

```text
# Output may vary
   Manage MCP servers
   67 servers

     Local MCPs (/Users/you/.claude.json [project: /Users/you/cc-lab])
   ❯ fs · ✔ connected · 14 tools
     …
   https://code.claude.com/docs/en/mcp for help
```

Panel này cũng lo đăng nhập OAuth và tắt server theo project.

**Bước 8: Nhìn tool xin permission**

Chạy `claude --permission-mode default`, rồi hỏi:
`Use the fs MCP server to read src/math.js`

```text
# Output may vary
 Tool use
   fs — Read Text File Tool: (MCP)
   path: "/Users/you/cc-lab/src/math.js"
 Do you want to proceed?
 ❯ 1. Yes
   2. Yes, and don't ask again for fs — Read Text File commands in ~/…
   3. No
 Esc to cancel · Tab to amend
```

`--permission-mode default` ép về hành vi gốc; trên máy cài mới bạn nhận kết quả y hệt mà không
cần flag, trừ khi `settings.json` đặt `permissions.defaultMode`.

**Bước 9: Pre-allow một tool, deny tool khác** — phiên headless không trả lời được prompt đó:

```bash
claude -p "Use the fs MCP server to read src/math.js and show me line 1." --permission-mode default
```

```text
# Output may vary
I couldn't read the file because permission to use the fs MCP server's `read_text_file` tool
hasn't been granted.
```

Thêm rule vào `.claude/settings.local.json`:

```json
{
  "permissions": {
    "allow": ["mcp__fs__read_text_file"],
    "deny": ["mcp__fs__write_file"]
  }
}
```

Chạy lại đúng lệnh cũ:

```text
# Output may vary
Line 1 of `src/math.js`, read with the fs MCP server:
export function add(a, b) { return a + b; }
```

**Bước 10: Dọn dẹp**

```bash
claude mcp remove fs
claude mcp remove github -s project
```

```text
# Output may vary
Removed MCP server "fs" from local config
Removed MCP server github from project config
```

---

## 4. PRACTICE — Tự Làm Thử

### Bài 1: Thêm remote HTTP server và đăng nhập

**Mục tiêu**: thêm Notion ở user scope rồi đăng nhập. `claude mcp list` phải chuyển nó từ
`! Needs authentication` sang `✔ Connected`.

<details>
<summary>💡 Gợi ý</summary>

Remote server nhận URL chứ không dùng `--`. `claude mcp login <name>` chạy OAuth ngay từ shell.

</details>

<details>
<summary>✅ Lời giải</summary>

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp --scope user
claude mcp login notion
claude mcp list | grep notion
```

Gỡ bằng `claude mcp logout notion`, rồi `claude mcp remove notion -s user` — lệnh này xoá luôn
OAuth token đã lưu.

</details>

### Bài 2: Ship một `.mcp.json` cho team

**Mục tiêu**: đồng đội clone repo là có server ngay, không prompt và không secret. Thêm server
project scope lấy token từ `${VAR}`, rồi duyệt trước theo tên; `claude mcp get <name>` phải hiện
`Scope: Project config (shared via .mcp.json)` và header chưa expand.

<details>
<summary>💡 Gợi ý</summary>

`claude mcp add --scope project` tự ghi `.mcp.json`; phần duyệt nằm ở file settings.

</details>

<details>
<summary>✅ Lời giải</summary>

`.claude/settings.json`, commit vào repo:

```json
{ "enabledMcpjsonServers": ["github"] }
```

`enableAllProjectMcpServers: true` là bản thô hơn. Cả hai key đều bị bỏ qua khi đọc từ file
project dùng chung cho tới khi đồng đội chấp nhận workspace trust dialog — repo clone về không tự
duyệt server của chính nó được.

</details>

### Bài 3: Tước quyền ghi

**Mục tiêu**: cho Claude đọc qua server `fs` nhưng không được ghi. Thêm deny rule, khởi động lại,
rồi bảo Claude tạo file qua server; thao tác ghi phải bị từ chối dù server vẫn có tool đó.

<details>
<summary>💡 Gợi ý</summary>

Deny thắng allow. Deny rule chấp nhận glob ở vị trí tên tool.

</details>

<details>
<summary>✅ Lời giải</summary>

```json
{
  "permissions": {
    "allow": ["mcp__fs__read_text_file"],
    "deny": ["mcp__fs__write_file", "mcp__fs__edit_file"]
  }
}
```

Kiểm chứng bằng `/permissions`. Tool khớp một bare-name glob deny rule sẽ bị gỡ hẳn khỏi context
của Claude.

</details>

---

## 5. CHEAT SHEET

| Lệnh | Mô tả |
|---|---|
| `claude mcp add [-e K=V] --transport stdio <n> -- <cmd>` | Process local |
| `claude mcp add --transport http <n> <url>` | Remote server |
| `claude mcp add … --scope project\|user\|local` | Nơi lưu cấu hình |
| `claude mcp add-json <n> '<json>'` | Thêm từ JSON |
| `claude mcp list` / `get <n>` / `remove <n> [-s <scope>]` | Xem, gỡ |
| `claude mcp login <n>` / `logout <n>` | OAuth từ shell |
| `/mcp` | Status, auth, bật/tắt |
| `@server:protocol://path` | Tham chiếu resource |
| `/mcp__server__prompt arg1 arg2` | Chạy prompt của server |

| Key / biến | Tác dụng |
|---|---|
| `permissions.allow: ["mcp__fs__read_text_file"]` | Duyệt trước một tool |
| `permissions.deny: ["mcp__*"]` | Chặn mọi MCP tool |
| `enabledMcpjsonServers` / `enableAllProjectMcpServers` | Duyệt server trong `.mcp.json` |
| `disabledMcpjsonServers` | Từ chối một server, ở file settings bất kỳ |
| `allowedMcpServers` (managed settings) | Allowlist của admin |
| `MAX_MCP_OUTPUT_TOKENS` | Trần output; mặc định 25.000 |
| `--strict-mcp-config` | Chỉ server từ `--mcp-config` |

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai | ✅ Đúng |
|---|---|
| Sửa file JSON config của app Claude Desktop rồi chờ Claude Code đọc | Khác sản phẩm, khác file: dùng `claude mcp add`, hoặc `claude mcp add-from-claude-desktop` |
| `npm i -g @modelcontextprotocol/server-sqlite` — các reference server SQLite, PostgreSQL, GitHub đã archived | Chọn server còn được bảo trì; ví dụ database trên docs là `claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "…"`, dùng user read-only |
| Commit `"Authorization": "Bearer ghp_FAKE-DO-NOT-USE-xxxx"` trong `.mcp.json` | `"Bearer ${GITHUB_TOKEN}"`, kiểm chứng bằng `claude mcp get <name>`: phải in ra tên biến |
| "Claude không bao giờ thấy credential thô, server giữ hết" | **Output** của tool rơi thẳng vào context: một tool trả về dòng dữ liệu có API key là vừa đưa key đó vào transcript. Deny các tool chạm tới secret |
| Cài mười server rồi nghĩ là miễn phí | Definition được defer, nhưng tên tool và server instructions vẫn nạp. Xem `/context`, tắt server không dùng trong `/mcp`, ưu tiên `gh`/`aws` (S15) |
| Tin một server chỉ vì nó phổ biến | Server fetch nội dung bên ngoài có thể tiêm chỉ thị vào phiên của bạn ([Module 2.1](../../phase-02-security/01-threat-model/)). Đọc source, pin version |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Bối cảnh**: Một team fintech ở TP.HCM xử lý sự cố theo đúng một kiểu — một người mở Jira, một
người mở read-replica, một người mở log — rồi paste từng mảnh vào Claude Code.

**Vấn đề**: Có người paste kết quả query vẫn còn nguyên API key của đối tác. Không rò rỉ ra
ngoài, nhưng đợt review sau đó cấm hẳn kiểu paste tuỳ tiện.

**Giải pháp**: Hai server project scope trong `.mcp.json` đã commit — Jira nội bộ và một user
Postgres read-only — xác thực qua `${JIRA_TOKEN}` và `${PG_DSN}` lấy từ environment của từng
người, không bao giờ nằm trong file. `.claude/settings.json` của repo mang
`enabledMcpjsonServers`, allow list liệt kê tool đọc, và một `deny` cho phía ghi. Xoay token là
đổi env, không phải commit.

**Kết quả**: Reviewer chỉ cần diff một file là biết agent gọi được tool nào, và câu hỏi "Claude
chạm được gì trên production?" giờ có danh sách để trả lời.

---

> **Hoàn thành Phase 11!** Bạn đã đi hết phần automation — từ headless script tới MCP.
>
> **Phase tiếp theo**: [Phase 12: n8n](../../phase-12-n8n-workflows/01-claude-code-n8n/) →
