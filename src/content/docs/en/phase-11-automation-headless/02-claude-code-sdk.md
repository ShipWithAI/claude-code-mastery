---
title: 'SDK Integration'
description: 'Integrate Claude Code into Node.js and Python applications via SDK or subprocess for programmatic use.'
---

# Module 11.2: SDK Integration

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Module 11.1 (Headless Mode)
>
> **Outcome**: After this module, you will understand how to integrate Claude Code into Node.js/Python applications, whether via SDK or subprocess, and know when to use each approach.

---

## 1. WHY — Why This Matters

You've built a Node.js tool that needs to generate code. Using `child_process.exec('claude -p ...')` works but feels hacky. Parsing stdout is fragile. Error handling is messy. What if Claude Code outputs something unexpected? Your script breaks.

You want to call Claude Code like a proper library — clean imports, typed responses, proper error handling. SDK integration gives you programmatic control: structured output, streaming support, and predictable behavior. It's the difference between shelling out to a command and using a first-class API.

Until an official SDK exists, subprocess integration is your best tool. This module shows you how to do it right.

---

## 2. CONCEPT — Core Ideas

When integrating Claude Code into applications, you have two approaches:

### Integration Approaches

| Aspect | CLI (subprocess) | SDK (Future) |
|--------|------------------|--------------|
| Invocation | `child_process.exec()` | `import { claudeCode }` |
| Output | String (parse manually) | Structured object |
| Errors | Exit codes + stderr | Proper exceptions |
| Streaming | Complex (spawn + events) | Native support |
| Dependencies | Just Claude CLI installed | SDK package required |
| Flexibility | High (any language) | Language-specific |
| Availability | **Available today** | ⚠️ Not yet released |

### Subprocess Pattern (Works Today)

**Node.js**:
```javascript
import { execSync } from 'child_process';

function claudeCode(prompt, options = {}) {
  const { cwd = process.cwd(), timeout = 300000 } = options;

  return execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
    encoding: 'utf-8',
    cwd,
    timeout,
    maxBuffer: 10 * 1024 * 1024, // 10MB
  });
}
```

**Python**:
```python
import subprocess

def claude_code(prompt, cwd=None, timeout=300):
    result = subprocess.run(
        ['claude', '-p', prompt],
        cwd=cwd,
        capture_output=True,
        text=True,
        timeout=timeout
    )
    if result.returncode != 0:
        raise RuntimeError(f"Claude failed: {result.stderr}")
    return result.stdout
```

### Future SDK Pattern (Conceptual)

⚠️ **Verify SDK availability** — this is illustrative only:

```javascript
import { ClaudeCode } from '@anthropic-ai/claude-code';

const claude = new ClaudeCode({ apiKey: process.env.ANTHROPIC_API_KEY });

const result = await claude.execute({
  prompt: "Generate a React component",
  workingDirectory: "./src",
  model: "claude-opus-4",
});

console.log(result.output);
```

### When to Use Which

| Scenario | Best Approach |
|----------|---------------|
| Production automation today | **Subprocess** |
| Quick scripts, glue code | **Subprocess** |
| Need streaming output | **Subprocess with spawn** |
| Language without SDK | **Subprocess** |
| Official SDK available | **SDK** |
| Complex error handling | **SDK** (when available) |

### CLI vs SDK: Detailed Comparison

When should you use the CLI directly vs building an SDK wrapper? This decision matrix helps:

| Dimension | CLI (`claude -p`) | SDK (subprocess wrapper) | SDK (official) |
|-----------|-------------------|-------------------------|----------------|
| **Setup time** | Zero — already installed | 30 min — write wrapper code | 5 min — `npm install` |
| **Error handling** | Exit codes only | Custom try/catch | Built-in exceptions |
| **Output format** | Raw text to stdout | Parse stdout yourself | Structured objects |
| **Streaming** | Pipe to file | `spawn` + event listeners | Native callbacks |
| **Type safety** | None | Manual type definitions | Full TypeScript types |
| **Concurrency** | `&` backgrounding | `Promise.all` / workers | Async/await native |
| **Best for** | Quick scripts, CI/CD | Production tools today | Production tools (when stable) |
| **Maintenance** | Low — just bash | Medium — wrapper code | Low — library updates |

### Decision Flowchart

```text
Is this a quick one-off script or CI/CD job?
  YES → CLI (`claude -p` in bash)
  NO → Do you need structured output or error handling?
    NO → CLI is still fine
    YES → Do you need streaming or real-time progress?
      NO → subprocess wrapper with execSync
      YES → subprocess wrapper with spawn + event listeners
```

