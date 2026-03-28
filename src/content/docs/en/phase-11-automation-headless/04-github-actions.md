---
title: 'GitHub Actions Integration'
description: 'Build production-ready GitHub Actions workflows with Claude Code for automated PR reviews and CI tasks.'
---

# Module 11.4: GitHub Actions Integration

> **Estimated time**: ~35 minutes
>
> **Prerequisite**: Modules 11.1-11.3 (Headless Mode, SDK Integration, Hooks System)
>
> **Outcome**: After this module, you will have production-ready GitHub Actions workflows for Claude Code, understand GitHub-specific patterns, and know how to leverage GitHub's ecosystem for AI automation.

---

## 1. WHY — Why This Matters

You've built powerful Claude Code automation with headless mode and SDK. But you're still triggering it manually. Every PR needs review. Every new feature needs tests. Docs drift out of sync. You want Claude to automatically review PRs, generate tests, update documentation. But how do you wire Claude into GitHub's event system? What triggers what? How do you post results back to PRs as comments? How do you handle API keys securely? GitHub Actions is the bridge between "Claude can do this" and "Claude does this automatically on every PR."

---

## 2. CONCEPT — Core Ideas

GitHub Actions workflows are YAML files in `.github/workflows/` that react to repository events. When an event fires (PR opened, code pushed, comment posted), GitHub spins up a runner, executes your workflow, and can post results back to the PR.

### Key Events for Claude Automation

| Event | Trigger Condition | Best Use Case |
|-------|-------------------|---------------|
| `pull_request` | PR opened, updated, synchronized | Code review, test generation |
| `push` | Code pushed to branch | Doc updates, analysis reports |
| `workflow_dispatch` | Manual trigger via UI/API | On-demand tasks, debugging |
| `schedule` | Cron-based timing | Periodic security audits |
| `issue_comment` | Comment on issue or PR | Chatops commands (`/claude review`) |

### GitHub Contexts

Workflows access event data through `${{ github.* }}` contexts:

- `${{ github.event.pull_request.number }}` — PR number for API calls
- `${{ github.sha }}` — Commit SHA being built
- `${{ github.actor }}` — User who triggered the event
- `${{ secrets.ANTHROPIC_API_KEY }}` — Encrypted secrets

### Posting Results Back

Claude generates output, but GitHub users need to see it. Common patterns:

1. **PR Comments**: Use `actions/github-script@v7` to call GitHub API
2. **Labels**: Add labels like `needs-changes`, `approved-by-claude`
3. **Status Checks**: Report pass/fail to prevent merge
4. **Artifacts**: Upload detailed reports for human review

### Cost Control

AI API calls cost money. Runaway workflows cost even more:

- **paths filter**: Only run on relevant file changes (`src/**`, not `docs/**`)
- **paths-ignore**: Skip workflows for README changes
- **concurrency**: Cancel stale runs when new commits arrive
- **timeout-minutes**: Cap workflow duration

---

## 3. DEMO — Step by Step

**Scenario**: Production-ready PR review workflow that posts inline comments.

**Step 1: Create workflow file**

```bash
$ mkdir -p .github/workflows
$ touch .github/workflows/claude-review.yml
```

Complete workflow file:

```yaml
name: Claude PR Review

on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'src/**'
      - 'lib/**'

concurrency:
  group: claude-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

jobs:
  review:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: |
          npm install -g @anthropic-ai/claude-code

      - name: Get changed files
        id: changed
        run: |
          FILES=$(git diff --name-only ${{ github.event.pull_request.base.sha }} ${{ github.sha }} | tr '\n' ' ')
          echo "files=$FILES" >> $GITHUB_OUTPUT

      - name: Run Claude review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "Review these changed files for bugs, security issues, and best practices: ${{ steps.changed.outputs.files }}. Output format: - [FILE] [ISSUE]" > review.txt

      - name: Post review as PR comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review.txt', 'utf8');

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## Claude Code Review\n\n${review}\n\n---\n*Automated by Claude Code v11.4*`
            });
