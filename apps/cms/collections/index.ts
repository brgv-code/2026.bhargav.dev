import { getDocumentsCollection } from "./documents";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { usersCollection } from "./users";
import { tagsCollection } from "./tags";
import { seriesCollection } from "./series";
import { postsCollection } from "./posts";
import { getMediaCollection } from "./media";
import { workExperienceCollection } from "./work-experience";
import { favoritesCollection } from "./favorites";
import { streaksCollection } from "./streaks";
import { notebooksCollection } from "./notebooks";

export { isLoggedIn, slugs } from "./constants";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cmsDir = path.resolve(__dirname, "..");

export function getCollections(): CollectionConfig[] {
  return [
    usersCollection,
    tagsCollection,
    seriesCollection,
    postsCollection,
    getMediaCollection(cmsDir),
    workExperienceCollection,
    favoritesCollection,
    streaksCollection,
    notebooksCollection,
    getDocumentsCollection(cmsDir),
  ];
}
