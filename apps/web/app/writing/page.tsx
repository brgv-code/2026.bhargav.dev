import type { Metadata } from "next";
import Link from "next/link";
import { fetchBlogListPosts } from "@/lib/data/cms";
import { WritingSection } from "@/components/sections/writing-section";
import { absoluteUrl, siteName } from "@/lib/seo";
import { JsonLd } from "@/components/seo/jsonld";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "Writing",
  description: "All published writing and essays.",
  alternates: {
    canonical: absoluteUrl("/writing"),
  },
  openGraph: {
    type: "website",
    title: "Writing",
    description: "All published writing and essays.",
    url: absoluteUrl("/writing"),
    siteName,
    images: [
      {
        url: "/og-writing.svg",
        width: 1200,
        height: 630,
        alt: "Writing",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing",
    description: "All published writing and essays.",
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
              isPartOf: {
                "@type": "Blog",
                "@id": blogId,
                name: "Writing",
                url: absoluteUrl("/writing"),
              },
            },
          })),
        }
      : null;

  return (
    <div className="px-12 pt-28 pb-24 space-y-16">
      <div className="flex items-baseline justify-between border-b border-border/15 pb-4">
        <h1 className="font-serif text-3xl text-accent">Writing</h1>
      </div>

      <BreadcrumbsJsonLd
        id="writing-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Writing", href: absoluteUrl("/writing") },
        ]}
      />
      {listJsonLd ? <JsonLd id="writing-list" data={listJsonLd} /> : null}

      <WritingSection posts={posts} showHeader={false} />

      <div className="pt-8 flex flex-col gap-3">
        <h2 className="text-xs uppercase tracking-[0.35em] text-muted">
          Explore
        </h2>
        <div className="flex flex-col gap-2 text-base text-primary">
          <Link href="/about">About</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/experience">Experience</Link>
        </div>
      </div>
    </div>
  );
}
