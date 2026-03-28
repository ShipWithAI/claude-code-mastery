---
title: 'Quy trình khẩn cấp'
description: 'Quy trình xử lý khẩn cấp khi Claude Code gây lỗi nghiêm trọng: rollback, recover và damage control.'
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

1. **STOP**: `Ctrl+C` ngay. Đừng để Claude continue.
2. **ASSESS**: `git status` + `git diff` — actually changed gì?
3. **CONTAIN**: `git stash` — save current state trước khi recover
4. **RECOVER**: Chọn recovery strategy theo severity
5. **DOCUMENT**: Xảy ra gì? Update CLAUDE.md để prevent recurrence.

### Recovery Strategy

| Strategy | Command | Khi Nào |
|----------|---------|---------|
| Discard one file | `git checkout <file>` | 1 file sai |
| Discard all change | `git checkout .` | Mọi thứ từ last commit bad |
| Hard reset | `git reset --hard HEAD` | Complete disaster recovery |
| Recover deleted commit | `git reflog` | Nếu reset quá mạnh |
| Fresh session | `/clear` | Context hopelessly confused |

### Pre-Emergency Preparation

- Commit thường xuyên (small commit = easy recovery point)
- Dùng feature branch (isolate AI work)
- Backup .env và sensitive file ngoài git
- Thuộc recovery command
- Never Full Auto không có git safety net

---

## 3. DEMO — Từng Bước

### Scenario 1: Claude Deleted Important File

**STOP** — Thấy Claude đang delete file? Press `Ctrl+C` ngay.

**ASSESS**:
```bash
$ git status
```

Output:
```
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
```
Saved working directory and index state WIP on main: abc1234 Last commit
```

**RECOVER**:
```bash
$ git checkout .
```

Output:
```
Updated 3 paths from the index
```

Verify recovery:
```bash
$ ls .env config/production.json
```

Output:
```
.env  config/production.json
```

File đã về.

### Scenario 2: Claude Modified 50 File

**STOP**: `Ctrl+C`

**ASSESS**:
```bash
$ git diff --stat
```

Output:
```
 50 files changed, 2000 insertions(+), 500 deletions(-)
```

```bash
$ git diff --name-only
```

Output:
```
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
$ git checkout src/unrelated/
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
```
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
git checkout .      # Discard all
git checkout <file> # Discard one
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
3. Draft CLAUDE.md addition để prevent recurrence

<details>
<summary>✅ Solution</summary>

Example post-mortem:

**Xảy ra gì**: Claude delete .env khi "clean up config"

**Tại sao**: Vague prompt ("clean up") + approve không review

**Prevention**: Add vào CLAUDE.md:
```
## Dangerous Operation
NEVER delete không có explicit approval:
- .env file
- config/*.json
- Migration file
```
</details>

---

## 5. CHEAT SHEET

### Emergency Playbook

1. 🛑 **STOP**: `Ctrl+C`
2. 🔍 **ASSESS**: `git status` + `git diff`
3. 📦 **CONTAIN**: `git stash`
4. 🔧 **RECOVER**: Xem command bên dưới
5. 📝 **DOCUMENT**: Update CLAUDE.md

### Recovery Command

```bash
# Xem damage
git status && git diff --stat

# Save mess trước recover
git stash

# Undo one file
git checkout path/to/file

# Undo everything
git checkout .

# Nuclear reset
git reset --hard HEAD

# Recover từ bad reset
git reflog
git reset --hard <commit-hash>
```

### Prevention Checklist

- [ ] Commit trước AI session
- [ ] Dùng feature branch
- [ ] Never Full Auto không có git branch
- [ ] Backup .env file riêng

---

## 6. PITFALLS — Lỗi Thường Gặp

| ❌ Sai Lầm | ✅ Đúng Cách |
|-----------|-------------|
| Panic chạy command random | Follow playbook: STOP → ASSESS → CONTAIN → RECOVER |
| `git reset --hard` là first response | Assess trước. Đôi khi partial recovery tốt hơn. |
| Quên `git stash` trước recovery | Always stash. Có thể cần inspect bad state sau. |
| Không biết reflog tồn tại | `git reflog` recover được gần như mọi thứ. Learn it. |
| Same emergency hai lần | Document và update CLAUDE.md sau mỗi emergency |
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
1. STOP: `Ctrl+C` (hoặc đừng approve deletion)
2. ASSESS: `git diff --stat` sẽ show migration deletion
3. CONTAIN: `git stash`
4. RECOVER: `git checkout db/migrations/`
5. DOCUMENT: Add vào CLAUDE.md: "NEVER delete migration file không có explicit approval"

**Lesson learned**: "2 phút emergency procedure tiết kiệm 4 giờ panic. Giờ emergency command được in ra dán lên monitor."

---

> **Phase 8 Hoàn Thành!** Bạn đã có thể debug Claude — detect hallucination, break loop, fix context confusion, assess quality, recover từ emergency.
>
> **Phase Tiếp Theo**: [Phase 9: Legacy Code & Brownfield](../../phase-09-legacy-brownfield/01-archeology-mode/) — Apply Claude Code vào codebase có sẵn.
