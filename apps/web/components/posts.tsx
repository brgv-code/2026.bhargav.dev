import { PixelArrow } from "./pixel-icons";
import { fetchLatestPosts } from "@/lib/payload";
import { formatMonthYear } from "@/lib/format";

export async function Posts() {
  const posts = await fetchLatestPosts(3);

  return (
    <section className="py-5">
      <h2 className="text-[var(--editorial-text-dim)] font-mono text-[10px] uppercase tracking-widest mb-4">
        Writing
      </h2>

      {posts.length === 0 ? (
        <p className="text-sm text-[var(--editorial-text-muted)]">
          No posts published yet.
        </p>
      ) : (
        <div className="space-y-0">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex items-baseline justify-between gap-4 py-2 border-b border-dashed border-[var(--editorial-border)] hover:border-[var(--editorial-accent)] transition-colors"
            >
              <span className="text-sm text-[var(--editorial-text)] group-hover:text-[var(--editorial-accent)] transition-colors">
                {post.title}
              </span>
              <span className="flex-shrink-0 flex items-center gap-2 text-xs text-[var(--editorial-text-muted)]">
                <span className="hidden sm:inline">
                  {formatMonthYear(post.publishedAt) || null}
                </span>
                <PixelArrow className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
