---
title: 'System Control — Rule advisory và control được enforce'
description: 'Biến một rule bảo mật trong CLAUDE.md thành một enforced control — deny rule cộng PreToolUse hook — và kiểm chứng nó chặn thật.'
verified: 2026-09-23
claude_version: 2.1.280
---

# Module 2.5: System Control — Rule advisory và control được enforce

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 2.4 (Secret Management)
>
> **Kết quả**: Bạn phân biệt được rule advisory với enforced control, dựng được một control hoàn
> chỉnh, và cho nó chặn một vi phạm thật ngay trước mắt bạn.

---

## 1. WHY — Tại sao cần học cái này?

`CLAUDE.md` của bạn ghi `NEVER read .env`. Cả team đồng ý. Nó nằm trong repo, được review trong
pull request. Rồi một build script do Claude chạy vẫn in API key ra. Không ai cẩu thả — cái rule
đó chưa bao giờ là một control. Phase 2 cho bạn năm lớp phòng thủ; module này là thói quen làm cho
chúng có thật: **mỗi rule bạn dựa vào đều phải có một control đứng sau, và bạn phải tận mắt thấy
control đó chặn một cái gì đó.**

---

## 2. CONCEPT — Khái niệm cốt lõi

### Advisory và enforced

Rule **advisory** định hình thứ Claude *cố làm*: `CLAUDE.md`, prompt, skill. Control **enforced**
quyết định thứ Claude *làm được*, bất kể model nghĩ gì: permission rule, hook, sandbox, managed
settings. Docs vạch rõ ranh giới: *"Permission rules are enforced by Claude Code, not by the model.
Instructions in your prompt or `CLAUDE.md` shape what Claude tries to do, but they don't change
what Claude Code allows."* Anthropic diễn đạt y hệt — skill là *"a control, though an advisory
one"*, còn *"a hook is the deterministic layer behind it"* (S3).

Rule advisory vẫn đáng viết: nó bắt được lỗi vô ý và ghi lại ý định của team. Nó chỉ không được
phép là câu trả lời duy nhất cho câu hỏi "cái gì chặn việc này?"

### Năm lớp, và cái giá khi từng lớp thủng

| Lớp | Module | Khi thủng | Ai đỡ tiếp |
|---|---|---|---|
| 1 Threat awareness | 2.1 | bạn không nhận ra rủi ro | permission rule |
| 2 Permissions | 2.2 | text của rule không khớp lệnh | sandbox |
| 3 Sandbox | 2.3 | lệnh chạy ngoài sandbox | secret không nằm trên đĩa |
| 4 Secrets | 2.4 | secret lọt vào context | audit |
| 5 System control | 2.5 | không ai audit | lộ toàn bộ |

Phải nhiều lớp thủng cùng lúc mới thành thảm hoạ — chính vì thế, bỏ một lớp vì "đã có mấy lớp kia"
là cách các team kết thúc với đúng một lớp. Anthropic containment ở environment layer trước, model
layer sau (S13); hãy làm y vậy, và coi mọi rule advisory là *đỉnh* của một chồng control, không
phải cả chồng.

### Con người vẫn chịu trách nhiệm

Tự động hoá dịch chuyển công việc, không dịch chuyển trách nhiệm: *"Humans remain accountable for
every decision that requires judgment."* (S3) Một control bạn chưa từng test là một quyết định bạn
chưa từng đưa ra.

> `(S3)`, `(S13)`: `docs/references/anthropic-sources.md`.

---

## 3. DEMO — Làm mẫu từng bước

Một control, từ đầu đến cuối: **không lệnh shell nào trong project này được đọc `.env`.** Lab: một
git repo nháp có `.env` chứa `API_KEY=sk-FAKE-DO-NOT-USE-xxxxxxxxxxxx`.

**Step 1: Lớp enforced — một deny rule**

```bash
# docs: permissions#read-and-edit
mkdir -p .claude && cat > .claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": ["Bash(npm test:*)", "Read"],
    "deny": ["Read(./.env)", "Bash(git push --force:*)"]
  }
}
EOF
claude -p "Run exactly this bash command and report its raw output: cat .env" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I couldn't run `cat .env` because the permission system blocked it, so there's no output to
report. I didn't try reading the file another way.
```

Bị chặn — tool result ghi
`Permission to use Bash with command cat .env has been denied.`

**Step 2: Thử vi phạm theo đường khác — và nhìn nó lọt**

