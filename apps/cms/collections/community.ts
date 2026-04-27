import type { CollectionConfig } from "payload";
import { isLoggedIn, slugs } from "./constants";

export const communityCollection: CollectionConfig = {
  slug: slugs.community,
  admin: { useAsTitle: "name" },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "role", type: "text", required: true },
    { name: "url", type: "text" },
    { name: "startDate", type: "text" },
    { name: "endDate", type: "text" },
    { name: "description", type: "textarea" },
    { name: "order", type: "number", defaultValue: 0 },
  ],
};
