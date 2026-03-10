/**
 * Helpers for activity aggregation: date normalization and label formatting.
 */

import type { ActivitySources } from "./activity-types";

export function toDateOnly(iso: string | null | undefined): string | null {
  if (!iso || typeof iso !== "string") return null;
  const s = iso.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

export function buildActivityLabel(sources: ActivitySources): string {
  const parts: string[] = [];
  if (sources.githubCommits > 0)
    parts.push(
      `${sources.githubCommits} commit${sources.githubCommits !== 1 ? "s" : ""} on GitHub`
    );
  if (sources.blogsPublished > 0)
    parts.push(
      `${sources.blogsPublished} blog${sources.blogsPublished !== 1 ? "s" : ""} posted`
    );
  if (sources.notesCreated > 0)
    parts.push(
      `${sources.notesCreated} note${sources.notesCreated !== 1 ? "s" : ""} created`
    );
  if (sources.readingNotesCreated > 0)
    parts.push(
      `${sources.readingNotesCreated} reading note${sources.readingNotesCreated !== 1 ? "s" : ""}`
    );
  if (sources.favoritesAdded > 0)
    parts.push(
      `${sources.favoritesAdded} favorite${sources.favoritesAdded !== 1 ? "s" : ""} added`
    );
  if (sources.errorLogsCreated > 0)
    parts.push(
      `${sources.errorLogsCreated} error log${sources.errorLogsCreated !== 1 ? "s" : ""}`
    );
  return parts.length > 0 ? parts.join(", ") : "No activity";
}
