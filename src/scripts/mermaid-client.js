// Mermaid adaptive rendering client.
// Loaded at build time by astro.config.mjs (fs.readFileSync) and inlined
// as a <script type="module"> in Starlight's head.

import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

// Render every mermaid <pre> inside a figure and (later) classify each figure.
async function renderAndClassify() {
  try {
    await mermaid.run({ querySelector: '.mermaid-diagram pre.mermaid' });
  } catch (err) {
    console.error('[mermaid] render failed:', err);
  }
  // classifier + modal wiring added in later tasks
}

// Fire on SPA nav (if view transitions are enabled) AND on initial load.
// mermaid.run() skips already-processed <pre> elements (data-processed="true"),
// so running twice is a no-op.
document.addEventListener('astro:page-load', renderAndClassify);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderAndClassify);
} else {
  renderAndClassify();
}
