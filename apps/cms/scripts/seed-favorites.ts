import { getPayload } from "payload";
import config from "../payload.config";

type FavoriteType = "article" | "video" | "podcast" | "book" | "tool";

type SeedFavorite = {
  type: FavoriteType;
  title: string;
  url?: string;
  source?: string;
  thoughts?: string;
  dateAdded: string;
};

function isoDayOffset(offsetDays: number): string {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  return now.toISOString();
}

const SEED_FAVORITES: SeedFavorite[] = [
  {
    type: "article",
    title: "A Philosophy of Software Design",
    url: "https://web.stanford.edu/~ouster/cgi-bin/book.php",
    source: "Stanford",
    thoughts: "Useful framing for reducing cognitive load through deep modules.",
    dateAdded: isoDayOffset(-7),
  },
  {
    type: "video",
    title: "Vercel Ship Keynote",
    url: "https://www.youtube.com/@Vercel",
    source: "YouTube",
    thoughts: "Good benchmark for DX expectations in modern web platforms.",
    dateAdded: isoDayOffset(-6),
  },
  {
    type: "podcast",
    title: "The Changelog",
    url: "https://changelog.com/podcast",
    source: "Changelog",
    thoughts: "Reliable background source for ecosystem shifts and tooling decisions.",
    dateAdded: isoDayOffset(-5),
  },
  {
    type: "book",
    title: "Designing Data-Intensive Applications",
    source: "O'Reilly",
    thoughts: "Still the best systems reference for product engineers.",
    dateAdded: isoDayOffset(-4),
  },
  {
    type: "tool",
    title: "Raycast",
    url: "https://raycast.com",
    source: "raycast.com",
    thoughts: "Fast command workflow for daily development and automation.",
    dateAdded: isoDayOffset(-3),
  },
];

function isMissingFavoritesTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /no such table|relation .* does not exist|favorites/i.test(message);
}

async function run(): Promise<void> {
  const payload = await getPayload({ config });
  const dryRun = process.argv.includes("--dry-run");

  console.log(
    dryRun
      ? "Seeding favorites in dry-run mode (no writes)."
      : "Seeding favorites into Payload...",
  );

  let created = 0;
  let updated = 0;

  for (const seed of SEED_FAVORITES) {
    let query;
    try {
      query = await payload.find({
        collection: "favorites",
        limit: 1,
        depth: 0,
        where: {
          or: seed.url
            ? [
                { title: { equals: seed.title } },
                { url: { equals: seed.url } },
              ]
            : [{ title: { equals: seed.title } }],
        },
      });
    } catch (error) {
      if (isMissingFavoritesTableError(error)) {
        throw new Error(
          "Favorites table is missing. Run CMS migrations first: `pnpm --filter @repo/cms run migrate`.",
        );
      }
      throw error;
    }

    const data = {
      type: seed.type,
      title: seed.title,
      url: seed.url ?? null,
      source: seed.source ?? null,
      thoughts: seed.thoughts ?? null,
      dateAdded: seed.dateAdded,
    };

    if (query.docs.length === 0) {
      if (!dryRun) {
        await payload.create({
          collection: "favorites",
          data,
        });
      }
      created += 1;
      console.log(`[favorites] created: ${seed.title}`);
      continue;
    }

    if (!dryRun) {
      await payload.update({
        collection: "favorites",
        id: query.docs[0]!.id,
        data,
      });
    }
    updated += 1;
    console.log(`[favorites] updated: ${seed.title}`);
  }

  console.log(
    `[favorites] done. created=${created}, updated=${updated}, total=${SEED_FAVORITES.length}`,
  );
  await payload.destroy();
}

void run().catch((error) => {
  console.error("[seed-favorites] failed", error);
  process.exit(1);
});