```bash
# docs: permissions#read-and-edit
claude -p "Run exactly this bash command and report its raw output: node -e \"console.log(require('fs').readFileSync('.env','utf8'))\"" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I ran the command and it printed this:

API_KEY=sk-FAKE-DO-NOT-USE-xxxxxxxxxxxx
```

Đó là blast radius của bạn, và docs đã báo trước: deny rule cho Read *"don't apply to … arbitrary
subprocesses that read or write files indirectly, like a Python or Node script that opens files
itself."* Rule là thật. Phạm vi của nó hẹp hơn bạn tưởng — và bạn chỉ biết điều đó khi thử.

**Step 3: Bịt lỗ hổng bằng một `PreToolUse` hook**

```bash
# docs: hooks#pretooluse
mkdir -p .claude/hooks && cat > .claude/hooks/block-env-reads.sh << 'EOF'
#!/usr/bin/env bash
# PreToolUse/Bash: deny any shell command whose text mentions .env,
# including subprocesses the Read deny rule cannot see.
cmd=$(jq -r '.tool_input.command // empty')
if printf '%s' "$cmd" | grep -q '\.env'; then
  echo "Blocked by project policy: no shell command may touch .env. Use .env.example." >&2
  exit 2
fi
exit 0
EOF
chmod +x .claude/hooks/block-env-reads.sh
```

Đăng ký nó trong chính `.claude/settings.json`, cạnh `permissions`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/block-env-reads.sh" }
        ]
      }
    ]
  }
}
```

Exit 2 là mã chặn, và hook *"stops the tool call before permission rules are evaluated"* — nên nó
đứng vững ở mọi permission mode.

**Step 4: Chạy lại lệnh vi phạm — kiểm chứng nó bị chặn**

```bash
# docs: hooks#pretooluse
claude -p "Run exactly this bash command and report its raw output: node -e \"console.log(require('fs').readFileSync('.env','utf8'))\"" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I didn't get any output. The project's hook (`.claude/hooks/block-env-reads.sh`) blocked the
command before it ran and returned this error:

PreToolUse:Bash hook error: [$CLAUDE_PROJECT_DIR/.claude/hooks/block-env-reads.sh]: Blocked by
project policy: no shell command may touch .env. Use .env.example.
```

Cùng một lệnh, cùng một key, kết cục khác hẳn. **Chính output này mới là sản phẩm** — không phải
file config.

**Step 5: Audit, rồi biến thành thói quen**

`/permissions` → tab **Deny** cho thấy những gì đang được nạp và rule nào đến từ file nào:

```text
# Output may vary
   Permissions  Recently denied   Allow   Ask   Deny   Auto mode   Workspace

   Claude Code will always reject requests to use denied tools.

     1. Add a new rule…
     2. Bash(git push --force:*)
     3. Read(./.env)

   ←/→ to switch · ↓ to select · Esc to cancel
```

Rồi chạy các checklist bạn để cạnh bàn phím — trước, trong, sau mỗi session, và hằng tuần — lấy từ
[`templates/security-checklists.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/security-checklists.md).
Thêm đúng một dòng hằng tuần: **chạy lại Step 4.** Một control ngừng chặn còn tệ hơn không có,
vì bạn vẫn đang tin nó.

---

## 4. PRACTICE — Tự thực hành

### Exercise 1: Chuyển một rule advisory thành control

**Mục tiêu**: lấy dòng `NEVER …` đáng sợ nhất trong `CLAUDE.md` của bạn và gắn cho nó một control.

**Hướng dẫn**: viết deny rule; chạy lệnh vi phạm và xác nhận bị chặn; tìm một cách viết khác của
lệnh đó mà rule không bắt; bịt bằng `PreToolUse` hook; chạy lại.

**Kết quả mong đợi**: một transcript trong đó vi phạm bị từ chối, kèm ghi chú những gì vẫn chưa
được phủ.

<details>
<summary>💡 Hint</summary>

Rule khớp theo *nội dung lệnh*. Hãy tự hỏi: lệnh này còn viết được kiểu nào nữa? `/usr/bin/x`,
`sh -c '…'`, `git -C . …`, hay một script tự mở file.

</details>

<details>
<summary>✅ Solution</summary>

```json
{
  "permissions": { "deny": ["Read(./.env)", "Bash(git push --force:*)"] },
  "hooks": {
    "PreToolUse": [
      { "matcher": "Bash",
        "hooks": [ { "type": "command",
          "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/block-env-reads.sh" } ] }
    ]
  }
}
```

