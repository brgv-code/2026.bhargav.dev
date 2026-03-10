/**
 * Activity aggregation data layer. Fetches from CMS /api/activity/aggregate.
 * Dates are YYYY-MM-DD.
 */

import type { PayloadActivityDay } from "@/lib/payload";

export type ActivitySources = {
  githubCommits: number;
  blogsPublished: number;
  notesCreated: number;
  readingNotesCreated: number;
  favoritesAdded: number;
  errorLogsCreated: number;
};

export type AggregatedDay = {
  date: string;
  total: number;
  sources: ActivitySources;
  label: string;
};

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : undefined);

function getCmsUrl(): string | undefined {
  return cmsUrl;
}

export async function fetchAggregatedActivity(params: {
  start: string;
  end: string;
}): Promise<AggregatedDay[]> {
  const base = getCmsUrl();
  if (!base) return [];

  try {
    const url = new URL(`${base}/api/activity/aggregate`);
    url.searchParams.set("start", params.start);
    url.searchParams.set("end", params.end);
    const res = await fetch(url.toString(), {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as AggregatedDay[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Returns total contributions for the current week (Sunday–today). */
export async function fetchWeeklyContributions(): Promise<number> {
  const end = new Date();
  const start = new Date(end);
  const dayOfWeek = start.getDay(); // 0 = Sunday
  start.setDate(start.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const days = await fetchAggregatedActivity({ start: startStr, end: endStr });
  return days.reduce((sum, d) => sum + d.total, 0);
}

function formatActivityDate(iso: string): string {
  try {
    const d = new Date(iso + "T12:00:00Z");
    const today = new Date();
    const isToday =
      d.getUTCDate() === today.getUTCDate() &&
      d.getUTCMonth() === today.getUTCMonth() &&
      d.getUTCFullYear() === today.getUTCFullYear();
    if (isToday) return "Today";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

/** Maps aggregated days to grid shape and fetches last 14 days. */
export async function getActivityLogForGrid(): Promise<PayloadActivityDay[]> {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 13);
  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const days = await fetchAggregatedActivity({ start: startStr, end: endStr });
  return days.map((d) => ({
    date: formatActivityDate(d.date),
    intensity: Math.min(1, Math.max(0, d.total / 5)),
    summary: d.label,
    sources: d.sources,
  }));
}
