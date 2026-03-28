import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { fetchBlogListPosts, fetchProjectsFromPayload } from "@/lib/data/cms";
import { renderMarkdown } from "@/lib/markdown";
import { caseStudyAnchor } from "@/lib/format";
import { absoluteUrl, siteName, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";

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

  if (projects.length === 0) return null;

  const entries = await Promise.all(
    projects.map(async (project) => {
      let detail: ReactNode = null;

      if (project.markdownInput) {
        detail = await renderMarkdown(project.markdownInput);
      } else if (project.contentHtml) {
        detail = (
          <div
            className="flex flex-col gap-4 text-base text-secondary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: project.contentHtml }}
          />
        );
      }

      return { project, detail };
    }),
  );

  const listJsonLd = {
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
        project.applicationCategory || project.operatingSystem || offer,
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
  };

  return (
    <section className="pb-24">
      <div className="mx-auto w-full max-w-xl">
        <div className="pt-24 mb-10">
          <h1 className="font-serif text-3xl text-accent">Projects</h1>
        </div>
        <BreadcrumbsJsonLd
          id="projects-breadcrumbs"
          items={[
            { name: "Home", href: absoluteUrl("/") },
            { name: "Projects", href: absoluteUrl("/projects") },
          ]}
        />
        <JsonLd id="projects-list" data={listJsonLd} />
        <div className="flex flex-col gap-12">
          {entries.map(({ project, detail }) => {
            const title = project.title ?? project.name;
            const techLabels = Array.isArray(project.tech)
              ? project.tech
                  .map((entry) => entry?.label)
                  .filter((label): label is string => Boolean(label))
              : [];
            const statusLabel = formatStatus(project.status ?? null);
            const metaParts = [
              project.year ?? "",
              statusLabel ?? "",
            ].filter(Boolean);

            return (
              <article
                key={project.id}
                id={`project-${project.id}`}
                className="flex flex-col gap-3 content-visibility-auto"
              >
                <a
                  className="text-base font-semibold text-primary"
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {title}
                </a>
                {metaParts.length ? (
                  <p className="text-sm text-muted">{metaParts.join(" / ")}</p>
                ) : null}
                <p className="text-base text-secondary">{project.description}</p>
                {detail ? <div className="flex flex-col gap-4">{detail}</div> : null}
                {techLabels.length ? (
                  <p className="text-sm text-muted">
                    Tech: {techLabels.join(", ")}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-4 text-base text-primary">
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit
                    </a>
                  ) : null}
                  {project.github ? (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
        {posts.length ? (
          <div className="mt-16 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-[0.35em] text-muted">
              Related writing
            </h2>
            <div className="flex flex-col gap-2 text-base text-primary">
              {posts.map((post) => (
                <Link key={post.id} href={`/writing/${post.slug}`}>
                  {caseStudyAnchor(post.title)}
                </Link>
              ))}
              <Link href="/writing">View all writing</Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
