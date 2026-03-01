import { fetchFavoritesFromPayload } from "@/lib/payload";
import { NextResponse } from "next/server";

export async function GET() {
  const favorites = await fetchFavoritesFromPayload();
  return NextResponse.json(favorites);
}
