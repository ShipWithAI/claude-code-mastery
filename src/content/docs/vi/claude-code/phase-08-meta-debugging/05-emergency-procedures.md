---
title: 'Quy trình khẩn cấp'
description: 'Quy trình xử lý khẩn cấp khi Claude Code gây lỗi nghiêm trọng: rollback, recover và damage control.'
verified: 2026-09-28
claude_version: 2.1.283
---

# Module 8.5: Quy trình khẩn cấp

> **Thời gian học**: ~30 phút
>
> **Yêu cầu trước**: Module 8.4 (Đánh giá chất lượng)
>
> **Kết quả**: Sau module này, bạn sẽ có mental playbook cho emergency, thuộc recovery command, và act nhanh khi có vấn đề.

---

## 1. WHY — Tại Sao Cần Hiểu

Claude supposed to "clean up config file." Bạn approve không nhìn kỹ. Giờ file `.env` bị xóa, production environment variable mất, scramble nhớ lại có gì trong đó.

Hoặc: Claude modified 50 file trong "refactor" và bạn không biết actually changed gì.

Emergency xảy ra. Dù có tất cả safeguard từ module trước. Question là: bạn có recovery plan không? Lúc emergency không phải lúc để học procedure — học bây giờ.

---

## 2. CONCEPT — Ý Tưởng Cốt Lõi

### Emergency Severity Level

| Level | Situation | Response Time | Example |
|-------|-----------|---------------|---------|
| 🔴 Critical | Production affected, data loss | Immediate | Deleted .env, broke production |
| 🟠 Major | Development blocked | Minutes | 50 file modified, không continue được |
| 🟡 Minor | Confused state, recoverable | When convenient | Context confusion, stuck loop |

### Emergency Playbook

Memorize sequence này:

1. **STOP**: Nhấn `Esc` ngay để ngắt turn hiện tại. Đừng để Claude continue.
2. **ASSESS**: `git status` + `git diff` — actually changed gì? `Esc Esc` (hoặc `/rewind`) cũng cho
   xem checkpoint list, để biết chính xác turn nào đụng vào code.
3. **CONTAIN**: `git stash` cho thứ Bash đụng vào. Với edit do tool `Edit`/`Write` làm trong session
   *này*, `/rewind` → "Restore code" undo trực tiếp được — nhưng KHÔNG undo được thứ làm qua Bash
   (`rm`, `mv`, script). Xem CONTAIN bên dưới.
4. **RECOVER**: Chọn recovery strategy theo severity.
5. **DOCUMENT**: Xảy ra gì? Dùng `permissions.deny` hoặc `PreToolUse` hook — enforced, không phải
   note trong CLAUDE.md.

### Recovery Strategy

| Strategy | Command | Khi Nào |
|----------|---------|---------|
| Undo change của Edit/Write tool | `Esc Esc` → Restore code (hoặc `/rewind`) | Change xấu do tool Edit/Write của Claude làm trong session này |
| Discard one file | `git restore <file>` | 1 file sai (work cả qua session khác, nếu tracked) |
| Discard all change | `git restore .` | Mọi thứ từ last commit bad |
| Hard reset | `git reset --hard HEAD` | Complete disaster recovery |
| Recover deleted commit | `git reflog` | Nếu reset quá mạnh |
| Fresh session | `/clear` | Context hopelessly confused |

Lệnh `git checkout` cũ vẫn work cho việc này, nhưng `git restore` là command hiện đại, làm đúng một
việc "discard change của file" — `checkout` bị overload (còn switch branch), dễ gõ nhầm lúc emergency.

### Pre-Emergency Preparation

- Commit thường xuyên (small commit = easy recovery point)
- Dùng feature branch (isolate AI work)
- Backup .env và sensitive file ngoài git
- Thuộc recovery command
- Never Full Auto không có git safety net

---

## 3. DEMO — Từng Bước

### Scenario 0: Rewind Undo Được Edit — Nhưng Không Undo Được Bash Delete

Đây là session lab thật (chạy 2026-09-28) với 2 turn: một `Edit`-tool change, rồi một `Bash rm`.
`Esc Esc` trên prompt trống mở rewind menu:

```text
# Output may vary — capture live, đã redact thông tin plugin cá nhân
Rewind

Restore the code and/or conversation to the point before…

  Append the line 'line2' to rewind-demo.txt using the Edit tool.
  rewind-demo.txt +1

  Append the line 'line3' to rewind-demo.txt using the Edit tool.
  rewind-demo.txt +1

❯ (current)

Enter to continue · Esc to cancel
```

Chọn checkpoint cũ hơn mở action menu — capture thật cho thấy **5 option kèm scroll cue** cho turn
có code change:

