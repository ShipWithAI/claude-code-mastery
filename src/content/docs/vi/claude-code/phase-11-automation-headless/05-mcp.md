---
title: 'MCP — Model Context Protocol'
description: 'Tìm hiểu Model Context Protocol (MCP) trong Claude Code: kết nối external tools, database và API.'
---

# Module 11.5: MCP — Model Context Protocol

> **Thời gian học**: ~40 phút
>
> **Yêu cầu trước**: Module 11.1-11.4 (Headless Mode, SDK, Hooks, GitHub Actions)
>
> **Kết quả**: Sau module này, bạn sẽ hiểu MCP architecture, connect Claude Code với MCP server, và extend Claude capability với external tool.

---

## 1. WHY — Tại sao cần học

Claude Code powerful nhưng isolated. Nó chỉ work với file trên disk và shell command. Nhưng bạn cần Claude:
- Query production database để hiểu data pattern?
- Read từ internal wiki của công ty?
- Access project management tool?
- Integrate với monitoring system?

Không có MCP, bạn phải export data thủ công, paste vào context, và hy vọng Claude hiểu.

**Ví von**: MCP như "giác quan mở rộng" cho Claude. Không có MCP = Claude chỉ thấy file trên disk. Có MCP = Claude "nhìn" được database, "nghe" được Slack, "sờ" được API. Một protocol, vô hạn khả năng.

---

## 2. CONCEPT — Ý tưởng cốt lõi

### MCP Architecture

```
Claude Code (Client) ←→ MCP Server ←→ External System
```

Claude request data hoặc action → MCP Server translate và execute → External system respond → Server format response → Claude sử dụng.

### Core Concepts

| Concept | Là gì | Ví dụ |
|---------|-------|-------|
| **Server** | Expose capability qua MCP | PostgreSQL MCP server |
| **Client** | Consume capability | Claude Code session |
| **Tools** | Function Claude có thể call | `query_database(sql)` |
| **Resources** | Data Claude có thể read | Database schema, file |

### Official MCP Servers

- `@modelcontextprotocol/server-postgres` — PostgreSQL access
- `@modelcontextprotocol/server-sqlite` — SQLite database
- `@modelcontextprotocol/server-filesystem` — Enhanced file operation
- `@modelcontextprotocol/server-github` — GitHub API integration

### Browser & Debugging MCP Servers

Ngoài truy cập database và API, MCP còn mở ra các workflow debugging qua browser cực kỳ mạnh mẽ:

| Server | Mục đích | Claude Nhận Được |
|--------|----------|-----------------|
| **Playwright MCP** | Tự động hóa browser | Điều hướng trang, điền form, click button, chụp screenshot |
| **Chrome DevTools MCP** | Debug browser trực tiếp | Console logs, network requests, DOM inspection |

#### Playwright MCP Trong Thực Tế

Khi kết nối Playwright MCP, Claude có thể điều khiển một browser thực. Thay vì bạn mô tả bug, Claude tự điều hướng đến trang, điền form, click submit, và tự thấy lỗi. Điều này đặc biệt hữu ích cho:

- **Viết E2E test**: Claude chạy test trong khi viết, phát hiện lỗi ngay lập tức
- **Visual regression**: Claude chụp screenshot trước/sau thay đổi để xác nhận UI không bị hỏng
- **Debug form**: Claude điền các form phức tạp nhiều bước để tái hiện bug người dùng báo cáo

#### Chrome DevTools MCP Trong Thực Tế

Chrome DevTools MCP cho Claude truy cập trực tiếp vào developer tools của browser. Claude thấy console errors, network failures, và cấu trúc DOM mà bạn không cần copy-paste gì cả. Ứng dụng thực tế:

- **Debug console error**: Claude đọc error stack trace trực tiếp từ browser console
- **Kiểm tra network**: Claude thấy các API call thất bại, request/response payloads, và status codes
- **Profiling hiệu năng**: Claude phân tích trang load chậm bằng cách kiểm tra network waterfall

### Cấu Hình MCP Theo Project (.mcp.json)

Thay vì cấu hình MCP servers globally, bạn có thể commit cấu hình MCP riêng cho từng project:

