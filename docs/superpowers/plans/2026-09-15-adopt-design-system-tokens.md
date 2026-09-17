# Adopt ShipWithAI Design System Tokens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle course.shipwithai.io so it uses the ShipWithAI design system v2 (warm dark canvas, amber editorial accent, Inter/Lora/JetBrains Mono) by vendoring the design system's compiled `tokens.css` — no private package dependency, dark-only, editorial surface.

**Architecture:** Vendor `dist/tokens.css` from `@mangalahq/shipwithai-sot-design@0.47.0` into `src/styles/tokens.css` (with a sync script for future updates). Rewrite `src/styles/starlight-overrides.css` so every site-level custom property (`--color-*`, `--font-*`, `--space-*`, `--sl-color-*`) aliases a token instead of a raw value — the same pattern shipwithai.io uses for its own Starlight pages. Remove the light theme by overriding Starlight's `ThemeProvider` and `ThemeSelect` components. Keep Starlight's built-in header (no DS `SiteHeader` — that would require the private package or copying components).

**Tech Stack:** Astro 5.6, Starlight 0.37.6, `@fontsource/inter`, `@fontsource/lora`, `@fontsource/jetbrains-mono`, Mermaid 11 (CDN), npm, Vercel static.

**Spec:** Decisions recorded in this conversation (2026-09-15): vendor tokens.css (no GitHub Packages dependency, keep repo installable by external contributors), drop light theme (DS is dark-first; `tokens.css` has no light tokens), surface = `editorial` (amber accent). Reference implementation: `/Users/luatnq/workspace/shipwithai/shipwithai.io/src/styles/starlight-overrides.css` and `/Users/luatnq/workspace/shipwithai/shipwithai.io/src/components/Header.astro`.

## Global Constraints

- Token source of truth: `/Users/luatnq/workspace/shipwithai/shipwithai.io/node_modules/@mangalahq/shipwithai-sot-design/dist/tokens.css` (package version `0.47.0`). Never hand-edit `src/styles/tokens.css`; re-run `scripts/sync-design-tokens.sh`.
- Never write `--foo: var(--foo);` (self-referential custom property → cyclic → the whole token voids). shipwithai.io hit this bug with `--shadow-*` and `--radius-*`; those names already exist in `tokens.css`, so do not re-declare them.
- No `[data-theme="light"]` rule may remain in `src/`.
- No indigo anywhere in UI: `#818CF8`, `#6366F1`, `#4F46E5`, `#4338CA`, `#312e81`, `rgba(129, 140, 248, …)`, `rgba(99, 102, 241, …)` must be gone from `src/styles`, `src/components`, `src/scripts`. DS DESIGN.md: "Indigo demoted to syntax-highlight only."
- Font families come from tokens: heading `Lora, Georgia, serif`; body `Inter, system-ui, sans-serif`; mono `'JetBrains Mono', Menlo, monospace`. Self-host via `@fontsource/*` (no Google Fonts link — course currently self-hosts, keep that).
- `npm install` MUST be run as `npm install --ignore-scripts` (repo hook `.claude/hooks/npm-audit-check.sh` blocks plain `npm install`).
- Build must pass: `npm run build` exits 0 with zero warnings about missing CSS files.
- Existing behaviour preserved: Mermaid adaptive rendering (fit/scroll/modal), GTM, sitemap, EN/VI locales, redirects in `vercel.json`, `src/scripts/course-analytics.ts`.
- Commit after every task; conventional commit messages; end each commit message with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/styles/tokens.css` | Create (vendored) | Design-system Layer-1 tokens, verbatim copy of `dist/tokens.css` + provenance header. Loaded first. |
| `scripts/sync-design-tokens.sh` | Create | Re-copies `tokens.css` from the design package and stamps version/date header. |
| `scripts/check-design-tokens.sh` | Create | Lint gate: fails if light-theme rules or indigo colours remain in `src/`. |
| `src/styles/starlight-overrides.css` | Rewrite | Site-level aliases (`--color-*`, `--font-*`, `--sl-color-*`) → tokens; Starlight chrome polish (sidebar, tables, blockquote, details, header). Dark-only. |
| `src/styles/custom.css` | Modify | Sidebar active state + Mermaid card/modal colours → tokens. |
| `src/scripts/mermaid-client.js` | Modify | Mermaid `themeVariables` → DS palette values (dark). |
| `src/components/ThemeProvider.astro` | Create | Starlight override: forces `data-theme="dark"` + `data-surface="editorial"` on `<html>`, no localStorage theme read. |
| `src/components/ThemeSelect.astro` | Create | Starlight override: renders nothing (removes the theme toggle). |
| `src/components/Footer.astro` | Modify | Drop stale indigo/cool-grey fallback values. |
| `astro.config.mjs` | Modify | Font imports (Inter/Lora), `tokens.css` first in `customCss`, register `ThemeProvider`/`ThemeSelect` overrides. |
| `package.json` | Modify | Replace `@fontsource/ibm-plex-sans` with `@fontsource/inter` + `@fontsource/lora`. |
| `README.md` | Modify | Short "Design system" note pointing to the sync script. |

---

### Task 1: Vendor tokens.css + sync script + lint gate

**Files:**
- Create: `scripts/sync-design-tokens.sh`
- Create: `scripts/check-design-tokens.sh`
- Create: `src/styles/tokens.css` (generated by the sync script)
- Modify: `README.md` (append section)

**Interfaces:**
- Produces: `src/styles/tokens.css` exposing (used by Tasks 3–6): `--surface-canvas`, `--surface-elevated`, `--surface-card`, `--surface-card-hover`, `--surface-popover`, `--surface-code`, `--surface-canvas-glass`, `--text-primary`, `--text-secondary`, `--text-muted`, `--text-faint`, `--accent-editorial`, `--accent-editorial-hover`, `--accent-editorial-fill`, `--accent-editorial-fill-faint`, `--accent-product`, `--accent-product-hover`, `--accent-product-fill`, `--border-default`, `--border-strong`, `--border-accent`, `--border-subtle`, `--color-state-warn`, `--color-state-error`, `--color-state-info`, `--color-state-success`, `--type-family-heading`, `--type-family-body`, `--type-family-mono`, `--type-scale-{xs,sm,base,md,lg,xl,2xl,3xl,4xl,5xl}`, `--type-line-height-{tight,snug,normal,body}`, `--type-measure-body`, `--space-{1,2,3,4,6,8,12,16,24}`, `--radius-{sm,md,lg,xl,full}`, `--shadow-{sm,md,lg,glow-editorial}`, `--motion-duration-{fast,normal,slow}`, `--motion-easing-out`, `--z-layer-{base,raised,sticky,modal,toast}`, and the `[data-surface="editorial"]` block (`--accent-primary`, `--color-link`, `--shadow-glow`).
- Produces: `scripts/check-design-tokens.sh` exit 0 = clean, exit 1 = violations listed on stdout.

- [ ] **Step 1: Write the lint gate (this is the "failing test" for the whole plan)**

```bash
cat > scripts/check-design-tokens.sh <<'EOF'
#!/usr/bin/env bash
# Design-token lint gate for course.shipwithai.io.
# Fails if light-theme rules or indigo (banned by DESIGN.md) survive in src/.
# tokens.css is excluded: it is vendored verbatim from the design system.
set -u
cd "$(dirname "$0")/.."

