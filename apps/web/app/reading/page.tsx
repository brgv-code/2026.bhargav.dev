import type { Metadata } from "next";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/jsonld";
import { SidebarLinkPanel } from "@/components/sections/sidebar-link-panel";
import {
  fetchBlogListPosts,
  fetchCurrentBookFromPayload,
  fetchReadingNotesFromPayload,
} from "@/lib/data/cms";
import { formatMonthDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import { absoluteUrl, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Reading",
  description: "Current reading progress and notes.",
  alternates: { canonical: absoluteUrl("/reading") },
  openGraph: {
    type: "website",
    title: "Reading",
    description: "Current reading progress and notes.",
    url: absoluteUrl("/reading"),
    siteName,
    images: [{ url: "/og-writing.svg", width: 1200, height: 630, alt: "Reading" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reading",
    description: "Current reading progress and notes.",
    images: ["/og-writing.svg"],
  },
};

export const dynamic = "force-static";
export const revalidate = 30;

export default async function ReadingPage() {
  const [book, posts] = await Promise.all([
    fetchCurrentBookFromPayload(),
    fetchBlogListPosts(5),
  ]);
  const notes = book ? await fetchReadingNotesFromPayload(book.id) : [];
  const progress =
    book?.currentPage && book?.totalPages
      ? Math.max(0, Math.min(100, Math.round((book.currentPage / book.totalPages) * 100)))
      : null;

  return (
    <>
      <div className="border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold text-primary">Reading</h1>
        <p className="text-sm text-secondary mt-0.5">
          Current book, progress, and reading notes.
        </p>
      </div>

      <BreadcrumbsJsonLd
        id="reading-breadcrumbs"
        items={[
          { name: "Home", href: absoluteUrl("/") },
          { name: "Reading", href: absoluteUrl("/reading") },
        ]}
      />
      <JsonLd
        id="reading-page"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          url: absoluteUrl("/reading"),
          name: "Reading",
          description: "Current reading progress and notes.",
        }}
      />

      <div
        className={cn(
          "grid min-h-0",
          posts.length > 0 ? "grid-cols-1 xl:grid-cols-home-main" : "grid-cols-1",
        )}
      >
        <div className={cn("min-w-0", posts.length > 0 && "xl:border-r xl:border-border")}>
          <section aria-label="Reading overview" className="pb-24">
            {book ? (
              <article className="border-b border-border px-6 py-6 content-visibility-auto">
                <div className="max-w-3xl flex flex-col gap-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-base font-semibold text-primary leading-snug">
                      {book.title}
                    </h2>
                    {book.author ? (
                      <p className="text-xs text-muted shrink-0">{book.author}</p>
                    ) : null}
                  </div>
                  {book.summary ? (
                    <p className="text-sm text-secondary leading-relaxed">{book.summary}</p>
                  ) : null}
                  <div className="flex items-center gap-3">
                    {progress != null ? (
                      <>
                        <div className="h-1.5 w-40 bg-highlight">
                          <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-muted tabular-nums">
                          {book.currentPage ?? 0}/{book.totalPages ?? 0} pages ({progress}%)
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted">Progress data unavailable.</span>
                    )}
                  </div>
                </div>
              </article>
            ) : (
              <p className="border-b border-border px-6 py-10 text-sm text-secondary">
                No active reading session yet.
              </p>
            )}

            <div>
              {(notes ?? []).map((note) => (
                <article key={note.id} className="border-b border-border px-6 py-4">
                  <div className="max-w-3xl flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="text-sm font-semibold text-primary">
                        Pages {note.pageStart}-{note.pageEnd}
                      </p>
                      <time className="text-xs text-muted">{formatMonthDay(note.date)}</time>
                    </div>
                    {note.thoughts ? (
                      <p className="text-sm text-secondary leading-relaxed">{note.thoughts}</p>
                    ) : null}
                  </div>
                </article>
              ))}
              {book && notes.length === 0 ? (
                <p className="border-b border-border px-6 py-8 text-sm text-secondary">
                  No notes yet for this book.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {posts.length > 0 ? (
          <SidebarLinkPanel
            id="reading-sidebar-writing-heading"
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
