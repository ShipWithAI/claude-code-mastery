// Mermaid adaptive rendering client.
// Loaded at build time by astro.config.mjs (fs.readFileSync) and inlined
// as a <script type="module"> in Starlight's head.

import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

mermaid.initialize({ startOnLoad: false, theme: 'dark' });

// Classifier thresholds (tunable).
const FITS_RATIO_MAX    = 1.05;  // within 5% of container width = fits
const SCROLL_RATIO_MAX  = 2.5;   // up to 2.5x wider = horizontal scroll
const TALL_HEIGHT_RATIO = 1.5;   // H/W_box > 1.5 = modal

function classify(figure) {
  // Manual override wins.
  if (figure.dataset.mode) {
    figure.classList.remove('fits', 'scrolls', 'modal');
    // dataset values are 'fit' | 'scroll' | 'modal'; class form is 'fits' | 'scrolls' | 'modal'.
    const classForMode = { fit: 'fits', scroll: 'scrolls', modal: 'modal' }[figure.dataset.mode];
    if (classForMode) figure.classList.add(classForMode);
    return;
  }

  const svg = figure.querySelector('svg');
  if (!svg || !svg.viewBox?.baseVal) return;  // pre-render or error state

  const vb = svg.viewBox.baseVal;
  const W_svg = vb.width;
  const H_svg = vb.height;
  const W_box = figure.clientWidth;
  if (W_box === 0) return;  // not yet laid out

  const r = W_svg / W_box;

  let mode;
  if      (r <= FITS_RATIO_MAX)                 mode = 'fits';
  else if (H_svg > W_box * TALL_HEIGHT_RATIO)   mode = 'modal';
  else if (r <= SCROLL_RATIO_MAX)               mode = 'scrolls';
  else                                          mode = 'modal';

  figure.classList.remove('fits', 'scrolls', 'modal');
  figure.classList.add(mode);
}

// Render every mermaid <pre> inside a figure and classify each figure.
async function renderAndClassify() {
  try {
    await mermaid.run({ querySelector: '.mermaid-diagram pre.mermaid' });
  } catch (err) {
    console.error('[mermaid] render failed:', err);
  }
  document.querySelectorAll('.mermaid-diagram').forEach(classify);
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

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.querySelectorAll('.mermaid-diagram').forEach(classify);
  }, 200);
});