fail=0
report() { echo "❌ $1"; fail=1; }

# 1. No light theme selectors anywhere in src/
if grep -rn --include='*.css' --include='*.astro' --include='*.js' --include='*.ts' \
     -E 'data-theme=.light.' src --exclude=tokens.css; then
  report "light-theme rules found (see above)"
fi

# 2. No indigo / cool-grey brand colours from the pre-DS palette
if grep -rni --include='*.css' --include='*.astro' --include='*.js' --include='*.ts' \
     -E '#818CF8|#6366F1|#4F46E5|#4338CA|#312E81|rgba\(129, ?140, ?248|rgba\(99, ?102, ?241|#0B0F19|#111827|#1F2937|#F9FAFB|#e0e7ff' \
     src --exclude=tokens.css; then
  report "banned pre-DS colours found (see above)"
fi

# 3. IBM Plex must be gone (DS body font is Inter)
if grep -rni --include='*.css' --include='*.mjs' --include='*.js' --include='*.json' \
     'ibm-plex\|IBM Plex' src astro.config.mjs package.json; then
  report "IBM Plex references found (see above)"
fi

# 4. tokens.css must exist and carry the provenance header
if ! head -3 src/styles/tokens.css 2>/dev/null | grep -q 'shipwithai-sot-design'; then
  report "src/styles/tokens.css missing or lacks provenance header"
fi

if [ "$fail" -eq 0 ]; then echo "✅ design-token gate clean"; fi
exit $fail
EOF
chmod +x scripts/check-design-tokens.sh
```

- [ ] **Step 2: Run the gate — it must FAIL now**

Run: `./scripts/check-design-tokens.sh; echo "exit=$?"`
Expected: several `❌` lines (light-theme rules in `starlight-overrides.css` + `custom.css`, indigo in `custom.css`/`Footer.astro`/`mermaid-client.js`, IBM Plex in `astro.config.mjs`/`package.json`, missing tokens.css) and `exit=1`.

- [ ] **Step 3: Write the sync script**

```bash
cat > scripts/sync-design-tokens.sh <<'EOF'
#!/usr/bin/env bash
# Re-vendor the ShipWithAI design-system tokens into src/styles/tokens.css.
#
# The design system is a private GitHub Package (@mangalahq/shipwithai-sot-design).
# This repo is public and must stay `npm install`-able without a token, so we
# vendor the compiled CSS instead of depending on the package.
#
# Usage:
#   ./scripts/sync-design-tokens.sh                # default: sibling shipwithai.io checkout
#   DESIGN_PKG_DIR=/path/to/node_modules/@mangalahq/shipwithai-sot-design ./scripts/sync-design-tokens.sh
set -euo pipefail
cd "$(dirname "$0")/.."

DESIGN_PKG_DIR="${DESIGN_PKG_DIR:-../shipwithai.io/node_modules/@mangalahq/shipwithai-sot-design}"
SRC="$DESIGN_PKG_DIR/dist/tokens.css"
DEST="src/styles/tokens.css"

if [ ! -f "$SRC" ]; then
  echo "tokens.css not found at $SRC" >&2
  echo "Set DESIGN_PKG_DIR to a directory containing the installed package." >&2
  exit 1
fi

VERSION="$(node -p "require('$DESIGN_PKG_DIR/package.json').version")"
DATE="$(date +%Y-%m-%d)"

{
  echo "/* VENDORED from @mangalahq/shipwithai-sot-design@${VERSION} (dist/tokens.css) on ${DATE}."
  echo "   DO NOT EDIT BY HAND — run scripts/sync-design-tokens.sh to update. */"
  cat "$SRC"
} > "$DEST"

