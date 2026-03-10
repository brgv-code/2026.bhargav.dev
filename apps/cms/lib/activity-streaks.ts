/**
 * Upsert streak document for a single day from aggregated activity.
 */

import type { Payload } from "payload";
import type { AggregatedDay } from "./activity-types";
import { slugs } from "@/collections/constants";

export async function upsertStreakForDay(
  payload: Payload,
  day: AggregatedDay
): Promise<void> {
  try {
    const existing = await payload.find({
      collection: slugs.streaks,
      where: { date: { equals: day.date } },
      limit: 1,
      depth: 0,
    });
    const doc = existing.docs?.[0];
    const body = {
      label: day.label,
      date: day.date,
      completed: day.total > 0,
      sources: day.sources,
      ...(day.links && Object.keys(day.links).length > 0 ? { links: day.links } : {}),
    };
    if (doc && doc.id) {
      await payload.update({
        collection: slugs.streaks,
        id: doc.id,
        data: body,
      });
    } else {
      await payload.create({
        collection: slugs.streaks,
        data: body,
      });
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[activity-streaks] upsert failed", day.date, err);
    }
  }
}
