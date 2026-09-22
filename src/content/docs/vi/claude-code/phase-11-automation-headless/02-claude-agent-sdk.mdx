---
title: 'Tích hợp SDK'
description: 'Tích hợp Claude Code SDK vào ứng dụng: TypeScript/Python API, streaming và programmatic access.'
---

# Module 11.2: Tích hợp SDK

> **Thời gian học**: ~35 phút
>
> **Yêu cầu trước**: Module 11.1 (Headless Mode)
>
> **Kết quả**: Sau module này, bạn sẽ integrate được Claude Code vào Node.js/Python app, hiểu SDK vs subprocess, và biết khi nào dùng approach nào.

---

## 1. WHY — Tại sao quan trọng

Bạn build Node.js tool cần generate code. Dùng `child_process.exec('claude -p ...')` works nhưng hacky. Parse stdout rất fragile. Error handling messy. Bạn muốn gọi Claude như proper library — clean API, structured output, error handling chuẩn.

**Ví von**: CLI subprocess như gọi taxi bằng điện thoại — works nhưng clunky. SDK như app Grab — smooth, structured, real-time tracking.

---

## 2. CONCEPT — Ý tưởng cốt lõi

### CLI vs SDK: So sánh

| Aspect | CLI (subprocess) | SDK |
|--------|-----------------|-----|
| Invocation | `exec('claude ...')` | `import { claude }` |
| Output | Parse string từ stdout | Structured object |
| Errors | Check exit code | Exception/Promise reject |
| Streaming | Pipe phức tạp | Native callback |
| Type safety | Không có | TypeScript support |

### Subprocess Pattern — Node.js

```javascript
const { execSync } = require('child_process');

function callClaude(prompt, options = {}) {
  const escapedPrompt = prompt.replace(/"/g, '\\"');
  const cmd = `claude -p "${escapedPrompt}"`;

  const result = execSync(cmd, {
    encoding: 'utf8',
    timeout: options.timeout || 30000,
    maxBuffer: 10 * 1024 * 1024
  });

  return result.trim();
}
```

### Subprocess Pattern — Python

```python
import subprocess

def call_claude(prompt, timeout=30):
    result = subprocess.run(
        ['claude', '-p', prompt],
        capture_output=True,
        text=True,
        timeout=timeout
    )

    if result.returncode != 0:
        raise Exception(f"Claude failed: {result.stderr}")

    return result.stdout.strip()
```

### Khi nào dùng gì?

- **Subprocess**: Quick script, fallback khi SDK chưa có
- **SDK** (khi có): Production app, complex workflow, cần streaming
- **Hiện tại**: Claude Code chưa có official SDK → subprocess là cách chính

### CLI vs SDK: So Sánh Chi Tiết

Khi nào nên dùng CLI trực tiếp vs xây dựng SDK wrapper? Ma trận quyết định này giúp bạn chọn:

| Khía Cạnh | CLI (`claude -p`) | SDK (subprocess wrapper) | SDK (chính thức) |
|-----------|-------------------|-------------------------|------------------|
| **Thời gian setup** | Zero — đã cài sẵn | 30 phút — viết wrapper code | 5 phút — `npm install` |
| **Xử lý lỗi** | Chỉ exit codes | Custom try/catch | Exceptions tích hợp |
| **Định dạng output** | Text thô ra stdout | Tự parse stdout | Structured objects |
| **Streaming** | Pipe ra file | `spawn` + event listeners | Native callbacks |
| **Type safety** | Không có | Định nghĩa types thủ công | Full TypeScript types |
| **Concurrency** | `&` chạy nền | `Promise.all` / workers | Async/await native |
| **Phù hợp nhất** | Script nhanh, CI/CD | Production tools hiện tại | Production tools (khi stable) |
| **Bảo trì** | Thấp — chỉ bash | Trung bình — wrapper code | Thấp — cập nhật library |

### Sơ Đồ Quyết Định

```text
Đây là script nhanh hoặc CI/CD job?
  CÓ → CLI (`claude -p` trong bash)
  KHÔNG → Bạn cần structured output hoặc xử lý lỗi?
    KHÔNG → CLI vẫn ổn
    CÓ → Bạn cần streaming hoặc tiến trình real-time?
      KHÔNG → subprocess wrapper với execSync
      CÓ → subprocess wrapper với spawn + event listeners
```

### Khuyến Nghị Thực Tế

Với hầu hết team hiện tại: **bắt đầu với CLI** cho scripts và CI/CD pipelines, **xây subprocess wrapper** khi cần tích hợp vào ứng dụng Node.js hoặc Python, và **lên kế hoạch chuyển sang SDK chính thức** khi nó đạt bản stable. Subprocess wrapper bạn xây hôm nay đóng vai trò như bản đặc tả cho những gì bạn cần từ SDK — giúp việc chuyển đổi trở nên đơn giản.

---

## 3. DEMO — Từng bước

**Scenario**: Node.js tool generate unit test từ source file.

### Step 1: Create subprocess wrapper

```javascript
// lib/claude-wrapper.js
const { execSync } = require('child_process');

class ClaudeWrapper {
  constructor(options = {}) {
    this.timeout = options.timeout || 60000;
    this.maxRetries = options.maxRetries || 2;
  }

  executeSync(prompt) {
    const escapedPrompt = prompt.replace(/"/g, '\\"');

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = execSync(`claude -p "${escapedPrompt}"`, {
          encoding: 'utf8',
          timeout: this.timeout,
          maxBuffer: 10 * 1024 * 1024
        });

        return { success: true, output: result.trim() };
      } catch (error) {
        if (attempt >= this.maxRetries - 1) {
          return { success: false, error: error.message };
        }
      }
    }
  }
}

module.exports = ClaudeWrapper;
```

