import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const educationCollection: CollectionConfig = {
  slug: slugs.education,
  admin: { useAsTitle: "institution" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "institution", type: "text", required: true },
    { name: "degree", type: "text", required: true },
    { name: "location", type: "text" },
    { name: "startYear", type: "text" },
    { name: "endYear", type: "text" },
    { name: "note", type: "text" },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
