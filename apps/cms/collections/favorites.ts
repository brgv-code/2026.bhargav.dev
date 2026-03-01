import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const favoritesCollection: CollectionConfig = {
  slug: slugs.favorites,
  admin: { useAsTitle: "title" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    {
      name: "type",
      type: "select",
      options: [
        { label: "Article", value: "article" },
        { label: "Video", value: "video" },
        { label: "Podcast", value: "podcast" },
        { label: "Book", value: "book" },
        { label: "Tool", value: "tool" },
      ],
    },
    { name: "title", type: "text", required: true },
    { name: "url", type: "text" },
    { name: "source", type: "text" },
    { name: "notes", type: "textarea" },
  ],
};