```text
# Output may vary
Rewind

Confirm you want to restore to the point before you sent this message:

│ Append the line 'line3' to rewind-demo.txt using the Edit tool.
│ (12s ago)

The conversation will be forked.
The code will be restored -1 in rewind-demo.txt.

❯ 1. Restore code and conversation
  2. Restore conversation
  3. Restore code
  4. Summarize from here
↓ 5. Summarize up to here

⚠ Rewinding does not affect files edited manually or via bash.
```

Chọn **"Restore code"** thật sự revert file — `cat rewind-demo.txt` sau đó cho thấy `line3` đã mất.
Giờ xem điều gì xảy ra sau một `Bash rm`: checkpoint list đánh dấu turn đó **"No code changes"**, và
action menu của nó bỏ hẳn option "Restore code":

```text
# Output may vary
Rewind

Confirm you want to restore to the point before you sent this message:

│ Delete throwaway.txt using rm via the Bash tool.
│ (12s ago)

The conversation will be forked.
The code will be unchanged.

❯ 1. Restore conversation
  2. Summarize from here
  3. Summarize up to here
  4. Never mind
```

**Xác nhận**: sau khi chọn bất kỳ option nào ở đây, `ls throwaway.txt` vẫn trả "No such file or
directory". Rewind thật sự không thấy được thay đổi do Bash làm — đây là (S15), viết rõ trong
`checkpointing.md`. Cách duy nhất để lấy lại là git:

```bash
$ git restore throwaway.txt
$ ls throwaway.txt
throwaway.txt   # Output may vary — đã recover
```

**Bài học**: `/rewind` dành cho thứ tool `Edit`/`Write` của Claude làm. Với bất kỳ thứ gì Claude
chạy qua Bash, git là safety net duy nhất — vì vậy Pre-Emergency Preparation (bên dưới) rất quan trọng.

### Scenario 1: Claude Deleted Important File

**STOP** — Thấy Claude đang delete file? Nhấn `Esc` ngay để ngắt.

**ASSESS**:
```bash
$ git status
```

Output:
```text
Changes not staged for commit:
  deleted:    .env
  deleted:    config/production.json
  modified:   src/config.ts
```

**CONTAIN**:
```bash
$ git stash
```

Output:
```text
Saved working directory and index state WIP on main: abc1234 Last commit
```

**RECOVER**:
```bash
$ git restore .
```

`git restore` không print gì khi thành công (verified: exit code 0, silent) — check kết quả trực
tiếp:

Verify recovery:
```bash
$ ls .env config/production.json
```

Output:
```text
.env  config/production.json
```

File đã về.

### Scenario 2: Claude Modified 50 File

**STOP**: Nhấn `Esc`

**ASSESS**:
```bash
$ git diff --stat
```

Output:
```text
 50 files changed, 2000 insertions(+), 500 deletions(-)
```

```bash
$ git diff --name-only
```

Output:
```text
src/api/users.ts
src/api/products.ts
... (48 file nữa)
```

**CONTAIN**:
```bash
$ git stash
```

**PARTIAL RECOVERY** (nếu một số change good):
```bash
$ git stash pop
$ git restore src/unrelated/
$ git add src/feature/
$ git commit -m "Partial work from AI session"
```

**NUCLEAR RECOVERY** (nếu mọi thứ bad):
```bash
$ git reset --hard HEAD
```

### Scenario 3: Reset Quá Mạnh, Mất Work

```bash
$ git reflog
```

Output:
```text
abc1234 HEAD@{0}: reset: moving to HEAD
def5678 HEAD@{1}: commit: My work before disaster
ghi9012 HEAD@{2}: commit: Earlier work
```

Recover:
```bash
$ git reset --hard def5678
```

Work đã về.

---

## 4. PRACTICE — Tự Thực Hành

### Bài 1: Emergency Drill

**Goal**: Practice full emergency playbook trong safe environment.

**Instructions**:
1. Tạo test repository với vài file
2. Tạo intentional "bad" change (delete file, modify nhiều)
3. Practice: STOP → ASSESS → CONTAIN → RECOVER
4. Time yourself. Target: full recovery trong <2 phút.

<details>
<summary>💡 Hint</summary>

Setup:
```bash
mkdir emergency-drill && cd emergency-drill
git init
echo "important" > config.txt
echo "SECRET=abc123" > .env
git add . && git commit -m "Initial"

# Simulate disaster
rm .env
echo "broken" >> config.txt
```

Giờ practice recovery.
</details>

### Bài 2: Recovery Command Muscle Memory

**Goal**: Make recovery command automatic.

Practice đến khi type không cần nghĩ:
```bash
git status          # Changed gì?
git diff            # Exactly gì?
git stash           # Save state
git restore .       # Discard all
git restore <file>  # Discard one
git reset --hard HEAD  # Nuclear
git reflog          # Find lost commit
```

### Bài 3: Post-Mortem Practice

**Goal**: Build documentation habit.

