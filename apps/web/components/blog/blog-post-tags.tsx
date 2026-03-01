import type { PayloadTag } from "@/lib/payload";

type Props = {
  tags: PayloadTag[] | null | undefined;
};

export function BlogPostTags({ tags }: Props) {
  if (!tags?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mb-6">
      {tags.map((tag, i) => (
        <span
          key={tag.id}
          className={
            i === 0
              ? "text-[11px] font-mono px-2.5 py-1 rounded-sm bg-[rgba(200,75,47,0.1)] text-[var(--editorial-accent)] border border-[rgba(200,75,47,0.25)] tracking-wide"
              : "text-[11px] font-mono px-2.5 py-1 rounded-sm bg-[var(--editorial-surface2)] text-[var(--editorial-text-muted)] border border-[var(--editorial-border)] tracking-wide"
          }
        >
          #{tag.name}
        </span>
      ))}
    </div>
  );
}
