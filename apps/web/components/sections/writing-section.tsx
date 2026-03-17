import Link from "next/link";
import type { PayloadPostListItem } from "@/lib/data/cms";
import { formatPostDate, formatReadTime } from "@/lib/format";

type Props = {
  posts: PayloadPostListItem[];
  showTitle?: boolean;
};

export function WritingSection({ posts, showTitle = true }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <section id="writing" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-xl">
        {showTitle ? (
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted text-center mt-24 mb-10">
            Writing
          </h2>
        ) : null}
        <div className="flex flex-col gap-12">
          {posts.map((post) => {
            const dateLabel = formatPostDate(
              post.publishedAt ?? post.createdAt ?? post.updatedAt,
            );
            const readTime = formatReadTime(post.readingTime);
            const metaParts = [dateLabel, readTime].filter(Boolean);

            return (
              <article
                key={post.id}
                className="flex flex-col gap-2 content-visibility-auto"
              >
                <Link
                  href={`/writing/${post.slug}`}
                  className="text-base font-semibold text-primary"
                >
                  {post.title}
                </Link>
                {metaParts.length ? (
                  <p className="text-sm text-muted">{metaParts.join(" / ")}</p>
                ) : null}
                {post.description ? (
                  <p className="text-base text-secondary">{post.description}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