echo "✅ wrote $DEST from @mangalahq/shipwithai-sot-design@${VERSION}"
EOF
chmod +x scripts/sync-design-tokens.sh
```

- [ ] **Step 4: Run the sync script to generate tokens.css**

Run: `./scripts/sync-design-tokens.sh && head -8 src/styles/tokens.css && wc -l src/styles/tokens.css`
Expected:
```
✅ wrote src/styles/tokens.css from @mangalahq/shipwithai-sot-design@0.47.0
/* VENDORED from @mangalahq/shipwithai-sot-design@0.47.0 (dist/tokens.css) on 2026-09-15.
   DO NOT EDIT BY HAND — run scripts/sync-design-tokens.sh to update. */
/* Auto-generated by compile-tokens. Do not edit. */
...
     288 src/styles/tokens.css
```

- [ ] **Step 5: Verify the tokens the later tasks rely on exist**

Run:
```bash
for t in surface-canvas surface-elevated surface-card surface-card-hover surface-popover surface-code surface-canvas-glass text-primary text-secondary text-muted text-faint accent-editorial accent-editorial-hover accent-editorial-fill accent-editorial-fill-faint accent-product border-default border-strong border-accent border-subtle color-state-warn color-state-error color-state-info type-family-heading type-family-body type-family-mono type-scale-md radius-md shadow-sm shadow-glow-editorial motion-duration-fast motion-easing-out z-layer-sticky; do
  grep -q -- "--$t:" src/styles/tokens.css && echo "ok  --$t" || echo "MISSING --$t"
done
grep -n 'data-surface="editorial"' src/styles/tokens.css
```
Expected: every line `ok`, and one match for `[data-surface="editorial"]`.

- [ ] **Step 6: Document in README**

Append to `README.md` (before the final license section, or at the end if none):

````bash
cat >> README.md <<'EOF'

---

## Design System

The site's colours, type scale and spacing come from the ShipWithAI design system.
`src/styles/tokens.css` is a **vendored copy** of the compiled tokens (the design
package itself is private, and this repo must stay installable without a token).

To update after a design-system release:

```bash
./scripts/sync-design-tokens.sh      # copies dist/tokens.css from ../shipwithai.io
./scripts/check-design-tokens.sh     # lint gate: no light theme, no indigo
npm run build
```

Never edit `tokens.css` by hand; put site-specific overrides in
`src/styles/starlight-overrides.css`.
EOF
````

- [ ] **Step 7: Commit**

```bash
git add scripts/sync-design-tokens.sh scripts/check-design-tokens.sh src/styles/tokens.css README.md
git commit -m "chore(design): vendor design-system tokens.css + sync/lint scripts

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Swap fonts to Inter + Lora + JetBrains Mono

**Files:**
- Modify: `package.json` (dependencies)
- Modify: `astro.config.mjs:145-156` (`customCss` font imports)

**Interfaces:**
- Produces: self-hosted `@font-face` for `Inter` (400/500/600/700), `Lora` (400/600/700 + 400 italic), `JetBrains Mono` (400/500/600/700) — the exact family names `tokens.css` references.

- [ ] **Step 1: Replace the font packages**

Run:
```bash
npm uninstall @fontsource/ibm-plex-sans
npm install --ignore-scripts @fontsource/inter@^5 @fontsource/lora@^5
grep -n fontsource package.json
```
Expected:
```
    "@fontsource/inter": "^5.x.x",
    "@fontsource/jetbrains-mono": "^5.2.8",
    "@fontsource/lora": "^5.x.x",
```
(`ibm-plex-sans` no longer listed.)

- [ ] **Step 2: Verify the font CSS files exist in node_modules**

Run: `ls node_modules/@fontsource/inter/{400,500,600,700}.css node_modules/@fontsource/lora/{400,600,700,400-italic}.css`
Expected: all 8 paths listed, no "No such file".

- [ ] **Step 3: Update `customCss` in astro.config.mjs**

Replace the block:
```js
      customCss: [
        '@fontsource/ibm-plex-sans/300.css',
        '@fontsource/ibm-plex-sans/400.css',
        '@fontsource/ibm-plex-sans/500.css',
        '@fontsource/ibm-plex-sans/600.css',
        '@fontsource/ibm-plex-sans/700.css',
        '@fontsource/jetbrains-mono/400.css',
        '@fontsource/jetbrains-mono/500.css',
        '@fontsource/jetbrains-mono/600.css',
        '@fontsource/jetbrains-mono/700.css',
        './src/styles/starlight-overrides.css',
        './src/styles/custom.css',
      ],
```
with:
```js
      customCss: [
        // Fonts — self-hosted. Family names must match tokens.css:
        // --type-family-body: Inter, --type-family-heading: Lora, --type-family-mono: 'JetBrains Mono'
        '@fontsource/inter/400.css',
        '@fontsource/inter/500.css',
        '@fontsource/inter/600.css',
        '@fontsource/inter/700.css',
        '@fontsource/lora/400.css',
        '@fontsource/lora/400-italic.css',
        '@fontsource/lora/600.css',
        '@fontsource/lora/700.css',
        '@fontsource/jetbrains-mono/400.css',
        '@fontsource/jetbrains-mono/500.css',
        '@fontsource/jetbrains-mono/600.css',
        '@fontsource/jetbrains-mono/700.css',
        // Design system — vendored tokens MUST load before the overrides that alias them.
        './src/styles/tokens.css',
        './src/styles/starlight-overrides.css',
        './src/styles/custom.css',
      ],
```

- [ ] **Step 4: Build to confirm the imports resolve**

