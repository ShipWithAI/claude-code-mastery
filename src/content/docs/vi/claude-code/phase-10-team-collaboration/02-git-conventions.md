---
title: 'Quy ước Git'
description: 'Cấu hình commit và PR attribution bằng setting attribution, và cho mỗi feature một worktree riêng.'
verified: 2026-09-27
claude_version: 2.1.283
---

# Module 10.2: Quy ước Git

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 10.1 (CLAUDE.md cho Team)
>
> **Kết quả**: Sau module này, bạn biết default attribution thật sự của Claude Code cho commit/PR,
> cách đổi hoặc ẩn nó bằng setting `attribution`, và cách cho mỗi feature một worktree riêng.

---

## 1. WHY — Tại Sao Cần Quan Tâm

Dev nhờ Claude implement một feature. Claude tự `git commit` và tự mở PR bằng `gh pr create`. Tiện
— cho đến khi legal hỏi "sao commit nào cũng có dòng `Co-Authored-By` ghi tên một model?" hay đồng
nghiệp hỏi "tắt được không cho repo này?" Quy ước Git cho AI-assisted work không phải chuyện viết
tay commit message đẹp hơn — mà là biết chính xác Claude Code ghi gì vào history theo mặc định, và
setting duy nhất thay đổi được nó.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Git như artifact trail, không chỉ là history

Đối xử mỗi đơn vị công việc AI-assisted như một spec: intent, plan, diff, và một PR con người
review trước khi merge. Anthropic mô tả sự dịch chuyển này: "Code is no longer the bottleneck — the
human-speed steps around it are" (S3). Quy ước Git quan trọng HƠN với AI, chính vì Claude sẽ tuân
theo (hoặc bỏ qua) nó nhất quán ở mọi commit — con người thỉnh thoảng quên convention; Claude cấu
hình sai thì quên ở mọi commit.

### Default attribution thật sự (không phải đoán)

Khi Claude Code tự tạo commit hoặc PR, nó thêm attribution mặc định. Default chính xác, có tài
liệu:

| Bề mặt | Text mặc định |
|---|---|
| Commit trailer | `Co-Authored-By: <model> <noreply@anthropic.com>` — `<model>` là model đã commit, vd `Claude Sonnet 5` |
| Mô tả pull request | `🤖 Generated with [Claude Code](https://claude.com/claude-code)` |

### `attribution` — setting hiện tại (không phải `includeCoAuthoredBy`)

`includeCoAuthoredBy` đã **deprecated từ v2.0.62**. Key hiện tại là `attribution`, đặt ở bất kỳ
settings file nào (user, project, hoặc local):

```json
{
  "attribution": {
    "commit": "Generated with AI\n\nCo-Authored-By: AI <ai@example.com>",
    "pr": "",
    "sessionUrl": false
  }
}
```

- `attribution.commit` (string) — thay toàn bộ text trailer của commit.
- `attribution.pr` (string) — thay text mô tả PR; chuỗi rỗng ẩn nó luôn.
- `attribution.sessionUrl` (boolean, mặc định `true`) — trailer `Claude-Session` thêm vào commit từ
  cloud hoặc Remote Control; `false` bỏ nó.
- `attribution: false` (Claude Code **v2.1.281+**) ẩn toàn bộ attribution một lần. Version cũ hơn
  từ chối shape này và bỏ qua luôn cả settings file chứa nó.
- Một khi bạn tự set `commit` hoặc `pr`, Claude Code bỏ qua `includeCoAuthoredBy` cho bề mặt đó và
  chỉ dùng default riêng cho cái bạn chưa set.
- Instruction về attribution trong CLAUDE.md/memory của bạn có precedence hơn hai dòng này — *trừ
  khi* dòng đó được set trong managed settings (Module 10.5), lúc đó managed luôn thắng.

### Một worktree cho mỗi feature

`claude --worktree <name>` (viết tắt `-w`) khởi động Claude trong một git worktree riêng biệt tại
`<repo>/.claude/worktrees/<name>`, để hai feature không bao giờ đụng nhau trong cùng thư mục làm
việc. Nó cũng nhận URL PR/MR hoặc `#<number>` để branch thẳng từ pull request đó. Cần ít nhất một
commit có sẵn — repo trống sẽ fail với `Failed to resolve base branch "HEAD"`.

### Thói quen atomic commit vẫn quan trọng

Không cái nào ở trên thay đổi thứ làm một commit dễ review: một thay đổi logic, một subject con
người viết hoặc duyệt, một body giải thích *tại sao*. AI attribution chỉ ghi lại việc Claude có
tham gia — nó không thay thế việc review *Claude đã làm gì*.

---

## 3. DEMO — Từng Bước

**Kịch bản**: Claude commit một fix thật trong lab, sau đó team đổi trailer.

**Bước 1: Để Claude commit với trailer mặc định**

```bash
$ claude -p "Stage src/calc.js and commit it with a Conventional Commits message." \
  --permission-mode acceptEdits \
  --allowedTools "Bash(git add:*) Bash(git commit:*) Bash(git status:*) Bash(git diff:*)"
```

**Bước 2: Đọc lại trailer thật**

```bash
$ git log -1 --format="%H%n%s%n%n%b"
```
```text
# Output may vary
6135609ad9da7a45170e07ce4cac5f326a41ced4
fix(calc): guard percentOf against zero total and drop eval in runExpression

- percentOf now returns 0 when total is 0 instead of Infinity/NaN.
- runExpression no longer calls eval on user input...

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

Đúng default đã có tài liệu, không có instruction nào từ CLAUDE.md thay đổi nó.

**Bước 3: Set `attribution.commit` trong `.claude/settings.json` của project**

```bash
$ cat > .claude/settings.json <<'EOF'
{
  "attribution": {
    "commit": "Generated-by: Claude Code (lab demo)"
  }
}
EOF
```

**Bước 4: Commit lại — trailer đổi ngay lập tức**

```bash
$ claude -p "Stage src/calc.js and commit it: 'docs(calc): add clarifying comment'." \
  --permission-mode acceptEdits \
  --allowedTools "Bash(git add:*) Bash(git commit:*)"
