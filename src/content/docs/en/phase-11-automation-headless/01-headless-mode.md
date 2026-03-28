---
title: 'Headless Mode'
description: 'Run Claude Code in headless mode for scripted automation, batch processing, and CI/CD pipelines.'
---

# Module 11.1: Headless Mode

> **Estimated time**: ~30 minutes
>
> **Prerequisite**: Phase 10 (Team Collaboration)
>
> **Outcome**: After this module, you will understand headless mode fundamentals, know how to script Claude Code, and be ready for advanced automation.

---

## 1. WHY — Why This Matters

You want to run Claude Code as part of a script. Maybe generate tests for all files in a directory. Maybe do code review on every PR automatically. Maybe batch process documentation. But Claude Code is interactive — it waits for your input, shows spinners, expects approval.

Headless mode solves this: Claude executes, outputs result, returns control to your script. No interaction needed. This unlocks automation: cron jobs, CI/CD pipelines, batch processing, and more.

---

## 2. CONCEPT — Core Ideas

### Interactive vs Headless

| Aspect | Interactive | Headless |
|--------|------------|----------|
| Invocation | `claude` | `claude -p "prompt"` |
| Input | Conversation | Single prompt |
| Output | Formatted, spinners | Raw stdout |
| Approval | Required | Skipped or auto |
| Use case | Development | Automation |

### The `-p` Flag

The `-p` (print) flag is the key to headless mode:

```bash
claude -p "Your prompt here"
```

- Executes the prompt
- Outputs result to stdout
- Returns to shell when complete
- Exit code indicates success/failure

### Capturing Output

```bash
# To variable
result=$(claude -p "Explain this function")

# To file
claude -p "Generate README" > README.md

# Pipe to another command
claude -p "List issues in code" | grep "ERROR"
```

### Input Methods

```bash
# Direct prompt
claude -p "Explain recursion"

# With file context
claude -p "Review this code: $(cat file.js)"

# Pipe from stdin
cat file.js | claude -p "Review this code"
```

### Exit Codes

- `0`: Success
- Non-zero: Error (check stderr)
- Use in scripts: `if claude -p "..."; then ... fi`

---

## 3. DEMO — Step by Step

**Scenario**: Automate documentation generation using headless Claude Code.

### Step 1: Basic Headless Execution

```bash
claude -p "What is 2 + 2?"
```

Output:
```text
4
```

Check exit code:
```bash
echo $?
```

Output:
```text
0
```

### Step 2: Capture to Variable

```bash
explanation=$(claude -p "Explain async/await in one paragraph")
echo "$explanation"
```

Output:
```text
Async/await is a JavaScript feature that makes asynchronous code
easier to write and read by allowing you to write asynchronous
operations in a synchronous-looking style...
```

### Step 3: Generate File from Output

```bash
claude -p "Generate a README.md for a TypeScript utility library" > README.md
head -5 README.md
```

Output:
```text
# TypeScript Utility Library

A collection of useful TypeScript utilities for common tasks.

## Installation
```

### Step 4: Process Multiple Files

```bash
#!/bin/bash
# generate-docs.sh

for file in src/*.ts; do
  echo "Documenting $file..."
  doc=$(claude -p "Generate JSDoc comments for: $(cat "$file")")
  echo "$doc" > "docs/$(basename "$file" .ts).md"
done

echo "Documentation complete!"
```

Run the script:
```bash
chmod +x generate-docs.sh
./generate-docs.sh
```

Output:
```text
Documenting src/utils.ts...
Documenting src/helpers.ts...
Documenting src/api.ts...
Documentation complete!
```

### Step 5: Conditional Logic Based on Output

```bash
#!/bin/bash
# check-security.sh

result=$(claude -p "Review this code for security issues.
Output 'SAFE' if no issues, or 'UNSAFE: [reason]' if issues found.
Code: $(cat "$1")")

if [[ "$result" == SAFE* ]]; then
  echo "✅ $1 passed security check"
  exit 0
else
  echo "❌ $1 failed: $result"
  exit 1
fi
```

### Step 6: Error Handling

```bash
if ! output=$(claude -p "Generate tests for $(cat file.js)" 2>&1); then
  echo "Error: $output"
  exit 1
fi
echo "$output" > tests.js
```

### Step 7: JSON Output for Structured Processing

```bash
# Get structured JSON output
result=$(claude -p --output-format json "List the 3 main source files")
echo "$result" | jq '.result'

# Stream JSON for real-time processing
claude -p --output-format stream-json "Fix all lint errors" | \
  while read -r line; do
    type=$(echo "$line" | jq -r '.type')
    echo "Event: $type"
  done
```

### Step 8: Limit Turns and Budget

```bash
# Limit to 3 agentic turns (prevents runaway automation)
claude -p --max-turns 3 "Fix the failing test in auth.test.ts"

# Set a $2 spending cap
claude -p --max-budget-usd 2 "Refactor the utils module"

# Restrict to read-only tools
claude -p --allowedTools "Read" "Bash(git log *)" "Bash(git diff *)" \
  "Review this codebase for security issues"
```

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: First Headless Command

**Goal**: Execute your first headless Claude command.

**Instructions**:
1. Run: `claude -p "Say hello"`
2. Capture to variable: `greeting=$(claude -p "Say hello")`
3. Echo the variable: `echo "$greeting"`
4. Check exit code: `echo $?`

<details>
<summary>💡 Hint</summary>

The output should be a simple greeting. Exit code 0 means success.
</details>

### Exercise 2: File Generation

**Goal**: Generate code to a file.

