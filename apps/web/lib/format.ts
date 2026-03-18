function parseDate(value: string | number | null | undefined): Date | null {
  if (value == null || value === "") return null;
  const d = typeof value === "string" ? new Date(value) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatPostDate(
  value: string | number | null | undefined
): string {
  const d = parseDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthYear(
  value: string | number | null | undefined
): string {
  const d = parseDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatMonthDay(
  value: string | number | null | undefined
): string {
  const d = parseDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatWithWeekday(
  value: string | number | null | undefined,
  longWeekday = false
): string {
  const d = parseDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", {
    weekday: longWeekday ? "long" : "short",
    month: "short",
    day: "numeric",
  });
}

export function formatReadTime(minutes: number | null | undefined): string {
  if (minutes == null || minutes < 1) return "";
  return `${minutes} min read`;
}

export function caseStudyAnchor(title: string): string {
  if (title.toLowerCase().includes("case study")) return title;
  return `${title} case study`;
}

export function formatActivityDate(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
    if (isToday) return "Today";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}
