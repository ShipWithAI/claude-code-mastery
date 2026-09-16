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
