import Link from "next/link";
import type { PayloadPostSummary } from "@/lib/payload";

const RELATED_PLACEHOLDER = "No related articles yet.";

type Props = {
  posts: PayloadPostSummary[];
};

export function BlogPostFurtherReading({ posts }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[10px] font-mono text-[var(--editorial-text-dim)] uppercase tracking-widest pb-2 border-b border-[var(--editorial-border)]">
        Related
      </div>
      {posts.length > 0 ? (
        <ul className="list-none flex flex-col gap-1">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="block text-[13px] text-[var(--editorial-text-muted)] hover:text-[var(--editorial-text)] hover:bg-[var(--editorial-surface2)] py-2 px-2 rounded-sm transition-colors leading-snug"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[13px] text-[var(--editorial-text-dim)] py-2 px-0 leading-snug">
          {RELATED_PLACEHOLDER}
        </p>
      )}
    </div>
  );
}
