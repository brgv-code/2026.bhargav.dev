import type { Metadata } from "next";
import type { ReactNode } from "react";
import { fetchProjectsFromPayload, fetchWorkExperience } from "@/lib/data/cms";
import { renderMarkdown } from "@/lib/markdown";
import { cn } from "@/lib/utils";
import { absoluteUrl, siteName } from "@/lib/seo";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { SidebarLinkPanel } from "@/components/sections/sidebar-link-panel";

export const metadata: Metadata = {
  title: "Experience",
  description: "Roles, responsibilities, and work highlights.",
  alternates: {
    canonical: absoluteUrl("/experience"),
  },
  openGraph: {
    type: "website",
    title: "Experience",
    description: "Roles, responsibilities, and work highlights.",
    url: absoluteUrl("/experience"),
    siteName,
    images: [
      {
        url: "/og-experience.svg",
        width: 1200,
        height: 630,
        alt: "Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Experience",
    description: "Roles, responsibilities, and work highlights.",
    images: ["/og-experience.svg"],
  },
};

export const dynamic = "force-static";
export const revalidate = 300;

function parseDateRange(range?: string | null) {
  if (!range) return {};
  const years = range.match(/\d{4}/g) ?? [];
  const start = years[0];
  const end = years[1];
  return {
    startDate: start ? `${start}-01-01` : undefined,
    endDate: end ? `${end}-01-01` : undefined,
  };
}

function parseTechStack(raw?: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function ExperiencePage() {
  const [work, projects] = await Promise.all([
    fetchWorkExperience(),
    fetchProjectsFromPayload(5),
  ]);

  const entries = await Promise.all(
    work.map(async (item) => {
      let detail: ReactNode = null;

      if (item.markdownInput) {
        detail = await renderMarkdown(item.markdownInput);
      } else if (item.contentHtml) {
        detail = (
          <div
            className="article-prose"
            dangerouslySetInnerHTML={{ __html: item.contentHtml }}
          />
        );
      }

      return { item, detail };
    }),
  );

  const listJsonLd =
    work.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: work.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "OrganizationRole",
              name: `${item.role ?? "Role"} at ${item.company ?? "Company"}`,
              roleName: item.role ?? undefined,
              memberOf: {
                "@type": "Organization",
                name: item.company ?? "Company",
              },
              description: item.date_range ?? undefined,
              ...parseDateRange(item.date_range),
            },
          })),
        }
      : null;

  return (
    <>
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold text-primary">Experience</h1>
        <p className="text-sm text-secondary mt-0.5">
          Roles, responsibilities, and work highlights.
        </p>
      </div>

      <BreadcrumbsJsonLd
        id="experience-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Experience", href: absoluteUrl("/experience") },
        ]}
      />
      {listJsonLd ? <JsonLd id="experience-list" data={listJsonLd} /> : null}

      <div
        className={cn(
          "grid min-h-0",
          projects.length > 0
            ? "grid-cols-1 xl:grid-cols-home-main"
            : "grid-cols-1",
        )}
      >
        <div
          className={cn(
            "min-w-0",
            projects.length > 0 && "xl:border-r xl:border-border",
          )}
        >
          <section aria-label="Work history" className="pb-24">
            {work.length === 0 ? (
              <p className="border-b border-border px-6 py-10 text-sm text-secondary">
                No experience entries yet. Check back soon.
              </p>
            ) : (
              <div>
                {entries.map(({ item, detail }) => {
                  const tech = parseTechStack(item.tech_stack);

                  return (
                    <article
                      key={item.id}
                      id={`experience-${item.id}`}
                      className="border-b border-border px-6 py-6 content-visibility-auto"
                    >
                      <div className="flex max-w-3xl flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-baseline justify-between gap-4">
                            {item.role ? (
                              <h3 className="min-w-0 text-base font-semibold leading-snug text-primary">
                                {item.role}
                              </h3>
                            ) : (
                              <span className="min-w-0 text-base font-semibold leading-snug text-primary">
                                {item.company ?? "—"}
                              </span>
                            )}
                            {item.date_range ? (
                              <span className="shrink-0 text-xs tabular-nums text-muted">
                                {item.date_range}
                              </span>
                            ) : null}
                          </div>
                          {item.role && item.company ? (
                            <p className="text-sm text-muted">{item.company}</p>
                          ) : null}
                        </div>

                        {(item.bullets?.length || detail) ? (
                          <div className="flex flex-col gap-3 text-sm leading-relaxed text-primary">
                            {item.bullets?.length
                              ? item.bullets.map((bullet) => (
                                  <p key={bullet.id} className="m-0">
                                    {bullet.href ? (
                                      <a
                                        href={bullet.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:text-accent transition-colors duration-normal"
                                      >
                                        {bullet.label}
                                      </a>
                                    ) : (
                                      bullet.label
                                    )}
                                  </p>
                                ))
                              : null}
                            {detail ? (
                              <div className="experience-entry-prose article-prose">
                                {detail}
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {tech.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {tech.map((label, i) => (
                              <span
                                key={`${label}-${i}`}
                                className="rounded border border-border bg-tag-bg px-2 py-0.5 text-2xs font-medium text-tag-text"
                              >
                                {label}
                              </span>
                            ))}
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

        {projects.length > 0 ? (
          <SidebarLinkPanel
            id="experience-related-projects-heading"
            title="Selected projects"
            viewAllHref="/projects"
            items={projects.slice(0, 5).map((project) => ({
              key: project.id,
              href: `/projects#project-${project.id}`,
              label: project.title ?? project.name,
            }))}
          />
        ) : null}
      </div>
    </>
  );
}
