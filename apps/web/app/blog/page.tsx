import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { BlogCard, BlogPostFooter } from "@/components/blog";
import { fetchBlogListPosts, tagNames, type PayloadPostListItem } from "@/lib/payload";
import { formatPostDate, formatReadTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notes on code, tooling, and things I've learned the hard way. Mostly written late at night with too much coffee.",
};

function postToCard(post: PayloadPostListItem, featured: boolean) {
  const date = formatPostDate(post.publishedAt ?? post.updatedAt ?? post.createdAt);
  const readTime = formatReadTime(post.readingTime);
  return (
    <BlogCard
      key={post.id}
      slug={post.slug}
      title={post.title}
      subtitle={post.description ?? ""}
      date={date}
      tags={tagNames(post.tags)}
      readTime={readTime}
      featured={featured}
    />
  );
}

export default async function BlogIndexPage() {
  const posts = await fetchBlogListPosts(50);

  return (
    <>
      <Navbar />
      <div data-theme="editorial" className="min-h-screen bg-[var(--editorial-bg)]">
        <main className="max-w-[720px] mx-auto w-full px-6 md:px-8 pt-28 pb-24">
          <header className="mb-14">
            <p className="font-serif italic text-[var(--editorial-text-muted)] text-[15px] mb-3">
              a notebook by
            </p>
            <h1 className="font-serif text-4xl md:text-[3.2rem] text-[var(--editorial-text)] leading-[1.1] mb-4">
              Bhargav
            </h1>
            <p className="text-[var(--editorial-text-muted)] text-[15px] leading-relaxed max-w-md">
              Notes on code, tooling, and things I&apos;ve learned the hard way.
              Mostly written late at night with too much coffee.
            </p>
            <div className="mt-8 border-b border-dashed border-[var(--editorial-border)]" />
          </header>

          <div className="flex flex-col">
            {posts.length > 0 ? (
              posts.map((post, i) => postToCard(post, i === 0))
            ) : (
              <p className="text-[var(--editorial-text-muted)] text-[15px] py-8">
                No posts yet. Check back soon.
              </p>
            )}
          </div>
        </main>

        <BlogPostFooter className="mt-12 w-full" />
      </div>
    </>
  );
}