$ git log -1 --format="%s%n%n%b"
```
```text
# Output may vary
docs(calc): add clarifying comment

Generated-by: Claude Code (lab demo)
```

Không còn dòng `Co-Authored-By` nữa — setting của project đã thay trailer cho mọi commit Claude tạo
trong repo này, với mọi developer đã checkout setting đó.

---

## 4. PRACTICE — Tự Thực Hành

### Exercise 1: Quyết định chính sách attribution của team

**Goal**: Chọn và cấu hình một lập trường attribution cho repo.

**Instructions**:
1. Quyết định: giữ trailer mặc định, tùy chỉnh text, hoặc ẩn hẳn (`attribution: false`, v2.1.281+).
2. Thêm block `attribution` đã chọn vào `.claude/settings.json` (chia sẻ) hoặc
   `.claude/settings.local.json` (chỉ mình bạn).
3. Nhờ Claude tạo một commit thật, xác nhận bằng `git log -1`.

<details>
<summary>💡 Hint</summary>

`attribution: false` cần v2.1.281+; Claude Code cũ hơn từ chối cả settings file chứa nó, kiểm tra
`claude --version` trước.
</details>

### Exercise 2: Một worktree cho mỗi feature

**Goal**: Chạy song song hai feature mà không đụng cùng thư mục làm việc.

**Instructions**:
1. `claude --worktree feature-a "implement X"`
2. `claude --worktree feature-b "implement Y"`
3. Xác nhận cả hai nằm dưới `.claude/worktrees/` và `git status` của bên nào cũng không thấy file
   của bên kia.

### Exercise 3: Atomic commit drill

**Goal**: Luyện commit granularity dễ review, độc lập với attribution.

**Instructions**:
1. Nhờ Claude implement một feature nhỏ, nhiều bước.
2. Yêu cầu 3-5 atomic commit, mỗi commit tự pass test được.
3. Chạy `git log --oneline -10` — đọc log có hiểu chuyện gì xảy ra không cần mở diff?

<details>
<summary>✅ Solution</summary>

Nếu log đọc kiểu `feat(auth): add endpoint` / `feat(auth): add token generation` / `feat(auth):
add email send`, mỗi cái test độc lập được, đó là atomic. Nếu đọc `wip` / `more changes` / `fix`,
siết lại instruction trong `CLAUDE.md`: "một thay đổi logic mỗi commit; mỗi commit phải pass `npm
test`."
</details>

---

## 5. CHEAT SHEET

| Key / Flag | Hiệu ứng |
|---|---|
| `attribution.commit` | Thay text trailer commit (mặc định: `Co-Authored-By: <model> <noreply@anthropic.com>`) |
| `attribution.pr` | Thay text mô tả PR (mặc định: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`); `""` ẩn nó |
| `attribution.sessionUrl` | `false` bỏ trailer `Claude-Session` trên commit từ cloud/Remote Control |
| `attribution: false` | Ẩn toàn bộ attribution (chỉ v2.1.281+) |
| `includeCoAuthoredBy` | ⚠️ Deprecated từ v2.0.62 — dùng `attribution` |
| `claude --worktree <name>` (`-w`) | Worktree riêng tại `.claude/worktrees/<name>`; nhận URL PR hoặc `#<number>` |
| `gh pr create` / `glab mr create` | Thứ Claude thật sự gọi để mở PR — link session vào PR đó |

---

## 6. PITFALLS — Sai Lầm Thường Gặp

| ❌ Sai | ✅ Đúng |
|-----------|---------------------|
| Tưởng `includeCoAuthoredBy: false` vẫn còn tác dụng trên version hiện tại | Vẫn được đọc để tương thích ngược, nhưng set `attribution.commit`/`attribution.pr` thay vào |
| Set `attribution: false` rồi thắc mắc sao không đổi gì | Cần v2.1.281+; version cũ bỏ qua cả settings file chứa nó |
| Tưởng instruction CLAUDE.md xoá được attribution set trong managed settings | Managed settings luôn thắng chuyện này |
| Một commit khổng lồ "implemented everything" | Yêu cầu atomic commit, mỗi cái pass test, ghi trong `CLAUDE.md` |
| Hai feature sửa cùng thư mục làm việc | `claude --worktree <name>` cho mỗi feature |
| Tin rằng attribution chứng minh code đã được review | Nó chỉ ghi lại Claude đã viết — Module 10.3 dạy cách thật sự review |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

Một team ở Hà Nội để mọi developer's Claude tự commit và tự mở PR với trailer mặc định có tài
liệu. Khi audit compliance, security hỏi commit nào AI-assisted trên ba repo — thay vì grep commit
message theo marker viết tay không nhất quán, họ grep đúng chuỗi `Co-Authored-By: Claude`, vì mọi
commit AI làm trên mọi repo đều dùng đúng default có tài liệu đó. Với một repo internal-tools
không muốn trailer hiện trong changelog gửi khách hàng, họ set `attribution.commit` thành một note
format riêng tư và `attribution.pr` thành `""` trong `.claude/settings.json` của repo đó — một
thay đổi hai dòng, không phải một cuộc thương lượng chính sách, vì cơ chế đã sẵn có, chỉ cần cấu
hình.

---

> **Next**: [Module 10.3: Code Review Protocol](../03-code-review-protocol/) →