Vẫn giữ dòng trong `CLAUDE.md`: nó nói cho đồng đội biết *vì sao* control tồn tại. Bắt đầu từ
[`templates/claude-md-security-example.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/claude-md-security-example.md).

</details>

---

### Exercise 2: Audit một repo trong mười phút

**Mục tiêu**: chấm điểm một repo theo năm lớp và ghi rõ chỗ nào mới chỉ có advisory.

**Hướng dẫn**: với mỗi lớp, nêu tên control và lệnh chứng minh nó hoạt động; lớp nào chỉ có một
câu trong `CLAUDE.md` làm bằng chứng thì đánh dấu **chưa kiểm chứng**.

**Kết quả mong đợi**: một bảng ngắn, mỗi dòng "đã bảo vệ" đều dẫn một lệnh bạn đã chạy.

<details>
<summary>✅ Solution</summary>

Một dòng chỉ được xanh khi bạn dán được thông báo từ chối. Khi onboard đồng đội, đưa họ
[`templates/onboarding-security.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/onboarding-security.md)
— riêng bước sandbox trong đó đã được Module 2.3 thay thế, vì 2.3 mới là chỗ dạy sandbox.

</details>

---

## 5. CHEAT SHEET

| Control | Ở đâu | Có enforce không? |
|---|---|---|
| Rule trong `CLAUDE.md` | repo root | Không — advisory |
| `permissions.deny` | `.claude/settings.json` | Có, theo nội dung lệnh và path khớp |
| `PreToolUse` hook, exit 2 | `.claude/settings.json` + script | Có, trước cả permission rule |
| Sandbox | `/sandbox`, `sandbox.enabled` | Có, ở mức OS (Module 2.3) |
| `disableBypassPermissionsMode` | managed settings | Có, cho toàn bộ máy trong tổ chức |

| Kiểm chứng | Lệnh |
|---|---|
| rule nào đang được nạp | `/permissions` |
| deny rule còn hiệu lực | chạy lại lệnh vi phạm, đọc thông báo từ chối |
| hook có nổ không | chạy lại, tìm dòng `PreToolUse:Bash hook error:` |

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|---|---|
| Coi `CLAUDE.md` là thứ enforce | Nó advisory. Mỗi dòng `NEVER` phải đi kèm deny rule hoặc hook |
| Ship một control chưa từng kích hoạt | Chạy lệnh vi phạm một lần; dán thông báo từ chối vào PR |
| Một deny rule rồi coi như đã bịt | Thử các cách viết khác; subprocess thì phải dùng hook |
| Governance nặng đến mức không ai làm nổi | Checklist hằng ngày dưới hai phút; phần còn lại tự động hoá |
| Chỉ audit đúng một lần lúc setup | Hằng tuần chạy lại lệnh vi phạm; control mục âm thầm |
| Copy nguyên policy của team khác | Threat model của họ không phải của bạn. Bắt đầu từ template rồi cắt |

---

## 7. REAL CASE — Câu chuyện thực tế

**Bối cảnh**: Khoa dẫn năm developer ở Đà Nẵng làm SaaS logistics. Họ dùng Claude Code và ship
nhanh hơn hẳn. Trong ba tháng đó cũng có ba sự cố: một test key Stripe bị commit vào git và hai
tuần sau mới phát hiện; một lệnh `rm -rf` được duyệt mà không đọc kỹ, xoá mất một thư mục project;
và một lần `cat .env` giữa buổi demo share màn hình, phơi credential production trước mười hai
người.

**Vấn đề**: sau sự cố thứ ba, Khoa phát hiện `CLAUDE.md` của team đã cấm cả ba việc đó. Rule có
sẵn. Không có gì enforce chúng.

**Giải pháp**: trong một cuối tuần, mỗi rule được gắn một control — `permissions.deny` cho `.env`
và force push, `PreToolUse` hook cho những cách viết mà rule không bắt, gitleaks trong
`pre-commit`, và một checklist hai phút. Mỗi control chỉ được ký duyệt sau khi có người tận mắt
thấy nó từ chối một lệnh thật.

**Kết quả**: ba tháng tiếp theo không thêm sự cố nào. Thứ tạo ra khác biệt không phải mấy file
config, mà là quy ước: một control chỉ được tính khi cả team đã thấy nó chặn một cái gì đó. Câu
hỏi due-diligence của khách — "các anh chặn AI đụng vào dữ liệu của chúng tôi bằng cách nào?" —
từ một đoạn policy biến thành một demo hai phút.

---

> **Next**: [Module 3.1: Reading & Understanding Codebases](../../phase-03-core-workflows/01-reading-codebases/) →
