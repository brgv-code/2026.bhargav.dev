import { formatPostDate, formatReadTime } from "@/lib/format";

type Props = {
  date: string | null | undefined;
  readingTimeMinutes: number | null | undefined;
  wordCount: number | null | undefined;
};

export function BlogPostReadingMeta({
  date,
  readingTimeMinutes,
  wordCount,
}: Props) {
  const parts: string[] = [];
  const formattedDate = formatPostDate(date);
  if (formattedDate) parts.push(formattedDate);
  const readTime = formatReadTime(readingTimeMinutes);
  if (readTime) parts.push(readTime);
  if (wordCount != null && wordCount > 0) {
    parts.push(`${wordCount} words`);
  }
  if (parts.length === 0) return null;

  return (
    <p className="text-[11px] font-mono text-[var(--editorial-text-dim)] tracking-wide">
      {parts.join(" · ")}
    </p>
  );
}