```json
{
  "mcpServers": {
    "project-db": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./data/dev.db"]
    },
    "project-memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Lợi ích của .mcp.json**:
- **Chia sẻ team**: Mọi người đều có cùng MCP servers khi clone repo
- **Riêng biệt theo project**: Các project khác nhau dùng servers khác nhau không xung đột
- **Version-controlled**: Cấu hình MCP phát triển cùng codebase
- **Không ô nhiễm global**: Config global cá nhân giữ nguyên sạch sẽ

Đặt `.mcp.json` ở root project. Claude Code tự động đọc khi bạn bắt đầu session trong thư mục đó.

### Cảnh Báo Token Budget Cho MCP

⚠️ **Cân nhắc hiệu năng quan trọng**: Mỗi tool description của MCP server đều tiêu thụ context tokens. Những tokens này được load vào context window của Claude ngay khi bắt đầu session.

**Quy tắc**: Nếu tổng các MCP servers sử dụng hơn **20,000 tokens** cho tool descriptions, bạn đang giảm đáng kể bộ nhớ làm việc của Claude cho các tác vụ coding thực tế.

| MCP Servers Kết Nối | Token Overhead Ước Tính | Tác Động |
|---------------------|------------------------|----------|
| 1-2 servers | ~2,000-5,000 tokens | Không đáng kể |
| 3-5 servers | ~8,000-15,000 tokens | Nhận thấy được ở tác vụ phức tạp |
| 6+ servers | ~20,000+ tokens | Nghiêm trọng — Claude quên context nhanh hơn |

**Best practice**: Chỉ bật MCP servers bạn thực sự cần cho project hiện tại. Tắt phần còn lại. MCP setup gọn nhẹ nghĩa là nhiều context hơn để Claude suy luận về code của bạn.

### Configuration Format

⚠️ Verify path cho platform của bạn:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name", "--option", "value"]
    }
  }
}
```

Config location:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

### Security Model

MCP server chạy locally trên máy bạn. Credential ở trên máy bạn. Claude gửi request, server execute, response trả về. Claude không bao giờ thấy raw credential.

---

## 3. DEMO — Từng bước thực hành

**Scenario**: Connect Claude Code với SQLite database để analyze application data.

### Step 1: Install SQLite MCP server

```bash
$ npm install -g @modelcontextprotocol/server-sqlite
```

Expected output:
```
added 42 packages in 3s
```

### Step 2: Configure MCP server

Edit config file:

```bash
$ code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Thêm configuration:

```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "--db-path",
        "/Users/yourname/projects/app/data/app.db"
      ]
    }
  }
}
```

### Step 3: Restart Claude Code

MCP server initialize khi startup. Đóng và mở lại Claude Code.

### Step 4: Verify MCP connection

```
Bạn: Có MCP server nào available không?

Claude: Tôi có access tới MCP server sau:
- sqlite: SQLite database tại /Users/yourname/projects/app/data/app.db
  Tools: query, list_tables, describe_table
```

### Step 5: Explore database schema

```
Bạn: List tất cả table trong database

Claude: [gọi sqlite.list_tables tool]

Database có 5 table:
- users (1,247 rows)
- orders (8,932 rows)
- products (156 rows)
- sessions (3,891 rows)
- audit_log (45,223 rows)
```

### Step 6: Query và analyze

```
Bạn: Bao nhiêu % order bị abandoned?

Claude: [gọi sqlite.query tool]

Query: SELECT status, COUNT(*) FROM orders GROUP BY status

Result:
- completed: 7,123 (79.7%)
- abandoned: 1,456 (16.3%)
- pending: 353 (4.0%)

16.3% abandoned cao hơn average e-commerce 10-12%.
Recommend implement cart recovery email.
```

---

## 4. PRACTICE — Luyện tập

### Exercise 1: Database Explorer

**Mục tiêu**: Setup SQLite MCP và explore sample database.

**Hướng dẫn**:
1. Tạo sample SQLite database với ít nhất 2 table
2. Configure SQLite MCP server
3. Yêu cầu Claude list table và describe schema
4. Yêu cầu Claude suggest optimization

<details>
<summary>💡 Hint</summary>

Dùng `sqlite3 sample.db` để tạo table. Đảm bảo path trong config là absolute.

</details>

<details>
<summary>✅ Solution</summary>

```bash
# Tạo sample database
$ sqlite3 ~/sample.db << EOF
CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT);
CREATE TABLE posts (id INTEGER PRIMARY KEY, user_id INTEGER, title TEXT);
INSERT INTO users VALUES (1, 'Alice', 'alice@example.com');
INSERT INTO posts VALUES (1, 1, 'Hello World');
EOF
```

Config:
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "/Users/yourname/sample.db"]
    }
  }
}
```

Hỏi Claude: "List table, describe posts table, show all posts với user name"

</details>

### Exercise 2: GitHub Integration

**Mục tiêu**: Connect Claude với GitHub MCP server.

**Hướng dẫn**:
1. Install `@modelcontextprotocol/server-github`
2. Generate GitHub personal access token
3. Configure GitHub MCP server
4. Yêu cầu Claude list open issue trong repository

