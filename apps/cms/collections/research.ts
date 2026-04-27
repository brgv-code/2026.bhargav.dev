import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const researchCollection: CollectionConfig = {
  slug: slugs.research,
  admin: { useAsTitle: "title" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "subtitle", type: "text" },
    { name: "institution", type: "text" },
    { name: "year", type: "text" },
    { name: "description", type: "textarea" },
    { name: "url", type: "text" },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
