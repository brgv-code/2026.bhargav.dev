import { getDocumentsCollection } from "./documents";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { usersCollection } from "./users";
import { tagsCollection } from "./tags";
import { seriesCollection } from "./series";
import { postsCollection } from "./posts";
import { getMediaCollection } from "./media";
import { projectsCollection } from "./projects";
import { workExperienceCollection } from "./work-experience";
import { favoritesCollection } from "./favorites";
import { booksCollection } from "./books";
import { readingNotesCollection } from "./reading-notes";
import { habitCompletionsCollection } from "./habit-completions";
import { errorLogsCollection } from "./error-logs";
import { streaksCollection } from "./streaks";
import { notebooksCollection } from "./notebooks";
import { educationCollection } from "./education";
import { researchCollection } from "./research";
import { communityCollection } from "./community";
import { skillsCollection } from "./skills";
import { languagesCollection } from "./languages";

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
    projectsCollection,
    workExperienceCollection,
    favoritesCollection,
    booksCollection,
    readingNotesCollection,
    habitCompletionsCollection,
    errorLogsCollection,
    streaksCollection,
    notebooksCollection,
    getDocumentsCollection(cmsDir),
    educationCollection,
    researchCollection,
    communityCollection,
    skillsCollection,
    languagesCollection,
  ];
}
