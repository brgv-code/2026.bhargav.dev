import {
  CreateFavoriteItemSchema,
  FavoritesListSchema,
  type CreateFavoriteItem,
  type FavoriteItem,
} from "@repo/types";
import { fetchFavoritesFromPayload } from "@/lib/data/cms";

export async function getFavorites(): Promise<FavoriteItem[]> {
  const data = await fetchFavoritesFromPayload();
  return FavoritesListSchema.parse(data);
}

export function parseCreateFavoritePayload(input: unknown): CreateFavoriteItem {
  return CreateFavoriteItemSchema.parse(input);
}
