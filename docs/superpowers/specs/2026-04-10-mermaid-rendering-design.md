# Design: Mermaid Diagram Rendering (Server-Side SVG)

**Date**: 2026-04-10
**Status**: Approved
**Scope**: Add `rehype-mermaid` to render Mermaid code blocks as inline SVGs at build time

---

## Problem

The course site (Astro + Starlight at course.shipwithai.io) contains 20+ Mermaid diagrams written as ` ```mermaid ``` ` code blocks across English and Vietnamese modules. They currently render as plain code text — unreadable as diagrams.

---

## Chosen Approach

**Server-side SVG via `rehype-mermaid` + Playwright (Approach A)**

Mermaid diagrams are rendered to inline SVGs at build time using a headless Chromium instance. Zero JavaScript is shipped to the browser. Diagrams are baked into the HTML output.

Rejected alternatives:
- **Client-side mermaid.js** — flash of raw code text, adds ~1MB JS per page, unreliable for PDF export
- **`remark-mermaidjs`** — functionally equivalent to `rehype-mermaid` but less maintained with Astro

---

## Architecture

```
Current:
  .md files → Remark → Rehype → HTML  (mermaid blocks = <code> text)

New:
  .md files → Remark → Rehype → rehype-mermaid → SVG → HTML
                                      ↑
                              Playwright (headless Chromium)
                              renders each diagram → inline SVG
```

- Playwright spins up once per build, reuses across all diagrams
- Estimated build time increase: ~10–30 seconds for ~20 diagrams
- Zero changes to any `.md` content files

---

## Dependencies

| Package | Purpose |
|---|---|
| `rehype-mermaid` | Rehype plugin — intercepts mermaid code blocks, coordinates rendering |
| `playwright` | Provides headless Chromium for diagram rendering |

---

## Configuration

**File changed: `astro.config.mjs`**

Add to the existing `markdown` config:

```js
export default defineConfig({
  markdown: {
    rehypePlugins: [
      ['rehype-mermaid', {
        strategy: 'inline-svg',   // embed SVG directly in HTML
        errorFallback: 'error'    // fail build on bad mermaid syntax
      }]
    ],
  },
  integrations: [starlight({ /* unchanged */ })]
})
```

No other files require changes.

---

## CI/CD Setup

Playwright requires a Chromium binary in the build environment. Add a pre-build install step:

| Environment | Command |
|---|---|
| Local (first time) | `npx playwright install chromium` |
| Vercel / Netlify | Add `playwright install chromium` as a build step before `astro build` |
| GitHub Actions | Add `npx playwright install --with-deps chromium` to workflow |

---

## Error Handling

- `errorFallback: 'error'` — build fails on any invalid Mermaid syntax
- This catches broken diagrams at build time, not in production
- Both EN and VI content paths go through the same plugin (no special handling needed)

---

## Testing Plan

1. **Local smoke test** — `npm run build` → `npm run preview` → verify 3–4 diagram pages render correctly
2. **Bilingual check** — confirm `/en/` and `/vi/` diagram pages both render (same code blocks, same build path)
3. **CI dry run** — confirm `playwright install chromium` succeeds in the build environment before merging to main

---

## Out of Scope

- Dark mode diagram theming (Mermaid supports themes — follow-up task)
- Dev-mode performance optimization (only if slow dev experience becomes a real issue)
- PDF/print rendering (Pandoc pipeline is separate and unaffected)
