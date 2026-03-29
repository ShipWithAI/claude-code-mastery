// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://course.shipwithai.io',
  integrations: [
    starlight({
      title: 'Claude Code Mastery',
      description: 'The most comprehensive course on mastering Claude Code — from foundation to production. By ShipWithAI.',
      customCss: [
        './src/styles/custom.css',
      ],
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
            { slug: 'cheat-sheet' },
            { slug: 'tips-tricks' },
          ],
        },
        {
          label: 'Phase 1: Foundation',
          translations: { vi: 'Giai đoạn 1: Nền Tảng' },
          autogenerate: { directory: 'phase-01-foundation' },
        },
        {
          label: 'Phase 2: Security',
          translations: { vi: 'Giai đoạn 2: Bảo Mật' },
          autogenerate: { directory: 'phase-02-security' },
        },
        {
          label: 'Phase 3: Core Workflows',
          translations: { vi: 'Giai đoạn 3: Quy Trình Cốt Lõi' },
          autogenerate: { directory: 'phase-03-core-workflows' },
        },
        {
          label: 'Phase 4: Prompt & Memory',
          translations: { vi: 'Giai đoạn 4: Prompt & Bộ Nhớ' },
          autogenerate: { directory: 'phase-04-prompt-memory' },
        },
        {
          label: 'Phase 5: Context Mastery',
          translations: { vi: 'Giai đoạn 5: Làm Chủ Context' },
          autogenerate: { directory: 'phase-05-context-mastery' },
        },
        {
          label: 'Phase 6: Thinking & Planning',
          translations: { vi: 'Giai đoạn 6: Tư Duy & Lập Kế Hoạch' },
          autogenerate: { directory: 'phase-06-thinking-planning' },
        },
        {
          label: 'Phase 7: Multi-Agent & Auto',
          translations: { vi: 'Giai đoạn 7: Đa Agent & Tự Động' },
          autogenerate: { directory: 'phase-07-multi-agent-auto' },
        },
        {
          label: 'Phase 8: Meta-Debugging',
          translations: { vi: 'Giai đoạn 8: Debug AI' },
          autogenerate: { directory: 'phase-08-meta-debugging' },
        },
        {
          label: 'Phase 9: Legacy & Brownfield',
          translations: { vi: 'Giai đoạn 9: Code Cũ' },
          autogenerate: { directory: 'phase-09-legacy-brownfield' },
        },
        {
          label: 'Phase 10: Team Collaboration',
          translations: { vi: 'Giai đoạn 10: Làm Việc Nhóm' },
          autogenerate: { directory: 'phase-10-team-collaboration' },
        },
        {
          label: 'Phase 11: Automation & Headless',
          translations: { vi: 'Giai đoạn 11: Tự Động Hóa' },
          autogenerate: { directory: 'phase-11-automation-headless' },
        },
        {
          label: 'Phase 12: n8n Workflows',
          translations: { vi: 'Giai đoạn 12: n8n Workflows' },
          autogenerate: { directory: 'phase-12-n8n-workflows' },
        },
        {
          label: 'Phase 13: Data & Analysis',
          translations: { vi: 'Giai đoạn 13: Dữ Liệu & Phân Tích' },
          autogenerate: { directory: 'phase-13-data-analysis' },
        },
        {
          label: 'Phase 14: Optimization',
          translations: { vi: 'Giai đoạn 14: Tối Ưu Hóa' },
          autogenerate: { directory: 'phase-14-optimization' },
        },
        {
          label: 'Phase 15: Templates & Skills',
          translations: { vi: 'Giai đoạn 15: Templates & Skills' },
          autogenerate: { directory: 'phase-15-templates-skills' },
        },
        {
          label: 'Phase 16: Real-World Mastery',
          translations: { vi: 'Giai đoạn 16: Thực Chiến' },
          autogenerate: { directory: 'phase-16-real-world-mastery' },
        },
      ],
    }),
    sitemap(),
  ],
});
