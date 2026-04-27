import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const skillsCollection: CollectionConfig = {
  slug: slugs.skills,
  admin: { useAsTitle: "category" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "category", type: "text", required: true },
    {
      name: "items",
      type: "array",
      fields: [{ name: "name", type: "text", required: true }],
    },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
