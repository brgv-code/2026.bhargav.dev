import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const streaksCollection: CollectionConfig = {
  slug: slugs.streaks,
  admin: { useAsTitle: "label" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "label", type: "text", required: true },
    { name: "date", type: "date", required: true },
    { name: "completed", type: "checkbox", defaultValue: false },
    {
      name: "sources",
      type: "json",
      admin: {
        description:
          "Per-day contribution breakdown: githubCommits, blogsPublished, notesCreated, readingNotesCreated, favoritesAdded, errorLogsCreated.",
      },
    },
    {
      name: "links",
      type: "json",
      admin: {
        description: "Optional arrays of URLs/IDs per source for deep linking.",
      },
    },
  ],
};
