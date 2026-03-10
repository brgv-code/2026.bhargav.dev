/**
 * GET /api/activity/aggregate?start=YYYY-MM-DD&end=YYYY-MM-DD&backfill=true
 * Returns aggregated contributions per day. If backfill=true and secret is set, upserts streaks.
 */

import { getPayload } from "payload";
import { z } from "zod";
import { configPromise } from "@/payload.config";
import { aggregateActivityForRange } from "@/lib/activity-aggregate";

const QuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  backfill: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v === "true"),
});

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      start: url.searchParams.get("start") ?? undefined,
      end: url.searchParams.get("end") ?? undefined,
      backfill: url.searchParams.get("backfill") ?? undefined,
    });
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid query", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { start, end, backfill } = parsed.data;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return Response.json({ error: "Invalid date range" }, { status: 400 });
    }
    if (startDate > endDate) {
      return Response.json({ error: "start must be <= end" }, { status: 400 });
    }

    const payload = await getPayload({ config: await configPromise });
    const allowBackfill =
      backfill === true &&
      typeof process.env.ACTIVITY_AGGREGATE_SECRET === "string" &&
      process.env.ACTIVITY_AGGREGATE_SECRET.length > 0 &&
      (url.searchParams.get("secret") === process.env.ACTIVITY_AGGREGATE_SECRET ||
        request.headers.get("x-activity-secret") ===
          process.env.ACTIVITY_AGGREGATE_SECRET);

    const data = await aggregateActivityForRange(payload, startDate, endDate, {
      backfill: allowBackfill ?? false,
    });

    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=120, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[activity/aggregate]", err);
    return Response.json(
      { error: "Aggregation failed" },
      { status: 500 }
    );
  }
}
