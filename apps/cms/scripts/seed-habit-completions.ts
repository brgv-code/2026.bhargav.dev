import { getPayload } from "payload";
import config from "../payload.config";

type HabitKey =
  | "reading"
  | "workout"
  | "steps"
  | "eating"
  | "sleep"
  | "coding"
  | "editing";

type SeedCompletion = {
  dayOffset: number;
  habitKey: HabitKey;
  completed: boolean;
  value: number;
  notes?: string;
  reading?: {
    pageStart: number;
    pageEnd: number;
    thoughts?: string;
  };
};

const READING_BOOK_TITLE = "The Alignment Problem";
const READING_BOOK_AUTHOR = "Brian Christian";

const SEED_COMPLETIONS: SeedCompletion[] = [
  {
    dayOffset: -6,
    habitKey: "reading",
    completed: true,
    value: 22,
    reading: {
      pageStart: 112,
      pageEnd: 133,
      thoughts: "Great section on reward misspecification and objective hacking.",
    },
  },
  {
    dayOffset: -5,
    habitKey: "reading",
    completed: true,
    value: 18,
    reading: {
      pageStart: 134,
      pageEnd: 151,
      thoughts: "The social context around deployment matters more than model score.",
    },
  },
  {
    dayOffset: -4,
    habitKey: "reading",
    completed: true,
    value: 16,
    reading: {
      pageStart: 152,
      pageEnd: 167,
      thoughts: "Useful framing for aligning feedback loops with product behavior.",
    },
  },
  {
    dayOffset: -3,
    habitKey: "coding",
    completed: true,
    value: 1,
    notes: "Completed API migration pass for runtime data domains.",
  },
  {
    dayOffset: -2,
    habitKey: "workout",
    completed: true,
    value: 1,
    notes: "Strength session.",
  },
  {
    dayOffset: -1,
    habitKey: "steps",
    completed: true,
    value: 10240,
    notes: "Evening walk after deep work block.",
  },
  {
    dayOffset: 0,
    habitKey: "coding",
    completed: true,
    value: 1,
    notes: "Payload unification and migration scripts.",
  },
];

function dayOffsetToDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function isMissingTableError(error: unknown, tableName: string): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const lower = tableName.toLowerCase();
  return new RegExp(`no such table|relation .* does not exist|${lower}`, "i").test(
    message,
  );
}

function asNumericId(value: unknown, label: string): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  throw new Error(`Expected numeric ID for ${label}, got: ${String(value)}`);
}

async function ensureReadingBookId(
  payload: Awaited<ReturnType<typeof getPayload>>,
  dryRun: boolean,
): Promise<number> {
  try {
    const byTitle = await payload.find({
      collection: "books",
      limit: 1,
      depth: 0,
      where: {
        and: [
          { title: { equals: READING_BOOK_TITLE } },
          { author: { equals: READING_BOOK_AUTHOR } },
        ],
      },
    });

    if (byTitle.docs.length > 0) {
      return asNumericId(byTitle.docs[0]!.id, "books.id");
    }

    if (dryRun) {
      console.log(
        `[books] would create reading book: ${READING_BOOK_TITLE} (${READING_BOOK_AUTHOR})`,
      );
      return -1;
    }

    const created = await payload.create({
      collection: "books",
      data: {
        title: READING_BOOK_TITLE,
        author: READING_BOOK_AUTHOR,
        totalPages: 496,
        currentPage: 0,
        status: "reading",
      },
    });
    return asNumericId(created.id, "books.id");
  } catch (error) {
    if (isMissingTableError(error, "books")) {
      throw new Error(
        "Books table is missing. Run CMS migrations first: `pnpm --filter @repo/cms run migrate`.",
      );
    }
    throw error;
  }
}

