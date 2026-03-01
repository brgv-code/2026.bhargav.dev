import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const seriesCollection: CollectionConfig = {
  slug: slugs.series,
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
      type: "textarea",
      admin: {
        description: "Shown at the top of each post in the series.",
      },
    },
  ],
};
