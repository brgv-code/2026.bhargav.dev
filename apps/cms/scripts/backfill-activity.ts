/**
 * One-off backfill: aggregate activity for the last 365 days and upsert streaks.
 * Run: pnpm run backfill:activity (or payload run ./scripts/backfill-activity.ts)
 */
import { getPayload } from "payload";
import config from "../payload.config";
import { aggregateActivityForRange } from "../lib/activity-aggregate";

async function main(): Promise<void> {
  const payload = await getPayload({ config });
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 364);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const dryRun = process.argv.includes("--dry-run");
  const data = await aggregateActivityForRange(payload, start, end, {
    backfill: !dryRun,
  });

  console.log(
    dryRun ? "[dry-run] Would write" : "Wrote",
    data.length,
    "days. Sample:",
    data.slice(-3)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