### Practical Recommendation

For most teams today: **start with CLI** for scripts and CI/CD pipelines, **build a subprocess wrapper** when you need integration into Node.js or Python applications, and **plan to migrate to the official SDK** when it reaches stable release. The subprocess wrapper you build today serves as a specification for what you'll need from the SDK — making migration straightforward.

---

## 3. DEMO — Step by Step

**Scenario**: Build a Node.js tool that auto-generates unit tests for JavaScript files.

### Step 1: Create Subprocess Wrapper

Create `claude-wrapper.js`:

```javascript
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

export function claudeCode(prompt, options = {}) {
  const {
    cwd = process.cwd(),
    timeout = 300000, // 5 minutes
    maxBuffer = 10 * 1024 * 1024, // 10MB
  } = options;

  try {
    // Escape quotes in prompt
    const escapedPrompt = prompt.replace(/"/g, '\\"');

    const output = execSync(`claude -p "${escapedPrompt}"`, {
      encoding: 'utf-8',
      cwd,
      timeout,
      maxBuffer,
      stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
    });

    return { success: true, output: output.trim() };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stderr: error.stderr?.toString() || '',
      exitCode: error.status || -1,
    };
  }
}
```

**Why this matters**: Proper error handling, configurable timeouts, and escaped input prevent common subprocess failures.

### Step 2: Build Test Generator

Create `generate-tests.js`:

```javascript
import { claudeCode } from './claude-wrapper.js';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, basename } from 'path';

function generateTests(filePath) {
  // Read source file
  const sourceCode = readFileSync(filePath, 'utf-8');

  // Craft prompt
  const prompt = `
Generate Jest unit tests for this file.
Create tests in __tests__ directory.
Cover all exported functions.

Source file: ${basename(filePath)}

\`\`\`javascript
${sourceCode}
\`\`\`

Output only the test file content, no explanation.
`.trim();

  console.log(`Generating tests for ${filePath}...`);

  const result = claudeCode(prompt, {
    cwd: dirname(filePath),
    timeout: 120000, // 2 minutes
  });

  if (!result.success) {
    console.error(`Failed: ${result.error}`);
    console.error(result.stderr);
    process.exit(1);
  }

  // Write test file
  const testPath = filePath.replace(/\.js$/, '.test.js');
  writeFileSync(testPath, result.output);

  console.log(`✅ Tests written to ${testPath}`);
}

// Run
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node generate-tests.js <file.js>');
  process.exit(1);
}

generateTests(filePath);
```

### Step 3: Run the Generator

```bash
node generate-tests.js src/utils.js
```

Expected output:
```
Generating tests for src/utils.js...
✅ Tests written to src/utils.test.js
```

**What happened**: Claude Code read the source file, generated tests, and output was captured and written to a test file.

### Step 4: Python Subprocess Example

Create `generate_tests.py`:

```python
import subprocess
import sys
from pathlib import Path

