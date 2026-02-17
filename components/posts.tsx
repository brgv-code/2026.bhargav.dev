import { PixelArrow } from "./pixel-icons";
import { fetchLatestPosts } from "@/lib/payload";

export async function Posts() {
  const posts = await fetchLatestPosts(3);

  return (
    <section className="py-12">
      <h2 className="text-xs text-muted-foreground uppercase tracking-widest mb-6">
        Writing
      </h2>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No posts published yet.
        </p>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex items-baseline justify-between gap-4 py-2.5 border-b border-border/50 hover:border-border transition-colors"
            >
              <span className="text-sm text-foreground/90 group-hover:text-link transition-colors">
                {post.title}
              </span>
              <span className="flex-shrink-0 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="hidden sm:inline">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : null}
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
