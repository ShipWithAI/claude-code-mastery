/**
 * Remaps inline Mermaid `style <id> fill:#hex[,stroke:#hex][,color:#hex]`
 * directives from the course content (authored against a light theme) onto the
 * dark design-system palette, preserving the semantic hue (red = danger,
 * green = ok, amber = warning, blue = info, purple = special, grey = neutral).
 *
 * Used at build time by the rehype plugin in astro.config.mjs. Values mirror
 * src/styles/tokens.css and the Mermaid themeVariables in
 * src/scripts/mermaid-client.js.
 */

const TEXT = '#fbf9f4'; // --text-primary

// [maxHue, fill, stroke]. Hue is 0-360; the table is scanned in order.
const HUE_BANDS = [
  [20, '#4a2626', '#f87171'], // red      (--color-state-error)
  [70, '#3f3320', '#efbf57'], // amber    (--accent-editorial)
  [170, '#1f3a2c', '#4ade80'], // green   (--color-state-success)
  [260, '#1e2f45', '#60a5fa'], // blue    (--color-state-info)
  [340, '#352a45', '#a855f7'], // purple  (--color-tier-premium)
  [360, '#4a2626', '#f87171'], // red wraps around
];
const NEUTRAL = ['#3a3630', '#9b958a']; // --surface-popover, --text-muted

function hexToHsl(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue;
  if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) hue = ((b - r) / d + 2) * 60;
  else hue = ((r - g) / d + 4) * 60;
  return { h: hue, s, l };
}

/** Map any hex colour to a { fill, stroke } pair from the dark palette. */
export function darkPairFor(hex) {
  const { h, s } = hexToHsl(hex);
  if (s < 0.15) return { fill: NEUTRAL[0], stroke: NEUTRAL[1] };
  const band = HUE_BANDS.find(([max]) => h < max) ?? HUE_BANDS[HUE_BANDS.length - 1];
  return { fill: band[1], stroke: band[2] };
}

const STYLE_LINE = /^(\s*style\s+[A-Za-z0-9_-]+\s+)(.+)$/gm;
const HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?/;

/**
 * Rewrite every `style X …` line in a Mermaid source string. Lines whose fill
 * is not a hex colour are left untouched.
 */
export function remapMermaidStyles(source) {
  return source.replace(STYLE_LINE, (line, prefix, props) => {
    const entries = props.split(',').map((p) => p.trim()).filter(Boolean);
    const fill = entries.find((p) => p.startsWith('fill:'))?.slice(5).trim();
    if (!fill || !HEX.test(fill)) return line;
    const { fill: darkFill, stroke } = darkPairFor(fill);
    // Keep any props we don't own (e.g. stroke-width, stroke-dasharray).
    const rest = entries.filter((p) => !/^(fill|stroke|color):/.test(p));
    return `${prefix}${['fill:' + darkFill, 'stroke:' + stroke, 'color:' + TEXT, ...rest].join(',')}`;
  });
}
