import { ReadingNotesListSchema } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";

type CmsListResponse<T> = { docs?: T[] };

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : undefined);

export async function GET(request: NextRequest) {
  if (!cmsUrl) {
    return NextResponse.json({ error: "CMS not configured" }, { status: 503 });
  }

  const rawBookId = request.nextUrl.searchParams.get("bookId");
  const bookId = Number(rawBookId);
  if (!rawBookId || Number.isNaN(bookId)) {
    return NextResponse.json({ error: "bookId is required" }, { status: 400 });
  }

  try {
    const url = new URL(`${cmsUrl}/api/reading-notes`);
    url.searchParams.set("limit", "500");
    url.searchParams.set("sort", "-date");
    url.searchParams.set("depth", "0");
    url.searchParams.set("where[book][equals]", String(bookId));

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[api/reading-notes GET] cms fetch failed", body);
      return NextResponse.json(
        { error: "Failed to fetch reading notes from CMS" },
        { status: res.status },
      );
    }

    const data = (await res.json()) as CmsListResponse<unknown>;
    const notes = ReadingNotesListSchema.parse(data.docs ?? []);
    return NextResponse.json(notes);
  } catch (e) {
    console.error("[api/reading-notes GET]", e);
    return NextResponse.json(
      { error: "Failed to fetch reading notes" },
      { status: 500 },
    );
  }
}
