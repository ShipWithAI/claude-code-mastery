// Fence-aware Markdown parser (CommonMark fenced-code rules only).
// Shared by lint-course.mjs and fix-course.mjs.

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

export function parseDoc(text) {
  const lines = text.split('\n');
  const frontmatter = { fields: {}, endLine: 0 };
  let i = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      for (const l of lines.slice(1, end)) {
        const m = l.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
        if (m) frontmatter.fields[m[1]] = m[2].trim();
      }
      frontmatter.endLine = end + 1;
      i = end + 1;
    }
  }

  const segments = [];
  let open = null;
  let textSeg = null;
  const flushText = (endLine) => {
    if (textSeg) {
      textSeg.end = endLine;
      segments.push(textSeg);
      textSeg = null;
    }
  };

  for (; i < lines.length; i++) {
    const line = lines[i];
    const n = i + 1;
    const m = line.match(FENCE_RE);
    if (open) {
      const sameChar = m && m[1][0] === open.char;
      const longEnough = m && m[1].length >= open.len;
      const info = m ? m[2].trim() : null;
      if (sameChar && longEnough && info === '') {
        open.end = n;
        segments.push(open);
        open = null;
        continue;
      }
      if (sameChar && longEnough && info !== '') open.nestedOpeners.push(n);
      open.lines.push(line);
      continue;
    }
    if (m) {
      flushText(n - 1);
      open = {
        type: 'fence',
        char: m[1][0],
        len: m[1].length,
        lang: m[2].trim().split(/\s+/)[0] || '',
        start: n,
        end: null,
        lines: [],
        nestedOpeners: [],
      };
      continue;
    }
    if (!textSeg) textSeg = { type: 'text', start: n, end: null, lines: [] };
    textSeg.lines.push(line);
  }
  flushText(lines.length);
  if (open) {
    open.unclosed = true;
    open.end = lines.length;
    segments.push(open);
  }
  return { frontmatter, segments, lineCount: lines.length };
}

export function countWords(doc) {
  let n = 0;
  for (const s of doc.segments) {
    if (s.type !== 'text') continue;
    for (const l of s.lines) n += l.split(/\s+/).filter(Boolean).length;
  }
  return n;
}
