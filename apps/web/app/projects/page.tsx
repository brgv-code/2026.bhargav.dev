import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { fetchBlogListPosts, fetchProjectsFromPayload } from "@/lib/data/cms";
import { renderMarkdown } from "@/lib/markdown";
import { caseStudyAnchor } from "@/lib/format";
import { cn } from "@/lib/utils";
import { absoluteUrl, siteName, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { SidebarLinkPanel } from "@/components/sections/sidebar-link-panel";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects and case notes.",
  alternates: {
    canonical: absoluteUrl("/projects"),
  },
  openGraph: {
    type: "website",
    title: "Projects",
    description: "Selected projects and case notes.",
    url: absoluteUrl("/projects"),
    siteName,
    images: [
      {
        url: "/og-projects.svg",
        width: 1200,
        height: 630,
        alt: "Projects",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects",
    description: "Selected projects and case notes.",
    images: ["/og-projects.svg"],
  },
};

export const dynamic = "force-static";
export const revalidate = 300;

function formatStatus(status?: string | null) {
  if (!status) return null;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function toYearDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (/^\d{4}$/.test(value)) return `${value}-01-01`;
  return undefined;
}

export default async function ProjectsPage() {
  const [projects, posts] = await Promise.all([
    fetchProjectsFromPayload(),
    fetchBlogListPosts(3),
  ]);

  const entries =
    projects.length > 0
      ? await Promise.all(
          projects.map(async (project) => {
            let detail: ReactNode = null;

            if (project.markdownInput) {
              detail = await renderMarkdown(project.markdownInput);
            } else if (project.contentHtml) {
              detail = (
                <div
                  className="article-prose"
                  dangerouslySetInnerHTML={{ __html: project.contentHtml }}
                />
              );
            }

            return { project, detail };
          }),
        )
      : [];

  const listJsonLd =
    projects.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: projects.map((project, index) => {
            const title = project.title ?? project.name;
            const url = project.url || absoluteUrl("/projects");
            const keywords = project.tech
              ?.map((entry) => entry?.label?.trim())
              .filter((label): label is string => Boolean(label))
              .join(", ");
            const offer =
              project.offers &&
              (project.offers.price ||
                project.offers.priceCurrency ||
                project.offers.availability ||
                project.offers.url)
                ? {
                    "@type": "Offer",
                    price: project.offers.price ?? undefined,
                    priceCurrency: project.offers.priceCurrency ?? undefined,
                    availability: project.offers.availability ?? undefined,
                    url: project.offers.url ?? undefined,
                  }
                : undefined;
            const hasAppFields = Boolean(
              project.applicationCategory ||
                project.operatingSystem ||
                offer,
            );

            return {
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": hasAppFields ? "SoftwareApplication" : "CreativeWork",
                name: title,
                url,
                description: project.description,
                creator: { "@id": `${siteUrl}#person` },
                dateCreated: toYearDate(project.year),
                keywords: keywords || undefined,
                applicationCategory: project.applicationCategory ?? undefined,
                operatingSystem: project.operatingSystem ?? undefined,
                offers: offer,
              },
            };
          }),
        }
      : null;

  return (
    <>
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold text-primary">Projects</h1>
      </div>

      <BreadcrumbsJsonLd
        id="projects-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Projects", href: absoluteUrl("/projects") },
        ]}
      />
      {listJsonLd ? <JsonLd id="projects-list" data={listJsonLd} /> : null}

      <div
        className={cn(
          "grid min-h-0",
          posts.length > 0
            ? "grid-cols-1 xl:grid-cols-home-main"
            : "grid-cols-1",
        )}
      >
        <div
          className={cn(
            "min-w-0",
            posts.length > 0 && "xl:border-r xl:border-border",
          )}
        >
          <section aria-label="Project list" className="pb-24">
            {projects.length === 0 ? (
              <p className="px-6 py-10 text-sm text-secondary border-b border-border">
                No projects published yet. Check back soon.
              </p>
            ) : (
              <div>
                {entries.map(({ project, detail }) => {
              const title = project.title ?? project.name;
              const techLabels = Array.isArray(project.tech)
                ? project.tech
                    .map((entry) => entry?.label)
                    .filter((label): label is string => Boolean(label))
                : [];
              const statusLabel = formatStatus(project.status ?? null);
              const metaParts = [project.year ?? "", statusLabel ?? ""].filter(
                Boolean,
              );

              return (
                <article
                  key={project.id}
                  id={`project-${project.id}`}
                  className="border-b border-border px-6 py-6 content-visibility-auto"
                >
                  <div className="flex flex-col gap-4 max-w-3xl">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="min-w-0 text-sm font-semibold text-primary leading-snug">
                        {project.url ? (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-accent transition-colors duration-normal inline-flex items-center gap-1.5"
                          >
                            {title}
                            <ExternalLink
                              size={12}
                              className="shrink-0 text-muted"
                              aria-hidden="true"
                            />
                          </a>
                        ) : (
                          title
                        )}
                      </h3>
                      {metaParts.length ? (
                        <p className="text-xs text-muted shrink-0 tabular-nums">
                          {metaParts.join(" · ")}
                        </p>
                      ) : null}
                    </div>

                    {project.description ? (
                      <p className="text-xs text-secondary leading-relaxed">
                        {project.description}
                      </p>
                    ) : null}

                    {detail ? (
                      <div className="article-prose">{detail}</div>
                    ) : null}

                    {techLabels.length ? (
                      <div className="flex flex-wrap gap-1">
                        {techLabels.map((label, i) => (
                          <span
                            key={`${label}-${i}`}
                            className="px-1.5 py-0.5 text-2xs font-semibold bg-tag-bg text-tag-text"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {project.github ? (
                      <div className="pt-1">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-2xs text-muted hover:text-primary transition-colors duration-normal"
                        >
                          GitHub →
                        </a>
                      </div>
                    ) : null}
                  </div>
                </article>
                );
              })}
              </div>
            )}
          </section>
        </div>

        {posts.length > 0 ? (
          <SidebarLinkPanel
            id="related-writing-heading"
            title="Related writing"
            viewAllHref="/writing"
            items={posts.map((post) => ({
              key: post.id,
              href: `/writing/${post.slug}`,
              label: caseStudyAnchor(post.title),
            }))}
          />
        ) : null}
      </div>
    </>
  );
}
