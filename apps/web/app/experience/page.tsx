import type { Metadata } from "next";
import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  fetchProjectsFromPayload,
  fetchWorkExperience,
  type PayloadMedia,
} from "@/lib/data/cms";
import { renderMarkdown } from "@/lib/markdown";
import { BackButton } from "@/components/shared/back-button";
import { absoluteUrl, siteName } from "@/lib/seo";
import { JsonLd } from "@/components/seo/jsonld";

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

function resolveMediaUrl(
  media: PayloadMedia | number | null | undefined,
): PayloadMedia | null {
  if (!media || typeof media !== "object" || !media.url) return null;
  const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "";
  const resolvedUrl =
    media.url.startsWith("http") || !baseUrl ? media.url : `${baseUrl}${media.url}`;
  return {
    ...media,
    url: resolvedUrl,
  };
}

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

export default async function ExperiencePage() {
  const [work, projects] = await Promise.all([
    fetchWorkExperience(),
    fetchProjectsFromPayload(),
  ]);

  if (!work || work.length === 0) return null;

  const entries = await Promise.all(
    work.map(async (item) => {
      let detail: ReactNode = null;

      if (item.markdownInput) {
        detail = await renderMarkdown(item.markdownInput);
      } else if (item.contentHtml) {
        detail = (
          <div
            className="flex flex-col gap-4 text-base text-secondary leading-relaxed"
            dangerouslySetInnerHTML={{ __html: item.contentHtml }}
          />
        );
      }

      return { item, detail, logo: resolveMediaUrl(item.logo) };
    }),
  );

  const listJsonLd = {
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
  };

  return (
    <section className="pb-24">
      <div className="mx-auto w-full max-w-xl">
        <div className="grid grid-cols-3 items-center pt-24 mb-10">
          <span />
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted text-center">
            Experience
          </h2>
          <div className="justify-self-end">
            <BackButton className="text-base font-medium text-muted hover:text-primary transition-colors" />
          </div>
        </div>
        <JsonLd
          id="experience-breadcrumbs"
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: absoluteUrl("/"),
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Experience",
                item: absoluteUrl("/experience"),
              },
            ],
          }}
        />
        <JsonLd id="experience-list" data={listJsonLd} />
        <div className="flex flex-col gap-12">
          {entries.map(({ item, detail, logo }) => (
            <article
              key={item.id}
              id={`experience-${item.id}`}
              className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:gap-6"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-2">
                  {logo ? (
                    <Image
                      src={logo.url ?? ""}
                      alt={logo.alt ?? item.company}
                      width={logo.width ?? 48}
                      height={logo.height ?? 48}
                      className="h-12 w-12 object-cover"
                    />
                  ) : null}
                  {item.role ? (
                    <h3 className="text-base font-semibold text-primary">
                      {item.role}
                    </h3>
                  ) : null}
                  <div className="flex flex-col gap-1 text-sm text-muted">
                    <span>{item.company}</span>
                    {item.tech_stack ? <span>{item.tech_stack}</span> : null}
                  </div>
                </div>
                {item.bullets?.length ? (
                  <ul className="list-none pl-0 flex flex-col gap-1 text-base text-secondary">
                    {item.bullets.map((bullet) => (
                      <li key={bullet.id}>
                        {bullet.href ? (
                          <a
                            href={bullet.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {bullet.label}
                          </a>
                        ) : (
                          bullet.label
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {detail ? <div className="flex flex-col gap-4">{detail}</div> : null}
              </div>
              {item.date_range ? (
                <div className="text-sm text-muted md:text-right">
                  {item.date_range}
                </div>
              ) : null}
            </article>
          ))}
        </div>
        {projects.length ? (
          <div className="mt-16 flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-[0.35em] text-muted">
              Selected projects
            </h2>
            <div className="flex flex-col gap-2 text-base text-primary">
              {projects.slice(0, 3).map((project) => {
                const title = project.title ?? project.name;
                return (
                  <Link
                    key={project.id}
                    href={`/projects#project-${project.id}`}
                  >
                    {title}
                  </Link>
                );
              })}
              <Link href="/projects">View all projects</Link>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
