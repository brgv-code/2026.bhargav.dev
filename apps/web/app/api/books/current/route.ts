import { BookSchema, ReadingNotesListSchema } from "@repo/types";
import { NextResponse } from "next/server";

type CmsListResponse<T> = { docs?: T[] };

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : undefined);

export async function GET() {
  if (!cmsUrl) {
    return NextResponse.json({ error: "CMS not configured" }, { status: 503 });
  }

  try {
    const booksUrl = new URL(`${cmsUrl}/api/books`);
    booksUrl.searchParams.set("limit", "1");
    booksUrl.searchParams.set("sort", "-updatedAt");
    booksUrl.searchParams.set("where[status][equals]", "reading");
    booksUrl.searchParams.set("depth", "0");

    const booksRes = await fetch(booksUrl.toString(), { cache: "no-store" });
    if (!booksRes.ok) {
      const body = await booksRes.text().catch(() => "");
      console.error("[api/books/current GET] books fetch failed", body);
      return NextResponse.json(null);
    }

    const booksData =
      (await booksRes.json()) as CmsListResponse<unknown>;
    const first = booksData.docs?.[0];
    if (!first) {
      return NextResponse.json(null);
    }

    const book = BookSchema.parse(first);

    const notesUrl = new URL(`${cmsUrl}/api/reading-notes`);
    notesUrl.searchParams.set("limit", "1");
    notesUrl.searchParams.set("sort", "-date");
    notesUrl.searchParams.set("depth", "0");
    notesUrl.searchParams.set("where[book][equals]", String(book.id));

    const notesRes = await fetch(notesUrl.toString(), { cache: "no-store" });
    const notesData = notesRes.ok
      ? ((await notesRes.json()) as CmsListResponse<unknown>)
      : { docs: [] };
    const notes = ReadingNotesListSchema.safeParse(notesData.docs ?? []);
    const latestThought = notes.success
      ? (notes.data[0]?.thoughts ?? null)
      : null;

    return NextResponse.json({
      ...book,
      latestThought,
    });
  } catch (e) {
    console.error("[api/books/current GET]", e);
    return NextResponse.json(
      { error: "Failed to fetch current book" },
      { status: 500 },
    );
  }
}
