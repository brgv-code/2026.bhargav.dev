import type { CollectionConfig } from "payload";
import { slugs } from "./constants";

export const favoritesCollection: CollectionConfig = {
  slug: slugs.favorites,
  admin: {
    useAsTitle: "title",
    defaultColumns: ["type", "title", "source", "dateAdded", "updatedAt"],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
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
    { name: "thumbnailUrl", type: "text" },
    { name: "source", type: "text" },
    { name: "thoughts", type: "textarea" },
    {
      name: "dateAdded",
      type: "date",
      required: true,
      defaultValue: () => new Date().toISOString(),
    },
  ],
};
