declare function gtag(...args: unknown[]): void;

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/** Send a GA4 event. No-op in SSR and when GA fails to load. */
export const trackEvent = (
  eventName: string,
  params?: Record<string, string>,
): void => {
  if (typeof window === "undefined" || typeof gtag === "undefined") return;
  gtag("event", eventName, params);
};

/** Fire when the user clicks the Download CV button. */
export const trackCVDownload = (): void =>
  trackEvent("cv_download", { event_category: "engagement" });

/** Fire when the user clicks a contact link. */
export const trackContactClick = (method: "email" | "github" | "twitter" | "linkedin"): void =>
  trackEvent("contact_click", { event_category: "engagement", method });

/** Fire when the user clicks a project card or link. */
export const trackProjectClick = (projectName: string): void =>
  trackEvent("project_click", { event_category: "portfolio", project: projectName });

/** Fire when the user clicks a blog post link. */
export const trackBlogPostClick = (postTitle: string): void =>
  trackEvent("blog_post_click", { event_category: "content", post: postTitle });

/** Fire when the user clicks a writing entry. */
export const trackWritingClick = (title: string): void =>
  trackEvent("writing_click", { event_category: "content", title });

/** Fire when the resume page mounts. */
export const trackResumeView = (): void =>
  trackEvent("resume_view", { event_category: "engagement" });

/** Fire at scroll depth thresholds (25, 50, 75, 100). */
export const trackScrollDepth = (depth: number): void =>
  trackEvent("scroll_depth", { event_category: "engagement", depth: `${depth}%` });

export { GA_ID };
