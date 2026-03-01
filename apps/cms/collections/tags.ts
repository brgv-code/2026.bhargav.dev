import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const tagsCollection: CollectionConfig = {
  slug: slugs.tags,
  admin: { useAsTitle: "name" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    {
      name: "description",
      type: "text",
      admin: { description: "Optional. Shown on the tag index page." },
    },
  ],
};
