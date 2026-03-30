import type { Metadata } from "next";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/jsonld";
import { SidebarLinkPanel } from "@/components/sections/sidebar-link-panel";
import { fetchBlogListPosts } from "@/lib/data/cms";
import { cn } from "@/lib/utils";
import { absoluteUrl, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Series",
  description: "Multi-part writing series and thematic collections.",
  alternates: { canonical: absoluteUrl("/series") },
  openGraph: {
    type: "website",
    title: "Series",
    description: "Multi-part writing series and thematic collections.",
    url: absoluteUrl("/series"),
    siteName,
    images: [{ url: "/og-writing.svg", width: 1200, height: 630, alt: "Series" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Series",
    description: "Multi-part writing series and thematic collections.",
    images: ["/og-writing.svg"],
  },
};

export const dynamic = "force-static";
export const revalidate = 60;

export default async function SeriesPage() {
  const posts = await fetchBlogListPosts(8);

  return (
    <>
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold text-primary">Series</h1>
        <p className="text-sm text-secondary mt-0.5">
          Multi-part essays grouped by theme and continuity.
        </p>
      </div>

      <BreadcrumbsJsonLd
        id="series-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Series", href: absoluteUrl("/series") },
        ]}
      />
      <JsonLd
        id="series-page"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: absoluteUrl("/series"),
          name: "Series",
          description: "Multi-part writing series and thematic collections.",
        }}
      />

      <div
        className={cn(
          "grid min-h-0",
          posts.length > 0 ? "grid-cols-1 xl:grid-cols-home-main" : "grid-cols-1",
        )}
      >
        <section
          className={cn(
            "min-w-0 pb-24",
            posts.length > 0 && "xl:border-r xl:border-border",
          )}
          aria-label="Series list"
        >
          <div className="border-b border-border px-6 py-10">
            <div className="max-w-3xl">
              <p className="text-sm text-secondary leading-relaxed">
                Series collections are coming soon. For now, browse the latest writing in the
                sidebar.
              </p>
            </div>
          </div>
        </section>

        {posts.length > 0 ? (
          <SidebarLinkPanel
            id="series-sidebar-writing-heading"
            title="Latest writing"
            viewAllHref="/writing"
            items={posts.map((post) => ({
              key: post.id,
              href: `/writing/${post.slug}`,
              label: post.title,
            }))}
          />
        ) : null}
      </div>
    </>
  );
}
