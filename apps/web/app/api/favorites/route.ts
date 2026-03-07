import { FavoriteItemSchema } from "@repo/types";
import {
  getFavorites,
  parseCreateFavoritePayload,
} from "@/lib/data/favorites";
import { NextRequest, NextResponse } from "next/server";

const cmsUrl =
  process.env.PAYLOAD_PUBLIC_SERVER_URL ??
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3001"
    : undefined);

export async function GET() {
  try {
    const favorites = await getFavorites();
    return NextResponse.json(favorites);
  } catch (e) {
    console.error("[api/favorites GET]", e);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!cmsUrl) {
    return NextResponse.json({ error: "CMS not configured" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = parseCreateFavoritePayload(body);

    const payloadBody = {
      type: parsed.type,
      title: parsed.title.trim(),
      url: parsed.url ? parsed.url.trim() : null,
      source: parsed.source ? parsed.source.trim() : null,
      thoughts: parsed.thoughts ? parsed.thoughts.trim() : null,
      dateAdded: new Date().toISOString(),
    };

    const res = await fetch(`${cmsUrl}/api/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadBody),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(
        (data as { errors?: unknown } | null)?.errors ?? {
          error: res.statusText,
        },
        { status: res.status },
      );
    }

    const favorite = FavoriteItemSchema.parse(data);
    return NextResponse.json(favorite, { status: 201 });
  } catch (e) {
    console.error("[api/favorites POST]", e);
    return NextResponse.json(
      { error: "Failed to create favorite" },
      { status: 500 },
    );
  }
}