<details>
<summary>💡 Hint</summary>

Dùng `"env": {"GITHUB_TOKEN": "..."}` trong server config để set token.

</details>

<details>
<summary>✅ Solution</summary>

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

Hỏi Claude: "List open issue trong myorg/myrepo"

</details>

### Exercise 3: Multi-Server Workflow

**Mục tiêu**: Dùng nhiều MCP server cùng lúc.

**Hướng dẫn**:
1. Configure cả SQLite và GitHub MCP server
2. Yêu cầu Claude correlate data từ cả hai source
3. Quan sát Claude dùng cả hai server để trả lời

<details>
<summary>💡 Hint</summary>

Frame câu hỏi để Claude cần cả hai source. Ví dụ: "Issue nào liên quan đến product trong database?"

</details>

---

## 5. CHEAT SHEET

### MCP Architecture

```
┌─────────────┐           ┌─────────────┐           ┌──────────────┐
│ Claude Code │  Request  │ MCP Server  │  Execute  │ External Sys │
│  (Client)   │ ────────> │  (Adapter)  │ ────────> │ (DB/API/etc) │
│             │ <──────── │             │ <──────── │              │
└─────────────┘  Response └─────────────┘  Result   └──────────────┘
```

### Official MCP Servers

| Server | Mục đích |
|--------|----------|
| `server-postgres` | PostgreSQL database |
| `server-sqlite` | SQLite database |
| `server-filesystem` | Enhanced file ops |
| `server-github` | GitHub API |

### Config Template

```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-name", "--option", "value"],
      "env": {
        "SECRET_KEY": "value"
      }
    }
  }
}
```

### Security Checklist

- ✅ Dùng read-only credential
- ✅ Point tới replica, không phải production
- ✅ Review server code trước khi install
- ✅ Dùng environment variable cho secret

### Browser MCP Servers

| Server | Mục đích | Claude Nhận Được |
|--------|----------|-----------------|
| Playwright MCP | Tự động hóa browser | Điều hướng, click, điền form, screenshot |
| Chrome DevTools MCP | Debug trực tiếp | Console logs, network, DOM |

### Cấu Hình MCP Theo Project (.mcp.json)

```json
// Đặt ở root project, commit vào git
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name", "--option", "value"]
    }
  }
}
```

### MCP Token Budget

| Servers | Chi Phí Token | Khuyến Nghị |
|---------|--------------|-------------|
| 1-2 | ~2-5K | ✅ An toàn |
| 3-5 | ~8-15K | ⚠️ Theo dõi context usage |
| 6+ | ~20K+ | ❌ Tắt servers không dùng |

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|--------|---------|
| Expose production write credential | Dùng read-only replica hoặc read-only user |
| Install unknown MCP server | Chỉ dùng official server hoặc audit code trước |
| Hardcode secret trong config | Dùng environment variable: `"env": {"KEY": "value"}` |
| Không log access | Enable query logging phía database để audit |
| Mix dev và prod credential | Maintain separate config file cho mỗi environment |
| Không hiểu Claude đang làm gì | Review SQL/API call trước khi trust result |
| Assume MCP là sandboxed | MCP server có full access tới những gì bạn configure |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Công ty fintech Việt Nam cần Claude debug production issue nhanh hơn. Database lớn, log phân tán, debug cần manual SQL + log search + code review.

**Problem**: Average resolution time: 4 tiếng. Engineer spend phần lớn thời gian gather data, không phải analyze.

**Solution**: Deploy 3 MCP server:
1. **PostgreSQL MCP** (read-only replica): Claude query production data
2. **Custom Monitoring MCP**: Tool như `get_error_logs(service, time_range)`
3. **GitHub MCP**: Code context cho recent change

**Workflow**: Developer hỏi "Tại sao payment đang timeout?"

Claude:
1. Gọi `get_error_logs("payment-service", "1h")` → tìm timeout pattern
2. Query database → tìm spike trong pending transaction
3. Search GitHub → tìm recent change trong locking logic
4. Trả về: root cause, proof, fix (rollback commit)

**Result**:
- Resolution time: 4 tiếng → **1.2 tiếng** (-70%)
- Engineer analyze thay vì gather data
- Full context không cần write access

**Quote từ Lead Engineer**: "MCP biến Claude từ 'smart assistant' thành 'team member có system access.' Nó thấy những gì chúng tôi thấy, nhưng connect dots nhanh hơn."

---

> **Phase 11 Hoàn Thành!** Bạn đã master automation — từ headless script đến MCP integration.
>
> **Phase Tiếp Theo**: [Phase 12: n8n & Workflows](../../phase-12-n8n-workflows/01-claude-code-n8n/) →
