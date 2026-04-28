import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  fetchLatestPosts,
  fetchProjectsFromPayload,
  fetchProfile,
} from "@/lib/data/cms";
import { formatPostDate } from "@/lib/format";
import { JsonLd } from "@/components/seo/jsonld";
import {
  absoluteUrl,
  defaultDescription,
  defaultTitle,
  siteName,
  siteUrl,
} from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 60;

export const metadata: Metadata = {
  title: defaultTitle,
  description: defaultDescription,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    title: defaultTitle,
    description: defaultDescription,
    url: absoluteUrl("/"),
    siteName,
    images: [{ url: "/og.svg", width: 1200, height: 630, alt: "Bhargav — Developer Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og.svg"],
  },
};

const FALLBACK_BIO =
  "I'm Bhargav — a full-stack developer working on AI applications and developer tools. I write here when I learn something the hard way.";

export default async function Home() {
  const [posts, projects, profile] = await Promise.all([
    fetchLatestPosts(4),
    fetchProjectsFromPayload(),
    fetchProfile(),
  ]);

  const bio =
    (profile as unknown as { resume_summary?: string | null })?.resume_summary ??
    FALLBACK_BIO;

  const featuredProjects = projects.slice(0, 4);

  return (
    <>
      <JsonLd
        id="home-webpage"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": `${siteUrl}#home`,
          url: absoluteUrl("/"),
          name: defaultTitle,
          description: defaultDescription,
          isPartOf: { "@id": `${siteUrl}#website` },
          about: { "@id": `${siteUrl}#person` },
        }}
      />

      <div className="mx-auto max-w-3xl px-8 py-20">
        {/* Hero */}
        <p className="text-sm uppercase tracking-widest text-muted">Hello —</p>
        <h1 className="mt-6 font-serif text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight text-primary">
          I build software
          <br />
          <span className="italic font-normal text-muted">and write about it.</span>
        </h1>
        <p className="mt-6 text-lg text-secondary max-w-prose font-serif leading-relaxed">
          {bio}
        </p>
        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/writing"
            className="inline-flex items-center gap-2 bg-primary text-inverse px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Read the writing <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 border border-border px-5 py-2.5 text-sm font-medium hover:bg-highlight transition-colors text-primary"
          >
            See projects
          </Link>
        </div>

        {/* Recent writing */}
        {posts.length > 0 && (
          <section className="mt-24">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-primary">
                Recent writing
              </h2>
              <Link
                href="/writing"
                className="text-sm text-muted hover:text-primary transition-colors"
              >
                All essays →
              </Link>
            </div>
            <ul className="mt-6 divide-y divide-border">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/writing/${p.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-4 -mx-3 px-3 hover:bg-highlight transition-colors"
                  >
                    <span className="font-serif text-lg leading-snug text-primary">
                      {p.title}
                    </span>
                    <span className="shrink-0 text-xs uppercase tracking-wider text-muted tabular-nums">
                      {formatPostDate(p.publishedAt ?? p.createdAt ?? p.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Selected projects */}
        {featuredProjects.length > 0 && (
          <section className="mt-20">
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-2xl font-bold tracking-tight text-primary">
                Selected projects
              </h2>
              <Link
                href="/projects"
                className="text-sm text-muted hover:text-primary transition-colors"
              >
                All projects →
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredProjects.map((proj) => {
                const title = proj.title ?? proj.name;
                const isRealUrl = proj.url && proj.url !== "#";
                const tech = proj.tech ?? [];
                if (isRealUrl) {
                  return (
                    <a
                      key={proj.id}
                      href={proj.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded border border-border bg-surface p-5 hover:border-border-strong transition-colors block"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif text-lg font-bold text-primary">{title}</h3>
                        <ArrowUpRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                      </div>
                      {proj.description && (
                        <p className="mt-2 text-sm text-secondary leading-relaxed">
                          {proj.description}
                        </p>
                      )}
                      {tech.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {tech.map((t) => (
                            <span
                              key={t.id}
                              className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border text-muted"
                            >
                              {t.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </a>
                  );
                }
                return (
                  <div
                    key={proj.id}
                    className="rounded border border-border bg-surface p-5"
                  >
                    <h3 className="font-serif text-lg font-bold text-primary">{title}</h3>
                    {proj.description && (
                      <p className="mt-2 text-sm text-secondary leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                    {tech.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {tech.map((t) => (
                          <span
                            key={t.id}
                            className="text-[10px] uppercase tracking-wider px-2 py-0.5 border border-border text-muted"
                          >
                            {t.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <hr className="my-20 border-border" />
        <p className="font-serif italic text-muted">
          &ldquo;Treat your schema like production code. Version it. Review it. Never push it.&rdquo;
        </p>
      </div>
    </>
  );
}
