/**
 * Header navigation — links back to the shipwithai.io sections, mirroring the
 * design-system SiteHeader used on the main site.
 */
export type Locale = 'en' | 'vi';

const SITE = 'https://shipwithai.io';

export const headerNav: Record<Locale, { label: string; href: string }[]> = {
  en: [
    { label: 'Blog', href: `${SITE}/blog/` },
    { label: 'Toolkit', href: `${SITE}/toolkit/` },
    { label: 'Tips', href: `${SITE}/tips/` },
    { label: 'Community', href: `${SITE}/community/` },
  ],
  vi: [
    { label: 'Blog', href: `${SITE}/vi/blog/` },
    { label: 'Toolkit', href: `${SITE}/vi/toolkit/` },
    { label: 'Mẹo hay', href: `${SITE}/vi/tips/` },
    { label: 'Cộng đồng', href: `${SITE}/vi/community/` },
  ],
};

export const headerCta: Record<Locale, { label: string; fallbackHref: string }> = {
  en: { label: 'Subscribe', fallbackHref: `${SITE}/#newsletter` },
  vi: { label: 'Đăng ký', fallbackHref: `${SITE}/vi/#newsletter` },
};

/** Pages that render the in-page newsletter CTA (see MarkdownContent.astro). */
export function pageHasNewsletter(route: { id?: string; entry?: { data?: { template?: string } } } | undefined): boolean {
  const isSplash = route?.entry?.data?.template === 'splash';
  const isAuthor = /(^|\/)author$/.test(route?.id ?? '');
  return !isSplash && !isAuthor;
}

/**
 * Footer — mirrors the shipwithai.io site footer (Quick Links / Explore /
 * Connect). Course-internal targets stay relative; everything else points back
 * to the main site.
 */
export type FooterLink = { label: string; href: string; external?: boolean };

export const footerLinks: Record<Locale, FooterLink[]> = {
  en: [
    { label: 'Course', href: '/en/' },
    { label: 'Get plugins', href: 'https://github.com/ShipWithAI/shipwithai-plugins', external: true },
    { label: 'Tips', href: `${SITE}/tips/` },
    { label: 'Prompts', href: `${SITE}/prompts/` },
    { label: 'Blog', href: `${SITE}/blog/` },
    { label: 'Cheat Sheet', href: '/en/claude-code/cheat-sheet/' },
    { label: 'About', href: `${SITE}/en/author/` },
  ],
  vi: [
    { label: 'Khóa học', href: '/vi/' },
    { label: 'Cài plugins', href: 'https://github.com/ShipWithAI/shipwithai-plugins', external: true },
    { label: 'Mẹo hay', href: `${SITE}/vi/tips/` },
    { label: 'Prompts', href: `${SITE}/vi/prompts/` },
    { label: 'Blog', href: `${SITE}/vi/blog/` },
    { label: 'Bảng tham chiếu', href: '/vi/claude-code/cheat-sheet/' },
    { label: 'Tác giả', href: `${SITE}/vi/author/` },
  ],
};

export const footerExploreLinks: Record<Locale, FooterLink[]> = {
  en: [
    { label: 'Videos', href: `${SITE}/videos/` },
    { label: 'Showcase', href: `${SITE}/showcase/` },
    { label: 'Tools', href: `${SITE}/tools/` },
    { label: 'Wall of Love', href: `${SITE}/wall/` },
  ],
  vi: [
    { label: 'Videos', href: `${SITE}/vi/videos/` },
    { label: 'Dự án mẫu', href: `${SITE}/vi/showcase/` },
    { label: 'Công cụ', href: `${SITE}/vi/tools/` },
    { label: 'Lời yêu thương', href: `${SITE}/vi/wall/` },
  ],
};

export type SocialId = 'github' | 'linkedin' | 'telegram';

export const socialLinks: { id: SocialId; label: string; href: string }[] = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/ShipWithAI' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/truongnguyenptit' },
  { id: 'telegram', label: 'Telegram', href: 'https://t.me/ShipWithAI' },
];
