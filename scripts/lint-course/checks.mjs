import fs from 'node:fs';
import { countWords } from './parse.mjs';

const SHELL_LANGS = new Set(['bash', 'sh', 'shell', 'zsh']);

export function loadConfig(path) {
  const cfg = JSON.parse(fs.readFileSync(path, 'utf8'));
  cfg.blacklist = cfg.blacklist.map((b) => ({ ...b, re: new RegExp(b.pattern) }));
  return cfg;
}

// checkFrontmatter: false for files outside src/content/docs (e.g. templates/), which are
// plain markdown with no Starlight frontmatter but must still pass fence/blacklist checks.
export function checkDoc(doc, { relPath, config, isModule, checkFrontmatter = true }) {
  const issues = [];
  const push = (level, rule, line, message) => issues.push({ level, rule, line, message });
  const mdLangs = new Set(config.markdownLangs);

  // frontmatter
  if (checkFrontmatter) {
    for (const k of config.frontmatter.required) {
      if (!(k in doc.frontmatter.fields)) push('error', 'frontmatter-required', 1, `thiếu frontmatter \`${k}\``);
    }
    for (const k of config.frontmatter.recommended) {
      if (!(k in doc.frontmatter.fields))
        push(config.frontmatter.recommendedLevel, 'frontmatter-recommended', 1, `thiếu frontmatter \`${k}\``);
    }
  }

  let h2 = 0;
  for (const s of doc.segments) {
    if (s.type === 'fence') {
      if (s.unclosed) push('error', 'fence-unclosed', s.start, 'fence mở nhưng không đóng');
      if (!s.lang) push('error', 'fence-lang', s.start, 'fence thiếu language (dùng `text` cho output)');
      for (const n of s.nestedOpeners)
        push('error', 'fence-nested', n, `fence mở bên trong fence mở ở dòng ${s.start} — nâng fence ngoài lên 4 backtick`);
      if (!mdLangs.has(s.lang)) {
        // `## ` inside a shell heredoc (cat > CLAUDE.md <<'EOF' … EOF) is legitimate content.
        let heredocEnd = null;
        s.lines.forEach((l, i) => {
          if (heredocEnd) {
            if (l.trim() === heredocEnd) heredocEnd = null;
            return;
          }
          const hd = SHELL_LANGS.has(s.lang) && l.match(/<<-?\s*['"]?([A-Za-z_]\w*)['"]?/);
          if (hd) { heredocEnd = hd[1]; return; }
          if (/^## /.test(l)) push('error', 'hash-in-fence', s.start + 1 + i, 'dòng `## ` trong code block không phải markdown (relabel fence thành `markdown` nếu nội dung là markdown)');
        });
      }
      s.lines.forEach((l, i) => checkBlacklist(l, s.start + 1 + i));
      continue;
    }
    s.lines.forEach((l, i) => {
      const line = s.start + i;
      if (/^## /.test(l)) h2++;
      checkBlacklist(l, line);
      if (
        l.length > config.lineWidth.limit &&
        !l.trimStart().startsWith('|') &&
        !/https?:\/\/\S{40,}/.test(l)
      ) {
        push(config.lineWidth.level, 'line-width', line, `${l.length} ký tự (> ${config.lineWidth.limit})`);
      }
    });
  }

  function checkBlacklist(l, line) {
    for (const b of config.blacklist) {
      if (b.re.test(l)) push(b.level, 'blacklist', line, `\`${b.pattern}\` — ${b.note}`);
    }
  }

  if (isModule) {
    if (h2 !== config.h2Count) push('error', 'h2-count', 1, `có ${h2} H2, cần đúng ${config.h2Count}`);
    const words = countWords(doc);
    if (words > config.words.max) push(config.words.maxLevel, 'words-max', 1, `${words} từ (> ${config.words.max})`);
    else if (words > config.words.warn) push('warn', 'words-warn', 1, `${words} từ (> ${config.words.warn})`);
  }

  return issues;
}
