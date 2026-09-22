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
> chỉnh, và cho nó chặn một vi phạm thật.

---

## 1. WHY — Tại sao cần học cái này?

`CLAUDE.md` của bạn ghi `NEVER read .env`. Cả team đồng ý; nó nằm trong repo, được review trong
pull request. Rồi một build script do Claude chạy vẫn in API key ra. Không ai cẩu thả — rule đó
chưa bao giờ là control. Phase 2 cho bạn năm lớp; module này là thói quen làm chúng có thật:
**mỗi rule bạn dựa vào đều phải có một control đứng sau, và bạn phải thấy nó chặn cái gì đó.**

---

## 2. CONCEPT — Khái niệm cốt lõi

### Advisory và enforced

Rule **advisory** định hình thứ Claude *cố làm*: `CLAUDE.md`, prompt, skill. Control **enforced**
quyết định thứ Claude *làm được*: permission rule, hook, sandbox, managed settings. Docs vạch rõ:
*"Permission rules are enforced by Claude Code, not by the model. Instructions in your prompt or
`CLAUDE.md` shape what Claude tries to do, but they don't change what Claude Code allows."*
Anthropic diễn đạt y hệt: skill là *"a control, though an advisory one"*, *"a hook is the
deterministic layer behind it"* (S3).

Rule advisory vẫn đáng viết — nó bắt lỗi vô ý và ghi lại ý định của team. Nó chỉ không được là
câu trả lời duy nhất cho "cái gì chặn việc này?"

### Năm lớp, và cái giá khi từng lớp thủng

| Lớp | Khi thủng | Ai đỡ tiếp |
|---|---|---|
| 2.1 Threat awareness | bạn không nhận ra rủi ro | permission rule |
| 2.2 Permissions | text của rule không khớp lệnh | sandbox |
| 2.3 Sandbox | lệnh chạy ngoài sandbox | secret không nằm trên đĩa |
| 2.4 Secrets | secret lọt vào context | audit |
| 2.5 System control | không ai audit | lộ toàn bộ |

Phải nhiều lớp thủng cùng lúc mới thành thảm hoạ — nên bỏ một lớp vì "đã có mấy lớp kia" là cách
team kết thúc với đúng một lớp. Anthropic containment ở environment layer trước, model layer sau
(S13). Hãy coi rule advisory là *đỉnh* của một chồng control.

### Con người vẫn chịu trách nhiệm

Tự động hoá dịch chuyển công việc, không dịch chuyển trách nhiệm: *"Humans remain accountable for
every decision that requires judgment."* (S3) Control chưa test là quyết định bạn chưa đưa ra.

> `(S3)`, `(S13)`: `docs/references/anthropic-sources.md`.

---

## 3. DEMO — Làm mẫu từng bước

Một control, từ đầu đến cuối: **không lệnh shell nào ở đây được đọc `.env`.** Lab: git repo nháp
có `.env` chứa `API_KEY=sk-FAKE-DO-NOT-USE-xxxxxxxxxxxx`.

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

Bị chặn: `Permission to use Bash with command cat .env has been denied.`

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

Đó là blast radius, và docs đã báo trước: deny rule cho Read *"don't apply to … arbitrary
subprocesses that read or write files indirectly, like a Python or Node script that opens files
itself."* Rule là thật; phạm vi hẹp hơn bạn tưởng — và bạn chỉ biết khi thử.

**Step 3: Thu hẹp lỗ hổng bằng một `PreToolUse` hook**

```bash
# docs: hooks#pretooluse
mkdir -p .claude/hooks && cat > .claude/hooks/block-env-reads.sh << 'EOF'
#!/usr/bin/env bash
# PreToolUse/Bash: deny any shell command that names a .env file, including
# subprocesses the Read deny rule cannot see. Fail closed if jq is missing.
command -v jq >/dev/null || { echo "block-env-reads.sh needs jq" >&2; exit 2; }
cmd=$(jq -r '.tool_input.command // empty')
cmd=${cmd//.env.example/}   # templates stay readable
cmd=${cmd//.env.sample/}
if printf '%s' "$cmd" | grep -q '\.env'; then
  echo "Blocked by project policy: this command names a .env file. Use .env.example." >&2
  exit 2
fi
exit 0
EOF
chmod +x .claude/hooks/block-env-reads.sh
```

