import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  fetchAdjacentPosts,
  fetchPostBySlug,
  fetchProjectsFromPayload,
  fetchRelatedPosts,
  fetchPostSlugs,
  resolveMediaUrl,
  tagNames,
} from "@/lib/data/cms";
import { caseStudyAnchor, formatPostDate, formatReadTime } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, defaultDescription, siteName, siteUrl } from "@/lib/seo";
import { RichText } from "@/components/shared/rich-text";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { BlogPostTOC } from "@/components/blog/blog-post-toc";
import { DarkModeToggle } from "@/components/shared/dark-mode-toggle";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

  if (!post) return { title: "Writing not found" };

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
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      siteName,
      images: ogImages,
      publishedTime: post.publishedAt ?? post.createdAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      tags: tagNames(post.tags),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: ogImages.map((img) => img.url),
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

  const adjacent = await fetchAdjacentPosts(slug, post.publishedAt);

  const dateLabel = formatPostDate(post.publishedAt ?? post.createdAt ?? post.updatedAt);
  const readTime = formatReadTime(post.readingTime);
  const cover = resolveMediaUrl(post.coverImage);
  const postUrl = absoluteUrl(`/writing/${slug}`);
  const postDescription = post.description ?? defaultDescription;
  const blogId = `${absoluteUrl("/writing")}#blog`;
  const tags = tagNames(post.tags);
  const primaryTag = tags[0];

  const postTagSet = new Set(tags.map((t) => t.toLowerCase()));
  const scoredProjects = projects.map((project) => {
    const techLabels =
      project.tech
        ?.map((entry) => entry?.label?.toLowerCase())
        .filter((label): label is string => Boolean(label)) ?? [];
    const score = techLabels.filter((label) => postTagSet.has(label)).length;
    return { project, score };
  });
  const hasMatch = scoredProjects.some((e) => e.score > 0);
  const relatedProjects = (hasMatch
    ? scoredProjects.filter((e) => e.score > 0).sort((a, b) => b.score - a.score)
    : scoredProjects
  )
    .slice(0, 3)
    .map((e) => e.project);

  let body: ReactNode = null;
  if (post.markdownInput) {
    body = await renderMarkdown(post.markdownInput);
  } else if (post.contentHtml) {
    body = (
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    );
  } else if (post.content) {
    body = <RichText data={post.content} className="article-body" />;
  }

  return (
    <>
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
          ...(primaryTag ? { keywords: tags.join(", ") } : {}),
          ...(cover?.url ? { image: cover.url } : {}),
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

      {/* Sticky reading bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-background/90 backdrop-blur-sm px-6 md:px-12 h-14 border-b border-border/50">
        <Link
          href="/writing"
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Writing
        </Link>
        <div className="flex items-center gap-4">
          {/* TODO: Archive page */}
          {/* <Link href="/writing/archive" className="hidden md:block text-xs uppercase tracking-widest text-muted hover:text-primary transition-colors">Archive</Link> */}
          {/* TODO: Subscribe flow */}
          {/* <button type="button" className="hidden md:block text-xs uppercase tracking-widest text-muted hover:text-primary transition-colors">Subscribe</button> */}
          {(dateLabel || readTime) && (
            <span className="hidden sm:block text-[10px] uppercase tracking-widest text-muted">
              {[dateLabel, readTime].filter(Boolean).join(" · ")}
            </span>
          )}
          <DarkModeToggle className="text-muted hover:text-primary transition-colors" />
        </div>
      </div>

      <article
        className="pb-24"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        <meta itemProp="url" content={postUrl} />
        {post.publishedAt && <meta itemProp="datePublished" content={post.publishedAt} />}
        {post.updatedAt && <meta itemProp="dateModified" content={post.updatedAt} />}

        {/* Article header */}
        <header className="px-6 md:px-12 pt-12 pb-10 w-full md:w-3/4">
          <div className="flex flex-wrap items-center gap-3 mb-6 text-[10px] uppercase tracking-[0.2em] text-muted">
            {dateLabel && <time dateTime={post.publishedAt ?? post.createdAt ?? ""}>{dateLabel}</time>}
            {dateLabel && readTime && <span aria-hidden="true" className="w-1 h-1 rounded-full bg-border" />}
            {readTime && <span>{readTime}</span>}
            {primaryTag && (
              <>
                <span aria-hidden="true" className="w-1 h-1 rounded-full bg-border" />
                <span itemProp="keywords">{primaryTag}</span>
              </>
            )}
          </div>

          <h1
            className="font-serif text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight text-primary mb-6"
            itemProp="headline"
          >
            {post.title}
          </h1>

          {post.description && (
            <p
              className="font-serif italic text-xl text-secondary leading-relaxed"
              itemProp="description"
            >
              {post.description}
            </p>
          )}
        </header>

        {/* Hero image */}
        {cover?.url && (
          <div className="mb-16 px-6 md:px-12">
            <figure className="aspect-video overflow-hidden bg-surface">
              <Image
                src={cover.url}
                alt={cover.alt ?? post.title}
                width={cover.width ?? 1600}
                height={cover.height ?? 900}
                sizes="(max-width: 768px) 100vw, calc(100vw - 208px)"
                className="h-full w-full object-cover"
                priority
                itemProp="image"
              />
            </figure>
          </div>
        )}

        {/* Content area: TOC + body */}
        <div className="px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 relative">

            {/* Sticky TOC */}
            {post.tocItems?.length ? (
              <aside
                className="hidden lg:block lg:col-span-3"
                aria-label="Table of contents"
              >
                <div className="sticky top-20">
                  <BlogPostTOC items={post.tocItems} />
                </div>
              </aside>
            ) : null}

            {/* Article body */}
            <div
              className={`${post.tocItems?.length ? "lg:col-span-9" : "lg:col-span-12 max-w-3xl"} article-prose`}
              itemProp="articleBody"
            >
              {body ?? (
                <p className="text-base text-muted">Content coming soon.</p>
              )}
            </div>
          </div>
        </div>

        {/* Article footer */}
        <footer className="px-6 md:px-12 mt-20 border-t border-border/40" aria-label="Article navigation">

          {/* Continue Reading */}
          {(adjacent.prev || adjacent.next) && (
            <div className="mt-12 mb-4 relative bg-surface px-10 pt-10 pb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              {/* Bottom accent bar */}
              <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent" />

              <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted">
                  Continue Reading
                </span>
                <Link
                  href={`/writing/${(adjacent.next ?? adjacent.prev)!.slug}`}
                  className="font-serif text-2xl md:text-3xl font-bold text-primary hover:text-accent transition-colors leading-tight max-w-lg"
                >
                  {(adjacent.next ?? adjacent.prev)!.title}
                </Link>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {adjacent.prev ? (
                  <Link
                    href={`/writing/${adjacent.prev.slug}`}
                    aria-label={`Previous: ${adjacent.prev.title}`}
                    className="flex items-center justify-center w-12 h-12 bg-highlight text-primary hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="flex items-center justify-center w-12 h-12 bg-highlight text-muted opacity-30 cursor-not-allowed">
                    <ArrowLeft size={18} aria-hidden="true" />
                  </span>
                )}
                {adjacent.next ? (
                  <Link
                    href={`/writing/${adjacent.next.slug}`}
                    aria-label={`Next: ${adjacent.next.title}`}
                    className="flex items-center justify-center w-12 h-12 bg-highlight text-primary hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="flex items-center justify-center w-12 h-12 bg-highlight text-muted opacity-30 cursor-not-allowed">
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Related writing & projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
            {relatedPosts.length ? (
              <section aria-labelledby="more-writing-heading">
                <h2
                  id="more-writing-heading"
                  className="text-[10px] uppercase tracking-[0.25em] text-muted mb-5"
                >
                  More writing
                </h2>
                <nav className="flex flex-col gap-3">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.id}
                      href={`/writing/${related.slug}`}
                      className="text-sm text-primary hover:text-accent transition-colors leading-snug"
                    >
                      {caseStudyAnchor(related.title)}
                    </Link>
                  ))}
                  <Link
                    href="/writing"
                    className="text-xs uppercase tracking-widest text-muted hover:text-primary transition-colors mt-1"
                  >
                    View all →
                  </Link>
                </nav>
              </section>
            ) : null}

            {relatedProjects.length ? (
              <section aria-labelledby="related-projects-heading">
                <h2
                  id="related-projects-heading"
                  className="text-[10px] uppercase tracking-[0.25em] text-muted mb-5"
                >
                  Related projects
                </h2>
                <nav className="flex flex-col gap-3">
                  {relatedProjects.map((project) => {
                    const title = project.title ?? project.name;
                    return (
                      <Link
                        key={project.id}
                        href={`/projects#project-${project.id}`}
                        className="text-sm text-primary hover:text-accent transition-colors leading-snug"
                      >
                        {caseStudyAnchor(title)}
                      </Link>
                    );
                  })}
                  <Link
                    href="/projects"
                    className="text-xs uppercase tracking-widest text-muted hover:text-primary transition-colors mt-1"
                  >
                    View all →
                  </Link>
                </nav>
              </section>
            ) : null}
          </div>
        </footer>
      </article>
    </>
  );
}
