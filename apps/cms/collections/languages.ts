import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const languagesCollection: CollectionConfig = {
  slug: slugs.languages,
  admin: { useAsTitle: "language" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "language", type: "text", required: true },
    { name: "level", type: "text", required: true },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