Hai chi tiết đáng chép: nó **fail closed** khi thiếu `jq` — hook exit 0 vì mất dependency là
control đã âm thầm ngừng kiểm soát — và bỏ `.env.example` ra trước khi so khớp, để cách khắc phục
mà chính message của nó khuyên vẫn chạy được.

Đăng ký trong chính `.claude/settings.json`, cạnh khối `permissions` sẵn có:

```json
{
  "permissions": { "…as in Step 1…" },
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-env-reads.sh" }
        ]
      }
    ]
  }
}
```

Giữ khối `permissions`: chỉ một file, dán mỗi `hooks` là xoá sạch rule. Exit 2 chặn, và hook
*"stops the tool call before permission rules are evaluated"* — nên allow rule không đè được nó.

**Step 4: Chạy lại lệnh vi phạm — kiểm chứng nó bị chặn**

```bash
# docs: hooks#pretooluse
claude -p "Run exactly this bash command and report its raw output: node -e \"console.log(require('fs').readFileSync('.env','utf8'))\"" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I couldn't run it. A PreToolUse hook in this project blocked the command before it executed, so
there is no raw output to show you. The hook returned:

PreToolUse:Bash hook error: [${CLAUDE_PROJECT_DIR}/.claude/hooks/block-env-reads.sh]: Blocked by
project policy: this command names a .env file. Use .env.example.
```

Cùng lệnh, cùng key, kết cục khác hẳn. **Output này mới là sản phẩm**, không phải file config.

Giờ kiểm chứng thứ người ta hay mặc định. Chạy lại với `--permission-mode acceptEdits` — vẫn bị
chặn. Rồi xem đường khắc phục có thật sự mở:

```bash
claude -p "Run exactly this bash command and report its raw output: cat .env.example" \
  --permission-mode default --allowedTools Bash
```

```text
# Output may vary
I ran the command. Raw output:

API_KEY=your_api_key_here
```

**Hook này vẫn không chặn được gì.** Nó đọc *nội dung lệnh*, y như deny rule mà nó vá, nên path
được tính toán (`f=.en; cat ".${f}v"`) đi lọt, còn lệnh vô hại
`git commit -m "document .env vars"` lại bị chặn nhầm. Lớp bỏ qua chuyện lệnh *viết gì* là sandbox
([Module 2.3](../03-sandbox/)). Thêm nữa: `disableAllHooks` tắt hook, và
`"disableAllHooks": false` của project đè `true` trong user settings — repo, chứ không phải bạn,
quyết định hook của bạn có chạy hay không.

**Step 5: Audit, rồi biến thành thói quen**

`/permissions` → tab **Deny** cho thấy thứ đang được nạp và rule nào đến từ file nào.

```text
# Output may vary
   Permissions  Recently denied   Allow   Ask   Deny   Auto mode   Workspace

   Claude Code will always reject requests to use denied tools.

     1. Add a new rule…
     2. Bash(git push --force:*)
     3. Read(./.env)

   ←/→ to switch · ↓ to select · Esc to cancel
```

