import type { Metadata } from "next";
import { DailyNotes } from "@/components/notes/daily-notes";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { SidebarLinkPanel } from "@/components/sections/sidebar-link-panel";
import { JsonLd } from "@/components/seo/jsonld";
import { fetchBlogListPosts } from "@/lib/data/cms";
import { cn } from "@/lib/utils";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Daily notes, code snippets, links, and learnings — a digital garden of in-progress thoughts.",
};

export default async function NotesPage() {
  const posts = await fetchBlogListPosts(5);

  return (
    <>
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold text-primary">Notes</h1>
        <p className="text-sm text-secondary mt-0.5">
          Daily notes, snippets, links, and in-progress thinking.
        </p>
      </div>

      <BreadcrumbsJsonLd
        id="notes-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Notes", href: absoluteUrl("/notes") },
        ]}
      />
      <JsonLd
        id="notes-page"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: absoluteUrl("/notes"),
          name: "Notes",
          description:
            "Daily notes, code snippets, links, and learnings — a digital garden of in-progress thoughts.",
        }}
      />

      <div
        className={cn(
          "grid min-h-0",
          posts.length > 0 ? "grid-cols-1 xl:grid-cols-home-main" : "grid-cols-1",
        )}
      >
        <div className={cn("min-w-0", posts.length > 0 && "xl:border-r xl:border-border")}>
          <section className="px-6 py-6 pb-24">
            <DailyNotes />
          </section>
        </div>
        {posts.length > 0 ? (
          <SidebarLinkPanel
            id="notes-sidebar-writing-heading"
            title="Related writing"
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
