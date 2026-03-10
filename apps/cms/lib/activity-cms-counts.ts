/**
 * Fills per-day counts and link IDs from Payload find results.
 */

import type { ActivitySources } from "./activity-types";
import { toDateOnly } from "./activity-helpers";

type DocsResult = { docs?: unknown[] };

type DayLinks = {
  blogs: string[];
  notes: string[];
  readingNotes: string[];
  favorites: string[];
  errorLogs: string[];
};

export function buildDailyCountsAndLinks(
  postsRes: DocsResult,
  notebooksRes: DocsResult,
  readingRes: DocsResult,
  favoritesRes: DocsResult,
  errorsRes: DocsResult,
  byDay: Record<string, ActivitySources>,
  byDayLinks: Record<string, DayLinks>
): void {
  for (const doc of postsRes.docs ?? []) {
    const day =
      toDateOnly((doc as { publishedAt?: string }).publishedAt) ??
      toDateOnly((doc as { createdAt?: string }).createdAt);
    const slug = (doc as { slug?: string }).slug;
    if (day && byDay[day]) {
      byDay[day].blogsPublished += 1;
      if (typeof slug === "string") byDayLinks[day].blogs.push(slug);
    }
  }
  for (const doc of notebooksRes.docs ?? []) {
    const date = (doc as { date?: string }).date;
    const blocks = (doc as { blocks?: unknown[] }).blocks;
    const day = typeof date === "string" ? date.slice(0, 10) : null;
    if (day && byDay[day] && Array.isArray(blocks) && blocks.length > 0) {
      byDay[day].notesCreated += 1;
      byDayLinks[day].notes.push(day);
    }
  }
  for (const doc of readingRes.docs ?? []) {
    const date = (doc as { date?: string }).date;
    const day = typeof date === "string" ? date.slice(0, 10) : null;
    if (day && byDay[day]) {
      byDay[day].readingNotesCreated += 1;
      byDayLinks[day].readingNotes.push(day);
    }
  }
  for (const doc of favoritesRes.docs ?? []) {
    const day = toDateOnly((doc as { dateAdded?: string }).dateAdded);
    const id = (doc as { id?: number | string }).id;
    if (day && byDay[day]) {
      byDay[day].favoritesAdded += 1;
      if (id != null) byDayLinks[day].favorites.push(String(id));
    }
  }
  for (const doc of errorsRes.docs ?? []) {
    const day = toDateOnly((doc as { occurredAt?: string }).occurredAt);
    const id = (doc as { id?: number | string }).id;
    if (day && byDay[day]) {
      byDay[day].errorLogsCreated += 1;
      if (id != null) byDayLinks[day].errorLogs.push(String(id));
    }
  }
}

export function hasAnyLinks(links: DayLinks): boolean {
  return (
    links.blogs.length > 0 ||
    links.notes.length > 0 ||
    links.readingNotes.length > 0 ||
    links.favorites.length > 0 ||
    links.errorLogs.length > 0
  );
}
