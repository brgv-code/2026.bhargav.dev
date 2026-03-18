import Link from "next/link";
import type { PayloadPostListItem } from "@/lib/data/cms";
import { formatPostDate, formatReadTime } from "@/lib/format";

type Props = {
  posts: PayloadPostListItem[];
  showHeader?: boolean;
};

export function WritingSection({ posts, showHeader = true }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <section id="writing" aria-labelledby="writing-heading" className="scroll-mt-24 space-y-12">
      {/* Section header */}
      {showHeader ? <div className="flex items-baseline justify-between border-b border-border/15 pb-4">
        <h2
          id="writing-heading"
          className="font-serif text-3xl text-accent"
        >
          Selected Writing
        </h2>
        <Link
          href="/writing"
          className="text-sm text-primary uppercase tracking-widest hover:underline underline-offset-8"
        >
          All Articles
        </Link>
      </div> : null}

      {/* Articles */}
      <div className="flex flex-col gap-16">
        {posts.map((post) => {
          const dateLabel = formatPostDate(
            post.publishedAt ?? post.createdAt ?? post.updatedAt,
          );
          const readTime = formatReadTime(post.readingTime);

          return (
            <article
              key={post.id}
              className="group editorial-grid content-visibility-auto"
            >
              {/* Date column */}
              <div className="text-sm text-muted pt-1">
                <time
                  dateTime={post.publishedAt ?? post.createdAt ?? post.updatedAt}
                >
                  {dateLabel}
                </time>
                {readTime ? (
                  <p className="mt-1 text-xs text-muted/70">{readTime}</p>
                ) : null}
              </div>

              {/* Content column */}
              <div className="space-y-4">
                <h3 className="font-serif text-2xl leading-tight group-hover:text-accent transition-colors">
                  <Link href={`/writing/${post.slug}`} className="text-primary hover:text-accent">
                    {post.title}
                  </Link>
                </h3>
                {post.description ? (
                  <p className="text-secondary leading-relaxed">
                    {post.description}
                  </p>
                ) : null}
                <div className="pt-2">
                  <Link
                    href={`/writing/${post.slug}`}
                    className="text-sm font-semibold text-accent inline-flex items-center gap-1 group/link hover:gap-2 transition-all"
                    aria-label={`Read ${post.title}`}
                  >
                    Read Entry
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
