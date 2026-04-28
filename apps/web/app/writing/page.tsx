import type { Metadata } from "next";
import Link from "next/link";
import { fetchBlogListPosts } from "@/lib/data/cms";
import { formatPostDate, formatReadTime } from "@/lib/format";
import { tagNames } from "@/lib/data/cms";
import { absoluteUrl, siteName } from "@/lib/seo";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays, notes, and field reports on engineering and shipping software.",
  alternates: { canonical: absoluteUrl("/writing") },
  openGraph: {
    type: "website",
    title: "Writing",
    description: "Essays, notes, and field reports on engineering and shipping software.",
    url: absoluteUrl("/writing"),
    siteName,
    images: [{ url: "/og-writing.svg", width: 1200, height: 630, alt: "Writing" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing",
    description: "Essays, notes, and field reports on engineering and shipping software.",
    images: ["/og-writing.svg"],
  },
};

export const dynamic = "force-static";
export const revalidate = 60;

export default async function WritingIndexPage() {
  const posts = await fetchBlogListPosts(500);
  const blogId = `${absoluteUrl("/writing")}#blog`;

  const listJsonLd =
    posts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "BlogPosting",
              name: post.title,
              url: absoluteUrl(`/writing/${post.slug}`),
              datePublished: post.publishedAt ?? post.createdAt,
              dateModified: post.updatedAt ?? post.publishedAt ?? post.createdAt,
              description: post.description ?? undefined,
              inLanguage: "en",
              isPartOf: { "@type": "Blog", "@id": blogId, name: "Writing", url: absoluteUrl("/writing") },
            },
          })),
        }
      : null;

  return (
    <>
      <BreadcrumbsJsonLd
        id="writing-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Writing", href: absoluteUrl("/writing") },
        ]}
      />
      {listJsonLd ? <JsonLd id="writing-list" data={listJsonLd} /> : null}

      <div className="mx-auto max-w-3xl px-8 py-16">
        <p className="text-xs uppercase tracking-widest text-muted">Essays · Notes · Field Reports</p>
        <h1 className="mt-3 font-serif text-5xl font-black tracking-tight text-primary">Writing</h1>
        <p className="mt-4 text-lg font-serif italic text-muted max-w-prose">
          Things I&apos;ve learned breaking production, debugging at strange hours, and trying to ship software I&apos;m proud of.
        </p>

        {posts.length === 0 ? (
          <p className="mt-14 text-sm text-muted">No posts published yet. Check back soon.</p>
        ) : (
          <div className="mt-14 divide-y divide-border">
            {posts.map((post) => {
              const date = formatPostDate(post.publishedAt ?? post.createdAt ?? post.updatedAt);
              const readTime = formatReadTime(post.readingTime);
              const tags = tagNames(post.tags);
              const primaryTag = tags[0];

              return (
                <article key={post.slug} className="py-8">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted">
                    {date && <time dateTime={post.publishedAt ?? post.createdAt ?? ""}>{date}</time>}
                    {readTime && <><span aria-hidden>•</span><span>{readTime}</span></>}
                    {primaryTag && <><span aria-hidden>•</span><span>{primaryTag}</span></>}
                  </div>
                  <Link href={`/writing/${post.slug}`} className="group block mt-3">
                    <h2 className="font-serif text-2xl font-bold tracking-tight text-primary group-hover:underline decoration-2 underline-offset-4">
                      {post.title}
                    </h2>
                    {post.description && (
                      <p className="mt-2 text-secondary leading-relaxed">{post.description}</p>
                    )}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
