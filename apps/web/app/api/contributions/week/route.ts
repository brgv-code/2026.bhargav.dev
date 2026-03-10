/**
 * GET /api/contributions/week — total contributions in the last 7 days.
 * Used by the header to show "X Contributions this week".
 */

import { fetchWeeklyContributions } from "@/lib/data/activity";

export const revalidate = 120;

export async function GET(): Promise<Response> {
  try {
    const total = await fetchWeeklyContributions();
    return Response.json(
      { total },
      {
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
        },
      }
    );
  } catch {
    return Response.json({ total: 0 }, { status: 200 });
  }
}
