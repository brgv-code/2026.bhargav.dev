import { FavoritesListSchema, type FavoriteItem } from "@repo/types";
import { fetchFavoritesFromPayload } from "@/lib/data/cms";

export async function getFavorites(): Promise<FavoriteItem[]> {
  const data = await fetchFavoritesFromPayload();
  return FavoritesListSchema.parse(data);
}
