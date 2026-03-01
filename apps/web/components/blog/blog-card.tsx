import Link from "next/link";

export type BlogCardProps = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  tags: string[];
  readTime: string;
  featured?: boolean;
};

export function BlogCard({
  slug,
  title,
  subtitle,
  date,
  tags,
  readTime,
  featured = false,
}: BlogCardProps) {
  return (
    <article className="group">
      <Link
        href={`/blog/${slug}`}
        className="block py-6 border-b border-dashed border-[var(--editorial-border)]"
      >
        <div className="flex items-baseline justify-between gap-4 mb-1.5">
          <h3
            className={`font-serif leading-snug text-[var(--editorial-text)] group-hover:text-[var(--editorial-accent)] transition-colors duration-200 ${
              featured
                ? "text-[1.6rem] md:text-[1.85rem]"
                : "text-xl md:text-[1.35rem]"
            }`}
          >
            {title}
          </h3>
          <span className="font-mono text-[11px] text-[var(--editorial-text-dim)] whitespace-nowrap shrink-0">
            {date}
          </span>
        </div>
        <p className="text-[var(--editorial-text-muted)] text-[14.5px] leading-relaxed mb-3 max-w-xl">
          {subtitle}
        </p>
        <div className="flex items-center gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] text-[var(--editorial-text-dim)]"
            >
              #{tag}
            </span>
          ))}
          <span className="font-mono text-[10px] text-[var(--editorial-text-dim)] ml-auto">
            {readTime}
          </span>
        </div>
      </Link>
    </article>
  );
}