async function run(): Promise<void> {
  const payload = await getPayload({ config });
  const dryRun = process.argv.includes("--dry-run");

  console.log(
    dryRun
      ? "Seeding habit completions in dry-run mode (no writes)."
      : "Seeding habit completions into Payload...",
  );

  const readingBookId = await ensureReadingBookId(payload, dryRun);

  let created = 0;
  let updated = 0;
  let readingNotesCreated = 0;
  let readingNotesUpdated = 0;

  for (const seed of SEED_COMPLETIONS) {
    const date = dayOffsetToDate(seed.dayOffset);
    let existingCompletion;

    try {
      existingCompletion = await payload.find({
        collection: "habit-completions",
        limit: 1,
        depth: 0,
        where: {
          and: [
            { habitKey: { equals: seed.habitKey } },
            { date: { equals: date } },
          ],
        },
      });
    } catch (error) {
      if (isMissingTableError(error, "habit_completions")) {
        throw new Error(
          "Habit completions table is missing. Run CMS migrations first: `pnpm --filter @repo/cms run migrate`.",
        );
      }
      throw error;
    }

    const completionData = {
      habitKey: seed.habitKey,
      date,
      completed: seed.completed,
      value: seed.value,
      notes: seed.notes ?? null,
    };

    let completionId: number;
    if (existingCompletion.docs.length === 0) {
      if (dryRun) {
        completionId = -1;
      } else {
        const createdCompletion = await payload.create({
          collection: "habit-completions",
          data: completionData,
        });
        completionId = asNumericId(createdCompletion.id, "habit-completions.id");
      }
      created += 1;
      console.log(`[habit-completions] created: ${seed.habitKey} @ ${date}`);
    } else {
      completionId = asNumericId(
        existingCompletion.docs[0]!.id,
        "habit-completions.id",
      );
      if (!dryRun) {
        const updatedCompletion = await payload.update({
          collection: "habit-completions",
          id: completionId,
          data: completionData,
        });
        completionId = asNumericId(
          updatedCompletion.id,
          "habit-completions.id",
        );
      }
      updated += 1;
      console.log(`[habit-completions] updated: ${seed.habitKey} @ ${date}`);
    }

    if (!seed.reading) continue;

    if (dryRun) {
      console.log(`[reading-notes] upsert (dry-run): ${date}`);
      continue;
    }

    const noteData = {
      book: readingBookId,
      date,
      pageStart: seed.reading.pageStart,
      pageEnd: seed.reading.pageEnd,
      pagesRead: Math.max(0, seed.reading.pageEnd - seed.reading.pageStart + 1),
      thoughts: seed.reading.thoughts ?? seed.notes ?? null,
      habitCompletion: completionId,
    };

    const existingNote = await payload.find({
      collection: "reading-notes",
      limit: 1,
      depth: 0,
      where: {
        habitCompletion: { equals: completionId },
      },
    });

    let noteId: number;
    if (existingNote.docs.length === 0) {
      const createdNote = await payload.create({
        collection: "reading-notes",
        data: noteData,
      });
      noteId = asNumericId(createdNote.id, "reading-notes.id");
      readingNotesCreated += 1;
      console.log(`[reading-notes] created: ${date}`);
    } else {
      const existingNoteId = asNumericId(existingNote.docs[0]!.id, "reading-notes.id");
      const updatedNote = await payload.update({
        collection: "reading-notes",
        id: existingNoteId,
        data: noteData,
      });
      noteId = asNumericId(updatedNote.id, "reading-notes.id");
      readingNotesUpdated += 1;
      console.log(`[reading-notes] updated: ${date}`);
    }

    await payload.update({
      collection: "habit-completions",
      id: completionId,
      data: { readingNote: noteId },
    });
  }

  console.log(
    `[habit-completions] done. created=${created}, updated=${updated}, readingNotesCreated=${readingNotesCreated}, readingNotesUpdated=${readingNotesUpdated}, total=${SEED_COMPLETIONS.length}`,
  );
  await payload.destroy();
}

try {
  await run();
} catch (error) {
  console.error("[seed-habit-completions] failed", error);
  process.exit(1);
}
