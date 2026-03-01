/**
 * Returns the number of commits by the given GitHub username in the current week (Sunday–today).
 * Requires GITHUB_USERNAME and optionally GITHUB_TOKEN (for higher rate limit).
 * Returns null if not configured or on error.
 */
export async function getCommitsThisWeek(): Promise<number | null> {
  const username = process.env.GITHUB_USERNAME ?? process.env.NEXT_PUBLIC_GITHUB_USERNAME;
  if (!username) return null;

  const token = process.env.GITHUB_TOKEN;
  const startOfWeek = getStartOfWeek(new Date());
  const since = startOfWeek.toISOString().slice(0, 10);

  try {
    const url = `https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}+committer-date:>${since}&per_page=1`;
    const headers: HeadersInit = {
      Accept: "application/vnd.github.cloak-preview+json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    const res = await fetch(url, { next: { revalidate: 300 }, headers });
    if (!res.ok) return null;
    const data = (await res.json()) as { total_count?: number };
    return typeof data.total_count === "number" ? data.total_count : null;
  } catch {
    return null;
  }
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