### Step 2: Create test generator script

```javascript
// generate-tests.js
const fs = require('fs');
const ClaudeWrapper = require('./lib/claude-wrapper');

const claude = new ClaudeWrapper({ timeout: 90000 });

function generateTests(sourceFile) {
  const code = fs.readFileSync(sourceFile, 'utf8');
  const prompt = `Generate Jest unit tests for:\n\n${code}\n\nReturn ONLY test code.`;

  const result = claude.executeSync(prompt);

  if (!result.success) {
    console.error('Error:', result.error);
    process.exit(1);
  }

  const testFile = sourceFile.replace(/\.js$/, '.test.js');
  fs.writeFileSync(testFile, result.output);
  console.log(`✅ Generated: ${testFile}`);
}

generateTests(process.argv[2]);
```

Expected output:
```text
$ node generate-tests.js src/calculator.js
✅ Generated: src/calculator.test.js
```

### Step 3: Python equivalent

```python
# generate_tests.py
import subprocess
import sys

def call_claude(prompt, timeout=60):
    result = subprocess.run(
        ['claude', '-p', prompt],
        capture_output=True,
        text=True,
        timeout=timeout
    )
    if result.returncode != 0:
        raise Exception(result.stderr)
    return result.stdout.strip()

def generate_tests(source_file):
    with open(source_file, 'r') as f:
        code = f.read()

    prompt = f"Generate pytest tests for:\n\n{code}"
    tests = call_claude(prompt, timeout=90)

    test_file = source_file.replace('.py', '_test.py')
    with open(test_file, 'w') as f:
        f.write(tests)

    print(f"✅ Generated: {test_file}")

if __name__ == '__main__':
    generate_tests(sys.argv[1])
```

Expected output:
```text
$ python generate_tests.py src/calculator.py
✅ Generated: src/calculator_test.py
```

---

## 4. PRACTICE — Thực hành

### Exercise 1: Subprocess Wrapper với retry

**Goal**: Build wrapper với exponential backoff retry.

**Instructions**:
1. Create `ClaudeClient` class với `execute(prompt)` method
2. Retry 3 lần với delay: 2s, 4s, 8s
3. Return structured error type

<details>
<summary>💡 Hint</summary>

Exponential backoff: `Math.pow(2, attempt) * 1000`. Sleep with `execSync('sleep N')`.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
class ClaudeClient {
  execute(prompt, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
          encoding: 'utf8',
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024
        });
        return { type: 'success', output: result.trim() };
      } catch (error) {
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt + 1);
          execSync(`sleep ${delay}`);
        } else {
          return { type: error.killed ? 'timeout' : 'error', error: error.message };
        }
      }
    }
  }
}
```

</details>

### Exercise 2: Batch Processor

**Goal**: Process nhiều files, continue khi 1 file fail.

**Instructions**:
1. Accept array file paths
2. Process với max 3 concurrent
3. Return summary: successes, failures

<details>
<summary>💡 Hint</summary>

Dùng `Promise.allSettled()` để không fail toàn bộ khi 1 task fail.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
async function batchProcess(files) {
  const results = await Promise.allSettled(
    files.map(f => generateTests(f))
  );

  const successes = results.filter(r => r.status === 'fulfilled').length;
  const failures = results.filter(r => r.status === 'rejected').length;

  console.log(`✅ ${successes} succeeded, ❌ ${failures} failed`);
  return { successes, failures };
}
```

</details>

---

## 5. CHEAT SHEET

### Node.js Subprocess

| Method | Use Case | Blocking? |
|--------|----------|-----------|
| `execSync()` | Quick script | Yes |
| `exec()` | Async callback | No |
| `spawn()` | Streaming, large output | No |

### Python Subprocess

| Method | Use Case | Blocking? |
|--------|----------|-----------|
| `subprocess.run()` | Standard choice | Yes |
| `subprocess.Popen()` | Streaming | No |

### Error Handling

```javascript
// Node.js
try {
  execSync(cmd, { timeout: 30000 });
} catch (err) {
  if (err.killed) console.error('Timeout');
  else console.error('Error:', err.status);
}
```

```python
# Python
try:
    result = subprocess.run([...], timeout=30)
except subprocess.TimeoutExpired:
    print("Timeout!")
```

---

## 6. PITFALLS — Lỗi thường gặp

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Assume SDK exists | Verify docs, subprocess luôn work |
| Không escape quote | `prompt.replace(/"/g, '\\"')` |
| Ignore exit code | Check `returncode !== 0` |
| Block main thread | Dùng `spawn` async |
| Default maxBuffer nhỏ | Set `maxBuffer: 10 * 1024 * 1024` |
| Không timeout | Always set timeout (30-90s) |

---

## 7. REAL CASE — Câu chuyện thực tế

**Scenario**: Agency Việt Nam build code review tool integrate Claude vào CI pipeline.

**Problem**: Không có SDK. Cần reliable integration với GitHub webhook.

**Solution**:
- `ClaudeReviewService` wrap subprocess
- PR webhook trigger review job
- Store result vào PostgreSQL
- Dashboard show issue

**Result**:
- 200+ PR reviewed/month automatic
- Catch 15% more issues
- Dev nhận instant feedback

**Quote**: "Không đợi perfect SDK. Subprocess được 90%. Ship first, optimize later."

---

> **Tiếp theo**: [Module 11.3: Hệ thống Hook](../03-hooks-system/) →
