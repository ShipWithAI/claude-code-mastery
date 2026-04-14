/**
 * course-analytics.ts — GA4 events for course.shipwithai.io via GTM dataLayer.
 *
 * Events tracked:
 *   1. course_module_start    → user views a course module page
 *   2. course_module_complete → user clicks "Next" link (Starlight pagination or inline)
 *   3. course_phase_complete  → user completes last module of a phase (clicks Next to new phase)
 *   4. course_code_copy       → user copies a code block (Starlight built-in copy button)
 *   5. course_nav_click       → user clicks sidebar navigation
 *
 * URL pattern: /en/claude-code/phase-01-foundation/01-installation/
 *              /vi/claude-code/phase-02-security/03-sandbox/
 *
 * Self-initializes on DOMContentLoaded.
 */

declare global {
	interface Window {
		dataLayer: Record<string, unknown>[];
	}
}

function pushEvent(eventName: string, params: Record<string, unknown> = {}) {
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({
		event: eventName,
		...params,
	});
}

// ── Helpers: extract module/phase info from URL ─────────────
function getLocale(): string {
	return window.location.pathname.startsWith('/vi') ? 'vi' : 'en';
}

function getPhaseId(): string {
	// Extract "phase-01-foundation" → "phase-01" from URL
	const match = window.location.pathname.match(/phase-(\d{2})/);
	return match ? `phase-${match[1]}` : '';
}

function getModuleId(): string {
	// Extract "phase-01-foundation/01-installation" as module_id
	const match = window.location.pathname.match(/(phase-\d{2}[^/]*\/\d{2}-[^/]*)/);
	return match ? match[1] : '';
}

function isCoursePage(): boolean {
	return /\/(en|vi)\/claude-code\/phase-\d{2}/.test(window.location.pathname);
}

// ── Helpers: detect phase transition from a link ────────────
function getTargetPhaseFromHref(href: string): string | null {
	const match = href.match(/phase-(\d{2})/);
	return match ? `phase-${match[1]}` : null;
}

// ── Event 1: course_module_start ────────────────────────────
// Fires once when user loads a course module page
function initCourseModuleStart() {
	if (!isCoursePage()) return;

	const moduleId = getModuleId();
	if (!moduleId) return;

	// Fire once per module per session
	const key = `swa_module_start_${moduleId}`;
	if (sessionStorage.getItem(key)) return;
	sessionStorage.setItem(key, '1');

	pushEvent('course_module_start', {
		module_id: moduleId,
		phase_id: getPhaseId(),
		locale: getLocale(),
	});
}

// ── Event 2 & 3: course_module_complete + course_phase_complete
// Fires when user clicks Starlight's "Next" pagination or inline "> **Next**:" links
function initCourseCompletionTracking() {
	if (!isCoursePage()) return;

	document.addEventListener('click', (e) => {
		const link = (e.target as HTMLElement).closest('a');
		if (!link) return;

		const href = link.getAttribute('href') || '';

		// Detect Starlight pagination "Next" button
		const isPaginationNext = link.closest('.pagination-links')
			? link.getAttribute('rel') === 'next'
			: false;

		// Detect inline "> **Next**:" markdown links (contain "→" or arrow)
		const isInlineNext =
			!isPaginationNext &&
			(link.textContent?.includes('→') || link.textContent?.includes('Next')) &&
			href.includes('phase-');

		if (!isPaginationNext && !isInlineNext) return;

		const currentPhase = getPhaseId();
		const moduleId = getModuleId();

		// Always fire course_module_complete
		pushEvent('course_module_complete', {
			module_id: moduleId,
			phase_id: currentPhase,
			locale: getLocale(),
		});

		// Check if this is a phase transition (Next link goes to a different phase)
		const targetPhase = getTargetPhaseFromHref(href);
		if (targetPhase && targetPhase !== currentPhase) {
			pushEvent('course_phase_complete', {
				phase_id: currentPhase,
				locale: getLocale(),
			});
		}
	});
}

// ── Event 4: course_code_copy ───────────────────────────────
// Starlight renders copy buttons on code blocks with class "copy"
// We listen for clicks on those buttons
function initCourseCodeCopy() {
	if (!isCoursePage()) return;

	// Starlight's copy button: <button class="copy">...</button>
	// It may be rendered with slight delay, so use delegation
	document.addEventListener('click', (e) => {
		const btn = (e.target as HTMLElement).closest('button.copy, button[data-copy]');
		if (!btn) return;

		pushEvent('course_code_copy', {
			page_path: window.location.pathname,
			module_id: getModuleId(),
			locale: getLocale(),
		});
	});
}

// ── Event 5: course_nav_click ───────────────────────────────
// Track clicks on Starlight sidebar navigation
function initCourseNavClick() {
	if (!isCoursePage()) return;

	// Starlight sidebar: <nav aria-label="Main"> or <starlight-menu-button>
	const sidebar = document.querySelector('nav.sidebar-content, [data-pagefind-ignore] nav, nav[aria-label="Main"]');
	if (!sidebar) return;

	sidebar.addEventListener('click', (e) => {
		const link = (e.target as HTMLElement).closest('a');
		if (!link) return;

		pushEvent('course_nav_click', {
			page_path: window.location.pathname,
			module_id: getModuleId(),
			locale: getLocale(),
		});
	});
}

// ── Initialize ──────────────────────────────────────────────
function init() {
	if (typeof window === 'undefined') return;

	initCourseModuleStart();
	initCourseCompletionTracking();
	initCourseCodeCopy();
	initCourseNavClick();
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}

export {};
