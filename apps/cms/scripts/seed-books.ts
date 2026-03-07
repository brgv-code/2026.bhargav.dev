import { getPayload } from "payload";
import config from "../payload.config";

type BookStatus = "reading" | "completed" | "paused" | "wishlist";

type SeedBook = {
  title: string;
  author?: string;
  totalPages?: number;
  currentPage?: number;
  status: BookStatus;
  summary?: string;
  startedAt?: string;
  finishedAt?: string;
};

function isoDayOffset(offsetDays: number): string {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  return now.toISOString();
}

const SEED_BOOKS: SeedBook[] = [
  {
    title: "The Alignment Problem",
    author: "Brian Christian",
    totalPages: 496,
    currentPage: 134,
    status: "reading",
    summary:
      "A systems-level look at how ML objectives drift from human intent.",
    startedAt: isoDayOffset(-14),
  },
  {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    totalPages: 616,
    currentPage: 616,
    status: "completed",
    summary:
      "Reference for data models, distributed systems, and reliability tradeoffs.",
    startedAt: isoDayOffset(-120),
    finishedAt: isoDayOffset(-20),
  },
  {
    title: "Refactoring",
    author: "Martin Fowler",
    totalPages: 448,
    currentPage: 120,
    status: "paused",
    summary: "Catalog of code transformation patterns for safer iterative cleanup.",
    startedAt: isoDayOffset(-45),
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    totalPages: 464,
    currentPage: 0,
    status: "wishlist",
    summary: "Queued for reread while updating project standards and code review rules.",
  },
];

function isMissingBooksTableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /no such table|relation .* does not exist|books/i.test(message);
}

async function run(): Promise<void> {
  const payload = await getPayload({ config });
  const dryRun = process.argv.includes("--dry-run");

  console.log(
    dryRun
      ? "Seeding books in dry-run mode (no writes)."
      : "Seeding books into Payload...",
  );

  let created = 0;
  let updated = 0;

  for (const seed of SEED_BOOKS) {
    let query;
    try {
      query = await payload.find({
        collection: "books",
        limit: 1,
        depth: 0,
        where: {
          and: [
            { title: { equals: seed.title } },
            { author: { equals: seed.author ?? null } },
          ],
        },
      });
    } catch (error) {
      if (isMissingBooksTableError(error)) {
        throw new Error(
          "Books table is missing. Run CMS migrations first: `pnpm --filter @repo/cms run migrate`.",
        );
      }
      throw error;
    }

    const data = {
      title: seed.title,
      author: seed.author,
      totalPages: seed.totalPages,
      currentPage: seed.currentPage ?? 0,
      status: seed.status,
      summary: seed.summary,
      startedAt: seed.startedAt,
      finishedAt: seed.finishedAt,
    };

    if (query.docs.length === 0) {
      if (!dryRun) {
        await payload.create({
          collection: "books",
          data,
        });
      }
      created += 1;
      console.log(`[books] created: ${seed.title}`);
      continue;
    }

    if (!dryRun) {
      await payload.update({
        collection: "books",
        id: query.docs[0]!.id,
        data,
      });
    }
    updated += 1;
    console.log(`[books] updated: ${seed.title}`);
  }

  console.log(
    `[books] done. created=${created}, updated=${updated}, total=${SEED_BOOKS.length}`,
  );
  await payload.destroy();
}

try {
  await run();
} catch (error) {
  console.error("[seed-books] failed", error);
  process.exit(1);
}
