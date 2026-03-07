import { BookSchema, HabitCompletionSchema, ReadingNoteSchema } from "@repo/types";
import {
  getHabitCompletions,
  parseCreateHabitCompletionPayload,
} from "@/lib/data/reading";
import { NextRequest, NextResponse } from "next/server";

type CmsListResponse<T> = { docs?: T[] };

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : undefined);

async function fetchCurrentReadingBookFromCms(): Promise<{
  id: number;
  currentPage?: number | null;
  totalPages?: number | null;
} | null> {
  if (!cmsUrl) return null;

  const url = new URL(`${cmsUrl}/api/books`);
  url.searchParams.set("limit", "1");
  url.searchParams.set("sort", "-updatedAt");
  url.searchParams.set("where[status][equals]", "reading");
  url.searchParams.set("depth", "0");

  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return null;

  const data = (await res.json()) as CmsListResponse<unknown>;
  if (!data.docs?.[0]) return null;
  const parsed = BookSchema.safeParse(data.docs[0]);
  return parsed.success ? parsed.data : null;
}

export async function GET() {
  try {
    const completions = await getHabitCompletions();
    return NextResponse.json(completions);
  } catch (e) {
    console.error("[api/habit-completions GET]", e);
    return NextResponse.json(
      { error: "Failed to fetch habit completions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  if (!cmsUrl) {
    return NextResponse.json({ error: "CMS not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = parseCreateHabitCompletionPayload(body);

    const completionPayload = {
      habitKey: parsed.habitKey,
      date: parsed.date,
      completed: parsed.completed ?? true,
      value:
        typeof parsed.value === "number"
          ? parsed.value
          : parsed.completed === false
            ? 0
            : 1,
      notes: parsed.notes ?? null,
    };

    const existingUrl = new URL(`${cmsUrl}/api/habit-completions`);
    existingUrl.searchParams.set("where[habitKey][equals]", parsed.habitKey);
    existingUrl.searchParams.set("where[date][equals]", parsed.date);
    existingUrl.searchParams.set("limit", "1");
    existingUrl.searchParams.set("depth", "0");

    const existingRes = await fetch(existingUrl.toString(), { cache: "no-store" });
    if (!existingRes.ok) {
      return NextResponse.json(
        { error: "Failed to query existing completion" },
        { status: existingRes.status },
      );
    }

    const existingData =
      (await existingRes.json()) as CmsListResponse<{ id?: number }>;
    const existingId = existingData.docs?.[0]?.id;

    const completionRes = await fetch(
      existingId
        ? `${cmsUrl}/api/habit-completions/${existingId}`
        : `${cmsUrl}/api/habit-completions`,
      {
        method: existingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(completionPayload),
      },
    );

    const completionData = await completionRes.json().catch(() => null);
    if (!completionRes.ok) {
      return NextResponse.json(
        (completionData as { errors?: unknown } | null)?.errors ?? {
          error: completionRes.statusText,
        },
        { status: completionRes.status },
      );
    }

    const completion = HabitCompletionSchema.parse(completionData);

    let readingNote: unknown = null;
    if (parsed.habitKey === "reading" && parsed.reading) {
      const pageStart = Math.min(parsed.reading.pageStart, parsed.reading.pageEnd);
      const pageEnd = Math.max(parsed.reading.pageStart, parsed.reading.pageEnd);

      const currentBook =
        (typeof parsed.reading.bookId === "number"
          ? { id: parsed.reading.bookId }
          : await fetchCurrentReadingBookFromCms()) ?? null;

      if (currentBook?.id) {
        const notePayload = {
          book: currentBook.id,
          date: parsed.date,
          pageStart,
          pageEnd,
          thoughts: parsed.reading.thoughts ?? parsed.notes ?? null,
          habitCompletion: completion.id,
        };

        const noteRes = await fetch(`${cmsUrl}/api/reading-notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(notePayload),
        });
        const noteData = await noteRes.json().catch(() => null);

        if (!noteRes.ok) {
          return NextResponse.json(
            (noteData as { errors?: unknown } | null)?.errors ?? {
              error: noteRes.statusText,
            },
            { status: noteRes.status },
          );
        }

        const parsedNote = ReadingNoteSchema.parse(noteData);
        readingNote = parsedNote;

        await fetch(`${cmsUrl}/api/habit-completions/${completion.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ readingNote: parsedNote.id }),
        });
      }
    }

    return NextResponse.json({
      completion,
      readingNote,
    });
  } catch (e) {
    console.error("[api/habit-completions POST]", e);
    return NextResponse.json(
      { error: "Failed to save habit completion" },
      { status: 500 },
    );
  }
}