**Instructions**:
1. Generate a function: `claude -p "Write a JavaScript function to capitalize strings" > capitalize.js`
2. Verify: `cat capitalize.js`
3. Run: `node -e "$(cat capitalize.js); console.log(capitalize('hello'))"`

<details>
<summary>✅ Solution</summary>

```bash
claude -p "Write a JavaScript function called capitalize that takes a string and returns it with the first letter capitalized" > capitalize.js
cat capitalize.js
node -e "$(cat capitalize.js); console.log(capitalize('hello'))"
# Output: Hello
```
</details>

### Exercise 3: Batch Processing Script

**Goal**: Process multiple files with a script.

**Instructions**:
1. Create 3 small code files in a test directory
2. Write a bash script that loops through files
3. For each file, generate a one-line description
4. Output all descriptions to summary.txt

<details>
<summary>✅ Solution</summary>

```bash
# Create test files
mkdir -p test-batch
echo "function add(a, b) { return a + b; }" > test-batch/math.js
echo "const API_URL = 'https://api.example.com';" > test-batch/config.js
echo "class User { constructor(name) { this.name = name; } }" > test-batch/user.js

# Batch processing script (save as batch-describe.sh)
#!/bin/bash
for file in test-batch/*.js; do
  name=$(basename "$file")
  desc=$(claude -p "Describe in one line: $(cat "$file")")
  echo "$name: $desc" >> test-batch/summary.txt
done

# Run and verify
chmod +x batch-describe.sh
./batch-describe.sh
cat test-batch/summary.txt
```
</details>

---

## 5. CHEAT SHEET

### Basic Headless

```bash
claude -p "prompt"                    # Execute and output
result=$(claude -p "prompt")          # Capture to variable
claude -p "prompt" > file.txt         # Output to file
claude -p "prompt" | grep "pattern"   # Pipe to command
```

### With File Input

```bash
claude -p "Review: $(cat file.js)"    # Inline file content
```

### In Scripts

```bash
# Error handling
if ! result=$(claude -p "..."); then
  echo "Failed"
  exit 1
fi

# Loop processing
for f in *.js; do
  claude -p "Document: $(cat "$f")" > "${f%.js}.md"
done
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| Non-zero | Error |

### Key Flags

#### Core Flags

| Flag | Purpose | Example |
|------|---------|---------|
| `-p "prompt"` | Headless execution (required) | `claude -p "explain this"` |
| `--output-format json` | JSON structured output | `claude -p --output-format json "list files"` |
| `--output-format stream-json` | Streaming JSON events | For real-time processing pipelines |
| `--verbose` | Show full tool usage details | `claude -p --verbose "fix lint"` |
| `--help` | Show all available options | `claude --help` |

#### Limits & Safety

| Flag | Purpose | Example |
|------|---------|---------|
| `--max-turns N` | Limit agentic turns | `claude -p --max-turns 3 "fix tests"` |
| `--max-budget-usd N` | Dollar spending limit | `claude -p --max-budget-usd 5 "refactor auth"` |
| `--allowedTools "Tool1" "Tool2"` | Whitelist specific tools | `claude -p --allowedTools "Read" "Bash(git *)"` |
| `--disallowedTools "Tool"` | Blacklist specific tools | `claude -p --disallowedTools "Edit"` |
| `--dangerously-skip-permissions` | Skip all permission prompts (CI only) | For trusted CI/CD environments only |

#### Model & Prompt

| Flag | Purpose | Example |
|------|---------|---------|
| `--model <name>` | Select specific model | `claude -p --model sonnet "query"` |
| `--system-prompt "text"` | Replace system prompt entirely | `claude -p --system-prompt "You are a reviewer"` |
| `--append-system-prompt "text"` | Append to default system prompt | `claude -p --append-system-prompt "Use TypeScript"` |

#### Session

| Flag | Purpose | Example |
|------|---------|---------|
| `--continue` / `-c` | Continue last session | `claude -c -p "now check the types"` |
| `--resume <id>` / `-r` | Resume specific session | `claude -r "auth-work" -p "status?"` |

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|-----------|---------------------|
| Expecting interactive features | Headless is one-shot. No conversation. |
| Long prompts directly in command | Use variables or files for long prompts |
| Ignoring exit codes | Always check exit codes in scripts |
| Not escaping special characters | Quote variables: `"$(cat file)"` |
| Assuming same behavior as interactive | Test headless separately. Output format differs. |
| No error handling | Capture stderr, check exit codes |
| Overloading with huge files | Context limits apply. Chunk large files. |

---

## 7. REAL CASE — Production Story

**Scenario**: Vietnamese startup needed to generate API documentation for 50+ endpoints. Manual process took 2 days per documentation update.

**Solution with headless mode**:

```bash
#!/bin/bash
# generate-api-docs.sh

for endpoint in src/routes/*.ts; do
  name=$(basename "$endpoint" .ts)
  echo "Documenting $name..."

  claude -p "Generate OpenAPI documentation for this endpoint:
$(cat "$endpoint")

Output in YAML format." > "docs/api/$name.yaml"
done

# Combine all YAML files
claude -p "Combine these OpenAPI specs into one:
$(cat docs/api/*.yaml)" > docs/openapi.yaml

echo "API documentation generated!"
```

**Results**:
- 2 days manual → 15 minutes automated
- Runs nightly via cron job
- Documentation always up-to-date
- Human review only when needed

**Quote**: "Headless mode turned Claude from a chat buddy into a documentation factory."

---

> **Next**: [Module 11.2: SDK Integration](../02-claude-code-sdk/) →