Rồi chạy các checklist để cạnh bàn phím — trước, trong, sau session, và hằng tuần — lấy từ
[`templates/security-checklists.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/security-checklists.md).
Thêm một dòng hằng tuần: **chạy lại Step 4.** Control ngừng chặn tệ hơn không có, vì bạn vẫn tin
nó.

---

## 4. PRACTICE — Tự thực hành

### Exercise 1: Chuyển một rule advisory thành control

**Mục tiêu**: gắn control cho dòng `NEVER …` đáng sợ nhất trong `CLAUDE.md`.

**Hướng dẫn**: viết deny rule; chạy lệnh vi phạm, xác nhận bị chặn; tìm một cách viết khác mà
rule không bắt; bịt bằng `PreToolUse` hook; chạy lại.
**Trước đã**: bước *thành công* in file ra transcript. Làm trên bản clone nháp, hoặc thay giá trị
trong `.env` bằng dữ liệu giả. Đừng test với credential thật.

**Kết quả mong đợi**: transcript trong đó vi phạm bị từ chối, kèm ghi chú phần chưa được phủ.

<details>
<summary>💡 Hint</summary>

Rule khớp theo *nội dung lệnh*. Lệnh này còn viết kiểu nào nữa? `/usr/bin/x`, `sh -c '…'`,
`git -C . …`, hay script tự mở file.

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
          "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/block-env-reads.sh" } ] }
    ]
  }
}
```

Giữ dòng trong `CLAUDE.md`: nó cho đồng đội biết *vì sao* control tồn tại. Bắt đầu từ
[`templates/claude-md-security-example.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/claude-md-security-example.md).

</details>

---

### Exercise 2: Audit một repo trong mười phút

**Mục tiêu**: chấm một repo theo năm lớp, ghi rõ chỗ nào mới chỉ có advisory.

**Hướng dẫn**: mỗi lớp nêu control và lệnh chứng minh nó chạy; lớp nào chỉ có một câu trong
`CLAUDE.md` làm bằng chứng thì đánh dấu **chưa kiểm chứng**.

**Kết quả mong đợi**: bảng mà mỗi dòng "đã bảo vệ" đều dẫn một lệnh bạn đã chạy.

<details>
<summary>✅ Solution</summary>

Dòng chỉ xanh khi bạn dán được thông báo từ chối. Onboard đồng đội thì đưa
[`templates/onboarding-security.md`](https://github.com/ShipWithAI/claude-code-mastery/blob/develop/templates/onboarding-security.md)
— nhưng bỏ hẳn Step 5 của nó: `sandbox.sh` mà nó gọi không còn trong repo nữa, và Module 2.3 sẽ
thay thế bước đó.

</details>

---

## 5. CHEAT SHEET

| Control | Có enforce không? |
|---|---|
| Rule trong `CLAUDE.md` | Không — advisory |
| `permissions.deny` | Có, theo nội dung lệnh và path khớp |
| `PreToolUse` hook, exit 2 | Có, trước permission rule — nhưng vẫn theo nội dung lệnh |
| Sandbox (`/sandbox`, `sandbox.enabled`) | Có, ở mức OS (Module 2.3) |
| `{"permissions": {"disableBypassPermissionsMode": "disable"}}` | Có, từ bất kỳ file settings nào — managed cho cả tổ chức, hoặc file của bạn để tự khoá |

| Kiểm chứng | Cách |
|---|---|
| rule đang được nạp | `/permissions` |
| deny rule còn hiệu lực | chạy lại lệnh vi phạm, đọc thông báo từ chối |
| hook có nổ không | chạy lại, tìm `PreToolUse:Bash hook error:` |

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Sai | ✅ Đúng |
|---|---|
| Coi `CLAUDE.md` là thứ enforce | Advisory. Mỗi dòng `NEVER` đi kèm deny rule hoặc hook |
| Ship control chưa từng kích hoạt | Chạy lệnh vi phạm; dán thông báo từ chối vào PR |
| Một deny rule rồi coi như đã bịt | Thử cách viết khác; subprocess thì phải dùng hook |
| Governance nặng đến mức không ai làm nổi | Checklist hằng ngày dưới hai phút; còn lại tự động |
| Chỉ audit một lần lúc setup | Hằng tuần chạy lại lệnh vi phạm; control mục âm thầm |
| Copy policy của team khác | Threat model của họ không phải của bạn; bắt đầu từ template |

---

## 7. REAL CASE — Câu chuyện thực tế

**Bối cảnh**: Khoa dẫn năm developer ở Đà Nẵng làm SaaS logistics. Claude Code giúp họ nhanh hơn
hẳn — kèm ba sự cố trong ba tháng: một test key Stripe bị commit vào git, hai tuần sau mới phát
hiện; một lệnh `rm -rf` được duyệt mà không đọc kỹ, xoá mất thư mục project; và một lần `cat .env`
giữa buổi demo share màn hình, phơi credential production trước mười hai người.

**Vấn đề**: sau sự cố thứ ba, Khoa phát hiện `CLAUDE.md` đã cấm cả ba việc đó. Rule có sẵn;
không có gì enforce chúng.

**Giải pháp**: trong một cuối tuần, mỗi rule được gắn một control — `permissions.deny` cho `.env`
và force push, `PreToolUse` hook cho những cách viết rule không bắt, gitleaks trong `pre-commit`,
một checklist hai phút. Không gì được ký duyệt cho tới khi có người tận mắt thấy nó từ chối một
lệnh thật.

**Kết quả**: ba tháng sau không thêm sự cố nào. Thứ tạo khác biệt là quy ước: một control chỉ được
tính khi cả team đã thấy nó chặn cái gì đó — nhờ vậy câu hỏi due-diligence của khách thành một
demo hai phút.

---

> **Next**: [Module 3.1: Reading & Understanding Codebases](../../phase-03-core-workflows/01-reading-codebases/) →
