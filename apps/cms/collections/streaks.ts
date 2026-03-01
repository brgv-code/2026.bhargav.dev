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
  ],
};