```

**Step 2: Set up secrets**

Navigate to your repository on GitHub:

```
Settings → Secrets and variables → Actions → New repository secret
```

- Name: `ANTHROPIC_API_KEY`
- Value: `sk-ant-api03-...` (your actual key)

Click "Add secret".

**Step 3: Test with a PR**

```bash
$ git checkout -b test-claude-review
$ echo "console.log('test');" > src/test.js
$ git add src/test.js
$ git commit -m "Test Claude review"
$ git push origin test-claude-review
```

Open PR via GitHub UI.

Expected output in Actions tab:

```
Run Claude review
✓ Install Claude Code (12s)
✓ Get changed files (2s)
✓ Run Claude review (8s)
✓ Post review as PR comment (3s)
```

Check PR — you'll see a comment from `github-actions[bot]`:

```
## Claude Code Review

- [src/test.js] Missing semicolon may cause ASI issues
- [src/test.js] Console.log should be removed before production

---
*Automated by Claude Code v11.4*
```

**Step 4: Chatops workflow**

Create `.github/workflows/claude-chatops.yml`:

```yaml
name: Claude Chatops

on:
  issue_comment:
    types: [created]

jobs:
  chatops:
    if: startsWith(github.event.comment.body, '/claude')
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Parse command
        id: parse
        run: |
          COMMAND="${{ github.event.comment.body }}"
          echo "command=${COMMAND#/claude }" >> $GITHUB_OUTPUT

      - name: Run Claude
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "${{ steps.parse.outputs.command }}" > result.txt

      - name: Reply
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const result = fs.readFileSync('result.txt', 'utf8');

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `\`\`\`\n${result}\n\`\`\``
            });
```

Test by commenting on any PR:

```
/claude explain the purpose of src/auth.ts
```

GitHub Actions responds with explanation.

---

## 4. PRACTICE — Try It Yourself

### Exercise 1: Basic PR Review
**Goal**: Get Claude reviewing your PRs automatically.

**Instructions**:
1. Create `.github/workflows/claude-review.yml` using DEMO code
2. Add `ANTHROPIC_API_KEY` secret to repository settings
3. Open a test PR with a deliberate bug (e.g., unused variable)
4. Verify Claude posts a review comment

**Expected result**: PR receives automated comment within 30 seconds.

<details>
<summary>💡 Hint</summary>
If the workflow doesn't trigger, check that your changed files match the `paths` filter. Try adding `**/*.js` to include all JS files.
</details>

<details>
<summary>✅ Solution</summary>

```bash
# Create workflow file
mkdir -p .github/workflows
cat > .github/workflows/claude-review.yml << 'EOF'
# [Use YAML from DEMO Step 1]
EOF

# Add secret via gh CLI (or use UI)
gh secret set ANTHROPIC_API_KEY

# Test PR
git checkout -b test-review
echo "const unused = 42;" > src/bug.js
git add src/bug.js
git commit -m "Test: add unused variable"
git push origin test-review
gh pr create --title "Test review" --body "Testing Claude"
```

Within 30 seconds, check PR for Claude's comment about the unused variable.
</details>

### Exercise 2: Filtered Triggers
**Goal**: Optimize costs by running Claude only on relevant changes.

**Instructions**:
1. Modify workflow to ignore `docs/**` and `*.md` files
2. Add concurrency control to cancel stale runs
3. Test by pushing changes to docs (should NOT trigger) and src (should trigger)

**Expected result**: README edits don't waste API calls.

<details>
<summary>💡 Hint</summary>
Use both `paths` (include) and `paths-ignore` (exclude). Concurrency uses `group` to identify related runs.
</details>

<details>
<summary>✅ Solution</summary>

```yaml
on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'src/**'
      - 'lib/**'
    paths-ignore:
      - '**/*.md'
      - 'docs/**'

concurrency:
  group: claude-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true
