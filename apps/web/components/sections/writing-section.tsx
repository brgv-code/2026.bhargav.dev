import Link from "next/link";
import type { PayloadPostListItem } from "@/lib/data/cms";
import { tagNames } from "@/lib/data/cms";
import { formatPostDate, formatReadTime } from "@/lib/format";

type Props = {
  posts: PayloadPostListItem[];
};

export function WritingSection({ posts }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <section id="writing" className="scroll-mt-24">
      <h2 className="text-3xl font-bold tracking-tight text-primary mt-24 mb-10">
        Writing
      </h2>
      <div className="flex flex-col gap-8">
        {posts.map((post) => {
          const dateLabel = formatPostDate(
            post.publishedAt ?? post.createdAt ?? post.updatedAt,
          );
          const readTime = formatReadTime(post.readingTime);
          const tags = tagNames(post.tags);
          const metaParts = [
            dateLabel,
            readTime,
            tags.length ? tags.join(" / ") : "",
          ].filter(Boolean);

          return (
            <article key={post.id} className="flex flex-col gap-2">
              <Link
                href={`/writing/${post.slug}`}
                className="text-base font-medium text-primary"
              >
                {post.title}
              </Link>
              {post.description ? (
                <p className="text-base text-secondary">{post.description}</p>
              ) : null}
              {metaParts.length ? (
                <p className="text-base text-muted">{metaParts.join(" / ")}</p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