**Instructions**:
1. Simulate emergency (Bài 1)
2. Sau recovery, viết brief post-mortem:
   - Xảy ra gì?
   - Tại sao xảy ra?
   - Prevent thế nào lần sau?
3. Draft một prevention **enforced**, không phải wish trong CLAUDE.md

<details>
<summary>✅ Solution</summary>

Example post-mortem:

**Xảy ra gì**: Claude delete `.env` khi "clean up config".

**Tại sao**: Vague prompt ("clean up") + approve không review.

**Prevention thật sự enforced** — một dòng CLAUDE.md "NEVER delete .env" chỉ advisory; Claude vẫn
có thể miss nó dưới vague prompt. Hai cơ chế không thể bị skip:

`.claude/settings.json`:
```json
{ "permissions": { "deny": ["Bash(rm *.env)", "Bash(rm config/*.json)"] } }
```

Hoặc `PreToolUse` hook block thẳng path cụ thể (Module 11.3):
```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Deletion of .env/config files requires human action, not Claude."
  }
}
```

Cả hai work "kể cả ở `bypassPermissions` mode" — hook deny override được cả Full Auto.
</details>

---

## 5. CHEAT SHEET

### Emergency Playbook

1. 🛑 **STOP**: Nhấn `Esc`
2. 🔍 **ASSESS**: `git status` + `git diff`, `Esc Esc`/`/rewind` để xem checkpoint
3. 📦 **CONTAIN**: `git stash` (Bash change); `/rewind` → Restore code (chỉ Edit/Write change)
4. 🔧 **RECOVER**: Xem command bên dưới
5. 📝 **DOCUMENT**: `permissions.deny` hoặc `PreToolUse` hook — enforced, không phải note CLAUDE.md

### Recovery Command

```bash
# Xem damage
git status && git diff --stat

# Save mess trước recover
git stash

# Undo one file
git restore path/to/file

# Undo everything
git restore .

# Nuclear reset
git reset --hard HEAD

# Recover từ bad reset
git reflog
git reset --hard <commit-hash>
```

`/rewind` (hoặc `Esc Esc`) → "Restore code" undo change của tool Edit/Write trong session hiện tại.
Không undo được thứ làm qua Bash — với thứ đó, git là recovery path duy nhất.

### Prevention Checklist

- [ ] Commit trước AI session
- [ ] Dùng feature branch
- [ ] Never Full Auto không có git branch
- [ ] Backup .env file riêng
- [ ] Deny lệnh nguy hiểm bằng `permissions.deny` hoặc `PreToolUse` hook — không chỉ note CLAUDE.md
- [ ] Deny command nguy hiểm bằng `permissions.deny` hoặc `PreToolUse` hook — không chỉ note CLAUDE.md

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Đúng Cách |
|-----------|-------------|
| Panic chạy command random | Follow playbook: STOP → ASSESS → CONTAIN → RECOVER |
| `git reset --hard` là first response | Assess trước. Đôi khi partial recovery tốt hơn. |
| Quên `git stash` trước recovery | Always stash. Có thể cần inspect bad state sau. |
| Không biết reflog tồn tại | `git reflog` recover được gần như mọi thứ. Learn it. |
| Same emergency hai lần | Note CLAUDE.md chỉ advisory, dễ bị miss; thêm `permissions.deny` hoặc hook cho action nguy hiểm cụ thể |
| Không commit trước AI session | Clean commit = clean recovery point. Non-negotiable. |
| Chỉ giữ .env trong working directory | Backup sensitive file riêng ngoài git |

---

## 7. REAL CASE — Câu Chuyện Thực Tế

**Scenario**: Startup Việt Nam, Friday 6pm. Dev rush finish feature, dùng Full Auto "clean up and refactor." Đi lấy coffee. Quay lại thấy Claude đã delete 3 migration file nó consider "outdated" và modified database schema.

**Panic response (sai)**:
- Cố recreate migration file từ memory
- Chạy migration trên staging — broke everything
- Mất 4 giờ cố recover database

**Nên làm**:
1. STOP: Nhấn `Esc` (hoặc đừng approve deletion)
2. ASSESS: `git diff --stat` sẽ show migration deletion
3. CONTAIN: `git stash`
4. RECOVER: `git restore db/migrations/`
5. DOCUMENT: `permissions.deny: ["Bash(rm db/migrations/*)"]` — enforced, không phải note CLAUDE.md

**Lesson learned**: "2 phút emergency procedure tiết kiệm 4 giờ panic. Giờ emergency command được in ra dán lên monitor."

---

> **Phase 8 Hoàn Thành!** Bạn đã có thể debug Claude — detect hallucination, break loop, fix context confusion, assess quality, recover từ emergency.
>
> **Phase Tiếp Theo**: [Phase 9: Legacy Code & Brownfield](../../phase-09-legacy-brownfield/01-archeology-mode/) — Apply Claude Code vào codebase có sẵn.
