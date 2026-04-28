import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { fetchProjectsFromPayload } from "@/lib/data/cms";
import { absoluteUrl, siteName, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built — shipped, in beta, and archived.",
  alternates: { canonical: absoluteUrl("/projects") },
  openGraph: {
    type: "website",
    title: "Projects",
    description: "Things I've built — shipped, in beta, and archived.",
    url: absoluteUrl("/projects"),
    siteName,
    images: [{ url: "/og-projects.svg", width: 1200, height: 630, alt: "Projects" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects",
    description: "Things I've built — shipped, in beta, and archived.",
    images: ["/og-projects.svg"],
  },
};

export const dynamic = "force-static";
export const revalidate = 300;

const statusStyles: Record<string, { className: string; style?: React.CSSProperties }> = {
  active: {
    className: "border",
    style: {
      background: "var(--palette-green-50)",
      color: "var(--palette-green-600)",
      borderColor: "var(--palette-green-200)",
    },
  },
  wip: {
    className: "border",
    style: {
      background: "var(--palette-amber-50)",
      color: "var(--palette-amber-700)",
      borderColor: "var(--palette-amber-200)",
    },
  },
  archived: {
    className: "border bg-highlight text-muted border-border",
  },
};

function toYearDate(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (/^\d{4}$/.test(value)) return `${value}-01-01`;
  return undefined;
}

export default async function ProjectsPage() {
  const projects = await fetchProjectsFromPayload();

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
            return {
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "CreativeWork",
                name: title,
                url,
                description: project.description,
                creator: { "@id": `${siteUrl}#person` },
                dateCreated: toYearDate(project.year),
                keywords: keywords || undefined,
              },
            };
          }),
        }
      : null;

  return (
    <>
      <BreadcrumbsJsonLd
        id="projects-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Projects", href: absoluteUrl("/projects") },
        ]}
      />
      {listJsonLd ? <JsonLd id="projects-list" data={listJsonLd} /> : null}

      <div className="mx-auto max-w-3xl px-8 py-16">
        <p className="text-xs uppercase tracking-widest text-muted">What I&apos;ve shipped</p>
        <h1 className="mt-3 font-serif text-5xl font-black tracking-tight text-primary">
          Projects
        </h1>
        <p className="mt-4 text-lg text-muted font-serif italic max-w-prose">
          A mix of tools I built because nothing else worked, and experiments that escaped the laptop.
        </p>

        {projects.length === 0 ? (
          <p className="mt-14 text-sm text-muted">No projects published yet. Check back soon.</p>
        ) : (
          <div className="mt-14 space-y-4">
            {projects.map((project) => {
              const title = project.title ?? project.name;
              const techLabels = Array.isArray(project.tech)
                ? project.tech.map((t) => t?.label).filter((l): l is string => Boolean(l))
                : [];
              const status = project.status?.toLowerCase();
              const isRealUrl = project.url && project.url !== "#";

              const card = (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="font-serif text-2xl font-bold tracking-tight text-primary">
                        {title}
                      </h2>
                      {status && (() => {
                        const s = statusStyles[status] ?? statusStyles.archived;
                        return (
                          <span
                            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${s.className}`}
                            style={s.style}
                          >
                            {project.status}
                          </span>
                        );
                      })()}
                      {project.year && (
                        <span className="text-xs text-muted tabular-nums">{project.year}</span>
                      )}
                    </div>

                    {project.description && (
                      <p className="mt-2 text-secondary leading-relaxed">{project.description}</p>
                    )}

                    {techLabels.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {techLabels.map((label, i) => (
                          <span
                            key={`${label}-${i}`}
                            className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border text-muted"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {isRealUrl && (
                    <ArrowUpRight className="h-5 w-5 text-muted group-hover:text-primary transition-colors shrink-0 mt-1" />
                  )}
                </div>
              );

              if (isRealUrl) {
                return (
                  <a
                    key={project.id}
                    href={project.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded border border-border bg-surface p-6 hover:border-border-strong transition-colors"
                  >
                    {card}
                  </a>
                );
              }

              return (
                <div
                  key={project.id}
                  className="rounded border border-border bg-surface p-6"
                >
                  {card}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