```

Test: Edit README → no workflow run. Edit src/app.js → workflow runs.
</details>

### Exercise 3: Chatops Commands
**Goal**: Let team members invoke Claude via PR comments.

**Instructions**:
1. Create chatops workflow from DEMO Step 4
2. Add command: `/claude review security` to check for security issues only
3. Test by commenting on a PR

**Expected result**: Comment `/claude review security` → Claude responds.

<details>
<summary>💡 Hint</summary>
The `issue_comment` event fires for both issues and PRs. Use `if: github.event.issue.pull_request` to restrict to PRs only.
</details>

<details>
<summary>✅ Solution</summary>

```yaml
jobs:
  chatops:
    if: startsWith(github.event.comment.body, '/claude') && github.event.issue.pull_request
    runs-on: ubuntu-latest
    # [rest of workflow from DEMO]
```

Test:
1. Open a PR
2. Comment: `/claude review security in src/auth.ts`
3. Wait ~15 seconds for response
</details>

---

## 5. CHEAT SHEET

### Common Events

```yaml
on:
  pull_request:               # PR opened/updated
  push:                       # Code pushed
    branches: [main]
  workflow_dispatch:          # Manual trigger
  schedule:
    - cron: '0 2 * * *'       # Daily at 2 AM UTC
  issue_comment:              # Comment posted
```

### GitHub Contexts

| Context | Example Value |
|---------|---------------|
| `${{ github.event.pull_request.number }}` | `123` |
| `${{ github.sha }}` | `a1b2c3d...` |
| `${{ github.ref }}` | `refs/heads/main` |
| `${{ github.actor }}` | `octocat` |
| `${{ secrets.ANTHROPIC_API_KEY }}` | `sk-ant-api03-...` |

### Post PR Comment Snippet

```yaml
- uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.issue.number,
        body: 'Your message here'
      });
```

### Cost Control Patterns

```yaml
# Only run on src changes
paths: ['src/**', 'lib/**']

# Cancel stale runs
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

# Cap duration
timeout-minutes: 10
```

---

## 6. PITFALLS — Common Mistakes

| ❌ Mistake | ✅ Correct Approach |
|---|---|
| Hardcoding API key in workflow file | Use `${{ secrets.ANTHROPIC_API_KEY }}` — never commit secrets |
| Using `pull_request_target` without understanding | Security risk! Use `pull_request` unless you need write access |
| No concurrency control, multiple runs pile up | Add `concurrency` with `cancel-in-progress: true` |
| Running Claude on all 500 files in monorepo | Use `paths` filter: `src/frontend/**` only |
| Commit from workflow triggers another workflow (infinite loop) | Add `[skip ci]` to commit message: `git commit -m "Update [skip ci]"` |
| Echoing secrets for debugging | Never `echo ${{ secrets.* }}` — use `***` masking intentionally |
| Sending 10,000-line diff to Claude | Filter changed files, limit to 10-20 files max, summarize large diffs |

---

## 7. REAL CASE — Production Story

**Scenario**: A popular Vietnamese open-source project (Zalo mini-app framework) had 20+ contributors across timezones. Two maintainers were overwhelmed reviewing 15-30 PRs per week, causing 3-5 day review delays.

**Problem**: Maintainers couldn't scale. PRs sat untouched. Contributors got frustrated. Quality issues slipped through when maintainers rushed reviews.

**Solution**: Implemented three GitHub Actions workflows:

1. **claude-review.yml**: Auto-review every PR within 2 minutes of opening
2. **claude-tests.yml**: Generate missing tests when PR author adds `needs-tests` label
3. **claude-docs.yml**: Update docs automatically on merge to main

All workflows used `paths` filters and concurrency control to avoid waste.

**Results**:
- Maintainer review time: -50% (Claude caught obvious issues first)
- PR quality at first human review: +60% (contributors fixed Claude's feedback before requesting review)
- Test coverage: 45% → 70% in 2 months
- Average PR time-to-merge: 4.2 days → 1.8 days

**Maintainer quote**: "GitHub Actions + Claude = maintainer that never sleeps. We review PRs while we're asleep. Game changer for open source."

**Cost**: ~$40/month API usage for 80-100 PRs.

---

> **Next**: [Module 11.5: MCP — Model Context Protocol](../05-mcp/) →
