import { parseDoc } from './parse.mjs';

const FENCE_RE = /^( {0,3})(`{3,}|~{3,})(.*)$/;

export function fixFenceLang(text) {
  const lines = text.split('\n');
  const doc = parseDoc(text);
  for (const s of doc.segments) {
    if (s.type !== 'fence' || s.lang || s.unclosed) continue;
    const m = lines[s.start - 1].match(FENCE_RE);
    lines[s.start - 1] = `${m[1]}${m[2]}text`;
  }
  return lines.join('\n');
}

export function fixFenceNest(text) {
  // One broken outer fence mis-segments everything after it, so fix the first
  // one, re-parse, and repeat until the document has no nested openers.
  let out = text;
  for (let pass = 0; pass < 50; pass++) {
    const next = fixFirstNestedFence(out);
    if (next === out) break;
    out = next;
  }
  return out;
}

function fixFirstNestedFence(text) {
  const lines = text.split('\n');
  const doc = parseDoc(text);
  for (const s of doc.segments) {
    if (s.type !== 'fence' || !s.nestedOpeners.length) continue;
    // Walk from the outer opener; treat fence lines the way the author meant them.
    let depth = 0;
    let maxInner = s.len;
    let closeLine = null;
    for (let i = s.start - 1; i < lines.length; i++) {
      const m = lines[i].match(FENCE_RE);
      if (!m) continue;
      const info = m[3].trim();
      if (info) {
        depth++;
        if (i !== s.start - 1) maxInner = Math.max(maxInner, m[2].length);
      } else {
        depth--;
        if (depth === 0) { closeLine = i; break; }
      }
    }
    if (closeLine === null) continue;
    const newLen = Math.max(4, maxInner + 1);
    const fence = s.char.repeat(newLen);
    const open = lines[s.start - 1].match(FENCE_RE);
    lines[s.start - 1] = `${open[1]}${fence}${open[3]}`;
    const close = lines[closeLine].match(FENCE_RE);
    lines[closeLine] = `${close[1]}${fence}`;
    return lines.join('\n');
  }
  return text;
}

export function applyReplacements(text, relPath, rules) {
  let out = text;
  for (const r of rules) {
    if (r.files && !new RegExp(r.files).test(relPath)) continue;
    const re = r.regex ? new RegExp(r.from, r.flags ?? 'g') : new RegExp(r.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), r.flags ?? 'g');
    out = out.replace(re, r.to);
  }
  return out;
}
