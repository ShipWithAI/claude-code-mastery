// Mermaid adaptive rendering client.
// Loaded at build time by astro.config.mjs (fs.readFileSync) and inlined
// as a <script type="module"> in Starlight's head.

import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

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

// Mermaid v11 sets width="100%" + inline max-width on every SVG, which conflicts
// with our strategy-level CSS sizing (collapses .fits to 0x0, compresses .scrolls,
// bloats .modal). Replace with explicit viewBox-derived pixel attrs so our CSS
// can cleanly control final size.
function fixSvgDimensions(svg) {
  const vb = svg.viewBox?.baseVal;
  if (!vb || !vb.width || !vb.height) return;
  svg.setAttribute('width', Math.ceil(vb.width));
  svg.setAttribute('height', Math.ceil(vb.height));
  svg.style.maxWidth = '';
}

// Classifier thresholds (tunable).
const FITS_RATIO_MAX    = 1.05;  // within 5% of container width = fits
const SCROLL_RATIO_MAX  = 2.5;   // up to 2.5x wider = horizontal scroll
const TALL_HEIGHT_RATIO = 1.5;   // H/W_box > 1.5 = modal

function syncTabindex(figure) {
  if (figure.classList.contains('modal')) {
    figure.setAttribute('tabindex', '0');
  } else {
    figure.removeAttribute('tabindex');
  }
}

function classify(figure) {
  // Manual override wins.
  if (figure.dataset.mode) {
    figure.classList.remove('fits', 'scrolls', 'modal');
    // dataset values are 'fit' | 'scroll' | 'modal'; class form is 'fits' | 'scrolls' | 'modal'.
    const classForMode = { fit: 'fits', scroll: 'scrolls', modal: 'modal' }[figure.dataset.mode];
    if (classForMode) figure.classList.add(classForMode);
    syncTabindex(figure);
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
  if      (H_svg > W_box * TALL_HEIGHT_RATIO)   mode = 'modal';    // tall → modal (any width)
  else if (r <= FITS_RATIO_MAX)                 mode = 'fits';     // short AND ≈container → fit
  else if (r <= SCROLL_RATIO_MAX)               mode = 'scrolls';  // short AND ≤2.5× → scroll
  else                                          mode = 'modal';    // very wide → modal

  figure.classList.remove('fits', 'scrolls', 'modal');
  figure.classList.add(mode);
  syncTabindex(figure);
}

// ── Modal singleton ────────────────────────────────────────────────
const MODAL_HTML = `
<dialog class="mermaid-modal" aria-label="Diagram viewer">
  <button type="button" class="mermaid-modal__close" aria-label="Close">✕</button>
  <div class="mermaid-modal__body"></div>
  <div class="mermaid-modal__zoom">
    <button type="button" data-zoom="-" aria-label="Zoom out">−</button>
    <button type="button" data-zoom="0" aria-label="Reset zoom">Reset</button>
    <button type="button" data-zoom="+" aria-label="Zoom in">+</button>
  </div>
</dialog>
`.trim();

function ensureModal() {
  let dialog = document.querySelector('.mermaid-modal');
  if (dialog) return dialog;

  document.body.insertAdjacentHTML('beforeend', MODAL_HTML);
  dialog = document.querySelector('.mermaid-modal');
  const body = dialog.querySelector('.mermaid-modal__body');

  // Close button
  dialog.querySelector('.mermaid-modal__close').addEventListener('click', () => dialog.close());

  // Backdrop click closes (click on the dialog itself, not its children)
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  // On close: clear clone, reset zoom
  dialog.addEventListener('close', () => {
    body.innerHTML = '';
    body.style.setProperty('--zoom', '1');
  });

  // Zoom controls (+ / − / Reset)
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.25;

  function getZoom() {
    return parseFloat(body.style.getPropertyValue('--zoom')) || 1;
  }
  function setZoom(z) {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z));
    body.style.setProperty('--zoom', String(clamped));
  }

  dialog.querySelector('.mermaid-modal__zoom').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-zoom]');
    if (!btn) return;
    const action = btn.dataset.zoom;
    if (action === '+') setZoom(getZoom() + ZOOM_STEP);
    else if (action === '-') setZoom(getZoom() - ZOOM_STEP);
    else if (action === '0') {
      setZoom(1);
      body.scrollTo({ left: 0, top: 0 });
    }
  });

  return dialog;
}

function openModalFor(figure) {
  const dialog = ensureModal();
  const body = dialog.querySelector('.mermaid-modal__body');
  const svg = figure.querySelector('svg');
  if (!svg) return;

  const clone = svg.cloneNode(true);
  // Keep the root id — mermaid emits a <style> block inside the SVG that is
  // scoped by #<id>, so stripping it would drop all node/edge styling in the
  // clone (black shapes, default colours). The duplicate id is only present
  // while the dialog is open and scoped to two visual contexts.
  body.innerHTML = '';
  body.appendChild(clone);
  body.style.setProperty('--zoom', '1');
  body.scrollTo({ left: 0, top: 0 });

  // Copy aria-label from the source figure for screen readers
  const label = figure.getAttribute('aria-label');
  if (label) dialog.setAttribute('aria-label', label);

  dialog.showModal();
}

// Event delegation: click on a .modal figure opens the dialog.
// Listener attached once on document.body — survives SPA nav.
document.body.addEventListener('click', (e) => {
  // Don't trigger when clicking inside the already-open dialog.
  if (e.target.closest('.mermaid-modal')) return;
  const figure = e.target.closest('.mermaid-diagram.modal');
  if (figure) openModalFor(figure);
});

// Keyboard activation: Enter or Space opens the modal when a .modal figure is focused.
document.body.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  if (e.target.closest('.mermaid-modal')) return;
  const figure = e.target.closest?.('.mermaid-diagram.modal');
  if (figure && document.activeElement === figure) {
    e.preventDefault();  // stop Space from scrolling the page
    openModalFor(figure);
  }
});

// Render every mermaid <pre> inside a figure, normalise SVG sizing, classify.
async function renderAndClassify() {
  try {
    await mermaid.run({ querySelector: '.mermaid-diagram pre.mermaid' });
  } catch (err) {
    console.error('[mermaid] render failed:', err);
  }
  document.querySelectorAll('.mermaid-diagram').forEach((fig) => {
    const svg = fig.querySelector('svg');
    if (svg) fixSvgDimensions(svg);
    classify(fig);
  });
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
