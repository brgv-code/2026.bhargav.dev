import type { Metadata } from "next";
import { fetchBlogListPosts } from "@/lib/data/cms";
import { WritingSection } from "@/components/sections/writing-section";
import { BackButton } from "@/components/shared/back-button";
import { absoluteUrl, siteName } from "@/lib/seo";
import { JsonLd } from "@/components/seo/jsonld";

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
  },
  twitter: {
    card: "summary",
    title: "Writing",
    description: "All published writing and essays.",
  },
};

export const dynamic = "force-static";

export default async function WritingIndexPage() {
  const posts = await fetchBlogListPosts(500);
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
            },
          })),
        }
      : null;

  return (
    <div className="flex flex-col gap-16 pb-24">
      <div className="mx-auto w-full max-w-xl">
        <div className="grid grid-cols-3 items-center pt-24 mb-10">
          <span />
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted text-center">
            Writing
          </h2>
          <div className="justify-self-end">
            <BackButton className="text-base font-medium text-muted hover:text-primary transition-colors" />
          </div>
        </div>
        {listJsonLd ? <JsonLd id="writing-list" data={listJsonLd} /> : null}
        <WritingSection posts={posts} showTitle={false} />
      </div>
    </div>
  );
}
