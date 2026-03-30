import Link from "next/link";
import type { PayloadPostListItem } from "@/lib/data/cms";
import { formatPostDate, formatReadTime } from "@/lib/format";

type Props = {
  posts: PayloadPostListItem[];
  compactHome?: boolean;
};

export function WritingSection({ posts, compactHome = false }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <section aria-labelledby="writing-heading">
      {/* Section header */}
      <div
        className={`flex items-center justify-between px-6 py-4 ${
          compactHome ? "" : "border-b border-border"
        }`}
      >
        <h2
          id="writing-heading"
          className="text-2xs font-mono uppercase tracking-widest text-muted"
        >
          Writing
        </h2>
        <Link
          href="/writing"
          className="text-2xs text-muted hover:text-primary transition-colors duration-normal"
        >
          View all →
        </Link>
      </div>

      {/* Article list */}
      <div>
        {posts.map((post) => {
          const dateLabel = formatPostDate(
            post.publishedAt ?? post.createdAt ?? post.updatedAt
          );
          const readTime = formatReadTime(post.readingTime);

          return (
            <Link
              key={post.id}
              href={`/writing/${post.slug}`}
              className={`group transition-colors duration-normal hover:bg-interactive-hover ${
                compactHome
                  ? "px-0 py-0"
                  : "flex flex-col gap-1 px-6 py-4 border-b border-border"
              }`}
            >
              <div
                className={`flex flex-col gap-1 ${
                  compactHome
                    ? "mx-6 py-4 border-b border-border/60"
                    : ""
                }`}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-sm font-semibold text-primary group-hover:text-accent transition-colors duration-normal leading-snug">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 shrink-0 text-muted">
                    {dateLabel ? (
                      <time
                        dateTime={
                          post.publishedAt ?? post.createdAt ?? post.updatedAt
                        }
                        className="text-xs"
                      >
                        {dateLabel}
                      </time>
                    ) : null}
                    {readTime ? <span className="text-xs">{readTime}</span> : null}
                    <span className="text-xs">→</span>
                  </div>
                </div>
                {post.description ? (
                  <p className="text-xs text-secondary leading-relaxed">
                    {post.description}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
