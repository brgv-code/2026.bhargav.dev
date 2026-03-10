/**
 * Aggregates contributions per day from GitHub and Payload collections.
 * Date normalization: use UTC date (YYYY-MM-DD) from document date fields.
 */

import type { Payload } from "payload";
import { fetchDailyCommitsForUser } from "./github";
import {
  type ActivitySources,
  type AggregatedDay,
  EMPTY_SOURCES,
} from "./activity-types";
import { buildActivityLabel } from "./activity-helpers";
import { upsertStreakForDay } from "./activity-streaks";
import { buildDailyCountsAndLinks, hasAnyLinks } from "./activity-cms-counts";
import { slugs } from "@/collections/constants";

export type AggregateOptions = {
  backfill?: boolean;
};

export async function aggregateActivityForRange(
  payload: Payload,
  start: Date,
  end: Date,
  options: AggregateOptions = {}
): Promise<AggregatedDay[]> {
  const username =
    process.env.GITHUB_USERNAME ?? process.env.NEXT_PUBLIC_GITHUB_USERNAME ?? "";
  const githubCounts =
    username.length > 0
      ? await fetchDailyCommitsForUser(username, start, end)
      : ({} as Record<string, number>);

  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);

  const [postsRes, notebooksRes, readingRes, favoritesRes, errorsRes] =
    await Promise.all([
      payload.find({
        collection: slugs.posts,
        where: {
          status: { equals: "published" },
          publishedAt: {
            greater_than_equal: startStr,
            less_than_equal: endStr,
          },
        },
        limit: 500,
        depth: 0,
      }),
      payload.find({
        collection: slugs.notebooks,
        where: {
          date: { greater_than_equal: startStr, less_than_equal: endStr },
        },
        limit: 500,
        depth: 0,
      }),
      payload.find({
        collection: slugs.readingNotes,
        where: {
          date: { greater_than_equal: startStr, less_than_equal: endStr },
        },
        limit: 500,
        depth: 0,
      }),
      payload.find({
        collection: slugs.favorites,
        where: {
          dateAdded: { greater_than_equal: startStr, less_than_equal: endStr },
        },
        limit: 500,
        depth: 0,
      }),
      payload.find({
        collection: slugs.errorLogs,
        where: {
          occurredAt: { greater_than_equal: startStr, less_than_equal: endStr },
        },
        limit: 500,
        depth: 0,
      }),
    ]);

  const byDay: Record<string, ActivitySources> = {};
  const byDayLinks: Record<string, { blogs: string[]; notes: string[]; readingNotes: string[]; favorites: string[]; errorLogs: string[] }> = {};
  const days: string[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.toISOString().slice(0, 10);
    days.push(day);
    byDay[day] = { ...EMPTY_SOURCES };
    byDayLinks[day] = { blogs: [], notes: [], readingNotes: [], favorites: [], errorLogs: [] };
  }

  buildDailyCountsAndLinks(
    postsRes,
    notebooksRes,
    readingRes,
    favoritesRes,
    errorsRes,
    byDay,
    byDayLinks
  );

  const result: AggregatedDay[] = days.map((date) => {
    const sources = byDay[date] ?? { ...EMPTY_SOURCES };
    sources.githubCommits = githubCounts[date] ?? 0;
    const total =
      sources.githubCommits +
      sources.blogsPublished +
      sources.notesCreated +
      sources.readingNotesCreated +
      sources.favoritesAdded +
      sources.errorLogsCreated;
    const label = buildActivityLabel(sources);
    const rawLinks = byDayLinks[date];
    const links = rawLinks && hasAnyLinks(rawLinks) ? rawLinks : undefined;
    const aggregated: AggregatedDay = { date, total, sources, label, links };
    if (options.backfill) {
      void upsertStreakForDay(payload, aggregated);
    }
    return aggregated;
  });

  return result;
}
