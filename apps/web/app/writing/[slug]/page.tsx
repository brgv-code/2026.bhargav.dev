import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  fetchPostBySlug,
  fetchProjectsFromPayload,
  fetchRelatedPosts,
  fetchPostSlugs,
  resolveMediaUrl,
  tagNames,
} from "@/lib/data/cms";
import { caseStudyAnchor, formatPostDate, formatReadTime } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import {
  absoluteUrl,
  defaultDescription,
  siteName,
  siteUrl,
} from "@/lib/seo";
import { RichText } from "@/components/shared/rich-text";
import { JsonLd } from "@/components/seo/jsonld";
import { BackButton } from "@/components/shared/back-button";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await fetchPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return { title: "Writing not found" };
  }

  const description = post.description ?? defaultDescription;
  const url = absoluteUrl(`/writing/${slug}`);
  const cover = resolveMediaUrl(
    post.coverImage && typeof post.coverImage === "object" ? post.coverImage : null,
  );
  const ogImages = cover?.url
    ? [{ url: cover.url, width: cover.width ?? 1200, height: cover.height ?? 630, alt: post.title }]
    : [{ url: "/og-writing.svg", width: 1200, height: 630, alt: "Writing" }];

  return {
    title: post.title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      siteName,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: ogImages.map((image) => image.url),
    },
  };
}

export default async function WritingPostPage({ params }: Props) {
  const { slug } = await params;
  const [post, relatedPosts, projects] = await Promise.all([
    fetchPostBySlug(slug),
    fetchRelatedPosts(slug, 3),
    fetchProjectsFromPayload(),
  ]);

  if (!post) notFound();

  const dateLabel = formatPostDate(
    post.publishedAt ?? post.createdAt ?? post.updatedAt,
  );
  const readTime = formatReadTime(post.readingTime);
  const cover = resolveMediaUrl(post.coverImage);
  const postUrl = absoluteUrl(`/writing/${slug}`);
  const postDescription = post.description ?? defaultDescription;
  const blogId = `${absoluteUrl("/writing")}#blog`;
  const postTagSet = new Set(
    tagNames(post.tags).map((tag) => tag.toLowerCase()),
  );
  const scoredProjects = projects.map((project) => {
    const techLabels =
      project.tech
        ?.map((entry) => entry?.label?.toLowerCase())
        .filter((label): label is string => Boolean(label)) ?? [];
    const score = techLabels.filter((label) => postTagSet.has(label)).length;
    return { project, score };
  });
  const hasMatch = scoredProjects.some((entry) => entry.score > 0);
  const relatedProjects = (hasMatch
    ? scoredProjects
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
    : scoredProjects
  )
    .slice(0, 3)
    .map((entry) => entry.project);

  let body: ReactNode = null;
  if (post.markdownInput) {
    body = await renderMarkdown(post.markdownInput);
  } else if (post.contentHtml) {
    body = (
      <div
        className="flex flex-col gap-6 text-base text-secondary leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    );
  } else if (post.content) {
    body = (
      <RichText
        data={post.content}
        className="flex flex-col gap-6"
      />
    );
  }

  return (
    <article className="flex flex-col gap-10 pb-24">
      <JsonLd
        id={`post-${slug}`}
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: postDescription,
          url: postUrl,
          datePublished: post.publishedAt ?? post.createdAt,
          dateModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
          inLanguage: "en",
          mainEntityOfPage: postUrl,
          isPartOf: {
            "@type": "Blog",
            "@id": blogId,
            name: "Writing",
            url: absoluteUrl("/writing"),
          },
          author: {
            "@type": "Person",
            "@id": `${siteUrl}#person`,
            name: siteName,
          },
        }}
      />
      <BreadcrumbsJsonLd
        id={`post-breadcrumbs-${slug}`}
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Writing", href: absoluteUrl("/writing") },
          { name: post.title, href: postUrl },
        ]}
      />
      <header className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-6">
          <h1 className="text-4xl font-semibold tracking-tight text-primary">
            {post.title}
          </h1>
          <BackButton className="text-base font-medium text-muted hover:text-primary transition-colors" />
        </div>
        <div className="text-base text-muted">
          {[dateLabel, readTime].filter(Boolean).join(" / ")}
        </div>
        {post.description ? (
          <p className="text-base text-secondary">{post.description}</p>
        ) : null}
      </header>

      {cover ? (
        <div className="w-full">
          <Image
            src={cover.url ?? ""}
            alt={cover.alt ?? post.title}
            width={cover.width ?? 1600}
            height={cover.height ?? 900}
            sizes="100vw"
            className="h-auto w-full"
            priority
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-6">
        {body ?? (
          <p className="text-base text-muted">Content coming soon.</p>
        )}
      </div>

      <div className="mt-12 flex flex-col gap-6">
        {relatedPosts.length ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-[0.35em] text-muted">
              More writing
            </h2>
            <div className="flex flex-col gap-2 text-base text-primary">
              {relatedPosts.map((related) => (
                <Link key={related.id} href={`/writing/${related.slug}`}>
                  {caseStudyAnchor(related.title)}
                </Link>
              ))}
              <Link href="/writing">View all writing</Link>
            </div>
          </div>
        ) : null}
        {relatedProjects.length ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs uppercase tracking-[0.35em] text-muted">
              Related projects
            </h2>
            <div className="flex flex-col gap-2 text-base text-primary">
              {relatedProjects.map((project) => {
                const title = project.title ?? project.name;
                return (
                  <Link
                    key={project.id}
                    href={`/projects#project-${project.id}`}
                  >
                    {caseStudyAnchor(title)}
                  </Link>
                );
              })}
              <Link href="/projects">View all projects</Link>
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-3">
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted">
            Explore
          </h2>
          <div className="flex flex-col gap-2 text-base text-primary">
            <Link href="/projects">Projects</Link>
            <Link href="/experience">Experience</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