Run: `npm run build 2>&1 | tail -15`
Expected: `[build] Complete!` (or equivalent success line), exit 0, no "Could not resolve" errors. (Styles still look old — that's Task 3.)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs
git commit -m "feat(design): self-host Inter + Lora, load vendored tokens.css first

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Rewrite starlight-overrides.css to alias tokens (dark-only)

**Files:**
- Rewrite: `src/styles/starlight-overrides.css` (whole file)

**Interfaces:**
- Consumes: every token listed in Task 1 "Produces".
- Produces: site-level aliases used by `custom.css`, `Footer.astro`, and Starlight: `--font-heading`, `--font-body`, `--font-code`, `--text-{xs..5xl}`, `--leading-{tight,normal,relaxed}`, `--line-length`, `--color-bg-{deepest,base,surface,surface-hover,overlay}`, `--color-text-{primary,secondary,muted,faint}`, `--color-accent`, `--color-accent-hover`, `--color-accent-subtle`, `--color-accent-border`, `--color-cta`, `--color-cta-hover`, `--color-cta-bg`, `--color-{warning,error,info}`, `--color-border`, `--color-border-hover`, `--color-border-accent`, `--shadow-glow`, `--space-{xs,sm,md,lg,xl,2xl,3xl,4xl}`, `--transition-{fast,normal,slow}`, plus the `--sl-color-*` Starlight compat aliases.

- [ ] **Step 1: Snapshot the current file for reference (not committed)**

Run: `cp src/styles/starlight-overrides.css /private/tmp/claude-501/-Users-luatnq-workspace-shipwithai-claude-code-mastery/9ce9fd47-7588-4818-96e9-8de2a945bbb5/scratchpad/starlight-overrides.old.css`

- [ ] **Step 2: Write the new file**

```bash
cat > src/styles/starlight-overrides.css <<'EOF'
/* ============================================================
   starlight-overrides.css
   Maps the ShipWithAI design system (src/styles/tokens.css,
   vendored from @mangalahq/shipwithai-sot-design) onto Starlight.

   Rules:
   - Every value on the right-hand side is a token var, never raw.
   - NEVER write `--x: var(--x)` — cyclic, voids the token.
     --radius-*, --shadow-sm/md/lg already exist in tokens.css; use them directly.
   - Dark-only. The design system is dark-first and ships no light tokens.
     Light theme is disabled in src/components/ThemeProvider.astro.
   - Surface = editorial (amber accent). data-surface is set on <html>
     by ThemeProvider.astro; the alias block below assumes it.
   ============================================================ */

/* ── Starlight font hooks ── */
:root {
  --sl-font: var(--type-family-body);
  --sl-font-mono: var(--type-family-mono);
}

/* ============================================================
   Site aliases → design tokens
   ============================================================ */
:root {
  /* ── Typography ── */
  --font-heading: var(--type-family-heading);
  --font-body: var(--type-family-body);
  --font-code: var(--type-family-mono);

  --text-xs: var(--type-scale-xs);
  --text-sm: var(--type-scale-sm);
  --text-base: var(--type-scale-md);
  --text-lg: var(--type-scale-lg);
  --text-xl: var(--type-scale-xl);
  --text-2xl: var(--type-scale-2xl);
  --text-3xl: var(--type-scale-3xl);
  --text-4xl: var(--type-scale-4xl);
  --text-5xl: var(--type-scale-5xl);

  --leading-tight: var(--type-line-height-tight);
  --leading-normal: var(--type-line-height-normal);
  --leading-relaxed: var(--type-line-height-body);
  --line-length: var(--type-measure-body);

  /* ── Background layers ── */
  --color-bg-deepest: var(--surface-canvas);
  --color-bg-base: var(--surface-elevated);
  --color-bg-surface: var(--surface-card);
  --color-bg-surface-hover: var(--surface-card-hover);
  --color-bg-overlay: var(--surface-popover);

  /* ── Text ── */
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-faint: var(--text-faint);

  /* ── Accent — editorial surface (amber) ── */
  --color-accent: var(--accent-editorial);
  --color-accent-hover: var(--accent-editorial-hover);
  --color-accent-subtle: var(--accent-editorial-fill);
  --color-accent-border: var(--border-accent);

  /* ── CTA — always product (emerald), per DS newsletter hard rule ── */
  --color-cta: var(--accent-product);
  --color-cta-hover: var(--accent-product-hover);
  --color-cta-bg: var(--accent-product-fill);

  /* ── Semantic ── */
  --color-warning: var(--color-state-warn);
  --color-error: var(--color-state-error);
  --color-info: var(--color-state-info);

  /* ── Borders ── */
  --color-border: var(--border-default);
  --color-border-hover: var(--border-strong);
  --color-border-accent: var(--border-accent);

  /* ── Shadows — --shadow-sm/md/lg come straight from tokens.css ── */
  --shadow-glow: var(--shadow-glow-editorial);

  /* ── Spacing ── */
  --space-xs: var(--space-1);
  --space-sm: var(--space-2);
  --space-md: var(--space-4);
  --space-lg: var(--space-6);
  --space-xl: var(--space-8);
  --space-2xl: var(--space-12);
  --space-3xl: var(--space-16);
  --space-4xl: var(--space-24);

  /* ── Radius — --radius-sm/md/lg/xl/full come straight from tokens.css ── */

  /* ── Motion ── */
  --transition-fast: var(--motion-duration-fast) var(--motion-easing-out);
  --transition-normal: var(--motion-duration-normal) var(--motion-easing-out);
  --transition-slow: var(--motion-duration-slow) var(--motion-easing-out);

  /* ── Starlight palette compat ── */
  --sl-color-white: var(--text-primary);
  --sl-color-gray-1: var(--text-secondary);
  --sl-color-gray-2: var(--text-secondary);
  --sl-color-gray-3: var(--text-muted);
  --sl-color-gray-4: var(--text-faint);
  --sl-color-gray-5: var(--surface-card);
  --sl-color-gray-6: var(--surface-elevated);
  --sl-color-gray-7: var(--surface-elevated);
  --sl-color-black: var(--surface-canvas);

  --sl-color-accent-low: var(--accent-editorial-fill);
  --sl-color-accent: var(--accent-editorial);
  --sl-color-accent-high: var(--accent-editorial-hover);

  --sl-color-text: var(--text-secondary);
  --sl-color-text-accent: var(--accent-editorial);
  --sl-color-text-invert: var(--text-inverse);

  --sl-color-bg: var(--surface-canvas);
  --sl-color-bg-nav: var(--surface-elevated);
  --sl-color-bg-sidebar: var(--surface-elevated);
  --sl-color-bg-inline-code: var(--surface-code);
  --sl-color-hairline-light: var(--border-strong);
  --sl-color-hairline: var(--border-default);
  --sl-color-hairline-shade: var(--border-subtle);

  --sl-text-sm: var(--text-sm);
  --sl-text-xs: var(--text-xs);

  color-scheme: dark;
}

/* ============================================================
   Typography
   ============================================================ */
.sl-markdown-content {
  font-family: var(--font-body);
  line-height: var(--leading-relaxed);
}

h1, h2, h3, h4,
.sl-markdown-content h1,
.sl-markdown-content h2,
.sl-markdown-content h3,
.sl-markdown-content h4 {
  font-family: var(--font-heading);
  font-weight: var(--type-weight-semibold);
  line-height: var(--type-line-height-snug);
  letter-spacing: var(--type-tracking-snug);
}

.sl-markdown-content h2 {
  margin-top: var(--space-10);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.sl-markdown-content code,
.sl-markdown-content pre {
  font-family: var(--font-code);
}

/* Inline code */
.sl-markdown-content :not(pre) > code {
  background: var(--surface-code);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.15em 0.35em;
  font-size: var(--type-style-code-inline-font-size);
}

/* Code blocks */
.sl-markdown-content pre {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* Sidebar uses body font, not heading serif */
nav.sidebar-content,
.sidebar-content,
starlight-menu-button + nav {
  font-family: var(--font-body);
}

/* ============================================================
   Header / Navigation bar
   ============================================================ */
header {
  background-color: var(--surface-canvas-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
  z-index: var(--z-layer-sticky);
}

@media (max-width: 49.999rem) {
  header {
    z-index: var(--sl-z-index-navbar);
  }
}

/* Site title in the header uses the heading serif */
.site-title {
  font-family: var(--font-heading);
  font-weight: var(--type-weight-semibold);
}

/* ============================================================
   Sidebar
   ============================================================ */
.sidebar-content .top-level > li > details > summary,
.sidebar-content .top-level > li > a {
  font-weight: var(--type-weight-semibold);
  letter-spacing: var(--type-tracking-normal);
}

[aria-current="page"],
[aria-current="true"] {
  background: var(--accent-editorial-fill) !important;
  border-left: 3px solid var(--accent-editorial) !important;
  font-weight: var(--type-weight-semibold);
}

.sidebar-content a:hover {
  background: var(--color-bg-surface-hover);
  transition: background var(--transition-fast);
}

/* ============================================================
   Content
   ============================================================ */
.sl-markdown-content table {
  border-collapse: collapse;
  width: 100%;
  font-size: var(--text-sm);
}

.sl-markdown-content th {
  background: var(--color-bg-surface);
  font-family: var(--font-body);
  font-weight: var(--type-weight-semibold);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: var(--type-tracking-extra-wide);
}

.sl-markdown-content th,
.sl-markdown-content td {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
}

.sl-markdown-content tr:hover {
  background: var(--color-bg-surface-hover);
}

.sl-markdown-content blockquote {
  border-left: 3px solid var(--accent-editorial);
  background: var(--accent-editorial-fill-subtle);
  padding: var(--space-4) var(--space-5);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-style: normal;
}

.sl-markdown-content details {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  margin: var(--space-4) 0;
  background: var(--color-bg-surface);
}

.sl-markdown-content details summary {
  cursor: pointer;
  font-weight: var(--type-weight-semibold);
  font-family: var(--font-body);
  color: var(--accent-editorial);
}

.sl-markdown-content details[open] summary {
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}

.sl-markdown-content a {
  color: var(--accent-editorial);
  text-decoration-color: var(--border-accent);
  text-underline-offset: 0.15em;
  transition: color var(--transition-fast);
}

.sl-markdown-content a:hover {
  color: var(--accent-editorial-hover);
}

/* ============================================================
   Global base
   ============================================================ */
html {
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}

:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

::selection {
  background: var(--accent-editorial-fill);
  color: var(--text-primary);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
EOF
```

- [ ] **Step 3: Check every `var(--…)` on the right-hand side resolves to something defined in tokens.css or this file**

Run:
```bash
grep -oE 'var\(--[a-z0-9-]+' src/styles/starlight-overrides.css | sed 's/var(//' | sort -u | while read v; do
  grep -q -- "^\s*$v:" src/styles/tokens.css src/styles/starlight-overrides.css || echo "UNDEFINED $v"
done
```
Expected: only `UNDEFINED --sl-z-index-navbar` (that one is a Starlight built-in — fine). Anything else listed is a typo to fix before continuing.

- [ ] **Step 4: Check for self-referential declarations**

Run: `grep -nE '^\s*(--[a-z0-9-]+):\s*var\(\1\)' src/styles/starlight-overrides.css; echo "exit=$?"`
Expected: no output, `exit=1` (grep found nothing).

- [ ] **Step 5: Build**

Run: `npm run build 2>&1 | tail -5`
Expected: build success, exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/styles/starlight-overrides.css
git commit -m "feat(design): alias all Starlight/site vars to design-system tokens (dark-only, editorial)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Remove the light theme, pin editorial surface

**Files:**
- Create: `src/components/ThemeProvider.astro`
- Create: `src/components/ThemeSelect.astro`
- Modify: `astro.config.mjs:131-133` (`components` map)

**Interfaces:**
- Produces: `<html data-theme="dark" data-surface="editorial">` on every page, set before first paint; no theme toggle in the header.
- Starlight override points used: `ThemeProvider`, `ThemeSelect` (both are documented Starlight component overrides in 0.37 — see https://starlight.astro.build/reference/overrides/#themeprovider ⚠️ confirm the page lists both before wiring).

- [ ] **Step 1: Write ThemeProvider override**

```bash
cat > src/components/ThemeProvider.astro <<'EOF'
---
/**
 * ThemeProvider — Starlight override.
 *
 * The ShipWithAI design system is dark-first and ships no light tokens, so the
 * course is dark-only. Starlight's default provider reads `starlight-theme`
 * from localStorage and would restore a stale "light" choice; this one
 * ignores storage and pins the theme + editorial surface before first paint.
 */
---

<script is:inline>
	document.documentElement.dataset.theme = 'dark';
	document.documentElement.dataset.surface = 'editorial';
</script>
EOF
```

- [ ] **Step 2: Write ThemeSelect override (renders nothing)**

```bash
cat > src/components/ThemeSelect.astro <<'EOF'
---
/**
 * ThemeSelect — Starlight override.
 * Intentionally empty: the course is dark-only (see ThemeProvider.astro).
 */
---
EOF
```

- [ ] **Step 3: Register both overrides in astro.config.mjs**

Replace:
```js
      components: {
        Footer: './src/components/Footer.astro',
      },
```
with:
```js
      components: {
        Footer: './src/components/Footer.astro',
        // Dark-only: design system ships no light tokens.
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
```

- [ ] **Step 4: Build and inspect the emitted HTML**

Run:
```bash
npm run build 2>&1 | tail -3
grep -c 'starlight-theme-select' dist/en/claude-code/phase-01-foundation/01-installation/index.html
grep -o "dataset.theme = 'dark'" dist/en/claude-code/phase-01-foundation/01-installation/index.html | head -1
grep -c 'data-theme' dist/en/claude-code/phase-01-foundation/01-installation/index.html
```
Expected: build OK; first grep prints `0` (no theme select markup); second prints `dataset.theme = 'dark'`; third prints a number ≥ 0 (informational).

- [ ] **Step 5: Commit**

```bash
git add src/components/ThemeProvider.astro src/components/ThemeSelect.astro astro.config.mjs
git commit -m "feat(design): dark-only theme, pin data-surface=editorial

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Token-ise custom.css and Mermaid theme

**Files:**
- Modify: `src/styles/custom.css:1-12` (sidebar active), `:49-56` (diagram card), `:112` (scroll hint), `:165-171` (expand badge), `:190-205` (modal), `:226-263` (modal controls)
- Modify: `src/scripts/mermaid-client.js:7-20` (`mermaid.initialize`)

**Interfaces:**
- Consumes: `--accent-editorial`, `--accent-editorial-fill`, `--surface-card`, `--surface-elevated`, `--surface-popover`, `--border-default`, `--text-primary`, `--radius-md`, `--radius-lg`, `--radius-sm`, `--type-family-body`.
- Mermaid runs inside an `<svg>` and cannot read CSS custom properties at `initialize()` time reliably, so `themeVariables` hard-codes the hex values that `tokens.css` resolves to. Keep them in sync with the comment above them.

- [ ] **Step 1: Replace the sidebar active-state block (lines 1–12)**

Replace:
```css
[aria-current="page"] {
  color: #ffffff !important;
  background-color: rgba(129, 140, 248, 0.2) !important;
  font-weight: 600;
}

/* Light theme: white text disappears against the pale lavender background.
   Use a dark indigo that matches the accent family instead. */
[data-theme='light'] [aria-current="page"] {
  color: #312e81 !important;
  background-color: rgba(99, 102, 241, 0.18) !important;
}
```
with:
```css
[aria-current="page"] {
  color: var(--text-primary) !important;
  background-color: var(--accent-editorial-fill) !important;
  font-weight: var(--type-weight-semibold);
}
```

- [ ] **Step 2: Replace the diagram card colours**

Replace:
```css
.mermaid-diagram {
  display: block;
  margin: 1.5rem 0;
  padding: 1.25rem 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  min-height: calc(var(--source-lines, 4) * 1.75em);
  box-sizing: border-box;
  position: relative;
}

[data-theme='light'] .mermaid-diagram {
  background: transparent;
}
```
with:
```css
.mermaid-diagram {
  display: block;
  margin: 1.5rem 0;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--surface-card);
  min-height: calc(var(--source-lines, 4) * 1.75em);
  box-sizing: border-box;
  position: relative;
}
```

- [ ] **Step 3: Scroll hint shadow — dark canvas needs a light-on-dark hint**

Replace:
```css
  background-image: linear-gradient(to right, transparent calc(100% - 20px), rgba(0, 0, 0, 0.08) 100%);
```
with:
```css
  background-image: linear-gradient(to right, transparent calc(100% - 20px), rgba(255, 255, 255, 0.06) 100%);
```

- [ ] **Step 4: Expand badge**

Replace:
```css
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border-radius: 4px;
  opacity: 0.55;
```
with:
```css
  background: var(--surface-popover);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  opacity: 0.75;
```

- [ ] **Step 5: Modal surface**

Replace in `.mermaid-modal`:
```css
  border-radius: 12px;
  background: #f8fafc;
```
with:
```css
  border-radius: var(--radius-lg);
  background: var(--surface-elevated);
  border: 1px solid var(--border-default);
```
Replace `.mermaid-modal::backdrop { background: rgba(0, 0, 0, 0.7); }` with `.mermaid-modal::backdrop { background: rgba(0, 0, 0, 0.75); }` (leave as raw — backdrops have no token; ⚠️ that's intentional).

- [ ] **Step 6: Modal close + zoom controls**

In `.mermaid-modal__close`, replace:
```css
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
```
with:
```css
  background: var(--surface-popover);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
```
and `.mermaid-modal__close:hover { background: rgba(0, 0, 0, 0.85); }` → `.mermaid-modal__close:hover { background: var(--surface-card-hover); }`.

In `.mermaid-modal__zoom`, replace `background: rgba(0, 0, 0, 0.6);` → `background: var(--surface-popover); border: 1px solid var(--border-default);` and `border-radius: 8px;` → `border-radius: var(--radius-md);`.
In `.mermaid-modal__zoom > button`, replace `color: #fff;` → `color: var(--text-primary);` and `border-radius: 4px;` → `border-radius: var(--radius-sm);`.
Replace `.mermaid-modal__zoom > button:hover { background: rgba(255, 255, 255, 0.15); }` → `.mermaid-modal__zoom > button:hover { background: var(--surface-card-hover); }`.

- [ ] **Step 7: Mermaid themeVariables → DS palette**

Replace in `src/scripts/mermaid-client.js`:
```js
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  themeVariables: {
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
    fontSize: '14px',
    primaryColor: '#e0e7ff',
    primaryTextColor: '#1f2937',
    primaryBorderColor: '#6366f1',
    lineColor: '#4b5563',
    secondaryColor: '#fef3c7',
    tertiaryColor: '#fee2e2',
  },
});
```
with:
```js
// Values mirror src/styles/tokens.css (dark). Mermaid renders inside <svg> and
// can't read CSS custom properties at initialize() time, so they are literal.
//   surface-card #2a2722 · surface-popover #3a3630 · surface-elevated #1f1d18
//   text-primary #fbf9f4 · text-muted #9b958a
//   accent-editorial #efbf57 · accent-product #34d399
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    darkMode: true,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    background: '#2a2722',
    mainBkg: '#3a3630',
    primaryColor: '#3a3630',
    primaryTextColor: '#fbf9f4',
    primaryBorderColor: '#efbf57',
    secondaryColor: '#1f1d18',
    secondaryTextColor: '#fbf9f4',
    secondaryBorderColor: '#9b958a',
    tertiaryColor: '#2a2722',
    tertiaryTextColor: '#fbf9f4',
    tertiaryBorderColor: '#34d399',
    lineColor: '#9b958a',
    textColor: '#fbf9f4',
    edgeLabelBackground: '#2a2722',
    clusterBkg: '#1f1d18',
    clusterBorder: '#9b958a',
    noteBkgColor: '#3a3630',
    noteTextColor: '#fbf9f4',
    noteBorderColor: '#efbf57',
    actorBkg: '#3a3630',
    actorBorder: '#efbf57',
    actorTextColor: '#fbf9f4',
    signalColor: '#9b958a',
    signalTextColor: '#fbf9f4',
  },
});
```

- [ ] **Step 8: Run the lint gate — should now be nearly clean**

Run: `./scripts/check-design-tokens.sh; echo "exit=$?"`
Expected: the only remaining `❌` is "banned pre-DS colours" pointing at `src/components/Footer.astro` (fixed in Task 6). If `custom.css` or `mermaid-client.js` still appear, fix them before continuing.

- [ ] **Step 9: Build and eyeball a Mermaid page**

Run:
```bash
npm run build 2>&1 | tail -3
npm run preview -- --port 4321 &
sleep 3
```
Then open `http://localhost:4321/en/claude-code/phase-01-foundation/01-installation/` with the `/browse` skill and screenshot the first diagram. Expected: diagram card is warm dark (`#2a2722`), nodes have amber borders and light text, no white/lavender boxes. Click a `.modal` diagram (any page in Phase 7 has large ones): dialog background is dark, controls readable. Kill the preview: `kill %1`.

- [ ] **Step 10: Commit**

```bash
git add src/styles/custom.css src/scripts/mermaid-client.js
git commit -m "feat(design): token-ise sidebar/mermaid styles, dark Mermaid palette

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Footer — drop stale fallbacks

**Files:**
- Modify: `src/components/Footer.astro:99-190` (the `<style>` block; markup unchanged)

**Interfaces:**
- Consumes: `--color-border`, `--color-bg-base`, `--color-text-primary`, `--color-text-muted`, `--color-text-secondary`, `--color-text-faint`, `--color-accent-subtle`, `--color-accent`, `--color-accent-hover`, `--font-heading` (all defined in Task 3).

- [ ] **Step 1: Strip every `var(--x, <raw fallback>)` to `var(--x)` in the footer styles**

Run (sed handles all ten occurrences in one pass):
```bash
sed -i '' -E "s/var\((--[a-z-]+), [^)]*\)/var(\1)/g" src/components/Footer.astro
grep -n 'var(--[a-z-]*,' src/components/Footer.astro; echo "remaining-fallbacks-exit=$?"
```
Expected: `remaining-fallbacks-exit=1` (none left).

- [ ] **Step 2: Fix the one nested case sed can't reach**

The line `font-family: var(--font-heading, 'JetBrains Mono', monospace);` contains a comma inside the fallback. After Step 1 it becomes `var(--font-heading)` — verify:

Run: `grep -n 'font-family' src/components/Footer.astro`
Expected: `font-family: var(--font-heading);` — if it still shows `'JetBrains Mono'`, edit it manually to `font-family: var(--font-heading);`.

- [ ] **Step 3: Use the semibold weight token and body font for the footer logo (serif logo looks off)**

Replace:
```css
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 0.95rem;
```
with:
```css
    font-family: var(--font-body);
    font-weight: var(--type-weight-semibold);
    font-size: 0.95rem;
```

- [ ] **Step 4: Lint gate must be fully clean now**

Run: `./scripts/check-design-tokens.sh; echo "exit=$?"`
Expected: `✅ design-token gate clean` and `exit=0`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Footer.astro
git commit -m "refactor(design): footer uses token aliases only, drop indigo fallbacks

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Full verification (build + visual + gate)

**Files:** none modified (fix-ups go back to the owning task's files).

- [ ] **Step 1: Clean build**

Run: `rm -rf dist .astro && npm run build 2>&1 | tail -8; echo "exit=${PIPESTATUS[0]}"`
Expected: `exit=0`, sitemap generated, no CSS resolution warnings.

- [ ] **Step 2: Gate**

Run: `./scripts/check-design-tokens.sh`
Expected: `✅ design-token gate clean`.

- [ ] **Step 3: No light-theme leftovers in the built output's custom CSS**

Run: `grep -l 'data-theme=.light' dist/_astro/*.css | head; echo "---"; grep -c 'efbf57' dist/_astro/*.css | grep -v ':0' | head -3`
Expected: the first grep may list Starlight's own bundled CSS (it ships light rules — harmless, never activated). The second grep must list at least one CSS file containing the amber accent, proving `tokens.css` was bundled.

- [ ] **Step 4: Visual pass with `/browse`**

Run `npm run preview -- --port 4321 &` then, with the `/browse` skill, screenshot and check each page:

| URL | Check |
|---|---|
| `/en/` | Splash hero: warm dark canvas, amber primary button, Lora headline, Inter body. No theme toggle in header. Language switcher still present. |
| `/vi/` | Same, Vietnamese. |
| `/en/claude-code/phase-01-foundation/01-installation/` | Sidebar active item amber tint; H2 rules use border token; tables, blockquote, `<details>` warm-toned; inline code on `--surface-code`; Mermaid diagram dark. |
| `/en/claude-code/phase-07-multi-agent-auto/03-multi-agent-architecture/` | A `.modal` diagram opens a dark dialog; zoom controls readable. |
| Any page, viewport 390px wide | Mobile header/menu button opens, sidebar readable, no horizontal scroll. |

Kill preview when done: `kill %1`.

- [ ] **Step 5: Regression check on unchanged behaviour**

Run:
```bash
grep -c 'GTM-MJJNTKQR' dist/en/index.html            # expect 2 (head script + noscript)
ls dist/sitemap-index.xml                            # expect present
grep -o 'hreflang="vi"' dist/en/claude-code/phase-01-foundation/01-installation/index.html | head -1
```
Expected: `2`, file present, `hreflang="vi"`.

- [ ] **Step 6: Final commit if any fix-ups were needed, then report**

```bash
git status --short   # should be empty if Tasks 1-6 committed everything
git log --oneline -7
```
Expected: 6 commits from this plan on top of `e1b4736`.

---

## Self-Review

**Spec coverage**
- Vendor tokens.css, no private dependency → Task 1 (script + file), README note.
- Drop light theme → Task 3 (no light block), Task 4 (ThemeProvider/ThemeSelect), Task 5 (custom.css light rules removed), gate check #1.
- Surface editorial → Task 4 sets `data-surface`, Task 3 aliases `--color-accent` to `--accent-editorial`.
- Follow the DS (fonts, palette, indigo ban) → Task 2 fonts, Task 3 aliases, Task 5 Mermaid, gate check #2/#3.
- Keep repo installable + build green → `--ignore-scripts`, build steps in Tasks 2–5, Task 7.

**Placeholder scan** — no TBD/TODO; every code step has full content. The one `⚠️` in Task 4 is a doc-verification prompt, not a placeholder.

**Type/name consistency** — alias names in Task 3 (`--color-accent`, `--accent-editorial-fill`, `--surface-card`, …) match the names consumed in Tasks 5 and 6 and the gate script. `tokens.css` names were verified against the real file in Task 1 Step 5.

**Known trade-offs (not in scope)**
- Starlight's built-in header is kept, not the DS `SiteHeader` molecule (needs the private package or copying ~400 lines of component; revisit if the package goes public).
- `.mermaid-modal::backdrop` and the scroll-hint gradient stay raw `rgba(...)` — the DS has no overlay/scrim token.
- shipwithai.io still carries a duplicate copy of the course under `src/content/docs/{en,vi}/phase-*`; deduplication is a separate decision.
