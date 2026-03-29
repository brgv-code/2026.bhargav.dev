import { BlogPostTOC } from "@/components/blog/blog-post-toc";
import type { PayloadTocItem } from "@/lib/data/cms";
import { cn } from "@/lib/utils";

type Props = {
  items: PayloadTocItem[] | null | undefined;
  className?: string;
};

/**
 * Right rail: fills the article grid row beside the title/body, surface matches main column
 * height. “In this article” sits in the same grid row as the title (see page grid) and sticks
 * under the post header while scrolling.
 */
export function BlogPostTocRail({ items, className }: Props) {
  if (!items?.length) return null;

  return (
    <aside
      className={cn(
        "hidden min-h-0 w-right-panel flex-col bg-surface lg:flex lg:h-full",
        className,
      )}
    >
      <div className="sticky top-writing-header z-base w-full px-6 pb-10 pt-0">
        <BlogPostTOC items={items} />
      </div>
    </aside>
  );
}
