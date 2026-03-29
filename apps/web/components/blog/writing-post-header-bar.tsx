import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import {
  WritingPostSearch,
  type WritingPostSearchItem,
} from "@/components/blog/writing-post-search";

type Props = {
  siteLabel: string;
  articleTitle: string;
  position: number | null;
  total: number;
  newerSlug: string | null;
  olderSlug: string | null;
  searchPosts: WritingPostSearchItem[];
};

export function WritingPostHeaderBar({
  siteLabel,
  articleTitle,
  position,
  total,
  newerSlug,
  olderSlug,
  searchPosts,
}: Props) {
  const label =
    position != null && total > 0
      ? `${position} / ${total}`
      : null;

  return (
    <header className="sticky top-0 z-sticky flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-2 md:px-8">
      <nav
        className="flex min-w-0 flex-1 items-center gap-2 text-2xs text-muted"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="shrink-0 font-medium text-muted transition-colors hover:text-primary"
        >
          {siteLabel}
        </Link>
        <span className="shrink-0 text-border" aria-hidden="true">
          /
        </span>
        <Link
          href="/writing"
          className="shrink-0 transition-colors hover:text-primary"
        >
          Writing
        </Link>
        <span className="shrink-0 text-border" aria-hidden="true">
          /
        </span>
        <span
          className="min-w-0 truncate text-primary"
          title={articleTitle}
        >
          {articleTitle}
        </span>
      </nav>

      <div className="ml-auto flex items-center gap-3 md:gap-4">
        <WritingPostSearch posts={searchPosts} />

        {label ? (
          <span
            className="hidden tabular-nums text-2xs text-muted sm:inline"
            aria-live="polite"
          >
            {label}
          </span>
        ) : null}

        <div
          className="flex flex-col border border-border"
          role="group"
          aria-label="Adjacent posts"
        >
          {newerSlug ? (
            <Link
              href={`/writing/${newerSlug}`}
              className="flex h-7 w-8 items-center justify-center text-muted transition-colors hover:bg-interactive-hover hover:text-primary"
              aria-label="Newer post"
            >
              <ChevronUp size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
          ) : (
            <span
              className="flex h-7 w-8 cursor-not-allowed items-center justify-center text-muted opacity-30"
              aria-disabled="true"
              aria-label="No newer post"
            >
              <ChevronUp size={14} strokeWidth={2} aria-hidden="true" />
            </span>
          )}
          <div className="h-px bg-border" aria-hidden="true" />
          {olderSlug ? (
            <Link
              href={`/writing/${olderSlug}`}
              className="flex h-7 w-8 items-center justify-center text-muted transition-colors hover:bg-interactive-hover hover:text-primary"
              aria-label="Older post"
            >
              <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
            </Link>
          ) : (
            <span
              className="flex h-7 w-8 cursor-not-allowed items-center justify-center text-muted opacity-30"
              aria-disabled="true"
              aria-label="No older post"
            >
              <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
