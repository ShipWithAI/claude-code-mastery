// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Lightweight rehype plugin: converts ```mermaid code blocks to <figure class="mermaid-diagram"> for client-side rendering. */
const VALID_MODES = ['fit', 'scroll', 'modal'];

function rehypeMermaidPre() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (
        node.tagName === 'pre' &&
        node.children?.length === 1 &&
        node.children[0].tagName === 'code' &&
        node.children[0].properties?.className?.includes('language-mermaid')
      ) {
        const code = node.children[0];
        let text = code.children?.find((c) => c.type === 'text')?.value || '';

        // Parse manual override directive: %% mode:fit|scroll|modal %%
        const directiveRe = /^\s*%%\s*mode:([a-z]+)\s*%%\s*$/m;
        const match = text.match(directiveRe);
        let mode = null;
        if (match) {
          mode = match[1];
          if (!VALID_MODES.includes(mode)) {
            throw new Error(
              `[rehypeMermaidPre] Invalid mode "${mode}" in mermaid directive. ` +
              `Valid values: ${VALID_MODES.join(', ')}.`
            );
          }
          text = text.replace(directiveRe, '').replace(/^\n+/, '');
        }

        const sourceLines = Math.max(3, text.split('\n').length);

        const figureProps = {
          className: ['mermaid-diagram'],
          role: 'img',
          'aria-label': 'Diagram',
          style: `--source-lines: ${sourceLines}`,
        };
        if (mode) figureProps['data-mode'] = mode;

        parent.children[index] = {
          type: 'element',
          tagName: 'figure',
          properties: figureProps,
          children: [
            {
              type: 'element',
              tagName: 'pre',
              properties: { className: ['mermaid'] },
              children: [{ type: 'text', value: text }],
            },
            {
              type: 'element',
              tagName: 'figcaption',
              properties: { className: ['sr-only'] },
              children: [{ type: 'text', value: text }],
            },
          ],
        };
      }
    });
  };
}

const mermaidClientScript = readFileSync(
  fileURLToPath(new URL('./src/scripts/mermaid-client.js', import.meta.url)),
  'utf-8'
);

export default defineConfig({
  site: 'https://course.shipwithai.io',
  markdown: {
    rehypePlugins: [rehypeMermaidPre],
  },
  integrations: [
    starlight({
      title: 'Claude Code Mastery',
      description: 'The most comprehensive course on mastering Claude Code — from foundation to production. By ShipWithAI.',
      head: [
        {
          tag: 'script',
          attrs: { type: 'module' },
          content: mermaidClientScript,
        },
        {
          tag: 'script',
          content: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MJJNTKQR');`,
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: 'https://course.shipwithai.io/og-image.png' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:width', content: '1200' },
        },
        {
          tag: 'meta',
          attrs: { property: 'og:image:height', content: '630' },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: 'https://course.shipwithai.io/og-image.png' },
        },
      ],
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
      components: {
        Footer: './src/components/Footer.astro',
      },
      logo: {
        src: './src/assets/shipwithailogo.png',
        alt: 'ShipWithAI Logo',
        replacesTitle: false,
      },
      defaultLocale: 'en',
      locales: {
        en: { label: 'English', lang: 'en' },
        vi: { label: 'Tiếng Việt', lang: 'vi' },
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/shipwithai/claude-code-mastery' },
        { icon: 'x.com', label: 'X', href: 'https://x.com/shipwithaiio' },
        { icon: 'telegram', label: 'Community', href: 'https://t.me/ShipWithAI' },
      ],
      sidebar: [
        {
          label: 'Start Here',
          translations: { vi: 'Bắt đầu' },
          items: [
            { slug: 'author' },
            { slug: 'claude-code/cheat-sheet' },
            { slug: 'claude-code/tips-tricks' },
          ],
        },
        {
          label: 'Phase 1: Foundation',
          translations: { vi: 'Giai đoạn 1: Nền Tảng' },
          autogenerate: { directory: 'claude-code/phase-01-foundation' },
        },
        {
          label: 'Phase 2: Security',
          translations: { vi: 'Giai đoạn 2: Bảo Mật' },
          autogenerate: { directory: 'claude-code/phase-02-security' },
        },
        {
          label: 'Phase 3: Core Workflows',
          translations: { vi: 'Giai đoạn 3: Quy Trình Cốt Lõi' },
          autogenerate: { directory: 'claude-code/phase-03-core-workflows' },
        },
        {
          label: 'Phase 4: Prompt & Memory',
          translations: { vi: 'Giai đoạn 4: Prompt & Bộ Nhớ' },
          autogenerate: { directory: 'claude-code/phase-04-prompt-memory' },
        },
        {
          label: 'Phase 5: Context Mastery',
          translations: { vi: 'Giai đoạn 5: Làm Chủ Context' },
          autogenerate: { directory: 'claude-code/phase-05-context-mastery' },
        },
        {
          label: 'Phase 6: Thinking & Planning',
          translations: { vi: 'Giai đoạn 6: Tư Duy & Lập Kế Hoạch' },
          autogenerate: { directory: 'claude-code/phase-06-thinking-planning' },
        },
        {
          label: 'Phase 7: Multi-Agent & Auto',
          translations: { vi: 'Giai đoạn 7: Đa Agent & Tự Động' },
          autogenerate: { directory: 'claude-code/phase-07-multi-agent-auto' },
        },
        {
          label: 'Phase 8: Meta-Debugging',
          translations: { vi: 'Giai đoạn 8: Debug AI' },
          autogenerate: { directory: 'claude-code/phase-08-meta-debugging' },
        },
        {
          label: 'Phase 9: Legacy & Brownfield',
          translations: { vi: 'Giai đoạn 9: Code Cũ' },
          autogenerate: { directory: 'claude-code/phase-09-legacy-brownfield' },
        },
        {
          label: 'Phase 10: Team Collaboration',
          translations: { vi: 'Giai đoạn 10: Làm Việc Nhóm' },
          autogenerate: { directory: 'claude-code/phase-10-team-collaboration' },
        },
        {
          label: 'Phase 11: Automation & Headless',
          translations: { vi: 'Giai đoạn 11: Tự Động Hóa' },
          autogenerate: { directory: 'claude-code/phase-11-automation-headless' },
        },
        {
          label: 'Phase 12: n8n Workflows',
          translations: { vi: 'Giai đoạn 12: n8n Workflows' },
          autogenerate: { directory: 'claude-code/phase-12-n8n-workflows' },
        },
        {
          label: 'Phase 13: Data & Analysis',
          translations: { vi: 'Giai đoạn 13: Dữ Liệu & Phân Tích' },
          autogenerate: { directory: 'claude-code/phase-13-data-analysis' },
        },
        {
          label: 'Phase 14: Optimization',
          translations: { vi: 'Giai đoạn 14: Tối Ưu Hóa' },
          autogenerate: { directory: 'claude-code/phase-14-optimization' },
        },
        {
          label: 'Phase 15: Templates & Skills',
          translations: { vi: 'Giai đoạn 15: Templates & Skills' },
          autogenerate: { directory: 'claude-code/phase-15-templates-skills' },
        },
        {
          label: 'Phase 16: Real-World Mastery',
          translations: { vi: 'Giai đoạn 16: Thực Chiến' },
          autogenerate: { directory: 'claude-code/phase-16-real-world-mastery' },
        },
      ],
    }),
    sitemap(),
  ],
});
