import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  fetchBlogListPosts,
  fetchPostBySlug,
  fetchPostSlugs,
  resolveMediaUrl,
  tagNames,
} from "@/lib/data/cms";
import { formatPostDate, formatReadTime } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, defaultDescription, siteName, siteUrl } from "@/lib/seo";
import { RichText } from "@/components/shared/rich-text";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { BlogPostMainColumn } from "@/components/blog/blog-post-main-column";
import { BlogPostTocRail } from "@/components/blog/blog-post-toc-rail";
import { WritingPostHeaderBar } from "@/components/blog/writing-post-header-bar";

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
    post.coverImage && typeof post.coverImage === "object"
      ? post.coverImage
      : null
  );
  const ogImages = cover?.url
    ? [
        {
          url: cover.url,
          width: cover.width ?? 1200,
          height: cover.height ?? 630,
          alt: post.title,
        },
      ]
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
  const [post, allPosts] = await Promise.all([
    fetchPostBySlug(slug),
    fetchBlogListPosts(500),
  ]);

  if (!post) notFound();

  const postIndex = allPosts.findIndex((p) => p.slug === slug);
  const adjacent = {
    prev:
      postIndex >= 0 && postIndex < allPosts.length - 1
        ? allPosts[postIndex + 1]
        : null,
    next: postIndex > 0 ? allPosts[postIndex - 1] : null,
  };
  const newerSlug = adjacent.next?.slug ?? null;
  const olderSlug = adjacent.prev?.slug ?? null;
  const positionInFeed =
    postIndex >= 0 && allPosts.length > 0 ? postIndex + 1 : null;
  const searchPosts = allPosts.map((p) => ({
    slug: p.slug,
    title: p.title,
  }));

  const dateLabel = formatPostDate(
    post.publishedAt ?? post.createdAt ?? post.updatedAt
  );
  const readTime = formatReadTime(post.readingTime);
  const cover = resolveMediaUrl(post.coverImage);
  const postUrl = absoluteUrl(`/writing/${slug}`);
  const postDescription = post.description ?? defaultDescription;
  const blogId = `${absoluteUrl("/writing")}#blog`;
  const tags = tagNames(post.tags);
  const primaryTag = tags[0];
  const articleShellClass = "w-full px-article-inline";

  let body: ReactNode = null;
  if (post.markdownInput) {
    body = await renderMarkdown(post.markdownInput, { slug });
  } else if (post.contentHtml) {
    body = (
      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    );
  } else if (post.content) {
    body = (
      <RichText
        data={post.content}
        className="article-body"
        headingIds={post.tocItems?.map((t) => t.id) ?? []}
      />
    );
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

      <WritingPostHeaderBar
        siteLabel={siteName}
        articleTitle={post.title}
        position={positionInFeed}
        total={allPosts.length}
        newerSlug={newerSlug}
        olderSlug={olderSlug}
        searchPosts={searchPosts}
      />
      <article
        className="pb-24"
        itemScope
        itemType="https://schema.org/BlogPosting"
      >
        <meta itemProp="url" content={postUrl} />
        {post.publishedAt && (
          <meta itemProp="datePublished" content={post.publishedAt} />
        )}
        {post.updatedAt && (
          <meta itemProp="dateModified" content={post.updatedAt} />
        )}

        {post.tocItems?.length ? (
          <div className="grid gap-x-px gap-y-0 bg-background lg:grid-cols-home-main lg:grid-rows-[auto_minmax(0,1fr)]">
            <div
              className={`bg-surface pt-4 lg:col-start-1 lg:row-start-1 ${articleShellClass}`}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6 text-[10px] uppercase tracking-[0.2em] text-muted">
                {dateLabel && (
                  <time dateTime={post.publishedAt ?? post.createdAt ?? ""}>
                    {dateLabel}
                  </time>
                )}
                {dateLabel && readTime && (
                  <span
                    aria-hidden="true"
                    className="w-1 h-1 rounded-full bg-border"
                  />
                )}
                {readTime && <span>{readTime}</span>}
                {primaryTag && (
                  <>
                    <span
                      aria-hidden="true"
                      className="w-1 h-1 rounded-full bg-border"
                    />
                    <span itemProp="keywords">{primaryTag}</span>
                  </>
                )}
              </div>
            </div>
            <div
              className="hidden bg-surface lg:col-start-2 lg:row-start-1 lg:block"
              aria-hidden
            />

            <BlogPostMainColumn className="lg:col-start-1 lg:row-start-2 min-h-0">
              <header className={`${articleShellClass} pb-10`}>
                <h1
                  className="font-serif text-4xl md:text-6xl font-bold leading-[1.1] tracking-tight text-primary mb-6"
                  itemProp="headline"
                >
                  {post.title}
                </h1>

                {post.description && (
                  <p
                    className="font-sans text-base text-muted leading-relaxed mt-4"
                    itemProp="description"
                  >
                    {post.description}
                  </p>
                )}
              </header>

              {cover?.url && (
                <div className={`${articleShellClass} mb-16`}>
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

              <div className={articleShellClass}>
                <div className="article-prose" itemProp="articleBody">
                  {body ?? (
                    <p className="text-base text-muted">
                      Content coming soon.
                    </p>
                  )}
                </div>
              </div>
            </BlogPostMainColumn>

            <BlogPostTocRail
              className="lg:col-start-2 lg:row-start-2"
              items={post.tocItems}
            />
          </div>
        ) : (
          <>
            <header className={`${articleShellClass} pt-4 pb-10`}>
              <div className="flex flex-wrap items-center gap-3 mb-6 text-[10px] uppercase tracking-[0.2em] text-muted">
                {dateLabel && (
                  <time dateTime={post.publishedAt ?? post.createdAt ?? ""}>
                    {dateLabel}
                  </time>
                )}
                {dateLabel && readTime && (
                  <span
                    aria-hidden="true"
                    className="w-1 h-1 rounded-full bg-border"
                  />
                )}
                {readTime && <span>{readTime}</span>}
                {primaryTag && (
                  <>
                    <span
                      aria-hidden="true"
                      className="w-1 h-1 rounded-full bg-border"
                    />
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
                  className="font-sans text-base text-muted leading-relaxed mt-4"
                  itemProp="description"
                >
                  {post.description}
                </p>
              )}
            </header>

            {cover?.url && (
              <div className={`${articleShellClass} mb-16`}>
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

            <div className={articleShellClass}>
              <div className="article-prose" itemProp="articleBody">
                {body ?? (
                  <p className="text-base text-muted">Content coming soon.</p>
                )}
              </div>
            </div>
          </>
        )}

      </article>
    </>
  );
}
