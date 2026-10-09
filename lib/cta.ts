/**
 * Stable CTA ids (ARCHITECTURE v0.2 §8.2, replaces lib/analytics.ts + TrackedLink).
 * Hobby plan: no custom events. CTAs carry `data-cta` attributes only (zero JS) so e2e can address them
 * and the UX event map (user-flows §6) can be re-enabled later without markup changes.
 */
export type CtaId =
  | 'hero_view_work'
  | 'hero_contact'
  | 'path_client_start_project'
  | 'path_client_hire_platform'
  | 'path_recruiter_resume'
  | 'path_recruiter_linkedin'
  | 'path_recruiter_github'
  | 'contact_copy_email'
  | 'work_filter'
  | 'work_open_detail'
  | 'project_link';

export type CtaLocation = 'paths' | 'contact' | 'footer' | 'detail';

export function ctaAttrs(id: CtaId, location?: CtaLocation): Record<string, string> {
  return location ? { 'data-cta': id, 'data-cta-location': location } : { 'data-cta': id };
}
