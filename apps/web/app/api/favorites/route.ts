import { getFavorites } from "@/lib/data/favorites";
import { NextResponse } from "next/server";

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
