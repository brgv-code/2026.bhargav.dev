/**
 * Fetches daily commit counts for a GitHub user across all repos.
 * Uses GitHub Search API; date range is inclusive.
 * Requires GITHUB_USERNAME; GITHUB_TOKEN optional (higher rate limit).
 * On failure or rate limit, returns zeros for affected days.
 */

const GITHUB_SEARCH_COMMITS = "https://api.github.com/search/commits";

export type DailyCommitsMap = Record<string, number>;

function toYYYYMMDD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dateRangeDays(since: Date, until: Date): string[] {
  const out: string[] = [];
  const cur = new Date(since);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(until);
  end.setHours(23, 59, 59, 999);
  while (cur <= end) {
    out.push(toYYYYMMDD(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export async function fetchDailyCommitsForUser(
  username: string,
  sinceDate: Date,
  untilDate: Date
): Promise<DailyCommitsMap> {
  const days = dateRangeDays(sinceDate, untilDate);
  const result: DailyCommitsMap = {};
  for (const d of days) result[d] = 0;

  const token = process.env.GITHUB_TOKEN?.trim();
  const headers: HeadersInit = {
    Accept: "application/vnd.github.cloak-preview+json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  for (const day of days) {
    try {
      // Count commits only for this specific calendar day
      const q = `author:${encodeURIComponent(
        username,
      )}+committer-date:${day}..${day}`;
      const url = `${GITHUB_SEARCH_COMMITS}?q=${encodeURIComponent(q)}&per_page=1`;
      const res = await fetch(url, { headers, cache: "no-store" });
      if (!res.ok) {
        if (res.status === 403 || res.status === 422) {
          if (process.env.NODE_ENV === "development") {
            console.warn("[github] Rate limit or validation:", res.status, day);
          }
        }
        continue;
      }
      const data = (await res.json()) as { total_count?: number };
      const count = typeof data.total_count === "number" ? data.total_count : 0;
      result[day] = count;
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[github] Fetch error for", day, err);
      }
    }
  }

  return result;
}
