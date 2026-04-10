# Mermaid Diagram Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render all `mermaid` code blocks in the Astro + Starlight site as inline SVGs at build time.

**Architecture:** Add `rehype-mermaid` as a rehype plugin in `astro.config.mjs`. At build time, Playwright (headless Chromium) renders each Mermaid code block into an inline SVG embedded directly in the HTML output. A `postinstall` script ensures Chromium is installed in Vercel's build environment automatically.

**Tech Stack:** Astro 5, Starlight, `rehype-mermaid`, `playwright` (Chromium)

---

## File Map

| File | Change |
|---|---|
| `package.json` | Add `rehype-mermaid` + `playwright` deps; add `postinstall` script |
| `astro.config.mjs` | Import `rehype-mermaid`; add to `markdown.rehypePlugins` |

Zero changes to any `.md` content files.

---

### Task 1: Create Feature Branch

**Files:** None

- [ ] **Step 1: Create and switch to a new branch**

```bash
git checkout -b feat/mermaid-rendering
```

Expected output:
```
Switched to a new branch 'feat/mermaid-rendering'
```

---

### Task 2: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
npm install rehype-mermaid playwright
```

Expected output (last lines):
```
added N packages, and audited N packages in Xs
```

- [ ] **Step 2: Verify both appear in `package.json` dependencies**

Open `package.json` and confirm you see:
```json
"dependencies": {
  "playwright": "^...",
  "rehype-mermaid": "^...",
  ...
}
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add rehype-mermaid and playwright for mermaid rendering"
```

---

### Task 3: Install Playwright Chromium Locally

**Files:** None (local binary install)

- [ ] **Step 1: Install Chromium browser binary**

```bash
npx playwright install chromium
```

Expected output (last lines):
```
Chromium X.X.X (playwright build vXXXX) downloaded to ...
```

This downloads the headless browser that `rehype-mermaid` uses to render diagrams. It is installed into `~/.cache/ms-playwright/` and is NOT committed to git.

- [ ] **Step 2: Verify installation**

```bash
npx playwright --version
```

Expected output:
```
Version X.X.X
```

---

### Task 4: Configure `astro.config.mjs`

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Add the import at the top of `astro.config.mjs`**

Add this line after the existing imports (after `import sitemap from '@astrojs/sitemap';`):

```js
import rehypeMermaid from 'rehype-mermaid';
```

- [ ] **Step 2: Add `markdown` config block to `defineConfig`**

Add the `markdown` key at the top level of `defineConfig`, just before `integrations`. The final config shape should be:

```js
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import rehypeMermaid from 'rehype-mermaid';

export default defineConfig({
  site: 'https://course.shipwithai.io',
  markdown: {
    rehypePlugins: [
      [rehypeMermaid, { strategy: 'inline-svg' }],
    ],
  },
  integrations: [
    starlight({
      // ... all existing starlight config unchanged ...
    }),
    sitemap(),
  ],
});
```

`strategy: 'inline-svg'` embeds the SVG directly into the HTML (no separate files, works on any static host). By default, `rehype-mermaid` throws on invalid Mermaid syntax — which means `astro build` will fail loudly if any diagram has bad syntax, exactly what we want.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat: add rehype-mermaid for server-side mermaid diagram rendering"
```

---

### Task 5: Configure Vercel CI to Install Chromium

**Files:**
- Modify: `package.json`

Vercel runs `npm install` as part of every deployment. Adding a `postinstall` script ensures Chromium is downloaded automatically in Vercel's build environment.

- [ ] **Step 1: Add `postinstall` script to `package.json`**

In the `"scripts"` section, add `"postinstall"`:

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "postinstall": "playwright install chromium"
  }
}
```

- [ ] **Step 2: Verify the postinstall script works locally**

```bash
npm run postinstall
```

Expected output:
```
Chromium X.X.X (playwright build vXXXX) is already installed.
```

(It will say "already installed" since you installed it in Task 3 — that's correct.)

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "ci: add postinstall to install playwright chromium for vercel builds"
```

---

### Task 6: Verify Local Build

**Files:** None

- [ ] **Step 1: Run the production build**

```bash
npm run build
```

Watch the output. You should see the build complete without errors. The Playwright process will spin up during this step — expect the build to take 10–30 seconds longer than before.

Expected: build completes with `dist/` created and no errors.

If you see an error like `Cannot find module 'rehype-mermaid'`: re-run `npm install`.

If you see a Playwright error like `Executable doesn't exist`: re-run `npx playwright install chromium`.

- [ ] **Step 2: Preview the built site**

```bash
npm run preview
```

Open the URL shown (typically `http://localhost:4321`).

- [ ] **Step 3: Verify diagrams render in English content**

Navigate to any module that contains a Mermaid diagram. Example paths to check:
- `/en/claude-code/phase-07-multi-agent-auto/01-auto-coding-levels`
- `/en/claude-code/phase-03-core-workflows/` (any module with diagrams)

Confirm: the diagram renders as a visual SVG (not a code block of text).

- [ ] **Step 4: Verify diagrams render in Vietnamese content**

Navigate to the Vietnamese equivalent:
- `/vi/claude-code/phase-07-multi-agent-auto/01-auto-coding-levels`

Confirm: same diagram renders correctly.

- [ ] **Step 5: Stop preview (Ctrl+C)**

---

### Task 7: Open Pull Request

**Files:** None

- [ ] **Step 1: Push feature branch to remote**

```bash
git push -u origin feat/mermaid-rendering
```

- [ ] **Step 2: Open a PR against `main`**

```bash
gh pr create \
  --title "feat: render Mermaid diagrams as inline SVGs at build time" \
  --body "## Summary
- Adds \`rehype-mermaid\` + \`playwright\` to render Mermaid code blocks as inline SVGs during \`astro build\`
- Adds \`postinstall\` script so Vercel automatically installs Playwright Chromium on each deploy
- Zero changes to any \`.md\` content files — all 20+ existing diagrams work as-is

## Test plan
- [ ] \`npm run build\` completes without errors locally
- [ ] EN diagram page verified: \`/en/claude-code/phase-07-multi-agent-auto/01-auto-coding-levels\`
- [ ] VI diagram page verified: \`/vi/claude-code/phase-07-multi-agent-auto/01-auto-coding-levels\`
- [ ] Vercel preview deployment shows diagrams rendering as SVGs (not code blocks)" \
  --base main
```

- [ ] **Step 3: Check Vercel preview deployment**

Vercel automatically builds a preview for every PR. Open the preview URL from the PR and verify:
1. Build log shows `playwright install chromium` succeeded
2. Navigate to a page with a Mermaid diagram and confirm SVG renders

If Playwright fails to install system dependencies, update `postinstall` to:
```json
"postinstall": "playwright install --with-deps chromium"
```
Commit and push — Vercel will rebuild the preview automatically.

---

## Done Criteria

- [ ] `npm run build` completes without errors locally
- [ ] At least 2 Mermaid diagrams verified rendering visually in EN content
- [ ] At least 1 Mermaid diagram verified rendering visually in VI content
- [ ] PR opened against `main` with Vercel preview deployment green
- [ ] Zero `.md` content files changed