def claude_code(prompt, cwd=None, timeout=300):
    """Execute Claude Code via subprocess."""
    try:
        result = subprocess.run(
            ['claude', '-p', prompt],
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        if result.returncode != 0:
            raise RuntimeError(f"Claude failed: {result.stderr}")

        return result.stdout.strip()

    except subprocess.TimeoutExpired:
        raise RuntimeError(f"Claude timed out after {timeout}s")

def generate_tests(file_path):
    """Generate tests for a Python file."""
    path = Path(file_path)
    source_code = path.read_text()

    prompt = f"""
Generate pytest unit tests for this file.
Cover all functions and classes.

Source file: {path.name}

```python
{source_code}
```

Output only the test file content.
""".strip()

    print(f"Generating tests for {file_path}...")

    output = claude_code(prompt, cwd=str(path.parent), timeout=120)

    test_path = path.parent / f"test_{path.name}"
    test_path.write_text(output)

    print(f"✅ Tests written to {test_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_tests.py <file.py>")
        sys.exit(1)

    generate_tests(sys.argv[1])
```

Run:
```bash
python generate_tests.py src/calculator.py
```

Expected output:
```
Generating tests for src/calculator.py...
✅ Tests written to src/test_calculator.py
```

### Step 5: Async Subprocess with Streaming

For long-running tasks, use `spawn` instead of `execSync`:

```javascript
import { spawn } from 'child_process';

export function claudeCodeStreaming(prompt, onData, options = {}) {
  return new Promise((resolve, reject) => {
    const { cwd = process.cwd() } = options;

    const child = spawn('claude', ['-p', prompt], {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (chunk) => {
      const text = chunk.toString();
      output += text;
      if (onData) onData(text); // Stream to caller
    });

    child.stderr.on('data', (chunk) => {
      errorOutput += chunk.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        reject(new Error(`Exit ${code}: ${errorOutput}`));
      }
    });

    child.on('error', reject);
  });
}

// Usage
await claudeCodeStreaming(
  "Refactor this large file...",
  (chunk) => process.stdout.write(chunk) // Stream to console
);
```

**Why streaming matters**: Large refactoring tasks can take minutes. Streaming lets you show progress instead of blocking.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Robust Subprocess Wrapper

**Goal**: Build a production-ready Claude Code wrapper with retry logic.

**Instructions**:
1. Create `claude-sdk.js` with retry on failure (max 3 attempts)
2. Add exponential backoff (1s, 2s, 4s)
3. Log each attempt to console
4. Return structured result: `{ success, output, attempts }`

**Expected result**:
```javascript
const result = await claudeCode("Fix syntax errors", { retries: 3 });
console.log(`Success after ${result.attempts} attempts`);
```

<details>
<summary>💡 Hint</summary>

Use a loop with `try/catch`. On failure, wait `2^attempt * 1000` ms before retry.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
import { execSync } from 'child_process';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function claudeCode(prompt, options = {}) {
  const { retries = 3, cwd = process.cwd() } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${retries}...`);

      const output = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
        encoding: 'utf-8',
        cwd,
        timeout: 300000,
        maxBuffer: 10 * 1024 * 1024,
      });

      return { success: true, output: output.trim(), attempts: attempt };

    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);

      if (attempt < retries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        return {
          success: false,
          error: error.message,
          attempts: attempt,
        };
      }
    }
  }
}
```

</details>

### Exercise 2: Batch File Processor

**Goal**: Process multiple files in parallel with concurrency limit.

**Instructions**:
1. Create `batch-refactor.js`
2. Accept array of file paths
3. Run max 3 Claude processes concurrently
4. Collect results and report successes/failures

**Expected result**:
```bash
node batch-refactor.js src/*.js
```
Output:
```
Processing 12 files (3 concurrent)...
✅ src/a.js
✅ src/b.js
❌ src/c.js (timeout)
...
Summary: 10 succeeded, 2 failed
```

<details>
<summary>💡 Hint</summary>

Use `Promise.all()` with chunks of files. Process in batches of 3.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
import { claudeCode } from './claude-wrapper.js';
import { readFileSync } from 'fs';

async function processFile(filePath) {
  try {
    const code = readFileSync(filePath, 'utf-8');
    const result = claudeCode(`Add JSDoc comments to this code:\n\n${code}`, {
      timeout: 120000,
    });

    if (result.success) {
      console.log(`✅ ${filePath}`);
      return { file: filePath, success: true };
    } else {
      console.log(`❌ ${filePath} (${result.error})`);
      return { file: filePath, success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ ${filePath} (${error.message})`);
    return { file: filePath, success: false, error: error.message };
  }
}

async function batchProcess(files, concurrency = 3) {
  console.log(`Processing ${files.length} files (${concurrency} concurrent)...`);

  const results = [];

  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(processFile));
    results.push(...batchResults);
  }

  const succeeded = results.filter(r => r.success).length;
  const failed = results.length - succeeded;

  console.log(`\nSummary: ${succeeded} succeeded, ${failed} failed`);

  return results;
}

// Usage
const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node batch-refactor.js <files...>');
  process.exit(1);
}

await batchProcess(files);
```

</details>

### Exercise 3: Live Progress Indicator

**Goal**: Show live progress during long-running Claude tasks.

**Instructions**:
1. Use `spawn` for streaming
2. Display animated spinner while running
3. Show partial output as it arrives
4. Clear spinner when done

**Expected result**: Animated "⠋ Generating..." that updates in real-time.

<details>
<summary>💡 Hint</summary>

Use `process.stdout.write('\r...')` to overwrite current line. Store spinner frames in array.

</details>

<details>
<summary>✅ Solution</summary>

```javascript
import { spawn } from 'child_process';

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function claudeCodeWithProgress(prompt, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['-p', prompt], {
      cwd: options.cwd || process.cwd(),
    });

    let output = '';
    let frameIndex = 0;

    const spinnerInterval = setInterval(() => {
      const frame = spinnerFrames[frameIndex % spinnerFrames.length];
      process.stdout.write(`\r${frame} Generating...`);
      frameIndex++;
    }, 80);

    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });

    child.on('close', (code) => {
      clearInterval(spinnerInterval);
      process.stdout.write('\r'); // Clear spinner line

      if (code === 0) {
        console.log('✅ Done!');
        resolve(output);
      } else {
        console.log('❌ Failed');
        reject(new Error(`Exit code ${code}`));
      }
    });
  });
}

// Usage
const result = await claudeCodeWithProgress("Refactor this large file...");
console.log(result);
```

</details>

---

## 5. CHEAT SHEET

### Node.js Subprocess

| Code | Description |
|------|-------------|
| `execSync('claude -p "..."')` | Blocking execution, returns string |
| `spawn('claude', ['-p', prompt])` | Non-blocking, supports streaming |
| `{ timeout: 300000 }` | 5-minute timeout |
| `{ maxBuffer: 10 * 1024 * 1024 }` | 10MB output buffer |
| `{ cwd: './project' }` | Set working directory |
| `error.status` | Exit code from failed command |

### Python Subprocess

| Code | Description |
|------|-------------|
| `subprocess.run(['claude', '-p', prompt])` | Blocking execution |
| `capture_output=True` | Capture stdout/stderr |
| `text=True` | Return strings (not bytes) |
| `timeout=300` | 5-minute timeout |
| `result.returncode` | Exit code (0 = success) |
| `result.stdout` | Command output |

### Error Handling

| Pattern | When to Use |
|---------|-------------|
| `try/catch` with retry | Network/API failures |
| Exit code check | Verify success |
| Timeout handling | Long-running tasks |
| maxBuffer increase | Large output expected |

### When to Use Which

| Approach | Best For |
|----------|----------|
| `execSync` | Quick scripts, simple output |
| `spawn` | Streaming, long tasks, live progress |
| Retry logic | Unstable environments |
| Batch processing | Multiple files |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|-------------------|
| Assuming SDK exists | Check Anthropic docs. Use subprocess until SDK is released. |
| Not escaping quotes in prompt | Use `.replace(/"/g, '\\"')` or pass as array args to `spawn`. |
| Ignoring exit codes | Always check `error.status` or `result.returncode` — non-zero means failure. |
| Blocking on long operations | Use `spawn` instead of `execSync` for tasks over 30 seconds. |
| Default small buffer (200KB) | Set `maxBuffer: 10 * 1024 * 1024` to handle large output. |
| Hardcoding paths | Use `process.cwd()` or accept as parameter. Makes code reusable. |
| No timeout handling | Always set timeout (default: no limit!). Claude can hang on bad input. |
| Forgetting to handle SIGINT | Catch process signals and kill child processes: `child.kill('SIGTERM')`. |

---

## 7. REAL CASE — Production Story

**Scenario**: A Vietnamese development agency (40 engineers) builds an internal code review tool that flags common bugs before human review.

**Problem**: Reviewing 200+ PRs/week. Junior devs made repetitive mistakes (missing error handling, hardcoded values, inconsistent naming). Manual review took 2-3 hours per PR.

**Solution**: Built `code-critic` — a Node.js CLI that runs Claude Code on each changed file before PR submission.

```javascript
// code-critic.js (simplified)
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

function reviewFile(filePath) {
  const code = readFileSync(filePath, 'utf-8');

  const prompt = `
Review this code for common issues:
- Missing error handling
- Hardcoded credentials
- Inconsistent naming
- Missing JSDoc

Code:
\`\`\`javascript
${code}
\`\`\`

Output: JSON array of issues with {line, severity, message}
`.trim();

  try {
    const output = execSync(`claude -p "${prompt.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout: 60000,
      maxBuffer: 5 * 1024 * 1024,
    });

    return JSON.parse(output);
  } catch (error) {
    console.error(`Review failed for ${filePath}: ${error.message}`);
    return [];
  }
}
```

They integrated it into pre-commit hooks. Claude Code runs on staged files, outputs issues as JSON, and blocks commit if severity is "high".

**Result**:
- **60% reduction** in review time (from 2-3 hours to 45 minutes per PR)
- **Zero** hardcoded credentials merged to main (was 1-2/month before)
- **Faster onboarding** — juniors learn patterns from automated feedback

**Team lead quote**: *"We didn't wait for a perfect SDK. Subprocess got us 90% there. The key was proper error handling and making it idempotent — we can re-run reviews without side effects."*

**Technical notes**: They later added Redis caching (hash of file → review result) to avoid re-reviewing unchanged files. Cut review time by another 30%.

---

> **Next**: [Module 11.3: Hooks System](../03-hooks-system/) →
